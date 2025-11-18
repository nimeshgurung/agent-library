import { useEffect, useMemo, useState } from 'react';

import { chatmodeIndexSchema, type ChatmodeEntry } from '../types/chatmode';

export interface TagFacet {
  readonly tag: string;
  readonly count: number;
}

interface UseChatmodesDataResult {
  readonly chatmodes: ReadonlyArray<ChatmodeEntry>;
  readonly tagIndex: ReadonlyArray<TagFacet>;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refresh: () => void;
}

async function fetchChatmodeIndex(): Promise<ReadonlyArray<ChatmodeEntry>> {
  const cacheBuster = `?v=${Date.now().toString()}`;
  const response = await fetch(`/chatmodes/index.json${cacheBuster}`, {
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to load chatmode index: ${response.status.toString()} ${response.statusText}`,
    );
  }
  const raw: unknown = await response.json();
  const parsed = chatmodeIndexSchema.parse(raw);
  return parsed.chatmodes;
}

export function useChatmodesData(): UseChatmodesDataResult {
  const [chatmodes, setChatmodes] = useState<ReadonlyArray<ChatmodeEntry>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchChatmodeIndex();
        if (!cancelled) {
          setChatmodes(data);
          setLoading(false);
        }
      } catch (thrown: unknown) {
        if (!cancelled) {
          const err =
            thrown instanceof Error ? thrown : new Error('Unknown error while loading chatmodes.');
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
    for (const chatmode of chatmodes) {
      for (const tag of chatmode.tags) {
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
  }, [chatmodes]);

  const refresh = (): void => {
    setReloadKey((value) => value + 1);
  };

  return { chatmodes, tagIndex, loading, error, refresh };
}
