import type { KeyboardEvent, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChatmodeCard } from './components/ChatmodeCard';
import { ChatmodeDetail } from './components/ChatmodeDetail';
import { FilterPanel } from './components/FilterPanel';
import { SearchBar } from './components/SearchBar';
import { CatalogFab } from './components/CatalogFab';
import { useArtifactsData } from './hooks/useArtifactsData';
import type { ArtifactEntry, ArtifactType } from './types/artifact';
import { resolveChatmodeAssetPath } from './utils/chatmodePaths';
import { buildExtensionMarketplaceLink } from './utils/vscodeDeepLink';

function stripFrontmatter(raw: string): string {
  const trimmed = raw.replace(/^\uFEFF/u, '').trimStart();
  if (!trimmed.startsWith('---')) {
    return raw;
  }

  const match = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/u);
  if (match === null) {
    return raw;
  }

  return trimmed.slice(match[0].length).trimStart();
}

function isLikelyHtmlDocument(raw: string): boolean {
  const sample = raw.trimStart().slice(0, 256).toLowerCase();
  return (
    sample.startsWith('<!doctype html') ||
    sample.startsWith('<html') ||
    sample.includes('<head') ||
    sample.includes('<body') ||
    sample.includes('<script')
  );
}

export function App(): ReactElement {
  const { artifacts: chatmodes, tagIndex, typeIndex, loading, error, refresh } = useArtifactsData();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ArtifactType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [selectedChatmode, setSelectedChatmode] = useState<ArtifactEntry | null>(null);
  const [chatmodeContent, setChatmodeContent] = useState<string | null>(null);
  const [contentError, setContentError] = useState<Error | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentReloadKey, setContentReloadKey] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const filteredChatmodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return chatmodes.filter((chatmode) => {
      const matchesQuery = normalizedQuery
        ? chatmode.name.toLowerCase().includes(normalizedQuery) ||
          chatmode.description.toLowerCase().includes(normalizedQuery) ||
          chatmode.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        : true;

      const matchesTag = selectedTag ? chatmode.tags.includes(selectedTag) : true;
      const matchesType = selectedType ? chatmode.type === selectedType : true;

      return matchesQuery && matchesTag && matchesType;
    });
  }, [chatmodes, query, selectedTag, selectedType]);

  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setIsDetailOpen(false);
    setSelectedChatmode(null);
    setActiveIndex(-1);
  }, []);

  const handleTypeSelect = useCallback((type: ArtifactType | null) => {
    setSelectedType(type);
    setIsDetailOpen(false);
    setSelectedChatmode(null);
    setActiveIndex(-1);
  }, []);

  const registerCardRef = useCallback((index: number) => {
    return (element: HTMLDivElement | null) => {
      cardRefs.current[index] = element;
    };
  }, []);

  const focusCardAtIndex = useCallback((index: number) => {
    const element = cardRefs.current[index];
    if (element) {
      element.focus();
    }
  }, []);

  const handleResultsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!filteredChatmodes.length) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = activeIndex >= filteredChatmodes.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
        focusCardAtIndex(nextIndex);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const previousIndex = activeIndex <= 0 ? filteredChatmodes.length - 1 : activeIndex - 1;
        setActiveIndex(previousIndex);
        focusCardAtIndex(previousIndex);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(0);
        focusCardAtIndex(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        const lastIndex = filteredChatmodes.length - 1;
        setActiveIndex(lastIndex);
        focusCardAtIndex(lastIndex);
      }
    },
    [activeIndex, filteredChatmodes, focusCardAtIndex],
  );

  const handleCardFocus = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleCardClick = useCallback((chatmode: ArtifactEntry, index: number) => {
    setActiveIndex(index);
    setSelectedChatmode(chatmode);
    setIsDetailOpen(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedTag(null);
    setSelectedType(null);
    setQuery('');
    setActiveIndex(-1);
    setSelectedChatmode(null);
    setIsDetailOpen(false);
  }, []);

  useEffect(() => {
    cardRefs.current = [];
  }, [filteredChatmodes.length]);

  useEffect(() => {
    if (!filteredChatmodes.length) {
      setActiveIndex(-1);
      setSelectedChatmode(null);
      setIsDetailOpen(false);
      return;
    }

    if (!isDetailOpen) {
      setActiveIndex((current) =>
        current === -1 ? 0 : Math.min(current, filteredChatmodes.length - 1),
      );
      return;
    }

    const existingIndex = filteredChatmodes.findIndex((item) => item.id === selectedChatmode?.id);
    if (existingIndex === -1) {
      setSelectedChatmode(filteredChatmodes[0] ?? null);
      setActiveIndex(0);
      return;
    }

    setActiveIndex(existingIndex);
  }, [filteredChatmodes, isDetailOpen, selectedChatmode?.id]);

  useEffect(() => {
    if (!selectedChatmode || !isDetailOpen) {
      setChatmodeContent(null);
      setContentError(null);
      setIsContentLoading(false);
      return;
    }

    let cancelled = false;
    const loadContent = async (): Promise<void> => {
      setIsContentLoading(true);
      setContentError(null);
      try {
        const resolvedPath = resolveChatmodeAssetPath(selectedChatmode.paths.content);
        const response = await fetch(resolvedPath, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(
            `Failed to load chatmode content: ${response.status.toString()} ${response.statusText}`,
          );
        }
        const text = await response.text();
        if (!cancelled) {
          if (isLikelyHtmlDocument(text)) {
            throw new Error(
              'Received HTML instead of chatmode markdown. Ensure static assets in `frontend/public/chatmodes/` include the requested file.',
            );
          }
          const contentWithoutFrontmatter = stripFrontmatter(text).trim();
          if (contentWithoutFrontmatter === '') {
            throw new Error('Chatmode content is empty.');
          }
          setChatmodeContent(contentWithoutFrontmatter);
          setIsContentLoading(false);
        }
      } catch (thrown) {
        if (!cancelled) {
          const err =
            thrown instanceof Error
              ? thrown
              : new Error('Unknown error while loading chatmode content.');
          setContentError(err);
          setIsContentLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [selectedChatmode, isDetailOpen, contentReloadKey]);

  const handleRefreshContent = useCallback(() => {
    if (!selectedChatmode) {
      return;
    }
    setContentReloadKey((value) => value + 1);
  }, [selectedChatmode]);

  const resolvedChatmodePath = selectedChatmode
    ? resolveChatmodeAssetPath(selectedChatmode.paths.content)
    : null;

  return (
    <div id="main-content" className="app-root" role="application" aria-label="Chatmode explorer">
      <header className="app-header">
        <h1>Agent Library</h1>
        <div className="app-header__actions">
          <a
            href={buildExtensionMarketplaceLink()}
            className="chatmode-card__install-button"
            title="Install Agent Hub Extension"
          >
            <img
              src="https://img.shields.io/badge/Install-Agent%20Hub-007ACC?logo=visualstudiocode"
              alt="Install Agent Hub Extension"
            />
          </a>
          <CatalogFab />
        </div>
      </header>

      <SearchBar
        query={query}
        totalResults={filteredChatmodes.length}
        onQueryChange={setQuery}
        onClear={handleResetFilters}
      />

      <FilterPanel
        tags={tagIndex}
        types={typeIndex}
        selectedTag={selectedTag}
        selectedType={selectedType}
        onSelectTag={handleTagSelect}
        onSelectType={handleTypeSelect}
      />

      {loading ? (
        <section aria-live="polite" className="results-summary">
          <span>Loading chatmodes…</span>
        </section>
      ) : error ? (
        <section aria-live="polite" className="results-summary" role="alert">
          <span>Failed to load chatmodes: {error.message}</span>
          <button type="button" onClick={refresh} className="chatmode-detail__retry">
            Retry
          </button>
        </section>
      ) : (
        <>
          <section aria-live="polite" className="results-summary">
            {filteredChatmodes.length ? (
              <span>
                {filteredChatmodes.length} artifact{filteredChatmodes.length !== 1 ? 's' : ''} match
                your criteria.
              </span>
            ) : (
              <span role="status">
                No artifacts match your current search and filter combination.
              </span>
            )}
          </section>

          <div
            className="chatmode-list"
            role="list"
            aria-label="Filtered chatmodes"
            tabIndex={filteredChatmodes.length ? 0 : -1}
            onKeyDown={handleResultsKeyDown}
          >
            {filteredChatmodes.map((chatmode, index) => (
              <ChatmodeCard
                key={chatmode.id}
                chatmode={chatmode}
                ref={registerCardRef(index)}
                isActive={index === activeIndex}
                onFocus={() => {
                  handleCardFocus(index);
                }}
                onClick={() => {
                  handleCardClick(chatmode, index);
                }}
              />
            ))}
          </div>
        </>
      )}

      <ChatmodeDetail
        chatmode={selectedChatmode}
        content={chatmodeContent}
        isLoading={isContentLoading}
        error={contentError}
        onRetry={handleRefreshContent}
        isOpen={isDetailOpen && !!selectedChatmode}
        onClose={() => {
          setIsDetailOpen(false);
        }}
        resolvedPath={resolvedChatmodePath}
      />
    </div>
  );
}
