import { PieChart, BarChart3, TrendingUp, Clock } from 'lucide-react';
import type { PipelineRun } from '@/types';

interface Props {
  runs: PipelineRun[];
}

const charts = [
  { label: 'Pass / Fail Rate', icon: PieChart, description: 'Pie chart of pass vs fail distribution' },
  { label: 'Runs Over Time', icon: TrendingUp, description: 'Line chart of daily run volume' },
  { label: 'Cost Trend', icon: BarChart3, description: 'Bar chart of cost per day' },
  { label: 'Stage Duration', icon: Clock, description: 'Average duration per pipeline stage' },
] as const;

export default function ChartSection({ runs }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1E1B4B] mb-3">Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charts.map((chart) => (
          <div
            key={chart.label}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5 flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-3">
              <chart.icon className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <p className="text-sm font-medium text-[#1E1B4B] mb-1">{chart.label}</p>
            <p className="text-[10px] text-[#6B7280] text-center">{chart.description}</p>
            <div className="mt-3 px-3 py-1.5 bg-[#F5F3FF] rounded-full">
              <span className="text-[10px] text-[#7C3AED] font-medium">
                {runs.length} run{runs.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
