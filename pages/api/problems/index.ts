import type { NextApiRequest, NextApiResponse } from 'next'
import { headers } from "next/headers";
import UserSchema from '../../../lib/schema/userSchema'
import ProblemSchema from '../../../lib/schema/problemSchema'
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import * as jose from 'jose'
import dbConnect from '@/lib/db_connection';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method == "POST") {

            const requestedData = req.body

            await dbConnect()

            let allLangs = ["cpp", "python","go"]
            let difficulty = sanitize(requestedData["diff"]) ?? { gt: 0, lt: 10 },
                solves = sanitize(requestedData["sol"]) ?? { gt: 0, lt: 999999 },
                langs = sanitize(requestedData["lang"]) ?? allLangs,
                orderBy = sanitize(requestedData["orderBy"]) ?? {"ProblemName":"asc"}
            
            if(!Object.values(orderBy).every(e=>e=="desc"||e=="asc")) {
                orderBy={"ProblemName":"asc"}
            }
            
            let data = await ProblemSchema.find({
                rating: { "$gte": difficulty["gt"]?difficulty["gt"]:0, "$lte": difficulty["lt"]?difficulty["lt"]:999999 },
                solved: { "$gte": solves["gt"]?solves["gt"]:0, "$lte": solves["lt"]?solves["lt"]:10 },
                SupportedLang: { "$in": langs.length>0?langs:allLangs },
            }, 'ProblemCode ProblemName SupportedLang rating solved -_id').sort({...orderBy})

            const authHeader = typeof req.headers['authorization']!=="undefined"?req.headers['authorization']:""

            let jwtdata
            try{
                jwtdata = await jose.jwtVerify(authHeader, new TextEncoder().encode(process.env.JWTKEY))
            }catch(e) {
                data=JSON.parse(JSON.stringify(data)).map((elem:any)=>{
                    return {...elem, isSolved:false}
                })
                res.status(200).json(data)
                return
            }

            const uid = jwtdata.payload.uid

            const UserSolved = await UserSchema.find({Uid:uid}, 'Solved -_id')

            data=JSON.parse(JSON.stringify(data)).map((elem:any)=>{
                return {...elem, isSolved:UserSolved[0].Solved.includes(elem.ProblemCode)}
            })

            res.status(200).json(data)
            return
        } else {
            res.status(405).json({ message: "Method Not Allowed" })
            return
        }

    } catch (e) {
        console.log(e)
        res.status(400).json({ status: 'Failed', detail: 'error' })
        return
    }
}