<script lang="ts">
	import AuthenticatedLayout from '$lib/components/AuthenticatedLayout.svelte';
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

{#if !data.isAuthenticated}
	<!-- Not authenticated - show welcome page -->
	<div class="min-h-screen bg-base-200 flex flex-col">
		<!-- Navbar for unauthenticated users -->
		<div class="navbar bg-base-100 shadow-md">
			<div class="flex-1">
				<a href="/" class="btn btn-ghost text-xl">Parkora</a>
			</div>
			<div class="flex-none">
				<a href="/login" class="btn btn-primary btn-sm">Sign in</a>
			</div>
		</div>

		<!-- Hero section -->
		<main class="flex-1">
			<div class="hero min-h-[60vh]">
				<div class="hero-content text-center">
					<div class="max-w-md">
						<h1 class="text-5xl font-bold">Parkora</h1>
						<p class="py-6 text-base-content/70">
							Smart parking system for Ljubljana. Find available parking spots, reserve your
							space, and pay seamlessly.
						</p>
						<a href="/login" class="btn btn-primary">Get Started</a>
					</div>
				</div>
			</div>
		</main>

		<!-- Footer -->
		<footer class="footer footer-center p-4 bg-base-100 text-base-content border-t">
			<div>
				<p>Parkora - RSO Project 2025</p>
			</div>
		</footer>
	</div>
{:else if data.user}
	<!-- Authenticated - show parking spots with layout -->
	<AuthenticatedLayout user={data.user}>
		<div class="mb-6">
			<h1 class="text-3xl font-bold">Available Parking</h1>
			<p class="text-base-content/70 mt-2">Find and reserve parking spots in Ljubljana</p>
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
	</AuthenticatedLayout>
{/if}
