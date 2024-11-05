import { getClientConfig, getSession, clientConfig } from '@/lib';
import { headers } from "next/headers";
import { NextRequest } from 'next/server'
import * as client from 'openid-client'
export async function GET(request: NextRequest) {
    const session = await getSession();
    const openIdClientConfig = await getClientConfig()
    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost'
    const protocol = headerList.get('x-forwarded-proto') || 'https'
    const currentUrl = new URL(`${protocol}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`)
    const tokenSet = await client.authorizationCodeGrant(openIdClientConfig, currentUrl, {
        pkceCodeVerifier: session.code_verifier,
        expectedState: session.state
    })
    const { access_token } = tokenSet
    session.isLoggedIn = true
    session.access_token = access_token
    let claims = tokenSet.claims()!
    const { sub } = claims
    // call userinfo endpoint to get user info
    const userinfo = await client.fetchUserInfo(openIdClientConfig, access_token, sub)
    // store userinfo in session
    session.userInfo = {
        sub: userinfo.sub,
        name: userinfo.given_name!,
        email: userinfo.email!,
        email_verified: userinfo.email_verified!,
    }

    await session.save()
    return Response.redirect(clientConfig.post_login_route);
}