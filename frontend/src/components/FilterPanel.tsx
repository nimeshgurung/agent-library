import type { ReactElement } from 'react';
import { useState, useMemo } from 'react';

import type { TagFacet, TypeFacet } from '../hooks/useArtifactsData';
import type { ArtifactType } from '../types/artifact';

interface FilterPanelProps {
  readonly tags: ReadonlyArray<TagFacet>;
  readonly types: ReadonlyArray<TypeFacet>;
  readonly selectedTag: string | null;
  readonly selectedType: ArtifactType | null;
  readonly onSelectTag: (tag: string | null) => void;
  readonly onSelectType: (type: ArtifactType | null) => void;
}

const INITIAL_TAGS_SHOWN = 5;

export function FilterPanel({
  tags,
  types,
  selectedTag,
  selectedType,
  onSelectTag,
  onSelectType,
}: FilterPanelProps): ReactElement {
  const [showAllTags, setShowAllTags] = useState(false);

  const totalCount = types.reduce((sum, facet) => sum + facet.count, 0);

  const visibleTags = useMemo(() => {
    if (showAllTags) {
      return tags;
    }
    // Always show selected tag if it exists
    if (selectedTag) {
      const selectedIndex = tags.findIndex((t) => t.tag === selectedTag);
      const selectedTagFacet = tags[selectedIndex];
      if (selectedIndex >= INITIAL_TAGS_SHOWN && selectedTagFacet) {
        const result = [...tags.slice(0, INITIAL_TAGS_SHOWN - 1)];
        result.push(selectedTagFacet);
        return result;
      }
    }
    return tags.slice(0, INITIAL_TAGS_SHOWN);
  }, [tags, showAllTags, selectedTag]);

  const hiddenCount = tags.length - INITIAL_TAGS_SHOWN;
  const hasMoreTags = hiddenCount > 0;

  return (
    <div className="filter-panel">
      {/* Primary: Type filters */}
      <nav className="filter-panel__types" aria-label="Category navigation">
        <button
          type="button"
          role="tab"
          aria-selected={selectedType === null}
          className={`filter-panel__type-btn ${selectedType === null ? 'filter-panel__type-btn--active' : ''}`}
          onClick={() => {
            onSelectType(null);
          }}
        >
          <span className="filter-panel__type-label">All</span>
          <span className="filter-panel__type-count">{totalCount}</span>
        </button>

        {types.map((facet) => (
          <button
            key={facet.type}
            type="button"
            role="tab"
            aria-selected={selectedType === facet.type}
            className={`filter-panel__type-btn ${selectedType === facet.type ? 'filter-panel__type-btn--active' : ''}`}
            onClick={() => {
              onSelectType(facet.type);
            }}
          >
            <span className="filter-panel__type-label">{facet.label}</span>
            <span className="filter-panel__type-count">{facet.count}</span>
          </button>
        ))}
      </nav>

      {/* Secondary: Tag filters */}
      {tags.length > 0 && (
        <div className="filter-panel__tags">
          <span className="filter-panel__tags-label">Tags:</span>
          <div className="filter-panel__tags-list">
            {visibleTags.map((facet) => (
              <button
                key={facet.tag}
                type="button"
                className={`filter-panel__tag ${selectedTag === facet.tag ? 'filter-panel__tag--active' : ''}`}
                onClick={() => {
                  onSelectTag(selectedTag === facet.tag ? null : facet.tag);
                }}
              >
                {facet.tag}
                <span className="filter-panel__tag-count">{facet.count}</span>
              </button>
            ))}

            {hasMoreTags && (
              <button
                type="button"
                className="filter-panel__more-btn"
                onClick={() => {
                  setShowAllTags(!showAllTags);
                }}
                aria-expanded={showAllTags}
              >
                {showAllTags ? 'Show less' : `+${hiddenCount.toString()} more`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
