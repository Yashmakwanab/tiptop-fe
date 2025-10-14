import { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface ActionButton {
  label: string;
  onClick: () => void;
  className?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}