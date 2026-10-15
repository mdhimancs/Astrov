import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Zap,
  Target,
  Crown,
  AlertTriangle,
  Flame,
  Star,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PlaceValue } from './PlaceOfBirthInput';
import { UserProfile } from '../types';
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
        lng: currentProfile.longitude ?? 77.209,
        tz: currentProfile.timezone ?? 5.5,
      });
    }
  }, [currentProfile]);

  // Generate All Critical Transits and Life Milestones + Cheiro's Blueprint
  const {
    milestones,
    bestCareerPeriods,
    bestEducationPeriods,
    bestWealthPeriods,
    currentPeriod,
    cheiroSummary,
    vimshottariDasha,
  } = useMemo(() => {
    return generateLifeMilestonesAndCriticalTransits(
      birthDate,
      birthTime,
      selectedCity.lat,
      selectedCity.lng
    );
  }, [birthDate, birthTime, selectedCity.lat, selectedCity.lng]);

  // Find active Mahadasha cycle item and its Tri-Bhaga stage
  const activeMahadashaCycleItem = useMemo(() => {
    if (!vimshottariDasha || !currentPeriod) return null;
    return vimshottariDasha.cycle.find((c) => c.planet === currentPeriod.mahadashaLord) || null;
  }, [vimshottariDasha, currentPeriod]);

  const activeDashaPart = useMemo(() => {
    if (!activeMahadashaCycleItem?.parts) return null;
    return activeMahadashaCycleItem.parts.find((p) => p.isCurrent) || activeMahadashaCycleItem.parts[0];
  }, [activeMahadashaCycleItem]);

  // Filter States
  const [selectedDomain, setSelectedDomain] = useState<LifeMilestoneDomain | 'All'>('All');
  const [selectedTiming, setSelectedTiming] = useState<'All' | 'Past' | 'Current' | 'Future'>('All');

  // Selected Milestone for Detailed Reading in the Reading Panel (defaults to Current Active Dasha)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(() => currentPeriod?.id || null);
  const readingPanelRef = useRef<HTMLDivElement>(null);
  const activeYearTabRef = useRef<HTMLButtonElement>(null);
  const horizontalTabsContainerRef = useRef<HTMLDivElement>(null);
  const activeDeckCardRef = useRef<HTMLDivElement>(null);
  const deckContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectMilestone = (id: string) => {
    setSelectedMilestoneId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && readingPanelRef.current) {
      readingPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetToActiveDasha = () => {
    if (currentPeriod) {
      setSelectedDomain('All');
      setSelectedTiming('All');
      handleSelectMilestone(currentPeriod.id);
    }
  };

  // Sync state when profile changes
  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name);
      setBirthDate(currentProfile.birthDate);
      setBirthTime(currentProfile.birthTime);
      setSelectedCity({
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.209,
        tz: currentProfile.timezone ?? 5.5,
      });
      setSelectedMilestoneId(null);
    }
  }, [currentProfile]);

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

      return true;
    });
  }, [milestones, selectedDomain, selectedTiming]);

  // Ensure default selected milestone is always the Current Active Dasha
  useEffect(() => {
    if (currentPeriod?.id) {
      if (!selectedMilestoneId || !filteredMilestones.some((m) => m.id === selectedMilestoneId)) {
        setSelectedMilestoneId(currentPeriod.id);
      }
    } else if (filteredMilestones.length > 0 && !selectedMilestoneId) {
      setSelectedMilestoneId(filteredMilestones[0].id);
    }
  }, [currentPeriod?.id, filteredMilestones, selectedMilestoneId]);

  // Auto-scroll horizontal tabs & vertical deck to current active dasha
  useEffect(() => {
    if (activeYearTabRef.current && horizontalTabsContainerRef.current) {
      activeYearTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    if (activeDeckCardRef.current && deckContainerRef.current) {
      activeDeckCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentPeriod?.id, selectedDomain, selectedTiming]);

  const activeMilestone = useMemo(() => {
    if (selectedMilestoneId) {
      const found = milestones.find((m) => m.id === selectedMilestoneId);
      if (found) return found;
    }
    return (
      currentPeriod ||
      milestones.find((m) => m.isCurrent) ||
      filteredMilestones.find((m) => m.isCurrent) ||
      filteredMilestones[0] ||
      milestones[0]
    );
  }, [milestones, filteredMilestones, selectedMilestoneId, currentPeriod]);

  // Key Top Recommendations
  const topEducationEra = bestEducationPeriods[0];
  const topCareerEra = bestCareerPeriods.find((m) => m.isCurrent) || bestCareerPeriods[0];
  const topWealthEra = bestWealthPeriods.find((m) => m.status === 'Future Best') || bestWealthPeriods[0];

  const getDomainIcon = (domain: LifeMilestoneDomain) => {
    switch (domain) {
      case 'Career': return Briefcase;
      case 'Education': return GraduationCap;
      case 'Wealth & Property': return Coins;
      case 'Marriage & Family': return Heart;
      case 'Spiritual & Foreign': return Globe2;
      case 'Health & Restructuring': return ShieldAlert;
      default: return Award;
    }
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
            <h1 className="text-[17px] font-vedic font-bold text-stone-900 leading-tight">
              Life Milestones &amp; Critical Transits
            </h1>
          </div>
          <p className="text-[12px] text-stone-600">
            Interactive multi-decade life periods synchronized with Vimshottari Dasha, Double-Transit law, and Cheiro’s blueprint
          </p>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded border border-purple-300 bg-purple-50 text-purple-900 text-[13px] font-semibold transition-colors cursor-pointer shadow-3xs hover:bg-purple-100"
            >
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <span>Dasha</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 CURRENT ACTIVE DASHA — PROMINENT DEFAULT DISPLAY HERO SHOWCASE */}
      {currentPeriod && (
        <div className="bg-gradient-to-r from-amber-500/10 via-[#FAF7F0] to-purple-500/10 rounded-xl border-2 border-amber-400/90 p-3 shadow-2xs space-y-2 relative overflow-hidden">
          {/* Fine Line indicator representing active Dasha potency */}
          <div className="h-1 -mx-3 -mt-3 mb-2 flex">
            <div
              className={`h-full ${
                currentPeriod.ratingStars >= 4.5
                  ? 'bg-emerald-500'
                  : currentPeriod.ratingStars >= 3.8
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              } w-full transition-all`}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300/60 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-300 shrink-0" />
              <div className="flex items-center space-x-1.5 flex-wrap">
                <h2 className="font-vedic font-bold text-amber-950 text-[14px] uppercase tracking-wider">
                  Current Active Dasha &amp; Milestone
                </h2>
                <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-3xs">
                  Active Now
                </span>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded shadow-3xs">
                  Default Display
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded text-[11px] shadow-3xs">
                {currentPeriod.periodStartMonthYear} – {currentPeriod.periodEndMonthYear} (Age {currentPeriod.startAge}–{currentPeriod.endAge})
              </span>
              <button
                type="button"
                onClick={() => handleSelectMilestone(currentPeriod.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded shadow-3xs transition-colors cursor-pointer flex items-center space-x-1 ${
                  selectedMilestoneId === currentPeriod.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white'
                }`}
              >
                <span>{selectedMilestoneId === currentPeriod.id ? '● Reading Active' : 'Open Full Reading'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
            {/* Active Dasha Alignment & Predictions */}
            <div className="lg:col-span-8 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-bold text-purple-950 bg-white/95 border border-purple-200 px-2.5 py-0.5 rounded shadow-3xs flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600 inline mr-1" />
                  <span>{currentPeriod.mahadashaLord} Mahadasha • {currentPeriod.antardashaLord} Antardasha</span>
                </span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded">
                  {currentPeriod.primaryDomain} • {currentPeriod.ratingLabel}
                </span>
                {activeDashaPart && (
                  <span className="text-[10.5px] font-semibold text-stone-700 bg-white/80 border border-stone-200 px-2 py-0.5 rounded">
                    Stage: {activeDashaPart.stage}
                  </span>
                )}
                {activeMahadashaCycleItem?.strengthInfo && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeMahadashaCycleItem.strengthInfo.rating === 'Strong'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : activeMahadashaCycleItem.strengthInfo.rating === 'Weak'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    Strength: {activeMahadashaCycleItem.strengthInfo.rating} ({activeMahadashaCycleItem.strengthInfo.score}/10)
                  </span>
                )}
              </div>

              <h3 className="font-vedic font-bold text-stone-950 text-[15px] leading-snug">
                {currentPeriod.verdictHeadline}
              </h3>

              <div className="space-y-1 text-[12px] text-stone-800">
                {currentPeriod.predictivePoints.slice(0, 3).map((point, idx) => (
                  <p key={idx} className="leading-snug bg-white/70 rounded px-2 py-1 border border-amber-100">
                    {point}
                  </p>
                ))}
              </div>
            </div>

            {/* Gochar Double Transit & Strategic Directive */}
            <div className="lg:col-span-4 bg-white/95 rounded-lg border border-amber-200/90 p-2.5 space-y-1.5 shadow-3xs">
              <div className="flex items-center space-x-1 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Gochar Double-Transit Lock</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-snug">
                {currentPeriod.doubleTransitVerdict}
              </p>
              <div className="border-t border-stone-200/70 pt-1 text-[11px] text-stone-800">
                <span className="text-amber-800 font-bold">Strategic Directive: </span>
                {currentPeriod.strategicAdvice}
              </div>
              {onNavigateToDasha && (
                <button
                  type="button"
                  onClick={onNavigateToDasha}
                  className="w-full mt-1 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Layers className="w-3 h-3 text-purple-700" />
                  <span>Inspect Sub-Periods &amp; Fine Lines in Dasha Tab</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHEIRO'S MASTER PREDICTIVE BLUEPRINT CARD */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-amber-200 px-2.5 py-2 shadow-3xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-100 pb-1">
          <div className="flex items-center space-x-2">
            <div className="text-amber-900 font-serif font-bold text-[18px]">
              {cheiroSummary.cheiroArchetype}
            </div>
            <span className="text-[11px] text-stone-500 font-semibold hidden md:inline">
              (Chaldean &amp; Vedic Synthesis)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[12px] font-black uppercase tracking-wider">
            <div className="text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Root {cheiroSummary.birthNumber} ({cheiroSummary.rulingPlanet})
            </div>
            <div className="text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              Destiny {cheiroSummary.destinyNumber}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[12px]">
          {/* Fateful Turning Ages */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
              Fateful Turning Ages
            </div>
            <div className="flex flex-wrap gap-1">
              {cheiroSummary.fatefulTurningAges.slice(0, 6).map((age) => (
                <span key={age} className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 font-bold font-mono">
                  {age}
                </span>
              ))}
            </div>
          </div>

          {/* Core Predictive Law */}
          <div className="space-y-0.5 md:col-span-3">
            <div className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
              Destiny Law &amp; Motto
            </div>
            <p className="text-[12px] text-stone-700 italic leading-snug">
              "{cheiroSummary.corePredictiveMotto}"
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & DOMAIN NAVIGATION BAR */}
      <div className="bg-white rounded-lg border border-stone-200/90 px-2.5 py-1.5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Domain Filter Cards */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'All', label: 'All Domains', icon: Compass },
            { id: 'Career', label: 'Career', icon: Briefcase },
            { id: 'Wealth & Property', label: 'Wealth', icon: Coins },
            { id: 'Marriage & Family', label: 'Family', icon: Heart },
          ].map((d) => {
            const Icon = d.icon;
            const isActive = selectedDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id as any)}
                className={`rounded-md px-2 py-1 text-[11px] font-vedic font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-white'
                }`}
              >
                <span>{d.label}</span>
                <Icon className={`w-3 h-3 ${isActive ? 'text-amber-800' : 'text-stone-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Timing Filter Cards with Quick Jump to Current Active Dasha */}
        <div className="flex flex-wrap items-center gap-1">
          {currentPeriod && (
            <button
              type="button"
              onClick={handleResetToActiveDasha}
              className={`px-2.5 py-0.5 rounded text-[11px] font-vedic font-black shadow-3xs cursor-pointer flex items-center space-x-1.5 transition-all mr-1 ${
                selectedMilestoneId === currentPeriod.id
                  ? 'bg-amber-700 text-white ring-2 ring-amber-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Current Dasha (Default)</span>
            </button>
          )}

          {(['All', 'Past', 'Current', 'Future'] as const).map((timing) => {
            const isActive = selectedTiming === timing;
            return (
              <button
                key={timing}
                onClick={() => setSelectedTiming(timing)}
                className={`rounded px-2 py-0.5 text-[11px] font-vedic font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-white'
                }`}
              >
                {timing}
              </button>
            );
          })}
        </div>
      </div>

      {/* HORIZONTAL YEAR PERIOD TAB SELECTOR & ACTIVE PERIOD BRIEF */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-amber-200/90 p-2 shadow-3xs space-y-2">
        <div className="flex items-center justify-between border-b border-stone-100 pb-1">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-vedic font-bold text-stone-900 text-[12px] uppercase tracking-wider">
              Year Period Tab Selector
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {filteredMilestones.length} Periods Available • Click any year to open reading
          </span>
        </div>

        {/* Horizontal Year Tabs with Auto-Scroll to Active Dasha */}
        <div
          ref={horizontalTabsContainerRef}
          className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin"
        >
          {filteredMilestones.map((m) => {
            const isSelected = selectedMilestoneId === m.id;
            const startYear = m.periodStartMonthYear.split('-')[0];
            const endYear = m.periodEndMonthYear.split('-')[0];
            return (
              <button
                key={m.id}
                ref={m.isCurrent ? activeYearTabRef : undefined}
                type="button"
                onClick={() => handleSelectMilestone(m.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold font-mono whitespace-nowrap transition-all cursor-pointer border flex items-center space-x-1 shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-700 shadow-2xs ring-1 ring-amber-400'
                    : m.isCurrent
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300 shadow-3xs font-black'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-amber-300 hover:bg-white'
                }`}
              >
                <span>{startYear}–{endYear}</span>
                {m.isCurrent && (
                  <span className={`text-[9px] px-1 py-0.1 rounded font-black uppercase flex items-center space-x-0.5 ${
                    isSelected ? 'bg-amber-800 text-amber-100' : 'bg-amber-600 text-white'
                  }`}>
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    <span>Now</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Period Brief Banner Inside Tab Selector */}
        {activeMilestone && (
          <div className="bg-gradient-to-r from-amber-50/95 via-[#FDFBF7] to-purple-50/70 border border-amber-200/80 rounded-md p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs">
            <div className="flex items-start sm:items-center space-x-2 min-w-0">
              <span className="px-2 py-0.5 rounded bg-amber-800 text-white font-mono font-bold text-[11px] shrink-0 shadow-3xs">
                {activeMilestone.periodStartMonthYear.split('-')[0]} – {activeMilestone.periodEndMonthYear.split('-')[0]} Brief
              </span>
              <div className="min-w-0 text-[12px] text-stone-800 leading-snug">
                <strong className="text-stone-950 font-vedic mr-1">
                  {activeMilestone.verdictHeadline}:
                </strong>
                <span className="text-stone-700">
                  {activeMilestone.predictivePoints[0] || activeMilestone.dashaDescription}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0 text-[11px]">
              <span className="font-semibold text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                {activeMilestone.mahadashaLord} – {activeMilestone.antardashaLord}
              </span>
              <span className="font-bold text-amber-900 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded">
                Age {activeMilestone.startAge}–{activeMilestone.endAge}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MASTER-DETAIL LAYOUT: VERTICAL DECK OF YEAR PERIOD CARDS (LEFT) + EXPANDED READING PANEL (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        {/* LEFT COLUMN: VERTICAL DECK OF YEARS & PERIOD CARDS */}
        <div ref={deckContainerRef} className="lg:col-span-5 space-y-1.5 max-h-[750px] overflow-y-auto pr-0.5 scrollbar-thin">
          <div className="flex items-center justify-between px-1 text-[11px] text-stone-500 font-bold uppercase tracking-wider">
            <span>Vertical Deck of Years ({filteredMilestones.length})</span>
            <span>Select to open reading</span>
          </div>

          {filteredMilestones.map((m) => {
            const isSelected = selectedMilestoneId === m.id;
            const isCurrent = m.isCurrent;
            const isFuture = m.status === 'Future Best';
            const DomainIcon = getDomainIcon(m.primaryDomain);

            return (
              <div
                key={m.id}
                ref={m.isCurrent ? activeDeckCardRef : undefined}
                onClick={() => handleSelectMilestone(m.id)}
                className={`group rounded-lg border p-2.5 transition-all duration-150 cursor-pointer shadow-3xs space-y-1.5 relative ${
                  isSelected
                    ? 'bg-amber-50/95 border-amber-500 ring-2 ring-amber-400/90 shadow-xs'
                    : isCurrent
                    ? 'bg-gradient-to-r from-amber-100/70 via-white to-purple-100/60 border-2 border-amber-400 ring-1 ring-amber-300 shadow-2xs hover:border-amber-500'
                    : isFuture
                    ? 'bg-white border-stone-200 hover:border-amber-300 hover:bg-[#FAF8F5]'
                    : 'bg-[#FAF9F6] border-stone-200/80 hover:bg-white'
                }`}
              >
                {/* Year Header & Badges */}
                <div className="flex items-center justify-between gap-1 leading-none">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[13px] font-black font-vedic px-2 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-amber-200 text-amber-950 border-amber-400 font-bold'
                          : isCurrent
                          ? 'bg-amber-200/90 text-amber-950 border-amber-400 font-black'
                          : 'bg-stone-100 text-stone-900 border-stone-200'
                      }`}
                    >
                      {m.periodStartMonthYear.split('-')[0]} – {m.periodEndMonthYear.split('-')[0]}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Age {m.startAge}–{m.endAge}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-1">
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-600 text-white uppercase tracking-wider flex items-center space-x-1 shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse inline-block" />
                        <span>Active Now</span>
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        m.status === 'Current Best'
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : m.status === 'Future Best'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>

                {/* Brief Title & Dasha Tag */}
                <div className="flex items-start space-x-1.5 pt-0.5">
                  <DomainIcon
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      isSelected ? 'text-amber-800' : 'text-stone-500 group-hover:text-amber-700'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-[13px] font-vedic font-bold leading-snug truncate ${
                        isSelected ? 'text-stone-950' : 'text-stone-800'
                      }`}
                    >
                      {m.verdictHeadline}
                    </h3>
                  </div>
                </div>

                {/* DEDICATED PERIOD BRIEF CALLOUT BOX ON THE SELECTOR CARD */}
                <div
                  className={`rounded-md px-2.5 py-1.5 border text-[11.5px] leading-snug transition-colors ${
                    isSelected
                      ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-medium'
                      : 'bg-[#FAF8F5] border-stone-200/90 text-stone-700 group-hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-wider text-amber-900 mb-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                    <span>Period Brief:</span>
                  </div>
                  <p className="line-clamp-2">
                    {m.predictivePoints[0] || m.dashaDescription}
                  </p>
                </div>

                {/* Dasha & Domain Footer Tag in the selector card */}
                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                  <span className="font-semibold text-purple-900">
                    {m.mahadashaLord} – {m.antardashaLord}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold uppercase tracking-wider text-amber-900">
                      {m.primaryDomain}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isSelected ? 'text-amber-700' : 'text-stone-400 group-hover:text-stone-600'
                      }`}
                    >
                      {isSelected ? '● Reading Open' : 'Open Reading →'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: EXPANDED IN-DEPTH READING PANEL FOR THE SELECTED PERIOD */}
        <div className="lg:col-span-7" ref={readingPanelRef}>
          {activeMilestone ? (
            <div className="bg-white rounded-lg border border-amber-200/90 p-3 shadow-2xs space-y-3 sticky top-14">
              {/* CURRENT ACTIVE DASHA STATUS BANNER IN READING PANEL */}
              {activeMilestone.isCurrent ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px] shadow-3xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-200" />
                    <span className="font-vedic font-bold text-emerald-950 uppercase tracking-wide">
                      Current Active Dasha — Default Display
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                    Live Period Now
                  </span>
                </div>
              ) : currentPeriod ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px] shadow-3xs">
                  <span className="text-stone-700">
                    Viewing Selected Era: <strong>{activeMilestone.periodStartMonthYear.split('-')[0]}–{activeMilestone.periodEndMonthYear.split('-')[0]}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToActiveDasha}
                    className="font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/90 px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>← Return to Current Active Dasha</span>
                  </button>
                </div>
              ) : null}

              {/* Reading Header Banner */}
              <div className="bg-gradient-to-r from-amber-50/90 via-white to-purple-50/80 rounded-md border border-amber-300 p-2.5 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-200/70 pb-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-800 text-white font-black text-[13px] font-mono">
                      {activeMilestone.periodStartMonthYear} – {activeMilestone.periodEndMonthYear}
                    </span>
                    <span className="text-[12px] font-bold text-stone-700">
                      (Age {activeMilestone.startAge} – {activeMilestone.endAge})
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold uppercase tracking-wider">
                    {activeMilestone.ratingLabel}
                  </span>
                </div>

                <div className="pt-1">
                  <h2 className="text-[16px] font-vedic font-black text-stone-950 leading-snug">
                    {activeMilestone.verdictHeadline}
                  </h2>
                  <p className="text-[12px] text-purple-950 font-bold uppercase tracking-wide mt-0.5">
                    Active Dasha: {activeMilestone.mahadashaLord} Mahadasha • {activeMilestone.antardashaLord} Antardasha
                  </p>
                </div>
              </div>

              {/* Cheiro Turning Point & Numerology Synchronicity */}
              <div className="bg-[#FAF8F5] rounded-md border border-amber-200/80 p-2 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[12px] uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Cheiro's Numerical Turning Point</span>
                </div>
                <p className="text-[12px] text-stone-800 leading-snug">
                  {activeMilestone.cheiroTurningPoint}
                </p>
              </div>

              {/* Comprehensive Predictive Breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center space-x-1.5 text-stone-900 font-bold text-[13px] font-vedic">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Predictions for this Period</span>
                </div>
                <div className="space-y-1.5 text-[12px] text-stone-800">
                  {activeMilestone.predictivePoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/40 rounded p-2 border border-amber-200/60 leading-snug flex items-start space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Double-Transit Law & Astrological Mechanism */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
                <div className="bg-white rounded border border-purple-200 p-2 space-y-1">
                  <span className="text-[11px] font-black uppercase text-purple-900 block flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-purple-700" />
                    <span>Double-Transit Law (Gochar)</span>
                  </span>
                  <p className="text-stone-700 leading-snug">
                    {activeMilestone.doubleTransitVerdict}
                  </p>
                </div>

                <div className="bg-white rounded border border-amber-200 p-2 space-y-1">
                  <span className="text-[11px] font-black uppercase text-amber-900 block flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-amber-700" />
                    <span>Astrological Mechanism</span>
                  </span>
                  <p className="text-stone-700 leading-snug">
                    {activeMilestone.astrologicalMechanism}
                  </p>
                </div>
              </div>

              {/* Strategic Action Plan for this Period */}
              <div className="bg-emerald-50/50 rounded-md border border-emerald-200 p-2.5 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-950 font-bold text-[13px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Strategic Action Plan &amp; Karmic Focus</span>
                </div>
                <p className="text-[12px] text-stone-800 leading-snug">
                  {activeMilestone.strategicAdvice}
                </p>
              </div>

              {/* Critical Transits Alignment Tag */}
              <div className="text-[11px] text-stone-500 font-semibold border-t border-stone-100 pt-1.5 flex items-center justify-between">
                <span>Gochar: {activeMilestone.criticalTransits.summary}</span>
                <span className="text-amber-800 font-bold">Domain: {activeMilestone.primaryDomain}</span>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-lg border border-stone-200 p-6 text-center text-stone-500 text-[13px]">
              Select any year period from the left deck to view its full astrological reading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
