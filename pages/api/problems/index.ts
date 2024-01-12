import type { NextApiRequest, NextApiResponse } from 'next'
import SubmissionSchema from 'lib/schema/submissionSchema'
import ProblemSchema from 'lib/schema/problemSchema'
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method == "POST") {

            const requestedData = req.body
            const url = process.env.MONGOCONNSTR!;
            if (!url) {
                res.status(500)
                return
            }
            mongoose.connect(url)
            let allLangs = ["cpp", "python"]
            let difficulty = requestedData["diff"] ? sanitize(requestedData["diff"]) : { gt: 0, lt: 10 },
                solves = requestedData["sol"] ? sanitize(requestedData["sol"]) : { gt: 0, lt: 999999 },
                langs = requestedData["lang"] ? sanitize(requestedData["lang"]) : allLangs

            const data = await ProblemSchema.find({
                rating: { "$gte": difficulty["gt"]?difficulty["gt"]:0, "$lte": difficulty["lt"]?difficulty["lt"]:999999 },
                solved: { "$gte": solves["gt"]?solves["gt"]:0, "$lte": solves["lt"]?solves["lt"]:10 },
                SupportedLang: { "$in": langs.length>0?langs:allLangs }
            }, 'ProblemCode ProblemName SupportedLang rating solved -_id')
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