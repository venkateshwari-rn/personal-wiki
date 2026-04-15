import { useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Zap, TrendingUp, Mail, Clock, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface HealthCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  timestamp: string;
}

const mockHealthChecks: HealthCheck[] = [
  {
    id: '1',
    name: 'Missing Backlinks',
    status: 'warning',
    message: 'Found 3 pages with no incoming links. These concepts might be isolated.',
    timestamp: '2026-04-15 09:30'
  },
  {
    id: '2',
    name: 'Broken Wiki Links',
    status: 'passed',
    message: 'All wiki links are valid and point to existing pages.',
    timestamp: '2026-04-15 09:30'
  },
  {
    id: '3',
    name: 'Outdated Summaries',
    status: 'warning',
    message: 'GPT-3 Overview hasn\'t been updated in 3 days. New papers available.',
    timestamp: '2026-04-15 09:30'
  },
  {
    id: '4',
    name: 'Duplicate Concepts',
    status: 'passed',
    message: 'No duplicate or highly similar pages detected.',
    timestamp: '2026-04-15 09:30'
  },
  {
    id: '5',
    name: 'Missing Connections',
    status: 'warning',
    message: 'Detected 5 potential connections between unlinked concepts.',
    timestamp: '2026-04-15 09:30'
  }
];

const suggestions = [
  {
    id: '1',
    title: 'Create "Emergent Capabilities" page',
    reason: 'Referenced in multiple summaries but no dedicated page exists',
    impact: 'high'
  },
  {
    id: '2',
    title: 'Link "Knowledge Management" to "Second Brain Method"',
    reason: 'Strong semantic similarity detected',
    impact: 'medium'
  },
  {
    id: '3',
    title: 'Update "LLM Evolution Timeline"',
    reason: 'New models released since last compilation',
    impact: 'medium'
  },
  {
    id: '4',
    title: 'Add tags to "langchain-repo"',
    reason: 'Raw material without metadata for better organization',
    impact: 'low'
  }
];

export function MaintenanceView() {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingNews, setIsSendingNews] = useState(false);

  const handleSendDigest = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-defea855/send-daily-digest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast.success(`Daily digest email sent successfully! (${data.wikiPagesCount} pages summarized)`);
    } catch (error) {
      console.error('Error sending daily digest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendNewsDigest = async () => {
    setIsSendingNews(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-defea855/send-news-digest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send news digest');
      }

      toast.success(`CNA news digest sent successfully! (${data.articlesCount} articles summarized)`);
    } catch (error) {
      console.error('Error sending news digest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send news digest');
    } finally {
      setIsSendingNews(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Daily Digest Section */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-neutral-900">Daily Wiki Digest</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Get a creative short story summary of your wiki pages (powered by Groq AI) delivered to <strong>rnvenkateshwari@gmail.com</strong> every day at 7:00 AM SGT.
              </p>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded border border-purple-200 mb-4">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <div className="text-sm text-neutral-700">
                  <p className="font-medium mb-1">Automated Daily Schedule</p>
                  <p>To enable automatic daily emails at 7:00 AM SGT, you'll need to set up a cron job. Options:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-600">
                    <li><strong>GitHub Actions</strong>: Create a workflow that runs daily at 7am SGT (23:00 UTC)</li>
                    <li><strong>Supabase Cron</strong>: Use pg_cron in your Supabase database</li>
                    <li><strong>External service</strong>: Use cron-job.org or similar to hit the endpoint daily</li>
                  </ul>
                  <p className="mt-2 text-xs text-purple-700">
                    💡 To send to other email addresses (like venka_navaneetham@tech.gov.sg), verify a domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSendDigest}
              disabled={isSendingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSendingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Test Email Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* CNA News Digest Section */}
        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-semibold text-neutral-900">Daily Singapore News Digest</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Get the latest Singapore news from <strong>Channel NewsAsia (CNA)</strong> summarized by Groq AI and delivered to <strong>rnvenkateshwari@gmail.com</strong> every day at 7:00 AM SGT.
              </p>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded border border-red-200 mb-4">
                <Newspaper className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div className="text-sm text-neutral-700">
                  <p className="font-medium mb-1">News Sources</p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600">
                    <li>Channel NewsAsia - Singapore News</li>
                    <li>Top 10 latest articles daily</li>
                    <li>AI-powered summary + full article links</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={handleSendNewsDigest}
              disabled={isSendingNews}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSendingNews ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Newspaper className="w-4 h-4" />
                  Send News Digest Now
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">Wiki Health Dashboard</h2>
              <p className="text-neutral-600 mt-1">Automated maintenance and improvement suggestions</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />
              Run Health Check
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Passed</span>
              </div>
              <div className="text-2xl font-bold text-green-900">2</div>
              <div className="text-sm text-green-700">Checks healthy</div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">Warnings</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">3</div>
              <div className="text-sm text-yellow-700">Need attention</div>
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-neutral-600" />
                <span className="font-semibold text-neutral-900">Suggestions</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">4</div>
              <div className="text-sm text-neutral-600">Improvements</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-neutral-900 mb-4">Health Checks</h3>
          <div className="space-y-3">
            {mockHealthChecks.map(check => (
              <div key={check.id} className="p-4 border border-neutral-200 rounded hover:border-neutral-300">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {check.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {check.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    {check.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-neutral-900">{check.name}</h4>
                      <span className="text-xs text-neutral-500">{check.timestamp}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{check.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-neutral-900">AI-Powered Suggestions</h3>
          </div>
          <div className="space-y-3">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="p-4 border border-neutral-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-neutral-600">{suggestion.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      suggestion.impact === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {suggestion.impact} impact
                    </span>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Connect to Supabase for automated maintenance</p>
              <p className="text-blue-700">Enable background LLM processing to automatically find inconsistencies, suggest new connections, and keep your wiki up-to-date.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
