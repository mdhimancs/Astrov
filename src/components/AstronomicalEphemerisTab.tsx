import React, { useState, useMemo } from 'react';
import {
  Globe,
  Orbit,
  Calendar,
  Clock,
  Sparkles,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Zap,
  ShieldCheck,
  Flame,
  Award,
  BookOpen,
  Search,
  RotateCcw,
  Activity,
  Star,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { UserProfile, PlanetPosition, GrahaName } from '../types';
import { calculatePlanetaryPositions, AyanamshaSystem } from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';
import { CelestialSkyMapWheel } from './CelestialSkyMapWheel';
import { LunarPhaseWidget } from './LunarPhaseWidget';
import {
  generateMonthlyEphemerisGrid,
  generateYearlyAstronomicalMilestones,
  getFixedStarForNakshatra,
  NAKSHATRA_ASTRONOMICAL_DATA,
  DailyEphemerisRow,
  MajorAstronomicalIngress,
} from '../utils/ephemerisHelper';
import { getPlanetDirectionInfo, getRasiDirection } from '../utils/planetDirection';

export interface RetrogradeGuidanceItem {
  title: string;
  sanskritName: string;
  significance: string;
  advice: string;
  chestaBala: string;
}

export const RETROGRADE_GUIDANCE: Record<string, RetrogradeGuidanceItem> = {
  Shani: {
    title: 'Saturn Retrograde (Shani Vakri)',
    sanskritName: 'शनि वक्री',
    significance: 'Heightened karmic accountability and structural re-evaluation. Saturn brings unfinished duties to the forefront.',
    advice: 'Practice patience. Reorganize long-term disciplines, fulfill lingering duties, and avoid cutting corners in commitments.',
    chestaBala: 'Maximum Chesta Bala (Motional Strength) — deep karmic scrutiny.',
  },
  Guru: {
    title: 'Jupiter Retrograde (Guru Vakri)',
    sanskritName: 'गुरु वक्री',
    significance: 'Internalized wisdom and moral discernment. Spiritual expansion shifts from external rituals to philosophical introspection.',
    advice: 'Revisit higher principles, educational pursuits, and financial strategies. Trust intuitive philosophical understanding.',
    chestaBala: 'Elevated Chesta Bala — profound spiritual and ethical contemplation.',
  },
  Mangal: {
    title: 'Mars Retrograde (Mangal Vakri)',
    sanskritName: 'मंगल वक्री',
    significance: 'Intense internal energy drive. Physical assertiveness turns inwards, requiring conscious emotional calibration.',
    advice: 'Channel ambition constructively through discipline and structured efforts. Avoid rash confrontations or hasty physical ventures.',
    chestaBala: 'Elevated Chesta Bala — intense, concentrated psychic and physical energy.',
  },
  Budha: {
    title: 'Mercury Retrograde (Budha Vakri)',
    sanskritName: 'बुध वक्री',
    significance: 'Reflective cognitive processing. Mental speed turns inward, favoring research, editing, and reassessment.',
    advice: 'Double-check communications, travel arrangements, and contracts. Ideal for revising past works and reconnecting with contacts.',
    chestaBala: 'High Chesta Bala — intuitive perception and non-linear logic.',
  },
  Shukra: {
    title: 'Venus Retrograde (Shukra Vakri)',
    sanskritName: 'शुक्र वक्री',
    significance: 'Re-examination of relationship dynamics, aesthetic tastes, and value systems. Past associations often re-emerge.',
    advice: 'Reassess heart-centered boundaries and self-worth. Postpone non-essential lavish expenditures or impulsive relationship ultimatums.',
    chestaBala: 'Elevated Chesta Bala — deep re-evaluation of love, art, and values.',
  },
  Rahu: {
    title: 'Rahu (North Node - Permanent Reverse Motion)',
    sanskritName: 'राहु वक्री',
    significance: 'Continuous reverse motion (Pratikula). Directs evolutionary hunger and unconventional pathways in its transit house.',
    advice: 'Maintain mental clarity against illusions. Discern authentic personal destiny from superficial obsessions.',
    chestaBala: 'Permanent reverse orbit — intensifies worldly desire and innovation.',
  },
  Ketu: {
    title: 'Ketu (South Node - Permanent Reverse Motion)',
    sanskritName: 'केतु वक्री',
    significance: 'Continuous reverse motion (Pratikula). Prompts spiritual detachment and release of past-life karmic burdens.',
    advice: 'Cultivate non-attachment, deep meditation, and surrender rigid expectations in transited domains.',
    chestaBala: 'Permanent reverse orbit — facilitates inner liberation and spiritual insight.',
  },
};

interface AstronomicalEphemerisTabProps {
  activeProfile?: UserProfile;
  profiles?: UserProfile[];
  onProfileChange?: (id: string) => void;
}

export type EphemerisViewMode = 'current' | 'monthly' | 'yearly' | 'multidecade';

export function AstronomicalEphemerisTab({
  activeProfile,
  profiles = [],
  onProfileChange,
}: AstronomicalEphemerisTabProps) {
  const today = new Date();
  
  // Location State
  const [selectedCity, setSelectedCity] = useState<PlaceValue>({
    name: activeProfile?.place || 'New Delhi, India',
    lat: activeProfile?.latitude || 28.6139,
    lng: activeProfile?.longitude || 77.209,
    tz: activeProfile?.timezone || 5.5,
  });

  // Controls
  const [viewMode, setViewMode] = useState<EphemerisViewMode>('current');
  const [ayanamshaSystem, setAyanamshaSystem] = useState<AyanamshaSystem>('Lahiri');
  
  // Monthly State
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()); // 0 - 11
  const [planetFilter, setPlanetFilter] = useState<GrahaName | 'All'>('All');

  // Multi-Decade Custom Date Picker State
  const [customDateStr, setCustomDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Natal Chart Coordinates
  const seekerName = activeProfile?.name || 'Seeker';
  const birthDate = activeProfile?.birthDate || '1990-05-18';
  const birthTime = activeProfile?.birthTime || '07:30';

  const natalCalc = useMemo(() => {
    const d = new Date(`${birthDate}T${birthTime}:00`);
    return calculatePlanetaryPositions(
      d,
      activeProfile?.latitude || 28.6139,
      activeProfile?.longitude || 77.209,
      ayanamshaSystem
    );
  }, [birthDate, birthTime, activeProfile, ayanamshaSystem]);

  // Current Live Ephemeris
  const liveCalc = useMemo(() => {
    return calculatePlanetaryPositions(
      today,
      selectedCity.lat,
      selectedCity.lng,
      ayanamshaSystem
    );
  }, [selectedCity, ayanamshaSystem]);

  // Retrograde Banner Expansion State
  const [isRetrogradeBannerExpanded, setIsRetrogradeBannerExpanded] = useState<boolean>(true);

  // Retrograde calculations based on current date
  const retrogradePlanets = useMemo(() => {
    return liveCalc.planets.filter((p) => p.isRetrograde && p.name !== 'Lagna');
  }, [liveCalc.planets]);

  const majorRetrogradePlanets = useMemo(() => {
    return retrogradePlanets.filter((p) => p.name !== 'Rahu' && p.name !== 'Ketu');
  }, [retrogradePlanets]);

  const nodalRetrogradePlanets = useMemo(() => {
    return retrogradePlanets.filter((p) => p.name === 'Rahu' || p.name === 'Ketu');
  }, [retrogradePlanets]);

  // Monthly Grid Calculation
  const monthlyEphemerisData = useMemo(() => {
    return generateMonthlyEphemerisGrid(
      selectedYear,
      selectedMonth,
      selectedCity.lat,
      selectedCity.lng,
      ayanamshaSystem,
      natalCalc.lagnaRasi
    );
  }, [selectedYear, selectedMonth, selectedCity, ayanamshaSystem, natalCalc.lagnaRasi]);

  // Yearly Astronomical Milestones
  const yearlyMilestones = useMemo(() => {
    return generateYearlyAstronomicalMilestones(
      selectedYear,
      selectedCity.lat,
      selectedCity.lng,
      natalCalc.lagnaRasi
    );
  }, [selectedYear, selectedCity, natalCalc.lagnaRasi]);

  // Custom Scrubber Ephemeris Date Calculation
  const customScrubberCalc = useMemo(() => {
    const targetDate = new Date(`${customDateStr}T12:00:00`);
    if (isNaN(targetDate.getTime())) return null;
    return {
      date: targetDate,
      calc: calculatePlanetaryPositions(
        targetDate,
        selectedCity.lat,
        selectedCity.lng,
        ayanamshaSystem
      ),
    };
  }, [customDateStr, selectedCity, ayanamshaSystem]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const grahaOptions: { id: GrahaName | 'All'; label: string }[] = [
    { id: 'All', label: 'All 9 Grahas' },
    { id: 'Surya', label: 'Surya (Sun)' },
    { id: 'Chandra', label: 'Chandra (Moon)' },
    { id: 'Mangal', label: 'Mangal (Mars)' },
    { id: 'Budha', label: 'Budha (Mercury)' },
    { id: 'Guru', label: 'Guru (Jupiter)' },
    { id: 'Shukra', label: 'Shukra (Venus)' },
    { id: 'Shani', label: 'Shani (Saturn)' },
    { id: 'Rahu', label: 'Rahu (North Node)' },
    { id: 'Ketu', label: 'Ketu (South Node)' },
  ];

  return (
    <div className="w-full space-y-2.5 pb-8">
      {/* TOP HEADER: ASTRONOMICAL EPHEMERIS OBSERVATORY */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-950 rounded-lg p-3 text-amber-50 shadow-xs border border-amber-800/40 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-800/50 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-700 text-stone-950 flex items-center justify-center font-bold text-[15px] shadow-2xs">
              <Globe className="w-4 h-4 text-stone-950" />
            </div>
            <div>
              <h1 className="font-vedic font-black text-amber-100 text-[16px] sm:text-[18px] leading-tight tracking-wide uppercase">
                Astronomical Ephemeris &amp; Nakshatra Transit Observatory
              </h1>
              <p className="text-[12px] text-amber-200/80">
                Precision sidereal coordinates, fixed star nakshatras, daily/monthly/yearly past &amp; future transits
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Ayanamsha Picker */}
            <div className="flex items-center space-x-1 bg-black/40 border border-amber-600/40 rounded px-2 py-1 text-[11px] text-amber-200">
              <span className="font-bold text-amber-400">Ayanamsha:</span>
              <select
                value={ayanamshaSystem}
                onChange={(e) => setAyanamshaSystem(e.target.value as AyanamshaSystem)}
                className="font-bold text-white bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Lahiri" className="bg-stone-900 text-white">NC Lahiri (Chitra Paksha)</option>
                <option value="KP" className="bg-stone-900 text-white">KP (Krishnamurti)</option>
                <option value="Raman" className="bg-stone-900 text-white">BV Raman</option>
                <option value="TrueChitra" className="bg-stone-900 text-white">True Chitra</option>
              </select>
            </div>

            {/* Active Seeker Badge */}
            <div className="text-[11px] bg-amber-900/60 border border-amber-600/50 rounded px-2.5 py-1 text-amber-100 font-bold">
              Natal Anchor: <span className="text-white">{seekerName}</span>
            </div>
          </div>
        </div>

        {/* VIEW MODE SWITCHER TABS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin">
            {[
              { id: 'current', label: 'Current Sky & Nakshatra Radar', icon: Zap },
              { id: 'monthly', label: 'Monthly Ephemeris Grid', icon: Calendar },
              { id: 'yearly', label: 'Yearly Ingresses & Eclipses', icon: Award },
              { id: 'multidecade', label: 'Multi-Decade Timeline (Past & Future)', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id as any)}
                  className={`px-2.5 py-1 rounded text-[11.5px] font-bold font-vedic transition-all cursor-pointer border flex items-center space-x-1.5 shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-2xs'
                      : 'bg-stone-900/80 text-amber-200 border-amber-900/80 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Location Search Bar */}
          <div className="w-full sm:w-64">
            <PlaceOfBirthInput
              id="ephemeris-city-search"
              value={selectedCity.name}
              latitude={selectedCity.lat}
              longitude={selectedCity.lng}
              timezone={selectedCity.tz}
              onChange={(newCity) => setSelectedCity(newCity)}
              label=""
              placeholder="Observation Point..."
              compact
            />
          </div>
        </div>
      </div>

      {/* PLANETARY RETROGRADE MOTION ALERT BANNER */}
      <div className="bg-gradient-to-r from-amber-50/95 via-rose-50/70 to-orange-50/90 border border-amber-300/80 rounded-lg p-3 text-stone-900 shadow-3xs space-y-2.5">
        {/* Banner Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${
              majorRetrogradePlanets.length > 0
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}>
              <RotateCcw className={`w-4 h-4 ${majorRetrogradePlanets.length > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h2 className="font-vedic font-black text-stone-950 text-[14.5px] sm:text-[15.5px] flex items-center gap-1.5 leading-tight">
                <span>Planetary Retrograde Alert</span>
                <span className="text-amber-800 text-[12.5px] font-normal font-sans">(वक्र गति • Vakri Motion)</span>
              </h2>
              <p className="text-[11.5px] text-stone-600">
                Astronomical motion analysis for {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {selectedCity.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {majorRetrogradePlanets.length > 0 ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-3xs">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>{majorRetrogradePlanets.length} Major Graha{majorRetrogradePlanets.length > 1 ? 's' : ''} Retrograde</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-3xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>All Major Grahas Direct (मार्गी)</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsRetrogradeBannerExpanded(!isRetrogradeBannerExpanded)}
              className="px-2.5 py-1 rounded bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 border border-amber-200/90 text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-3xs"
            >
              <span>{isRetrogradeBannerExpanded ? 'Hide Details' : 'View Astrological Impact'}</span>
              {isRetrogradeBannerExpanded ? <ChevronUp className="w-3.5 h-3.5 text-stone-600" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-600" />}
            </button>
          </div>
        </div>

        {/* Quick Retrograde Pills Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            Active Retrograde:
          </span>
          {retrogradePlanets.map((p) => {
            const isNode = p.name === 'Rahu' || p.name === 'Ketu';
            return (
              <span
                key={`banner-pill-${p.name}`}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                  isNode
                    ? 'bg-amber-100/70 text-amber-950 border-amber-300/80'
                    : 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-3xs font-black'
                }`}
              >
                <RotateCcw className={`w-2.5 h-2.5 ${isNode ? 'text-amber-700' : 'text-rose-700'}`} />
                <span>{p.symbol} {p.name}</span>
                <span className="text-[10px] opacity-80">({p.rasiName} {p.degree}°)</span>
                {!isNode && (
                  <span className="bg-rose-600 text-white text-[9px] px-1 rounded uppercase font-bold tracking-tight">
                    Vakri
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Expanded Detailed Cards & Vedic Astrological Impact */}
        {isRetrogradeBannerExpanded && (
          <div className="space-y-2 pt-1 border-t border-amber-200/60">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {retrogradePlanets.map((p) => {
                const isNode = p.name === 'Rahu' || p.name === 'Ketu';
                const guidance = RETROGRADE_GUIDANCE[p.name];
                const dirInfo = getPlanetDirectionInfo(p.name);
                const houseFromNatal = natalCalc.lagnaRasi
                  ? ((p.rasiNumber - natalCalc.lagnaRasi + 12) % 12) + 1
                  : p.house;

                return (
                  <div
                    key={`retrograde-card-${p.name}`}
                    className={`rounded-lg p-2.5 space-y-1.5 border transition-all ${
                      isNode
                        ? 'bg-amber-50/80 border-amber-200/80'
                        : 'bg-white/95 border-rose-200 shadow-3xs hover:border-rose-400'
                    }`}
                  >
                    {/* Planet Card Header */}
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[13px] text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          {p.symbol}
                        </span>
                        <div>
                          <h4 className="font-vedic font-bold text-stone-950 text-[13.5px] leading-tight">
                            {p.name} ({p.englishName})
                          </h4>
                          <span className="text-[10px] text-stone-500 font-sans">
                            {guidance?.sanskritName || 'वक्री'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border flex items-center space-x-0.5 ${
                          isNode
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>{isNode ? 'Pratikula' : 'Vakri (R)'}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                          H{houseFromNatal}
                        </span>
                      </div>
                    </div>

                    {/* Celestial Coordinates */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] bg-stone-50/80 p-1.5 rounded border border-stone-200/60">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Zodiac Sign</span>
                        <span className="font-bold text-stone-900">
                          {p.rasiName} ({VEDIC_RASIS[p.rasiNumber - 1]?.westernEquivalent})
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Position</span>
                        <span className="font-mono font-bold text-amber-950">
                          {p.degree}° {p.minute}&apos;
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Nakshatra</span>
                        <span className="font-semibold text-stone-900">
                          {p.nakshatra} (P{p.pada})
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Compass Dir</span>
                        <span className="font-semibold text-stone-800">
                          {dirInfo.compassDirection}
                        </span>
                      </div>
                    </div>

                    {/* Astrological Impact & Advice */}
                    {guidance && (
                      <div className="text-[11px] bg-amber-50/60 rounded p-1.5 border border-amber-200/50 space-y-1">
                        <p className="text-stone-800 leading-snug">
                          <strong className="text-rose-950 font-bold">Astrological Impact:</strong> {guidance.significance}
                        </p>
                        <p className="text-stone-700 text-[10.5px] italic leading-snug border-t border-amber-200/40 pt-1">
                          <strong className="text-amber-900 not-italic font-semibold">Recommended Action:</strong> {guidance.advice}
                        </p>
                        <div className="text-[10px] text-amber-900/90 font-mono pt-0.5">
                          ⚡ {guidance.chestaBala}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vedic Astronomy Educational Callout */}
            <div className="bg-white/85 rounded-lg p-2.5 border border-amber-200/80 flex items-start space-x-2 text-[11.5px] text-stone-700">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-stone-900 font-bold">Vedic Astronomy Principle (Chesta Bala):</strong> When a planet enters apparent retrograde motion (<em>Vakri Gati</em>), it is closest to Earth (Perigee), imparting elevated <em>Chesta Bala</em> (motional strength). Vedic shastras teach that retrograde grahas manifest with heightened internal intensity, prompting deep re-evaluation, karmic completion, and conscious review rather than external haste.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODE 1: CURRENT LIVE SKY & NAKSHATRA RADAR (TODAY / REAL-TIME) */}
      {viewMode === 'current' && (
        <div className="space-y-3">
          {/* 360° Graphical Celestial Wheel & Sky Map */}
          <CelestialSkyMapWheel
            livePlanets={liveCalc.planets}
            natalPlanets={natalCalc.planets}
            lagnaRasi={natalCalc.lagnaRasi}
            seekerName={seekerName}
            locationName={selectedCity.name}
          />

          {/* Real-Time Lunar Phase & Vedic Astrological Significance Widget */}
          <LunarPhaseWidget
            currentPlanets={liveCalc.planets}
            natalPlanets={natalCalc.planets}
            natalLagnaRasi={natalCalc.lagnaRasi}
            currentDate={today}
            locationName={selectedCity.name}
          />

          <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-200/80 pb-1.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <div>
                  <h3 className="font-vedic font-black text-stone-950 text-[15px]">
                    Today’s Astronomical Placements &amp; Nakshatra Fixed Stars
                  </h3>
                  <p className="text-[11px] text-stone-600">
                    Real-time sidereal coordinates for {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedCity.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                {/* Retrograde Status Indicator Pill */}
                {majorRetrogradePlanets.length > 0 ? (
                  <span className="flex items-center space-x-1 text-rose-900 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded shadow-3xs">
                    <RotateCcw className="w-3 h-3 text-rose-600 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>{majorRetrogradePlanets.length} Retrograde (Vakri)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded shadow-3xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>All Direct (Margi)</span>
                  </span>
                )}

                <div className="flex items-center space-x-1.5 text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  <span>Lahiri Ayanamsha:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {((liveCalc.planets[0]?.totalDeg || 0) > 0 ? '24.25°' : '24.25°')}
                  </span>
                </div>
              </div>
            </div>

            {/* 9 GRAHAS + LAGNA REAL-TIME CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {liveCalc.planets.map((p) => {
                const fixedStar = getFixedStarForNakshatra(p.nakshatra);
                const isLagna = p.name === 'Lagna';
                const houseFromNatal = natalCalc.lagnaRasi
                  ? ((p.rasiNumber - natalCalc.lagnaRasi + 12) % 12) + 1
                  : p.house;

                return (
                  <div
                    key={p.name}
                    className={`rounded-lg border p-2.5 space-y-1.5 shadow-3xs transition-all ${
                      isLagna
                        ? 'bg-amber-50/80 border-amber-300'
                        : p.isRetrograde
                        ? 'bg-rose-50/30 border-rose-200'
                        : 'bg-[#FAF8F5] border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Header: Planet Symbol & Dignity */}
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[14px] text-amber-900">{p.symbol}</span>
                        <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
                          {p.name} ({p.englishName})
                        </h4>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px]">
                        {p.isRetrograde && (
                          <span className="px-1.5 py-0.2 rounded font-black bg-rose-100 text-rose-900 border border-rose-300">
                            Vakri (R)
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded font-bold bg-amber-100/80 text-amber-950 border border-amber-200">
                          H{houseFromNatal}
                        </span>
                      </div>
                    </div>

                    {/* Coordinates & Zodiac Sign */}
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-stone-900">
                        {p.rasiName} ({VEDIC_RASIS[p.rasiNumber - 1]?.westernEquivalent})
                      </span>
                      <span className="font-mono font-bold text-amber-950">
                        {p.degree}° {p.minute}&apos;
                      </span>
                    </div>

                    {/* Nakshatra & Pada Detail */}
                    <div className="bg-white rounded border border-stone-200/80 p-1.5 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">
                          Nakshatra: <strong className="text-amber-900">{p.nakshatra}</strong> (Pada {p.pada})
                        </span>
                        <span className="text-stone-500 font-semibold">Lord: {p.nakshatraLord || '—'}</span>
                      </div>

                      {fixedStar && (
                        <div className="text-[10px] text-stone-600 truncate pt-0.5 border-t border-stone-100">
                          <strong>Fixed Star:</strong> {fixedStar.fixedStar}
                        </div>
                      )}
                    </div>

                    {/* KP Sub Lord & Natal Impact */}
                    <div className="flex items-center justify-between text-[10.5px] pt-0.5 text-stone-600">
                      <span>KP Sub-Lord: <strong className="text-amber-950 font-bold">{p.subLord || '—'}</strong></span>
                      <span className="text-purple-900 font-bold">
                        Natal House {houseFromNatal}
                      </span>
                    </div>

                    {/* Planetary Direction & Digbala */}
                    {(() => {
                      const dirInfo = getPlanetDirectionInfo(p.name);
                      const rasiDir = getRasiDirection(p.rasiNumber);
                      return (
                        <div className="bg-amber-50/70 rounded p-1.5 border border-amber-200/80 text-[10.5px] flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center space-x-1">
                            <Compass className="w-3 h-3 text-amber-700" />
                            <span>Direction: <strong>{dirInfo.compassDirection}</strong></span>
                          </span>
                          <span className="text-stone-700">
                            Digbala: <strong className="text-amber-900">H{dirInfo.digbalaHouse} ({dirInfo.digbalaDirection})</strong>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MONTHLY PLANETARY & NAKSHATRA EPHEMERIS GRID */}
      {viewMode === 'monthly' && (
        <div className="space-y-2">
          {/* Monthly Controls Bar */}
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-2">
            {/* Year & Month Picker */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear((y) => y - 1);
                  } else {
                    setSelectedMonth((m) => m - 1);
                  }
                }}
                className="p-1 rounded bg-[#FAF8F5] border border-stone-300 text-stone-700 hover:border-amber-400 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[12.5px] font-bold rounded px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                {monthNames.map((mName, idx) => (
                  <option key={mName} value={idx}>{mName}</option>
                ))}
              </select>

              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || today.getFullYear())}
                className="w-20 bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[12.5px] font-bold rounded px-2 py-1 text-center focus:outline-none cursor-pointer"
              />

              <button
                type="button"
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear((y) => y + 1);
                  } else {
                    setSelectedMonth((m) => m + 1);
                  }
                }}
                className="p-1 rounded bg-[#FAF8F5] border border-stone-300 text-stone-700 hover:border-amber-400 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick Jump Buttons */}
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(today.getFullYear());
                  setSelectedMonth(today.getMonth());
                }}
                className="px-2 py-1 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold cursor-pointer hover:bg-amber-200"
              >
                Today Month
              </button>
            </div>

            {/* Planet Isolator Filter */}
            <div className="flex items-center space-x-1 text-[11.5px]">
              <span className="font-bold text-stone-600">Filter Planet:</span>
              <select
                value={planetFilter}
                onChange={(e) => setPlanetFilter(e.target.value as any)}
                className="bg-[#FAF8F5] border border-stone-300 text-stone-900 font-bold rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                {grahaOptions.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Day-by-Day Monthly Ephemeris Table */}
          <div className="bg-white rounded-lg border border-stone-200 shadow-3xs overflow-hidden">
            <div className="px-3 py-2 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-vedic font-bold text-stone-950 text-[14px]">
                Monthly Astronomical Ephemeris Grid — {monthNames[selectedMonth]} {selectedYear} ({ayanamshaSystem} Sidereal)
              </h3>
              <span className="text-[11px] text-stone-500 font-semibold">
                Daily Noon Astronomical Coordinates
              </span>
            </div>

            <div className="overflow-x-auto w-full max-h-[600px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-[11.5px]">
                <thead className="sticky top-0 bg-[#FAF8F5] z-10 border-b border-stone-200 text-stone-900 font-bold">
                  <tr>
                    <th className="py-1.5 px-2">Date</th>
                    <th className="py-1.5 px-2">Day</th>
                    {(planetFilter === 'All' ? ['Surya', 'Chandra', 'Mangal', 'Budha', 'Guru', 'Shukra', 'Shani', 'Rahu', 'Ketu'] : [planetFilter]).map((p) => (
                      <th key={p} className="py-1.5 px-2">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {monthlyEphemerisData.map((row) => (
                    <tr key={row.dayOfMonth} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-1 px-2 font-bold text-stone-950 whitespace-nowrap">
                        {row.dayOfMonth} {monthNames[selectedMonth].slice(0, 3)}
                      </td>
                      <td className="py-1 px-2 text-stone-600 font-semibold">
                        {row.dayOfWeek}
                      </td>
                      {(planetFilter === 'All' ? ['Surya', 'Chandra', 'Mangal', 'Budha', 'Guru', 'Shukra', 'Shani', 'Rahu', 'Ketu'] : [planetFilter]).map((pName) => {
                        const pData = row.planets[pName as GrahaName];
                        if (!pData) return <td key={pName} className="py-1 px-2">—</td>;

                        return (
                          <td key={pName} className="py-1 px-2 whitespace-nowrap">
                            <div className="flex flex-col leading-tight">
                              <span className="font-bold text-stone-900">
                                {pData.rasiName} {pData.degree}°{pData.minute}&apos;
                                {pData.isRetrograde ? ' (R)' : ''}
                              </span>
                              <span className="text-[10px] text-amber-900 font-semibold">
                                {pData.nakshatra} (P{pData.pada})
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: YEARLY MAJOR INGRESSES & CELESTIAL EVENTS */}
      {viewMode === 'yearly' && (
        <div className="space-y-2">
          {/* Year Controls */}
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-700" />
              <h3 className="font-vedic font-bold text-stone-950 text-[15px]">
                Annual Astronomical Ingress Directory &amp; Eclipse Events — Year {selectedYear}
              </h3>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-stone-600">Select Year:</span>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10) || today.getFullYear())}
                className="w-20 bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[12.5px] font-bold rounded px-2 py-1 text-center focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Ingresses List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {yearlyMilestones.map((evt, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-2.5 space-y-1 shadow-3xs transition-all ${
                  evt.significanceRating === 'High'
                    ? 'bg-amber-50/70 border-amber-300'
                    : evt.significanceRating === 'Transformative'
                    ? 'bg-purple-50/60 border-purple-200'
                    : 'bg-[#FAF8F5] border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-black uppercase text-amber-900 px-1.5 py-0.2 rounded bg-amber-100 border border-amber-200">
                      {evt.dateStr}
                    </span>
                    <span className="font-vedic font-bold text-stone-950 text-[13.5px]">
                      {evt.planet} ({evt.planetEnglish})
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-stone-200">
                    {evt.eventType}
                  </span>
                </div>

                <p className="text-[12px] text-stone-800 leading-snug font-medium pt-0.5">
                  {evt.description}
                </p>

                {evt.natalHouseImpact && (
                  <div className="text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80 w-fit mt-1">
                    🎯 {evt.natalHouseImpact} for {seekerName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 4: MULTI-DECADE TIMELINE NAVIGATOR (PAST, PRESENT & FUTURE ERAS) */}
      {viewMode === 'multidecade' && (
        <div className="space-y-2">
          {/* Custom Date Jump & Multi-Decade Presets */}
          <div className="bg-white rounded-lg border border-amber-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-1.5">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <h3 className="font-vedic font-bold text-stone-950 text-[15px]">
                  Multi-Decade Astronomical Planet &amp; Nakshatra Time Machine
                </h3>
              </div>

              {/* Exact Custom Date Input */}
              <div className="flex items-center space-x-1.5 text-[12px]">
                <span className="font-bold text-stone-700">Jump to Any Date:</span>
                <input
                  type="date"
                  value={customDateStr}
                  onChange={(e) => setCustomDateStr(e.target.value)}
                  className="bg-[#FAF8F5] border border-amber-300 text-stone-900 font-bold rounded px-2 py-1 text-[12px] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Era Presets Bar */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-black text-amber-900 uppercase tracking-wider text-[10px]">
                Era Presets:
              </span>

              {[
                { label: 'Birth Date', date: birthDate },
                { label: '1980 Era', date: '1980-01-01' },
                { label: '1990 Era', date: '1990-01-01' },
                { label: 'Y2K (2000)', date: '2000-01-01' },
                { label: '2010 Era', date: '2010-01-01' },
                { label: '2020 Era', date: '2020-01-01' },
                { label: 'Current (2026)', date: today.toISOString().split('T')[0] },
                { label: '2030 Era', date: '2030-01-01' },
                { label: '2040 Era', date: '2040-01-01' },
                { label: '2050 Era', date: '2050-01-01' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCustomDateStr(preset.date)}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all border ${
                    customDateStr === preset.date
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ephemeris Output for Selected Custom Date */}
          {customScrubberCalc && (
            <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                <span className="font-vedic font-black text-stone-950 text-[15px]">
                  Astronomical Ephemeris for {customScrubberCalc.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedCity.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {customScrubberCalc.calc.planets.map((p) => {
                  const houseFromNatal = natalCalc.lagnaRasi
                    ? ((p.rasiNumber - natalCalc.lagnaRasi + 12) % 12) + 1
                    : p.house;

                  return (
                    <div key={p.name} className="bg-[#FAF8F5] rounded border border-stone-200 p-2 text-[12px] space-y-0.5">
                      <div className="flex items-center justify-between font-bold border-b border-stone-200/60 pb-0.5">
                        <span className="text-amber-950">{p.symbol} {p.name} ({p.englishName})</span>
                        <span className="text-[10px] text-stone-500 font-semibold">
                          {p.isRetrograde ? 'Vakri (R)' : 'Marga'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-900">
                        <span>Sign: <strong>{p.rasiName}</strong></span>
                        <span className="font-mono">{p.degree}° {p.minute}&apos;</span>
                      </div>
                      <div className="text-[11px] text-stone-700">
                        Nakshatra: <strong className="text-amber-900">{p.nakshatra}</strong> (Pada {p.pada})
                      </div>
                      <div className="text-[10px] text-purple-900 font-bold pt-0.5">
                        Activates Natal House H{houseFromNatal} ({seekerName})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FIXED STARS & 27 NAKSHATRAS CELESTIAL DIRECTORY DRAWER */}
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
        <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
          <div className="flex items-center space-x-1.5">
            <Star className="w-4 h-4 text-amber-700" />
            <h3 className="font-vedic font-bold text-stone-950 text-[15px]">
              27 Nakshatras &amp; Fixed Astronomical Stars Reference
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            360° Sidereal Zodiac • 13° 20’ per Nakshatra
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          {NAKSHATRA_ASTRONOMICAL_DATA.map((nak) => (
            <div key={nak.id} className="bg-[#FAF8F5] rounded border border-stone-200/90 p-2 text-[11.5px] space-y-1">
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-0.5">
                <span className="font-vedic font-bold text-stone-950 text-[12.5px]">
                  {nak.id}. {nak.name} ({nak.sanskritName})
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                  Lord: {nak.lord}
                </span>
              </div>

              <div className="text-stone-700">
                <strong>Fixed Star:</strong> {nak.fixedStar}
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-stone-500">
                <span>Constellation: {nak.constellation}</span>
                <span>Deity: {nak.deity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
