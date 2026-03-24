import { useState, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle2, Bug, ChevronDown } from 'lucide-react';
import { fetchTestIdChanges, updateTestId, type TestIdChange } from '@/services/testIdApi';

const STATUS_BADGE: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  MISSING: 'bg-red-100 text-red-700',
  CHANGED: 'bg-amber-100 text-amber-700',
};

export default function TestIdChangePanel() {
  const [changes, setChanges] = useState<TestIdChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<Record<string, 'known' | 'bug'>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTestIdChanges()
      .then(res => setChanges(res.changes))
      .catch(() => { /* panel is optional */ })
      .finally(() => setLoading(false));
  }, []);

  const handleDecision = (id: string, decision: 'known' | 'bug') => {
    setDecisions(prev => ({ ...prev, [id]: decision }));
  };

  const handleBulkKnown = () => {
    const next: Record<string, 'known' | 'bug'> = {};
    changes.forEach(c => { next[c.id] = 'known'; });
    setDecisions(next);
  };

  const handleBulkBug = () => {
    const next: Record<string, 'known' | 'bug'> = {};
    changes.forEach(c => { next[c.id] = 'bug'; });
    setDecisions(next);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await Promise.all(
        Object.entries(decisions).map(([id, decision]) =>
          updateTestId(id, { status: decision === 'known' ? 'PRESENT' : 'MISSING' })
        )
      );
      // Remove submitted changes from list
      setChanges(prev => prev.filter(c => !decisions[c.id]));
      setDecisions({});
    } catch (err) {
      console.error('[TestIdChangePanel] Failed to submit test-ID decisions:', err);
    }
    setSubmitting(false);
  };

  if (loading) return null;
  if (changes.length === 0) return null;

  const decidedCount = Object.keys(decisions).length;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-[#1E1B4B]">Test-ID Changes</h3>
        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          {changes.length} change{changes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={handleBulkKnown}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100"
        >
          <CheckCircle2 className="w-3 h-3" /> Mark All Known Changes
        </button>
        <button
          onClick={handleBulkBug}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100"
        >
          <Bug className="w-3 h-3" /> Report All as Bugs
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#EDE9FE]">
              <th className="text-left py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Selector Key</th>
              <th className="text-left py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Old Value</th>
              <th className="text-left py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">New Value</th>
              <th className="text-left py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
              <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE9FE]/50">
            {changes.map(change => (
              <tr key={change.id} className="hover:bg-purple-50/20">
                <td className="py-2 pr-3 font-mono text-[#1E1B4B]">{change.selectorKey}</td>
                <td className="py-2 pr-3 font-mono text-red-600 line-through">{change.oldValue || '(none)'}</td>
                <td className="py-2 pr-3 font-mono text-emerald-600">{change.newValue || '(none)'}</td>
                <td className="py-2 pr-3">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[change.status] || STATUS_BADGE.CHANGED}`}>
                    {change.status}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDecision(change.id, 'known')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        decisions[change.id] === 'known' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Known
                    </button>
                    <button
                      onClick={() => handleDecision(change.id, 'bug')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        decisions[change.id] === 'bug' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      Bug
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit */}
      {decidedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-[#EDE9FE]">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#C4B5FD] text-white text-xs font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : `Submit ${decidedCount} Decision${decidedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
