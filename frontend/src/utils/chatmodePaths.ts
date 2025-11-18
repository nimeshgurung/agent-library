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

  return `${baseUrl}artifacts/${trimmed.replace(/^\/+/, '')}`;
}
