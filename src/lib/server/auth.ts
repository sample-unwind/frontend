import * as client from 'openid-client';

const KEYCLOAK_URL = 'https://keycloak.parkora.crn.si/auth';
const REALM = 'parkora';
const CLIENT_ID = 'frontend-app';

let config: client.Configuration | null = null;

export async function getOIDCConfig(): Promise<client.Configuration> {
	if (config) return config;

	const issuerUrl = new URL(`${KEYCLOAK_URL}/realms/${REALM}`);

	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			config = await client.discovery(issuerUrl, CLIENT_ID);
			return config;
		} catch (error) {
			console.error(`OIDC discovery attempt ${attempt} failed:`, error);
			if (attempt < 3) {
				await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
			} else {
				throw error;
			}
		}
	}
	return config!; // Should not reach here
}

export async function buildAuthorizationUrl(
	oidcConfig: client.Configuration,
	redirectUri: string,
	state: string,
	codeVerifier: string
): Promise<URL> {
	const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

	const authUrl = client.buildAuthorizationUrl(oidcConfig, {
		redirect_uri: redirectUri,
		scope: 'openid profile email',
		state,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256'
	});

	return authUrl;
}

export async function exchangeCodeForTokens(
	oidcConfig: client.Configuration,
	callbackUrl: URL,
	expectedState: string,
	codeVerifier: string,
	redirectUri: string
): Promise<client.TokenEndpointResponse> {
	const tokens = await client.authorizationCodeGrant(oidcConfig, callbackUrl, {
		expectedState,
		pkceCodeVerifier: codeVerifier,
		idTokenExpected: true
	});

	return tokens;
}

export function generateState(): string {
	return client.randomState();
}

export function generateCodeVerifier(): string {
	return client.randomPKCECodeVerifier();
}

export async function refreshTokens(
	oidcConfig: client.Configuration,
	refreshToken: string
): Promise<client.TokenEndpointResponse> {
	const tokens = await client.refreshTokenGrant(oidcConfig, refreshToken);
	return tokens;
}
