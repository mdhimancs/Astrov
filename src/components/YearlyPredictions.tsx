import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Briefcase,
  TrendingUp,
  Heart,
  Activity,
  GraduationCap,
  Brain,
  Compass,
  Award,
  ShieldCheck,
  Layers,
  Loader2,
  CheckCircle2,
  Flame,
  Star,
} from 'lucide-react';
import { YearlyPrediction, PlanetPosition } from '../types';
import { VEDIC_RASIS } from '../data';

interface YearlyPredictionsProps {
  yearlyPredictions: YearlyPrediction[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  userName: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  natalLagnaRasi?: number;
  natalMoonRasi?: number;
  natalNakshatra?: string;
  natalPlanets?: PlanetPosition[];
}

interface AiYearlyLifePathResponse {
  destinyHeadline: string;
  lifePathOverview: string;
  careerWealthTrajectory: string;
  relationshipsFamilyPath: string;
  spiritualKarmicLesson: string;
  keyMilestones: string[];
}

export function YearlyPredictions({
  yearlyPredictions,
  selectedYear,
  onSelectYear,
  userName,
  birthDate = '1990-05-18',
  birthTime = '07:30',
  birthPlace = 'New Delhi, India',
  natalLagnaRasi = 3,
  natalMoonRasi = 5,
  natalNakshatra = 'Magha',
  natalPlanets = [],
}: YearlyPredictionsProps) {
  const [activeSubView, setActiveSubView] = useState<'all' | 'lifepath' | 'pillars'>('all');
  const [aiLifePath, setAiLifePath] = useState<AiYearlyLifePathResponse | null>(null);
  const [isLoadingAiLifePath, setIsLoadingAiLifePath] = useState(false);
  const [aiLifePathError, setAiLifePathError] = useState<string | null>(null);

  if (!yearlyPredictions || yearlyPredictions.length === 0) return null;

  const currentYearPred =
    yearlyPredictions.find((y) => y.year === selectedYear) ||
    yearlyPredictions[1] ||
    yearlyPredictions[0];

  const lifePath = currentYearPred.lifePathSynthesis;
  const lagnaName = VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName || 'Mithuna';
  const moonName = VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName || 'Simha';

  // Reset AI synthesis when year or user changes
  useEffect(() => {
    setAiLifePath(null);
    setAiLifePathError(null);
  }, [currentYearPred.year, userName, birthDate]);

  const handleGenerateAiLifePath = async () => {
    setIsLoadingAiLifePath(true);
    setAiLifePathError(null);
    try {
      const natalSummary = natalPlanets
        .filter((p) => p.name !== 'Lagna')
        .map((p) => ({
          planet: p.name,
          englishName: p.englishName,
          rasi: p.rasiName,
          house: p.house,
          nakshatra: p.nakshatra,
        }));

      const res = await fetch('/api/astrology/yearly-lifepath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          birthDate,
          birthTime,
          birthPlace,
          year: currentYearPred.year,
          ageInYear: currentYearPred.ageInYear,
          lagnaRasi: lagnaName,
          moonRasi: moonName,
          nakshatra: natalNakshatra,
          munthaRasi: currentYearPred.munthaRasi,
          munthaHouse: currentYearPred.munthaHouse,
          varsheshwara: currentYearPred.varsheshwara,
          progressedHouse: lifePath.progressedHouse,
          progressedRasi: lifePath.progressedRasi,
          doubleTransitHouses: lifePath.doubleTransitHouses,
          natalSummary,
          annualTransits: currentYearPred.majorTransitsSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate yearly life-path forecast');
      }
      setAiLifePath(data);
    } catch (err: any) {
      setAiLifePathError(
        err.message || 'Unable to generate AI life-path forecast right now. Showing Vedic calculation below.'
      );
    } finally {
      setIsLoadingAiLifePath(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs overflow-hidden">
      {/* Top Header & Year Selector Bar */}
      <div className="px-2.5 py-2 bg-gradient-to-r from-amber-50/80 via-[#FAF8F5] to-white border-b border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-700" />
            <h3 className="font-vedic font-black text-stone-950 text-[14px] uppercase tracking-wider leading-tight">
              Yearly Forecast &amp; Life-Path Module (Varshaphal &amp; Natal-Transit Synthesis) — {userName}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-950 border border-amber-300 text-[11px] font-bold">
            Age {currentYearPred.ageInYear} in {currentYearPred.year}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-Module Lens Deck of Cards */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all', label: 'Complete Forecast' },
              { id: 'lifepath', label: 'Life-Path & Birth Chart' },
              { id: 'pillars', label: '6 Pillars & Quarters' },
            ].map((mode) => {
              const isActive = activeSubView === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setActiveSubView(mode.id as any)}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {mode.label}
                </div>
              );
            })}
          </div>

