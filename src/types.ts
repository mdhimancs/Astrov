export type VedicRasiName =
  | 'Mesha'
  | 'Vrishabha'
  | 'Mithuna'
  | 'Karka'
  | 'Simha'
  | 'Kanya'
  | 'Tula'
  | 'Vrischika'
  | 'Dhanu'
  | 'Makara'
  | 'Kumbha'
  | 'Meena';

export type WesternZodiacName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type GrahaName =
  | 'Surya'
  | 'Chandra'
  | 'Mangal'
  | 'Budha'
  | 'Guru'
  | 'Shukra'
  | 'Shani'
  | 'Rahu'
  | 'Ketu'
  | 'Lagna';

export interface PlanetPosition {
  name: GrahaName;
  englishName: string;
  symbol: string;
  rasiNumber: number; // 1 to 12
  rasiName: VedicRasiName;
  degree: number; // 0 to 30
  minute: number;
  isRetrograde: boolean;
  nakshatra: string;
  pada: number;
  house: number; // 1 to 12
  dignity?: 'Exalted' | 'Moolatrikona' | 'Own' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated';
  d9Position?: { rasiNumber: number; rasiName: VedicRasiName };
}

export interface HouseInfo {
  houseNumber: number;
  rasiNumber: number;
  rasiName: VedicRasiName;
  signLord: string;
  planets: PlanetPosition[];
  transitPlanets?: PlanetPosition[];
  significance: string;
  karaka: string;
  vedicName: string;
}

export interface BirthDetails {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  place: string;
  latitude: number;
  longitude: number;
  timezone: number; // e.g., +5.5 for IST
}

export interface DashaPeriod {
  lord: GrahaName;
  antarLord: GrahaName;
  startDate: string;
  endDate: string;
  status: 'Current' | 'Upcoming' | 'Past';
}

export interface TransitPrediction {
  category: 'Career & Wealth' | 'Love & Family' | 'Health & Vitality' | 'Spiritual Growth';
  rating: number; // 1 - 5 stars
  headline: string;
  prediction: string;
  activePlanets: string[];
}

export interface PanchangInfo {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vara: string;
  rahuKaal: string;
  abhijitMuhurta: string;
  sunrise: string;
  sunset: string;
}

export interface UserProfile {
  id: string; // e.g. 'profile-1', 'profile-2'
  label: string; // e.g. 'Profile 1 (Self)', 'Profile 2 (Spouse)'
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  place: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gender?: 'Male' | 'Female' | 'Other';
  notes?: string;
  updatedAt?: string;
}

export interface PlanetaryMovementDetail {
  planet: GrahaName;
  englishName: string;
  symbol: string;
  currentSign: VedicRasiName;
  signNumber: number;
  degree: number;
  minute: number;
  isRetrograde: boolean;
  nakshatra: string;
  houseFromMoon: number;
  houseFromLagna: number;
  isBeneficTransit: boolean; // Traditional Gochar benefic houses (e.g. Jupiter in 2,5,7,9,11 from Moon; Saturn in 3,6,11; Sun in 3,6,10,11; etc.)
  influenceStrength: 'High' | 'Moderate' | 'Mild';
  vedicEffect: string;
  dos: string[];
  donts: string[];
  keyDatesOrIngress?: string;
}

export interface MonthWiseTransitPrediction {
  monthKey: string; // e.g. '2026-09', '2026-10'
  monthName: string; // e.g. 'September 2026', 'October 2026'
  tagline: string;
  overallRating: number; // 1 to 5
  planetaryMovements: {
    planet: GrahaName;
    event: string; // e.g. 'Surya enters Kanya (Virgo)', 'Guru in Mithuna retrograde'
    date: string;
    impactSummary: string;
  }[];
  careerWealthForecast: string;
  loveFamilyForecast: string;
  healthVitalityForecast: string;
  spiritualForecast: string;
  dos: string[];
  donts: string[];
  favorableDays: string;
  cautionDays: string;
  remedyOfMonth: string;
}

export interface TransitDosAndDonts {
  category: 'Career & Investments' | 'Relationships & Marriage' | 'Health & Physical Wellbeing' | 'Decisions & Legal / Travel';
  dos: string[];
  donts: string[];
  planetaryReason: string;
}

