'use client';
/* Copyright (c) 2024-present Venky Corp. */

/**
 * Capture a screenshot of the current viewport.
 *
 * Uses html-to-image (SVG foreignObject based) which renders all modern CSS
 * correctly including lab(), oklch(), and other color functions that
 * html2canvas cannot parse.
 */
export async function captureScreenshot(element?: HTMLElement): Promise<Blob> {
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(element ?? document.body, {
    cacheBust: true,
    pixelRatio: window.devicePixelRatio,
    filter: (el: HTMLElement) => !el.classList?.contains('feedback-block'),
  });
  if (!blob) throw new Error('Screenshot capture failed');
  return blob;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
