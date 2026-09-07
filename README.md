# Freeform Headless Nuxt Demo (`dev` branch)

**This branch develops against your local Craft Freeform checkout**, not npm.

Expected layout:

```text
craft/plugins/
  freeform/packages/frontend/   ← local @solspace/freeform-* sources
  frontend-library/
    freeform-headless-nuxt-demo/
```

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open [http://127.0.0.1:3002](http://127.0.0.1:3002).

`pnpm dev` always forces **port 3002**. If that port is already taken, Nuxt may fall back to **3000** — stop the other process and run `pnpm dev` again.

This is an **SPA** (`ssr: false`) so Freeform mounts only in the browser.

| Branch | Packages |
| --- | --- |
| `main` | Published npm packages — public demo |
| `dev` (this branch) | Sibling Freeform packages — local development |

Point `CRAFT_PROXY_TARGET` at your Craft site. See the [React demo `main` README](https://github.com/solspace/freeform-headless-react-demo/blob/main/README.md) for full Craft headless setup.
# freeform-headless-nuxt-demo
