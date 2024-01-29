import type { NextApiRequest, NextApiResponse } from 'next'
import userSchema from '../../../lib/schema/userSchema';
import OrgSchema from '../../../lib/schema/orgSchema'
import mongoose from 'mongoose';
import { createClient } from 'redis';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const client = createClient();
    await client.connect();
    try {

        const requestedData = JSON.parse(req.body)
        let authKey = requestedData["key"]
        let redisTempData: any = await client.get(authKey)
        console.log(redisTempData)

        if (redisTempData == null) {
            res.status(401).json({ status: 'Failed', detail: 'Registeration key expired' })
            return
        }
        redisTempData = JSON.parse(redisTempData)
        let { step } = req.query
        step = step![0]

        const url = process.env.MONGOCONNSTR!;
        if(!url) {
            res.status(500)
            return
        }
        await mongoose.connect(url)

        if (parseInt(step) === 0) {
            if (requestedData["name"] !== "") {
                redisTempData["Id"] = requestedData["name"]
                await client.set(authKey, JSON.stringify(redisTempData), { EX: 60 })
                console.log(redisTempData)
            }
            await client.set(authKey, JSON.stringify(redisTempData), { EX: 60 })
            res.status(200).json({ status: 'Success' })
            return

        } else if (parseInt(step) === 1) {

            console.log(requestedData["key"])

            if (requestedData["orgCode"]) {
                const OrgData = JSON.parse(JSON.stringify(await OrgSchema.aggregate([
                    {
                        "$match": {
                            "RegCodes": { "$elemMatch": { data: requestedData["orgCode"] } }
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
                                        $eq: ["$$regCode.data", requestedData["orgCode"]]
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
                redisTempData["Org"] = { id: OrgData[0].OrgCode, class: OrgData[0].RegCodes[0].class }
            }

            await userSchema.create(redisTempData)

            res.status(200).json({ status: 'Success' })


        } else {
            res.status(400).json({ status: 'Failed', detail: "none" })
            return
        }
    } catch (e) {
        res.status(200).json({ status: 'Failed', detail: 'Unknown error' })
        return
    }

}