          {/* Year Selection Deck of Cards */}
          <div className="flex items-center gap-1 shrink-0">
            {yearlyPredictions.map((yp) => {
              const isSelected = yp.year === currentYearPred.year;
              return (
                <div
                  key={yp.year}
                  onClick={() => onSelectYear(yp.year)}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {yp.year}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Yearly Dossier Content */}
      <div className="p-2.5 space-y-2.5">
        {/* Year Headline, Muntha Vitals & Rating */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-vedic font-black text-stone-950 text-[17px] tracking-tight">
                {currentYearPred.year} Annual Horoscope — {currentYearPred.themeTitle}
              </span>
              <span className="text-amber-500 text-[14px] font-bold">
                {'★'.repeat(currentYearPred.overallRating)}
              </span>
            </div>
            <p className="text-[13px] text-stone-700 leading-snug">
              {currentYearPred.munthaEffect}
            </p>
          </div>

          {/* Tajika Varshaphal & Natal Vitals Badges */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[12px]">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200 font-bold">
              Muntha: {currentYearPred.munthaRasi} (H{currentYearPred.munthaHouse})
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-950 border border-purple-200 font-bold">
              Varsheshwara: {currentYearPred.varsheshwara}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-200 font-bold">
              Progressed H{lifePath.progressedHouse}: {lifePath.progressedRasi}
            </span>
          </div>
        </div>

        {/* =====================================================================
            NEW YEARLY LIFE-PATH FORECAST MODULE (TRANSITS × BIRTH CHART DATA)
            ===================================================================== */}
        {(activeSubView === 'all' || activeSubView === 'lifepath') && (
          <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-amber-50/30 rounded-lg border border-amber-200/90 p-2.5 space-y-2.5 shadow-3xs">
            {/* Module Header + AI Synthesis Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <h4 className="font-vedic font-black text-stone-950 text-[14px] uppercase tracking-wider">
                    {currentYearPred.year} Comprehensive Life-Path Forecast (Birth Chart × Transits)
                  </h4>
                </div>
                <p className="text-[12px] text-stone-600 font-medium">
                  Synthesizes Natal Lagna ({lagnaName}), Janma Rashi ({moonName}), Bhrigu Age {currentYearPred.ageInYear} Progression, and Guru–Shani Double-Transit
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiLifePath}
                disabled={isLoadingAiLifePath}
                className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[12px] font-bold py-1.5 px-3 rounded transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
              >
                {isLoadingAiLifePath ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Synthesizing {currentYearPred.year} Life-Path...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Life-Path Synthesis ({currentYearPred.year})</span>
                  </>
                )}
              </button>
            </div>

            {aiLifePathError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] px-2.5 py-1.5 rounded">
                {aiLifePathError}
              </div>
            )}

            {/* AI-Generated Life-Path Dossier (When Triggered) */}
            {aiLifePath && (
              <div className="bg-amber-50/70 border border-amber-300 rounded-md p-2.5 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-1">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-vedic font-black text-amber-950 text-[14px]">
                      {aiLifePath.destinyHeadline}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-950">
                    AI Natal-Transit Context
                  </span>
                </div>

                <p className="text-[13px] text-stone-900 leading-snug">
                  {aiLifePath.lifePathOverview}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-white/90 rounded p-2 border border-amber-200/80 space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                      Career &amp; Wealth Trajectory
                    </span>
                    <p className="text-[12px] text-stone-800 leading-snug">
                      {aiLifePath.careerWealthTrajectory}
                    </p>
                  </div>
                  <div className="bg-white/90 rounded p-2 border border-amber-200/80 space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 block">
                      Relationships &amp; Family Path
                    </span>
                    <p className="text-[12px] text-stone-800 leading-snug">
                      {aiLifePath.relationshipsFamilyPath}
                    </p>
                  </div>
                  <div className="bg-white/90 rounded p-2 border border-amber-200/80 space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
                      Spiritual &amp; Karmic Lesson
                    </span>
                    <p className="text-[12px] text-stone-800 leading-snug">
                      {aiLifePath.spiritualKarmicLesson}
                    </p>
                  </div>
                </div>

                {aiLifePath.keyMilestones && aiLifePath.keyMilestones.length > 0 && (
                  <div className="bg-white/90 rounded p-2 border border-amber-200/80 space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 block">
                      Key {currentYearPred.year} Life-Path Milestones &amp; Directives
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                      {aiLifePath.keyMilestones.map((ms, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-[12px] text-stone-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="leading-snug">{ms}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Core Life-Path Narrative & Double-Transit Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <div className="lg:col-span-2 bg-white rounded-md p-2.5 border border-stone-200/90 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    Bhrigu / Sudarshana Progression &amp; Natal Activation
                  </span>
                  <span className="text-[11px] font-bold text-stone-600">
                    Progressed Lord: <strong className="text-stone-900">{lifePath.progressedLord}</strong>
                  </span>
                </div>
                <div className="font-vedic font-bold text-stone-950 text-[14px]">
                  {lifePath.lifePathHeadline}
                </div>
                <p className="text-[13px] text-stone-800 leading-snug">
                  {lifePath.lifePathNarrative}
                </p>
              </div>

              {/* 4-Dimension Purushartha Alignment Scorecard */}
              <div className="bg-white rounded-md p-2.5 border border-stone-200/90 space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 block">
                  {currentYearPred.year} Life-Path Alignment Index
                </span>
                {[
                  {
                    label: 'Dharma (Purpose & Luck)',
                    score: lifePath.lifePathScorecard?.dharmaAlignment ?? 88,
                    barColor: 'bg-amber-600',
                  },
                  {
                    label: 'Artha (Career & Wealth)',
                    score: lifePath.lifePathScorecard?.arthaMomentum ?? 85,
                    barColor: 'bg-emerald-600',
                  },
                  {
                    label: 'Kama (Relationships & Goals)',
                    score: lifePath.lifePathScorecard?.kamaHarmony ?? 82,
                    barColor: 'bg-rose-600',
                  },
                  {
                    label: 'Moksha (Inner Mastery)',
                    score: lifePath.lifePathScorecard?.mokshaClarity ?? 86,
                    barColor: 'bg-purple-600',
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-800">
                      <span>{item.label}</span>
                      <span className="font-black text-stone-950">{item.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.barColor} rounded-full`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chatur-Purushartha Matrix (Dharma, Artha, Kama, Moksha) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                {
                  title: 'Dharma (H1 • H5 • H9)',
                  subtitle: 'Life Purpose & Fortune',
                  text: lifePath.purusharthaMatrix.dharma,
                  badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
                },
                {
                  title: 'Artha (H2 • H6 • H10)',
                  subtitle: 'Material Rise & Vocation',
                  text: lifePath.purusharthaMatrix.artha,
                  badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                },
                {
                  title: 'Kama (H3 • H7 • H11)',
                  subtitle: 'Alliances & Desires',
                  text: lifePath.purusharthaMatrix.kama,
                  badgeBg: 'bg-rose-50 border-rose-200 text-rose-900',
                },
                {
                  title: 'Moksha (H4 • H8 • H12)',
                  subtitle: 'Peace & Inner Awakening',
                  text: lifePath.purusharthaMatrix.moksha,
                  badgeBg: 'bg-purple-50 border-purple-200 text-purple-900',
                },
              ].map((p) => (
                <div
                  key={p.title}
                  className="bg-white rounded-md p-2 border border-stone-200/90 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${p.badgeBg}`}>
                      {p.title}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-stone-500">{p.subtitle}</div>
                  <p className="text-[12px] text-stone-800 leading-snug">{p.text}</p>
                </div>
              ))}
            </div>

            {/* Natal Birth Chart Planets Triggered by Annual Transits */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-black uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>Birth Chart Grahas Activated by {currentYearPred.year} Transits</span>
                </span>
                {lifePath.doubleTransitHouses.length > 0 && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Double-Transit Houses: {lifePath.doubleTransitHouses.map((h) => `H${h}`).join(', ')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {lifePath.triggeredNatalPlanets.map((tp, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-md p-2 border border-stone-200/90 space-y-1 shadow-3xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-vedic font-bold text-stone-950 text-[13px]">
                        {tp.planet}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                        {tp.natalPlacement}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-800">
                      {tp.transitTrigger}
                    </div>
                    <p className="text-[12px] text-stone-700 leading-snug">
                      {tp.lifePathImpact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Annual Karmic Turning Points & Life-Path Windows */}
            {lifePath.karmicTurningPoints && lifePath.karmicTurningPoints.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                <span className="text-[12px] font-black uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  <span>{currentYearPred.year} Key Life-Path Turning Points &amp; Timing Windows</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {lifePath.karmicTurningPoints.map((ktp, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-md p-2 border border-amber-200/80 space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                          {ktp.window}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {ktp.activatedHouse}
                        </span>
                      </div>
                      <div className="font-vedic font-bold text-stone-950 text-[13px]">
                        {ktp.title}
                      </div>
                      <p className="text-[12px] text-stone-700 leading-snug">
                        {ktp.guidance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Major Annual Transits (Guru, Shani, Rahu-Ketu) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-amber-50/40 rounded-md p-2 border border-amber-200/70 space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
              Guru (Jupiter) Annual Transit
            </span>
            <p className="text-[12px] text-stone-800 leading-snug">
              {currentYearPred.majorTransitsSummary.guruTransit}
            </p>
          </div>

          <div className="bg-stone-50/90 rounded-md p-2 border border-stone-200/80 space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 block">
              Shani (Saturn) Annual Transit
            </span>
            <p className="text-[12px] text-stone-800 leading-snug">
              {currentYearPred.majorTransitsSummary.shaniTransit}
            </p>
          </div>

          <div className="bg-purple-50/40 rounded-md p-2 border border-purple-200/70 space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
              Rahu–Ketu Nodal Axis
            </span>
            <p className="text-[12px] text-stone-800 leading-snug">
              {currentYearPred.majorTransitsSummary.rahuKetuTransit}
            </p>
          </div>
        </div>

        {/* 6 Core Life Pillars & Quarterly Roadmap */}
        {(activeSubView === 'all' || activeSubView === 'pillars') && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                {
                  label: 'Career & Job',
                  text: currentYearPred.pillars.careerAndJob,
                  icon: Briefcase,
                  textColor: 'text-amber-800',
                },
                {
                  label: 'Wealth & Business',
                  text: currentYearPred.pillars.wealthAndBusiness,
                  icon: TrendingUp,
                  textColor: 'text-emerald-800',
                },
                {
                  label: 'Marriage & Family',
                  text: currentYearPred.pillars.marriageAndFamily,
                  icon: Heart,
                  textColor: 'text-rose-800',
                },
                {
                  label: 'Health & Vitality',
                  text: currentYearPred.pillars.healthAndVitality,
                  icon: Activity,
                  textColor: 'text-sky-800',
                },
                {
                  label: 'Education & Intellect',
                  text: currentYearPred.pillars.educationAndIntellect,
                  icon: GraduationCap,
                  textColor: 'text-indigo-800',
                },
                {
                  label: 'Mental State & Spirit',
                  text: currentYearPred.pillars.mentalStateAndSpirit,
                  icon: Brain,
                  textColor: 'text-purple-800',
                },
              ].map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5]/80 rounded-md p-2 border border-stone-200/80 space-y-1"
                >
                  <span
                    className={`text-[12px] font-black uppercase tracking-wider ${pillar.textColor} flex items-center space-x-1.5`}
                  >
                    <pillar.icon className="w-3.5 h-3.5" />
                    <span>{pillar.label}</span>
                  </span>
                  <p className="text-[13px] text-stone-800 leading-snug">{pillar.text}</p>
                </div>
              ))}
            </div>

            {/* Quarterly Roadmap (Q1 to Q4) */}
            <div className="space-y-1 pt-1 border-t border-stone-100">
              <span className="text-[12px] font-black uppercase tracking-wider text-stone-700 block">
                {currentYearPred.year} Quarterly Progression Roadmap
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                {currentYearPred.quarterlyBreakdown.map((q) => (
                  <div
                    key={q.quarter}
                    className="bg-white rounded border border-stone-200/90 p-2 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-vedic font-bold text-stone-950 text-[13px]">
                        {q.quarter}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          q.tone === 'Peak Auspicious'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : q.tone === 'Progressive'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : q.tone === 'Caution & Discipline'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {q.tone}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-700 leading-snug">{q.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Peak Months, Caution Windows & Annual Varshaphal Upay */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-[12px]">
          <div className="bg-emerald-50/50 rounded p-2 border border-emerald-200/70">
            <strong className="text-emerald-900 uppercase tracking-wider block">
              Peak Auspicious Months ({currentYearPred.year})
            </strong>
            <span className="text-stone-800 font-semibold">{currentYearPred.bestMonths}</span>
          </div>
          <div className="bg-rose-50/50 rounded p-2 border border-rose-200/70">
            <strong className="text-rose-900 uppercase tracking-wider block">
              Mindful Caution Windows ({currentYearPred.year})
            </strong>
            <span className="text-stone-800 font-semibold">{currentYearPred.cautionMonths}</span>
          </div>
          <div className="bg-amber-50/50 rounded p-2 border border-amber-200/70">
            <strong className="text-amber-900 uppercase tracking-wider block">
              Varshaphal Remedy (Upay)
            </strong>
            <span className="text-stone-800">{currentYearPred.annualRemedy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
