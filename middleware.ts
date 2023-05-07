import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/customCrypto'


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

        const jwtdata = await verifyJWT(authHeader, "ABCD", false)
        if (!jwtdata["valid"]) {
            return reject()
        }
        const requestHeaders = new Headers(request.headers)

        requestHeaders.set('x-middleware-uid', JSON.parse(jwtdata["data"]).uid)
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
    matcher: ['/api/judge/:path*', '/api/user/:path*'],
}