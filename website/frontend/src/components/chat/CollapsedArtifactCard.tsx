import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, FileText, Code, Shield, Search, Wrench } from 'lucide-react';
import { getPipelineRunDetail } from '@/services/encoreApi';

const STAGE_ICONS: Record<string, React.ElementType> = {
  requirements: Search,
  planning: FileText,
  generation: Code,
  healing: Wrench,
  audit: Shield,
};

interface ArtifactData {
  id: string;
  name: string;
  type: string;
  content: string | null;
}

interface CollapsedArtifactCardProps {
  runId: string;
  stageName: string;
  artifactSummary?: string;
}

export default function CollapsedArtifactCard({ runId, stageName, artifactSummary }: CollapsedArtifactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [artifacts, setArtifacts] = useState<ArtifactData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null);

  const Icon = STAGE_ICONS[stageName] || FileText;
  const displayName = stageName.charAt(0).toUpperCase() + stageName.slice(1);

  const handleToggle = async () => {
    if (!expanded && artifacts === null) {
      setLoading(true);
      try {
        const run = await getPipelineRunDetail(runId);
        setArtifacts(((run as any).artifacts || []) as ArtifactData[]);
      } catch {
        setArtifacts([]);
      }
      setLoading(false);
    }
    setExpanded(!expanded);
  };

  return (
    <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 max-w-lg overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 transition-colors"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <Icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="text-sm font-medium text-emerald-800">{displayName} Complete</span>
        {artifactSummary && (
          <>
            <span className="text-xs text-emerald-500 mx-1">·</span>
            <span className="text-xs text-emerald-600">{artifactSummary}</span>
          </>
        )}
        <span className="ml-auto flex items-center gap-1 text-xs text-emerald-500">
          Review
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {/* Expanded artifact list */}
      {expanded && (
        <div className="border-t border-emerald-200 px-4 py-2 space-y-1.5 max-h-[300px] overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
              Loading artifacts...
            </div>
          )}
          {artifacts && artifacts.length === 0 && (
            <p className="text-xs text-gray-400 py-1">No artifacts recorded for this stage.</p>
          )}
          {artifacts && artifacts.map(art => (
            <div key={art.id} className="rounded-lg border border-gray-200 bg-white">
              <button
                onClick={() => setExpandedArtifact(expandedArtifact === art.id ? null : art.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700 truncate">{art.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{art.type}</span>
                  {expandedArtifact === art.id ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                </div>
              </button>
              {expandedArtifact === art.id && art.content && (
                <div className="border-t border-gray-100">
                  <pre className="font-mono text-[11px] bg-gray-50 p-3 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap text-gray-700">
                    {art.content.slice(0, 5000)}{art.content.length > 5000 ? '\n...(truncated)' : ''}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
