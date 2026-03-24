import { useMemo, useState, useEffect, useCallback, memo } from 'react';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  type Node,
  type Edge,
  Position,
  Handle,
  type NodeProps,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@/styles/pipeline-animations.css';
import { CheckCircle2, XCircle, Circle, Loader2, AlertTriangle, Clock } from 'lucide-react';
import type { StageResult, PipelineDefinition } from '@/types';
import type { PipelineStageState } from '@/hooks/usePipelineSSE';
import { computePipelineLayout } from '@/utils/pipeline-layout';
import AnimatedEdge from './AnimatedEdge';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_triage' | 'fixme';

interface StageNodeData {
  label: string;
  stageId: string;
  status: StageStatus;
  model?: string;
  cost?: number;
  duration?: number;
  agent?: string;
  detail?: string;
  showCost?: boolean;
  heroMode?: boolean;
  [key: string]: unknown;
}

interface PipelineGraphProps {
  /** Live stages from SSE (running pipeline) */
  liveStages?: PipelineStageState[];
  /** Completed run stage results */
  stageResults?: StageResult[];
  /** Current pipeline status */
  pipelineStatus?: string;
  /** Current stage the pipeline is on */
  currentStage?: string;
  /** Whether to show cost data (admin only) */
  showCost?: boolean;
  /** Hero mode — larger nodes, taller container, more visual impact */
  heroMode?: boolean;
  /** Compact mode — smaller for headers/banners */
  compactMode?: boolean;
  /** Callback when a node is clicked */
  onNodeClick?: (stageId: string) => void;
  /** Per-client pipeline definition — when provided, renders dynamic topology instead of hardcoded */
  pipelineDefinition?: PipelineDefinition;
}

/* ------------------------------------------------------------------ */
/* Stage Definitions (topology)                                        */
/* ------------------------------------------------------------------ */

/** Pipeline stages — linear flow: Requirements → Planner → Generator → Audit → Done */
const STAGE_META: Record<string, { name: string; model: string }> = {
  requirements: { name: 'Requirements', model: 'sonnet' },
  planning:     { name: 'Planner',      model: 'sonnet' },
  generation:   { name: 'Generator',    model: 'sonnet' },
  audit:        { name: 'Audit',        model: 'sonnet' },
};

/** Healer is a standalone post-production tool — NOT in the normal pipeline */
const STANDALONE_AGENTS: Record<string, { name: string; model: string; label: string }> = {
  healing: { name: 'Healer', model: 'sonnet', label: 'post-prod' },
};

/** Fixed positions — linear layout */
const POSITIONS: Record<string, { x: number; y: number }> = {
  requirements: { x: 0,   y: 130 },
  planning:     { x: 220, y: 130 },
  generation:   { x: 440, y: 130 },
  audit:        { x: 660, y: 130 },
};

/** Hero mode: spread nodes further apart for visual impact */
const HERO_POSITIONS: Record<string, { x: number; y: number }> = {
  requirements: { x: 0,   y: 140 },
  planning:     { x: 260, y: 140 },
  generation:   { x: 520, y: 140 },
  audit:        { x: 780, y: 140 },
};

/** Pipeline edges — linear: req → plan → gen → audit → done. Selector loop back to planner. */
const EDGE_DEFS: { id: string; source: string; target: string; label: string }[] = [
  { id: 'req-plan',     source: 'requirements', target: 'planning',   label: '' },
  { id: 'plan-gen',     source: 'planning',     target: 'generation', label: '' },
  { id: 'gen-audit',    source: 'generation',   target: 'audit',      label: '' },
  { id: 'gen-plan',     source: 'generation',   target: 'planning',   label: 'selectors' },
  { id: 'audit-done',   source: 'audit',        target: 'completed',  label: '' },
];

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */

const statusClasses: Record<StageStatus, string> = {
  pending:          'border-gray-300 bg-white pipeline-node-pending',
  running:          'border-violet-500 bg-violet-50 pipeline-node-running',
  completed:        'border-emerald-400 bg-emerald-50',
  failed:           'border-red-400 bg-red-50',
  awaiting_triage:  'border-amber-400 bg-amber-50 pipeline-awaiting-action',
  fixme:            'border-red-400 bg-red-50',
};

