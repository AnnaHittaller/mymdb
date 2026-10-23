# VueFire session cookies on Netlify (SSR)

**Question:** Production-correct SSR + `getCurrentUser()` middleware, cookie security, public home vs gated movie pages on Netlify. What breaks if SSR is off? Required vs optional env/server pieces.

**Today:** `nuxt.config.ts` has `vuefire.auth: { enabled: true, sessionCookie: true }`, SSR on (`// ssr: false`). `firebase-admin`, `firebase-functions`, `@firebase/app-types` already in `package.json`. Middleware matches VueFire docs: `middleware/auth.ts` and `already-logged-in.ts` `await getCurrentUser()`. Home (`pages/index.vue`) still has `middleware: "auth"`; `pages/movie/[id].vue` and profile pages are gated. Host: Netlify (`mymdb-my-movie-watchlist.netlify.app`).

Docs: [Auth](https://vuefire.vuejs.org/nuxt/auth.html), [Getting started](https://vuefire.vuejs.org/nuxt/getting-started.html), [Env](https://vuefire.vuejs.org/nuxt/environment-variables.html). Module only registers cookie minting when **SSR + service account + `sessionCookie`**.

## Production-correct setup

Keep **SSR on**. Deploy **`nuxt build`** (Nitro Netlify functions), not `nuxt generate` (no `/api/__session`). Do not use a global auth middleware.

- Public home: drop `middleware: "auth"` from `pages/index.vue` only.
- Gated: keep named `auth` on movie/profile/etc.; keep `already-logged-in` on login/register/forgot-password.
- On login, client plugin POSTs the ID token to **`/api/__session`**. Admin SDK mints cookie **`__session`** (name is hardcoded). Server plugin decodes it so `getCurrentUser()` in middleware sees the user on the **first document request**.

Default cookie flags (override only if needed via `sessionCookie: { ... }`): `httpOnly: true`, `secure: true`, `sameSite: 'lax'`, `path: '/'`, ~5 day max. Fine for HTTPS Netlify. Do not set `sameSite: 'none'` unless cross-site.

## Required vs optional

**Required** (this shape: SSR + session cookies + `getCurrentUser` on gated pages):

- `auth.enabled` + `sessionCookie: true` (already set).
- Admin peers (already installed).
- **`GOOGLE_APPLICATION_CREDENTIALS`**: local = path to `service-account.json`; **Netlify = one-line JSON of that file** (not a path; non-GCP hosts). Must exist at **function runtime**, not only build. Gitignore the JSON.
- Firebase web config (`FIREBASE_*` already in `vuefire.config`).
- Firebase Auth enabled; VueFire also asks to enable **IAM Service Account Credentials API** and the role in Firebase cookie docs.

**Optional:** `sessionCookie` object (flags); App Check; extra `vuefire.admin`; session cookies **at all** if you turn SSR off (then they never register).

## If SSR is off (`ssr: false`)

Module **does not** add `/api/__session` or mint/decode plugins. `sessionCookie: true` is a no-op. Admin SDK unused. `getCurrentUser()` still works **on the client** after IndexedDB persistence. Middleware then runs only after auth hydrates — no false `/login` bounce from a server that never saw the user.

Cost: no server-side user; gated HTML is not permission-filtered; first paint waits on client Auth. API routes can still exist under Nitro, but the session endpoint will not.

**Worse than SPA:** SSR **on** without a service account. Server `getCurrentUser()` is `null`; `auth` middleware **redirects logged-in users to `/login` on every hard load/direct URL**. Do not keep SSR + named auth middleware without `GOOGLE_APPLICATION_CREDENTIALS`.

## Netlify

Nitro must emit SSR + the `__session` POST function. Put `GOOGLE_APPLICATION_CREDENTIALS` (JSON string) and `FIREBASE_*` in site env. `firebase-admin` is heavy; if the function fails to bundle, externalize it in Nitro — do not switch to `generate` to “fix” size.
