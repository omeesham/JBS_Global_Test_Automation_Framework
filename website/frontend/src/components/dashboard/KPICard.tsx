import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  icon: LucideIcon;
  color: string;
}

export default function KPICard({ title, value, suffix = '', trend, icon: Icon, color }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5 hover:shadow-lg hover:shadow-purple-500/5 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-[#1E1B4B]">
            {value}{suffix}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
