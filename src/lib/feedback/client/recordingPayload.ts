/* Copyright (c) 2024-present Venky Corp. */

/**
 * Gzip a large JSON string via CompressionStream.
 *
 * The readable side **must** be consumed while writing: if nothing reads `cs.readable`
 * until after `close()`, backpressure can block `writer.write()` indefinitely (deadlock).
 */
export async function gzipJsonStringToBlob(jsonStr: string): Promise<Blob> {
  const cs = new CompressionStream('gzip');
  const blobPromise = new Response(cs.readable).blob();
  const writer = cs.writable.getWriter();
  const bytes = new TextEncoder().encode(jsonStr);
  const sliceLen = 256 * 1024;
  try {
    for (let i = 0; i < bytes.length; i += sliceLen) {
      await writer.write(bytes.subarray(i, i + sliceLen));
    }
  } finally {
    await writer.close();
  }
  return blobPromise;
}
