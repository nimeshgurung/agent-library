import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import type { ArtifactEntry, ArtifactType } from '../types/artifact';
import { buildInstallDeepLink } from '../utils/vscodeDeepLink';

interface ChatmodeCardProps {
  readonly chatmode: ArtifactEntry;
  readonly isActive: boolean;
  readonly onFocus: () => void;
  readonly onClick?: () => void;
}

function getArtifactTypeBadge(type: ArtifactType): { label: string; className: string } {
  switch (type) {
    case 'agent':
      return { label: 'Agent', className: 'artifact-type-badge--agent' };
    case 'prompt':
      return { label: 'Prompt', className: 'artifact-type-badge--prompt' };
    case 'instructions':
      return { label: 'Instructions', className: 'artifact-type-badge--instructions' };
    case 'task':
      return { label: 'Task', className: 'artifact-type-badge--task' };
    case 'chatmode':
    default:
      return { label: 'Chatmode', className: 'artifact-type-badge--chatmode' };
  }
}

export const ChatmodeCard = forwardRef<HTMLDivElement, ChatmodeCardProps>(function ChatmodeCard(
  { chatmode, isActive, onFocus, onClick }: ChatmodeCardProps,
  ref,
): ReactElement {
  const className = isActive ? 'chatmode-card chatmode-card--active' : 'chatmode-card';

  const typeInfo = getArtifactTypeBadge(chatmode.type);
  const installUrl = buildInstallDeepLink(chatmode);

  return (
    <article
      ref={ref}
      className={className}
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      aria-haspopup="dialog"
      onFocus={onFocus}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      aria-label={`${chatmode.name} chatmode card`}
    >
      <header className="chatmode-card__header">
        <div className="chatmode-card__header-main">
          <h3>{chatmode.name}</h3>
          <span
            className={`artifact-type-badge ${typeInfo.className}`}
            aria-label={`Artifact type: ${typeInfo.label}`}
          >
            {typeInfo.label}
          </span>
        </div>
      </header>

      <p className="chatmode-card__description">{chatmode.description}</p>

      <ul className="chatmode-card__tags" aria-label="Tags">
        {chatmode.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>

      <footer className="chatmode-card__footer">
        <div className="chatmode-card__footer-info">
          <time dateTime={chatmode.updatedAt} className="chatmode-card__timestamp">
            Updated{' '}
            {new Date(chatmode.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
        <a
          href={installUrl}
          className="chatmode-card__install-button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label="Install in VS Code"
        >
          <img
            src="https://img.shields.io/badge/Install-VS%20Code-007ACC?logo=visualstudiocode"
            alt="Install in VS Code"
          />
        </a>
      </footer>
    </article>
  );
});
