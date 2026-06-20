export function truncateString<T extends string | null | undefined>(str: T, maxLength = 40): T {
  if (str == null) return str;
  return str.length > maxLength ? (str.substring(0, maxLength) as T) : str;
}
