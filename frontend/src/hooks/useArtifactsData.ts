import { useEffect, useMemo, useState } from 'react';

import { artifactsIndexSchema, type ArtifactEntry, type ArtifactType } from '../types/artifact';

export interface TagFacet {
  readonly tag: string;
  readonly count: number;
}

export interface TypeFacet {
  readonly type: ArtifactType;
  readonly label: string;
  readonly count: number;
}

interface UseArtifactsDataResult {
  readonly artifacts: ReadonlyArray<ArtifactEntry>;
  readonly tagIndex: ReadonlyArray<TagFacet>;
  readonly typeIndex: ReadonlyArray<TypeFacet>;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refresh: () => void;
}

const TYPE_LABELS: Record<ArtifactType, string> = {
  agent: 'Agents',
  chatmode: 'Chatmodes',
  prompt: 'Prompts',
  instructions: 'Instructions',
  task: 'Tasks',
};

const TYPE_ORDER: readonly ArtifactType[] = ['agent', 'chatmode', 'prompt', 'instructions', 'task'];

async function fetchArtifactsIndex(): Promise<ReadonlyArray<ArtifactEntry>> {
  const cacheBuster = `?v=${Date.now().toString()}`;
  const baseUrl = import.meta.env.BASE_URL;
  const response = await fetch(`${baseUrl}artifacts/index.json${cacheBuster}`, {
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to load artifact index: ${response.status.toString()} ${response.statusText}`,
    );
  }
  const raw: unknown = await response.json();
  const parsed = artifactsIndexSchema.parse(raw);
  return parsed.artifacts;
}

export function useArtifactsData(): UseArtifactsDataResult {
  const [artifacts, setArtifacts] = useState<ReadonlyArray<ArtifactEntry>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchArtifactsIndex();
        if (!cancelled) {
          setArtifacts(data);
          setLoading(false);
        }
      } catch (thrown: unknown) {
        if (!cancelled) {
          const err =
            thrown instanceof Error ? thrown : new Error('Unknown error while loading artifacts.');
          setError(err);
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const tagIndex = useMemo<ReadonlyArray<TagFacet>>(() => {
    const counts = new Map<string, number>();
    for (const artifact of artifacts) {
      for (const tag of artifact.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((left, right) => {
        if (left.count === right.count) {
          return left.tag.localeCompare(right.tag);
        }
        return right.count - left.count;
      });
  }, [artifacts]);

  const typeIndex = useMemo<ReadonlyArray<TypeFacet>>(() => {
    const counts = new Map<ArtifactType, number>();
    for (const artifact of artifacts) {
      counts.set(artifact.type, (counts.get(artifact.type) ?? 0) + 1);
    }

    return TYPE_ORDER.filter((type) => counts.has(type)).map((type) => ({
      type,
      label: TYPE_LABELS[type],
      count: counts.get(type) ?? 0,
    }));
  }, [artifacts]);

  const refresh = (): void => {
    setReloadKey((value) => value + 1);
  };

  return { artifacts, tagIndex, typeIndex, loading, error, refresh };
}
