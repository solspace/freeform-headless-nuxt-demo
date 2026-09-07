<script setup lang="ts">
import { computed, ref } from "vue";
import type { FreeformManifest, SubmitResponse } from "@solspace/freeform-core";
import {
  type ColorScheme,
  type ThemeSkin,
  useDemoTheme,
} from "../composables/useDemoTheme";
import { useDemoConfig } from "../composables/useDemoConfig";
import {
  clearDraftFromUrl,
  readDraftFromUrl,
  writeDraftToUrl,
  type DraftCredentials,
} from "../utils/draftUrl";
import { graphqlFetch } from "../utils/graphqlFetch";

import "@solspace/freeform-theme-default/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@solspace/freeform-theme-bootstrap/styles.css";

type ApiMode = "rest" | "graphql";
type ViewMode = "component" | "headless" | "manifest";

const { defaultHandle, packageSource, hasGraphqlToken } = useDemoConfig();
const initialDraft = readDraftFromUrl();

const handleDraft = ref(defaultHandle);
const handle = ref(defaultHandle);
const apiMode = ref<ApiMode>("rest");
const mode = ref<ViewMode>("component");
const colorScheme = ref<ColorScheme>("system");
const themeSkin = ref<ThemeSkin>("default");
const lastSubmit = ref<SubmitResponse | null>(null);
const manifestInfo = ref<string | null>(null);
const draft = ref<DraftCredentials>(initialDraft);
const resumeUrl = ref<string | null>(
  initialDraft.draftToken && initialDraft.draftKey
    ? window.location.href
    : null,
);

const { theme, bootstrapPreviewDark } = useDemoTheme(colorScheme, themeSkin);

const transportFetch = computed(() =>
  apiMode.value === "graphql" ? graphqlFetch : undefined,
);

const componentFormKey = computed(
  () =>
    `${apiMode.value}:${handle.value}:${draft.value.draftToken ?? ""}:${draft.value.draftKey ?? ""}`,
);

const loadingMessage = computed(() =>
  transportFetch.value
    ? `Loading ${handle.value} via GraphQL…`
    : `Loading ${handle.value}…`,
);

const themeSkins = ["default", "tailwind", "bootstrap"] as const;
const colorSchemes = ["light", "dark", "system"] as const;
const viewModes: { id: ViewMode; label: string }[] = [
  { id: "component", label: "<Freeform />" },
  { id: "headless", label: "useFreeform()" },
  { id: "manifest", label: "Manifest JSON" },
];

function themeSkinLabel(skin: ThemeSkin): string {
  if (skin === "default") return "Default";
  if (skin === "tailwind") return "Tailwind";
  return "Bootstrap";
}

function colorSchemeLabel(scheme: ColorScheme): string {
  if (scheme === "light") return "Light";
  if (scheme === "dark") return "Dark";
  return "System";
}

function handleSubmitResponse(response: SubmitResponse) {
  lastSubmit.value = response;

  if (
    response.status === "draft_saved" &&
    response.draft?.token &&
    response.draft?.key
  ) {
    const { token, key } = response.draft;
    const url = writeDraftToUrl(token, key);
    draft.value =
      draft.value.draftToken === token && draft.value.draftKey === key
        ? draft.value
        : { draftToken: token, draftKey: key };
    resumeUrl.value = url;
    return;
  }

  if (response.complete && response.success) {
    clearDraftFromUrl();
    draft.value = { draftToken: null, draftKey: null };
    resumeUrl.value = null;
  }
}

function applyHandle(event: Event) {
  event.preventDefault();
  const next = handleDraft.value.trim();
  if (!next) {
    return;
  }
  handle.value = next;
  lastSubmit.value = null;
  manifestInfo.value = null;
}

function switchApiMode(next: ApiMode) {
  if (next === "graphql" && !hasGraphqlToken) {
    return;
  }
  apiMode.value = next;
  lastSubmit.value = null;
  manifestInfo.value = null;
}

function onManifestLoaded(manifest: FreeformManifest, via: "REST" | "GraphQL") {
  manifestInfo.value = `${manifest.form.handle} (${Object.keys(manifest.fields).length} fields) · ${via}`;
}
</script>

