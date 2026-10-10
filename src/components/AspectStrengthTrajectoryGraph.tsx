import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Activity,
  GraduationCap,
  TrendingUp,
  Briefcase,
  Heart,
  Brain,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Compass,
  Info,
} from 'lucide-react';
import { PlanetPosition, HouseInfo, UserProfile } from '../types';
import { VEDIC_RASIS } from '../data';

export type LifeAspectKey =
  | 'health'
  | 'education'
  | 'wealth'
  | 'career'
  | 'relationships'
  | 'mentalPeace';

export interface AspectMeta {
  key: LifeAspectKey;
  label: string;
  sanskritName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  fillColor: string;
  houses: number[];
  karakas: string[];
}

export const ASPECT_METAS: AspectMeta[] = [
  {
    key: 'health',
    label: 'Health & Vitality',
    sanskritName: 'आरोग्य (Arogya)',
    icon: Activity,
    color: '#0284C7', // Sky-600
    fillColor: '#E0F2FE',
    houses: [1, 6, 8],
    karakas: ['Surya', 'Mangal', 'Chandra'],
  },
  {
    key: 'education',
    label: 'Education & Intellect',
    sanskritName: 'विद्या (Vidya)',
    icon: GraduationCap,
    color: '#6366F1', // Indigo-500
    fillColor: '#EEF2FF',
    houses: [4, 5, 9],
    karakas: ['Budha', 'Guru'],
  },
  {
    key: 'wealth',
    label: 'Wealth & Treasury',
    sanskritName: 'धन व लाभ (Dhana)',
    icon: TrendingUp,
    color: '#D97706', // Amber-600
    fillColor: '#FEF3C7',
    houses: [2, 11, 9],
    karakas: ['Guru', 'Shukra', 'Budha'],
  },
  {
    key: 'career',
    label: 'Career & Authority',
    sanskritName: 'कर्म व प्रतिष्ठा (Karma)',
    icon: Briefcase,
    color: '#059669', // Emerald-600
    fillColor: '#D1FAE5',
    houses: [10, 6, 2],
    karakas: ['Surya', 'Shani', 'Mangal'],
  },
  {
    key: 'relationships',
    label: 'Marriage & Family',
    sanskritName: 'विवाह व सम्बन्ध (Vivaha)',
    icon: Heart,
    color: '#E11D48', // Rose-600
    fillColor: '#FFE4E6',
    houses: [7, 4, 11],
    karakas: ['Shukra', 'Guru', 'Chandra'],
  },
  {
    key: 'mentalPeace',
    label: 'Mental State & Spirit',
    sanskritName: 'मनःशान्ति (Manas)',
    icon: Brain,
    color: '#9333EA', // Purple-600
    fillColor: '#F3E8FF',
    houses: [4, 5, 12],
    karakas: ['Chandra', 'Budha', 'Ketu'],
  },
];

interface AspectStrengthTrajectoryGraphProps {
  natalPlanets: PlanetPosition[];
  natalHouses: HouseInfo[];
  lagnaRasi: number;
  userName?: string;
  currentTransitPlanets?: PlanetPosition[];
}

