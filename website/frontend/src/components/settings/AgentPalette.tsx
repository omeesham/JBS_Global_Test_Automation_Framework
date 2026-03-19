import { useState, useEffect } from 'react';
import { Search, GripVertical } from 'lucide-react';
import type { AgentType, StageDefinition } from '@/types';
import { getAgentTypes } from '@/services/encoreApi';

interface AgentPaletteProps {
  /** Stage IDs already in the pipeline (shown as "In Pipeline") */
  usedAgentIds: Set<string>;
  /** Called when an agent is dragged onto the canvas */
  onAddStage: (stage: StageDefinition) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Agents',
  testing: 'Testing',
  security: 'Security',
  data: 'Data',
  custom: 'Custom',
};

export default function AgentPalette({ usedAgentIds, onAddStage }: AgentPaletteProps) {
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentTypes().then(setAgents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, AgentType[]>>((acc, a) => {
    const cat = a.category || 'custom';
    (acc[cat] ??= []).push(a);
    return acc;
  }, {});

  function handleDragStart(e: React.DragEvent, agent: AgentType) {
    e.dataTransfer.setData('application/pipeline-agent', JSON.stringify(agent));
    e.dataTransfer.effectAllowed = 'copy';
  }

  function handleClick(agent: AgentType) {
    if (usedAgentIds.has(agent.id)) return;
    const newStage: StageDefinition = {
      id: agent.id,
      name: agent.name,
      agent: agent.id,
      agentFile: agent.agentFile,
      model: agent.defaultModel,
      enabled: true,
      maxTurns: 50,
      budgetCap: 0.5,
      retries: 0,
      timeoutSeconds: 300,
      next: {},
      description: agent.description,
      preRunGate: '',
      postCompleteGate: '',
    };
    onAddStage(newStage);
  }

  if (loading) {
    return <div className="w-60 border-r p-4 text-sm text-gray-400">Loading agents...</div>;
  }

  return (
    <div className="w-60 border-r bg-gray-50 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Agent Palette</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs border rounded bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {Object.entries(grouped).map(([category, categoryAgents]) => (
          <div key={category}>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase px-1 mb-1">
              {CATEGORY_LABELS[category] || category}
            </h4>
            <div className="space-y-1">
              {categoryAgents.map(agent => {
                const inPipeline = usedAgentIds.has(agent.id);
                return (
                  <div
                    key={agent.id}
                    draggable={!inPipeline}
                    onDragStart={e => handleDragStart(e, agent)}
                    onClick={() => handleClick(agent)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors
                      ${inPipeline
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-white border cursor-grab hover:border-violet-300 hover:bg-violet-50 active:cursor-grabbing'
                      }
                      ${!agent.enabled ? 'opacity-50' : ''}
                    `}
                  >
                    {!inPipeline && <GripVertical className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{agent.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{agent.defaultModel}</div>
                    </div>
                    {inPipeline && (
                      <span className="text-[9px] bg-violet-100 text-violet-600 px-1 rounded flex-shrink-0">
                        In Pipeline
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
