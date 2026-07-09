"use client";

import { useEffect, useState } from "react";

export interface FilterValue {
  date?: string;
  hour?: string;
}

interface FilterBarProps {
  onChange: (value: FilterValue) => void;
  dates?: string[];
  defaultDate?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function FilterBar({ onChange, dates, defaultDate }: FilterBarProps) {
  const [date, setDate] = useState<string>(defaultDate ?? "");
  const [hour, setHour] = useState<string>("");

  useEffect(() => {
    onChange({ date: date || undefined, hour: hour || undefined });
  }, [date, hour, onChange]);

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-3">
      <label className="flex flex-col text-xs font-medium text-slate-600">
        Data
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
        >
          <option value="">Todas</option>
          {(dates ?? []).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs font-medium text-slate-600">
        Hora
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="mt-1 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
        >
          <option value="">Todas</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}:00
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => {
          setDate("");
          setHour("");
        }}
        className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
      >
        Limpar
      </button>
    </div>
  );
}
