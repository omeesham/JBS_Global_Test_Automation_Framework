import { useState, useEffect } from 'react';
import { AlertTriangle, Eye, FastForward, X } from 'lucide-react';
import { fetchEscalations, type Escalation } from '@/services/escalationApi';

interface Props {
  onReviewEscalation?: (escalation: Escalation) => void;
  onForceContinue?: (escalation: Escalation) => void;
}

export default function EscalationBanner({ onReviewEscalation, onForceContinue }: Props) {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [confirmForce, setConfirmForce] = useState<string | null>(null);

  useEffect(() => {
    fetchEscalations('open')
      .then(res => setEscalations(res.escalations))
      .catch(() => { /* banner is optional */ });
  }, []);

  const visible = escalations.filter(e => !dismissed.has(e.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map(esc => (
        <div
          key={esc.id}
          className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-800">
              <span className="font-medium">Big change detected in {esc.module}</span>
              {' — '}
              {esc.targetAgent} needs to rework before healing can proceed.
            </p>
            {esc.reason && (
              <p className="text-[10px] text-amber-600 mt-0.5 truncate">{esc.reason}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {confirmForce === esc.id ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                <span className="text-[10px] text-red-700">Force past this?</span>
                <button
                  onClick={() => { onForceContinue?.(esc); setDismissed(p => new Set(p).add(esc.id)); setConfirmForce(null); }}
                  className="text-[10px] font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded hover:bg-red-200"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmForce(null)}
                  className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hover:bg-gray-200"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onReviewEscalation?.(esc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                >
                  <Eye className="w-3 h-3" /> Review
                </button>
                <button
                  onClick={() => setConfirmForce(esc.id)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <FastForward className="w-3 h-3" /> Force Continue
                </button>
              </>
            )}
            <button
              onClick={() => setDismissed(p => new Set(p).add(esc.id))}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-amber-100 transition-colors"
            >
              <X className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
