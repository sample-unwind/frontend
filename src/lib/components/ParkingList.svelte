<script lang="ts">
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

	let { parkingSpots }: { parkingSpots: ParkingSpot[] } = $props();

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
</script>

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
