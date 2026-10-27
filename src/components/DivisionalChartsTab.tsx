import React, { useState, useMemo } from 'react';
import {
  HouseInfo,
  PlanetPosition,
  NatalYoga,
  AshtakavargaPoints,
  UserProfile,
  GrahaName,
} from '../types';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import { CelestialSkyMapWheel } from './CelestialSkyMapWheel';
import {
  Layers,
  Sparkles,
  Award,
  Brain,
  Compass,
  Star,
  BookOpen,
  Eye,
  Heart,
  Crown,
  Shield,
  Briefcase,
  TrendingUp,
  Info,
} from 'lucide-react';
import { VEDIC_RASIS } from '../data';
import {
  VargaCode,
  VARGA_CHART_INFO,
  calculateVargaPosition,
  calculateJaiminiKarakas,
  calculateArudhaLagnas,
} from '../vedicMath';

interface DivisionalChartsTabProps {
  natalHouses: HouseInfo[];
  natalPlanets: PlanetPosition[];
  yogas: NatalYoga[];
  ashtakavarga: AshtakavargaPoints[];
  lagnaRasi: number;
  activeProfile?: UserProfile;
}

const ALL_VARGAS: VargaCode[] = [
  'D1',
  'D9',
  'D10',
  'D2',
  'D3',
  'D4',
  'D7',
  'D12',
  'D16',
  'D20',
  'D24',
  'D27',
  'D30',
  'D60',
];

type VargaCategory = 'ALL' | 'PRIMARY' | 'WEALTH' | 'DYNASTY' | 'SPIRITUAL';

const VARGA_CATEGORIES: { id: VargaCategory; label: string; vargas: VargaCode[] }[] = [
  { id: 'ALL', label: 'All 14 Harmonics', vargas: ALL_VARGAS },
  { id: 'PRIMARY', label: 'Primary & Destiny (D1, D9, D10)', vargas: ['D1', 'D9', 'D10'] },
  { id: 'WEALTH', label: 'Wealth & Assets (D2, D4, D16)', vargas: ['D2', 'D4', 'D16'] },
  { id: 'DYNASTY', label: 'Family & Progeny (D3, D7, D12)', vargas: ['D3', 'D7', 'D12'] },
  { id: 'SPIRITUAL', label: 'Wisdom & Karma (D20, D24, D27, D30, D60)', vargas: ['D20', 'D24', 'D27', 'D30', 'D60'] },
];

// Classical Graha Dignity in Vedic Signs
const GRAHA_DIGNITY_RULES: Record<
  GrahaName,
  {
    exalted: number; // rasi 1-12
    debilitated: number;
    ownSigns: number[];
    moolatrikona: number;
    friends: GrahaName[];
    enemies: GrahaName[];
  }
> = {
  Surya: { exalted: 1, debilitated: 7, ownSigns: [5], moolatrikona: 5, friends: ['Chandra', 'Mangal', 'Guru'], enemies: ['Shukra', 'Shani', 'Rahu', 'Ketu'] },
  Chandra: { exalted: 2, debilitated: 8, ownSigns: [4], moolatrikona: 2, friends: ['Surya', 'Budha'], enemies: ['Rahu', 'Ketu'] },
  Mangal: { exalted: 10, debilitated: 4, ownSigns: [1, 8], moolatrikona: 1, friends: ['Surya', 'Chandra', 'Guru'], enemies: ['Budha', 'Rahu'] },
  Budha: { exalted: 6, debilitated: 12, ownSigns: [3, 6], moolatrikona: 6, friends: ['Surya', 'Shukra'], enemies: ['Chandra'] },
  Guru: { exalted: 4, debilitated: 10, ownSigns: [9, 12], moolatrikona: 9, friends: ['Surya', 'Chandra', 'Mangal'], enemies: ['Budha', 'Shukra'] },
  Shukra: { exalted: 12, debilitated: 6, ownSigns: [2, 7], moolatrikona: 7, friends: ['Budha', 'Shani'], enemies: ['Surya', 'Chandra'] },
  Shani: { exalted: 7, debilitated: 1, ownSigns: [10, 11], moolatrikona: 11, friends: ['Budha', 'Shukra'], enemies: ['Surya', 'Chandra', 'Mangal'] },
  Rahu: { exalted: 2, debilitated: 8, ownSigns: [11], moolatrikona: 3, friends: ['Shukra', 'Shani'], enemies: ['Surya', 'Chandra', 'Mangal'] },
  Ketu: { exalted: 8, debilitated: 2, ownSigns: [8], moolatrikona: 9, friends: ['Mangal', 'Guru'], enemies: ['Surya', 'Chandra', 'Shukra'] },
  Lagna: { exalted: 0, debilitated: 0, ownSigns: [], moolatrikona: 0, friends: [], enemies: [] },
};

