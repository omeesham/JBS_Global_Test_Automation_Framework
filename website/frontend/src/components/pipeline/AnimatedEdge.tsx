import { memo } from 'react';
import {
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

/* ------------------------------------------------------------------ */
/* Animated Edge — flowing particles along the path                    */
/* ------------------------------------------------------------------ */

interface AnimatedEdgeData {
  isActive?: boolean;
  isOnPath?: boolean;
  isSelfLoop?: boolean;
  label?: string;
  heroMode?: boolean;
  [key: string]: unknown;
}

const PARTICLE_COUNT = 4;
const PARTICLE_DURATION = 2; // seconds per full traversal

/**
 * Custom ReactFlow edge that renders SVG particles flowing along the path
 * when the edge is "active" (source completed, target running/completed).
 */
function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
}: EdgeProps) {
  const d = (data || {}) as AnimatedEdgeData;
  const isActive = d.isActive ?? false;
  const isOnPath = d.isOnPath ?? false;
  const heroMode = d.heroMode ?? false;

  // Detect self-loop (heal → heal) — passed via data, not pixel comparison
  const isSelfLoop = d.isSelfLoop ?? false;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isSelfLoop) {
    // Self-loop: draw an arc that goes right and loops back
    const loopSize = heroMode ? 40 : 30;
    edgePath = `M ${sourceX} ${sourceY} C ${sourceX + loopSize * 2} ${sourceY - loopSize * 1.5}, ${sourceX + loopSize * 2} ${sourceY + loopSize * 1.5}, ${sourceX} ${sourceY}`;
    labelX = sourceX + loopSize * 1.5;
    labelY = sourceY;
  } else {
    const [path, lx, ly] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 8,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  }

  // Color and opacity logic (same as original inline styles)
  const strokeColor = isActive ? '#7C3AED' : isOnPath ? '#A5B4FC' : '#DDD6FE';
  const strokeWidth = isActive ? (heroMode ? 2.5 : 2) : 1;
  const opacity = isActive ? 1 : isOnPath ? 0.7 : 0.3;

  const pathId = `edge-path-${id}`;

  return (
    <g>
      {/* Base edge path */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        markerEnd={markerEnd as string}
        style={{
          transition: 'stroke 0.5s ease, opacity 0.5s ease, stroke-width 0.3s ease',
          ...style,
          // Override any stroke/opacity from style since we compute them
          stroke: strokeColor,
          strokeWidth,
          opacity,
        }}
      />

      {/* Glow filter for active edges */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="#7C3AED"
          strokeWidth={heroMode ? 4 : 3}
          opacity={0.15}
          style={{ filter: 'blur(3px)' }}
        />
      )}

      {/* Flowing particles — only on active edges */}
      {isActive &&
        Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <circle
            key={i}
            r={heroMode ? 3 : 2.5}
            fill="#7C3AED"
            opacity={0.8 - i * 0.1}
          >
            <animateMotion
              dur={`${PARTICLE_DURATION}s`}
              begin={`${i * (PARTICLE_DURATION / PARTICLE_COUNT)}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        ))}

      {/* Edge label */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          {/* Label background */}
          <rect
            x={-20}
            y={-8}
            width={40}
            height={16}
            rx={4}
            fill={(labelBgStyle as any)?.fill || '#ffffff'}
            fillOpacity={(labelBgStyle as any)?.fillOpacity || 0.9}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: heroMode ? 11 : 10,
              fill: isActive ? '#7C3AED' : '#6B7280',
              fontWeight: isActive ? 600 : 400,
              transition: 'fill 0.3s ease',
              ...(labelStyle as Record<string, unknown>),
            }}
          >
            {label as string}
          </text>
        </g>
      )}
    </g>
  );
}

const AnimatedEdge = memo(AnimatedEdgeComponent);
AnimatedEdge.displayName = 'AnimatedEdge';

export default AnimatedEdge;
