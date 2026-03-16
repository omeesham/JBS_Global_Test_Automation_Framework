import type { AgentInfo } from '@/types';

const statusColors: Record<string, string> = {
  idle: 'bg-[#EDE9FE] text-[#6B7280]',
  active: 'bg-[#7C3AED]/10 text-[#7C3AED]',
  running: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

interface Props {
  agents: AgentInfo[];
}

export default function AgentActivityPanel({ agents }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1E1B4B]">Agent Activity</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-[#6B7280]">Live</span>
        </div>
      </div>
      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#F5F3FF] transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${agent.status === 'running' || agent.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-[#DDD6FE]'}`} />
              <div>
                <span className="text-sm text-[#1E1B4B] font-medium">{agent.name}</span>
                <p className="text-[10px] text-[#A5B4FC]">{agent.model}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${statusColors[agent.status] || statusColors.idle}`}>
              {agent.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
