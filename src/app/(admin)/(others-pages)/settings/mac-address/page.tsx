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
import { macAddressApi } from "@/lib/macAddressApi";
import { MacAddress, MacAddressQueryParams } from "@/types/macAddress";
import MacAddressModal from "@/components/address/MacAddressModal";

export default function MacAddressPage() {
  const [macAddress, setMacAddress] = useState<MacAddress[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // modal states
  const { isOpen, openModal, closeModal } = useModal();
  const [editData, setEditData] = useState<MacAddress | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchMacAddress = useCallback(async () => {
    try {
      setLoading(true);
      const params: MacAddressQueryParams = { page, limit: itemsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await macAddressApi.getAll(params);
      setMacAddress(response.data);
      setTotal(response?.pagination?.total);
    } catch (error) {
      console.error("Failed to fetch mac address:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, page, debouncedSearch]);

  useEffect(() => {
    fetchMacAddress();
  }, [page, debouncedSearch, itemsPerPage, fetchMacAddress]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this mac address?")) {
      await macAddressApi.delete(id);
      fetchMacAddress();
    }
  };

  const handleDeleteMany = async () => {
    if (selectedIds.length === 0) return alert("Select at least one mac address");
    if (confirm(`Delete ${selectedIds.length} mac address?`)) {
      await macAddressApi.deleteMany(selectedIds);
      setSelectedIds([]);
      fetchMacAddress();
    }
  };

  const columns: Column<MacAddress>[] = [
    { key: "address", label: "Mac Address" },
    { key: "name", label: "Name" }
  ];

  return (
    <div>
      <PageHeader
        title="Mac Address"
        subtitle={`Total: ${total} Mac Address`}
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
              + Add Mac Address
            </Button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by mac address..."
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
            data={macAddress}
            idKey="_id"
            selectable={true}
            onSelectionChange={(ids) => setSelectedIds(ids.filter((id): id is string => typeof id === "string"))}
            renderActions={(macAddress) => [
              {
                label: "Edit",
                onClick: () => {
                  setEditData(macAddress);
                  openModal();
                },
              },
              {
                label: "Delete",
                onClick: () => handleDelete(macAddress._id!),
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

      <MacAddressModal
        isOpen={isOpen}
        onClose={closeModal}
        onSaved={fetchMacAddress}
        editData={editData}
      />
    </div>
  );
}
