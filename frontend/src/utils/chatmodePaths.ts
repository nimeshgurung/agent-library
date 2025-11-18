export function resolveChatmodeAssetPath(input: string): string {
  const trimmed = input.trim();
  const baseUrl = import.meta.env.BASE_URL;

  if (trimmed === '') {
    return `${baseUrl}artifacts`;
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    // If it's already an absolute path, prepend base URL
    return `${baseUrl}${trimmed.replace(/^\/+/, '')}`;
  }

  // If the path already starts with "artifacts/", don't double-prefix
  if (trimmed.startsWith('artifacts/')) {
    return `${baseUrl}${trimmed}`;
  }

  return `${baseUrl}artifacts/${trimmed.replace(/^\/+/, '')}`;
}
