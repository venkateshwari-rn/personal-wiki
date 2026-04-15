import { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { askQuestion } from '../utils/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export function AskQuestionView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);
    setInput('');
    setLoading(true);

    try {
      const result = await askQuestion(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer,
        sources: []
      }]);
    } catch (error) {
      console.error('Ask question error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-neutral-200 bg-blue-50">
        <div className="flex items-center gap-2 text-blue-900">
          <Sparkles className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Ask Your Wiki</h3>
            <p className="text-sm text-blue-700">Query your knowledge base with natural language</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <p className="text-neutral-600 mb-2">Ask anything about your knowledge base</p>
              <p className="text-sm text-neutral-500">Upload some materials first, then ask questions!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-100'} rounded-lg p-4`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-300">
                    <div className="text-xs text-neutral-600 mb-1">Sources:</div>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((source, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-white border border-neutral-300 rounded">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-neutral-600">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-neutral-200">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your knowledge base..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
