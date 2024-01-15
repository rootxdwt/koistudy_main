import { Docker } from "node-docker-api";
import { spawn, exec } from "child_process";
import fs from 'fs'
import crypto from "crypto";
import { LanguageHandler } from "./languageLib.js";

const docker = new Docker({ socketPath: '/var/run/docker.sock' });


const execAsync = (command)=> {
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

const Terminate = async (cont) => {
    try {
        var st = await cont.status()
        if (["running", "stopped", "exited"].indexOf(st["data"]["State"]["Status"]) !== -1) {
            await cont.kill()
            await cont.delete({ force: true });
        }
    } catch (e) { }
}

export class Judge {
    lang
    contName
    filePrefix
    memory
    languageHandlerInstance
    containerPresistTime
    chunkSize
    testCaseLocation
    constructor(lang, memory, containerPresistTime) {
        this.containerPresistTime = containerPresistTime
        this.lang = lang
        this.memory = memory
        this.contName = crypto.randomBytes(10).toString('hex')
        this.languageHandlerInstance = new LanguageHandler(lang, this.contName)
        this.filePrefix = this.languageHandlerInstance.getPrefix()
        //setting

        this.chunkSize = 3
        this.testCaseLocation = "/workspaces/online-judge/main_server/test_cases"
    }

    CreateRunEnv = async (codeData) => {
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
                    MemorySwap:0,
                    MemoryReservation:0,
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
            await fs.promises.writeFile(tempFileName, codeData)
            await execAsync(`docker cp ${tempFileName} ${this.contName}:/var/execDir`)
            await fs.promises.unlink(tempFileName)
            return cont

        } catch (e) {
            console.log(e)
            console.log("docker not running")
        }
    }
    compileCode = async (cont) => {
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
        const stream = await containerExecutor.start({ Detach: false })

        return await new Promise((resolve, reject) => {
            let udata = '';
            stream.on('error', async (data) => {
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
            stream.on('data', async (data) => {
                udata += data.toString()
            })
        })
    }


    runInput = async (cont) => {
        let runCommand
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);
        }
        return spawn('docker', ['exec', '-i', cont.id, '/bin/sh', '-c', runCommand])
    }

    endInput = async (cont) => {
        await Terminate(cont)
    }

    testCode = async (cont, timeLimit, problemId, callBack)=> {

        let runCommand
        try {
            runCommand = this.languageHandlerInstance.getRunCodeCommand()
        } catch (e) {
            await Terminate(cont)
            throw new Error(`Unsupported language`);

        }
        let caseDirs = (await fs.promises.readdir(`${this.testCaseLocation}/${problemId}`)).filter((fileName) => {
            return /^\d+\.in$/.test(fileName)
        })
        let matchedCases = Array(caseDirs.length)
        let isTLE = []
        const chunkSize = this.chunkSize;

        for (var i = 0; i < Math.ceil(caseDirs.length / chunkSize); i++) {
            var testCase = caseDirs.slice(i * chunkSize, (i + 1) * chunkSize)

            await Promise.all(testCase.map(async (elem, inner_i) => {
                let index = i * chunkSize + inner_i
                const tle = setTimeout(
                    () => {
                        isTLE[index] = true;
                        if (caseDirs.length - 1 <= index) Terminate(cont)
                    },
                    timeLimit)

                return new Promise(async (resolve, reject) => {
                    let time, mem
                    let baseCommand = spawn('docker', ['exec', '-i', cont.id, '/usr/bin/time', '-v', ...runCommand.split(" ")])
                    let tc_stat = await fs.promises.stat(`${this.testCaseLocation}/${problemId}/${elem.replace("in", "out")}`)
                    var tcdata = fs.createReadStream(`${this.testCaseLocation}/${problemId}/${elem}`)
                    const stdinWritable = baseCommand.stdin;

                    tcdata.on('data', (chunk) => {
                        stdinWritable.cork();
                        stdinWritable.write(chunk.toString());
                        stdinWritable.uncork();
                    });

                    const startTime = Date.now()

                    let fullData = ""
                    baseCommand.stdout.on('data', async (data) => {
                        fullData += data.toString()
                        callBack(index,(fullData.length - 1)/(tc_stat.size))
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
                            lim: timeLimit / 1000,
                            exect: typeof time == "undefined" ? ((endTime - startTime) / 1000).toFixed(2) : time,
                            memory: mem
                        }
                        if (code == 137 && isTLE[index]) {
                            matchedCases[index]["tle"] = true
                        } else {
                            const tc_out = await fs.promises.readFile(`${this.testCaseLocation}/${problemId}/${elem.replace("in", "out")}`)
                            if (fullData.trim() === tc_out.toString().trim()) {
                                matchedCases[index]["matched"] = true
                            }
                        }
                        clearTimeout(tle)
                        resolve(true)
                    });
                })
            }))

        }

        await Terminate(cont)
        return matchedCases
    }
}