import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionButton, Column } from '@/types/table.types';
import Checkbox from '../form/input/Checkbox';

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  idKey: keyof T;
  renderActions?: (row: T) => ActionButton[];
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  idKey,
  renderActions,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
      onSelectionChange?.([]);
    } else {
      const allIds = data.map((row) => row[idKey]);
      setSelectedRows(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelection = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {selectable && (
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    <Checkbox
                      checked={selectedRows.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    isHeader
                    className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    {col.label}
                  </TableCell>
                ))}
                {renderActions && (
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => {
                const rowId = row[idKey];
                const actions = renderActions?.(row) || [];
                const isMenuOpen = openMenuId === rowId;

                return (
                  <TableRow key={String(rowId)}>
                    {selectable && (
                      <TableCell className="px-5 py-4">
                        <Checkbox
                          checked={selectedRows.includes(rowId)}
                          onChange={() => handleSelectRow(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className="px-5 py-4">
                        {col.render
                          ? col.render(row[col.key as keyof T], row)
                          : row[col.key as keyof T]}
                      </TableCell>
                    ))}
                    {renderActions && (
                      <TableCell className="px-4 py-3 text-end relative">
                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : rowId)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-8 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]">
                              {actions.map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    action.onClick();
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}