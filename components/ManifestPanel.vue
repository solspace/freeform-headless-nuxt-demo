<script setup lang="ts">
import { ref } from "vue";
import {
  createFreeformClient,
  type FreeformManifest,
} from "@solspace/freeform-core";
import { FormLoader } from "@solspace/freeform-vue";
import { baseUrl, demoExtensions } from "../composables/useDemoConfig";

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

const client = createFreeformClient({ baseUrl });
for (const extension of demoExtensions) {
  client.extensions.register(extension);
}

async function loadManifest() {
  loading.value = true;
  error.value = null;

  try {
    const data = await client.loadManifest({ handle: props.handle });
    manifest.value = data;
    emit("loaded", data);
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : "Failed to load manifest.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="{ 'panel panel--stage': !embedded }">
    <h2 v-if="!embedded" class="panel-title">Form preview</h2>

    <div class="controls">
      <button
        type="button"
        :disabled="loading || !handle"
        @click="loadManifest"
      >
        {{ loading ? "Loading…" : "Fetch manifest" }}
      </button>
    </div>

    <div v-if="error" class="status is-error">{{ error }}</div>

    <div v-if="loading" style="margin-top: 1rem">
      <FormLoader
        :message="`Fetching ${handle} manifest…`"
        variant="spinner"
      />
    </div>

    <pre v-if="manifest" style="margin-top: 1rem">{{
      JSON.stringify(manifest, null, 2)
    }}</pre>
  </div>
</template>
