<script lang="ts">
	// This page shows a login button that redirects to /login (which triggers OIDC flow)
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200">
	<div class="card bg-base-100 shadow-xl w-96">
		<div class="card-body items-center text-center">
			<h2 class="card-title text-2xl mb-4">Parkora</h2>
			<p class="mb-6 text-base-content/70">Smart Parking System</p>
			<a href="/auth/login" data-sveltekit-reload class="btn btn-primary w-full">
				Sign in with Keycloak
			</a>
		</div>
	</div>
</div>
