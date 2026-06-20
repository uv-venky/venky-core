import { v7 as uuid, v4 as uuid4 } from 'uuid';

export function generateUUID(): string {
  return uuid();
}

export function generateUUIDv4(): string {
  return uuid4();
}