function getGrahaDignityInSign(planet: GrahaName, rasiNumber: number): { label: string; tone: 'exalted' | 'debilitated' | 'own' | 'moola' | 'friend' | 'enemy' | 'neutral' } {
  if (planet === 'Lagna') return { label: 'Ascendant Point', tone: 'neutral' };
  const rule = GRAHA_DIGNITY_RULES[planet];
  if (!rule) return { label: 'Neutral', tone: 'neutral' };

  if (rasiNumber === rule.exalted) return { label: 'Exalted (Uchcha)', tone: 'exalted' };
  if (rasiNumber === rule.debilitated) return { label: 'Debilitated (Neecha)', tone: 'debilitated' };
  if (rasiNumber === rule.moolatrikona) return { label: 'Moolatrikona', tone: 'moola' };
  if (rule.ownSigns.includes(rasiNumber)) return { label: 'Own Sign (Swakshetra)', tone: 'own' };

  const signLord = VEDIC_RASIS[rasiNumber - 1]?.lord;
  if (signLord) {
    if (rule.friends.includes(signLord)) return { label: 'Friendly Sign (Mitra)', tone: 'friend' };
    if (rule.enemies.includes(signLord)) return { label: 'Enemy Sign (Shatru)', tone: 'enemy' };
  }
  return { label: 'Neutral Sign (Sama)', tone: 'neutral' };
}

