import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between m-6">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
          currentPage === 1
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-white dark:border-gray-600'
        }`}
      >
        ← Previous
      </button>

      <div className="flex items-center gap-4">
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {startItem} – {endItem} of {totalItems}
        </div>
      </div>

      <button
        disabled={currentPage >= totalPages}
        onClick={() =>
          onPageChange(currentPage < totalPages ? currentPage + 1 : currentPage)
        }
        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
          currentPage >= totalPages
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-white dark:border-gray-600'
        }`}
      >
        Next →
      </button>
    </div>
  );
}