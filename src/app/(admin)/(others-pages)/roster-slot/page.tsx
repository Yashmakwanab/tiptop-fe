"use client";

import { useState, useEffect, useCallback } from "react";
import { rosterApi, Roster, RosterQueryParams } from "@/lib/rosterApi";
import type { Column } from "@/types/table.types";
import Spinner from "@/components/ui/spinner";
import { PageHeader } from "@/components/table/PageHeader";
import { FilterBar } from "@/components/table/FilterBar";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import RosterModal from "@/components/roster-slot/RosterModal";

export default function RosterPage() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // modal states
  const { isOpen, openModal, closeModal } = useModal();
  const [editData, setEditData] = useState<Roster | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRosters = useCallback(async () => {
    try {
      setLoading(true);
      const params: RosterQueryParams = { page, limit: itemsPerPage };
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await rosterApi.getAll(params);
      setRosters(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error("Failed to fetch rosters:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, page, debouncedSearch]);

  useEffect(() => {
    fetchRosters();
  }, [page, debouncedSearch, itemsPerPage, fetchRosters]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this roster?")) {
      await rosterApi.delete(id);
      fetchRosters();
    }
  };

  const handleDeleteMany = async () => {
    if (selectedIds.length === 0) return alert("Select at least one roster");
    if (confirm(`Delete ${selectedIds.length} rosters?`)) {
      await rosterApi.deleteMany(selectedIds);
      setSelectedIds([]);
      fetchRosters();
    }
  };

  const columns: Column<Roster>[] = [
    { key: "start_time", label: "Start Time" },
    { key: "end_time", label: "End Time" },
    { key: "total_hrs", label: "Total Hrs" },
  ];

  return (
    <div>
      <PageHeader
        title="Roster"
        subtitle={`Total: ${total} rosters`}
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
              + Add Roster
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
            data={rosters}
            idKey="_id"
            selectable={true}
            onSelectionChange={(ids) => setSelectedIds(ids.filter((id): id is string => typeof id === "string"))}
            renderActions={(roster) => [
              {
                label: "Edit",
                onClick: () => {
                  setEditData(roster);
                  openModal();
                },
              },
              {
                label: "Delete",
                onClick: () => handleDelete(roster._id!),
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

      <RosterModal
        isOpen={isOpen}
        onClose={closeModal}
        onSaved={fetchRosters}
        editData={editData}
      />
    </div>
  );
}
