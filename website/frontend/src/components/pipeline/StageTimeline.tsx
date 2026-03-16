import { CheckCircle2, XCircle, Circle, Loader2 } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  cost?: number;
  duration?: number;
  model?: string;
}

interface Props {
  stages: Stage[];
}

const statusIcon: Record<Stage['status'], JSX.Element> = {
  pending: <Circle className="w-5 h-5 text-[#9CA3AF]" />,
  running: <Loader2 className="w-5 h-5 text-[#7C3AED] animate-spin" />,
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  failed: <XCircle className="w-5 h-5 text-red-500" />,
};

const statusRing: Record<Stage['status'], string> = {
  pending: 'border-[#DDD6FE] bg-white',
  running: 'border-[#7C3AED] bg-[#F5F3FF] shadow-md shadow-purple-500/20',
  completed: 'border-emerald-400 bg-emerald-50',
  failed: 'border-red-400 bg-red-50',
};

const connectorColor = (prev: Stage['status']): string => {
  if (prev === 'completed') return 'bg-emerald-400';
  if (prev === 'failed') return 'bg-red-400';
  return 'bg-[#DDD6FE]';
};

export default function StageTimeline({ stages }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px] px-4 py-3">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${statusRing[stage.status]}`}
              >
                {statusIcon[stage.status]}
              </div>
              <span className="text-xs font-semibold text-[#1E1B4B] whitespace-nowrap">
                {stage.name}
              </span>
              {(stage.cost !== undefined || stage.duration !== undefined) && (
                <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                  {stage.cost !== undefined && <span>${stage.cost.toFixed(4)}</span>}
                  {stage.duration !== undefined && <span>{stage.duration}s</span>}
                </div>
              )}
              {stage.model && (
                <span className="text-[10px] text-[#A5B4FC]">{stage.model}</span>
              )}
            </div>

            {/* Connector */}
            {idx < stages.length - 1 && (
              <div className="flex-1 mx-2 flex items-center self-start mt-5">
                <div
                  className={`h-0.5 w-full rounded-full transition-colors ${connectorColor(stage.status)}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
