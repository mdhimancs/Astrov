import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Compass,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Orbit,
  BookOpen,
} from 'lucide-react';
import { NorthIndianChart } from './NorthIndianChart';
import { ProfileSelector } from './ProfileSelector';
import { MonthWisePredictions } from './MonthWisePredictions';
import { UnifiedPlanetaryImpactTable } from './UnifiedPlanetaryImpactTable';
import {
  calculatePlanetaryPositions,
  buildHouseStructure,
  checkSadeSati,
  generateVedicPredictions,
  calculateDetailedPlanetaryMovements,
  generateMonthWiseTransitPredictions,
  generateCategorizedDosAndDonts,
  calculateUnifiedPlanetaryTable,
} from '../vedicMath';
import {
  HouseInfo,
  PlanetPosition,
  UserProfile,
  MonthWiseTransitPrediction,
  PlanetaryMovementDetail,
  TransitDosAndDonts,
  PlanetaryImpactRecord,
} from '../types';
import { POPULAR_CITIES, VEDIC_RASIS } from '../data';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';
import {
  getSavedProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/profileStorage';

export function VedicKundaliTab() {
  // Profiles Management State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getSavedProfiles());
  const [activeProfileId, setActiveProfId] = useState<string>(() => getActiveProfileId());

  // Current active profile
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
      name: 'Amritsar, Punjab, India',
      lat: 31.6340,
      lng: 74.8723,
      tz: 5.5,
    };
  });

  // View modes for the North Indian Chart: 'natal' | 'transit' | 'dual'
  const [chartViewMode, setChartViewMode] = useState<'natal' | 'transit' | 'dual'>('natal');
  const [selectedHouse, setSelectedHouse] = useState<HouseInfo | null>(null);

  // Selected Month Key for Month-wise Predictions dropdown
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-09');

  // AI Prediction state
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);

  // Calculated astrological state
  const [natalPlanets, setNatalPlanets] = useState<PlanetPosition[]>([]);
  const [natalHouses, setNatalHouses] = useState<HouseInfo[]>([]);
  const [natalLagnaRasi, setNatalLagnaRasi] = useState<number>(5); // Leo default
  const [natalMoonRasi, setNatalMoonRasi] = useState<number>(5);
  const [natalNakshatra, setNatalNakshatra] = useState<string>('Magha');

  // Real-time Current Planetary Movement (Gochar) state
  const [transitPlanets, setTransitPlanets] = useState<PlanetPosition[]>([]);
  const [transitHouses, setTransitHouses] = useState<HouseInfo[]>([]);
  const [detailedMovements, setDetailedMovements] = useState<PlanetaryMovementDetail[]>([]);
  const [monthlyPredictions, setMonthlyPredictions] = useState<MonthWiseTransitPrediction[]>([]);
  const [dosAndDonts, setDosAndDonts] = useState<TransitDosAndDonts[]>([]);
  const [unifiedImpactRecords, setUnifiedImpactRecords] = useState<PlanetaryImpactRecord[]>([]);

  const [sadeSati, setSadeSati] = useState<{
    inSadeSati: boolean;
    phase: string;
    description: string;
  }>({
    inSadeSati: false,
    phase: 'None',
    description: 'Saturn transit is supportive.',
  });

  // Re-calculate both Birth Chart and Current Real-Time Planetary Movement
  const computeKundaliAndTransits = useCallback((
    targetDate: string = birthDate,
    targetTime: string = birthTime,
    targetCity = selectedCity,
    targetMonth = selectedMonthKey
  ) => {
    // 1. Birth Chart Calculation
    const [year, month, day] = targetDate.split('-').map(Number);
    const [hour, minute] = targetTime.split(':').map(Number);
    const birthDateTime = new Date(year, month - 1, day, hour, minute);

    const natalCalc = calculatePlanetaryPositions(
      birthDateTime,
      targetCity.lat,
      targetCity.lng
    );

    // 2. Real-time Current Transit Calculation (Current moment)
    const now = new Date();
    const transitCalc = calculatePlanetaryPositions(
      now,
      targetCity.lat,
      targetCity.lng
    );

    const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
    const transitSaturn = transitCalc.planets.find((p) => p.name === 'Shani') || transitCalc.planets[7];

    const sadeSatiResult = checkSadeSati(natalMoon.rasiNumber, transitSaturn.rasiNumber);
    const nHouses = buildHouseStructure(natalCalc.lagnaRasi, natalCalc.planets, transitCalc.planets);
    const tHouses = buildHouseStructure(transitCalc.lagnaRasi, transitCalc.planets);

    const detailedMovs = calculateDetailedPlanetaryMovements(natalCalc.lagnaRasi, natalMoon.rasiNumber, transitCalc.planets);
    const mPredictions = generateMonthWiseTransitPredictions(natalMoon.rasiNumber, natalCalc.lagnaRasi, sadeSatiResult.inSadeSati);
    const dAndDonts = generateCategorizedDosAndDonts(transitCalc.planets, sadeSatiResult.inSadeSati);
    const uRecords = calculateUnifiedPlanetaryTable(natalCalc.lagnaRasi, natalMoon.rasiNumber, transitCalc.planets, targetMonth);

    setNatalPlanets(natalCalc.planets);
    setNatalHouses(nHouses);
    setNatalLagnaRasi(natalCalc.lagnaRasi);
    setNatalMoonRasi(natalMoon.rasiNumber);
    setNatalNakshatra(natalMoon.nakshatra);

    setTransitPlanets(transitCalc.planets);
    setTransitHouses(tHouses);
    setDetailedMovements(detailedMovs);
    setMonthlyPredictions(mPredictions);
    setDosAndDonts(dAndDonts);
    setUnifiedImpactRecords(uRecords);
    setSadeSati(sadeSatiResult);

    // Set first house as selected by default if none selected
    setSelectedHouse((prev) => prev ? nHouses.find((h) => h.houseNumber === prev.houseNumber) || nHouses[0] : nHouses[0]);
  }, [birthDate, birthTime, selectedCity, selectedMonthKey]);

  // Handle switching to another profile (Profile 1, Profile 2, etc.)
  const handleSelectProfile = (profile: UserProfile) => {
    setActiveProfId(profile.id);
    setActiveProfileId(profile.id);
    setName(profile.name);
    setBirthDate(profile.birthDate);
    setBirthTime(profile.birthTime);

    const matchedCity =
      POPULAR_CITIES.find((c) => c.name === profile.place) || {
        name: profile.place,
        lat: profile.latitude,
        lng: profile.longitude,
        tz: profile.timezone,
      };
    setSelectedCity(matchedCity);

    // Immediately re-compute with this profile's exact details
    computeKundaliAndTransits(profile.birthDate, profile.birthTime, matchedCity, selectedMonthKey);
    setAiReading(null);
  };

  // Handle saving/updating a profile
  const handleSaveProfile = (profileToSave: UserProfile) => {
    const updated = upsertProfile(profileToSave);
    setProfiles(updated);
    if (profileToSave.id === activeProfileId) {
      handleSelectProfile(profileToSave);
    }
  };

  // Handle deleting a profile
  const handleDeleteProfile = (id: string) => {
    const updated = deleteProfile(id);
    setProfiles(updated);
    if (activeProfileId === id && updated.length > 0) {
      handleSelectProfile(updated[0]);
    }
  };

  useEffect(() => {
    computeKundaliAndTransits();
  }, [computeKundaliAndTransits]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    computeKundaliAndTransits();
    // Auto-update active profile so user changes are saved
    const active = profiles.find((p) => p.id === activeProfileId);
    if (active) {
      handleSaveProfile({
        ...active,
        name,
        birthDate,
        birthTime,
        place: selectedCity.name,
        latitude: selectedCity.lat,
        longitude: selectedCity.lng,
        timezone: selectedCity.tz,
      });
    }
    setAiReading(null);
  };

  const handleMonthChange = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
    const uRecords = calculateUnifiedPlanetaryTable(natalLagnaRasi, natalMoonRasi, transitPlanets, monthKey);
    setUnifiedImpactRecords(uRecords);
  };

  // Request real-time Vedic AI prediction from server
  const fetchRealTimeAiPrediction = async () => {
    setIsLoadingAi(true);
    try {
      const natalLagnaName = VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName || 'Mesha';
      const natalMoonName = VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName || 'Mesha';

      const transitSummary = transitPlanets.map((p) => ({
        planet: p.name,
        transitingRasi: p.rasiName,
        transitingHouse: p.house,
        degree: `${p.degree}°${p.minute}'`,
        isRetrograde: p.isRetrograde,
      }));

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
          sadeSatiStatus: sadeSati,
          transitSummary,
          selectedMonth: selectedMonthKey,
        }),
      });

      const data = await res.json();
      setAiReading(data.reading || 'Vedic reading synthesized successfully.');
    } catch (err) {
      console.error(err);
      setAiReading(
        `Transit Synthesis for ${name}: Current transits of Jupiter, Saturn, Rahu, and Ketu relative to your natal Moon in ${VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName} and Lagna in ${VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName} demand methodical discipline in professional projects and offer auspicious opportunities in personal learning.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="max-w-5xl sm:max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Horizontally Compact Profile Selector Header */}
      <ProfileSelector
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Horizontally Compact Birth Details Form */}
      <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Seeker Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white text-xs transition-all"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Birth Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-xs transition-all"
                  required
                />
              </div>
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Birth Time (24h)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg pl-8 pr-3 py-1.5 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-xs transition-all"
                  required
                />
              </div>
            </div>

            {/* Place of Birth - Free Form Input */}
            <div>
              <PlaceOfBirthInput
                id="kundali-birth-place-compact"
                value={selectedCity.name}
                latitude={selectedCity.lat}
                longitude={selectedCity.lng}
                timezone={selectedCity.tz}
                onChange={(newPlace) => setSelectedCity(newPlace)}
                label="Place of Birth (Free Form)"
                placeholder="City, town or coordinates"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
            <div className="text-[11px] text-stone-500 truncate">
              Coordinates: <strong className="text-stone-800">{selectedCity.name}</strong> ({selectedCity.lat.toFixed(2)}°N, {selectedCity.lng.toFixed(2)}°E, UTC {selectedCity.tz >= 0 ? `+${selectedCity.tz}` : selectedCity.tz})
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-medium py-1.5 px-4 rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 text-xs cursor-pointer shrink-0"
            >
              <span>Recalculate Kundali</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Horizontally Compact Core Vedic Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Lagna */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Lagna (Ascendant)
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-vedic font-bold text-stone-900">
              {VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName}
            </span>
            <span className="text-[11px] text-stone-500">
              ({VEDIC_RASIS[natalLagnaRasi - 1]?.englishName})
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 truncate">
            Lord: {VEDIC_RASIS[natalLagnaRasi - 1]?.lord}
          </p>
        </div>

        {/* Janma Rasi */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
            Janma Rasi (Moon)
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-vedic font-bold text-stone-900">
              {VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}
            </span>
            <span className="text-[11px] text-stone-500">
              ({VEDIC_RASIS[natalMoonRasi - 1]?.englishName})
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 truncate">
            Lord: {VEDIC_RASIS[natalMoonRasi - 1]?.lord}
          </p>
        </div>

        {/* Janma Nakshatra */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Janma Nakshatra
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-lg font-vedic font-bold text-stone-900 truncate">
              {natalNakshatra}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">
            Birth Lunar Mansion (Pada 2)
          </p>
        </div>

        {/* Sade Sati Status */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Shani Sade Sati
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-base font-vedic font-bold text-stone-900 truncate">
              {sadeSati.phase}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 truncate">
            {sadeSati.inSadeSati ? 'Active Saturn Transit' : 'Free from Sade Sati'}
          </p>
        </div>
      </div>

      {/* Interactive North Indian Chart and Selected House Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: North Indian Chart Visualizer */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="bg-white p-1.5 rounded-xl border border-stone-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setChartViewMode('natal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'natal'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Birth (D1)
              </button>

              <button
                type="button"
                onClick={() => setChartViewMode('transit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'transit'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Transits (Gochar)
              </button>

              <button
                type="button"
                onClick={() => setChartViewMode('dual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'dual'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Dual Overlay
              </button>
            </div>

            <span className="text-[11px] text-stone-400 font-mono hidden sm:inline mr-1">
              Lahiri Sidereal
            </span>
          </div>

          <NorthIndianChart
            houses={chartViewMode === 'transit' ? transitHouses : natalHouses}
            title={
              chartViewMode === 'natal'
                ? `Janam Kundali — ${name}`
                : chartViewMode === 'transit'
                ? 'Current Planetary Movement (Gochar)'
                : `Dual Overlay (Birth + Transits) — ${name}`
            }
            subtitle={
              chartViewMode === 'natal'
                ? `Lagna: ${VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName} • Moon: ${VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName}`
                : chartViewMode === 'transit'
                ? 'Real-time planetary coordinates'
                : 'Birth grahas + [G] Transits'
            }
            showTransitsTogether={chartViewMode === 'dual'}
            onSelectHouse={(h) => setSelectedHouse(h)}
            selectedHouseNumber={selectedHouse?.houseNumber}
          />
        </div>

        {/* Right Column: Selected House Inspector & Sade Sati */}
        <div className="lg:col-span-5 space-y-3">
          {selectedHouse && (
            <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-vedic font-bold flex items-center justify-center text-xs">
                    H{selectedHouse.houseNumber}
                  </div>
                  <div>
                    <h3 className="font-vedic font-bold text-stone-900 text-sm">
                      {selectedHouse.vedicName}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Sign: <strong className="text-amber-800">{selectedHouse.rasiName}</strong> (#{selectedHouse.rasiNumber}) • Lord: {selectedHouse.signLord}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                  Karaka: {selectedHouse.karaka}
                </span>
              </div>

              <div className="text-[11px] text-stone-600 leading-snug bg-[#FAF8F5] p-2 rounded-lg border border-stone-200/60">
                <strong className="text-stone-800 block text-[10px] uppercase font-semibold">Significance:</strong>
                {selectedHouse.significance}
              </div>

              {/* Natal Planets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                  Natal Planets:
                </span>
                {selectedHouse.planets.length === 0 ? (
                  <p className="text-[11px] text-stone-400 italic">No birth planets posited here.</p>
                ) : (
                  <div className="space-y-1">
                    {selectedHouse.planets.map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between text-[11px] bg-stone-50 p-1.5 rounded-md border border-stone-200"
                      >
                        <span className="font-semibold text-stone-900">
                          {p.englishName} ({p.name}) {p.isRetrograde ? '®' : ''}
                        </span>
                        <span className="text-stone-500 text-[10px]">
                          {p.degree}°{p.minute}' • {p.nakshatra}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Transiting Planets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Current Transits (Gochar):
                </span>
                {(!selectedHouse.transitPlanets || selectedHouse.transitPlanets.length === 0) ? (
                  <p className="text-[11px] text-stone-400 italic">No transiting grahas here today.</p>
                ) : (
                  <div className="space-y-1">
                    {selectedHouse.transitPlanets.map((tp) => (
                      <div
                        key={`t-${tp.name}`}
                        className="flex items-center justify-between text-[11px] bg-amber-50/80 p-1.5 rounded-md border border-amber-200"
                      >
                        <span className="font-semibold text-amber-900">
                          [Transit] {tp.englishName}
                        </span>
                        <span className="text-amber-800 text-[10px]">
                          {tp.degree}°{tp.minute}' • {tp.nakshatra}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shani Sade Sati Card */}
          <div className="bg-[#FAF5EC] rounded-xl border border-[#E8DEC8] p-3 shadow-2xs space-y-1">
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="font-vedic font-bold text-stone-900 text-xs">
                Shani Sade Sati Assessment
              </h4>
            </div>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              {sadeSati.description}
            </p>
          </div>
        </div>
      </div>

      {/* MONTH-WISE TRANSIT PREDICTIONS (DROPDOWN MENU AT TOP) */}
      <MonthWisePredictions
        monthlyPredictions={monthlyPredictions}
        userName={name}
        selectedMonthKey={selectedMonthKey}
        onSelectMonthKey={handleMonthChange}
      />

      {/* THE SINGLE UNIFIED MASTER TABLE: PLANETARY CHANGES & IMPACTS */}
      <UnifiedPlanetaryImpactTable
        records={unifiedImpactRecords}
        title="Most Important Planetary Changes & Specific Effects"
        subtitle={`Effects of key planetary transits on Health, Job, Business, Relations, and Marriage for ${name}`}
      />

      {/* Optional Real-time AI Synthesis Button & Box */}
      <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Real-Time Vedic AI Synthesis</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Generate detailed Parashari synthesis integrating Lagna, Moon sign, and real-time transits
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRealTimeAiPrediction()}
            disabled={isLoadingAi}
            className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Deep Reading</span>
              </>
            )}
          </button>
        </div>

        {aiReading && (
          <div className="bg-[#FAF8F5] rounded-lg border border-amber-300/80 p-3 text-stone-800 text-xs leading-relaxed space-y-2">
            {aiReading.split('\n').map((para, idx) =>
              para.trim() ? <p key={idx}>{para}</p> : null
            )}
          </div>
        )}
      </div>

      {/* Planetary Coordinates Table (Sidereal Lahiri) */}
      <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center space-x-1.5 mb-2.5">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">
            Complete Planetary Coordinates (Sidereal Lahiri Positions)
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-600 text-[11px]">
                <th className="py-2 px-2.5 font-semibold">Graha (Planet)</th>
                <th className="py-2 px-2.5 font-semibold">Rasi (Sign)</th>
                <th className="py-2 px-2.5 font-semibold">Degrees</th>
                <th className="py-2 px-2.5 font-semibold">Nakshatra</th>
                <th className="py-2 px-2.5 font-semibold">House</th>
                <th className="py-2 px-2.5 font-semibold">Motion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {natalPlanets.map((planet) => (
                <tr key={planet.name} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2 px-2.5 font-semibold text-stone-900 flex items-center space-x-1.5">
                    <span className="w-5 text-center font-bold text-amber-800">{planet.symbol}</span>
                    <span>{planet.englishName} ({planet.name})</span>
                  </td>
                  <td className="py-2 px-2.5 text-stone-700">
                    {planet.rasiName} (#{planet.rasiNumber})
                  </td>
                  <td className="py-2 px-2.5 text-stone-800 font-mono">
                    {planet.degree}° {planet.minute}'
                  </td>
                  <td className="py-2 px-2.5 text-stone-700">
                    {planet.nakshatra} (P{planet.pada})
                  </td>
                  <td className="py-2 px-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 font-semibold text-stone-800 text-[11px]">
                      H{planet.house}
                    </span>
                  </td>
                  <td className="py-2 px-2.5">
                    {planet.isRetrograde ? (
                      <span className="text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        Vakri (®)
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
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
