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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col relative overflow-x-hidden selection:bg-amber-200 selection:text-amber-950">
      {/* Subtle warm atmospheric light gradients */}
      <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-amber-200/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/5 w-[30rem] h-[30rem] bg-orange-100/30 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTransitTime={currentTimeStr}
      />

      {/* Main Vedic Content Area */}
      <main className="flex-1 pb-16">
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
        {activeTab === 'critical-transits' && (
          <CriticalDashaTransitsTab
            activeProfileId={activeProfileId}
            profiles={profiles}
            onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
            onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
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
        {activeTab === 'transits' && <TransitsLiveTab />}
        {activeTab === 'sadesati' && (
          <SadeSatiTab
            activeProfileId={activeProfileId}
            profiles={profiles}
          />
        )}
        {activeTab === 'panchang' && <PanchangTab />}
        {activeTab === 'compatibility' && (
          <KundaliMatchingTab
            activeProfileId={activeProfileId}
            profiles={profiles}
          />
        )}
      </main>

      {/* Light Portal Footer */}
      <footer className="border-t border-[#E8DEC8] bg-[#F7F2E7] py-8 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-vedic font-bold text-sm">
              ॐ
            </div>
            <div>
              <span className="font-vedic font-bold text-stone-900 text-sm">
                JyotishVeda • Vedic Astrology Portal
              </span>
              <p className="text-[11px] text-stone-500">
                Traditional Parashari Jyotish • North Indian Kundali & Real-Time Planetary Movement
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-600">
            <span>Chitra Paksha Ayanamsha</span>
            <span>•</span>
            <span>Real-Time Gochar Synced</span>
            <span>•</span>
            <span>Parashari Hora Shastra</span>
          </div>

          <p className="text-stone-500 text-center md:text-right text-[11px]">
            Astrological insights provided for spiritual contemplation and dharmic guidance.
          </p>
        </div>
      </footer>
    </div>
  );
}
