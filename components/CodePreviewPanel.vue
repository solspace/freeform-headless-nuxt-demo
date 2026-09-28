<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  buildCodeSnippet,
  displayCraftBaseUrl,
  type CodePreviewApiMode,
  type CodePreviewSnippetKind,
  type CodePreviewThemeSkin,
} from "../utils/codePreview";
import { highlightSnippet } from "../utils/highlightSnippet";

const props = defineProps<{
  handle: string;
  apiMode: CodePreviewApiMode;
  themeSkin: CodePreviewThemeSkin;
  configuredBaseUrl?: string | null;
}>();

const kind = ref<CodePreviewSnippetKind>("freeform");
const copied = ref(false);
const highlightedHtml = ref("");

const snippetBaseUrl = computed(() =>
  displayCraftBaseUrl(props.configuredBaseUrl),
);

const code = computed(() =>
  buildCodeSnippet(kind.value, {
    handle: props.handle,
    apiMode: props.apiMode,
    themeSkin: props.themeSkin,
    baseUrl: snippetBaseUrl.value,
    framework: "vue",
  }),
);

watch(
  code,
  async (next) => {
    highlightedHtml.value = await highlightSnippet(next, "vue");
  },
  { immediate: true },
);

async function copy() {
  try {
    await navigator.clipboard.writeText(code.value);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="code-preview">
    <div class="code-preview__toolbar">
      <div
        class="view-picker view-picker--compact"
        role="tablist"
        aria-label="Code snippet"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="kind === 'freeform'"
          class="view-picker__tab"
          :class="{ 'is-active': kind === 'freeform' }"
          @click="kind = 'freeform'"
        >
          &lt;Freeform /&gt;
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="kind === 'useFreeform'"
          class="view-picker__tab"
          :class="{ 'is-active': kind === 'useFreeform' }"
          @click="kind = 'useFreeform'"
        >
          useFreeform()
        </button>
      </div>
      <button type="button" class="code-preview__copy" @click="copy">
        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>
    <div
      v-if="highlightedHtml"
      class="code-preview__shiki"
      v-html="highlightedHtml"
    />
    <pre v-else class="code-preview__pre">{{ code }}</pre>
  </div>
</template>
