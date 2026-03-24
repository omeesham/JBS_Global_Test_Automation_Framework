import { useState } from 'react';
import { ChevronDown, Wand2 } from 'lucide-react';

type Model = 'haiku' | 'sonnet' | 'opus';

interface AgentOption {
  id: string;
  name: string;
  defaultModel: Model;
  description: string;
  standalone?: boolean;
}

export const PIPELINE_CHAIN = ['requirements', 'planning', 'generation', 'audit'] as const;

const AGENTS: AgentOption[] = [
  { id: 'auto',         name: 'Auto',         defaultModel: 'sonnet', description: 'Auto-detect which agent to start from' },
  { id: 'requirements', name: 'Requirements', defaultModel: 'sonnet', description: 'Explore UI & capture selectors' },
  { id: 'planning',     name: 'Planner',      defaultModel: 'sonnet', description: 'Create test cases from requirements' },
  { id: 'generation',   name: 'Generator',    defaultModel: 'sonnet', description: 'Generate Playwright spec files' },
  { id: 'audit',        name: 'Audit',        defaultModel: 'sonnet', description: 'Quality check all artifacts' },
  { id: 'healing',      name: 'Healer',       defaultModel: 'sonnet', description: 'Fix broken tests (post-prod)', standalone: true },
];

const MODEL_OPTIONS: { key: Model; label: string }[] = [
  { key: 'haiku', label: 'Fast' },
  { key: 'sonnet', label: 'Balanced' },
  { key: 'opus', label: 'Smart' },
];

const MODEL_LABELS: Record<Model, string> = {
  haiku: 'Fast',
  sonnet: 'Balanced',
  opus: 'Smart',
};

interface AgentSelectorProps {
  selectedAgent: string | null;
  selectedModel: Model | null;
  executionMode: 'auto' | 'manual';
  onSelect: (agentId: string | null, model: Model | null) => void;
  onModeChange: (mode: 'auto' | 'manual') => void;
}

export default function AgentSelector({
  selectedAgent,
  selectedModel,
  executionMode,
  onSelect,
  onModeChange,
}: AgentSelectorProps) {
  const [showModels, setShowModels] = useState(false);
  const selected = AGENTS.find(a => a.id === selectedAgent);
  const currentModel: Model = selectedModel || selected?.defaultModel || 'sonnet';

  const chainAgents = AGENTS.filter(a => !a.standalone);
  const standaloneAgents = AGENTS.filter(a => a.standalone);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
      {/* Auto / Manual toggle */}
      <div className="flex rounded-lg bg-gray-200/70 p-0.5 flex-shrink-0">
        <button
          onClick={() => onModeChange('auto')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
            executionMode === 'auto'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Auto
        </button>
        <button
          onClick={() => onModeChange('manual')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
            executionMode === 'manual'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manual
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

      {/* Agent pills — chain agents */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {chainAgents.map(agent => {
          const isAuto = agent.id === 'auto';
          const isSelected = selectedAgent === agent.id;

          return (
            <button
              key={agent.id}
              onClick={() => {
                if (isSelected) {
                  onSelect(null, null);
                } else {
                  onSelect(agent.id, agent.defaultModel);
                }
                setShowModels(false);
              }}
              title={agent.description}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? isAuto
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                    : 'bg-violet-600 text-white shadow-sm'
                  : isAuto
                    ? 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {isAuto && <Wand2 className="w-3 h-3" />}
              {agent.name}
            </button>
          );
        })}
      </div>

      {/* Separator before standalone */}
      {standaloneAgents.length > 0 && (
        <div className="w-px h-5 bg-gray-300 flex-shrink-0" />
      )}

      {/* Standalone agents (Healer) */}
      {standaloneAgents.map(agent => (
        <button
          key={agent.id}
          onClick={() => {
            if (selectedAgent === agent.id) {
              onSelect(null, null);
            } else {
              onSelect(agent.id, agent.defaultModel);
            }
            setShowModels(false);
          }}
          title={agent.description}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            selectedAgent === agent.id
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-600 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          {agent.name}
        </button>
      ))}

      {/* Model dropdown — ALWAYS visible */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowModels(!showModels)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-violet-600 hover:bg-violet-50 transition-colors"
        >
          {MODEL_LABELS[currentModel]}
          <ChevronDown className={`w-3 h-3 transition-transform ${showModels ? 'rotate-180' : ''}`} />
        </button>
        {showModels && (
          <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[100px]">
            {MODEL_OPTIONS.map(m => (
              <button
                key={m.key}
                onClick={() => {
                  if (selected) {
                    onSelect(selected.id, m.key);
                  } else {
                    onSelect(null, m.key);
                  }
                  setShowModels(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-violet-50 transition-colors ${
                  currentModel === m.key ? 'text-violet-600 font-semibold' : 'text-gray-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
