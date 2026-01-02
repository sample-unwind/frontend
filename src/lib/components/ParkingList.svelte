<script lang="ts">
	import ReservationModal from './ReservationModal.svelte';

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

	interface User {
		id: string;
		email: string;
		name: string;
	}

	interface WeatherData {
		available: boolean;
		temp?: number;
		feels_like?: number;
		humidity?: number;
		description?: string;
		icon?: string;
		wind_speed?: number;
		message?: string;
	}

	interface ReservationResult {
		id: string;
		status: string;
		totalCost: number;
		startTime: string;
		endTime: string;
		durationHours: number;
		parkingSpotId: string;
	}

	let {
		parkingSpots,
		user,
		weather
	}: { parkingSpots: ParkingSpot[]; user?: User; weather?: WeatherData } = $props();

	let selectedSpot = $state<ParkingSpot | null>(null);
	let showReservationModal = $state(false);
	let successMessage = $state('');

	function getAvailabilityClass(available: number, total: number): string {
		const ratio = available / total;
		if (ratio === 0) return 'badge-error';
		if (ratio < 0.2) return 'badge-warning';
		return 'badge-success';
	}

	function getAvailabilityText(available: number, total: number): string {
		if (available === 0) return 'Full';
		if (available / total < 0.2) return 'Limited';
		return 'Available';
	}

	function handleReserve(spot: ParkingSpot) {
		selectedSpot = spot;
		showReservationModal = true;
	}

	function handleReservationCreated(reservation: ReservationResult) {
		console.log('Reservation created:', reservation);

		// Show success message with price if available
		if (reservation?.totalCost !== undefined) {
			successMessage = `Reservation confirmed! Total: €${reservation.totalCost.toFixed(2)}`;
		} else {
			successMessage = 'Reservation created successfully!';
		}

		// Clear message after 5 seconds
		setTimeout(() => {
			successMessage = '';
		}, 5000);
	}

	function closeModal() {
		showReservationModal = false;
		selectedSpot = null;
	}

	function getWeatherIconUrl(icon: string): string {
		return `https://openweathermap.org/img/wn/${icon}@2x.png`;
	}
</script>

{#if successMessage}
	<div class="alert alert-success mb-4">
		<span>{successMessage}</span>
	</div>
{/if}

<!-- Weather Card -->
{#if weather}
	<div class="card bg-base-100 shadow-md mb-6">
		<div class="card-body py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<h3 class="font-semibold text-lg">Ljubljana Weather</h3>
					{#if weather.available && weather.icon}
						<img
							src={getWeatherIconUrl(weather.icon)}
							alt={weather.description || 'Weather'}
							class="w-12 h-12"
						/>
					{/if}
				</div>
				{#if weather.available}
					<div class="flex items-center gap-6 text-sm">
						<div class="flex items-center gap-2">
							<span class="text-3xl font-bold">{weather.temp?.toFixed(1)}°C</span>
						</div>
						<div class="hidden sm:flex flex-col">
							<span class="text-base-content/70 capitalize">{weather.description}</span>
							<span class="text-base-content/50">Feels like {weather.feels_like?.toFixed(1)}°C</span>
						</div>
						<div class="hidden md:flex flex-col text-base-content/70">
							<span>Humidity: {weather.humidity}%</span>
							<span>Wind: {weather.wind_speed?.toFixed(1)} m/s</span>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-2 text-base-content/50">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<span>{weather.message || 'Weather unavailable'}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
	{#each parkingSpots as spot (spot.id)}
		<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
			<div class="card-body">
				<div class="flex justify-between items-start">
					<h2 class="card-title text-lg">{spot.name}</h2>
					{#if !spot.isOpen}
						<span class="badge badge-neutral">Closed</span>
					{/if}
				</div>

				<p class="text-sm text-base-content/70">{spot.address}</p>

				<div class="flex items-center gap-2 mt-2">
					<span class="badge {getAvailabilityClass(spot.availableSpots, spot.totalSpots)}">
						{getAvailabilityText(spot.availableSpots, spot.totalSpots)}
					</span>
					<span class="text-sm">
						{spot.availableSpots} / {spot.totalSpots} spots
					</span>
				</div>

				<div class="flex justify-between items-center mt-4">
					<span class="text-lg font-semibold">
						{spot.pricePerHour.toFixed(2)} EUR/h
					</span>
					<button
						class="btn btn-primary btn-sm"
						disabled={!spot.isOpen || spot.availableSpots === 0}
						onclick={() => handleReserve(spot)}
					>
						Reserve
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>

{#if parkingSpots.length === 0}
	<div class="text-center py-12">
		<p class="text-base-content/70">No parking spots available</p>
	</div>
{/if}

{#if selectedSpot && user}
	<ReservationModal
		parkingSpotId={selectedSpot.name}
		parkingSpotName={selectedSpot.name}
		pricePerHour={selectedSpot.pricePerHour}
		userId={user.id}
		isOpen={showReservationModal}
		onClose={closeModal}
		onReservationCreated={handleReservationCreated}
	/>
{/if}
