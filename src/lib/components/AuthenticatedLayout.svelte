<script lang="ts">
	import type { Snippet } from 'svelte';

	interface User {
		id: string;
		email: string;
		name: string;
	}

	interface Props {
		user: User;
		children: Snippet;
	}

	let { user, children }: Props = $props();
</script>

<div class="min-h-screen bg-base-200 flex flex-col">
	<!-- Navbar -->
	<div class="navbar bg-base-100 shadow-md">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Parkora</a>
		</div>
		<div class="flex-none gap-2">
			<a href="/" class="btn btn-ghost btn-sm">Home</a>
			<a href="/reservations" class="btn btn-ghost btn-sm">My Reservations</a>
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
					{user.name || user.email}
				</div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
				>
					<li>
						<a href="/auth/logout" data-sveltekit-reload>Sign out</a>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Main content -->
	<main class="container mx-auto px-4 py-8 flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="footer footer-center p-4 bg-base-100 text-base-content border-t">
		<div>
			<p>Parkora - RSO Project 2025</p>
		</div>
	</footer>
</div>
