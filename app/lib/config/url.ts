"use client";

/**
 * Returns the configured base application URL from NEXT_PUBLIC_APP_URL
 * or falls back gracefully to window.location.origin in the browser.
 */
export function getAppUrl(path: string = ""): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;

  let baseUrl = envUrl && envUrl.trim() !== "" ? envUrl.trim() : "";

  if (!baseUrl && typeof window !== "undefined") {
    baseUrl = window.location.origin;
  }

  if (!baseUrl) {
    baseUrl = "https://alloy.nebulaz.xyz";
  }

  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  return `${cleanBase}${cleanPath}`;
}

/**
 * Generates the canonical shareable personal link for a Basename.
 * e.g. "https://alloy.nebulaz.xyz/bob.base.eth"
 */
export function getPersonalLink(basename: string): string {
  const cleanName = basename.trim();
  return getAppUrl(`/${encodeURIComponent(cleanName)}`);
}
