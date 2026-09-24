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
import { UnifiedPlanetaryImpactTable } from './UnifiedPlanetaryImpactTable';
import {
  calculatePlanetaryPositions,
  checkSadeSati,
  calculateDetailedPlanetaryMovements,
  generateMonthWiseTransitPredictions,
  generateCategorizedDosAndDonts,
  calculateUnifiedPlanetaryTable,
} from '../vedicMath';
import {
  PlanetPosition,
  UserProfile,
  MonthWiseTransitPrediction,
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

  // Selected Month Key for Month-wise Predictions dropdown
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-09');

  // AI Prediction state
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Astrological State
  const [natalLagnaRasi, setNatalLagnaRasi] = useState<number>(5);
  const [natalMoonRasi, setNatalMoonRasi] = useState<number>(5);
  const [natalNakshatra, setNatalNakshatra] = useState<string>('Magha');

  const [transitPlanets, setTransitPlanets] = useState<PlanetPosition[]>([]);
  const [detailedMovements, setDetailedMovements] = useState<PlanetaryMovementDetail[]>([]);
  const [monthlyPredictions, setMonthlyPredictions] = useState<MonthWiseTransitPrediction[]>([]);
  const [dosAndDonts, setDosAndDonts] = useState<TransitDosAndDonts[]>([]);
  const [unifiedImpactRecords, setUnifiedImpactRecords] = useState<PlanetaryImpactRecord[]>([]);

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
    targetMonth = selectedMonthKey
  ) => {
    const [year, month, day] = targetDate.split('-').map(Number);
    const [hour, minute] = targetTime.split(':').map(Number);
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
    const dAndDonts = generateCategorizedDosAndDonts(transitCalc.planets, sadeSatiResult.inSadeSati);
    const uRecords = calculateUnifiedPlanetaryTable(natalCalc.lagnaRasi, natalMoon.rasiNumber, transitCalc.planets, targetMonth);

    setNatalLagnaRasi(natalCalc.lagnaRasi);
    setNatalMoonRasi(natalMoon.rasiNumber);
    setNatalNakshatra(natalMoon.nakshatra);

    setTransitPlanets(transitCalc.planets);
    setDetailedMovements(detailedMovs);
    setMonthlyPredictions(mPredictions);
    setDosAndDonts(dAndDonts);
    setUnifiedImpactRecords(uRecords);
    setSadeSati(sadeSatiResult);
  }, [birthDate, birthTime, selectedCity, selectedMonthKey]);

  useEffect(() => {
    computeTransitsAndMonthly();
  }, [computeTransitsAndMonthly]);

  const handleMonthChange = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
    computeTransitsAndMonthly(birthDate, birthTime, selectedCity, monthKey);
  };

  // AI Transit Prediction
  const fetchRealTimeAiPrediction = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const natalLagnaName = VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName || 'Mesha';
      const natalMoonName = VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName || 'Mesha';

      const transitSummary = transitPlanets.map((p) => ({
        planet: p.name,
        transitingRasi: p.rasiName,
        transitingHouse: p.house,
        degree: `${p.degree}°${p.minute}'`,
        isRetrograde: p.isRetrograde,
      }));

      const res = await fetch('/api/astrology/vedic-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate,
          birthTime,
          birthPlace: selectedCity.name,
          lagnaRasi: natalLagnaName,
          moonRasi: natalMoonName,
          nakshatra: natalNakshatra,
          sadeSatiStatus: sadeSati,
          transitSummary,
          selectedMonth: selectedMonthKey,
          mode: 'monthly-transit',
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reading');
      }
      
      setAiReading(data.reading || 'Month-wise Vedic transit reading synthesized.');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        setAiError('The cosmic channels are currently busy (High API Demand). Please try again in a few moments.');
      } else {
        setAiError('The stars are temporarily obscured. Please check your connection and try again.');
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="max-w-5xl sm:max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Quick Switch Header between Month-Wise Predictions & Birth Time Predictions */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block font-vedic">
              Month-Wise Predictions & Planetary Movements
            </span>
            <span className="text-[10px] text-stone-500">
              Interactive month dropdown menu, monthly forecast pillars, and single unified planetary impact table
            </span>
          </div>
        </div>

        {onNavigateToBirthTime && (
          <button
            type="button"
            onClick={onNavigateToBirthTime}
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-amber-300 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <span>View Birth Time Predictions</span>
            <ArrowRight className="w-3 h-3 text-amber-700" />
          </button>
        )}
      </div>

      {/* Minimal Gochar Alignment Badges (No Repetition of Birth Details) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
            Lagna: <strong className="text-amber-900">{VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
            Moon: <strong className="text-sky-900">{VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}</strong>
          </span>
          {sadeSati.inSadeSati && (
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 font-medium">
              Sade Sati: {sadeSati.phase}
            </span>
          )}
        </div>

        <span className="text-[10px] text-stone-500 italic hidden sm:inline">
          Sidereal Gochar Transits against Natal Lagna & Moon
        </span>
      </div>

      {/* MONTH-WISE PREDICTIONS COMPONENT (WITH DROPDOWN MENU AT TOP) */}
      <MonthWisePredictions
        monthlyPredictions={monthlyPredictions}
        userName={name}
        selectedMonthKey={selectedMonthKey}
        onSelectMonthKey={handleMonthChange}
      />

      {/* THE SINGLE UNIFIED MASTER TABLE: PLANETARY CHANGES & IMPACTS */}
      <UnifiedPlanetaryImpactTable
        records={unifiedImpactRecords}
        title="Most Important Planetary Changes & Specific Effects"
        subtitle={`Effects of key planetary transits on Health, Job, Business, Relations, and Marriage for ${name}`}
      />

      {/* Shani Sade Sati Status */}
      <div className="bg-[#FAF5EC] rounded-xl border border-[#E8DEC8] p-3 shadow-2xs space-y-1">
        <div className="flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <h4 className="font-vedic font-bold text-stone-900 text-xs">
            Shani Sade Sati & Dhaiya Status ({selectedMonthKey})
          </h4>
        </div>
        <p className="text-[11px] text-stone-700 leading-relaxed">
          {sadeSati.description}
        </p>
      </div>

      {/* Optional Real-time AI Transit Synthesis Button & Box */}
      <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Real-Time Vedic AI Transit Synthesis</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Generate detailed Parashari transit synthesis integrating natal Moon and current planetary transits
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRealTimeAiPrediction()}
            disabled={isLoadingAi}
            className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Deep Reading</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-[11px] text-rose-700 animate-in fade-in slide-in-from-top-1">
            {aiError}
          </div>
        )}

        {aiReading && (
          <div className="bg-[#FAF8F5] rounded-lg border border-amber-300/80 p-3 text-stone-800 text-xs leading-relaxed space-y-2">
            {aiReading.split('\n').map((para, idx) =>
              para.trim() ? <p key={idx}>{para}</p> : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
