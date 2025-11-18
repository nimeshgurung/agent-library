import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';

interface SearchBarProps {
  readonly query: string;
  readonly totalResults: number;
  readonly onQueryChange: (value: string) => void;
  readonly onClear: () => void;
}

export function SearchBar({
  query,
  totalResults,
  onQueryChange,
  onClear,
}: SearchBarProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleGlobalShortcut = (event: globalThis.KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;

      if (isModifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (!isModifier && event.key === '/') {
        const isInputFocused = document.activeElement === inputRef.current;

        if (isInputFocused) {
          return;
        }

        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcut);

    return () => {
      window.removeEventListener('keydown', handleGlobalShortcut);
    };
  }, []);

  return (
    <section className="search-bar" role="search" aria-label="Artifact search">
      <div className="search-bar__input-row">
        <input
          id="artifact-search"
          ref={inputRef}
          type="search"
          placeholder="Search by title, tag, or description (⌘K / Ctrl+K)"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
          }}
          aria-describedby="search-results-count"
        />
        <button
          type="button"
          onClick={onClear}
          disabled={query.length === 0}
          className="search-bar__clear"
        >
          Clear
        </button>
      </div>
      <p id="search-results-count" className="search-bar__results" aria-live="polite">
        {totalResults} matching result{totalResults === 1 ? '' : 's'}
      </p>
    </section>
  );
}
