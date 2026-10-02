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
    <div className="w-full space-y-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DEC9] pb-1.5">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-800" />
            </span>
            <h1 className="text-[18px] font-vedic font-bold text-stone-900 leading-tight">
              Life Milestones
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded border border-purple-300 bg-purple-50 text-purple-900 text-[14px] font-semibold transition-colors cursor-pointer shadow-3xs"
            >
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <span>Dasha</span>
            </button>
          )}
        </div>
      </div>

      {/* CHEIRO'S MASTER PREDICTIVE BLUEPRINT CARD */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-amber-200 px-2.5 py-2 shadow-3xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-100 pb-1">
          <div className="flex items-center space-x-1.5">
            <div className="text-amber-800 font-serif font-bold text-[20px]">
              {cheiroSummary.cheiroArchetype}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[13px] font-black uppercase tracking-wider">
            <div className="text-amber-800">
              Root {cheiroSummary.birthNumber}
            </div>
            <div className="text-purple-800">
              Destiny {cheiroSummary.destinyNumber}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[13px]">
          {/* Fateful Turning Ages */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-black text-stone-400 uppercase tracking-wider">
              Fateful Ages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cheiroSummary.fatefulTurningAges.slice(0, 6).map((age) => (
                <span key={age} className="font-bold text-amber-900">
                  {age}
                </span>
              ))}
            </div>
          </div>

          {/* Core Predictive Law */}
          <div className="space-y-0.5 md:col-span-3">
            <div className="text-[11px] font-black text-amber-800 uppercase tracking-wider">
              Destiny Law
            </div>
            <p className="text-[13px] text-stone-600 italic leading-snug">
              "{cheiroSummary.corePredictiveMotto}"
            </p>
          </div>
        </div>
      </div>

      {/* EXECUTIVE HIGHLIGHTS: 4 DOMAIN KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
        {[
          { domain: 'Career', era: topCareerEra, icon: Briefcase, color: 'amber' },
          { domain: 'Education', era: topEducationEra, icon: GraduationCap, color: 'sky' },
          { domain: 'Wealth', era: topWealthEra, icon: Coins, color: 'emerald' },
          { domain: 'Current', era: currentPeriod, icon: Sparkles, color: 'purple' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-stone-200/80 px-2.5 py-1.5 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <kpi.icon className={`w-3.5 h-3.5 text-${kpi.color}-700`} />
              <span className={`text-[11px] font-black uppercase tracking-wider text-${kpi.color}-600`}>
                {kpi.era?.isCurrent ? 'Active' : kpi.era?.status === 'Past Best' ? 'Past' : 'Future'}
              </span>
            </div>
            <div className="text-[13px] font-bold text-stone-800 leading-snug">
              {kpi.era?.periodStartMonthYear.split('-')[0]} – {kpi.era?.periodEndMonthYear.split('-')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & DOMAIN NAVIGATION BAR */}
      <div className="bg-white rounded-lg border border-stone-200/90 px-2.5 py-2 shadow-3xs space-y-1.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Domain Deck of Cards */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'All', label: 'All Domains', icon: Compass },
              { id: 'Career', label: 'Career', icon: Briefcase },
              { id: 'Wealth & Property', label: 'Wealth', icon: Coins },
              { id: 'Marriage & Family', label: 'Family', icon: Heart },
            ].map((d) => {
              const Icon = d.icon;
              const isActive = selectedDomain === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id as any)}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all cursor-pointer border flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{d.label}</span>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                </div>
              );
            })}
          </div>

          {/* Timing Deck of Cards */}
          <div className="flex flex-wrap items-center gap-1">
            {(['All', 'Past', 'Current', 'Future'] as const).map((timing) => {
              const isActive = selectedTiming === timing;
              return (
                <div
                  key={timing}
                  onClick={() => setSelectedTiming(timing)}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {timing}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1 text-[14px] text-stone-500 pt-1 border-t border-stone-100">
          <span>
            Showing <strong>{filteredMilestones.length}</strong> life milestones calculated for <strong>{name}</strong>
          </span>
          <span className="italic">
            Synchronized with Gochar & Dasha
          </span>
        </div>
      </div>

      {/* MILESTONES TIMELINE LIST */}
      <div className="space-y-2">
        {filteredMilestones.map((m) => {
          const isCurrent = m.isCurrent;
          const isFuture = m.status === 'Future Best';

          return (
            <div
              key={m.id}
              className={`rounded-lg border p-2.5 transition-all duration-150 shadow-3xs space-y-1.5 ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-50/80 via-white to-purple-50/70 border-amber-400 shadow-xs'
                  : isFuture
                  ? 'bg-white border-[#E7DEC8]'
                  : 'bg-[#FCFAF6] border-stone-200/90'
              }`}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100/80 text-amber-950 font-bold text-[13px] border border-amber-200/80">
                    {m.periodStartMonthYear} – {m.periodEndMonthYear}
                  </span>
                  <span className="text-[12px] text-stone-500 font-medium">Age {m.startAge}-{m.endAge}</span>
                </div>
              </div>

              {/* Main Verdict Headline */}
              <div className="flex items-start space-x-2">
                <div className={`p-1 rounded shrink-0 mt-0.5 ${isCurrent ? 'bg-amber-700 text-white' : 'bg-stone-700 text-white'}`}>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-vedic font-bold text-stone-900 text-[14px] leading-snug">
                  {m.verdictHeadline}
                </h3>
              </div>

              {/* Forecast Points */}
              <div className="bg-amber-50/50 rounded-lg border border-amber-200/70 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-stone-800 text-[13px] leading-snug">
                  {m.predictivePoints.slice(0, 2).map((point, idx) => (
                    <div key={idx} className="bg-white/90 p-1.5 rounded border border-amber-200/50">
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[13px]">
                <div className="bg-white rounded border border-stone-100 p-1.5">
                  <p className="text-stone-600 leading-snug">{m.astrologicalMechanism}</p>
                </div>
                <div className="bg-white rounded border border-amber-100 p-1.5">
                  <p className="text-stone-700 leading-snug">{m.strategicAdvice}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
