import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// Reservation service API base URL (internal cluster service or external URL)
const RESERVATION_SERVICE_URL =
	env.RESERVATION_SERVICE_URL || 'https://reservation-service:8000';

export const POST: RequestHandler = async ({ request, locals }) => {
	// In production, check authentication
	// if (!locals.isAuthenticated) {
	// 	return json({ error: 'Unauthorized' }, { status: 401 });
	// }

	try {
		const body = await request.json();

		// Forward the request to reservation-service GraphQL endpoint
		const response = await fetch(`${RESERVATION_SERVICE_URL}/graphql`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			console.error(
				`Reservation service returned ${response.status}: ${await response.text()}`
			);
			return json(
				{ error: 'Failed to create reservation' },
				{ status: 502 }
			);
		}

		const result = await response.json();
		return json(result);
	} catch (error) {
		console.error('Error creating reservation:', error);
		return json(
			{ error: 'Failed to connect to reservation-service' },
			{ status: 503 }
		);
	}
};