import type { NextApiRequest, NextApiResponse } from 'next'
import SubmissionSchema from 'lib/schema/submissionSchema'
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method == "POST") {
            const requestedData = req.body

            const uid = req.headers["x-middleware-uid"]
            const url = 'mongodb://localhost:27017/main';
            mongoose.connect(url)
            const { probid } = req.query
            const target = sanitize(probid)

            const TargetLang = sanitize(requestedData.lang)
            const TargetStat = sanitize(requestedData.stat)

            let tLangJsn = {}
            let tStatJsn = {}

            if (TargetLang && TargetLang !== "") {
                tLangJsn = { Lang: TargetLang }
            }
            if (TargetStat && TargetStat !== "") {
                tStatJsn = { Status: TargetStat }
            }
            const data = await SubmissionSchema.find({ User: uid, Prob: target, ...tLangJsn, ...tStatJsn }, 'Code Status CodeLength Lang TCTime -_id SubCode Time')
            res.status(200).json(data)
            return
        } else {
            res.status(405).json({ message: "Method Not Allowed" })
            return
        }

    } catch (e) {
        res.status(400).json({ status: 'Failed', detail: 'error' })
        return
    }
}