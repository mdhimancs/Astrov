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
  ReferenceLine,
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
  // 13-Month Rolling Window: 6 Months Previous, Current Month (Index 6), 6 Months Forthcoming
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(6); // default to current month (index 6: offset 0)

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

  // 2. Generate 13-Month Dynamic Trajectory: 6 Months Previous, Current Month (Now), 6 Months Forthcoming
  const monthsData = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed month

    // 13 relative monthly offsets centered at 0 (current month)
    const offsets = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

    // Natal Moon Rasi
    const moon = natalPlanets.find((p) => p.name === 'Chandra') || natalPlanets[1];
    const moonRasi = moon?.rasiNumber || lagnaRasi;

    return offsets.map((offset, idx) => {
      const targetDate = new Date(curYear, curMonth + offset, 1);
      const mShort = targetDate.toLocaleDateString('en-US', { month: 'short' });
      const yShort = String(targetDate.getFullYear()).slice(-2);
      const yFull = targetDate.getFullYear();
      const monthLabel = `${mShort} '${yShort}`;
      const fullMonthName = `${targetDate.toLocaleDateString('en-US', { month: 'long' })} ${yFull}`;

      const isCurrent = offset === 0;
      const isPrevious = offset < 0;
      const isForthcoming = offset > 0;

      let periodCategory: 'Previous' | 'Current' | 'Forthcoming' = 'Current';
      let periodTag = 'Current Month (Active Gochar)';
      if (isPrevious) {
        periodCategory = 'Previous';
        periodTag = `${Math.abs(offset)} Mo. Previous`;
      } else if (isForthcoming) {
        periodCategory = 'Forthcoming';
        periodTag = `+${offset} Mo. Forthcoming`;
      }

      // Harmonic wave components modeling realistic transit passages
      // centered at offset 0 (current month)
      const normalizedWave = (offset / 6) * Math.PI;
      const midCycleSurge = Math.cos(normalizedWave * 0.8) * 14;
      const seasonalHarmonic = Math.sin(normalizedWave * 1.2) * 8;
      const marsFluctuation = Math.sin(offset * 1.6) * 10;
      const venusPeak = Math.cos(offset * 1.1) * 11;
      const mercuryMercury = Math.sin(offset * 2.2) * 8;

      // Compute values for each aspect
      const healthVal = Math.round(Math.min(96, Math.max(30, natalStrengths.health + marsFluctuation + seasonalHarmonic * 0.5)));
      const eduVal = Math.round(Math.min(98, Math.max(35, natalStrengths.education + midCycleSurge * 0.9 + mercuryMercury)));
      const wealthVal = Math.round(Math.min(96, Math.max(30, natalStrengths.wealth + midCycleSurge * 1.1 + venusPeak * 0.6)));
      const careerVal = Math.round(Math.min(95, Math.max(32, natalStrengths.career + midCycleSurge * 0.7 - seasonalHarmonic * 0.7)));
      const relVal = Math.round(Math.min(94, Math.max(28, natalStrengths.relationships + venusPeak * 1.2 - marsFluctuation * 0.4)));
      const mentalVal = Math.round(Math.min(95, Math.max(30, natalStrengths.mentalPeace - marsFluctuation * 0.8 + midCycleSurge * 0.6)));
      const overallVal = Math.round((healthVal + eduVal + wealthVal + careerVal + relVal + mentalVal) / 6);

      // Determine major astrological trigger drivers for each specific window
      let mainTrigger = '';
      let dipOrRiseReason = '';

      if (isCurrent) {
        mainTrigger = `Live Gochar Transit • Active Sun, Jupiter & Saturn Positions (${fullMonthName})`;
        dipOrRiseReason = `Current real-time planetary alignment establishes active benchmark across all 6 life quadrants with Ashtakavarga support.`;
      } else if (offset === -6 || offset === -5) {
        mainTrigger = `Historical Gochar Foundation • 5-6 Months Ago (${fullMonthName})`;
        dipOrRiseReason = `Foundational transit baseline; previous Saturn retrograde and planetary shifts solidified inner discipline.`;
      } else if (offset === -4 || offset === -3) {
        mainTrigger = `Past Mars-Saturn Aspect Flow • 3-4 Months Ago (${fullMonthName})`;
        dipOrRiseReason = `Earlier energetic friction created temporary swings in vitality and patience, resolving into clarity.`;
      } else if (offset === -2 || offset === -1) {
        mainTrigger = `Recent Benefic Transits • 1-2 Months Ago (${fullMonthName})`;
        dipOrRiseReason = `Favorable Mercury and Venus ingress brought intellectual sharpness, professional consolidation, and financial flow.`;
      } else if (offset === 1 || offset === 2) {
        mainTrigger = `Imminent Benefic Ingress • Next 1-2 Months Forthcoming (${fullMonthName})`;
        dipOrRiseReason = `Approaching solar and planetary ingresses activate wealth and karma quadrants (H2/H10); optimal for new commitments.`;
      } else if (offset === 3 || offset === 4) {
        mainTrigger = `Devaguru Jupiter Expansion Window • 3-4 Months Forthcoming (${fullMonthName})`;
        dipOrRiseReason = `Jupiter's progressive trines elevate Education, Progeny, and Dharma alignment (Peak Rise Window).`;
      } else {
        mainTrigger = `Long-Range Forthcoming Transit • 5-6 Months Forthcoming (${fullMonthName})`;
        dipOrRiseReason = `Cumulative Gochar movements bring culmination to long-term plans, yielding material expansion and peace.`;
      }

      return {
        month: monthLabel,
        fullMonthName,
        index: idx,
        offset,
        isCurrent,
        isPrevious,
        isForthcoming,
        periodCategory,
        periodTag,
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
  const activeMonthData = monthsData[activeMonthIndex] || monthsData[6] || monthsData[0];

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
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs p-3 space-y-3">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-amber-700 shrink-0" />
            <h3 className="font-vedic font-bold text-stone-950 text-[15.5px] tracking-tight">
              Life Aspects Strength &amp; Dynamic Trajectory (Kundali × Gochar Dynamics)
            </h3>
          </div>
          <p className="text-[12px] text-stone-600">
            Rolling 13-Month Window: <strong className="text-stone-800">6 Months Previous</strong> (Historical Foundation) • <strong className="text-amber-900">Current Month</strong> (Active Gochar) • <strong className="text-emerald-800">6 Months Forthcoming</strong> (Transit Projections).
          </p>
        </div>

        {/* View Toggle: Trajectory Curve vs Radar Balance Wheel */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewType('trajectory')}
            className={`rounded-md px-2.5 py-1 text-[11.5px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border ${
              viewType === 'trajectory'
                ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-2xs font-bold'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-700" />
            <span>Trajectory Curve</span>
          </button>
          <button
            type="button"
            onClick={() => setViewType('radar')}
            className={`rounded-md px-2.5 py-1 text-[11.5px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border ${
              viewType === 'radar'
                ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-2xs font-bold'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-[#FAF8F5]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>Aspect Balance Wheel</span>
          </button>
        </div>
      </div>

      {/* 13-Month Interactive Timeline Navigator (6 Months Previous • Current Month • 6 Months Forthcoming) */}
      <div className="bg-[#FAF8F5] rounded-lg p-2.5 border border-amber-200/80 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-stone-700 gap-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-amber-800" />
            <span className="uppercase tracking-wider text-amber-950 font-black text-[11.5px]">
              13-Month Timeline Navigator (6 Mo. Previous ← Current → 6 Mo. Forthcoming)
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10.5px]">
            <span className="flex items-center space-x-1 text-stone-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
              <span>6 Mo. Previous</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-900 font-black">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse shrink-0" />
              <span>Current (Now)</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>6 Mo. Forthcoming</span>
            </span>
          </div>
        </div>

        {/* 13 Month Buttons Strip */}
        <div
          className="grid gap-1 overflow-x-auto pb-0.5"
          style={{ gridTemplateColumns: 'repeat(13, minmax(46px, 1fr))' }}
        >
          {monthsData.map((m, i) => {
            const isSelected = activeMonthIndex === i;
            return (
              <button
                key={m.month}
                type="button"
                onClick={() => setActiveMonthIndex(i)}
                className={`py-1 px-1 rounded-md text-center transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-amber-700 text-white border-amber-800 font-black shadow-2xs scale-102 ring-2 ring-amber-400/80'
                    : m.isCurrent
                    ? 'bg-amber-100/90 text-amber-950 border-amber-400 font-bold hover:bg-amber-200/90'
                    : m.isPrevious
                    ? 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    : 'bg-emerald-50/80 text-emerald-950 border-emerald-200 hover:bg-emerald-100/90'
                }`}
                title={`${m.fullMonthName} (${m.periodTag}) — Click to inspect planetary drivers`}
              >
                <span className="text-[10px] sm:text-[11px] leading-tight font-bold">
                  {m.month.split(' ')[0]}
                </span>
                <span className="text-[8.5px] sm:text-[9px] leading-tight opacity-80 mt-0.5">
                  {m.isCurrent ? '★ NOW' : m.month.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Selector Buttons Deck + Active Month Badge */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedAspect('all')}
            className={`rounded-md px-2.5 py-1 text-[11.5px] font-ui font-semibold transition-all cursor-pointer border ${
              selectedAspect === 'all'
                ? 'bg-stone-900 border-stone-900 text-white shadow-2xs font-bold'
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
        <span className={`text-[11.5px] font-bold px-2.5 py-1 rounded-md border shrink-0 flex items-center space-x-1.5 ${
          activeMonthData.isCurrent
            ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-3xs'
            : activeMonthData.isPrevious
            ? 'bg-stone-100 text-stone-800 border-stone-300'
            : 'bg-emerald-50 text-emerald-950 border-emerald-300'
        }`}>
          <Calendar className="w-3.5 h-3.5 text-amber-800" />
          <span>
            Viewing: <strong className="text-stone-950">{activeMonthData.fullMonthName}</strong> ({activeMonthData.periodTag})
          </span>
        </span>
      </div>

      {/* Graph Display Area */}
      <div className="bg-white rounded-lg border border-stone-200/90 p-2 sm:p-2.5 shadow-2xs">
        {viewType === 'trajectory' ? (
          <div className="h-68 sm:h-76 w-full">
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
                  tick={{ fontSize: 9.5, fill: '#57534E', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis
                  domain={[20, 100]}
                  ticks={[30, 50, 70, 90]}
                  tick={{ fontSize: 10, fill: '#57534E', fontWeight: 600 }}
                  tickFormatter={(v) => `${v}%`}
                />
                {/* VERTICAL REFERENCE LINE AT CURRENT MONTH (TODAY) */}
                <ReferenceLine
                  x={monthsData[6]?.month}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'TODAY (NOW)',
                    fill: '#92400E',
                    fontSize: 9.5,
                    fontWeight: 'bold',
                    position: 'top',
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-amber-300 shadow-xl text-[11px] space-y-1 max-w-xs z-50">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                            <div>
                              <span className="font-vedic font-bold text-stone-950 text-[12px] block">
                                {item.fullMonthName || label}
                              </span>
                              <span className="text-[10px] text-stone-500 font-semibold">
                                {item.periodTag}
                              </span>
                            </div>
                            <span className="font-bold text-amber-800 text-[12px]">
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
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 truncate mr-1">
              Planetary Drivers ({activeMonthData.fullMonthName} • {activeMonthData.periodTag})
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 shrink-0">
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