const StatusIcon = ({ status, hero }: { status: StageStatus; hero?: boolean }) => {
  const sz = hero ? 'w-5 h-5' : 'w-4 h-4';
  switch (status) {
    case 'running':
      return (
        <div className="relative">
          <Loader2 className={`${sz} text-violet-600 animate-spin`} />
          <svg className="absolute -inset-1 pipeline-progress-ring" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="rgba(124,58,237,0.3)" strokeWidth="2" strokeDasharray="75" strokeDashoffset="0" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'completed':
      return <CheckCircle2 className={`${sz} text-emerald-500 pipeline-check-bounce`} />;
    case 'failed':
    case 'fixme':
      return <XCircle className={`${sz} text-red-500`} />;
    case 'awaiting_triage':
      return <AlertTriangle className={`${sz} text-amber-500`} />;
    default:
      return <Circle className={`${sz} text-gray-400`} />;
  }
};

/* ------------------------------------------------------------------ */
/* Custom Node                                                         */
/* ------------------------------------------------------------------ */

const StageNode = memo(({ data }: NodeProps) => {
  const d = data as StageNodeData;
  const isRunning = d.status === 'running';
  const hero = d.heroMode;
  const nodeWidth = hero ? 'min-w-[180px]' : 'min-w-[140px]';
  const padding = hero ? 'px-5 py-4' : 'px-4 py-3';

  return (
    <div
      className={`relative ${padding} rounded-xl border-2 ${nodeWidth} text-center pipeline-node-base ${statusClasses[d.status]}`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-violet-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-violet-400 !border-0" />

      {/* Content */}
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <StatusIcon status={d.status} hero={hero} />
        <span className={`${hero ? 'text-sm' : 'text-xs'} font-semibold text-[#1E1B4B]`}>{d.label}</span>
      </div>

      {d.model && (
        <span className={`${hero ? 'text-xs' : 'text-[10px]'} text-violet-400 block`}>{d.model}</span>
      )}

      {((d.showCost && d.cost !== undefined) || d.duration !== undefined) && (
        <div className={`flex items-center justify-center gap-2 mt-1 ${hero ? 'text-xs' : 'text-[10px]'} text-gray-500`}>
          {d.showCost && d.cost !== undefined && <span>${d.cost.toFixed(3)}</span>}
          {d.duration !== undefined && <span>{d.duration}s</span>}
        </div>
      )}

      {isRunning && d.detail && d.detail !== 'Pending' && d.detail !== 'In progress...' && (
        <p className={`mt-1 ${hero ? 'text-xs max-w-[200px]' : 'text-[10px] max-w-[160px]'} text-violet-600 truncate pipeline-detail-fade`}>{d.detail}</p>
      )}
    </div>
  );
});
StageNode.displayName = 'StageNode';

/* Terminal "completed" node */
const TerminalNode = memo(({ data }: NodeProps) => {
  const d = data as { label: string; status: string; heroMode?: boolean; [key: string]: unknown };
  const isDone = d.status === 'completed';
  const hero = d.heroMode;
  return (
    <div className={`${hero ? 'px-4 py-3' : 'px-3 py-2'} rounded-full border-2 text-center pipeline-node-base ${isDone ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-white pipeline-node-pending'}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-emerald-400 !border-0" />
      <div className="flex items-center gap-1.5">
        {isDone
          ? <CheckCircle2 className={`${hero ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-emerald-500 pipeline-check-bounce`} />
          : <Clock className={`${hero ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-gray-400`} />}
        <span className={`${hero ? 'text-xs' : 'text-[10px]'} font-semibold text-[#1E1B4B]`}>{d.label}</span>
      </div>
    </div>
  );
});
TerminalNode.displayName = 'TerminalNode';

const nodeTypes = { stage: StageNode, terminal: TerminalNode };
const edgeTypes = { animated: AnimatedEdge };

/* ------------------------------------------------------------------ */
/* Elapsed Timer Overlay                                               */
/* Renders OUTSIDE ReactFlow to avoid memo conflicts                   */
/* ------------------------------------------------------------------ */

function ElapsedTimerOverlay({
  liveStages,
  positions,
  heroMode,
  viewport,
}: {
  liveStages?: PipelineStageState[];
  positions: Record<string, { x: number; y: number }>;
  heroMode: boolean;
  viewport: { x: number; y: number; zoom: number };
}) {
  const [now, setNow] = useState(Date.now());

  // Find stages that are currently running and have startedAt
  const runningStages = useMemo(
    () => (liveStages || []).filter(s => s.status === 'running' && s.startedAt),
    [liveStages],
  );

  // Tick every second only when there are running stages
  useEffect(() => {
    if (runningStages.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [runningStages.length]);

  if (runningStages.length === 0) return null;

  const { x: vx, y: vy, zoom } = viewport;

  return (
    <>
      {runningStages.map(stage => {
        const pos = positions[stage.key];
        if (!pos) return null;

        const elapsed = Math.floor((now - (stage.startedAt || now)) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = minutes > 0
          ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
          : `${seconds}s`;

        // Transform node position to screen coordinates via viewport
        const nodeWidth = heroMode ? 180 : 140;
        const screenX = pos.x * zoom + vx + (nodeWidth / 2) * zoom;
        // Position below the node
        const nodeHeight = heroMode ? 70 : 55;
        const screenY = pos.y * zoom + vy + nodeHeight * zoom + 4;

        return (
          <div
            key={stage.key}
            className="absolute pointer-events-none pipeline-timer-fade"
            style={{
              left: screenX,
              top: screenY,
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <span className={`${heroMode ? 'text-xs' : 'text-[10px]'} font-mono font-semibold text-violet-600 bg-white/90 px-1.5 py-0.5 rounded-md shadow-sm border border-violet-200`}>
              {timeStr}
            </span>
          </div>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component (inner — requires ReactFlowProvider)                 */
/* ------------------------------------------------------------------ */

function PipelineGraphInner({
  liveStages, stageResults, pipelineStatus, currentStage,
  showCost = false, heroMode = false, compactMode = false, onNodeClick,
  pipelineDefinition,
}: PipelineGraphProps) {
  const isDynamic = !!pipelineDefinition?.stages?.length;

  /** Derive dynamic stage meta + layout from definition (when provided) */
  const dynamicLayout = useMemo(() => {
    if (!isDynamic) return null;
    const enabledCount = pipelineDefinition!.stages.filter(s => s.enabled).length;
    const spacing = enabledCount > 6
      ? { ranksep: heroMode ? 130 : 100, nodesep: heroMode ? 60 : 48 }
      : { ranksep: heroMode ? 160 : 120, nodesep: heroMode ? 80 : 60 };
    const layout = computePipelineLayout(
      pipelineDefinition!.stages,
      pipelineDefinition!.terminalStates,
      spacing,
    );
    // Build position map and stage meta from dagre output
    const positionMap: Record<string, { x: number; y: number }> = {};
    const stageMeta: Record<string, { name: string; model: string }> = {};
    for (const node of layout.nodes) {
      positionMap[node.id] = node.position;
      if (node.data && 'model' in node.data) {
        stageMeta[node.id] = { name: String(node.data.label || node.id), model: String(node.data.model || '') };
      }
    }
    return { ...layout, positionMap, stageMeta };
  }, [isDynamic, pipelineDefinition, heroMode]);

  /** Active stage IDs — from definition or hardcoded */
  const stageIds = useMemo(() => {
    if (isDynamic && pipelineDefinition) {
      return pipelineDefinition.stages.filter(s => s.enabled).map(s => s.id);
    }
    return Object.keys(STAGE_META);
  }, [isDynamic, pipelineDefinition]);

  /** Active stage meta lookup */
  const activeStageMeta = useMemo(() => {
    if (dynamicLayout) return dynamicLayout.stageMeta;
    return STAGE_META;
  }, [dynamicLayout]);

  /** Merge live SSE data + completed run data into a status map */
  const stageStatusMap = useMemo(() => {
    const map: Record<string, { status: StageStatus; cost?: number; duration?: number; model?: string; agent?: string; detail?: string }> = {};

    // Initialize all as pending
    for (const id of stageIds) {
      const meta = activeStageMeta[id];
      map[id] = { status: 'pending', model: meta?.model };
    }

    // Apply live SSE stages
    if (liveStages) {
      for (const s of liveStages) {
        if (map[s.key]) {
          map[s.key]!.status = s.status as StageStatus;
          map[s.key]!.detail = s.detail;
        }
      }
    }

    // Apply completed run stage results (overrides live)
    if (stageResults) {
      for (const s of stageResults) {
        if (map[s.stage]) {
          map[s.stage] = {
            status: 'completed',
            cost: s.cost,
            duration: s.duration,
            model: s.model,
            agent: s.agent,
          };
        }
      }
    }

    // Mark current stage from pipeline status
    if (currentStage && map[currentStage] && !stageResults?.length) {
      map[currentStage]!.status = 'running';
    }

    // Handle terminal pipeline states
    if (pipelineStatus === 'fixme' || pipelineStatus === 'failed') {
      for (let i = stageIds.length - 1; i >= 0; i--) {
        const s = map[stageIds[i]!];
        if (s && s.status === 'running') {
          s.status = 'failed';
          break;
        }
      }
    }

    if (pipelineStatus === 'awaiting_triage') {
      // Find last stage (typically audit) and mark it
      const lastStageId = stageIds[stageIds.length - 1];
      if (lastStageId) {
        const lastStatus = map[lastStageId];
        if (lastStatus && lastStatus.status !== 'pending') {
          lastStatus.status = 'awaiting_triage';
        }
      }
    }

    return map;
  }, [liveStages, stageResults, pipelineStatus, currentStage, stageIds, activeStageMeta]);

  const positions = isDynamic && dynamicLayout
    ? dynamicLayout.positionMap
    : (heroMode ? HERO_POSITIONS : POSITIONS);
  const terminalPos = heroMode ? { x: 1040, y: 40 } : { x: 880, y: 40 };

  /** Build React Flow nodes */
  const nodes = useMemo<Node[]>(() => {
    if (isDynamic && dynamicLayout) {
      // Use dagre-computed nodes with type remapping
      return dynamicLayout.nodes.map(node => {
        const s = stageStatusMap[node.id];
        const nodeType = node.type === 'stageNode' ? 'stage' : node.type === 'terminalNode' ? 'terminal' : node.type;
        const isTerminal = nodeType === 'terminal';

        return {
          ...node,
          type: nodeType,
          data: isTerminal
            ? { label: String(node.data?.label || 'Done'), status: pipelineStatus === 'completed' ? 'completed' : 'pending', heroMode }
            : {
                label: String(node.data?.label || node.id),
                stageId: node.id,
                status: s?.status || 'pending',
                model: s?.model || String(node.data?.model || ''),
                cost: s?.cost,
                duration: s?.duration,
                agent: s?.agent,
                detail: s?.detail,
                showCost,
                heroMode,
              } satisfies StageNodeData,
          draggable: false,
        };
      });
    }

    // Hardcoded fallback
    const result: Node[] = [];
    for (const [id, pos] of Object.entries(positions)) {
      const meta = STAGE_META[id] || STANDALONE_AGENTS[id];
      if (!meta) continue;
      const s = stageStatusMap[id];
      result.push({
        id,
        type: 'stage',
        position: pos,
        data: {
          label: meta.name,
          stageId: id,
          status: s?.status || 'pending',
          model: s?.model || meta.model,
          cost: s?.cost,
          duration: s?.duration,
          agent: s?.agent,
          detail: s?.detail,
          showCost,
          heroMode,
        } satisfies StageNodeData,
        draggable: false,
      });
    }

    // Terminal "completed" node
    const isCompleted = pipelineStatus === 'completed';
    result.push({
      id: 'completed',
      type: 'terminal',
      position: terminalPos,
      data: { label: 'Done', status: isCompleted ? 'completed' : 'pending', heroMode },
      draggable: false,
    });

    return result;
  }, [isDynamic, dynamicLayout, stageStatusMap, pipelineStatus, showCost, heroMode, positions, terminalPos]);

  /** Build React Flow edges */
  const edges = useMemo<Edge[]>(() => {
    const defs = (isDynamic && dynamicLayout ? dynamicLayout.edges : EDGE_DEFS) as Array<{ id: string; source: string; target: string; label?: unknown; data?: Record<string, unknown> }>;
    return defs.map(def => {
      const sourceStatus = stageStatusMap[def.source]?.status;
      const targetStatus = stageStatusMap[def.target]?.status;
      const isActive = sourceStatus === 'completed' && (targetStatus === 'running' || targetStatus === 'completed');
      const isOnPath = sourceStatus === 'completed' || sourceStatus === 'running';
      const label = typeof def.label === 'string' ? def.label : (def.data?.label ? String(def.data.label) : '');
      const isSelfLoop = def.source === def.target || !!def.data?.isSelfLoop;

      return {
        id: def.id,
        source: def.source,
        target: def.target,
        label: label || undefined,
        type: 'animated',
        data: { isActive, isOnPath, heroMode, isSelfLoop },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: heroMode ? 14 : 12,
          height: heroMode ? 14 : 12,
          color: isActive ? '#7C3AED' : isOnPath ? '#A5B4FC' : '#DDD6FE',
        },
      };
    });
  }, [isDynamic, dynamicLayout, stageStatusMap, heroMode]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.id !== 'completed') {
        onNodeClick(node.id);
      }
    },
    [onNodeClick],
  );

  const containerHeight = compactMode ? 'h-[200px]' : heroMode ? 'h-[380px]' : 'h-[280px]';

  // Track viewport for timer overlay positioning (updates after fitView settles)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const handleViewportChange = useCallback((vp: { x: number; y: number; zoom: number }) => {
    setViewport(vp);
  }, []);

  return (
    <div className={`w-full ${containerHeight} rounded-xl border border-[#EDE9FE] bg-[#FAFAFE] overflow-hidden relative`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={() => {}}
        onEdgesChange={() => {}}
        onNodeClick={handleNodeClick}
        onViewportChange={handleViewportChange}
        fitView
        fitViewOptions={{ padding: heroMode ? 0.25 : 0.2 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        selectionOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#EDE9FE" gap={heroMode ? 24 : 20} size={1} />
      </ReactFlow>
      {/* Elapsed timer overlay — outside ReactFlow render tree for performance */}
      <ElapsedTimerOverlay liveStages={liveStages} positions={positions} heroMode={heroMode} viewport={viewport} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wrapper — provides ReactFlowProvider for useReactFlow() in overlay  */
/* ------------------------------------------------------------------ */

export default function PipelineGraph(props: PipelineGraphProps) {
  return (
    <ReactFlowProvider>
      <PipelineGraphInner {...props} />
    </ReactFlowProvider>
  );
}
