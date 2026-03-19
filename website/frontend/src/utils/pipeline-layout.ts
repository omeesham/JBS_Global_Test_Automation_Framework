/**
 * Auto-layout pipeline stages using dagre directed graph algorithm.
 * Computes node positions for dynamic pipeline topologies.
 */

import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { StageDefinition } from '@/types';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 70;
const TERMINAL_WIDTH = 100;
const TERMINAL_HEIGHT = 40;

interface LayoutOptions {
  /** Direction: LR (left-to-right) or TB (top-to-bottom) */
  direction?: 'LR' | 'TB';
  /** Horizontal gap between nodes */
  nodesep?: number;
  /** Vertical gap between ranks */
  ranksep?: number;
}

/**
 * Compute auto-layout positions for pipeline stages using dagre.
 * Returns ReactFlow-compatible nodes and edges.
 */
export function computePipelineLayout(
  stages: StageDefinition[],
  terminalStates: string[] = ['completed', 'fixme', 'cancelled'],
  options: LayoutOptions = {},
): { nodes: Node[]; edges: Edge[] } {
  const { direction = 'LR', nodesep = 60, ranksep = 120 } = options;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep, ranksep, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add stage nodes
  for (const stage of stages) {
    g.setNode(stage.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Collect terminal targets used by stages
  const usedTerminals = new Set<string>();

  // Add edges from stage.next + stage.routing
  const edges: Edge[] = [];
  for (const stage of stages) {
    for (const [outcome, target] of Object.entries(stage.next || {})) {
      if (terminalStates.includes(target)) {
        usedTerminals.add(target);
      }
      const edgeId = `${stage.id}-${target}-${outcome}`;
      // Skip self-loops for dagre (it handles them poorly), we'll render them separately
      if (target !== stage.id) {
        g.setEdge(stage.id, target);
      }
      edges.push({
        id: edgeId,
        source: stage.id,
        target,
        label: outcome === 'success' ? '' : outcome,
        data: { isSelfLoop: target === stage.id, label: outcome === 'success' ? '' : outcome },
      });
    }

    if (stage.routing?.rules) {
      for (const rule of stage.routing.rules) {
        if (terminalStates.includes(rule.then)) {
          usedTerminals.add(rule.then);
        }
        const edgeId = `${stage.id}-${rule.then}-routing-${rule.when}`;
        if (rule.then !== stage.id) {
          g.setEdge(stage.id, rule.then);
        }
        edges.push({
          id: edgeId,
          source: stage.id,
          target: rule.then,
          label: rule.when,
          data: { isSelfLoop: rule.then === stage.id, label: rule.when },
        });
      }
    }
  }

  // Add terminal nodes (completed, fixme)
  for (const terminal of usedTerminals) {
    g.setNode(terminal, { width: TERMINAL_WIDTH, height: TERMINAL_HEIGHT });
  }

  dagre.layout(g);

  // Build ReactFlow nodes from dagre positions
  const nodes: Node[] = [];
  for (const stage of stages) {
    const nodeData = g.node(stage.id);
    if (nodeData) {
      nodes.push({
        id: stage.id,
        type: 'stageNode',
        position: { x: nodeData.x - NODE_WIDTH / 2, y: nodeData.y - NODE_HEIGHT / 2 },
        data: {
          label: stage.name,
          stageId: stage.id,
          model: stage.model,
          agent: stage.agent,
          enabled: stage.enabled,
          status: 'pending',
        },
      });
    }
  }

  // Add terminal nodes
  for (const terminal of usedTerminals) {
    const nodeData = g.node(terminal);
    if (nodeData) {
      nodes.push({
        id: terminal,
        type: 'terminalNode',
        position: { x: nodeData.x - TERMINAL_WIDTH / 2, y: nodeData.y - TERMINAL_HEIGHT / 2 },
        data: { label: terminal === 'completed' ? 'Done' : terminal, status: 'pending' },
      });
    }
  }

  return { nodes, edges };
}
