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
| Sidebar / mobile nav | `bg-surface-sidebar`, `shadow-surface-sidebar` |
| Nav links | `nav-item`, `nav-item-icon`, `nav-item-label`; active `nav-item-active` (desktop accent tint) |
| Main content width | `min-w-0 max-w-full flex-grow` on `main` (fills the row beside the sidebar), mobile `max-sm:pb-14` |
| Mobile nav position | `nav-sticky-mobile` on `NavBar` |

See THEME MAP in `tailwind.css` for the complete list (elevated surfaces, borders, poster placeholder, overlays, etc.).

## Nuxt UI

- Shared component color overrides belong in **[app.config.ts](../../app.config.ts)** using semantic classes (`bg-surface-inset`, `border-border-default`, …).
- Avoid page-level `:ui` color strings unless the override is truly one-off and not reusable.
- User-selectable accent colors use Nuxt UI `primary` palette names (`emerald`, `mandy`, …) defined in `tailwind.css`.

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
