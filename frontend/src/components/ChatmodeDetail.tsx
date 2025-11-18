import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useCallback, useEffect, useMemo, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

import type { ArtifactEntry } from '../types/artifact';

interface ChatmodeDetailProps {
  readonly chatmode: ArtifactEntry | null;
  readonly content: string | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly onRetry: () => void;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly resolvedPath: string | null;
}

const ALLOWED_TAGS = [
  'a',
  'blockquote',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel'];

export function ChatmodeDetail({
  chatmode,
  content,
  isLoading,
  error,
  onRetry,
  isOpen,
  onClose,
}: ChatmodeDetailProps): ReactElement | null {
  const getVSCodeInstallUrl = useCallback(() => {
    if (!chatmode) {
      return '#';
    }

    // Convert to GitLab raw URL
    const gitlabRawUrl = `https://gitlab.com/ai8994945/chatmode/-/raw/main/${chatmode.paths.content}`;
    const encodedUrl = encodeURIComponent(gitlabRawUrl);

    return `https://vscode.dev/redirect?url=vscode%3Achat-mode%2Finstall%3Furl%3D${encodedUrl}`;
  }, [chatmode]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const renderedContent = useMemo(() => {
    if (!content) {
      return '<p>Chatmode content available on demand.</p>';
    }
    const result = marked.parse(content, { async: false });
    const html = typeof result === 'string' ? result : '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      RETURN_TRUSTED_TYPE: false,
    });
  }, [content]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="chatmode-modal" role="presentation" onClick={onClose}>
      <div className="chatmode-modal__backdrop" />
      <div
        className="chatmode-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatmode-detail-title"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="chatmode-detail__header">
          <div>
            <h2 id="chatmode-detail-title">{chatmode?.name ?? 'Chatmode'}</h2>
            <p>{chatmode?.description ?? ''}</p>
          </div>
          <button
            type="button"
            className="chatmode-detail__close"
            onClick={onClose}
            aria-label="Close chatmode details"
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <section className="chatmode-detail__status" aria-live="polite">
            <p>Loading chatmode content…</p>
          </section>
        ) : error ? (
          <section className="chatmode-detail__status" aria-live="polite">
            <p role="alert">Failed to load chatmode content: {error.message}</p>
            <button type="button" onClick={onRetry} className="chatmode-detail__retry">
              Retry
            </button>
          </section>
        ) : (
          <div className="chatmode-detail__content" aria-label="Chatmode instructions">
            <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          </div>
        )}

        <div
          className="chatmode-detail__actions"
          role="group"
          aria-label="Chatmode installation options"
        >
          <a
            className="chatmode-detail__button chatmode-detail__button--link chatmode-detail__button--vscode"
            href={getVSCodeInstallUrl()}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.shields.io/badge/Install-VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode"
              alt="Install in VS Code"
            />
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
