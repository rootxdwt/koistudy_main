import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { Judge } from "@/lib/judge/runjudge";
import { Container } from "node-docker-api/lib/container";
import { ChildProcessWithoutNullStreams } from "child_process";
import { verifyJWT } from "@/lib/customCrypto";

export const config = {
    api: {
        bodyParser: false,
    },
};

const RCPage = async (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: "/api/judge/runcode",
        });

        res.socket.server.io = io;
        let judge: Judge
        let container: Container

        io.use(async (socket, next) => {
            try {
                const verifyData = await verifyJWT(socket.request.rawHeaders[socket.request.rawHeaders.indexOf("Authorization") + 1], process.env.JWTKEY!, true)
                if (verifyData.valid) {
                    next()
                } else {
                    next(new Error("unauthorized"));
                }
            } catch (e) {
                next(new Error("unauthorized"));
            }
        });

        io.on('connection', async socket => {
            let baseCommand: ChildProcessWithoutNullStreams
            socket.on('input', async msg => {
                try {
                    baseCommand.stdin.write(msg)

                } catch (msg: any) {
                    socket.emit('error', msg.detail)
                }
            })
            socket.on('disconnect', async () => {
                if (container) {
                    await judge.endInput(container)
                }
            })
            socket.on('codeData', async msg => {
                judge = new Judge(msg.typ, 256000000)
                setTimeout(() => { socket.emit("end", `maximum execution time exceeded(127)`); judge.endInput(container); socket.disconnect() }, 20000)
                container = await judge.CreateRunEnv(msg.data)
                try {
                    await judge.compileCode(container)
                    baseCommand = await judge.runInput(container)
                    let outdata = ""
                    baseCommand.stdout.on('data', async (data) => {
                        outdata += data.toString()
                        if (data.length > 1000 || outdata.length > 1000) {
                            await judge.endInput(container)
                            socket.emit("end", `maximum output length exceeded`)
                            socket.disconnect()
                        }
                        socket.emit('data', data.toString())
                    })
                    baseCommand.stderr.on('data', async (data) => {
                        await judge.endInput(container)
                        socket.emit('error', data.toString())
                        socket.disconnect()
                    })
                    baseCommand.on('close', async (code) => {
                        await judge.endInput(container)
                        socket.emit("end", `${outdata}\nexited with code ${code}`)
                        socket.disconnect()
                    });
                    socket.emit('compileEnd', '')
                } catch (msg: any) {
                    socket.emit('error', msg.detail)
                    await judge.endInput(container)
                }
            })
        })
    }

    res.end();
};

export default RCPage;