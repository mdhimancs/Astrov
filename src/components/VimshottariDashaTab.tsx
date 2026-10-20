import React, { useState, useEffect, useMemo } from 'react';
import { GlossaryTerm } from './GlossaryTerm';
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
  calculateYoginiDasha,
  ALL_MONTH_WISE_PREDICTIONS,
  getPlanetFavorability,
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

  // Selected Month for Monthly Planetary Changes & Guidance (defaults to current month)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Selected Mahadasha for Antardashas inspection
  const [selectedMahadashaPlanet, setSelectedMahadashaPlanet] = useState<GrahaName | null>(null);

  // Deck of Cards selector for Dasha sections: 1. Dasha Interpretation, 2. Parts & Sub-Periods (Strength), 3. Monthly Guidance, 4. Yogini Dasha
  const [activeDashaDeck, setActiveDashaDeck] = useState<
    'interpretation' | 'parts-subperiods' | 'monthly' | 'yogini'
  >('interpretation');

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

  // 2. Calculate Vimshottari Mahadashas & Yogini Dasha
  const vimshottariDasha = calculateVimshottariDasha(
    natalMoonTotalDeg,
    birthDate,
    natalCalc.planets,
    natalLagnaRasi
  );
  const yoginiDasha = calculateYoginiDasha(natalMoonTotalDeg, birthDate);

  // Exact current age for accurate dasha progress calculation
  const currentAge = useMemo(() => {
    const parts = birthDate.split('-').map(Number);
    const bDate = new Date(parts[0] || 1990, (parts[1] || 5) - 1, parts[2] || 15);
    const now = new Date();
    const diffMonths = (now.getFullYear() - bDate.getFullYear()) * 12 + (now.getMonth() - bDate.getMonth());
    return Math.max(0, diffMonths / 12);
  }, [birthDate]);

  // Interactive Timeline Slider state (Age 0 to 100, defaults to currentAge)
  const [sliderAge, setSliderAge] = useState<number>(Math.round(currentAge * 10) / 10);

  const sliderMahadasha = useMemo(() => {
    return (
      vimshottariDasha.cycle.find((c) => sliderAge >= c.startAge && sliderAge < c.endAge) ||
      vimshottariDasha.cycle[vimshottariDasha.cycle.length - 1]
    );
  }, [vimshottariDasha, sliderAge]);

  const sliderAntardashas = useMemo(() => {
    return calculateAntardashas(
      sliderMahadasha.planet,
      sliderMahadasha.durationYears,
      sliderMahadasha.startAge,
      birthDate,
      natalCalc.planets,
      natalLagnaRasi
    );
  }, [sliderMahadasha, birthDate, natalCalc.planets, natalLagnaRasi]);

  const sliderAntardasha = useMemo(() => {
    return (
      sliderAntardashas.find((a) => sliderAge >= a.startAge && sliderAge < a.endAge) ||
      sliderAntardashas[0]
    );
  }, [sliderAntardashas, sliderAge]);

  const currentMahadasha = vimshottariDasha.cycle.find((c) => c.planet === vimshottariDasha.currentLord) || vimshottariDasha.cycle[0];
  const currentAntardashasList = calculateAntardashas(
    vimshottariDasha.currentLord,
    currentMahadasha.durationYears,
    currentMahadasha.startAge,
    birthDate,
    natalCalc.planets,
    natalLagnaRasi
  );
  const currentAntardasha = currentAntardashasList.find((a) => a.isCurrent) || currentAntardashasList[0];

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
    birthDate,
    natalCalc.planets,
    natalLagnaRasi
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
            <h1 className="text-[14px] font-vedic font-normal text-stone-900 leading-tight">
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



      {/* INTERACTIVE TIMELINE SLIDER */}
      <div className="bg-white rounded-lg border border-stone-200 p-3 space-y-2 shadow-3xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-purple-700" />
            <h3 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wider">
              Interactive Dasha Age &amp; Time Slider
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-950 border border-purple-200 font-mono font-bold text-[12px]">
            Age: {sliderAge.toFixed(1)} yrs ({sliderMahadasha.planet} / {sliderAntardasha?.planet})
          </span>
        </div>

        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={sliderAge}
            onChange={(e) => setSliderAge(parseFloat(e.target.value))}
            className="w-full accent-purple-700 cursor-pointer h-2 bg-stone-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-stone-500 font-mono">
            <span>Age 0 (Birth)</span>
            <span>Age 25</span>
            <span>Age 50</span>
            <span>Age 75</span>
            <span>Age 100</span>
          </div>
        </div>

        <div className="bg-[#FAF8F5] rounded border border-stone-200 px-3 py-2 text-[12px] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-800">Slider Target Period:</span>
            <span className="text-purple-950 font-bold">
              {sliderMahadasha.planet} Maha / {sliderAntardasha?.planet} Antar
            </span>
          </div>
          <div className="font-mono text-stone-700 text-[11px]">
            Interval: {sliderAntardasha?.startDate || sliderAntardasha?.startMonthYear} to {sliderAntardasha?.endDate || sliderAntardasha?.endMonthYear}
          </div>
        </div>
      </div>

      {/* SECTION 1: 9-PLANET MAHADASHA TIMELINE (WITH STRENGTH FINE LINES & TRI-BHAGA PARTS) */}
      <div className="bg-white rounded-md border border-stone-200/90 px-2.5 py-2 space-y-1.5 shadow-3xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
          <div className="flex items-center space-x-2">
            <h2 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wider flex items-center space-x-1.5 leading-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span><GlossaryTerm term="Mahadasha">Mahadasha</GlossaryTerm></span>
            </h2>
            <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-semibold">
              Nak: <strong className="text-stone-950">{natalNakshatra}</strong> ({vimshottariDasha.yearsRemainingAtBirth}y Bal)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="font-bold text-stone-500 uppercase tracking-wider mr-0.5">Fine Lines:</span>
            <span className="inline-flex items-center space-x-1 text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <span className="w-2.5 h-[2px] bg-emerald-500 rounded-full inline-block" />
              <span>Strong</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              <span className="w-2.5 h-[2px] bg-amber-500 rounded-full inline-block" />
              <span>Moderate</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-rose-800 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <span className="w-2.5 h-[2px] bg-rose-500 rounded-full inline-block" />
              <span>Weak</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-950 border border-purple-200 text-[11px] font-bold ml-1">
              Active: {vimshottariDasha.currentLord}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {vimshottariDasha.cycle.map((d) => {
            const isCurrentlyActive = d.planet === vimshottariDasha.currentLord;
            const isSelected = (selectedMahadashaPlanet || vimshottariDasha.currentLord) === d.planet;
            const rating = d.strengthInfo?.rating || 'Moderate';
            const score = d.strengthInfo?.score ?? 5.5;
            const fineLineColor = rating === 'Strong' ? 'bg-emerald-500' : rating === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
            const badgeColor =
              rating === 'Strong'
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : rating === 'Weak'
                ? 'text-rose-800 bg-rose-50 border-rose-200'
                : 'text-amber-800 bg-amber-50 border-amber-200';
            const totalYears = d.endAge - d.startAge;
            const elapsedYears = currentAge - d.startAge;
            const progress = totalYears > 0 ? Math.max(0, Math.min(100, (elapsedYears / totalYears) * 100)) : (currentAge >= d.endAge ? 100 : 0);

            return (
              <div
                key={`${d.planet}-${d.startMonthYear}`}
                onClick={() => setSelectedMahadashaPlanet(d.planet)}
                className={`px-1.5 py-1.5 rounded-md border transition-all duration-150 cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden ${
                  isSelected
                    ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : isCurrentlyActive
                    ? 'bg-purple-50/50 border-purple-300 shadow-3xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
                title={`Mahadasha Lord: ${d.planet} — Interval: ${d.startMonthYear} – ${d.endMonthYear} (mm-yy) • Strength: ${rating} (${score}/10) • ${d.strengthInfo?.dignity || ''} in ${d.strengthInfo?.housePlacement || ''}`}
              >
                {/* Fine line indicator on top of Mahadasha card */}
                <div className={`w-full h-[2.5px] rounded-t-sm mb-1 ${fineLineColor}`} />

                <div className="flex items-center justify-center space-x-1 leading-none w-full">
                  <span className="font-vedic font-bold text-stone-950 text-[12px]">{d.planet}</span>
                  <span className="text-[10px] font-bold text-amber-800">({d.durationYears}y)</span>
                  {isCurrentlyActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                </div>

                {/* Strength Rating badge with fine line indicator */}
                <div className="flex items-center justify-center space-x-1 my-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${fineLineColor}`} />
                  <span className={`text-[9px] font-bold px-1 py-0.2 rounded border leading-tight ${badgeColor}`}>
                    {rating} ({score})
                  </span>
                </div>

                {/* 3 Tri-Bhaga Parts of this Mahadasha fine lines */}
                <div className="w-full flex space-x-0.5 my-0.5 px-0.5" title="3 Tri-Bhaga Parts of this Dasha (Entry / Peak / Culmination)">
                  {d.parts?.map((p) => {
                    const pRating = p.strengthInfo?.rating || rating;
                    const pCol = pRating === 'Strong' ? 'bg-emerald-500' : pRating === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
                    return (
                      <div
                        key={p.partNumber}
                        className={`h-[2px] flex-1 rounded-full ${pCol} ${p.isCurrent ? 'ring-1 ring-amber-400' : 'opacity-80'}`}
                        title={`Part ${p.partNumber}: ${p.stage} (${p.durationYearsStr}) — ${p.startDate} – ${p.endDate} — ${pRating}`}
                      />
                    );
                  })}
                </div>

                <span className="text-[10px] font-mono font-semibold text-stone-700 leading-tight truncate w-full" title={`Maha Dasha Interval: ${d.startDate || d.startMonthYear} to ${d.endDate || d.endMonthYear} (dd-mm-yyyy)`}>
                  {d.startDate && d.endDate ? `${d.startDate} - ${d.endDate}` : `${d.startMonthYear} – ${d.endMonthYear}`}
                </span>

                <div className="w-full bg-stone-100 rounded-sm h-1 mt-1 overflow-hidden shadow-inner">
                  <div className="bg-stone-400/60 h-full rounded-sm transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ANTARDASHA (SUB-PERIODS) BREAKDOWN (WITH STRENGTH FINE LINES & 9 SUB-PORTIONS) */}
      <div className="bg-white rounded-lg border border-stone-200 px-2.5 py-2 shadow-3xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-1.5">
          <div className="flex items-center space-x-2">
            <h2 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wider">
              {activeDashaLord} Sub-Periods &amp; Strength Fine Lines
            </h2>
            <span className="text-[11px] text-stone-600 font-semibold">
              ({currentMahadashaInfo.startMonthYear} – {currentMahadashaInfo.endMonthYear})
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <span className="text-stone-500 font-medium">Sub-Period Fine Lines:</span>
            <span className="inline-flex items-center space-x-1 text-emerald-800 font-semibold">
              <span className="w-2.5 h-[2px] bg-emerald-500 rounded-full inline-block" />
              <span>Strong</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-amber-800 font-semibold">
              <span className="w-2.5 h-[2px] bg-amber-500 rounded-full inline-block" />
              <span>Moderate</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-rose-800 font-semibold">
              <span className="w-2.5 h-[2px] bg-rose-500 rounded-full inline-block" />
              <span>Weak</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {antardashas.map((antar) => {
            const isSelectedAntar = activeAntardashaInfo?.planet === antar.planet;
            const ratingAntar = antar.strengthInfo?.rating || 'Moderate';
            const scoreAntar = antar.strengthInfo?.score ?? 5.5;
            const fineLineColorAntar = ratingAntar === 'Strong' ? 'bg-emerald-500' : ratingAntar === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
            const badgeColorAntar =
              ratingAntar === 'Strong'
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : ratingAntar === 'Weak'
                ? 'text-rose-800 bg-rose-50 border-rose-200'
                : 'text-amber-800 bg-amber-50 border-amber-200';
            const totalAntarYears = antar.endAge - antar.startAge;
            const elapsedAntarYears = currentAge - antar.startAge;
            const progressAntar = totalAntarYears > 0 ? Math.max(0, Math.min(100, (elapsedAntarYears / totalAntarYears) * 100)) : (currentAge >= antar.endAge ? 100 : 0);

            return (
              <div
                key={`${activeDashaLord}-${antar.planet}-${antar.startMonthYear}`}
                onClick={() => setSelectedAntardashaPlanet(antar.planet)}
                className={`px-1.5 py-1.5 rounded-md border transition-all cursor-pointer flex flex-col items-center justify-between text-center overflow-hidden ${
                  isSelectedAntar
                    ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : antar.isCurrent
                    ? 'bg-purple-50/50 border-purple-300 shadow-3xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
                title={`Sub-Period Lord: ${antar.planet} — Interval: ${antar.startMonthYear} – ${antar.endMonthYear} (mm-yy) • Strength: ${ratingAntar} (${scoreAntar}/10) • ${antar.strengthInfo?.mutualHouseAngle || ''}`}
              >
                {/* Fine line indicator on top of Sub-Period card */}
                <div className={`w-full h-[2.5px] rounded-t-sm mb-1 ${fineLineColorAntar}`} />

                <div className="flex items-center justify-center space-x-1 leading-none w-full">
                  <span className="font-vedic font-bold text-stone-950 text-[12px]">{antar.planet}</span>
                  <span className="text-[10px] font-bold text-amber-800">({antar.durationYearsStr})</span>
                  {antar.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                </div>

                {/* Strength Rating badge with fine line indicator */}
                <div className="flex items-center justify-center space-x-1 my-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${fineLineColorAntar}`} />
                  <span className={`text-[9px] font-bold px-1 py-0.2 rounded border leading-tight ${badgeColorAntar}`}>
                    {ratingAntar} ({scoreAntar})
                  </span>
                </div>

                {/* 9 Sub-Portions (Pratyantardasha) Fine Lines Strip */}
                <div className="w-full flex space-x-0.5 my-0.5 px-0.5" title="9 Sub-Portions (Pratyantardashas) of this Sub-Period">
                  {antar.pratyantardashas?.map((prat, idx) => {
                    const prRating = prat.strengthInfo.rating;
                    const prCol = prRating === 'Strong' ? 'bg-emerald-500' : prRating === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
                    return (
                      <div
                        key={idx}
                        className={`h-[2px] flex-1 rounded-full ${prCol} ${prat.isCurrent ? 'ring-1 ring-amber-400' : 'opacity-80'}`}
                        title={`${prat.planet}: ${prat.durationStr} (${prat.startDate} – ${prat.endDate}) — ${prRating}`}
                      />
                    );
                  })}
                </div>

                <span className="text-[10px] font-mono font-semibold text-stone-700 leading-tight truncate w-full" title={`Sub-Period Interval: ${antar.startDate || antar.startMonthYear} to ${antar.endDate || antar.endMonthYear} (dd-mm-yyyy)`}>
                  {antar.startDate && antar.endDate ? `${antar.startDate} - ${antar.endDate}` : `${antar.startMonthYear} – ${antar.endMonthYear}`}
                </span>

                <div className="w-full bg-stone-100 rounded-sm h-1 mt-1 overflow-hidden shadow-inner">
                  <div className="bg-stone-400/60 h-full rounded-sm transition-all" style={{ width: `${progressAntar}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DASHA SECTIONS — COMPACT DECK OF CARDS SELECTOR */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/90 px-2.5 py-1.5 shadow-3xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            {
              id: 'interpretation',
              title: 'Dasha Interpretation',
              icon: BookOpen,
            },
            {
              id: 'parts-subperiods',
              title: 'Parts & Sub-Periods (Strength)',
              icon: Activity,
            },
            {
              id: 'monthly',
              title: 'Monthly Guidance',
              icon: Calendar,
            },
            {
              id: 'yogini',
              title: 'Yogini Dasha (36y)',
              icon: Sparkles,
            },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = activeDashaDeck === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveDashaDeck(card.id as any)}
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

      {/* CARD: PARTS OF THE DASHA & SUB-PERIODS (STRENGTH & FINE LINES ANALYSIS) */}
      {activeDashaDeck === 'parts-subperiods' && (
      <div className="bg-white rounded-lg border border-amber-300/90 p-3 shadow-3xs space-y-3">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-amber-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px] tracking-tight">
                Parts of the Dasha &amp; Sub-Periods — Strength Fine Lines
              </h2>
            </div>
            <p className="text-[12px] text-stone-600 mt-0.5">
              Classical Vedic Tri-Bhaga (3-part division) of Mahadashas &amp; 9-fold Sub-Portions (Pratyantardashas). Fine lines reveal Strong (Balavan), Moderate (Madhyama), and Weak (Nirbala) periods.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200 text-[11px] font-bold">
              Maha: {activeDashaLord} ({currentMahadashaInfo.strengthInfo?.rating || 'Moderate'})
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-950 border border-purple-200 text-[11px] font-bold">
              Sub: {activeAntardashaInfo?.planet} ({activeAntardashaInfo?.strengthInfo?.rating || 'Moderate'})
            </span>
          </div>
        </div>

        {/* FINE LINES INTERPRETATION & STRENGTH GAUGE LEGEND */}
        <div className="bg-stone-50/80 rounded-md border border-stone-200 p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-vedic font-bold text-[12px] uppercase tracking-wider text-stone-900 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Cosmic Strength Fine-Line Guide</span>
            </span>
            <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
              Based on Dignity, Kendra/Trikona placement &amp; Mutual Bhavas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white rounded border border-emerald-200/90 p-2 space-y-1 shadow-3xs">
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-[2.5px] bg-emerald-500 rounded-full" />
                <span className="font-bold text-[12px] text-emerald-900">Fine Emerald Line: Strong (Balavan)</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-snug">
                Score 7.2–10.0 • Planet in Kendra (1,4,7,10) or Trikona (5,9,11), Exalted or Own sign, harmonious aspects. Unlocks high vitality, career breakthroughs, decisive actions, and auspicious fruits.
              </p>
            </div>

            <div className="bg-white rounded border border-amber-200/90 p-2 space-y-1 shadow-3xs">
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-[2.5px] bg-amber-500 rounded-full" />
                <span className="font-bold text-[12px] text-amber-900">Fine Amber Line: Moderate (Madhyama)</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-snug">
                Score 4.8–7.1 • Upachaya house (3rd), neutral dignity, balanced aspects. Demands steady daily discipline, methodical effort, and structured pacing to consolidate progressive gains.
              </p>
            </div>

            <div className="bg-white rounded border border-rose-200/90 p-2 space-y-1 shadow-3xs">
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-[2.5px] bg-rose-500 rounded-full" />
                <span className="font-bold text-[12px] text-rose-900">Fine Rose Line: Weak / Sensitive (Nirbala)</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-snug">
                Score 1.5–4.7 • Dusthana (6,8,12), debilitation, or Shadashtaka (6/8 friction) with Mahadasha lord. Requires emotional poise, reduced speculative risks, and protective Vedic remedies.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION A: 3 CLASSICAL PARTS (TRI-BHAGA) OF ACTIVE MAHADASHA */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <h3 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wide">
                3 Classical Parts (Tri-Bhaga) of {activeDashaLord} Mahadasha
              </h3>
            </div>
            <span className="text-[11px] text-stone-600 font-semibold">
              Total {currentMahadashaInfo.durationYears} Years • {currentMahadashaInfo.startMonthYear} – {currentMahadashaInfo.endMonthYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {currentMahadashaInfo.parts?.map((p) => {
              const pRating = p.strengthInfo.rating;
              const pScore = p.strengthInfo.score;
              const pColor = pRating === 'Strong' ? 'bg-emerald-500' : pRating === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
              const pBadge =
                pRating === 'Strong'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : pRating === 'Weak'
                  ? 'text-rose-800 bg-rose-50 border-rose-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200';

              return (
                <div
                  key={p.partNumber}
                  className={`rounded-lg border p-2.5 transition-all flex flex-col justify-between space-y-2 ${
                    p.isCurrent
                      ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                      : 'bg-[#FAF8F5] border-stone-200 hover:bg-white shadow-3xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Fine line indicator on part card */}
                    <div className={`w-full h-[2.5px] rounded-full ${pColor}`} />

                    <div className="flex items-center justify-between gap-1">
                      <span className="font-vedic font-bold text-[13px] text-stone-900 leading-tight">
                        Part {p.partNumber}: {p.stage}
                      </span>
                      {p.isCurrent && (
                        <span className="bg-amber-500 text-white font-bold text-[9.5px] px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 animate-pulse">
                          Current Phase
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-600 border-b border-stone-200/70 pb-1">
                      <span>{p.startDate} – {p.endDate}</span>
                      <span className="font-semibold text-stone-800">({p.durationYearsStr})</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${pColor}`} />
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${pBadge}`}>
                        {pRating} ({pScore}/10)
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium truncate">
                        {p.focusArea}
                      </span>
                    </div>

                    <p className="text-[12px] text-stone-700 leading-snug">
                      {p.description}
                    </p>
                  </div>

                  <div className="text-[11px] font-semibold text-stone-800 bg-white/80 rounded px-2 py-1 border border-stone-200/60">
                    <span className="text-amber-800 mr-1">Vedic Pacing:</span>
                    {p.partNumber === 1
                      ? 'Establish routines and adjust to the planetary frequency.'
                      : p.partNumber === 2
                      ? 'Drive key career, financial, and personal initiatives forward.'
                      : 'Consolidate ongoing affairs and prepare for the next period.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION B: 9 SUB-PORTIONS (PRATYANTARDASHAS) OF ACTIVE SUB-PERIOD */}
        <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <h3 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wide">
                9 Sub-Portions (Pratyantardashas) of {activeDashaLord}–{activeAntardashaInfo?.planet}
              </h3>
            </div>
            <span className="text-[11px] text-stone-600 font-semibold">
              Sub-Period Span: {activeAntardashaInfo?.startMonthYear} – {activeAntardashaInfo?.endMonthYear} ({activeAntardashaInfo?.durationYearsStr})
            </span>
          </div>

          <p className="text-[12px] text-stone-600 leading-snug">
            Each sub-period is divided proportionally into 9 sub-portions. Each card displays its individual fine line, strength rating, natal house placement, and mutual angle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activeAntardashaInfo?.pratyantardashas?.map((prat, idx) => {
              const prRating = prat.strengthInfo.rating;
              const prScore = prat.strengthInfo.score;
              const prFineLine =
                prRating === 'Strong' ? 'bg-emerald-500' : prRating === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
              const prBadge =
                prRating === 'Strong'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : prRating === 'Weak'
                  ? 'text-rose-800 bg-rose-50 border-rose-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200';

              return (
                <div
                  key={`${activeDashaLord}-${activeAntardashaInfo.planet}-${prat.planet}-${idx}`}
                  className={`rounded-lg border p-2.5 transition-all flex flex-col justify-between space-y-1.5 ${
                    prat.isCurrent
                      ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                      : 'bg-[#FAF8F5] border-stone-200/90 hover:bg-white hover:border-amber-200 shadow-3xs'
                  }`}
                >
                  <div className="space-y-1">
                    {/* Fine line on sub-portion card */}
                    <div className={`w-full h-[2.5px] rounded-full ${prFineLine}`} />

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-vedic font-bold text-stone-950 text-[13px]">
                          {activeDashaLord}–{activeAntardashaInfo.planet}–{prat.planet}
                        </span>
                      </div>
                      {prat.isCurrent && (
                        <span className="bg-amber-500 text-white font-bold text-[9.5px] px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 animate-pulse">
                          Active Now
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-600 border-b border-stone-200/60 pb-1">
                      <span>{prat.startDate} – {prat.endDate}</span>
                      <span className="font-bold text-stone-800">{prat.durationStr}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <div className="flex items-center space-x-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${prFineLine}`} />
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${prBadge}`}>
                          {prRating} ({prScore}/10)
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-600 font-medium">
                        {prat.strengthInfo.dignity} • {prat.strengthInfo.housePlacement}
                      </span>
                    </div>

                    {prat.strengthInfo.mutualHouseAngle && (
                      <div className="text-[10px] font-semibold text-purple-900 bg-purple-50/70 border border-purple-200/60 px-1.5 py-0.5 rounded">
                        Angle: {prat.strengthInfo.mutualHouseAngle}
                      </div>
                    )}

                    <p className="text-[11.5px] text-stone-700 leading-snug pt-0.5">
                      {prat.strengthInfo.primaryEffect}
                    </p>
                  </div>

                  <div className="text-[10.5px] text-stone-800 bg-white/90 rounded px-2 py-1 border border-stone-200/70">
                    <span className="font-bold text-amber-900 mr-1">Guidance:</span>
                    {prat.strengthInfo.guidanceTip}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION C: SUB-PERIODS FINE-LINE SPECTRUM BAR */}
        <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="font-vedic font-bold text-[12px] uppercase tracking-wide text-stone-900 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Full Sub-Period Fine-Line Spectrum ({activeDashaLord} Mahadasha)</span>
            </span>
            <span className="text-[11px] text-stone-500">
              Click any segment to inspect its 9 sub-portions
            </span>
          </div>

          <div className="w-full flex rounded-md overflow-hidden border border-stone-300 shadow-inner h-6">
            {antardashas.map((antar) => {
              const isSelectedAntar = activeAntardashaInfo?.planet === antar.planet;
              const r = antar.strengthInfo?.rating || 'Moderate';
              const col = r === 'Strong' ? 'bg-emerald-500' : r === 'Weak' ? 'bg-rose-500' : 'bg-amber-500';
              const textCol = r === 'Strong' ? 'text-white' : r === 'Weak' ? 'text-white' : 'text-stone-950';

              return (
                <button
                  type="button"
                  key={`spectrum-${antar.planet}`}
                  onClick={() => setSelectedAntardashaPlanet(antar.planet)}
                  style={{ flex: antar.durationMonths }}
                  className={`${col} ${textCol} h-full text-[11px] font-bold flex items-center justify-center transition-opacity cursor-pointer border-r border-white/40 last:border-r-0 relative group ${
                    isSelectedAntar ? 'ring-2 ring-stone-900 z-10' : 'hover:opacity-90'
                  }`}
                  title={`${antar.planet} (${antar.durationYearsStr}) — ${r} (${antar.strengthInfo?.score ?? 5.5}/10)`}
                >
                  <span className="truncate px-0.5">{antar.planet}</span>
                  {antar.isCurrent && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white ring-1 ring-stone-900" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
            <span>Start: {currentMahadashaInfo.startMonthYear}</span>
            <span className="font-semibold text-stone-700">9 Antardasha Phases with Proportional Duration &amp; Strength Fine Lines</span>
            <span>End: {currentMahadashaInfo.endMonthYear}</span>
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
              className="bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none focus:border-amber-600 focus:bg-white shadow-3xs cursor-pointer"
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

      {/* CARD 3: YOGINI DASHA (FAST 36-YEAR CYCLE) */}
      {activeDashaDeck === 'yogini' && (
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-2xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <div>
                <h3 className="font-vedic font-bold text-stone-950 text-[14px]">
                  Yogini Dasha (36-Year Sacred Tantric &amp; Vedic Timing Cycle)
                </h3>
                <p className="text-[11px] text-stone-600">
                  Operates under 8 cosmic divine shaktis for acute event manifestation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold text-purple-900">
              <span>Active: {yoginiDasha.currentYogini.name} ({yoginiDasha.currentYogini.sanskrit})</span>
            </div>
          </div>

          {/* Active Yogini Spotlight Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-[#FAF8F5] to-purple-50 rounded-md border border-purple-200 p-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">
                Current Yogini Period ({yoginiDasha.currentYogini.startDate} – {yoginiDasha.currentYogini.endDate})
              </span>
              <span className="text-[14px] font-bold text-stone-950">
                {yoginiDasha.currentYogini.name} ({yoginiDasha.currentYogini.sanskrit}) • Lord: {yoginiDasha.currentYogini.lord} ({yoginiDasha.currentYogini.durationYears} Years)
              </span>
              <p className="text-[12px] text-stone-700 leading-tight mt-0.5">
                {yoginiDasha.currentYogini.theme}
              </p>
            </div>
          </div>

          {/* 8 Yogini Cycle Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {yoginiDasha.cycle.map((y) => (
              <div
                key={y.name}
                className={`p-2 rounded border text-center flex flex-col justify-between ${
                  y.isActive
                    ? 'bg-purple-100/90 border-purple-500 ring-1 ring-purple-400 font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border-stone-200/80 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-[12px] font-bold text-stone-900">{y.name}</div>
                  <div className="text-[10px] text-purple-900 font-serif font-bold">{y.sanskrit}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {y.lord} ({y.durationYears}y)
                  </div>
                </div>
                <div className="text-[9px] text-stone-600 mt-1 font-mono leading-none border-t border-stone-200/60 pt-1">
                  {y.startDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
