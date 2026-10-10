import React, { useState, useEffect, useMemo } from 'react';
import {
  Orbit,
  Clock,
  Sparkles,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  FastForward,
  Rewind,
  Zap,
  ShieldCheck,
  Flame,
  Layers,
  Bell,
} from 'lucide-react';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import { CelestialSkyMapWheel } from './CelestialSkyMapWheel';
import { MoonPhasesImpact } from './MoonPhasesImpact';
import { calculatePlanetaryPositions, buildHouseStructure, AyanamshaSystem } from '../vedicMath';
import { HouseInfo, PlanetPosition, UserProfile } from '../types';
import { VEDIC_RASIS } from '../data';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';

interface TransitsLiveTabProps {
  activeProfile?: UserProfile;
  natalPlanets?: PlanetPosition[];
  natalLagnaRasi?: number;
}

export function TransitsLiveTab({
  activeProfile,
  natalPlanets = [],
  natalLagnaRasi = 1,
}: TransitsLiveTabProps) {
  const [selectedCity, setSelectedCity] = useState<PlaceValue>({
    name: activeProfile?.place || 'New Delhi, India',
    lat: activeProfile?.latitude || 28.6139,
    lng: activeProfile?.longitude || 77.209,
    tz: activeProfile?.timezone || 5.5,
  });

  const [liveDate, setLiveDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // days per step
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [chartLayout, setChartLayout] = useState<'north' | 'south' | 'wheel'>('north');
  const [ayanamshaSystem, setAyanamshaSystem] = useState<AyanamshaSystem>('Lahiri');
  const [showNatalOverlay, setShowNatalOverlay] = useState<boolean>(true);

  // Computed Date based on offset from today
  const currentDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  // Planetary Calculation for Current Scrubber Date
  const transitCalc = useMemo(() => {
    return calculatePlanetaryPositions(currentDate, selectedCity.lat, selectedCity.lng, ayanamshaSystem);
  }, [currentDate, selectedCity, ayanamshaSystem]);

  const transitPlanets = transitCalc.planets;
  const transitHouses = useMemo(() => {
    return buildHouseStructure(transitCalc.lagnaRasi, transitPlanets);
  }, [transitCalc, transitPlanets]);

  // Overlay Houses (Natal Houses with Transit Planets inside)
  const overlayHouses = useMemo(() => {
    return buildHouseStructure(natalLagnaRasi, natalPlanets, transitPlanets);
  }, [natalLagnaRasi, natalPlanets, transitPlanets]);

  // Automated Transit Animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDayOffset((prev) => prev + playbackSpeed);
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Identify Major Transit Hits / Conjunctions with Natal Chart
  const transitHits = useMemo(() => {
    if (!natalPlanets || natalPlanets.length === 0) return [];
    const hits: {
      transitPlanet: string;
      natalPlanet: string;
      sign: string;
      type: 'Exact Conjunction' | 'Same Sign (Yuti)' | 'Mutual Aspect (Drishti)';
      orb: string;
      interpretation: string;
    }[] = [];

    transitPlanets.forEach((tp) => {
      if (tp.name === 'Lagna') return;
      natalPlanets.forEach((np) => {
        if (np.name === 'Lagna') return;
        if (tp.rasiNumber === np.rasiNumber) {
          const degDiff = Math.abs((tp.degree + tp.minute / 60) - (np.degree + np.minute / 60));
          if (degDiff <= 3.5) {
            hits.push({
              transitPlanet: tp.name,
              natalPlanet: np.name,
              sign: tp.rasiName,
              type: 'Exact Conjunction',
              orb: `${degDiff.toFixed(1)}°`,
              interpretation: `Transiting ${tp.name} exactly triggers natal ${np.name} in ${tp.rasiName}. Highly active karmic timing.`,
            });
          } else {
            hits.push({
              transitPlanet: tp.name,
              natalPlanet: np.name,
              sign: tp.rasiName,
              type: 'Same Sign (Yuti)',
              orb: `${degDiff.toFixed(1)}°`,
              interpretation: `Transiting ${tp.name} transits through the same sign (${tp.rasiName}) as natal ${np.name}.`,
            });
          }
        }
      });
    });

    return hits.slice(0, 6);
  }, [transitPlanets, natalPlanets]);

  // Specialized Natal Moon Conjunction Alerts (Chandra Gochar Yoga)
  const natalMoonConjunctionAlerts = useMemo(() => {
    if (!natalPlanets || natalPlanets.length === 0) return [];
    const natalMoon = natalPlanets.find((p) => p.name === 'Chandra');
    if (!natalMoon) return [];

    const alerts: {
      transitPlanet: string;
      rasiName: string;
      orb: number;
      isExact: boolean;
      significance: string;
      remedy: string;
      mood: 'auspicious' | 'intense' | 'transformative' | 'caution';
    }[] = [];

    transitPlanets.forEach((tp) => {
      if (tp.name === 'Lagna') return;
      if (tp.rasiNumber === natalMoon.rasiNumber) {
        const degDiff = Math.abs((tp.degree + tp.minute / 60) - (natalMoon.degree + natalMoon.minute / 60));
        const isExact = degDiff <= 3.5;

        let significance = '';
        let remedy = '';
        let mood: 'auspicious' | 'intense' | 'transformative' | 'caution' = 'intense';

        switch (tp.name) {
          case 'Surya':
            significance = isExact
              ? 'Exact Solar Conjunction with Natal Moon (Amavasya Yoga / Sun-Moon union). Deep inner reflection, ego vs emotion tug-of-war, vitality renewal.'
              : `Sun transiting natal Moon in ${tp.rasiName}. Heightened focus on career, authority, and emotional identity.`;
            remedy = 'Practice Surya Namaskar, chant Gayatri Mantra, and offer water to the rising sun.';
            mood = 'transformative';
            break;
          case 'Guru':
            significance = isExact
              ? '✨ EXTREMELY AUSPICIOUS: Jupiter conjunct Natal Moon (Gaja Kesari Yoga resonance). Wisdom, optimism, financial protection, and emotional peace.'
              : `Jupiter transiting natal Moon in ${tp.rasiName}. Expansion of emotional intelligence, blessings from mentors and gurus.`;
            remedy = 'Honor teachers, wear yellow on Thursdays, and practice gratitude.';
            mood = 'auspicious';
            break;
          case 'Shani':
            significance = isExact
              ? '⚠️ Heavy Karmic Transit: Saturn conjunct Natal Moon (Sade Sati or Ashtama Shani peak resonance). Emotional testing, endurance required, professional discipline.'
              : `Saturn transiting natal Moon in ${tp.rasiName}. Patience, solitude, and structured work are favored.`;
            remedy = 'Chant Hanuman Chalisa, donate mustard oil on Saturdays, and practice disciplined self-care.';
            mood = 'caution';
            break;
          case 'Mangal':
            significance = isExact
              ? '🔥 High Emotional Intensity: Mars conjunct Natal Moon. Impatience, passion, impulsivity, or high energy drive.'
              : `Mars transiting natal Moon in ${tp.rasiName}. Physical vitality combined with potential mental restlessness or reactivity.`;
            remedy = 'Practice deep breathing, engage in physical exercise, and avoid needless arguments.';
            mood = 'intense';
            break;
          case 'Budha':
            significance = isExact
              ? '💡 Mental Agility: Mercury conjunct Natal Moon. High intellectual curiosity, lively communication, and analytical emotional processing.'
              : `Mercury transiting natal Moon in ${tp.rasiName}. Excellent for writing, planning, and meaningful conversations.`;
            remedy = 'Practice mindfulness, journal thoughts, and connect with friends.';
            mood = 'auspicious';
            break;
          case 'Shukra':
            significance = isExact
              ? '💖 Harmony & Joy: Venus conjunct Natal Moon. Heightened romance, artistic inspiration, social warmth, and inner contentment.'
              : `Venus transiting natal Moon in ${tp.rasiName}. Enjoyment of comforts, pleasant gatherings, and creative pursuits.`;
            remedy = 'Appreciate beauty, spend time in nature, and practice kindness.';
            mood = 'auspicious';
            break;
          case 'Rahu':
            significance = isExact
              ? '🌀 Psychic Sensitivity: Rahu conjunct Natal Moon (Grahan Yoga resonance). Unconventional thoughts, vivid imagination, sudden anxieties or out-of-the-box ambitions.'
              : `Rahu transiting natal Moon in ${tp.rasiName}. Amplified desires, fascination with foreign or unusual ideas.`;
            remedy = 'Ground yourself in daily routines, practice meditation, and avoid addictive habits.';
            mood = 'caution';
            break;
          case 'Ketu':
            significance = isExact
              ? '🧘 Spiritual Detachment: Ketu conjunct Natal Moon. Introspection, occasional emotional detachment, heightened intuition, or past-life memory prompts.'
              : `Ketu transiting natal Moon in ${tp.rasiName}. Desire for solitude, spiritual inquiry, and letting go of emotional baggage.`;
            remedy = 'Engage in meditation, yoga, and quiet contemplation.';
            mood = 'transformative';
            break;
          default:
            significance = `Transiting ${tp.name} is conjunct your natal Moon in ${tp.rasiName}, influencing your daily emotional rhythms.`;
            remedy = 'Maintain mental balance through yoga and meditation.';
            mood = 'intense';
        }

        alerts.push({
          transitPlanet: tp.name,
          rasiName: tp.rasiName,
          orb: Number(degDiff.toFixed(1)),
          isExact,
          significance,
          remedy,
          mood,
        });
      }
    });

    return alerts;
  }, [transitPlanets, natalPlanets]);

  return (
    <div className="w-full space-y-2">
      {/* Intro Header & Top Controls */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-3xs">
        <div className="flex items-center space-x-1.5">
          <Orbit className="w-4 h-4 text-amber-700 animate-spin-slow" />
          <h1 className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
            Interactive Transit Time Machine (Gochar Ephemeris)
          </h1>
        </div>

        {/* Ayanamsha & Layout Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Ayanamsha Picker */}
          <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded px-1.5 py-0.5 text-[11px]">
            <span className="font-bold text-stone-500">Ayanamsha:</span>
            <select
              value={ayanamshaSystem}
              onChange={(e) => setAyanamshaSystem(e.target.value as AyanamshaSystem)}
              className="font-bold text-amber-950 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Lahiri">NC Lahiri (Chitra Paksha)</option>
              <option value="KP">KP (Krishnamurti)</option>
              <option value="Raman">BV Raman</option>
              <option value="TrueChitra">True Chitra</option>
            </select>
          </div>

          {/* Layout Toggle */}
          <div className="flex rounded border border-stone-200 bg-white p-0.5 text-[11px]">
            <button
              onClick={() => setChartLayout('north')}
              className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                chartLayout === 'north' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'text-stone-600'
              }`}
            >
              North
            </button>
            <button
              onClick={() => setChartLayout('south')}
              className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                chartLayout === 'south' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'text-stone-600'
              }`}
            >
              South
            </button>
            <button
              onClick={() => setChartLayout('wheel')}
              className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                chartLayout === 'wheel' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'text-stone-600'
              }`}
            >
              360° Wheel
            </button>
          </div>
        </div>
      </div>

      {/* TIME MACHINE SCRUBBER & ANIMATION DECK */}
      <div className="bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] rounded-lg border border-amber-200 p-2 shadow-3xs space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-stone-200/60 pb-1.5">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <div>
              <span className="text-[14px] font-vedic font-bold text-stone-950">
                {currentDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="text-[11px] text-stone-500 font-semibold ml-2">
                ({dayOffset === 0 ? 'Today' : dayOffset > 0 ? `+${dayOffset} days` : `${dayOffset} days`})
              </span>
            </div>
          </div>

          {/* Play / Pause / Reset & Speed Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDayOffset((prev) => prev - 30)}
              title="-30 Days"
              className="p-1 rounded bg-white border border-stone-200 hover:border-amber-400 text-stone-700 cursor-pointer"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1 rounded text-[12px] font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                isPlaying
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Time Machine'}</span>
            </button>
            <button
              onClick={() => setDayOffset((prev) => prev + 30)}
              title="+30 Days"
              className="p-1 rounded bg-white border border-stone-200 hover:border-amber-400 text-stone-700 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setDayOffset(0);
                setIsPlaying(false);
              }}
              title="Reset to Present"
              className="p-1 rounded bg-white border border-stone-200 hover:border-amber-400 text-stone-700 cursor-pointer flex items-center space-x-1 text-[11px] font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
              <span>Now</span>
            </button>

            {/* Speed Picker */}
            <div className="flex rounded border border-stone-200 bg-white text-[10px] font-bold ml-1">
              {[
                { label: '1D', val: 1 },
                { label: '7D', val: 7 },
                { label: '30D', val: 30 },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setPlaybackSpeed(s.val)}
                  className={`px-1.5 py-0.5 ${
                    playbackSpeed === s.val ? 'bg-amber-100 text-amber-950 font-black' : 'text-stone-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Scrub Slider (-365 to +730 days: 3-Year Time Horizon) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-stone-500 font-bold">
            <span>Past (-1 Year)</span>
            <span className="text-amber-900 font-black">Scrub Planetary Clock</span>
            <span>Future (+2 Years)</span>
          </div>
          <input
            type="range"
            min={-365}
            max={730}
            step={1}
            value={dayOffset}
            onChange={(e) => {
              setDayOffset(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full accent-amber-700 cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* Observation Place & Natal Overlay Mode Toggle */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2.5 py-1.5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNatalOverlay(!showNatalOverlay)}
            className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer flex items-center space-x-1 ${
              showNatalOverlay
                ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-300'
                : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-700" />
            <span>{showNatalOverlay ? 'Transit over Natal Chart (Overlay ON)' : 'Pure Gochar Chart Only'}</span>
          </button>
          <span className="text-[11px] text-stone-500 font-semibold hidden md:inline">
            {showNatalOverlay ? 'Showing Gochar planets transiting natal houses' : 'Direct Sky observation'}
          </span>
        </div>

        <div className="w-full sm:w-72">
          <PlaceOfBirthInput
            id="transit-observation-point"
            value={selectedCity.name}
            latitude={selectedCity.lat}
            longitude={selectedCity.lng}
            timezone={selectedCity.tz}
            onChange={(newCity) => setSelectedCity(newCity)}
            label=""
            placeholder="Search City..."
            compact
          />
        </div>
      </div>

      {/* Grid: Gochar Kundali + Coordinates Table & Transit Hits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        {/* CHART DISPLAY (NORTH, SOUTH, OR 360 CELESTIAL WHEEL) */}
        <div className={`${chartLayout === 'wheel' ? 'lg:col-span-12' : 'lg:col-span-6'} transition-all`}>
          {chartLayout === 'north' ? (
            <NorthIndianChart
              houses={showNatalOverlay ? overlayHouses : transitHouses}
              title={showNatalOverlay ? 'Gochar Transit on Natal Chart' : 'Live Gochar Sky'}
              subtitle={`${currentDate.toLocaleDateString()} • ${selectedCity.name}`}
              isTransit={true}
              showTransitsTogether={showNatalOverlay}
            />
          ) : chartLayout === 'south' ? (
            <SouthIndianChart
              houses={showNatalOverlay ? overlayHouses : transitHouses}
              title={showNatalOverlay ? 'Gochar Transit on Natal Chart' : 'Live Gochar Sky'}
              subtitle={`${currentDate.toLocaleDateString()} • ${selectedCity.name}`}
              isTransit={true}
            />
          ) : (
            <div className="w-full flex justify-center py-1">
              <CelestialSkyMapWheel
                livePlanets={transitPlanets}
                natalPlanets={natalPlanets}
                lagnaRasi={natalLagnaRasi}
                seekerName=""
                locationName={selectedCity.name}
              />
            </div>
          )}
        </div>

        {/* TRANSIT PLANETARY COORDINATES & HITS */}
        <div className={`${chartLayout === 'wheel' ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-2`}>
          {/* Natal Moon Conjunction Alerts (Chandra Conjunction Gochar) */}
          {showNatalOverlay && (
            <div className={`rounded-lg border p-2 shadow-3xs space-y-1.5 ${
              natalMoonConjunctionAlerts.length > 0
                ? 'bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/50 border-amber-300'
                : 'bg-white border-stone-200'
            }`}>
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-1">
                <span className="text-[12px] font-black uppercase tracking-wider text-amber-950 flex items-center space-x-1">
                  <Bell className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  <span>Natal Moon Conjunction Alerts (Chandra Gochar)</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  natalMoonConjunctionAlerts.length > 0
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {natalMoonConjunctionAlerts.length > 0 ? `${natalMoonConjunctionAlerts.length} Conjunction(s) Active` : 'No Direct Conjunction'}
                </span>
              </div>

              {natalMoonConjunctionAlerts.length > 0 ? (
                <div className="space-y-1.5">
                  {natalMoonConjunctionAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`rounded p-2 border text-[12px] ${
                        alert.mood === 'auspicious'
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : alert.mood === 'caution'
                          ? 'bg-red-50/80 border-red-300 text-red-950'
                          : alert.mood === 'transformative'
                          ? 'bg-purple-50/80 border-purple-300 text-purple-950'
                          : 'bg-amber-50/90 border-amber-300 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center space-x-1">
                          <span className="text-[13px]">🌙</span>
                          <span>Transiting {alert.transitPlanet} ☌ Natal Moon ({alert.rasiName})</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                          alert.isExact ? 'bg-amber-700 text-white animate-pulse' : 'bg-white/80 border border-amber-300 text-amber-900'
                        }`}>
                          {alert.isExact ? `EXACT (${alert.orb}°)` : `Yuti (${alert.orb}°)`}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 leading-snug font-medium opacity-90">
                        {alert.significance}
                      </p>
                      <div className="mt-1 pt-1 border-t border-black/10 flex items-start space-x-1 text-[10px] font-semibold">
                        <span className="font-bold uppercase tracking-wide">Remedy / Guidance:</span>
                        <span>{alert.remedy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-stone-500 text-[11px]">
                  No transiting planets are currently conjunct your Natal Moon in this time window. Scrub the time machine or select another date to explore future transits.
                </div>
              )}
            </div>
          )}

          {/* Moon Phases Impact Analysis Component */}
          <MoonPhasesImpact
            activeProfile={activeProfile}
            natalPlanets={natalPlanets}
            natalLagnaRasi={natalLagnaRasi}
          />

          {/* Active Planetary Hits / Conjunctions with Natal Chart */}
          {showNatalOverlay && transitHits.length > 0 && (
            <div className="bg-amber-50/70 rounded-lg border border-amber-200 p-2 shadow-3xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-1">
                <span className="text-[12px] font-black uppercase tracking-wider text-amber-950 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-700" />
                  <span>Transit Trigger Points (Natal Alignments)</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                  {transitHits.length} Active
                </span>
              </div>
              <div className="space-y-1">
                {transitHits.map((hit, idx) => (
                  <div key={idx} className="bg-white rounded p-1.5 border border-amber-200/80 text-[12px]">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span className="text-amber-950">
                        {hit.transitPlanet} (Transit) ☌ {hit.natalPlanet} (Natal)
                      </span>
                      <span className="text-[10px] px-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {hit.sign} • Orb {hit.orb}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-700 leading-tight mt-0.5">{hit.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ephemeris Table with KP Sub-Lord */}
          <div className="bg-white rounded-lg border border-stone-200 p-2 shadow-3xs space-y-1">
            <div className="flex items-center justify-between mb-1 border-b border-stone-100 pb-1">
              <h3 className="text-[13px] font-vedic font-bold text-stone-950 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Ephemeris &amp; KP Sub-Lords ({currentDate.toLocaleDateString()})</span>
              </h3>
              <span className="text-[10px] font-semibold text-stone-500 font-mono">
                {ayanamshaSystem} Sidereal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-800 text-[11px] font-bold">
                    <th className="py-1 px-1.5">Graha</th>
                    <th className="py-1 px-1.5">Sign</th>
                    <th className="py-1 px-1.5">Deg</th>
                    <th className="py-1 px-1.5">Nakshatra (Pada)</th>
                    <th className="py-1 px-1.5">Star Lord</th>
                    <th className="py-1 px-1.5">KP Sub</th>
                    <th className="py-1 px-1.5">Motion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transitPlanets.map((p) => (
                    <tr key={p.name} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-1 px-1.5 font-bold text-stone-950">
                        {p.symbol} {p.name}
                      </td>
                      <td className="py-1 px-1.5 text-stone-800">{p.rasiName}</td>
                      <td className="py-1 px-1.5 font-mono text-stone-900">
                        {p.degree}° {p.minute}&apos;
                      </td>
                      <td className="py-1 px-1.5 text-stone-700">
                        {p.nakshatra} (P{p.pada})
                      </td>
                      <td className="py-1 px-1.5 text-stone-700">{p.nakshatraLord || '—'}</td>
                      <td className="py-1 px-1.5 font-semibold text-amber-900 bg-amber-50/50 rounded">
                        {p.subLord || '—'}
                      </td>
                      <td className="py-1 px-1.5">
                        {p.isRetrograde ? (
                          <span className="text-red-700 font-black text-[11px] px-1 bg-red-50 rounded border border-red-200">
                            Vakri (R)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px] px-1 bg-emerald-50 rounded border border-emerald-200">
                            Marga
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Planetary Influences Summary */}
          <div className="bg-[#FAF5EC] rounded-lg border border-[#E8DEC8] p-2 shadow-3xs space-y-1">
            <h4 className="font-vedic font-bold text-stone-950 text-[13px] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Critical Planetary Transit Influence</span>
            </h4>
            <div className="text-[12px] text-stone-800 space-y-1">
              <div className="flex items-start space-x-1.5">
                <span className="text-amber-800 font-black">•</span>
                <span>
                  <strong>Saturn (Shani):</strong> Demands structural maturity, endurance, and long-term consolidation in {transitPlanets.find((p) => p.name === 'Shani')?.rasiName}.
                </span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="text-amber-800 font-black">•</span>
                <span>
                  <strong>Jupiter (Guru):</strong> Expands wisdom, strategic counsel, and dharmic abundance in {transitPlanets.find((p) => p.name === 'Guru')?.rasiName}.
                </span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="text-amber-800 font-black">•</span>
                <span>
                  <strong>Rahu &amp; Ketu:</strong> Nodal axes guide modern breakthroughs and spiritual detachment.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
