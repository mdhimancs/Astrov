import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flame,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Compass,
  Briefcase,
  Heart,
  Activity,
} from 'lucide-react';
import { MonthWiseTransitPrediction, PlanetaryMovementDetail, TransitDosAndDonts } from '../types';

interface MonthWisePredictionsProps {
  monthlyPredictions: MonthWiseTransitPrediction[];
  detailedMovements?: PlanetaryMovementDetail[];
  dosAndDonts?: TransitDosAndDonts[];
  userName: string;
  selectedMonthKey?: string;
  onSelectMonthKey?: (monthKey: string) => void;
}

export function MonthWisePredictions({
  monthlyPredictions,
  userName,
  selectedMonthKey,
  onSelectMonthKey,
}: MonthWisePredictionsProps) {
  const [internalMonthIndex, setInternalMonthIndex] = useState(0);

  // Guard: If no predictions available, show a loading or empty state
  if (!monthlyPredictions || monthlyPredictions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 shadow-3xs p-4 text-center">
        <p className="text-stone-600 text-[16px] italic">Loading predictions...</p>
      </div>
    );
  }

  // If parent controls selectedMonthKey, find its index, else use internal state
  const currentIndex = selectedMonthKey
    ? Math.max(0, monthlyPredictions.findIndex((m) => m.monthKey === selectedMonthKey))
    : internalMonthIndex;

  const currentMonth = monthlyPredictions[currentIndex] || monthlyPredictions[0];

  if (!currentMonth) return null;

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setInternalMonthIndex(idx);
    if (onSelectMonthKey && monthlyPredictions[idx]) {
      onSelectMonthKey(monthlyPredictions[idx].monthKey);
    }
  };

  const handlePrevMonth = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setInternalMonthIndex(prevIdx);
      if (onSelectMonthKey && monthlyPredictions[prevIdx]) {
        onSelectMonthKey(monthlyPredictions[prevIdx].monthKey);
      }
    }
  };

  const handleNextMonth = () => {
    if (currentIndex < monthlyPredictions.length - 1) {
      const nextIdx = currentIndex + 1;
      setInternalMonthIndex(nextIdx);
      if (onSelectMonthKey && monthlyPredictions[nextIdx]) {
        onSelectMonthKey(monthlyPredictions[nextIdx].monthKey);
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-stone-200 shadow-3xs overflow-hidden">
      {/* Month-Wise Dropdown Header Bar */}
      <div className="px-2.5 py-1.5 bg-stone-50/70 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-amber-700" />
          <h3 className="font-vedic font-black text-stone-950 text-[13px] uppercase tracking-wider leading-tight">
            Calendar
          </h3>
        </div>

        {/* DROPDOWN MENU - ZERO PILL STYLE */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentIndex === 0}
            className="p-1.5 rounded bg-white border border-stone-200 text-stone-500 hover:text-amber-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <select
              id="month-select-dropdown"
              value={currentIndex}
              onChange={handleMonthChange}
              className="appearance-none bg-white border border-stone-200 text-stone-950 text-[14px] font-black uppercase tracking-wider rounded px-2.5 pr-7 py-1 focus:outline-none focus:border-amber-400 shadow-3xs cursor-pointer"
            >
              {/* Year 2025 */}
              <optgroup label="2025">
                {monthlyPredictions
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.monthKey.startsWith('2025'))
                  .map(({ m, idx }) => (
                    <option key={m.monthKey} value={idx}>
                      {m.monthName}
                    </option>
                  ))}
              </optgroup>

              {/* Year 2026 */}
              <optgroup label="2026">
                {monthlyPredictions
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.monthKey.startsWith('2026'))
                  .map(({ m, idx }) => (
                    <option key={m.monthKey} value={idx}>
                      {m.monthName}
                    </option>
                  ))}
              </optgroup>

              {/* Year 2027 */}
              <optgroup label="2027">
                {monthlyPredictions
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.monthKey.startsWith('2027'))
                  .map(({ m, idx }) => (
                    <option key={m.monthKey} value={idx}>
                      {m.monthName}
                    </option>
                  ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentIndex === monthlyPredictions.length - 1}
            className="p-1.5 rounded bg-white border border-stone-200 text-stone-500 hover:text-amber-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Month Summary */}
      <div className="px-2.5 py-2 space-y-2">
        {/* Month Headline & Vitals - Zero Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-stone-100 gap-1.5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-vedic font-black text-stone-950 text-[16px] sm:text-[18px] tracking-tight">
                {currentMonth.monthName}
              </span>
              <div className="h-3 w-px bg-stone-200" />
              <div className="flex text-amber-400 text-[14px]">
                {'★'.repeat(currentMonth.overallRating)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[13px] font-black uppercase tracking-wider">
            <div className="text-emerald-700">
              Fav: <span className="text-stone-950">{currentMonth.favorableDays}</span>
            </div>
            <div className="text-rose-700">
              Caution: <span className="text-stone-950">{currentMonth.cautionDays}</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars - Balanced Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: 'Career', text: currentMonth.careerWealthForecast, color: 'amber', icon: Briefcase },
            { label: 'Love', text: currentMonth.loveFamilyForecast, color: 'rose', icon: Heart },
            { label: 'Health', text: currentMonth.healthVitalityForecast, color: 'emerald', icon: Activity },
            { label: 'Spirit', text: currentMonth.spiritualForecast, color: 'purple', icon: Sparkles },
          ].map((p, i) => (
            <div key={i} className="bg-[#FAF8F5]/70 rounded-md p-2 border border-stone-100 space-y-1">
              <span className={`text-[12px] font-black uppercase tracking-wider text-${p.color}-700 flex items-center space-x-1`}>
                <p.icon className="w-3 h-3" />
                <span>{p.label}</span>
              </span>
              <p className="text-[14px] text-stone-700 leading-snug">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        {/* Do's & Don'ts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-stone-100">
          <div className="space-y-1">
            <span className="text-[12px] font-black text-emerald-800 uppercase tracking-wider block">Auspicious</span>
            <ul className="space-y-1">
              {currentMonth.dos.slice(0, 2).map((d, i) => (
                <li key={i} className="text-[13px] text-stone-800 flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span className="leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1">
            <span className="text-[12px] font-black text-rose-800 uppercase tracking-wider block">Avoid</span>
            <ul className="space-y-1">
              {currentMonth.donts.slice(0, 2).map((d, i) => (
                <li key={i} className="text-[13px] text-stone-800 flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span className="leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
