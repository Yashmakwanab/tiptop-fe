'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { employeeApi } from '@/lib/employeeApi';
import { Employee } from '@/types/employee';
import EmployeeForm from '@/components/employee/EmployeeForm';
import axios from 'axios';

export default function CreateEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: Partial<Employee>) => {
    try {
      setLoading(true);
      setError('');
      await employeeApi.create(data);
      router.push('/employees');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create employee');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Employee
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the employee information below
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <EmployeeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}