"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Employee } from "@/types/employee";
import DatePicker from "../form/date-picker";
import { StaffRoster, staffRosterApi } from "@/lib/staffRosterApi";
import { Roster } from "@/types/roster";

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: StaffRoster | null;
  employees: Employee[];
  rosters: Roster[];
}

const ROSTER_TYPES = [
  { label: "Roster", value: "Roster" },
  { label: "Week Off", value: "Week Off" },
  { label: "Over Time", value: "Over Time" },
  { label: "Sick Leave", value: "Sick Leave" },
  { label: "Leave", value: "Leave" }
] as const;

export default function StaffRosterModal({ 
  isOpen, 
  onClose, 
  onSaved, 
  editData, 
  employees, 
  rosters 
}: RosterModalProps) {
  const [username, setUsername] = useState("");
  const [rosterType, setRosterType] = useState("");
  const [rosterDates, setRosterDates] = useState<Date[]>([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setUsername(editData.user_id || "");
        setRosterType(editData.roster_type || "");
        setTimeSlot(editData.slot_id || "");
        setRosterDates(editData.roster_dates ? editData.roster_dates.map(dateStr => new Date(dateStr)) : []);
        // Set roster dates if available in editData
      } else {
        setUsername("");
        setRosterType("");
        setRosterDates([]);
        setTimeSlot("");
      }
    }
  }, [isOpen, editData]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Boolean(username && rosterType && timeSlot && rosterDates.length > 0);
  }, [username, rosterType, timeSlot, rosterDates]);

  // Handle date change
  const handleDateChange = useCallback((selectedDates: Date[]) => {
    setRosterDates(selectedDates);
  }, []);

  // Handle form submission
  const handleSave = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // TODO: Fix the API payload - currently mapping to wrong fields
      const payload = {
        user_id: username,
        roster_type: rosterType,
        slot_id: timeSlot,
        roster_dates: rosterDates.map(date => date.toISOString()),
        created_by: ""
      };

      if (editData?._id) {
        await staffRosterApi.update(editData._id, payload);
      } else {
        await staffRosterApi.create(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving roster:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, username, rosterType, timeSlot, rosterDates, editData, onSaved, onClose]);

  // Handle form reset on cancel
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editData ? "Edit Roster Slot" : "Add Roster Slot"}
        </h4>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          {/* User Name Select */}
          <div>
            <Label htmlFor="username">User Name</Label>
            <select
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-700 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="">Select Username</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.user_name}
                </option>
              ))}
            </select>
          </div>

          {/* Roster Type Select */}
          <div>
            <Label htmlFor="rosterType">Roster Type</Label>
            <select
              id="rosterType"
              value={rosterType}
              onChange={(e) => setRosterType(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-700 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="">Select roster type</option>
              {ROSTER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Roster Date Picker */}
          <div>
            <Label>Roster Date</Label>
            <DatePicker
              id="roster-dates"
              label=""
              mode="multiple"
              placeholder="Select dates"
              onChange={handleDateChange}
              defaultDate={rosterDates}
            />
            {rosterDates.length > 0 && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {rosterDates.length} date{rosterDates.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Time Slot Select */}
          <div>
            <Label htmlFor="timeSlot">Time Slot</Label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none h-11 dark:border-gray-700 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="">Select time slot</option>
              {rosters.map((roster) => (
                <option key={roster._id} value={roster._id}>
                  {roster.start_time} - {roster.end_time}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              disabled={!isFormValid || isSubmitting}
              onClick={handleSave}
            >
              {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}