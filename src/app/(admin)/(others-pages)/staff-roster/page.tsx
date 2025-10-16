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
import StaffRosterModal from "@/components/roster-slot/StaffRosterModal";
import { Employee, EmployeeQueryParams } from "@/types/employee";
import { employeeApi } from "@/lib/employeeApi";
import { StaffRoster, staffRosterApi } from "@/lib/staffRosterApi";
import dayjs from "dayjs";
import DatePicker from "@/components/form/date-picker";

export default function RosterPage() {
    const [staffRosters, setStaffRosters] = useState<StaffRoster[]>([]);
    const [rosters, setRosters] = useState<Roster[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [rosterDates, setRosterDates] = useState<Date[]>([]);

    const handleDateChange = useCallback((selectedDates: Date[]) => {
        setRosterDates(selectedDates);
    }, []);

    // modal states
    const { isOpen, openModal, closeModal } = useModal();
    const [editData, setEditData] = useState<StaffRoster | null>(null);

    const fetchEmployees = useCallback(async () => {
        const params: EmployeeQueryParams = { page: 1, limit: 100 };
        const response = await employeeApi.getAll(params);
        setEmployees(response.data);
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const fetchRosters = useCallback(async () => {
        const params: RosterQueryParams = { page: 1, limit: 100 };
        const response = await rosterApi.getAll(params);
        setRosters(response.data);
    }, []);

    useEffect(() => {
        fetchRosters();
    }, [fetchRosters]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchStaffRosters = useCallback(async () => {
        try {
            setLoading(true);
            const params: RosterQueryParams = { page, limit: itemsPerPage };
            if (debouncedSearch) params.search = debouncedSearch;
            const response = await staffRosterApi.getAll(params);
            setStaffRosters(response.data);
            setTotal(response.pagination.total);
        } catch (error) {
            console.error("Failed to fetch rosters:", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, itemsPerPage]);

    useEffect(() => {
        fetchStaffRosters();
    }, [page, debouncedSearch, itemsPerPage, fetchStaffRosters]);

    const handleDeleteMany = async () => {
        if (selectedIds.length === 0) return alert("Select at least one roster");
        if (confirm(`Delete ${selectedIds.length} rosters?`)) {
            await staffRosterApi.deleteMany(selectedIds);
            setSelectedIds([]);
            fetchStaffRosters();
        }
    };

    const columns: Column<StaffRoster>[] = [
        { key: "user_name", label: "User Name" },
        {
            key: "roster_date",
            label: "Roster Date",
            render: (_, row) => `${dayjs(row.roster_date).format("DD-MM-YYYY")}`,
        },
        {
            key: "start_time",
            label: "Slot",
            render: (_, row) => `${row.start_time} - ${row.end_time}`,
        },
        { key: "roster_type", label: "Type" },
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
                            className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"

                        >
                            + Add Roster
                        </Button>
                    </div>
                }
            />
            <DatePicker
                id="roster-dates"
                label=""
                mode="multiple"
                placeholder="Select dates"
                onChange={handleDateChange}
                defaultDate={rosterDates}
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
                        data={staffRosters}
                        idKey="_id"
                        selectable={true}
                        onSelectionChange={(ids) => setSelectedIds(ids.filter((id): id is string => typeof id === "string"))}
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

            <StaffRosterModal
                isOpen={isOpen}
                onClose={closeModal}
                onSaved={fetchStaffRosters}
                editData={editData}
                employees={employees}
                rosters={rosters}
            />
        </div>
    );
}
