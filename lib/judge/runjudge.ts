import { Docker } from "node-docker-api";
import container, { Container } from "node-docker-api/lib/container";
import { spawn } from "child_process";
import * as shescape from "shescape";

const crypto = require("crypto");

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
    lang: string
    contName: string
    filePrefix: string
    memory: Number
    constructor(lang: "cpp" | "python" | "golang", memory: number) {
        this.lang = lang
        this.memory = memory
        this.filePrefix = lang == "python" ? "py" : lang == "golang" ? "go" : "cpp"
        this.contName = crypto.randomBytes(10).toString('hex')
    }

    CreateRunEnv = async (codeData: string) => {
        try {
            let compiler = this.lang == "cpp" ? "gcc" : this.lang == "python" ? "python:alpine3.17" : this.lang == "golang" ? "golang:alpine3.17" : "gcc"
            const cont = await docker.container.create({
                Image: compiler,
                name: this.contName,
                NetworkDisabled: true,
                WorkingDir: Preferences.workingDir,
                HostConfig: {
                    Memory: this.memory
                },
                Entrypoint: ["/bin/sh", "-c", `echo ${shescape.quote(codeData)} > ${this.contName}.${this.filePrefix} && sleep ${Preferences.defaultContainerPersistTime}`],
            })
            return await cont.start()


        } catch (e) {
            throw new Error("Error")
        }
    }
    compileCode = async (cont: Container) => {
        let compileCommand
        switch (this.lang) {
            case "cpp":
                compileCommand = `g++ -o ${this.contName} ${this.contName}.cpp`
                break;
            case "python":
                return true
            case "golang":
                compileCommand = `go build -o ${this.contName} ${this.contName}.go`
                break;
            default:
                await cont.stop({ force: true })
                return false
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
                console.log(data.toString())
                await Terminate(cont)
                reject("Compile error")
            })
            stream.on('end', async () => {
                if (udata.length > 0) {
                    console.log(udata)
                    await Terminate(cont)
                    reject("Compile error")
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
        switch (this.lang) {
            case "cpp":
            case "golang":
                runCommand = `./${this.contName}`
                break;
            case "python":
                runCommand = `python3 ${this.contName}.py`
                break;
            default:
                throw new Error(`Unsupported language`);
        }

        let matchedCases = Array(test["Tests"].length)

        let isTLE: Array<boolean> = []
        await Promise.all(test["Tests"].map((elem, index) => {
            const tle = setTimeout(() => { isTLE[index] = true; Terminate(cont) }, elem.tl)
            return new Promise((resolve, reject) => {
                let baseCommand = spawn('docker', ['exec', '-i', cont.id, '/bin/sh', '-c', runCommand])
                baseCommand.stdin.write(elem.in.join("\n"))
                baseCommand.stdin.end();

                let fullData = ""

                baseCommand.stdout.on('data', (data) => {
                    fullData += data.toString()
                })
                baseCommand.stderr.on('data', async () => {
                    clearTimeout(tle)
                    await Terminate(cont)
                    reject("stdError")
                })
                baseCommand.on('close', async (code) => {
                    if (code == 137 && isTLE[index]) {
                        matchedCases[index] = { matched: false, tle: true }
                    } else {
                        if (fullData.trim() === elem.out.join("\n")) {
                            matchedCases[index] = { matched: true, tle: false }
                        } else {
                            matchedCases[index] = { matched: false, tle: false }
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
