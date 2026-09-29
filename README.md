# Freeform Headless Nuxt Demo

Example **Nuxt 3** app that renders [Solspace Freeform](https://docs.solspace.com/craft/freeform/) forms with `@solspace/freeform-vue` — same features as the [Vue](https://github.com/solspace/freeform-headless-vue-demo) and [React](https://github.com/solspace/freeform-headless-react-demo) demos.

| Feature | Supported |
| --- | --- |
| `<Freeform />` component mode | Yes |
| `useFreeform()` headless mode | Yes |
| Manifest JSON (REST + GraphQL) | Yes |
| REST / GraphQL transport toggle | Yes |
| Default / Tailwind / Bootstrap themes | Yes |
| Light / Dark / System color scheme | Yes |
| Save & Continue Later (draft URL) | Yes |
| Stage Preview / Code (copy-paste starters) | Yes |

Official packages:

| Package | Role |
| --- | --- |
| [`@solspace/freeform-core`](https://www.npmjs.com/package/@solspace/freeform-core) | Manifest, state, submit |
| [`@solspace/freeform-vue`](https://www.npmjs.com/package/@solspace/freeform-vue) | `<Freeform />` and `useFreeform()` |
| [`@solspace/freeform-extensions`](https://www.npmjs.com/package/@solspace/freeform-extensions) | Captchas, calculation, datetime, file drag & drop, table, signature |
| [`@solspace/freeform-theme-default`](https://www.npmjs.com/package/@solspace/freeform-theme-default) | Default light / dark theme |
| [`@solspace/freeform-theme-tailwind`](https://www.npmjs.com/package/@solspace/freeform-theme-tailwind) | Official Tailwind starter |
| [`@solspace/freeform-theme-bootstrap`](https://www.npmjs.com/package/@solspace/freeform-theme-bootstrap) | Official Bootstrap 5 starter |

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open [http://127.0.0.1:3002](http://127.0.0.1:3002).

Uses published `@solspace/freeform-*` packages from npm (`^1.0.0`).

This is an **SPA** (`ssr: false`) — Freeform mounts in the browser only (same idea as Next.js Client Components).

**No React.** Theme package main entries currently depend on `@solspace/freeform-react`, so this demo never imports those entries. It loads `dist/classNames.js` only (via Nuxt aliases) and builds Vue themes with `createTheme()` from `@solspace/freeform-vue`.

## Configure Craft

Requires a Craft site with Freeform headless enabled. Nuxt proxies `/freeform` and `/actions` to `CRAFT_PROXY_TARGET`.

See the [React demo README](https://github.com/solspace/freeform-headless-react-demo/blob/main/README.md) for full Craft setup steps, or [Headless → Nuxt](https://docs.solspace.com/craft/freeform/v5/headless/nuxt/).

Edit `.env`:

```bash
CRAFT_PROXY_TARGET=https://your-site.example
NUXT_PUBLIC_FREEFORM_HANDLE=contact
```

| Variable | Purpose |
| --- | --- |
| `CRAFT_PROXY_TARGET` | Your Craft / Freeform site URL |
| `NUXT_PUBLIC_FREEFORM_HANDLE` | Default form handle |
| `NUXT_PORT` | Dev server port (default `3002`) |
| `NUXT_PUBLIC_GRAPHQL_TOKEN` | Optional — unlocks the GraphQL tab |

## Docs

- [Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/)
- [Vue.js](https://docs.solspace.com/craft/freeform/v5/headless/vuejs/)
- [Nuxt](https://docs.solspace.com/craft/freeform/v5/headless/nuxt/)
