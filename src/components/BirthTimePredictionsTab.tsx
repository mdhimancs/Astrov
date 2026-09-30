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
    <div className="w-full space-y-2">
      {/* Saved Profiles Selector */}
      <ProfileSelector
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Core Natal Vitals Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { label: 'Ascendant', val: VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName, lord: VEDIC_RASIS[natalLagnaRasi - 1]?.lord, color: 'amber' },
          { label: 'Moon Sign', val: VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName, lord: VEDIC_RASIS[natalMoonRasi - 1]?.lord, color: 'sky' },
          { label: 'Nakshatra', val: natalNakshatra, lord: `Dasha: ${vimshottariDasha?.birthLord}`, color: 'emerald' },
          { label: 'Current Dasha', val: `${vimshottariDasha?.currentLord} Dasha`, lord: 'Active Phase', color: 'purple' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2.5 py-1.5 shadow-3xs">
            <span className={`text-[11px] font-black text-${item.color}-800 uppercase tracking-wider block`}>
              {item.label}
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-[14px] font-vedic font-bold text-stone-900 leading-snug">
                {item.val}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* North Indian Diamond Chart & Kundali Focus Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        {/* Left Column: D1 Birth Chart */}
        <div className="lg:col-span-5 flex justify-center">
          <NorthIndianChart
            houses={natalHouses}
            title="Janam Kundali"
            subtitle="Sidereal D1"
            showTransitsTogether={false}
            onSelectHouse={handleSelectHouse}
            selectedHouseNumber={selectedHouseNumber}
          />
        </div>

        {/* Right Column: Chart Focus & Key Yogas Formed at Birth */}
        <div className="lg:col-span-7 space-y-2">
          {/* Active House Selection Quick Bar */}
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

      {/* Planetary Coordinates Table (Sidereal Lahiri) */}
      <div className="bg-white rounded-lg border border-stone-200 px-2.5 py-2 shadow-2xs space-y-1">
        <div className="flex items-center space-x-1.5 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <h3 className="text-[14px] font-vedic font-bold text-stone-900">
            Natal Planetary Coordinates
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-900 text-[12px] font-bold">
                <th className="py-1 px-2 uppercase tracking-wider">Graha</th>
                <th className="py-1 px-2 uppercase tracking-wider">Rasi</th>
                <th className="py-1 px-2 uppercase tracking-wider">Deg</th>
                <th className="py-1 px-2 uppercase tracking-wider">Nakshatra</th>
                <th className="py-1 px-2 uppercase tracking-wider">H</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {natalPlanets.map((planet) => (
                <tr key={planet.name} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-1 px-2 font-semibold text-stone-950">
                    {planet.symbol} {planet.name}
                  </td>
                  <td className="py-1 px-2 text-stone-900">
                    {planet.rasiName}
                  </td>
                  <td className="py-1 px-2 text-stone-950 font-mono">
                    {planet.degree}° {planet.minute}'
                  </td>
                  <td className="py-1 px-2 text-stone-900">
                    {planet.nakshatra}
                  </td>
                  <td className="py-1 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 font-semibold text-stone-950">
                      H{planet.house}
                    </span>
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
