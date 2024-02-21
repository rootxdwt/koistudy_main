import { NextApiRequest, NextApiResponse } from 'next';
import mongoose, { ObjectId } from 'mongoose';
import sanitize from 'mongo-sanitize';
import dbConnect from '@/lib/db_connection';
import SubmissionSchema from '../../../../../lib/schema/submissionSchema';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "POST") {
            const requestedData = req.body;
            const uid = req.headers["x-middleware-uid"];
            await dbConnect();

            const { probid } = req.query;
            const target = sanitize(probid);
            const TargetLang = sanitize(requestedData.lang);
            const TargetStat = sanitize(requestedData.stat);

            const prev = sanitize(requestedData.prev ?? "");
            const next = sanitize(requestedData.next ?? "");

            const limit = [10, 20, 30].includes(requestedData.limit) ? parseInt(requestedData.limit) : 20;

            let tLangJsn = {};
            let tStatJsn = {};
            if (TargetLang && TargetLang !== "") tLangJsn = { Lang: TargetLang };
            if (TargetStat && TargetStat !== "") tStatJsn = { Status: TargetStat };

            const order = next ? -1 : prev ? 1 : -1;
            const idQuery = next ? {_id:{ $lt: next }} : prev ? {_id:{ $gt: prev }} : {};

            const query = {
                User: uid,
                Prob: target,
                ...tLangJsn,
                ...tStatJsn,
                ...idQuery
            };

            const data = await SubmissionSchema.find(query, 'Code Status CodeLength Lang SubCode Time TC')
                .limit(limit + 1)
                .sort({ "_id": order as any });

            let isNextpageAvil = prev ? true : data.length === limit + 1;
            let isPrevpageAvil = next ? true : data.length === limit + 1;
            if (!prev && !next) {
                isPrevpageAvil = false
            }

            const finalJson = {
                next: isNextpageAvil,
                prev: isPrevpageAvil,
                data: prev ? [...data].reverse() : data.slice(0, limit)
            };

            res.status(200).json(finalJson);
            return;
        } else {
            res.status(405).json({ message: "Method Not Allowed" });
            return;
        }

    } catch (e) {
        console.log(e)
        res.status(400).json({ status: 'Failed', detail: 'error' });
        return;
    }
}
