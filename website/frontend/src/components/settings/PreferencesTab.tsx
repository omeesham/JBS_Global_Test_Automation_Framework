import { useState } from 'react';
import { Zap, Brain, Scale, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type SpeedMode = 'fast' | 'balanced' | 'deep';

const speedOptions: { id: SpeedMode; label: string; desc: string; icon: typeof Zap }[] = [
  { id: 'fast', label: 'Fast', desc: 'Quick results, lower cost', icon: Zap },
  { id: 'balanced', label: 'Balanced', desc: 'Best mix of speed and quality', icon: Scale },
  { id: 'deep', label: 'Powerful', desc: 'Maximum quality, takes longer', icon: Brain },
];

export default function PreferencesTab() {
  const { user } = useAuth();
  const [speed, setSpeed] = useState<SpeedMode>('balanced');
  const [deepThinking, setDeepThinking] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">AI Preferences</h3>
        <p className="text-sm text-gray-500">
          Configure how {user?.displayName ?? user?.username ?? 'you'} interact with the AI pipeline.
        </p>
      </div>

      {/* Speed selector */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B4B] mb-3">AI Speed</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {speedOptions.map(({ id, label, desc, icon: Icon }) => {
            const selected = speed === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSpeed(id)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                  selected
                    ? 'border-[#7C3AED] bg-[#F5F3FF] shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#DDD6FE] hover:bg-[#EDE9FE]/30'
                }`}
              >
                <Icon
                  className={`h-7 w-7 ${selected ? 'text-[#7C3AED]' : 'text-gray-400'}`}
                />
                <span className={`text-sm font-semibold ${selected ? 'text-[#7C3AED]' : 'text-[#1E1B4B]'}`}>
                  {label}
                </span>
                <span className="text-xs text-gray-500 text-center">{desc}</span>
                {selected && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Extended Thinking toggle */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#6366F1]" />
            <div>
              <p className="text-sm font-semibold text-[#1E1B4B]">Extended Thinking</p>
              <p className="text-xs text-gray-500">
                Let the AI reason longer before answering. Better for complex test scenarios.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={deepThinking}
            onClick={() => setDeepThinking((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              deepThinking ? 'bg-[#7C3AED]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                deepThinking ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