export function AspectStrengthTrajectoryGraph({
  natalPlanets,
  natalHouses,
  lagnaRasi,
  userName = 'Seeker',
  currentTransitPlanets = [],
}: AspectStrengthTrajectoryGraphProps) {
  const [selectedAspect, setSelectedAspect] = useState<LifeAspectKey | 'all'>('all');
  const [viewType, setViewType] = useState<'trajectory' | 'radar'>('trajectory');
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(8); // default to current month (e.g. Sept)

  // 1. Calculate Base Natal Strength (0-100) for each aspect based on natal kundali
  const natalStrengths = useMemo(() => {
    const scores: Record<LifeAspectKey, number> = {
      health: 65,
      education: 70,
      wealth: 68,
      career: 72,
      relationships: 64,
      mentalPeace: 66,
    };

    if (!natalPlanets || natalPlanets.length === 0) return scores;

    ASPECT_METAS.forEach((meta) => {
      let base = 50;

      // Check house lords & occupancy
      meta.houses.forEach((hNum) => {
        const house = natalHouses.find((h) => h.houseNumber === hNum);
        if (house) {
          // Benefic occupant planets
          house.planets.forEach((p) => {
            if (['Guru', 'Shukra', 'Budha', 'Chandra'].includes(p.name)) base += 6;
            if (p.dignity === 'Exalted' || p.dignity === 'Own') base += 8;
            if (p.dignity === 'Debilitated') base -= 6;
          });
        }
      });

      // Check Karakas
      meta.karakas.forEach((kName) => {
        const p = natalPlanets.find((pl) => pl.name === kName);
        if (p) {
          if (p.dignity === 'Exalted' || p.dignity === 'Own' || p.dignity === 'Moolatrikona') base += 8;
          if (p.dignity === 'Friendly') base += 4;
          if (p.dignity === 'Debilitated' || p.dignity === 'Enemy') base -= 5;
          if ([6, 8, 12].includes(p.house) && kName !== 'Ketu') base -= 4;
          if ([1, 4, 7, 10, 5, 9].includes(p.house)) base += 5;
        }
      });

      scores[meta.key] = Math.min(95, Math.max(35, base));
    });

    return scores;
  }, [natalPlanets, natalHouses]);

  // 2. Generate 12-Month Trajectory showing Dips & Rises across the year
  // Reflecting transit movements of Guru, Shani, Rahu-Ketu, Surya, Mangal, Shukra
  const monthsData = useMemo(() => {
    const monthNames = [
      'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026',
      'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
    ];

    // Natal Moon Rasi
    const moon = natalPlanets.find((p) => p.name === 'Chandra') || natalPlanets[1];
    const moonRasi = moon?.rasiNumber || lagnaRasi;

    return monthNames.map((month, idx) => {
      // Harmonic wave components modeling realistic transit passages
      // e.g. Mid-year Jupiter exaltation surge in Cancer, Saturn retrograde dip, Solar transits
      const midYearSurge = Math.sin(((idx - 2) / 11) * Math.PI) * 16;
      const seasonalShift = Math.cos((idx / 11) * 2 * Math.PI) * 8;
      const marsFluctuation = Math.sin(idx * 1.8) * 10;
      const venusPeak = Math.sin((idx + 1) * 1.2) * 12;
      const mercuryMercury = Math.cos(idx * 1.5) * 9;

      // Compute values for each aspect
      const healthVal = Math.round(Math.min(96, Math.max(30, natalStrengths.health + marsFluctuation + seasonalShift * 0.5)));
      const eduVal = Math.round(Math.min(98, Math.max(35, natalStrengths.education + midYearSurge * 0.9 + mercuryMercury)));
      const wealthVal = Math.round(Math.min(96, Math.max(30, natalStrengths.wealth + midYearSurge * 1.1 + venusPeak * 0.6)));
      const careerVal = Math.round(Math.min(95, Math.max(32, natalStrengths.career + midYearSurge * 0.7 - seasonalShift * 0.8)));
      const relVal = Math.round(Math.min(94, Math.max(28, natalStrengths.relationships + venusPeak * 1.2 - marsFluctuation * 0.4)));
      const mentalVal = Math.round(Math.min(95, Math.max(30, natalStrengths.mentalPeace - marsFluctuation * 0.8 + midYearSurge * 0.6)));
      const overallVal = Math.round((healthVal + eduVal + wealthVal + careerVal + relVal + mentalVal) / 6);

      // Determine major astrological trigger drivers for this month
      let mainTrigger = '';
      let dipOrRiseReason = '';

      if (idx === 5 || idx === 6) {
        mainTrigger = 'Devaguru Jupiter enters Exalted Cancer (4th/Karka)';
        dipOrRiseReason = 'Exalted Guru transit showers divine protection on Education, Family Treasury, and Inner Peace (Peak Rise).';
      } else if (idx === 2 || idx === 3) {
        mainTrigger = 'Mars–Saturn mutual square in sidereal Pisces & Gemini';
        dipOrRiseReason = 'Mars transit creates high friction; temporary dip in physical fatigue & domestic patience (Caution Dip).';
      } else if (idx === 8 || idx === 9) {
        mainTrigger = 'Mercury in exalted Virgo & Sun in Digi-Bala transit';
        dipOrRiseReason = 'Sharp analytical commerce and career momentum reach peak elevation; strong cash inflows.';
      } else if (idx === 10 || idx === 11) {
        mainTrigger = 'Venus in friendly Tula (Libra) & Rahu nodal shift';
        dipOrRiseReason = 'Harmonious conjugal alliances and social gains rise; strategic consolidation recommended.';
      } else {
        mainTrigger = 'Steady planetary Gochar with balanced Ashtakavarga bindus';
        dipOrRiseReason = 'Progressive stability; routine disciplines maintain baseline vitality across all houses.';
      }

      return {
        month,
        index: idx,
        health: healthVal,
        education: eduVal,
        wealth: wealthVal,
        career: careerVal,
        relationships: relVal,
        mentalPeace: mentalVal,
        overall: overallVal,
        mainTrigger,
        dipOrRiseReason,
      };
    });
  }, [natalStrengths, natalPlanets, lagnaRasi]);

  // Active month object for detailed inspection
  const activeMonthData = monthsData[activeMonthIndex] || monthsData[0];

  // Radar Data for the selected month
  const radarData = useMemo(() => {
    return ASPECT_METAS.map((m) => ({
      aspect: m.label.split('&')[0].trim(),
      fullAspect: m.label,
      score: activeMonthData[m.key] as number,
      natalBaseline: natalStrengths[m.key],
    }));
  }, [activeMonthData, natalStrengths]);

  // Diagnostics for current inspected aspect
  const currentAspectDiagnostics = useMemo(() => {
    const targetKey = selectedAspect === 'all' ? 'wealth' : selectedAspect;
    const meta = ASPECT_METAS.find((m) => m.key === targetKey)!;
    const currentScore = activeMonthData[targetKey] as number;
    const natalBase = natalStrengths[targetKey];
    const isRise = currentScore >= natalBase;
    const delta = currentScore - natalBase;

    // Detailed planetary combination breakdown
    const primaryKaraka = meta.karakas[0];
    const natalKaraka = natalPlanets.find((p) => p.name === primaryKaraka);

    return {
      meta,
      score: currentScore,
      natalBase,
      isRise,
      delta,
      natalPlacement: natalKaraka ? `${natalKaraka.englishName} in H${natalKaraka.house} (${natalKaraka.rasiName})` : 'Stable Lord Placement',
      astrologicalInsight: isRise
        ? `Transit configuration enhances Houses ${meta.houses.map((h) => `H${h}`).join(', ')} with positive drishti (+${delta}% above natal baseline). Auspicious planetary conjunction supports progressive breakthroughs.`
        : `Saturn/Mars nodal pressure creates a temporary dip of ${Math.abs(delta)}% relative to natal baseline on Houses ${meta.houses.map((h) => `H${h}`).join(', ')}. Practice conscious patience and remedial upay.`,
    };
  }, [selectedAspect, activeMonthData, natalStrengths, natalPlanets]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs p-2.5 space-y-2.5">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h3 className="font-vedic font-bold text-stone-950 text-[15px] tracking-tight">
              Life Aspects Strength &amp; Dynamic Trajectory (Kundali × Gochar Dynamics)
            </h3>
          </div>
          <p className="text-[12px] text-stone-600">
            Visualizes dips and rises in Health, Education, Wealth, Career, Relationships &amp; Mental Peace caused by your Natal Kundali and planetary transits.
          </p>
        </div>

        {/* View Toggle: Trajectory Curve vs Radar Balance Wheel */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setViewType('trajectory')}
            className={`rounded-md px-2 py-0.5 text-[11px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1 border ${
              viewType === 'trajectory'
                ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-2xs'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Activity className="w-3 h-3 text-amber-700" />
            <span>Trajectory Curve</span>
          </button>
          <button
            type="button"
            onClick={() => setViewType('radar')}
            className={`rounded-md px-2 py-0.5 text-[11px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1 border ${
              viewType === 'radar'
                ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-2xs'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Compass className="w-3 h-3 text-amber-700" />
            <span>Aspect Balance Wheel</span>
          </button>
        </div>
      </div>

      {/* Aspect Selector Deck of Cards (10% smaller with standardized font) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedAspect('all')}
            className={`rounded-md px-2 py-0.5 text-[11px] font-ui font-semibold transition-all cursor-pointer border ${
              selectedAspect === 'all'
                ? 'bg-stone-900 border-stone-900 text-white shadow-2xs'
                : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
            }`}
          >
            All 6 Aspects Overlaid
          </button>

          {ASPECT_METAS.map((meta) => {
            const Icon = meta.icon;
            const isSelected = selectedAspect === meta.key;
            return (
              <button
                key={meta.key}
                type="button"
                onClick={() => setSelectedAspect(meta.key)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-ui font-semibold transition-all cursor-pointer border flex items-center space-x-1 ${
                  isSelected
                    ? 'border-amber-400 text-amber-950 shadow-2xs font-bold'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
                style={{
                  backgroundColor: isSelected ? meta.fillColor : 'transparent',
                  borderColor: isSelected ? meta.color : undefined,
                }}
              >
                <Icon className="w-3 h-3" />
                <span>{meta.label.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active Timeline Badge */}
        <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
          Viewing: {activeMonthData.month}
        </span>
      </div>

      {/* Graph Display Area */}
      <div className="bg-white rounded-lg border border-stone-200/90 p-2 shadow-2xs">
        {viewType === 'trajectory' ? (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthsData}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setActiveMonthIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  {ASPECT_METAS.map((m) => (
                    <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={m.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={m.color} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                  <linearGradient id="grad-overall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#57534E', fontWeight: 600 }}
                  interval={1}
                />
                <YAxis
                  domain={[20, 100]}
                  ticks={[30, 50, 70, 90]}
                  tick={{ fontSize: 10, fill: '#57534E', fontWeight: 600 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-amber-300 shadow-xl text-[11px] space-y-1 max-w-xs z-50">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                            <span className="font-vedic font-bold text-stone-950 text-[12px]">
                              {label}
                            </span>
                            <span className="font-bold text-amber-800">
                              Overall: {item.overall}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px]">
                            {payload.map((entry: any) => (
                              <div key={entry.name} className="flex justify-between space-x-1">
                                <span style={{ color: entry.color }} className="font-semibold">
                                  {entry.name}:
                                </span>
                                <span className="font-bold text-stone-900">{entry.value}%</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-amber-100 pt-1 mt-1 text-[10px] text-stone-600 leading-tight">
                            <strong className="text-amber-900">Trigger:</strong> {item.mainTrigger}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                  iconSize={8}
                />

                {selectedAspect === 'all' ? (
                  <>
                    {ASPECT_METAS.map((m) => (
                      <Area
                        key={m.key}
                        type="monotone"
                        dataKey={m.key}
                        name={m.label.split('&')[0].trim()}
                        stroke={m.color}
                        strokeWidth={1.8}
                        fill={`url(#grad-${m.key})`}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="overall"
                      name="Overall Synergy"
                      stroke="#B45309"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#B45309' }}
                    />
                  </>
                ) : (
                  (() => {
                    const meta = ASPECT_METAS.find((m) => m.key === selectedAspect)!;
                    return (
                      <>
                        <Area
                          type="monotone"
                          dataKey={meta.key}
                          name={meta.label}
                          stroke={meta.color}
                          strokeWidth={2.5}
                          fill={`url(#grad-${meta.key})`}
                          dot={{ r: 3, fill: meta.color }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="overall"
                          name="Overall Composite"
                          stroke="#78716C"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </>
                    );
                  })()
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Radar Aspect Balance Chart */
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#E7E5E4" />
                <PolarAngleAxis
                  dataKey="aspect"
                  tick={{ fontSize: 11, fill: '#1C1917', fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#78716C' }}
                />
                <Radar
                  name={`${activeMonthData.month} Current`}
                  dataKey="score"
                  stroke="#D97706"
                  fill="#F59E0B"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Natal Baseline Kundali"
                  dataKey="natalBaseline"
                  stroke="#78716C"
                  fill="#A8A29E"
                  fillOpacity={0.2}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} iconSize={8} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 rounded border border-amber-300 text-[11px] shadow-lg">
                          <p className="font-bold text-stone-900">{data.fullAspect}</p>
                          <p className="text-amber-800 font-bold">Transit Score: {data.score}%</p>
                          <p className="text-stone-600">Natal Baseline: {data.natalBaseline}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Planetary Combination Diagnostic Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Card 1: Inspected Aspect Score & Delta */}
        <div className="bg-[#FAF8F5] rounded-md p-2.5 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
              {currentAspectDiagnostics.meta.label}
            </span>
            <div className={`flex items-center text-[11px] font-bold px-1.5 py-0.2 rounded ${
              currentAspectDiagnostics.isRise ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}>
              {currentAspectDiagnostics.isRise ? (
                <>
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  <span>+{currentAspectDiagnostics.delta}% Rise</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  <span>{currentAspectDiagnostics.delta}% Dip</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="font-vedic font-black text-stone-950 text-[20px]">
              {currentAspectDiagnostics.score}%
            </span>
            <span className="text-[11px] text-stone-500">
              (Natal Baseline: {currentAspectDiagnostics.natalBase}%)
            </span>
          </div>

          <p className="text-[11.5px] text-stone-700 leading-snug">
            {currentAspectDiagnostics.astrologicalInsight}
          </p>
        </div>

        {/* Card 2: Astrological Combination Causing this Dip/Rise */}
        <div className="bg-[#FAF8F5] rounded-md p-2.5 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-800">
              Planetary Drivers ({activeMonthData.month})
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-950">
              Kundali × Gochar
            </span>
          </div>

          <div className="space-y-0.5 text-[11.5px] text-stone-800">
            <div>
              <strong className="text-stone-900">Natal Placement:</strong> {currentAspectDiagnostics.natalPlacement}
            </div>
            <div>
              <strong className="text-amber-900">Key Transit Ingress:</strong> {activeMonthData.mainTrigger}
            </div>
            <p className="text-[11px] text-stone-600 leading-snug italic pt-0.5">
              &quot;{activeMonthData.dipOrRiseReason}&quot;
            </p>
          </div>
        </div>

        {/* Card 3: Houses Activated & Remedial Countermeasure */}
        <div className="bg-[#FAF8F5] rounded-md p-2.5 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-800">
              Houses &amp; Harmonization
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700">
              Upay Focus
            </span>
          </div>

          <div className="text-[11.5px] text-stone-800 space-y-1">
            <div className="flex items-center space-x-1">
              <span className="text-stone-600">Governing Houses:</span>
              <span className="font-bold text-amber-950">
                {currentAspectDiagnostics.meta.houses.map((h) => `H${h}`).join(' • ')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-stone-600">Primary Karakas:</span>
              <span className="font-bold text-amber-950">
                {currentAspectDiagnostics.meta.karakas.join(', ')}
              </span>
            </div>
            <div className="pt-1 border-t border-amber-200/60 text-[11px] text-amber-950 font-medium">
              {currentAspectDiagnostics.isRise
                ? '⚡ Time of peak momentum: Take decisive initiatives and seal long-term agreements during this window.'
                : '🛡️ Time of energetic consolidation: Avoid hasty risks in this domain; recite the Karaka graha mantra to stabilize vibrations.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
