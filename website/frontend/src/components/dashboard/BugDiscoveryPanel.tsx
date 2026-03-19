import { useState, useEffect } from 'react';
import { Bug, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { fetchBugs, fetchBugStats, updateBugStatus } from '@/services/bugApi';
import type { BugReportSummary, BugStats } from '@/services/bugApi';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_ICONS: Record<string, typeof Bug> = {
  open: AlertTriangle,
  confirmed: Bug,
  fixed: CheckCircle2,
  wont_fix: XCircle,
  not_a_bug: XCircle,
};

export default function BugDiscoveryPanel() {
  const [bugs, setBugs] = useState<BugReportSummary[]>([]);
  const [stats, setStats] = useState<BugStats | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchBugs(), fetchBugStats()])
      .then(([bugsRes, statsRes]) => {
        setBugs(bugsRes.bugs);
        setStats(statsRes);
      })
      .catch(() => { /* silently fail — panel is optional */ })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBugStatus(id, status);
      setBugs(prev => prev.map(b => b.id === id ? { ...b, status: status as BugReportSummary['status'] } : b));
      const newStats = await fetchBugStats();
      setStats(newStats);
    } catch { /* ignore */ }
  };

  if (loading) return null;
  if (bugs.length === 0 && !stats) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-semibold text-[#1E1B4B]">Bug Discovery</h3>
        {stats && stats.totalOpen > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {stats.totalOpen} open
          </span>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
            <div key={sev} className={`rounded-lg border px-3 py-2 text-center ${SEVERITY_COLORS[sev]}`}>
              <p className="text-lg font-bold">{stats.bySeverity[sev] || 0}</p>
              <p className="text-[10px] uppercase tracking-wide">{sev}</p>
            </div>
          ))}
        </div>
      )}

      {bugs.length > 0 && (
        <div className="space-y-2">
          {bugs.slice(0, 10).map(bug => {
            const StatusIcon = STATUS_ICONS[bug.status] || Bug;
            const isExpanded = expandedId === bug.id;
            return (
              <div key={bug.id} className="border border-[#DDD6FE]/40 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : bug.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-purple-50/30 transition-colors"
                >
                  <StatusIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[bug.severity]}`}>
                    {bug.severity}
                  </span>
                  <span className="text-sm text-[#1E1B4B] truncate flex-1">{bug.title}</span>
                  <span className="text-[10px] text-gray-400">{bug.module}</span>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t border-[#DDD6FE]/30">
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div>
                        <span className="text-gray-500">Expected: </span>
                        <span className="text-[#1E1B4B]">{bug.expectedBehavior}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual: </span>
                        <span className="text-[#1E1B4B]">{bug.actualBehavior}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {bug.status === 'open' && (
                        <>
                          <button onClick={() => handleStatusChange(bug.id, 'confirmed')} className="text-[10px] px-2 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200">Confirm</button>
                          <button onClick={() => handleStatusChange(bug.id, 'not_a_bug')} className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Not a Bug</button>
                        </>
                      )}
                      {bug.status === 'confirmed' && (
                        <button onClick={() => handleStatusChange(bug.id, 'fixed')} className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Mark Fixed</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
