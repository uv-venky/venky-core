import { readFile } from 'node:fs/promises';
import mime from 'mime-types';
export function dataURLToUint8Array(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binary = Buffer.from(base64, 'base64').toString('binary');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
export async function readImageFromFS(filePath) {
  const buffer = await readFile(filePath);
  return new Uint8Array(buffer);
}
export function getPngDimensions(dataURL) {
  const base64 = dataURL.split(',')[1];
  const buf = Buffer.from(base64, 'base64');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}
export async function readImageFromFSAsBase64(filePath) {
  const buffer = await readFile(filePath);
  const mime = getMimeTypeFromPath(filePath);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}
function getMimeTypeFromPath(filePath) {
  const mimeType = mime.lookup(filePath);
  return mimeType || 'image/png';
}
//# sourceMappingURL=export-utils.js.map
