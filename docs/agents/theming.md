# Theming

Rules for UI color and styling in this app. The full hex table and region map live in **[assets/css/tailwind.css](../../assets/css/tailwind.css)** (THEME MAP comment at the top).

## Source of truth

- Define semantic colors only in `assets/css/tailwind.css` (`@theme` tokens and THEME MAP).
- Do **not** add hex colors in Vue or TypeScript. Image CDNs and other external assets stay in `constants/`.
- Use semantic Tailwind utilities (`bg-surface-page`, `text-fg-muted`, …) in templates and in Nuxt UI slot classes.

## App shell (dark-only)

The app runs in dark mode only (`colorMode.preference: 'dark'` in `nuxt.config.ts`). Do not reintroduce `dark:` prefixes or light body backgrounds without an explicit product decision.

| Area | Utility |
|------|---------|
| Page background | `bg-surface-page`, `text-fg-default` on `body` via `app.vue` |
| Sidebar / mobile nav | `bg-surface-overlay`, `shadow-surface-overlay` (same token as overlay panels) |
| Discover filters (`USelect` / `USelectMenu` / `UInputMenu`) | Triggers + dropdowns: **[constants/discoverFilterUi.ts](../../constants/discoverFilterUi.ts)** → **`app.config.ts`** (`discover-filter-control`, `discoverMenuSlots`, …). Menus use Portal — keep theme global, not `UTheme`-only. |
| Nav links | `nav-item`, `nav-item-icon`, `nav-item-label`; active `nav-item-active` (desktop accent tint) |
| Main content width | `min-w-0 max-w-full flex-grow` on `main` (fills the row beside the sidebar), mobile `max-sm:pb-14` |
| Mobile nav position | `nav-sticky-mobile` on `NavBar` |

See THEME MAP in `tailwind.css` for the complete list (elevated surfaces, borders, poster placeholder, overlays, etc.).

## Nuxt UI

- **App-wide** component overrides belong in **[app.config.ts](../../app.config.ts)** (`button`, `input`, `avatar`, …) using semantic classes (`bg-surface-inset`, `border-border-default`, …).
- **Page-scoped** overrides: use **`UTheme`** when a subtree needs different defaults — but **not** for Discover filters: menus **Portal** to `body`, so the full filter theme (trigger + menu slots) lives in **`app.config.ts`** via **[constants/discoverFilterUi.ts](../../constants/discoverFilterUi.ts)**.
- Nuxt UI merges theme → `app.config` / `UTheme` → component `class` → component `:ui` (see [theme/components](https://ui.nuxt.com/docs/getting-started/theme/components)). Prefer one layer per concern; do not repeat the same utility (e.g. radius) in both `UTheme` and `class`.
- Do **not** put `discover-filter-control` on global `input` in `app.config.ts` — it breaks the shell search field borders.
- User-selectable accent colors use Nuxt UI `primary` palette names (`emerald`, `mandy`, …) defined in `tailwind.css`.

### Discover filters

- **Config:** `discoverSelectTriggerSlots` + `discoverMenuSlots` (and `discoverInputMenuTriggerSlots` for actor search) merged in `app.config.ts`.
- **Triggers:** `discover-filter-control` on `USelect` / `USelectMenu` **base** and `UInputMenu` **root**; inner field is `discover-filter-input` on `UInputMenu` **base** (the real `<input>`).
- **Variant `none`:** avoids Nuxt `outline` rings; fills/borders come from the utilities (`!bg-default`, `border-border-default`, …).
- **8px radius:** `rounded-[8px]` on the shared `filterTrigger` string in `discoverFilterUi.ts` (theme default is `rounded-md`).
- **Actor search placeholder:** theme sets `placeholder:text-dimmed` on the input **base** slot — override with page `:ui="castActorInputUi"` (highest priority for that field only).
- **`inputMenu.slots.placeholder`:** not used for typed placeholders; use the `placeholder` prop + **base** slot classes instead.

## User accent color

- **[composables/useComputedStyle.ts](../../composables/useComputedStyle.ts)** sets `config.ui.colors.primary`. Nuxt UI rewrites `--ui-primary` / `--color-primary` from that name.
- `--color-accent` in `tailwind.css` aliases `--color-primary`, so nav, Hero, and the loading indicator follow the same token as `text-primary` and `bg-primary`.
- `--color-rating` aliases saffron-500 for the hero rating star. It does not follow the user accent.
- Do not duplicate palette hex in composables or stores, and do not keep a second accent path (localStorage, head script, or a color-only plugin).

## `<style>` blocks

Default: **no** component `<style>` for colors or layout that Tailwind can express.

Allowed exception: **shadow DOM / `::part()`** styling. Document new exceptions in THEME MAP. There is no current exception.

Shared layout/color utilities belong in `tailwind.css` (`@utility`), not duplicated in Vue.

## When changing colors

1. Update THEME MAP and the token in `assets/css/tailwind.css`.
2. Grep for old class names (`bg-gray-800`, raw hex, `dark:bg-*`, etc.).
3. Smoke-check shell, auth pages, profile theme picker, and home hero.
