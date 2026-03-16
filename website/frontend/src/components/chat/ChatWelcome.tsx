import React from 'react';
import { Zap, Link2, BarChart3, Activity } from 'lucide-react';

interface ChatWelcomeProps {
  username: string;
  onQuickAction: (action: string) => void;
  workerOnline?: boolean | null;
}

const quickActions = [
  { label: 'Generate Tests', action: 'Generate Tests', icon: Zap },
  { label: 'Import from JIRA', action: 'Import from JIRA', icon: Link2 },
  { label: 'View Dashboard', action: 'View Dashboard', icon: BarChart3 },
  { label: 'Check Status', action: 'Check Status', icon: Activity },
] as const;

function ChatWelcome({ username, onQuickAction, workerOnline = null }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h2 className="text-2xl font-semibold text-gray-900">
        Welcome back, <span className="text-violet-600">{username}</span>
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        How can I help you today?
      </p>

      {workerOnline !== null && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              workerOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className={workerOnline ? 'text-green-600' : 'text-gray-400'}>
            Worker {workerOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
        {quickActions.map(({ label, action, icon: Icon }) => (
          <button
            key={action}
            onClick={() => onQuickAction(action)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 bg-white
              text-sm text-gray-700 font-medium
              hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700
              transition-all shadow-sm hover:shadow-md"
          >
            <Icon className="w-4 h-4 text-violet-500" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatWelcome;
