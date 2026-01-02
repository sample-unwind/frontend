import { redirect, type Handle } from '@sveltejs/kit';
import { getOIDCConfig, refreshTokens } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Get tokens from cookies
	const accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');

	if (accessToken) {
		try {
			// Decode token to check expiry
			const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
			const exp = payload.exp * 1000; // Convert to milliseconds
			const now = Date.now();
			const bufferTime = 60 * 1000; // 1 minute buffer before expiry

			// Check if token is expired or about to expire
			if (exp - now < bufferTime) {
				// Token expired or expiring soon
				if (refreshToken) {
					try {
						// Attempt to refresh tokens
						const oidcConfig = await getOIDCConfig();
						const tokens = await refreshTokens(oidcConfig, refreshToken);

						// Update cookies with new tokens
						if (tokens.access_token) {
							event.cookies.set('access_token', tokens.access_token, {
								path: '/',
								httpOnly: true,
								secure: true,
								sameSite: 'lax',
								maxAge: tokens.expires_in || 300
							});
							event.locals.accessToken = tokens.access_token;

							// Update user info from new token
							const newPayload = JSON.parse(
								Buffer.from(tokens.access_token.split('.')[1], 'base64').toString()
							);
							event.locals.user = {
								id: newPayload.sub,
								email: newPayload.email,
								name: newPayload.name
							};
						}

						if (tokens.refresh_token) {
							event.cookies.set('refresh_token', tokens.refresh_token, {
								path: '/',
								httpOnly: true,
								secure: true,
								sameSite: 'lax',
								maxAge: 7 * 24 * 60 * 60 // 7 days
							});
						}

						event.locals.isAuthenticated = true;
					} catch (refreshError) {
						console.error('Token refresh failed:', refreshError);
						// Clear invalid tokens
						event.cookies.delete('access_token', { path: '/' });
						event.cookies.delete('refresh_token', { path: '/' });
						event.cookies.delete('id_token', { path: '/' });
						event.locals.isAuthenticated = false;

						// Redirect to login for non-public routes
						const pathname = event.url.pathname;
						if (!pathname.startsWith('/auth/') && pathname !== '/') {
							throw redirect(302, '/auth/login');
						}
					}
				} else {
					// No refresh token - clear expired access token
					event.cookies.delete('access_token', { path: '/' });
					event.locals.isAuthenticated = false;

					// Redirect to login for non-public routes
					const pathname = event.url.pathname;
					if (!pathname.startsWith('/auth/') && pathname !== '/') {
						throw redirect(302, '/auth/login');
					}
				}
			} else {
				// Token is still valid
				event.locals.accessToken = accessToken;
				event.locals.isAuthenticated = true;
				event.locals.user = {
					id: payload.sub,
					email: payload.email,
					name: payload.name
				};
			}
		} catch (error) {
			console.error('Token handling failed:', error);
			// Clear invalid tokens
			event.cookies.delete('access_token', { path: '/' });
			event.cookies.delete('refresh_token', { path: '/' });
			event.cookies.delete('id_token', { path: '/' });
			event.locals.isAuthenticated = false;
		}
	} else {
		event.locals.isAuthenticated = false;
	}

	return resolve(event);
};
