'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { employeeApi } from '@/lib/employeeApi';
import { Employee, EmployeeQueryParams } from '@/types/employee';
import axios from 'axios';
import Link from 'next/link';
import Badge from '@/components/ui/badge/Badge';
import { UserCircleIcon } from '@/icons';
import Spinner from '@/components/ui/spinner';

// Import reusable components
import type { Column, FilterOption } from '@/types/table.types';
import { PageHeader } from '@/components/table/PageHeader';
import { FilterBar } from '@/components/table/FilterBar';
import { DataTable } from '@/components/table/DataTable';
import { Pagination } from '@/components/table/Pagination';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/signin');
  }, [user, authLoading, router]);

    const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params: EmployeeQueryParams = { page, limit: 5 };
      if (search) params.search = search;
      if (workStatus) params.work_status = workStatus;

      const response = await employeeApi.getAll(params);
      setEmployees(response.data);
      setTotal(response?.pagination?.total);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch employees');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [page, workStatus, search]);

  useEffect(() => {
    if (user) fetchEmployees();
  }, [page, debouncedSearch, workStatus, user, fetchEmployees]);

  if (!user) return null;

  // Define columns
  const columns: Column<Employee>[] = [
    {
      key: 'firstName',
      label: 'Employee',
      render: (_, emp) => (
        <div className="flex items-center gap-3">
          <UserCircleIcon />
          <div>
            <span className="block font-medium text-gray-800 dark:text-white">
              {emp.firstName} {emp.lastName}
            </span>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              @{emp.user_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'emailAddress',
      label: 'Email',
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-400">{value as string}</span>
      ),
    },
    {
      key: 'user_phone',
      label: 'Phone',
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-400">{value as string}</span>
      ),
    },
    {
      key: 'work_status',
      label: 'Status',
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-400">
          <Badge
            size="sm"
            color={
              value === 'Working'
                ? 'success'
                : value === 'Resigned'
                ? 'error'
                : 'warning'
            }
          >
            {value as string}
          </Badge>
        </span>
      ),
    },
  ];

  // Define filter options
  const statusOptions: FilterOption[] = [
    { value: 'Working', label: 'Working' },
    { value: 'Resigned', label: 'Resigned' },
  ];

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`Total: ${total} employees`}
        actionButton={
          <Link
            href="/hr/staff/create"
            className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
          >
            + Add Employee
          </Link>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email..."
        selectValue={workStatus}
        onSelectChange={setWorkStatus}
        selectOptions={statusOptions}
        selectPlaceholder="All Status"
        onResetPage={() => setPage(1)}
      />

      {authLoading || loading ? (
        <div className="min-h-[calc(100vh-124px)] flex items-center justify-center text-xl">
          <Spinner />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={employees}
            idKey="_id"
            renderActions={(emp) => [
              {
                label: 'Edit',
                onClick: () => router.push(`/hr/staff/${emp._id}/edit`),
                className: 'text-blue-600 hover:text-blue-800',
              },
              {
                label: 'Delete',
                onClick: () => employeeApi.delete(emp._id!).then(fetchEmployees),
                className: 'text-red-600 hover:text-red-800',
              },
            ]}
          />

          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={5}
            onPageChange={setPage}
          />

          {error && (
            <div className="text-red-500 text-center mt-4">{error}</div>
          )}
        </>
      )}
    </div>
  );
}