import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Bug, Wrench, ChevronDown, ChevronRight, CheckSquare, Square, Send, X } from 'lucide-react';
import { fetchTriageItems, bulkDecideTriage, type TriageItemSummary } from '@/services/bugApi';
import { resumeTriagePipeline } from '@/services/encoreApi';

interface Props {
  runId: string;
  onResume?: () => void;
}

const CONFIDENCE_BADGE: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

const DISPOSITION_LABEL: Record<string, { label: string; color: string }> = {
  BUG: { label: 'Likely Bug', color: 'text-red-600' },
  FEATURE_CHANGE: { label: 'Feature Changed', color: 'text-amber-600' },
  TEST_DEFECT: { label: 'Test Issue', color: 'text-blue-600' },
  UNCERTAIN: { label: 'Needs Review', color: 'text-gray-500' },
};

const DECISION_ICONS = {
  report_bug: Bug,
  heal_feature_change: Wrench,
  dismiss: X,
};

export default function TriagePanel({ runId, onResume }: Props) {
  const [items, setItems] = useState<TriageItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTriageItems(runId)
      .then(res => setItems(res.items))
      .catch(() => setError('Failed to load triage items'))
      .finally(() => setLoading(false));
  }, [runId]);

  // Group by disposition
  const groups = useMemo(() => {
    const order: string[] = ['BUG', 'FEATURE_CHANGE', 'TEST_DEFECT', 'UNCERTAIN'];
    const grouped = new Map<string, TriageItemSummary[]>();
    for (const item of items) {
      const key = item.disposition;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }
    return order.filter(k => grouped.has(k)).map(k => ({ disposition: k, items: grouped.get(k)! }));
  }, [items]);

  const pendingCount = items.filter(i => !i.decision).length;
  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDecision = async (decision: 'report_bug' | 'heal_feature_change' | 'dismiss') => {
    if (selected.size === 0) return;
    const prevItems = items; // Save for rollback
    // Optimistic update
    setItems(prev => prev.map(i =>
      selected.has(i.id) ? { ...i, decision, decidedAt: new Date().toISOString() } : i,
    ));
    const selectedIds = [...selected];
    setSelected(new Set());
    try {
      await bulkDecideTriage(selectedIds, decision);
    } catch {
      setItems(prevItems); // Rollback on failure
      setSelected(new Set(selectedIds));
      setError('Failed to save decisions');
    }
  };

  const handleSubmit = async () => {
    const undecided = items.filter(i => !i.decision);
    if (undecided.length > 0) {
      setError(`${undecided.length} item(s) still need a decision before submitting.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const decisions = items.map(i => ({ testName: i.testName, action: i.decision! }));
      await resumeTriagePipeline(runId, decisions);
      onResume?.();
    } catch {
      setError('Failed to resume pipeline. Is the backend running?');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-xs text-amber-600">Loading triage items...</p>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-amber-100 bg-amber-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-[#1E1B4B]">Failure Triage Required</h3>
          <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            {pendingCount} pending
          </span>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#EDE9FE] bg-[#FAFAFE]">
        <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1E1B4B]">
          {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-[#7C3AED]" /> : <Square className="w-3.5 h-3.5" />}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        {selected.size > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] text-[#6B7280]">{selected.size} selected:</span>
            <button
              onClick={() => handleBulkDecision('report_bug')}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100"
            >
              <Bug className="w-3 h-3" /> Report Bug
            </button>
            <button
              onClick={() => handleBulkDecision('heal_feature_change')}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              <Wrench className="w-3 h-3" /> Heal
            </button>
            <button
              onClick={() => handleBulkDecision('dismiss')}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100"
            >
              <X className="w-3 h-3" /> Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="divide-y divide-[#EDE9FE]">
        {groups.map(group => (
          <div key={group.disposition}>
            {/* Group header */}
            {groups.length > 1 && (
              <div className="px-4 py-2 bg-[#F5F3FF]">
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${DISPOSITION_LABEL[group.disposition]?.color}`}>
                  {DISPOSITION_LABEL[group.disposition]?.label} ({group.items.length})
                </span>
              </div>
            )}

            {/* Items */}
            {group.items.map(item => {
              const isExpanded = expanded.has(item.id);
              const isSelected = selected.has(item.id);
              const DecisionIcon = item.decision ? DECISION_ICONS[item.decision] : null;

              return (
                <div key={item.id} className={`px-4 py-3 ${item.decision ? 'bg-gray-50 opacity-70' : ''}`}>
                  <div className="flex items-start gap-2">
                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(item.id)} className="mt-0.5 flex-shrink-0">
                      {isSelected
                        ? <CheckSquare className="w-4 h-4 text-[#7C3AED]" />
                        : <Square className="w-4 h-4 text-[#9CA3AF]" />
                      }
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-[#1E1B4B] truncate">{item.whatHappened}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${CONFIDENCE_BADGE[item.confidence]}`}>
                          {item.confidence}
                        </span>
                        {DecisionIcon && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                            {item.decision?.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-[#6B7280] mb-1">{item.testName}</p>
                      <p className="text-xs text-[#374151] leading-relaxed">{item.whyItHappened}</p>

                      {/* Expand/collapse evidence */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center gap-1 mt-1.5 text-[10px] text-[#7C3AED] hover:text-[#6D28D9]"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {isExpanded ? 'Hide details' : 'View details'}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 bg-[#F5F3FF] rounded-lg text-xs space-y-1.5">
                          <div>
                            <span className="font-medium text-[#1E1B4B]">Recommended action: </span>
                            <span className="text-[#374151]">{item.whatToDo}</span>
                          </div>
                          <div>
                            <span className="font-medium text-[#1E1B4B]">Test file: </span>
                            <span className="text-[#6B7280] font-mono text-[10px]">{item.testFile}</span>
                          </div>
                        </div>
                      )}

                      {/* Per-item actions (only if no decision yet) */}
                      {!item.decision && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={async () => {
                              await bulkDecideTriage([item.id], 'report_bug');
                              setItems(prev => prev.map(i => i.id === item.id ? { ...i, decision: 'report_bug', decidedAt: new Date().toISOString() } : i));
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100"
                          >
                            <Bug className="w-3 h-3" /> Report Bug
                          </button>
                          <button
                            onClick={async () => {
                              await bulkDecideTriage([item.id], 'heal_feature_change');
                              setItems(prev => prev.map(i => i.id === item.id ? { ...i, decision: 'heal_feature_change', decidedAt: new Date().toISOString() } : i));
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100"
                          >
                            <Wrench className="w-3 h-3" /> Heal
                          </button>
                          <button
                            onClick={async () => {
                              await bulkDecideTriage([item.id], 'dismiss');
                              setItems(prev => prev.map(i => i.id === item.id ? { ...i, decision: 'dismiss', decidedAt: new Date().toISOString() } : i));
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2">
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="p-4 border-t border-[#EDE9FE]">
        <button
          onClick={handleSubmit}
          disabled={submitting || pendingCount > 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#C4B5FD] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting
            ? 'Resuming Pipeline...'
            : pendingCount > 0
              ? `${pendingCount} items need decisions`
              : 'Submit All Decisions & Resume Pipeline'
          }
        </button>
      </div>
    </div>
  );
}
