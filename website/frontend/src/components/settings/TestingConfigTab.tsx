import { useState } from 'react';
import { Globe, Server, DollarSign } from 'lucide-react';

interface ToggleRowProps {
  icon: typeof Globe;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon: Icon, label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
          <Icon className="h-5 w-5 text-[#6366F1]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1E1B4B]">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          enabled ? 'bg-[#7C3AED]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function TestingConfigTab() {
  const [webTesting, setWebTesting] = useState(true);
  const [apiTesting, setApiTesting] = useState(false);
  const [budget, setBudget] = useState(2);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">Testing Configuration</h3>
        <p className="text-sm text-gray-500">Choose which testing capabilities are active for your project.</p>
      </div>

      {/* Service Toggles */}
      <div className="space-y-3">
        <ToggleRow
          icon={Globe}
          label="Web Testing"
          description="Browser-based UI tests for your web application"
          enabled={webTesting}
          onToggle={() => setWebTesting((v) => !v)}
        />
        <ToggleRow
          icon={Server}
          label="API Testing"
          description="Automated tests for your REST and GraphQL endpoints"
          enabled={apiTesting}
          onToggle={() => setApiTesting((v) => !v)}
        />
      </div>

      {/* Budget Slider */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
            <DollarSign className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1E1B4B]">Budget Per Run</p>
            <p className="text-xs text-gray-500">Maximum AI cost allowed for a single test run</p>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[#7C3AED]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>$0.50</span>
            <span className="text-sm font-semibold text-[#7C3AED]">${budget.toFixed(2)}</span>
            <span>$10.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
