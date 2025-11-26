import { useMemo, type ReactElement } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface EditorPreviewProps {
  readonly filename: string;
  readonly content: string | null;
  readonly isLoading?: boolean;
  readonly error?: Error | null;
  readonly onRetry?: () => void;
  readonly isMarkdown?: boolean;
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
  'span',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class'];

export function EditorPreview({
  filename,
  content,
  isLoading = false,
  error = null,
  onRetry,
  isMarkdown = true,
}: EditorPreviewProps): ReactElement {
  const lines = useMemo(() => {
    if (!content) return [];
    return content.split('\n');
  }, [content]);

  const renderedMarkdown = useMemo(() => {
    if (!content || !isMarkdown) return null;
    const result = marked.parse(content, { async: false });
    const html = typeof result === 'string' ? result : '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      RETURN_TRUSTED_TYPE: false,
    });
  }, [content, isMarkdown]);

  const getFileIcon = (name: string): string => {
    if (name.endsWith('.md')) return '📄';
    if (name.endsWith('.json')) return '📋';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return '🔷';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return '🟨';
    if (name.includes('agent')) return '🤖';
    if (name.includes('prompt')) return '💬';
    return '📝';
  };

  const getLanguage = (name: string): string => {
    if (name.endsWith('.md')) return 'Markdown';
    if (name.endsWith('.json')) return 'JSON';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'TypeScript';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'JavaScript';
    if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'YAML';
    return 'Plain Text';
  };

  return (
    <div className="editor-preview">
      {/* Window Chrome */}
      <div className="editor-chrome">
        <div className="editor-chrome__title">
          <span className="editor-chrome__icon">{getFileIcon(filename)}</span>
          {filename}
        </div>
      </div>

      {/* Editor Body */}
      <div className="editor-body">
        {isLoading ? (
          <div className="editor-body__status">
            <div className="editor-body__spinner" />
            <p>Loading content…</p>
          </div>
        ) : error ? (
          <div className="editor-body__status editor-body__status--error">
            <p>Failed to load: {error.message}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="editor-body__retry">
                Retry
              </button>
            )}
          </div>
        ) : content ? (
          <div className="editor-content">
            {isMarkdown && renderedMarkdown ? (
              <div
                className="editor-content__markdown"
                dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
              />
            ) : (
              <pre className="editor-content__raw">
                <code>{content}</code>
              </pre>
            )}
          </div>
        ) : (
          <div className="editor-body__status">
            <p>No content available</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="editor-statusbar">
        <div className="editor-statusbar__left">
          <span className="editor-statusbar__item">
            {getFileIcon(filename)} {getLanguage(filename)}
          </span>
        </div>
        <div className="editor-statusbar__right">
          <span className="editor-statusbar__item">UTF-8</span>
          <span className="editor-statusbar__item">LF</span>
          <span className="editor-statusbar__item">{lines.length} lines</span>
        </div>
      </div>
    </div>
  );
}
