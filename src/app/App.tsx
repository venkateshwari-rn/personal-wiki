import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import * as Tabs from '@radix-ui/react-tabs';
import { Toaster } from 'sonner';
import { WikiSidebar } from './components/WikiSidebar';
import { WikiPageView } from './components/WikiPageView';
import { WikiListView } from './components/WikiListView';
import { AskQuestionView } from './components/AskQuestionView';
import { MaintenanceView } from './components/MaintenanceView';
import { RawMaterialView } from './components/RawMaterialView';
import { UploadDialog } from './components/UploadDialog';
import { FileText, MessageSquare, Wrench, FolderOpen, Brain } from 'lucide-react';

interface WikiNode {
  id: string;
  name: string;
  type: 'folder' | 'page';
  children?: WikiNode[];
}

interface WikiPage {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export default function App() {
  const [selectedNode, setSelectedNode] = useState<WikiNode | null>(null);
  const [selectedWikiPage, setSelectedWikiPage] = useState<WikiPage | null>(null);
  const [activeTab, setActiveTab] = useState('wiki');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNodeSelect = (node: WikiNode) => {
    setSelectedNode(node);
    if (node.type === 'page') {
      if (node.id.startsWith('raw-')) {
        setActiveTab('raw');
      } else if (node.id.startsWith('wiki-')) {
        setActiveTab('wiki');
      }
    }
  };

  return (
    <div className="size-full flex flex-col bg-white">
      <header className="h-14 border-b border-neutral-200 flex items-center px-6 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-neutral-900">Personal Wiki</h1>
            <p className="text-xs text-neutral-600">LLM-Powered Knowledge Base</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <WikiSidebar
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNode?.id || null}
              onUploadClick={() => setUploadDialogOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-neutral-200 hover:bg-blue-500 transition-colors" />

          <Panel defaultSize={80}>
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <Tabs.List className="flex border-b border-neutral-200 px-6 bg-neutral-50 shrink-0">
                <Tabs.Trigger
                  value="raw"
                  className="px-4 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  Raw Materials
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="wiki"
                  className="px-4 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Wiki Pages
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="ask"
                  className="px-4 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask Questions
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="maintenance"
                  className="px-4 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Maintenance
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="raw" className="flex-1 overflow-hidden">
                <RawMaterialView
                  refreshTrigger={refreshTrigger}
                  onUploadClick={() => setUploadDialogOpen(true)}
                />
              </Tabs.Content>

              <Tabs.Content value="wiki" className="flex-1 overflow-hidden">
                {selectedWikiPage ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                      <button
                        onClick={() => setSelectedWikiPage(null)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        ← Back to all pages
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <WikiPageView page={selectedWikiPage} />
                    </div>
                  </div>
                ) : (
                  <WikiListView onPageSelect={(page) => setSelectedWikiPage(page)} />
                )}
              </Tabs.Content>

              <Tabs.Content value="ask" className="flex-1 overflow-hidden">
                <AskQuestionView />
              </Tabs.Content>

              <Tabs.Content value="maintenance" className="flex-1 overflow-hidden">
                <MaintenanceView />
              </Tabs.Content>
            </Tabs.Root>
          </Panel>
        </PanelGroup>
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}