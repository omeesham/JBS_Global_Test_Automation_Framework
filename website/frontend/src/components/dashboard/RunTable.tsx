import { Search, ChevronDown } from 'lucide-react';
import type { PipelineRun } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import RunStatusBadge from './RunStatusBadge';

const STATUS_FILTERS = ['All', 'Running', 'Completed', 'Failed', 'Fixme'] as const;

interface Props {
  runs: PipelineRun[];
  onSelectRun: (run: PipelineRun) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function RunTable({ runs, onSelectRun, filter, onFilterChange }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'client_admin';

  const filtered = filter === 'All'
    ? runs
    : runs.filter((r) => r.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#EDE9FE]">
        <h3 className="text-sm font-semibold text-[#1E1B4B]">Pipeline Runs</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="appearance-none text-xs bg-[#F5F3FF] text-[#1E1B4B] border border-[#DDD6FE] rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#6B7280] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide border-b border-[#EDE9FE]">
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Status</th>
              {isAdmin && <th className="px-4 py-3 text-right">Cost</th>}
              <th className="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-4 py-10 text-center">
                  <Search className="w-5 h-5 text-[#DDD6FE] mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">No runs found</p>
                </td>
              </tr>
            ) : (
              filtered.map((run) => {
                const lastStage = run.stages.length > 0
                  ? run.stages[run.stages.length - 1].stage
                  : '—';
                const date = new Date(run.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                });

                return (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run)}
                    className="border-b border-[#EDE9FE]/50 hover:bg-[#F5F3FF] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[#1E1B4B]">{run.feature}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{run.module}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] capitalize">{lastStage.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3"><RunStatusBadge status={run.status} /></td>
                    {isAdmin && <td className="px-4 py-3 text-xs text-[#1E1B4B] font-medium text-right">${run.totalCost.toFixed(2)}</td>}
                    <td className="px-4 py-3 text-xs text-[#6B7280] text-right">{date}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
