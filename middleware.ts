import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'
import decode from 'base64-arraybuffer'

const reject = () => {
    return new NextResponse(
        JSON.stringify({ message: 'unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
    )
}

export const middleware = async (request: NextRequest) => {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return reject()
        }

        if (typeof process.env.JWTKEY === "undefined") {
            console.error("JWTKEY not specified")
            return reject()
        }

        const jwtdata:{payload:{uid:string},protectedHeader:any} = await jose.jwtVerify(authHeader, new TextEncoder().encode(process.env.JWTKEY))
        if (!jwtdata) {
            return reject()
        }
        const requestHeaders = new Headers(request.headers)

        requestHeaders.set('x-middleware-uid', jwtdata["payload"]["uid"])
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

        return response
    } catch (e) {
        return reject()
    }
}

export const config = {
    matcher: ['/api/user/:path*'],
}