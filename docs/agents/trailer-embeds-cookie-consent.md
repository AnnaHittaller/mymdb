# Trailer embeds and cookie consent

## Current behavior (v1)

- **Watch trailer** opens a modal with a YouTube (`youtube-nocookie.com`) or Vimeo iframe.
- The iframe is created only when the modal opens and removed when it closes (`src` cleared).
- Trailers are metadata from the [TMDB Videos API](https://developer.themoviedb.org/reference/movie-videos); playback is always on a third-party host.

## Privacy impact

Opening the modal loads third-party content. YouTube and Vimeo may set or read cookies and use their own analytics. Using `youtube-nocookie.com` reduces some tracking compared to `youtube.com`, but it does not eliminate third-party processing when the user plays a video.

## CSP

See [`nuxt.config.ts`](../../nuxt.config.ts) `routeRules` — `frame-src` allows YouTube and Vimeo embed origins; `img-src` includes `image.tmdb.org` and common YouTube thumbnail hosts.

## Follow-up: consent strategy

When the product needs EU/GDPR alignment:

1. **Disclosure** — Short line in the trailer modal footer: “Plays via YouTube or Vimeo” with links to their privacy policies.
2. **Consent category** — If a CMP is added site-wide, classify embedded video under “functional” or “marketing” per legal advice; block `iframe` `src` until that category is accepted if required.
3. **No embed before consent** — Optional gate: modal opens with poster + Play; set `iframe` `src` only after consent (stricter than v1).
4. **Document** — Record the chosen approach in privacy policy / about page alongside existing TMDB attribution.

No CMP is required for v1 unless product or legal explicitly requires it.
