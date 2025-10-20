'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { employeeApi } from '@/lib/employeeApi';
import { Employee } from '@/types/employee';
import EmployeeForm from '@/components/employee/EmployeeForm';
import axios from 'axios';
import Spinner from '@/components/ui/spinner';
import { useAuth } from '@/context/AuthContext';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { checkAuth } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

    const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getById(id);
      setEmployee(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch employee');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [id, fetchEmployee]);

  const handleSubmit = async (data: Partial<Employee>) => {
    try {
      setSaving(true);
      setError('');
      await employeeApi.update(id, data);
      router.push('/hr/staff');
      checkAuth();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update employee');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <div className="text-xl text-red-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Employee
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update employee information
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <EmployeeForm
          initialData={employee}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </div>
  );
}