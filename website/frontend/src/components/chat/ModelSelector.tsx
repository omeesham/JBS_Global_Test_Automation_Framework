import React from 'react';

type Model = 'haiku' | 'sonnet' | 'opus';

interface ModelSelectorProps {
  model: Model;
  onModelChange: (m: Model) => void;
  thinking: boolean;
  onThinkingChange: (t: boolean) => void;
}

const models: { key: Model; label: string; speed: string }[] = [
  { key: 'haiku', label: 'Fast', speed: 'Quick' },
  { key: 'sonnet', label: 'Balanced', speed: 'Standard' },
  { key: 'opus', label: 'Powerful', speed: 'Thorough' },
];

function ModelSelector({ model, onModelChange, thinking, onThinkingChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-1 rounded-lg bg-gray-200 p-0.5">
        {models.map(({ key, label, speed }) => (
          <button
            key={key}
            onClick={() => onModelChange(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              model === key
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
            }`}
          >
            {label}
            <span className="ml-1 opacity-70">{speed}</span>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-xs text-gray-500 font-medium">Extended Thinking</span>
        <button
          role="switch"
          aria-checked={thinking}
          onClick={() => onThinkingChange(!thinking)}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            thinking ? 'bg-violet-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              thinking ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </label>
    </div>
  );
}

export default ModelSelector;
