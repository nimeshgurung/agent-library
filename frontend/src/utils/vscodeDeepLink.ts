import type { ArtifactEntry } from '../types/artifact';

// Extension ID format: publisher.extension-id
const EXTENSION_ID = 'nimsbhai.agent-hub';

// Build catalog URL relative to the hosted site base path
const CATALOG_URL = new URL(
  'copilot-catalog.json',
  `${window.location.origin}${import.meta.env.BASE_URL}`,
).toString();

export interface DeepLinkParams {
  artifactType: string;
  artifactId: string;
  catalogRepoUrl?: string;
  catalogPath?: string;
  variant?: string;
  source?: string;
  returnUrl?: string;
}

/**
 * Build a vscode:// deep link to install an artifact via the Agent Hub extension
 */
export function buildInstallDeepLink(artifact: ArtifactEntry): string {
  const params: DeepLinkParams = {
    artifactType: artifact.type,
    artifactId: artifact.id,
    catalogRepoUrl: CATALOG_URL,
    catalogPath: 'copilot-catalog.json',
    source: 'agent-library-web',
  };

  // Build query string
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
  ).toString();

  // vscode://publisher.extension-id/installArtifact?...
  return `vscode://${EXTENSION_ID}/installArtifact?${query}`;
}

/**
 * Build a deep link to the Agent Hub extension marketplace page
 */
export function buildExtensionMarketplaceLink(): string {
  return `vscode:extension/${EXTENSION_ID}`;
}
