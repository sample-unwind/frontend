# Parkora Frontend

SvelteKit frontend for the Parkora smart parking system.

## Tech Stack

- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Authentication**: Keycloak OIDC (OpenID Connect)
- **Runtime**: Node.js 18+

## Features

- Keycloak OIDC authentication with PKCE and user registration
- User registration with automatic profile synchronization to user-service
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
│   ├── _internal/
│   │   ├── user-proxy/+server.ts    # GraphQL proxy for user-service
│   │   ├── parking-proxy/+server.ts # GraphQL proxy for parking-service
│   │   └── reservation-proxy/+server.ts # GraphQL proxy for reservation-service
│   ├── auth/
│   │   ├── login/+server.ts    # Initiates OIDC flow
│   │   ├── callback/+server.ts # Handles OIDC callback
│   │   └── logout/+server.ts   # Handles logout
│   ├── login/+page.svelte      # Login page UI
│   ├── register/
│   │   ├── +page.svelte        # Registration page UI
│   │   └── +server.ts          # Initiates secure registration flow
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
- **Registration**: Enabled via Keycloak's built-in registration endpoint
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
8. Server creates/updates user record in user-service via GraphQL
9. Tokens stored in secure HTTP-only cookies
10. User redirected to home page (`/`)

### Registration Flow

1. User visits `/register` page and clicks "Register with Keycloak"
2. Form submits to `/register` server endpoint
3. Server generates state and PKCE parameters, stores them securely in HTTP-only cookies
4. Server redirects to Keycloak authorization endpoint with `prompt=create` and security parameters
5. Keycloak displays registration form (instead of login form) due to `prompt=create`
6. User completes registration in Keycloak's built-in registration form
7. After successful registration, Keycloak redirects to `/auth/callback` with authorization code
8. Callback handler processes the authorization code (state validation adapted for Keycloak's behavior)
9. Callback exchanges authorization code for tokens using available security methods
10. Callback creates user record in user-service if it doesn't exist
11. User is redirected to home page with authenticated session

### Logout Flow

1. User visits `/auth/logout`
2. Server clears all auth cookies
3. User redirected to Keycloak logout endpoint
4. After logout, redirected back to home page

### User Service Integration

The frontend integrates with the `user-service` microservice to maintain user profiles:

- **Automatic Profile Creation**: User records are automatically created in the user-service database after successful authentication
- **GraphQL API**: Uses GraphQL mutations to create and query user data
- **Data Synchronization**: User information (email, name, Keycloak ID) is synchronized between Keycloak and the user-service
- **Proxy Pattern**: API calls to user-service are handled through `/_internal/user-proxy/` endpoint

### Security Considerations

**Login Flow (Full Security):**
- State parameter validation for CSRF protection
- PKCE (Proof Key for Code Exchange) for authorization code injection protection
- HTTP-only, secure cookies for state/code verifier storage
- TLS encryption for all OAuth communications

**Registration Flow (Adapted Security):**
- State parameter validation bypassed (Keycloak does not preserve state in registration flows)
- PKCE attempted but may fallback to basic OAuth flow
- HTTP-only, secure cookies for code verifier storage when available
- TLS encryption maintained
- User creation occurs post-authentication with proper validation

The registration flow adapts to Keycloak's implementation while maintaining core security principles and proper user management.

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
