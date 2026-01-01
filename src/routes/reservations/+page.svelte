<script lang="ts">
	import AuthenticatedLayout from '$lib/components/AuthenticatedLayout.svelte';
	import ReservationCard from '$lib/components/ReservationCard.svelte';
	import CancelConfirmationModal from '$lib/components/CancelConfirmationModal.svelte';

	let { data } = $props();

	interface Reservation {
		id: string;
		status: string;
		totalCost: number;
		startTime: string;
		endTime: string;
		durationHours: number;
		parkingSpotId: string;
		createdAt: string;
		transactionId?: string | null;
	}

	let reservations = $state<Reservation[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showCompleted = $state(false);

	// Cancel modal state
	let showCancelModal = $state(false);
	let reservationToCancel = $state<Reservation | null>(null);
	let cancelLoading = $state(false);
	let successMessage = $state('');

	// Payment state
	let paymentLoading = $state<string | null>(null); // ID of reservation being paid

	async function fetchReservations() {
		loading = true;
		error = null;

		try {
			const response = await fetch(
				`/_internal/reservation-proxy?includeCompleted=${showCompleted}`
			);

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || 'Failed to fetch reservations');
			}

			const result = await response.json();

			if (result.errors) {
				throw new Error(result.errors[0].message);
			}

			reservations = result.data?.reservationsByUser || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load reservations';
			reservations = [];
		} finally {
			loading = false;
		}
	}

	function handleCancelClick(id: string) {
		reservationToCancel = reservations.find((r) => r.id === id) || null;
		if (reservationToCancel) {
			showCancelModal = true;
		}
	}

	async function handlePayClick(id: string) {
		paymentLoading = id;
		error = null;

		try {
			const response = await fetch('/_internal/reservation-proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: `
						mutation PayReservation($id: String!) {
							payReservation(id: $id) {
								success
								transactionId
								message
								errorCode
							}
						}
					`,
					variables: { id }
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to process payment');
			}

			if (result.errors) {
				throw new Error(result.errors[0].message);
			}

			const paymentResult = result.data?.payReservation;

			if (paymentResult?.success) {
				successMessage = `Payment successful! Transaction ID: ${paymentResult.transactionId}`;
				// Clear success message after 10 seconds
				setTimeout(() => {
					successMessage = '';
				}, 10000);
				// Refresh the list
				await fetchReservations();
			} else {
				throw new Error(paymentResult?.message || 'Payment failed');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to process payment';
		} finally {
			paymentLoading = null;
		}
	}

	async function confirmCancel(reason: string) {
		if (!reservationToCancel) return;

		cancelLoading = true;

		try {
			const response = await fetch('/_internal/reservation-proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: `
						mutation CancelReservation($id: String!, $reason: String) {
							cancelReservation(id: $id, reason: $reason) {
								id
								status
							}
						}
					`,
					variables: {
						id: reservationToCancel.id,
						reason: reason || null
					}
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to cancel reservation');
			}

			if (result.errors) {
				throw new Error(result.errors[0].message);
			}

			// Close modal and show success
			showCancelModal = false;
			reservationToCancel = null;
			successMessage = 'Reservation cancelled successfully';

			// Clear success message after 5 seconds
			setTimeout(() => {
				successMessage = '';
			}, 5000);

			// Refresh the list
			await fetchReservations();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to cancel reservation';
		} finally {
			cancelLoading = false;
		}
	}

	function closeCancelModal() {
		showCancelModal = false;
		reservationToCancel = null;
	}

	// Fetch reservations on mount and when filter changes
	$effect(() => {
		// Track showCompleted as a dependency
		const _includeCompleted = showCompleted;
		fetchReservations();
	});
</script>

{#if data.user}
	<AuthenticatedLayout user={data.user}>
		<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div>
				<h1 class="text-3xl font-bold">My Reservations</h1>
				<p class="text-base-content/70 mt-2">View and manage your parking reservations</p>
			</div>

			<!-- Filter toggle -->
			<label class="label cursor-pointer gap-2">
				<span class="label-text">Show completed/cancelled</span>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={showCompleted} />
			</label>
		</div>

		{#if successMessage}
			<div class="alert alert-success mb-4">
				<span>{successMessage}</span>
			</div>
		{/if}

		{#if error}
			<div class="alert alert-error mb-4">
				<span>{error}</span>
				<button class="btn btn-sm btn-ghost" onclick={() => fetchReservations()}>Retry</button>
			</div>
		{/if}

		{#if loading}
			<div class="flex justify-center py-12">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else if reservations.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🅿️</div>
				<p class="text-base-content/70 mb-4">You don't have any reservations yet</p>
				<a href="/" class="btn btn-primary">Find Parking</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each reservations as reservation (reservation.id)}
					<ReservationCard
						{reservation}
						onCancel={handleCancelClick}
						onPay={handlePayClick}
						isPaymentLoading={paymentLoading === reservation.id}
					/>
				{/each}
			</div>
		{/if}

		<CancelConfirmationModal
			isOpen={showCancelModal}
			reservationId={reservationToCancel?.id ?? ''}
			parkingSpotName={reservationToCancel?.parkingSpotId ?? ''}
			onConfirm={confirmCancel}
			onClose={closeCancelModal}
			loading={cancelLoading}
		/>
	</AuthenticatedLayout>
{/if}
