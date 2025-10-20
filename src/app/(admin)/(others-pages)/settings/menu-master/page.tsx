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
import MenuModal from "@/components/menu/menuModel";
import { menuApi } from "@/lib/menuApi";
import { Menu, MenuQueryParams } from "@/types/menu";

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const { isOpen, openModal, closeModal } = useModal();
  const [editData, setEditData] = useState<Menu | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const params: MenuQueryParams = { page, limit: itemsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await menuApi.getMenuHierarchy(params);
      setMenus(response.data);
      setTotal(response?.pagination?.total);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, page, debouncedSearch]);

  useEffect(() => {
    fetchMenus();
  }, [page, debouncedSearch, itemsPerPage, fetchMenus]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu?")) {
      await menuApi.deleteMenu(id);
      fetchMenus();
    }
  };

  const handleDeleteMany = async () => {
    if (selectedIds.length === 0) return alert("Select at least one menu to delete.");
    if (confirm(`Delete ${selectedIds.length} menus?`)) {
      await menuApi.deleteManyMenu(selectedIds);
      setSelectedIds([]);
      fetchMenus();
    }
  };

  const columns: Column<Menu>[] = [
    { key: "name", label: "Menu" },
    { key: "icon", label: "Icon" },
    { key: "order", label: "Display Order" },
  ];

  return (
    <div>
      <PageHeader
        title="Menus"
        subtitle={`Total: ${total} menus`}
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
              + Add Menu
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
            data={menus}
            idKey="_id"
            selectable={true}
            onSelectionChange={(ids) => setSelectedIds(ids.filter((id): id is string => typeof id === "string"))}
            renderActions={(menu) => [
              {
                label: "Edit",
                onClick: () => {
                  setEditData(menu);
                  openModal();
                },
              },
              {
                label: "Delete",
                onClick: () => handleDelete(menu._id!),
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

      <MenuModal
        isOpen={isOpen}
        onClose={closeModal}
        onSaved={fetchMenus}
        editData={editData}
      />
    </div>
  );
}
