import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, Link, FileText, Loader2 } from 'lucide-react';
import { uploadFile, addUrl, processDocument } from '../utils/api';
import { toast } from 'sonner';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url' | null>(null);
  const [url, setUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      if (uploadType === 'file' && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const result = await uploadFile(file);
          toast.success(`${file.name} uploaded successfully!`);

          // Start processing in background
          processDocument(result.fileId).then(() => {
            toast.success(`${file.name} processed! Check your wiki.`);
            onSuccess?.();
          }).catch(err => {
            console.error('Processing error:', err);
            if (err.message.includes('credit') || err.message.includes('Anthropic')) {
              toast.error('❌ Backend not updated! Deploy new version in Make settings → Supabase → Deploy', { duration: 10000 });
            } else if (err.message.includes('GROQ_API_KEY')) {
              toast.error('❌ Add GROQ_API_KEY to Supabase secrets. Get free key at console.groq.com', { duration: 10000 });
            } else {
              toast.error(`Processing failed: ${err.message}`);
            }
          });
        }
      } else if (uploadType === 'url' && url) {
        const result = await addUrl(url);
        toast.success('URL added successfully!');

        // Start processing in background
        processDocument(result.urlId).then(() => {
          toast.success('URL processed! Check your wiki.');
          onSuccess?.();
        }).catch(err => {
          console.error('Processing error:', err);
          if (err.message.includes('credit')) {
            toast.error('Anthropic API credits depleted. Add credits at console.anthropic.com', { duration: 8000 });
          } else {
            toast.error(`Processing failed: ${err.message}`);
          }
        });
      }

      // Reset and close
      setSelectedFiles([]);
      setUrl('');
      setUploadType(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-lg p-6" aria-describedby="upload-description">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-semibold text-neutral-900">
              Add Raw Material
            </Dialog.Title>
            <Dialog.Close className="text-neutral-500 hover:text-neutral-700">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <Dialog.Description id="upload-description" className="sr-only">
            Upload files or add URLs to your knowledge base
          </Dialog.Description>


          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-neutral-700">Choose upload type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUploadType('file')}
                  className={`p-4 border-2 rounded flex flex-col items-center gap-2 hover:border-blue-500 transition-colors ${
                    uploadType === 'file' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'
                  }`}
                >
                  <Upload className="w-6 h-6 text-neutral-600" />
                  <span className="text-sm font-medium">Upload Files</span>
                  <span className="text-xs text-neutral-500">PDF, MD, TXT</span>
                </button>
                <button
                  onClick={() => setUploadType('url')}
                  className={`p-4 border-2 rounded flex flex-col items-center gap-2 hover:border-blue-500 transition-colors ${
                    uploadType === 'url' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'
                  }`}
                >
                  <Link className="w-6 h-6 text-neutral-600" />
                  <span className="text-sm font-medium">Add URL</span>
                  <span className="text-xs text-neutral-500">Web page, repo</span>
                </button>
              </div>
            </div>

            {uploadType === 'file' && (
              <div>
                <label className="block text-sm mb-2 text-neutral-700">Select files</label>
                <div className="border-2 border-dashed border-neutral-300 rounded p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.md,.txt,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-700">Click to select files</p>
                    <p className="text-xs text-neutral-500 mt-1">PDF, Markdown, Text files</p>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-xs text-neutral-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {uploadType === 'url' && (
              <div>
                <label className="block text-sm mb-2 text-neutral-700">Enter URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/1706.03762"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Supported: Research papers, blog posts, documentation, GitHub repos
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || !uploadType || (uploadType === 'file' && selectedFiles.length === 0) || (uploadType === 'url' && !url)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Add Material'
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
            <p className="font-medium mb-1">What happens next:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Material is uploaded and stored</li>
              <li>LLM extracts key concepts and information</li>
              <li>Structured wiki pages are generated</li>
              <li>Automatic cross-links are created</li>
            </ol>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
