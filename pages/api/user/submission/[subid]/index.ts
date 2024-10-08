import type { NextApiRequest, NextApiResponse } from 'next'
import SubmissionSchema from '../../../../../lib/schema/submissionSchema'
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import dbConnect from '@/lib/db_connection';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method == "GET") {

            const uid = req.headers["x-middleware-uid"]

            await dbConnect()
            const { subid } = req.query
            const target = sanitize(subid)

            const data = await SubmissionSchema.find({ User: uid, SubCode: target}, 'Code Status CodeLength TC Prob Lang -_id')
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