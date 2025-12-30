import * as client from 'openid-client';

const KEYCLOAK_URL = 'https://keycloak.parkora.crn.si./auth';
const REALM = 'parkora';
const CLIENT_ID = 'frontend-app';

let config: client.Configuration | null = null;

export async function getOIDCConfig(): Promise<client.Configuration> {
	if (config) return config;

	const issuerUrl = new URL(`${KEYCLOAK_URL}/realms/${REALM}`);
	config = await client.discovery(issuerUrl, CLIENT_ID);
	return config;
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
