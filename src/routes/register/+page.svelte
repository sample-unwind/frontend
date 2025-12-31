<script lang="ts">
	// This page redirects to Keycloak registration
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect directly to Keycloak registration page with correct callback URI
		window.location.href = 'https://keycloak.parkora.crn.si/auth/realms/parkora/protocol/openid-connect/registrations?client_id=frontend-app&redirect_uri=https://parkora.crn.si/auth/callback&response_type=code&scope=openid%20profile%20email';
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200">
	<div class="card bg-base-100 shadow-xl w-96">
		<div class="card-body items-center text-center">
			<h2 class="card-title text-2xl mb-4">Register for Parkora</h2>
			<p class="mb-6 text-base-content/70">Redirecting to registration...</p>
			<div class="loading loading-spinner loading-lg"></div>
		</div>
	</div>
</div>