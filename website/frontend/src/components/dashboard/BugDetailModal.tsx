import { useState } from 'react';
import { X, Bug, ChevronDown, ChevronRight, Monitor, Globe, Code, History, User } from 'lucide-react';

interface Props {
  bug: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_STEPS = [
  { key: 'open', label: 'Open', color: 'bg-red-500' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-orange-500' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { key: 'fixed', label: 'Fixed', color: 'bg-emerald-500' },
];

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: typeof Bug; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#DDD6FE]/40 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-purple-50/30 transition-colors">
        {open ? <ChevronDown className="w-3.5 h-3.5 text-[#7C3AED]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />}
        <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-xs font-medium text-[#1E1B4B]">{title}</span>
      </button>
      {open && <div className="px-3 pb-3 border-t border-[#EDE9FE]/50">{children}</div>}
    </div>
  );
}

export default function BugDetailModal({ bug, isOpen, onClose, onStatusChange }: Props) {
  if (!isOpen || !bug) return null;

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === bug.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-[#DDD6FE] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EDE9FE] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bug className="w-4 h-4 text-red-500 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-[#1E1B4B] truncate">{bug.title || 'Bug Detail'}</h3>
            {bug.severity && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${SEVERITY_BADGE[bug.severity] || SEVERITY_BADGE.MEDIUM}`}>
                {bug.severity}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status lifecycle */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-2">Status</p>
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStepIdx;
                return (
                  <div key={step.key} className="flex items-center gap-1 flex-1">
                    <div className={`h-1.5 flex-1 rounded-full ${isActive ? step.color : 'bg-gray-200'}`} />
                    <span className={`text-[9px] ${isActive ? 'text-[#1E1B4B] font-medium' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps to reproduce */}
          {bug.stepsToReproduce && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">Steps to Reproduce</p>
              <div className="text-xs text-[#374151] bg-[#F5F3FF] rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                {Array.isArray(bug.stepsToReproduce) ? bug.stepsToReproduce.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') : bug.stepsToReproduce}
              </div>
            </div>
          )}

          {/* Expected vs Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">Expected</p>
              <p className="text-xs text-[#374151] bg-emerald-50 rounded-lg p-2.5">{bug.expectedBehavior || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">Actual</p>
              <p className="text-xs text-[#374151] bg-red-50 rounded-lg p-2.5">{bug.actualBehavior || 'N/A'}</p>
            </div>
          </div>

          {/* Screenshot */}
          {bug.screenshotPath && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">Screenshot</p>
              <img
                src={bug.screenshotPath}
                alt="Bug screenshot"
                className="w-full rounded-lg border border-[#DDD6FE]/40 max-h-48 object-contain bg-gray-50"
              />
            </div>
          )}

          {/* Console errors */}
          {bug.consoleErrors && bug.consoleErrors.length > 0 && (
            <CollapsibleSection title={`Console Errors (${bug.consoleErrors.length})`} icon={Monitor}>
              <div className="mt-2 space-y-1">
                {bug.consoleErrors.map((err: string, i: number) => (
                  <p key={i} className="text-[10px] font-mono text-red-600 bg-red-50 px-2 py-1 rounded">{err}</p>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Network failures */}
          {bug.networkFailures && bug.networkFailures.length > 0 && (
            <CollapsibleSection title={`Network Failures (${bug.networkFailures.length})`} icon={Globe}>
              <div className="mt-2 space-y-1">
                {bug.networkFailures.map((f: any, i: number) => (
                  <div key={i} className="text-[10px] font-mono bg-amber-50 px-2 py-1 rounded flex items-center gap-2">
                    <span className="text-amber-700 font-medium">{f.status || 'ERR'}</span>
                    <span className="text-[#374151] truncate">{f.url || f}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* DOM diff */}
          {bug.domDiff && (
            <CollapsibleSection title="DOM Diff" icon={Code}>
              <pre className="mt-2 text-[10px] font-mono text-[#374151] bg-[#F5F3FF] rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap">
                {bug.domDiff}
              </pre>
            </CollapsibleSection>
          )}

          {/* Historical failure count & source agent */}
          <div className="flex items-center gap-4 pt-1">
            {bug.historicalFailureCount != null && (
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <History className="w-3.5 h-3.5" />
                <span>{bug.historicalFailureCount} historical failure{bug.historicalFailureCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {bug.sourceAgent && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">{bug.sourceAgent}</span>
              </div>
            )}
          </div>

          {/* Status actions */}
          {onStatusChange && (
            <div className="flex gap-2 pt-2 border-t border-[#EDE9FE]/50">
              {bug.status === 'open' && (
                <>
                  <button onClick={() => onStatusChange(bug.id, 'confirmed')} className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium transition-colors">Confirm Bug</button>
                  <button onClick={() => onStatusChange(bug.id, 'not_a_bug')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">Not a Bug</button>
                </>
              )}
              {bug.status === 'confirmed' && (
                <button onClick={() => onStatusChange(bug.id, 'fixed')} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition-colors">Mark Fixed</button>
              )}
              {(bug.status === 'fixed' || bug.status === 'not_a_bug' || bug.status === 'wont_fix') && (
                <button onClick={() => onStatusChange(bug.id, 'open')} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium transition-colors">Reopen</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
