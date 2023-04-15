import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const url = 'mongodb://127.0.0.1:27017';
        const client = new MongoClient(url);
        await client.connect();
        const db = client.db("main");
        const collection = db.collection('Problems');
        const data = await collection.find({}).project({ Script: 0, TestProgress: 0, _id: 0, Mem: 0 }).toArray()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
    }

}