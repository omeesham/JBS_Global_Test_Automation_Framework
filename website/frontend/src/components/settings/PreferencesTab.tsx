import { useState, useEffect } from 'react';
import { Zap, Brain, Scale, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type ModelKey = 'haiku' | 'sonnet' | 'opus';

const speedOptions: { model: ModelKey; label: string; desc: string; icon: typeof Zap }[] = [
  { model: 'haiku', label: 'Fast', desc: 'Quick results, lower cost', icon: Zap },
  { model: 'sonnet', label: 'Balanced', desc: 'Best mix of speed and quality', icon: Scale },
  { model: 'opus', label: 'Smart', desc: 'Maximum quality, takes longer', icon: Brain },
];

export default function PreferencesTab() {
  const { user } = useAuth();
  const [model, setModel] = useState<ModelKey>('sonnet');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch current preference on mount
  useEffect(() => {
    fetch('/api/chat/preferences', {
      headers: { 'x-auth-token': sessionStorage.getItem('intelliqe_token') || '' },
    })
      .then(r => r.json())
      .then(data => {
        if (data.preferred_model) setModel(data.preferred_model);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (selected: ModelKey) => {
    setModel(selected);
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/chat/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('intelliqe_token') || '',
        },
        body: JSON.stringify({ preferred_model: selected }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silently fail — local state still updated
    }
    setSaving(false);
  };

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
        <div className="flex items-center gap-2 mb-3">
          <label className="block text-sm font-medium text-[#1E1B4B]">AI Speed</label>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {saving && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            // Skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-gray-100 p-5 animate-pulse">
                <div className="h-7 w-7 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-1" />
                <div className="h-3 w-24 bg-gray-100 rounded mx-auto" />
              </div>
            ))
          ) : (
            speedOptions.map(({ model: m, label, desc, icon: Icon }) => {
              const selected = model === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelect(m)}
                  disabled={saving}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
                    selected
                      ? 'border-[#7C3AED] bg-[#F5F3FF] shadow-md'
                      : 'border-gray-200 bg-white hover:border-[#DDD6FE] hover:bg-[#EDE9FE]/30'
                  } ${saving ? 'opacity-60 cursor-wait' : ''}`}
                >
                  <Icon className={`h-7 w-7 ${selected ? 'text-[#7C3AED]' : 'text-gray-400'}`} />
                  <span className={`text-sm font-semibold ${selected ? 'text-[#7C3AED]' : 'text-[#1E1B4B]'}`}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 text-center">{desc}</span>
                  {selected && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
