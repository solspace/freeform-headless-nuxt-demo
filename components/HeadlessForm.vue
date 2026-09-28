<script setup lang="ts">
import { computed } from "vue";
import type { SubmitResponse } from "@solspace/freeform-core";
import {
  FormLoader,
  useFreeform,
  type FreeformVueTheme,
} from "@solspace/freeform-vue";
import { demoExtensions, useDemoConfig } from "../composables/useDemoConfig";
import { withFakerResolvedFetch } from "../utils/resolveFakerDefaults";

const demoFetch = withFakerResolvedFetch();
const { baseUrl } = useDemoConfig();

const props = withDefaults(
  defineProps<{
    handle: string;
    theme?: FreeformVueTheme;
    draftToken: string | null;
    draftKey: string | null;
    fetchImpl?: typeof fetch;
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  },
);

const emit = defineEmits<{
  submit: [response: SubmitResponse];
}>();

const form = useFreeform(() => ({
  handle: props.handle,
  baseUrl,
  fetch: props.fetchImpl ?? demoFetch,
  extensions: demoExtensions,
  draftToken: props.draftToken,
  draftKey: props.draftKey,
  onSuccess: (response) => emit("submit", response),
  onError: (response) => emit("submit", response),
}));

const loadingMessage = computed(() =>
  props.fetchImpl
    ? `Loading ${props.handle} via GraphQL…`
    : `Loading ${props.handle}…`,
);

const pages = computed(() => form.manifest?.layout.pages ?? []);
const currentPage = computed(
  () => pages.value[form.currentPageIndex] ?? pages.value[0],
);
const isFirstPage = computed(() => form.currentPageIndex === 0);
const isLastPage = computed(
  () =>
    pages.value.length === 0 ||
    form.currentPageIndex >= pages.value.length - 1,
);

const visibleHandles = computed(() =>
  (currentPage.value?.rows ?? [])
    .flatMap((row) => row.fields)
    .filter((fieldHandle) => form.isFieldVisible(fieldHandle)),
);

function onSubmit(event: Event) {
  void form.handleSubmit(event);
}
</script>

<template>
  <div v-if="form.loading" :class="{ panel: !embedded }">
    <h2 v-if="!embedded" class="panel-title">Form preview</h2>
    <FormLoader :message="loadingMessage" />
  </div>

  <div v-else-if="form.error" class="status is-error">
    {{ form.error.message }}
  </div>

  <form
    v-else-if="form.manifest"
    class="headless-form"
    :class="{ 'panel panel--stage': !embedded }"
    @submit="onSubmit"
  >
    <h2 v-if="!embedded" class="panel-title">Form preview</h2>

    <p>
      Headless mode: you own the markup. Core still loads the manifest,
      manages state, and submits
      <template v-if="fetchImpl">
        via <code>:fetch="graphqlFetch"</code>
      </template>
      .
    </p>

    <div
      v-for="message in form.formErrors"
      :key="message"
      class="status is-error"
    >
      {{ message }}
    </div>
    <div
      v-for="message in form.pageErrors"
      :key="message"
      class="status is-error"
    >
      {{ message }}
    </div>

    <template v-for="fieldHandle in visibleHandles" :key="fieldHandle">
      <label v-if="form.manifest.fields[fieldHandle]">
        <template
          v-if="
            form.manifest.fields[fieldHandle].type !== 'hidden' &&
            form.manifest.fields[fieldHandle].type !== 'html'
          "
        >
          {{ form.manifest.fields[fieldHandle].label }}
          <textarea
            v-if="form.manifest.fields[fieldHandle].type === 'textarea'"
            v-bind="form.getFieldProps(fieldHandle)"
            :value="String(form.values[fieldHandle] ?? '')"
          />
          <input
            v-else
            v-bind="form.getFieldProps(fieldHandle)"
            :type="
              form.manifest.fields[fieldHandle].type === 'email'
                ? 'email'
                : 'text'
            "
            :value="String(form.values[fieldHandle] ?? '')"
          />
          <span
            v-for="message in form.fieldErrors[fieldHandle] ?? []"
            :key="message"
            class="status is-error"
          >
            {{ message }}
          </span>
        </template>
      </label>
    </template>

    <div class="controls" style="display: flex; gap: 0.5rem">
      <button
        v-if="!isFirstPage && currentPage?.buttons?.back"
        type="button"
        :disabled="form.isSubmitting"
        @click="void form.goBack()"
      >
        {{ currentPage.buttons.back.label }}
      </button>
      <button
        v-if="!isLastPage && currentPage?.buttons?.submit"
        type="button"
        :disabled="form.isSubmitting"
        @click="void form.goNext()"
      >
        {{
          form.isSubmitting ? "Loading…" : currentPage.buttons.submit.label
        }}
      </button>
      <button
        v-if="isLastPage && currentPage?.buttons?.submit"
        type="submit"
        :disabled="form.isSubmitting"
      >
        {{
          form.isSubmitting
            ? "Submitting…"
            : currentPage.buttons.submit.label
        }}
      </button>
      <button
        v-if="currentPage?.buttons?.save"
        type="button"
        :disabled="form.isSubmitting"
        @click="void form.saveDraft()"
      >
        {{ currentPage.buttons.save.label }}
      </button>
    </div>

    <div v-if="form.isComplete && form.successMessage" class="status is-success">
      {{ form.successMessage }}
    </div>
  </form>
</template>
