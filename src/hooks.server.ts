import type { Handle } from '@sveltejs/kit';
import * as client from 'openid-client';

export const handle: Handle = async ({ event, resolve }) => {
	// Get access token from cookies
	const accessToken = event.cookies.get('access_token');

	if (accessToken) {
		// Make the token available to the app
		event.locals.accessToken = accessToken;
		event.locals.isAuthenticated = true;

		// Decode user info from token
		try {
			// Simple JWT decode (without verification for now)
			const payload = accessToken.split('.')[1];
			const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
			event.locals.user = {
				id: decoded.sub,
				email: decoded.email,
				name: decoded.name
			};
		} catch (error) {
			console.error('Failed to decode token:', error);
			event.locals.isAuthenticated = false;
		}
	} else {
		event.locals.isAuthenticated = false;
	}

	return resolve(event);
};
