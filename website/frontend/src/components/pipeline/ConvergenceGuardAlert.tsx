import { AlertTriangle, RefreshCcw, DollarSign, ArrowRight, Equal } from 'lucide-react';

type GuardType = 'maxIterations' | 'budgetExhausted' | 'sameFindings' | 'notDecreasing';

interface Guard {
  type: GuardType;
  details: string;
}

interface Props {
  guard: Guard;
}

const guardConfig: Record<GuardType, { title: string; icon: JSX.Element }> = {
  maxIterations: {
    title: 'Maximum iterations reached',
    icon: <RefreshCcw className="w-4 h-4" />,
  },
  budgetExhausted: {
    title: 'Budget exhausted',
    icon: <DollarSign className="w-4 h-4" />,
  },
  sameFindings: {
    title: 'Same findings detected across iterations',
    icon: <Equal className="w-4 h-4" />,
  },
  notDecreasing: {
    title: 'Findings are not decreasing',
    icon: <ArrowRight className="w-4 h-4" />,
  },
};

export default function ConvergenceGuardAlert({ guard }: Props) {
  const config = guardConfig[guard.type];

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-300/60 rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-700">{config.icon}</span>
          <h4 className="text-sm font-semibold text-amber-800">{config.title}</h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide bg-amber-200/60 text-amber-700">
            fixme
          </span>
        </div>
        <p className="text-xs text-amber-700/80 leading-relaxed">{guard.details}</p>
      </div>
    </div>
  );
}
