import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Compass,
  Briefcase,
  GraduationCap,
  Coins,
  Heart,
  Globe2,
  ShieldAlert,
  Award,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Printer,
  Info,
  Zap,
  Target,
  Crown,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { ProfileSelector } from './ProfileSelector';
import { PlaceValue } from './PlaceOfBirthInput';
import { UserProfile } from '../types';
import {
  getSavedProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/profileStorage';
import {
  generateLifeMilestonesAndCriticalTransits,
  LifeMilestoneDomain,
  CriticalDashaTransitMilestone,
} from '../utils/dashaTransitMilestones';

interface CriticalDashaTransitsTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
  onNavigateToDasha?: () => void;
  onNavigateToMonthWise?: () => void;
}

export function CriticalDashaTransitsTab({
  activeProfileId,
  profiles,
  onNavigateToDasha,
  onNavigateToMonthWise,
}: CriticalDashaTransitsTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Seeker parameters
  const [name, setName] = useState(currentProfile?.name || 'Munish Sharma');
  const [birthDate, setBirthDate] = useState(currentProfile?.birthDate || '1990-05-18');
  const [birthTime, setBirthTime] = useState(currentProfile?.birthTime || '07:30');
  const [selectedCity, setSelectedCity] = useState<PlaceValue>(() => {
    if (currentProfile?.place) {
      return {
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.209,
        tz: currentProfile.timezone ?? 5.5,
      };
    }
    return {
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.209,
      tz: 5.5,
    };
  });

  // Sync state when profile changes
  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name);
      setBirthDate(currentProfile.birthDate);
      setBirthTime(currentProfile.birthTime);
      setSelectedCity({
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.2090,
        tz: currentProfile.timezone ?? 5.5,
      });
    }
  }, [currentProfile]);

  // Filter States
  const [selectedDomain, setSelectedDomain] = useState<LifeMilestoneDomain | 'All'>('All');
  const [selectedTiming, setSelectedTiming] = useState<'All' | 'Past' | 'Current' | 'Future'>('All');
  const [searchDasha, setSearchDasha] = useState<string>('');

  // Handle Profile Switch
  // Generate All Critical Transits and Life Milestones + Cheiro's Blueprint
  const {
    milestones,
    bestCareerPeriods,
    bestEducationPeriods,
    bestWealthPeriods,
    currentPeriod,
    cheiroSummary,
  } = useMemo(() => {
    return generateLifeMilestonesAndCriticalTransits(
      birthDate,
      birthTime,
      selectedCity.lat,
      selectedCity.lng
    );
  }, [birthDate, birthTime, selectedCity.lat, selectedCity.lng]);

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      // Domain filter
      if (selectedDomain !== 'All') {
        if (m.primaryDomain !== selectedDomain && m.secondaryDomain !== selectedDomain) {
          return false;
        }
      }

      // Timing filter
      if (selectedTiming === 'Past' && m.status !== 'Past Best') return false;
      if (selectedTiming === 'Current' && !m.isCurrent) return false;
      if (selectedTiming === 'Future' && m.status !== 'Future Best') return false;

      // Dasha text search
      if (searchDasha.trim()) {
        const query = searchDasha.toLowerCase();
        const matchesMaha = m.mahadashaLord.toLowerCase().includes(query);
        const matchesAntar = m.antardashaLord.toLowerCase().includes(query);
        const matchesHeadline = m.verdictHeadline.toLowerCase().includes(query);
        const matchesTransit = m.criticalTransits.summary.toLowerCase().includes(query);
        if (!matchesMaha && !matchesAntar && !matchesHeadline && !matchesTransit) return false;
      }

      return true;
    });
  }, [milestones, selectedDomain, selectedTiming, searchDasha]);

  // Key Top Recommendations
  const topEducationEra = bestEducationPeriods[0];
  const topCareerEra = bestCareerPeriods.find((m) => m.isCurrent) || bestCareerPeriods[0];
  const topWealthEra = bestWealthPeriods.find((m) => m.status === 'Future Best') || bestWealthPeriods[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full p-0.5 space-y-0.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5DEC9] pb-0.5">
        <div>
          <div className="flex items-center space-x-1">
            <span className="p-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              <Crown className="w-2.5 h-2.5 text-amber-800" />
            </span>
            <h1 className="text-sm font-vedic font-bold text-stone-900 leading-tight">
              Life Milestones
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border border-purple-300 bg-purple-50 text-purple-900 text-[10px] font-semibold transition-colors cursor-pointer shadow-3xs"
            >
              <Layers className="w-2.5 h-2.5 text-purple-700" />
              <span>Dasha</span>
            </button>
          )}
        </div>
      </div>

      {/* CHEIRO'S MASTER PREDICTIVE BLUEPRINT CARD */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200 px-1 py-1 shadow-3xs space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-100 pb-0.5">
          <div className="flex items-center space-x-1">
            <div className="text-amber-800 font-serif font-bold text-base">
              {cheiroSummary.cheiroArchetype}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest">
            <div className="text-amber-800">
              Root {cheiroSummary.birthNumber}
            </div>
            <div className="text-purple-800">
              Destiny {cheiroSummary.destinyNumber}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[9px]">
          {/* Fateful Turning Ages */}
          <div className="space-y-0.5">
            <div className="text-[7px] font-black text-stone-400 uppercase tracking-widest">
              Fateful Ages
            </div>
            <div className="flex flex-wrap gap-1">
              {cheiroSummary.fatefulTurningAges.slice(0, 6).map((age) => (
                <span key={age} className="font-bold text-amber-900">
                  {age}
                </span>
              ))}
            </div>
          </div>

          {/* Core Predictive Law */}
          <div className="space-y-0.5 col-span-3">
            <div className="text-[7px] font-black text-amber-800 uppercase tracking-widest">
              Destiny Law
            </div>
            <p className="text-[9px] text-stone-500 italic leading-tight">
              "{cheiroSummary.corePredictiveMotto}"
            </p>
          </div>
        </div>
      </div>

      {/* EXECUTIVE HIGHLIGHTS: 4 DOMAIN KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
        {[
          { domain: 'Career', era: topCareerEra, icon: Briefcase, color: 'amber' },
          { domain: 'Education', era: topEducationEra, icon: GraduationCap, color: 'sky' },
          { domain: 'Wealth', era: topWealthEra, icon: Coins, color: 'emerald' },
          { domain: 'Current', era: currentPeriod, icon: Sparkles, color: 'purple' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-stone-100 p-1 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-0.5">
              <kpi.icon className={`w-2.5 h-2.5 text-${kpi.color}-700`} />
              <span className={`text-[7px] font-black uppercase tracking-widest text-${kpi.color}-600`}>
                {kpi.era?.isCurrent ? 'Active' : kpi.era?.status === 'Past Best' ? 'Past' : 'Future'}
              </span>
            </div>
            <div className="text-[9px] font-bold text-stone-800 leading-tight mb-0">
              {kpi.era?.periodStartMonthYear.split('-')[0]} – {kpi.era?.periodEndMonthYear.split('-')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & DOMAIN NAVIGATION BAR */}
      <div className="bg-white rounded-lg border border-stone-200/90 p-1 shadow-3xs space-y-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
          {/* Domain Segmented Control */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'All', label: 'All' },
              { id: 'Career', label: '💼 Career' },
              { id: 'Wealth & Property', label: '💰 Wealth' },
              { id: 'Marriage & Family', label: '💍 Family' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDomain(d.id as any)}
                className={`px-1.5 py-0 rounded transition-all text-[9px] font-medium cursor-pointer ${
                  selectedDomain === d.id
                    ? 'bg-amber-800 text-white shadow-3xs font-semibold'
                    : 'bg-[#FAF8F5] border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Timing Segmented Control */}
          <div className="flex items-center space-x-0.5">
            <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded border border-stone-200">
              {(['All', 'Past', 'Current', 'Future'] as const).map((timing) => (
                <button
                  key={timing}
                  type="button"
                  onClick={() => setSelectedTiming(timing)}
                  className={`px-1 py-0 rounded text-[8px] font-medium transition-colors cursor-pointer ${
                    selectedTiming === timing
                      ? 'bg-white text-stone-900 shadow-3xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {timing}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5 border-t border-stone-100">
          <span>
            Showing <strong>{filteredMilestones.length}</strong> life milestones calculated for <strong>{name}</strong>
          </span>
          <span className="italic">
            Synchronized with Gochar & Dasha
          </span>
        </div>
      </div>

      {/* MILESTONES TIMELINE LIST */}
      <div className="space-y-1">
        {filteredMilestones.map((m) => {
          const isCurrent = m.isCurrent;
          const isFuture = m.status === 'Future Best';

          return (
            <div
              key={m.id}
              className={`rounded-lg border p-1.5 transition-all duration-150 shadow-3xs space-y-1 ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-50/80 via-white to-purple-50/70 border-amber-400 shadow-xs'
                  : isFuture
                  ? 'bg-white border-[#E7DEC8]'
                  : 'bg-[#FCFAF6] border-stone-200/90'
              }`}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between gap-1 border-b border-stone-100 pb-0.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="px-1 py-0 rounded bg-amber-100/80 text-amber-950 font-bold text-[9px] border border-amber-200/80">
                    {m.periodStartMonthYear} – {m.periodEndMonthYear}
                  </span>
                  <span className="text-[8px] text-stone-500 font-medium">Age {m.startAge}-{m.endAge}</span>
                </div>
              </div>

              {/* Main Verdict Headline */}
              <div className="flex items-start space-x-1.5">
                <div className={`p-0.5 rounded shrink-0 ${isCurrent ? 'bg-amber-700 text-white' : 'bg-stone-700 text-white'}`}>
                  <Award className="w-2.5 h-2.5" />
                </div>
                <h3 className="font-vedic font-bold text-stone-900 text-[10px] leading-tight">
                  {m.verdictHeadline}
                </h3>
              </div>

              {/* Forecast Points */}
              <div className="bg-amber-50/50 rounded-lg border border-amber-200/70 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-stone-800 text-[9px] leading-tight">
                  {m.predictivePoints.slice(0, 2).map((point, idx) => (
                    <div key={idx} className="bg-white/90 p-1 rounded border border-amber-200/50">
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 text-[9px]">
                <div className="bg-white rounded border border-stone-100 p-1">
                  <p className="text-stone-600 leading-tight line-clamp-1">{m.astrologicalMechanism}</p>
                </div>
                <div className="bg-white rounded border border-amber-100 p-1">
                  <p className="text-stone-700 leading-tight line-clamp-1">{m.strategicAdvice}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
