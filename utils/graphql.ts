/** Craft GraphQL client for Freeform headless adapters. */

import { resolveCraftBaseUrl, resolveGraphqlUrl } from "./craftUrl";

export type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function craftGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = useRuntimeConfig();
  const graphqlPath =
    String(config.public.graphqlPath || "").trim() ||
    "/actions/graphql/api";
  const graphqlToken = String(config.public.graphqlToken || "").trim();
  const baseUrl = resolveCraftBaseUrl(
    String(config.public.freeformBaseUrl || ""),
  );
  const url = resolveGraphqlUrl(baseUrl, graphqlPath);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (graphqlToken) {
    headers.Authorization = `Bearer ${graphqlToken}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (!response.ok) {
    throw new Error(
      payload.errors?.[0]?.message ??
        `GraphQL HTTP ${response.status}: ${response.statusText}`,
    );
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("GraphQL response missing data.");
  }

  return payload.data;
}

export const HEADLESS_MANIFEST_QUERY = `
  query FreeformHeadlessManifest($handle: String!) {
    freeformHeadlessManifest(handle: $handle)
  }
`;

export const HEADLESS_SUBMIT_MUTATION = `
  mutation FreeformHeadlessSubmit(
    $handle: String!
    $intent: String
    $values: FreeformJson
    $meta: FreeformJson
    $context: FreeformJson
    $csrfToken: String
  ) {
    freeformHeadlessSubmit(
      handle: $handle
      intent: $intent
      values: $values
      meta: $meta
      context: $context
      csrfToken: $csrfToken
    )
  }
`;
