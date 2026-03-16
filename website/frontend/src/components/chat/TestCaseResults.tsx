import { useState, useMemo } from 'react';
import {
  Pencil,
  Save,
  X,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  Clipboard,
} from 'lucide-react';

const COLUMN_MAP: Record<string, { label: string; accessor: (row: any) => string }> = {
  tcNumber: { label: 'TC#', accessor: (r) => r.tcNumber ?? '' },
  title: { label: 'Title', accessor: (r) => r.scenario ?? r.title ?? '' },
  steps: { label: 'Steps', accessor: (r) => (Array.isArray(r.steps) ? r.steps.join('\n') : r.steps ?? '') },
  expected: { label: 'Expected', accessor: (r) => r.expectedResult ?? r.expected ?? '' },
  priority: { label: 'Priority', accessor: (r) => r.priority ?? '' },
  type: { label: 'Type', accessor: (r) => r.type ?? '' },
  feature: { label: 'Feature', accessor: (r) => r.feature ?? '' },
  precondition: { label: 'Precondition', accessor: (r) => r.precondition ?? '' },
  status: { label: 'Status', accessor: (r) => r.status ?? '' },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface TestCaseResultsProps {
  testCases: any[];
  columns: string[];
  onSave: (testCases: any[]) => Promise<void>;
  onExport: (format: string) => Promise<void>;
  savedRunId: string | null;
  isSaving: boolean;
  isExporting: boolean;
}

export default function TestCaseResults({
  testCases,
  columns,
  onSave,
  onExport,
  savedRunId,
  isSaving,
  isExporting,
}: TestCaseResultsProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);
  const [localCases, setLocalCases] = useState<any[]>(testCases);

  // Sync if testCases prop changes identity
  useMemo(() => {
    setLocalCases(testCases);
    setPage(0);
    setSelectedIds(new Set());
    setEditingId(null);
  }, [testCases]);

  const totalPages = Math.max(1, Math.ceil(localCases.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = localCases.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const allOnPageSelected =
    pageData.length > 0 && pageData.every((_, i) => selectedIds.has(safePage * pageSize + i));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    const start = safePage * pageSize;
    if (allOnPageSelected) {
      pageData.forEach((_, i) => next.delete(start + i));
    } else {
      pageData.forEach((_, i) => next.add(start + i));
    }
    setSelectedIds(next);
  };

  const toggleSelect = (globalIndex: number) => {
    const next = new Set(selectedIds);
    next.has(globalIndex) ? next.delete(globalIndex) : next.add(globalIndex);
    setSelectedIds(next);
  };

  const startEditing = (globalIndex: number) => {
    setEditingId(globalIndex);
    setEditDraft({ ...localCases[globalIndex] });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEditing = () => {
    if (editingId === null || !editDraft) return;
    const updated = [...localCases];
    updated[editingId] = editDraft;
    setLocalCases(updated);
    setEditingId(null);
    setEditDraft(null);
  };

  const deleteSelected = () => {
    const updated = localCases.filter((_, i) => !selectedIds.has(i));
    setLocalCases(updated);
    setSelectedIds(new Set());
    setEditingId(null);
    if (safePage >= Math.ceil(updated.length / pageSize)) {
      setPage(Math.max(0, Math.ceil(updated.length / pageSize) - 1));
    }
  };

  const handleDraftChange = (col: string, value: string) => {
    setEditDraft((prev: any) => {
      if (!prev) return prev;
      const draft = { ...prev };
      // Map back to the actual field names
      if (col === 'title') draft.scenario = value;
      else if (col === 'expected') draft.expectedResult = value;
      else if (col === 'steps') draft.steps = value.split('\n');
      else draft[col] = value;
      return draft;
    });
  };

  const resolvedColumns = columns.filter((c) => COLUMN_MAP[c]);

  return (
    <div className="rounded-xl border border-violet-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => onSave(localCases)}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
        >
          {isSaving ? (
            <Clipboard className="h-4 w-4 animate-pulse" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save All
        </button>

        {savedRunId && (
          <>
            <button
              onClick={() => onExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => onExport('excel')}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Excel
            </button>
          </>
        )}

        {selectedIds.size > 0 && (
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedIds.size})
          </button>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
              </th>
              {resolvedColumns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-3 py-2.5 text-left font-medium text-gray-600"
                >
                  {COLUMN_MAP[col].label}
                </th>
              ))}
              <th className="w-20 px-3 py-2.5 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, localIdx) => {
              const globalIdx = safePage * pageSize + localIdx;
              const isEditing = editingId === globalIdx;

              return (
                <tr
                  key={globalIdx}
                  className={`border-b border-gray-50 transition-colors ${
                    selectedIds.has(globalIdx) ? 'bg-violet-50/50' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(globalIdx)}
                      onChange={() => toggleSelect(globalIdx)}
                      className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </td>

                  {resolvedColumns.map((col) => (
                    <td key={col} className="max-w-xs px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={COLUMN_MAP[col].accessor(editDraft)}
                          onChange={(e) => handleDraftChange(col, e.target.value)}
                          className="w-full rounded border border-violet-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-200"
                        />
                      ) : (
                        <span className="block truncate text-gray-700">
                          {COLUMN_MAP[col].accessor(row)}
                        </span>
                      )}
                    </td>
                  ))}

                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={saveEditing}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(globalIdx)}
                        className="rounded p-1 text-gray-400 hover:bg-violet-50 hover:text-violet-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {pageData.length === 0 && (
              <tr>
                <td
                  colSpan={resolvedColumns.length + 2}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  No test cases to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
        <span>
          {localCases.length === 0
            ? '0 results'
            : `${safePage * pageSize + 1}\u2013${Math.min(
                (safePage + 1) * pageSize,
                localCases.length,
              )} of ${localCases.length}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-2">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
