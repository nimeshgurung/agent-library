import type { ReactElement } from 'react';
import { useRef, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

import type { TagFacet } from '../hooks/useChatmodesData';

interface FilterPanelProps {
  readonly tags: ReadonlyArray<TagFacet>;
  readonly selectedTag: string | null;
  readonly onSelectTag: (tag: string | null) => void;
}

export function FilterPanel({ tags, selectedTag, onSelectTag }: FilterPanelProps): ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const updateArrows = (): void => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateArrows);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [tags]);

  const scroll = (direction: 'left' | 'right'): void => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const totalCount = tags.reduce((sum, facet) => sum + facet.count, 0);

  return (
    <nav className="tab-panel" aria-label="Category navigation">
      {showLeftArrow && (
        <button
          type="button"
          className="tab-panel__arrow tab-panel__arrow--left"
          onClick={() => {
            scroll('left');
          }}
          aria-label="Scroll left"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="tab-panel__container"
        onScroll={updateArrows}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedTag === null}
          className={`tab-panel__tab ${selectedTag === null ? 'tab-panel__tab--active' : ''}`}
          onClick={() => {
            onSelectTag(null);
          }}
        >
          <span className="tab-panel__tab-label">All</span>
          <span className="tab-panel__tab-count">{totalCount}</span>
        </button>

        {tags.map((facet) => {
          const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
            event.preventDefault();
            event.stopPropagation();
            flushSync(() => {
              onSelectTag(facet.tag);
            });
          };

          return (
            <button
              key={facet.tag}
              type="button"
              role="tab"
              aria-selected={selectedTag === facet.tag}
              className={`tab-panel__tab ${selectedTag === facet.tag ? 'tab-panel__tab--active' : ''}`}
              onClick={handleClick}
            >
              <span className="tab-panel__tab-label">{facet.tag}</span>
              <span className="tab-panel__tab-count">{facet.count}</span>
            </button>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          type="button"
          className="tab-panel__arrow tab-panel__arrow--right"
          onClick={() => {
            scroll('right');
          }}
          aria-label="Scroll right"
        >
          ›
        </button>
      )}
    </nav>
  );
}
