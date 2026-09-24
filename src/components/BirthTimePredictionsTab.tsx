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
} from 'lucide-react';
import { NorthIndianChart } from './NorthIndianChart';
import { ProfileSelector } from './ProfileSelector';
import { PlaceValue } from './PlaceOfBirthInput';
import { HouseCardDeck } from './HouseCardDeck';
import {
  calculatePlanetaryPositions,
  buildHouseStructure,
  calculateBirthTimeHousePredictions,
  calculateNatalYogas,
  calculateVimshottariDasha,
} from '../vedicMath';
import {
  HouseInfo,
  PlanetPosition,
  UserProfile,
  BirthTimeHousePrediction,
  NatalYoga,
  VimshottariDashaInfo,
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
  const [houseDomainFilter, setHouseDomainFilter] = useState<string>('ALL');

  // AI Birth Reading state
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Calculated astrological state
  const [natalPlanets, setNatalPlanets] = useState<PlanetPosition[]>([]);
  const [natalHouses, setNatalHouses] = useState<HouseInfo[]>([]);
  const [natalLagnaRasi, setNatalLagnaRasi] = useState<number>(5);
  const [natalMoonRasi, setNatalMoonRasi] = useState<number>(5);
  const [natalNakshatra, setNatalNakshatra] = useState<string>('Magha');

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
    const dasha = calculateVimshottariDasha(moonTotalDeg, targetDate);

    setNatalPlanets(natalCalc.planets);
    setNatalHouses(nHouses);
    setNatalLagnaRasi(natalCalc.lagnaRasi);
    setNatalMoonRasi(natalMoon.rasiNumber);
    setNatalNakshatra(natalMoon.nakshatra);
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
    <div className="max-w-5xl sm:max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Saved Profiles Selector */}
      <ProfileSelector
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Core Natal Vitals Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Lagna */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
            Lagna (Ascendant)
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900">
              {VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName}
            </span>
            <span className="text-xs text-stone-500">
              ({VEDIC_RASIS[natalLagnaRasi - 1]?.englishName})
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 truncate">
            Lord: <strong className="text-stone-800">{VEDIC_RASIS[natalLagnaRasi - 1]?.lord}</strong>
          </p>
        </div>

        {/* Janma Rasi (Moon) */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Janma Rasi (Moon Sign)
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900">
              {VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}
            </span>
            <span className="text-xs text-stone-500">
              ({VEDIC_RASIS[natalMoonRasi - 1]?.englishName})
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 truncate">
            Lord: <strong className="text-stone-800">{VEDIC_RASIS[natalMoonRasi - 1]?.lord}</strong>
          </p>
        </div>

        {/* Janma Nakshatra */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Janma Nakshatra
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900 truncate">
              {natalNakshatra}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 truncate">
            Dasha at Birth: <strong className="text-stone-800">{vimshottariDasha?.birthLord}</strong>
          </p>
        </div>

        {/* Current Active Mahadasha */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
            Current Mahadasha
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-lg sm:text-xl font-vedic font-bold text-purple-900 truncate">
              {vimshottariDasha?.currentLord || 'Guru'} Dasha
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 truncate">
            Vimshottari Lifetime Ruler
          </p>
        </div>
      </div>

      {/* North Indian Diamond Chart (Birth D1) & Kundali Focus Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: D1 Birth Chart */}
        <div className="lg:col-span-5 flex justify-center">
          <NorthIndianChart
            houses={natalHouses}
            title="Janam Kundali (D1 Birth Chart)"
            subtitle="North Indian Diamond • Lahiri Sidereal"
            showTransitsTogether={false}
            onSelectHouse={handleSelectHouse}
            selectedHouseNumber={selectedHouseNumber}
          />
        </div>

        {/* Right Column: Chart Focus & Key Yogas Formed at Birth */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Active House Selection Quick Bar */}
          <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 rounded-xl border border-amber-300/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-white font-vedic font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                H{selectedHouseNumber}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                  Active House Highlighted on Kundali
                </span>
                <span className="font-vedic font-bold text-stone-900 text-sm sm:text-base">
                  {selectedHouse?.vedicName || `House ${selectedHouseNumber}`} ({selectedHouse?.rasiName}, Lord: {selectedHouse?.signLord})
                </span>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 shadow-2xs hidden sm:inline-block">
              Click any house on chart or deck below
            </span>
          </div>

          {/* Natal Yogas Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-700" />
                <h4 className="font-vedic font-bold text-stone-900 text-sm sm:text-base">
                  Key Yogas Formed at Birth
                </h4>
              </div>
              <span className="text-xs font-medium text-stone-500">
                {natalYogas.length} Auspicious Combinations
              </span>
            </div>

            <div className="space-y-2">
              {natalYogas.map((yoga) => (
                <div key={yoga.name} className="p-3 rounded-lg bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-sm sm:text-base">{yoga.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                      {yoga.auspiciousness}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {yoga.effect}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ALL 12 HOUSES AS DECK OF CARDS & SELECTED HOUSE DETAILS ONLY */}
      <HouseCardDeck
        houses={natalHouses}
        housePredictions={housePredictions}
        natalPlanets={natalPlanets}
        selectedHouseNumber={selectedHouseNumber}
        onSelectHouseNumber={handleSelectHouseNumber}
      />

      {/* Optional Real-time AI Deep Birth Reading */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-vedic font-bold text-stone-900 text-base sm:text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>AI Birth Time Kundali Synthesis</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Generate full Parashari analysis for your birth chart, Lagna lord, and planetary dispositions
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAiBirthPrediction}
            disabled={isLoadingAi}
            className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Synthesizing Birth Chart...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Birth Reading</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-[11px] text-rose-700 animate-in fade-in slide-in-from-top-1">
            {aiError}
          </div>
        )}

        {aiReading && (
          <div className="bg-[#FAF8F5] rounded-xl border border-amber-300/80 p-4 text-stone-800 text-xs sm:text-sm sm:leading-relaxed space-y-2.5">
            {aiReading.split('\n').map((para, idx) =>
              para.trim() ? <p key={idx}>{para}</p> : null
            )}
          </div>
        )}
      </div>

      {/* Planetary Coordinates Table (Sidereal Lahiri) */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 mb-1">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <h3 className="text-sm sm:text-base font-vedic font-bold text-stone-900">
            Natal Planetary Coordinates (Exact Degrees at Birth Time)
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-700 text-xs font-semibold">
                <th className="py-2.5 px-3">Graha (Planet)</th>
                <th className="py-2.5 px-3">Rasi (Sign)</th>
                <th className="py-2.5 px-3">Exact Degrees</th>
                <th className="py-2.5 px-3">Nakshatra (Pada)</th>
                <th className="py-2.5 px-3">House</th>
                <th className="py-2.5 px-3">Motion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {natalPlanets.map((planet) => (
                <tr key={planet.name} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-stone-900 flex items-center space-x-2">
                    <span className="w-6 text-center font-bold text-amber-800">{planet.symbol}</span>
                    <span>{planet.englishName} ({planet.name})</span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-700">
                    {planet.rasiName} (#{planet.rasiNumber})
                  </td>
                  <td className="py-2.5 px-3 text-stone-800 font-mono text-xs sm:text-sm">
                    {planet.degree}° {planet.minute}'
                  </td>
                  <td className="py-2.5 px-3 text-stone-700">
                    {planet.nakshatra} (Pada {planet.pada})
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-800 text-xs">
                      H{planet.house}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {planet.isRetrograde ? (
                      <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs font-semibold">
                        Vakri (®)
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs font-medium">
                        Marga (Dir)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
