import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// User service API base URL (internal cluster service or external URL)
const USER_SERVICE_URL =
	env.USER_SERVICE_URL || 'https://parkora.crn.si/api/v1/user';

export const POST: RequestHandler = async ({ request, locals }) => {
	// In production, check authentication
	// if (!locals.isAuthenticated) {
	// 	return json({ error: 'Unauthorized' }, { status: 401 });
	// }

	try {
		const body = await request.json();

		// Forward the request to user-service GraphQL endpoint
		const response = await fetch(`${USER_SERVICE_URL}/graphql`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			console.error(
				`User service returned ${response.status}: ${await response.text()}`
			);
			return json(
				{ error: 'Failed to query user service' },
				{ status: 502 }
			);
		}

		const result = await response.json();
		return json(result);
	} catch (error) {
		console.error('Error querying user service:', error);
		return json(
			{ error: 'Failed to connect to user-service' },
			{ status: 503 }
		);
	}
};