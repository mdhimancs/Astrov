import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  Shield,
  Award,
  Flame,
  Layers,
  Heart,
  Baby,
  Building2,
  Home,
  Briefcase,
  Globe,
  Activity,
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Scale,
  TrendingUp,
  BookOpen,
  Eye,
  Info,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  ArrowRightLeft,
  Moon,
} from 'lucide-react';
import { UserProfile, PlanetPosition, HouseInfo } from '../types';
import { NorthIndianChart } from './NorthIndianChart';
import { DailyMoonTransitGuidance } from './DailyMoonTransitGuidance';
import { CurrentVimshottariEventTimingView } from './CurrentVimshottariEventTimingView';
import {
  getNorthIndianCompleteAstrologySuite,
  NorthIndianBhavaLifeAspect,
  NorthIndianYogaRecord,
  JaiminiCharaKaraka,
  LifeEpochMilestone,
} from '../utils/northIndianLifeAspects';
import { VEDIC_RASIS } from '../data';

interface NorthIndianLifeAspectsTabProps {
  activeProfile?: UserProfile;
  profiles: UserProfile[];
  natalPlanets: PlanetPosition[];
  natalHouses: HouseInfo[];
  lagnaRasi: number;
  onNavigateToGuidance?: () => void;
  onNavigateToMonthly?: () => void;
  onNavigateToDasha?: () => void;
  onNavigateToBirthCharts?: () => void;
}

