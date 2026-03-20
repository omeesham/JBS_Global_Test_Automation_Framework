import { useState, useEffect } from 'react';
import { Search, Bug, Wrench, XCircle, CheckCircle2, Send, Clock } from 'lucide-react';
import { resumeTriagePipeline, getPipelineRunDetail } from '@/services/encoreApi';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import '@/styles/pipeline-animations.css';

interface TriageItem {
  testName: string;
  error: string;
  category: string;
  recommendation: string;
  disposition?: 'heal' | 'bug' | 'dismiss';
}

/**
 * Inline chat card for triage decisions.
 * Rendered when SSE fires `triage_required`.
 */
interface ChatTriageCardProps {
  onDecideLater?: () => void;
}

export default function ChatTriageCard({ onDecideLater }: ChatTriageCardProps) {
  const { runId, clearPendingAction } = useActivePipeline();
  const [items, setItems] = useState<TriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<{ healed: number; bugs: number; dismissed: number }>({ healed: 0, bugs: 0, dismissed: 0 });

  // Fetch triage data from run detail
  useEffect(() => {
    if (!runId) return;
    getPipelineRunDetail(runId)
      .then(run => {
        // Extract triage items from stage results or artifacts
        const auditResult = run.stages?.find((s: any) => s.stage === 'audit');
        const triageData = auditResult?.result?.triageReport || auditResult?.result?.failures || [];
        const parsed: TriageItem[] = (Array.isArray(triageData) ? triageData : triageData.groups?.flatMap((g: any) => g.items) || [])
          .map((item: any) => ({
            testName: item.testName || item.name || 'Unknown test',
            error: item.error || item.message || item.summary || 'Unknown error',
            category: item.category || item.disposition || 'UNCERTAIN',
            recommendation: item.recommendation || item.action || 'Review manually',
          }));
        setItems(parsed.length > 0 ? parsed : [
          { testName: 'Unknown failures', error: 'Could not parse triage details', category: 'UNCERTAIN', recommendation: 'Review in dashboard' },
        ]);
      })
      .catch(() => {
        setItems([{ testName: 'Error', error: 'Could not load triage data', category: 'UNCERTAIN', recommendation: 'Check dashboard' }]);
      })
      .finally(() => setLoading(false));
  }, [runId]);

  const setDisposition = (index: number, disposition: 'heal' | 'bug' | 'dismiss') => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, disposition } : item));
  };

  const allDecided = items.every(i => i.disposition);

  const handleSubmit = async () => {
    if (!runId || !allDecided) return;
    setSubmitting(true);
    try {
      const decisions = items.map(item => ({
        testName: item.testName,
        decision: item.disposition!,
        reason: item.disposition === 'bug' ? 'Reported as bug' : item.disposition === 'dismiss' ? 'Dismissed' : 'Sent to healer',
      }));
      await resumeTriagePipeline(runId, decisions);
      const healed = items.filter(i => i.disposition === 'heal').length;
      const bugs = items.filter(i => i.disposition === 'bug').length;
      const dismissed = items.filter(i => i.disposition === 'dismiss').length;
      setSummary({ healed, bugs, dismissed });
      setSubmitted(true);
      clearPendingAction();
    } catch (err) {
      console.error('[ChatTriageCard] Submit failed:', (err as Error).message);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="pipeline-card-enter bg-emerald-50 rounded-2xl border border-emerald-200 px-5 py-4 max-w-lg">
        <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
          <CheckCircle2 className="w-5 h-5" />
          Triage Complete — Pipeline Resuming
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          {summary.healed > 0 && <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-violet-500" /> {summary.healed} → Healer</span>}
          {summary.bugs > 0 && <span className="flex items-center gap-1"><Bug className="w-3.5 h-3.5 text-red-500" /> {summary.bugs} → Bug Reports</span>}
          {summary.dismissed > 0 && <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-gray-400" /> {summary.dismissed} Dismissed</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-card-enter pipeline-awaiting-action bg-white rounded-2xl border-2 border-amber-300 shadow-sm max-w-2xl">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <Search className="w-5 h-5" />
            Triage Required — {items.length} issue{items.length !== 1 ? 's' : ''} found
          </div>
          {onDecideLater && (
            <button onClick={onDecideLater} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
              <Clock className="w-3.5 h-3.5" /> Decide Later
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">Decide what to do with each failure</p>
      </div>

      {loading ? (
        <div className="px-5 pb-4 flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin" />
          Loading triage data...
        </div>
      ) : (
        <div className="px-5 pb-3 space-y-2 max-h-[300px] overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.testName}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.error}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  item.category === 'BUG' ? 'bg-red-100 text-red-700' :
                  item.category === 'TEST_DEFECT' ? 'bg-violet-100 text-violet-700' :
                  item.category === 'FEATURE_CHANGE' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.category}
                </span>
              </div>

              {/* Decision buttons */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => setDisposition(idx, 'heal')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    item.disposition === 'heal'
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                  }`}
                >
                  <Wrench className="w-3 h-3" /> Heal
                </button>
                <button
                  onClick={() => setDisposition(idx, 'bug')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    item.disposition === 'bug'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <Bug className="w-3 h-3" /> Bug
                </button>
                <button
                  onClick={() => setDisposition(idx, 'dismiss')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    item.disposition === 'dismiss'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <XCircle className="w-3 h-3" /> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="px-5 pb-4 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!allDecided || submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit Decisions & Resume Pipeline
        </button>
        {!allDecided && !loading && (
          <p className="text-xs text-gray-400 text-center mt-1">Decide on all items to continue</p>
        )}
      </div>
    </div>
  );
}
