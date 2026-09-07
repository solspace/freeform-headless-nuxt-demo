declare module "#freeform-theme-tailwind-classnames" {
  import type { FreeformVueTheme } from "@solspace/freeform-vue";

  type ClassNames = NonNullable<FreeformVueTheme["classNames"]>;
  type ClassNamesByType = NonNullable<FreeformVueTheme["classNamesByType"]>;

  export const lightClassNames: ClassNames;
  export const darkClassNames: ClassNames;
  export function lightClassNamesByType(): ClassNamesByType;
  export function darkClassNamesByType(): ClassNamesByType;
}

declare module "#freeform-theme-bootstrap-classnames" {
  import type { FreeformVueTheme } from "@solspace/freeform-vue";

  type ClassNames = NonNullable<FreeformVueTheme["classNames"]>;
  type ClassNamesByType = NonNullable<FreeformVueTheme["classNamesByType"]>;

  export const lightClassNames: ClassNames;
  export const darkClassNames: ClassNames;
  export function lightClassNamesByType(): ClassNamesByType;
  export function darkClassNamesByType(): ClassNamesByType;
}
