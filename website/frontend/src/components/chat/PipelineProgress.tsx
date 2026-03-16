import { CheckCircle, Loader2, Circle } from 'lucide-react';

interface PipelineStage {
  key: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
  detail: string;
}

interface PipelineProgressProps {
  stages: PipelineStage[];
}

export default function PipelineProgress({ stages }: PipelineProgressProps) {
  return (
    <div className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-violet-700">Testing Phases</h3>

      <div className="relative">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 ${
                    stage.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Status icon */}
              <div className="relative z-10 flex-shrink-0 pt-0.5">
                {stage.status === 'completed' && (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                )}
                {stage.status === 'running' && (
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                    <span className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-violet-400 opacity-20" />
                  </div>
                )}
                {stage.status === 'pending' && (
                  <Circle className="h-8 w-8 text-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 pt-1">
                <p
                  className={`text-sm font-medium ${
                    stage.status === 'completed'
                      ? 'text-green-700'
                      : stage.status === 'running'
                        ? 'text-violet-700'
                        : 'text-gray-400'
                  }`}
                >
                  {stage.name}
                </p>
                {stage.detail && (
                  <p
                    className={`mt-0.5 text-xs ${
                      stage.status === 'running' ? 'text-violet-500' : 'text-gray-400'
                    }`}
                  >
                    {stage.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
