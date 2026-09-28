<script setup lang="ts">
import type { SubmitResponse } from "@solspace/freeform-core";
import { Freeform, type FreeformVueTheme } from "@solspace/freeform-vue";
import { demoExtensions, useDemoConfig } from "../composables/useDemoConfig";
import { withFakerResolvedFetch } from "../utils/resolveFakerDefaults";

const demoFetch = withFakerResolvedFetch();
const { baseUrl } = useDemoConfig();

const props = withDefaults(
  defineProps<{
    handle: string;
    theme: FreeformVueTheme;
    draftToken: string | null;
    draftKey: string | null;
    fetchImpl?: typeof fetch;
    previewDark?: boolean;
    loadingMessage: string;
    formKey: string;
    embedded?: boolean;
  }>(),
  {
    embedded: false,
    previewDark: false,
  },
);

const emit = defineEmits<{
  submit: [response: SubmitResponse];
}>();

function onSubmit(response: SubmitResponse) {
  emit("submit", response);
}
</script>

<template>
  <div :class="{ 'panel--bootstrap-dark': previewDark && !embedded }">
    <h2 v-if="!embedded" class="panel-title">Form preview</h2>

    <Freeform
      :key="formKey"
      :handle="handle"
      :base-url="baseUrl"
      :fetch="fetchImpl ?? demoFetch"
      :theme="theme"
      :extensions="demoExtensions"
      :draft-token="draftToken"
      :draft-key="draftKey"
      :allow-raw-html="true"
      :loading-message="loadingMessage"
      :on-success="onSubmit"
      :on-error="onSubmit"
    />
  </div>
</template>
