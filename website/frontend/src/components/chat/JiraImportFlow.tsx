import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, Link2 } from 'lucide-react';
import { connectJira, getJiraStories, getJiraStoryDetails } from '@/services/api';

interface JiraStory {
  key: string;
  summary: string;
}

interface JiraImportFlowProps {
  username: string;
  onStoriesLoaded: (stories: JiraStory[]) => void;
  onStorySelected: (storyKey: string, requirements: string) => void;
}

export default function JiraImportFlow({ username, onStoriesLoaded, onStorySelected }: JiraImportFlowProps) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [stories, setStories] = useState<JiraStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      await connectJira(username, url, email, apiKey);
      const result = await getJiraStories(username);
      setStories(result);
      setConnected(true);
      onStoriesLoaded(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to JIRA');
    } finally {
      setConnecting(false);
    }
  };

  const handleStoryClick = async (storyKey: string) => {
    setLoadingStory(storyKey);
    setSelectedStory(storyKey);
    try {
      const details = await getJiraStoryDetails(username, storyKey);
      const requirements = [
        details.title,
        details.description,
        details.acceptanceCriteria,
      ]
        .filter(Boolean)
        .join('\n\n');
      onStorySelected(storyKey, requirements);
    } catch (err: any) {
      setError(err?.message || 'Failed to load story details');
    } finally {
      setLoadingStory(null);
    }
  };

  if (!connected) {
    return (
      <div className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-violet-700">
          <Link2 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Connect to JIRA</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">JIRA URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-org.atlassian.net"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your JIRA API token"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleConnect}
            disabled={connecting || !url || !email || !apiKey}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">JIRA Connected</h3>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}

      <p className="mb-3 text-sm text-gray-500">Select a story to import requirements:</p>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {stories.map((story) => (
          <button
            key={story.key}
            onClick={() => handleStoryClick(story.key)}
            disabled={loadingStory !== null}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
              selectedStory === story.key
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loadingStory === story.key ? (
              <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-violet-600" />
            ) : selectedStory === story.key ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-violet-600" />
            ) : (
              <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-300" />
            )}
            <div className="min-w-0">
              <span className="font-mono text-xs text-violet-600">{story.key}</span>
              <p className="truncate text-gray-700">{story.summary}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
