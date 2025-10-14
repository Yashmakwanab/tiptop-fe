'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { employeeApi } from '@/lib/employeeApi';
import { Employee, EmployeeQueryParams } from '@/types/employee';
import axios from 'axios';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import { UserCircleIcon } from '@/icons';
import Spinner from '../ui/spinner';

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
  // const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // delay: 500ms

    return () => {
      clearTimeout(handler);
    };
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
      // setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Employees
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {total} employees
          </p>
        </div>
        <Link
          href="/staff/create"
          className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
        >
          + Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <select
          value={workStatus}
          onChange={(e) => {
            setWorkStatus(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="Working">Working</option>
          <option value="Resigned">Resigned</option>
        </select>
      </div>

      {/* Employee Table */}

      {(authLoading || loading) ? (
        <div className="min-h-[calc(100vh-124px)] flex items-center justify-center text-xl">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Employee
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {employees.map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell className="px-5 py-4">
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
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {emp.emailAddress}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {emp.user_phone}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            emp.work_status === 'Working'
                              ? 'success'
                              : emp.work_status === 'Resigned'
                                ? 'error'
                                : 'warning'
                          }
                        >
                          {emp.work_status || 'Unknown'}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-end space-x-2">
                        <Link
                          href={`/staff/${emp._id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => employeeApi.delete(emp._id!).then(fetchEmployees)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              {total > 0 && (
                <div className="flex items-center justify-between m-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${page === 1
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-white dark:border-gray-600'
                      }`}
                  >
                    ← Previous
                  </button>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page <span className="font-semibold">{page}</span> of{' '}
                    <span className="font-semibold">
                      {Math.ceil(total / 5)}
                    </span>
                  </div>

                  <button
                    disabled={page >= Math.ceil(total / 5)}
                    onClick={() =>
                      setPage((prev) =>
                        prev < Math.ceil(total / 5) ? prev + 1 : prev
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${page >= Math.ceil(total / 5)
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-white dark:border-gray-600'
                      }`}
                  >
                    Next →
                  </button>
                </div>
              )}

              {error}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
