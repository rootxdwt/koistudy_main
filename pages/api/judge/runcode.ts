import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { Judge } from "@/lib/judge/runjudge";
import { Container } from "node-docker-api/lib/container";
import { ChildProcessWithoutNullStreams } from "child_process";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: "/api/judge/runcode",
        });

        res.socket.server.io = io;
        let judge: Judge
        let container: Container

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
                setTimeout(() => { judge.endInput(container); socket.emit("end", `maximum execution time exceeded(127)`); socket.disconnect() }, 20000)
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
                }

            })
        })
    }

    res.end();
};