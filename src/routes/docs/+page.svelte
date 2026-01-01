<script lang="ts">
	interface DocLink {
		name: string;
		url: string;
		description?: string;
	}

	interface Service {
		name: string;
		description: string;
		type: 'rest' | 'graphql' | 'grpc' | 'events';
		docs: DocLink[];
	}

	const services: Service[] = [
		{
			name: 'User Service',
			description: 'User profile management via GraphQL. Supports CRUD operations for user accounts.',
			type: 'graphql',
			docs: [
				{
					name: 'GraphQL Playground',
					url: 'https://parkora.crn.si/api/v1/user/graphql',
					description: 'Interactive GraphQL IDE'
				},
				{
					name: 'Swagger UI',
					url: 'https://parkora.crn.si/api/v1/user/docs',
					description: 'REST endpoints documentation'
				},
				{
					name: 'ReDoc',
					url: 'https://parkora.crn.si/api/v1/user/redoc',
					description: 'Alternative API documentation'
				},
				{
					name: 'OpenAPI JSON',
					url: 'https://parkora.crn.si/api/v1/user/openapi.json',
					description: 'OpenAPI specification'
				}
			]
		},
		{
			name: 'Parking Service',
			description:
				'Parking analytics and real-time availability data for Ljubljana parking locations.',
			type: 'rest',
			docs: [
				{
					name: 'Swagger UI',
					url: 'https://parkora.crn.si/api/v1/parking/swagger/',
					description: 'Interactive API documentation'
				},
				{
					name: 'OpenAPI YAML',
					url: 'https://parkora.crn.si/api/v1/parking/swagger/openapi.yaml',
					description: 'OpenAPI specification'
				}
			]
		},
		{
			name: 'Reservation Service',
			description:
				'Parking reservation management via GraphQL. Supports creating, updating, and canceling reservations.',
			type: 'graphql',
			docs: [
				{
					name: 'GraphQL Playground',
					url: 'https://parkora.crn.si/api/v1/reservation/graphql',
					description: 'Interactive GraphQL IDE'
				},
				{
					name: 'Swagger UI',
					url: 'https://parkora.crn.si/api/v1/reservation/docs',
					description: 'REST endpoints documentation'
				},
				{
					name: 'OpenAPI JSON',
					url: 'https://parkora.crn.si/api/v1/reservation/openapi.json',
					description: 'OpenAPI specification'
				}
			]
		},
		{
			name: 'Payment Service',
			description:
				'Payment processing via gRPC. Handles payments, refunds, and payment status queries.',
			type: 'grpc',
			docs: [
				{
					name: 'gRPC Web UI',
					url: 'https://parkora.crn.si/grpcui/payment/',
					description: 'Interactive gRPC documentation and testing'
				},
				{
					name: 'Swagger UI',
					url: 'https://parkora.crn.si/api/v1/payment/docs',
					description: 'REST endpoints documentation'
				},
				{
					name: 'Proto File',
					url: 'https://parkora.crn.si/api/v1/payment/proto/payment.proto',
					description: 'gRPC service definition'
				}
			]
		},
		{
			name: 'Notification Service',
			description:
				'RabbitMQ consumer that sends push notifications via ntfy.sh when payments are processed.',
			type: 'events',
			docs: [
				{
					name: 'Swagger UI',
					url: 'https://parkora.crn.si/api/v1/notification/docs',
					description: 'REST endpoints documentation'
				},
				{
					name: 'Event Schema',
					url: 'https://parkora.crn.si/api/v1/notification/events/schema',
					description: 'RabbitMQ event JSON schemas'
				}
			]
		}
	];

	function getTypeBadgeClass(type: Service['type']): string {
		switch (type) {
			case 'graphql':
				return 'badge-primary';
			case 'grpc':
				return 'badge-secondary';
			case 'events':
				return 'badge-accent';
			default:
				return 'badge-neutral';
		}
	}
</script>

<svelte:head>
	<title>API Documentation - Parkora</title>
	<meta name="description" content="Central hub for all Parkora microservice API documentation" />
</svelte:head>

<div class="min-h-screen bg-base-200">
	<!-- Header -->
	<div class="navbar bg-base-100 shadow-md">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost text-xl">Parkora</a>
		</div>
		<div class="flex-none">
			<a href="/" class="btn btn-ghost btn-sm">Back to App</a>
		</div>
	</div>

	<!-- Main content -->
	<main class="container mx-auto px-4 py-8 max-w-5xl">
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">API Documentation</h1>
			<p class="text-base-content/70 text-lg">
				Central hub for all Parkora microservice API documentation
			</p>
		</div>

		<!-- Service cards -->
		<div class="grid gap-6">
			{#each services as service}
				<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
					<div class="card-body">
						<div class="flex items-center gap-3 flex-wrap">
							<h2 class="card-title text-xl">{service.name}</h2>
							<span class="badge {getTypeBadgeClass(service.type)}">
								{service.type.toUpperCase()}
							</span>
						</div>
						<p class="text-base-content/70 mt-1">{service.description}</p>
						<div class="flex flex-wrap gap-2 mt-4">
							{#each service.docs as doc}
								<a
									href={doc.url}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-sm btn-outline"
									title={doc.description}
								>
									{doc.name}
								</a>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Additional info sections -->
		<div class="grid md:grid-cols-2 gap-6 mt-8">
			<!-- gRPC info -->
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h3 class="card-title text-lg">
						<span class="badge badge-secondary">gRPC</span>
						Command Line Access
					</h3>
					<p class="text-sm text-base-content/70 mb-3">
						Use grpcurl to interact with gRPC services from the command line:
					</p>
					<div class="mockup-code text-xs">
						<pre><code
								>grpcurl -plaintext payment-service.parkora.svc.cluster.local:50051 list</code
							></pre>
						<pre><code
								>grpcurl -plaintext payment-service.parkora.svc.cluster.local:50051 describe</code
							></pre>
					</div>
				</div>
			</div>

			<!-- ntfy.sh info -->
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h3 class="card-title text-lg">
						<span class="badge badge-accent">EVENTS</span>
						Push Notifications
					</h3>
					<p class="text-sm text-base-content/70 mb-3">
						Subscribe to real-time payment notifications via ntfy.sh:
					</p>
					<div class="flex flex-col gap-2">
						<a
							href="https://ntfy.sh/parkora-notification-service"
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-sm btn-outline"
						>
							Open ntfy.sh Web
						</a>
						<p class="text-xs text-base-content/50">
							Or add topic <code class="bg-base-300 px-1 rounded">parkora-notification-service</code
							> in the ntfy app
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- API types legend -->
		<div class="card bg-base-100 shadow-md mt-8">
			<div class="card-body">
				<h3 class="card-title text-lg">API Types</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
					<div class="flex items-center gap-2">
						<span class="badge badge-neutral">REST</span>
						<span class="text-sm text-base-content/70">HTTP/JSON APIs</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="badge badge-primary">GRAPHQL</span>
						<span class="text-sm text-base-content/70">Query language</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="badge badge-secondary">GRPC</span>
						<span class="text-sm text-base-content/70">Binary RPC protocol</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="badge badge-accent">EVENTS</span>
						<span class="text-sm text-base-content/70">Message queue consumer</span>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="footer footer-center p-4 bg-base-100 text-base-content border-t mt-8">
		<div>
			<p>Parkora API Documentation - RSO Project 2025</p>
		</div>
	</footer>
</div>
