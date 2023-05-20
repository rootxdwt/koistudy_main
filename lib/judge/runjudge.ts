import { Docker } from "node-docker-api";
import container, { Container } from "node-docker-api/lib/container";
import { spawn, exec } from "child_process";
import fs from 'fs/promises'

import crypto from "crypto";
import { AcceptableLanguage } from "../pref/languageLib";
import { LanguageHandler } from "../pref/languageLib";

const docker = new Docker({ socketPath: '/var/run/docker.sock' });



const Preferences = {
    defaultContainerPersistTime: 60,
}

interface testArgs {
    Tests: Array<{ in: Array<string>, out: Array<string>, tl: number }>
    Disallow: Array<string>

}

const avr = (data: Array<number>) => {
    let sum = 0
    for (var i = 0; i < data.length; i++) sum += data[i]
    return sum / data.length
}

const execAsync = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout) => {
            if (err) {
                reject(err)
            } else {
                resolve(stdout.trim())
            }
        })
    })
}

const Terminate = async (cont: Container) => {
    var st: any = await cont.status()
    if (["running", "stopped"].indexOf(st["data"]["State"]["Status"]) !== -1) {
        await cont.kill()
        await cont.delete({ force: true });
    }
}

export class Judge {
    lang: AcceptableLanguage
    contName: string
    filePrefix: string
    memory: Number
    languageHandlerInstance: LanguageHandler
    userName: string
    constructor(lang: AcceptableLanguage, memory: number) {
        this.lang = lang
        this.memory = memory
        this.contName = crypto.randomBytes(10).toString('hex')
        this.languageHandlerInstance = new LanguageHandler(lang, this.contName)
        this.filePrefix = this.languageHandlerInstance.getPrefix()
        this.userName = `a${crypto.randomBytes(5).toString('hex')}`
    }

    CreateRunEnv = async (codeData: string): Promise<Container> => {
        try {
            let compiler = this.languageHandlerInstance.getImage()
            const cont = await docker.container.create({
                Image: compiler,
                name: this.contName,
                UsernsMode: 'host',
                NetworkDisabled: true,
                Cmd: [`adduser --disabled-password ${this.userName} && chmod 777 /home/${this.userName} && sleep ${Preferences.defaultContainerPersistTime}`],
                WorkingDir: `/home/${this.userName}`,
                HostConfig: {
                    Memory: this.memory,
                    Privileged: false,
                    NanoCpus: 1e9,
                    CapDrop: ['MKNOD', 'SYS_ADMIN', 'SYS_CHROOT', 'SYS_BOOT', 'SYS_MODULE', 'SYS_PTRACE', 'SYSLOG'],
                    Ulimits: [
                        { Name: 'nofile', Soft: 4096, Hard: 8192 },
                        { Name: 'nproc', Soft: 200, Hard: 400 }
                    ]
                },
                Entrypoint: [
                    "/bin/sh",
                    "-c",
                ],
            })
            await cont.start()

            const tempFileName = `${this.contName}.${this.filePrefix}`
            await fs.writeFile(tempFileName, codeData)
            await execAsync(`docker cp ${tempFileName} ${this.contName}:/home/${this.userName}`)
            await fs.unlink(tempFileName)
            return cont

        } catch (e) {
            throw new Error("Failed creating container")
        }
    }
    compileCode = async (cont: Container) => {
        let compileCommand
        try {
            compileCommand = this.languageHandlerInstance.getCompileCommand()
            if (compileCommand == "") return true
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        const containerExecutor = await cont.exec.create({
            Cmd: ["su", "-", this.userName, '-c', compileCommand],
            AttachStdout: true,
            AttachStderr: true,
        });
        const stream: any = await containerExecutor.start({ Detach: false })

        return await new Promise((resolve, reject) => {
            let udata = '';
            stream.on('error', async (data: any) => {
                await Terminate(cont)
                reject({ message: "Compile error", detail: data.toString() })
            })
            stream.on('end', async () => {
                if (udata.length > 0) {
                    await Terminate(cont)
                    reject({ message: "Compile error", detail: udata })
                } else {
                    resolve(true)
                }
            })
            stream.on('data', async (data: Buffer) => {
                udata += data.toString()
            })
        })
    }


    runInput = async (cont: Container) => {
        let runCommand: string
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        return spawn('docker', ['exec', '-i', cont.id, "su", "-", this.userName, '-c', runCommand])
    }

    endInput = async (cont: Container) => {
        await Terminate(cont)
    }

    testCode = async (cont: Container, test: testArgs): Promise<[Array<{ matched: boolean, tle: boolean }>, number]> => {

        let runCommand: string
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        let matchedCases = Array(test["Tests"].length)
        let caseTime = Array(test["Tests"].length)
        let isTLE: Array<boolean> = []
        await Promise.all(test["Tests"].map((elem, index) => {
            const tle = setTimeout(() => { isTLE[index] = true; if (test["Tests"].length - 1 <= index) Terminate(cont) }, elem.tl)
            return new Promise((resolve, reject) => {
                let baseCommand = spawn('docker', ['exec', '-i', cont.id, "su", "-", this.userName, '-c', runCommand])
                baseCommand.stdin.write(elem.in.join("\n"))
                baseCommand.stdin.end();
                const startTime = Date.now()

                let fullData = ""

                baseCommand.stdout.on('data', (data) => {
                    fullData += data.toString()
                })
                baseCommand.stderr.on('data', async (data) => {
                    clearTimeout(tle)
                    reject("stdError")
                    await Terminate(cont)
                })
                baseCommand.on('close', async (code) => {
                    const endTime = Date.now()
                    caseTime[index] = (endTime - startTime)
                    matchedCases[index] = { matched: false, tle: false, lim: elem.tl }
                    if (code == 137 && isTLE[index]) {
                        matchedCases[index]["tle"] = true
                    } else {
                        if (fullData.trim() === elem.out.join("\n")) {
                            matchedCases[index]["matched"] = true
                        }
                    }
                    clearTimeout(tle)
                    resolve(true)
                });
            })
        }))

        await Terminate(cont)
        return [matchedCases, Math.round(avr(caseTime) - 60)]
    }
}
