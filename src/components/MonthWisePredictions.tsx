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

  // If parent controls selectedMonthKey, find its index, else use internal state
  const currentIndex = selectedMonthKey
    ? Math.max(0, monthlyPredictions.findIndex((m) => m.monthKey === selectedMonthKey))
    : internalMonthIndex;

  const currentMonth = monthlyPredictions[currentIndex] || monthlyPredictions[0];

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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
      {/* Month-Wise Dropdown Header Bar */}
      <div className="px-2.5 py-2 bg-stone-50/50 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-700" />
          <h3 className="font-vedic font-black text-stone-900 text-[10px] uppercase tracking-widest leading-tight">
            Transit Calendar
          </h3>
        </div>

        {/* DROPDOWN MENU - ZERO PILL STYLE */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentIndex === 0}
            className="p-1 rounded bg-white border border-stone-100 text-stone-400 hover:text-amber-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <select
              id="month-select-dropdown"
              value={currentIndex}
              onChange={handleMonthChange}
              className="appearance-none bg-white border border-stone-200 text-stone-800 text-[10px] font-black uppercase tracking-widest rounded px-2 pr-6 py-1 focus:outline-none focus:border-amber-400 shadow-3xs cursor-pointer"
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
            className="p-1 rounded bg-white border border-stone-100 text-stone-400 hover:text-amber-700 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Month Summary */}
      <div className="px-2 sm:px-3 py-2.5 space-y-3">
        {/* Month Headline & Vitals - Zero Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-vedic font-black text-stone-900 text-sm sm:text-base tracking-tight">
                {currentMonth.monthName}
              </span>
              <div className="h-3 w-px bg-stone-200" />
              <div className="flex text-amber-400">
                {'★'.repeat(currentMonth.overallRating)}
              </div>
            </div>
            <p className="text-[10px] text-stone-400 font-medium italic mt-0.5">
              "{currentMonth.tagline}"
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest">
            <div className="text-emerald-700">
              Fav: <span className="text-stone-900">{currentMonth.favorableDays}</span>
            </div>
            <div className="text-rose-700">
              Caution: <span className="text-stone-900">{currentMonth.cautionDays}</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars - Tighter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Career', text: currentMonth.careerWealthForecast, color: 'amber', icon: Briefcase },
            { label: 'Love', text: currentMonth.loveFamilyForecast, color: 'rose', icon: Heart },
            { label: 'Health', text: currentMonth.healthVitalityForecast, color: 'emerald', icon: Activity },
            { label: 'Spirit', text: currentMonth.spiritualForecast, color: 'purple', icon: Sparkles },
          ].map((p, i) => (
            <div key={i} className="space-y-1">
              <span className={`text-[8px] font-black uppercase tracking-widest text-${p.color}-700 flex items-center space-x-1`}>
                <p.icon className="w-2.5 h-2.5" />
                <span>{p.label}</span>
              </span>
              <p className="text-[10px] text-stone-600 leading-snug">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        {/* Do's & Don'ts - Tighter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-stone-50">
          <div className="space-y-1.5">
            <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest block">Auspicious Actions</span>
            <ul className="space-y-1">
              {currentMonth.dos.slice(0, 3).map((d, i) => (
                <li key={i} className="text-[10px] text-stone-600 flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <span className="text-[8px] font-black text-rose-800 uppercase tracking-widest block">Avoid Actions</span>
            <ul className="space-y-1">
              {currentMonth.donts.slice(0, 3).map((d, i) => (
                <li key={i} className="text-[10px] text-stone-600 flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
