import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Compass,
  ArrowRight,
  Flame,
  ShieldCheck,
  Layers,
  Heart,
  Briefcase,
  Activity,
  Feather,
  Award,
} from 'lucide-react';
import {
  calculateVimshottariDasha,
  calculateAntardashas,
  calculatePlanetaryPositions,
  getDashaMonthlyPlanetaryGuidance,
  ALL_MONTH_WISE_PREDICTIONS,
} from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { ProfileSelector } from './ProfileSelector';
import { PlaceValue } from './PlaceOfBirthInput';
import { GrahaName, UserProfile } from '../types';
import {
  getSavedProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/profileStorage';

interface VimshottariDashaTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
  onNavigateToMonthWise?: () => void;
  onNavigateToBirthTime?: () => void;
  onNavigateToMilestones?: () => void;
}

export function VimshottariDashaTab({
  activeProfileId,
  profiles,
  onNavigateToMonthWise,
  onNavigateToBirthTime,
  onNavigateToMilestones,
}: VimshottariDashaTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Seeker parameters
  const [name, setName] = useState(currentProfile?.name || 'Aarav Sharma');
  const [birthDate, setBirthDate] = useState(currentProfile?.birthDate || '1990-05-18');
  const [birthTime, setBirthTime] = useState(currentProfile?.birthTime || '14:35');
  const [selectedCity, setSelectedCity] = useState<PlaceValue>(() => {
    if (currentProfile?.place) {
      return {
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.209,
        tz: currentProfile.timezone ?? 5.5,
      };
    }
    return {
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.209,
      tz: 5.5,
    };
  });

  // Selected Month for Monthly Planetary Changes & Guidance
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-09');

  // Selected Mahadasha for Antardashas inspection
  const [selectedMahadashaPlanet, setSelectedMahadashaPlanet] = useState<GrahaName | null>(null);

  // Sync state when profile changes
  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name);
      setBirthDate(currentProfile.birthDate);
      setBirthTime(currentProfile.birthTime);
      setSelectedCity({
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.2090,
        tz: currentProfile.timezone ?? 5.5,
      });
    }
  }, [currentProfile]);

  // 1. Calculate Natal Moon & Lagna
  const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
  const natalCalc = calculatePlanetaryPositions(
    birthDateTime,
    selectedCity.lat,
    selectedCity.lng
  );
  const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra');
  const natalMoonTotalDeg = natalMoon ? (natalMoon.rasiNumber - 1) * 30 + natalMoon.degree : 45;
  const natalMoonRasi = natalMoon?.rasiNumber || 2;
  const natalLagnaRasi = natalCalc.lagnaRasi || 1;
  const natalNakshatra = natalMoon?.nakshatra || 'Rohini';

  // 2. Calculate Vimshottari Mahadashas
  const vimshottariDasha = calculateVimshottariDasha(natalMoonTotalDeg, birthDate);

  // Expanded Antardasha index for reading
  const [expandedAntarIndex, setExpandedAntarIndex] = useState<number | null>(null);

  // Expanded Mahadasha index for reading
  const [expandedMahaIndex, setExpandedMahaIndex] = useState<number | null>(null);

  // Default selected Mahadasha to currently active one
  const activeDashaLord = selectedMahadashaPlanet || vimshottariDasha.currentLord;
  const currentMahadashaInfo =
    vimshottariDasha.cycle.find((c) => c.planet === activeDashaLord) ||
    vimshottariDasha.cycle[0];

  // 3. Calculate Antardashas for the chosen Mahadasha
  const antardashas = calculateAntardashas(
    activeDashaLord,
    currentMahadashaInfo.durationYears,
    currentMahadashaInfo.startAge,
    birthDate
  );

  // 4. Calculate Planetary Positions for the 15th of the selected month
  const [tYear, tMonth] = (selectedMonthKey || '2026-09').split('-').map(Number);
  const transitDate = new Date(tYear, tMonth - 1, 15, 12, 0, 0);
  const transitCalc = calculatePlanetaryPositions(
    transitDate,
    selectedCity.lat,
    selectedCity.lng
  );

  // 5. Calculate Monthly Planetary Changes, Guidance, and Do's & Don'ts
  const monthlyGuidance = getDashaMonthlyPlanetaryGuidance(
    vimshottariDasha.currentLord,
    selectedMonthKey,
    natalMoonRasi,
    natalLagnaRasi,
    transitCalc.planets
  );

  const monthIndex = ALL_MONTH_WISE_PREDICTIONS.findIndex(
    (m) => m.monthKey === selectedMonthKey
  );
  const currentMonthIdx = monthIndex >= 0 ? monthIndex : 0;

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      setSelectedMonthKey(ALL_MONTH_WISE_PREDICTIONS[currentMonthIdx - 1].monthKey);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < ALL_MONTH_WISE_PREDICTIONS.length - 1) {
      setSelectedMonthKey(ALL_MONTH_WISE_PREDICTIONS[currentMonthIdx + 1].monthKey);
    }
  };

  return (
    <div className="w-full px-0.5 sm:px-1 py-1 space-y-1.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200/80 pb-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="p-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 font-bold">
              <Layers className="w-3 h-3" />
            </span>
            <h1 className="text-base sm:text-lg font-vedic font-bold text-stone-900 leading-tight">
              Vimshottari Dasha System
            </h1>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
            120-Year Parashari Planetary Periods • Mahadashas, Antardashas & Monthly Planetary Changes
          </p>
        </div>

        {/* Quick Cross-Navigation Links */}
        <div className="flex items-center space-x-1 shrink-0 text-xs">
          {onNavigateToMilestones && (
            <button
              type="button"
              onClick={onNavigateToMilestones}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold transition-colors cursor-pointer shadow-2xs text-[10px] sm:text-[11px]"
            >
              <Award className="w-3 h-3 text-purple-700" />
              <span>Life Milestones & Best Eras</span>
            </button>
          )}
          {onNavigateToBirthTime && (
            <button
              type="button"
              onClick={onNavigateToBirthTime}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors cursor-pointer shadow-2xs text-[10px] sm:text-[11px]"
            >
              <Compass className="w-3 h-3 text-stone-500" />
              <span>Janam Kundali</span>
            </button>
          )}
          {onNavigateToMonthWise && (
            <button
              type="button"
              onClick={onNavigateToMonthWise}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium transition-colors cursor-pointer shadow-2xs text-[10px] sm:text-[11px]"
            >
              <Calendar className="w-3 h-3 text-amber-700" />
              <span>Full Gochar Transits</span>
            </button>
          )}
        </div>
      </div>

      {/* Minimal Dasha Alignment Badges (No Repetition of Birth Details) */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-0.5 text-xs">
        <div className="flex items-center space-x-1 text-[10px]">
          <span className="px-1.5 py-0.2 rounded bg-white border border-stone-200 text-stone-700 shadow-2xs">
            Janma Nakshatra: <strong className="text-stone-800">{natalNakshatra}</strong>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-white border border-stone-200 text-stone-700 shadow-2xs">
            Birth Lord: <strong className="text-purple-800">{vimshottariDasha.birthLord}</strong>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-900 border border-purple-200 font-medium">
            Active Mahadasha: {vimshottariDasha.currentLord}
          </span>
        </div>

        <span className="text-[9px] text-stone-500 italic hidden sm:inline">
          Sidereal 120-Year Vimshottari Dasha Sequence
        </span>
      </div>

      {/* SECTION 1: VIMSHOTTARI MAHADASHAS DECK */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 px-2 py-1.5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-1">
          <div>
            <h2 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm flex items-center space-x-1.5 leading-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Mahadasha Cycle</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto text-[10px]">
            <span className="text-stone-400">Balance at Birth: <strong className="text-stone-600">{vimshottariDasha.yearsRemainingAtBirth} yrs</strong></span>
          </div>
        </div>

        {/* Mahadasha Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-1.5">
          {vimshottariDasha.cycle.map((d, idx) => {
            const isCurrentlyActive = d.planet === vimshottariDasha.currentLord;
            const isSelected = (selectedMahadashaPlanet || vimshottariDasha.currentLord) === d.planet;
            const isExpanded = expandedMahaIndex === idx;

            return (
              <div
                key={`${d.planet}-${d.startMonthYear}`}
                onClick={() => {
                  setSelectedMahadashaPlanet(d.planet);
                  setExpandedMahaIndex(isExpanded ? null : idx);
                }}
                className={`p-1.5 rounded-lg border text-xs transition-all duration-150 cursor-pointer shadow-3xs flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : isCurrentlyActive
                    ? 'bg-purple-50/40 border-purple-200 hover:border-amber-300'
                    : 'bg-white border-stone-100 hover:bg-stone-50 hover:border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex flex-col">
                      <span className="font-vedic font-bold text-stone-900 text-[11px] sm:text-xs">
                        {d.planet}
                      </span>
                      <span className="text-[9px] text-stone-400 font-medium">
                        {d.durationYears} yrs • Age {d.startAge}-{d.endAge}
                      </span>
                    </div>

                    {isCurrentlyActive && (
                      <span className="text-[8px] font-black text-amber-700 tracking-widest shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Start - End Month-Year */}
                  <div className={`text-[9px] font-bold py-0.5 border-t border-stone-100 transition-colors ${
                    isSelected ? 'text-amber-800' : 'text-stone-400 group-hover:text-stone-600'
                  }`}>
                    {d.startMonthYear} – {d.endMonthYear}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-1.5 pt-1 border-t border-stone-100 animate-in fade-in slide-in-from-top-1">
                    <p className="text-[10px] text-stone-700 leading-snug italic">
                      "{d.lifeTheme}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ANTARDASHAS (SUB-PERIODS) INSPECTOR */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200 px-2 py-1.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between gap-1 border-b border-stone-100 pb-1">
          <h3 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm flex items-center space-x-1.5 leading-tight">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{activeDashaLord} Sub-periods</span>
          </h3>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
            Timeline
          </span>
        </div>

        {/* Antardasha Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-1">
          {antardashas.map((antar, idx) => {
            const isExpanded = expandedAntarIndex === idx;
            return (
              <div
                key={`${activeDashaLord}-${antar.planet}-${antar.startMonthYear}`}
                onClick={() => setExpandedAntarIndex(isExpanded ? null : idx)}
                className={`p-1.5 rounded-md border text-xs transition-all cursor-pointer group shadow-3xs ${
                  antar.isCurrent
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-200'
                    : 'bg-white border-stone-100 hover:bg-stone-50 hover:border-amber-200'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`font-vedic font-bold text-[10px] sm:text-[11px] ${antar.isCurrent ? 'text-amber-900' : 'text-stone-700'}`}>
                    {antar.planet}
                  </span>
                  <span className="text-[8px] text-stone-400 font-medium leading-none mb-1">
                    {antar.durationYearsStr}
                  </span>
                  {antar.isCurrent && (
                    <div className="w-1 h-1 rounded-full bg-amber-600 mb-1" />
                  )}
                  <div className={`text-[8px] font-bold text-stone-400 group-hover:text-stone-600`}>
                    {antar.startMonthYear.split('-')[0]}
                  </div>
                </div>

                {isExpanded && (
                  <div className="fixed z-50 left-1/2 -translate-x-1/2 mt-2 w-64 bg-white p-3 rounded-lg border border-stone-200 shadow-xl animate-in zoom-in-95 duration-200 pointer-events-none">
                    <h5 className="font-vedic font-bold text-xs text-amber-900 mb-1">{activeDashaLord}/{antar.planet}</h5>
                    <p className="text-[10px] text-stone-600 leading-relaxed italic">"{antar.theme}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MONTHLY PLANETARY CHANGES, GUIDANCE & DO'S AND DON'TS */}
      <div className="bg-white rounded-xl border border-amber-200/80 p-2 sm:p-2.5 shadow-2xs space-y-2">
        {/* Top Header with Month Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-200/80 pb-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="p-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
              </span>
              <h2 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm">
                Monthly Planetary Changes & Dasha Guidance
              </h2>
            </div>
            <p className="text-[10px] text-stone-500 mt-0.5">
              Select any month (July 2025 – December 2027) to analyze how cosmic Gochar transits impact your active <strong>{vimshottariDasha.currentLord}</strong> Mahadasha.
            </p>
          </div>

          {/* Month Selector Dropdown with Fast Prev / Next Buttons */}
          <div className="flex items-center space-x-1 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx === 0}
              title="Previous Month"
              className="p-1 rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <select
                id="dasha-month-dropdown"
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="appearance-none bg-[#FAF8F5] border border-amber-300 text-stone-900 text-xs font-semibold rounded-lg pl-2.5 pr-7 py-1 focus:outline-none focus:border-amber-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <optgroup label="2025 (Jul – Dec)">
                  {ALL_MONTH_WISE_PREDICTIONS.filter((m) => m.monthKey.startsWith('2025')).map(
                    (m) => (
                      <option key={m.monthKey} value={m.monthKey}>
                        {m.monthName} ({'★'.repeat(m.overallRating)})
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="2026 (Full Year)">
                  {ALL_MONTH_WISE_PREDICTIONS.filter((m) => m.monthKey.startsWith('2026')).map(
                    (m) => (
                      <option key={m.monthKey} value={m.monthKey}>
                        {m.monthName} ({'★'.repeat(m.overallRating)})
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="2027 (Full Year)">
                  {ALL_MONTH_WISE_PREDICTIONS.filter((m) => m.monthKey.startsWith('2027')).map(
                    (m) => (
                      <option key={m.monthKey} value={m.monthKey}>
                        {m.monthName} ({'★'.repeat(m.overallRating)})
                      </option>
                    )
                  )}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx === ALL_MONTH_WISE_PREDICTIONS.length - 1}
              title="Next Month"
              className="p-1 rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dasha Lord Transit Status Banner */}
        <div className="bg-[#FAF8F5] rounded-lg border border-amber-200/90 px-2 py-1.5 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-vedic font-bold text-stone-900 text-xs">
                Active Dasha Lord: {monthlyGuidance.mahadashaLord}
              </span>
              <span className="text-[10px] text-stone-400">•</span>
              <span className="text-[10px] text-amber-900 font-semibold">
                {monthlyGuidance.dashaLordTransitSign}
              </span>
            </div>

            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shadow-2xs ${
                monthlyGuidance.synergyTone === 'Highly Auspicious' ||
                monthlyGuidance.synergyTone === 'Auspicious'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : monthlyGuidance.synergyTone === 'Caution Required'
                  ? 'bg-rose-50 text-rose-900 border-rose-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              Synergy: {monthlyGuidance.synergyTone}
            </span>
          </div>

          <p className="text-[11px] text-stone-700 leading-snug">
            {monthlyGuidance.dashaLordStatus}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-stone-500 border-t border-stone-200/60">
            <span>
              Favorable Days: <strong className="text-emerald-800">{monthlyGuidance.favorableDays}</strong>
            </span>
            <span>•</span>
            <span>
              Caution Days: <strong className="text-rose-800">{monthlyGuidance.cautionDays}</strong>
            </span>
          </div>
        </div>

        {/* 1. Monthly Planetary Movements */}
        <div className="space-y-1">
          <h3 className="font-vedic font-bold text-stone-900 text-xs flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-700" />
            <span>Key Planetary Ingresses & Movements in {monthlyGuidance.monthName}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {monthlyGuidance.keyPlanetaryChanges.map((event, idx) => (
              <div
                key={idx}
                className="bg-[#FCFAF6] border border-stone-200 rounded-md px-2 py-1 text-xs space-y-0.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-[10px] sm:text-[11px] truncate">{event.event}</span>
                  <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 shrink-0 ml-1">
                    {event.date}
                  </span>
                </div>
                <p className="text-[10px] text-stone-600 leading-tight">
                  {event.impactSummary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Astrological Guidance (Dasha × Gochar Synergy) across 4 Key Life Areas */}
        <div className="space-y-1 pt-0.5">
          <h3 className="font-vedic font-bold text-stone-900 text-xs flex items-center space-x-1.5">
            <Feather className="w-3.5 h-3.5 text-purple-700" />
            <span>Astrological Guidance (Dasha & Gochar Synergy for {monthlyGuidance.monthName})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {/* Career & Finances */}
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-md px-2 py-1.5 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-amber-900">
                <Briefcase className="w-3 h-3 text-amber-700" />
                <span className="font-vedic font-bold text-[11px]">Career, Business & Wealth Strategy</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-700 leading-relaxed">
                {monthlyGuidance.guidance.careerAndFinances}
              </p>
            </div>

            {/* Relationships & Family */}
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-md px-2 py-1.5 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-rose-900">
                <Heart className="w-3 h-3 text-rose-600" />
                <span className="font-vedic font-bold text-[11px]">Relationships, Family & Marriage</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-700 leading-relaxed">
                {monthlyGuidance.guidance.relationshipsAndFamily}
              </p>
            </div>

            {/* Health & Vitality */}
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-md px-2 py-1.5 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-emerald-900">
                <Activity className="w-3 h-3 text-emerald-700" />
                <span className="font-vedic font-bold text-[11px]">Health, Vitality & Ayurvedic Lifestyle</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-700 leading-relaxed">
                {monthlyGuidance.guidance.healthAndVitality}
              </p>
            </div>

            {/* Spiritual & Karmic Sadhana */}
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-md px-2 py-1.5 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-purple-900">
                <Sparkles className="w-3 h-3 text-purple-700" />
                <span className="font-vedic font-bold text-[11px]">Spiritual Sadhana & Dharmic Observance</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-700 leading-relaxed">
                {monthlyGuidance.guidance.spiritualAndKarmic}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Do's and Don'ts for the Month */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
          {/* Do's */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Recommended Do's for {monthlyGuidance.monthName}</span>
            </div>
            <ul className="space-y-1 text-[10px] sm:text-[11px] text-stone-800">
              {monthlyGuidance.dos.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-rose-900 font-bold text-[11px]">
              <XCircle className="w-3.5 h-3.5 text-rose-700" />
              <span>Precautions & Don'ts to Avoid Pitfalls</span>
            </div>
            <ul className="space-y-1 text-[10px] sm:text-[11px] text-stone-800">
              {monthlyGuidance.donts.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Vedic Remedy of the Month */}
        <div className="bg-[#FCFAF6] border border-amber-300 rounded-lg p-2 space-y-0.5 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>Vedic Remedy & Planetary Harmonization of the Month</span>
          </div>
          <p className="text-[11px] text-stone-700 leading-relaxed">
            {monthlyGuidance.monthlyRemedy}
          </p>
        </div>
      </div>
    </div>
  );
}
