"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { rosterApi } from "@/lib/rosterApi";
import { Roster } from "@/types/roster";

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: Roster | null;
}

export default function RosterModal({
  isOpen,
  onClose,
  onSaved,
  editData,
}: RosterModalProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalHrs, setTotalHrs] = useState("");

  useEffect(() => {
    if (editData) {
      setStartTime(editData.start_time);
      setEndTime(editData.end_time);
      setTotalHrs(editData.total_hrs);
    } else {
      setStartTime("");
      setEndTime("");
      setTotalHrs("");
    }
  }, [editData]);

  const timeOptions = useMemo(() => {
    const times: string[] = [];
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    for (let i = 0; i < 96; i++) {
      times.push(
        new Date(0, 0, 0, date.getHours(), date.getMinutes()).toLocaleTimeString(
          "en-US",
          { hour: "numeric", minute: "2-digit" }
        )
      );
      date.setMinutes(date.getMinutes() + 15);
    }
    return times;
  }, []);

  useEffect(() => {
    if (!startTime || !endTime) return setTotalHrs("");

    const parseTime = (t: string) => {
      const [time, meridiem] = t.split(" ");
      let h = Number(time.split(":")[0]);
      const m = Number(time.split(":")[1]);
      if (meridiem === "PM" && h !== 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    let diff = parseTime(endTime) - parseTime(startTime);
    if (diff < 0) diff += 24 * 60;
    setTotalHrs((diff / 60).toFixed(2));
  }, [startTime, endTime]);

  const handleSave = async () => {
    if (!startTime || !endTime || !totalHrs) return;

    const payload = {
      start_time: startTime,
      end_time: endTime,
      total_hrs: totalHrs,
      created_by: "",
    };

    try {
      if (editData?._id) {
        await rosterApi.update(editData._id, payload);
      } else {
        await rosterApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving roster:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editData ? "Edit Roster Slot" : "Add Roster Slot"}
        </h4>

        <form className="flex flex-col gap-5">
          {/* Start Time */}
          <div>
            <Label>Start Time*</Label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
            >
              <option value="">Select Start Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* End Time */}
          <div>
            <Label>End Time*</Label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
            >
              <option value="">Select End Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Total Hours */}
          <div>
            <Label>Total Hrs*</Label>
            <input
              type="text"
              readOnly
              value={totalHrs}
              placeholder="Auto calculated"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none h-11"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!startTime || !endTime || !totalHrs}
              onClick={handleSave}
            >
              {editData ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
