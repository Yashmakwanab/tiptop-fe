import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import { Options } from "flatpickr/dist/types/options";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Options["onChange"];
  defaultDate?: Options["defaultDate"];
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  const instanceRef = useRef<Instance | null>(null);

  useEffect(() => {
    const config: Options = {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "d-m-Y",
      defaultDate,
      onChange,
      closeOnSelect: mode === "multiple" || mode === "range" ? false : true,
      onReady: (selectedDates, dateStr, instance) => {
        instanceRef.current = instance;
        
        // Prevent closing on date click for multiple/range mode
        if (mode === "multiple" || mode === "range") {
          const calendarContainer = instance.calendarContainer;
          
          calendarContainer.addEventListener('mousedown', (e) => {
            const target = e.target as HTMLElement;
            // Check if clicked element is a date
            if (target.classList.contains('flatpickr-day') && !target.classList.contains('flatpickr-disabled')) {
              e.stopPropagation();
            }
          });
        }
      },
      onClose: (selectedDates, dateStr, instance) => {
        // Reopen immediately if in multiple/range mode and calendar was closed
        if ((mode === "multiple" || mode === "range") && !instance.isOpen) {
          setTimeout(() => {
            instance.open();
          }, 0);
        }
      }
    };

    const flatPickr = flatpickr(`#${id}`, config);

    return () => {
      if (flatPickr && !Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
      instanceRef.current = null;
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
          readOnly
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}