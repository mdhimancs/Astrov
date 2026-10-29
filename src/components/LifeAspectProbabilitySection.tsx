import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Home,
  Heart,
  Baby,
  Calendar,
  Building2,
  Scale,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  TrendingUp,
  ArrowRightLeft,
  Users,
  Navigation,
} from 'lucide-react';
import { PlanetPosition, HouseInfo } from '../types';
import {
  computeLifeAspectProbabilities,
  AspectProbabilityItem,
} from '../utils/lifeAspectAnalysisAndGuidance';

interface LifeAspectProbabilitySectionProps {
  natalPlanets: PlanetPosition[];
  natalHouses: HouseInfo[];
  lagnaRasi: number;
  userName?: string;
}

export function LifeAspectProbabilitySection({
  natalPlanets,
  natalHouses,
  lagnaRasi,
  userName = 'Seeker',
}: LifeAspectProbabilitySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('business');

  const aspectItems = useMemo(() => {
    return computeLifeAspectProbabilities(natalPlanets, natalHouses, lagnaRasi);
  }, [natalPlanets, natalHouses, lagnaRasi]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return aspectItems;
    if (selectedCategory === 'career_jobs') {
      return aspectItems.filter((i) =>
        [
          'job_change_new_job',
          'job_promotion',
          'career_transfer',
          'workplace_difficulties',
          'favour_from_seniors',
          'governance_private_job',
        ].includes(i.id)
      );
    }
    if (selectedCategory === 'business_enterprise') {
      return aspectItems.filter((i) =>
        [
          'business_start_inception',
          'business',
          'sudden_windfall',
          'name_and_fame',
        ].includes(i.id)
      );
    }
    if (selectedCategory === 'love_relationships') {
      return aspectItems.filter((i) =>
        ['love_life_romance', 'marriage_time', 'extra_marital_affairs'].includes(i.id)
      );
    }
    if (selectedCategory === 'home_property') {
      return aspectItems.filter((i) =>
        ['property_purchase', 'property_sale', 'home', 'luxury_vehicles'].includes(i.id)
      );
    }
    if (selectedCategory === 'progeny') {
      return aspectItems.filter((i) => ['kids_progeny'].includes(i.id));
    }
    if (selectedCategory === 'foreign_vitality') {
      return aspectItems.filter((i) => ['foreign_settlement', 'health_vitality'].includes(i.id));
    }
    if (selectedCategory === 'legal_karmic') {
      return aspectItems.filter((i) =>
        ['workplace_difficulties', 'legal_disputes', 'extra_marital_affairs'].includes(i.id)
      );
    }
    return aspectItems;
  }, [aspectItems, selectedCategory]);

  const getIconForItem = (id: string) => {
    switch (id) {
      case 'business':
      case 'business_start_inception':
        return Briefcase;
      case 'job_change_new_job':
        return ArrowRightLeft;
      case 'career_transfer':
        return Navigation;
      case 'job_promotion':
        return TrendingUp;
      case 'workplace_difficulties':
        return ShieldAlert;
      case 'favour_from_seniors':
        return Users;
      case 'property_purchase':
        return Home;
      case 'property_sale':
        return Building2;
      case 'home':
        return Home;
      case 'love_life_romance':
      case 'extra_marital_affairs':
        return Heart;
      case 'kids_progeny':
        return Baby;
      case 'marriage_time':
        return Calendar;
      case 'governance_private_job':
        return Building2;
      case 'legal_disputes':
        return Scale;
      case 'sudden_windfall':
        return Sparkles;
      case 'foreign_settlement':
        return Compass;
      case 'luxury_vehicles':
        return Award;
      case 'health_vitality':
        return ShieldAlert;
      case 'name_and_fame':
        return Flame;
      default:
        return Sparkles;
    }
  };

  const getTierBadgeStyle = (tier: string) => {
    if (tier.startsWith('Very High')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (tier.startsWith('High')) {
      return 'bg-teal-100 text-teal-900 border-teal-300';
    }
    if (tier.startsWith('Moderate')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (tier.startsWith('Guarded')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    return 'bg-stone-100 text-stone-800 border-stone-300';
  };

  return (
    <div className="bg-[#FCFAF7] rounded-xl border border-amber-200/90 shadow-xs p-3 sm:p-4 space-y-3.5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-vedic font-black text-stone-950 text-[16px] sm:text-[17px] tracking-tight">
              Life Events &amp; Matters: Astrological Analysis &amp; Probability
            </h3>
          </div>
          <p className="text-[12px] text-stone-600 leading-snug">
            Parashari &amp; Jaimini probability algorithms computed from natal kundali bhavas, karakas, and yogas.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-950 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md shrink-0">
          <Award className="w-3.5 h-3.5 text-amber-700" />
          <span>{aspectItems.length} Verified Life Domains</span>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: `All ${aspectItems.length} Aspects` },
          { id: 'career_jobs', label: 'Job Change, Promotion & Difficulties' },
          { id: 'business_enterprise', label: 'Business Start & Enterprise' },
          { id: 'love_relationships', label: 'Love Life, Marriage & Affairs' },
          { id: 'home_property', label: 'Home, Land & Vehicles' },
          { id: 'progeny', label: 'Kids & Lineage' },
          { id: 'foreign_vitality', label: 'Foreign & Longevity' },
          { id: 'legal_karmic', label: 'Legal, Politics & Karmic Risks' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold w-fit whitespace-nowrap transition-all cursor-pointer border break-words ${
              selectedCategory === tab.id
                ? 'bg-amber-800 text-white border-amber-900 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200/80 hover:bg-[#FAF8F5] hover:border-amber-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Probability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const Icon = getIconForItem(item.id);
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-lg border transition-all duration-150 overflow-hidden bg-white ${
                isExpanded
                  ? 'border-amber-400 shadow-md ring-1 ring-amber-300/60'
                  : 'border-stone-200/80 hover:border-amber-300 shadow-3xs'
              }`}
            >
              {/* Card Top Row */}
              <div
                className="p-3 cursor-pointer select-none space-y-2 hover:bg-[#FAF8F5]/60 transition-colors"
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-vedic font-bold text-stone-950 text-[14px] leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10.5px] text-amber-900/80 font-medium font-vedic block">
                        {item.sanskritTitle}
                      </span>
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getTierBadgeStyle(
                      item.probabilityTier
                    )}`}
                  >
                    {item.probabilityTier.split('(')[0].trim()}
                  </span>
                </div>

                {/* Probability Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-semibold">Vedic Probability Score:</span>
                    <span className="font-black font-vedic text-stone-900 text-[13px]">
                      {item.probability}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden border border-stone-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.id === 'extra_marital_affairs'
                          ? item.probability >= 50
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                          : item.probability >= 70
                          ? 'bg-gradient-to-r from-amber-500 to-emerald-600'
                          : 'bg-gradient-to-r from-amber-400 to-amber-600'
                      }`}
                      style={{ width: `${item.probability}%` }}
                    />
                  </div>
                </div>

                {/* Core Verdict Box */}
                <p className="text-[12px] text-stone-800 font-medium leading-relaxed bg-[#FDFBF7] p-2 rounded border border-amber-100/80">
                  {item.verdict}
                </p>

                {/* Sub-Metrics Quick Bar */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {item.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-50 rounded px-1.5 py-1 border border-stone-200/60 text-center"
                    >
                      <span className="text-[9.5px] text-stone-500 block truncate font-medium">
                        {m.label}
                      </span>
                      <span className="text-[11px] font-black text-stone-900 font-vedic">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expand / Collapse Indicator */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10.5px] text-amber-800 font-bold">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{item.timingWindow.split(':')[0]}</span>
                  </span>
                  <span className="flex items-center space-x-0.5">
                    <span>{isExpanded ? 'Hide Details' : 'Deep Analysis'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </span>
                </div>
              </div>

              {/* Expanded In-depth Classical Astrological Section */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-2 bg-[#FAF8F5] border-t border-amber-200/80 space-y-2.5 text-[11.5px]">
                  {/* Governing Houses & Key Planets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-stone-500 font-bold text-[10.5px]">Bhavas:</span>
                    {item.governingHouses.map((h) => (
                      <span
                        key={h}
                        className="bg-amber-100/90 text-amber-950 font-bold text-[10px] px-1.5 py-0.2 rounded border border-amber-200"
                      >
                        House {h}
                      </span>
                    ))}
                    <span className="text-stone-400 mx-0.5">|</span>
                    <span className="text-stone-500 font-bold text-[10.5px]">Karakas:</span>
                    {item.keyPlanets.map((p) => (
                      <span
                        key={p}
                        className="bg-white text-stone-800 font-semibold text-[10px] px-1.5 py-0.2 rounded border border-stone-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Yogas Detected */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-stone-700 block">
                      Classical Yogas &amp; Astrological Formations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.yogasDetected.map((y, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-950 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                          <span>{y}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timing Window Card */}
                  <div className="bg-amber-100/60 p-2 rounded-md border border-amber-200/90 space-y-0.5">
                    <div className="flex items-center space-x-1 text-amber-950 font-bold text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-amber-800" />
                      <span>Favorable &amp; Critical Timing Windows</span>
                    </div>
                    <p className="text-stone-800 text-[11px] leading-snug">
                      {item.timingWindow}
                    </p>
                  </div>

                  {/* Detailed Parashari Analysis Text */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-stone-800 block">
                      Parashari &amp; Bhrigu Classical Synthesis:
                    </span>
                    <p className="text-stone-700 leading-relaxed text-[11.5px] bg-white p-2 rounded border border-stone-200/70">
                      {item.detailedAnalysis}
                    </p>
                  </div>

                  {/* Upay & Protective Measures */}
                  <div className="bg-stone-50 p-2 rounded border border-stone-200 space-y-0.5">
                    <div className="flex items-center space-x-1 text-stone-900 font-bold text-[11px]">
                      <ShieldAlert className="w-3 h-3 text-amber-700" />
                      <span>Protective Harmonization &amp; Remedies (Upay)</span>
                    </div>
                    <p className="text-stone-700 text-[11px] leading-snug">
                      {item.protectiveMeasures}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
