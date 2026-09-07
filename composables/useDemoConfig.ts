import {
  calculationExtension,
  recommendedExtensions,
} from "@solspace/freeform-extensions";

export const demoExtensions = [...recommendedExtensions, calculationExtension];

export const baseUrl =
  typeof window !== "undefined" ? window.location.origin : "";

export function useDemoConfig() {
  const config = useRuntimeConfig();

  return {
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