export function DivisionalChartsTab({
  natalHouses,
  natalPlanets,
  yogas,
  ashtakavarga,
  lagnaRasi,
  activeProfile,
}: DivisionalChartsTabProps) {
  const [activeSuiteSection, setActiveSuiteSection] = useState<'varga' | 'jaimini' | 'ashtakavarga'>('varga');
  const [selectedVarga, setSelectedVarga] = useState<VargaCode>('D9');
  const [selectedCategory, setSelectedCategory] = useState<VargaCategory>('PRIMARY');
  const [chartLayout, setChartLayout] = useState<'north' | 'south' | 'wheel'>('north');

  // Compute Jaimini Karakas & Arudhas
  const jaiminiKarakas = useMemo(() => calculateJaiminiKarakas(natalPlanets), [natalPlanets]);
  const { arudhaLagnaRasi, upapadaLagnaRasi } = useMemo(
    () => calculateArudhaLagnas(lagnaRasi, natalPlanets),
    [lagnaRasi, natalPlanets]
  );

  // Compute Karakamsha Lagna (Navamsha sign of Atmakaraka)
  const karakamshaLagna = useMemo(() => {
    const ak = jaiminiKarakas[0];
    if (!ak) return lagnaRasi;
    const akPlanet = natalPlanets.find((p) => p.name === ak.planet);
    if (!akPlanet) return lagnaRasi;
    const deg = akPlanet.totalDeg ?? (akPlanet.rasiNumber - 1) * 30 + akPlanet.degree + akPlanet.minute / 60;
    return calculateVargaPosition(deg, 'D9').rasiNumber;
  }, [jaiminiKarakas, natalPlanets, lagnaRasi]);

  // Compute Paka Lagna (Sign of Lagna Lord)
  const pakaLagnaRasi = useMemo(() => {
    const lagnaLord = VEDIC_RASIS[lagnaRasi - 1]?.lord;
    const lordPlanet = natalPlanets.find((p) => p.name === lagnaLord);
    return lordPlanet ? lordPlanet.rasiNumber : lagnaRasi;
  }, [lagnaRasi, natalPlanets]);

  // Vargottama Planets (Same sign in D1 and D9)
  const vargottamaPlanets = useMemo(() => {
    return natalPlanets
      .filter((p) => p.name !== 'Lagna')
      .filter((p) => {
        const deg = p.totalDeg ?? (p.rasiNumber - 1) * 30 + p.degree + p.minute / 60;
        const d9Pos = calculateVargaPosition(deg, 'D9');
        return d9Pos.rasiNumber === p.rasiNumber;
      })
      .map((p) => p.name);
  }, [natalPlanets]);

  // Build House Structure for any selected Varga (D1 to D60)
  const buildVargaHouses = (varga: VargaCode): HouseInfo[] => {
    if (varga === 'D1') return natalHouses;

    const lagnaPlanet = natalPlanets.find((p) => p.name === 'Lagna');
    const lagnaTotalDeg = lagnaPlanet?.totalDeg ?? (lagnaRasi - 1) * 30 + 15;
    const vargaLagna = calculateVargaPosition(lagnaTotalDeg, varga);
    const vargaLagnaRasi = vargaLagna.rasiNumber;

    const vargaHouses: HouseInfo[] = [];

    for (let h = 1; h <= 12; h++) {
      const rasiNumber = ((vargaLagnaRasi - 1 + (h - 1)) % 12) + 1;
      const rasiData = VEDIC_RASIS[rasiNumber - 1];

      const planetsInRasi = natalPlanets
        .filter((p) => p.name !== 'Lagna')
        .map((p) => {
          const pDeg = p.totalDeg ?? (p.rasiNumber - 1) * 30 + p.degree + p.minute / 60;
          const pos = calculateVargaPosition(pDeg, varga);
          return { planet: p, vargaRasiNumber: pos.rasiNumber, vargaRasiName: pos.rasiName };
        })
        .filter((item) => item.vargaRasiNumber === rasiNumber)
        .map((item) => ({
          ...item.planet,
          rasiNumber,
          rasiName: item.vargaRasiName,
          house: h,
        }));

      vargaHouses.push({
        houseNumber: h,
        rasiNumber,
        rasiName: rasiData.sanskritName,
        signLord: rasiData.lord,
        planets: planetsInRasi,
        significance: '',
        karaka: '',
        vedicName: '',
      });
    }

    return vargaHouses;
  };

  const currentVargaHouses = useMemo(() => buildVargaHouses(selectedVarga), [selectedVarga, natalHouses, natalPlanets, lagnaRasi]);
  const vargaInfo = VARGA_CHART_INFO[selectedVarga] || VARGA_CHART_INFO.D1;

  // Planetary Placements & Dignities in the currently selected Varga
  const vargaPlanetaryPlacements = useMemo(() => {
    return natalPlanets
      .filter((p) => p.name !== 'Lagna')
      .map((p) => {
        const pDeg = p.totalDeg ?? (p.rasiNumber - 1) * 30 + p.degree + p.minute / 60;
        const vPos = calculateVargaPosition(pDeg, selectedVarga);
        const houseObj = currentVargaHouses.find((h) => h.planets.some((pl) => pl.name === p.name));
        const houseNum = houseObj?.houseNumber || 1;
        const dignity = getGrahaDignityInSign(p.name, vPos.rasiNumber);
        const isVargottama = selectedVarga === 'D9' && vPos.rasiNumber === p.rasiNumber;

        return {
          planet: p.name,
          degOriginal: (p.degree || 0) + (p.minute || 0) / 60,
          vargaRasiNumber: vPos.rasiNumber,
          vargaRasiName: vPos.rasiName,
          house: houseNum,
          dignity,
          isVargottama,
        };
      });
  }, [natalPlanets, selectedVarga, currentVargaHouses]);

  const filteredVargas = useMemo(() => {
    const cat = VARGA_CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.vargas : ALL_VARGAS;
  }, [selectedCategory]);

  return (
    <div className="w-full space-y-2">
      {/* SUITE HEADER BAR */}
      <div className="bg-[#FAF8F5] rounded-lg border border-[#E7DEC8] p-2 sm:p-2.5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-700 via-orange-700 to-amber-900 text-amber-100 flex items-center justify-center shadow-3xs shrink-0 border border-amber-400/40">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h1 className="font-vedic font-bold uppercase tracking-wider text-stone-900 text-[14px] leading-tight">
                Shodashavarga &amp; Jaimini Kundali Suite
              </h1>
              <span className="text-[11px] text-amber-800 font-serif">षोडशवर्ग एवं जैमिनी कुण्डली सूत्र</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-medium mt-0.5">
              <span>{activeProfile?.name || 'Seeker'}</span>
              <span aria-hidden="true">·</span>
              <span>Lagna: <strong className="text-amber-900 font-semibold">{VEDIC_RASIS[lagnaRasi - 1]?.sanskritName}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Active: <strong className="text-stone-900">{selectedVarga} ({vargaInfo.name})</strong></span>
              {vargottamaPlanets.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-800 font-bold">Vargottama: {vargottamaPlanets.join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart Layout Switcher */}
        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">Layout:</span>
          <div className="flex rounded-md border border-stone-200 bg-white p-0.5 shadow-3xs">
            <button
              type="button"
              onClick={() => setChartLayout('north')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                chartLayout === 'north'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              North (Diamond)
            </button>
            <button
              type="button"
              onClick={() => setChartLayout('south')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                chartLayout === 'south'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              South (Fixed Rasi)
            </button>
            <button
              type="button"
              onClick={() => setChartLayout('wheel')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                chartLayout === 'wheel'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              360° Wheel
            </button>
          </div>
        </div>
      </div>

      {/* FOUR-PILLAR SUITE SECTION TABS */}
      <div className="flex items-center gap-1 border-b border-[#E7DEC8] bg-[#FAF8F5]/80 rounded-t-lg px-2 pt-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSuiteSection('varga')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[12px] font-bold rounded-t-md border-t border-l border-r transition-all cursor-pointer whitespace-nowrap ${
            activeSuiteSection === 'varga'
              ? 'bg-white border-[#E7DEC8] text-amber-950 border-b-2 border-b-white -mb-px shadow-3xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-700" />
          <span>Shodashavarga Harmonics ({selectedVarga})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSuiteSection('jaimini')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[12px] font-bold rounded-t-md border-t border-l border-r transition-all cursor-pointer whitespace-nowrap ${
            activeSuiteSection === 'jaimini'
              ? 'bg-white border-[#E7DEC8] text-amber-950 border-b-2 border-b-white -mb-px shadow-3xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-700" />
          <span>Jaimini Chara Karakas &amp; Arudhas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSuiteSection('ashtakavarga')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-[12px] font-bold rounded-t-md border-t border-l border-r transition-all cursor-pointer whitespace-nowrap ${
            activeSuiteSection === 'ashtakavarga'
              ? 'bg-white border-[#E7DEC8] text-amber-950 border-b-2 border-b-white -mb-px shadow-3xs'
              : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-700" />
          <span>Sarvashtakavarga Matrix</span>
        </button>
      </div>

      {/* SECTION 1: SHODASHAVARGA HARMONIC CHARTS & VARGA PLACEMENTS */}
      {activeSuiteSection === 'varga' && (
        <div className="space-y-2">
          {/* VARGA SELECTOR WITH DOMAIN CATEGORIES */}
          <div className="bg-white rounded-lg border border-[#E7DEC8] p-2 shadow-3xs space-y-1.5">
            {/* Category Segmented Control */}
            <div className="flex items-center justify-between flex-wrap gap-1 border-b border-stone-100 pb-1">
              <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Select Parashari Divisional Chakra (Varga)</span>
              </span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {VARGA_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Varga Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-1">
              {filteredVargas.map((v) => {
                const isActive = selectedVarga === v;
                const meta = VARGA_CHART_INFO[v];
                return (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setSelectedVarga(v)}
                    title={`${meta.name} (${meta.sanskrit}) — ${meta.significance}`}
                    className={`rounded px-1.5 py-1 text-center transition-all cursor-pointer border flex flex-col items-center justify-center ${
                      isActive
                        ? 'bg-amber-100/90 border-amber-500 ring-1 ring-amber-400 text-amber-950 font-black shadow-2xs'
                        : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <span className="text-[11.5px] font-bold leading-none">{v}</span>
                    <span className="text-[9.5px] text-stone-600 truncate max-w-full leading-tight font-serif mt-0.5">
                      {meta.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN CHART + VARGA PLANET PLACEMENTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
            {/* Left Column: Varga Chart */}
            <div className={`${chartLayout === 'wheel' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-2`}>
              <div className="bg-[#FAF9F6] rounded-lg border border-amber-200/80 p-2 shadow-3xs relative">
                <div className="flex items-center justify-between mb-1 px-1">
                  <div>
                    <h2 className="font-vedic font-bold text-stone-900 text-[14px] leading-tight">
                      {selectedVarga}: {vargaInfo.name} ({vargaInfo.sanskrit})
                    </h2>
                    <p className="text-[11px] text-amber-900 font-semibold">{vargaInfo.focus}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {chartLayout === 'north' ? 'North Diamond' : chartLayout === 'south' ? 'South Square' : '360° Circular'}
                    </span>
                  </div>
                </div>

                {chartLayout === 'north' ? (
                  <NorthIndianChart
                    houses={currentVargaHouses}
                    title={`${selectedVarga} ${vargaInfo.name}`}
                    subtitle={vargaInfo.focus}
                  />
                ) : chartLayout === 'south' ? (
                  <SouthIndianChart
                    houses={currentVargaHouses}
                    title={`${selectedVarga} ${vargaInfo.name}`}
                    subtitle={vargaInfo.focus}
                  />
                ) : (
                  <div className="w-full flex justify-center py-1">
                    <CelestialSkyMapWheel
                      livePlanets={natalPlanets}
                      natalPlanets={natalPlanets}
                      lagnaRasi={lagnaRasi}
                      seekerName=""
                      locationName={activeProfile?.place || 'Observation Point'}
                    />
                  </div>
                )}

                {/* Classical Verse & Interpretation */}
                <div className="mt-1.5 bg-white/90 rounded-md p-2 border border-amber-200/70 text-stone-800 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <h3 className="font-vedic font-bold text-stone-950 text-[13px]">
                      {selectedVarga} Classical Parashari Doctrine
                    </h3>
                  </div>
                  <p className="text-[12px] leading-snug text-stone-700">{vargaInfo.significance}.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Planetary Dignities & House Positions in this Varga */}
            <div className={`${chartLayout === 'wheel' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-2`}>
              <div className="bg-white rounded-lg border border-[#E7DEC8] p-2 sm:p-2.5 shadow-3xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <div className="flex items-center space-x-1.5">
                    <Star className="w-4 h-4 text-amber-600" />
                    <h3 className="text-[14px] font-vedic font-bold text-stone-900">
                      {selectedVarga} Planetary Dignities &amp; Houses
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-semibold font-serif">1/n Arc Harmonics</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px] border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-800 font-bold text-[11px]">
                        <th className="py-1 px-1.5">Graha</th>
                        <th className="py-1 px-1.5">Varga Sign</th>
                        <th className="py-1 px-1.5">House</th>
                        <th className="py-1 px-1.5">Dignity in {selectedVarga}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {vargaPlanetaryPlacements.map((pos) => {
                        const isKendra = [1, 4, 7, 10].includes(pos.house);
                        const isTrikona = [1, 5, 9].includes(pos.house);

                        return (
                          <tr key={pos.planet} className="hover:bg-amber-50/40 transition-colors">
                            <td className="py-1 px-1.5 font-bold text-stone-900 flex items-center space-x-1">
                              <span>{pos.planet}</span>
                              {pos.isVargottama && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-900 font-black" title="Same sign in D1 & D9">
                                  Vargottama
                                </span>
                              )}
                            </td>
                            <td className="py-1 px-1.5 text-stone-800 font-serif">
                              {pos.vargaRasiName} ({pos.vargaRasiNumber})
                            </td>
                            <td className="py-1 px-1.5">
                              <span className={`px-1 py-0.2 rounded font-mono text-[11px] font-bold ${
                                isTrikona
                                  ? 'bg-amber-100 text-amber-900'
                                  : isKendra
                                  ? 'bg-blue-50 text-blue-900'
                                  : 'text-stone-700'
                              }`}>
                                H{pos.house}
                              </span>
                            </td>
                            <td className="py-1 px-1.5">
                              <span
                                className={`text-[11px] font-semibold ${
                                  pos.dignity.tone === 'exalted'
                                    ? 'text-emerald-800 font-bold'
                                    : pos.dignity.tone === 'debilitated'
                                    ? 'text-rose-700 font-bold'
                                    : pos.dignity.tone === 'own'
                                    ? 'text-amber-800 font-bold'
                                    : 'text-stone-700'
                                }`}
                              >
                                {pos.dignity.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#FAF8F5] rounded p-1.5 text-[11px] text-stone-600 space-y-0.5 border border-stone-200/70">
                  <p>
                    <strong className="text-amber-900">Vedic Rule:</strong> In Parashari astrology, a planet exalted or well-placed in the divisional harmonic chart (especially D9 Navamsha and D10 Dashamsha) grants extraordinary fruits during its Mahadasha, even if modestly placed in D1.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: JAIMINI CHARA KARAKAS, ARUDHAS & SPECIAL LAGNAS */}
      {activeSuiteSection === 'jaimini' && (
        <div className="space-y-2">
          {/* SPECIAL LAGNAS MATRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {/* Arudha Lagna (AL) */}
            <div className="bg-white p-2 rounded-lg border border-[#E7DEC8] shadow-3xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase text-amber-800">Arudha Lagna (AL)</span>
                <Crown className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="text-[14px] font-black text-stone-900">
                {VEDIC_RASIS[arudhaLagnaRasi - 1]?.sanskritName} ({arudhaLagnaRasi})
              </div>
              <p className="text-[11px] text-stone-600 leading-tight">
                Maya &amp; Public Manifestation: Perceived status, social dignity, and worldly accomplishments.
              </p>
            </div>

            {/* Upapada Lagna (UL) */}
            <div className="bg-white p-2 rounded-lg border border-[#E7DEC8] shadow-3xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase text-purple-800">Upapada Lagna (UL)</span>
                <Heart className="w-3.5 h-3.5 text-purple-700" />
              </div>
              <div className="text-[14px] font-black text-stone-900">
                {VEDIC_RASIS[upapadaLagnaRasi - 1]?.sanskritName} ({upapadaLagnaRasi})
              </div>
              <p className="text-[11px] text-stone-600 leading-tight">
                Matrimonial Sanctum: Marriage endurance, life partner&apos;s background, and domestic devotion.
              </p>
            </div>

            {/* Karakamsha Lagna (KL) */}
            <div className="bg-white p-2 rounded-lg border border-[#E7DEC8] shadow-3xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase text-emerald-800">Karakamsha (KL)</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-[14px] font-black text-stone-900">
                {VEDIC_RASIS[karakamshaLagna - 1]?.sanskritName} ({karakamshaLagna})
              </div>
              <p className="text-[11px] text-stone-600 leading-tight">
                Atmakaraka in Navamsha: Soul&apos;s highest spiritual longing, Ishta Devata, and core talent.
              </p>
            </div>

            {/* Paka Lagna */}
            <div className="bg-white p-2 rounded-lg border border-[#E7DEC8] shadow-3xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase text-blue-800">Paka Lagna</span>
                <Brain className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="text-[14px] font-black text-stone-900">
                {VEDIC_RASIS[pakaLagnaRasi - 1]?.sanskritName} ({pakaLagnaRasi})
              </div>
              <p className="text-[11px] text-stone-600 leading-tight">
                Lagna Lord Placement: Physical stamina, intellect execution, and conscious destiny decisions.
              </p>
            </div>
          </div>

          {/* 7 JAIMINI CHARA KARAKAS TABLE */}
          <div className="bg-white rounded-lg border border-[#E7DEC8] p-2 sm:p-2.5 shadow-3xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <div className="flex items-center space-x-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <h3 className="text-[14px] font-vedic font-bold text-stone-900">
                  The 7 Jaimini Chara Karakas (Ordered by Degree in Sign)
                </h3>
              </div>
              <span className="text-[11px] text-amber-900 font-semibold font-serif">Maharishi Jaimini Sutras</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-800 font-bold text-[11px]">
                    <th className="py-1 px-2">Karaka Role</th>
                    <th className="py-1 px-2">Graha</th>
                    <th className="py-1 px-2">Degree in Sign</th>
                    <th className="py-1 px-2">Significance &amp; Cosmic Mandate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {jaiminiKarakas.map((k, idx) => (
                    <tr key={k.karaka} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-1 px-2 font-bold text-stone-900 flex items-center space-x-1">
                        <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          idx === 0 ? 'bg-amber-200 text-amber-950' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-amber-950 font-bold">{k.karaka}</span>
                        <span className="text-stone-500 font-serif text-[11px]">({k.sanskritName})</span>
                      </td>
                      <td className="py-1 px-2 font-semibold text-stone-900">{k.planet}</td>
                      <td className="py-1 px-2 font-mono text-stone-800 font-bold">{k.degreeInSign}°</td>
                      <td className="py-1 px-2 text-stone-700 text-[11.5px] leading-snug">{k.significance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* JAIMINI RASI DRISHTI (SIGN ASPECTS) OVERVIEW */}
          <div className="bg-[#FAF8F5] rounded-lg p-2 border border-amber-200/80 shadow-3xs space-y-1 text-stone-800">
            <div className="flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <h3 className="font-vedic font-bold text-stone-900 text-[13px]">
                Jaimini Rasi Drishti (Sign Aspects) Axiom
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-[11.5px]">
              <div className="bg-white p-1.5 rounded border border-stone-200">
                <strong className="text-amber-900 block">Chara Rasis (Movable)</strong>
                <span>Aries, Cancer, Libra, Capricorn aspect all Fixed signs EXCEPT the adjacent one.</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-stone-200">
                <strong className="text-amber-900 block">Sthira Rasis (Fixed)</strong>
                <span>Taurus, Leo, Scorpio, Aquarius aspect all Movable signs EXCEPT the adjacent one.</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-stone-200">
                <strong className="text-amber-900 block">Dvisvabhava Rasis (Dual)</strong>
                <span>Gemini, Virgo, Sagittarius, Pisces aspect each other mutually.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SARVASHTAKAVARGA MATRIX */}
      {activeSuiteSection === 'ashtakavarga' && (
        <div className="space-y-2">
          {/* ASHTAKAVARGA KEY LIFE EFFECTS */}
          <div className="bg-white rounded-lg p-2 border border-[#E7DEC8] shadow-3xs space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
              Sarvashtakavarga Key Life Dynamics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <div className="bg-[#FAF8F5] rounded p-2 border border-amber-200/70">
                <span className="text-[10.5px] font-bold uppercase text-emerald-800 block">
                  Labha vs Vyaya (H11 vs H12)
                </span>
                <span className="text-[13px] font-bold text-stone-950 block">Wealth Retention</span>
                <p className="text-[11.5px] text-stone-700 leading-snug mt-0.5">
                  High Bindus in 11th House guarantee income surpasses expenditures, creating steady compounding.
                </p>
              </div>
              <div className="bg-[#FAF8F5] rounded p-2 border border-amber-200/70">
                <span className="text-[10.5px] font-bold uppercase text-amber-800 block">
                  Karma vs Dharma (H10 &amp; H9)
                </span>
                <span className="text-[13px] font-bold text-stone-950 block">Career Leadership</span>
                <p className="text-[11.5px] text-stone-700 leading-snug mt-0.5">
                  Fortified 9th and 10th houses generate enduring executive power and dharmic prosperity.
                </p>
              </div>
              <div className="bg-[#FAF8F5] rounded p-2 border border-amber-200/70">
                <span className="text-[10.5px] font-bold uppercase text-blue-800 block">
                  Tanu vs Yuvati (H1 vs H7)
                </span>
                <span className="text-[13px] font-bold text-stone-950 block">Self-Mastery</span>
                <p className="text-[11.5px] text-stone-700 leading-snug mt-0.5">
                  Dominant 1st House bindus confer independent leadership and health vitality over public reliance.
                </p>
              </div>
            </div>
          </div>

          {/* ASHTAKAVARGA TABLE */}
          <div className="bg-white rounded-lg border border-[#E7DEC8] p-2 sm:p-2.5 shadow-3xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-[14px] font-vedic font-bold text-stone-900">
                  Parashari Bhava Bindu Tally (7 Grahas across 12 Houses)
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 font-semibold font-serif">Parashara Hora</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {ashtakavarga.map((item) => {
                const strongHouses = item.points
                  .map((pt, idx) => (pt >= 5 ? `H${idx + 1}` : null))
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div key={item.planet} className="bg-stone-50/70 rounded-md p-1.5 border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[12.5px] text-stone-900">{item.planet} Ashtakavarga</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 font-mono text-[11px] font-bold">
                        {item.total} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-0.5">
                      {item.points.map((pt, idx) => (
                        <div
                          key={idx}
                          title={`House ${idx + 1}: ${pt} Bindus`}
                          className={`py-0.5 rounded flex flex-col items-center justify-center text-[10px] font-black border transition-colors ${
                            pt >= 5
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : pt >= 4
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                    {strongHouses && (
                      <p className="text-[10.5px] text-stone-600 leading-tight">
                        <span className="text-emerald-800 font-bold">High Bindu Houses:</span> {strongHouses}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
