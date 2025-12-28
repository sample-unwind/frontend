import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getOIDCConfig,
	buildAuthorizationUrl,
	generateState,
	generateCodeVerifier
} from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const oidcConfig = await getOIDCConfig();

	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	// Store state and code verifier in cookies for callback validation
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	cookies.set('code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	const redirectUri = `${url.origin}/auth/callback`;
	const authUrl = await buildAuthorizationUrl(oidcConfig, redirectUri, state, codeVerifier);

	throw redirect(302, authUrl.toString());
};
