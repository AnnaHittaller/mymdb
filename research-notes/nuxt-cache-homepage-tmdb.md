# Homepage TMDB cache without Pinia

**Question:** Production-lean way to keep homepage TMDB lists across *client navigations* without refetch, without Pinia. Not VueFire user docs.

**Today:** Home catalog is only weekly trending. `Hero.vue` calls `useTrendingMoviesStore()` (`stores/trendingMoviesStore.ts`) which `useFetch`es `/api/movies/trending` (`server/api/movies/trending.get.js`, no Nitro cache) and writes `{ movies, timestamp }` to `localStorage` for 24h. Fetch runs on store init *and* `onMounted`. Other Pinia stores are commented-out leftovers; `pages/index.vue` “My movies” is VueFire (`useUserData`) — leave it alone.

Nuxt is `^3.8.2` (`nuxt.config.ts`); `getCachedData` exists. Default `useAsyncData`/`useFetch` hydrates from payload then **refetches on later client navigations**.

## Compare

| Option | Across SPA nav | Hard reload | Extra module |
| --- | --- | --- | --- |
| `useFetch` + `getCachedData` → `nuxtApp.payload.data[key]` | yes | refetch (unless Nitro caches) | no |
| Same, wrapped in a composable | same | same | no |
| Non-Pinia store (`useState` / custom) | yes if you duplicate fetch+key | same | no, but reimplements Nuxt data |

Payload `getCachedData` *is* the cache. A store on top is leftover Pinia shape. Inline-only `useFetch` in `Hero.vue` works for one list; a composable is the seam when adding popular/etc.

## Recommend

**Composable seam + `useFetch`/`useAsyncData` + payload `getCachedData`.** Not a store.

```ts
// composables/useTrendingMovies.ts (pattern for each home list)
export function useTrendingMovies() {
  return useFetch('/api/movies/trending', {
    key: 'tmdb:trending',
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key]
    },
  })
}
```

Call from `Hero.vue` (`await` in setup, drop `onMounted` fetch). Stable `key` is the cache identity: same key on `/` return hits payload, no network. SSR first paint uses payload; no `localStorage` hydration split.

## Map onto this repo

- `components/Hero.vue` — consume composable; `pending`/`data` instead of `isLoaded` / store array.
- New `composables/useTrendingMovies.ts` (and later `usePopularMovies.ts` only if home grows a list).
- `server/api/movies/trending.get.js` — keep mapping; optionally `cachedEventHandler` / `maxAge` (~1h, SWR) so *reloads* don’t hammer TMDB. Complementary, not instead of payload.
- `pages/index.vue` — no catalog fetch change; VueFire stays.
- Do **not** put `useFetch` inside Pinia again.

## TTL / invalidation

- **Client nav:** until full reload. Matches the ticket; 24h `localStorage` is more than asked and fights SSR.
- **Invalidate:** `refreshNuxtData('tmdb:trending')` (tab focus / explicit refresh). Do not default `watch: false` tricks; `getCachedData` is the documented hook.
- **Server:** Nitro `maxAge` independent of payload; TMDB “week” trending can be hours, not 24h client storage.

## Delete

- `stores/trendingMoviesStore.ts` and `localStorage` key `trendingMovies`.
- Keep `@pinia/nuxt` until you drop the module; trending is the only live store. Do not touch VueFire.

## Risks

- Payload cache is **session**, not 24h offline. If product later needs that, add Nitro cache, not Pinia+localStorage.
- Omitting `getCachedData` (or only hydrating) **reintroduces refetch** on Home ↔ movie ↔ Home (`pages/movie/[id].vue` already `useFetch`es per id — fine, different keys).
- Unique keys per list; don’t reuse `tmdb:trending` for discover/search.
- Swiper still needs data before slides; prefer awaited setup over `onMounted`.
