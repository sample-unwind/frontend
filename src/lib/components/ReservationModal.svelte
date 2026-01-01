<script lang="ts">
	interface Props {
		parkingSpotId: string;
		parkingSpotName: string;
		pricePerHour: number;
		userId: string;
		isOpen: boolean;
		onClose: () => void;
		onReservationCreated: (reservation: ReservationResult) => void;
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
		parkingSpotId,
		parkingSpotName,
		pricePerHour,
		userId,
		isOpen,
		onClose,
		onReservationCreated
	}: Props = $props();

	let startTime = $state('');
	let duration = $state(1);
	let loading = $state(false);
	let error = $state('');
	let reservationResult = $state<ReservationResult | null>(null);

	// Calculate total cost
	let totalCost = $derived(duration * pricePerHour);

	// Validation for form submission
	let isValidCost = $derived(totalCost > 0 && totalCost <= 1000);

	// Prefill start time when modal opens
	$effect(() => {
		if (isOpen && !startTime) {
			const now = new Date();
			// Round up to next 15 minutes, then add 30 minutes
			const minutes = Math.ceil(now.getMinutes() / 15) * 15 + 30;
			now.setMinutes(minutes, 0, 0);
			startTime = now.toISOString().slice(0, 16);
		}
	});

	// Get minimum start time (now + 15 minutes)
	let minStartTime = $derived.by(() => {
		const now = new Date();
		now.setMinutes(now.getMinutes() + 15);
		return now.toISOString().slice(0, 16);
	});

	function closeModal() {
		onClose();
		resetForm();
	}

	function resetForm() {
		startTime = '';
		duration = 1;
		error = '';
		loading = false;
		reservationResult = null;
	}

	async function handleSubmit() {
		if (!startTime) {
			error = 'Please select a start time';
			return;
		}

		loading = true;
		error = '';

		try {
			const reservationData = {
				query: `
					mutation CreateReservation($input: CreateReservationInput!) {
						createReservation(input: $input) {
							id
							status
							totalCost
							startTime
							endTime
							durationHours
							parkingSpotId
						}
					}
				`,
				variables: {
					input: {
						userId,
						parkingSpotId,
						startTime: new Date(startTime).toISOString(),
						durationHours: duration,
						totalCost: totalCost
					}
				}
			};

			const response = await fetch('/_internal/reservation-proxy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(reservationData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create reservation');
			}

			if (result.errors) {
				throw new Error(result.errors[0].message);
			}

			// Store the reservation result for display
			reservationResult = result.data.createReservation;

			// Notify parent component
			onReservationCreated(reservationResult!);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create reservation';
		} finally {
			loading = false;
		}
	}

	function formatDateTime(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleString('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal modal-open" onclick={closeModal}>
		<div class="modal-box" onclick={(e) => e.stopPropagation()}>
			{#if reservationResult}
				<!-- Success State -->
				<div class="text-center">
					<div class="text-success text-6xl mb-4">✓</div>
					<h3 class="font-bold text-xl mb-2">Reservation Confirmed!</h3>
					<p class="text-base-content/70 mb-4">{parkingSpotName}</p>

					<div class="bg-base-200 p-4 rounded-lg text-left space-y-2">
						<div class="flex justify-between">
							<span class="text-base-content/70">Reservation ID:</span>
							<span class="font-mono text-sm">{reservationResult.id.slice(0, 8)}...</span>
						</div>
						<div class="flex justify-between">
							<span class="text-base-content/70">Status:</span>
							<span class="badge badge-success">{reservationResult.status}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-base-content/70">Start:</span>
							<span>{formatDateTime(reservationResult.startTime)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-base-content/70">End:</span>
							<span>{formatDateTime(reservationResult.endTime)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-base-content/70">Duration:</span>
							<span>{reservationResult.durationHours} hour(s)</span>
						</div>
						<div class="divider my-2"></div>
						<div class="flex justify-between text-lg font-bold">
							<span>Total:</span>
							<span class="text-primary">€{reservationResult.totalCost.toFixed(2)}</span>
						</div>
					</div>

					<div class="modal-action justify-center">
						<button class="btn btn-primary" onclick={closeModal}>Done</button>
					</div>
				</div>
			{:else}
				<!-- Reservation Form -->
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
					<div class="flex justify-between items-center mb-2">
						<span class="text-base-content/70">Price per hour:</span>
						<span>€{pricePerHour.toFixed(2)}</span>
					</div>
					<div class="flex justify-between items-center mb-2">
						<span class="text-base-content/70">Duration:</span>
						<span>{duration} hour(s)</span>
					</div>
					<div class="divider my-2"></div>
					<div class="flex justify-between items-center">
						<span class="font-semibold">Total:</span>
						<span class="text-xl font-bold text-primary">€{totalCost.toFixed(2)}</span>
					</div>
				</div>

				<div class="modal-action">
					<button class="btn btn-ghost" onclick={closeModal} disabled={loading}>
						Cancel
					</button>
					<button
						class="btn btn-primary"
						onclick={handleSubmit}
						disabled={loading || !startTime || !isValidCost}
					>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Reserve
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
