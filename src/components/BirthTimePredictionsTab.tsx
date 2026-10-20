import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Compass,
  ArrowRight,
  Loader2,
  Award,
  Layers,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Globe,
  Moon,
  Heart,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import { CelestialSkyMapWheel } from './CelestialSkyMapWheel';
import { NatalZodiacWheel } from './NatalZodiacWheel';
import { AspectStrengthTrajectoryGraph } from './AspectStrengthTrajectoryGraph';
import { ProfileSelector } from './ProfileSelector';
import { PlaceValue } from './PlaceOfBirthInput';
import { HouseCardDeck } from './HouseCardDeck';
import { BhriguLalKitabSection } from './BhriguLalKitabSection';
import { PlanetaryAspectsAndAlerts } from './PlanetaryAspectsAndAlerts';
import { ShadbalaD3Chart } from './ShadbalaD3Chart';
import {
  calculatePlanetaryPositions,
  buildHouseStructure,
  calculateBirthTimeHousePredictions,
  calculateBhriguAndLalKitab,
  calculateNatalYogas,
  calculateVimshottariDasha,
  calculateChandraEmotionalSignificance,
  calculateShadbala,
} from '../vedicMath';
import {
  HouseInfo,
  PlanetPosition,
  UserProfile,
  BirthTimeHousePrediction,
  NatalYoga,
  VimshottariDashaInfo,
  ChandraEmotionalSignificance,
} from '../types';
import { POPULAR_CITIES, VEDIC_RASIS } from '../data';
import {
  getSavedProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/profileStorage';

interface BirthTimePredictionsTabProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onProfileChange: (id: string) => void;
  onUpdateProfiles: (updated: UserProfile[]) => void;
  onNavigateToMonthWise?: () => void;
  onNavigateToDasha?: () => void;
}

