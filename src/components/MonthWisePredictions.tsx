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
        <p className="text-stone-600 text-[16px] italic">Loading predictions...</p>
      </div>
    );
  }

  // Find index of selected month
  const currentIndex = selectedMonthKey
    ? Math.max(0, monthlyPredictions.findIndex((m) => m.monthKey === selectedMonthKey))
    : 0;

  // Filter to show 12 months before and after
  const startIndex = Math.max(0, currentIndex - 12);
  const endIndex = Math.min(monthlyPredictions.length, currentIndex + 13);
  const visiblePredictions = monthlyPredictions.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {visiblePredictions.map((monthData, idx) => (
        <div key={monthData.monthKey} className="bg-white/90 backdrop-blur-sm rounded-lg border border-stone-200 shadow-3xs overflow-hidden">
          {/* Month Headline & Vitals - Zero Pill */}
          <div className="px-3 py-2 bg-stone-50 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-vedic font-black text-stone-950 text-[16px] tracking-tight">
                  {monthData.monthName}
                </span>
                <div className="h-3 w-px bg-stone-200" />
                <div className="flex text-amber-400 text-[14px]">
                  {'★'.repeat(monthData.overallRating)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[13px] font-black uppercase tracking-wider">
              <div className="text-emerald-700">
                Fav: <span className="text-stone-950">{monthData.favorableDays}</span>
              </div>
              <div className="text-rose-700">
                Caution: <span className="text-stone-950">{monthData.cautionDays}</span>
              </div>
            </div>
          </div>
          
          <div className="px-3 py-2 space-y-2">
            <p className="font-vedic font-black text-stone-950 text-[14px] leading-tight">
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
                  <span className={`text-[11px] font-black uppercase tracking-wider ${p.textColor} flex items-center space-x-1`}>
                    <p.icon className="w-3 h-3" />
                    <span>{p.label}</span>
                  </span>
                  <p className="text-[12px] text-stone-700 leading-snug">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
