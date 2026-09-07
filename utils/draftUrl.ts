export type DraftCredentials = {
  draftToken: string | null;
  draftKey: string | null;
};

export function readDraftFromUrl(): DraftCredentials {
  const params = new URLSearchParams(window.location.search);
  return {
    draftToken: params.get("session-token"),
    draftKey: params.get("key"),
  };
}

export function writeDraftToUrl(token: string, key: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("session-token", token);
  url.searchParams.set("key", key);
  const href = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", href);
  return url.toString();
}

export function clearDraftFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("session-token");
  url.searchParams.delete("key");
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}
