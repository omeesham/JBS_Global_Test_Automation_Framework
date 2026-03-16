import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { QualityTrend } from '@/types';

interface Props {
  data: QualityTrend[];
}

export default function QualityChart({ data }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-5">
      <h3 className="text-sm font-semibold text-[#1E1B4B] mb-4">Quality Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#A5B4FC' }} stroke="#DDD6FE" />
            <YAxis tick={{ fontSize: 12, fill: '#A5B4FC' }} stroke="#DDD6FE" domain={[80, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #DDD6FE',
                fontSize: '12px',
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 8px 32px rgba(124,58,237,0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="passRate" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: '#7C3AED' }} activeDot={{ r: 6, fill: '#7C3AED', stroke: '#EDE9FE', strokeWidth: 3 }} name="Pass Rate %" />
            <Line type="monotone" dataKey="coverage" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4, fill: '#06B6D4' }} activeDot={{ r: 6, fill: '#06B6D4', stroke: '#ECFEFF', strokeWidth: 3 }} name="Coverage %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
