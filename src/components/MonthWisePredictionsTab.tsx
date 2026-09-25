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
    <div className="w-full px-0.5 sm:px-1 py-1 space-y-1.5">
      {/* Quick Switch Header */}
      <div className="bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1 shadow-3xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-black text-stone-800 uppercase tracking-widest font-vedic leading-tight">
            Monthly Predictions
          </span>
        </div>

        {onNavigateToBirthTime && (
          <button
            type="button"
            onClick={onNavigateToBirthTime}
            className="text-[10px] font-black uppercase tracking-widest text-amber-800 hover:text-amber-950 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Birth Chart</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Minimal Gochar Alignment Badges */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-1 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center space-x-3">
          <div className="text-amber-800">
            Lagna <span className="text-stone-900">{VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName}</span>
          </div>
          <div className="text-sky-800">
            Moon <span className="text-stone-900">{VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}</span>
          </div>
          {sadeSati.inSadeSati && (
            <div className="text-purple-800">
              Sade Sati <span className="text-stone-900">{sadeSati.phase}</span>
            </div>
          )}
        </div>
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
      <div className="bg-[#FAF5EC] rounded-xl border border-[#E8DEC8] px-2 py-1.5 shadow-2xs space-y-0.5">
        <div className="flex items-center space-x-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <h4 className="font-vedic font-bold text-stone-900 text-xs">
            Shani Sade Sati & Dhaiya Status ({selectedMonthKey})
          </h4>
        </div>
        <p className="text-[10px] text-stone-700 leading-snug">
          {sadeSati.description}
        </p>
      </div>

      {/* Optional Real-time AI Transit Synthesis Button & Box */}
      <div className="bg-white rounded-xl border border-stone-200 px-2 py-2 shadow-2xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Real-Time Vedic AI Transit Synthesis</span>
            </h3>
            <p className="text-[10px] text-stone-500 leading-tight">
              Generate detailed Parashari transit synthesis integrating natal Moon and current planetary transits
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRealTimeAiPrediction()}
            disabled={isLoadingAi}
            className="inline-flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-1 px-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Generate Deep Reading</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 text-[11px] text-rose-700 animate-in fade-in slide-in-from-top-1">
            {aiError}
          </div>
        )}

        {aiReading && (
          <div className="bg-[#FAF8F5] rounded-lg border border-amber-300/80 px-2.5 py-1.5 text-stone-800 text-xs leading-relaxed space-y-1">
            {aiReading.split('\n').map((para, idx) =>
              para.trim() ? <p key={idx}>{para}</p> : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
