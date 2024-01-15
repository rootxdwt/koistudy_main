import { Judge } from "../judge/judgeInstance.js";

export const config = {
    api: {
        bodyParser: false,
    },
};

const RunCodePage = async (socket) => {
    let baseCommand
    let judge,container
    socket.on('input', async msg => {
        try {
            baseCommand.stdin.write(msg)
        } catch (msg) {
            socket.emit('error', msg.detail)
        }
    })
    socket.on('disconnect', async () => {
        if (container) {
            await judge.endInput(container)
        }
    })
    socket.on('codeData', async msg => {
        judge = new Judge(msg.typ, 6291456, 20)
        setTimeout(() => { socket.emit("end", `최대 실행 시간이 초과되었습니다(127)`); judge.endInput(container); socket.disconnect() }, 20000)
        container = await judge.CreateRunEnv(msg.data)
        try {
            await judge.compileCode(container)
            baseCommand = await judge.runInput(container)
            let outdata = ""
            baseCommand.stdout.on('data', async (data) => {
                outdata += data.toString()
                socket.emit("data", outdata)
                if (data.length > 1000) {
                    await judge.endInput(container)
                    socket.emit("end", `최대 출력 제한이 초과되었습니다`)
                    socket.disconnect()
                }
            })
            baseCommand.stderr.on('data', async (data) => {
                await judge.endInput(container)
                socket.emit('error', data.toString())
                socket.disconnect()
            })
            baseCommand.on('close', async (code) => {
                socket.emit("end", `${outdata}\nexited with code ${code}`)
                await judge.endInput(container)
                socket.disconnect()
            });
            socket.emit('compileEnd', '')
        } catch (msg) {
            socket.emit('error', msg.detail)
            await judge.endInput(container)
        }
    })
};

export default RunCodePage;