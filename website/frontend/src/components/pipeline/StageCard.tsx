import { ChevronDown, ChevronRight, Clock, DollarSign, Cpu, RotateCcw } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  status: string;
  cost: number;
  duration: number;
  model: string;
  turns: number;
  resultData?: any;
}

interface Props {
  stage: Stage;
  expanded: boolean;
  onToggle: () => void;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-[#EDE9FE] text-[#6B7280]',
  running: 'bg-[#7C3AED]/10 text-[#7C3AED]',
  completed: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-red-50 text-red-600',
};

export default function StageCard({ stage, expanded, onToggle }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[#7C3AED]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
          )}
          <span className="text-sm font-semibold text-[#1E1B4B]">{stage.name}</span>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${statusBadge[stage.status] || statusBadge.pending}`}
          >
            {stage.status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {stage.cost.toFixed(4)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {stage.duration}s
          </span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#DDD6FE]/40 px-4 pb-4 pt-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DetailItem icon={<Cpu className="w-3.5 h-3.5" />} label="Model" value={stage.model} />
            <DetailItem icon={<RotateCcw className="w-3.5 h-3.5" />} label="Turns" value={String(stage.turns)} />
            <DetailItem icon={<DollarSign className="w-3.5 h-3.5" />} label="Cost" value={`$${stage.cost.toFixed(4)}`} />
            <DetailItem icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={`${stage.duration}s`} />
          </div>

          {stage.resultData && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                Result Data
              </p>
              <pre className="text-xs bg-[#1E1B4B] text-[#E0E7FF] rounded-lg p-3 overflow-x-auto max-h-60 scrollbar-thin">
                {JSON.stringify(stage.resultData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#F5F3FF] rounded-lg px-3 py-2">
      <span className="text-[#7C3AED]">{icon}</span>
      <div>
        <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">{label}</p>
        <p className="text-xs font-medium text-[#1E1B4B]">{value}</p>
      </div>
    </div>
  );
}
