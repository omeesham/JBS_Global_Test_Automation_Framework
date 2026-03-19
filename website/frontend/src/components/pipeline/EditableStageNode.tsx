import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { X } from 'lucide-react';

interface EditableStageNodeData {
  label: string;
  stageId: string;
  model?: string;
  agent?: string;
  enabled?: boolean;
  selected?: boolean;
  onDelete?: (stageId: string) => void;
  [key: string]: unknown;
}

const EditableStageNode = memo(({ data, selected }: NodeProps) => {
  const d = data as EditableStageNodeData;
  const isDisabled = d.enabled === false;

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border-2 min-w-[140px] text-center transition-all
        ${selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-300 bg-white'}
        ${isDisabled ? 'opacity-50 border-dashed' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-violet-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-violet-400 !border-0" />

      {selected && d.onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); d.onDelete!(d.stageId); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="text-xs font-semibold text-[#1E1B4B]">{d.label}</span>
      </div>

      {d.model && (
        <span className="text-[10px] text-violet-400 block">{d.model}</span>
      )}

      {d.agent && (
        <span className="text-[10px] text-gray-400 block truncate max-w-[120px]">{d.agent}</span>
      )}
    </div>
  );
});
EditableStageNode.displayName = 'EditableStageNode';

export default EditableStageNode;
