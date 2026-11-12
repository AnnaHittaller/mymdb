## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Theming

Semantic colors and UI styling rules: `docs/agents/theming.md`. Authoritative tokens: `assets/css/tailwind.css` (THEME MAP).

### Nuxt

For **Nuxt v4**, use the framework documentation index for LLMs: [nuxt.com/llms.txt](https://nuxt.com/llms.txt).

### Legal page

Any privacy-related change that belongs in the legal info must update [`pages/legal.vue`](pages/legal.vue) in the same change. That includes cookies, local storage, session storage, consent, new processors, new data collected, or a change to what a trailer embed loads. Do not ship the behavior first and leave the page for later.

### Nuxt UI

Agent skill for [Nuxt UI v4](https://ui.nuxt.com): `.agents/skills/nuxt-ui/SKILL.md` (reference docs under `.agents/skills/nuxt-ui/references/`). To refresh from upstream: `npx skills add https://ui.nuxt.com` (or copy from [nuxt/ui `v4` `skills/nuxt-ui`](https://github.com/nuxt/ui/tree/v4/skills/nuxt-ui)).
