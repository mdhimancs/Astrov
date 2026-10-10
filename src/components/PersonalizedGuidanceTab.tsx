import React, { useMemo } from 'react';
import {
  GraduationCap,
  Briefcase,
  Globe,
  TrendingUp,
  DollarSign,
  Compass,
  ArrowRight,
  ShieldCheck,
  User,
  Calculator,
  Award,
  Sparkles,
  ChevronRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, PlanetPosition, HouseInfo } from '../types';
import { PersonalizedGuidanceSection } from './PersonalizedGuidanceSection';
import { computePersonalizedLifeGuidance } from '../utils/lifeAspectAnalysisAndGuidance';
import { VEDIC_RASIS } from '../data';

interface PersonalizedGuidanceTabProps {
  activeProfile?: UserProfile;
  profiles: UserProfile[];
  natalPlanets: PlanetPosition[];
  natalHouses: HouseInfo[];
  lagnaRasi: number;
  onNavigateToLifeEvents?: () => void;
  onNavigateToUpay?: () => void;
  onNavigateToBirthCharts?: () => void;
}

export function PersonalizedGuidanceTab({
  activeProfile,
  profiles,
  natalPlanets,
  natalHouses,
  lagnaRasi,
  onNavigateToLifeEvents,
  onNavigateToUpay,
  onNavigateToBirthCharts,
}: PersonalizedGuidanceTabProps) {
  const seekerName = activeProfile?.name || 'Seeker';
  const ascendantSign = VEDIC_RASIS[lagnaRasi - 1]?.sanskritName || 'Mesha';

  const guidance = useMemo(() => {
    return computePersonalizedLifeGuidance(natalPlanets, natalHouses, lagnaRasi);
  }, [natalPlanets, natalHouses, lagnaRasi]);

  return (
    <div className="space-y-3.5 pb-8 animate-in fade-in duration-150 bg-[#FAF6EE] p-3 sm:p-4 rounded-xl border border-amber-200/60 shadow-xs">
      {/* Top Banner / Seeker Context */}
      <div className="bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#0F172A] text-blue-100 rounded-xl p-3.5 sm:p-5 border border-blue-400/30 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-56 h-56 text-blue-300" fill="currentColor">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
            <polygon points="50,5 90,85 10,85" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <polygon points="50,95 90,15 10,15" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
                Vedic Life Blueprint
              </span>
              <span className="text-blue-400 text-xs">•</span>
              <span className="text-[12px] text-blue-200/90 font-medium">
                Education • Occupation • Relocation • Wealth
              </span>
            </div>

            <h1 className="font-vedic font-black text-xl sm:text-2xl text-white tracking-tight flex items-center space-x-2">
              <span>Personalized Guidance for {seekerName}</span>
            </h1>

            <p className="text-[13px] text-blue-200/80 max-w-2xl leading-relaxed">
              Tailored astrological counsel for educational streams, vocational calling, foreign vs motherland settlement, promotion roadmap, and interactive Max Wealth compounding calculator.
            </p>
          </div>

          {/* Quick jump navigation button */}
          {onNavigateToLifeEvents && (
            <button
              type="button"
              onClick={onNavigateToLifeEvents}
              className="self-start md:self-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold px-3.5 py-2 rounded-lg text-[12.5px] flex items-center space-x-1.5 shadow-md cursor-pointer transition-all shrink-0 border border-amber-300"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>View Life Events &amp; Matters</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Quick Snapshot Strip */}
        <div className="mt-4 pt-3.5 border-t border-blue-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-blue-950/60 border border-blue-500/30 rounded-lg p-2.5">
            <div className="flex items-center space-x-1.5 text-[11px] text-blue-300 font-medium">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Recommended Study</span>
            </div>
            <div className="text-[13px] sm:text-[14px] font-bold text-white mt-1 truncate">
              {guidance.education.recommendedStream.split('(')[0].trim()}
            </div>
            <div className="text-[10.5px] text-blue-300/80 mt-0.5">
              Exam Success: {guidance.education.examSuccessProbability}%
            </div>
          </div>

          <div className="bg-blue-950/60 border border-blue-500/30 rounded-lg p-2.5">
            <div className="flex items-center space-x-1.5 text-[11px] text-blue-300 font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Career Archetype</span>
            </div>
            <div className="text-[13px] sm:text-[14px] font-bold text-white mt-1 truncate">
              {guidance.occupation.careerArchetype}
            </div>
            <div className="text-[10.5px] text-blue-300/80 mt-0.5">
              {guidance.occupation.independentVsJobRatio.business}% Business / {guidance.occupation.independentVsJobRatio.salariedJob}% Job
            </div>
          </div>

          <div className="bg-blue-950/60 border border-blue-500/30 rounded-lg p-2.5">
            <div className="flex items-center space-x-1.5 text-[11px] text-blue-300 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Settlement Verdict</span>
            </div>
            <div className="text-[13px] sm:text-[14px] font-bold text-white mt-1 truncate">
              {guidance.foreignVsMotherland.settlementVerdict.replace(' Favored', '')}
            </div>
            <div className="text-[10.5px] text-blue-300/80 mt-0.5">
              Abroad Prob: {guidance.foreignVsMotherland.foreignStayProbability}%
            </div>
          </div>

          <div className="bg-blue-950/60 border border-blue-500/30 rounded-lg p-2.5">
            <div className="flex items-center space-x-1.5 text-[11px] text-blue-300 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Wealth Multiplier</span>
            </div>
            <div className="text-[13px] sm:text-[14px] font-bold text-white mt-1 truncate">
              {guidance.maxWealth.dhanaYogaMultiplier}x Dhana Yoga
            </div>
            <div className="text-[10.5px] text-blue-300/80 mt-0.5">
              Peak: Ages {guidance.maxWealth.peakWealthAgeRange}
            </div>
          </div>
        </div>
      </div>

      {/* Main Guidance Section Component */}
      <PersonalizedGuidanceSection
        natalPlanets={natalPlanets}
        natalHouses={natalHouses}
        lagnaRasi={lagnaRasi}
        userName={seekerName}
      />

      {/* Bottom Actions Card */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-4 shadow-3xs space-y-2.5">
        <div className="flex items-center space-x-2 text-stone-800 font-bold text-[13px]">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Vedic Harmonization &amp; Practical Implementation</span>
        </div>
        <p className="text-[12px] text-stone-600 leading-relaxed">
          Guidance synthesizes Parashari Dashamsha (D10 career chart indicators), 5th house Vidyakaraka (intellect and scholarship), 9th house Bhagya (higher wisdom and fortune), and 12th house overseas links with Indu Lagna prosperity points. Use these insights to optimize career timing, business negotiations, and long-term asset accumulation.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11.5px]">
          {onNavigateToUpay && (
            <button
              type="button"
              onClick={onNavigateToUpay}
              className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>Explore Upay &amp; Gemstone Remedies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onNavigateToBirthCharts && (
            <button
              type="button"
              onClick={onNavigateToBirthCharts}
              className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>View Natal Kundali &amp; Divisional Charts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
