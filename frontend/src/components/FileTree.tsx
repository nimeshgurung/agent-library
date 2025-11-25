import { useMemo, useState, useCallback, type ReactElement } from 'react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  readonly rootName: string;
  readonly files: string[];
  readonly selectedFile: string | null;
  readonly onSelectFile: (path: string) => void;
  readonly artifactType?: string;
}

function buildFileTree(files: string[], rootName: string): FileNode {
  const root: FileNode = {
    name: rootName,
    path: '',
    type: 'folder',
    children: [],
  };

  for (const filePath of files) {
    const parts = filePath.split('/').filter(Boolean);
    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let child = currentNode.children?.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [],
        };
        currentNode.children = currentNode.children || [];
        currentNode.children.push(child);
      }

      if (!isLast) {
        currentNode = child;
      }
    }
  }

  // Sort: folders first, then files, alphabetically
  const sortNodes = (nodes: FileNode[] | undefined): FileNode[] | undefined => {
    if (!nodes) return undefined;
    return nodes
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }))
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  };

  root.children = sortNodes(root.children);
  return root;
}

function getFileIcon(filename: string, type: 'file' | 'folder', isOpen?: boolean): string {
  if (type === 'folder') return isOpen ? '📂' : '📁';
  if (filename === 'README.md') return '📖';
  if (filename.endsWith('.md')) return '📄';
  if (filename.endsWith('.json')) return '📋';
  if (filename.endsWith('.sh')) return '⚙️';
  if (filename.includes('.agent.')) return '🤖';
  if (filename.includes('.prompt.')) return '💬';
  if (filename.includes('.task.')) return '✅';
  if (filename.includes('.instructions.')) return '📜';
  if (filename.includes('.chatmode.')) return '💭';
  return '📝';
}

function countFiles(node: FileNode): number {
  if (node.type === 'file') return 1;
  if (!node.children) return 0;
  return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

function countFolders(node: FileNode): number {
  if (node.type === 'file') return 0;
  if (!node.children) return 0;
  return node.children.reduce(
    (sum, child) => sum + (child.type === 'folder' ? 1 : 0) + countFolders(child),
    0
  );
}

interface FileNodeComponentProps {
  readonly node: FileNode;
  readonly depth: number;
  readonly selectedFile: string | null;
  readonly onSelectFile: (path: string) => void;
  readonly expandedFolders: Set<string>;
  readonly onToggleFolder: (path: string) => void;
}

function FileNodeComponent({
  node,
  depth,
  selectedFile,
  onSelectFile,
  expandedFolders,
  onToggleFolder,
}: FileNodeComponentProps): ReactElement {
  const isSelected = node.path === selectedFile;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedFolders.has(node.path);
  const icon = getFileIcon(node.name, node.type, isExpanded);

  const handleClick = () => {
    if (node.type === 'folder') {
      onToggleFolder(node.path);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <li className="file-tree__node">
      <button
        type="button"
        className={`file-tree__item ${isSelected ? 'file-tree__item--selected' : ''} ${
          node.type === 'folder' ? 'file-tree__item--folder' : ''
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleClick}
        aria-selected={isSelected}
        aria-expanded={node.type === 'folder' ? isExpanded : undefined}
      >
        {node.type === 'folder' && hasChildren && (
          <span className={`file-tree__chevron ${isExpanded ? '' : 'file-tree__chevron--collapsed'}`}>
            ▾
          </span>
        )}
        <span className="file-tree__icon">{icon}</span>
        <span className="file-tree__name">{node.name}</span>
        {node.type === 'folder' && hasChildren && (
          <span className="file-tree__count">{countFiles(node)}</span>
        )}
      </button>

      {hasChildren && isExpanded && (
        <ul className="file-tree__children">
          {node.children!.map((child) => (
            <FileNodeComponent
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({
  rootName,
  files,
  selectedFile,
  onSelectFile,
  artifactType,
}: FileTreeProps): ReactElement {
  const tree = useMemo(() => buildFileTree(files, rootName), [files, rootName]);

  // Start with top-level folders expanded
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Expand first level by default
    tree.children?.forEach((node) => {
      if (node.type === 'folder') {
        initial.add(node.path);
      }
    });
    return initial;
  });

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const getArtifactIcon = (type?: string): string => {
    switch (type) {
      case 'agent':
        return '🤖';
      case 'prompt':
        return '💬';
      case 'chatmode':
        return '💭';
      case 'instructions':
        return '📜';
      case 'task':
        return '✅';
      default:
        return '📁';
    }
  };

  const totalFiles = countFiles(tree);
  const totalFolders = countFolders(tree);

  return (
    <aside className="file-tree" aria-label="File explorer">
      <div className="file-tree__header">
        <span className="file-tree__header-icon">{getArtifactIcon(artifactType)}</span>
        <span className="file-tree__header-title">{rootName.toUpperCase()}</span>
      </div>

      <nav className="file-tree__nav">
        <ul className="file-tree__list" role="tree">
          {tree.children?.map((node) => (
            <FileNodeComponent
              key={node.path}
              node={node}
              depth={0}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
            />
          ))}
        </ul>
      </nav>

      <div className="file-tree__footer">
        <span className="file-tree__stat">
          {totalFiles} file{totalFiles !== 1 ? 's' : ''}
        </span>
        {totalFolders > 0 && (
          <span className="file-tree__stat">
            {totalFolders} folder{totalFolders !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </aside>
  );
}
