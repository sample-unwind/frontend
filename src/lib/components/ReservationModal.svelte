<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		parkingSpotId: string;
		parkingSpotName: string;
		pricePerHour: number;
		userId: string;
		isOpen: boolean;
	}

	let { parkingSpotId, parkingSpotName, pricePerHour, userId, isOpen }: Props = $props();

	const dispatch = createEventDispatcher();

	let startTime = $state('');
	let duration = $state(1);
	let loading = $state(false);
	let error = $state('');

	// Calculate total cost
	let totalCost = $derived(() => {
		return (duration * pricePerHour).toFixed(2);
	});

	// Set minimum start time to now + 30 minutes
	const now = new Date();
	now.setMinutes(now.getMinutes() + 30);
	const minStartTime = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format

	function closeModal() {
		dispatch('close');
		resetForm();
	}

	function resetForm() {
		startTime = '';
		duration = 1;
		error = '';
		loading = false;
	}

	async function handleSubmit() {
		if (!startTime) {
			error = 'Please select a start time';
			return;
		}

		loading = true;
		error = '';

		try {
			// For now, we'll use a mock user_id. In a real app, this would come from auth
			const userId = 'mock-user-id'; // TODO: Get from auth context

			const reservationData = {
				query: `
					mutation CreateReservation($input: CreateReservationInput!) {
						createReservation(input: $input) {
							id
							status
							totalCost
						}
					}
				`,
				variables: {
					input: {
						userId,
						parkingSpotId,
						startTime: new Date(startTime).toISOString(),
						durationHours: duration,
						totalCost: duration * pricePerHour
					}
				}
			};

			const response = await fetch('/_internal/reservation-proxy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(reservationData),
			});

			const result = await response.json();

			if (result.errors) {
				throw new Error(result.errors[0].message);
			}

			dispatch('reservationCreated', result.data.createReservation);
			closeModal();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create reservation';
		} finally {
			loading = false;
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal modal-open" onclick={closeModal}>
		<div class="modal-box" onclick={(e) => e.stopPropagation()}>
			<h3 class="font-bold text-lg mb-4">Reserve Parking Spot</h3>
			<p class="mb-4">{parkingSpotName}</p>

			{#if error}
				<div class="alert alert-error mb-4">
					<span>{error}</span>
				</div>
			{/if}

			<div class="form-control mb-4">
				<label class="label" for="startTime">
					<span class="label-text">Start Time</span>
				</label>
				<input
					id="startTime"
					type="datetime-local"
					class="input input-bordered"
					bind:value={startTime}
					min={minStartTime}
					required
				/>
			</div>

			<div class="form-control mb-4">
				<label class="label" for="duration">
					<span class="label-text">Duration (hours)</span>
				</label>
				<select id="duration" class="select select-bordered" bind:value={duration}>
					<option value={1}>1 hour</option>
					<option value={2}>2 hours</option>
					<option value={3}>3 hours</option>
					<option value={4}>4 hours</option>
					<option value={6}>6 hours</option>
					<option value={8}>8 hours</option>
					<option value={12}>12 hours</option>
					<option value={24}>24 hours</option>
				</select>
			</div>

			<div class="bg-base-200 p-4 rounded-lg mb-4">
				<div class="flex justify-between items-center">
					<span class="font-semibold">Total Cost:</span>
					<span class="text-lg font-bold">{totalCost} EUR</span>
				</div>
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={closeModal} disabled={loading}>
					Cancel
				</button>
				<button
					class="btn btn-primary"
					onclick={handleSubmit}
					disabled={loading || !startTime}
				>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Reserve
				</button>
			</div>
		</div>
	</div>
{/if}