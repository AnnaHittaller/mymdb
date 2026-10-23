# Minimal Nuxt 3 test stack (Vitest + Playwright)

**Repo today:** Nuxt `^3.8.2`, VueFire + Firebase Auth/Firestore, no tests, no ESLint, no CI. Watchlist writes live in `composables/useFirestore.ts` (`addMovie` / `removeMovie`); register/login are email+password in `pages/register.vue` / `pages/login.vue` plus Google popup (out of e2e).

**Do not add:** Jest, ESLint, `@vue/test-utils`, `happy-dom`/`jsdom`, `@vitest/browser-playwright`. Those are for component/Nuxt-runtime or Vitest-browser tests, not this split.

## Packages

```
npm i -D vitest @nuxt/test-utils @playwright/test
```

Optional local: `firebase-tools` (Auth + Firestore emulators). Scripts: `"test": "vitest run"`, `"test:e2e": "playwright test"`. Config: `vitest.config.ts` with a **node** project `test/unit/**/*.spec.ts` (plain Vitest; skip `environment: 'nuxt'`). Playwright: `playwright.config.ts` using `defineConfig<ConfigOptions>` from `@playwright/test` + `ConfigOptions` / `expect,test` from `@nuxt/test-utils/playwright` ([Nuxt 3 testing](https://nuxt.com/docs/3.x/getting-started/testing)). Chromium only.

## Unit: fake adapter, no live Firebase

Extract a small `UserMoviesRepo` (`list` / `add` / `remove`) from `useFirestore.ts`. Production adapter wraps Firestore; tests inject an in-memory Map. Unit tests never import `firebase/firestore`.

```ts
// test/unit/userMovies.spec.ts
import { describe, expect, it } from 'vitest'
import { createUserMoviesService } from '~/lib/userMovies'
import { createMemoryUserMoviesRepo } from '~/lib/userMovies.memory'

it('adds a movie to a user watchlist', async () => {
  const svc = createUserMoviesService(createMemoryUserMoviesRepo())
  await svc.add('u1', { id: 'm1', title: 'Dune' })
  expect(await svc.list('u1')).toEqual([expect.objectContaining({ id: 'm1' })])
})
```

## Playwright: email/password + watchlist (not Google)

Needs Auth+Firestore **emulators** (`connectAuthEmulator` / `connectFirestoreEmulator` in the client plugin). Unique email per run. Skip Google buttons (`signInWithPopup`).

```ts
// test/e2e/auth-watchlist.spec.ts
import { expect, test } from '@nuxt/test-utils/playwright'

test('register, login, add to watchlist', async ({ page, goto }) => {
  const email = `e2e-${Date.now()}@example.com`
  await goto('/register', { waitUntil: 'hydration' })
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Username').fill('e2e')
  await page.getByPlaceholder('Password').fill('password12')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await expect(page).toHaveURL('/')
  await goto('/login', { waitUntil: 'hydration' })
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Password').fill('password12')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await goto('/movie/550', { waitUntil: 'hydration' }) // any known TMDB id
  await page.getByRole('button', { name: 'Add to my movies' }).click()
  await expect(page.getByRole('button', { name: 'Remove from watchlist' })).toBeVisible()
})
```

## GitHub Actions on PRs vs local-only

**PRs:** `npm ci` + `npm test` only (Vitest/node). No Playwright browsers, no Firebase secrets, no emulator JVM. First CI file can be that one job on `pull_request`.

**Local-only:** `npx playwright install chromium` + `firebase emulators:exec --only auth,firestore -- npm run test:e2e`. Keep e2e off PRs until emulator wiring exists and `NUXT_API_*` / Firebase test config are not production.

**Later (not smallest):** add a second CI job with `npx playwright install --with-deps` + emulators; still never Google popup e2e.
