import { useState, useEffect } from 'react';
import { FileText, Tag, Clock, Search } from 'lucide-react';
import { getWikiPages } from '../utils/api';

interface WikiPage {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

interface WikiListViewProps {
  onPageSelect: (page: WikiPage) => void;
}

export function WikiListView({ onPageSelect }: WikiListViewProps) {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        const result = await getWikiPages();
        setPages(result.pages || []);
      } catch (error) {
        console.error('Error loading wiki pages:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPages();
  }, []);

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Loading wiki pages...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Wiki Pages</h2>
          <p className="text-neutral-600">AI-generated knowledge pages from your materials</p>
        </div>

        {pages.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pages by title or tags..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <p className="text-neutral-600 mb-2">No wiki pages yet</p>
            <p className="text-sm text-neutral-500">Upload documents to generate wiki pages</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                onClick={() => onPageSelect(page)}
                className="p-4 border border-neutral-200 rounded hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-neutral-900 mb-2">{page.title}</h3>
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                  {page.content.replace(/^#.*\n/, '').substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{page.lastUpdated}</span>
                  </div>
                  {page.tags && page.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <div className="flex gap-1">
                        {page.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {tag}
                          </span>
                        ))}
                        {page.tags.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                            +{page.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPages.length === 0 && pages.length > 0 && (
          <div className="text-center py-8 text-neutral-500">
            <p>No pages match "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
