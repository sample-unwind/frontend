import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const KEYCLOAK_URL = 'https://keycloak.parkora.crn.si/auth';
const REALM = 'parkora';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const idToken = cookies.get('id_token');

	// Clear all auth cookies
	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('id_token', { path: '/' });

	// Redirect to Keycloak logout endpoint
	const logoutUrl = new URL(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`);
	logoutUrl.searchParams.set('post_logout_redirect_uri', url.origin);

	if (idToken) {
		logoutUrl.searchParams.set('id_token_hint', idToken);
	}

	throw redirect(302, logoutUrl.toString());
};
