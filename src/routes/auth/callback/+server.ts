import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOIDCConfig, exchangeCodeForTokens } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		const errorDescription = url.searchParams.get('error_description') || 'Authentication failed';
		throw error(400, errorDescription);
	}

	if (!code || !state) {
		throw error(400, 'Missing code or state parameter');
	}

	const storedState = cookies.get('oauth_state');
	const codeVerifier = cookies.get('code_verifier');

	if (!storedState || state !== storedState) {
		throw error(400, 'Invalid state parameter');
	}

	if (!codeVerifier) {
		throw error(400, 'Missing code verifier');
	}

	// Clear the temporary cookies
	cookies.delete('oauth_state', { path: '/' });
	cookies.delete('code_verifier', { path: '/' });

	try {
		const oidcConfig = await getOIDCConfig();
		const redirectUri = `${url.origin}/auth/callback`;

		const tokens = await exchangeCodeForTokens(
			oidcConfig,
			url,
			storedState,
			codeVerifier,
			redirectUri
		);

		// Store access token in cookie
		if (tokens.access_token) {
			cookies.set('access_token', tokens.access_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: tokens.expires_in || 3600
			});
		}

		// Store refresh token if available
		if (tokens.refresh_token) {
			cookies.set('refresh_token', tokens.refresh_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
		}

		// Store ID token for user info
		if (tokens.id_token) {
			cookies.set('id_token', tokens.id_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: tokens.expires_in || 3600
			});
		}
	} catch (err) {
		console.error('Token exchange error:', err);
		throw error(500, 'Failed to exchange authorization code');
	}

	throw redirect(302, '/');
};
