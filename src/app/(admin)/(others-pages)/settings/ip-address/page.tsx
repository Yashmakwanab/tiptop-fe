"use client";

import { useState, useEffect, useCallback } from "react";
import { ipAddressApi } from "@/lib/ipAddressApi";
import type { Column } from "@/types/table.types";
import Spinner from "@/components/ui/spinner";
import { PageHeader } from "@/components/table/PageHeader";
import { FilterBar } from "@/components/table/FilterBar";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import { IpAddress, IpAddressQueryParams } from "@/types/ipAddress";
import IpAddressModal from "@/components/address/IpAddressModal";

export default function IpAddressPage() {
  const [ipAddress, setIpAddress] = useState<IpAddress[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // modal states
  const { isOpen, openModal, closeModal } = useModal();
  const [editData, setEditData] = useState<IpAddress | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchIpAddress = useCallback(async () => {
    try {
      setLoading(true);
      const params: IpAddressQueryParams = { page, limit: itemsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await ipAddressApi.getAll(params);
      setIpAddress(response.data);
      setTotal(response?.pagination?.total);
    } catch (error) {
      console.error("Failed to fetch ip address:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, page, debouncedSearch]);

  useEffect(() => {
    fetchIpAddress();
  }, [page, debouncedSearch, itemsPerPage, fetchIpAddress]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ip address?")) {
      await ipAddressApi.delete(id);
      fetchIpAddress();
    }
  };

  const handleDeleteMany = async () => {
    if (selectedIds.length === 0) return alert("Select at least one ip address");
    if (confirm(`Delete ${selectedIds.length} ip address?`)) {
      await ipAddressApi.deleteMany(selectedIds);
      setSelectedIds([]);
      fetchIpAddress();
    }
  };

  const columns: Column<IpAddress>[] = [
    { key: "address", label: "Ip Address" },
    { key: "name", label: "Name" }
  ];

  return (
    <div>
      <PageHeader
        title="Ip Address"
        subtitle={`Total: ${total} Ip Address`}
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
              + Add Ip Address
            </Button>
          </div>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ip address..."
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
            data={ipAddress}
            idKey="_id"
            selectable={true}
            onSelectionChange={(ids) => setSelectedIds(ids.filter((id): id is string => typeof id === "string"))}
            renderActions={(ipAddress) => [
              {
                label: "Edit",
                onClick: () => {
                  setEditData(ipAddress);
                  openModal();
                },
              },
              {
                label: "Delete",
                onClick: () => handleDelete(ipAddress._id!),
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

      <IpAddressModal
        isOpen={isOpen}
        onClose={closeModal}
        onSaved={fetchIpAddress}
        editData={editData}
      />
    </div>
  );
}
