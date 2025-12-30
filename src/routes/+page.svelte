<script lang="ts">
	import ParkingList from '$lib/components/ParkingList.svelte';

	let { data } = $props();

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

	let parkingSpots: ParkingSpot[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function fetchParkingSpots() {
		try {
			const response = await fetch('/_internal/parking-proxy');
			if (!response.ok) {
				throw new Error('Failed to fetch parking spots');
			}
			const result = await response.json();
			parkingSpots = result.parkingSpots;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (data.isAuthenticated) {
			fetchParkingSpots();
		} else {
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-base-200 flex flex-col">
	<!-- Navbar -->
	<div class="navbar bg-base-100 shadow-md">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Parkora</a>
		</div>
		<div class="flex-none">
			{#if data.isAuthenticated}
				<a href="/auth/logout" data-sveltekit-reload class="btn btn-ghost btn-sm">
					Sign out
				</a>
			{:else}
				<a href="/login" class="btn btn-primary btn-sm">
					Sign in
				</a>
			{/if}
		</div>
	</div>

	<!-- Main content -->
	<main class="container mx-auto px-4 py-8 flex-1">
		{#if !data.isAuthenticated}
			<!-- Not authenticated - show welcome -->
			<div class="hero min-h-[60vh]">
				<div class="hero-content text-center">
					<div class="max-w-md">
						<h1 class="text-5xl font-bold">Parkora</h1>
						<p class="py-6 text-base-content/70">
							Smart parking system for Ljubljana. Find available parking spots, 
							reserve your space, and pay seamlessly.
						</p>
						<a href="/login" class="btn btn-primary">Get Started</a>
					</div>
				</div>
			</div>
		{:else}
			<!-- Authenticated - show parking spots -->
			<div class="mb-6">
				<h1 class="text-3xl font-bold">Available Parking</h1>
				<p class="text-base-content/70 mt-2">
					Find and reserve parking spots in Ljubljana
				</p>
			</div>

			{#if loading}
				<div class="flex justify-center py-12">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<span>{error}</span>
				</div>
			{:else}
				<ParkingList {parkingSpots} user={data.user} />
			{/if}
		{/if}
	</main>

	<!-- Footer -->
	<footer class="footer footer-center p-4 bg-base-100 text-base-content border-t">
		<div>
			<p>Parkora - RSO Project 2025</p>
		</div>
	</footer>
</div>
