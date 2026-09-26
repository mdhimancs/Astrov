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
    <div className="w-full p-0.5 space-y-0.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200/80 pb-0.5">
        <div>
          <div className="flex items-center space-x-1">
            <span className="p-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold">
              <Layers className="w-2.5 h-2.5" />
            </span>
            <h1 className="text-sm font-vedic font-bold text-stone-900 leading-tight">
              Vimshottari Dasha
            </h1>
          </div>
        </div>

        {/* Quick Cross-Navigation Links */}
        <div className="flex items-center space-x-1 shrink-0">
          {onNavigateToMilestones && (
            <button
              type="button"
              onClick={onNavigateToMilestones}
              className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border border-purple-300 bg-purple-50 text-purple-900 font-semibold transition-colors cursor-pointer shadow-3xs text-[9px]"
            >
              <Award className="w-2.5 h-2.5" />
              <span>Eras</span>
            </button>
          )}
        </div>
      </div>

      {/* Minimal Dasha Alignment Badges */}
      <div className="flex flex-wrap items-center justify-between gap-0.5 px-0.5 text-[9px]">
        <div className="flex items-center space-x-1">
          <span className="px-1 py-0 rounded bg-white border border-stone-200 text-stone-900">
            Nak: <strong className="text-stone-950">{natalNakshatra}</strong>
          </span>
          <span className="px-1 py-0 rounded bg-purple-50 text-purple-950 border border-purple-200 font-medium">
            Active: {vimshottariDasha.currentLord}
          </span>
        </div>
      </div>

      {/* SECTION 1: VIMSHOTTARI MAHADASHAS DECK */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 px-1 py-1 shadow-3xs space-y-1">
        <div className="flex items-center justify-between gap-1 border-b border-stone-100 pb-0.5">
          <h2 className="font-vedic font-bold text-stone-950 text-[10px] flex items-center space-x-1 leading-tight">
            <ShieldCheck className="w-3 h-3 text-purple-700" />
            <span>Mahadasha Cycle</span>
          </h2>
          <span className="text-[8px] text-stone-600 font-bold uppercase tracking-widest">
            {vimshottariDasha.yearsRemainingAtBirth}y Balance
          </span>
        </div>

        {/* Mahadasha Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-0.5">
          {vimshottariDasha.cycle.map((d, idx) => {
            const isCurrentlyActive = d.planet === vimshottariDasha.currentLord;
            const isSelected = (selectedMahadashaPlanet || vimshottariDasha.currentLord) === d.planet;
            
            return (
              <div
                key={`${d.planet}-${d.startMonthYear}`}
                onClick={() => setSelectedMahadashaPlanet(d.planet)}
                className={`p-1 rounded border text-[9px] transition-all duration-150 cursor-pointer shadow-3xs flex flex-col items-center justify-center text-center ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300'
                    : isCurrentlyActive
                    ? 'bg-purple-50/40 border-purple-200'
                    : 'bg-white border-stone-100 hover:border-stone-200'
                }`}
              >
                <span className="font-bold text-stone-950">{d.planet}</span>
                <span className="text-[7px] text-stone-600">{d.durationYears}y</span>
                {isCurrentlyActive && <div className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ANTARDASHAS (SUB-PERIODS) INSPECTOR */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 px-1 py-1 shadow-3xs space-y-1">
        <div className="flex items-center justify-between gap-1 border-b border-stone-100 pb-0.5">
          <h3 className="font-vedic font-bold text-stone-950 text-[10px] flex items-center space-x-1 leading-tight">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            <span>{activeDashaLord} Sub-periods</span>
          </h3>
        </div>

        {/* Antardasha Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-0.5">
          {antardashas.map((antar, idx) => {
            return (
              <div
                key={`${activeDashaLord}-${antar.planet}-${antar.startMonthYear}`}
                className={`p-1 rounded border text-[9px] flex flex-col items-center text-center shadow-3xs ${
                  antar.isCurrent
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-white border-stone-50'
                }`}
              >
                <span className="font-bold text-stone-900">{antar.planet}</span>
                <span className="text-[7px] text-stone-600 leading-none">{antar.durationYearsStr}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MONTHLY PLANETARY CHANGES, GUIDANCE & DO'S AND DON'TS */}
      <div className="bg-white rounded-lg border border-amber-200/80 p-1 shadow-3xs space-y-1">
        {/* Top Header with Month Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200/80 pb-0.5">
          <h2 className="font-vedic font-bold text-stone-950 text-[10px]">
            Monthly Guidance
          </h2>

          {/* Month Selector Dropdown */}
          <div className="flex items-center space-x-0.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx === 0}
              className="p-0.5 rounded border border-stone-300 bg-white text-stone-700 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[9px] font-semibold rounded px-1 py-0.5 focus:outline-none focus:border-amber-600 focus:bg-white shadow-3xs cursor-pointer"
            >
              {ALL_MONTH_WISE_PREDICTIONS.map((m) => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx === ALL_MONTH_WISE_PREDICTIONS.length - 1}
              className="p-0.5 rounded border border-stone-300 bg-white text-stone-700 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Guidance across 4 Key Life Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {/* Career & Finances */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded p-1 space-y-0.5">
            <div className="flex items-center space-x-1 text-amber-950">
              <Briefcase className="w-2.5 h-2.5 text-amber-700" />
              <span className="font-vedic font-bold text-[10px]">Career & Wealth</span>
            </div>
            <p className="text-[9px] text-stone-800 leading-tight">
              {monthlyGuidance.guidance.careerAndFinances}
            </p>
          </div>

          {/* Relationships & Family */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded p-1 space-y-0.5">
            <div className="flex items-center space-x-1 text-rose-950">
              <Heart className="w-2.5 h-2.5 text-rose-600" />
              <span className="font-vedic font-bold text-[10px]">Relationships</span>
            </div>
            <p className="text-[9px] text-stone-800 leading-tight">
              {monthlyGuidance.guidance.relationshipsAndFamily}
            </p>
          </div>

          {/* Health & Vitality */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded p-1 space-y-0.5">
            <div className="flex items-center space-x-1 text-emerald-950">
              <Activity className="w-2.5 h-2.5 text-emerald-700" />
              <span className="font-vedic font-bold text-[10px]">Health</span>
            </div>
            <p className="text-[9px] text-stone-800 leading-tight">
              {monthlyGuidance.guidance.healthAndVitality}
            </p>
          </div>

          {/* Spiritual & Karmic Sadhana */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded p-1 space-y-0.5">
            <div className="flex items-center space-x-1 text-purple-950">
              <Sparkles className="w-2.5 h-2.5 text-purple-700" />
              <span className="font-vedic font-bold text-[10px]">Spiritual</span>
            </div>
            <p className="text-[9px] text-stone-800 leading-tight">
              {monthlyGuidance.guidance.spiritualAndKarmic}
            </p>
          </div>
        </div>

        {/* Recommended Do's & Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pt-0.5 border-t border-stone-100">
          <div className="bg-emerald-50/50 p-1 space-y-0.5">
            <div className="flex items-center space-x-1 text-emerald-900 font-bold text-[9px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Recommended Do's</span>
            </div>
            <p className="text-[9px] text-stone-800 line-clamp-2">{monthlyGuidance.dos.join(' • ')}</p>
          </div>

          <div className="bg-rose-50/50 p-1 space-y-0.5">
            <div className="flex items-center space-x-1 text-rose-900 font-bold text-[9px]">
              <XCircle className="w-3 h-3 text-rose-700" />
              <span>Precautions</span>
            </div>
            <p className="text-[9px] text-stone-800 line-clamp-2">{monthlyGuidance.donts.join(' • ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
