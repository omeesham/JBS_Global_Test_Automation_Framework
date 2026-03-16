import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import api from '@/services/api';

export default function DashboardBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session cache
    const cached = sessionStorage.getItem('dashboard_briefing');
    if (cached) {
      setBriefing(cached);
      setLoading(false);
      return;
    }

    api.get('/dashboard/summary')
      .then(({ data }) => {
        setBriefing(data.briefing);
        sessionStorage.setItem('dashboard_briefing', data.briefing);
      })
      .catch(() => setBriefing(null))
      .finally(() => setLoading(false));
  }, []);

  if (dismissed || (!loading && !briefing)) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#EDE9FE] to-[#DDD6FE]/50 rounded-xl border border-[#DDD6FE] p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-[#7C3AED]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#7C3AED] mb-1">Morning Briefing</p>
        <p className="text-sm text-[#1E1B4B] leading-relaxed">
          {loading ? 'Generating briefing...' : briefing}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-[#7C3AED]/10 transition-colors"
      >
        <X className="w-4 h-4 text-[#6B7280]" />
      </button>
    </div>
  );
}