export interface PlanetaryImpactRecord {
  planet: GrahaName;
  englishName: string;
  symbol: string;
  transitSign: string;
  houseFromLagna: number;
  houseFromMoon: number;
  motionStatus: string;
  specificEffect: string;
  healthEffect: string;
  jobEffect: string;
  businessEffect: string;
  relationEffect: string;
  marriageEffect: string;
  tone: 'Auspicious' | 'Caution' | 'Transformative' | 'Neutral';
}

export interface BirthTimeHousePrediction {
  houseNumber: number;
  vedicName: string;
  signName: string;
  signLord: string;
  karaka: string;
  planetsHere: string[];
  headline: string;
  prediction: string;
  lifeDomain:
    | 'Self & Vitality'
    | 'Wealth & Speech'
    | 'Courage & Skills'
    | 'Home & Emotional Peace'
    | 'Intellect & Children'
    | 'Health & Competition'
    | 'Marriage & Partnership'
    | 'Longevity & Secrets'
    | 'Fortune & Dharma'
    | 'Career & Profession'
    | 'Gains & Aspirations'
    | 'Moksha & Foreign';
  strengthScore: number;
}

export interface NatalYoga {
  name: string;
  sanskritName: string;
  planetsInvolved: string[];
  auspiciousness: 'High Raja Yoga' | 'Auspicious Dhana Yoga' | 'Spiritual Yoga' | 'Viparita Raja Yoga' | 'Auspicious Yoga';
  effect: string;
}

export interface VimshottariDashaInfo {
  birthLord: GrahaName;
  birthLordTotalYears: number;
  yearsRemainingAtBirth: number;
  currentLord: GrahaName;
  cycle: {
    planet: GrahaName;
    durationYears: number;
    startAge: number;
    endAge: number;
    startMonthYear: string;
    endMonthYear: string;
    lifeTheme: string;
  }[];
}

export interface AntardashaInfo {
  planet: GrahaName;
  durationMonths: number;
  durationYearsStr: string;
  startAge: number;
  endAge: number;
  startMonthYear: string;
  endMonthYear: string;
  isCurrent: boolean;
  theme: string;
}

export interface DashaMonthlyPlanetaryGuidance {
  monthKey: string;
  monthName: string;
  mahadashaLord: GrahaName;
  antardashaLord?: GrahaName;
  dashaLordTransitSign: string;
  dashaLordHouseFromMoon: number;
  dashaLordHouseFromLagna: number;
  dashaLordStatus: string;
  synergyTone: 'Highly Auspicious' | 'Auspicious' | 'Transformative & Demanding' | 'Caution Required';
  keyPlanetaryChanges: {
    planet: GrahaName;
    event: string;
    date: string;
    impactSummary: string;
  }[];
  guidance: {
    careerAndFinances: string;
    relationshipsAndFamily: string;
    healthAndVitality: string;
    spiritualAndKarmic: string;
  };
  dos: string[];
  donts: string[];
  favorableDays: string;
  cautionDays: string;
  monthlyRemedy: string;
}

export interface AshtakavargaPoints {
  planet: GrahaName;
  points: number[]; // 12 houses
  total: number;
}

export interface DivisionalChart {
  name: string;
  vargaCode: string; // D1, D9, D10, etc.
  planets: PlanetPosition[];
  houses: HouseInfo[];
}

export interface VedicAstroPredictionResult {
  birthDetails: BirthDetails;
  natalLagna: number;
  natalRasi: number;
  natalNakshatra: string;
  sadeSatiStatus: {
    inSadeSati: boolean;
    phase?: 'Rising (1st Phase)' | 'Peak (2nd Phase)' | 'Setting (3rd Phase)' | 'Dhaiya (Small Panoti)' | 'None';
    description: string;
  };
  currentDasha: {
    mahaDasha: GrahaName;
    antarDasha: GrahaName;
    pratyantarDasha: GrahaName;
  };
  natalHouses: HouseInfo[];
  transitHouses: HouseInfo[];
  predictions: TransitPrediction[];
  aiComprehensiveReading: string;
  remedies: {
    mantra: string;
    gemstone: string;
    charity: string;
    deity: string;
  };
}
