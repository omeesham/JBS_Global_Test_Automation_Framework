import { useState } from 'react';
import { Settings2, Eye, Cpu } from 'lucide-react';

type CostVisibility = 'hidden' | 'admin_only' | 'all_users' | 'credits_mode';
type DefaultModel = 'fast' | 'balanced' | 'deep';

const costOptions: { value: CostVisibility; label: string }[] = [
  { value: 'hidden', label: 'Hidden — No one sees costs' },
  { value: 'admin_only', label: 'Admin Only — Only admins see costs' },
  { value: 'all_users', label: 'All Users — Everyone sees costs' },
  { value: 'credits_mode', label: 'Credits Mode — Show as credits, not dollars' },
];

const modelOptions: { value: DefaultModel; label: string }[] = [
  { value: 'fast', label: 'Fast — Haiku (cheapest, quickest)' },
  { value: 'balanced', label: 'Balanced — Sonnet (recommended)' },
  { value: 'deep', label: 'Powerful — Opus (highest quality)' },
];

export default function PlatformConfigTab() {
  const [productName, setProductName] = useState('IntelliQE');
  const [costVisibility, setCostVisibility] = useState<CostVisibility>('admin_only');
  const [defaultModel, setDefaultModel] = useState<DefaultModel>('balanced');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">Platform Configuration</h3>
        <p className="text-sm text-gray-500">Global settings that affect all users on this platform.</p>
      </div>

      {/* Product Name */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
            <Settings2 className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1E1B4B]">Product Name</p>
            <p className="text-xs text-gray-500">Displayed throughout the application</p>
          </div>
        </div>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
        />
      </div>

      {/* Cost Visibility */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
            <Eye className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1E1B4B]">Cost Visibility</p>
            <p className="text-xs text-gray-500">Control who can see AI usage costs</p>
          </div>
        </div>
        <select
          value={costVisibility}
          onChange={(e) => setCostVisibility(e.target.value as CostVisibility)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
        >
          {costOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Default Model */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
            <Cpu className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1E1B4B]">Default AI Model</p>
            <p className="text-xs text-gray-500">The default model assigned to new users</p>
          </div>
        </div>
        <select
          value={defaultModel}
          onChange={(e) => setDefaultModel(e.target.value as DefaultModel)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
        >
          {modelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-400 text-center">
        These settings are placeholders and are not connected to the backend yet.
      </p>
    </div>
  );
}
