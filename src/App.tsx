import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BirthTimePredictionsTab } from './components/BirthTimePredictionsTab';
import { MonthWisePredictionsTab } from './components/MonthWisePredictionsTab';
import { VimshottariDashaTab } from './components/VimshottariDashaTab';
import { CriticalDashaTransitsTab } from './components/CriticalDashaTransitsTab';
import { TransitsLiveTab } from './components/TransitsLiveTab';
import { SadeSatiTab } from './components/SadeSatiTab';
import { PanchangTab } from './components/PanchangTab';
import { KundaliMatchingTab } from './components/KundaliMatchingTab';
import { DivisionalChartsTab } from './components/DivisionalChartsTab';
import { UpayRemediesTab } from './components/UpayRemediesTab';
import { AstrologySystemsTab } from './components/AstrologySystemsTab';
import { AstronomicalEphemerisTab } from './components/AstronomicalEphemerisTab';
import { UserProfile } from './types';
import { getSavedProfiles, getActiveProfileId, setActiveProfileId as saveActiveId } from './utils/profileStorage';
import { calculatePlanetaryPositions, buildHouseStructure, calculateYogas, calculateAshtakavarga } from './vedicMath';

export default function App() {
  const [activeTab, setActiveTab] = useState('birth-predictions');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Global Profile State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getSavedProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => getActiveProfileId());

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Calculate Data for the current profile
  const birthDateTime = currentProfile ? new Date(`${currentProfile.birthDate}T${currentProfile.birthTime}:00`) : new Date();
  const natalCalc = calculatePlanetaryPositions(
    birthDateTime,
    currentProfile?.latitude || 28.61,
    currentProfile?.longitude || 77.20
  );
  const natalHouses = buildHouseStructure(natalCalc.lagnaRasi, natalCalc.planets);
  const yogas = calculateYogas(natalCalc.planets, natalCalc.lagnaRasi);
  const ashtakavarga = calculateAshtakavarga(natalCalc.planets);

  const handleProfileChange = (id: string) => {
    setActiveProfileId(id);
    saveActiveId(id);
  };

  const handleUpdateProfiles = (updated: UserProfile[]) => {
    setProfiles(updated);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' ' +
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-stone-900 flex flex-col relative overflow-x-hidden selection:bg-amber-200 selection:text-amber-950">
      {/* Subtle atmospheric depth layer */}
      <div className="fixed inset-0 bg-white/40 pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTransitTime={currentTimeStr}
        currentProfile={currentProfile}
        profiles={profiles}
        onProfileChange={handleProfileChange}
      />

      {/* Main Vedic Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-3 py-1.5">
        {(activeTab === 'birth-predictions' || activeTab === 'kundali') && (
          <BirthTimePredictionsTab
            profiles={profiles}
            activeProfileId={activeProfileId}
            onProfileChange={handleProfileChange}
            onUpdateProfiles={handleUpdateProfiles}
            onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
            onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
          />
        )}
        {activeTab === 'monthly-predictions' && (
          <MonthWisePredictionsTab
            activeProfileId={activeProfileId}
            profiles={profiles}
            onNavigateToBirthTime={() => setActiveTab('birth-predictions')}
          />
        )}
        {activeTab === 'vimshottari-dasha' && (
          <VimshottariDashaTab
            activeProfileId={activeProfileId}
            profiles={profiles}
            onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
            onNavigateToBirthTime={() => setActiveTab('birth-predictions')}
            onNavigateToMilestones={() => setActiveTab('critical-transits')}
          />
        )}
        {activeTab === 'upay-remedies' && (
          <UpayRemediesTab
            activeProfileId={activeProfileId}
            profiles={profiles}
            onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
            onNavigateToBirthCharts={() => setActiveTab('birth-predictions')}
          />
        )}
        {activeTab === 'critical-transits' && (
          <CriticalDashaTransitsTab
            activeProfileId={activeProfileId}
            profiles={profiles}
            onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
            onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
          />
        )}
        {activeTab === 'astrology-systems' && (
          <AstrologySystemsTab
            activeProfile={currentProfile}
            profiles={profiles}
            onProfileChange={handleProfileChange}
          />
        )}
        {activeTab === 'divisional-charts' && (
          <DivisionalChartsTab
            natalHouses={natalHouses}
            natalPlanets={natalCalc.planets}
            yogas={yogas}
            ashtakavarga={ashtakavarga}
            lagnaRasi={natalCalc.lagnaRasi}
            activeProfile={currentProfile}
          />
        )}
        {activeTab === 'transits' && (
          <TransitsLiveTab
            activeProfile={currentProfile}
            natalPlanets={natalCalc.planets}
            natalLagnaRasi={natalCalc.lagnaRasi}
          />
        )}
        {activeTab === 'astronomical-ephemeris' && (
          <AstronomicalEphemerisTab
            activeProfile={currentProfile}
            profiles={profiles}
            onProfileChange={handleProfileChange}
          />
        )}
        {activeTab === 'sadesati' && (
          <SadeSatiTab
            activeProfileId={activeProfileId}
            profiles={profiles}
          />
        )}
        {activeTab === 'panchang' && (
          <PanchangTab
            activeProfile={currentProfile}
            natalPlanets={natalCalc.planets}
            natalLagnaRasi={natalCalc.lagnaRasi}
          />
        )}
        {activeTab === 'compatibility' && (
          <KundaliMatchingTab
            activeProfileId={activeProfileId}
            profiles={profiles}
          />
        )}
      </main>

      {/* Light Portal Footer */}
      <footer className="border-t border-[#E8DEC8] bg-[#F7F2E7] py-1.5 text-[12px] text-stone-700">
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-3 flex flex-col md:flex-row items-center justify-between gap-1">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-600 via-orange-700 to-red-900 text-amber-100 flex items-center justify-center font-serif font-bold text-[13px] shadow-2xs border border-amber-400/50">
              ॐ
            </div>
            <span className="font-vedic font-black bg-gradient-to-r from-amber-900 via-orange-800 to-stone-900 bg-clip-text text-transparent text-[14px] uppercase tracking-wide">
              Astrov | Jotishveda
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[12px] text-stone-600">
            <span>Chitra Paksha Ayanamsha</span>
            <span>•</span>
            <span>Gochar Synced</span>
          </div>

          <p className="text-stone-500 text-center md:text-right text-[12px]">
            Astrological insights for spiritual contemplation.
          </p>
        </div>
      </footer>
    </div>
  );
}
