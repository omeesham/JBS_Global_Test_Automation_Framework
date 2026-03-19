import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
  type Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Undo2, Redo2, Save, AlertTriangle, Loader2, Info, Copy, Trash2 } from 'lucide-react';

import EditableStageNode from '@/components/pipeline/EditableStageNode';
import AgentPalette from '@/components/settings/AgentPalette';
import NodeConfigPanel from '@/components/settings/NodeConfigPanel';
import { usePipelineEditor } from '@/hooks/usePipelineEditor';
import { computePipelineLayout } from '@/utils/pipeline-layout';
import { useClient } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { cloneDefaultToClient, deleteClientPipelineDefinition } from '@/services/encoreApi';
import type { AgentType, StageDefinition } from '@/types';

const nodeTypes = { stageNode: EditableStageNode, terminalNode: EditableStageNode };

function PipelineBuilderInner() {
  const editor = usePipelineEditor();
  const { client, clients } = useClient();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [selectedClientId, setSelectedClientId] = useState<string | null>(client?.id || null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load definition on mount or client change
  useEffect(() => {
    editor.loadClient(selectedClientId);
  }, [selectedClientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClientChange = useCallback((id: string) => {
    setSelectedClientId(id || null);
  }, []);

  const handleResetToDefault = useCallback(async () => {
    if (!selectedClientId) return;
    if (!confirm('Remove this client\'s custom pipeline and revert to the default template?')) return;
    setActionLoading(true);
    try {
      await deleteClientPipelineDefinition(selectedClientId);
      editor.loadClient(selectedClientId);
    } catch (err: any) {
      alert(err?.message || 'Failed to reset');
    }
    setActionLoading(false);
  }, [selectedClientId, editor]);

  const handleCloneDefault = useCallback(async () => {
    if (!selectedClientId) return;
    setActionLoading(true);
    try {
      await cloneDefaultToClient(selectedClientId);
      editor.loadClient(selectedClientId);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        alert('This client already has a custom pipeline definition.');
      } else {
        alert(err?.message || 'Failed to clone');
      }
    }
    setActionLoading(false);
  }, [selectedClientId, editor]);

  // Compute layout from definition
  const layout = useMemo(() => {
    if (!editor.definition) return { nodes: [], edges: [] };
    return computePipelineLayout(editor.definition.stages, editor.definition.terminalStates);
  }, [editor.definition]);

  // Enrich nodes with editor callbacks
  const enrichedNodes = useMemo(() => {
    return layout.nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        selected: n.id === editor.selectedNodeId,
        onDelete: (stageId: string) => {
          if (confirm(`Remove "${stageId}" from the pipeline?`)) {
            editor.removeStage(stageId);
          }
        },
      },
      selected: n.id === editor.selectedNodeId,
    }));
  }, [layout.nodes, editor.selectedNodeId, editor.removeStage]);

  const enrichedEdges = useMemo(() => {
    return layout.edges.map(e => ({
      ...e,
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
      style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
      labelStyle: { fontSize: 9, fill: '#6b7280' },
    }));
  }, [layout.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(enrichedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(enrichedEdges);

  // Sync layout → ReactFlow state when definition changes
  useEffect(() => { setNodes(enrichedNodes); }, [enrichedNodes, setNodes]);
  useEffect(() => { setEdges(enrichedEdges); }, [enrichedEdges, setEdges]);

  // Handle new connections drawn on canvas
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    editor.addEdge(params.source, params.target, 'success');
  }, [editor]);

  // Handle node click → select
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    editor.selectNode(node.id === editor.selectedNodeId ? null : node.id);
  }, [editor]);

  // Handle pane click → deselect
  const onPaneClick = useCallback(() => {
    editor.selectNode(null);
  }, [editor]);

  // Handle drop from palette
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const agentJson = e.dataTransfer.getData('application/pipeline-agent');
    if (!agentJson) return;
    try {
      const agent: AgentType = JSON.parse(agentJson);
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
      editor.addStage(newStage);
    } catch { /* invalid JSON */ }
  }, [editor]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); editor.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); editor.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); editor.save(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const selectedStage = editor.definition?.stages.find(s => s.id === editor.selectedNodeId);
  const usedAgentIds = useMemo(() => new Set(editor.definition?.stages.map(s => s.id) || []), [editor.definition]);

  if (editor.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading pipeline definition...</span>
      </div>
    );
  }

  if (!editor.definition) {
    return <div className="p-6 text-sm text-red-500">Failed to load pipeline definition: {editor.error}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          {/* Client Selector (super_admin only) */}
          {isSuperAdmin && clients.length > 0 && (
            <select
              value={selectedClientId || ''}
              onChange={e => handleClientChange(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <option value="">Default Template</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {editor.isDefault && (
            <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              <Info className="w-3 h-3" /> Default Template
            </span>
          )}
          {editor.isDirty && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Unsaved changes</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Clone Default → Client */}
          {editor.isDefault && selectedClientId && (
            <button
              onClick={handleCloneDefault}
              disabled={actionLoading}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
              title="Clone default template to selected client"
            >
              <Copy className="w-3.5 h-3.5" />
              Clone to Client
            </button>
          )}
          {/* Reset to Default */}
          {!editor.isDefault && selectedClientId && (
            <button
              onClick={handleResetToDefault}
              disabled={actionLoading}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              title="Remove client customization and revert to default"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset to Default
            </button>
          )}
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button onClick={editor.undo} disabled={!editor.canUndo} className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30" title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={editor.redo} disabled={!editor.canRedo} className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30" title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <button
            onClick={editor.save}
            disabled={!editor.isDirty || editor.saving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50"
          >
            {editor.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {editor.validationErrors.length > 0 && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          {editor.validationErrors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {editor.error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-xs text-red-600">
          {editor.error}
        </div>
      )}

      {/* Main Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Agent Palette */}
        <AgentPalette usedAgentIds={usedAgentIds} onAddStage={editor.addStage} />

        {/* Center: Canvas */}
        <div className="flex-1" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={2}
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={() => '#8b5cf6'}
              maskColor="rgba(0,0,0,0.08)"
              className="!bg-gray-50 !border"
            />
          </ReactFlow>
        </div>

        {/* Right: Node Config Panel */}
        {selectedStage && (
          <NodeConfigPanel
            stage={selectedStage}
            onUpdate={patch => editor.updateStage(selectedStage.id, patch)}
            onDelete={() => {
              if (confirm(`Remove "${selectedStage.name}" from the pipeline?`)) {
                editor.removeStage(selectedStage.id);
              }
            }}
            onClose={() => editor.selectNode(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function PipelineBuilderTab() {
  return (
    <ReactFlowProvider>
      <PipelineBuilderInner />
    </ReactFlowProvider>
  );
}
