import { BirthDetails, PlanetPosition, HouseInfo, VedicRasiName, GrahaName, TransitPrediction, PlanetaryMovementDetail, MonthWiseTransitPrediction, TransitDosAndDonts, PlanetaryImpactRecord, BirthTimeHousePrediction, NatalYoga, VimshottariDashaInfo, AntardashaInfo, DashaMonthlyPlanetaryGuidance } from './types';
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
    };
  });

  return { planets, lagnaRasi, lagnaDeg };
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

    return {
      houseNumber,
      vedicName: item.vedicName,
      signName,
      signLord,
      karaka: item.karaka,
      planetsHere,
      headline: `${item.headlineTemplate} in ${signName}`,
      prediction,
      lifeDomain: item.domain,
      strengthScore,
    };
  });
}



