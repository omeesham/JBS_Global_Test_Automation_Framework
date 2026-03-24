import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Target, DollarSign, Bug } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchBugStats } from '@/services/bugApi';

interface Props {
  usage: {
    totalRuns: number;
    completedRuns: number;
    totalCost: number;
  } | null;
  onCardClick?: (action: string) => void;
}

export default function RunKPIBar({ usage, onCardClick }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'client_admin';
  const [bugCount, setBugCount] = useState(0);

  useEffect(() => {
    fetchBugStats().then(s => setBugCount(s.totalOpen + s.totalConfirmed)).catch(() => {});
  }, []);

  const passRate = usage && usage.totalRuns > 0
    ? Math.round((usage.completedRuns / usage.totalRuns) * 100)
    : 0;

  const cards = [
    { label: 'Total Runs', value: usage?.totalRuns ?? 0, icon: Activity, color: 'bg-[#EDE9FE] text-[#7C3AED]', action: 'total-runs' },
    { label: 'Completed', value: usage?.completedRuns ?? 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', action: 'completed' },
    { label: 'Pass Rate', value: `${passRate}%`, icon: Target, color: 'bg-[#F5F3FF] text-[#6366F1]', action: 'pass-rate' },
    { label: 'Bugs Found', value: bugCount, icon: Bug, color: 'bg-red-50 text-red-600', action: 'bugs-found' },
    ...(isAdmin ? [{ label: 'Total Cost', value: `$${(usage?.totalCost ?? 0).toFixed(2)}`, icon: DollarSign, color: 'bg-amber-50 text-amber-600', action: '' }] : []),
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={() => card.action && onCardClick?.(card.action)}
          className={`bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-4 hover:shadow-lg hover:shadow-purple-500/5 transition-all ${card.action ? 'cursor-pointer hover:border-[#7C3AED]/40' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-xl font-bold text-[#1E1B4B]">{card.value}</p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
