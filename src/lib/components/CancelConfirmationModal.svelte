<script lang="ts">
	interface Props {
		isOpen: boolean;
		reservationId: string;
		parkingSpotName: string;
		onConfirm: (reason: string) => void;
		onClose: () => void;
		loading?: boolean;
	}

	let { isOpen, reservationId, parkingSpotName, onConfirm, onClose, loading = false }: Props =
		$props();

	let reason = $state('');

	function handleConfirm() {
		onConfirm(reason);
	}

	function handleClose() {
		reason = '';
		onClose();
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal modal-open" onclick={handleClose}>
		<div class="modal-box" onclick={(e) => e.stopPropagation()}>
			<h3 class="font-bold text-lg">Cancel Reservation</h3>
			<p class="py-4">
				Are you sure you want to cancel your reservation at
				<strong>{parkingSpotName}</strong>?
			</p>

			<div class="form-control">
				<label class="label" for="reason">
					<span class="label-text">Reason (optional)</span>
				</label>
				<textarea
					id="reason"
					class="textarea textarea-bordered"
					bind:value={reason}
					placeholder="Why are you cancelling?"
					rows="3"
				></textarea>
			</div>

			<div class="modal-action">
				<button class="btn btn-ghost" onclick={handleClose} disabled={loading}>
					Keep Reservation
				</button>
				<button class="btn btn-error" onclick={handleConfirm} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					Cancel Reservation
				</button>
			</div>
		</div>
	</div>
{/if}
