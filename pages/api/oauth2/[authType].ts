import type { NextApiRequest, NextApiResponse } from 'next'
import userSchema from '@/lib/schema/userSchema';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import crypto from "crypto"
import { genId } from '@/lib/pref/idGenerator';
import { generateJWT } from '@/lib/customCrypto';

interface IdToken {
    iss: string,
    azp: string,
    aud: string,
    sub: string,
    email: string,
    email_verified: boolean,
    at_hash: string,
    iat: string,
    exp: string,
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const client = createClient();
    await client.connect();
    try {
        const requestedData = JSON.parse(req.body)
        const redisData = await client.get(requestedData.state);
        if (redisData !== "true") {
            res.status(400).json({ status: 'Failed', detail: 'csrf-token-mismatch' })
            return
        }
        await client.del(requestedData.state)
        const { authType } = req.query

        let uid
        let accountExists = true

        const url = 'mongodb://localhost:27017/main';
        mongoose.connect(url)

        if (typeof process.env.JWTKEY === "undefined" || typeof process.env.GOOGLEPRIVATE === "undefined" || typeof process.env.GITHUBPRIVATE === "undefined") {
            console.log("JWTKEY not specified in .env")
            return
        }

        if (authType == "github") {
            var rsp = await fetch(`https://github.com/login/oauth/access_token?client_id=3ee621b68f1950df0ba0&client_secret=${process.env.GITHUBPRIVATE}&code=${requestedData.code}&redirect_uri=http://${process.env.REDIRURL}/auth/redirect/github`, { method: "POST", headers: { Accept: "application/json" } })
            const respJsn = await rsp.json()

            const infoReq = await fetch(`https://api.github.com/user/emails`, { headers: { Authorization: `token ${respJsn.access_token}` } })
            const emailData = await infoReq.json()

            const primaryMail = emailData.filter((elem: any) => { return elem.primary })[0]
            const data = await userSchema.find({ Mail: primaryMail.email })
            if (data.length < 1) {
                accountExists = false
                uid = crypto.randomBytes(10).toString('hex')

                await userSchema.create({
                    Id: genId(),
                    Mail: primaryMail.email,
                    MailVerified: primaryMail.verified,
                    Uid: uid,
                })
            } else {
                uid = data[0].Uid
            }
        } else if (authType == "google") {
            var rsp = await fetch('https://oauth2.googleapis.com/token', { method: "POST", body: JSON.stringify({ client_id: "417400386686-s890d90hvopobco24fpkocga45p3t3h1.apps.googleusercontent.com", client_secret: process.env.GOOGLEPRIVATE, code: requestedData.code, redirect_uri: `http://${process.env.REDIRURL}/auth/redirect/google`, grant_type: "authorization_code" }) })
            const respJsn = await rsp.json()
            const infoReq = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${respJsn.id_token}`)

            const userData: IdToken = await infoReq.json()

            const data = await userSchema.find({ Mail: userData.email })
            if (data.length < 1) {
                uid = crypto.randomBytes(10).toString('hex')
                accountExists = false
                await userSchema.create({
                    Id: genId(),
                    Mail: userData.email,
                    MailVerified: userData.email_verified,
                    Uid: uid,
                })
            } else {
                uid = data[0].Uid
            }
        } else {
            res.status(400).json({ status: 'Failed', detail: "unknown auth-type" })
            return
        }

        let token = await generateJWT(uid, process.env.JWTKEY, true)

        res.status(200).json({ status: 'Success', accountExists: accountExists, token: token })
        return
    } catch (e) {
        res.status(200).json({ status: 'Failed', detail: 'error' })
        return
    }

}