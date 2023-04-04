import type { NextApiRequest, NextApiResponse } from 'next'
import { Judge } from '@/lib/judge/runjudge'

//temp
import { Problems } from '@/lib/temp/db'
//temp

type Data = {
    status: string
    errorStatement: "NONE" | "TLE" | "TC" | "ISE" | "CE" | "MNA"
    matchedTestCase: Array<number>
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const { id } = req.query
        if (typeof id != "string") {
            res.status(400).json({ status: 'Error', matchedTestCase: [], errorStatement: "MNA" })
            return
        }
        const { TestProgress, SupportedLang, Mem } = Problems.filter(elem => elem.ProblemCode == parseInt(id))[0]
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
        var matchedTestCase = await judgeInstance.testCode(container, TestProgress)
        res.status(200).json({ status: matchedTestCase.every(e => e.matched) ? 'Success' : 'Error', matchedTestCase: matchedTestCase, errorStatement: "NONE" })
    } catch (e) {
        let statement: "CE" | "ISE" = e == "Compile error" ? "CE" : "ISE"

        res.status(200).json({ status: 'Error', matchedTestCase: [], errorStatement: statement })
    }
}
