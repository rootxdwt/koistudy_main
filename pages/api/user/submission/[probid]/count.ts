import type { NextApiRequest, NextApiResponse } from 'next'
import SubmissionSchema from 'lib/schema/submissionSchema'
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method == "GET") {

            const uid = req.headers["x-middleware-uid"]
            const url = 'mongodb://localhost:27017/main';
            mongoose.connect(url)
            const { probid } = req.query
            const target = sanitize(probid)

            const data = await SubmissionSchema.countDocuments({ User: uid, Prob: target })
            let isSolved
            if (await SubmissionSchema.findOne({ User: uid, Prob: target, Status: "AC" }) != null) isSolved = true
            else isSolved = false

            res.status(200).json({ isSolved: isSolved, dataLength: data })
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