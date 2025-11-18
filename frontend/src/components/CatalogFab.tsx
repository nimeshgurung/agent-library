import { useEffect, useMemo, useState, type ReactElement } from 'react';

interface ImportMetaEnv {
  readonly VITE_CATALOG_FRONTEND_URL?: string;
  readonly VITE_CATALOG_GITHUB_URL?: string;
  readonly VITE_CATALOG_GITLAB_URL?: string;
}

function getCandidateUrls(): string[] {
  const env = import.meta.env as ImportMetaEnv;
  const frontend = env.VITE_CATALOG_FRONTEND_URL ?? '/copilot-catalog.json';
  const gh = env.VITE_CATALOG_GITHUB_URL ?? '';
  const gl = env.VITE_CATALOG_GITLAB_URL ?? '';
  const urls: string[] = [frontend];
  if (gh) urls.push(gh);
  if (gl) urls.push(gl);
  return urls;
}

async function probeUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') || contentType.includes('text/plain');
  } catch {
    return false;
  }
}

export function CatalogFab(): ReactElement | null {
  const candidates = useMemo(getCandidateUrls, []);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      for (const url of candidates) {
        const ok = await probeUrl(url);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cancelled) {
          return;
        }
        if (ok) {
          setResolvedUrl(url);
          break;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  if (!resolvedUrl) {
    return null;
  }

  return (
    <div className="catalog-fab" aria-label="Catalog quick access">
      <a
        href={resolvedUrl}
        target="_blank"
        rel="noreferrer"
        className="catalog-fab__button"
        title="View copilot-catalog.json"
      >
        View copilot-catalog.json
      </a>
    </div>
  );
}
