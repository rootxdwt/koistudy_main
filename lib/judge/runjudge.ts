import { Docker } from "node-docker-api";
import { Container } from "node-docker-api/lib/container";
import { spawn, exec } from "child_process";
import fs from 'fs/promises'

import crypto from "crypto";
import { AcceptableLanguage } from "../pref/languageLib";
import { LanguageHandler } from "../pref/languageLib";

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

interface testArgs {
    Tests: Array<{ in: Array<string>, out: Array<string>, tl: number }>
    Disallow: Array<string>
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
    try {
        var st: any = await cont.status()
        if (["running", "stopped", "exited"].indexOf(st["data"]["State"]["Status"]) !== -1) {
            await cont.kill()
            await cont.delete({ force: true });
        }
    } catch (e) { }
}

export class Judge {
    lang: AcceptableLanguage
    contName: string
    filePrefix: string
    memory: Number
    languageHandlerInstance: LanguageHandler
    containerPresistTime: number
    constructor(lang: AcceptableLanguage, memory: number, containerPresistTime: number) {
        this.containerPresistTime = containerPresistTime
        this.lang = lang
        this.memory = memory
        this.contName = crypto.randomBytes(10).toString('hex')
        this.languageHandlerInstance = new LanguageHandler(lang, this.contName)
        this.filePrefix = this.languageHandlerInstance.getPrefix()
    }

    CreateRunEnv = async (codeData: string): Promise<any> => {
        try {
            let compiler = this.languageHandlerInstance.getImage()
            const cont = await docker.container.create({
                Image: compiler,
                name: this.contName,
                UsernsMode: 'host',
                NetworkDisabled: true,
                Cmd: [`sleep ${this.containerPresistTime + 200}&&shutdown -h `],
                WorkingDir: `/var/execDir`,
                HostConfig: {
                    Memory: this.memory,
                    Privileged: false,
                    NanoCpus: 1e9,
                    CapDrop: [
                        'MKNOD',
                        'SYS_ADMIN',
                        'SYS_CHROOT',
                        'SYS_BOOT',
                        'SYS_MODULE',
                        'SYS_PTRACE',
                        'SYSLOG'
                    ],
                    Ulimits: [
                        {
                            Name: 'nofile',
                            Soft: 4096,
                            Hard: 8192
                        },
                        {
                            Name: 'nproc',
                            Soft: 30,
                            Hard: 31
                        }
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
            await execAsync(`docker cp ${tempFileName} ${this.contName}:/var/execDir`)
            await fs.unlink(tempFileName)
            return cont

        } catch (e) {
            console.log("docker not running")
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
            Cmd: ["/bin/sh", "-c", compileCommand],
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
        let runCommand: Array<string>
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        return spawn('docker', ['exec', '-i', cont.id, '/bin/sh', '-c', ...runCommand])
    }

    endInput = async (cont: Container) => {
        await Terminate(cont)
    }

    testCode = async (cont: Container, test: testArgs):
        Promise<
            Array<
                {
                    matched: boolean,
                    tle: boolean,
                    exect: number,
                    memory: number
                }
            >
        > => {

        let runCommand: Array<string>
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        let matchedCases = Array(test["Tests"].length)
        let isTLE: Array<boolean> = []
        await Promise.all(test["Tests"].map(async (elem, index) => {
            const tle = setTimeout(
                () => {
                    isTLE[index] = true;
                    if (test["Tests"].length - 1 <= index) Terminate(cont)
                },
                elem.tl)

            return new Promise(async (resolve, reject) => {

                let time: number, mem: number
                let baseCommand = spawn('docker', ['exec', '-i', cont.id, '/usr/bin/time', '-v', ...runCommand])

                baseCommand.stdin.write(elem.in.join("\n"))
                baseCommand.stdin.end();
                const startTime = Date.now()

                let fullData = ""
                baseCommand.stdout.on('data', async (data) => {
                    fullData += data.toString()
                })
                baseCommand.stderr.on('data', async (data) => {
                    const dta = data.toString()

                    if (dta.includes("exited with non-zero status")) {
                        clearTimeout(tle)
                        reject("stdError")
                        await Terminate(cont)
                    } else {
                        try {
                            time = parseFloat(dta.match(/Elapsed \(wall clock\) time \(h:mm:ss or m:ss\): \d+m (\d+\.\d+)s/)[1])
                            mem = parseInt(dta.match(/Maximum resident set size \(kbytes\): (\d+)/)[1])
                        } catch (e) { }
                    }
                })
                baseCommand.on('close', async (code) => {
                    const endTime = Date.now()
                    matchedCases[index] = {
                        matched: false,
                        tle: false,
                        lim: elem.tl / 1000,
                        exect: typeof time == "undefined" ? ((endTime - startTime) / 1000).toFixed(2) : time,
                        memory: mem
                    }
                    if (code == 137 && isTLE[index]) {
                        matchedCases[index]["tle"] = true
                    } else {
                        if (fullData.trim() === elem.out.join("\n").trim()) {
                            matchedCases[index]["matched"] = true
                        }
                    }
                    clearTimeout(tle)
                    resolve(true)
                });
            })
        }))

        await Terminate(cont)
        return matchedCases
    }
}