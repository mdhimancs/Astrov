import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Compass,
  ArrowRight,
  Flame,
  ShieldCheck,
  Layers,
  Heart,
  Briefcase,
  Activity,
  Feather,
  Award,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  calculateVimshottariDasha,
  calculateAntardashas,
  calculatePlanetaryPositions,
  getDashaMonthlyPlanetaryGuidance,
  ALL_MONTH_WISE_PREDICTIONS,
} from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { ProfileSelector } from './ProfileSelector';
import { PlaceValue } from './PlaceOfBirthInput';
import { GrahaName, UserProfile } from '../types';
import {
  getSavedProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/profileStorage';

interface VimshottariDashaTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
  onNavigateToMonthWise?: () => void;
  onNavigateToBirthTime?: () => void;
  onNavigateToMilestones?: () => void;
}

export function VimshottariDashaTab({
  activeProfileId,
  profiles,
  onNavigateToMonthWise,
  onNavigateToBirthTime,
  onNavigateToMilestones,
}: VimshottariDashaTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Seeker parameters
  const [name, setName] = useState(currentProfile?.name || 'Aarav Sharma');
  const [birthDate, setBirthDate] = useState(currentProfile?.birthDate || '1990-05-18');
  const [birthTime, setBirthTime] = useState(currentProfile?.birthTime || '14:35');
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

  // Selected Month for Monthly Planetary Changes & Guidance
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-09');

  // Selected Mahadasha for Antardashas inspection
  const [selectedMahadashaPlanet, setSelectedMahadashaPlanet] = useState<GrahaName | null>(null);

  // Deck of Cards selector for Dasha sections: 1. Dasha Interpretation, 2. Monthly Guidance
  const [activeDashaDeck, setActiveDashaDeck] = useState<'interpretation' | 'monthly'>('interpretation');

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

  // 1. Calculate Natal Moon & Lagna
  const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
  const natalCalc = calculatePlanetaryPositions(
    birthDateTime,
    selectedCity.lat,
    selectedCity.lng
  );
  const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra');
  const natalMoonTotalDeg = natalMoon ? (natalMoon.rasiNumber - 1) * 30 + natalMoon.degree : 45;
  const natalMoonRasi = natalMoon?.rasiNumber || 2;
  const natalLagnaRasi = natalCalc.lagnaRasi || 1;
  const natalNakshatra = natalMoon?.nakshatra || 'Rohini';

  // 2. Calculate Vimshottari Mahadashas
  const vimshottariDasha = calculateVimshottariDasha(natalMoonTotalDeg, birthDate);

  // Default selected Mahadasha to currently active one
  const activeDashaLord = selectedMahadashaPlanet || vimshottariDasha.currentLord;
  const currentMahadashaInfo =
    vimshottariDasha.cycle.find((c) => c.planet === activeDashaLord) ||
    vimshottariDasha.cycle[0];

  // 3. Calculate Antardashas for the chosen Mahadasha
  const antardashas = calculateAntardashas(
    activeDashaLord,
    currentMahadashaInfo.durationYears,
    currentMahadashaInfo.startAge,
    birthDate
  );

  // Selected Antardasha planet (defaults to current Antardasha or first in list)
  const [selectedAntardashaPlanet, setSelectedAntardashaPlanet] = useState<GrahaName | null>(null);

  const activeAntardashaInfo = useMemo(() => {
    if (selectedAntardashaPlanet) {
      const found = antardashas.find((a) => a.planet === selectedAntardashaPlanet);
      if (found) return found;
    }
    return antardashas.find((a) => a.isCurrent) || antardashas[0];
  }, [antardashas, selectedAntardashaPlanet]);

  // AI-Driven Dasha Interpretation state
  const [isLoadingDashaAi, setIsLoadingDashaAi] = useState(false);
  const [aiDashaReading, setAiDashaReading] = useState<{
    headline: string;
    spiritualSummary: string;
    practicalSummary: string;
    mahadashaCoreTheme: string;
    antardashaSubTheme: string;
    actionableSteps: string[];
    vedicRemedy: string;
  } | null>(null);
  const [dashaAiError, setDashaAiError] = useState<string | null>(null);

  // Reset custom AI override when Mahadasha/Antardasha or profile changes
  useEffect(() => {
    setAiDashaReading(null);
    setDashaAiError(null);
  }, [activeDashaLord, activeAntardashaInfo?.planet, activeProfileId]);

  // Build rich contextual Spiritual & Practical Dasha Interpretation based on Natal Chart + Mahadasha/Antardasha Lords
  const contextualDashaInterpretation = useMemo(() => {
    const mahaPlanetObj = natalCalc.planets.find((p) => p.name === activeDashaLord);
    const antarPlanetObj = natalCalc.planets.find((p) => p.name === activeAntardashaInfo?.planet);

    const mahaHouse = mahaPlanetObj?.house || 1;
    const mahaRasi = mahaPlanetObj?.rasiName || 'Mesha';
    const antarHouse = antarPlanetObj?.house || 1;
    const antarRasi = antarPlanetObj?.rasiName || 'Mesha';

    const mahaPlacementStr = `${activeDashaLord} in H${mahaHouse} (${mahaRasi})`;
    const antarPlacementStr = `${activeAntardashaInfo?.planet} in H${antarHouse} (${antarRasi})`;

    const houseDistance = ((antarHouse - mahaHouse + 12) % 12) + 1;
    const isKendraOrTrikona = [1, 4, 5, 7, 9, 10].includes(houseDistance);
    const isDhanaLabha = [2, 11].includes(houseDistance);
    const relationshipLabel = isKendraOrTrikona
      ? `Auspicious Kendra/Trikona Synergy (${houseDistance}th from Mahadasha Lord)`
      : isDhanaLabha
      ? `Constructive Dhana/Labha Alignment (${houseDistance}th from Mahadasha Lord)`
      : `Transformative Dasha-Pravesh (${houseDistance}th from Mahadasha Lord — Requires Mindful Balance)`;

    const spiritualThemesByGraha: Record<string, string> = {
      Surya: 'awakening of Atma-Bala (soul radiance), dharmic leadership, self-sovereignty, and clearing ancestral Pitri karma',
      Chandra: 'deepening emotional equanimity, maternal compassion, intuitive receptivity, and Manas purification',
      Mangal: 'focused willpower, fearless protection of dharma, disciplined vital energy (Prana), and overcoming inner inertia',
      Budha: 'discriminative wisdom (Viveka), sacred study (Svadhyaya), truthful speech, and intellectual clarity',
      Guru: 'expansion of Guru-Kripa (divine grace), higher philosophical truth, ethical generosity, and Purva-Punya fruition',
      Shukra: 'devotional bhakti, refined aesthetic harmony, sacred gratitude in relationships, and Ojas preservation',
      Shani: 'karmic maturity, humble Seva (selfless service), unshakeable patience (Titiksha), and detachment from ego',
      Rahu: 'breaking karmic illusions (Maya), mastering worldly ambition with mindfulness, and unconventional spiritual breakthroughs',
      Ketu: 'profound Moksha-oriented introspection, liberation from past-life attachments, and mystical intuition',
    };

    const practicalThemesByGraha: Record<string, string> = {
      Surya: 'executive career visibility, authority roles, government/institutional recognition, and vitality',
      Chandra: 'public relations, domestic peace, real estate/nurturing enterprises, and liquid cash flow',
      Mangal: 'decisive project execution, property/land matters, technical engineering, and competitive victory',
      Budha: 'commercial contracts, analytical skillsets, writing/communication, and financial accounting',
      Guru: 'wealth compounding, advisory/mentorship leadership, higher education, and family expansion',
      Shukra: 'financial prosperity, artistic/creative ventures, marital harmony, and material comforts',
      Shani: 'long-term institutional stability, organizational restructuring, disciplined savings, and endurance',
      Rahu: 'technological innovation, foreign/global expansion, rapid scaling, and out-of-the-box career pivots',
      Ketu: 'specialized research, auditing, spiritual/healing vocations, and decluttering unproductive commitments',
    };

    const remedyByGraha: Record<string, string> = {
      Surya: 'Offer Arghya to rising Surya in a copper vessel and chant Aditya Hridaya Stotra on Sundays.',
      Chandra: 'Practice evening meditation, offer water/milk to Shiva Lingam on Mondays, and respect maternal figures.',
      Mangal: 'Recite Hanuman Chalisa on Tuesdays and channel energy into disciplined physical fitness.',
      Budha: 'Chant Vishnu Sahasranama on Wednesdays and donate educational books or green gram.',
      Guru: 'Chant Guru Beej Mantra on Thursdays, honor teachers/elders, and donate turmeric or yellow gram.',
      Shukra: 'Recite Sri Suktam on Fridays, maintain harmonious domestic surroundings, and support women/artists.',
      Shani: 'Light a sesame/mustard oil lamp on Saturday evenings, recite Dasharatha Shani Stotra, and serve laborers.',
      Rahu: 'Chant Durga Chalisa, practice daily Anulom-Vilom Pranayama, and feed birds with seven grains.',
      Ketu: 'Worship Lord Ganesha with Durva grass on Wednesdays/Tuesdays and donate blankets to the needy.',
    };

    const mahaSpir = spiritualThemesByGraha[activeDashaLord] || 'karmic evolution and inner awareness';
    const antarSpir = spiritualThemesByGraha[activeAntardashaInfo?.planet || 'Guru'] || 'intuitive growth';
    const mahaPrac = practicalThemesByGraha[activeDashaLord] || 'career and life structure';
    const antarPrac = practicalThemesByGraha[activeAntardashaInfo?.planet || 'Guru'] || 'timely execution';

    return {
      mahaPlacementStr,
      antarPlacementStr,
      relationshipLabel,
      headline: `${activeDashaLord} Mahadasha • ${activeAntardashaInfo?.planet} Antardasha (${activeAntardashaInfo?.startMonthYear} – ${activeAntardashaInfo?.endMonthYear})`,
      spiritualSummary: `During the ${activeDashaLord} Mahadasha (${currentMahadashaInfo.startMonthYear} – ${currentMahadashaInfo.endMonthYear}) and ${activeAntardashaInfo?.planet} Antardasha (${activeAntardashaInfo?.startMonthYear} – ${activeAntardashaInfo?.endMonthYear}), your natal ${mahaPlacementStr} merges with ${antarPlacementStr}. Spiritually, this period centers on ${mahaSpir}, tempered by ${activeAntardashaInfo?.planet}’s emphasis on ${antarSpir}. With Janma Nakshatra ${natalNakshatra}, this alignment invites conscious inner stillness and dharmic integrity.`,
      practicalSummary: `On the practical plane, ${activeDashaLord} activates your ${mahaHouse}th house (${mahaRasi}) themes of ${mahaPrac}, while sub-lord ${activeAntardashaInfo?.planet} channels immediate momentum into your ${antarHouse}th house (${antarRasi}) domains of ${antarPrac}. Their ${houseDistance}th-house mutual alignment (${relationshipLabel}) indicates that disciplined planning, transparent communication, and ethical execution will yield durable worldly progress.`,
      mahadashaCoreTheme: `${activeDashaLord} (${mahaPlacementStr}) sets the macro ${currentMahadashaInfo.durationYears}-year foundation: ${currentMahadashaInfo.lifeTheme}`,
      antardashaSubTheme: `${activeAntardashaInfo?.planet} (${antarPlacementStr}) governs the active ${activeAntardashaInfo?.durationYearsStr} sub-period: ${activeAntardashaInfo?.theme}`,
      actionableSteps: [
        `Prioritize House ${mahaHouse} (${mahaRasi}) and House ${antarHouse} (${antarRasi}) initiatives during ${activeAntardashaInfo?.startMonthYear} – ${activeAntardashaInfo?.endMonthYear}.`,
        `Balance ${activeDashaLord}'s macro vision with ${activeAntardashaInfo?.planet}'s day-to-day tactical discipline.`,
        `Use favorable monthly transit windows to finalize high-impact career, wealth, and family decisions.`,
      ],
      vedicRemedy: `${remedyByGraha[activeDashaLord] || ''} ${
        activeAntardashaInfo?.planet && activeAntardashaInfo.planet !== activeDashaLord
          ? `Additionally for ${activeAntardashaInfo.planet}: ${remedyByGraha[activeAntardashaInfo.planet] || ''}`
          : ''
      }`,
    };
  }, [
    activeDashaLord,
    activeAntardashaInfo,
    currentMahadashaInfo,
    natalCalc.planets,
    natalNakshatra,
  ]);

  const handleGenerateAiDashaContext = async () => {
    setIsLoadingDashaAi(true);
    setDashaAiError(null);
    try {
      const lagnaName = VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName || 'Mesha';
      const moonName = VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName || 'Mesha';

      const res = await fetch('/api/astrology/dasha-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate,
          birthTime,
          birthPlace: selectedCity.name,
          lagnaRasi: lagnaName,
          moonRasi: moonName,
          nakshatra: natalNakshatra,
          mahadashaLord: activeDashaLord,
          mahadashaPeriod: `${currentMahadashaInfo.startMonthYear} – ${currentMahadashaInfo.endMonthYear}`,
          antardashaLord: activeAntardashaInfo?.planet,
          antardashaPeriod: `${activeAntardashaInfo?.startMonthYear} – ${activeAntardashaInfo?.endMonthYear}`,
          mahaNatalPlacement: contextualDashaInterpretation.mahaPlacementStr,
          antarNatalPlacement: contextualDashaInterpretation.antarPlacementStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI Dasha interpretation');
      }
      setAiDashaReading(data);
    } catch (err: any) {
      console.error(err);
      setDashaAiError('Unable to reach AI cosmic channel right now; showing full Parashari context below.');
    } finally {
      setIsLoadingDashaAi(false);
    }
  };

  const displayedDashaReading = aiDashaReading || contextualDashaInterpretation;

  // 4. Calculate Planetary Positions for the 15th of the selected month
  const [tYear, tMonth] = (selectedMonthKey || '2026-09').split('-').map(Number);
  const transitDate = new Date(tYear, tMonth - 1, 15, 12, 0, 0);
  const transitCalc = calculatePlanetaryPositions(
    transitDate,
    selectedCity.lat,
    selectedCity.lng
  );

  // 5. Calculate Monthly Planetary Changes, Guidance, and Do's & Don'ts
  const monthlyGuidance = getDashaMonthlyPlanetaryGuidance(
    vimshottariDasha.currentLord,
    selectedMonthKey,
    natalMoonRasi,
    natalLagnaRasi,
    transitCalc.planets
  );

  const monthIndex = ALL_MONTH_WISE_PREDICTIONS.findIndex(
    (m) => m.monthKey === selectedMonthKey
  );
  const currentMonthIdx = monthIndex >= 0 ? monthIndex : 0;

  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      setSelectedMonthKey(ALL_MONTH_WISE_PREDICTIONS[currentMonthIdx - 1].monthKey);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < ALL_MONTH_WISE_PREDICTIONS.length - 1) {
      setSelectedMonthKey(ALL_MONTH_WISE_PREDICTIONS[currentMonthIdx + 1].monthKey);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-1.5">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="p-1 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h1 className="text-[18px] font-vedic font-bold text-stone-900 leading-tight">
              Vimshottari Dasha
            </h1>
          </div>
        </div>

        {/* Quick Cross-Navigation Links */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {onNavigateToMilestones && (
            <button
              type="button"
              onClick={onNavigateToMilestones}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded border border-purple-300 bg-purple-50 text-purple-900 font-semibold transition-colors cursor-pointer shadow-3xs text-[13px]"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Eras</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: 9-PLANET MAHADASHA TIMELINE (COMPACT) */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-stone-200 px-2 py-1.5 shadow-3xs space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1">
          <div className="flex items-center space-x-2">
            <h2 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wider flex items-center space-x-1.5 leading-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Mahadasha</span>
            </h2>
            <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-semibold">
              Nak: <strong className="text-stone-950">{natalNakshatra}</strong> ({vimshottariDasha.yearsRemainingAtBirth}y Bal)
            </span>
          </div>

          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-950 border border-purple-200 text-[11px] font-bold">
            Active: {vimshottariDasha.currentLord}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1">
          {vimshottariDasha.cycle.map((d) => {
            const isCurrentlyActive = d.planet === vimshottariDasha.currentLord;
            const isSelected = (selectedMahadashaPlanet || vimshottariDasha.currentLord) === d.planet;

            return (
              <div
                key={`${d.planet}-${d.startMonthYear}`}
                onClick={() => setSelectedMahadashaPlanet(d.planet)}
                className={`px-1 py-1 rounded border transition-all duration-150 cursor-pointer flex flex-col items-center justify-center text-center ${
                  isSelected
                    ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : isCurrentlyActive
                    ? 'bg-purple-50/50 border-purple-300'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 leading-none">
                  <span className="font-vedic font-bold text-stone-950 text-[12px]">{d.planet}</span>
                  <span className="text-[10px] font-bold text-amber-800">({d.durationYears}y)</span>
                  {isCurrentlyActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                </div>
                <span className="text-[10px] text-stone-600 leading-tight mt-0.5 truncate w-full">
                  {d.startMonthYear}–{d.endMonthYear}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ANTARDASHA (SUB-PERIODS) BREAKDOWN (COMPACT) */}
      <div className="bg-white rounded-lg border border-stone-200 px-2 py-1.5 shadow-3xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-1">
          <div className="flex items-center space-x-2">
            <h2 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wider">
              {activeDashaLord} Sub-Periods
            </h2>
            <span className="text-[11px] text-stone-600 font-semibold">
              ({currentMahadashaInfo.startMonthYear} – {currentMahadashaInfo.endMonthYear})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1">
          {antardashas.map((antar) => {
            const isSelectedAntar = activeAntardashaInfo?.planet === antar.planet;

            return (
              <div
                key={`${activeDashaLord}-${antar.planet}-${antar.startMonthYear}`}
                onClick={() => setSelectedAntardashaPlanet(antar.planet)}
                className={`px-1 py-1 rounded border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  isSelectedAntar
                    ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : antar.isCurrent
                    ? 'bg-purple-50/50 border-purple-300'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 leading-none">
                  <span className="font-vedic font-bold text-stone-950 text-[12px]">{antar.planet}</span>
                  <span className="text-[10px] font-bold text-amber-800">({antar.durationYearsStr})</span>
                  {antar.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                </div>
                <span className="text-[10px] text-stone-600 leading-tight mt-0.5 truncate w-full">
                  {antar.startMonthYear}–{antar.endMonthYear}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHA SECTIONS — COMPACT 1-ROW DECK OF CARDS SELECTOR */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/90 px-2 py-1.5 shadow-3xs">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            {
              id: 'interpretation',
              title: 'Dasha Interpretation',
              icon: BookOpen,
            },
            {
              id: 'monthly',
              title: 'Monthly Guidance',
              icon: Calendar,
            },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = activeDashaDeck === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveDashaDeck(card.id as 'interpretation' | 'monthly')}
                className={`group relative rounded-md px-2.5 py-1.5 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1.5 ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5] shadow-3xs'
                }`}
              >
                <span
                  className={`font-vedic font-bold text-[12px] leading-none truncate ${
                    isActive ? 'text-amber-950' : 'text-stone-900'
                  }`}
                >
                  {card.title}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD 1: DASHA INTERPRETATION (SPIRITUAL & PRACTICAL SUMMARY OF MAHADASHA & ANTARDASHA) */}
      {activeDashaDeck === 'interpretation' && (
      <div className="bg-white rounded-lg border border-purple-200/90 p-2.5 shadow-3xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px] tracking-tight">
                Dasha Interpretation — Spiritual &amp; Practical Summary
              </h2>
            </div>
            <p className="text-[12px] text-stone-600 mt-0.5">
              {displayedDashaReading.headline} • <strong className="text-stone-900">{contextualDashaInterpretation.mahaPlacementStr}</strong> &amp; <strong className="text-stone-900">{contextualDashaInterpretation.antarPlacementStr}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px] hidden md:inline-block">
              {contextualDashaInterpretation.relationshipLabel}
            </span>

            <button
              type="button"
              onClick={handleGenerateAiDashaContext}
              disabled={isLoadingDashaAi}
              className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[12px] font-semibold py-1 px-2.5 rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoadingDashaAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Context Synthesis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {dashaAiError && (
          <div className="text-[12px] text-amber-800 bg-amber-50/70 border border-amber-200 rounded px-2 py-1">
            {dashaAiError}
          </div>
        )}

        {/* Macro Mahadasha vs Sub-period Antardasha Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-amber-50/40 rounded-md border border-amber-200/80 p-2 space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
              Mahadasha Lord Context ({activeDashaLord} • {currentMahadashaInfo.startMonthYear} – {currentMahadashaInfo.endMonthYear})
            </span>
            <p className="text-[13px] text-stone-800 leading-snug">
              {displayedDashaReading.mahadashaCoreTheme}
            </p>
          </div>

          <div className="bg-purple-50/40 rounded-md border border-purple-200/80 p-2 space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
              Antardasha Sub-Lord Context ({activeAntardashaInfo?.planet} • {activeAntardashaInfo?.startMonthYear} – {activeAntardashaInfo?.endMonthYear})
            </span>
            <p className="text-[13px] text-stone-800 leading-snug">
              {displayedDashaReading.antardashaSubTheme}
            </p>
          </div>
        </div>

        {/* Spiritual & Practical Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* 1. Spiritual Summary */}
          <div className="bg-[#FAF8F5] rounded-lg border border-purple-200/80 p-2.5 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-950">
              <Feather className="w-3.5 h-3.5 text-purple-700" />
              <h3 className="font-vedic font-bold text-[14px]">
                Spiritual &amp; Karmic Summary (Adhyatmik Dasha Phal)
              </h3>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">
              {displayedDashaReading.spiritualSummary}
            </p>
          </div>

          {/* 2. Practical Summary */}
          <div className="bg-[#FAF8F5] rounded-lg border border-amber-200/80 p-2.5 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-950">
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <h3 className="font-vedic font-bold text-[14px]">
                Practical &amp; Worldly Summary (Vyavaharik Dasha Phal)
              </h3>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">
              {displayedDashaReading.practicalSummary}
            </p>
          </div>
        </div>

        {/* Actionable Steps & Dasha Remedy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 pt-1 border-t border-stone-100">
          <div className="lg:col-span-7 bg-emerald-50/40 rounded-md border border-emerald-200/70 p-2 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
              Key Practical &amp; Spiritual Priorities ({activeDashaLord}–{activeAntardashaInfo?.planet})
            </span>
            <ul className="space-y-0.5 text-[12px] text-stone-800">
              {displayedDashaReading.actionableSteps.map((step, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 bg-amber-50/50 rounded-md border border-amber-200/80 p-2 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
              Prescribed Dasha Harmonization Remedy (Upay)
            </span>
            <p className="text-[12px] text-stone-800 leading-snug">
              {displayedDashaReading.vedicRemedy}
            </p>
          </div>
        </div>
      </div>
      )}

      {/* CARD 2: MONTHLY PLANETARY CHANGES, GUIDANCE & DO'S AND DON'TS */}
      {activeDashaDeck === 'monthly' && (
      <div className="bg-white rounded-lg border border-amber-200/80 p-2.5 shadow-3xs space-y-2">
        {/* Top Header with Month Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-1.5">
          <h2 className="font-vedic font-bold text-stone-950 text-[14px]">
            Monthly Guidance
          </h2>

          {/* Month Selector Dropdown */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx === 0}
              className="p-1 rounded border border-stone-300 bg-white text-stone-700 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[13px] font-semibold rounded px-2 py-1 focus:outline-none focus:border-amber-600 focus:bg-white shadow-3xs cursor-pointer"
            >
              {ALL_MONTH_WISE_PREDICTIONS.map((m) => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx === ALL_MONTH_WISE_PREDICTIONS.length - 1}
              className="p-1 rounded border border-stone-300 bg-white text-stone-700 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Guidance across 4 Key Life Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Career & Finances */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-md p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-950">
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-vedic font-bold text-[14px]">Career & Wealth</span>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">
              {monthlyGuidance.guidance.careerAndFinances}
            </p>
          </div>

          {/* Relationships & Family */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-md p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-rose-950">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-vedic font-bold text-[14px]">Relationships</span>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">
              {monthlyGuidance.guidance.relationshipsAndFamily}
            </p>
          </div>

          {/* Health & Vitality */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-md p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-950">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-vedic font-bold text-[14px]">Health</span>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">
              {monthlyGuidance.guidance.healthAndVitality}
            </p>
          </div>

          {/* Spiritual & Karmic Sadhana */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-md p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-950">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span className="font-vedic font-bold text-[14px]">Spiritual</span>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">
              {monthlyGuidance.guidance.spiritualAndKarmic}
            </p>
          </div>
        </div>

        {/* Recommended Do's & Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-stone-100">
          <div className="bg-emerald-50/50 rounded-md border border-emerald-200/60 p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-[13px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Recommended Do's</span>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">{monthlyGuidance.dos.join(' • ')}</p>
          </div>

          <div className="bg-rose-50/50 rounded-md border border-rose-200/60 p-2 space-y-1">
            <div className="flex items-center space-x-1.5 text-rose-900 font-bold text-[13px]">
              <XCircle className="w-3.5 h-3.5 text-rose-700" />
              <span>Precautions</span>
            </div>
            <p className="text-[13px] text-stone-800 leading-snug">{monthlyGuidance.donts.join(' • ')}</p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
