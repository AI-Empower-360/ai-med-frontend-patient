"use client";

import { useState } from "react";

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  className?: string;
}

export function DateRangeFilter({ onDateRangeChange, className = "" }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null;
    setStartDate(e.target.value);
    onDateRangeChange(value, endDate || null);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null;
    setEndDate(e.target.value);
    onDateRangeChange(startDate || null, value);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onDateRangeChange(null, null);
  };

  const hasFilter = startDate || endDate;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
          hasFilter
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        📅 Date Range {hasFilter && "•"}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  max={endDate || undefined}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  min={startDate || undefined}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {hasFilter && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
