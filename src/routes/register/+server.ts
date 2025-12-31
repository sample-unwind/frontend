import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Registration endpoint that sets up secure OIDC flow for new users
export const GET: RequestHandler = async ({ cookies, url }) => {
	// Generate a unique state parameter for CSRF protection
	const state = crypto.randomUUID();

	// Store state in cookie for callback validation (same security as login)
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Generate PKCE code verifier for additional security (same as login)
	const codeVerifier = crypto.randomUUID() + crypto.randomUUID();

	// Store code verifier in cookie
	cookies.set('code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Create PKCE code challenge (same as login)
	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const hash = await crypto.subtle.digest('SHA-256', data);
	const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	// Build Keycloak authorization URL with prompt=create for registration (OAuth 2.0 standard)
	const authorizationUrl = new URL('https://keycloak.parkora.crn.si/auth/realms/parkora/protocol/openid-connect/auth');
	authorizationUrl.searchParams.set('client_id', 'frontend-app');
	authorizationUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('scope', 'openid profile email');
	authorizationUrl.searchParams.set('prompt', 'create'); // Tells Keycloak to show registration form
	authorizationUrl.searchParams.set('state', state);
	authorizationUrl.searchParams.set('code_challenge', codeChallenge);
	authorizationUrl.searchParams.set('code_challenge_method', 'S256');

	throw redirect(302, authorizationUrl.toString());
};