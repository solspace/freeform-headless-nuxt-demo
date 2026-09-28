import {
  calculationExtension,
  recommendedExtensions,
} from "@solspace/freeform-extensions";
import { resolveCraftBaseUrl } from "../utils/craftUrl";

export const demoExtensions = [...recommendedExtensions, calculationExtension];

/** Forms exposed for headless on demo.solspace.com (config/freeform.php). */
export const DEMO_FORMS = [
  { handle: "contact", label: "Contact" },
  { handle: "jobApplication", label: "Job Application" },
  { handle: "multiplePage", label: "Multiple Page" },
  { handle: "newsletter", label: "Newsletter" },
  { handle: "quote", label: "Get a Quote" },
] as const;

export const DEMO_FORM_HANDLES: ReadonlySet<string> = new Set(
  DEMO_FORMS.map((form) => form.handle),
);

export function useDemoConfig() {
  const config = useRuntimeConfig();
  const baseUrl = resolveCraftBaseUrl(
    String(config.public.freeformBaseUrl || ""),
  );

  return {
    baseUrl,
    defaultHandle:
      String(config.public.freeformHandle || "").trim() || "contact",
    packageSource:
      config.public.freeformPackages === "local" ? "local" : ("npm" as const),
    hasGraphqlToken: Boolean(
      String(config.public.graphqlToken || "").trim(),
    ),
    graphqlPath:
      String(config.public.graphqlPath || "").trim() ||
      "/actions/graphql/api",
    graphqlToken: String(config.public.graphqlToken || "").trim(),
  };
}

/** @deprecated Prefer useDemoConfig().baseUrl — kept for simple imports. */
export const baseUrl =
  typeof window !== "undefined" ? window.location.origin : "";
