import { FilterOption } from '@/types/table.types';
import React from 'react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectValue?: string;
  onSelectChange?: (value: string) => void;
  selectOptions?: FilterOption[];
  selectPlaceholder?: string;
  onResetPage: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  selectValue,
  onSelectChange,
  selectOptions,
  selectPlaceholder = 'All',
  onResetPage,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value);
          onResetPage();
        }}
        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
      />
      {selectOptions && onSelectChange && (
        <select
          value={selectValue}
          onChange={(e) => {
            onSelectChange(e.target.value);
            onResetPage();
          }}
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="">{selectPlaceholder}</option>
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}