import { CheckCircle, Download, BarChart3, RotateCcw } from 'lucide-react';

interface ChatActionCardProps {
  responseType: 'options' | 'progress' | 'results' | 'jira_stories' | 'text';
  data: any;
  onAction?: (action: string, params?: any) => void;
}

function OptionsCard({ data, onAction }: { data: any; onAction?: ChatActionCardProps['onAction'] }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(data.options as string[]).map((option) => (
          <button
            key={option}
            onClick={() => onAction?.('select_option', option)}
            className="px-4 py-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 hover:border-violet-300 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">Or describe it...</p>
    </div>
  );
}

function ProgressCard({ data }: { data: any }) {
  const { stage, stageIndex, totalStages, detail } = data;
  const pct = Math.round((stageIndex / totalStages) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{stage}</span>
        <span className="text-xs text-gray-400">
          {stageIndex}/{totalStages}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

function ResultsCard({ data, onAction }: { data: any; onAction?: ChatActionCardProps['onAction'] }) {
  return (
    <div className="text-center">
      <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
      <p className="text-lg font-semibold text-gray-800">
        {data.count} test case{data.count !== 1 ? 's' : ''} generated
      </p>
      {data.runId && (
        <p className="text-xs text-gray-400 mt-1">Run ID: {data.runId}</p>
      )}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => onAction?.('view_dashboard')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          View in Dashboard
        </button>
        <button
          onClick={() => onAction?.('download')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={() => onAction?.('run_again')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Run Again
        </button>
      </div>
    </div>
  );
}

function JiraStoriesCard({ data, onAction }: { data: any; onAction?: ChatActionCardProps['onAction'] }) {
  const stories = (data.stories as { key: string; summary: string }[]).slice(0, 10);

  return (
    <div className="space-y-2">
      {stories.map((story) => (
        <button
          key={story.key}
          onClick={() => onAction?.('select_story', story.key)}
          className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-colors"
        >
          <span className="text-xs font-mono text-violet-600">{story.key}</span>
          <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">{story.summary}</p>
        </button>
      ))}
    </div>
  );
}

export default function ChatActionCard({ responseType, data, onAction }: ChatActionCardProps) {
  if (responseType === 'text') return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {responseType === 'options' && <OptionsCard data={data} onAction={onAction} />}
      {responseType === 'progress' && <ProgressCard data={data} />}
      {responseType === 'results' && <ResultsCard data={data} onAction={onAction} />}
      {responseType === 'jira_stories' && <JiraStoriesCard data={data} onAction={onAction} />}
    </div>
  );
}
