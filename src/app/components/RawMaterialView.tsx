import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar, Zap, RefreshCw, Trash2 } from 'lucide-react';
import { getRawMaterials, deleteMaterial } from '../utils/api';
import { toast } from 'sonner';

interface RawMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'web' | 'repo' | 'markdown';
  url?: string;
  addedDate: string;
  status: 'processed' | 'processing' | 'pending';
  extractedConcepts?: number;
}

interface RawMaterialViewProps {
  refreshTrigger?: number;
  onUploadClick?: () => void;
}

export function RawMaterialView({ refreshTrigger, onUploadClick }: RawMaterialViewProps) {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getRawMaterials();
      setMaterials(result.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(material => material.id !== id));
      toast.success('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Raw Materials</h2>
            <p className="text-neutral-600">Source documents that feed your knowledge base</p>
          </div>
          <button
            onClick={loadMaterials}
            className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded hover:bg-neutral-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How it works</p>
              <p className="text-blue-700">Upload papers, docs, or add web links. The LLM extracts concepts, creates summaries, and generates structured wiki pages with automatic cross-linking.</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8 text-neutral-500">Loading materials...</div>
        )}

        {error && (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">
            <div className="text-center">
              <p className="font-medium text-yellow-900 mb-2">Backend not deployed</p>
              <p className="text-sm text-yellow-700 mb-4">
                To enable uploads and processing, deploy the Supabase edge function:
              </p>
              <ol className="text-sm text-yellow-700 text-left inline-block mb-4">
                <li>1. Go to <strong>Make settings</strong></li>
                <li>2. Click on <strong>Supabase</strong></li>
                <li>3. Click <strong>Deploy</strong> button</li>
              </ol>
              <p className="text-xs text-yellow-600">Error: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && materials.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <p>No materials yet. Upload some documents to get started!</p>
          </div>
        )}

        <div className="space-y-3">
          {materials.map(material => (
            <div key={material.id} className="p-4 border border-neutral-200 rounded hover:border-neutral-300 transition-colors relative">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-neutral-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-neutral-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 truncate">{material.name}</h3>
                      {material.url && (
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{material.url}</span>
                        </a>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                      material.status === 'processed' ? 'bg-green-100 text-green-700' :
                      material.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {material.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Added {material.addedDate}</span>
                    </div>
                    {material.status === 'processed' && material.extractedConcepts && (
                      <span>{material.extractedConcepts} concepts extracted</span>
                    )}
                    <span className="px-2 py-0.5 bg-neutral-100 rounded text-xs">{material.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(material.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div
            onClick={onUploadClick}
            className="p-8 border-2 border-dashed border-neutral-300 rounded hover:border-blue-400 transition-colors cursor-pointer"
          >
            <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <p className="font-medium text-neutral-700 mb-1">Add new materials</p>
            <p className="text-sm text-neutral-500">Upload PDFs, paste URLs, or connect repositories</p>
            <button
              onClick={onUploadClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}