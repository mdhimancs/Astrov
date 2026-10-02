import { BirthDetails, PlanetPosition, HouseInfo, VedicRasiName, GrahaName, TransitPrediction, PlanetaryMovementDetail, MonthWiseTransitPrediction, YearlyPrediction, TransitDosAndDonts, PlanetaryImpactRecord, BirthTimeHousePrediction, BhriguLalKitabSummary, NatalYoga, VimshottariDashaInfo, AntardashaInfo, DashaMonthlyPlanetaryGuidance, AshtakavargaPoints } from './types';
import { VEDIC_RASIS, NAKSHATRAS, BHAVA_DETAILS } from './data';
import { ALL_MONTH_WISE_PREDICTIONS } from './monthlyTransitData';
export { ALL_MONTH_WISE_PREDICTIONS };

// Helper: Normalize angle to 0 - 360
export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// Lahiri Ayanamsha for epoch approx 2026 ~ 24.25 degrees
export function getLahiriAyanamsha(year: number): number {
  return 23.85 + (year - 2000) * 0.01397;
}

// Convert Date & Time to Julian Day
export function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// Planet names mapping
export const PLANET_INFO: { [key in GrahaName]: { english: string; symbol: string; avgSpeed: number } } = {
  Lagna: { english: 'Ascendant', symbol: 'Asc', avgSpeed: 360 },
  Surya: { english: 'Sun', symbol: 'Su', avgSpeed: 0.9856 },
  Chandra: { english: 'Moon', symbol: 'Mo', avgSpeed: 13.176 },
  Mangal: { english: 'Mars', symbol: 'Ma', avgSpeed: 0.524 },
  Budha: { english: 'Mercury', symbol: 'Me', avgSpeed: 1.383 },
  Guru: { english: 'Jupiter', symbol: 'Ju', avgSpeed: 0.083 },
  Shukra: { english: 'Venus', symbol: 'Ve', avgSpeed: 1.2 },
  Shani: { english: 'Saturn', symbol: 'Sa', avgSpeed: 0.033 },
  Rahu: { english: 'Rahu (North Node)', symbol: 'Ra', avgSpeed: -0.053 },
  Ketu: { english: 'Ketu (South Node)', symbol: 'Ke', avgSpeed: -0.053 },
};

// Calculate planetary longitudes (approximate sidereal positions)
export function calculatePlanetaryPositions(date: Date, lat: number, lng: number): {
  planets: PlanetPosition[];
  lagnaRasi: number;
  lagnaDeg: number;
} {
  const jd = getJulianDay(date);
  const t = (jd - 2451545.0) / 36525; // Centuries since J2000
  const ayanamsha = getLahiriAyanamsha(date.getFullYear());

  // Mean longitudes
  let sunL = normalizeDegrees(280.46646 + 36000.76983 * t);
  let moonL = normalizeDegrees(218.3165 + 481267.8813 * t);
  let marsL = normalizeDegrees(355.433 + 19140.299 * t);
  let mercuryL = normalizeDegrees(sunL + 18 * Math.sin((date.getDate() + date.getMonth() * 30) * 0.1));
  let jupiterL = normalizeDegrees(34.351 + 3034.906 * t);
  let venusL = normalizeDegrees(sunL + 28 * Math.cos((date.getDate() + date.getMonth() * 30) * 0.08));
  let saturnL = normalizeDegrees(50.077 + 1222.114 * t);
  let rahuL = normalizeDegrees(259.183 - 1934.142 * t);
  let ketuL = normalizeDegrees(rahuL + 180);

  // Local Sidereal Time for Ascendant (Lagna)
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gmst = normalizeDegrees(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const lmst = normalizeDegrees(gmst + lng);
  const radLat = (lat * Math.PI) / 180;
  const radLmst = (lmst * Math.PI) / 180;
  const obl = (23.439 - 0.00013 * t) * (Math.PI / 180);

  const y = Math.cos(radLmst);
  const x = -Math.sin(radLmst) * Math.cos(obl) - Math.tan(radLat) * Math.sin(obl);
  let tropicalAsc = normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI + 90);
  let siderealAsc = normalizeDegrees(tropicalAsc - ayanamsha);

  // Convert all tropical to sidereal Lahiri
  const rawPositions: { [key in GrahaName]: number } = {
    Lagna: siderealAsc,
    Surya: normalizeDegrees(sunL - ayanamsha),
    Chandra: normalizeDegrees(moonL - ayanamsha),
    Mangal: normalizeDegrees(marsL - ayanamsha),
    Budha: normalizeDegrees(mercuryL - ayanamsha),
    Guru: normalizeDegrees(jupiterL - ayanamsha),
    Shukra: normalizeDegrees(venusL - ayanamsha),
    Shani: normalizeDegrees(saturnL - ayanamsha),
    Rahu: normalizeDegrees(rahuL - ayanamsha),
    Ketu: normalizeDegrees(ketuL - ayanamsha),
  };

  const lagnaRasi = Math.floor(siderealAsc / 30) + 1;
  const lagnaDeg = siderealAsc % 30;

  const planets: PlanetPosition[] = (Object.keys(rawPositions) as GrahaName[]).map((name) => {
    const totalDeg = rawPositions[name];
    const rasiNumber = Math.floor(totalDeg / 30) + 1;
    const rasiName = VEDIC_RASIS[rasiNumber - 1].sanskritName;
    const degInSign = totalDeg % 30;
    const degree = Math.floor(degInSign);
    const minute = Math.floor((degInSign - degree) * 60);

    // Nakshatra calculation (360 deg / 27 nakshatras = 13.3333 deg each)
    const nakshatraIndex = Math.floor(totalDeg / (360 / 27));
    const nakshatra = NAKSHATRAS[nakshatraIndex % 27].name;
    const pada = Math.floor((totalDeg % (360 / 27)) / (360 / 108)) + 1;

    // House calculation relative to Lagna: House = (rasiNumber - lagnaRasi + 12) % 12 + 1
    const house = ((rasiNumber - lagnaRasi + 12) % 12) + 1;

    // Retrograde flags (Rahu/Ketu are always retrograde; others based on distance to Sun)
    let isRetrograde = false;
    if (name === 'Rahu' || name === 'Ketu') isRetrograde = true;
    else if (name === 'Shani' || name === 'Guru' || name === 'Mangal') {
      const sunDiff = Math.abs(totalDeg - rawPositions.Surya);
      if (sunDiff > 120 && sunDiff < 240) isRetrograde = true;
    }

    return {
      name,
      englishName: PLANET_INFO[name].english,
      symbol: PLANET_INFO[name].symbol,
      rasiNumber,
      rasiName,
      degree,
      minute,
      isRetrograde,
      nakshatra,
      pada,
      house,
      d9Position: calculateD9Position(totalDeg),
    };
  });

  return { planets, lagnaRasi, lagnaDeg };
}

// Calculate Navamsha (D9) Position
export function calculateD9Position(totalDeg: number): { rasiNumber: number; rasiName: VedicRasiName } {
  const divisionSize = 30 / 9; // 3 deg 20 min
  const signIndex = Math.floor(totalDeg / 30);
  const degInSign = totalDeg % 30;
  const navamshaIndex = Math.floor(degInSign / divisionSize);

  let startSign: number;
  // Element-based start sign for Navamsha
  const elementGroup = signIndex % 4;
  if (elementGroup === 0) startSign = 1; // Fire -> Mesha
  else if (elementGroup === 1) startSign = 10; // Earth -> Makara
  else if (elementGroup === 2) startSign = 7; // Air -> Tula
  else startSign = 4; // Water -> Karka

  const d9RasiNumber = ((startSign - 1 + navamshaIndex) % 12) + 1;
  return {
    rasiNumber: d9RasiNumber,
    rasiName: VEDIC_RASIS[d9RasiNumber - 1].sanskritName,
  };
}

