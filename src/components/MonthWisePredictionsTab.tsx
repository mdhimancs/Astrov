import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Compass,
  Loader2,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';
import { ProfileSelector } from './ProfileSelector';
import { MonthWisePredictions } from './MonthWisePredictions';
import { YearlyPredictions } from './YearlyPredictions';
import { UnifiedPlanetaryImpactTable } from './UnifiedPlanetaryImpactTable';
import {
  calculatePlanetaryPositions,
  checkSadeSati,
  calculateDetailedPlanetaryMovements,
  generateMonthWiseTransitPredictions,
  calculateYearlyPredictions,
  generateCategorizedDosAndDonts,
  calculateUnifiedPlanetaryTable,
} from '../vedicMath';
import {
  PlanetPosition,
  UserProfile,
  MonthWiseTransitPrediction,
  YearlyPrediction,
  PlanetaryMovementDetail,
  TransitDosAndDonts,
  PlanetaryImpactRecord,
} from '../types';
import { POPULAR_CITIES, VEDIC_RASIS } from '../data';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';
import {
  getSavedProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/profileStorage';

interface MonthWisePredictionsTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
  onNavigateToBirthTime?: () => void;
}

export function MonthWisePredictionsTab({
  activeProfileId,
  profiles,
  onNavigateToBirthTime
}: MonthWisePredictionsTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Seeker details state
  const [name, setName] = useState(currentProfile?.name || 'Munish Sharma');
  const [birthDate, setBirthDate] = useState(currentProfile?.birthDate || '1990-05-18');
  const [birthTime, setBirthTime] = useState(currentProfile?.birthTime || '07:30');
  const [selectedCity, setSelectedCity] = useState<PlaceValue>(() => {
    if (currentProfile?.place) {
      return {
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.2090,
        tz: currentProfile.timezone ?? 5.5,
      };
    }
    return {
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.2090,
      tz: 5.5,
    };
  });

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

  // Selected Month Key for Month-wise Predictions dropdown & Selected Year for Yearly Predictions
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-09');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [readingScope, setReadingScope] = useState<
    'monthly' | 'yearly' | 'impacts' | 'all'
  >('monthly');

  // Astrological State
  const [natalLagnaRasi, setNatalLagnaRasi] = useState<number>(5);
  const [natalMoonRasi, setNatalMoonRasi] = useState<number>(5);
  const [natalNakshatra, setNatalNakshatra] = useState<string>('Magha');
  const [natalPlanets, setNatalPlanets] = useState<PlanetPosition[]>([]);

  const [transitPlanets, setTransitPlanets] = useState<PlanetPosition[]>([]);
  const [detailedMovements, setDetailedMovements] = useState<PlanetaryMovementDetail[]>([]);
  const [monthlyPredictions, setMonthlyPredictions] = useState<MonthWiseTransitPrediction[]>(() => 
    generateMonthWiseTransitPredictions(5, 5, false)
  );
  const [yearlyPredictions, setYearlyPredictions] = useState<YearlyPrediction[]>(() =>
    calculateYearlyPredictions(5, 5, '1990-05-18', false, [])
  );
  const [dosAndDonts, setDosAndDonts] = useState<TransitDosAndDonts[]>([]);
  const [unifiedImpactRecords, setUnifiedImpactRecords] = useState<PlanetaryImpactRecord[]>(() => 
    calculateUnifiedPlanetaryTable(5, 5, [])
  );

  const [sadeSati, setSadeSati] = useState<{
    inSadeSati: boolean;
    phase: string;
    description: string;
  }>({
    inSadeSati: false,
    phase: 'None',
    description: 'Saturn transit is supportive.',
  });

  // Compute Transits & Month-wise Predictions
  const computeTransitsAndMonthly = useCallback((
    targetDate: string = birthDate,
    targetTime: string = birthTime,
    targetCity = selectedCity,
    targetMonth: string = selectedMonthKey
  ) => {
    if (!targetDate || !targetTime) return;

    const [year, month, day] = targetDate.split('-').map(Number);
    const [hour, minute] = targetTime.split(':').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return;
    const birthDateTime = new Date(year, month - 1, day, hour, minute);

    const natalCalc = calculatePlanetaryPositions(
      birthDateTime,
      targetCity.lat,
      targetCity.lng
    );

    // Calculate transit for the 15th of the selected month so planetary positions & houses reflect the chosen month
    const [tYear, tMonth] = (targetMonth || '2026-09').split('-').map(Number);
    const transitDate = new Date(tYear, tMonth - 1, 15, 12, 0, 0);

    const transitCalc = calculatePlanetaryPositions(
      transitDate,
      targetCity.lat,
      targetCity.lng
    );

    const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
    const transitSaturn = transitCalc.planets.find((p) => p.name === 'Shani') || transitCalc.planets[7];

    const sadeSatiResult = checkSadeSati(natalMoon.rasiNumber, transitSaturn.rasiNumber);
    const detailedMovs = calculateDetailedPlanetaryMovements(natalCalc.lagnaRasi, natalMoon.rasiNumber, transitCalc.planets);
    const mPredictions = generateMonthWiseTransitPredictions(natalMoon.rasiNumber, natalCalc.lagnaRasi, sadeSatiResult.inSadeSati);
    const yPredictions = calculateYearlyPredictions(
      natalCalc.lagnaRasi,
      natalMoon.rasiNumber,
      targetDate,
      sadeSatiResult.inSadeSati,
      natalCalc.planets
    );
    const dAndDonts = generateCategorizedDosAndDonts(transitCalc.planets, sadeSatiResult.inSadeSati);
    const uRecords = calculateUnifiedPlanetaryTable(natalCalc.lagnaRasi, natalMoon.rasiNumber, transitCalc.planets, targetMonth);

    setNatalLagnaRasi(natalCalc.lagnaRasi);
    setNatalMoonRasi(natalMoon.rasiNumber);
    setNatalNakshatra(natalMoon.nakshatra);
    setNatalPlanets(natalCalc.planets);

    setTransitPlanets(transitCalc.planets);
    setDetailedMovements(detailedMovs);
    setMonthlyPredictions(mPredictions);
    setYearlyPredictions(yPredictions);
    setDosAndDonts(dAndDonts);
    setUnifiedImpactRecords(uRecords);
    setSadeSati(sadeSatiResult);
  }, [birthDate, birthTime, selectedCity, selectedMonthKey]);

  useEffect(() => {
    computeTransitsAndMonthly();
  }, [computeTransitsAndMonthly]);

  const handleMonthChange = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
    const yr = parseInt(monthKey.split('-')[0] || '2026', 10);
    if (!isNaN(yr)) {
      setSelectedYear(yr);
    }
    computeTransitsAndMonthly(birthDate, birthTime, selectedCity, monthKey);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const matchingMonth = monthlyPredictions.find((m) => m.monthKey.startsWith(String(year)));
    if (matchingMonth) {
      setSelectedMonthKey(matchingMonth.monthKey);
      computeTransitsAndMonthly(birthDate, birthTime, selectedCity, matchingMonth.monthKey);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Quick Switch Header with Lagna & Moon on Same Bar */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-3xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
              Monthly &amp; Yearly Readings
            </span>
          </div>

          <div className="h-3.5 w-px bg-amber-300/80 hidden sm:block" />

          {/* Lagna & Moon Sign Badges on the Same Header Bar */}
          <div className="flex items-center space-x-3 text-[13px] font-bold uppercase tracking-wider">
            <div className="text-amber-800">
              Lagna <span className="text-stone-950 font-black">{VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName}</span>
            </div>
            <div className="text-sky-800">
              Moon <span className="text-stone-950 font-black">{VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onNavigateToBirthTime && (
            <button
              type="button"
              onClick={onNavigateToBirthTime}
              className="text-[13px] font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>Birth Charts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* MONTHLY & YEARLY READINGS — COMPACT 1-ROW DECK OF CARDS SELECTOR (10% smaller) */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/90 px-2 py-1 shadow-3xs">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1">
          {[
            {
              id: 'monthly',
              title: 'Monthly Reading',
              icon: Calendar,
            },
            {
              id: 'yearly',
              title: 'Yearly & Life-Path Forecast',
              icon: Clock,
            },
            {
              id: 'impacts',
              title: 'Planetary Impacts',
              icon: Compass,
            },
            {
              id: 'all',
              title: 'All Readings View',
              icon: User,
            },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = readingScope === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setReadingScope(card.id as any)}
                className={`group relative rounded-md px-2 py-1 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1 ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5] shadow-3xs'
                }`}
              >
                <span
                  className={`font-vedic font-bold text-[11px] leading-none truncate ${
                    isActive ? 'text-amber-950' : 'text-stone-900'
                  }`}
                >
                  {card.title}
                </span>
                <Icon
                  className={`w-3 h-3 shrink-0 ${
                    isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD 1: MONTH-WISE PREDICTIONS COMPONENT */}
      {(readingScope === 'monthly' || readingScope === 'all') && (
        <MonthWisePredictions
          monthlyPredictions={monthlyPredictions}
          userName={name}
          selectedMonthKey={selectedMonthKey}
          onSelectMonthKey={handleMonthChange}
        />
      )}

      {/* CARD 2: YEARLY PREDICTIONS & COMPREHENSIVE LIFE-PATH FORECAST MODULE */}
      {(readingScope === 'yearly' || readingScope === 'all') && (
        <YearlyPredictions
          yearlyPredictions={yearlyPredictions}
          selectedYear={selectedYear}
          onSelectYear={handleYearChange}
          userName={name}
          birthDate={birthDate}
          birthTime={birthTime}
          birthPlace={selectedCity.name}
          natalLagnaRasi={natalLagnaRasi}
          natalMoonRasi={natalMoonRasi}
          natalNakshatra={natalNakshatra}
          natalPlanets={natalPlanets}
        />
      )}

      {/* CARD 3: THE SINGLE UNIFIED MASTER TABLE: PLANETARY CHANGES & IMPACTS */}
      {(readingScope === 'impacts' || readingScope === 'all') && (
        <UnifiedPlanetaryImpactTable
          records={unifiedImpactRecords}
          title="Important Changes"
          subtitle="Specific effects of key planetary transits across health, career, and life pillars"
        />
      )}
    </div>
  );
}
