import { computed, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import {
  darkTheme,
  lightTheme,
  systemTheme,
} from "@solspace/freeform-theme-default";
import {
  bootstrapDarkTheme,
  bootstrapTheme,
} from "@solspace/freeform-theme-bootstrap";
import {
  tailwindDarkTheme,
  tailwindTheme,
} from "@solspace/freeform-theme-tailwind";
import type { FreeformVueTheme } from "@solspace/freeform-vue";

export type ColorScheme = "light" | "dark" | "system";
export type ThemeSkin = "default" | "tailwind" | "bootstrap";

/**
 * Theme packages currently export React themes. For Vue we keep classNames /
 * defaults and drop React renderer components (e.g. Bootstrap Form wrappers).
 */
function toVueTheme(theme: {
  name: string;
  classNameStrategy?: FreeformVueTheme["classNameStrategy"];
  classNames?: FreeformVueTheme["classNames"];
  classNamesByType?: FreeformVueTheme["classNamesByType"];
  defaults?: FreeformVueTheme["defaults"];
}): FreeformVueTheme {
  return {
    name: theme.name,
    framework: "vue",
    classNameStrategy: theme.classNameStrategy,
    classNames: theme.classNames,
    classNamesByType: theme.classNamesByType,
    defaults: theme.defaults,
  };
}

const defaultThemesByScheme: Record<ColorScheme, FreeformVueTheme> = {
  light: toVueTheme(lightTheme),
  dark: toVueTheme(darkTheme),
  system: toVueTheme(systemTheme),
};

export function useDemoTheme(
  colorScheme: Ref<ColorScheme>,
  themeSkin: Ref<ThemeSkin>,
) {
  const prefersDark = ref(false);
  let mediaCleanup: (() => void) | undefined;

  onMounted(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      prefersDark.value = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    mediaCleanup = () => media.removeEventListener("change", sync);
  });

  onUnmounted(() => {
    mediaCleanup?.();
  });

  watch(
    colorScheme,
    (scheme) => {
      if (scheme === "system") {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = scheme;
      }
    },
    { immediate: true },
  );

  const theme = computed((): FreeformVueTheme => {
    const useDark =
      colorScheme.value === "dark" ||
      (colorScheme.value === "system" && prefersDark.value);

    if (themeSkin.value === "tailwind") {
      return toVueTheme(useDark ? tailwindDarkTheme : tailwindTheme);
    }

    if (themeSkin.value === "bootstrap") {
      return toVueTheme(useDark ? bootstrapDarkTheme : bootstrapTheme);
    }

    return defaultThemesByScheme[colorScheme.value];
  });

  const bootstrapPreviewDark = computed(
    () =>
      themeSkin.value === "bootstrap" &&
      (colorScheme.value === "dark" ||
        (colorScheme.value === "system" && prefersDark.value)),
  );

  return { theme, bootstrapPreviewDark };
}
