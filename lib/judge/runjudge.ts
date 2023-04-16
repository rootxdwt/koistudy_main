import { Docker } from "node-docker-api";
import { Container } from "node-docker-api/lib/container";
import { spawn } from "child_process";
import * as shescape from "shescape";

import crypto from "crypto";
import { AcceptableLanguage } from "../pref/languageLib";
import { LanguageHandler } from "../pref/languageLib";

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const Preferences = {
    defaultContainerPersistTime: 10,
    workingDir: "/var/execDir"
}

interface testArgs {
    Tests: Array<{ in: Array<string>, out: Array<string>, tl: number }>
    Disallow: Array<string>

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
    constructor(lang: AcceptableLanguage, memory: number) {
        this.lang = lang
        this.memory = memory
        this.contName = crypto.randomBytes(10).toString('hex')
        this.languageHandlerInstance = new LanguageHandler(lang, this.contName)
        this.filePrefix = this.languageHandlerInstance.getPrefix()
    }

    CreateRunEnv = async (codeData: string) => {
        try {
            let compiler = this.languageHandlerInstance.getImage()
            const cont = await docker.container.create({
                Image: compiler,
                name: this.contName,
                UsernsMode: 'host',
                NetworkDisabled: true,
                WorkingDir: Preferences.workingDir,
                HostConfig: {
                    Memory: this.memory,
                    Privileged: false,
                    CpuPercent: 3,
                },
                Entrypoint: [
                    "/bin/sh",
                    "-c",
                    `echo ${shescape.quote(codeData)} > ${this.contName}.${this.filePrefix} && sleep ${Preferences.defaultContainerPersistTime}`
                ],
            })
            return await cont.start()


        } catch (e) {
            throw new Error("Error")
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


    testCode = async (cont: Container, test: testArgs) => {

        let runCommand: string
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        let matchedCases = Array(test["Tests"].length)

        let isTLE: Array<boolean> = []
        await Promise.all(test["Tests"].map((elem, index) => {
            const tle = setTimeout(() => { isTLE[index] = true; if (test["Tests"].length - 1 <= index) Terminate(cont) }, elem.tl)
            return new Promise((resolve, reject) => {
                let baseCommand = spawn('docker', ['exec', '-i', cont.id, '/bin/sh', '-c', runCommand])
                baseCommand.stdin.write(elem.in.join("\n"))
                baseCommand.stdin.end();
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
        return matchedCases
    }
}
