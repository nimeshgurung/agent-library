export function resolveChatmodeAssetPath(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    return '/artifacts';
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/artifacts/${trimmed.replace(/^\/+/, '')}`;
}
