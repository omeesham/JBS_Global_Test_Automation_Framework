import React from 'react';
import { Workflow, Link2, BarChart3, Clock } from 'lucide-react';

interface ChatWelcomeProps {
  username: string;
  onQuickAction: (action: string) => void;
}

const quickActions = [
  { label: 'Run Pipeline', action: 'run_pipeline', icon: Workflow, primary: true },
  { label: 'Import from JIRA', action: 'Import from JIRA', icon: Link2, primary: false },
  { label: 'Past Runs', action: 'past_runs', icon: Clock, primary: false },
  { label: 'Dashboard', action: 'View Dashboard', icon: BarChart3, primary: false },
] as const;

function ChatWelcome({ username, onQuickAction }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h2 className="text-2xl font-semibold text-gray-900">
        Welcome back, <span className="text-violet-600">{username}</span>
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        What would you like to test today?
      </p>

      <div className="mt-8 w-full max-w-md space-y-3">
        {/* Primary action — Run Pipeline */}
        <button
          onClick={() => onQuickAction('run_pipeline')}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
            bg-violet-600 text-white font-semibold text-base
            hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20
            hover:shadow-violet-600/30 hover:scale-[1.01]"
        >
          <Workflow className="w-5 h-5" />
          Run Pipeline
        </button>

        {/* Secondary actions */}
        <div className="grid grid-cols-3 gap-2">
          {quickActions.filter(a => !a.primary).map(({ label, action, icon: Icon }) => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 bg-white
                text-xs text-gray-700 font-medium
                hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700
                transition-all shadow-sm hover:shadow-md"
            >
              <Icon className="w-4 h-4 text-violet-500" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatWelcome;
