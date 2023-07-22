import type { NextApiRequest, NextApiResponse } from 'next'
import userSchema from '@/lib/schema/userSchema';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import crypto from "crypto"
import { genId } from '@/lib/pref/idGenerator';
import { generateJWT } from '@/lib/customCrypto';

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

        if (redisTempData == null) {
            res.status(401).json({ status: 'Failed', detail: 'Registeration key expired' })
            return
        }
        redisTempData = JSON.parse(redisTempData)
        let { step } = req.query
        step = step![0]

        const url = 'mongodb://localhost:27017/main';
        mongoose.connect(url)

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

        } else {
            res.status(400).json({ status: 'Failed', detail: "none" })
            return
        }
    } catch (e) {
        res.status(200).json({ status: 'Failed', detail: 'Unknown error' })
        return
    }

}