// detect common Vedic Yogas
export function calculateYogas(planets: PlanetPosition[], lagnaRasi: number): NatalYoga[] {
  const yogas: NatalYoga[] = [];

  const getPlanet = (name: GrahaName) => planets.find((p) => p.name === name);
  const moon = getPlanet('Chandra');
  const jupiter = getPlanet('Guru');
  const sun = getPlanet('Surya');
  const mars = getPlanet('Mangal');
  const mercury = getPlanet('Budha');
  const venus = getPlanet('Shukra');
  const saturn = getPlanet('Shani');

  if (!moon || !jupiter || !sun || !mars || !mercury || !venus || !saturn) return [];

  // Gaja Kesari Yoga: Jupiter in 1, 4, 7, 10 from Moon
  const distMoonJupiter = ((jupiter.house - moon.house + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(distMoonJupiter)) {
    yogas.push({
      name: 'Gaja Kesari Yoga',
      sanskritName: 'गजकेसरी योग',
      planetsInvolved: ['Chandra', 'Guru'],
      auspiciousness: 'High Raja Yoga',
      effect: 'Bestows great wisdom, wealth, lasting reputation, and power over rivals. The native is broad-minded and virtuous.',
    });
  }

  // Budha-Aditya Yoga: Sun and Mercury in the same house
  if (sun.house === mercury.house) {
    yogas.push({
      name: 'Budha Aditya Yoga',
      sanskritName: 'बुधादित्य योग',
      planetsInvolved: ['Surya', 'Budha'],
      auspiciousness: 'Auspicious Yoga',
      effect: 'Endows high intelligence, analytical skills, and professional success in advisory or intellectual roles.',
    });
  }

  // Lakshmi Yoga: Lord of 9th in Kendra and Lagna Lord strong
  const ninthHouseRasi = ((lagnaRasi - 1 + 8) % 12) + 1;
  const ninthLord = VEDIC_RASIS[ninthHouseRasi - 1].lord as GrahaName;
  const ninthLordPlanet = getPlanet(ninthLord);
  if (ninthLordPlanet && [1, 4, 7, 10].includes(ninthLordPlanet.house)) {
    yogas.push({
      name: 'Lakshmi Yoga',
      sanskritName: 'लक्ष्मी योग',
      planetsInvolved: [ninthLord],
      auspiciousness: 'Auspicious Dhana Yoga',
      effect: 'Bestows immense wealth, prosperity, and comfort in life. The person is handsome/beautiful and wealthy.',
    });
  }

  // Chandra-Mangala Yoga: Moon and Mars together
  if (moon.house === mars.house) {
    yogas.push({
      name: 'Chandra Mangala Yoga',
      sanskritName: 'चन्द्र-मंगल योग',
      planetsInvolved: ['Chandra', 'Mangal'],
      auspiciousness: 'Auspicious Dhana Yoga',
      effect: 'Leads to earnings through persistent effort, technical skills, and sometimes unconventional means.',
    });
  }

  // Malavya Yoga: Venus in Kendra (1,4,7,10) in own sign or exaltation
  if ([1, 4, 7, 10].includes(venus.house)) {
    const isStrong = (venus.rasiNumber === 2 || venus.rasiNumber === 7 || venus.rasiNumber === 12);
    if (isStrong) {
      yogas.push({
        name: 'Malavya Yoga',
        sanskritName: 'मालव्य योग',
        planetsInvolved: ['Shukra'],
        auspiciousness: 'High Raja Yoga',
        effect: 'One of the Pancha Mahapurusha Yogas. Bestows luxury, artistic talent, beauty, and a happy domestic life.',
      });
    }
  }

  // Sasa Yoga: Saturn in Kendra (1,4,7,10) in own sign or exaltation
  if ([1, 4, 7, 10].includes(saturn.house)) {
    const isStrong = (saturn.rasiNumber === 10 || saturn.rasiNumber === 11 || saturn.rasiNumber === 7);
    if (isStrong) {
      yogas.push({
        name: 'Sasa Yoga',
        sanskritName: 'शश योग',
        planetsInvolved: ['Shani'],
        auspiciousness: 'High Raja Yoga',
        effect: 'One of the Pancha Mahapurusha Yogas. Grants leadership, organizational skills, long life, and success in politics or administration.',
      });
    }
  }

  return yogas;
}

// Ashtakavarga points calculation (Simplified/Representative)
export function calculateAshtakavarga(planets: PlanetPosition[]): AshtakavargaPoints[] {
  const result: AshtakavargaPoints[] = [];
  const planetsToCalc: GrahaName[] = ['Surya', 'Chandra', 'Mangal', 'Budha', 'Guru', 'Shukra', 'Shani'];

  planetsToCalc.forEach((p) => {
    // In a real app, this would use the 8-point contribution rules from each planet
    // Here we generate representative points based on planetary dignity and house positions
    const points = Array.from({ length: 12 }, (_, i) => {
      const house = i + 1;
      const base = 4;
      const randomVar = (Math.sin((p.length + house) * 0.5) * 2 + 2) | 0;
      return Math.max(0, Math.min(8, base + randomVar));
    });

    result.push({
      planet: p,
      points,
      total: points.reduce((a, b) => a + b, 0),
    });
  });

  return result;
}

// Build 12 North Indian Houses with planets inside
export function buildHouseStructure(lagnaRasi: number, planets: PlanetPosition[], transitPlanets?: PlanetPosition[]): HouseInfo[] {
  const houses: HouseInfo[] = [];

  for (let h = 1; h <= 12; h++) {
    const rasiNumber = ((lagnaRasi - 1 + (h - 1)) % 12) + 1;
    const rasiData = VEDIC_RASIS[rasiNumber - 1];
    const houseMeta = BHAVA_DETAILS[h - 1];

    const positedPlanets = planets.filter((p) => p.house === h && p.name !== 'Lagna');
    const positedTransits = transitPlanets ? transitPlanets.filter((p) => p.house === h && p.name !== 'Lagna') : undefined;

    houses.push({
      houseNumber: h,
      rasiNumber,
      rasiName: rasiData.sanskritName,
      signLord: rasiData.lord,
      planets: positedPlanets,
      transitPlanets: positedTransits,
      significance: houseMeta.significance,
      karaka: houseMeta.karaka,
      vedicName: houseMeta.vedicName,
    });
  }

  return houses;
}

// Compute Sade Sati & Dhaiya status
export function checkSadeSati(natalMoonRasi: number, transitSaturnRasi: number): {
  inSadeSati: boolean;
  phase: 'Rising (1st Phase)' | 'Peak (2nd Phase)' | 'Setting (3rd Phase)' | 'Dhaiya (Small Panoti)' | 'None';
  description: string;
} {
  const diff = ((transitSaturnRasi - natalMoonRasi + 12) % 12);

  if (diff === 11) {
    return {
      inSadeSati: true,
      phase: 'Rising (1st Phase)',
      description: 'Shani is transiting 12th from your Janma Rasi. Heightens expenditures, travel, mental restructuring, and spiritual discipline.',
    };
  } else if (diff === 0) {
    return {
      inSadeSati: true,
      phase: 'Peak (2nd Phase)',
      description: 'Shani is transiting directly over your Janma Rasi (Janma Shani). Demands supreme honesty, patience, health care, and karmic refinement.',
    };
  } else if (diff === 1) {
    return {
      inSadeSati: true,
      phase: 'Setting (3rd Phase)',
      description: 'Shani is transiting 2nd from your Janma Rasi. Focus shifts to financial stabilization, family speech, and consolidation of gains.',
    };
  } else if (diff === 3) {
    return {
      inSadeSati: false,
      phase: 'Dhaiya (Small Panoti)',
      description: 'Kantaka Shani transiting the 4th house from Moon. Urges attention to domestic peace, property matters, and emotional equilibrium.',
    };
  } else if (diff === 7) {
    return {
      inSadeSati: false,
      phase: 'Dhaiya (Small Panoti)',
      description: 'Ashtama Shani transiting the 8th house from Moon. Calls for careful driving, health checks, and deep spiritual surrender.',
    };
  }

  return {
    inSadeSati: false,
    phase: 'None',
    description: 'You are currently free from Shani Sade Sati and Dhaiya. Saturn exerts favorable supporting influence.',
  };
}

// Generate real-time transit predictions
export function generateVedicPredictions(
  natalHouses: HouseInfo[],
  transitPlanets: PlanetPosition[],
  sadeSati: ReturnType<typeof checkSadeSati>
): TransitPrediction[] {
  const jupiterTransit = transitPlanets.find((p) => p.name === 'Guru');
  const saturnTransit = transitPlanets.find((p) => p.name === 'Shani');
  const sunTransit = transitPlanets.find((p) => p.name === 'Surya');

  return [
    {
      category: 'Career & Wealth',
      rating: jupiterTransit?.house === 10 || jupiterTransit?.house === 11 || jupiterTransit?.house === 2 ? 5 : 4,
      headline: `Jupiter Transiting House ${jupiterTransit?.house || 10} & Saturn in House ${saturnTransit?.house || 1}`,
      prediction: `Current transit of Guru through your ${jupiterTransit?.house}th house expands professional recognition, mentorship, and financial opportunities. Saturn's disciplined gaze in your ${saturnTransit?.house}th house reinforces long-term enterprise development. Focus on sustainable integrity.`,
      activePlanets: ['Guru', 'Shani', 'Surya'],
    },
    {
      category: 'Love & Family',
      rating: sadeSati.inSadeSati ? 3 : 5,
      headline: sadeSati.inSadeSati ? 'Karmic Maturation in Partnerships' : 'Harmonious Planetary Blessings',
      prediction: `Venus and Mercury alignments foster compassionate communication. ${
        sadeSati.inSadeSati
          ? 'Under active Saturn influence, practice mindful listening and patient empathy with loved ones.'
          : 'Supportive planetary rays invite warm social bonding, family joy, and mutual understanding.'
      }`,
      activePlanets: ['Shukra', 'Chandra', 'Budha'],
    },
    {
      category: 'Health & Vitality',
      rating: 4,
      headline: `Solar Vitality with ${sunTransit?.rasiName} Transit`,
      prediction: `Surya transiting your ${sunTransit?.house}th house energizes your physical stamina. Balance solar vitality with cooling hydration, Ayurvedic seasonal eating, and early morning Pranayama.`,
      activePlanets: ['Surya', 'Mangal'],
    },
    {
      category: 'Spiritual Growth',
      rating: 5,
      headline: 'Rahu-Ketu Axis & Moksha Awakenings',
      prediction: `The nodal axis movement encourages introspection and release of past attachment. Ideal time for daily meditation, mantra recitation, and charitable offerings to clear ancestral debts.`,
      activePlanets: ['Rahu', 'Ketu', 'Guru'],
    },
  ];
}

// Classical Parashari Gochar Benefic Houses from Janma Rasi (Moon)
export const GOCHAR_BENEFIC_HOUSES: { [key in GrahaName]?: number[] } = {
  Surya: [3, 6, 10, 11],
  Chandra: [1, 3, 6, 7, 10, 11],
  Mangal: [3, 6, 11],
  Budha: [2, 4, 6, 8, 10, 11],
  Guru: [2, 5, 7, 9, 11],
  Shukra: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Shani: [3, 6, 11],
  Rahu: [3, 6, 10, 11],
  Ketu: [3, 6, 11],
};

// Calculate detailed planetary movements with authentic Vedic effects and specific Do's & Don'ts
export function calculateDetailedPlanetaryMovements(
  natalLagnaRasi: number,
  natalMoonRasi: number,
  transitPlanets: PlanetPosition[]
): PlanetaryMovementDetail[] {
  return transitPlanets
    .filter((p) => p.name !== 'Lagna')
    .map((planet) => {
      // Calculate house from Moon (Gochar)
      const houseFromMoon = ((planet.rasiNumber - natalMoonRasi + 12) % 12) + 1;
      // Calculate house from Lagna
      const houseFromLagna = ((planet.rasiNumber - natalLagnaRasi + 12) % 12) + 1;

      const beneficHouses = GOCHAR_BENEFIC_HOUSES[planet.name] || [3, 6, 11];
      const isBeneficTransit = beneficHouses.includes(houseFromMoon);

      let vedicEffect = '';
      let dos: string[] = [];
      let donts: string[] = [];
      let influenceStrength: 'High' | 'Moderate' | 'Mild' = 'Moderate';

      switch (planet.name) {
        case 'Guru': // Jupiter
          influenceStrength = 'High';
          if (isBeneficTransit) {
            vedicEffect = `Jupiter transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). Bestows wisdom, dharmic merit, mentors' grace, auspicious celebrations, and financial prosperity.`;
            dos = [
              'Initiate educational certifications, investments, or spiritual vows.',
              'Honor teachers, gurus, and elders with genuine respect.',
              'Pursue long-range career expansions and intellectual collaborations.',
            ];
            donts = [
              'Avoid complacency or taking financial blessings for granted.',
              'Do not neglect regular physical exercise, as Jupiter transit can expand weight.',
            ];
          } else {
            vedicEffect = `Jupiter transits your ${houseFromMoon}th house from Moon. Advises cautious spending, maintaining liver and metabolic health, and avoiding speculative over-confidence.`;
            dos = [
              'Engage in Guru mantra japa (Om Gram Greem Graum Sah Gurave Namah).',
              'Offer yellow fruits, turmeric, or chana dal to temple priests on Thursdays.',
              'Focus on steady skill refinement rather than aggressive speculation.',
            ];
            donts = [
              'Avoid taking uncalculated business loans or over-leveraging assets.',
              'Refrain from preaching or moral arrogance with peers.',
            ];
          }
          break;

        case 'Shani': // Saturn
          influenceStrength = 'High';
          if (isBeneficTransit) {
            vedicEffect = `Saturn transits your ${houseFromMoon}th house from Moon (${planet.rasiName}), an exceptionally powerful and victorious Gochar position. Neutralizes rivals, grants robust physical immunity, and rewards consistent disciplined labor with permanent status.`;
            dos = [
              'Take on demanding, long-term organizational responsibilities.',
              'Streamline daily routines, physical conditioning, and debt repayments.',
              'Lead team initiatives with fairness, humility, and punctuality.',
            ];
            donts = [
              'Do not cut ethical corners or mistreat blue-collar subordinates.',
              'Avoid procrastinating on pending administrative or legal duties.',
            ];
          } else {
            vedicEffect = `Saturn transits your ${houseFromMoon}th house from Moon. Tests resilience, karmic debt clearance, and emotional endurance. Demands patience and conscious stress management.`;
            dos = [
              'Light a mustard oil lamp under a Peepal tree on Saturday evenings.',
              'Recite Hanuman Chalisa daily and practice mindful meditation.',
              'Prioritize spinal health, joint flexibility, and sufficient sleep.',
            ];
            donts = [
              'Do not enter heated arguments with family elders or superiors.',
              'Avoid impulsive job resignations or reckless financial investments.',
              'Refrain from pessimistic rumination or isolation.',
            ];
          }
          break;

        case 'Rahu': // North Node
          influenceStrength = 'High';
          if (isBeneficTransit) {
            vedicEffect = `Rahu transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). Sparkles ambition, out-of-the-box innovation, foreign connections, and sudden unconventional breakthroughs.`;
            dos = [
              'Explore technology adoption, foreign markets, and modern digital media.',
              'Harness creative and unconventional problem-solving methods.',
              'Maintain razor-sharp legal clarity in all contracts.',
            ];
            donts = [
              'Do not fall prey to get-rich-quick schemes or shady shortcuts.',
              'Avoid arrogance when sudden early success manifests.',
            ];
          } else {
            vedicEffect = `Rahu transits your ${houseFromMoon}th house from Moon. Can induce mental restlessness, illusions (Maya), and speculative anxiety.`;
            dos = [
              'Ground your mind with daily Pranayama and nature walks.',
              'Feed birds or stray animals with grains on Wednesdays/Saturdays.',
              'Double-check all financial documentation and legal terms before signing.',
            ];
            donts = [
              'Strictly avoid unverified investments, gambling, or intoxicants.',
              'Do not act upon unverified rumors or paranoias in relationships.',
            ];
          }
          break;

        case 'Ketu': // South Node
          influenceStrength = 'Moderate';
          vedicEffect = `Ketu transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). Promotes spiritual introspection, research, detachment from superficial vanity, and sudden intuitive clarity.`;
          dos = [
            'Dedicate time to meditation, philosophy, and silent contemplation.',
            'Declutter physical possessions and donate unneeded items to charity.',
            'Listen deeply to gut instincts and internal wisdom.',
          ];
          donts = [
            'Do not disconnect entirely from worldly family duties.',
            'Avoid erratic or passive-aggressive communication.',
          ];
          break;

        case 'Surya': // Sun
          influenceStrength = 'Moderate';
          if (isBeneficTransit) {
            vedicEffect = `Surya transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). Boosts executive vitality, administrative success, social respect, and victory over opposition.`;
            dos = [
              'Offer Surya Arghya (water in copper vessel) at dawn.',
              'Pitch bold ideas to senior executives or government authorities.',
              'Engage in outdoor physical exercise during morning hours.',
            ];
            donts = [
              'Do not let confidence tilt into domineering ego or bossiness.',
              'Avoid skipping meals or dehydrating during peak work hours.',
            ];
          } else {
            vedicEffect = `Surya transits your ${houseFromMoon}th house from Moon. Advises patience with authorities, cooling dietary choices, and avoiding ego-clashes.`;
            dos = [
              'Practice humility in communications with superiors.',
              'Consume hydrating, cooling Ayurvedic foods (coconut water, mint).',
              'Chant the Gayatri Mantra during morning Brahma Muhurta.',
            ];
            donts = [
              'Avoid direct confrontations with bosses or government officials.',
              'Do not strain eyes or expose yourself to excessive midday heat.',
            ];
          }
          break;

        case 'Mangal': // Mars
          influenceStrength = 'High';
          if (isBeneficTransit) {
            vedicEffect = `Mangal transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). High stamina, decisive bravery, real estate gains, and triumphant competitive edge.`;
            dos = [
              'Tackle strenuous backlog tasks and physical fitness milestones.',
              'Lead project deliveries with assertive and decisive clarity.',
              'Support younger siblings or team members with hands-on help.',
            ];
            donts = [
              'Do not let adrenaline lead to reckless driving or sharp temper.',
              'Avoid speaking curtly when subordinates take time to understand.',
            ];
          } else {
            vedicEffect = `Mangal transits your ${houseFromMoon}th house from Moon. Potential for rash anger, inflammation, or friction in domestic relationships.`;
            dos = [
              'Channel excess physical energy into cardiovascular workouts.',
              'Practice deep abdominal breathing before reacting to conflict.',
              'Chant Om Bhaumaya Namah or recite Hanuman Chalisa on Tuesdays.',
            ];
            donts = [
              'Avoid high-speed driving or operating machinery while distracted.',
              'Do not engage in spiteful debates or domestic arguments.',
            ];
          }
          break;

        case 'Budha': // Mercury
          influenceStrength = 'Mild';
          vedicEffect = `Budha transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). Enhances analytical faculties, commercial bargaining, mathematical precision, and humorous intellect.`;
          dos = [
            'Audit financial statements, balance sheets, and tax documents.',
            'Sharpen professional writing, coding, or communication skills.',
            'Engage in networking and collaborative team brainstorming.',
          ];
          donts = [
            'Avoid overanalyzing minor defects to the point of decision paralysis.',
            'Do not gossip or spread unverified workplace hearsay.',
          ];
          break;

        case 'Shukra': // Venus
          influenceStrength = 'Moderate';
          vedicEffect = `Shukra transits your ${houseFromMoon}th house from Moon (${planet.rasiName}). Brings romantic sweetness, creative aesthetics, social charm, and material luxuries.`;
          dos = [
            'Decorate your home sanctuary and cultivate artistic hobbies.',
            'Express gratitude and affection to your spouse or life partner.',
            'Incorporate graceful grooming, fine fragrances, and wholesome music.',
          ];
          donts = [
            'Avoid impulse luxury spending on unnecessary prestige items.',
            'Do not compromise core personal boundaries for superficial approval.',
          ];
          break;

        default:
          vedicEffect = `${planet.name} transits your ${houseFromMoon}th house from Moon. Influences subtle emotional rhythms and subconscious intuition.`;
          dos = ['Maintain calm routines.', 'Listen to calming sacred mantras.'];
          donts = ['Avoid emotional reactivity.', 'Refrain from sudden changes in routine.'];
      }

      return {
        planet: planet.name,
        englishName: planet.englishName,
        symbol: planet.symbol,
        currentSign: planet.rasiName,
        signNumber: planet.rasiNumber,
        degree: planet.degree,
        minute: planet.minute,
        isRetrograde: planet.isRetrograde,
        nakshatra: planet.nakshatra,
        houseFromMoon,
        houseFromLagna,
        isBeneficTransit,
        influenceStrength,
        vedicEffect,
        dos,
        donts,
        keyDatesOrIngress: `${planet.name} in ${planet.rasiName} (${planet.degree}°${planet.minute}')`,
      };
    });
}

// Generate Month-Wise Transit Predictions (Timeline from July 2025 through December 2027)
export function generateMonthWiseTransitPredictions(
  natalMoonRasi: number,
  natalLagnaRasi: number,
  sadeSatiActive: boolean
): MonthWiseTransitPrediction[] {
  return ALL_MONTH_WISE_PREDICTIONS.map((month) => {
    // If Sade Sati is active, append conscious awareness to caution days
    if (sadeSatiActive && !month.cautionDays.includes('Sade Sati')) {
      return {
        ...month,
        cautionDays: `${month.cautionDays} (Sade Sati awareness)`,
      };
    }
    return month;
  });
}

// Categorized Do's and Don'ts across all 4 key life domains based on current Gochar
export function generateCategorizedDosAndDonts(
  transitPlanets: PlanetPosition[],
  sadeSatiActive: boolean
): TransitDosAndDonts[] {
  const saturn = transitPlanets.find((p) => p.name === 'Shani');
  const jupiter = transitPlanets.find((p) => p.name === 'Guru');
  const rahu = transitPlanets.find((p) => p.name === 'Rahu');

  return [
    {
      category: 'Career & Investments',
      dos: [
        'Prioritize long-term, asset-backed investments with consistent cash flow (Saturn in Pisces & Jupiter in Gemini).',
        'Formalize all verbal agreements into written contracts signed by verified witnesses.',
        'Invest in professional upgrading, modern digital technology, and cross-disciplinary skills.',
      ],
      donts: [
        'Avoid intraday stock gambling, cryptocurrency pump-and-dump traps, or unverified speculative schemes (Rahu transit warning).',
        'Do not burn bridges with past employers or business partners in moments of frustration.',
        'Avoid committing to massive capital loans without a secondary contingency fund.',
      ],
      planetaryReason: 'Saturn transit rewards patience and penalizes shortcuts, while Jupiter supports intellectual value creation.',
    },
    {
      category: 'Relationships & Marriage',
      dos: [
        'Practice patient, non-defensive listening when your spouse or partner expresses vulnerability.',
        'Celebrate family milestone rituals and support in-laws and elders with loving service.',
        'Plan regular sacred getaways or quiet retreats to reconnect away from screen distractions.',
      ],
      donts: [
        'Avoid raising old historical arguments or bringing unresolved workplace stress into the bedroom.',
        'Do not allow third-party social media comparisons to seed discontent in your marriage.',
        'Never make major relationship ultimatums during full moon or solar ingress dates.',
      ],
      planetaryReason: 'Venus and Moon harmonized rays foster intimacy, but Saturnian aspects demand emotional maturity.',
    },
    {
      category: 'Health & Physical Wellbeing',
      dos: [
        'Maintain a consistent circadian sleep schedule (sleep by 10:30 PM, rise at Brahma Muhurta).',
        'Consume warm, freshly prepared sattvic meals according to seasonal Ayurvedic guidelines.',
        'Practice daily joint mobility, spine stretches, and 15 minutes of Anulom-Vilom Pranayama.',
      ],
      donts: [
        'Avoid irregular meal timings, late-night heavy feasts, or processed fast foods.',
        'Do not ignore persistent joint stiffness, lower back pain, or digestive sluggishness.',
        'Avoid excessive caffeine or energy drinks as a substitute for natural restorative sleep.',
      ],
      planetaryReason: 'Saturn rules bones and chronic vitality, while Sun governs cellular immunity and digestive Agni.',
    },
    {
      category: 'Decisions & Legal / Travel',
      dos: [
        'Verify government tax compliances, visa documentation, and property titles meticulously.',
        'Consult seasoned mentors or experienced legal advisors before signing binding deeds.',
        'Undertake spiritual pilgrimages (Tirth Yatra) to sacred rivers or ancient temples.',
      ],
      donts: [
        'Avoid traveling without comprehensive insurance during transit caution windows.',
        'Do not engage in petty civil disputes or stubborn litigation over minor ego issues.',
        'Avoid signing legal covenants under intoxication, fatigue, or emotional duress.',
      ],
      planetaryReason: 'Jupiter in 9th/3rd trine favors pilgrimage, while Rahu transit cautions against fine-print legal oversights.',
    },
  ];
}

// Calculate Unified Planetary Table for Single View Dashboard
export function calculateUnifiedPlanetaryTable(
  natalLagnaRasi: number,
  natalMoonRasi: number,
  transitPlanets: PlanetPosition[],
  selectedMonthKey?: string
): PlanetaryImpactRecord[] {
  // Key major planets to display in the priority table
  const keyPlanets: GrahaName[] = ['Shani', 'Guru', 'Rahu', 'Ketu', 'Surya', 'Mangal', 'Budha', 'Shukra'];

  return keyPlanets.map((graha) => {
    const planet = transitPlanets.find((p) => p.name === graha) || {
      name: graha,
      englishName: PLANET_INFO[graha].english,
      symbol: PLANET_INFO[graha].symbol,
      rasiNumber: 12,
      rasiName: 'Meena' as VedicRasiName,
      degree: 15,
      minute: 20,
      isRetrograde: false,
      nakshatra: 'Uttara Bhadrapada',
      pada: 2,
      house: 1,
    };

    const houseFromLagna = ((planet.rasiNumber - natalLagnaRasi + 12) % 12) + 1;
    const houseFromMoon = ((planet.rasiNumber - natalMoonRasi + 12) % 12) + 1;

    let motionStatus = planet.isRetrograde ? 'Vakri (Retrograde)' : 'Marga (Direct)';
    let tone: 'Auspicious' | 'Caution' | 'Transformative' | 'Neutral' = 'Neutral';

    let specificEffect = '';
    let healthEffect = '';
    let jobEffect = '';
    let businessEffect = '';
    let relationEffect = '';
    let marriageEffect = '';
    let educationEffect = '';
    let mentalStateEffect = '';

    switch (graha) {
      case 'Shani': {
        const isBenefic = [3, 6, 11].includes(houseFromMoon);
        const isSadeSati = [12, 1, 2].includes(houseFromMoon);
        const isDhaiya = [4, 8].includes(houseFromMoon);

        tone = isBenefic ? 'Auspicious' : isSadeSati || isDhaiya ? 'Caution' : 'Transformative';
        motionStatus = planet.isRetrograde ? 'Vakri (Retrograde)' : 'Marga (Direct)';

        specificEffect = `Saturn in ${planet.rasiName} (${planet.degree}°${planet.minute}'): Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. ${
          isSadeSati
            ? `Active Sade Sati phase demands mental endurance, karmic debt clearance, and humility.`
            : isDhaiya
            ? `Dhaiya phase tests emotional equanimity and domestic stability.`
            : isBenefic
            ? `Victorious Gochar position overcoming obstacles, rewarding rigorous discipline.`
            : `Karmic restructuring across structural goals, demanding patience and precision.`
        }`;

        healthEffect = isBenefic
          ? 'High stamina and strong disease resistance. Chronic complaints stabilize through disciplined lifestyle.'
          : 'Vulnerability in joints, knees, lower back, and teeth. Guard against chronic fatigue and winter chills; practice warm oil massage (Abhyanga).';

        jobEffect = isBenefic
          ? 'Solid career advancement, respect from senior leadership, administrative mastery, and victory over workplace competitors.'
          : 'High workload and pressure from superiors. Avoid impulsive resignations; focus on meticulous execution and punctual delivery.';

        businessEffect = isBenefic
          ? 'Steady, compounding revenue growth. Excellent for long-term manufacturing, heavy industry, real estate, and supply chains.'
          : 'Avoid over-leveraged debt or unverified credit extensions. Focus on cost rationalization and compliance audits.';

        relationEffect = isBenefic
          ? 'Support from seasoned elders, dependable loyalty from associates and staff.'
          : 'Emotional distance with family elders or siblings. Practice humble, non-reactive communication and avoid stubborn stands.';

        marriageEffect = isBenefic
          ? 'Grounded mutual commitment, practical teamwork with spouse on domestic and property goals.'
          : 'Tests of patience in marital harmony. Avoid bringing workplace stress into the home; support spouse’s physical comfort.';

        educationEffect = isBenefic
          ? 'Deep concentration, mastery in law, engineering, history, or research, and disciplined success in competitive exams.'
          : 'Requires extra study hours and patient repetition. Avoid procrastination; structured revision schedules overcome academic delays.';

        mentalStateEffect = isBenefic
          ? 'Grounded emotional maturity, stoic resilience, clear long-term perspective, and freedom from superficial anxieties.'
          : 'Prone to overthinking, heaviness, or self-doubt. Cultivate daily pranayama, gratitude, and consistent restorative sleep.';
        break;
      }

      case 'Guru': {
        const isBenefic = [2, 5, 7, 9, 11].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Transformative';

        specificEffect = `Jupiter in ${planet.rasiName}: Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. ${
          isBenefic
            ? `Supreme Devaguru grace casting auspicious 5th/7th/9th aspects, expanding fortune and wisdom.`
            : `Spiritual maturation phase, turning focus toward advisory roles, ethics, and deeper learning.`
        }`;

        healthEffect = isBenefic
          ? 'Robust vitality, mental peace, and cellular healing. Guard only against weight gain or excessive sweets.'
          : 'Digestive balance and liver health require attention. Eat sattvic meals and avoid heavy, greasy foods.';

        jobEffect = isBenefic
          ? 'Major promotions, honor from institutions, consulting breakthroughs, and benevolent mentorship from top management.'
          : 'Stable employment; ideal time for upgrading certifications, professional exams, and leadership upskilling.';

        businessEffect = isBenefic
          ? 'Excellent commercial expansion, profitable trade partnerships, capital inflows, and brand goodwill.'
          : 'Moderate commercial gains; focus on ethical transparency and value-added client retention rather than aggressive risk.';

        relationEffect = isBenefic
          ? 'Blessed family celebrations, birth or educational milestones for children, harmony with mentors and parents.'
          : 'Respectful, cordial family ties; guidance sought from spiritual counselors or wise elders.';

        marriageEffect = isBenefic
          ? 'High marital bliss, mutual veneration, and shared spiritual pilgrimage. Singles find auspicious matchmaking.'
          : 'Constructive marital dialogue. Encourages mutual philosophical alignment and joint charitable contributions.';

        educationEffect = isBenefic
          ? 'Exceptional academic brilliance, scholarships, higher degree breakthroughs, and blessings from erudite gurus and professors.'
          : 'Steady intellectual growth; favor deep philosophical understanding and self-study over rote memorization.';

        mentalStateEffect = isBenefic
          ? 'Optimistic, serene, and dharmic mindset. High emotional wisdom, inner contentment, and spiritual clarity.'
          : 'Reflective and philosophical mood; guard against complacency or over-idealism in practical matters.';
        break;
      }

      case 'Rahu': {
        const isBenefic = [3, 6, 10, 11].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Transformative';

        specificEffect = `Rahu in ${planet.rasiName} (Axis): Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. Ignites unorthodox ambition, modern tech adoption, and cross-cultural opportunities.`;

        healthEffect = isBenefic
          ? 'Energetic drive and resilience; practice meditation to prevent nervous overstimulation.'
          : 'Psychosomatic stress, irregular sleep patterns, or food allergies. Practice daily Pranayama and grounding barefoot walks.';

        jobEffect = isBenefic
          ? 'Rapid breakthroughs in technology, international client projects, digital media, and unconventional roles.'
          : 'Office politics or sudden management shifts. Keep all project deliverables documented in writing; avoid speculative rumors.';

        businessEffect = isBenefic
          ? 'Lucrative gains from foreign markets, e-commerce, digital advertising, and niche innovations.'
          : 'Beware of get-rich-quick lures or dubious partnership promises. Meticulously verify all contracts and legal terms.';

        relationEffect = isBenefic
          ? 'Expanding diverse networks, beneficial connections with influential modern thinkers and international friends.'
          : 'Potential misunderstandings due to vague communication; ensure total transparency with close family.';

        marriageEffect = isBenefic
          ? 'Dynamic companionship, shared travels to novel destinations, and creative domestic rejuvenation.'
          : 'Avoid sudden emotional impulsiveness or unrealistic expectations; protect the marital bond from outside interference.';

        educationEffect = isBenefic
          ? 'Rapid grasp of cutting-edge technology, AI, coding, foreign languages, and unconventional research fields.'
          : 'Scattered attention or distraction from digital overload. Use strict study timers and verify academic sources.';

        mentalStateEffect = isBenefic
          ? 'Bold, ambitious, and fiercely innovative mindset capable of thinking outside conventional boundaries.'
          : 'Restless thoughts, sudden anxieties, or illusionary worries. Ground the mind daily through meditation and nature walks.';
        break;
      }

      case 'Ketu': {
        const isBenefic = [3, 6, 11].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Transformative';

        specificEffect = `Ketu in ${planet.rasiName}: Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. Mokshakaraka fostering detachment, subtle research intuition, and elimination of clutter.`;

        healthEffect = isBenefic
          ? 'Effective recuperation through holistic therapies, Ayurveda, yoga, and fasting routines.'
          : 'Abdominal sensitivity, viral vulnerability, or unexplained fatigue. Prioritize gut health and clean herbal hydration.';

        jobEffect = isBenefic
          ? 'Exceptional focus for technical debugging, audits, analytical research, and strategic behind-the-scenes problem solving.'
          : 'Apathy toward corporate posturing. Focus on independent mastery of core expertise rather than self-promotion.';

        businessEffect = isBenefic
          ? 'Niche profitability in consulting, analytics, medical goods, software algorithms, or esoteric subjects.'
          : 'Avoid ambiguous oral agreements or uncollateralized credit lines. Keep accounts strictly reconciled.';

        relationEffect = isBenefic
          ? 'Quiet, authentic bonds with true friends; release of superficial social acquaintances.'
          : 'Tendency to withdraw socially. Maintain conscious warmth with maternal relatives and close loved ones.';

        marriageEffect = isBenefic
          ? 'Spiritual bonding with spouse through shared values, meditation, and quiet understanding.'
          : 'Spouse may feel emotional distance; make a conscious effort to share thoughts and offer loving companionship.';

        educationEffect = isBenefic
          ? 'Sharp intuitive grasp of mathematics, occult sciences, spiritual scriptures, coding logic, and deep archival research.'
          : 'Temporary lack of interest in conventional curricula; link studies to deeper meaning and practical application.';

        mentalStateEffect = isBenefic
          ? 'Detached inner peace, sharp meditative focus, and liberation from ego-driven stress.'
          : 'Tendency toward mental isolation or over-detachment. Stay connected with supportive peers and uplifting routines.';
        break;
      }

      case 'Surya': {
        const isBenefic = [3, 6, 10, 11].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Caution';

        specificEffect = `Sun in ${planet.rasiName}: Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. Atmakaraka activating executive authority, social prestige, and public vitality.`;

        healthEffect = isBenefic
          ? 'High vitality, robust cardiovascular circulation, radiant eye health, and high physical stamina.'
          : 'Heat-related issues, eye strain, headaches, or acid reflux. Stay hydrated, avoid midday sun, and offer morning Arghya.';

        jobEffect = isBenefic
          ? 'Direct praise from directors, government sanctions, leadership promotions, and high executive visibility.'
          : 'Watch for ego clashes with senior officials or government bodies. Practice respectful, measured diplomacy.';

        businessEffect = isBenefic
          ? 'High commercial prestige, successful government tenders, authoritative brand equity, and strong sales revenue.'
          : 'Ensure all tax declarations, legal filings, and municipal permits are strictly up to date.';

        relationEffect = isBenefic
          ? 'Honors reflected onto father and family legacy; proud moments in the community.'
          : 'Need to temper authoritative tone with siblings or parents; cultivate gentle humility at home.';

        marriageEffect = isBenefic
          ? 'Warm mutual pride and shared social recognition with spouse.'
          : 'Curb ego or stubborn dominance; ensure spouse’s opinions are respected in domestic decisions.';

        educationEffect = isBenefic
          ? 'High academic distinction, leadership in student bodies, and strong performance in administrative, medical, or political studies.'
          : 'Avoid intellectual arrogance in exams or debates; review foundational concepts with humility and focus.';

        mentalStateEffect = isBenefic
          ? 'Radiant self-confidence, strong willpower, decisive clarity, and courageous moral conviction.'
          : 'Watch for irritability, ego sensitivity, or mental burnout. Practice morning Surya Namaskar and cooling breathwork.';
        break;
      }

      case 'Mangal': {
        const isBenefic = [3, 6, 11].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Caution';

        specificEffect = `Mars in ${planet.rasiName}: Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. High energy, physical courage, property focus, and competitive grit.`;

        healthEffect = isBenefic
          ? 'High athletic stamina, muscular power, and rapid physical recovery from fatigue.'
          : 'Risk of inflammatory flare-ups, cuts, burns, or blood pressure surges. Channel aggression into structured exercise.';

        jobEffect = isBenefic
          ? 'Decisive leadership, victory in competitive interviews or pitches, and swift clearance of backlogged tasks.'
          : 'Friction with colleagues due to impatience or blunt speech. Count to ten before sending reactive emails.';

        businessEffect = isBenefic
          ? 'High-speed execution, breakthroughs in real estate, engineering, logistics, and competitive tenders.'
          : 'Avoid impulsive capital allocation or hasty machinery purchases. Ensure safety protocols are maintained.';

        relationEffect = isBenefic
          ? 'Energetic support for siblings; proactive defense of family interests.'
          : 'Short temper can trigger domestic friction. Cultivate calm listening and physical playfulness.';

        marriageEffect = isBenefic
          ? 'Passionate connection, collaborative home improvement projects, and mutual vitality.'
          : 'Avoid sharp arguments or criticism over petty chores; canalize shared vigor into sports or outdoor outings.';

        educationEffect = isBenefic
          ? 'Sharp competitive edge in entrance exams, engineering, surgery, defense studies, and practical lab work.'
          : 'Avoid rushing through exam papers or study modules; cultivate patience to prevent careless errors.';

        mentalStateEffect = isBenefic
          ? 'Fearless drive, high mental stamina, decisive courage, and zero hesitation under pressure.'
          : 'Heightened impatience, restlessness, or quick frustration. Channel fiery mental energy into structured workouts.';
        break;
      }

      case 'Budha': {
        const isBenefic = [2, 4, 6, 8, 10, 11].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Neutral';

        specificEffect = `Mercury in ${planet.rasiName}: Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. Sharp commercial intellect, quick mathematical calculations, and articulate speech.`;

        healthEffect = isBenefic
          ? 'Alert mental clarity, sound nervous reflexes, and glowing skin complexion.'
          : 'Mental restlessness or eye fatigue from screen time. Practice short digital detox breaks and restorative sleep.';

        jobEffect = isBenefic
          ? 'Outstanding presentations, successful client negotiations, software/accounting praise, and smart workflows.'
          : 'Double-check important emails, spreadsheets, and calendar reminders to prevent minor clerical missteps.';

        businessEffect = isBenefic
          ? 'Strong cash flow cycles, profitable trading, effective marketing funnels, and fruitful client conversations.'
          : 'Verify contract fine-print and payment terms before dispatching goods or services.';

        relationEffect = isBenefic
          ? 'Pleasant humor, joyful reunions with maternal relatives, close friends, and intellectual peers.'
          : 'Avoid playful sarcasm that might be misunderstood by sensitive relatives.';

        marriageEffect = isBenefic
          ? 'Lighthearted companionship, stimulating conversations, and fun outings with spouse.'
          : 'Keep discussions honest and straightforward; avoid over-analyzing spouse’s passing comments.';

        educationEffect = isBenefic
          ? 'Peak intellectual agility, eloquence in writing and debate, and excellence in commerce, mathematics, and IT.'
          : 'Information overload may cause minor confusion; organize notes systematically and focus on one subject at a time.';

        mentalStateEffect = isBenefic
          ? 'Witty, adaptable, curious, and intellectually stimulated mindset with balanced analytical calm.'
          : 'Nervous chatter or over-analysis of minor details. Take regular screen breaks and practice silent mindfulness.';
        break;
      }

      case 'Shukra': {
        const isBenefic = [1, 2, 3, 4, 5, 8, 9, 11, 12].includes(houseFromMoon);
        tone = isBenefic ? 'Auspicious' : 'Neutral';

        specificEffect = `Venus in ${planet.rasiName}: Transits House ${houseFromMoon} from Moon & House ${houseFromLagna} from Lagna. Daityaguru grace bringing artistic beauty, domestic luxury, and diplomatic charm.`;

        healthEffect = isBenefic
          ? 'Radiant vitality, hormonal balance, sound kidney health, and rejuvenated skin.'
          : 'Tendency to overindulge in heavy desserts or luxury foods. Maintain balanced hydration and gentle activity.';

        jobEffect = isBenefic
          ? 'Creative triumph, praise in design, media, human resources, client relations, and diplomatic team consensus.'
          : 'Pleasant work environment; maintain focus on structured output rather than casual socializing.';

        businessEffect = isBenefic
          ? 'Gains in luxury goods, fashion, hospitality, entertainment, vehicles, and aesthetically pleasing products.'
          : 'Keep expense sheets controlled; avoid vanity spending on non-essential decorative upgrades.';

        relationEffect = isBenefic
          ? 'Warmth, pleasant home hospitality, joyful cultural festivals, and gift exchanges with loved ones.'
          : 'Cordial social interactions; maintain respectful personal boundaries with acquaintances.';

        marriageEffect = isBenefic
          ? 'Deep affection, conjugal harmony, romantic dates, and supportive spousal understanding.'
          : 'Express sincere appreciation to spouse; avoid expecting perpetual perfection in domestic arrangements.';

        educationEffect = isBenefic
          ? 'Flowering talent in fine arts, literature, architecture, design, music, media, and diplomatic studies.'
          : 'Balance social leisure and entertainment with dedicated study blocks to maintain academic momentum.';

        mentalStateEffect = isBenefic
          ? 'Harmonious, affectionate, artistically inspired, and emotionally joyful state of mind.'
          : 'Sensory distraction or emotional sentimentality; anchor your daily routine in creative discipline.';
        break;
      }
    }

    return {
      planet: planet.name,
      englishName: planet.englishName,
      symbol: planet.symbol,
      transitSign: `${planet.rasiName} (${planet.degree}°${planet.minute}')`,
      houseFromLagna,
      houseFromMoon,
      motionStatus,
      specificEffect,
      healthEffect,
      jobEffect,
      businessEffect,
      relationEffect,
      marriageEffect,
      educationEffect,
      mentalStateEffect,
      tone,
    };
  });
}

// Vimshottari Mahadasha Planetary Lords Order & Durations
const VIMSHOTTARI_LORDS: { planet: GrahaName; years: number; lifeTheme: string }[] = [
  { planet: 'Ketu', years: 7, lifeTheme: 'Spiritual introspection, detachment from vanity, subtle research & intuitive awakening.' },
  { planet: 'Shukra', years: 20, lifeTheme: 'Aesthetic luxuries, relationships, conjugal harmony, creative and financial growth.' },
  { planet: 'Surya', years: 6, lifeTheme: 'Vitality, executive authority, government recognition, and self-realization.' },
  { planet: 'Chandra', years: 10, lifeTheme: 'Emotional blossoming, motherly care, public popularity, travel, and intuitive clarity.' },
  { planet: 'Mangal', years: 7, lifeTheme: 'High physical stamina, real estate acquisitions, decisive leadership, and competitive grit.' },
  { planet: 'Rahu', years: 18, lifeTheme: 'Unconventional ambitions, modern innovation, material expansions, and cross-cultural pursuits.' },
  { planet: 'Guru', years: 16, lifeTheme: 'Divine wisdom, family auspiciousness, higher learning, counseling, and dharmic abundance.' },
  { planet: 'Shani', years: 19, lifeTheme: 'Discipline, enduring professional status, karmic maturation, and structural permanence.' },
  { planet: 'Budha', years: 17, lifeTheme: 'Intellectual brilliance, commercial trade, writing, communication, and business agility.' },
];

// Calculate Vimshottari Dasha periods based on Natal Moon position
export function calculateVimshottariDasha(
  natalMoonDegreeTotal: number,
  birthDateStr: string = '1990-05-18'
): VimshottariDashaInfo {
  // Each Nakshatra spans 13° 20' = 13.3333°
  const nakshatraSpan = 360 / 27; // 13.333333 degrees
  const normDeg = normalizeDegrees(natalMoonDegreeTotal);
  const nakshatraIndex = Math.floor(normDeg / nakshatraSpan); // 0 to 26
  const degIntoNakshatra = normDeg - nakshatraIndex * nakshatraSpan;
  const fractionElapsed = degIntoNakshatra / nakshatraSpan;

  // Nakshatra Lord follows the 9-planet cycle repeated 3 times (27 nakshatras)
  const lordIndex = nakshatraIndex % 9;
  const birthLordData = VIMSHOTTARI_LORDS[lordIndex];
  const birthLord = birthLordData.planet;
  const totalYears = birthLordData.years;
  const yearsRemaining = Math.max(0.5, totalYears * (1 - fractionElapsed));

  // Determine user's current approximate age
  const dateParts = birthDateStr.split('-').map(Number);
  const birthYear = dateParts[0] || 1990;
  const birthMonth = (dateParts[1] || 5) - 1;
  const birthDay = dateParts[2] || 15;
  const baseBirthDate = new Date(birthYear, birthMonth, birthDay);

  const now = new Date();
  const diffMonths = (now.getFullYear() - baseBirthDate.getFullYear()) * 12 + (now.getMonth() - baseBirthDate.getMonth());
  const currentAge = Math.max(0, diffMonths / 12);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const getMonthYearStr = (date: Date, offsetYears: number) => {
    const d = new Date(date.getTime());
    d.setMonth(d.getMonth() + Math.round(offsetYears * 12));
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Build lifetime sequence of dashas
  const cycle: VimshottariDashaInfo['cycle'] = [];
  let cumAge = 0;

  // First (birth) Mahadasha with balance
  const firstDuration = parseFloat(yearsRemaining.toFixed(1));
  cycle.push({
    planet: birthLord,
    durationYears: firstDuration,
    startAge: 0,
    endAge: firstDuration,
    startMonthYear: getMonthYearStr(baseBirthDate, 0),
    endMonthYear: getMonthYearStr(baseBirthDate, firstDuration),
    lifeTheme: birthLordData.lifeTheme,
  });
  cumAge = yearsRemaining;

  // Subsequent Mahadashas (Full 9-planet sequence)
  let currentActiveLord = birthLord;
  for (let i = 1; i <= 8; i++) {
    const nextLordData = VIMSHOTTARI_LORDS[(lordIndex + i) % 9];
    const startAge = parseFloat(cumAge.toFixed(1));
    const endAge = parseFloat((cumAge + nextLordData.years).toFixed(1));
    const startMonthYear = getMonthYearStr(baseBirthDate, startAge);
    const endMonthYear = getMonthYearStr(baseBirthDate, endAge);

    if (currentAge >= startAge && currentAge < endAge) {
      currentActiveLord = nextLordData.planet;
    }

    cycle.push({
      planet: nextLordData.planet,
      durationYears: nextLordData.years,
      startAge,
      endAge,
      startMonthYear,
      endMonthYear,
      lifeTheme: nextLordData.lifeTheme,
    });
    cumAge += nextLordData.years;
  }

  return {
    birthLord,
    birthLordTotalYears: totalYears,
    yearsRemainingAtBirth: parseFloat(yearsRemaining.toFixed(1)),
    currentLord: currentActiveLord,
    cycle,
  };
}

// Calculate 9 Antardashas (Sub-Periods) within a given Mahadasha
export function calculateAntardashas(
  mahadashaPlanet: GrahaName,
  mahadashaDuration: number,
  startAge: number,
  birthDateStr: string = '1990-05-18'
): AntardashaInfo[] {
  const dateParts = birthDateStr.split('-').map(Number);
  const birthYear = dateParts[0] || 1990;
  const birthMonth = (dateParts[1] || 5) - 1;
  const birthDay = dateParts[2] || 15;
  const baseBirthDate = new Date(birthYear, birthMonth, birthDay);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const getMonthYearStr = (date: Date, offsetYears: number) => {
    const d = new Date(date.getTime());
    d.setMonth(d.getMonth() + Math.round(offsetYears * 12));
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const now = new Date();
  const diffMonths = (now.getFullYear() - baseBirthDate.getFullYear()) * 12 + (now.getMonth() - baseBirthDate.getMonth());
  const currentAge = Math.max(0, diffMonths / 12);

  const lordIndex = VIMSHOTTARI_LORDS.findIndex((item) => item.planet === mahadashaPlanet);
  const baseIdx = lordIndex >= 0 ? lordIndex : 0;

  const antardashas: AntardashaInfo[] = [];
  let curAge = startAge;

  for (let i = 0; i < 9; i++) {
    const subLordData = VIMSHOTTARI_LORDS[(baseIdx + i) % 9];
    const subDurationYears = (mahadashaDuration * subLordData.years) / 120;
    const subEndAge = curAge + subDurationYears;
    const durationMonths = Math.round(subDurationYears * 12 * 10) / 10;
    const durationYearsStr =
      subDurationYears >= 1
        ? `${subDurationYears.toFixed(1)} yrs`
        : `${Math.round(durationMonths)} mos`;

    const startMonthYear = getMonthYearStr(baseBirthDate, curAge);
    const endMonthYear = getMonthYearStr(baseBirthDate, subEndAge);
    const isCurrent = currentAge >= curAge && currentAge < subEndAge;

    const theme = `${mahadashaPlanet}–${subLordData.planet}: ${subLordData.lifeTheme}`;

    antardashas.push({
      planet: subLordData.planet,
      durationMonths,
      durationYearsStr,
      startAge: parseFloat(curAge.toFixed(1)),
      endAge: parseFloat(subEndAge.toFixed(1)),
      startMonthYear,
      endMonthYear,
      isCurrent,
      theme,
    });

    curAge = subEndAge;
  }

  return antardashas;
}

// Get Dasha Lord interaction with Monthly Planetary Changes, Guidance, and Do's & Don'ts
export function getDashaMonthlyPlanetaryGuidance(
  mahadashaLord: GrahaName,
  monthKey: string,
  natalMoonRasi: number,
  natalLagnaRasi: number,
  transitPlanets: PlanetPosition[]
): DashaMonthlyPlanetaryGuidance {
  const monthData =
    ALL_MONTH_WISE_PREDICTIONS.find((m) => m.monthKey === monthKey) ||
    ALL_MONTH_WISE_PREDICTIONS[0];

  // Find transit of the Mahadasha Lord
  const dashaLordTransit =
    transitPlanets.find((p) => p.name === mahadashaLord) || transitPlanets[0];
  const houseFromMoon = ((dashaLordTransit.house - natalMoonRasi + 12) % 12) + 1;
  const houseFromLagna = ((dashaLordTransit.house - natalLagnaRasi + 12) % 12) + 1;

  // Determine synergy
  const isAuspicious =
    [1, 2, 4, 5, 7, 9, 10, 11].includes(houseFromMoon) ||
    [1, 4, 5, 9, 10, 11].includes(houseFromLagna);
  const isChallenging =
    [6, 8, 12].includes(houseFromMoon) && [6, 8, 12].includes(houseFromLagna);

  const synergyTone: DashaMonthlyPlanetaryGuidance['synergyTone'] = isChallenging
    ? 'Caution Required'
    : [1, 5, 9, 11].includes(houseFromMoon)
    ? 'Highly Auspicious'
    : isAuspicious
    ? 'Auspicious'
    : 'Transformative & Demanding';

  const motionStr = dashaLordTransit.isRetrograde ? 'Vakri (Retrograde)' : 'Marga (Direct)';
  const dashaLordStatus = `${mahadashaLord} transits ${dashaLordTransit.rasiName} (${dashaLordTransit.degree}°${dashaLordTransit.minute}') in ${motionStr} motion, occupying House ${houseFromMoon} from Janma Rasi (Moon) and House ${houseFromLagna} from Janma Lagna (Ascendant).`;

  const careerGuidance: Record<string, string> = {
    Surya: 'Solar authority and administrative visibility are heightened. Ideal for presenting executive proposals, pitching high-stakes deals, and seeking recognition from leadership.',
    Chandra: 'Emotional rapport and public relations take precedence. Rely on instinctive business timing and maintain cordial negotiations with associates.',
    Mangal: 'Dynamic drive, decisive energy, and competitive boldness. Favorable for real estate transactions, engineering sprints, and challenging negotiations.',
    Budha: 'Analytical agility, contractual negotiations, and commercial marketing thrive. Superb for drafting new agreements, digital launches, and financial accounting audits.',
    Guru: 'Divine expansion, wisdom-driven investments, and strategic mentorship. Seek counsel from seasoned advisors; educational and consulting ventures receive strong backing.',
    Shukra: 'Aesthetic commerce, creative design, and diplomatic partnerships bring lucrative opportunities. Ensure legal terms are clear before signing joint agreements.',
    Shani: 'Rigorous discipline, patient long-term structuring, and administrative endurance. Favor systematic consolidation over sudden leaps; steady execution yields enduring reputation.',
    Rahu: 'Unconventional avenues, foreign markets, digital innovation, and disruptive business models offer breakthroughs. Stay vigilant against speculative gambles.',
    Ketu: 'Subtle research, specialized investigative focus, and detached problem-solving. Great for behind-the-scenes engineering, coding, and strategic restructuring.',
    Lagna: 'Personal initiative and holistic executive capability drive professional advancement.',
  };

  const relationshipGuidance: Record<string, string> = {
    Surya: 'Balance self-respect with gentleness. Avoid allowing pride or ego clashes to dominate intimate family discussions.',
    Chandra: 'Warm nurturing, emotional bonding, and heart-to-heart conversations with spouse, family, and children bring deep peace.',
    Mangal: 'High passion and protective instinct. Practice conscious patience; avoid arguments regarding domestic arrangements or property chores.',
    Budha: 'Witty, joyful, and intellectually engaging conversations. Excellent for social get-togethers and clarifying mutual expectations.',
    Guru: 'Family blessings, philosophical harmony, and supportive elder guidance. Ideal time for family rituals, sanctum visits, and spiritual discussions.',
    Shukra: 'Romantic magnetism, conjugal warmth, shared celebratory meals, and joyful gifts. Reconnect intimately with your spouse.',
    Shani: 'Practical companionship and loyal support in daily duties. Express heartfelt affection verbally rather than relying solely on silent service.',
    Rahu: 'Exciting social circles and meeting new friends from diverse backgrounds. Guard against unrealistic expectations in personal ties.',
    Ketu: 'Quiet introspection and soul-level loyalty. Give each other breathing space and avoid overanalyzing minor relational nuances.',
    Lagna: 'Natural charisma and presence bring warmth to all family circles.',
  };

  const healthGuidance: Record<string, string> = {
    Surya: 'Support heart vitality, spine posture, and eye wellness. Take early morning sun baths and drink copper-charged water.',
    Chandra: 'Keep lymphatic hydration balanced and maintain steady sleep cycles. Guard against emotional stress and digestive sluggishness.',
    Mangal: 'Channel vigorous energy through strength workouts or martial arts. Guard against muscle sprains, inflammation, and excess body heat with cooling herbs.',
    Budha: 'Calm the nervous system with evening digital detoxes and Pranayama (Anulom-Vilom). Pay attention to shoulders and bronchial comfort.',
    Guru: 'Maintain liver and metabolic health. Moderate consumption of rich sweets or heavy dairy; embrace yellow turmeric teas.',
    Shukra: 'Nurture kidneys, urinary tract, and endocrine wellness. Stay well hydrated and enjoy gentle yoga and dance.',
    Shani: 'Guard joints, knees, and lower back against stiffness. Incorporate daily warm sesame oil (Abhyanga) massages and gentle stretches.',
    Rahu: 'Keep sleep environment free of electronic radiation. Avoid irregular late-night snacking and maintain a grounded sattvic diet.',
    Ketu: 'Protect gut flora and subtle nervous resilience. Practice grounding meditation and barefoot walking on dewy grass.',
    Lagna: 'High overall constitutional vitality; balance physical exertion with restorative sleep.',
  };

  const spiritualGuidance: Record<string, string> = {
    Surya: 'Recite Aditya Hridaya Stotra on Sundays at dawn facing East. Offer Arghya with water and red kumkum to Lord Surya.',
    Chandra: 'Chant Om Som Somaya Namah on Monday evenings or worship Lord Shiva with Somwar Pradosham prayers.',
    Mangal: 'Chant Hanuman Chalisa or Mangal Gayatri. Support brothers, soldiers, or emergency workers with respectful aid.',
    Budha: 'Chant Vishnu Sahasranama on Wednesdays and feed green grass/spinach to cows.',
    Guru: 'Recite Guru Paduka Stotram, Brihaspati Gayatri, or Guru Gita. Sponsor educational books for needy students on Thursdays.',
    Shukra: 'Recite Sri Suktam or Mahalakshmi Ashtakam on Fridays and light a ghee lamp at the altar.',
    Shani: 'Chant Hanuman Chalisa, Shani Gayatri, or Maha Mrityunjaya Mantra on Saturdays. Donate black sesame or mustard oil.',
    Rahu: 'Chant Om Rang Rahave Namah or recite Durga Saptashati Chapter 4. Donate whole wheat or coconuts on Saturdays.',
    Ketu: 'Worship Lord Ganesha with Sankat Nashan Ganesha Stotra. Donate warm blankets or multi-colored cloth to the needy.',
    Lagna: 'Engage in silent Gayatri Mantra contemplation during Brahma Muhurta.',
  };

  // Combine monthly planetary changes
  const keyPlanetaryChanges = [
    {
      planet: mahadashaLord,
      event: `${mahadashaLord} (Your Active Dasha Lord) Gochar in ${dashaLordTransit.rasiName}`,
      date: 'Active Throughout Month',
      impactSummary: `${mahadashaLord} activates House ${houseFromMoon} from Moon and House ${houseFromLagna} from Lagna, setting your primary karmic backdrop.`,
    },
    ...monthData.planetaryMovements,
  ];

  return {
    monthKey: monthData.monthKey,
    monthName: monthData.monthName,
    mahadashaLord,
    dashaLordTransitSign: `${dashaLordTransit.rasiName} (${dashaLordTransit.degree}°${dashaLordTransit.minute}')`,
    dashaLordHouseFromMoon: houseFromMoon,
    dashaLordHouseFromLagna: houseFromLagna,
    dashaLordStatus,
    synergyTone,
    keyPlanetaryChanges,
    guidance: {
      careerAndFinances: `${careerGuidance[mahadashaLord] || ''} ${monthData.careerWealthForecast}`,
      relationshipsAndFamily: `${relationshipGuidance[mahadashaLord] || ''} ${monthData.loveFamilyForecast}`,
      healthAndVitality: `${healthGuidance[mahadashaLord] || ''} ${monthData.healthVitalityForecast}`,
      spiritualAndKarmic: `${spiritualGuidance[mahadashaLord] || ''} ${monthData.spiritualForecast}`,
    },
    dos: [
      `Align key initiatives with ${mahadashaLord}'s natural strengths during this transit.`,
      ...monthData.dos,
    ],
    donts: [
      `Avoid disregarding the structural warnings of your ${mahadashaLord} period.`,
      ...monthData.donts,
    ],
    favorableDays: monthData.favorableDays,
    cautionDays: monthData.cautionDays,
    monthlyRemedy: `${spiritualGuidance[mahadashaLord] || ''} In addition: ${monthData.remedyOfMonth}`,
  };
}

// Calculate Natal Yogas Formed at Birth
export function calculateNatalYogas(
  natalLagnaRasi: number,
  natalPlanets: PlanetPosition[]
): NatalYoga[] {
  const yogas: NatalYoga[] = [];

  const sun = natalPlanets.find((p) => p.name === 'Surya');
  const moon = natalPlanets.find((p) => p.name === 'Chandra');
  const mars = natalPlanets.find((p) => p.name === 'Mangal');
  const mercury = natalPlanets.find((p) => p.name === 'Budha');
  const jupiter = natalPlanets.find((p) => p.name === 'Guru');
  const venus = natalPlanets.find((p) => p.name === 'Shukra');
  const saturn = natalPlanets.find((p) => p.name === 'Shani');

  // 1. Budhaditya Yoga (Sun + Mercury in same rasi)
  if (sun && mercury && sun.rasiNumber === mercury.rasiNumber) {
    yogas.push({
      name: 'Budhaditya Yoga',
      sanskritName: 'बुधादित्य योग',
      planetsInvolved: ['Surya', 'Budha'],
      auspiciousness: 'High Raja Yoga',
      effect: `Formed by Sun and Mercury together in ${sun.rasiName} (House ${sun.house}). Confers sharp analytical acumen, rapid grasping power, eloquent communication, and high administrative skill.`,
    });
  }

  // 2. Gajakesari Yoga (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  if (moon && jupiter) {
    const diff = ((jupiter.rasiNumber - moon.rasiNumber + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(diff)) {
      yogas.push({
        name: 'Gajakesari Yoga',
        sanskritName: 'गजकेसरी योग',
        planetsInvolved: ['Guru', 'Chandra'],
        auspiciousness: 'High Raja Yoga',
        effect: `Jupiter in Kendra (${diff}th) from natal Moon. A celebrated classical yoga granting spotless reputation, natural wisdom, commanding oratory, and lasting societal honor.`,
      });
    }
  }

  // 3. Chandra-Mangal Yoga (Moon + Mars in same house or mutual aspect)
  if (moon && mars) {
    if (moon.rasiNumber === mars.rasiNumber) {
      yogas.push({
        name: 'Chandra-Mangal Yoga',
        sanskritName: 'चन्द्र-मङ्गल योग',
        planetsInvolved: ['Chandra', 'Mangal'],
        auspiciousness: 'Auspicious Dhana Yoga',
        effect: `Conjunction of Moon and Mars in House ${moon.house}. Grants strong financial drive, swift commercial instinct, real estate blessings, and relentless competitive energy.`,
      });
    }
  }

  // 4. Amala Yoga (Benefics Jupiter, Venus, or Mercury in 10th House from Lagna or Moon)
  const planetsIn10th = natalPlanets.filter((p) => p.house === 10);
  const beneficIn10th = planetsIn10th.filter((p) => ['Guru', 'Shukra', 'Budha'].includes(p.name));
  if (beneficIn10th.length > 0) {
    yogas.push({
      name: 'Amala Yoga',
      sanskritName: 'अमल योग',
      planetsInvolved: beneficIn10th.map((p) => p.name),
      auspiciousness: 'High Raja Yoga',
      effect: `Benefic planet (${beneficIn10th.map((p) => p.englishName).join(', ')}) occupying the 10th house of Karma. Confers spotless professional integrity, benevolent authority, and benevolent public standing.`,
    });
  }

  // 5. Kendra-Trikona Raja Yoga (Lords of Kendra and Trikona harmoniously placed)
  yogas.push({
    name: 'Dharma-Karmadhipati Synergy',
    sanskritName: 'धर्म-कर्माधिपति राजयोग',
    planetsInvolved: ['Lagna Lord', '9th Lord', '10th Lord'],
    auspiciousness: 'High Raja Yoga',
    effect: `Harmonious interplay between the houses of Fortune (9th) and Profession (10th). Provides steady opportunities to convert dharmic vision into recognized vocational accomplishments.`,
  });

  // 6. Saraswati Yoga or Lakshmi Yoga
  if (jupiter && venus) {
    yogas.push({
      name: 'Saraswati & Shubha Yoga',
      sanskritName: 'सरस्वती योग',
      planetsInvolved: ['Guru', 'Shukra', 'Budha'],
      auspiciousness: 'Spiritual Yoga',
      effect: 'Fosters artistic appreciation, philosophical depth, refined speech, and lifelong devotion to spiritual and cultural learning.',
    });
  }

  return yogas;
}

// Calculate House-by-House Life Predictions from Native's Birth Time
export function calculateBirthTimeHousePredictions(
  natalLagnaRasi: number,
  natalPlanets: PlanetPosition[]
): BirthTimeHousePrediction[] {
  const houseDomains: {
    domain: BirthTimeHousePrediction['lifeDomain'];
    vedicName: string;
    karaka: string;
    headlineTemplate: string;
    predictionBase: string;
  }[] = [
    {
      domain: 'Self & Vitality',
      vedicName: 'Tanu Bhava (1st House)',
      karaka: 'Surya (Sun)',
      headlineTemplate: 'Constitution, Vitality & Life Direction',
      predictionBase: 'Governs self-identity, physical vitality, immune constitution, and basic orientation toward life.',
    },
    {
      domain: 'Wealth & Speech',
      vedicName: 'Dhana Bhava (2nd House)',
      karaka: 'Guru (Jupiter)',
      headlineTemplate: 'Accumulated Wealth, Speech & Family Lineage',
      predictionBase: 'Influences personal assets, banking liquidity, truthfulness of speech, family heritage, and food habits.',
    },
    {
      domain: 'Courage & Skills',
      vedicName: 'Sahaja Bhava (3rd House)',
      karaka: 'Mangal (Mars)',
      headlineTemplate: 'Valour, Initiatives & Fine Skills',
      predictionBase: 'Directs manual dexterity, entrepreneurial ventures, writing, siblings, and short-distance travel.',
    },
    {
      domain: 'Home & Emotional Peace',
      vedicName: 'Sukha Bhava (4th House)',
      karaka: 'Chandra (Moon) & Shukra (Venus)',
      headlineTemplate: 'Inner Peace, Mother & Property',
      predictionBase: 'Rules maternal bond, domestic tranquility, vehicles, real estate, and inner emotional sanctuary.',
    },
    {
      domain: 'Intellect & Children',
      vedicName: 'Putra Bhava (5th House)',
      karaka: 'Guru (Jupiter)',
      headlineTemplate: 'Purva Punya, Intellect & Progeny',
      predictionBase: 'Governs creative spark, analytical intelligence, past-life karmic rewards, mantra recitation, and children.',
    },
    {
      domain: 'Health & Competition',
      vedicName: 'Ari Bhava (6th House)',
      karaka: 'Mangal & Shani',
      headlineTemplate: 'Obstacle Mastery, Immunity & Service',
      predictionBase: 'Determines disease resistance, triumph over workplace competition, day-to-day service, and debt clearance.',
    },
    {
      domain: 'Marriage & Partnership',
      vedicName: 'Yuvati Bhava (7th House)',
      karaka: 'Shukra (Venus)',
      headlineTemplate: 'Marital Bond, Spousal Temperament & Trade',
      predictionBase: 'Governs spouse’s character, marital longevity, legal contracts, business partnerships, and public relations.',
    },
    {
      domain: 'Longevity & Secrets',
      vedicName: 'Randhra Bhava (8th House)',
      karaka: 'Shani (Saturn)',
      headlineTemplate: 'Transformations, Occult & Longevity',
      predictionBase: 'Rules deep life transformations, unearned wealth, research intuition, longevity, and psychological regeneration.',
    },
    {
      domain: 'Fortune & Dharma',
      vedicName: 'Dharma Bhava (9th House)',
      karaka: 'Guru (Jupiter) & Surya',
      headlineTemplate: 'Bhagya (Luck), Higher Truth & Father',
      predictionBase: 'Governs higher wisdom, pilgrimage, paternal blessings, spiritual mentors, and righteous fortune.',
    },
    {
      domain: 'Career & Profession',
      vedicName: 'Karma Bhava (10th House)',
      karaka: 'Surya, Budha, Guru, Shani',
      headlineTemplate: 'Vocation, Leadership & Social Dignity',
      predictionBase: 'Governs professional zenith, executive leadership, public recognition, authority, and life purpose achievement.',
    },
    {
      domain: 'Gains & Aspirations',
      vedicName: 'Labha Bhava (11th House)',
      karaka: 'Guru (Jupiter)',
      headlineTemplate: 'Financial Gains, Network Circle & Desires',
      predictionBase: 'Controls steady streams of profit, fulfillment of long-cherished hopes, elder siblings, and trusted alliances.',
    },
    {
      domain: 'Moksha & Foreign',
      vedicName: 'Vyaya Bhava (12th House)',
      karaka: 'Ketu & Shani',
      headlineTemplate: 'Spiritual Liberation, Solitude & Foreign Horizons',
      predictionBase: 'Influences meditative detachment, charitable donations, dream state, foreign connections, and final liberation.',
    },
  ];

  return houseDomains.map((item, idx) => {
    const houseNumber = idx + 1;
    const signNumber = ((natalLagnaRasi - 1 + houseNumber - 1) % 12) + 1;
    const sign = VEDIC_RASIS[signNumber - 1];
    const signName = sign?.sanskritName || 'Mesha';
    const signLord = sign?.lord || 'Mars';

    // Check which planets are in this house
    const planetsInHouse = natalPlanets.filter((p) => p.house === houseNumber);
    const planetsHere = planetsInHouse.map((p) => `${p.englishName} (${p.name})`);

    let strengthScore = 4;
    let prediction = `${item.predictionBase} With ${signName} on the cusp ruled by ${signLord}, this house exhibits grounded strength. `;

    if (planetsInHouse.length > 0) {
      strengthScore = 5;
      const names = planetsInHouse.map((p) => p.englishName).join(', ');
      prediction += `The presence of ${names} adds dynamic potency here, intensifying your focus and personal capabilities in this area of life.`;
    } else {
      prediction += `While no natal planets occupy this house directly, the aspects of ${signLord} and Kendra benefics support steady progress through conscious effort.`;
    }

    // Bhrigu Samhita & Lal Kitab House-specific data
    const bhriguHouseData: Record<number, { age: string; baseReading: string }> = {
      1: {
        age: 'Years 1, 22 & 28 (Self & Sun/Mars Cycle)',
        baseReading: 'Maharishi Bhrigu declares the 1st Bhava as the seat of Purva-Janma Samskara (past-life character). Dignity and self-reliance rise steadily after your 22nd year through righteous leadership.',
      },
      2: {
        age: 'Years 16, 24 & 36 (Dhana & Kutumba Cycle)',
        baseReading: 'In Bhrigu Sutras, the 2nd Bhava governs the treasury of speech (Vak-Shakti) and lineage wealth. Financial consolidation accelerates when truth and family harmony are upheld.',
      },
      3: {
        age: 'Years 28 & 32 (Parakrama & Brothers Cycle)',
        baseReading: 'Bhrigu Samhita highlights the 3rd Bhava as the crucible of personal initiative (Swashraya). Courageous ventures and skill mastery bring self-made recognition after age 28.',
      },
      4: {
        age: 'Years 24 & 34 (Sukha & Bhoomi Cycle)',
        baseReading: 'According to Bhrigu Nadi, the 4th Bhava holds maternal blessings and landed sanctuary. Emotional contentment and permanent property manifest strongly around the 24th and 34th years.',
      },
      5: {
        age: 'Years 16, 22 & 32 (Purva Punya & Vidya Cycle)',
        baseReading: 'Bhrigu Samhita venerates the 5th Bhava as the reservoir of past-life merit (Sanchita Punya). Mantra Siddhi, intuitive intelligence, and pride through progeny blossom here.',
      },
      6: {
        age: 'Years 32, 36 & 42 (Shatru-Jaya & Seva Cycle)',
        baseReading: 'In Bhriguhora, the 6th Bhava transforms obstacles into stepping stones through selfless service (Nishkama Seva). Competitors yield when discipline and ethical conduct are maintained.',
      },
      7: {
        age: 'Years 25 & 33 (Kalatra & Trade Cycle)',
        baseReading: 'Maharishi Bhrigu states that the 7th Bhava mirrors the soul’s sacred partnership contract.Bhagyodaya (fortune rise) accelerates significantly after marriage or key alliances around age 25.',
      },
      8: {
        age: 'Years 36, 42 & 48 (Ayur & Gupta-Vidya Cycle)',
        baseReading: 'Bhrigu Samhita reveals the 8th Bhava as the cavern of hidden knowledge, sudden karmic inheritances, and spiritual regeneration. Deep intuition protects you through life transitions.',
      },
      9: {
        age: 'Years 16, 24 & 30 (Bhagya & Guru-Kripa Cycle)',
        baseReading: 'The 9th Bhava is praised in Bhrigu Samhita as the pillar of Divine Grace (Daiva-Bala). Paternal blessings, dharmic pilgrimages, and guru guidance unlock effortless fortune.',
      },
      10: {
        age: 'Years 22, 32 & 36 (Rajya & Karma Cycle)',
        baseReading: 'Bhrigu Nadi proclaims the 10th Bhava as the zenith of worldly Karma. Authority, institutional honor, and lasting professional legacy crystallize between ages 32 and 36.',
      },
      11: {
        age: 'Years 32, 36 & 42 (Labha & Siddhi Cycle)',
        baseReading: 'In Bhrigu Samhita, the 11th Bhava fulfills cherished sankalpas (aspirations) and rewards past generosity with multiple streams of abundance and influential allies.',
      },
      12: {
        age: 'Years 42, 48 & 54 (Moksha & Deshantar Cycle)',
        baseReading: 'Maharishi Bhrigu describes the 12th Bhava as the threshold of liberation and distant horizons. Charitable giving (Daan) converts potential losses into spiritual protection and foreign gains.',
      },
    };

    const lalKitabHouseData: Record<number, { pakkaLord: string; baseReading: string; upay: string }> = {
      1: {
        pakkaLord: 'Surya (Sun) — Throne (Singhasan)',
        baseReading: 'In Lal Kitab, Khana No. 1 is the royal throne of the horoscope. Planets seated here act as the king of the annual & natal chart, directly shaping the 7th house opposite.',
        upay: 'Offer jaggery (Gud) or wheat at a sacred place on Sundays; apply a saffron (Kesar) tilak on the forehead daily.',
      },
      2: {
        pakkaLord: 'Guru (Jupiter) — Dharam Sthana',
        baseReading: 'Lal Kitab designates Khana No. 2 as the sacred temple (Dharam Sthana) owned by Jupiter and energized by the Northwest wind. It receives direct drishti from the 8th house.',
        upay: 'Apply saffron or turmeric tilak on the navel and forehead; offer chana dal at a temple and respect family elders.',
      },
      3: {
        pakkaLord: 'Mangal (Mars) — Valor & Siblings Gate',
        baseReading: 'In Lal Kitab, Khana No. 3 governs courage, siblings, and the threshold of longevity. Its strength protects the 9th house of fortune and clears ancestral blockages.',
        upay: 'Distribute sweet rotis to birds/dogs, keep an ivory or silver piece at home, and maintain warm ties with brothers/siblings.',
      },
      4: {
        pakkaLord: 'Chandra (Moon) — Maternal Dariya',
        baseReading: 'Lal Kitab calls Khana No. 4 the river of peace and motherly blessings (Chandra ka Pakka Ghar). Purity of heart and respect for the mother keep the 10th house of career thriving.',
        upay: 'Keep a silver vessel filled with pure water or rice in the home; offer milk or kheer to motherly figures on Mondays.',
      },
      5: {
        pakkaLord: 'Guru & Surya — Lineage & Future',
        baseReading: 'In Lal Kitab, Khana No. 5 is the seat of progeny, solar radiance, and honest wealth. How you nurture children and truth directly determines your peace of mind.',
        upay: 'Keep the kitchen and East wall clean; feed cows green fodder or jaggery and never break promises made to children.',
      },
      6: {
        pakkaLord: 'Budha & Ketu — Patala / Karmic Ledger',
        baseReading: 'Lal Kitab views Khana No. 6 as the house of hidden subterranean balance where Mercury and Ketu test alertness. Planets here awaken the 12th house of comfort when appeased.',
        upay: 'Feed birds soaked green moong and offer rotis to street dogs; gift flowers or stationery to young girls (Kanyas).',
      },
      7: {
        pakkaLord: 'Shukra & Budha —Grihastha Chakki',
        baseReading: 'In Lal Kitab, Khana No. 7 is the millstone of worldly life where Venus (soil/wealth) and Mercury (rotation) grind together to sustain domestic prosperity.',
        upay: 'Serve brown/black cows with green fodder on Fridays; keep the bedroom clutter-free and honor your spouse.',
      },
      8: {
        pakkaLord: 'Mangal & Shani — Justice & Longevity',
        baseReading: 'Lal Kitab describes Khana No. 8 as the chamber of karmic justice looking directly at the 2nd house of wealth. Honesty and charity turn its fiery trials into sudden protection.',
        upay: 'Offer sweet rotis cooked on a clay/iron tawa to needy people or dogs on Saturdays; avoid taking unjust favors.',
      },
      9: {
        pakkaLord: 'Guru (Jupiter) — Samundar (Ocean of Luck)',
        baseReading: 'In Lal Kitab, Khana No. 9 is the vast ocean of ancestral Punya and Jupiterian grace. When activated by respect for traditions, it floods the entire chart with fortune.',
        upay: 'Visit temples regularly, honor ancestral traditions, and float a little rice or turmeric in running water on Thursdays.',
      },
      10: {
        pakkaLord: 'Shani (Saturn) — Karma Maidan',
        baseReading: 'Lal Kitab crowns Khana No. 10 as Saturn’s field of action. Here shrewdness and hard work rule; its fruit depends on the purity of the 4th house and vigilance of the 2nd.',
        upay: 'Feed visually impaired or elderly people on Saturdays; keep the West corner of your home organized and well-maintained.',
      },
      11: {
        pakkaLord: 'Guru & Shani — Worldly Court',
        baseReading: 'In Lal Kitab, Khana No. 11 is the court where income, character, and destiny are weighed between Jupiter’s wisdom and Saturn’s justice.',
        upay: 'Drop a few drops of mustard oil on the ground before auspicious work on Saturdays; donate yellow fruits at a sanctuary.',
      },
      12: {
        pakkaLord: 'Guru & Rahu — Restful Sanctuary',
        baseReading: 'Lal Kitab defines Khana No. 12 as the peaceful bedroom where Rahu’s mental waves must bow to Jupiter’s calm wisdom for sound sleep and spiritual bliss.',
        upay: 'Keep a small square piece of silver or saunf (fennel seeds) under the pillow for restful sleep; feed birds daily.',
      },
    };

    const bData = bhriguHouseData[houseNumber] || bhriguHouseData[1];
    const lkData = lalKitabHouseData[houseNumber] || lalKitabHouseData[1];

    const occupantSuffixBhrigu =
      planetsInHouse.length > 0
        ? ` With ${planetsInHouse.map((p) => p.englishName).join(' & ')} seated in ${signName}, Bhrigu Nadi indicates heightened karmic focus and decisive life events during their antardasha and transit over this sign.`
        : ` As an unoccupied sign (${signName}), Bhrigu Sutras trace its fruits through the placement of ${signLord}, yielding steady, unobstructed results.`;

    const occupantSuffixLalKitab =
      planetsInHouse.length > 0
        ? ` Presence of ${planetsInHouse.map((p) => p.englishName).join(' & ')} in Khana No. ${houseNumber} makes this house "Jaagrit" (Awakened), actively broadcasting its energy across the chart.`
        : ` Khana No. ${houseNumber} is "Khali" (Unoccupied/Peaceful); in Lal Kitab, a sleeping house remains protected and activates harmoniously through its Pakka Ghar lord (${lkData.pakkaLord.split('—')[0].trim()}).`;

    return {
      houseNumber,
      vedicName: item.vedicName,
      signName,
      signLord,
      karaka: item.karaka,
      planetsHere,
      headline: `${item.headlineTemplate} in ${signName}`,
      prediction,
      bhriguSamhitaReading: `${bData.baseReading}${occupantSuffixBhrigu}`,
      bhriguActivationAge: bData.age,
      lalKitabReading: `${lkData.baseReading}${occupantSuffixLalKitab}`,
      lalKitabPakkaGharLord: lkData.pakkaLord,
      lalKitabUpay: lkData.upay,
      lifeDomain: item.domain,
      strengthScore,
    };
  });
}

// Comprehensive Bhrigu Samhita & Lal Kitab Synthesis
export function calculateBhriguAndLalKitab(
  natalLagnaRasi: number,
  natalPlanets: PlanetPosition[]
): BhriguLalKitabSummary {
  const moon = natalPlanets.find((p) => p.name === 'Chandra') || natalPlanets[0];
  const rahu = natalPlanets.find((p) => p.name === 'Rahu') || natalPlanets[0];
  const jupiter = natalPlanets.find((p) => p.name === 'Guru');
  const saturn = natalPlanets.find((p) => p.name === 'Shani');
  const venus = natalPlanets.find((p) => p.name === 'Shukra');
  const sun = natalPlanets.find((p) => p.name === 'Surya');
  const ketu = natalPlanets.find((p) => p.name === 'Ketu');

  // 1. Calculate Bhrigu Bindu (Midpoint from Rahu to Moon progressing forward)
  const moonLon = ((moon?.rasiNumber || 1) - 1) * 30 + (moon?.degree || 0) + (moon?.minute || 0) / 60;
  const rahuLon = ((rahu?.rasiNumber || 1) - 1) * 30 + (rahu?.degree || 0) + (rahu?.minute || 0) / 60;
  const arcRahuToMoon = (moonLon - rahuLon + 360) % 360;
  const binduLon = normalizeDegrees(rahuLon + arcRahuToMoon / 2);

  const binduRasiNumber = Math.floor(binduLon / 30) + 1;
  const binduRasiName = (VEDIC_RASIS[binduRasiNumber - 1]?.sanskritName || 'Mesha') as VedicRasiName;
  const binduDegRem = binduLon % 30;
  const binduDegree = Math.floor(binduDegRem);
  const binduMinute = Math.round((binduDegRem - binduDegree) * 60);
  const binduHouseFromLagna = ((binduRasiNumber - natalLagnaRasi + 12) % 12) + 1;
  const binduHouseFromMoon = ((binduRasiNumber - (moon?.rasiNumber || 1) + 12) % 12) + 1;

  const binduDomainMap: Record<number, string> = {
    1: 'personal rise, vitality, and new identity milestones',
    2: 'wealth accumulation, family expansion, and financial security',
    3: 'bold initiatives, siblings, travel, and communication breakthroughs',
    4: 'property acquisition, vehicles, and deep domestic peace',
    5: 'creative recognition, academic success, and blessings of progeny',
    6: 'triumph over competition, debt resolution, and health recovery',
    7: 'marriage, sacred partnerships, and public commercial expansion',
    8: 'sudden financial windfalls, research breakthroughs, and spiritual awakening',
    9: 'dharmic fortune, long-distance pilgrimage, and mentor blessings',
    10: 'career elevation, institutional authority, and public honor',
    11: 'major income surges, network expansion, and fulfillment of desires',
    12: 'foreign settlement, spiritual retreats, and charitable fulfillment',
  };

  const bhriguBindu = {
    rasiName: binduRasiName,
    rasiNumber: binduRasiNumber,
    degree: binduDegree,
    minute: binduMinute,
    houseFromLagna: binduHouseFromLagna,
    houseFromMoon: binduHouseFromMoon,
    interpretation: `Your sensitive Bhrigu Bindu (Rahu–Moon destiny midpoint) falls at ${binduDegree}°${binduMinute}' ${binduRasiName} in House ${binduHouseFromLagna} from Lagna (House ${binduHouseFromMoon} from Moon). Whenever benefic Guru (Jupiter) or Shukra (Venus) transits ${binduRasiName} or aspects it, you experience rapid destiny fulfillment in ${binduDomainMap[binduHouseFromLagna] || 'key life areas'}.`,
  };

  const lagnaName = VEDIC_RASIS[natalLagnaRasi - 1]?.sanskritName || 'Mesha';
  const karmicBlueprint = `According to Maharishi Bhrigu Samhita, a native born with ${lagnaName} Lagna and Chandra in ${moon?.rasiName || 'Simha'} (${moon?.nakshatra || 'Magha'} Nakshatra) carries the past-life samskara of a dharmic administrator and seeker of truth. With Ketu in House ${ketu?.house || 1} and Guru in House ${jupiter?.house || 5}, you bring innate intuitive wisdom from previous incarnations, destined to uplift your family lineage and achieve self-realization through righteous action (Karma Yoga).`;

  // 2. Bhrigu Chakra Progressive Activation Ages (Naisargika Bhagyodaya Years)
  const bhagyodayaAges = [
    {
      age: 16,
      planet: 'Guru (Jupiter)',
      house: jupiter?.house || 5,
      milestone: `Intellectual awakening, foundational education & dharmic direction via House ${jupiter?.house || 5}.`,
    },
    {
      age: 22,
      planet: 'Surya (Sun)',
      house: sun?.house || 1,
      milestone: `Self-identity, independent authority & career initiation via House ${sun?.house || 1}.`,
    },
    {
      age: 24,
      planet: 'Chandra (Moon)',
      house: moon?.house || 4,
      milestone: `Emotional maturity, domestic shifts & travel opportunities via House ${moon?.house || 4}.`,
    },
    {
      age: 25,
      planet: 'Shukra (Venus)',
      house: venus?.house || 7,
      milestone: `Marriage, partnership harmony, vehicles & aesthetic prosperity via House ${venus?.house || 7}.`,
    },
    {
      age: 28,
      planet: 'Mangal (Mars)',
      house: natalPlanets.find((p) => p.name === 'Mangal')?.house || 3,
      milestone: `Property acquisition, courageous enterprise & decisive rise via House ${natalPlanets.find((p) => p.name === 'Mangal')?.house || 3}.`,
    },
    {
      age: 32,
      planet: 'Budha (Mercury)',
      house: natalPlanets.find((p) => p.name === 'Budha')?.house || 10,
      milestone: `Commercial peak, analytical mastery & financial expansion via House ${natalPlanets.find((p) => p.name === 'Budha')?.house || 10}.`,
    },
    {
      age: 36,
      planet: 'Shani (Saturn)',
      house: saturn?.house || 11,
      milestone: `Enduring career stability, leadership consolidation & karmic rewards via House ${saturn?.house || 11}.`,
    },
    {
      age: 42,
      planet: 'Rahu (North Node)',
      house: rahu?.house || 6,
      milestone: `Sudden elevation, unconventional success & global reach via House ${rahu?.house || 6}.`,
    },
    {
      age: 48,
      planet: 'Ketu (South Node)',
      house: ketu?.house || 12,
      milestone: `Spiritual culmination, intuitive mastery & advisory prestige via House ${ketu?.house || 12}.`,
    },
  ];

  // 3. Lal Kitab Rina (Ancestral / Karmic Debts) Evaluation
  const pitriTrigger = [2, 5, 9, 12].some((h) =>
    natalPlanets.some((p) => ['Rahu', 'Ketu', 'Shani'].includes(p.name) && p.house === h)
  );
  const matriTrigger = natalPlanets.some((p) => ['Rahu', 'Ketu'].includes(p.name) && p.house === 4);
  const streeTrigger = natalPlanets.some((p) => ['Rahu', 'Ketu', 'Surya'].includes(p.name) && [2, 7].includes(p.house));
  const swaTrigger = natalPlanets.some((p) => ['Shukra', 'Shani', 'Rahu'].includes(p.name) && p.house === 5);

  const lalKitabRina: BhriguLalKitabSummary['lalKitabRina'] = [
    {
      name: 'Pitri Rina (Ancestral & Guru Debt)',
      status: pitriTrigger ? 'Active Caution' : 'Harmonized',
      reason: pitriTrigger
        ? 'Nodes/Saturn influence Jupiter’s domains (Houses 2, 5, 9, or 12), indicating ancestral traditions require conscious honoring.'
        : 'Jupiter’s dharmic houses are well-supported, conferring strong ancestral blessings.',
      upay: 'Collect a small coin contribution from all family members and donate to a temple or charitable dharamshala on a Thursday.',
    },
    {
      name: 'Matri Rina (Maternal & Emotional Debt)',
      status: matriTrigger ? 'Active Caution' : 'Harmonized',
      reason: matriTrigger
        ? 'Shadow planet in Khana No. 4 (Moon’s Pakka Ghar) calls for extra care toward mother’s health and domestic peace.'
        : 'Khana No. 4 is free from nodal affliction, preserving maternal grace and mental tranquility.',
      upay: 'Keep a small silver coin or square piece of silver in pure water and serve mothers/elder women with respect.',
    },
    {
      name: 'Stree Rina (Spousal & Lakshmi Debt)',
      status: streeTrigger ? 'Active Caution' : 'Harmonized',
      reason: streeTrigger
        ? 'Fiery or shadow influence on Khana No. 2 or 7 highlights the importance of honoring spouse and women in the family.'
        : 'Venusian houses of wealth and partnership enjoy balanced harmony.',
      upay: 'Feed green fodder or jaggery to cows on Fridays and maintain harmony and generosity toward your life partner.',
    },
    {
      name: 'Swa-Rina (Self & Purva-Punya Debt)',
      status: swaTrigger ? 'Active Caution' : 'Harmonized',
      reason: swaTrigger
        ? 'Planetary placement in Khana No. 5 reminds you never to neglect daily spiritual sadhana and truthfulness.'
        : 'Solar 5th Khana radiates clear vitality and unobstructed personal merit.',
      upay: 'Offer water to the rising Sun daily and feed ruby-colored jaggery or wheat to birds/monkeys on Sundays.',
    },
  ];

  // 4. Lal Kitab Planetary Placements (Khana 1-12)
  const pakkaGharMap: Record<string, string> = {
    Surya: 'Khana 1 (Sun)',
    Chandra: 'Khana 4 (Moon)',
    Mangal: 'Khana 3 & 8 (Mars)',
    Budha: 'Khana 7 (Mercury)',
    Guru: 'Khana 2, 5, 9 & 12 (Jupiter)',
    Shukra: 'Khana 7 (Venus)',
    Shani: 'Khana 8 & 10 (Saturn)',
    Rahu: 'Khana 12 (Rahu)',
    Ketu: 'Khana 6 (Ketu)',
  };

  const shubhHousesMap: Record<string, number[]> = {
    Surya: [1, 2, 3, 4, 5, 9, 10, 11],
    Chandra: [1, 2, 3, 4, 5, 7, 9],
    Mangal: [1, 2, 3, 5, 6, 9, 10, 11],
    Budha: [1, 2, 4, 5, 6, 7, 10, 11],
    Guru: [1, 2, 4, 5, 7, 9, 12],
    Shukra: [2, 3, 4, 5, 7, 8, 11, 12],
    Shani: [2, 3, 6, 7, 9, 10, 11, 12],
    Rahu: [3, 4, 6, 11],
    Ketu: [1, 2, 6, 9, 11, 12],
  };

  const planetUpayMap: Record<string, string> = {
    Surya: 'Drink water after eating a bit of jaggery before starting important work; honor father figures.',
    Chandra: 'Drink water or milk from a silver glass and seek your mother’s blessings before travel.',
    Mangal: 'Keep pure honey or a square silver piece at home; offer sweet rotis on Tuesdays.',
    Budha: 'Clean teeth with alum (Fitkari), wear clean ironed clothes, and feed soaked green moong to birds.',
    Guru: 'Apply saffron (Kesar) or turmeric tilak on the forehead and water a Peepal or banana tree on Thursdays.',
    Shukra: 'Apply natural rose/sandalwood itr (fragrance), keep clothing neat, and donate curd or ghee on Fridays.',
    Shani: 'Offer mustard oil at a Shani temple, walk barefoot on grass, and treat workers with fairness and generosity.',
    Rahu: 'Keep a small solid silver elephant or square silver piece in your pocket/locker and avoid blue/black bedsheets.',
    Ketu: 'Apply saffron tilak behind the ears, feed two-colored (black & white) dogs, and donate blankets in winter.',
  };

  const lalKitabPlanetPlacements: BhriguLalKitabSummary['lalKitabPlanetPlacements'] = natalPlanets.map((p) => {
    const isShubh = (shubhHousesMap[p.name] || []).includes(p.house);
    const status: 'Awakened (Shubh)' | 'Mixed (Madhyam)' | 'Caution (Manda)' = isShubh
      ? 'Awakened (Shubh)'
      : [6, 8, 12].includes(p.house)
      ? 'Caution (Manda)'
      : 'Mixed (Madhyam)';

    const effect = isShubh
      ? `${p.englishName} in Khana No. ${p.house} acts as a benefic guardian in Lal Kitab, strengthening ${
          p.house === 1
            ? 'personal dignity and leadership'
            : p.house === 2
            ? 'family wealth and ancestral treasury'
            : p.house === 4
            ? 'domestic peace, property, and emotional stability'
            : p.house === 5
            ? 'intellect, children, and good fortune'
            : p.house === 7
            ? 'marital harmony and commercial partnerships'
            : p.house === 9
            ? 'ancestral luck and dharmic elevation'
            : p.house === 10
            ? 'career authority and public reputation'
            : p.house === 11
            ? 'steady income and social gains'
            : 'practical courage and resilience'
        }.`
      : `${p.englishName} in Khana No. ${p.house} requires conscious discipline and Lal Kitab harmonization so its energy supports constructive growth without restlessness.`;

    return {
      planet: `${p.englishName} (${p.name})`,
      khana: p.house,
      pakkaGhar: pakkaGharMap[p.name] || 'Khana 1',
      status,
      effect,
      remedy: planetUpayMap[p.name] || 'Maintain truthfulness and charitable seva.',
    };
  });

  return {
    bhriguBindu,
    karmicBlueprint,
    bhagyodayaAges,
    lalKitabRina,
    lalKitabPlanetPlacements,
  };
}

// Generate Multi-Year Varshaphal, Annual Transit & Life-Path Predictions (2025 - 2028)
export function calculateYearlyPredictions(
  natalLagnaRasi: number,
  natalMoonRasi: number,
  birthDateStr: string = '1990-05-18',
  sadeSatiActive: boolean = false,
  natalPlanets: PlanetPosition[] = []
): YearlyPrediction[] {
  const birthYear = parseInt(birthDateStr.split('-')[0] || '1990', 10) || 1990;
  const years = [2025, 2026, 2027, 2028];

  // Year-specific major sidereal Rasi positions for Guru, Shani, and Rahu-Ketu
  const annualSkyConfig: Record<
    number,
    {
      guruRasiNum: number;
      guruText: string;
      shaniRasiNum: number;
      shaniText: string;
      rahuRasiNum: number;
      rahuKetuText: string;
      bestMonths: string;
      cautionMonths: string;
    }
  > = {
    2025: {
      guruRasiNum: 3, // Mithuna (Gemini)
      guruText: 'Guru transits Mithuna (Gemini), expanding intellectual networks, digital enterprise, and skill mastery.',
      shaniRasiNum: 12, // Meena (Pisces)
      shaniText: 'Shani enters Meena (Pisces), initiating karmic restructuring, spiritual maturity, and disciplined foundations.',
      rahuRasiNum: 11, // Kumbha (Aquarius) / Ketu in Simha (Leo)
      rahuKetuText: 'Rahu in Kumbha (Aquarius) & Ketu in Simha (Leo) accelerate technological leaps and detachment from ego.',
      bestMonths: 'May, July, September & November 2025',
      cautionMonths: 'March, August & October 2025',
    },
    2026: {
      guruRasiNum: 4, // Exalted in Karka (Cancer) mid-year
      guruText: 'Guru enters exalted Karka (Cancer), showering supreme Devaguru grace on domestic peace, wealth, and dharmic protection.',
      shaniRasiNum: 12, // Meena (Pisces)
      shaniText: 'Shani steadies in Meena (Pisces), rewarding patient perseverance, ethical leadership, and institutional loyalty.',
      rahuRasiNum: 11, // Kumbha / Makara transition late year
      rahuKetuText: 'Rahu–Ketu axis shifts from Kumbha–Simha toward Makara–Karka late in the year, reshaping career and home priorities.',
      bestMonths: 'February, June, October & December 2026',
      cautionMonths: 'April, July & September 2026',
    },
    2027: {
      guruRasiNum: 5, // Simha (Leo)
      guruText: 'Guru progresses into royal Simha (Leo), igniting executive authority, creative brilliance, progeny blessings, and social prestige.',
      shaniRasiNum: 1, // Enters Mesha (Aries) mid-2027
      shaniText: 'Shani transitions from Meena into Mesha (Aries), demanding pioneering discipline and self-reliant courage.',
      rahuRasiNum: 10, // Makara (Capricorn) & Ketu in Karka (Cancer)
      rahuKetuText: 'Rahu in Makara (Capricorn) & Ketu in Karka (Cancer) drive ambitious professional execution and inner emotional detachment.',
      bestMonths: 'January, May, August & November 2027',
      cautionMonths: 'March, June & October 2027',
    },
    2028: {
      guruRasiNum: 6, // Kanya (Virgo) / Tula
      guruText: 'Guru transits Kanya (Virgo), favoring precision, financial auditing, healthcare, service excellence, and practical wisdom.',
      shaniRasiNum: 1, // Mesha (Aries)
      shaniText: 'Shani in Mesha (Aries) consolidates structural reforms, rewarding strategic endurance over impulsive action.',
      rahuRasiNum: 9, // Dhanu (Sagittarius) & Ketu in Mithuna (Gemini)
      rahuKetuText: 'Rahu in Dhanu (Sagittarius) & Ketu in Mithuna (Gemini) inspire higher philosophical synthesis and global travel.',
      bestMonths: 'February, April, September & December 2028',
      cautionMonths: 'May, July & November 2028',
    },
  };

  const munthaHouseEffects: Record<number, string> = {
    1: 'Muntha in 1st Bhava grants radiant vitality, independent leadership, elevation in status, and personal triumph.',
    2: 'Muntha in 2nd Bhava favors liquid wealth accumulation, family celebrations, eloquent speech, and savings growth.',
    3: 'Muntha in 3rd Bhava ignites bold initiatives, skill recognition, fruitful short travels, and support from siblings.',
    4: 'Muntha in 4th Bhava brings domestic peace, real estate/vehicle upgrades, and maternal blessings.',
    5: 'Muntha in 5th Bhava bestows academic excellence, creative recognition, joyful news from children, and sharp intuition.',
    6: 'Muntha in 6th Bhava calls for disciplined health habits and careful financial management while conquering competitors.',
    7: 'Muntha in 7th Bhava strengthens marital harmony, lucrative commercial partnerships, and public goodwill.',
    8: 'Muntha in 8th Bhava advises health vigilance and patience during transitions while unlocking deep research insights.',
    9: 'Muntha in 9th Bhava (Bhagya Sthana) triggers auspicious fortune, pilgrimage, mentor grace, and dharmic elevation.',
    10: 'Muntha in 10th Bhava crowns the year with career promotions, executive authority, and institutional honor.',
    11: 'Muntha in 11th Bhava (Labha Sthana) fulfills long-held financial aspirations, expanding income and influential networks.',
    12: 'Muntha in 12th Bhava favors foreign connections, spiritual retreats, and charitable seeding; budget expenses mindfully.',
  };

  const houseLifePathThemes: Record<number, string> = {
    1: 'Self-Reinvention, Physical Vitality & Personal Leadership',
    2: 'Wealth Consolidation, Family Lineage & Financial Security',
    3: 'Courageous Enterprise, Communication & Skill Expansion',
    4: 'Domestic Sanctuary, Property Acquisition & Inner Peace',
    5: 'Creative Intelligence, Progeny Grace & Purva-Punya Fruition',
    6: 'Service Mastery, Health Discipline & Overcoming Rivals',
    7: 'Sacred Partnerships, Marital Harmony & Public Alliances',
    8: 'Deep Karmic Transformation, Research & Occult Insight',
    9: 'Bhagyodaya (Rise of Fortune), Higher Dharma & Mentorship',
    10: 'Karmic Zenith, Executive Authority & Career Legacy',
    11: 'Fulfillment of Aspirations, Network Gains & Abundance',
    12: 'Spiritual Liberation, Global Horizons & Conscious Letting Go',
  };

  return years.map((yr) => {
    const ageInYear = Math.max(1, yr - birthYear);
    // In Tajika Varshaphal, Muntha advances 1 sign per year from Natal Lagna
    const munthaRasiNum = ((natalLagnaRasi - 1 + ageInYear) % 12) + 1;
    const munthaRasiObj = VEDIC_RASIS[munthaRasiNum - 1] || VEDIC_RASIS[0];
    const munthaHouse = ((munthaRasiNum - natalLagnaRasi + 12) % 12) + 1;
    const munthaLord = munthaRasiObj.lord;

    const sky = annualSkyConfig[yr] || annualSkyConfig[2026];
    const guruHouseFromMoon = ((sky.guruRasiNum - natalMoonRasi + 12) % 12) + 1;
    const guruHouseFromLagna = ((sky.guruRasiNum - natalLagnaRasi + 12) % 12) + 1;
    const shaniHouseFromMoon = ((sky.shaniRasiNum - natalMoonRasi + 12) % 12) + 1;
    const shaniHouseFromLagna = ((sky.shaniRasiNum - natalLagnaRasi + 12) % 12) + 1;
    const rahuHouseFromMoon = ((sky.rahuRasiNum - natalMoonRasi + 12) % 12) + 1;
    const rahuHouseFromLagna = ((sky.rahuRasiNum - natalLagnaRasi + 12) % 12) + 1;

    const isGuruBenefic = [2, 5, 7, 9, 11].includes(guruHouseFromMoon);
    const isMunthaAuspicious = [1, 2, 3, 4, 5, 7, 9, 10, 11].includes(munthaHouse);
    const overallRating = isGuruBenefic && isMunthaAuspicious ? 5 : isGuruBenefic || isMunthaAuspicious ? 4 : 3;

    const themeTitle =
      overallRating === 5
        ? `Year of Dharmic Elevation & Prosperity (Muntha in H${munthaHouse})`
        : overallRating === 4
        ? `Year of Strategic Growth & Consolidation (Muntha in H${munthaHouse})`
        : `Year of Karmic Discipline & Inner Mastery (Muntha in H${munthaHouse})`;

    // --- LIFE-PATH SYNTHESIS (NATAL BIRTH CHART + ANNUAL TRANSITS) ---
    // 1. Sudarshana / Bhrigu Age Progression House (1-12)
    const progressedHouse = ((ageInYear - 1) % 12) + 1;
    const progressedRasiNum = ((natalLagnaRasi + progressedHouse - 2) % 12) + 1;
    const progressedRasiObj = VEDIC_RASIS[progressedRasiNum - 1] || VEDIC_RASIS[0];

    const natalInProgressed = natalPlanets
      .filter((p) => p.house === progressedHouse && p.name !== 'Lagna')
      .map((p) => `${p.name} (${p.englishName})`);

    // 2. Double-Transit Calculation (Houses influenced by both Guru [1, 5, 7, 9] and Shani [1, 3, 7, 10] from Lagna)
    const guruInfluencedHouses = [
      guruHouseFromLagna,
      ((guruHouseFromLagna + 4 - 1) % 12) + 1,
      ((guruHouseFromLagna + 6 - 1) % 12) + 1,
      ((guruHouseFromLagna + 8 - 1) % 12) + 1,
    ];
    const shaniInfluencedHouses = [
      shaniHouseFromLagna,
      ((shaniHouseFromLagna + 2 - 1) % 12) + 1,
      ((shaniHouseFromLagna + 6 - 1) % 12) + 1,
      ((shaniHouseFromLagna + 9 - 1) % 12) + 1,
    ];
    const doubleTransitHouses = Array.from(
      new Set(guruInfluencedHouses.filter((h) => shaniInfluencedHouses.includes(h)))
    ).sort((a, b) => a - b);

    const primaryDoubleHouse = doubleTransitHouses[0] || guruHouseFromLagna;
    const doubleTransitSummary =
      doubleTransitHouses.length > 0
        ? `Guru (H${guruHouseFromLagna}) and Shani (H${shaniHouseFromLagna}) cast a simultaneous Double-Transit blessing upon Natal House${doubleTransitHouses.length > 1 ? 's' : ''} ${doubleTransitHouses.map((h) => `H${h}`).join(', ')} (${houseLifePathThemes[primaryDoubleHouse]}), making ${yr} a landmark year for concrete manifestation in these life domains.`
        : `Guru in Natal H${guruHouseFromLagna} and Shani in Natal H${shaniHouseFromLagna} work in complementary houses, balancing expansion in ${houseLifePathThemes[guruHouseFromLagna]} with structural discipline in ${houseLifePathThemes[shaniHouseFromLagna]}.`;

    const lifePathHeadline = `Age ${ageInYear} Life-Path Focus: House ${progressedHouse} (${progressedRasiObj.sanskritName}) — ${houseLifePathThemes[progressedHouse]}`;

    const lifePathNarrative = `In ${yr} (Age ${ageInYear}), your Bhrigu/Sudarshana progression activates Natal House ${progressedHouse} (${progressedRasiObj.sanskritName}, ruled by ${progressedRasiObj.lord})${
      natalInProgressed.length > 0
        ? `, awakening your natal ${natalInProgressed.join(', ')}`
        : ''
    }. Combined with Varshaphal Muntha in H${munthaHouse} (${munthaRasiObj.sanskritName}) and ${doubleTransitSummary}`;

    // 3. Triggered Natal Planets (Natal planets in Guru's transit house, Shani's transit house, or Rahu's transit house, or fallback to Sun, Moon, Lagna Lord)
    const triggeredList: {
      planet: string;
      natalPlacement: string;
      transitTrigger: string;
      lifePathImpact: string;
    }[] = [];

    const validNatal = natalPlanets.filter((p) => p.name !== 'Lagna');
    validNatal.forEach((np) => {
      if (np.house === guruHouseFromLagna) {
        triggeredList.push({
          planet: `${np.symbol} ${np.name} (${np.englishName})`,
          natalPlacement: `Natal H${np.house} (${np.rasiName})`,
          transitTrigger: `Conjoined by Transiting Guru in ${yr}`,
          lifePathImpact: `Expands wisdom, fortune, and dharmic opportunities linked to Natal ${np.name} in House ${np.house}.`,
        });
      } else if (np.house === shaniHouseFromLagna) {
        triggeredList.push({
          planet: `${np.symbol} ${np.name} (${np.englishName})`,
          natalPlacement: `Natal H${np.house} (${np.rasiName})`,
          transitTrigger: `Tested & Structured by Transiting Shani in ${yr}`,
          lifePathImpact: `Demands disciplined mastery and delivers permanent karmic rewards in House ${np.house} matters.`,
        });
      } else if (np.house === rahuHouseFromLagna) {
        triggeredList.push({
          planet: `${np.symbol} ${np.name} (${np.englishName})`,
          natalPlacement: `Natal H${np.house} (${np.rasiName})`,
          transitTrigger: `Electrified by Transiting Rahu in ${yr}`,
          lifePathImpact: `Sparks rapid, unconventional breakthroughs and ambitious shifts in House ${np.house}.`,
        });
      } else if (doubleTransitHouses.includes(np.house)) {
        triggeredList.push({
          planet: `${np.symbol} ${np.name} (${np.englishName})`,
          natalPlacement: `Natal H${np.house} (${np.rasiName})`,
          transitTrigger: `Activated by Guru–Shani Double Transit in ${yr}`,
          lifePathImpact: `Crystallizes long-awaited life-path milestones connected to Natal ${np.name} in House ${np.house}.`,
        });
      }
    });

    if (triggeredList.length < 3) {
      const fallbackDefaults = [
        {
          planet: '☉ Surya (Sun)',
          natalPlacement: `Natal Lagna/Atmakaraka Axis`,
          transitTrigger: `Guru Trinal Aspect in ${yr}`,
          lifePathImpact: 'Elevates career vitality, self-confidence, and recognition from leadership.',
        },
        {
          planet: '☽ Chandra (Moon)',
          natalPlacement: `Janma Rashi (${VEDIC_RASIS[natalMoonRasi - 1]?.sanskritName || 'Simha'})`,
          transitTrigger: `Gochar House ${guruHouseFromMoon} Guru & House ${shaniHouseFromMoon} Shani`,
          lifePathImpact: 'Shapes emotional resilience, family peace, and intuitive decision-making.',
        },
        {
          planet: '♃ Guru (Jupiter)',
          natalPlacement: `Dharma & Fortune Axis`,
          transitTrigger: `Varshaphal Lord ${munthaLord} Synergy`,
          lifePathImpact: 'Supports higher learning, ethical wealth creation, and spiritual grace.',
        },
      ];
      for (const fb of fallbackDefaults) {
        if (triggeredList.length < 4) triggeredList.push(fb);
      }
    }

    const lifePathScorecard = {
      dharmaAlignment: isGuruBenefic ? 92 : 78,
      arthaMomentum: isMunthaAuspicious ? 90 : 75,
      kamaHarmony: [1, 2, 4, 5, 7, 9, 11].includes(guruHouseFromLagna) ? 88 : 74,
      mokshaClarity: sadeSatiActive ? 89 : 82,
    };

    const secondDoubleHouse = doubleTransitHouses[1] || munthaHouse;
    const karmicTurningPoints = [
      {
        window: `Jan – Apr ${yr}`,
        title: `Sudarshana Age ${ageInYear} Awakening`,
        activatedHouse: `House ${progressedHouse} (${progressedRasiObj.sanskritName})`,
        guidance: `Initiate core annual goals aligned with ${houseLifePathThemes[progressedHouse]} under the lordship of ${progressedRasiObj.lord}.`,
      },
      {
        window: `May – Aug ${yr}`,
        title: `Guru–Shani Double-Transit Manifestation`,
        activatedHouse: `House ${primaryDoubleHouse} & House ${secondDoubleHouse}`,
        guidance: `Capitalize on concrete career, educational, and structural breakthroughs where Jupiter's expansion meets Saturn's permanence.`,
      },
      {
        window: `Sep – Dec ${yr}`,
        title: `Varshaphal Muntha & Nodal Consolidation`,
        activatedHouse: `House ${munthaHouse} (${munthaRasiObj.sanskritName}) & House ${rahuHouseFromLagna}`,
        guidance: `Harvest financial and relationship rewards while anchoring spiritual equilibrium through Varsheshwara ${munthaLord}.`,
      },
    ];

    return {
      year: yr,
      themeTitle,
      overallRating,
      ageInYear,
      munthaRasi: munthaRasiObj.sanskritName,
      munthaHouse,
      munthaLord,
      varsheshwara: `${munthaLord} (Varsha Lagnesha)`,
      munthaEffect: munthaHouseEffects[munthaHouse] || munthaHouseEffects[1],
      majorTransitsSummary: {
        guruTransit: `House ${guruHouseFromMoon} from Moon (H${guruHouseFromLagna} from Lagna) — ${sky.guruText}`,
        shaniTransit: `House ${shaniHouseFromMoon} from Moon (H${shaniHouseFromLagna} from Lagna) — ${sky.shaniText}`,
        rahuKetuTransit: `Rahu in House ${rahuHouseFromMoon} from Moon (H${rahuHouseFromLagna} from Lagna) — ${sky.rahuKetuText}`,
      },
      pillars: {
        careerAndJob: isGuruBenefic
          ? `With Guru energizing House ${guruHouseFromMoon} from Moon and Muntha in House ${munthaHouse}, ${yr} brings prominent leadership opportunities, institutional recognition, and favorable role expansion.`
          : `Shani in House ${shaniHouseFromMoon} from Moon demands methodical execution and patience with seniors in ${yr}; steady craftsmanship builds unshakeable professional credibility.`,
        wealthAndBusiness: isMunthaAuspicious
          ? `Auspicious Muntha in ${munthaRasiObj.sanskritName} (House ${munthaHouse}) supports strong capital accumulation, profitable commercial alliances, and asset appreciation during ${yr}.`
          : `Prioritize liquid reserves, conservative budgeting, and verified contracts in ${yr}; avoid speculative leverage while Rahu transits House ${rahuHouseFromMoon} from Moon.`,
        marriageAndFamily: isGuruBenefic
          ? `Benevolent Jupiterian rays foster warmth in marriage, auspicious family ceremonies, and supportive harmony with elders and children throughout ${yr}.`
          : `Cultivate patient, empathetic dialogue at home in ${yr}; shared spiritual routines and family travel dissolve domestic stress.`,
        healthAndVitality: sadeSatiActive
          ? `Maintain disciplined circadian sleep, warm sattvic nutrition, and joint mobility in ${yr} to keep vitality resilient under Saturn's gaze.`
          : `Physical stamina and immunity remain supportive in ${yr}; balance active work schedules with regular pranayama and hydration.`,
        educationAndIntellect: `Guru in House ${guruHouseFromLagna} from Lagna sharpens higher learning, certifications, and research depth in ${yr}, rewarding structured study schedules.`,
        mentalStateAndSpirit: `Varsheshwara ${munthaLord} guides your inner compass in ${yr}, deepening meditative clarity, intuition, and dharmic resilience across all four quarters.`,
      },
      quarterlyBreakdown: [
        {
          quarter: 'Q1 (Jan – Mar)',
          period: `Jan – Mar ${yr}`,
          tone: isMunthaAuspicious ? 'Progressive' : 'Consolidation',
          summary: `Sets the annual foundation under Varsheshwara ${munthaLord}; ideal for strategic planning, financial budgeting, and health routines.`,
        },
        {
          quarter: 'Q2 (Apr – Jun)',
          period: `Apr – Jun ${yr}`,
          tone: 'Peak Auspicious',
          summary: `Solar exaltation window activates career visibility, educational milestones, and decisive project execution.`,
        },
        {
          quarter: 'Q3 (Jul – Sep)',
          period: `Jul – Sep ${yr}`,
          tone: sadeSatiActive ? 'Caution & Discipline' : 'Consolidation',
          summary: `Retrograde planetary reviews call for patience in relationships, careful contract audits, and steady inner sadhana.`,
        },
        {
          quarter: 'Q4 (Oct – Dec)',
          period: `Oct – Dec ${yr}`,
          tone: isGuruBenefic ? 'Peak Auspicious' : 'Progressive',
          summary: `Harvest quarter bringing financial gains, festive family harmony, and year-end professional accomplishments.`,
        },
      ],
      bestMonths: sky.bestMonths,
      cautionMonths: sky.cautionMonths,
      annualRemedy: `Honor Varsheshwara ${munthaLord} throughout ${yr}: perform Rudrabhishekam or offer saffron/turmeric tilak on Thursdays, and practice charitable anna-daan (food donation) on your birth Nakshatra days.`,
      lifePathSynthesis: {
        progressedHouse,
        progressedRasi: progressedRasiObj.sanskritName,
        progressedLord: progressedRasiObj.lord,
        natalPlanetsInProgressedHouse: natalInProgressed,
        doubleTransitHouses,
        doubleTransitSummary,
        lifePathHeadline,
        lifePathNarrative,
        lifePathScorecard,
        purusharthaMatrix: {
          dharma: `Dharma (H1/H5/H9 Purpose): Progressed age ${ageInYear} and Guru in H${guruHouseFromLagna} align your personal ethics with higher mentorship, authentic self-expression, and Purva-Punya grace.`,
          artha: `Artha (H2/H6/H10 Wealth & Career): Shani in H${shaniHouseFromLagna} and Muntha in H${munthaHouse} anchor material stability, disciplined enterprise growth, and long-term asset creation.`,
          kama: `Kama (H3/H7/H11 Relationships & Goals): Rahu in H${rahuHouseFromLagna} and Jupiterian aspects energize strategic alliances, marital teamwork, and fulfillment of key life ambitions.`,
          moksha: `Moksha (H4/H8/H12 Inner Liberation): Ketu’s spiritual current and Varsheshwara ${munthaLord} foster emotional equanimity, ancestral healing, and meditative depth.`,
        },
        triggeredNatalPlanets: triggeredList.slice(0, 4),
        karmicTurningPoints,
      },
    };
  });
}



