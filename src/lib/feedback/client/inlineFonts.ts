'use client';
/* Copyright (c) 2024-present Venky Corp. */

/**
 * Post-processes rrweb recording events to inline @font-face URLs as base64 data URIs.
 * This ensures session replays work cross-origin (e.g. feedback portal on a different host).
 *
 * Walks FullSnapshot (type 2) and IncrementalSnapshot (type 3) events looking for
 * nodes with `_cssText` containing @font-face rules with url() references, fetches
 * the font files, and replaces the URLs with data URIs.
 */

const FONT_URL_RE = /url\(["']?(https?:\/\/[^"')]+\.(?:woff2?|otf|ttf|eot))["']?\)/g;

/** Per-font fetch budget so submit never hangs indefinitely on a slow or stuck origin */
const FONT_FETCH_TIMEOUT_MS = 12_000;

/** Fetch a font file and return as a data URI, or the original URL on failure */
async function fontToDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url, { mode: 'cors', signal: AbortSignal.timeout(FONT_FETCH_TIMEOUT_MS) });
    if (!res.ok) return url;
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/** Replace all font URLs in a CSS string with data URIs */
async function inlineFontUrls(css: string): Promise<string> {
  const matches = [...css.matchAll(FONT_URL_RE)];
  if (matches.length === 0) return css;

  // Deduplicate URLs
  const uniqueUrls = [...new Set(matches.map((m) => m[1]))];

  // Fetch all fonts in parallel
  const urlMap = new Map<string, string>();
  await Promise.all(
    uniqueUrls.map(async (url) => {
      const dataUri = await fontToDataUri(url);
      urlMap.set(url, dataUri);
    }),
  );

  // Replace URLs in CSS
  return css.replace(FONT_URL_RE, (_match, url: string) => {
    const dataUri = urlMap.get(url);
    return dataUri && dataUri !== url ? `url("${dataUri}")` : _match;
  });
}

const FONT_EXT_RE = /\.(?:woff2?|otf|ttf|eot)$/i;

/** Walk an rrweb serialized node tree and inline fonts / strip font preloads */
async function walkNode(node: Record<string, unknown>): Promise<void> {
  const attrs = node.attributes as Record<string, unknown> | undefined;
  if (attrs && typeof attrs._cssText === 'string' && attrs._cssText.includes('@font-face')) {
    attrs._cssText = await inlineFontUrls(attrs._cssText);
  }

  const children = node.childNodes as Record<string, unknown>[] | undefined;
  if (children) {
    // Remove <link rel="preload"> for font files — fonts are already inlined
    // in @font-face data URIs, so preloads just cause CORS errors on cross-origin replay
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.tagName === 'link') {
        const childAttrs = child.attributes as Record<string, unknown> | undefined;
        const rel = String(childAttrs?.rel ?? '');
        const href = String(childAttrs?.href ?? '');
        if (rel === 'preload' && FONT_EXT_RE.test(href)) {
          children.splice(i, 1);
          continue;
        }
      }
      // Inline fonts in style tag textContent
      if (typeof child.textContent === 'string' && child.textContent.includes('@font-face')) {
        child.textContent = await inlineFontUrls(child.textContent);
      }
      await walkNode(child);
    }
  }
}

/**
 * Inline all @font-face URLs in rrweb events as base64 data URIs.
 * Modifies events in place. Only processes FullSnapshot (type 2) events.
 */
export async function inlineFontsInEvents(events: unknown[]): Promise<void> {
  for (const event of events) {
    const e = event as Record<string, unknown>;
    // Type 2 = FullSnapshot
    if (e.type === 2) {
      const data = e.data as Record<string, unknown> | undefined;
      const node = data?.node as Record<string, unknown> | undefined;
      if (node) {
        await walkNode(node);
      }
    }
  }
}
