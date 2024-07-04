import { IronSession, SessionOptions, getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { Issuer } from "openid-client"

export const clientConfig = {
    url: process.env.NEXT_PUBLIC_API_URL,
    audience: process.env.NEXT_PUBLIC_API_URL,
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    scope: process.env.NEXT_PUBLIC_SCOPE,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/openiddict`,
    post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}`,
    response_type: 'code',
    grant_type: 'authorization_code',
    post_login_route: `${process.env.NEXT_PUBLIC_APP_URL}`,
}

export interface SessionData {
    isLoggedIn: boolean
    access_token?: string
    code_verifier?: string
    userInfo?: {
        sub: string
        name: string
        email: string
        email_verified: boolean
    }
    tenantId?: string
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
    access_token: undefined,
    code_verifier: undefined,
    userInfo: undefined,
    tenantId: undefined,
}

export const sessionOptions: SessionOptions = {
    password: "complex_password_at_least_32_characters_long",
    cookieName: "next_js_session",
    cookieOptions: {
        // secure only works in `https` environments
        // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
        secure: process.env.NODE_ENV === "production",
    },
    ttl: 60 * 60 * 24 * 7 // 1 week
};

export async function getSession(): Promise<IronSession<SessionData>> {
    let session = await getIronSession<SessionData>(cookies(), sessionOptions)
    if (!session.isLoggedIn) {
        session.access_token = defaultSession.access_token
        session.userInfo = defaultSession.userInfo
    }
    return session
}

export async function getClient() {
    const abpIssuer = await Issuer.discover(clientConfig.url!);
    const client = new abpIssuer.Client({
        client_id: clientConfig.client_id!,
        response_types: ['code'],
        redirect_uris: [clientConfig.redirect_uri],
        token_endpoint_auth_method: "none"
    });
    return client;
}