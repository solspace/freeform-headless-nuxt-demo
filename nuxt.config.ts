import path from "node:path";
import { fileURLToPath } from "node:url";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";
import { loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Load `.env` before reading port — shell `PORT=3000` from other demos must not win.
const fileEnv = loadEnv("development", rootDir, "");
const craftTarget =
  fileEnv.CRAFT_PROXY_TARGET?.trim() ||
  process.env.CRAFT_PROXY_TARGET?.trim() ||
  "https://site.ddev.site";
const port = Number(
  fileEnv.NUXT_PORT || fileEnv.PORT || process.env.NUXT_PORT || 3002,
);

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
      .replace(/;?\s*Secure/gi, ""),
  );
}

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  // SPA demo — Freeform is client-only (captchas, payments, cookies).
  ssr: false,
  experimental: {
    // Avoid `#app-manifest` resolve errors with ssr:false + Vite.
    appManifest: false,
  },
  devtools: { enabled: false },
  css: ["~/assets/css/tailwind.css", "~/assets/css/styles.css"],
  runtimeConfig: {
    public: {
      freeformHandle:
        fileEnv.NUXT_PUBLIC_FREEFORM_HANDLE ||
        process.env.NUXT_PUBLIC_FREEFORM_HANDLE ||
        "contact",
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
  build: {
    transpile: [
      "@solspace/freeform-core",
      "@solspace/freeform-vue",
      "@solspace/freeform-extensions",
      "@solspace/freeform-theme-default",
      "@solspace/freeform-theme-tailwind",
      "@solspace/freeform-theme-bootstrap",
    ],
  },
  vite: {
    plugins: [vueJsx(), tailwindcss()],
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