<template>
  <div class="app" :data-theme="colorScheme">
    <header class="app-header">
      <div class="header-row">
        <h1>
          Freeform Headless Nuxt Demo
          <span class="package-source">{{ packageSource }}</span>
        </h1>
        <div class="header-row__controls">
          <div class="scheme-toggle" role="group" aria-label="Form theme">
            <button
              v-for="skin in themeSkins"
              :key="skin"
              type="button"
              class="scheme-toggle__btn"
              :class="{ 'is-active': themeSkin === skin }"
              @click="themeSkin = skin"
            >
              {{ themeSkinLabel(skin) }}
            </button>
          </div>
          <div class="scheme-toggle" role="group" aria-label="Color scheme">
            <button
              v-for="scheme in colorSchemes"
              :key="scheme"
              type="button"
              class="scheme-toggle__btn"
              :class="{ 'is-active': colorScheme === scheme }"
              @click="colorScheme = scheme"
            >
              {{ colorSchemeLabel(scheme) }}
            </button>
          </div>
        </div>
      </div>
      <p class="header-lead">
        Nuxt 3 client form using
        <code>@solspace/freeform-vue</code> from npm
        (<strong>{{ packageSource }}</strong>). Choose <strong>REST</strong> or
        <strong>GraphQL</strong>, then try <code>&lt;Freeform /&gt;</code>,
        <code>useFreeform()</code>, or Manifest JSON.
      </p>
    </header>

    <div class="demo-layout">
      <aside class="demo-sidebar">
        <section class="panel panel--sidebar panel--controls">
          <h2 class="panel-title">Form settings</h2>
          <p class="panel-help">
            Use any Freeform form handle that is exposed for headless (see
            README). Default comes from
            <code>NUXT_PUBLIC_FREEFORM_HANDLE</code>.
          </p>
          <form class="handle-form" @submit="applyHandle">
            <label>
              Form handle
              <input
                v-model="handleDraft"
                placeholder="contact"
                autocomplete="off"
                spellcheck="false"
              />
            </label>
            <button type="submit">Load form</button>
          </form>
          <p class="panel-meta">
            Active handle: <code>{{ handle }}</code>
          </p>

          <div class="sidebar-divider" />

          <div class="demo-toolbar demo-toolbar--embedded">
            <div class="demo-toolbar__head">
              <h2 class="panel-title">Try the form</h2>
              <p class="panel-help demo-toolbar__lead">
                Pick how the demo talks to Craft, then choose a Vue integration
                style. Freeform mounts client-only in Nuxt.
              </p>
            </div>

            <div class="demo-toolbar__section">
              <span class="demo-toolbar__label">API transport</span>
              <div class="api-picker" role="tablist" aria-label="API mode">
                <button
                  type="button"
                  role="tab"
                  :aria-selected="apiMode === 'rest'"
                  class="api-picker__option api-picker__option--rest"
                  :class="{ 'is-active': apiMode === 'rest' }"
                  @click="switchApiMode('rest')"
                >
                  <span class="api-picker__title">REST</span>
                  <span class="api-picker__desc">
                    <code>/freeform</code> headless endpoints
                  </span>
                  <span class="api-picker__badge">Default</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="apiMode === 'graphql'"
                  class="api-picker__option api-picker__option--graphql"
                  :class="{ 'is-active': apiMode === 'graphql' }"
                  :title="
                    hasGraphqlToken
                      ? undefined
                      : 'Set NUXT_PUBLIC_GRAPHQL_TOKEN in .env to enable GraphQL'
                  "
                  :disabled="!hasGraphqlToken"
                  @click="switchApiMode('graphql')"
                >
                  <span class="api-picker__title">GraphQL</span>
                  <span class="api-picker__desc">
                    Craft <code>freeformHeadless*</code> adapters
                  </span>
                  <span
                    v-if="!hasGraphqlToken"
                    class="api-picker__badge api-picker__badge--muted"
                  >
                    Token required
                  </span>
                </button>
              </div>
            </div>

            <div class="demo-toolbar__section">
              <span class="demo-toolbar__label">Demo view</span>
              <div class="view-picker" role="tablist" aria-label="Demo view">
                <button
                  v-for="view in viewModes"
                  :key="view.id"
                  type="button"
                  role="tab"
                  :aria-selected="mode === view.id"
                  class="view-picker__tab"
                  :class="{ 'is-active': mode === view.id }"
                  @click="mode = view.id"
                >
                  {{ view.label }}
                </button>
              </div>
            </div>

            <p
              v-if="!hasGraphqlToken"
              class="demo-callout demo-callout--info"
            >
              Add <code>NUXT_PUBLIC_GRAPHQL_TOKEN</code> to <code>.env</code> to
              unlock GraphQL (Craft schema: form read + submit + site access).
            </p>
            <p
              v-else-if="apiMode === 'graphql'"
              class="demo-callout demo-callout--graphql"
            >
              GraphQL mode passes
              <code v-pre>:fetch="graphqlFetch"</code> to the Vue packages. File
              uploads still use REST multipart.
            </p>
            <p v-else class="demo-callout demo-callout--rest">
              REST mode uses the official headless API — best starting point for
              new projects.
            </p>
          </div>

          <div v-if="manifestInfo || resumeUrl" class="demo-feedback">
            <div v-if="manifestInfo" class="status">
              Loaded manifest: <strong>{{ manifestInfo }}</strong>
            </div>

            <div v-if="resumeUrl" class="status is-success">
              <strong>Resume URL</strong> (copy / refresh to restore a saved
              draft):
              <div class="resume-url">
                <code>{{ resumeUrl }}</code>
              </div>
              <p class="resume-hint">
                Query params: <code>session-token</code> + <code>key</code>
              </p>
            </div>
          </div>
        </section>
      </aside>

      <main class="demo-stage" aria-label="Form preview">
        <div
          class="panel panel--stage"
          :class="{
            'panel--bootstrap-dark':
              bootstrapPreviewDark && mode === 'component',
          }"
        >
          <h2 class="panel-title">Form preview</h2>

          <ComponentForm
            v-if="mode === 'component'"
            :key="componentFormKey"
            embedded
            :handle="handle"
            :theme="theme"
            :draft-token="draft.draftToken"
            :draft-key="draft.draftKey"
            :fetch-impl="transportFetch"
            :preview-dark="bootstrapPreviewDark"
            :loading-message="loadingMessage"
            :form-key="componentFormKey"
            @submit="handleSubmitResponse"
          />

          <HeadlessForm
            v-if="mode === 'headless'"
            :key="componentFormKey"
            embedded
            :handle="handle"
            :draft-token="draft.draftToken"
            :draft-key="draft.draftKey"
            :fetch-impl="transportFetch"
            @submit="handleSubmitResponse"
          />

          <ManifestPanel
            v-if="mode === 'manifest' && apiMode === 'rest'"
            :key="`rest:${handle}`"
            embedded
            :handle="handle"
            @loaded="(manifest) => onManifestLoaded(manifest, 'REST')"
          />

          <GraphqlManifestPanel
            v-if="mode === 'manifest' && apiMode === 'graphql'"
            :key="`gql:${handle}`"
            embedded
            :handle="handle"
            @loaded="(manifest) => onManifestLoaded(manifest, 'GraphQL')"
          />

          <div v-if="lastSubmit" class="submit-feedback">
            <div class="stage-divider" />
            <div
              class="status"
              :class="lastSubmit.success ? 'is-success' : 'is-error'"
            >
              Last submit: <code>{{ lastSubmit.status }}</code>
              <template v-if="lastSubmit.complete"> (complete)</template>
              <span
                class="transport-tag"
                :class="`transport-tag--${apiMode}`"
              >
                {{ apiMode.toUpperCase() }}
              </span>
            </div>
            <h3 class="panel-title panel-title--sub">Last submit response</h3>
            <p v-if="lastSubmit.message" class="submit-message">
              {{ lastSubmit.message }}
            </p>
            <pre class="submit-response-pre">{{
              JSON.stringify(lastSubmit, null, 2)
            }}</pre>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
