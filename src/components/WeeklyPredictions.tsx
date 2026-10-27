import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Briefcase,
  TrendingUp,
  Heart,
  Activity,
  Star,
  Clock,
  Compass,
} from 'lucide-react';
import { WeeklyPrediction } from '../types';

interface WeeklyPredictionsProps {
  weeklyPredictions: WeeklyPrediction[];
  userName: string;
  selectedMonthKey?: string;
}

export function WeeklyPredictions({
  weeklyPredictions,
  userName,
  selectedMonthKey,
}: WeeklyPredictionsProps) {
  if (!weeklyPredictions || weeklyPredictions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 shadow-3xs p-4 text-center">
        <p className="text-stone-600 text-[13px] italic">No weekly predictions available.</p>
      </div>
    );
  }

  const [activeWeekKey, setActiveWeekKey] = useState<string>(weeklyPredictions[0].weekKey);

  const selectedWeek = weeklyPredictions.find((w) => w.weekKey === activeWeekKey) || weeklyPredictions[0];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs overflow-hidden space-y-2.5 p-2.5">
      {/* Header & Week Jump Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[14.5px] tracking-tight">
              Weekly Astrological Forecasts &amp; Transits
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">
              Detailed week-by-week planetary guidance for {userName}
            </span>
          </div>
        </div>

        {/* Week Selector Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {weeklyPredictions.map((w, idx) => {
            const isSelected = w.weekKey === activeWeekKey;
            return (
              <button
                key={w.weekKey}
                type="button"
                onClick={() => setActiveWeekKey(w.weekKey)}
                className={`px-2.5 py-1 rounded text-center transition-all cursor-pointer border text-[11px] font-bold shrink-0 ${
                  isSelected
                    ? 'bg-amber-800 text-white border-amber-950 shadow-3xs ring-1 ring-amber-400'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-[#FAF8F5] hover:border-amber-300'
                }`}
              >
                <span>Week {idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Week Card */}
      <div className="bg-[#FAF9F6] rounded-lg border border-amber-200/80 shadow-3xs overflow-hidden p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200/60 pb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-vedic font-black text-stone-950 text-[15px] tracking-tight">
                {selectedWeek.weekTitle}
              </span>
              <div className="flex text-amber-500 text-[13px]">
                {'★'.repeat(selectedWeek.overallRating)}
              </div>
            </div>
            <p className="text-[11.5px] text-amber-900 font-semibold mt-0.5">
              {selectedWeek.tagline}
            </p>
          </div>

          <div className="text-right flex flex-col sm:items-end">
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              {selectedWeek.lunarPhase}
            </span>
            <span className="text-[10px] text-stone-500 font-mono mt-0.5">
              {selectedWeek.startDate} to {selectedWeek.endDate}
            </span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded p-2 border border-stone-200 shadow-3xs space-y-1">
            <div className="flex items-center space-x-1 text-amber-900 font-bold text-[12px]">
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <span>Career &amp; Enterprise</span>
            </div>
            <p className="text-[11.5px] text-stone-700 leading-snug">
              {selectedWeek.careerFocus}
            </p>
          </div>

          <div className="bg-white rounded p-2 border border-stone-200 shadow-3xs space-y-1">
            <div className="flex items-center space-x-1 text-emerald-950 font-bold text-[12px]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>Wealth &amp; Finances</span>
            </div>
            <p className="text-[11.5px] text-stone-700 leading-snug">
              {selectedWeek.wealthFocus}
            </p>
          </div>

          <div className="bg-white rounded p-2 border border-stone-200 shadow-3xs space-y-1">
            <div className="flex items-center space-x-1 text-rose-950 font-bold text-[12px]">
              <Heart className="w-3.5 h-3.5 text-rose-700" />
              <span>Relationships &amp; Family</span>
            </div>
            <p className="text-[11.5px] text-stone-700 leading-snug">
              {selectedWeek.relationshipsFocus}
            </p>
          </div>

          <div className="bg-white rounded p-2 border border-stone-200 shadow-3xs space-y-1">
            <div className="flex items-center space-x-1 text-sky-950 font-bold text-[12px]">
              <Activity className="w-3.5 h-3.5 text-sky-700" />
              <span>Health &amp; Vitality</span>
            </div>
            <p className="text-[11.5px] text-stone-700 leading-snug">
              {selectedWeek.healthFocus}
            </p>
          </div>
        </div>

        {/* Days & Remedy Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="bg-emerald-50/80 rounded p-2 border border-emerald-200 text-[11.5px]">
            <span className="font-bold text-emerald-900 block mb-0.5">Auspicious Days</span>
            <span className="text-emerald-950 font-semibold">{selectedWeek.auspiciousDays}</span>
          </div>
          <div className="bg-rose-50/80 rounded p-2 border border-rose-200 text-[11.5px]">
            <span className="font-bold text-rose-900 block mb-0.5">Caution Days</span>
            <span className="text-rose-950 font-semibold">{selectedWeek.cautionDays}</span>
          </div>
          <div className="bg-amber-100/60 rounded p-2 border border-amber-300 text-[11.5px]">
            <span className="font-bold text-amber-950 block mb-0.5">Weekly Vedic Upaya</span>
            <span className="text-amber-900">{selectedWeek.weeklyRemedy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
