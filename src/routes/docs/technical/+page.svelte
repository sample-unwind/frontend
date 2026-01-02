<script lang="ts">
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	interface DocFile {
		name: string;
		title: string;
		filename: string;
	}

	const docFiles: DocFile[] = [
		{ name: 'README', title: 'Pregled', filename: 'README.md' },
		{ name: 'arhitektura', title: 'Arhitektura', filename: 'arhitektura.md' },
		{ name: 'namestitev', title: 'Namestitev', filename: 'namestitev.md' },
		{ name: 'vzorci', title: 'Vzorci', filename: 'vzorci.md' }
	];

	let selectedDoc = $state<DocFile>(docFiles[0]);
	let content = $state<string>('');
	let loading = $state<boolean>(true);
	let error = $state<string | null>(null);

	const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/sample-unwind/docs/main';

	async function loadDocument(doc: DocFile) {
		loading = true;
		error = null;
		selectedDoc = doc;

		try {
			const response = await fetch(`${GITHUB_RAW_BASE}/${doc.filename}`);
			if (!response.ok) {
				throw new Error(`Failed to load ${doc.filename}: ${response.statusText}`);
			}
			const markdown = await response.text();
			content = await marked(markdown);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load document';
			content = '';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDocument(docFiles[0]);
	});
</script>

<svelte:head>
	<title>Tehnična dokumentacija - Parkora</title>
	<meta name="description" content="Tehnična dokumentacija za sistem Parkora" />
</svelte:head>

<div class="min-h-screen bg-base-200">
	<!-- Header -->
	<div class="navbar bg-base-100 shadow-md">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Parkora</a>
		</div>
		<div class="flex-none gap-2">
			<a href="/docs" class="btn btn-ghost btn-sm">API Docs</a>
			<a href="/" class="btn btn-ghost btn-sm">Back to App</a>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<div class="mb-6">
			<h1 class="text-3xl font-bold mb-2">Tehnična dokumentacija</h1>
			<p class="text-base-content/70">
				Dokumentacija arhitekture, namestitve in vzorcev sistema Parkora
			</p>
		</div>

		<div class="flex flex-col lg:flex-row gap-6">
			<!-- Sidebar navigation -->
			<aside class="lg:w-64 shrink-0">
				<div class="card bg-base-100 shadow-md sticky top-4">
					<div class="card-body p-4">
						<h2 class="card-title text-lg mb-2">Dokumenti</h2>
						<ul class="menu menu-sm">
							{#each docFiles as doc}
								<li>
									<button
										class="w-full text-left"
										class:active={selectedDoc.name === doc.name}
										onclick={() => loadDocument(doc)}
									>
										{doc.title}
									</button>
								</li>
							{/each}
						</ul>
						<div class="divider my-2"></div>
						<a
							href="https://github.com/sample-unwind/docs"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-sm btn-outline"
						>
							GitHub Repo
						</a>
					</div>
				</div>
			</aside>

			<!-- Main content -->
			<main class="flex-1 min-w-0">
				<div class="card bg-base-100 shadow-md">
					<div class="card-body">
						{#if loading}
							<div class="flex justify-center items-center py-12">
								<span class="loading loading-spinner loading-lg"></span>
							</div>
						{:else if error}
							<div class="alert alert-error">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="stroke-current shrink-0 h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>{error}</span>
							</div>
						{:else}
							<article class="prose prose-sm md:prose-base max-w-none">
								{@html content}
							</article>
						{/if}
					</div>
				</div>
			</main>
		</div>
	</div>

	<!-- Footer -->
	<footer class="footer footer-center p-4 bg-base-100 text-base-content border-t mt-8">
		<div>
			<p>Parkora Tehnična Dokumentacija - RSO Project 2025</p>
		</div>
	</footer>
</div>

<style>
	/* Custom styles for rendered markdown */
	:global(.prose h1) {
		@apply text-2xl font-bold mt-6 mb-4;
	}
	:global(.prose h2) {
		@apply text-xl font-bold mt-6 mb-3 border-b pb-2;
	}
	:global(.prose h3) {
		@apply text-lg font-semibold mt-4 mb-2;
	}
	:global(.prose table) {
		@apply w-full my-4;
	}
	:global(.prose th) {
		@apply bg-base-200 px-3 py-2 text-left font-semibold;
	}
	:global(.prose td) {
		@apply border-t px-3 py-2;
	}
	:global(.prose code) {
		@apply bg-base-200 px-1.5 py-0.5 rounded text-sm;
	}
	:global(.prose pre) {
		@apply bg-base-300 p-4 rounded-lg overflow-x-auto my-4;
	}
	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}
	:global(.prose img) {
		@apply my-4 max-w-full;
	}
	:global(.prose a) {
		@apply text-primary hover:underline;
	}
	:global(.prose blockquote) {
		@apply border-l-4 border-warning pl-4 italic my-4 bg-warning/10 py-2;
	}
</style>
