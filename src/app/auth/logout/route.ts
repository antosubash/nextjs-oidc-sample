import { defaultSession, getClient, getSession, clientConfig } from '@/lib';
import { generators } from 'openid-client';

export async function GET() {
    const session = await getSession();
    const client = await getClient();
    var endSession = client.endSessionUrl({
        post_logout_redirect_uri: clientConfig.post_logout_redirect_uri,
        id_token_hint: session.access_token,
        state: generators.state()
    });
    session.isLoggedIn = defaultSession.isLoggedIn;
    session.access_token = defaultSession.access_token;
    session.userInfo = defaultSession.userInfo;
    session.code_verifier = defaultSession.code_verifier;
    await session.save();
    return Response.redirect(endSession);
}