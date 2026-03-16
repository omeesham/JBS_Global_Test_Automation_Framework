const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  running: 'bg-violet-50 text-violet-700 border-violet-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  fixme: 'bg-amber-50 text-amber-700 border-amber-200',
  queued: 'bg-gray-50 text-gray-600 border-gray-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
};

interface Props {
  status: string;
}

export default function RunStatusBadge({ status }: Props) {
  const style = statusStyles[status] || statusStyles.queued;
  const isRunning = status === 'running';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide border ${style}`}>
      {isRunning && (
        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
      )}
      {status}
    </span>
  );
}
