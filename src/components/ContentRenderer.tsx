import React from 'react';
import { BirthTimePredictionsTab } from './BirthTimePredictionsTab';
import { MonthWisePredictionsTab } from './MonthWisePredictionsTab';
import { VimshottariDashaTab } from './VimshottariDashaTab';
import { CriticalDashaTransitsTab } from './CriticalDashaTransitsTab';
import { TransitsLiveTab } from './TransitsLiveTab';
import { SadeSatiTab } from './SadeSatiTab';
import { PanchangTab } from './PanchangTab';
import { KundaliMatchingTab } from './KundaliMatchingTab';
import { DivisionalChartsTab } from './DivisionalChartsTab';
import { UpayRemediesTab } from './UpayRemediesTab';
import { AstrologySystemsTab } from './AstrologySystemsTab';
import { AstronomicalEphemerisTab } from './AstronomicalEphemerisTab';
import { LifeEventsMattersTab } from './LifeEventsMattersTab';
import { PersonalizedGuidanceTab } from './PersonalizedGuidanceTab';
import { FamilyLineageTab } from './FamilyLineageTab';
import { NumerologyTab } from './NumerologyTab';
import { RealPlanetPositionsTab } from './RealPlanetPositionsTab';
import { CelestialSkyMapWheel } from './CelestialSkyMapWheel';
import { calculatePlanetaryPositions } from '../vedicMath';
import { UserProfile } from '../types';
import { VEDIC_RASIS } from '../data';

interface ContentRendererProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  handleProfileChange: (id: string) => void;
  handleUpdateProfiles: (updated: UserProfile[]) => void;
  natalCalc: any;
  natalHouses: any;
  yogas: any;
  ashtakavarga: any;
}

export function ContentRenderer({
  activeTab,
  setActiveTab,
  currentProfile,
  profiles,
  handleProfileChange,
  handleUpdateProfiles,
  natalCalc,
  natalHouses,
  yogas,
  ashtakavarga
}: ContentRendererProps) {
  switch (activeTab) {
    case 'birth-predictions':
    case 'kundali':
      return (
        <BirthTimePredictionsTab
          profiles={profiles}
          activeProfileId={currentProfile.id}
          onProfileChange={handleProfileChange}
          onUpdateProfiles={handleUpdateProfiles}
          onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
          onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
        />
      );
    case 'celestial-wheel':
    case 'wheel': {
      const transitCalc = calculatePlanetaryPositions(
        new Date(),
        currentProfile.latitude || 28.6139,
        currentProfile.longitude || 77.209,
        'Lahiri'
      );
      return (
        <div className="space-y-3">
          <CelestialSkyMapWheel
            livePlanets={transitCalc.planets}
            natalPlanets={natalCalc?.planets || []}
            lagnaRasi={natalCalc?.lagnaRasi || transitCalc.lagnaRasi || 1}
            locationName={currentProfile.place || 'Observation Point'}
          />
        </div>
      );
    }
    case 'monthly-predictions':
      return (
        <MonthWisePredictionsTab
          activeProfileId={currentProfile.id}
          profiles={profiles}
          onNavigateToBirthTime={() => setActiveTab('birth-predictions')}
        />
      );
    case 'life-events':
      return (
        <LifeEventsMattersTab
          activeProfile={currentProfile}
          profiles={profiles}
          natalPlanets={natalCalc.planets}
          natalHouses={natalHouses}
          lagnaRasi={natalCalc.lagnaRasi}
          onNavigateToGuidance={() => setActiveTab('personalized-guidance')}
          onNavigateToMonthly={() => setActiveTab('monthly-predictions')}
          onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
        />
      );
    case 'personalized-guidance':
      return (
        <PersonalizedGuidanceTab
          activeProfile={currentProfile}
          profiles={profiles}
          natalPlanets={natalCalc.planets}
          natalHouses={natalHouses}
          lagnaRasi={natalCalc.lagnaRasi}
          onNavigateToLifeEvents={() => setActiveTab('life-events')}
          onNavigateToUpay={() => setActiveTab('upay-remedies')}
          onNavigateToBirthCharts={() => setActiveTab('birth-predictions')}
        />
      );
    case 'vimshottari-dasha':
      return (
        <VimshottariDashaTab
          activeProfileId={currentProfile.id}
          profiles={profiles}
          onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
          onNavigateToBirthTime={() => setActiveTab('birth-predictions')}
          onNavigateToMilestones={() => setActiveTab('critical-transits')}
        />
      );
    case 'upay-remedies':
      return (
        <UpayRemediesTab
          activeProfileId={currentProfile.id}
          profiles={profiles}
          onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
          onNavigateToBirthCharts={() => setActiveTab('birth-predictions')}
        />
      );
    case 'critical-transits':
      return (
        <CriticalDashaTransitsTab
          activeProfileId={currentProfile.id}
          profiles={profiles}
          onNavigateToDasha={() => setActiveTab('vimshottari-dasha')}
          onNavigateToMonthWise={() => setActiveTab('monthly-predictions')}
        />
      );
    case 'astrology-systems':
      return (
        <AstrologySystemsTab
          activeProfile={currentProfile}
          profiles={profiles}
          onProfileChange={handleProfileChange}
        />
      );
    case 'divisional-charts':
      return (
        <DivisionalChartsTab
          natalHouses={natalHouses}
          natalPlanets={natalCalc.planets}
          yogas={yogas}
          ashtakavarga={ashtakavarga}
          lagnaRasi={natalCalc.lagnaRasi}
          activeProfile={currentProfile}
        />
      );
    case 'transits':
      return (
        <TransitsLiveTab
          activeProfile={currentProfile}
          natalPlanets={natalCalc.planets}
          natalLagnaRasi={natalCalc.lagnaRasi}
        />
      );
    case 'astronomical-ephemeris':
      return (
        <AstronomicalEphemerisTab
          activeProfile={currentProfile}
          profiles={profiles}
          onProfileChange={handleProfileChange}
        />
      );
    case 'sadesati':
      return (
        <SadeSatiTab
          activeProfileId={currentProfile.id}
          profiles={profiles}
        />
      );
    case 'panchang':
      return (
        <PanchangTab
          activeProfile={currentProfile}
          natalPlanets={natalCalc.planets}
          natalLagnaRasi={natalCalc.lagnaRasi}
        />
      );
    case 'family-lineage':
      return (
        <FamilyLineageTab
          activeProfile={currentProfile}
          profiles={profiles}
          natalPlanets={natalCalc.planets}
          natalHouses={natalHouses}
          lagnaRasi={VEDIC_RASIS[natalCalc.lagnaRasi - 1]?.englishName || 'Aries'}
        />
      );
    case 'compatibility':
      return (
        <KundaliMatchingTab
          activeProfileId={currentProfile.id}
          profiles={profiles}
        />
      );
    case 'numerology':
      return (
        <NumerologyTab activeProfile={currentProfile} />
      );
    case 'real-planets':
      return (
        <RealPlanetPositionsTab
          activeProfile={currentProfile}
          profiles={profiles}
        />
      );
    default:
      return null;
  }
}
