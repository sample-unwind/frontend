# Parkora Frontend

SvelteKit frontend for the Parkora smart parking system.

## Tech Stack

- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Authentication**: Keycloak OIDC (OpenID Connect)
- **Runtime**: Node.js 18+

## Features

- Keycloak OIDC authentication with PKCE
- Server-side session management via secure HTTP-only cookies
- Responsive UI with DaisyUI components

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   └── auth.ts          # OIDC client configuration
│   └── index.ts
├── routes/
│   ├── auth/
│   │   ├── login/+server.ts    # Initiates OIDC flow
│   │   ├── callback/+server.ts # Handles OIDC callback
│   │   └── logout/+server.ts   # Handles logout
│   ├── login/+page.svelte      # Login page UI
│   ├── +layout.svelte
│   ├── +layout.server.ts
│   └── +page.svelte
├── app.css                  # Tailwind + DaisyUI imports
├── app.d.ts                 # TypeScript declarations
├── app.html
└── hooks.server.ts          # Server hooks for auth state
```

## Keycloak Configuration

The frontend is configured to use Keycloak for authentication:

- **Keycloak URL**: `https://keycloak.parkora.crn.si/auth`
- **Realm**: `parkora`
- **Client**: `frontend-app` (public client)
- **Test Users**: `testuser1` / `password123`, `testuser2` / `password123`

### Required Keycloak Client Settings

In the Keycloak Admin Console, configure the `frontend-app` client:

1. **Valid redirect URIs**:
   - `http://localhost:5173/auth/callback` (development)
   - `https://parkora.crn.si/auth/callback` (production)

2. **Valid post logout redirect URIs**:
   - `http://localhost:5173` (development)
   - `https://parkora.crn.si` (production)

3. **Web origins**:
   - `http://localhost:5173` (development)
   - `https://parkora.crn.si` (production)

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with browser auto-open
npm run dev -- --open
```

### Authentication Flow

1. User visits `/login` page
2. Clicks "Sign in with Keycloak" button
3. Redirected to `/auth/login` (server endpoint)
4. Server generates PKCE code verifier and state, stores in cookies
5. User redirected to Keycloak login page
6. After successful login, Keycloak redirects to `/auth/callback`
7. Server exchanges authorization code for tokens
8. Tokens stored in secure HTTP-only cookies
9. User redirected to home page (`/`)

### Logout Flow

1. User visits `/auth/logout`
2. Server clears all auth cookies
3. User redirected to Keycloak logout endpoint
4. After logout, redirected back to home page

## Building

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

The application will be containerized and deployed to Azure AKS. See the deployment configuration in:

- `Dockerfile` - Container image definition
- `.github/workflows/docker.yml` - CI/CD pipeline
- `helm/` - Kubernetes Helm chart

## Branching Strategy

- `main`: Production branch (stable)
- `dev`: Development branch for integration
- `feature/<name>`: Feature branches from dev

All changes go through feature branches, merged to `dev`, then released to `main` via PR.
