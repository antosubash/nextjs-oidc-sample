import { getClient, getSession, clientConfig } from '@/lib';
import { IncomingMessage } from 'http';

export async function GET(request: IncomingMessage) {
    const session = await getSession();
    const client = await getClient();
    const params = client.callbackParams(request);
    const tokenSet = await client.callback(clientConfig.redirect_uri, params, { code_verifier: session.code_verifier });
    session.isLoggedIn = true;
    session.access_token = tokenSet.access_token;
    const userinfo = await client.userinfo(tokenSet);
    session.userInfo = {
        sub: userinfo.sub,
        name: userinfo.given_name!,
        email: userinfo.email!,
        email_verified: userinfo.email_verified!,
    };
    await session.save();
    return Response.redirect(clientConfig.post_login_route);
}