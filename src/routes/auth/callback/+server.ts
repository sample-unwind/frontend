import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as client from 'openid-client';
import { getOIDCConfig, exchangeCodeForTokens } from '$lib/server/auth';

async function createUserIfNotExists(idToken: string, accessToken: string, fetchFn: typeof fetch) {
	try {
		// Decode ID token to get user info
		const payload = idToken.split('.')[1];
		const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

		const userId = decoded.sub;
		const email = decoded.email;
		const firstName = decoded.given_name || decoded.name?.split(' ')[0] || '';
		const lastName = decoded.family_name || decoded.name?.split(' ').slice(1).join(' ') || '';

		// Check if user exists
		const checkQuery = {
			query: `
				query UserByKeycloakId($keycloakUserId: String!) {
					userByKeycloakId(keycloakUserId: $keycloakUserId) {
						id
					}
				}
			`,
			variables: { keycloakUserId: userId }
		};

		const checkResponse = await fetchFn('/_internal/user-proxy', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			},
			body: JSON.stringify(checkQuery)
		});

		if (checkResponse.ok) {
			const checkResult = await checkResponse.json();
			if (checkResult.data?.userByKeycloakId) {
				// User already exists
				return;
			}
		}

		// Create user
		const createMutation = {
			query: `
				mutation CreateUser($email: String!, $firstName: String!, $lastName: String!, $keycloakUserId: String!) {
					createUser(email: $email, firstName: $firstName, lastName: $lastName, keycloakUserId: $keycloakUserId) {
						id
						email
					}
				}
			`,
			variables: {
				email,
				firstName,
				lastName,
				keycloakUserId: userId
			}
		};

		const createResponse = await fetchFn('/_internal/user-proxy', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			},
			body: JSON.stringify(createMutation)
		});

		if (createResponse.ok) {
			const createResult = await createResponse.json();
			console.log('User created:', createResult);
		} else {
			console.error('Failed to create user:', await createResponse.text());
		}
	} catch (err) {
		console.error('Error in createUserIfNotExists:', err);
	}
}

export const GET: RequestHandler = async (event) => {
	const { url, cookies, fetch } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		const errorDescription = url.searchParams.get('error_description') || 'Authentication failed';
		throw error(400, errorDescription);
	}

	if (!code) {
		throw error(400, 'Missing code parameter');
	}

	const storedState = cookies.get('oauth_state');
	const codeVerifier = cookies.get('code_verifier');

	// For login flows, validate state if it was set up
	// For registration flows with prompt=create, Keycloak does not return state
	if (storedState && state) {
		// Login flow with both stored state and URL state - validate
		if (state !== storedState) {
			throw error(400, 'Invalid state parameter');
		}
	}
	// Registration flows or flows without state proceed without validation

	// Clear the temporary cookies if they exist
	if (storedState) {
		cookies.delete('oauth_state', { path: '/' });
	}
	if (codeVerifier) {
		cookies.delete('code_verifier', { path: '/' });
	}

	try {
		const oidcConfig = await getOIDCConfig();
		const redirectUri = `${url.origin}/auth/callback`;

		// Handle PKCE exchange based on what's available
		let tokens;
		if (codeVerifier) {
			// Login flow with PKCE
			tokens = await exchangeCodeForTokens(
				oidcConfig,
				url,
				storedState || state || '', // Use available state
				codeVerifier,
				redirectUri
			);
		} else {
			// Registration flow without PKCE (fallback)
			const expectedState = storedState || state || undefined;
			tokens = await client.authorizationCodeGrant(oidcConfig, url, {
				expectedState,
				idTokenExpected: true
			});
		}

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

		// Store ID token for user info (extended lifetime for logout functionality)
		if (tokens.id_token) {
			cookies.set('id_token', tokens.id_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 // 24 hours (instead of tokens.expires_in || 3600)
			});
		}

		// Create user in user-service if they don't exist
		if (tokens.id_token && tokens.access_token) {
			await createUserIfNotExists(tokens.id_token, tokens.access_token, fetch);
		}
	} catch (err) {
		console.error('Token exchange error:', err);
		throw error(500, 'Failed to exchange authorization code');
	}

	throw redirect(302, '/');
};
