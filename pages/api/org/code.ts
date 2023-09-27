import type { NextApiRequest, NextApiResponse } from 'next'
import userSchema from '@/lib/schema/userSchema';
import mongoose from 'mongoose';
import OrgSchema from '@/lib/schema/orgSchema'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ status: 'Failed', detail: 'method not allowed' })
        }
        const url = process.env.MONGOCONNSTR!;
        if(!url) {
            res.status(500)
            return
        }
        mongoose.connect(url)
        const { code } = req.body

        const data = JSON.parse(JSON.stringify(await OrgSchema.aggregate([
            {
                "$match": {
                    "RegCodes": { "$elemMatch": { data: code } }
                }
            },
            {
                $project: {
                    Name: 1,
                    OrgCode: 1,
                    RegCodes: {
                        $filter: {
                            input: "$RegCodes",
                            as: "regCode",
                            cond: {
                                $eq: ["$$regCode.data", code]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    Name: 1,
                    OrgCode: 1,
                    _id: 0,
                    "RegCodes.classlabel": 1,
                    "RegCodes.class": 1,
                }
            }
        ])))

        if (data.length < 1) {
            res.status(200).json({ data: null, status: "Success" })
            return
        }

        res.status(200).json({ data: data[0], status: "Success" })

    } catch (e) {
        console.log(e)
        res.status(400).json({ status: 'Failed', detail: 'error' })
        return
    }
}