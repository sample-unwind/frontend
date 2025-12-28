import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Mock parking data - will be replaced with real API calls to parking-service
const mockParkingSpots = [
	{
		id: '1',
		name: 'P+R Dolgi most',
		address: 'Dolgi most 1, Ljubljana',
		totalSpots: 520,
		availableSpots: 127,
		pricePerHour: 0.6,
		isOpen: true,
		latitude: 46.0335,
		longitude: 14.4768
	},
	{
		id: '2',
		name: 'Parkirna hiša Kongresni trg',
		address: 'Kongresni trg 1, Ljubljana',
		totalSpots: 720,
		availableSpots: 43,
		pricePerHour: 1.8,
		isOpen: true,
		latitude: 46.0511,
		longitude: 14.5051
	},
	{
		id: '3',
		name: 'P+R Studenec',
		address: 'Studenec 18, Ljubljana',
		totalSpots: 187,
		availableSpots: 89,
		pricePerHour: 0.6,
		isOpen: true,
		latitude: 46.0648,
		longitude: 14.5412
	},
	{
		id: '4',
		name: 'Parkirna hiša Nama',
		address: 'Tomšičeva ulica 1, Ljubljana',
		totalSpots: 450,
		availableSpots: 0,
		pricePerHour: 2.0,
		isOpen: true,
		latitude: 46.0553,
		longitude: 14.5063
	},
	{
		id: '5',
		name: 'Parkirna hiša Maksimilijana',
		address: 'Trg prekomorskih brigad 1, Ljubljana',
		totalSpots: 280,
		availableSpots: 156,
		pricePerHour: 1.5,
		isOpen: false,
		latitude: 46.0569,
		longitude: 14.5166
	}
];

export const GET: RequestHandler = async ({ locals }) => {
	// In production, check authentication
	// if (!locals.isAuthenticated) {
	// 	return json({ error: 'Unauthorized' }, { status: 401 });
	// }

	return json({
		parkingSpots: mockParkingSpots,
		totalCount: mockParkingSpots.length,
		timestamp: new Date().toISOString()
	});
};