export function BirthTimePredictionsTab({
  profiles,
  activeProfileId,
  onProfileChange,
  onUpdateProfiles,
  onNavigateToMonthWise,
  onNavigateToDasha
}: BirthTimePredictionsTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Birth details state
  const [name, setName] = useState(currentProfile?.name || 'Munish Sharma');
  const [birthDate, setBirthDate] = useState(currentProfile?.birthDate || '1990-05-18');
  const [birthTime, setBirthTime] = useState(currentProfile?.birthTime || '07:30');
  const [selectedCity, setSelectedCity] = useState<PlaceValue>(() => {
    if (currentProfile?.place) {
      return {
        name: currentProfile.place,
        lat: currentProfile.latitude ?? 28.6139,
        lng: currentProfile.longitude ?? 77.2090,
        tz: currentProfile.timezone ?? 5.5,
      };
    }
    return {
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.2090,
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

  const [selectedHouse, setSelectedHouse] = useState<HouseInfo | null>(null);
  const [selectedHouseNumber, setSelectedHouseNumber] = useState<number>(1);
  const [birthChartLayout, setBirthChartLayout] = useState<'north' | 'south' | 'wheel'>('north');
  const [houseDomainFilter, setHouseDomainFilter] = useState<string>('ALL');
  const [shadbalaSubTab, setShadbalaSubTab] = useState<string>('chart');
  const [activeBirthSectionTab, setActiveBirthSectionTab] = useState<
    | 'kundali'
    | 'moon-sign'
    | 'aspects'
    | 'coordinates'
    | 'shadbala'
    | 'celestial-wheel'
    | 'houses-summary'
    | 'bhava-deck'
    | 'bhrigu-samhita'
    | 'lal-kitab'
    | 'analytical-metrics'
  >('kundali');

  // AI Birth Reading state
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Calculated astrological state
  const [natalPlanets, setNatalPlanets] = useState<PlanetPosition[]>([]);
  const [natalHouses, setNatalHouses] = useState<HouseInfo[]>([]);
  const [natalLagnaRasi, setNatalLagnaRasi] = useState<number>(5);
  const [natalMoonRasi, setNatalMoonRasi] = useState<number>(5);
  const [natalMoonDeg, setNatalMoonDeg] = useState<number>(0);
  const [natalMoonPada, setNatalMoonPada] = useState<number>(1);
  const [natalNakshatra, setNatalNakshatra] = useState<string>('Magha');
  const [chandraEmotional, setChandraEmotional] = useState<ChandraEmotionalSignificance | null>(null);
  const [selectedExplorationMoonSign, setSelectedExplorationMoonSign] = useState<number | null>(null);

  const [housePredictions, setHousePredictions] = useState<BirthTimeHousePrediction[]>([]);
  const [natalYogas, setNatalYogas] = useState<NatalYoga[]>([]);
  const [vimshottariDasha, setVimshottariDasha] = useState<VimshottariDashaInfo | null>(null);

  // Compute Janam Kundali and Birth Time Predictions
  const computeBirthPredictions = useCallback((
    targetDate: string = birthDate,
    targetTime: string = birthTime,
    targetCity = selectedCity
  ) => {
    const [year, month, day] = targetDate.split('-').map(Number);
    const [hour, minute] = targetTime.split(':').map(Number);
    const birthDateTime = new Date(year, month - 1, day, hour, minute);

    const natalCalc = calculatePlanetaryPositions(
      birthDateTime,
      targetCity.lat,
      targetCity.lng
    );

    const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
    const nHouses = buildHouseStructure(natalCalc.lagnaRasi, natalCalc.planets);
    const hPredictions = calculateBirthTimeHousePredictions(natalCalc.lagnaRasi, natalCalc.planets);
    const yogas = calculateNatalYogas(natalCalc.lagnaRasi, natalCalc.planets);

    // Calculate Moon total degree across 360
    const moonTotalDeg = (natalMoon.rasiNumber - 1) * 30 + natalMoon.degree + natalMoon.minute / 60;
    const dasha = calculateVimshottariDasha(moonTotalDeg, targetDate, natalCalc.planets, natalCalc.lagnaRasi);

    setNatalPlanets(natalCalc.planets);
    setNatalHouses(nHouses);
    setNatalLagnaRasi(natalCalc.lagnaRasi);
    setNatalMoonRasi(natalCalc.moonRasi);
    setNatalMoonDeg(natalCalc.moonDeg);
    setNatalMoonPada(natalCalc.moonPada);
    setNatalNakshatra(natalCalc.moonNakshatra);
    setChandraEmotional(natalCalc.moonEmotionalSignificance);
    setHousePredictions(hPredictions);
    setNatalYogas(yogas);
    setVimshottariDasha(dasha);

    setSelectedHouse((prev) => {
      const match = prev ? nHouses.find((h) => h.houseNumber === prev.houseNumber) : nHouses[0];
      return match || nHouses[0];
    });
    setSelectedHouseNumber((prev) => prev || 1);
  }, [birthDate, birthTime, selectedCity]);

  const handleSelectHouse = (h: HouseInfo) => {
    setSelectedHouse(h);
    setSelectedHouseNumber(h.houseNumber);
  };

  const handleSelectHouseNumber = (num: number) => {
    setSelectedHouseNumber(num);
    const found = natalHouses.find((h) => h.houseNumber === num);
    if (found) setSelectedHouse(found);
  };

  // Profile Switching
  const handleSelectProfile = (profile: UserProfile) => {
    onProfileChange(profile.id);
    setAiReading(null);
  };

  const handleSaveProfile = (profileToSave: UserProfile) => {
    const updated = upsertProfile(profileToSave);
    onUpdateProfiles(updated);
    if (profileToSave.id === activeProfileId) {
      onProfileChange(profileToSave.id);
    }
  };

  const handleDeleteProfile = (id: string) => {
    const updated = deleteProfile(id);
    onUpdateProfiles(updated);
    if (activeProfileId === id && updated.length > 0) {
      onProfileChange(updated[0].id);
    }
  };

  useEffect(() => {
    computeBirthPredictions();
  }, [computeBirthPredictions]);

  // AI Birth Kundali Deep Synthesis
  const fetchAiBirthPrediction = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const natalLagnaName = VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName || 'Mesha';
      const natalMoonName = VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName || 'Mesha';

      const res = await fetch('/api/astrology/vedic-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate,
          birthTime,
          birthPlace: selectedCity.name,
          lagnaRasi: natalLagnaName,
          moonRasi: natalMoonName,
          nakshatra: natalNakshatra,
          activeDasha: vimshottariDasha?.currentLord,
          mode: 'birth-time-reading',
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reading');
      }
      
      setAiReading(data.reading || 'Birth chart synthesis calculated.');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        setAiError('The cosmic channels are currently busy (High API Demand). Please try again in a few moments.');
      } else {
        setAiError('The stars are temporarily obscured. Please check your connection and try again.');
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  const filteredPredictions = houseDomainFilter === 'ALL'
    ? housePredictions
    : housePredictions.filter((p) => {
        if (houseDomainFilter === 'CAREER') return p.houseNumber === 10 || p.houseNumber === 6;
        if (houseDomainFilter === 'WEALTH') return p.houseNumber === 2 || p.houseNumber === 11 || p.houseNumber === 5;
        if (houseDomainFilter === 'MARRIAGE') return p.houseNumber === 7 || p.houseNumber === 4;
        if (houseDomainFilter === 'HEALTH') return p.houseNumber === 1 || p.houseNumber === 6 || p.houseNumber === 8;
        if (houseDomainFilter === 'DHARMA') return p.houseNumber === 9 || p.houseNumber === 12;
        return true;
      });

  return (
    <div className="w-full space-y-2">
      {/* Sacred Lord Ganesha Outline & Mangalacharan Header Banner */}
      <div className="bg-gradient-to-r from-[#FDF8EE] via-[#FFFDF9] to-[#FDF8EE] rounded-lg border border-amber-200/90 px-3 py-2 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-2 relative overflow-hidden">
        <div className="flex items-center space-x-3">
          {/* Artistic Sacred Ganesha Line-Art Outline SVG */}
          <div className="w-12 h-12 rounded-full bg-amber-50/90 border border-amber-300/80 flex items-center justify-center shrink-0 shadow-2xs">
            <svg
              viewBox="0 0 100 100"
              className="w-10 h-10 text-amber-800"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Sacred Halo Circle */}
              <circle cx="50" cy="50" r="46" strokeWidth="1.2" strokeDasharray="3 2" className="text-amber-500/70" />
              {/* Mukut (Crown) Tiered Outline */}
              <path d="M36 32 L50 10 L64 32 Z" strokeWidth="2" />
              <path d="M41 25 L50 14 L59 25" strokeWidth="1.5" />
              <path d="M33 32 Q50 35 67 32" strokeWidth="2.2" />
              <circle cx="50" cy="7" r="2" fill="currentColor" />
              {/* Left & Right Auspicious Ears */}
              <path d="M34 35 C16 32, 14 56, 32 58" strokeWidth="2" />
              <path d="M66 35 C84 32, 86 56, 68 58" strokeWidth="2" />
              {/* Sacred Tilak (Tripundra) on Forehead */}
              <path d="M43 39 Q50 41 57 39" strokeWidth="1.6" />
              <path d="M45 43 Q50 45 55 43" strokeWidth="1.6" />
              <circle cx="50" cy="47" r="1.6" fill="currentColor" />
              {/* Serene Eyes */}
              <path d="M38 46 Q41 44 44 46" strokeWidth="1.6" />
              <path d="M56 46 Q59 44 62 46" strokeWidth="1.6" />
              {/* Graceful Curved Trunk & Tusk (Ekadanta) */}
              <path d="M44 50 C43 64, 44 76, 56 76 C63 76, 64 68, 59 66 C56 65, 55 69, 58 70" strokeWidth="2.2" />
              <path d="M40 57 L36 61 L42 60" strokeWidth="1.6" />
              {/* Modak in Trunk Curve */}
              <circle cx="60" cy="63" r="2.5" fill="currentColor" className="text-amber-600" />
              {/* Sacred Lotus Base */}
              <path d="M28 84 Q50 92 72 84" strokeWidth="1.8" />
              <path d="M35 86 Q50 78 65 86" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-vedic font-black text-amber-900 text-[15px] tracking-wide shrink-0">
              ॥ श्री गणेशाय नमः ॥
            </span>
            <span className="text-amber-300 hidden sm:inline">|</span>
            <span className="text-[13px] text-stone-700 font-semibold leading-snug">
              Vakratunda Mahakaya Suryakoti Samaprabha • Nirvighnam Kuru Me Deva Sarva-Karyeshu Sarvada
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-[12px] font-bold text-amber-900 bg-amber-100/60 border border-amber-200 px-2.5 py-1 rounded-md shrink-0">
          <span>Shubh Muhurta &amp; Sidereal Lahiri</span>
        </div>
      </div>

      {/* BIRTH CHARTS & READINGS — COMPACT DECK OF CARDS SELECTOR */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-stone-200/90 px-2 py-1 shadow-3xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
          {[
            {
              id: 'kundali',
              title: 'Janam Kundali (D1)',
              icon: Compass,
            },
            {
              id: 'moon-sign',
              title: 'Moon Sign (Chandra)',
              icon: Moon,
            },
            {
              id: 'aspects',
              title: 'Aspects & Guidance',
              icon: Activity,
            },
            {
              id: 'shadbala',
              title: 'Shadbala & 9 Grahas',
              icon: Sparkles,
            },
            {
              id: 'celestial-wheel',
              title: '360° Celestial Wheel',
              icon: Globe,
            },
            {
              id: 'houses-summary',
              title: 'Summary of 12 Houses',
              icon: Layers,
            },
            {
              id: 'bhava-deck',
              title: 'Bhava Deck',
              icon: Layers,
            },
            {
              id: 'analytical-metrics',
              title: 'Planets, Shadbala & Metrics',
              icon: Activity,
            },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = activeBirthSectionTab === card.id || (card.id === 'shadbala' && activeBirthSectionTab === 'coordinates');
            return (
              <div
                key={card.id}
                onClick={() => {
                  setActiveBirthSectionTab(card.id as any);
                }}
                className={`group relative rounded-md px-1.5 py-1 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1 shadow-3xs ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-white border-stone-200/70 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
              >
                <span
                  className={`font-ui font-semibold text-[10px] sm:text-[10.5px] leading-tight truncate ${
                    isActive ? 'text-amber-950 font-bold' : 'text-stone-800'
                  }`}
                >
                  {card.title}
                </span>
                <Icon
                  className={`w-3 h-3 shrink-0 ${
                    isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* TAB: ANALYTICAL METRICS */}
      {activeBirthSectionTab === 'analytical-metrics' && (
        <div className="bg-white rounded-lg border border-stone-200 p-4 shadow-3xs space-y-4">
          <h2 className="font-vedic font-bold text-stone-950 text-[16px] uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-5 h-5 text-amber-700" />
            <span>Planets, Shadbala &amp; Analytical Metrics</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Planets (Grahas) */}
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <h3 className="font-bold text-amber-900 mb-2">Grahas (Planets)</h3>
              <div className="text-[13px] text-stone-700 space-y-1">
                {natalPlanets.map(p => (
                  <div key={p.name} className="flex justify-between items-center">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[11px] bg-stone-200 px-1.5 rounded">{p.rasiName} / H{p.house}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadbala */}
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <h3 className="font-bold text-amber-900 mb-2">Shadbala (Planetary Strength)</h3>
              <div className="text-[13px] text-stone-700 space-y-1">
                {natalPlanets.map(p => (
                  <div key={p.name} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="font-mono font-bold">{calculateShadbala(p.name, natalPlanets).toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <ShadbalaD3Chart natalPlanets={natalPlanets} />
              </div>
            </div>

            {/* Aspects */}
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <h3 className="font-bold text-amber-900 mb-2">Aspect Strengths (Drishti)</h3>
              <p className="text-[12px] text-stone-600 italic">Inter-planetary influence metrics...</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: JANAM KUNDALI (D1) OVERVIEW */}
      {activeBirthSectionTab === 'kundali' && (
        <div className="space-y-2">
          {/* North Indian Diamond / South Indian Fixed Chart & Kundali Focus Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
            {/* Left Column: D1 Birth Chart with Layout Toggle (North, South, 360° Celestial Wheel) */}
            <div className={`${birthChartLayout === 'wheel' ? 'lg:col-span-12' : 'lg:col-span-5'} flex flex-col items-center space-y-1.5 transition-all`}>
              <div className="flex flex-wrap items-center justify-between w-full max-w-[500px] px-1 gap-1">
                <span className="text-[11px] font-bold text-stone-600">Chart Layout:</span>
                <div className="flex rounded border border-stone-200 bg-white p-0.5 text-[11px] shadow-3xs">
                  <button
                    onClick={() => setBirthChartLayout('north')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      birthChartLayout === 'north'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'text-stone-600'
                    }`}
                  >
                    North (Diamond)
                  </button>
                  <button
                    onClick={() => setBirthChartLayout('south')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      birthChartLayout === 'south'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'text-stone-600'
                    }`}
                  >
                    South (Fixed Rasi)
                  </button>
                  <button
                    onClick={() => setBirthChartLayout('wheel')}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                      birthChartLayout === 'wheel'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'text-stone-600'
                    }`}
                  >
                    <span>360° Celestial Wheel</span>
                  </button>
                </div>
              </div>

              {birthChartLayout === 'north' ? (
                <NorthIndianChart
                  houses={natalHouses}
                  title="Janam Kundali"
                  subtitle="Sidereal D1"
                  showTransitsTogether={false}
                  onSelectHouse={handleSelectHouse}
                  selectedHouseNumber={selectedHouseNumber}
                />
              ) : birthChartLayout === 'south' ? (
                <SouthIndianChart
                  houses={natalHouses}
                  title="Janam Kundali"
                  subtitle="Sidereal D1"
                  onSelectHouse={handleSelectHouse}
                  selectedHouseNumber={selectedHouseNumber}
                />
              ) : (
                <div className="w-full flex justify-center py-1 overflow-x-auto">
                  <NatalZodiacWheel
                    planets={natalPlanets}
                    houses={natalHouses}
                    lagnaRasi={natalLagnaRasi}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Core Natal Vitals, Chart Focus & Key Yogas Formed at Birth */}
            <div className={`${birthChartLayout === 'wheel' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-2`}>
              {/* Core Natal Vitals Bar (Ascendant, Moon Sign, Nakshatra, Current Dasha) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'lagna', label: 'Ascendant', val: VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName, lord: VEDIC_RASIS[natalLagnaRasi - 1]?.lord, textColor: 'text-amber-800' },
                  { id: 'moon', label: 'Moon Sign', val: VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName, lord: `Chandra • ${chandraEmotional?.englishName || ''}`, textColor: 'text-sky-800', isClickable: true },
                  { id: 'nakshatra', label: 'Nakshatra', val: natalNakshatra, lord: `Dasha: ${vimshottariDasha?.birthLord}`, textColor: 'text-emerald-800' },
                  { id: 'dasha', label: 'Current Dasha', val: `${vimshottariDasha?.currentLord} Dasha`, lord: 'Active Phase', textColor: 'text-purple-800' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.isClickable) setActiveBirthSectionTab('moon-sign');
                    }}
                    className={`bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2.5 py-1.5 shadow-3xs transition-all ${
                      item.isClickable ? 'cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 group' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black ${item.textColor} uppercase tracking-wider block`}>
                        {item.label}
                      </span>
                      {item.isClickable && (
                        <span className="text-[9.5px] text-sky-600 font-bold group-hover:underline">
                          Emotions →
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-[14px] font-vedic font-bold text-stone-900 leading-snug">
                        {item.val}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active House Selection Quick Bar (Tanu Bhava / Selected House) */}
              <div className="bg-gradient-to-r from-amber-50/50 via-white to-transparent rounded-lg border border-amber-200/80 px-2.5 py-1.5 shadow-3xs flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="text-amber-700 font-vedic font-bold text-[20px] leading-none">
                    H{selectedHouseNumber}
                  </div>
                  <div className="h-5 w-px bg-stone-200" />
                  <div>
                    <span className="font-vedic font-bold text-stone-900 text-[15px]">
                      {selectedHouse?.vedicName}
                    </span>
                    <p className="text-[12px] text-stone-600 font-bold uppercase tracking-wider">
                      {selectedHouse?.rasiName} • Lord: {selectedHouse?.signLord}
                    </p>
                  </div>
                </div>
              </div>

              {/* Natal Yogas Card */}
              <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2.5 py-2 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <h4 className="font-vedic font-bold text-stone-900 text-[14px] flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Natal Yogas</span>
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {natalYogas.map((yoga) => (
                    <div key={yoga.name} className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-amber-900 text-[14px] uppercase tracking-wide">{yoga.name}</span>
                        <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider">
                          {yoga.auspiciousness}
                        </span>
                      </div>
                      <p className="text-[13px] text-stone-700 leading-snug">
                        {yoga.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moon Sign (Chandra Rasi) & Emotional Significance Card */}
              {chandraEmotional && (
                <div className="bg-gradient-to-br from-sky-50/70 via-white to-amber-50/40 rounded-lg border border-sky-200/90 px-3 py-2.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-md bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 shadow-3xs">
                        <Moon className="w-4 h-4 fill-sky-500 text-sky-700" />
                      </div>
                      <div>
                        <h4 className="font-vedic font-bold text-stone-900 text-[14px] flex items-center space-x-1.5 leading-none">
                          <span>Chandra Rasi: {chandraEmotional.sanskritName} ({chandraEmotional.englishName})</span>
                        </h4>
                        <span className="text-[11px] font-medium text-stone-500">
                          {chandraEmotional.symbol} • {chandraEmotional.element} Element • Lord: {chandraEmotional.rulingPlanet}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shadow-3xs ${
                        chandraEmotional.dignity.includes('Exalted') || chandraEmotional.dignity.includes('Own')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : chandraEmotional.dignity.includes('Debilitated')
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {chandraEmotional.dignity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveBirthSectionTab('moon-sign')}
                        className="text-[11px] text-sky-800 hover:text-sky-950 font-bold hover:underline cursor-pointer flex items-center space-x-0.5"
                      >
                        <span>Deep Dossier →</span>
                      </button>
                    </div>
                  </div>

                  {/* Archetype & Core Emotional Mindset */}
                  <div className="bg-white/90 rounded-md border border-sky-100 p-2 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-[12.5px] font-bold text-stone-900 font-ui">
                        {chandraEmotional.coreEmotionalArchetype}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-stone-700 leading-snug">
                      {chandraEmotional.emotionalMindset}
                    </p>
                  </div>

                  {/* Emotional Strengths & Stress Triggers Mini Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                    <div className="space-y-1 bg-emerald-50/50 rounded-md border border-emerald-100 p-2">
                      <span className="font-bold text-emerald-900 uppercase tracking-wide text-[10.5px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Emotional Strengths</span>
                      </span>
                      <ul className="space-y-0.5 text-stone-700">
                        {chandraEmotional.emotionalStrengths.slice(0, 2).map((s, idx) => (
                          <li key={idx} className="flex items-start space-x-1">
                            <span className="text-emerald-600 leading-none">•</span>
                            <span className="leading-tight">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 bg-amber-50/50 rounded-md border border-amber-100 p-2">
                      <span className="font-bold text-amber-900 uppercase tracking-wide text-[10.5px] flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Emotional Triggers</span>
                      </span>
                      <ul className="space-y-0.5 text-stone-700">
                        {chandraEmotional.stressTriggers.slice(0, 2).map((t, idx) => (
                          <li key={idx} className="flex items-start space-x-1">
                            <span className="text-amber-600 leading-none">•</span>
                            <span className="leading-tight">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Vedic Remedy Snippet */}
                  <div className="text-[11.5px] text-stone-600 bg-stone-50/90 rounded-md border border-stone-200/80 px-2.5 py-1.5 flex items-start space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-800">Vedic Mind Remedy (Chandra Shanti):</strong>{' '}
                      <span>{chandraEmotional.vedicPsychologicalRemedy}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optional Real-time AI Deep Birth Reading */}
          <div className="bg-white rounded-lg border border-stone-200 px-2.5 py-2 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <h3 className="font-vedic font-bold text-stone-900 text-[14px]">
                  AI Synthesis
                </h3>
              </div>

              <button
                type="button"
                onClick={fetchAiBirthPrediction}
                disabled={isLoadingAi}
                className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[13px] font-semibold py-1 px-2.5 rounded transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Generate Reading</span>
                  </>
                )}
              </button>
            </div>

            {aiReading && (
              <div className="bg-[#FAF8F5] rounded border border-amber-300/80 px-2.5 py-2 text-stone-800 text-[14px] leading-snug space-y-1">
                {aiReading.split('\n').map((para, idx) =>
                  para.trim() ? <p key={idx}>{para}</p> : null
                )}
              </div>
            )}
          </div>

          {/* Planetary Aspects & Upcoming Ingress / Station Alerts System */}
          <PlanetaryAspectsAndAlerts planets={natalPlanets} activeProfile={currentProfile} />
        </div>
      )}

      {/* TAB: CHANDRA RASI (MOON SIGN) & SPECIFIC EMOTIONAL SIGNIFICANCE */}
      {activeBirthSectionTab === 'moon-sign' && (() => {
        const displayedSignNum = selectedExplorationMoonSign || natalMoonRasi;
        const currentChandraData = calculateChandraEmotionalSignificance(displayedSignNum);
        const isCurrentNative = displayedSignNum === natalMoonRasi;

        return (
          <div className="space-y-3">
            {/* Header & Moon Sign Switcher Bar */}
            <div className="bg-gradient-to-r from-sky-50/80 via-white to-amber-50/50 rounded-xl border border-sky-200/90 p-3 sm:p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 shadow-3xs">
                    <Moon className="w-6 h-6 fill-sky-500 text-sky-700" />
                  </div>
                  <div>
                    <h3 className="font-vedic font-bold text-stone-900 text-base sm:text-lg flex items-center space-x-2">
                      <span>Chandra Rasi (Moon Sign) &amp; Emotional Significance</span>
                    </h3>
                    <p className="text-[12px] text-stone-600">
                      Vedic Psychological Blueprint • Manas (Mind), Chitta (Subconscious), &amp; Emotional Equilibrium
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedExplorationMoonSign && selectedExplorationMoonSign !== natalMoonRasi && (
                    <button
                      type="button"
                      onClick={() => setSelectedExplorationMoonSign(null)}
                      className="text-[11px] font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      ← Back to Natal Moon ({VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName})
                    </button>
                  )}
                  <div className="text-[12px] font-bold text-sky-900 bg-sky-100/80 px-2.5 py-1 rounded-md border border-sky-200">
                    Active Profile: {name}
                  </div>
                </div>
              </div>

              {/* 12 Zodiac Moon Signs Quick Navigation Pills */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
                  <span>Explore Chandra Rasi Emotional Archetypes:</span>
                  <span className="text-amber-800 font-semibold">★ indicates your natal Moon sign</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                  {VEDIC_RASIS.map((rasi) => {
                    const isSelected = displayedSignNum === rasi.number;
                    const isNatal = rasi.number === natalMoonRasi;

                    return (
                      <button
                        key={rasi.number}
                        type="button"
                        onClick={() => setSelectedExplorationMoonSign(rasi.number)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-ui transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 border ${
                          isSelected
                            ? 'bg-sky-600 border-sky-700 text-white font-bold shadow-2xs scale-102'
                            : isNatal
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold hover:bg-amber-100'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-sky-300 hover:bg-sky-50/40'
                        }`}
                      >
                        <span>{rasi.sanskritName}</span>
                        <span className={`text-[9.5px] ${isSelected ? 'text-sky-100' : 'text-stone-400'}`}>
                          ({rasi.englishName.slice(0, 3)})
                        </span>
                        {isNatal && (
                          <span className={`text-[10px] font-black ${isSelected ? 'text-amber-300' : 'text-amber-600'}`}>
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Moon Sign Hero Banner */}
            <div className="bg-white rounded-xl border border-stone-200/90 p-4 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-amber-100 border border-sky-300 flex items-center justify-center text-sky-800 text-2xl font-bold shadow-3xs">
                    {currentChandraData.symbol.split(' ')[0]}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-vedic font-bold text-stone-950 text-xl leading-tight">
                        {currentChandraData.sanskritName} Rasi ({currentChandraData.englishName})
                      </h2>
                      {isCurrentNative ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ★ Your Natal Moon Sign
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          Comparative Exploration
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        currentChandraData.dignity.includes('Exalted') || currentChandraData.dignity.includes('Own')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : currentChandraData.dignity.includes('Debilitated')
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {currentChandraData.dignity}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[12px] text-stone-600">
                      <span><strong>Element:</strong> {currentChandraData.element}</span>
                      <span>•</span>
                      <span><strong>Ruling Graha:</strong> {currentChandraData.rulingPlanet}</span>
                      {isCurrentNative && (
                        <>
                          <span>•</span>
                          <span><strong>Moon Longitude:</strong> {natalMoonDeg.toFixed(2)}°</span>
                          <span>•</span>
                          <span><strong>Nakshatra:</strong> {natalNakshatra} (Pada {natalMoonPada})</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-2.5 max-w-sm shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 block">
                    Core Emotional Archetype
                  </span>
                  <span className="text-[13px] font-vedic font-bold text-stone-900 leading-snug block mt-0.5">
                    {currentChandraData.coreEmotionalArchetype}
                  </span>
                </div>
              </div>

              {/* Emotional Mindset Narrative */}
              <div className="bg-[#FAF8F5] rounded-xl border border-amber-200/80 p-3.5 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <h4 className="font-ui font-bold text-stone-950 text-sm">
                    The Vedic Emotional Mindset (Manas &amp; Emotional Perception)
                  </h4>
                </div>
                <p className="text-[13.5px] text-stone-700 leading-relaxed">
                  {currentChandraData.emotionalMindset}
                </p>
              </div>

              {/* Deep Psychological Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Pillar 1: Inner Psychological Needs */}
                <div className="bg-white rounded-xl border border-stone-200 p-3.5 space-y-1.5 shadow-3xs">
                  <div className="flex items-center space-x-2 border-b border-stone-100 pb-1.5">
                    <Compass className="w-4 h-4 text-sky-600" />
                    <h4 className="font-ui font-bold text-stone-900 text-sm">
                      Inner Psychological Needs
                    </h4>
                  </div>
                  <p className="text-[13px] text-stone-700 leading-snug">
                    {currentChandraData.innerNeeds}
                  </p>
                </div>

                {/* Pillar 2: Instinctive Stress Reactions */}
                <div className="bg-white rounded-xl border border-stone-200 p-3.5 space-y-1.5 shadow-3xs">
                  <div className="flex items-center space-x-2 border-b border-stone-100 pb-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-ui font-bold text-stone-900 text-sm">
                      Instinctive Reactions Under Pressure
                    </h4>
                  </div>
                  <p className="text-[13px] text-stone-700 leading-snug">
                    {currentChandraData.instinctiveReactions}
                  </p>
                </div>

                {/* Pillar 3: Emotional Strengths & Virtues */}
                <div className="bg-emerald-50/40 rounded-xl border border-emerald-200/80 p-3.5 space-y-2 shadow-3xs">
                  <div className="flex items-center space-x-2 border-b border-emerald-200/60 pb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-ui font-bold text-emerald-950 text-sm">
                      Emotional Strengths &amp; Gifts
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-[12.5px] text-stone-800">
                    {currentChandraData.emotionalStrengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pillar 4: Stress Triggers & Pressure Points */}
                <div className="bg-amber-50/40 rounded-xl border border-amber-200/80 p-3.5 space-y-2 shadow-3xs">
                  <div className="flex items-center space-x-2 border-b border-amber-200/60 pb-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <h4 className="font-ui font-bold text-amber-950 text-sm">
                      Stress Triggers &amp; Pressure Points
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-[12.5px] text-stone-800">
                    {currentChandraData.stressTriggers.map((trigger, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pillar 5: Shadow Patterns & Growth Edges */}
                <div className="bg-rose-50/30 rounded-xl border border-rose-200/80 p-3.5 space-y-2 shadow-3xs">
                  <div className="flex items-center space-x-2 border-b border-rose-200/60 pb-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <h4 className="font-ui font-bold text-rose-950 text-sm">
                      Shadow Patterns &amp; Psychological Pitfalls
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-[12.5px] text-stone-800">
                    {currentChandraData.shadowPatterns.map((shadow, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{shadow}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pillar 6: Intimacy & Relationship Attachment */}
                <div className="bg-sky-50/40 rounded-xl border border-sky-200/80 p-3.5 space-y-2 shadow-3xs">
                  <div className="flex items-center space-x-2 border-b border-sky-200/60 pb-1.5">
                    <Heart className="w-4 h-4 text-sky-600" />
                    <h4 className="font-ui font-bold text-sky-950 text-sm">
                      Intimacy &amp; Attachment Style
                    </h4>
                  </div>
                  <p className="text-[13px] text-stone-700 leading-relaxed">
                    {currentChandraData.intimacyAndAttachment}
                  </p>
                </div>
              </div>

              {/* Vedic Remedy & Harmonization Banner (Chandra Shanti) */}
              <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vedic Psychological Remedy (Chandra Shanti &amp; Mind Harmonization)</span>
                </div>
                <p className="text-[13px] text-stone-200 leading-relaxed">
                  {currentChandraData.vedicPsychologicalRemedy}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-amber-200/80 border-t border-white/10">
                  <span>Day: Monday (Somavara)</span>
                  <span>•</span>
                  <span>Metal: Pure Silver</span>
                  <span>•</span>
                  <span>Gem: Natural Pearl (Moti) or Moonstone</span>
                  <span>•</span>
                  <span>Mantra: Om Som Somaya Namaha</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 2: ASPECT DIPS & RISES (HEALTH, EDUCATION, WEALTH, CAREER, RELATIONSHIPS, MENTAL PEACE) */}
      {activeBirthSectionTab === 'aspects' && (
        <AspectStrengthTrajectoryGraph
          natalPlanets={natalPlanets}
          natalHouses={natalHouses}
          lagnaRasi={natalLagnaRasi}
          userName={name}
          currentTransitPlanets={natalPlanets}
        />
      )}

      {/* TAB: 360° GRAPHICAL CELESTIAL WHEEL & PLANET SKY MAP */}
      {activeBirthSectionTab === 'celestial-wheel' && (
        <div className="w-full flex justify-center py-1">
          <CelestialSkyMapWheel
            livePlanets={natalPlanets}
            natalPlanets={natalPlanets}
            lagnaRasi={natalLagnaRasi}
            seekerName=""
            locationName={selectedCity.name}
          />
        </div>
      )}

      {/* TAB: SHADBALA (SIX-FOLD PLANETARY STRENGTH) & ALL 9 PLANETS */}
      {(activeBirthSectionTab === 'shadbala' || activeBirthSectionTab === 'coordinates') && (
        <div className="space-y-2">
          {/* Sub-tab switcher inside Shadbala: Chart, Table, and Direct 9 Planet Tabs */}
          <div className="flex flex-col gap-1.5 bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 shadow-3xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span className="font-ui font-bold text-stone-950 text-[12.5px] tracking-tight">
                  Shadbala &amp; 9 Grahas (Six-Fold Planetary Strengths)
                </span>
              </div>

              {/* View options: 6-Fold Chart vs All 9 Planets Table */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShadbalaSubTab('chart')}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1 border ${
                    shadbalaSubTab === 'chart'
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-2xs font-bold'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-800" />
                  <span>Shadbala 6-Fold Chart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShadbalaSubTab('planets')}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1 border ${
                    shadbalaSubTab === 'planets'
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-2xs font-bold'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <BookOpen className="w-3 h-3 text-amber-800" />
                  <span>All 9 Planets Table</span>
                </button>
              </div>
            </div>

            {/* Direct 9 Planet Sub-Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 border-t border-amber-200/60 scrollbar-none">
              <span className="text-[10px] font-bold text-amber-900 uppercase shrink-0 mr-1">
                All 9 Planets:
              </span>
              {natalPlanets.filter((p) => p.name !== 'Lagna').map((planet) => {
                const isPlanetActive = shadbalaSubTab === planet.name;
                return (
                  <button
                    key={planet.name}
                    type="button"
                    onClick={() => setShadbalaSubTab(planet.name)}
                    className={`rounded px-2 py-0.5 text-[10.5px] font-ui font-semibold transition-all cursor-pointer flex items-center space-x-1 whitespace-nowrap shrink-0 border ${
                      isPlanetActive
                        ? 'bg-amber-600 border-amber-700 text-white font-bold shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/60'
                    }`}
                  >
                    <span>{planet.symbol}</span>
                    <span>{planet.name}</span>
                    <span className="text-[9.5px] opacity-80">({planet.rasiName.slice(0, 3)})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtab 1: Shadbala D3 Chart */}
          {(shadbalaSubTab === 'chart' || !['chart', 'planets'].includes(shadbalaSubTab)) && natalPlanets.length > 0 && (
            <div className="space-y-2">
              <ShadbalaD3Chart
                planets={natalPlanets}
                birthTime={birthTime}
                selectedPlanet={
                  natalPlanets.some((p) => p.name === shadbalaSubTab)
                    ? (shadbalaSubTab as any)
                    : undefined
                }
                onSelectPlanet={(p) => setShadbalaSubTab(p)}
              />
            </div>
          )}

          {/* Subtab 2: All 9 Planets Natal Planetary Coordinates Table */}
          {shadbalaSubTab === 'planets' && (
            <div className="bg-white rounded-lg border border-stone-200 px-2.5 py-2 shadow-2xs space-y-1">
              <div className="flex items-center justify-between mb-1 border-b border-stone-100 pb-1">
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <h3 className="text-[14px] font-vedic font-bold text-stone-900">
                    All 9 Planets Coordinates &amp; Placements (Sidereal Lahiri)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-amber-800">
                  Lagna: {VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName} • Moon: {VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}
                </span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-900 text-[11px] font-bold">
                      <th className="py-1 px-2 uppercase tracking-wider">Graha</th>
                      <th className="py-1 px-2 uppercase tracking-wider">Rasi</th>
                      <th className="py-1 px-2 uppercase tracking-wider">Deg</th>
                      <th className="py-1 px-2 uppercase tracking-wider">Nakshatra</th>
                      <th className="py-1 px-2 uppercase tracking-wider">Star Lord</th>
                      <th className="py-1 px-2 uppercase tracking-wider">KP Sub-Lord</th>
                      <th className="py-1 px-2 uppercase tracking-wider">House</th>
                      <th className="py-1 px-2 uppercase tracking-wider">Dignity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {natalPlanets.map((planet) => (
                      <tr key={planet.name} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-1 px-2 font-semibold text-stone-950">
                          {planet.symbol} {planet.name} ({planet.englishName})
                        </td>
                        <td className="py-1 px-2 text-stone-900">
                          {planet.rasiName}
                        </td>
                        <td className="py-1 px-2 text-stone-950 font-mono">
                          {planet.degree}° {planet.minute}&apos;
                        </td>
                        <td className="py-1 px-2 text-stone-900">
                          {planet.nakshatra} (Pada {planet.pada})
                        </td>
                        <td className="py-1 px-2 text-stone-700">
                          {planet.nakshatraLord || '—'}
                        </td>
                        <td className="py-1 px-2 font-semibold text-amber-900 bg-amber-50/50 rounded">
                          {planet.subLord || '—'}
                        </td>
                        <td className="py-1 px-2">
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 font-semibold text-stone-950">
                            H{planet.house}
                          </span>
                        </td>
                        <td className="py-1 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            planet.dignity === 'Exalted' || planet.dignity === 'Moolatrikona' || planet.dignity === 'Own'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : planet.dignity === 'Debilitated' || planet.dignity === 'Enemy'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-stone-50 text-stone-700 border border-stone-200'
                          }`}>
                            {planet.dignity || 'Neutral'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUMMARY OF ALL 12 HOUSES (DVADASA BHAVA DECK OF CARDS) */}
      {activeBirthSectionTab === 'houses-summary' && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-stone-200 p-2.5 shadow-2xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              <h3 className="font-vedic font-bold text-stone-950 text-[15px] tracking-tight">
                Dvadasa Bhava Deck of Cards (Summary of 12 Houses)
              </h3>
            </div>
            <span className="text-[12px] text-stone-600 font-medium">
              Swipe or scroll through the card deck • Click any card to open its detailed dossier
            </span>
          </div>

          {/* DECK OF CARDS HORIZONTAL SLIDER / STACK */}
          <div className="flex overflow-x-auto space-x-3 py-3 px-1 snap-x scrollbar-thin scrollbar-thumb-amber-300">
            {housePredictions.map((hp) => {
              const isSelected = hp.houseNumber === selectedHouseNumber;
              const rasiObj = VEDIC_RASIS.find((r) => r.sanskritName === hp.signName);
              return (
                <div
                  key={hp.houseNumber}
                  onClick={() => {
                    handleSelectHouseNumber(hp.houseNumber);
                    setActiveBirthSectionTab('bhava-deck');
                  }}
                  className={`snap-start w-72 sm:w-80 shrink-0 rounded-xl border p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'bg-amber-50/95 border-amber-500 ring-2 ring-amber-400 text-amber-950 scale-102'
                      : 'bg-gradient-to-b from-white to-[#FAF8F5] border-stone-200/90 text-stone-800 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 border-b border-stone-200/70 pb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[12px] font-vedic font-bold shadow-2xs ${
                            isSelected
                              ? 'bg-amber-700 text-white'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          H{hp.houseNumber}
                        </span>
                        <span className="font-vedic font-bold text-stone-950 text-[14px] truncate">
                          {hp.vedicName.replace(/\s*\(\d+\w+\s+House\)/i, '')}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded shrink-0">
                        {hp.lifeDomain}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px] bg-stone-50/80 px-2 py-1 rounded border border-stone-100">
                      <span className="text-stone-700 font-semibold">
                        Rashi: <strong className="text-stone-950">{hp.signName}</strong>
                        {rasiObj ? ` (${rasiObj.westernEquivalent})` : ''}
                      </span>
                      <span className="text-stone-600">
                        Lord: <strong className="text-stone-900">{hp.signLord}</strong>
                      </span>
                    </div>

                    <div className="text-[12px]">
                      {hp.planetsHere.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-[11px]">
                          Grahas: {hp.planetsHere.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500 italic">
                          Unoccupied • Governed by {hp.signLord}
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-stone-700 leading-snug line-clamp-4 font-serif italic">
                      &quot;{hp.prediction}&quot;
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-bold text-amber-800">
                    <span>Bhava Deck Dossier →</span>
                    <span>Bhrigu &amp; Lal Kitab</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BHAVA DECK (ALL 12 HOUSES AS DECK OF CARDS & SELECTED HOUSE DOSSIER) */}
      {activeBirthSectionTab === 'bhava-deck' && (
        <HouseCardDeck
          houses={natalHouses}
          housePredictions={housePredictions}
          natalPlanets={natalPlanets}
          selectedHouseNumber={selectedHouseNumber}
          onSelectHouseNumber={handleSelectHouseNumber}
        />
      )}
    </div>
  );
}
