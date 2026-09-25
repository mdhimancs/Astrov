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
    <div className="w-full px-0.5 sm:px-1 py-1 space-y-1.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5DEC9] pb-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="p-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              <Crown className="w-3 h-3 text-amber-800" />
            </span>
            <h1 className="text-base sm:text-lg font-vedic font-bold text-stone-900 leading-tight">
              Master Astrologers' Life Milestones & Critical Transits
            </h1>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
            Synthesis of <strong>Cheiro's Predictive Timing</strong> & <strong>Dr. B.V. Raman's Parashari Double-Transit Laws</strong> • Short, Accurate & High-Conviction Forecasting
          </p>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
            title="Print Executive Life Timeline"
          >
            <Printer className="w-3 h-3 text-stone-500" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Layers className="w-3 h-3 text-purple-700" />
              <span>Vimshottari Dasha</span>
            </button>
          )}

          {onNavigateToMonthWise && (
            <button
              type="button"
              onClick={onNavigateToMonthWise}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3 h-3 text-amber-700" />
              <span>Month-Wise Transits</span>
            </button>
          )}
        </div>
      </div>

      {/* CHEIRO'S MASTER PREDICTIVE BLUEPRINT CARD */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 px-2 py-1.5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-100 pb-1.5">
          <div className="flex items-center space-x-2">
            <div className="text-amber-800 font-serif font-bold text-lg">
              {cheiroSummary.cheiroArchetype}
            </div>
            <div className="h-4 w-px bg-stone-200" />
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              Ruling: <span className="text-purple-800">{cheiroSummary.rulingPlanet}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-start sm:self-auto text-[10px] font-black uppercase tracking-widest">
            <div className="text-amber-800">
              Root <span className="text-stone-900">{cheiroSummary.birthNumber}</span>
            </div>
            <div className="text-purple-800">
              Destiny <span className="text-stone-900">{cheiroSummary.destinyNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Fateful Turning Ages */}
          <div className="space-y-1">
            <div className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
              Fateful Turning Ages
            </div>
            <div className="flex flex-wrap gap-1">
              {cheiroSummary.fatefulTurningAges.slice(0, 6).map((age) => (
                <span key={age} className="text-[10px] font-bold text-amber-900">
                  {age}
                </span>
              ))}
            </div>
          </div>

          {/* Fortunate Days & Power Dates */}
          <div className="space-y-1">
            <div className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
              Power Dates
            </div>
            <div className="text-[10px] font-bold text-stone-800">
              {cheiroSummary.luckyDates.slice(0, 4).join(', ')}th
            </div>
          </div>

          {/* Power Colors */}
          <div className="space-y-1">
            <div className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
              Colors & Gems
            </div>
            <div className="text-[10px] text-stone-600 font-bold">
              {cheiroSummary.powerColors.slice(0, 2).join(', ')} • {cheiroSummary.luckyGems[0]}
            </div>
          </div>

          {/* Core Predictive Law */}
          <div className="space-y-1">
            <div className="text-[8px] font-black text-amber-800 uppercase tracking-widest">
              Destiny Law
            </div>
            <p className="text-[10px] text-stone-500 italic leading-tight">
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
          <div key={idx} className="bg-white rounded-xl border border-stone-100 p-2 shadow-3xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <kpi.icon className={`w-3 h-3 text-${kpi.color}-700`} />
              <span className={`text-[8px] font-black uppercase tracking-widest text-${kpi.color}-600`}>
                {kpi.era?.isCurrent ? 'Active' : kpi.era?.status === 'Past Best' ? 'Past' : 'Future'}
              </span>
            </div>
            <div className="text-[10px] font-bold text-stone-800 leading-tight mb-0.5">
              {kpi.era?.periodStartMonthYear.split('-')[0]} – {kpi.era?.periodEndMonthYear.split('-')[0]}
            </div>
            <p className="text-[9px] text-stone-400 line-clamp-1 font-medium">
              {kpi.era?.verdictHeadline}
            </p>
          </div>
        ))}
      </div>

      {/* FILTER & DOMAIN NAVIGATION BAR */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-2 sm:p-2.5 shadow-2xs space-y-1.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
          {/* Domain Segmented Control */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-stone-400 text-[10px] font-medium mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Domain:</span>
            </span>

            {[
              { id: 'All', label: 'All Life Eras' },
              { id: 'Career', label: '💼 Career & Leadership' },
              { id: 'Education', label: '🎓 Education & Academics' },
              { id: 'Wealth & Property', label: '💰 Wealth & Assets' },
              { id: 'Marriage & Family', label: '💍 Marriage & Alliances' },
              { id: 'Spiritual & Foreign', label: '🌐 Global & Spiritual' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDomain(d.id as any)}
                className={`px-2 py-0.5 rounded-md transition-all text-[11px] font-medium cursor-pointer ${
                  selectedDomain === d.id
                    ? 'bg-amber-800 text-white shadow-2xs font-semibold'
                    : 'bg-[#FAF8F5] border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Timing Segmented Control & Search */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-md border border-stone-200 text-xs">
              {(['All', 'Past', 'Current', 'Future'] as const).map((timing) => (
                <button
                  key={timing}
                  type="button"
                  onClick={() => setSelectedTiming(timing)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    selectedTiming === timing
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {timing === 'All' ? 'All Time' : timing === 'Past' ? 'Past (Was Best)' : timing === 'Current' ? 'Current' : 'Future (Will Be Best)'}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={searchDasha}
              onChange={(e) => setSearchDasha(e.target.value)}
              placeholder="Search planet / transit..."
              className="bg-[#FAF8F5] border border-stone-300 rounded-md px-1.5 py-0.5 text-[11px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white w-32"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5 border-t border-stone-100">
          <span>
            Showing <strong>{filteredMilestones.length}</strong> life milestones calculated for <strong>{name}</strong>
          </span>
          <span className="italic">
            Synchronized with Sidereal Lahiri Gochar & Parashari Vimshottari Hora
          </span>
        </div>
      </div>

      {/* MILESTONES TIMELINE LIST (SHORT POINTS & HIGH ACCURACY) */}
      <div className="space-y-2">
        {filteredMilestones.map((m) => {
          const isPast = m.status === 'Past Best';
          const isCurrent = m.isCurrent;
          const isFuture = m.status === 'Future Best';

          return (
            <div
              key={m.id}
              className={`rounded-xl border p-2.5 sm:p-3 transition-all duration-150 shadow-2xs space-y-2 ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-50/80 via-white to-purple-50/70 border-amber-400 ring-2 ring-amber-300/80 shadow-xs'
                  : isFuture
                  ? 'bg-white border-[#E7DEC8] hover:border-amber-300'
                  : 'bg-[#FCFAF6] border-stone-200/90 hover:bg-white'
              }`}
            >
              {/* Top Banner: Date Range, Status Badge & Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Period Date Range */}
                  <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-950 font-bold text-[11px] border border-amber-200/80 font-mono tracking-tight shadow-2xs">
                    {m.periodStartMonthYear} – {m.periodEndMonthYear}
                  </span>

                  <span className="text-[10px] text-stone-500 font-medium">
                    (Age {m.startAge} to {m.endAge})
                  </span>

                  {/* Timing Status Badge */}
                  {isCurrent ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold text-[9px] tracking-wide shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>CURRENT ACTIVE ERA</span>
                    </span>
                  ) : isPast ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-semibold text-[9px]">
                      PAST ERA: WAS BEST PERIOD
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[9px]">
                      FUTURE GOLDEN ERA: WILL BE BEST PERIOD
                    </span>
                  )}

                  {/* Domain Tag */}
                  <span className="px-1.5 py-0.2 rounded-md bg-[#F4EFE6] text-stone-800 text-[9px] font-semibold border border-stone-200">
                    {m.primaryDomain}
                  </span>
                  {m.secondaryDomain && (
                    <span className="px-1 py-0.2 rounded-md bg-stone-50 text-stone-600 text-[9px] border border-stone-200">
                      +{m.secondaryDomain}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 self-start sm:self-auto">
                  <span className="text-amber-500 font-bold text-xs">
                    {'★'.repeat(Math.floor(m.ratingStars))}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-600">
                    {m.ratingLabel}
                  </span>
                </div>
              </div>

              {/* Main Verdict Headline Banner */}
              <div className="flex items-start space-x-2">
                <div
                  className={`p-1 rounded-md shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-amber-700 text-white'
                      : isFuture
                      ? 'bg-purple-800 text-white'
                      : 'bg-stone-700 text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm leading-snug">
                    {m.verdictHeadline}
                  </h3>
                  <div className="text-[11px] text-purple-900 font-medium mt-0.5">
                    Dasha Influence: <strong className="font-semibold">{m.dashaDescription}</strong>
                  </div>
                </div>
              </div>

              {/* SHORT, HIGH-ACCURACY PREDICTIVE POINTS (CHEIRO & RAMAN STYLE) */}
              <div className="bg-amber-50/50 rounded-xl border border-amber-200/70 p-2 space-y-1">
                <div className="flex items-center space-x-1 text-amber-950 font-bold text-[11px]">
                  <Target className="w-3 h-3 text-amber-700" />
                  <span>Definitive Forecast Points (Cheiro & Parashari Synthesis):</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-stone-800 text-[11px]">
                  {m.predictivePoints.map((point, idx) => (
                    <div key={idx} className="bg-white/90 p-1.5 rounded-lg border border-amber-200/50 leading-snug font-medium">
                      {point}
                    </div>
                  ))}
                </div>

                {/* Double Transit Law Callout */}
                <div className="text-[10px] text-purple-950 bg-purple-50/80 px-2 py-0.5 rounded-md border border-purple-200/70 flex items-center space-x-1 mt-0.5">
                  <Crown className="w-3 h-3 text-purple-700 shrink-0" />
                  <span><strong>Astrological Law:</strong> {m.doubleTransitVerdict}</span>
                </div>
              </div>

              {/* Critical Transits Bar: Exact Movement of Saturn, Jupiter & Nodes */}
              <div className="bg-[#FAF8F5] rounded-xl border border-stone-200 p-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-900 font-semibold text-[10px]">
                    <Compass className="w-3 h-3 text-amber-700" />
                    <span>Concurrent Critical Gochar Transits during this Period:</span>
                  </div>
                  <span className="text-[9px] text-stone-500 italic">
                    {m.cheiroTurningPoint}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-stone-700 text-[10px]">
                  <div className="flex items-start space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1" />
                    <span>
                      <strong className="text-stone-900">Saturn (Shani):</strong> {m.criticalTransits.saturnTransit}
                    </span>
                  </div>

                  <div className="flex items-start space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                    <span>
                      <strong className="text-stone-900">Jupiter (Guru):</strong> {m.criticalTransits.jupiterTransit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Guidance & Mechanisms in Clean Short Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                {/* Parashari Mechanics Rationale */}
                <div className="bg-white rounded-lg border border-stone-100 p-1.5 space-y-0.5">
                  <div className="font-semibold text-stone-800 text-[9px] flex items-center space-x-1 uppercase tracking-wider">
                    <Info className="w-2.5 h-2.5 text-stone-500" />
                    <span>Astrological Basis:</span>
                  </div>
                  <p className="text-[10px] text-stone-600 leading-snug">
                    {m.astrologicalMechanism}
                  </p>
                </div>

                {/* Practical Strategic Guidance */}
                <div className="bg-white rounded-lg border border-amber-100 p-1.5 space-y-0.5">
                  <div className="font-semibold text-amber-900 text-[9px] flex items-center space-x-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-2.5 h-2.5 text-amber-700" />
                    <span>Pragmatic Strategy:</span>
                  </div>
                  <p className="text-[10px] text-stone-700 leading-snug">
                    {m.strategicAdvice}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMilestones.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 text-center space-y-1.5">
            <Award className="w-6 h-6 text-stone-400 mx-auto" />
            <h4 className="font-vedic font-bold text-stone-800 text-xs">
              No Milestones Match Your Current Filter
            </h4>
            <p className="text-[11px] text-stone-500">
              Try selecting "All Life Eras" or clear the search keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDomain('All');
                setSelectedTiming('All');
                setSearchDasha('');
              }}
              className="px-2.5 py-1 rounded-md bg-amber-800 text-white text-[11px] font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
