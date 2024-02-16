import type { NextApiRequest, NextApiResponse } from 'next'
import ProblemModel from "../../../lib/schema/problemSchema"
import mongoose from 'mongoose';
import dbConnect from '@/lib/db_connection';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {

        await dbConnect()
        
        const data = await ProblemModel.find({}, ' -Script -TestProgress -_id -Mem')
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
    }

}