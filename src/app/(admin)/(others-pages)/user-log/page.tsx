"use client";

import { useState, useEffect, useCallback } from "react";
import type { Column } from "@/types/table.types";
import Spinner from "@/components/ui/spinner";
import { PageHeader } from "@/components/table/PageHeader";
import { FilterBar } from "@/components/table/FilterBar";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { userLogsApi } from "@/lib/userLogsApi";
import { UserLogs, UserLogsQueryParams } from "@/types/userlogs";
import dayjs from "dayjs";

export default function UserLogPage() {
  const [userLogs, setUserLogs] = useState<UserLogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUserLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: UserLogsQueryParams = { page, limit: itemsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await userLogsApi.getAllUserLogs(params);
      setUserLogs(response.data);
      setTotal(response?.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch user logs:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, page, debouncedSearch]);

  useEffect(() => {
    fetchUserLogs();
  }, [page, debouncedSearch, itemsPerPage, fetchUserLogs]);

  const columns: Column<UserLogs>[] = [
    { key: "createdAt", label: "Date Created", render: (_, row) => dayjs(row.createdAt).format("DD-MM-YYYY hh:mm A"), },
    { key: "username", label: "User Name" },
    { key: "module", label: "Module" },
    { key: "description", label: "Description" },
  ];

  return (
    <div>
      <PageHeader
        title="User Logs"
        subtitle={`Total: ${total} logs`}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by description..."
        onResetPage={() => setPage(1)}
      />

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={userLogs}
            idKey="_id"
          />

          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </div>
  );
}
