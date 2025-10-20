import React, { JSX, ReactNode, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionButton, Column } from '@/types/table.types';
import Checkbox from '../form/input/Checkbox';
import { createPortal } from "react-dom";

export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [expandedMenus, setExpandedMenus] = useState<Record<string | number, boolean>>({});

  const toggleExpand = (id: string | number) => {
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const renderRows = (rows: T[], level = 0): JSX.Element[] => {
    return rows.flatMap((row) => {
      const rowId = row[idKey];
      const actions = renderActions?.(row) || [];
      const isMenuOpen = openMenuId === rowId;
      const hasSubItems = Array.isArray(row.subItems) && row.subItems.length > 0;
      const isExpanded = expandedMenus[rowId];

      const isSubmenu = level > 0;

      const currentRow = (
        <TableRow
          key={String(rowId)}
          className={`${isSubmenu ? "bg-gray-50 dark:bg-gray-900/30" : ""}`}
        >
          {!isSubmenu && selectable && (
            <TableCell className="px-5 py-4">
              <Checkbox
                checked={selectedRows.includes(rowId)}
                onChange={() => handleSelectRow(rowId)}
              />
            </TableCell>
          )}

          {isSubmenu && selectable && (
            <TableCell className="px-5 py-4">
              <></>
            </TableCell>
          )}

          {columns.map((col, colIndex) => (
            <TableCell
              key={String(col.key)}
              className={`px-5 py-4 pl-[${level * 20 + 20}px]`}
            >
              {/* Expand/Collapse icon */}
              {colIndex === 0 && hasSubItems && (
                <button
                  onClick={() => toggleExpand(String(rowId))}
                  className="mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {isExpanded ? (
                    <svg
                      className="w-4 h-4 inline-block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 inline-block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              )}

              {col.render
                ? col.render(row[col.key as keyof T], row)
                : (row[col.key as keyof T] as React.ReactNode)}
            </TableCell>
          ))}

          {/* ✅ Only show actions for top-level rows */}
          {!isSubmenu && renderActions && (
            <TableCell className="px-4 py-3 text-end relative">
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setOpenMenuId(isMenuOpen ? null : rowId);
                  setMenuPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.right - 180,
                  });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {isMenuOpen && (
                <Portal>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenMenuId(null)}
                  />
                  <div
                    className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
                    style={{
                      top: menuPosition.top,
                      left: menuPosition.left,
                    }}
                  >
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
                </Portal>
              )}
            </TableCell>
          )}

          {isSubmenu && (
            <TableCell className="px-5 py-4">
              <></>
            </TableCell>
          )}
        </TableRow>
      );

      // Recursively render submenus only if expanded
      return [
        currentRow,
        ...(hasSubItems && isExpanded ? renderRows(row.subItems, level + 1) : []),
      ];
    });
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
                      checked={selectedRows.length === data?.length && data?.length > 0}
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
              {renderRows(data)}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}