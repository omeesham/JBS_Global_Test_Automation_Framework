import { X, Trash2 } from 'lucide-react';
import type { StageDefinition } from '@/types';

interface NodeConfigPanelProps {
  stage: StageDefinition;
  onUpdate: (patch: Partial<StageDefinition>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function NodeConfigPanel({ stage, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  return (
    <div className="w-80 border-l bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{stage.name}</h3>
          <span className="text-[10px] text-gray-400">{stage.agent}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Config Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Model */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
          <select
            value={stage.model}
            onChange={e => onUpdate({ model: e.target.value })}
            className="w-full text-sm border rounded px-2 py-1.5"
          >
            <option value="haiku">Haiku (fast, cheap)</option>
            <option value="sonnet">Sonnet (balanced)</option>
            <option value="opus">Opus (powerful)</option>
          </select>
        </div>

        {/* Budget Cap */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Budget Cap ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={stage.budgetCap}
            onChange={e => onUpdate({ budgetCap: parseFloat(e.target.value) || 0 })}
            className="w-full text-sm border rounded px-2 py-1.5"
          />
        </div>

        {/* Retries */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Retries (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={stage.retries}
            onChange={e => onUpdate({ retries: parseInt(e.target.value) || 0 })}
            className="w-full text-sm border rounded px-2 py-1.5"
          />
        </div>

        {/* Timeout */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Timeout (seconds)</label>
          <input
            type="number"
            min="30"
            max="3600"
            value={stage.timeoutSeconds}
            onChange={e => onUpdate({ timeoutSeconds: parseInt(e.target.value) || 300 })}
            className="w-full text-sm border rounded px-2 py-1.5"
          />
        </div>

        {/* Max Turns */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max Turns (1-100)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={stage.maxTurns}
            onChange={e => onUpdate({ maxTurns: parseInt(e.target.value) || 50 })}
            className="w-full text-sm border rounded px-2 py-1.5"
          />
        </div>

        {/* Approval Mode */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Approval Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ approvalMode: 'auto' })}
              className={`flex-1 text-xs py-1.5 rounded border ${stage.approvalMode !== 'manual' ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white text-gray-500'}`}
            >
              Auto
            </button>
            <button
              onClick={() => onUpdate({ approvalMode: 'manual' })}
              className={`flex-1 text-xs py-1.5 rounded border ${stage.approvalMode === 'manual' ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white text-gray-500'}`}
            >
              Manual
            </button>
          </div>
        </div>

        {/* Enabled */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">Enabled</label>
          <button
            onClick={() => onUpdate({ enabled: !stage.enabled })}
            className={`relative w-10 h-5 rounded-full transition-colors ${stage.enabled ? 'bg-violet-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${stage.enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* Description (read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <p className="text-xs text-gray-400 bg-gray-50 rounded p-2">{stage.description || 'No description'}</p>
        </div>
      </div>

      {/* Delete Button */}
      <div className="p-4 border-t">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded py-2 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove from Pipeline
        </button>
      </div>
    </div>
  );
}
