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

  if (!currentMonth) return null;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
      {/* Month-Wise Dropdown Header Bar */}
      <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <h3 className="font-vedic font-bold text-stone-900 text-sm sm:text-base">
              Month-Wise Astrological Transit Predictions
            </h3>
            <p className="text-[11px] text-stone-500">
              Select any month from July 2025 through December 2027 to view targeted Gochar transits
            </p>
          </div>
        </div>

        {/* DROPDOWN MENU FOR MONTHWISE PREDICTIONS WITH QUICK PREV / NEXT NAVIGATION */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentIndex === 0}
            title="Previous Month"
            className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <select
              id="month-select-dropdown"
              value={currentIndex}
              onChange={handleMonthChange}
              className="appearance-none bg-white border border-stone-300 text-stone-900 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
            >
              {/* Year 2025 */}
              <optgroup label="2025 (Jul – Dec)">
                {monthlyPredictions
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.monthKey.startsWith('2025'))
                  .map(({ m, idx }) => (
                    <option key={m.monthKey} value={idx}>
                      {m.monthName} ({'★'.repeat(m.overallRating)})
                    </option>
                  ))}
              </optgroup>

              {/* Year 2026 */}
              <optgroup label="2026 (Full Year)">
                {monthlyPredictions
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.monthKey.startsWith('2026'))
                  .map(({ m, idx }) => (
                    <option key={m.monthKey} value={idx}>
                      {m.monthName} ({'★'.repeat(m.overallRating)})
                    </option>
                  ))}
              </optgroup>

              {/* Year 2027 */}
              <optgroup label="2027 (Full Year)">
                {monthlyPredictions
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.monthKey.startsWith('2027'))
                  .map(({ m, idx }) => (
                    <option key={m.monthKey} value={idx}>
                      {m.monthName} ({'★'.repeat(m.overallRating)})
                    </option>
                  ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentIndex === monthlyPredictions.length - 1}
            title="Next Month"
            className="p-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Month Summary (Horizontally Compact) */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Month Headline & Quick Vitals */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-vedic font-bold text-stone-900 text-base sm:text-lg">
                {currentMonth.monthName}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-semibold flex items-center space-x-1">
                <span className="text-amber-500">{'★'.repeat(currentMonth.overallRating)}</span>
                <span>({currentMonth.overallRating}/5)</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 italic mt-0.5">
              "{currentMonth.tagline}"
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              <strong>Favorable:</strong> {currentMonth.favorableDays}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200">
              <strong>Caution:</strong> {currentMonth.cautionDays}
            </span>
          </div>
        </div>

        {/* Major Ingresses & Key Planetary Shifts for this Month */}
        {currentMonth.planetaryMovements && currentMonth.planetaryMovements.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Key Planetary Shifts in {currentMonth.monthName}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentMonth.planetaryMovements.map((pm, i) => (
                <div
                  key={i}
                  className="bg-[#FAF8F5] p-2.5 rounded-lg border border-stone-200 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between font-semibold text-stone-900">
                    <span className="text-[11px] truncate">{pm.event}</span>
                    <span className="text-[10px] text-amber-800 font-mono shrink-0 ml-1">
                      {pm.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    {pm.impactSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Pillars Summary for Selected Month */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
              💼 Career & Finance
            </span>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              {currentMonth.careerWealthForecast}
            </p>
          </div>

          <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
              🏡 Love & Marriage
            </span>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              {currentMonth.loveFamilyForecast}
            </p>
          </div>

          <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              🌿 Health & Vitality
            </span>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              {currentMonth.healthVitalityForecast}
            </p>
          </div>

          <div className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
              🪔 Sadhana & Spirit
            </span>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              {currentMonth.spiritualForecast}
            </p>
          </div>
        </div>

        {/* Month Vedic Do's, Don'ts & Upaya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          {/* Do's */}
          <div className="bg-emerald-50/60 rounded-lg border border-emerald-200 p-2.5 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-[11px] uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Shubh Karmas</span>
            </div>
            <ul className="space-y-1 text-[11px] text-stone-700">
              {currentMonth.dos.slice(0, 3).map((d, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold text-xs">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50/60 rounded-lg border border-red-200 p-2.5 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-red-900 font-bold text-[11px] uppercase tracking-wide">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Actions to Avoid (Varjya)</span>
            </div>
            <ul className="space-y-1 text-[11px] text-stone-700">
              {currentMonth.donts.slice(0, 3).map((d, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-red-600 font-bold text-xs">✗</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Monthly Upaya */}
        {currentMonth.remedyOfMonth && (
          <div className="bg-[#FAF5EC] p-2.5 rounded-lg border border-[#E8DEC8] flex items-center space-x-2 text-xs">
            <Flame className="w-4 h-4 text-amber-700 shrink-0" />
            <div className="text-[11px] text-stone-800">
              <strong className="text-stone-900 font-semibold">Remedy of the Month: </strong>
              <span>{currentMonth.remedyOfMonth}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
