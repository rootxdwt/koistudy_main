import type { NextApiRequest, NextApiResponse } from 'next'
import { Judge } from '@/lib/judge/runjudge'
import sanitize from 'mongo-sanitize'
import mongoose from 'mongoose'
import ProblemModel from "lib/schema/problemSchema"
import { createClient } from 'redis';
import SubmissionSchema from 'lib/schema/submissionSchema'
import crypto from "crypto"

type Data = {
    status: string
    errorStatement: "NONE" | "TLE" | "TC" | "ISE" | "CE" | "MNA"
    matchedTestCase: Array<{ matched: boolean, tle: boolean }>
    codeDetail?: string,
    subcode?:string
}
const avr = (data: Array<number>) => {
    let sum = 0
    for (var i = 0; i < data.length; i++) sum += data[i]
    return sum / data.length
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const client = createClient();
    await client.connect();
    const uid = req.headers["x-middleware-uid"]
    let CodeData
    let Lang
    const SubmissionCode = crypto.randomBytes(5).toString('hex')

    const { id } = req.query
    if (typeof id != "string") {
        res.status(400).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "MNA" })
        return
    }
    const data = await ProblemModel.findOne({ ProblemCode: parseInt(sanitize(id)) }).exec()


    if (typeof uid !== "string") {
        res.status(401).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "ISE" })
        return
    }

    try {
        if (await client.get(uid) === "true") {
            res.status(429).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "NONE" })
            return
        } else {
            await client.set(uid, 'true', { EX: 60 });
        }
        const url = process.env.MONGOCONNSTR!;
        if(!url) {
            res.status(400).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "ISE" })
            return
        }
        mongoose.connect(url)

        const { TestProgress, SupportedLang, Mem,ProblemCode } = JSON.parse(JSON.stringify(data))
        if (req.method !== 'POST') {
            res.status(405).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "MNA" })
            return
        }
        const requestedData = req.body
        CodeData = requestedData["Code"]
        Lang = requestedData["Lang"]
        if (SupportedLang.indexOf(Lang) == -1) {
            res.status(400).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "MNA" })
            return
        }
        const judgeInstance = new Judge(Lang, Mem, 600000)
        const container = await judgeInstance.CreateRunEnv(CodeData)
        if (typeof container === "undefined") {
            res.status(400).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: "ISE" })
            return
        }
        await judgeInstance.compileCode(container)
        const matchedCases = await judgeInstance.testCode(container, TestProgress.TimeLimit, ProblemCode)
        const isCorrect = matchedCases.every(e => e.matched)

        const databaseTCdata = matchedCases.map((elem) => {
            return { Mem: elem.memory, Time: elem.exect, State: elem.tle ? "TLE" : elem.matched ? "AC" : "AW" }
        })

        await client.del(uid)
        await SubmissionSchema.create({
            User: uid,
            Code: sanitize(CodeData),
            Status: isCorrect ? 'AC' : 'AW',
            CodeLength: CodeData.length,
            TC: databaseTCdata,
            Prob: parseInt(sanitize(id)),
            SubCode: SubmissionCode,
            Lang: Lang
        })
        res.status(200).json({ status: isCorrect ? 'Success' : 'Error',subcode:SubmissionCode, matchedTestCase: matchedCases, errorStatement: "NONE" })
        return
    } catch (e: any) {
        await client.del(uid)
        let statement: "CE" | "ISE" = e.message == "Compile error" ? "CE" : "ISE"
        await SubmissionSchema.create({
            User: uid,
            Code: sanitize(CodeData),
            Status: e.message == "Compile error" ? "CE" : "ISE",
            CodeLength: CodeData.length,
            Prob: parseInt(sanitize(id)),
            SubCode: SubmissionCode,
            TC: [],
            Lang: Lang
        })
        res.status(200).json({ status: 'Error', matchedTestCase: [],subcode:SubmissionCode, errorStatement: statement })
        return
    }
}