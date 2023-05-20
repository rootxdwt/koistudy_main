import type { NextApiRequest, NextApiResponse } from 'next'
import { Judge } from '@/lib/judge/runjudge'
import sanitize from 'mongo-sanitize'
import mongoose from 'mongoose'
import ProblemModel from "lib/schema/problemSchema"

type Data = {
    status: string
    errorStatement: "NONE" | "TLE" | "TC" | "ISE" | "CE" | "MNA"
    matchedTestCase: Array<{ matched: boolean, tle: boolean }>
    codeDetail?: string
    execTime?: number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const url = 'mongodb://localhost:27017/main';
        mongoose.connect(url)

        const { id } = req.query
        if (typeof id != "string") {
            res.status(400).json({ status: 'Error', matchedTestCase: [], errorStatement: "MNA" })
            return
        }
        const data = await ProblemModel.findOne({ ProblemCode: parseInt(sanitize(id)) }).exec()
        const { TestProgress, SupportedLang, Mem } = JSON.parse(JSON.stringify(data))
        if (req.method !== 'POST') {
            res.status(405).json({ status: 'Error', matchedTestCase: [], errorStatement: "MNA" })
            return
        }
        const requestedData = req.body
        if (SupportedLang.indexOf(requestedData["Lang"]) == -1) {
            res.status(400).json({ status: 'Error', matchedTestCase: [], errorStatement: "MNA" })
            return
        }
        const judgeInstance = new Judge(requestedData["Lang"], Mem)
        const container = await judgeInstance.CreateRunEnv(requestedData["Code"])
        if (typeof container === "undefined") {
            res.status(400).json({ status: 'Error', matchedTestCase: [], errorStatement: "ISE" })
            return
        }
        await judgeInstance.compileCode(container)
        const judgeresult = await judgeInstance.testCode(container, TestProgress)
        var matchedCases = judgeresult[0]
        const isCorrect = matchedCases.every(e => e.matched)

        res.status(200).json({ status: isCorrect ? 'Success' : 'Error', matchedTestCase: matchedCases, errorStatement: "NONE", execTime: judgeresult[1] })
    } catch (e: any) {
        let statement: "CE" | "ISE" = e.message == "Compile error" ? "CE" : "ISE"
        res.status(200).json({ status: 'Error', matchedTestCase: [], errorStatement: statement })
    }
}
