import React, { useEffect, useRef } from 'react';
import {
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Heart,
  Activity,
  Compass,
  ArrowRight,
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
  // Guard: If no predictions available, show a loading or empty state
  if (!monthlyPredictions || monthlyPredictions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 shadow-3xs p-4 text-center">
        <p className="text-stone-600 text-[11.5px] italic">Loading predictions...</p>
      </div>
    );
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Current month key for today's date
  const now = new Date();
  const currentActualMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Use passed selectedMonthKey or default to current actual month
  const activeMonthKey = selectedMonthKey || currentActualMonthKey;

  // Find index of selected month
  const activeIndex = monthlyPredictions.findIndex((m) => m.monthKey === activeMonthKey);
  const currentIndex = activeIndex >= 0 ? activeIndex : Math.floor(monthlyPredictions.length / 2);

  // Ensure full 25-month window (-12 to +12)
  const visiblePredictions = monthlyPredictions.length === 25
    ? monthlyPredictions
    : monthlyPredictions.slice(Math.max(0, currentIndex - 12), Math.min(monthlyPredictions.length, currentIndex + 13));

  const selectedMonthData = monthlyPredictions[currentIndex] || monthlyPredictions[0];

  const handleMonthJump = (monthKey: string) => {
    onSelectMonthKey?.(monthKey);
    setTimeout(() => {
      const el = document.getElementById(`month-card-${monthKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const changeMonthByOffset = (offsetMonths: number) => {
    const [yStr, mStr] = activeMonthKey.split('-');
    const y = parseInt(yStr || '2026', 10);
    const m = parseInt(mStr || '1', 10);
    const d = new Date(y, m - 1 + offsetMonths, 1);
    const nextKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    handleMonthJump(nextKey);
  };

  // Scroll to active month card on initial mount or when activeMonthKey changes
  useEffect(() => {
    const el = document.getElementById(`month-card-${activeMonthKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeMonthKey]);

  const earliestMonth = visiblePredictions[0]?.monthName || '';
  const latestMonth = visiblePredictions[visiblePredictions.length - 1]?.monthName || '';

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs overflow-hidden space-y-2.5 p-2.5">
      {/* Top Header & Interactive Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-vedic font-black text-stone-950 text-[14.5px] tracking-tight">
                Month-Wise Transit Predictions Stream
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                25-Month Window
              </span>
            </div>
            <span className="text-[11px] text-stone-600 font-medium">
              Showing 12 Months Back ◀ <strong className="text-amber-900">{selectedMonthData?.monthName}</strong> ▶ 12 Months Forward
            </span>
          </div>
        </div>

        {/* Quick Month Control Deck */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <div className="flex items-center space-x-0.5 bg-stone-100 rounded p-0.5 border border-stone-200">
            <button
              type="button"
              title="Jump 12 Months Back (-1 Year)"
              onClick={() => changeMonthByOffset(-12)}
              className="p-1 text-stone-600 hover:text-amber-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Previous Month (-1M)"
              onClick={() => changeMonthByOffset(-1)}
              className="p-1 text-stone-600 hover:text-amber-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Direct Month Input / Selector */}
            <input
              type="month"
              value={activeMonthKey}
              onChange={(e) => {
                if (e.target.value) handleMonthJump(e.target.value);
              }}
              className="bg-white border border-stone-300 text-[11px] font-bold text-stone-800 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            <button
              type="button"
              title="Next Month (+1M)"
              onClick={() => changeMonthByOffset(1)}
              className="p-1 text-stone-600 hover:text-amber-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Jump 12 Months Forward (+1 Year)"
              onClick={() => changeMonthByOffset(12)}
              className="p-1 text-stone-600 hover:text-amber-800 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jump to Real-Time Today Button */}
          {activeMonthKey !== currentActualMonthKey && (
            <button
              type="button"
              onClick={() => handleMonthJump(currentActualMonthKey)}
              className="text-[10.5px] font-black uppercase tracking-wider bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              ★ Jump to Today
            </button>
          )}
        </div>
      </div>

      {/* Horizon Context Banner */}
      <div className="bg-[#FAF8F5] border border-amber-200/60 rounded px-2.5 py-1 text-[11px] flex flex-wrap items-center justify-between gap-1 text-stone-700">
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-stone-500">Timeline Scope:</span>
          <span className="font-semibold text-stone-800">{earliestMonth}</span>
          <span className="text-amber-600">◀ 12 Months Back</span>
          <span className="font-black text-amber-950 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300">
            ★ {selectedMonthData?.monthName}
          </span>
          <span className="text-amber-600">12 Months Forward ▶</span>
          <span className="font-semibold text-stone-800">{latestMonth}</span>
        </div>
        <span className="text-[10px] text-stone-500 italic">
          Click any month pill below to re-center the 25-month transit horizon
        </span>
      </div>

      {/* Horizontal Month Jump Navigator Strip (25 Months: -12 to +12) */}
      <div className="overflow-x-auto pb-1.5 scrollbar-thin">
        <div className="flex items-center gap-1 min-w-max">
          {visiblePredictions.map((m, idx) => {
            const isSelected = m.monthKey === activeMonthKey;
            const isTodayMonth = m.monthKey === currentActualMonthKey;
            const relativeOffset = idx - currentIndex;
            const offsetLabel =
              relativeOffset === 0
                ? 'SELECTED'
                : relativeOffset > 0
                ? `+${relativeOffset}M`
                : `${relativeOffset}M`;

            return (
              <button
                key={m.monthKey}
                type="button"
                onClick={() => handleMonthJump(m.monthKey)}
                className={`px-2 py-1 rounded text-center transition-all cursor-pointer border text-[10.5px] flex flex-col items-center justify-center min-w-[58px] ${
                  isSelected
                    ? 'bg-amber-800 text-white border-amber-950 shadow-2xs ring-2 ring-amber-400 font-black scale-105 z-10'
                    : isTodayMonth
                    ? 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200/90 font-bold'
                    : relativeOffset < 0
                    ? 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-amber-300 font-semibold'
                    : 'bg-white text-stone-700 border-amber-100 hover:bg-[#FAF8F5] hover:border-amber-300 font-semibold'
                }`}
              >
                <div className="flex items-center space-x-0.5 leading-tight">
                  <span>{m.monthName.split(' ')[0]}</span>
                  {isTodayMonth && !isSelected && (
                    <span className="text-[7.5px] bg-amber-600 text-white px-0.5 rounded font-black">
                      NOW
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-[9px] opacity-85 leading-tight">
                  <span>'{m.monthName.split(' ')[1]?.slice(2)}</span>
                  <span
                    className={`font-mono text-[8px] ${
                      isSelected
                        ? 'text-amber-200 font-black'
                        : relativeOffset === 0
                        ? 'text-amber-700 font-bold'
                        : 'text-stone-400'
                    }`}
                  >
                    ({offsetLabel})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bounded Scrollable Container with Custom Scrollbar */}
      <div
        ref={scrollContainerRef}
        className="max-h-[580px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400 scrollbar-track-stone-100"
      >
        {visiblePredictions.map((monthData, idx) => {
          const isSelected = monthData.monthKey === activeMonthKey;
          const isCurrentRealMonth = monthData.monthKey === currentActualMonthKey;
          const relativeOffset = idx - currentIndex;

          return (
            <React.Fragment key={monthData.monthKey}>
              {/* GROUP DIVIDER: Prior 12 Months Section Header */}
              {idx === 0 && currentIndex > 0 && (
                <div className="flex items-center gap-2 py-1">
                  <div className="h-px flex-1 bg-stone-300" />
                  <div className="px-2.5 py-0.5 rounded bg-stone-100 border border-stone-300 text-stone-600 font-black text-[10.5px] uppercase tracking-wider flex items-center space-x-1">
                    <ChevronsLeft className="w-3 h-3 text-stone-500" />
                    <span>◀ Prior 12 Months Transits ({visiblePredictions[0]?.monthName} — {visiblePredictions[currentIndex - 1]?.monthName})</span>
                  </div>
                  <div className="h-px flex-1 bg-stone-300" />
                </div>
              )}

              {/* GROUP DIVIDER: Selected Focus Month Banner */}
              {isSelected && (
                <div className="flex items-center gap-2 py-1 my-1">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-400 to-amber-600" />
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-amber-600 text-white font-black text-[11.5px] uppercase tracking-wider shadow-2xs border border-amber-700">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>★ Selected Focus Month: {monthData.monthName} (Center of 25-Month Window)</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-400 to-amber-600" />
                </div>
              )}

              {/* Real-time Current Month Reference Line (if different from selected month) */}
              {isCurrentRealMonth && !isSelected && (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="h-px flex-1 bg-amber-400" />
                  <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-950 font-bold text-[10.5px] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>Current Calendar Month: {monthData.monthName}</span>
                  </div>
                  <div className="h-px flex-1 bg-amber-400" />
                </div>
              )}

              {/* GROUP DIVIDER: Forward 12 Months Section Header */}
              {idx === currentIndex + 1 && idx < visiblePredictions.length && (
                <div className="flex items-center gap-2 py-1">
                  <div className="h-px flex-1 bg-amber-300" />
                  <div className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 font-black text-[10.5px] uppercase tracking-wider flex items-center space-x-1">
                    <span>▶ Forward 12 Months Transits ({visiblePredictions[currentIndex + 1]?.monthName} — {visiblePredictions[visiblePredictions.length - 1]?.monthName})</span>
                    <ChevronsRight className="w-3 h-3 text-amber-700" />
                  </div>
                  <div className="h-px flex-1 bg-amber-300" />
                </div>
              )}

              {/* MONTH CARD */}
              <div
                id={`month-card-${monthData.monthKey}`}
                className={`bg-white/95 backdrop-blur-sm rounded-lg border shadow-3xs overflow-hidden transition-all ${
                  isSelected
                    ? 'border-l-4 border-l-amber-600 border-amber-400 ring-2 ring-amber-300/80 bg-amber-50/20'
                    : isCurrentRealMonth
                    ? 'border-l-4 border-l-amber-400 border-amber-200'
                    : 'border-stone-200'
                }`}
              >
                {/* Month Headline & Vitals */}
                <div className={`px-3 py-1.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                  isSelected ? 'bg-amber-100/60 border-amber-200' : 'bg-stone-50 border-stone-100'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-vedic font-black text-stone-950 text-[13.5px] tracking-tight break-words">
                      {monthData.monthName}
                    </span>
                    <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-amber-700 text-white'
                        : relativeOffset === 0
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-200/80 text-stone-600'
                    }`}>
                      {relativeOffset === 0 ? 'ACTIVE FOCUS' : relativeOffset > 0 ? `+${relativeOffset}M Forward` : `${relativeOffset}M Back`}
                    </span>
                    <div className="h-3 w-px bg-stone-300" />
                    <div className="flex text-amber-400 text-[11.5px]">
                      {'★'.repeat(monthData.overallRating)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] font-black uppercase tracking-wider">
                    <div className="text-emerald-700">
                      Fav: <span className="text-stone-950">{monthData.favorableDays}</span>
                    </div>
                    <div className="text-rose-700">
                      Caution: <span className="text-stone-950">{monthData.cautionDays}</span>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 space-y-2">
                  <p className="font-vedic font-black text-stone-950 text-[12px] leading-tight break-words">
                    {monthData.tagline}
                  </p>

                  {/* Key Planetary Movements for this month */}
                  {monthData.planetaryMovements && monthData.planetaryMovements.length > 0 && (
                    <div className="bg-[#FAF8F5] border border-amber-100 rounded-md p-1.5 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                        <Compass className="w-3 h-3" />
                        <span>Key Gochar Ingresses &amp; Alignments</span>
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[10px] text-stone-700">
                        {monthData.planetaryMovements.slice(0, 4).map((mov, mIdx) => (
                          <div key={mIdx} className="bg-white/80 rounded px-1.5 py-0.5 border border-stone-100">
                            <span className="font-bold text-amber-950">{mov.planet}:</span> {mov.event} — <span className="text-stone-600">{mov.impactSummary}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6 Pillars - Career, Wealth, Education, Love, Health, Spirit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { label: 'Career', text: monthData.careerWealthForecast, textColor: 'text-amber-800', icon: Briefcase },
                      {
                        label: 'Wealth',
                        text: `Dhana & Labha Yoga alignment during ${monthData.monthName} supports structured savings, asset liquidity, and prudent cash-flow management.`,
                        textColor: 'text-emerald-800',
                        icon: TrendingUp,
                      },
                      {
                        label: 'Education',
                        text: `Budha and Guru transit influences sharpen academic retention and analytical study throughout ${monthData.monthName}.`,
                        textColor: 'text-indigo-800',
                        icon: GraduationCap,
                      },
                      { label: 'Love & Family', text: monthData.loveFamilyForecast, textColor: 'text-rose-800', icon: Heart },
                      { label: 'Health', text: monthData.healthVitalityForecast, textColor: 'text-sky-800', icon: Activity },
                      { label: 'Spirit', text: monthData.spiritualForecast, textColor: 'text-purple-800', icon: Sparkles },
                    ].map((p, i) => (
                      <div key={i} className="bg-[#FAF8F5]/70 rounded-md p-2 border border-stone-100 space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${p.textColor} flex items-center space-x-1`}>
                          <p.icon className="w-3 h-3" />
                          <span>{p.label}</span>
                        </span>
                        <p className="text-[10.5px] text-stone-700 leading-snug break-words">
                          {p.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Vedic Remedy of the Month */}
                  {monthData.remedyOfMonth && (
                    <div className="bg-amber-50/60 border border-amber-200/70 rounded px-2 py-1 text-[10.5px] text-amber-950 flex items-start space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900 mr-1">
                          Remedy for {monthData.monthName}:
                        </span>
                        <span>{monthData.remedyOfMonth}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
