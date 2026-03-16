import { useState } from 'react';
import { Download, Copy, Check, FileCode2, FileText, File } from 'lucide-react';

interface Artifact {
  name: string;
  type: string;
  content: string;
}

interface Props {
  artifacts: Artifact[];
  onDownload?: (artifact: Artifact) => void;
  onCopy?: (artifact: Artifact) => void;
}

const typeIcon: Record<string, JSX.Element> = {
  spec: <FileCode2 className="w-4 h-4" />,
  plan: <FileText className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
};

const typeBadgeColor: Record<string, string> = {
  spec: 'bg-[#7C3AED]/10 text-[#7C3AED]',
  plan: 'bg-indigo-50 text-[#6366F1]',
  report: 'bg-emerald-50 text-emerald-600',
};

export default function ArtifactViewer({ artifacts, onDownload, onCopy }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleCopy = async (artifact: Artifact, idx: number) => {
    if (onCopy) {
      onCopy(artifact);
    } else {
      await navigator.clipboard.writeText(artifact.content);
    }
    setCopiedId(String(idx));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (artifacts.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-8 text-center">
        <File className="w-8 h-8 text-[#DDD6FE] mx-auto mb-2" />
        <p className="text-sm text-[#6B7280]">No artifacts generated yet</p>
      </div>
    );
  }

  const current = artifacts[activeIdx];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 overflow-hidden">
      {/* Tab bar */}
      {artifacts.length > 1 && (
        <div className="flex border-b border-[#DDD6FE]/40 overflow-x-auto">
          {artifacts.map((artifact, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                idx === activeIdx
                  ? 'border-[#7C3AED] text-[#7C3AED] bg-[#F5F3FF]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1E1B4B] hover:bg-[#F5F3FF]/50'
              }`}
            >
              {typeIcon[artifact.type] || <File className="w-3.5 h-3.5" />}
              {artifact.name}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#DDD6FE]/30 bg-[#F5F3FF]/50">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${typeBadgeColor[current.type] || 'bg-gray-100 text-gray-600'}`}
          >
            {current.type}
          </span>
          <span className="text-xs text-[#6B7280]">{current.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCopy(current, activeIdx)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors"
          >
            {copiedId === String(activeIdx) ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedId === String(activeIdx) ? 'Copied' : 'Copy'}
          </button>
          {onDownload && (
            <button
              onClick={() => onDownload(current)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Code block */}
      <pre className="text-xs leading-relaxed bg-[#1E1B4B] text-[#E0E7FF] p-4 overflow-auto max-h-96 scrollbar-thin">
        <code>{current.content}</code>
      </pre>
    </div>
  );
}