export function NorthIndianLifeAspectsTab({
  activeProfile,
  profiles,
  natalPlanets,
  natalHouses,
  lagnaRasi,
  onNavigateToGuidance,
  onNavigateToMonthly,
  onNavigateToDasha,
  onNavigateToBirthCharts,
}: NorthIndianLifeAspectsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'sarva_bhavas'
    | 'classical_yogas'
    | 'jaimini_karakas'
    | 'ayurdaya_health'
    | 'life_epochs'
    | 'quick_matrix'
    | 'daily_moon'
    | 'dasha_timing'
  >('sarva_bhavas');

  const [selectedHouseNumber, setSelectedHouseNumber] = useState<number>(1);
  const [bhavaFilter, setBhavaFilter] = useState<'all' | 'kendra' | 'trikona' | 'upachaya' | 'dhana' | 'dusthana'>('all');

  const suite = useMemo(() => {
    return getNorthIndianCompleteAstrologySuite(
      natalPlanets,
      natalHouses,
      lagnaRasi,
      activeProfile?.birthDate
    );
  }, [natalPlanets, natalHouses, lagnaRasi, activeProfile?.birthDate]);

  const activeHouseAspect = useMemo(() => {
    return suite.allTwelveBhavas.find((b) => b.houseNumber === selectedHouseNumber) || suite.allTwelveBhavas[0];
  }, [suite, selectedHouseNumber]);

  const filteredBhavas = useMemo(() => {
    if (bhavaFilter === 'all') return suite.allTwelveBhavas;
    if (bhavaFilter === 'kendra') return suite.allTwelveBhavas.filter((b) => [1, 4, 7, 10].includes(b.houseNumber));
    if (bhavaFilter === 'trikona') return suite.allTwelveBhavas.filter((b) => [1, 5, 9].includes(b.houseNumber));
    if (bhavaFilter === 'upachaya') return suite.allTwelveBhavas.filter((b) => [3, 6, 10, 11].includes(b.houseNumber));
    if (bhavaFilter === 'dhana') return suite.allTwelveBhavas.filter((b) => [2, 11].includes(b.houseNumber));
    if (bhavaFilter === 'dusthana') return suite.allTwelveBhavas.filter((b) => [6, 8, 12].includes(b.houseNumber));
    return suite.allTwelveBhavas;
  }, [suite, bhavaFilter]);

  const seekerName = activeProfile?.name || 'Seeker';
  const ascendantSign = VEDIC_RASIS[lagnaRasi - 1]?.sanskritName || 'Mesha';
  const ascendantLord = VEDIC_RASIS[lagnaRasi - 1]?.lord || 'Mangal';
  const moonPlanet = natalPlanets.find((p) => p.name === 'Chandra');

  return (
    <div className="space-y-2.5 pb-8 animate-in fade-in duration-150 bg-[#F4ECE1] p-2.5 sm:p-3.5 rounded-xl border border-amber-900/20 shadow-xs break-words text-[11px]">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#2B1307] via-[#481E09] to-[#250F05] text-amber-100 rounded-xl p-3 sm:p-4 border border-amber-500/30 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                North Indian Parashari Jyotish
              </span>
              <span className="text-amber-400 text-xs">•</span>
              <span className="text-[11px] text-amber-200/90 font-medium">
                Sarva Bhava Phala Nirnaya (All 12 Life Dimensions)
              </span>
            </div>

            <h1 className="font-vedic font-black text-lg sm:text-xl text-amber-50 tracking-tight flex items-center space-x-2">
              <span>Complete Life Aspects &amp; Predictions</span>
            </h1>

            <p className="text-[11px] text-amber-200/80 max-w-2xl leading-relaxed">
              Classical North Indian Parashari, Jaimini &amp; Bhrigu calculations covering every dimension of existence:
              health, wealth, siblings, property, intellect, children, litigation, marriage, longevity, fortune, career &amp; foreign settlement for{' '}
              <span className="font-semibold text-amber-300">{seekerName}</span> (Lagna: {ascendantSign}, Lord: {ascendantLord}, Moon: {moonPlanet?.rasiName || 'Karka'}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
            {onNavigateToMonthly && (
              <button
                onClick={onNavigateToMonthly}
                className="px-2.5 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-[11px] border border-amber-600/40 transition-colors flex items-center space-x-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Monthly Predictions</span>
              </button>
            )}
            {onNavigateToGuidance && (
              <button
                onClick={onNavigateToGuidance}
                className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-medium shadow-xs transition-colors flex items-center space-x-1"
              >
                <span>Guidance &amp; Business</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Life Vital KPI Badges */}
        <div className="mt-3 pt-2.5 border-t border-amber-800/40 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px]">
          <div className="bg-amber-950/40 rounded p-1.5 border border-amber-700/30">
            <span className="text-amber-400/80 block uppercase text-[9px] font-semibold">Longevity (Ayurdaya)</span>
            <span className="text-amber-100 font-bold block truncate">{suite.ayurdayaHealth.longevityCategory.split(' ')[0]}</span>
          </div>
          <div className="bg-amber-950/40 rounded p-1.5 border border-amber-700/30">
            <span className="text-amber-400/80 block uppercase text-[9px] font-semibold">Prana Shakti (Vitality)</span>
            <span className="text-emerald-300 font-bold block">{suite.ayurdayaHealth.pranaShaktiScore}% (Strong)</span>
          </div>
          <div className="bg-amber-950/40 rounded p-1.5 border border-amber-700/30">
            <span className="text-amber-400/80 block uppercase text-[9px] font-semibold">Dhana Capacity</span>
            <span className="text-amber-200 font-bold block truncate">{suite.generalSynthesis.dhanaCapacityRating.split(' ')[0]} Tier</span>
          </div>
          <div className="bg-amber-950/40 rounded p-1.5 border border-amber-700/30">
            <span className="text-amber-400/80 block uppercase text-[9px] font-semibold">Career Zenith</span>
            <span className="text-amber-200 font-bold block truncate">{suite.allTwelveBhavas[9].verdict.split(' ')[0]}</span>
          </div>
          <div className="bg-amber-950/40 rounded p-1.5 border border-amber-700/30">
            <span className="text-amber-400/80 block uppercase text-[9px] font-semibold">Marital Destiny</span>
            <span className="text-amber-200 font-bold block truncate">{suite.allTwelveBhavas[6].verdict.split(' ')[0]}</span>
          </div>
          <div className="bg-amber-950/40 rounded p-1.5 border border-amber-700/30">
            <span className="text-amber-400/80 block uppercase text-[9px] font-semibold">Dharmic Grace (9th)</span>
            <span className="text-amber-200 font-bold block">{suite.allTwelveBhavas[8].strengthScore}% Blessed</span>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-[#E8DEC8] p-1 rounded-lg border border-amber-900/10 text-[11px]">
        {[
          { id: 'sarva_bhavas' as const, label: '12 Bhavas Life Spectrum (Sarva Phala)', icon: Compass },
          { id: 'daily_moon' as const, label: 'Daily Moon Guidance', icon: Moon },
          { id: 'dasha_timing' as const, label: 'Dasha Event Timing', icon: Clock },
          { id: 'classical_yogas' as const, label: 'Raja Yogas & Doshas', icon: Award },
          { id: 'jaimini_karakas' as const, label: 'Jaimini Chara Karakas (Soul Blueprint)', icon: Sparkles },
          { id: 'ayurdaya_health' as const, label: 'Ayurdaya & Health Vitality', icon: Activity },
          { id: 'life_epochs' as const, label: 'Life Epochs (5 Ages)', icon: Clock },
          { id: 'quick_matrix' as const, label: 'All-Aspects Diagnostic Matrix', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-amber-800 text-amber-50 shadow-xs'
                  : 'text-stone-700 hover:bg-amber-100/60 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: 12 BHAVAS SARVA PHALA NIRNAYA */}
      {activeSubTab === 'sarva_bhavas' && (
        <div className="space-y-2.5">
          {/* North Indian Kundali Interactive Chart + House Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
            {/* North Indian Diamond Chart (Left: 5 cols) */}
            <div className="lg:col-span-5 bg-[#FAF6EE] p-2.5 rounded-xl border border-amber-900/20 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-amber-900/10 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-amber-800" />
                  <span className="font-vedic font-bold text-[12.5px] text-amber-950">
                    North Indian Kundali
                  </span>
                </div>
                <span className="text-[10px] text-stone-600 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                  Click any house to inspect
                </span>
              </div>

              <div className="flex justify-center py-1">
                <NorthIndianChart
                  houses={natalHouses}
                  onSelectHouse={(h) => setSelectedHouseNumber(h.houseNumber)}
                  selectedHouseNumber={selectedHouseNumber}
                />
              </div>

              <div className="bg-amber-50/70 p-2 rounded border border-amber-200 text-[10px] text-stone-700 space-y-1">
                <div className="flex justify-between items-center font-semibold text-amber-950">
                  <span>Selected: House {selectedHouseNumber}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    {activeHouseAspect.rasiName} ({activeHouseAspect.signLord})
                  </span>
                </div>
                <p className="line-clamp-2 text-stone-600 leading-tight">
                  {activeHouseAspect.englishTitle}
                </p>
              </div>
            </div>

            {/* Selected House Deep Dossier (Right: 7 cols) */}
            <div className="lg:col-span-7 bg-[#FAF6EE] p-3 rounded-xl border border-amber-900/20 shadow-2xs space-y-2.5">
              {/* House Header */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-900/15 pb-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded bg-amber-800 text-amber-50 text-[10px] font-bold">
                      House {activeHouseAspect.houseNumber}
                    </span>
                    <span className="font-vedic font-black text-[13.5px] text-amber-950">
                      {activeHouseAspect.sanskritName}
                    </span>
                  </div>
                  <h2 className="text-[12px] font-semibold text-stone-800">
                    {activeHouseAspect.englishTitle}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${activeHouseAspect.classification.badgeStyle}`}>
                    {activeHouseAspect.classification.type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                    Score: {activeHouseAspect.strengthScore}%
                  </span>
                </div>
              </div>

              {/* Astrological Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                <div className="bg-white/80 p-1.5 rounded border border-amber-900/10">
                  <span className="text-stone-500 block">Sign &amp; Lord</span>
                  <span className="font-semibold text-amber-950">
                    {activeHouseAspect.rasiName} ({activeHouseAspect.signLord})
                  </span>
                </div>
                <div className="bg-white/80 p-1.5 rounded border border-amber-900/10">
                  <span className="text-stone-500 block">Lord Placement</span>
                  <span className="font-semibold text-stone-800">
                    H{activeHouseAspect.bhaveshaPlacement.house} ({activeHouseAspect.bhaveshaPlacement.dignity})
                  </span>
                </div>
                <div className="bg-white/80 p-1.5 rounded border border-amber-900/10">
                  <span className="text-stone-500 block">Natural Karaka</span>
                  <span className="font-semibold text-stone-800">
                    {activeHouseAspect.naturalKaraka.planet} ({activeHouseAspect.naturalKaraka.status})
                  </span>
                </div>
                <div className="bg-white/80 p-1.5 rounded border border-amber-900/10">
                  <span className="text-stone-500 block">SAV Bindu Points</span>
                  <span className="font-semibold text-emerald-800">
                    {activeHouseAspect.ashtakavargaBindus.points} / 337 Bindus
                  </span>
                </div>
              </div>

              {/* Resident Grahas & Incoming Parashari Drishtis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white/70 p-2 rounded border border-amber-900/10 space-y-1">
                  <span className="font-bold text-amber-950 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Occupying Grahas (Planets in House)</span>
                  </span>
                  {activeHouseAspect.planetsInHouse.length > 0 ? (
                    <div className="space-y-1">
                      {activeHouseAspect.planetsInHouse.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-stone-700">
                          <span className="font-semibold text-amber-900">{p.symbol} {p.name}</span>
                          <span>{p.degree}° ({p.dignity}, {p.nakshatra})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">No resident planets (Shunya Bhava). Governed purely by sign lord &amp; incoming aspects.</p>
                  )}
                </div>

                <div className="bg-white/70 p-2 rounded border border-amber-900/10 space-y-1">
                  <span className="font-bold text-amber-950 flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-indigo-700" />
                    <span>Parashari Aspects (Drishti on House)</span>
                  </span>
                  {activeHouseAspect.aspectingPlanets.length > 0 ? (
                    <div className="space-y-1">
                      {activeHouseAspect.aspectingPlanets.map((a, i) => (
                        <div key={i} className="flex justify-between items-center text-stone-700">
                          <span className={`font-semibold ${a.isBenefic ? 'text-emerald-800' : 'text-stone-900'}`}>
                            {a.symbol} {a.planet}
                          </span>
                          <span className="text-[9px] text-stone-600 truncate max-w-[130px]">{a.aspectType}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500 italic">No direct major aspects cast upon this house.</p>
                  )}
                </div>
              </div>

              {/* Bhavat Bhavam Secondary Generator */}
              <div className="bg-amber-100/50 p-2 rounded border border-amber-300 text-[10px] text-amber-950 flex items-start space-x-1.5">
                <Info className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Bhavat Bhavam Harmonic: </span>
                  <span>{activeHouseAspect.bhavatBhavam.secondaryHouseName}. {activeHouseAspect.bhavatBhavam.principleExplanation}</span>
                </div>
              </div>

              {/* Core Classical Prediction */}
              <div className="space-y-1.5 pt-1">
                <span className="font-vedic font-bold text-[12px] text-amber-950 block">
                  Classical North Indian Reading &amp; Lifelong Destiny
                </span>
                <p className="text-stone-800 leading-relaxed bg-white/90 p-2.5 rounded-lg border border-amber-900/10 shadow-2xs">
                  {activeHouseAspect.predictions.coreReading}
                </p>
                <p className="text-stone-700 leading-relaxed bg-amber-50/50 p-2 rounded border border-amber-200/60">
                  <span className="font-semibold text-amber-950">Lifelong Impact: </span>
                  {activeHouseAspect.predictions.lifelongImpact}
                </p>
              </div>

              {/* Concrete Life Manifestations */}
              <div className="space-y-1">
                <span className="font-bold text-[11.5px] text-amber-950 block">
                  Key Manifestations in Your Life
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeHouseAspect.predictions.concreteManifestations.map((m, i) => (
                    <div key={i} className="flex items-start space-x-1.5 bg-white/80 p-1.5 rounded border border-emerald-900/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="text-stone-800 leading-tight">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing & Dashas */}
              <div className="bg-amber-100/60 p-2 rounded border border-amber-300 text-[10.5px] space-y-0.5">
                <span className="font-bold text-amber-950 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  <span>Activation Timeline &amp; Dasha Triggers</span>
                </span>
                <p className="text-stone-800">{activeHouseAspect.predictions.timingAndDashas}</p>
              </div>

              {/* Parashari Protective Measures & Classical Remedies */}
              <div className="bg-[#FAF2E1] p-2.5 rounded-lg border border-amber-800/30 space-y-1.5">
                <span className="font-vedic font-bold text-[12px] text-amber-950 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-800" />
                  <span>Parashari Remedial Measures (Upay)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-semibold text-stone-600 block">Sacred Mantra:</span>
                    <span className="text-amber-950 font-medium">{activeHouseAspect.predictions.vedicRemedy.mantra}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Charity &amp; Seva:</span>
                    <span className="text-stone-800">{activeHouseAspect.predictions.vedicRemedy.deityOrDonation}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Yantra &amp; Energy:</span>
                    <span className="text-stone-800">{activeHouseAspect.predictions.vedicRemedy.gemstoneOrYantra}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-600 block">Daily Discipline:</span>
                    <span className="text-stone-800">{activeHouseAspect.predictions.vedicRemedy.dailyPractice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 12 Bhava Selector Strip */}
          <div className="bg-[#FAF6EE] p-2.5 rounded-xl border border-amber-900/20 shadow-2xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="font-vedic font-bold text-[12.5px] text-amber-950">
                Browse All 12 Houses (Bhavas)
              </span>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                {[
                  { id: 'all' as const, label: 'All 12' },
                  { id: 'kendra' as const, label: 'Kendras (1, 4, 7, 10)' },
                  { id: 'trikona' as const, label: 'Trikonas (1, 5, 9)' },
                  { id: 'upachaya' as const, label: 'Upachaya (3, 6, 10, 11)' },
                  { id: 'dhana' as const, label: 'Dhana (2, 11)' },
                  { id: 'dusthana' as const, label: 'Dusthana (6, 8, 12)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBhavaFilter(f.id)}
                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                      bhavaFilter === f.id
                        ? 'bg-amber-800 text-white'
                        : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-[10px]">
              {filteredBhavas.map((bhava) => {
                const isSelected = bhava.houseNumber === selectedHouseNumber;
                return (
                  <button
                    key={bhava.houseNumber}
                    onClick={() => setSelectedHouseNumber(bhava.houseNumber)}
                    className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-800 text-amber-50 border-amber-950 shadow-xs ring-2 ring-amber-600/40'
                        : 'bg-white hover:bg-amber-50 text-stone-800 border-amber-900/10'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                          isSelected ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-900'
                        }`}>
                          H{bhava.houseNumber}
                        </span>
                        <span className="font-bold text-[9px]">{bhava.strengthScore}%</span>
                      </div>
                      <span className="font-semibold block truncate text-[10.5px]">
                        {bhava.sanskritName.split(' ')[0]}
                      </span>
                      <p className={`line-clamp-2 text-[9.5px] leading-tight ${isSelected ? 'text-amber-200' : 'text-stone-600'}`}>
                        {bhava.englishTitle.split(',')[0]}
                      </p>
                    </div>

                    <div className="mt-1 pt-1 border-t border-amber-900/10 flex justify-between items-center text-[9px]">
                      <span>{bhava.rasiName}</span>
                      <span className="truncate max-w-[50px]">{bhava.signLord}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLASSICAL RAJA YOGAS & DOSHAS */}
      {activeSubTab === 'classical_yogas' && (
        <div className="space-y-2.5">
          <div className="bg-[#FAF6EE] p-3 rounded-xl border border-amber-900/20 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 border-b border-amber-900/10 pb-1.5">
              <Award className="w-4 h-4 text-amber-800" />
              <h2 className="font-vedic font-bold text-[13px] text-amber-950">
                Classical North Indian Yogas &amp; Remedial Dosha Engine
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              Parashari Kendra-Trikona lord interactions, Pancha Mahapurusha planetary blessings, Dhana yogas, and authentic
              Parashari dosha cancellations for {seekerName}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {suite.classicalYogas.map((yoga) => {
                const isDosha = yoga.isDosha;
                return (
                  <div
                    key={yoga.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isDosha
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-white border-amber-900/15 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="space-y-0.5">
                        <span className="font-vedic font-black text-[12.5px] text-amber-950">
                          {yoga.name}
                        </span>
                        <span className="text-[10px] text-stone-500 block">{yoga.sanskritName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDosha
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {yoga.category}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-stone-700 leading-snug mb-1.5">
                      {yoga.description}
                    </p>

                    <div className="bg-amber-50/80 p-2 rounded border border-amber-200 text-[10.5px] space-y-0.5">
                      <span className="font-bold text-amber-950 block">Life Result:</span>
                      <p className="text-stone-800 leading-snug">{yoga.lifeResult}</p>
                    </div>

                    {yoga.cancellationNote && (
                      <div className="mt-1.5 bg-emerald-50 p-1.5 rounded border border-emerald-200 text-[10px] text-emerald-900">
                        <span className="font-bold">Cancellation Rule: </span>
                        <span>{yoga.cancellationNote}</span>
                      </div>
                    )}

                    {yoga.remedy && (
                      <div className="mt-1.5 bg-amber-100/70 p-1.5 rounded border border-amber-300 text-[10px] text-amber-950">
                        <span className="font-bold">Vedic Remedy: </span>
                        <span>{yoga.remedy}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: JAIMINI CHARA KARAKAS (SOUL BLUEPRINT) */}
      {activeSubTab === 'jaimini_karakas' && (
        <div className="space-y-2.5">
          <div className="bg-[#FAF6EE] p-3 rounded-xl border border-amber-900/20 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 border-b border-amber-900/10 pb-1.5">
              <Sparkles className="w-4 h-4 text-amber-800" />
              <h2 className="font-vedic font-bold text-[13px] text-amber-950">
                Jaimini Chara Karaka System (Soul &amp; Life Blueprint)
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              In Maharishi Jaimini’s Upadesha Sutras, the 7 physical grahas are ranked by longitude within their signs to reveal
              the direct archetypes of the soul: from the Atmakaraka (King of Soul) to Darakaraka (Spouse).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {suite.jaiminiKarakas.map((karaka) => (
                <div key={karaka.karakaName} className="bg-white p-2.5 rounded-xl border border-amber-900/15 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between border-b border-amber-900/10 pb-1">
                    <div>
                      <span className="font-vedic font-bold text-[12px] text-amber-950">
                        {karaka.karakaName}
                      </span>
                      <span className="text-[10px] text-stone-500 block">{karaka.sanskritTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-900 text-[11px]">
                        {karaka.symbol} {karaka.graha}
                      </span>
                      <span className="text-[9.5px] text-stone-600 block">
                        {karaka.degreeInSign}° in {karaka.rasiName} (H{karaka.house})
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-600 italic">
                    {karaka.significance}
                  </p>

                  <div className="bg-amber-50/70 p-2 rounded border border-amber-200 text-[10.5px]">
                    <span className="font-semibold text-amber-950 block">Soul Mission &amp; Manifestation:</span>
                    <p className="text-stone-800 leading-snug">{karaka.soulMissionAndLifeManifestation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AYURDAYA & HEALTH VITALITY */}
      {activeSubTab === 'ayurdaya_health' && (
        <div className="space-y-2.5">
          <div className="bg-[#FAF6EE] p-3 rounded-xl border border-amber-900/20 shadow-2xs space-y-2.5">
            <div className="flex items-center space-x-2 border-b border-amber-900/10 pb-1.5">
              <Activity className="w-4 h-4 text-emerald-800" />
              <h2 className="font-vedic font-bold text-[13px] text-amber-950">
                Ayurdaya (Longevity) &amp; Health Constitution (Prana Shakti)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-white p-2.5 rounded-lg border border-amber-900/10 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold uppercase block">Longevity Category</span>
                <span className="text-[12px] font-bold text-emerald-900 block">{suite.ayurdayaHealth.longevityCategory}</span>
                <p className="text-[10px] text-stone-600">Calculated via the classical Parashari 3-Pairs Method.</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-900/10 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold uppercase block">Prana Shakti (Vitality Index)</span>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${suite.ayurdayaHealth.pranaShaktiScore}%` }} />
                  </div>
                  <span className="font-bold text-emerald-800 text-[11px]">{suite.ayurdayaHealth.pranaShaktiScore}%</span>
                </div>
                <p className="text-[10px] text-stone-600">High cellular regeneration stamina.</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-900/10 shadow-2xs space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold uppercase block">Ayurvedic Constitution</span>
                <span className="text-[12px] font-bold text-amber-900 block">{suite.ayurdayaHealth.ayurvedicDoshaConstitution.primary}</span>
                <p className="text-[10px] text-stone-600 truncate">{suite.ayurdayaHealth.ayurvedicDoshaConstitution.characteristics}</p>
              </div>
            </div>

            {/* Ayurvedic Diet & Vulnerable Organs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-900/10 space-y-1">
                <span className="font-bold text-amber-950 block">Constitutional Health Tendencies:</span>
                <div className="flex flex-wrap gap-1">
                  {suite.ayurdayaHealth.ayurvedicDoshaConstitution.vulnerableOrgans.map((org, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-medium">
                      {org}
                    </span>
                  ))}
                </div>
                <p className="text-stone-700 leading-snug mt-1">
                  <span className="font-semibold">Ayurvedic Diet: </span>
                  {suite.ayurdayaHealth.ayurvedicDoshaConstitution.dietaryGuidance}
                </p>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-900/10 space-y-1">
                <span className="font-bold text-amber-950 block">Protective Astrological Shields:</span>
                <ul className="space-y-1 text-stone-700">
                  {suite.ayurdayaHealth.protectiveFactors.map((f, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: LIFE EPOCHS & 5 AGES */}
      {activeSubTab === 'life_epochs' && (
        <div className="space-y-2.5">
          <div className="bg-[#FAF6EE] p-3 rounded-xl border border-amber-900/20 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 border-b border-amber-900/10 pb-1.5">
              <Clock className="w-4 h-4 text-amber-800" />
              <h2 className="font-vedic font-bold text-[13px] text-amber-950">
                5 Life Epochs &amp; Astrological Age Progression
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              How the 12 Bhavas awaken sequentially across the human lifespan according to classical Bhrigu &amp; Parashari principles.
            </p>

            <div className="space-y-2 pt-1">
              {suite.lifeEpochs.map((epoch) => (
                <div key={epoch.epochNumber} className="bg-white p-3 rounded-xl border border-amber-900/15 shadow-2xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-amber-900/10 pb-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-amber-800 text-white text-[10px] font-bold">
                        {epoch.ageRange}
                      </span>
                      <span className="font-vedic font-bold text-[12.5px] text-amber-950">
                        {epoch.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium">{epoch.sanskritName}</span>
                  </div>

                  <p className="text-[11px] text-stone-800 leading-snug">
                    <span className="font-semibold text-amber-950">Governing Theme: </span>
                    {epoch.rulingLifeTheme} (Active Bhavas: {epoch.activatedBhavas.map((h) => `H${h}`).join(', ')})
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                    {epoch.concretePredictions.map((pred, i) => (
                      <div key={i} className="bg-amber-50/70 p-1.5 rounded border border-amber-200 text-stone-800">
                        • {pred}
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-100/60 p-1.5 rounded border border-amber-300 text-[10px] text-amber-950">
                    <span className="font-bold">Golden Life Advice: </span>
                    <span>{epoch.keyAdvice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ALL-ASPECTS DIAGNOSTIC MATRIX */}
      {activeSubTab === 'quick_matrix' && (
        <div className="space-y-2.5">
          <div className="bg-[#FAF6EE] p-3 rounded-xl border border-amber-900/20 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-1.5">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-amber-800" />
                <h2 className="font-vedic font-bold text-[13px] text-amber-950">
                  Quick Diagnostic Matrix (All 12 Life Spheres)
                </h2>
              </div>
              <span className="text-[10px] text-stone-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                12-in-1 Comprehensive Overview
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10.5px] border-collapse">
                <thead>
                  <tr className="bg-amber-900/10 text-amber-950 font-bold border-b border-amber-900/20">
                    <th className="p-1.5">House</th>
                    <th className="p-1.5">Life Dimension</th>
                    <th className="p-1.5">Sign &amp; Lord</th>
                    <th className="p-1.5">Placement</th>
                    <th className="p-1.5">Strength</th>
                    <th className="p-1.5">Status</th>
                    <th className="p-1.5">Prime Manifestation</th>
                    <th className="p-1.5">Peak Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 text-stone-800">
                  {suite.quickSummaryTable.map((row) => (
                    <tr
                      key={row.houseNumber}
                      onClick={() => {
                        setSelectedHouseNumber(row.houseNumber);
                        setActiveSubTab('sarva_bhavas');
                      }}
                      className="hover:bg-amber-100/50 cursor-pointer transition-colors"
                    >
                      <td className="p-1.5 font-bold text-amber-900">H{row.houseNumber}</td>
                      <td className="p-1.5 font-medium">{row.lifeDomain}</td>
                      <td className="p-1.5 text-stone-600">{row.rulingSign}</td>
                      <td className="p-1.5">{row.lordPlacement}</td>
                      <td className="p-1.5">
                        <span className="font-bold text-emerald-800">{row.strengthScore}%</span>
                      </td>
                      <td className="p-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-950 text-[9.5px] font-semibold">
                          {row.verdict}
                        </span>
                      </td>
                      <td className="p-1.5 text-stone-700 max-w-[220px] truncate" title={row.predictionHighlight}>
                        {row.predictionHighlight}
                      </td>
                      <td className="p-1.5 text-stone-600 max-w-[150px] truncate" title={row.peakActivationTiming}>
                        {row.peakActivationTiming}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-stone-500 italic text-right">
              * Click any row to inspect the full classical dossier for that house.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB: DAILY MOON TRANSIT GUIDANCE */}
      {activeSubTab === 'daily_moon' && (
        <div className="space-y-4">
          <div className="bg-amber-900/90 text-amber-50 p-2.5 rounded border border-amber-800 text-[11px] flex items-center justify-between">
            <span className="font-serif font-bold text-amber-200">
              Chandra Gochar (Moon Transit) & Daily Emotional Pulse
            </span>
            <span className="text-[10px] text-amber-300">Sidereal Parashari Calculation from Janma Rasi</span>
          </div>
          <DailyMoonTransitGuidance
            activeProfile={activeProfile}
            natalPlanets={natalPlanets}
            natalLagnaRasi={lagnaRasi}
            onNavigateToDasha={onNavigateToDasha}
          />
        </div>
      )}

      {/* SUB-TAB: VIMSHOTTARI DASHA EVENT TIMING */}
      {activeSubTab === 'dasha_timing' && (
        <div className="space-y-4">
          <div className="bg-amber-900/90 text-amber-50 p-2.5 rounded border border-amber-800 text-[11px] flex items-center justify-between">
            <span className="font-serif font-bold text-amber-200">
              Vimshottari Dasha Event Timing Pulse (Mahadasha & Antardasha Matrix)
            </span>
            <span className="text-[10px] text-amber-300">120-Year Sidereal Parashari Cycle</span>
          </div>
          <CurrentVimshottariEventTimingView
            activeProfile={activeProfile}
            natalPlanets={natalPlanets}
            natalHouses={natalHouses}
            lagnaRasi={lagnaRasi}
            onNavigateToFullDasha={onNavigateToDasha}
            onNavigateToMonthWise={onNavigateToMonthly}
          />
        </div>
      )}
    </div>
  );
}

