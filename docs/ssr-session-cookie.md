# SSR session cookie

Firebase Auth in the browser keeps the signed-in user in local storage. That storage is invisible to the server, so a hard refresh would render as signed out until client JavaScript starts and restores the session.

With SSR and a service account, nuxt-vuefire closes that gap using `firebase-admin`:

1. After sign-in, the browser sends the ID token to `POST /api/__session`.
2. The Admin SDK verifies that token and mints a Firebase session cookie named `__session`.
3. The cookie is `httpOnly`, `secure`, `sameSite: 'lax'`, and lasts 5 days. Page JavaScript cannot read it.
4. On the next request, the server reads `__session`, verifies it with the Admin SDK, and signs that same user into Firebase Auth for the server render. `getCurrentUser()` and `useCurrentUser()` are already set while the HTML is being built.

nuxt-vuefire only turns this on when SSR is enabled and it can initialize the Admin SDK. That happens when `GOOGLE_APPLICATION_CREDENTIALS` points at a service account, or when the emulators are running. `vuefire.auth.sessionCookie` in `nuxt.config.ts` already asks for the cookie, and the config turns the cookie off during local e2e because a `secure` cookie is not stored on `http://127.0.0.1`. Until a service account is present, the Admin SDK never starts, `/api/__session` is not registered, and `firebase-admin` sits unused.

## What you get once the service account is set

- **The first HTML matches the signed-in user.** A refresh of `/` can render "My movies" and the watchlist instead of the signed-out prompt, and `middleware/auth.ts` can allow a gated page on the server instead of sending the user to `/login` and then bouncing them back after hydration.
- **The session is not readable by scripts.** An ID token in browser storage can be taken by any script that runs on the page. `__session` cannot. Logout clears it by posting to the same endpoint with no token.
- **The server can revoke it.** The Admin SDK can check whether the session was revoked and can revoke refresh tokens for that user. A stolen browser profile stops working without waiting for the client token to expire.
