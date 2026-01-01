<script lang="ts">
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

	interface Props {
		reservation: Reservation;
		onCancel: (id: string) => void;
		onPay?: (id: string) => void;
		isPaymentLoading?: boolean;
	}

	let { reservation, onCancel, onPay, isPaymentLoading = false }: Props = $props();

	function getStatusBadgeClass(status: string): string {
		switch (status) {
			case 'PENDING':
				return 'badge-warning';
			case 'CONFIRMED':
				return 'badge-success';
			case 'CANCELLED':
				return 'badge-error';
			case 'COMPLETED':
				return 'badge-neutral';
			default:
				return 'badge-ghost';
		}
	}

	function formatDateTime(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleString('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}

	let canCancel = $derived(
		reservation.status === 'PENDING' || reservation.status === 'CONFIRMED'
	);

	let canPay = $derived(reservation.status === 'PENDING' && onPay);
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body">
		<div class="flex justify-between items-start">
			<h2 class="card-title text-lg">{reservation.parkingSpotId}</h2>
			<span class="badge {getStatusBadgeClass(reservation.status)}">
				{reservation.status}
			</span>
		</div>

		<div class="grid grid-cols-2 gap-2 text-sm mt-2">
			<div>
				<span class="text-base-content/70">Start:</span>
				<span class="ml-1">{formatDateTime(reservation.startTime)}</span>
			</div>
			<div>
				<span class="text-base-content/70">End:</span>
				<span class="ml-1">{formatDateTime(reservation.endTime)}</span>
			</div>
			<div>
				<span class="text-base-content/70">Duration:</span>
				<span class="ml-1">{reservation.durationHours}h</span>
			</div>
			<div>
				<span class="text-base-content/70">Total:</span>
				<span class="ml-1 font-semibold">{reservation.totalCost.toFixed(2)} EUR</span>
			</div>
		</div>

		{#if reservation.transactionId}
			<div class="mt-2 p-2 bg-success/10 rounded-lg">
				<span class="text-xs text-base-content/70">Transaction ID:</span>
				<code class="text-xs ml-1 font-mono">{reservation.transactionId}</code>
			</div>
		{/if}

		<div class="card-actions justify-end mt-4 gap-2">
			{#if canPay}
				<button
					class="btn btn-primary btn-sm"
					onclick={() => onPay?.(reservation.id)}
					disabled={isPaymentLoading}
				>
					{#if isPaymentLoading}
						<span class="loading loading-spinner loading-xs"></span>
						Processing...
					{:else}
						Pay Now
					{/if}
				</button>
			{/if}
			{#if canCancel}
				<button
					class="btn btn-error btn-sm btn-outline"
					onclick={() => onCancel(reservation.id)}
					disabled={isPaymentLoading}
				>
					Cancel
				</button>
			{/if}
		</div>
	</div>
</div>
