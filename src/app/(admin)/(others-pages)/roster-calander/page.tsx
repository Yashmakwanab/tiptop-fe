"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(weekday);
dayjs.extend(isoWeek);

import { StaffRoster, staffRosterApi } from "@/lib/staffRosterApi";
import Spinner from "@/components/ui/spinner";
import { PageHeader } from "@/components/table/PageHeader";
import DatePicker from "@/components/form/date-picker";

export default function RosterCalendarPage() {
  const [staffRosters, setStaffRosters] = useState<StaffRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().startOf("month"));

  const calendarStart = useMemo(() => {
    return selectedMonth.startOf("month").startOf("week");
  }, [selectedMonth]);

  const fetchStaffRosters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffRosterApi.getAll({ page: 1, limit: 100 });
      setStaffRosters(res.data || []);
    } catch (err) {
      console.error("Failed to fetch rosters", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffRosters();
  }, [fetchStaffRosters]);

  const staffList = useMemo(() => {
    const map = new Map<string, { user_name: string; full_name?: string }>();
    for (const r of staffRosters) {
      if (!map.has(r.user_name)) {
        map.set(r.user_name, { user_name: r.user_name, full_name: r.full_name });
      }
    }
    return Array.from(map.values());
  }, [staffRosters]);

  const grouped = useMemo(() => {
    const out: Record<string, Record<string, StaffRoster[]>> = {};
    for (const r of staffRosters) {
      const user = r.user_name || r.full_name || "unknown";
      const dateKey = dayjs(r.roster_date).format("YYYY-MM-DD");
      out[user] = out[user] || {};
      out[user][dateKey] = out[user][dateKey] || [];
      out[user][dateKey].push(r);
    }
    return out;
  }, [staffRosters]);

  const fiveWeeks = useMemo(() => {
    const weeks: dayjs.Dayjs[][] = [];
    for (let w = 0; w < 5; w++) {
      const weekStart = calendarStart.add(w * 7, "day");
      const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
      weeks.push(weekDays);
    }
    return weeks;
  }, [calendarStart]);

  const getCellsFor = (userName: string, date: dayjs.Dayjs) => {
    const key = date.format("YYYY-MM-DD");
    return grouped[userName]?.[key] ?? [];
  };

  const typeColor = (t?: string) => {
    if (!t) return "bg-gray-100 text-gray-700 border border-gray-200";
    switch (t.toLowerCase()) {
      case "week off":
        return "bg-[#fa8072] text-white";
      case "leave":
        return "bg-amber-500 text-white";
      case "sick leave":
        return "bg-purple-500 text-white";
      case "over time":
      case "overtime":
        return "bg-green-600 text-white";
      case "roster":
        return "bg-sky-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const onMonthChange = (val: string) => {
    if (!val) return;
    const [y, m] = val.split("-");
    const dt = dayjs(`${y}-${m}-01`).startOf("month");
    setSelectedMonth(dt);
  };

  return (
    <div className="p-4">
      <PageHeader title="Roster Calendar" />

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <DatePicker
            id="monthSelector"
            mode="month"
            defaultDate={ dayjs(selectedMonth).format("MMM-YYYY") as unknown as Date | string | number | (Date | string | number)[]}
            onChange={(selectedDates, dateStr) => onMonthChange(dateStr)}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm">
          <LegendItem colorClass="bg-sky-500 text-white" label="Roster" />
          <LegendItem colorClass="bg-[#fa8072] text-white" label="Week Off" />
          <LegendItem colorClass="bg-amber-500 text-white" label="Leave" />
          <LegendItem colorClass="bg-purple-500 text-white" label="Sick Leave" />
          <LegendItem colorClass="bg-green-600 text-white" label="Over Time" />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[320px] flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {fiveWeeks.map((weekDays, wIdx) => (
            <div key={wIdx} className="border rounded-lg bg-white overflow-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0 z-20">
                  <tr>
                    <th className="sticky left-0 z-30 bg-gray-50 border-r px-4 py-3 text-left w-48">Resources</th>
                    {weekDays.map((d) => (
                      <th key={d.toString()} className="border px-3 py-3 text-center">
                        <div className="text-xs text-blue-600 font-semibold">{d.format("ddd")}</div>
                        <div className="text-[12px] text-gray-600">{d.format("MMM D")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.user_name} className="border-t">
                      <td className="sticky left-0 z-10 bg-white border-r px-4 py-2 text-sm font-medium">{staff.user_name}</td>

                      {weekDays.map((d) => {
                        const cells = getCellsFor(staff.user_name, d);
                        return (
                          <td key={d.toString()} className="px-3 py-2 align-top border-r" style={{ minWidth: 142 }}>
                            {cells.length ? (
                              <div className="flex flex-col gap-1 h-[41.31px]">
                                {cells.map((c) => (
                                  <div key={c._id} className={`rounded-md px-2 py-1 text-xs font-semibold h-full flex flex-col justify-center items-center ${typeColor(c.roster_type)}`}>
                                    <div className="uppercase text-[11px] tracking-wide">{c.roster_type}</div>
                                    {c.roster_type === "Week Off" ? null : (
                                      <div className="text-[11px] mt-1">{c.start_time} - {c.end_time}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-300 text-xs">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* small helper legend component */
function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-6 h-4 rounded-sm inline-block ${colorClass}`} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
