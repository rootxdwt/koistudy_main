import type { NextApiRequest, NextApiResponse } from 'next'
import userSchema from '../../../lib/schema/userSchema';
import mongoose from 'mongoose';
import OrgSchema from '../../../lib/schema/orgSchema'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const uid = req.headers["x-middleware-uid"]
        const url = process.env.MONGOCONNSTR!;
        if(!url) {
            res.status(500)
            return
        }
        await mongoose.connect(url)
        const data = await userSchema.find({ Uid: uid, }, 'Id Mail MailVerified Uid -_id PfpURL isAdmin Rank')
        res.status(200).json(data[0])

    } catch (e) {
        res.status(400).json({ status: 'Failed', detail: 'error' })
        return
    }
}