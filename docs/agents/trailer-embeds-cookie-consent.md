# Trailer embeds and cookie consent

## Current behavior

- **Watch trailer** opens a modal. The YouTube (`youtube-nocookie.com`) or Vimeo iframe is created only after the visitor allows the `embeddedVideo` category.
- Until then the modal shows a short disclosure, **Play trailer**, and **Not now**. Both choices are stored the same way.
- Closing the modal, or choosing **Not now**, does not load the player.
- Vimeo embed URLs include `dnt=1`. That flag and `youtube-nocookie.com` reduce tracking; they do not remove the third-party connection after consent.
- The same choice can be changed on [`/legal#cookies`](../../pages/legal.vue). Allow and block use the same buttons.
- Consent is stored with [`nuxt-simple-cookie-consent`](https://nuxt.com/modules/nuxt-simple-cookie-consent): `mymdb_consent`, plus `cookie_consent_timestamp` and `cookie_consent_version`, for 180 days. No analytics or ad scripts are registered.
- The sign-in cookie `__session` is separate and is not part of this consent choice.

## CSP

See [`nuxt.config.ts`](../../nuxt.config.ts) `routeRules` — `frame-src` allows YouTube and Vimeo embed origins, plus Google sign-in (`accounts.google.com`, `*.firebaseapp.com`); `script-src` allows Firebase Auth’s Google APIs (`apis.google.com`, `www.gstatic.com`); `img-src` includes `image.tmdb.org` and common YouTube thumbnail hosts.
