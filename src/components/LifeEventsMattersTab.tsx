import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  Clock,
  Layers,
  ChevronRight,
  Briefcase,
  Home,
  Baby,
  Building2,
  Globe,
  Scale,
} from 'lucide-react';
import { UserProfile, PlanetPosition, HouseInfo } from '../types';
import { LifeAspectProbabilitySection } from './LifeAspectProbabilitySection';
import { NorthIndianLifeAspectsTab } from './NorthIndianLifeAspectsTab';
import { computeLifeAspectProbabilities } from '../utils/lifeAspectAnalysisAndGuidance';
import { VEDIC_RASIS } from '../data';

interface LifeEventsMattersTabProps {
  activeProfile?: UserProfile;
  profiles: UserProfile[];
  natalPlanets: PlanetPosition[];
  natalHouses: HouseInfo[];
  lagnaRasi: number;
  onNavigateToGuidance?: () => void;
  onNavigateToMonthly?: () => void;
  onNavigateToDasha?: () => void;
  onNavigateToNorthIndianLife?: () => void;
}

export function LifeEventsMattersTab({
  activeProfile,
  profiles,
  natalPlanets,
  natalHouses,
  lagnaRasi,
  onNavigateToGuidance,
  onNavigateToMonthly,
  onNavigateToDasha,
  onNavigateToNorthIndianLife,
}: LifeEventsMattersTabProps) {
  const [viewMode, setViewMode] = useState<'north_indian_all' | 'event_probabilities'>('north_indian_all');
  const seekerName = activeProfile?.name || 'Seeker';
  const ascendantSign = VEDIC_RASIS[lagnaRasi - 1]?.sanskritName || 'Mesha';

  const aspects = useMemo(() => {
    return computeLifeAspectProbabilities(natalPlanets, natalHouses, lagnaRasi);
  }, [natalPlanets, natalHouses, lagnaRasi]);

  // Key summary probabilities
  const businessAspect = aspects.find((a) => a.id === 'business');
  const homeAspect = aspects.find((a) => a.id === 'home');
  const kidsAspect = aspects.find((a) => a.id === 'kids_progeny');
  const marriageAspect = aspects.find((a) => a.id === 'marriage_time');
  const govtAspect = aspects.find((a) => a.id === 'governance_private_job');
  const foreignAspect = aspects.find((a) => a.id === 'foreign_settlement');

  return (
    <div className="space-y-3.5 pb-8 animate-in fade-in duration-150 bg-[#F4ECE1] p-3 sm:p-4 rounded-xl border border-amber-900/20 shadow-xs">
      {/* Top Banner / Seeker Context */}
      <div className="bg-gradient-to-r from-[#2B1307] via-[#481E09] to-[#250F05] text-amber-100 rounded-xl p-3.5 sm:p-5 border border-amber-500/30 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-56 h-56 text-amber-300" fill="currentColor">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
            <polygon points="50,5 90,85 10,85" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <polygon points="50,95 90,15 10,15" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
                Vedic Destiny Matrix
              </span>
              <span className="text-amber-400 text-xs">•</span>
              <span className="text-[12px] text-amber-200/90 font-medium">
                Parashari &amp; Jaimini Bhavas
              </span>
            </div>

            <h1 className="font-vedic font-black text-xl sm:text-2xl text-amber-50 tracking-tight flex items-center space-x-2">
              <span>Life Events &amp; Matters Analysis</span>
            </h1>

            <p className="text-[13px] text-amber-200/80 max-w-2xl leading-relaxed">
              Algorithmic calculations of probabilities, karmic turning points, and timing windows
              (Lagna: {ascendantSign}, Born: {activeProfile?.birthDate || 'N/A'}).
            </p>
          </div>

          {/* Quick jump navigation button */}
          {onNavigateToGuidance && (
            <button
              type="button"
              onClick={onNavigateToGuidance}
              className="self-start md:self-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold px-3.5 py-2 rounded-lg text-[12.5px] flex items-center space-x-1.5 shadow-md cursor-pointer transition-all shrink-0 border border-amber-300"
            >
              <Compass className="w-4 h-4 text-amber-900" />
              <span>Go to Personalized Guidance</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Snapshot Probability Strip */}
        <div className="mt-4 pt-3.5 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="bg-amber-950/50 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-300/90 font-medium">
              <Briefcase className="w-3 h-3" />
              <span>Business Acumen</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-100 mt-0.5">
              {businessAspect?.probability || 74}%
            </div>
            <div className="text-[10px] text-amber-300/70 truncate">{businessAspect?.probabilityTier || 'High'}</div>
          </div>

          <div className="bg-amber-950/50 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-300/90 font-medium">
              <Home className="w-3 h-3" />
              <span>Home Acquisition</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-100 mt-0.5">
              {homeAspect?.probability || 82}%
            </div>
            <div className="text-[10px] text-amber-300/70 truncate">{homeAspect?.probabilityTier || 'High'}</div>
          </div>

          <div className="bg-amber-950/50 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-300/90 font-medium">
              <Baby className="w-3 h-3" />
              <span>Progeny Blessing</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-100 mt-0.5">
              {kidsAspect?.probability || 78}%
            </div>
            <div className="text-[10px] text-amber-300/70 truncate">Santan Yoga</div>
          </div>

          <div className="bg-amber-950/50 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-300/90 font-medium">
              <Calendar className="w-3 h-3" />
              <span>Marriage Harmony</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-100 mt-0.5">
              {marriageAspect?.probability || 70}%
            </div>
            <div className="text-[10px] text-amber-300/70 truncate">{marriageAspect?.timingWindow.split(':')[1]?.trim() || 'Favorable'}</div>
          </div>

          <div className="bg-amber-950/50 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-300/90 font-medium">
              <Building2 className="w-3 h-3" />
              <span>Govt Job Authority</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-100 mt-0.5">
              {govtAspect?.probability || 62}%
            </div>
            <div className="text-[10px] text-amber-300/70 truncate">{govtAspect?.probabilityTier || 'Moderate'}</div>
          </div>

          <div className="bg-amber-950/50 border border-amber-500/20 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-300/90 font-medium">
              <Globe className="w-3 h-3" />
              <span>Foreign Relocation</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-100 mt-0.5">
              {foreignAspect?.probability || 65}%
            </div>
            <div className="text-[10px] text-amber-300/70 truncate">Videsh Vasa</div>
          </div>
        </div>
      </div>

      {/* View Switcher: North Indian 12-Bhava Spectrum vs Karmic Event Probabilities */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#E8DEC8] p-1.5 rounded-lg border border-amber-900/10">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('north_indian_all')}
            className={`px-3 py-1.5 rounded-md font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'north_indian_all'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'text-stone-700 hover:bg-amber-100 hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>North Indian 12-Bhava Life Spectrum (All Aspects)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('event_probabilities')}
            className={`px-3 py-1.5 rounded-md font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'event_probabilities'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'text-stone-700 hover:bg-amber-100 hover:text-stone-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Karmic Life Probabilities (Job, Marriage, Assets, Windfall)</span>
          </button>
        </div>

        {onNavigateToNorthIndianLife && (
          <button
            type="button"
            onClick={onNavigateToNorthIndianLife}
            className="text-[11px] font-semibold text-amber-900 hover:underline flex items-center space-x-1 px-2 cursor-pointer"
          >
            <span>Full Dedicated Tab</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {viewMode === 'north_indian_all' ? (
        <NorthIndianLifeAspectsTab
          activeProfile={activeProfile}
          profiles={profiles}
          natalPlanets={natalPlanets}
          natalHouses={natalHouses}
          lagnaRasi={lagnaRasi}
          onNavigateToGuidance={onNavigateToGuidance}
          onNavigateToMonthly={onNavigateToMonthly}
          onNavigateToDasha={onNavigateToDasha}
        />
      ) : (
        <>
          {/* Main Probability Section Component */}
          <LifeAspectProbabilitySection
            natalPlanets={natalPlanets}
            natalHouses={natalHouses}
            lagnaRasi={lagnaRasi}
            userName={seekerName}
          />
        </>
      )}

      {/* Classical Principles Card */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-4 shadow-3xs space-y-2.5">
        <div className="flex items-center space-x-2 text-stone-800 font-bold text-[13px]">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Classical Methodology &amp; Shastric Grounding</span>
        </div>
        <p className="text-[12px] text-stone-600 leading-relaxed">
          Probabilities are synthesised across three canonical Jyotish pillars:{' '}
          <strong className="text-stone-800 font-semibold">1. Bhava Adhipati Strength</strong> (placements of house lords in Kendra, Trikona, or Dusthana houses),{' '}
          <strong className="text-stone-800 font-semibold">2. Naisargika Karakatva</strong> (essential planetary significators such as Budha for trade, Mangal for land, Shukra for marriage/vehicles, Guru for children, and Surya for government authority), and{' '}
          <strong className="text-stone-800 font-semibold">3. Special Parashari Yogas</strong> (such as Budhaditya, Bhoomi Karaka, Shatru Hanta, and Raja Yogas). Timing windows align with active Mahadashas and planetary Gochar transits.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11.5px]">
          {onNavigateToMonthly && (
            <button
              type="button"
              onClick={onNavigateToMonthly}
              className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>View 12-Month Life Path Forecast</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>View Vimshottari Dasha Sequence</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
