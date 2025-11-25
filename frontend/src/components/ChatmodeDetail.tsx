import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

import type { ArtifactEntry } from '../types/artifact';
import { buildInstallDeepLink } from '../utils/vscodeDeepLink';
import { resolveChatmodeAssetPath } from '../utils/chatmodePaths';
import { EditorPreview } from './EditorPreview';
import { FileTree } from './FileTree';

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

function cleanContent(raw: string): string {
  // Just clean BOM and normalize, preserve frontmatter for transparency
  return raw.replace(/^\uFEFF/u, '').trim();
}

function getMainFilename(chatmode: ArtifactEntry): string {
  const contentPath = chatmode.paths.content;
  const parts = contentPath.split('/');
  return parts[parts.length - 1] || 'README.md';
}

export function ChatmodeDetail({
  chatmode,
  content,
  isLoading,
  error,
  onRetry,
  isOpen,
  onClose,
}: ChatmodeDetailProps): ReactElement | null {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<Error | null>(null);

  const getVSCodeInstallUrl = useCallback(() => {
    if (!chatmode) {
      return '#';
    }
    return buildInstallDeepLink(chatmode);
  }, [chatmode]);

  // Build file list from supportingFiles + main content file
  const fileList = useMemo(() => {
    if (!chatmode) return [];

    const mainFile = getMainFilename(chatmode);
    const files = [mainFile];

    if (chatmode.supportingFiles && chatmode.supportingFiles.length > 0) {
      // Get the artifact base path (e.g., "agents/spec-kit")
      const slugParts = chatmode.slug.split('/');
      const artifactFolder = slugParts[slugParts.length - 1]; // e.g., "spec-kit"

      // Filter out metadata.json and get relative paths from artifact root
      const supportingFilesFiltered = chatmode.supportingFiles
        .filter((f) => !f.endsWith('metadata.json'))
        .map((f) => {
          // Find the artifact folder in the path and get everything after it
          const parts = f.split('/');
          const artifactIdx = parts.indexOf(artifactFolder);
          if (artifactIdx !== -1 && artifactIdx < parts.length - 1) {
            return parts.slice(artifactIdx + 1).join('/');
          }
          return parts[parts.length - 1];
        });
      files.push(...supportingFilesFiltered);
    }

    return files;
  }, [chatmode]);

  // Reset selected file when chatmode changes
  useEffect(() => {
    if (chatmode && isOpen) {
      const mainFile = getMainFilename(chatmode);
      setSelectedFile(mainFile);
      setFileContent(null);
      setFileError(null);
    }
  }, [chatmode, isOpen]);

  // Load file content when selected file changes
  useEffect(() => {
    if (!chatmode || !selectedFile || !isOpen) return;

    const mainFile = getMainFilename(chatmode);

    // If it's the main file, use the content prop
    if (selectedFile === mainFile) {
      setFileContent(content ? cleanContent(content) : null);
      setFileLoading(isLoading);
      setFileError(error);
      return;
    }

    // Otherwise, fetch the supporting file
    let cancelled = false;

    const loadFile = async (): Promise<void> => {
      setFileLoading(true);
      setFileError(null);

      try {
        // Build path to supporting file
        const basePath = chatmode.paths.content.split('/').slice(0, -1).join('/');

        // Normalize the path - the catalog generator adds .github/ prefix for agents/prompts
        // to indicate where they'll be installed, but source files are at resources/agents/
        // Keep .specify/ paths as-is since those directories actually exist
        const normalizedFile = selectedFile
          .replace(/^resources\/\.github\//, 'resources/');

        const filePath = `${basePath}/${normalizedFile}`;
        const resolvedPath = resolveChatmodeAssetPath(filePath);

        const response = await fetch(resolvedPath, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        if (!cancelled) {
          const processedContent = cleanContent(text);
          setFileContent(processedContent || 'File is empty.');
          setFileLoading(false);
        }
      } catch (thrown) {
        if (!cancelled) {
          const err =
            thrown instanceof Error ? thrown : new Error('Failed to load file content.');
          setFileError(err);
          setFileLoading(false);
        }
      }
    };

    void loadFile();

    return () => {
      cancelled = true;
    };
  }, [chatmode, selectedFile, isOpen, content, isLoading, error]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

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

  const handleFileSelect = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  const handleRetry = useCallback(() => {
    const mainFile = chatmode ? getMainFilename(chatmode) : null;
    if (selectedFile === mainFile) {
      onRetry();
    } else {
      // Re-trigger loading by resetting state
      setFileContent(null);
      setFileError(null);
      // Force re-fetch by updating selectedFile
      const current = selectedFile;
      setSelectedFile(null);
      setTimeout(() => setSelectedFile(current), 0);
    }
  }, [chatmode, selectedFile, onRetry]);

  if (!isOpen) {
    return null;
  }

  const currentFilename = selectedFile || getMainFilename(chatmode!);
  const isMarkdown = currentFilename.endsWith('.md');

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
        <div className="ide-layout">
          {/* Header */}
          <header className="ide-layout__header">
            <div className="ide-layout__header-info">
              <h2 id="chatmode-detail-title" className="ide-layout__title">
                {chatmode?.name ?? 'Artifact'}
              </h2>
              <p className="ide-layout__description">{chatmode?.description ?? ''}</p>
            </div>
            <button
              type="button"
              className="ide-layout__close"
              onClick={onClose}
              aria-label="Close details"
            >
              ×
            </button>
          </header>

          {/* Body: File Tree + Editor */}
          <div className="ide-layout__body">
            <FileTree
              rootName={chatmode?.slug ?? 'artifact'}
              files={fileList}
              selectedFile={selectedFile}
              onSelectFile={handleFileSelect}
              artifactType={chatmode?.type}
            />

            <EditorPreview
              filename={currentFilename}
              content={fileContent}
              isLoading={fileLoading}
              error={fileError}
              onRetry={handleRetry}
              isMarkdown={isMarkdown}
            />
          </div>

          {/* Footer */}
          <footer className="ide-layout__footer">
            <span className="ide-layout__footer-info">
              Requires VS Code + Agent Hub extension
            </span>
            <div className="ide-layout__footer-actions">
              <a
                href={getVSCodeInstallUrl()}
                className="ide-layout__vscode-btn"
                aria-label="Install in VS Code"
              >
                <img
                  src="https://img.shields.io/badge/Install-VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode"
                  alt="Install in VS Code"
                />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  );
}
