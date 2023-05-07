import type { NextApiRequest, NextApiResponse } from 'next'
import ProblemModel from "lib/schema/problemSchema"
import mongoose from 'mongoose';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const url = 'mongodb://localhost:27017/main';
        mongoose.connect(url)
        const data = await ProblemModel.find({}, ' -Script -TestProgress -_id -Mem')
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
    }

}