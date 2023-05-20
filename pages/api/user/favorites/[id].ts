

import type { NextApiRequest, NextApiResponse } from 'next'
import userSchema from '@/lib/schema/userSchema';
import ProblemModel from '@/lib/schema/problemSchema';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { id } = req.query
        const userTarget = sanitize(id)
        const uid = req.headers["x-middleware-uid"]

        if (req.method == "POST") {
            const url = 'mongodb://localhost:27017/main';
            mongoose.connect(url)
            const data = await ProblemModel.find({ ProblemCode: userTarget }, "_id")
            if (data.length < 1) {
                res.status(200).json({ status: "Failed", detail: "Problem Not Found" })
                return
            }
            const userFav = await userSchema.findOne({ Uid: uid }, 'Favorites -_id')
            if (userFav["Favorites"].map((elem: { id: string; }) => elem.id).indexOf(userTarget + "") === -1) {
                await userSchema.findOneAndUpdate({ Uid: uid }, { $push: { Favorites: { id: userTarget + "" } } })
                res.status(200).json({ status: "Success", detail: "None" })
                return
            } else {
                res.status(200).json({ status: "Failed", detail: "Already Added" })
                return
            }
        } else if (req.method == "DELETE") {
            await userSchema.findOneAndUpdate({ Uid: uid }, { $pull: { Favorites: { id: userTarget + "" } } })
            res.status(200).json({ status: "Success", detail: "None" })
        } else if (req.method == "GET") {
            const jsn = await userSchema.find({ Uid: uid, "Favorites.id": userTarget + "" }, "Favorites -_id")
            if (jsn.length < 1) {
                res.status(200).json({ added: false })
                return
            } else {
                res.status(200).json({ added: true })
                return
            }
        }

    } catch (e) {
        console.log(e)
        res.status(400).json({ status: 'Failed', detail: 'error' })
        return
    }
}