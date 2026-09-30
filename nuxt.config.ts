import path from "node:path";
import { fileURLToPath } from "node:url";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";
import { loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const themeClassNames = (pkg: string) =>
  path.join(
    rootDir,
    "node_modules",
    "@solspace",
    pkg,
    "dist",
    "classNames.js",
  );

// Load `.env` before reading port — shell `PORT=3000` from other demos must not win.
const fileEnv = loadEnv("development", rootDir, "");
const craftTarget =
  fileEnv.CRAFT_PROXY_TARGET?.trim() ||
  process.env.CRAFT_PROXY_TARGET?.trim() ||
  "https://site.ddev.site";
const port = Number(
  fileEnv.NUXT_PORT || fileEnv.PORT || process.env.NUXT_PORT || 3002,
);

/** Public path behind Cloudflare: demo.solspace.com/freeform-headless/nuxt/ */
const baseFromEnv = (
  fileEnv.NUXT_APP_BASE_URL ||
  process.env.NUXT_APP_BASE_URL ||
  ""
).trim();
const appBaseURL = baseFromEnv
  ? baseFromEnv.endsWith("/")
    ? baseFromEnv
    : `${baseFromEnv}/`
  : process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
    ? "/freeform-headless/nuxt/"
    : "/";

console.warn(`[freeform-nuxt-demo] baseURL: ${appBaseURL}`);

function rewriteCraftCookies(proxyRes: {
  headers: Record<string, string | string[] | undefined>;
}) {
  const cookies = proxyRes.headers["set-cookie"];
  if (!cookies) {
    return;
  }

  const list = Array.isArray(cookies) ? cookies : [cookies];
  proxyRes.headers["set-cookie"] = list.map((cookie) =>
    cookie
      .replace(/;?\s*Domain=[^;]+/gi, "")
      .replace(/;?\s*Secure/gi, "")
      // SameSite=None requires Secure; demos run on http://localhost.
      .replace(/;?\s*SameSite=None/gi, "; SameSite=Lax"),
  );
}

const classNameAliases = {
  "#freeform-theme-tailwind-classnames": themeClassNames(
    "freeform-theme-tailwind",
  ),
  "#freeform-theme-bootstrap-classnames": themeClassNames(
    "freeform-theme-bootstrap",
  ),
} as const;

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  // SPA demo — Freeform is client-only (captchas, payments, cookies).
  ssr: false,
  experimental: {
    // Avoid `#app-manifest` resolve errors with ssr:false + Vite.
    appManifest: false,
  },
  app: {
    baseURL: appBaseURL,
    head: {
      title: "Freeform Headless Nuxt Demo · Solspace",
      meta: [
        {
          name: "description",
          content:
            "Solspace Freeform headless Nuxt demo — REST & GraphQL forms with @solspace/freeform-* packages.",
        },
        { name: "theme-color", content: "#0f172a" },
      ],
      link: [
        { rel: "icon", href: `${appBaseURL}favicon.ico`.replace(/([^:]\/)\/+/g, "$1"), sizes: "any" },
        {
          rel: "icon",
          type: "image/png",
          href: `${appBaseURL}solspace-icon.png`.replace(/([^:]\/)\/+/g, "$1"),
        },
        {
          rel: "apple-touch-icon",
          href: `${appBaseURL}apple-touch-icon.png`.replace(/([^:]\/)\/+/g, "$1"),
        },
      ],
    },
  },
  devtools: { enabled: false },
  css: ["~/assets/css/tailwind.css", "~/assets/css/styles.css"],
  runtimeConfig: {
    public: {
      freeformHandle:
        fileEnv.NUXT_PUBLIC_FREEFORM_HANDLE ||
        process.env.NUXT_PUBLIC_FREEFORM_HANDLE ||
        "contact",
      freeformBaseUrl:
        fileEnv.NUXT_PUBLIC_FREEFORM_BASE_URL ||
        process.env.NUXT_PUBLIC_FREEFORM_BASE_URL ||
        "",
      freeformPackages: "npm",
      graphqlPath:
        fileEnv.NUXT_PUBLIC_GRAPHQL_PATH ||
        process.env.NUXT_PUBLIC_GRAPHQL_PATH ||
        "/actions/graphql/api",
      graphqlToken:
        fileEnv.NUXT_PUBLIC_GRAPHQL_TOKEN ||
        process.env.NUXT_PUBLIC_GRAPHQL_TOKEN ||
        "",
    },
  },
  // Class maps only — never the theme package main entry (that pulls React).
  alias: { ...classNameAliases },
  build: {
    transpile: [
      "@solspace/freeform-core",
      "@solspace/freeform-vue",
      "@solspace/freeform-extensions",
    ],
  },
  vite: {
    plugins: [vueJsx(), tailwindcss()],
    resolve: {
      alias: { ...classNameAliases },
    },
    build: {
      cssCodeSplit: true,
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (
              id.includes("node_modules/shiki") ||
              id.includes("node_modules/@shikijs")
            ) {
              return "shiki";
            }
            return undefined;
          },
        },
      },
    },
    server: {
      port,
      strictPort: true,
      proxy: {
        "/freeform": {
          target: craftTarget,
          changeOrigin: true,
          secure: false,
          configure(proxy) {
            proxy.on("proxyRes", rewriteCraftCookies);
          },
        },
        "/actions": {
          target: craftTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  nitro: {
    devProxy: {
      "/freeform": {
        target: craftTarget,
        changeOrigin: true,
        secure: false,
      },
      "/actions": {
        target: craftTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  devServer: {
    port,
    host: "127.0.0.1",
  },
});
