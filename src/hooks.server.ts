import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Get access token from cookies
	const accessToken = event.cookies.get('access_token');

	if (accessToken) {
		// Make the token available to the app
		event.locals.accessToken = accessToken;
		event.locals.isAuthenticated = true;
	} else {
		event.locals.isAuthenticated = false;
	}

	return resolve(event);
};
