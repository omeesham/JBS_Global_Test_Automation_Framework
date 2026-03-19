import { Wifi, WifiOff, Activity, Play, Square, RotateCw, Loader2 } from 'lucide-react';

interface Props {
  connected: boolean;
  lastHeartbeat?: string;
  currentTask?: string;
  isSuperAdmin?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  actionLoading?: boolean;
}

function formatHeartbeat(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function WorkerIndicator({
  connected, lastHeartbeat, currentTask,
  isSuperAdmin, onStart, onStop, onRestart, actionLoading,
}: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          connected
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {connected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span
            className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
        </div>

        <span>{connected ? 'Worker Connected' : 'Worker Disconnected'}</span>

        {connected && lastHeartbeat && (
          <span className="text-[10px] text-emerald-500">
            {formatHeartbeat(lastHeartbeat)}
          </span>
        )}

        {connected && currentTask && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 border-l border-emerald-200 pl-2 ml-0.5">
            <Activity className="w-3 h-3" />
            {currentTask}
          </span>
        )}
      </div>

      {/* Start button — any user can start when disconnected */}
      {!connected && onStart && (
        <div className="inline-flex items-center gap-1">
          {actionLoading ? (
            <Loader2 className="w-4 h-4 text-[#6B7280] animate-spin" />
          ) : (
            <button
              onClick={onStart}
              title="Start worker"
              className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Stop/Restart — super_admin only */}
      {connected && isSuperAdmin && (
        <div className="inline-flex items-center gap-1">
          {actionLoading ? (
            <Loader2 className="w-4 h-4 text-[#6B7280] animate-spin" />
          ) : (
            <>
              <button
                onClick={onStop}
                title="Stop worker"
                className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRestart}
                title="Restart worker"
                className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
