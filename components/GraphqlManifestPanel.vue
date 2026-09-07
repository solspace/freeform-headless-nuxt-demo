<script setup lang="ts">
import { ref } from "vue";
import type { FreeformManifest } from "@solspace/freeform-core";
import { FormLoader } from "@solspace/freeform-vue";
import {
  craftGraphql,
  HEADLESS_MANIFEST_QUERY,
} from "../utils/graphql";

const props = withDefaults(
  defineProps<{
    handle: string;
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  },
);

const emit = defineEmits<{
  loaded: [manifest: FreeformManifest];
}>();

const loading = ref(false);
const error = ref<string | null>(null);
const manifest = ref<FreeformManifest | null>(null);

async function loadManifest() {
  loading.value = true;
  error.value = null;

  try {
    const data = await craftGraphql<{
      freeformHeadlessManifest: FreeformManifest;
    }>(HEADLESS_MANIFEST_QUERY, { handle: props.handle });
    manifest.value = data.freeformHeadlessManifest;
    emit("loaded", data.freeformHeadlessManifest);
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : "Failed to load GraphQL manifest.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="{ 'panel panel--stage': !embedded }">
    <h2 v-if="!embedded" class="panel-title">Form preview</h2>

    <p>
      Raw <code>freeformHeadlessManifest</code> query (same shape as REST
      manifest <code>data</code>).
    </p>
    <div class="controls">
      <button
        type="button"
        :disabled="loading || !handle"
        @click="loadManifest"
      >
        {{ loading ? "Loading…" : "Fetch GraphQL manifest" }}
      </button>
    </div>

    <div v-if="error" class="status is-error">{{ error }}</div>

    <div v-if="loading" style="margin-top: 1rem">
      <FormLoader
        :message="`Fetching ${handle} via GraphQL…`"
        variant="spinner"
      />
    </div>

    <pre v-if="manifest" style="margin-top: 1rem">{{
      JSON.stringify(manifest, null, 2)
    }}</pre>
  </div>
</template>
