import { useEffect, useMemo, useState, type ReactElement } from 'react';

function getCandidateUrls(): string[] {
  const frontend = (import.meta as any).env.VITE_CATALOG_FRONTEND_URL || '/copilot-catalog.json';
  const gh = (import.meta as any).env.VITE_CATALOG_GITHUB_URL || '';
  const gl = (import.meta as any).env.VITE_CATALOG_GITLAB_URL || '';
  const urls = [frontend];
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
    (async () => {
      for (const url of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await probeUrl(url);
        if (ok) {
          if (!cancelled) setResolvedUrl(url);
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
