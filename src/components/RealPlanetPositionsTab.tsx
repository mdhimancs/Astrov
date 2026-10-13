import React, { useState, useMemo } from 'react';
import { Sparkles, Globe, Orbit, Compass, Clock, ArrowRight, ShieldCheck, Activity, Award, Star, Info, Zap } from 'lucide-react';
import { UserProfile, PlanetPosition, GrahaName } from '../types';
import { calculatePlanetaryPositions, AyanamshaSystem } from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { PLANET_INFO } from '../vedicMath';

interface RealPlanetPositionsTabProps {
  activeProfile?: UserProfile;
  profiles?: UserProfile[];
}

export function RealPlanetPositionsTab({
  activeProfile,
  profiles = [],
}: RealPlanetPositionsTabProps) {
  const [dataSource, setDataSource] = useState<'live' | 'natal'>('live');
  const [ayanamshaSystem, setAyanamshaSystem] = useState<AyanamshaSystem>('Lahiri');
  const [selectedGrahaFilter, setSelectedGrahaFilter] = useState<string>('All');

  // Compute positions
  const targetDate = dataSource === 'live' ? new Date() : new Date(`${activeProfile?.birthDate || '1990-01-01'}T${activeProfile?.birthTime || '12:00'}:00`);
  const lat = activeProfile?.latitude || 28.6139;
  const lng = activeProfile?.longitude || 77.2090;

  const calcResult = useMemo(() => {
    return calculatePlanetaryPositions(targetDate, lat, lng, ayanamshaSystem);
  }, [targetDate, lat, lng, ayanamshaSystem]);

  const planets = calcResult?.planets || [];
  const lagnaRasi = calcResult?.lagnaRasi || 1;
  const lagnaDeg = calcResult?.lagnaDeg || 0;

  const filteredPlanets = planets.filter((p) => {
    if (selectedGrahaFilter === 'All') return true;
    return p?.name === selectedGrahaFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 rounded-xl p-4 sm:p-5 border border-amber-600/30 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
                Astronomical & Sidereal Precision
              </span>
              <span className="text-amber-200/60 text-xs">• Chitra Paksha ({ayanamshaSystem})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 tracking-tight mt-1">
              Real Position of Planets & Nakshatras
            </h2>
            <p className="text-amber-200/80 text-xs sm:text-sm max-w-2xl mt-1">
              Precise sidereal longitudes, constellation padas, KP sub-lords, and apparent celestial motion of all nine Grahas and the Ascendant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Mode Selector */}
            <div className="bg-amber-950/80 border border-amber-500/40 rounded-lg p-1 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setDataSource('live')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  dataSource === 'live'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                Live Sky (Now)
              </button>
              <button
                type="button"
                onClick={() => setDataSource('natal')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  dataSource === 'natal'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                Natal ({activeProfile?.name || 'Seeker'})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-3xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-stone-700">
          <span className="font-bold uppercase tracking-wider text-amber-900">Filter Graha:</span>
          <select
            value={selectedGrahaFilter}
            onChange={(e) => setSelectedGrahaFilter(e.target.value)}
            className="bg-amber-50/80 border border-amber-300 rounded px-2.5 py-1 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600 cursor-pointer"
          >
            <option value="All">All Grahas & Ascendant</option>
            {planets.map((p) => (
              <option key={p?.name} value={p?.name}>
                {p?.name} ({PLANET_INFO[p?.name as GrahaName]?.english || p?.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 text-xs text-stone-600">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-stone-800">Observation Time:</span>
            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
              {targetDate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Planets Table */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-amber-50/80 to-[#FAF8F5] border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Orbit className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
              Planetary Ephemeris & Nakshatra Pada Breakdown
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">
            {filteredPlanets.length} celestial bodies listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-amber-900/5 text-stone-800 border-b border-amber-200 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Graha / Body</th>
                <th className="py-2.5 px-3">Sidereal Longitude</th>
                <th className="py-2.5 px-3">Zodiac Sign (Rasi)</th>
                <th className="py-2.5 px-3">Nakshatra & Pada</th>
                <th className="py-2.5 px-3">Nak. Lord</th>
                <th className="py-2.5 px-3">KP Sub-Lord</th>
                <th className="py-2.5 px-3">House</th>
                <th className="py-2.5 px-3 text-right">Status / Motion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPlanets.map((p) => {
                const totalDeg = Number(p?.longitude || 0);
                const rasiIdx = Math.floor(totalDeg / 30);
                const rasiObj = VEDIC_RASIS[rasiIdx % 12];
                const degInSign = totalDeg % 30;
                const degInt = Math.floor(degInSign);
                const minInt = Math.floor((degInSign - degInt) * 60);
                const secInt = Math.floor(((degInSign - degInt) * 60 - minInt) * 60);

                const isRetro = Boolean(p?.isRetrograde);
                const isLagna = p?.name === 'Lagna';
                const planetKey = p?.name as GrahaName;

                return (
                  <tr key={p?.name} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-stone-900">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shadow-3xs ${
                          isLagna
                            ? 'bg-amber-700 text-white'
                            : isRetro
                            ? 'bg-purple-800 text-white'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {PLANET_INFO[planetKey]?.symbol || (p?.name ? p.name.slice(0, 2) : 'Pl')}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{p?.name || 'Planet'}</div>
                          <div className="text-[10px] text-stone-500">{PLANET_INFO[planetKey]?.english || (isLagna ? 'Ascendant' : '')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-stone-800">
                      {totalDeg.toFixed(2)}°
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{rasiObj?.sanskritName || 'Sign'} ({rasiObj?.englishName || ''})</div>
                      <div className="text-[10px] font-mono text-stone-600">{degInt}° {minInt}' {secInt}"</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-amber-950">{p?.nakshatra || 'Ashvini'}</div>
                      <div className="text-[10px] text-amber-800 font-semibold">Pada {p?.pada || 1} ({Number(p?.nakshatraPercentage || 0).toFixed(1)}%)</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      {p?.nakshatraLord || 'Ketu'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-purple-900">
                      {p?.subLord || 'Guru'}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      House {p?.house || 1}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isLagna ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                          Ascendant
                        </span>
                      ) : isRetro ? (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-300">
                          Vakri (Retrograde)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          Direct (Marga)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nakshatra Constellation Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Nakshatra Mastery */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-3xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h4>Nakshatra Padas & Quarters</h4>
          </div>
          <p className="text-stone-600 text-xs leading-relaxed">
            Each of the 27 Nakshatras spans 13°20' in the zodiac and is divided into 4 padas (quarters) of 3°20' each. Each pada corresponds to a specific Navamsha sign and infuses subtle elemental and psychological nuances.
          </p>
          <div className="pt-1 text-[11px] text-amber-800 font-semibold flex items-center space-x-1">
            <span>Total Zodiac Coverage: 27 × 4 = 108 Padas</span>
          </div>
        </div>

        {/* Card 2: KP Sub-Lord System */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-3xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
            <Compass className="w-4 h-4 text-amber-700" />
            <h4>KP Sub-Lord Precision</h4>
          </div>
          <p className="text-stone-600 text-xs leading-relaxed">
            Krishnamurti Paddhati (KP) divides every Nakshatra into unequal sub-lords proportional to the Vimshottari Dasha years (120 years total). The sub-lord determines the precise fruition and fructification of events.
          </p>
          <div className="pt-1 text-[11px] text-purple-900 font-semibold">
            <span>Sub-lords active across all houses & cusps</span>
          </div>
        </div>

        {/* Card 3: Ayanamsha & Sidereal Accuracy */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-3xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-serif font-bold text-sm">
            <Globe className="w-4 h-4 text-amber-700" />
            <h4>Chitra Paksha Ayanamsha</h4>
          </div>
          <p className="text-stone-600 text-xs leading-relaxed">
            Calculated relative to fixed star Spica (Chitra) using Lahiri ayanamsha (~24.25°), ensuring true alignment with ancient Vedic astronomical Siddhantas and modern ephemeris tables.
          </p>
          <div className="pt-1 text-[11px] text-emerald-800 font-semibold">
            <span>High precision Gochar & Natal calculations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
