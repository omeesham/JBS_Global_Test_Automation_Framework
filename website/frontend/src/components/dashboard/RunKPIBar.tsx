import { Activity, CheckCircle2, Target, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  usage: {
    totalRuns: number;
    completedRuns: number;
    totalCost: number;
  } | null;
}

export default function RunKPIBar({ usage }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'client_admin';

  const passRate = usage && usage.totalRuns > 0
    ? Math.round((usage.completedRuns / usage.totalRuns) * 100)
    : 0;

  const cards = [
    { label: 'Total Runs', value: usage?.totalRuns ?? 0, icon: Activity, color: 'bg-[#EDE9FE] text-[#7C3AED]' },
    { label: 'Completed', value: usage?.completedRuns ?? 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pass Rate', value: `${passRate}%`, icon: Target, color: 'bg-[#F5F3FF] text-[#6366F1]' },
    ...(isAdmin ? [{ label: 'Total Cost', value: `$${(usage?.totalCost ?? 0).toFixed(2)}`, icon: DollarSign, color: 'bg-amber-50 text-amber-600' }] : []),
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-4 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
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
