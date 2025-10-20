"use client";

import { useState, useEffect, useCallback } from "react";
import type { Column } from "@/types/table.types";
import Spinner from "@/components/ui/spinner";
import { PageHeader } from "@/components/table/PageHeader";
import { FilterBar } from "@/components/table/FilterBar";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { roleApi } from "@/lib/roleApi";
import RoleModal from "@/components/role/RoleModel";
import { Role, RoleQueryParams } from "@/types/role";
import { useRouter } from "next/navigation";

export default function RolePermisionsPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // modal states
  const { isOpen, openModal, closeModal } = useModal();
  const [editData, setEditData] = useState<{ name: string, isActive: boolean } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const params: RoleQueryParams = { page, limit: itemsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await roleApi.getAllRoles(params);
      setRoles(response.data);
      setTotal(response?.pagination?.total);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, page, debouncedSearch]);

  useEffect(() => {
    fetchRoles();
  }, [page, debouncedSearch, itemsPerPage, fetchRoles]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      await roleApi.deleteRole(id);
      fetchRoles();
    }
  };

  const handleDeleteMany = async () => {
    if (selectedIds.length === 0) return alert("Select at least one role to delete.");
    if (confirm(`Delete ${selectedIds.length} roles?`)) {
      await roleApi.deleteMany(selectedIds);
      setSelectedIds([]);
      fetchRoles();
    }
  };

  const columns: Column<Role>[] = [
    {
      key: "name",
      label: "Role",
      render: (value, row) => (
        <div className="cursor-pointer" onClick={() => router.push(`/settings/role-permisions/${row._id}/permissions`)}>
          {value as string}
        </div>
      )
    },
    {
      key: "isActive", label: "Active/Inactive", render: (value) => (
        <span className={value ? 'text-green-600 font-medium' : 'text-red-500'}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    }
  ];

  return (
    <div>
      <PageHeader
        title="Role"
        subtitle={`Total: ${total} roles`}
        actionButton={
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button variant="primary" size="sm" onClick={handleDeleteMany}>
                🗑️ Delete Selected
              </Button>
            )}
            <Button
              onClick={() => {
                setEditData(null);
                openModal();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Role
            </Button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by time..."
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
            data={roles}
            idKey="_id"
            selectable={true}
            onSelectionChange={(ids) => setSelectedIds(ids.filter((id): id is string => typeof id === "string"))}
            renderActions={(role) => [
              {
                label: "Edit Role",
                onClick: () => {
                  setEditData(role);
                  openModal();
                },
              },
              {
                label: 'Manage Permissions',
                onClick: () => router.push(`/settings/role-permisions/${role._id}/permissions`),
                className: 'text-blue-600 hover:text-blue-800',
              },
              {
                label: "Delete",
                onClick: () => handleDelete(role._id!),
              },
            ]}
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

      <RoleModal
        isOpen={isOpen}
        onClose={closeModal}
        onSaved={fetchRoles}
        editData={editData}
      />
    </div>
  );
}
