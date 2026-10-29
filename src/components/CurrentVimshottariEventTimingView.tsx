import React, { useMemo } from 'react';
import {
  Layers,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  Compass,
  ArrowRight,
  Briefcase,
  Home,
  Heart,
  Baby,
  Activity,
  AlertCircle,
  CheckCircle2,
  Flame,
  ShieldAlert,
  ArrowRightLeft,
  Building2,
} from 'lucide-react';
import { PlanetPosition, HouseInfo, UserProfile, GrahaName } from '../types';
import {
  calculateVimshottariDasha,
  calculateAntardashas,
  calculatePlanetaryPositions,
} from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';

interface CurrentVimshottariEventTimingViewProps {
  activeProfile?: UserProfile;
  natalPlanets?: PlanetPosition[];
  natalHouses?: HouseInfo[];
  lagnaRasi?: number;
  onNavigateToFullDasha?: () => void;
  onNavigateToMonthWise?: () => void;
}

export function CurrentVimshottariEventTimingView({
  activeProfile,
  natalPlanets = [],
  natalHouses = [],
  lagnaRasi = 1,
  onNavigateToFullDasha,
  onNavigateToMonthWise,
}: CurrentVimshottariEventTimingViewProps) {
  const birthDate = activeProfile?.birthDate || '1990-05-18';
  const birthTime = activeProfile?.birthTime || '10:30';
  const seekerName = activeProfile?.name || 'Seeker';

  // 1. Calculate Natal Moon total degree
  const natalMoon = useMemo(() => {
    return natalPlanets.find((p) => p.name === 'Chandra') || {
      name: 'Chandra',
      englishName: 'Moon',
      symbol: 'Mo',
      rasiNumber: 4,
      rasiName: 'Karka',
      degree: 12,
      minute: 30,
      house: 1,
      nakshatra: 'Pushya',
      pada: 2,
    };
  }, [natalPlanets]);

  const natalMoonTotalDeg = (natalMoon.rasiNumber - 1) * 30 + natalMoon.degree;

  // 2. Calculate Complete Vimshottari Dasha
  const vimshottari = useMemo(() => {
    return calculateVimshottariDasha(
      natalMoonTotalDeg,
      birthDate,
      natalPlanets,
      lagnaRasi
    );
  }, [natalMoonTotalDeg, birthDate, natalPlanets, lagnaRasi]);

  // Current Mahadasha info
  const currentMahadasha = useMemo(() => {
    return (
      vimshottari.cycle.find((c) => c.planet === vimshottari.currentLord) ||
      vimshottari.cycle[0]
    );
  }, [vimshottari]);

  // Calculate Antardashas for the current active Mahadasha
  const currentAntardashasList = useMemo(() => {
    return calculateAntardashas(
      currentMahadasha.planet,
      currentMahadasha.durationYears,
      currentMahadasha.startAge,
      birthDate,
      natalPlanets,
      lagnaRasi
    );
  }, [currentMahadasha, birthDate, natalPlanets, lagnaRasi]);

  // Active current Antardasha
  const currentAntardasha = useMemo(() => {
    return (
      currentAntardashasList.find((a) => a.isCurrent) ||
      currentAntardashasList[0]
    );
  }, [currentAntardashasList]);

  // Active Pratyantardasha (Sub-sub period)
  const currentPratyantardasha = useMemo(() => {
    if (!currentAntardasha?.pratyantardashas) return null;
    return (
      currentAntardasha.pratyantardashas.find((p) => p.isCurrent) ||
      currentAntardasha.pratyantardashas[0]
    );
  }, [currentAntardasha]);

  // Upcoming Antardashas within this Mahadasha
  const upcomingAntardashas = useMemo(() => {
    const currentIndex = currentAntardashasList.findIndex((a) => a.isCurrent);
    if (currentIndex === -1) return currentAntardashasList.slice(1, 4);
    return currentAntardashasList.slice(currentIndex + 1, currentIndex + 4);
  }, [currentAntardashasList]);

  // Natal placements of current Dasha Lords
  const mahaPlanetObj = natalPlanets.find((p) => p.name === currentMahadasha.planet);
  const antarPlanetObj = natalPlanets.find((p) => p.name === currentAntardasha.planet);

  const mahaHouse = mahaPlanetObj?.house || 1;
  const antarHouse = antarPlanetObj?.house || 1;
  const houseDistance = ((antarHouse - mahaHouse + 12) % 12) + 1;

  // Event Timing Forecast Matrix for Active Period
  const eventTimingMatrix = useMemo(() => {
    const mahaLord = currentMahadasha.planet;
    const antarLord = currentAntardasha.planet;

    // 1. Career: Job Change & Promotion Timing
    const isCareerFavorable = [1, 9, 10, 11].includes(mahaHouse) || [1, 9, 10, 11].includes(antarHouse);
    const isJobChangeActive = [3, 5, 9, 10].includes(antarHouse) || ['Budha', 'Rahu', 'Surya'].includes(antarLord);
    const careerWindow = isCareerFavorable
      ? `Strong professional acceleration during active ${mahaLord}–${antarLord} period (${currentAntardasha.startMonthYear} – ${currentAntardasha.endMonthYear}). High probability of promotion, executive elevation, or lucrative new appointments.`
      : `Stable operational tenure; focus on deepening expertise and building senior alliances before executing lateral job switches.`;

    // 2. Workplace Difficulties & Politics Sensitivity
    const isPoliticsRiskElevated = [6, 8, 12].includes(antarHouse) || houseDistance === 6 || houseDistance === 8;
    const difficultiesWindow = isPoliticsRiskElevated
      ? `Heightened exposure to office politics, unmerited scrutiny, or structural reorganizations under ${antarLord} sub-period. Maintain strict written documentation, avoid partisan workplace camps, and recite Aditya Hridaya.`
      : `High immunity against workplace rivalry. Institutional shielding from mentors and senior boards dissolves corporate controversies smoothly.`;

    // 3. Business Start & Commercial Launch Timing
    const isBusinessStartFavorable = [7, 3, 10, 11, 2].includes(antarHouse) || ['Budha', 'Surya', 'Guru', 'Mangal'].includes(antarLord);
    const businessStartWindow = isBusinessStartFavorable
      ? `Auspicious window for Nutan Vyapar Arambha (launching a business or proprietary trade). Commercial acumen and risk-taking capacity are cosmically supported. Optimal launch on Shukla Paksha Wednesdays/Thursdays.`
      : `Phased startup incubation recommended. Validate customer demand, build working capital runway, and avoid unhedged debt obligations.`;

    // 4. Wealth & Financial Expansion Timing
    const isWealthFavorable = [2, 5, 9, 11].includes(mahaHouse) || [2, 5, 9, 11].includes(antarHouse);
    const wealthWindow = isWealthFavorable
      ? `Auspicious Dhana & Labha activation. Liquid capital accumulation, bonus dividends, and revenue growth culminate during this sub-period.`
      : `Disciplined wealth retention phase. Emphasize systematic savings and avoid speculative intraday investments.`;

    // 5. Property & Real Estate Timing
    const isPropertyFavorable = [4, 9, 10].includes(mahaHouse) || [4, 9, 10].includes(antarHouse);
    const propertyWindow = isPropertyFavorable
      ? `High support for freehold property registration, land investment, home renovations, or acquisition of luxury conveyances (Vahana Yoga).`
      : `Moderate property activity; inspect land titles and municipal permits thoroughly before signing deeds.`;

    // 6. Love Life & Romantic Courtship
    const isLoveLifeFavorable = [1, 5, 7, 9, 11].includes(mahaHouse) || [1, 5, 7, 9, 11].includes(antarHouse);
    const loveLifeWindow = isLoveLifeFavorable
      ? `Active Prema & Vivaha window. Magnetic romantic attraction, soul-level connections, and matrimonial manifestation during this active ${antarLord} sub-period.`
      : `Emotional grounding phase; nurture mutual intellectual respect and authentic companionship over volatile expectations.`;

    // 7. Extra-Marital Temptation Caution & Marital Fidelity
    const isAffairRiskSensitive = (antarLord === 'Rahu' || antarLord === 'Shukra') && ([7, 8, 12, 5].includes(antarHouse) || houseDistance === 6 || houseDistance === 8);
    const extraMaritalCautionWindow = isAffairRiskSensitive
      ? `Sensory attraction and external romantic distractions can surge during ${mahaLord}–${antarLord} sub-period. Maintain transparent boundaries with colleagues and invoke Jupiter’s moral grace to safeguard marriage.`
      : `High fidelity and matrimonial peace anchored. Strong ethical discernment protects personal vows and family honor.`;

    // 8. Health & Vitality Advice
    const isHealthSensitive = [6, 8, 12].includes(antarHouse) || houseDistance === 6 || houseDistance === 8;
    const healthAdvice = isHealthSensitive
      ? `Sub-period activates transformative or Upachaya houses. Maintain consistent sleep hygiene, digestive moderation, and annual preventive health checkups.`
      : `Robust constitutional stamina (Prana Shakti). Physical vitality supports busy schedules effectively.`;

    return {
      careerWindow,
      difficultiesWindow,
      businessStartWindow,
      wealthWindow,
      propertyWindow,
      loveLifeWindow,
      extraMaritalCautionWindow,
      healthAdvice,
      isCareerFavorable,
      isJobChangeActive,
      isPoliticsRiskElevated,
      isBusinessStartFavorable,
      isWealthFavorable,
      isPropertyFavorable,
      isLoveLifeFavorable,
      isAffairRiskSensitive,
      isHealthSensitive,
    };
  }, [currentMahadasha, currentAntardasha, mahaHouse, antarHouse, houseDistance]);

  return (
    <div className="bg-[#FAF6EE] rounded-xl border border-amber-900/20 p-3 sm:p-4 shadow-xs space-y-3 break-words text-[11px] animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/15 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-amber-800 text-amber-50 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Vimshottari Dasha Engine</span>
            </span>
            <span className="text-amber-400 text-xs">•</span>
            <span className="text-[11px] text-stone-600 font-medium">
              Birth Chart Timing for Events ({seekerName})
            </span>
          </div>

          <h2 className="font-vedic font-black text-[15px] sm:text-[16px] text-amber-950 flex items-center space-x-2">
            <span>Active Major &amp; Sub-Periods (Mahadasha &amp; Antardasha)</span>
          </h2>
        </div>

        {onNavigateToFullDasha && (
          <button
            type="button"
            onClick={onNavigateToFullDasha}
            className="self-start sm:self-center px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold border border-amber-300 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Full 120-Year Tree</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Active Dasha Period Cards: Mahadasha + Antardasha + Pratyantardasha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Card 1: Current Mahadasha (Major Period) */}
        <div className="bg-white p-3 rounded-xl border border-amber-900/15 shadow-3xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
            <span>Major Period (Mahadasha)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
              {currentMahadasha.durationYears} Years Cycle
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-vedic font-black text-[18px] text-amber-950 leading-none block">
                {currentMahadasha.planet}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Natal House {mahaHouse} ({mahaPlanetObj?.rasiName})
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-800">
              {currentMahadasha.startMonthYear} – {currentMahadasha.endMonthYear}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9.5px] text-stone-600">
              <span>Cycle Progress</span>
              <span className="font-bold">{Math.round(currentMahadasha.progressPercent)}% Completed</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
              <div
                className="bg-amber-700 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, currentMahadasha.progressPercent))}%` }}
              />
            </div>
          </div>

          <p className="text-[10.5px] text-stone-700 leading-snug pt-1 border-t border-stone-100">
            <strong className="text-amber-950">Macro Canvas:</strong> {currentMahadasha.lifeTheme}
          </p>
        </div>

        {/* Card 2: Current Antardasha (Sub-Period) */}
        <div className="bg-amber-50/70 p-3 rounded-xl border-2 border-amber-400 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-amber-800 font-bold uppercase tracking-wider">
            <span>Active Sub-Period (Antardasha)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-600 text-white font-bold">
              NOW ACTIVE
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-vedic font-black text-[18px] text-amber-950 leading-none block">
                {currentAntardasha.planet}
              </span>
              <span className="text-[10px] text-stone-600 block mt-0.5">
                Natal House {antarHouse} ({antarPlanetObj?.rasiName}) • {houseDistance}th from Maha
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-amber-900 block">
                {currentAntardasha.startMonthYear} – {currentAntardasha.endMonthYear}
              </span>
              <span className="text-[9.5px] text-stone-500 font-medium">
                {currentAntardasha.durationYearsStr}
              </span>
            </div>
          </div>

          <p className="text-[10.5px] text-stone-800 leading-snug pt-1 border-t border-amber-200">
            <strong className="text-amber-950">Immediate Operational Focus:</strong> {currentAntardasha.theme}
          </p>

          <div className="bg-white/80 p-1.5 rounded border border-amber-300/70 text-[10px] text-amber-950">
            <span className="font-semibold">Strength Rating: </span>
            <span className="font-bold text-emerald-800">{currentAntardasha.strengthInfo.rating}</span>
            <span className="block text-stone-600 text-[9.5px]">{currentAntardasha.strengthInfo.reason}</span>
          </div>
        </div>

        {/* Card 3: Current Pratyantardasha (Sub-Sub Period) */}
        <div className="bg-white p-3 rounded-xl border border-amber-900/15 shadow-3xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
            <span>Sub-Sub Period (Pratyantardasha)</span>
            <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 font-bold">
              Weekly Tactical
            </span>
          </div>

          {currentPratyantardasha ? (
            <>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-vedic font-black text-[18px] text-sky-950 leading-none block">
                    {currentPratyantardasha.planet}
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    Micro-pulse in {currentAntardasha.planet} Antardasha
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-sky-900 block">
                    {currentPratyantardasha.startMonthYear} – {currentPratyantardasha.endMonthYear}
                  </span>
                  <span className="text-[9.5px] text-stone-500 font-medium">
                    {currentPratyantardasha.durationDays} Days
                  </span>
                </div>
              </div>

              <p className="text-[10.5px] text-stone-700 leading-snug pt-1 border-t border-stone-100">
                <strong className="text-sky-950">Weekly Execution Pulse:</strong> {currentPratyantardasha.theme}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-stone-500 italic">Calculating micro-period...</p>
          )}

          <div className="bg-sky-50/70 p-1.5 rounded border border-sky-200 text-[10px] text-sky-950">
            <span>Dasha Trio: </span>
            <strong className="text-sky-950">
              {currentMahadasha.planet} ➔ {currentAntardasha.planet} ➔ {currentPratyantardasha?.planet || currentAntardasha.planet}
            </strong>
          </div>
        </div>
      </div>

      {/* Dasha Event Timing Matrix: How Major Life Events Unfold Under Current Periods */}
      <div className="bg-white p-3 rounded-xl border border-amber-900/15 shadow-3xs space-y-2">
        <div className="flex items-center space-x-2 border-b border-stone-100 pb-1.5">
          <Calendar className="w-4 h-4 text-amber-800" />
          <h3 className="font-vedic font-bold text-[13px] text-amber-950">
            Life Event Timing Forecast Under Active Dasha Periods
          </h3>
        </div>

        <p className="text-stone-700 text-[11px] leading-relaxed">
          In Vedic astrology, the <strong className="text-amber-950">Mahadasha</strong> sets the macro environmental climate (what life allows),
          while the <strong className="text-amber-950">Antardasha</strong> acts as the timing trigger releasing concrete karmic events in career, property, wealth, and relationships.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[10.5px]">
          {/* Career: Job Change & Promotion Timing */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                <span>Job Change, Transition &amp; Promotion Timing</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isCareerFavorable ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-800'
              }`}>
                {eventTimingMatrix.isCareerFavorable ? 'High Timing Support' : 'Consolidation Phase'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.careerWindow}</p>
          </div>

          {/* Workplace Difficulties & Politics Sensitivity */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>Workplace Politics &amp; Friction Risk</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isPoliticsRiskElevated ? 'bg-rose-100 text-rose-900 border border-rose-200' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {eventTimingMatrix.isPoliticsRiskElevated ? 'Vigilance Advised' : 'Protected / Immune'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.difficultiesWindow}</p>
          </div>

          {/* Business Start & Inception Timing */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                <span>Business Start &amp; Venture Inception Timing</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isBusinessStartFavorable ? 'bg-indigo-100 text-indigo-900' : 'bg-stone-200 text-stone-800'
              }`}>
                {eventTimingMatrix.isBusinessStartFavorable ? 'Favorable Launch Window' : 'Incubation / Planning'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.businessStartWindow}</p>
          </div>

          {/* Wealth & Liquid Inflows Timing */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                <span>Wealth &amp; Liquid Inflows</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isWealthFavorable ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-800'
              }`}>
                {eventTimingMatrix.isWealthFavorable ? 'Compounding Inflow' : 'Steady Retention'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.wealthWindow}</p>
          </div>

          {/* Real Estate & Vehicle Timing */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Home className="w-3.5 h-3.5 text-blue-700" />
                <span>Property &amp; Conveyance Acquisition</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isPropertyFavorable ? 'bg-blue-100 text-blue-900' : 'bg-stone-200 text-stone-800'
              }`}>
                {eventTimingMatrix.isPropertyFavorable ? 'Favorable Window' : 'Normal'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.propertyWindow}</p>
          </div>

          {/* Love Life & Romantic Courtship */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-700" />
                <span>Love Life &amp; Romantic Courtship Harmony</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isLoveLifeFavorable ? 'bg-rose-100 text-rose-900' : 'bg-stone-200 text-stone-800'
              }`}>
                {eventTimingMatrix.isLoveLifeFavorable ? 'High Romantic Resonance' : 'Stable'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.loveLifeWindow}</p>
          </div>

          {/* Marital Fidelity & Extra-Marital Temptation Caution */}
          <div className="bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/80 space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-amber-800" />
                <span>Marital Sanctity &amp; Extra-Marital Temptation Caution</span>
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                eventTimingMatrix.isAffairRiskSensitive ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {eventTimingMatrix.isAffairRiskSensitive ? 'Sensory Caution Period' : 'Fidelity Safeguarded'}
              </span>
            </div>
            <p className="text-stone-700 leading-snug">{eventTimingMatrix.extraMaritalCautionWindow}</p>
          </div>
        </div>

        {/* Health & Caution Notice */}
        <div className="bg-amber-100/60 p-2 rounded-lg border border-amber-300 text-[10.5px] flex items-start space-x-2 text-stone-800">
          <Activity className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">Health &amp; Vitality Stewardship: </span>
            <span>{eventTimingMatrix.healthAdvice}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Antardashas Timeline Strip */}
      {upcomingAntardashas.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-amber-900/15 shadow-3xs space-y-2">
          <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
            <span className="font-vedic font-bold text-[12.5px] text-amber-950 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Upcoming Sub-Period Transitions (Next Antardashas in {currentMahadasha.planet} Cycle)</span>
            </span>
            <span className="text-[10px] text-stone-500">Chronological Evolution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            {upcomingAntardashas.map((nextAntar, i) => (
              <div
                key={nextAntar.planet}
                className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/80 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-vedic font-bold text-[13px] text-amber-950">
                    {nextAntar.planet} Antardasha
                  </span>
                  <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                    Stage {i + 1} Next
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-stone-700">
                  {nextAntar.startMonthYear} – {nextAntar.endMonthYear} ({nextAntar.durationYearsStr})
                </div>
                <p className="text-stone-600 leading-snug line-clamp-2">
                  {nextAntar.theme}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
