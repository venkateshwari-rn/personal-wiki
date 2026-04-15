import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Plus, Upload } from 'lucide-react';
import { getRawMaterials, getWikiPages } from '../utils/api';

interface WikiNode {
  id: string;
  name: string;
  type: 'folder' | 'page';
  children?: WikiNode[];
}

interface WikiSidebarProps {
  onNodeSelect: (node: WikiNode) => void;
  selectedNodeId: string | null;
  onUploadClick: () => void;
  refreshTrigger?: number;
}

export function WikiSidebar({ onNodeSelect, selectedNodeId, onUploadClick, refreshTrigger }: WikiSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['raw', 'wiki']));
  const [wikiStructure, setWikiStructure] = useState<WikiNode[]>([]);

  useEffect(() => {
    const loadStructure = async () => {
      try {
        const [rawResult, wikiResult] = await Promise.all([
          getRawMaterials(),
          getWikiPages()
        ]);

        const structure: WikiNode[] = [];

        // Raw materials folder
        if (rawResult.materials && rawResult.materials.length > 0) {
          structure.push({
            id: 'raw',
            name: 'Raw Materials',
            type: 'folder',
            children: rawResult.materials.map((m: any) => ({
              id: `raw-${m.id}`,
              name: m.name,
              type: 'page' as const
            }))
          });
        }

        // Wiki pages folder
        if (wikiResult.pages && wikiResult.pages.length > 0) {
          structure.push({
            id: 'wiki',
            name: 'Generated Wiki',
            type: 'folder',
            children: wikiResult.pages.map((p: any) => ({
              id: `wiki-${p.id}`,
              name: p.title,
              type: 'page' as const
            }))
          });
        }

        setWikiStructure(structure);
      } catch (error) {
        console.error('Error loading sidebar structure:', error);
        setWikiStructure([]);
      }
    };

    loadStructure();
  }, [refreshTrigger]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: WikiNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 cursor-pointer ${
            isSelected ? 'bg-neutral-200' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            onNodeSelect(node);
          }}
        >
          {hasChildren && (
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4 shrink-0" />}

          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-600 shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-neutral-600 shrink-0" />
          )}

          <span className="text-sm truncate">{node.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 border-r border-neutral-200">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-900">My Knowledge Base</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {wikiStructure.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            <p className="mb-2">No content yet</p>
            <p className="text-xs">Upload documents to get started</p>
          </div>
        ) : (
          wikiStructure.map(node => renderNode(node))
        )}
      </div>

      <div className="p-3 border-t border-neutral-200 flex gap-2">
        <button
          onClick={onUploadClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={onUploadClick}
          className="flex items-center justify-center gap-2 px-3 py-2 border border-neutral-300 rounded hover:bg-neutral-100 text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
