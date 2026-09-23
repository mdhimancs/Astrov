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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              <Crown className="w-4 h-4 text-amber-800" />
            </span>
            <h1 className="text-xl sm:text-2xl font-vedic font-bold text-stone-900">
              Master Astrologers' Life Milestones & Critical Transits
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Synthesis of <strong>Cheiro's Predictive Timing</strong> & <strong>Dr. B.V. Raman's Parashari Double-Transit Laws</strong> • Short, Accurate & High-Conviction Forecasting
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Print Executive Life Timeline"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <span>Vimshottari Dasha</span>
            </button>
          )}

          {onNavigateToMonthWise && (
            <button
              type="button"
              onClick={onNavigateToMonthWise}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>Month-Wise Transits</span>
            </button>
          )}
        </div>
      </div>

      {/* CHEIRO'S MASTER PREDICTIVE BLUEPRINT CARD */}
      <div className="bg-gradient-to-r from-[#FAF6EE] via-white to-[#F7F2E7] rounded-xl border border-amber-300/80 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-900 text-white">
              <Zap className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <h3 className="font-vedic font-bold text-amber-950 text-sm sm:text-base flex items-center space-x-1.5">
                <span>Cheiro's Chaldean Astrological Blueprint for {name}</span>
              </h3>
              <p className="text-[11px] text-stone-600">
                Archetype: <strong className="text-amber-950 font-semibold">{cheiroSummary.cheiroArchetype}</strong> • Ruling Planet: <strong className="text-purple-900 font-semibold">{cheiroSummary.rulingPlanet}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs">
              Root № {cheiroSummary.birthNumber}
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-purple-100 border border-purple-300 text-purple-950 font-bold text-xs">
              Destiny № {cheiroSummary.destinyNumber}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Fateful Turning Ages */}
          <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Cheiro's Fateful Turning Ages:
            </div>
            <div className="flex flex-wrap gap-1">
              {cheiroSummary.fatefulTurningAges.slice(0, 8).map((age) => (
                <span
                  key={age}
                  className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200 font-mono"
                >
                  Age {age}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 italic">Major career & financial status jumps occur during these years.</p>
          </div>

          {/* Fortunate Days & Power Dates */}
          <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Power Dates of Each Month:
            </div>
            <div className="text-xs font-bold text-stone-900">
              {cheiroSummary.luckyDates.join('th, ')}th
            </div>
            <div className="text-[11px] text-stone-600">
              Fortunate Days: <strong className="text-amber-900">{cheiroSummary.fortunateDays.join(', ')}</strong>
            </div>
          </div>

          {/* Power Colors & Auspicious Gems */}
          <div className="bg-white/90 p-2.5 rounded-lg border border-stone-200/80 space-y-1">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Auspicious Colors & Stones:
            </div>
            <div className="text-xs text-stone-800">
              Colors: <strong className="text-stone-900">{cheiroSummary.powerColors.slice(0, 3).join(', ')}</strong>
            </div>
            <div className="text-[11px] text-purple-900 font-medium">
              Stones: {cheiroSummary.luckyGems.join(', ')}
            </div>
          </div>

          {/* Core Predictive Law */}
          <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200/80 space-y-1">
            <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
              Cheiro's Destiny Law:
            </div>
            <p className="text-[11px] text-stone-700 leading-tight font-medium">
              "{cheiroSummary.corePredictiveMotto}"
            </p>
          </div>
        </div>
      </div>

      {/* EXECUTIVE HIGHLIGHTS: 4 DOMAIN KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. Best Career Window */}
        <div className="bg-white rounded-xl border border-amber-200/90 p-3 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-vedic font-bold text-amber-950 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <span>Career Golden Window</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              {topCareerEra?.isCurrent ? 'ACTIVE NOW' : topCareerEra?.status === 'Past Best' ? 'PAST ERA' : 'FUTURE'}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-stone-900">
              {topCareerEra ? `${topCareerEra.periodStartMonthYear} – ${topCareerEra.periodEndMonthYear}` : '1998 – 2005'}
            </div>
            <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-tight">
              {topCareerEra?.verdictHeadline || 'Peak window for professional advancement and authority.'}
            </p>
          </div>

          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
            Dasha: <strong className="text-stone-700">{topCareerEra?.dashaDescription}</strong>
          </div>
        </div>

        {/* 2. Best Education Window */}
        <div className="bg-white rounded-xl border border-sky-200/90 p-3 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-vedic font-bold text-sky-950 flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-700" />
              <span>Education Golden Window</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
              {topEducationEra?.isCurrent ? 'ACTIVE NOW' : topEducationEra?.status === 'Past Best' ? 'PAST ERA' : 'FUTURE'}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-stone-900">
              {topEducationEra ? `${topEducationEra.periodStartMonthYear} – ${topEducationEra.periodEndMonthYear}` : '2004 – 2008'}
            </div>
            <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-tight">
              {topEducationEra?.verdictHeadline || 'Prime academic learning and competitive examination triumph.'}
            </p>
          </div>

          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
            Dasha: <strong className="text-stone-700">{topEducationEra?.dashaDescription}</strong>
          </div>
        </div>

        {/* 3. Best Wealth & Property Window */}
        <div className="bg-white rounded-xl border border-emerald-200/90 p-3 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-vedic font-bold text-emerald-950 flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-700" />
              <span>Wealth & Real Estate</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
              {topWealthEra?.isCurrent ? 'ACTIVE NOW' : topWealthEra?.status === 'Past Best' ? 'PAST' : 'PRIME FUTURE'}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-stone-900">
              {topWealthEra ? `${topWealthEra.periodStartMonthYear} – ${topWealthEra.periodEndMonthYear}` : '2027 – 2030'}
            </div>
            <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-tight">
              {topWealthEra?.verdictHeadline || 'Compounding assets, real estate acquisitions & financial stability.'}
            </p>
          </div>

          <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-100">
            Dasha: <strong className="text-stone-700">{topWealthEra?.dashaDescription}</strong>
          </div>
        </div>

        {/* 4. Current Active Dasha-Transit Alignment */}
        <div className="bg-gradient-to-br from-purple-50 to-amber-50/60 rounded-xl border border-purple-200 p-3 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-vedic font-bold text-purple-950 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Current Active Phase</span>
            </span>
            <span className="flex items-center space-x-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>RUNNING</span>
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-stone-900">
              {currentPeriod ? `${currentPeriod.periodStartMonthYear} – ${currentPeriod.periodEndMonthYear}` : 'Active Phase'}
            </div>
            <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-tight">
              {currentPeriod?.verdictHeadline || 'Current transformative astrological period.'}
            </p>
          </div>

          <div className="text-[10px] text-stone-500 pt-1 border-t border-purple-100">
            Dasha: <strong className="text-purple-800">{currentPeriod?.dashaDescription}</strong>
          </div>
        </div>
      </div>

      {/* FILTER & DOMAIN NAVIGATION BAR */}
      <div className="bg-white rounded-xl border border-stone-200/90 p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Domain Segmented Control */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-stone-400 text-[11px] font-medium mr-1 flex items-center space-x-1">
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
                className={`px-2.5 py-1 rounded-lg transition-all text-xs font-medium cursor-pointer ${
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
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-lg border border-stone-200 text-xs">
              {(['All', 'Past', 'Current', 'Future'] as const).map((timing) => (
                <button
                  key={timing}
                  type="button"
                  onClick={() => setSelectedTiming(timing)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
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
              className="bg-[#FAF8F5] border border-stone-300 rounded-lg px-2 py-0.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white w-36"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
          <span>
            Showing <strong>{filteredMilestones.length}</strong> life milestones calculated for <strong>{name}</strong>
          </span>
          <span className="italic">
            Synchronized with Sidereal Lahiri Gochar & Parashari Vimshottari Hora
          </span>
        </div>
      </div>

      {/* MILESTONES TIMELINE LIST (SHORT POINTS & HIGH ACCURACY) */}
      <div className="space-y-3">
        {filteredMilestones.map((m) => {
          const isPast = m.status === 'Past Best';
          const isCurrent = m.isCurrent;
          const isFuture = m.status === 'Future Best';

          return (
            <div
              key={m.id}
              className={`rounded-xl border p-3.5 sm:p-4 transition-all duration-150 shadow-2xs space-y-3 ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-50/80 via-white to-purple-50/70 border-amber-400 ring-2 ring-amber-300/80 shadow-xs'
                  : isFuture
                  ? 'bg-white border-[#E7DEC8] hover:border-amber-300'
                  : 'bg-[#FCFAF6] border-stone-200/90 hover:bg-white'
              }`}
            >
              {/* Top Banner: Date Range, Status Badge & Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Period Date Range */}
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-950 font-bold text-xs border border-amber-200/80 font-mono tracking-tight shadow-2xs">
                    {m.periodStartMonthYear} – {m.periodEndMonthYear}
                  </span>

                  <span className="text-[11px] text-stone-500 font-medium">
                    (Age {m.startAge} to {m.endAge})
                  </span>

                  {/* Timing Status Badge */}
                  {isCurrent ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] tracking-wide shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>CURRENT ACTIVE ERA</span>
                    </span>
                  ) : isPast ? (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-semibold text-[10px]">
                      PAST ERA: WAS BEST PERIOD
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px]">
                      FUTURE GOLDEN ERA: WILL BE BEST PERIOD
                    </span>
                  )}

                  {/* Domain Tag */}
                  <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-stone-800 text-[10px] font-semibold border border-stone-200">
                    {m.primaryDomain}
                  </span>
                  {m.secondaryDomain && (
                    <span className="px-1.5 py-0.5 rounded-md bg-stone-50 text-stone-600 text-[10px] border border-stone-200">
                      +{m.secondaryDomain}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                  <span className="text-amber-500 font-bold text-xs">
                    {'★'.repeat(Math.floor(m.ratingStars))}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-600">
                    {m.ratingLabel}
                  </span>
                </div>
              </div>

              {/* Main Verdict Headline Banner */}
              <div className="flex items-start space-x-2.5">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-amber-700 text-white'
                      : isFuture
                      ? 'bg-purple-800 text-white'
                      : 'bg-stone-700 text-white'
                  }`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-vedic font-bold text-stone-900 text-sm sm:text-base leading-snug">
                    {m.verdictHeadline}
                  </h3>
                  <div className="text-xs text-purple-900 font-medium mt-0.5">
                    Dasha Influence: <strong className="font-semibold">{m.dashaDescription}</strong>
                  </div>
                </div>
              </div>

              {/* SHORT, HIGH-ACCURACY PREDICTIVE POINTS (CHEIRO & RAMAN STYLE) */}
              <div className="bg-amber-50/50 rounded-xl border border-amber-200/70 p-3 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-950 font-bold text-xs">
                  <Target className="w-3.5 h-3.5 text-amber-700" />
                  <span>Definitive Forecast Points (Cheiro & Parashari Synthesis):</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-stone-800 text-xs">
                  {m.predictivePoints.map((point, idx) => (
                    <div key={idx} className="bg-white/90 p-2 rounded-lg border border-amber-200/50 leading-relaxed font-medium">
                      {point}
                    </div>
                  ))}
                </div>

                {/* Double Transit Law Callout */}
                <div className="text-[11px] text-purple-950 bg-purple-50/80 px-2.5 py-1 rounded-md border border-purple-200/70 flex items-center space-x-1.5 mt-1">
                  <Crown className="w-3 h-3 text-purple-700 shrink-0" />
                  <span><strong>Astrological Law:</strong> {m.doubleTransitVerdict}</span>
                </div>
              </div>

              {/* Critical Transits Bar: Exact Movement of Saturn, Jupiter & Nodes */}
              <div className="bg-[#FAF8F5] rounded-xl border border-stone-200 p-2.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-semibold text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-amber-700" />
                    <span>Concurrent Critical Gochar Transits during this Period:</span>
                  </div>
                  <span className="text-[10px] text-stone-500 italic">
                    {m.cheiroTurningPoint}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-stone-700 text-[11px]">
                  <div className="flex items-start space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-stone-900">Saturn (Shani):</strong> {m.criticalTransits.saturnTransit}
                    </span>
                  </div>

                  <div className="flex items-start space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-stone-900">Jupiter (Guru):</strong> {m.criticalTransits.jupiterTransit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Guidance & Mechanisms in Clean Short Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* Parashari Mechanics Rationale */}
                <div className="bg-white rounded-lg border border-stone-100 p-2 space-y-0.5">
                  <div className="font-semibold text-stone-800 text-[10px] flex items-center space-x-1 uppercase tracking-wider">
                    <Info className="w-3 h-3 text-stone-500" />
                    <span>Astrological Basis:</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    {m.astrologicalMechanism}
                  </p>
                </div>

                {/* Practical Strategic Guidance */}
                <div className="bg-white rounded-lg border border-amber-100 p-2 space-y-0.5">
                  <div className="font-semibold text-amber-900 text-[10px] flex items-center space-x-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    <span>Pragmatic Strategy:</span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug">
                    {m.strategicAdvice}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMilestones.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-2">
            <Award className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-vedic font-bold text-stone-800 text-sm">
              No Milestones Match Your Current Filter
            </h4>
            <p className="text-xs text-stone-500">
              Try selecting "All Life Eras" or clear the search keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDomain('All');
                setSelectedTiming('All');
                setSearchDasha('');
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
