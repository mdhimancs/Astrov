import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Compass,
  Award,
  Shield,
  Layers,
  BookOpen,
  Info,
  Flame,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Search,
  Scale,
  Activity,
  Heart,
  Briefcase,
  User,
  Star,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { UserProfile, PlanetPosition, HouseInfo } from '../types';
import { GRAHA_EFFECTS_DATA, GrahaDetail, GrahaHouseEffect } from '../data/planetaryEffectsData';
import { VEDIC_RASIS } from '../data';
import { NorthIndianChart } from './NorthIndianChart';

interface PlanetaryEffectsTabProps {
  activeProfile?: UserProfile;
  profiles?: UserProfile[];
  natalPlanets?: PlanetPosition[];
  natalHouses?: HouseInfo[];
  lagnaRasi?: number;
  onNavigateToBirthCharts?: () => void;
  onNavigateToDasha?: () => void;
  onNavigateToUpay?: () => void;
}

interface AiPlanetaryResponse {
  headline: string;
  summary: string;
  lifeDomainEffects: { domain: string; effect: string }[];
  specialStrengths: string[];
  potentialChallenges: string[];
  remedies: string[];
  researchCitations: string[];
}

export function PlanetaryEffectsTab({
  activeProfile,
  profiles = [],
  natalPlanets = [],
  natalHouses = [],
  lagnaRasi = 1,
  onNavigateToBirthCharts,
  onNavigateToDasha,
  onNavigateToUpay,
}: PlanetaryEffectsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'seeker_planets' | 'encyclopedia' | 'friendship_matrix' | 'ai_consultation'
  >('seeker_planets');

  // Selected planet & house for the Encyclopedia view
  const [selectedGrahaKey, setSelectedGrahaKey] = useState<string>('Surya');
  const [selectedHouseNum, setSelectedHouseNum] = useState<number>(1);

  // Selected planet for seeker's detailed breakdown modal/expanded view
  const [expandedSeekerGraha, setExpandedSeekerGraha] = useState<string | null>('Surya');

  // AI Deep Dive Query State
  const [aiPlanetSelect, setAiPlanetSelect] = useState<string>('Surya');
  const [aiCustomQuery, setAiCustomQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<AiPlanetaryResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const lagnaRasiInfo = VEDIC_RASIS[lagnaRasi - 1] || VEDIC_RASIS[0];
  const activeGrahaDetail = GRAHA_EFFECTS_DATA[selectedGrahaKey] || GRAHA_EFFECTS_DATA['Surya'];

  // Map natal planets to GrahaDetails + Kundali House Info
  const seekerKundaliPlanets = useMemo(() => {
    const list: Array<{
      planet: PlanetPosition;
      grahaDetail: GrahaDetail;
      houseEffect: GrahaHouseEffect;
      houseInfo?: HouseInfo;
    }> = [];

    natalPlanets.forEach((p) => {
      if (p.name === 'Lagna') return;
      const key = p.name as string;
      const detail = GRAHA_EFFECTS_DATA[key];
      if (detail) {
        const hNum = p.house || 1;
        const effect = detail.houseEffects[hNum] || {
          title: `${detail.hindiName} in House ${hNum}`,
          description: `Placement of ${detail.englishName} in House ${hNum} activates the corresponding Bhava significations.`,
          positiveEffects: ['Focuses energy on this life domain'],
          challengingEffects: ['Requires conscious balance'],
          vedicRemedy: `Chant ${detail.beejMantra}`,
        };
        const hInfo = natalHouses.find((h) => h.houseNumber === hNum);
        list.push({
          planet: p,
          grahaDetail: detail,
          houseEffect: effect,
          houseInfo: hInfo,
        });
      }
    });

    return list;
  }, [natalPlanets, natalHouses]);

  // Handle AI Deep Dive Request
  const handleAiConsultation = async (pName?: string) => {
    setIsLoadingAi(true);
    setAiError(null);
    const targetPlanetKey = pName || aiPlanetSelect;
    const pDetail = GRAHA_EFFECTS_DATA[targetPlanetKey] || GRAHA_EFFECTS_DATA['Surya'];
    const seekerPlanetObj = natalPlanets.find((p) => p.name === targetPlanetKey);

    try {
      const res = await fetch('/api/astrology/planetary-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeProfile?.name || 'Seeker',
          birthDate: activeProfile?.birthDate || '1990-05-18',
          birthTime: activeProfile?.birthTime || '07:30',
          birthPlace: activeProfile?.place || 'New Delhi, India',
          lagnaRasi: lagnaRasiInfo.sanskritName,
          moonRasi: VEDIC_RASIS[(activeProfile as any)?.moonRasi - 1]?.sanskritName || 'Simha',
          planetName: pDetail.title,
          houseNumber: seekerPlanetObj?.house || selectedHouseNum || 1,
          rasiName: seekerPlanetObj?.rasiName || 'Mesha',
          isRetrograde: seekerPlanetObj?.isRetrograde || false,
          nakshatra: seekerPlanetObj?.nakshatra || 'Ashwini',
          dignity: seekerPlanetObj?.dignity || 'Own',
          userQuery: aiCustomQuery,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI planetary analysis');
      }
      setAiResponse(data);
    } catch (err: any) {
      setAiError(err.message || 'Unable to load AI analysis. Showing Parashari dataset.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-3 font-sans text-stone-900 break-words">
      {/* Top Banner & Seeker Context Bar */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-amber-50 rounded-lg p-3 shadow-md border border-amber-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-vedic font-black text-[18px] md:text-[20px] text-amber-100 uppercase tracking-wide">
                Planetary Effects on Kundali (ग्रह प्रभाव एवं कुण्डली फल)
              </h2>
            </div>
            <p className="text-[12px] text-amber-200/90 font-medium">
              Classical Parashari &amp; Jaimini analysis of Navagraha placements, Bhava Phala (Houses 1–12), Exaltation/Debilitation, Dignity, Drishti, and Remedies
            </p>
          </div>

          {/* Active Seeker Vitals Pill */}
          <div className="bg-amber-950/80 rounded-md px-3 py-1.5 border border-amber-700/70 text-[11px] flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center space-x-1.5 font-bold text-amber-200">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeProfile?.name || 'Seeker Profile'}</span>
            </div>
            <span className="text-amber-600">•</span>
            <span className="text-amber-300 font-semibold">
              Lagna: <strong>{lagnaRasiInfo.sanskritName}</strong>
            </span>
            <span className="text-amber-600">•</span>
            <span className="text-amber-300 font-semibold">
              Planets Evaluated: <strong>9 Grahas</strong>
            </span>
          </div>
        </div>

        {/* Sub-View Mode Selector Lens */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-amber-700/60">
          {[
            {
              id: 'seeker_planets',
              label: "Seeker's Kundali Planets (Active Profile)",
              icon: Sparkles,
            },
            {
              id: 'encyclopedia',
              label: '9 Graha Encyclopedia (Houses 1–12)',
              icon: BookOpen,
            },
            {
              id: 'friendship_matrix',
              label: 'Graha Maitri & Functional Benefics',
              icon: Scale,
            },
            {
              id: 'ai_consultation',
              label: 'Ask AI Graha Scholar',
              icon: HelpCircle,
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeSubTab === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveSubTab(mode.id as any)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm font-black'
                    : 'bg-amber-900/60 text-amber-200 border-amber-700/70 hover:bg-amber-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-800' : 'text-amber-300'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: SEEKER'S ACTIVE KUNDALI PLANETS (INDIVIDUAL GRAHA BREAKDOWN)
          ===================================================================== */}
      {activeSubTab === 'seeker_planets' && (
        <div className="space-y-3">
          {/* Header Bar & Quick Links */}
          <div className="bg-[#FAF8F5] rounded-lg p-2.5 border border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
            <div>
              <h3 className="font-vedic font-black text-stone-950 text-[15px] uppercase tracking-wide flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-amber-800" />
                <span>Navagraha Analysis for {activeProfile?.name || 'Seeker’s Birth Chart'}</span>
              </h3>
              <p className="text-[11.5px] text-stone-600 font-medium">
                Detailed Parashari effects of all 9 planets in {activeProfile?.name || 'Seeker'}’s Lagna Kundali ({lagnaRasiInfo.sanskritName} Lagna)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {onNavigateToBirthCharts && (
                <button
                  type="button"
                  onClick={onNavigateToBirthCharts}
                  className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>View Full Lagna Chart</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {onNavigateToUpay && (
                <button
                  type="button"
                  onClick={onNavigateToUpay}
                  className="px-2.5 py-1 rounded bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Personalized Upay</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout: North Indian Chart on Side, Graha Cards on Main Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Column: Compact Kundali Chart Display */}
            <div className="lg:col-span-4 bg-white rounded-lg border border-amber-200/90 p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                <span className="font-vedic font-black text-amber-950 text-[13px] uppercase tracking-wider flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>North Indian Janam Kundali</span>
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {lagnaRasiInfo.sanskritName} Lagna
                </span>
              </div>

              <div className="flex justify-center p-1">
                <NorthIndianChart
                  houses={natalHouses}
                  title="Lagna Kundali"
                  subtitle={`${lagnaRasiInfo.sanskritName} Lagna Chart`}
                />
              </div>

              {/* Quick Planet House Summary Table */}
              <div className="border-t border-stone-100 pt-2 space-y-1">
                <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block">
                  Kundali Placement Summary:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10.5px]">
                  {seekerKundaliPlanets.map(({ planet }) => (
                    <button
                      key={planet.name}
                      type="button"
                      onClick={() => setExpandedSeekerGraha(planet.name)}
                      className={`px-1.5 py-1 rounded text-left border transition-all cursor-pointer ${
                        expandedSeekerGraha === planet.name
                          ? 'bg-amber-100 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-300'
                          : 'bg-stone-50 border-stone-200/80 text-stone-800 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <div className="font-bold text-stone-900 flex items-center justify-between">
                        <span>{planet.name}</span>
                        <span className="text-[9.5px] text-amber-800 font-black">H{planet.house}</span>
                      </div>
                      <div className="text-[9.5px] text-stone-500 truncate">
                        {planet.rasiName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Planetary Effect Cards */}
            <div className="lg:col-span-8 space-y-2.5">
              {seekerKundaliPlanets.map(({ planet, grahaDetail, houseEffect, houseInfo }) => {
                const isExpanded = expandedSeekerGraha === planet.name;
                const dignityBadge = planet.dignity || 'Standard';

                return (
                  <div
                    key={planet.name}
                    className={`bg-white rounded-lg border transition-all shadow-2xs overflow-hidden ${
                      isExpanded
                        ? 'border-amber-400 ring-1 ring-amber-300/80'
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      onClick={() => setExpandedSeekerGraha(isExpanded ? null : planet.name)}
                      className="p-2.5 bg-gradient-to-r from-[#FAF8F5] via-white to-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 cursor-pointer border-b border-stone-100"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-950 flex items-center justify-center font-bold text-[14px] border border-amber-300 shadow-3xs shrink-0">
                          {grahaDetail.symbol}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-vedic font-black text-stone-950 text-[14px]">
                              {grahaDetail.hindiName} ({planet.englishName}) in House {planet.house} ({planet.rasiName})
                            </span>
                            {planet.isRetrograde && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[9.5px] font-black uppercase">
                                Retrograde (Vakra)
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-950 border border-amber-200 text-[10px] font-bold">
                              {dignityBadge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 font-medium">
                            {planet.nakshatra} Nakshatra (Pada {planet.pada}) • Degree: {planet.degree.toFixed(1)}°
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <span className="text-[10.5px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                          {grahaDetail.nature}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-180 text-amber-800' : ''}`} />
                      </div>
                    </div>

                    {/* Card Body - Expanded Details */}
                    {isExpanded && (
                      <div className="p-3 space-y-2.5 bg-white text-[12px]">
                        {/* Title & Description */}
                        <div className="bg-[#FAF8F5] p-2.5 rounded-md border border-stone-200/80 space-y-1">
                          <span className="font-vedic font-black text-amber-950 text-[13px] block">
                            {houseEffect.title}
                          </span>
                          <p className="text-stone-800 leading-snug">
                            {houseEffect.description}
                          </p>
                          {houseInfo && (
                            <p className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60 font-medium">
                              <strong className="text-stone-900">House {planet.house} Significance:</strong> {houseInfo.significance} ({houseInfo.vedicName})
                            </p>
                          )}
                        </div>

                        {/* Positive vs Challenging Effects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-emerald-50/50 p-2 rounded border border-emerald-200/80 space-y-1">
                            <span className="text-[11px] font-black uppercase text-emerald-950 tracking-wider flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Auspicious Parashari Results</span>
                            </span>
                            <ul className="space-y-0.5 text-stone-800 text-[11.5px]">
                              {houseEffect.positiveEffects.map((eff, eidx) => (
                                <li key={eidx} className="flex items-start space-x-1 leading-snug">
                                  <span className="text-emerald-700 font-bold">•</span>
                                  <span>{eff}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-rose-50/50 p-2 rounded border border-rose-200/80 space-y-1">
                            <span className="text-[11px] font-black uppercase text-rose-950 tracking-wider flex items-center space-x-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>Sensitivities &amp; Lessons</span>
                            </span>
                            <ul className="space-y-0.5 text-stone-800 text-[11.5px]">
                              {houseEffect.challengingEffects.map((eff, eidx) => (
                                <li key={eidx} className="flex items-start space-x-1 leading-snug">
                                  <span className="text-rose-700 font-bold">•</span>
                                  <span>{eff}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Graha Vitals & Specific Upay */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-[11px]">
                          <div className="bg-amber-50/70 p-2 rounded border border-amber-200/80 space-y-0.5">
                            <span className="font-bold text-amber-950 block">Karaka Significations:</span>
                            <p className="text-stone-700 leading-tight">
                              {grahaDetail.karakaSignifications.join(' • ')}
                            </p>
                          </div>

                          <div className="bg-amber-50/70 p-2 rounded border border-amber-200/80 space-y-0.5">
                            <span className="font-bold text-amber-950 block">Drishti (Aspects):</span>
                            <p className="text-stone-700 leading-tight">
                              Casts aspect on <strong>{grahaDetail.aspectHouses}</strong>
                            </p>
                          </div>

                          <div className="bg-amber-100/60 p-2 rounded border border-amber-300 space-y-0.5">
                            <span className="font-black text-amber-950 block flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-amber-800" />
                              <span>Prescribed Vedic Upay:</span>
                            </span>
                            <p className="text-stone-900 font-medium leading-snug">
                              {houseEffect.vedicRemedy}
                            </p>
                          </div>
                        </div>

                        {/* AI Deep Dive Trigger for this Planet */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGrahaKey(planet.name);
                              setSelectedHouseNum(planet.house);
                              setAiPlanetSelect(planet.name);
                              setActiveSubTab('ai_consultation');
                              handleAiConsultation(planet.name);
                            }}
                            className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ask AI Scholar about {planet.name} in H{planet.house} →</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: 9 GRAHA ENCYCLOPEDIA & HOUSES 1 TO 12 EFFECTS
          ===================================================================== */}
      {activeSubTab === 'encyclopedia' && (
        <div className="space-y-3">
          {/* Planet Switcher Bar (Surya through Ketu) */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-300/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <span className="font-vedic font-black text-amber-950 text-[14px] uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span>Select Navagraha to Inspect (Houses 1 to 12 Effects)</span>
              </span>
              <span className="text-[11px] font-bold text-stone-600">
                Active Planet: <strong>{activeGrahaDetail.hindiName} ({activeGrahaDetail.englishName})</strong>
              </span>
            </div>

            {/* 9 Planet Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {Object.keys(GRAHA_EFFECTS_DATA).map((gKey) => {
                const item = GRAHA_EFFECTS_DATA[gKey];
                const isSelected = selectedGrahaKey === gKey;
                return (
                  <button
                    key={gKey}
                    type="button"
                    onClick={() => setSelectedGrahaKey(gKey)}
                    className={`p-1.5 rounded-md border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 ring-1 ring-amber-400 text-amber-950 font-black shadow-3xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-[15px] leading-none mb-0.5">{item.symbol}</div>
                    <div className="text-[11.5px] font-bold leading-tight">{item.hindiName}</div>
                    <div className="text-[9.5px] text-stone-500 font-normal">{item.englishName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planet Overview Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-100/60 p-3 rounded-lg border border-amber-300/90 shadow-2xs space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
              <div>
                <h3 className="font-vedic font-black text-amber-950 text-[16px] flex items-center space-x-2">
                  <span className="text-[20px]">{activeGrahaDetail.symbol}</span>
                  <span>{activeGrahaDetail.title}</span>
                </h3>
                <p className="text-[12px] text-stone-700 font-medium">
                  <strong>Element:</strong> {activeGrahaDetail.element} • <strong>Nature:</strong> {activeGrahaDetail.nature} • <strong>Gunas:</strong> {activeGrahaDetail.gunas}
                </p>
              </div>

              {/* Vitals Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold">
                  Exalted: {activeGrahaDetail.exaltationSign}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-950 border border-rose-300 font-bold">
                  Debilitated: {activeGrahaDetail.debilitationSign}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 font-bold">
                  Gemstone: {activeGrahaDetail.gemstone}
                </span>
              </div>
            </div>

            {/* Karakatvas & Mantra Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px]">
              <div className="bg-white/90 p-2 rounded border border-amber-200 space-y-0.5">
                <span className="font-bold text-amber-950 block">Karaka Significations (Karakatvas):</span>
                <p className="text-stone-800 leading-snug">
                  {activeGrahaDetail.karakaSignifications.join(' • ')}
                </p>
              </div>

              <div className="bg-white/90 p-2 rounded border border-amber-200 space-y-0.5">
                <span className="font-bold text-amber-950 block">Vedic Beej Mantra &amp; Deity:</span>
                <p className="text-stone-900 font-bold leading-snug">
                  {activeGrahaDetail.beejMantra}
                </p>
                <p className="text-[10.5px] text-stone-600">
                  Deity: {activeGrahaDetail.deity} • Aspect: {activeGrahaDetail.aspectHouses}
                </p>
              </div>
            </div>
          </div>

          {/* House Selector Tabs (1 to 12) */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-200/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <span className="font-vedic font-black text-stone-950 text-[13.5px] uppercase tracking-wider flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>House Placement Effects (Bhava 1 to 12) for {activeGrahaDetail.hindiName}</span>
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Selected: House {selectedHouseNum}
              </span>
            </div>

            {/* 12 House Selector Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-12 gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                const isSelected = selectedHouseNum === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHouseNum(h)}
                    className={`py-1.5 px-1 rounded text-center transition-all cursor-pointer border text-[11px] ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-800 font-black shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <div className="font-black text-[12px]">H{h}</div>
                    <div className="text-[9px] opacity-80 uppercase tracking-tight">House {h}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected House Effect Dossier */}
            {(() => {
              const hEffect = activeGrahaDetail.houseEffects[selectedHouseNum] || {
                title: `${activeGrahaDetail.hindiName} in House ${selectedHouseNum}`,
                description: `General effect of ${activeGrahaDetail.englishName} in House ${selectedHouseNum}.`,
                positiveEffects: ['Focuses energy on this Bhava domain'],
                challengingEffects: ['Requires conscious balance'],
                vedicRemedy: `Chant ${activeGrahaDetail.beejMantra}`,
              };

              return (
                <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-amber-50/40 p-3 rounded-md border border-amber-300 space-y-2.5">
                  <div className="border-b border-amber-200/80 pb-1.5 flex items-center justify-between">
                    <span className="font-vedic font-black text-amber-950 text-[15px]">
                      {hEffect.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 text-[10.5px] font-black border border-amber-300">
                      Parashari Bhava Phala
                    </span>
                  </div>

                  <p className="text-[12.5px] text-stone-800 leading-snug font-medium">
                    {hEffect.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                    <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200 space-y-1">
                      <span className="text-[11px] font-black uppercase text-emerald-950 tracking-wider flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Positive Manifestations</span>
                      </span>
                      <ul className="space-y-0.5 text-stone-800">
                        {hEffect.positiveEffects.map((p, idx) => (
                          <li key={idx} className="flex items-start space-x-1 leading-snug">
                            <span className="text-emerald-700 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-50/60 p-2.5 rounded border border-rose-200 space-y-1">
                      <span className="text-[11px] font-black uppercase text-rose-950 tracking-wider flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                        <span>Potential Sensitivities</span>
                      </span>
                      <ul className="space-y-0.5 text-stone-800">
                        {hEffect.challengingEffects.map((p, idx) => (
                          <li key={idx} className="flex items-start space-x-1 leading-snug">
                            <span className="text-rose-700 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Vedic Remedy Box */}
                  <div className="bg-amber-100/70 p-2.5 rounded border border-amber-300/90 text-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-black text-amber-950 flex items-center space-x-1 uppercase text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                        <span>Specific Parashari Remedy for House {selectedHouseNum}:</span>
                      </span>
                      <p className="text-stone-900 font-medium">
                        {hEffect.vedicRemedy}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAiPlanetSelect(selectedGrahaKey);
                        setActiveSubTab('ai_consultation');
                        handleAiConsultation(selectedGrahaKey);
                      }}
                      className="px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 self-start sm:self-auto flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Deep Dive AI Analysis →</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: GRAHA MAITRI & FUNCTIONAL BENEFICS / MALEFICS
          ===================================================================== */}
      {activeSubTab === 'friendship_matrix' && (
        <div className="space-y-3">
          {/* Header Card */}
          <div className="bg-white p-3 rounded-lg border border-amber-300/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <span className="font-vedic font-black text-amber-950 text-[15px] uppercase tracking-wider flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-amber-800" />
                <span>Graha Maitri &amp; Functional Benefic/Malefic Matrix ({lagnaRasiInfo.sanskritName} Lagna)</span>
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Parashari Functional Dignity
              </span>
            </div>
            <p className="text-[12px] text-stone-600 font-medium">
              Evaluates Natural Friendship (Naisargika Maitri), Temporal Friendship (Tatkalika Maitri), and Functional Benefic/Malefic roles determined by house ownership from {lagnaRasiInfo.sanskritName} Lagna.
            </p>

            {/* Functional Roles Table for Seeker's Lagna */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[12px]">
              <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-200 space-y-1">
                <span className="font-black text-emerald-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Functional Benefics for {lagnaRasiInfo.sanskritName}</span>
                </span>
                <p className="text-stone-800 leading-snug">
                  Lagna Lord, 5th Lord, and 9th Lord (Yogakaraka planets) always act as auspicious life protectors and wealth givers for this Lagna.
                </p>
              </div>

              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200 space-y-1">
                <span className="font-black text-amber-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-amber-700" />
                  <span>Functional Neutrals / Dual Lords</span>
                </span>
                <p className="text-stone-800 leading-snug">
                  Planets owning Kendras without Trikona ownership or neutral house lords act according to their association and planetary dignity.
                </p>
              </div>

              <div className="bg-rose-50/70 p-2.5 rounded border border-rose-200 space-y-1">
                <span className="font-black text-rose-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>Functional Malefics / Marakas</span>
                </span>
                <p className="text-stone-800 leading-snug">
                  Lords of Trika Houses (6th, 8th, 12th) and Maraka Houses (2nd, 7th) require conscious remedies and caution during their Dasha.
                </p>
              </div>
            </div>
          </div>

          {/* Classical Naisargika Maitri (Natural Friendship Table) */}
          <div className="bg-white p-3 rounded-lg border border-amber-200/90 shadow-2xs space-y-2">
            <span className="font-vedic font-black text-stone-950 text-[14px] uppercase tracking-wider block border-b border-stone-100 pb-1.5">
              Naisargika Maitri (Natural Planetary Relationships in Vedic Astrology)
            </span>

            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 text-amber-950 font-black border-b border-amber-300">
                    <th className="p-2">Graha</th>
                    <th className="p-2">Mitra (Friends)</th>
                    <th className="p-2">Sama (Neutrals)</th>
                    <th className="p-2">Shatru (Enemies)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Surya (Sun)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Chandra, Mangal, Guru</td>
                    <td className="p-2 text-stone-700">Budha</td>
                    <td className="p-2 text-rose-800 font-semibold">Shukra, Shani, Rahu, Ketu</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Chandra (Moon)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Surya, Budha</td>
                    <td className="p-2 text-stone-700">Mangal, Guru, Shukra, Shani</td>
                    <td className="p-2 text-rose-800 font-semibold">Rahu, Ketu (No natural enemy otherwise)</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Mangal (Mars)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Surya, Chandra, Guru</td>
                    <td className="p-2 text-stone-700">Shukra, Shani</td>
                    <td className="p-2 text-rose-800 font-semibold">Budha, Rahu, Ketu</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Budha (Mercury)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Surya, Shukra</td>
                    <td className="p-2 text-stone-700">Mangal, Guru, Shani</td>
                    <td className="p-2 text-rose-800 font-semibold">Chandra</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Guru (Jupiter)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Surya, Chandra, Mangal</td>
                    <td className="p-2 text-stone-700">Shani</td>
                    <td className="p-2 text-rose-800 font-semibold">Budha, Shukra</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Shukra (Venus)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Budha, Shani, Rahu, Ketu</td>
                    <td className="p-2 text-stone-700">Mangal, Guru</td>
                    <td className="p-2 text-rose-800 font-semibold">Surya, Chandra</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Shani (Saturn)</td>
                    <td className="p-2 text-emerald-800 font-semibold">Budha, Shukra, Rahu</td>
                    <td className="p-2 text-stone-700">Guru</td>
                    <td className="p-2 text-rose-800 font-semibold">Surya, Chandra, Mangal</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2 font-bold text-amber-950">Rahu / Ketu</td>
                    <td className="p-2 text-emerald-800 font-semibold">Shukra, Shani</td>
                    <td className="p-2 text-stone-700">Budha, Guru</td>
                    <td className="p-2 text-rose-800 font-semibold">Surya, Chandra, Mangal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 4: ASK AI GRAHA SCHOLAR (INTERACTIVE AI DEEP DIVE)
          ===================================================================== */}
      {activeSubTab === 'ai_consultation' && (
        <div className="space-y-3">
          {/* AI Search Header */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-100/70 p-3 rounded-lg border border-amber-300 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 border-b border-amber-200/80 pb-1.5">
              <Sparkles className="w-5 h-5 text-amber-800" />
              <h3 className="font-vedic font-black text-amber-950 text-[16px] uppercase tracking-wide">
                Ask AI Graha Scholar — Planetary Deep Dive
              </h3>
            </div>
            <p className="text-[12px] text-stone-700 font-medium">
              Ask AI for specialized research-backed Parashari &amp; Jaimini interpretation of any planet, house placement, conjunction, or aspect in your birth chart.
            </p>

            {/* Input Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <select
                value={aiPlanetSelect}
                onChange={(e) => setAiPlanetSelect(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-amber-300 bg-white font-bold text-[12px] text-amber-950 cursor-pointer shadow-3xs"
              >
                {Object.keys(GRAHA_EFFECTS_DATA).map((gKey) => (
                  <option key={gKey} value={gKey}>
                    {GRAHA_EFFECTS_DATA[gKey].hindiName} ({GRAHA_EFFECTS_DATA[gKey].englishName})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={aiCustomQuery}
                onChange={(e) => setAiCustomQuery(e.target.value)}
                placeholder="e.g., How does Jupiter in 10th house aspecting 2nd house impact wealth and career?"
                className="flex-1 px-3 py-1.5 rounded-md border border-amber-300 bg-white text-[12px] text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-3xs"
              />

              <button
                type="button"
                onClick={() => handleAiConsultation()}
                disabled={isLoadingAi}
                className="px-4 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-bold text-[12px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-2xs shrink-0"
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate AI Insights</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {aiError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] p-2.5 rounded-md font-medium">
              {aiError}
            </div>
          )}

          {/* AI Response Card */}
          {aiResponse && (
            <div className="bg-white rounded-lg border border-amber-300/90 p-3 shadow-sm space-y-3">
              <div className="border-b border-amber-200/80 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-vedic font-black text-amber-950 text-[16px]">
                  {aiResponse.headline}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 text-[10px] font-black border border-amber-300 self-start sm:self-auto">
                  AI Parashari Synthesis
                </span>
              </div>

              <p className="text-[13px] text-stone-900 leading-snug font-medium">
                {aiResponse.summary}
              </p>

              {/* Life Domains Analysis */}
              <div className="space-y-1.5">
                <span className="font-black text-amber-950 text-[12px] uppercase tracking-wider block">
                  Life Domain Impacts:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {aiResponse.lifeDomainEffects.map((item, idx) => (
                    <div key={idx} className="bg-[#FAF8F5] p-2.5 rounded border border-stone-200/80 space-y-0.5 text-[12px]">
                      <strong className="text-amber-900 font-black block text-[11.5px] uppercase">
                        {item.domain}
                      </strong>
                      <p className="text-stone-800 leading-snug">
                        {item.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths vs Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200 space-y-1">
                  <span className="font-black uppercase text-emerald-950 text-[11px] tracking-wider block flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Special Planetary Strengths</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-800">
                    {aiResponse.specialStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/60 p-2.5 rounded border border-rose-200 space-y-1">
                  <span className="font-black uppercase text-rose-950 text-[11px] tracking-wider block flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    <span>Potential Sensitivities</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-800">
                    {aiResponse.potentialChallenges.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-rose-700 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Remedies & Citations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-stone-100 text-[11.5px]">
                <div className="bg-amber-100/60 p-2.5 rounded border border-amber-300 space-y-1">
                  <span className="font-black text-amber-950 uppercase text-[11px] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span>Prescribed Upayas:</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-900 font-medium">
                    {aiResponse.remedies.map((rem, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-amber-800 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-stone-50 p-2.5 rounded border border-stone-200 space-y-1">
                  <span className="font-black text-stone-900 uppercase text-[11px] flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                    <span>Classical Research References:</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-700">
                    {aiResponse.researchCitations.map((cit, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-stone-500 font-bold">•</span>
                        <span>{cit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
