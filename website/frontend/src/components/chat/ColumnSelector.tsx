import { Check } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  default: boolean;
}

interface ColumnSelectorProps {
  columns: Column[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onConfirm: () => void;
}

export default function ColumnSelector({ columns, selected, onChange, onConfirm }: ColumnSelectorProps) {
  const allSelected = columns.length > 0 && columns.every((c) => selected.includes(c.key));

  function toggle(key: string) {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  }

  function selectAll() {
    onChange(columns.map((c) => c.key));
  }

  function deselectAll() {
    onChange([]);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={selectAll}
          className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={deselectAll}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Deselect All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {columns.map((col) => {
          const checked = selected.includes(col.key);
          return (
            <button
              key={col.key}
              onClick={() => toggle(col.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                checked
                  ? 'border-violet-300 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex items-center justify-center h-4 w-4 rounded border ${
                  checked
                    ? 'bg-violet-600 border-violet-600'
                    : 'border-gray-300'
                }`}
              >
                {checked && <Check className="h-3 w-3 text-white" />}
              </span>
              {col.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={onConfirm}
        disabled={selected.length === 0}
        className="mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium hover:from-violet-700 hover:to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Generate
      </button>
    </div>
  );
}
