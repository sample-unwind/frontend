import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// Parking service API base URL (internal cluster service or external URL)
const PARKING_SERVICE_URL =
	env.PARKING_SERVICE_URL || 'https://parkora.crn.si/api/v1/parking';

interface AvailabilityData {
	available_spots: number;
	total_spots: number;
	parking_location: {
		name: string;
	};
}

interface ParkingSpot {
	id: string;
	name: string;
	address: string;
	totalSpots: number;
	availableSpots: number;
	pricePerHour: number;
	isOpen: boolean;
	latitude: number;
	longitude: number;
}

export const GET: RequestHandler = async ({ locals }) => {
	// In production, check authentication
	// if (!locals.isAuthenticated) {
	// 	return json({ error: 'Unauthorized' }, { status: 401 });
	// }

	try {
		// Fetch current availability from parking-service
		const response = await fetch(`${PARKING_SERVICE_URL}/analytics/availability/current`);

		if (!response.ok) {
			console.error(
				`Parking service returned ${response.status}: ${await response.text()}`
			);
			return json(
				{ error: 'Failed to fetch parking data from parking-service' },
				{ status: 502 }
			);
		}

		const availabilityData: AvailabilityData[] = await response.json();

		// Transform the data to match frontend expected format
		// Group by parking location name and take the most recent entry for each
		const latestByLocation = new Map<string, AvailabilityData>();
		for (const entry of availabilityData) {
			const name = entry.parking_location?.name;
			if (name && !latestByLocation.has(name)) {
				latestByLocation.set(name, entry);
			}
		}

		// Convert to frontend format
		const parkingSpots: ParkingSpot[] = Array.from(latestByLocation.entries()).map(
			([name, data], index) => ({
				id: String(index + 1),
				name: name,
				address: 'Ljubljana', // Address not available from current API
				totalSpots: data.total_spots,
				availableSpots: data.available_spots,
				pricePerHour: 0.0, // Price not available from current API
				isOpen: true, // Assume open if we have data
				latitude: 46.0569, // Default Ljubljana coordinates
				longitude: 14.5058
			})
		);

		return json({
			parkingSpots,
			totalCount: parkingSpots.length,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error fetching from parking-service:', error);
		return json(
			{ error: 'Failed to connect to parking-service' },
			{ status: 503 }
		);
	}
};
