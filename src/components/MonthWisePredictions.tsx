import React, { useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Flame,
  ChevronDown,
  Star,
  Compass,
  Briefcase,
  TrendingUp,
  GraduationCap,
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
  // Guard: If no predictions available, show a loading or empty state
  if (!monthlyPredictions || monthlyPredictions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 shadow-3xs p-4 text-center">
        <p className="text-stone-600 text-[11.5px] italic">Loading predictions...</p>
      </div>
    );
  }

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Current month key for today's date
  const now = new Date();
  const currentActualMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Use passed selectedMonthKey or default to current actual month
  const activeMonthKey = selectedMonthKey || currentActualMonthKey;

  // Find index of selected month
  const currentIndex = Math.max(
    0,
    monthlyPredictions.findIndex((m) => m.monthKey === activeMonthKey)
  );

  // Filter to show 12 months before and after
  const startIndex = Math.max(0, currentIndex - 12);
  const endIndex = Math.min(monthlyPredictions.length, currentIndex + 13);
  const visiblePredictions = monthlyPredictions.slice(startIndex, endIndex);

  const selectedMonthData = monthlyPredictions[currentIndex] || monthlyPredictions[0];

  const handleMonthJump = (monthKey: string) => {
    onSelectMonthKey?.(monthKey);
    // Smooth scroll to card inside container
    setTimeout(() => {
      const el = document.getElementById(`month-card-${monthKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Scroll to current / active month on initial mount
  useEffect(() => {
    const el = document.getElementById(`month-card-${activeMonthKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs overflow-hidden space-y-2.5 p-2.5">
      {/* Top Header & Interactive Jump Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[14.5px] tracking-tight">
              Month-Wise Transit Predictions Stream
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">
              Showing active 25-Month window • Click any month below to jump
            </span>
          </div>
        </div>

        {/* Active Month Indicator badge (replacing single month toggle & arrows) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md flex items-center space-x-1.5 shadow-3xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>Active: {selectedMonthData?.monthName}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Month Jump Navigator Strip */}
      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-1 min-w-max">
          {visiblePredictions.map((m) => {
            const isSelected = m.monthKey === (selectedMonthKey || selectedMonthData.monthKey);
            const isTodayMonth = m.monthKey === currentActualMonthKey;
            return (
              <button
                key={m.monthKey}
                type="button"
                onClick={() => handleMonthJump(m.monthKey)}
                className={`px-2 py-1 rounded text-center transition-all cursor-pointer border text-[11px] font-bold ${
                  isSelected
                    ? 'bg-amber-800 text-white border-amber-950 shadow-3xs ring-1 ring-amber-400'
                    : isTodayMonth
                    ? 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200/90'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-[#FAF8F5] hover:border-amber-300'
                }`}
              >
                <span>{m.monthName.split(' ')[0]}</span>{' '}
                <span className="text-[9.5px] opacity-80">{isTodayMonth ? '★ NOW' : m.monthName.split(' ')[1]}</span>
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
        const isCurrentMonth = monthData.monthKey === currentActualMonthKey;
        return (
          <React.Fragment key={monthData.monthKey}>
            {/* HORIZONTAL & VERTICAL CURRENT MONTH/YEAR REFERENCE LINE */}
            {isCurrentMonth && (
              <div className="flex items-center gap-2 py-1 my-1">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-400 to-amber-600" />
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-100/90 border border-amber-300 text-amber-950 font-bold text-[11px] uppercase tracking-wider shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <span>Current Month &amp; Year: {monthData.monthName}</span>
                </div>
                <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-400 to-amber-600" />
              </div>
            )}

            <div
              id={`month-card-${monthData.monthKey}`}
              className={`bg-white/90 backdrop-blur-sm rounded-lg border shadow-3xs overflow-hidden ${
                isCurrentMonth
                  ? 'border-l-4 border-l-amber-500 border-amber-300 ring-1 ring-amber-300/80 bg-amber-50/15'
                  : 'border-stone-200'
              }`}
            >
          {/* Month Headline & Vitals - Zero Pill */}
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-vedic font-black text-stone-950 text-[13px] tracking-tight break-words">
                  {monthData.monthName}
                </span>
                <div className="h-3 w-px bg-stone-200" />
                <div className="flex text-amber-400 text-[11.5px]">
                  {'★'.repeat(monthData.overallRating)}
                </div>
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
            {/* 6 Pillars - Career, Wealth, Education, Love, Health, Spirit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { label: 'Career', text: monthData.careerWealthForecast, textColor: 'text-amber-800', icon: Briefcase },
                { label: 'Wealth', text: `Dhana & Labha Yoga alignment during ${monthData.monthName} supports structured savings, asset liquidity, and prudent cash-flow management.`, textColor: 'text-emerald-800', icon: TrendingUp },
                { label: 'Education', text: `Budha and Guru transit influences sharpen academic retention and analytical study throughout ${monthData.monthName}.`, textColor: 'text-indigo-800', icon: GraduationCap },
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
          </div>
        </div>
      </React.Fragment>
      );
    })}
      </div>
    </div>
  );
}
