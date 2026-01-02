<script lang="ts">
	import { marked, Renderer } from 'marked';
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
	const GITHUB_BLOB_BASE = 'https://github.com/sample-unwind/docs/blob/main';

	// Custom renderer to handle links
	const renderer = new Renderer();
	renderer.link = ({ href, title, text }) => {
		// Handle internal .md links - make them clickable to switch docs
		if (href && href.endsWith('.md') && !href.startsWith('http')) {
			const docFile = docFiles.find((d) => d.filename === href);
			if (docFile) {
				// Internal doc link - use data attribute for JS handling
				return `<a href="#" data-doc="${docFile.name}" class="internal-doc-link" title="${title || ''}">${text}</a>`;
			}
		}

		// Handle internal .puml diagram links - link to GitHub blob view
		if (href && href.endsWith('.puml') && !href.startsWith('http')) {
			const githubUrl = `${GITHUB_BLOB_BASE}/${href}`;
			return `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
		}

		// External links - open in new tab
		if (href && href.startsWith('http')) {
			return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
		}

		// Fallback
		return `<a href="${href}" title="${title || ''}">${text}</a>`;
	};

	marked.use({ renderer });

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

	function handleDocClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('internal-doc-link')) {
			event.preventDefault();
			const docName = target.getAttribute('data-doc');
			if (docName) {
				const doc = docFiles.find((d) => d.name === docName);
				if (doc) {
					loadDocument(doc);
				}
			}
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
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<article
								class="prose prose-sm md:prose-base max-w-none"
								onclick={handleDocClick}
							>
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
	/* Custom styles for rendered markdown - using plain CSS for Tailwind v4 compatibility */
	:global(.prose h1) {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}
	:global(.prose h2) {
		font-size: 1.25rem;
		line-height: 1.75rem;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid var(--fallback-bc, oklch(var(--bc) / 0.2));
		padding-bottom: 0.5rem;
	}
	:global(.prose h3) {
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}
	:global(.prose table) {
		width: 100%;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	:global(.prose th) {
		background-color: var(--fallback-b2, oklch(var(--b2)));
		padding: 0.5rem 0.75rem;
		text-align: left;
		font-weight: 600;
	}
	:global(.prose td) {
		border-top: 1px solid var(--fallback-bc, oklch(var(--bc) / 0.2));
		padding: 0.5rem 0.75rem;
	}
	:global(.prose code) {
		background-color: var(--fallback-b2, oklch(var(--b2)));
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	:global(.prose pre) {
		background-color: var(--fallback-b3, oklch(var(--b3)));
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}
	:global(.prose img) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		max-width: 100%;
	}
	:global(.prose a) {
		color: var(--fallback-p, oklch(var(--p)));
	}
	:global(.prose a:hover) {
		text-decoration: underline;
	}
	:global(.prose blockquote) {
		border-left: 4px solid var(--fallback-wa, oklch(var(--wa)));
		padding-left: 1rem;
		font-style: italic;
		margin-top: 1rem;
		margin-bottom: 1rem;
		background-color: var(--fallback-wa, oklch(var(--wa) / 0.1));
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}
</style>
