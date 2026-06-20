/* Copyright (c) 2024-present Venky Corp. */

/**
 * Local-embedder shim — forwards `getEmbedding` / `getEmbeddings` to the
 * venky-rs Rust service over HTTP. The file name is preserved so the ~12
 * existing call sites in core don't need to change.
 *
 * The Rust service runs the same `nomic-ai/nomic-embed-text-v1.5` model with
 * the same mean-pool + L2-normalize pipeline that the previous in-process
 * `@huggingface/transformers` path produced — vector parity is enforced by a
 * CI gate inside venky-rs (`cargo test --features parity`).
 *
 * Config:
 *   VENKY_RS_URL    HTTP base, e.g. http://127.0.0.1:8787 (sidecar dev) or
 *                   http://venky-rs.<customer>.internal:8787 (Cloud Map prod).
 *   VENKY_RS_TOKEN  Bearer token shared with venky-rs.
 *
 * Dev defaults apply only when NODE_ENV === 'development'. In any other
 * environment both env vars are required or this module throws at first use.
 */

export const EMBEDDING_DIMENSION = 768;

function getUrl(): string {
  const url = process.env.VENKY_RS_URL;
  if (url && url.length > 0) return url.replace(/\/$/, '');
  throw new Error('VENKY_RS_URL is required in non-dev environments');
}

function getToken(): string {
  const token = process.env.VENKY_RS_TOKEN;
  if (token && token.length > 0) {
    return token;
  }
  throw new Error('VENKY_RS_TOKEN is required in non-dev environments');
}

interface EmbedResponse {
  embedding: number[];
}

export async function getEmbedding(text: string): Promise<number[]> {
  const url = getUrl();
  const token = getToken();
  const response = await fetch(`${url}/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `venky-rs /embed responded ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 200)}` : ''}`,
    );
  }
  const json = (await response.json()) as EmbedResponse;
  if (!Array.isArray(json.embedding) || json.embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(`venky-rs /embed returned malformed embedding (length=${json.embedding?.length ?? 'n/a'})`);
  }
  return json.embedding;
}

/**
 * Batch convenience — fires N `/embed` requests in parallel. We deliberately
 * do NOT use a single batch endpoint: on CPU, parallel /embed beats one big
 * batch by ~3x (measured in venky-rs/bench-local). If we ever move venky-rs
 * to GPU and add /embed/batch back, this is the only place to revisit.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  return Promise.all(texts.map((t) => getEmbedding(t)));
}
