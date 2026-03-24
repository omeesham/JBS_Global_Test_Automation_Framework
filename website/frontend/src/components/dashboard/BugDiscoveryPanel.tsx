import { useState, useEffect } from 'react';
import { Bug, AlertTriangle, CheckCircle2, XCircle, Zap, UserCheck, RefreshCw, TrendingUp } from 'lucide-react';
import { fetchBugs, fetchBugStats, fetchBugDetail, updateBugStatus } from '@/services/bugApi';
import type { BugReportSummary, BugStats } from '@/services/bugApi';
import BugDetailModal from './BugDetailModal';

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
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<any>(null);

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

  const handleOpenDetail = async (bug: BugReportSummary) => {
    try {
      const detail = await fetchBugDetail(bug.id);
      setSelectedBug(detail);
    } catch {
      setSelectedBug(bug);
    }
  };

  const handleModalStatusChange = async (id: string, status: string) => {
    await handleStatusChange(id, status);
    setSelectedBug((prev: any) => prev ? { ...prev, status } : null);
  };

  const displayBugs = severityFilter
    ? bugs.filter(b => b.severity === severityFilter)
    : bugs;

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
            <button
              key={sev}
              onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
              className={`rounded-lg border px-3 py-2 text-center cursor-pointer transition-all ${SEVERITY_COLORS[sev]} ${severityFilter === sev ? 'ring-2 ring-offset-1 ring-[#7C3AED]' : 'hover:opacity-80'}`}
            >
              <p className="text-lg font-bold">{stats.bySeverity[sev] || 0}</p>
              <p className="text-[10px] uppercase tracking-wide">{sev}</p>
            </button>
          ))}
        </div>
      )}
      {severityFilter && (
        <button onClick={() => setSeverityFilter(null)} className="text-[10px] text-[#7C3AED] hover:underline mb-2">
          Showing {severityFilter} only — clear filter
        </button>
      )}

      {displayBugs.length > 0 && (
        <div className="space-y-2">
          {displayBugs.slice(0, 10).map(bug => {
            const StatusIcon = STATUS_ICONS[bug.status] || Bug;
            const isExpanded = expandedId === bug.id;
            return (
              <div key={bug.id} className="border border-[#DDD6FE]/40 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleOpenDetail(bug)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-purple-50/30 transition-colors cursor-pointer"
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

      {/* Autonomous vs Manual */}
      {stats && (stats.totalOpen > 0 || stats.totalFixed > 0) && (
        <div className="mt-4 pt-4 border-t border-[#DDD6FE]/30">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-2">Autonomous vs Manual</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-medium text-emerald-700">
                {bugs.filter((b: any) => b.autoDecided).length || 0} Auto-decided
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <UserCheck className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-medium text-amber-700">
                {bugs.filter((b: any) => !b.autoDecided).length || bugs.length} Human-reviewed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Flaky Tests */}
      {(() => {
        const flakyCount = bugs.filter((b: any) => b.bugHuntCategory === 'FLAKE' || b.isFlaky).length;
        if (flakyCount === 0) return null;
        return (
          <div className="mt-3 pt-3 border-t border-[#DDD6FE]/30">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs text-[#1E1B4B] font-medium">Flaky Tests</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                {flakyCount}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Failure Trends */}
      {stats && stats.totalOpen > 0 && (
        <div className="mt-3 pt-3 border-t border-[#DDD6FE]/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="text-xs text-[#374151]">
              {stats.totalOpen} bug{stats.totalOpen !== 1 ? 's' : ''} open, {stats.totalFixed} fixed overall
            </span>
          </div>
        </div>
      )}

      <BugDetailModal
        bug={selectedBug}
        isOpen={!!selectedBug}
        onClose={() => setSelectedBug(null)}
        onStatusChange={handleModalStatusChange}
      />
    </div>
  );
}
