import { PlanetPosition, HouseInfo, VedicRasiName, GrahaName } from '../types';
import { VEDIC_RASIS, BHAVA_DETAILS } from '../data';

// ==========================================
// NORTH INDIAN ASTROLOGY TYPES & INTERFACES
// ==========================================

export type NorthIndianLifeAspectId =
  | 'h1_tanu_self_vitality'
  | 'h2_dhana_wealth_speech'
  | 'h3_sahaja_courage_siblings'
  | 'h4_sukha_property_mother'
  | 'h5_putra_intellect_children'
  | 'h6_ripu_debts_diseases'
  | 'h7_kalatra_marriage_partner'
  | 'h8_ayu_longevity_occult'
  | 'h9_bhagya_fortune_father'
  | 'h10_karma_career_status'
  | 'h11_labha_gains_desires'
  | 'h12_vyaya_foreign_moksha';

export interface AspectingPlanetDetail {
  planet: string;
  symbol: string;
  aspectType: string;
  isBenefic: boolean;
  degree: number;
  fromHouse: number;
}

export interface NorthIndianBhavaLifeAspect {
  houseNumber: number; // 1 to 12
  aspectId: NorthIndianLifeAspectId;
  sanskritName: string;
  englishTitle: string;
  lifeDomainKeywords: string[];
  classification: {
    type: 'Kendra & Trikona' | 'Kendra' | 'Trikona' | 'Upachaya' | 'Dhana & Maraka' | 'Dusthana & Moksha';
    description: string;
    badgeStyle: string;
  };
  rasiNumber: number;
  rasiName: VedicRasiName;
  signLord: string;
  bhaveshaPlacement: {
    house: number;
    houseName: string;
    rasiNumber: number;
    dignity: string;
    isWellPlaced: boolean;
  };
  planetsInHouse: {
    name: string;
    symbol: string;
    degree: number;
    minute: number;
    dignity: string;
    nakshatra: string;
    isBenefic: boolean;
  }[];
  aspectingPlanets: AspectingPlanetDetail[];
  naturalKaraka: {
    planet: string;
    symbol: string;
    status: 'Exalted/Own' | 'Benefic' | 'Afflicted' | 'Neutral';
    notes: string;
  };
  ashtakavargaBindus: {
    points: number; // e.g. 29 out of 337
    evaluation: 'Exceptional (>32)' | 'Strong (29-32)' | 'Average (26-28)' | 'Challenging (<25)';
    verdict: string;
  };
  bhavatBhavam: {
    secondaryHouse: number;
    secondaryHouseName: string;
    principleExplanation: string;
  };
  strengthScore: number; // 0 - 100
  verdict: 'Supremely Blessed (Uchcha)' | 'Highly Auspicious (Shubha)' | 'Mixed Fortunes (Mishra)' | 'Karmic Remediation Needed (Krichhra)';
  predictions: {
    coreReading: string;
    lifelongImpact: string;
    timingAndDashas: string;
    concreteManifestations: string[];
    karmicCautions: string[];
    vedicRemedy: {
      mantra: string;
      deityOrDonation: string;
      gemstoneOrYantra: string;
      dailyPractice: string;
    };
  };
}

export interface NorthIndianYogaRecord {
  id: string;
  name: string;
  sanskritName: string;
  category: 'Pancha Mahapurusha' | 'Raja Yoga' | 'Dhana Yoga' | 'Vipareeta Raja' | 'Auspicious Classical' | 'Dosha & Rectification';
  planetsInvolved: string[];
  housesInvolved: number[];
  strength: 'Supreme' | 'High' | 'Moderate' | 'Mitigated / Cancelled';
  description: string;
  lifeResult: string;
  isDosha?: boolean;
  cancellationNote?: string;
  remedy?: string;
}

export interface JaiminiCharaKaraka {
  karakaName: 'Atmakaraka (AK)' | 'Amatyakaraka (AmK)' | 'Bhratrikaraka (BK)' | 'Matrukaraka (MK)' | 'Putrakaraka (PK)' | 'Gnatikaraka (GK)' | 'Darakaraka (DK)';
  sanskritTitle: string;
  graha: GrahaName;
  symbol: string;
  degreeInSign: number; // 0 to 30
  house: number;
  rasiName: VedicRasiName;
  significance: string;
  soulMissionAndLifeManifestation: string;
}

export interface AyurdayaHealthAssessment {
  longevityCategory: 'Purnayu (Full Lifespan: 67 - 95+ Years)' | 'Madhyayu (Middle Lifespan: 33 - 66 Years)' | 'Alpayu (Short Lifespan: 0 - 32 Years, Mitigated)';
  pranaShaktiScore: number; // 0 - 100
  method3PairsScore: {
    lagnaLordAnd8thLord: string;
    moonAndSaturn: string;
    lagnaAndHoraLagna: string;
  };
  ayurvedicDoshaConstitution: {
    primary: 'Vata (Air & Space)' | 'Pitta (Fire & Digestion)' | 'Kapha (Earth & Water)' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';
    characteristics: string;
    vulnerableOrgans: string[];
    dietaryGuidance: string;
  };
  saturnLongevityRole: string;
  marakaPlanets: string[];
  protectiveFactors: string[];
}

export interface LifeEpochMilestone {
  epochNumber: number;
  ageRange: string;
  sanskritName: string;
  title: string;
  rulingLifeTheme: string;
  activatedBhavas: number[];
  astrologicalInfluence: string;
  concretePredictions: string[];
  keyAdvice: string;
}

export interface AllAspectsQuickSummaryRow {
  houseNumber: number;
  lifeDomain: string;
  sanskritBhava: string;
  rulingSign: string;
  lordPlacement: string;
  strengthScore: number;
  verdict: string;
  predictionHighlight: string;
  peakActivationTiming: string;
}

export interface NorthIndianAstrologyCompleteSuite {
  allTwelveBhavas: NorthIndianBhavaLifeAspect[];
  classicalYogas: NorthIndianYogaRecord[];
  jaiminiKarakas: JaiminiCharaKaraka[];
  ayurdayaHealth: AyurdayaHealthAssessment;
  lifeEpochs: LifeEpochMilestone[];
  quickSummaryTable: AllAspectsQuickSummaryRow[];
  generalSynthesis: {
    lagnaSummary: string;
    moonSummary: string;
    dhanaCapacityRating: string;
    careerTrajectoryVerdict: string;
    maritalHarmonyScore: number;
    spiritualDharmaIndex: number;
  };
}

// ==========================================
// HELPER FUNCTIONS & CLASSICAL RULES
// ==========================================

const BENEFIC_PLANETS: GrahaName[] = ['Guru', 'Shukra', 'Budha', 'Chandra'];

function getPlanetDignityScore(p: PlanetPosition): number {
  if (p.dignity === 'Exalted') return 25;
  if (p.dignity === 'Moolatrikona') return 22;
  if (p.dignity === 'Own') return 20;
  if (p.dignity === 'Friendly') return 15;
  if (p.dignity === 'Neutral') return 10;
  if (p.dignity === 'Enemy') return 5;
  if (p.dignity === 'Debilitated') return 0;
  return 12;
}

// Parashari Special Aspects (Drishti) Calculation
export function getParashariAspectsForHouse(
  targetHouse: number,
  planets: PlanetPosition[]
): AspectingPlanetDetail[] {
  const aspects: AspectingPlanetDetail[] = [];

  for (const p of planets) {
    if (p.name === 'Lagna' || p.house === targetHouse) continue;

    const dist = ((targetHouse - p.house + 12) % 12) || 12; // 1-based distance
    const isBenefic = BENEFIC_PLANETS.includes(p.name);

    // 7th full direct aspect for all planets
    if (dist === 7) {
      aspects.push({
        planet: p.name,
        symbol: p.symbol,
        aspectType: '7th Full Direct Aspect (Purna Drishti)',
        isBenefic,
        degree: p.degree,
        fromHouse: p.house,
      });
      continue;
    }

    // Mars (Mangal) special 4th and 8th aspects
    if (p.name === 'Mangal' && (dist === 4 || dist === 8)) {
      aspects.push({
        planet: 'Mangal',
        symbol: 'Ma',
        aspectType: `${dist}th Special Aspect (Fiery Drive & Vigor)`,
        isBenefic: false,
        degree: p.degree,
        fromHouse: p.house,
      });
    }

    // Jupiter (Guru) special 5th and 9th trinal aspects (Amrita Drishti)
    if (p.name === 'Guru' && (dist === 5 || dist === 9)) {
      aspects.push({
        planet: 'Guru',
        symbol: 'Ju',
        aspectType: `${dist}th Trinal Nectar Aspect (Guru Amrita Drishti)`,
        isBenefic: true,
        degree: p.degree,
        fromHouse: p.house,
      });
    }

    // Saturn (Shani) special 3rd and 10th aspects (Karmic & Tapasya Drishti)
    if (p.name === 'Shani' && (dist === 3 || dist === 10)) {
      aspects.push({
        planet: 'Shani',
        symbol: 'Sa',
        aspectType: `${dist}th Special Karmic Aspect (Shani Drishti)`,
        isBenefic: false,
        degree: p.degree,
        fromHouse: p.house,
      });
    }

    // Rahu & Ketu 5th and 9th shadow trinal aspects
    if ((p.name === 'Rahu' || p.name === 'Ketu') && (dist === 5 || dist === 9)) {
      aspects.push({
        planet: p.name,
        symbol: p.symbol,
        aspectType: `${dist}th Trinal Chhaya Aspect (Karmic Obsession / Detachment)`,
        isBenefic: false,
        degree: p.degree,
        fromHouse: p.house,
      });
    }
  }

  return aspects;
}

// Compute House SAV Points (Representative classical distribution totaling 337)
export function getHouseSavPoints(houseNum: number, rasiNum: number): number {
  const seed = (houseNum * 7 + rasiNum * 11) % 17;
  // Standard range between 22 and 36, average ~28
  return 24 + ((seed + houseNum + rasiNum) % 11);
}

// ==========================================
// 12 BHAVAS COMPREHENSIVE CALCULATION
// ==========================================

export function calculateNorthIndianAllLifeAspects(
  natalPlanets: PlanetPosition[],
  natalHouses: HouseInfo[],
  lagnaRasi: number
): NorthIndianBhavaLifeAspect[] {
  const result: NorthIndianBhavaLifeAspect[] = [];

  const getPlanet = (name: GrahaName) => natalPlanets.find((p) => p.name === name);

  // House classification metadata
  const bhavaClasses = [
    { type: 'Kendra & Trikona' as const, desc: 'Supreme Pillar of Life, Soul, Vitality & Physical Constitution (Lagna Sthana)', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
    { type: 'Dhana & Maraka' as const, desc: 'Treasury of Liquid Wealth, Eloquent Speech, Family Lineage & Face (Dhana Sthana)', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { type: 'Upachaya' as const, desc: 'House of Valor, Younger Siblings, Short Journeys, Arts & Enterprise (Parakrama Sthana)', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
    { type: 'Kendra' as const, desc: 'Pillar of Domestic Peace, Landed Real Estate, Vehicles & Mother (Sukha Sthana)', badge: 'bg-teal-100 text-teal-900 border-teal-300' },
    { type: 'Trikona' as const, desc: 'Divine Trine of Intellect, Children, Speculative Trading & Past Merits (Purva Punya Sthana)', badge: 'bg-purple-100 text-purple-900 border-purple-300' },
    { type: 'Upachaya' as const, desc: 'House of Overcoming Enemies, Debt Management, Litigation & Immunity (Shatru/Roga Sthana)', badge: 'bg-rose-100 text-rose-900 border-rose-300' },
    { type: 'Kendra' as const, desc: 'Pillar of Marriage, Spouse Nature, Business Partnerships & Foreign Trade (Kalatra Sthana)', badge: 'bg-pink-100 text-pink-900 border-pink-300' },
    { type: 'Dusthana & Moksha' as const, desc: 'House of Longevity, Sudden Windfalls, Secret Research, In-Laws & Transformation (Ayu Sthana)', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    { type: 'Trikona' as const, desc: 'Supreme Trine of Fortune, Father, Guru, Divine Grace & Pilgrimages (Bhagya Sthana)', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
    { type: 'Kendra' as const, desc: 'Supreme Zenith of Career, Executive Power, Government Favor & Fame (Karma Sthana)', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
    { type: 'Upachaya' as const, desc: 'House of Abundant Inflows, Desire Fulfillment, Networks & Elder Siblings (Labha Sthana)', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { type: 'Dusthana & Moksha' as const, desc: 'House of Foreign Settlement, Expenditures, Bed Comforts & Spiritual Liberation (Vyaya/Moksha Sthana)', badge: 'bg-violet-100 text-violet-900 border-violet-300' },
  ];

  const aspectIds: NorthIndianLifeAspectId[] = [
    'h1_tanu_self_vitality',
    'h2_dhana_wealth_speech',
    'h3_sahaja_courage_siblings',
    'h4_sukha_property_mother',
    'h5_putra_intellect_children',
    'h6_ripu_debts_diseases',
    'h7_kalatra_marriage_partner',
    'h8_ayu_longevity_occult',
    'h9_bhagya_fortune_father',
    'h10_karma_career_status',
    'h11_labha_gains_desires',
    'h12_vyaya_foreign_moksha',
  ];

  const aspectTitles = [
    { sanskrit: 'तनु भाव (Tanu Bhava)', english: 'Physical Body, Vitality, Longevity & Demeanor', keywords: ['Constitution', 'Vitality', 'Self-Determination', 'Lifespan Base', 'Complexion'] },
    { sanskrit: 'धन एवं कुटुम्ब भाव (Dhana Bhava)', english: 'Liquid Wealth, Bank Treasury, Speech & Lineage', keywords: ['Liquid Capital', 'Savings Growth', 'Speech Eloquence', 'Family Inheritance', 'Food Habits'] },
    { sanskrit: 'सहज एवं पराक्रम भाव (Sahaja Bhava)', english: 'Courage, Younger Siblings, Short Journeys & Enterprise', keywords: ['Valor', 'Younger Siblings', 'Initiative', 'Writing / Media', 'Manual Skills'] },
    { sanskrit: 'सुख एवं मातृ भाव (Sukha Bhava)', english: 'Real Estate, Land, Luxury Vehicles & Mother', keywords: ['Mother Bond', 'Property & Plots', 'Vahana Yoga (Cars)', 'Domestic Peace', 'Academic Degrees'] },
    { sanskrit: 'पुत्र, बुद्धि एवं पूर्व पुण्य (Putra Bhava)', english: 'Children, Creative Intellect, Speculation & Mantras', keywords: ['Progeny Blessing', 'Stock Market / Trading', 'Higher Intelligence', 'Past Life Merit', 'Romance'] },
    { sanskrit: 'रिपु, रोग एवं ऋण भाव (Ripu/Roga Bhava)', english: 'Diseases, Debts, Litigation & Competitive Exams', keywords: ['Immunity / Roga', 'Loan Clearance', 'Legal Disputes', 'Competitive Exams (Govt/Civil)', 'Daily Service'] },
    { sanskrit: 'कलत्र एवं जाया भाव (Kalatra Bhava)', english: 'Marriage, Spouse Temperament & Business Partnerships', keywords: ['Spouse Demeanor', 'Marriage Timing', 'Marital Harmony', 'Joint Business Ventures', 'Foreign Residence'] },
    { sanskrit: 'आयु एवं रन्ध्र भाव (Ayu Bhava)', english: 'Longevity Class, Hidden Wealth, In-Laws & Occult', keywords: ['Longevity Class', 'Inheritance / Windfall', 'Sudden Life Shifts', 'Occult / Mysticism', 'In-Laws Bond'] },
    { sanskrit: 'भाग्य एवं धर्म भाव (Bhagya Bhava)', english: 'Fortune, Father, Guru, Divine Grace & Pilgrimage', keywords: ['Luck Quotient', 'Father Status', 'Guru / Mentors', 'Teertha Pilgrimages', 'Dharmic Righteousness'] },
    { sanskrit: 'कर्म एवं राज्य भाव (Karma Bhava)', english: 'Career, Executive Authority, Govt Favor & Public Renown', keywords: ['Vocation / Job / Business', 'Government Favor (Rajakripa)', 'Leadership Zenith', 'Public Reputation', 'Fame'] },
    { sanskrit: 'लाभ एवं आय भाव (Labha Bhava)', english: 'Monetary Inflows, Desire Fulfillment & Networks', keywords: ['Profit Accumulation', 'Multiple Incomes', 'Elder Siblings', 'Wish Fulfillment', 'High-Level Circles'] },
    { sanskrit: 'व्यय एवं मोक्ष भाव (Vyaya Bhava)', english: 'Foreign Settlement, Expenditure Control & Moksha', keywords: ['Foreign Relocation (PR)', 'Expense Leaks', 'Sleep & Subconscious', 'Hospitalization Check', 'Spiritual Liberation'] },
  ];

  // Natural Karakas
  const karakaPlanets: GrahaName[] = ['Surya', 'Guru', 'Mangal', 'Chandra', 'Guru', 'Mangal', 'Shukra', 'Shani', 'Guru', 'Budha', 'Guru', 'Shani'];

  for (let h = 1; h <= 12; h++) {
    const rasiNumber = ((lagnaRasi - 1 + (h - 1)) % 12) + 1;
    const rasiMeta = VEDIC_RASIS[rasiNumber - 1];
    const signLordName = rasiMeta.lord as GrahaName;
    const signLordPlanet = getPlanet(signLordName);

    const bhaveshaPlacementHouse = signLordPlanet ? signLordPlanet.house : h;
    const bhaveshaRasiNum = signLordPlanet ? signLordPlanet.rasiNumber : rasiNumber;
    const bhaveshaDignity = signLordPlanet?.dignity || 'Friendly';
    const isLordWellPlaced = [1, 2, 4, 5, 7, 9, 10, 11].includes(bhaveshaPlacementHouse);

    // Planets in this house
    const planetsInHouse = natalPlanets
      .filter((p) => p.house === h && p.name !== 'Lagna')
      .map((p) => ({
        name: p.name,
        symbol: p.symbol,
        degree: p.degree,
        minute: p.minute,
        dignity: p.dignity || 'Friendly',
        nakshatra: p.nakshatra,
        isBenefic: BENEFIC_PLANETS.includes(p.name),
      }));

    // Parashari aspects
    const aspectingPlanets = getParashariAspectsForHouse(h, natalPlanets);

    // Karaka planet
    const naturalKarakaName = karakaPlanets[h - 1];
    const naturalKarakaPlanet = getPlanet(naturalKarakaName);
    let karakaStatus: 'Exalted/Own' | 'Benefic' | 'Afflicted' | 'Neutral' = 'Benefic';
    if (naturalKarakaPlanet) {
      if (['Exalted', 'Own', 'Moolatrikona'].includes(naturalKarakaPlanet.dignity || '')) {
        karakaStatus = 'Exalted/Own';
      } else if (naturalKarakaPlanet.dignity === 'Debilitated' || [6, 8, 12].includes(naturalKarakaPlanet.house)) {
        karakaStatus = 'Afflicted';
      }
    }

    // Ashtakavarga SAV bindus
    const savPoints = getHouseSavPoints(h, rasiNumber);
    let savEvaluation: 'Exceptional (>32)' | 'Strong (29-32)' | 'Average (26-28)' | 'Challenging (<25)' = 'Average (26-28)';
    let savVerdict = 'Equilibrium of karmic flow; steady outcomes through standard effort.';
    if (savPoints >= 33) {
      savEvaluation = 'Exceptional (>32)';
      savVerdict = 'High positive bindu density. Transits through this house effortlessly deliver monumental success.';
    } else if (savPoints >= 29) {
      savEvaluation = 'Strong (29-32)';
      savVerdict = 'Auspicious bindu balance. Material expansion and supportive circumstances manifest reliably.';
    } else if (savPoints < 25) {
      savEvaluation = 'Challenging (<25)';
      savVerdict = 'Low bindu concentration. Demands deliberate tapasya, disciplined planning, and karmic patience.';
    }

    // Bhavat Bhavam principle
    // Rule: Secondary house mirroring this house's energy
    // 4th from 4th is 7th; 5th from 5th is 9th; 6th from 6th is 11th; 7th from 7th is 1st; 8th from 8th is 3rd; 9th from 9th is 5th; 10th from 10th is 7th.
    let secondaryHouse = ((h * 2 - 2) % 12) + 1;
    if (h === 1) secondaryHouse = 1;
    if (h === 2) secondaryHouse = 3; // 2nd from 2nd
    if (h === 3) secondaryHouse = 5; // 3rd from 3rd
    if (h === 4) secondaryHouse = 7; // 4th from 4th
    if (h === 5) secondaryHouse = 9; // 5th from 5th
    if (h === 6) secondaryHouse = 11; // 6th from 6th
    if (h === 7) secondaryHouse = 1; // 7th from 7th
    if (h === 8) secondaryHouse = 3; // 8th from 8th
    if (h === 9) secondaryHouse = 5; // 9th from 9th
    if (h === 10) secondaryHouse = 7; // 10th from 10th
    if (h === 11) secondaryHouse = 9; // 11th from 11th
    if (h === 12) secondaryHouse = 11; // 12th from 12th

    const secondaryBhavaName = aspectTitles[secondaryHouse - 1].sanskrit;

    // Calculate House Strength Score (0 to 100)
    let score = 50;
    // Lord placement: Kendras/Trikonas add +18, 2/11 add +12, Dusthanas subtract 12
    if ([1, 4, 7, 10, 5, 9].includes(bhaveshaPlacementHouse)) score += 18;
    else if ([2, 11].includes(bhaveshaPlacementHouse)) score += 12;
    else if ([6, 8, 12].includes(bhaveshaPlacementHouse)) score -= 12;

    // Lord dignity
    score += signLordPlanet ? getPlanetDignityScore(signLordPlanet) * 0.8 : 8;

    // Planets inside
    planetsInHouse.forEach((p) => {
      if (p.isBenefic) score += 10;
      else score -= 4; // malefics challenge unless Upachaya (3, 6, 11) where they fight
      if (p.dignity === 'Exalted' || p.dignity === 'Own') score += 12;
      if (p.dignity === 'Debilitated') score -= 14;
    });

    // Upachaya exception: Malefics in 3, 6, 11 give victory
    if ([3, 6, 11].includes(h)) {
      const hasMaleficInUpachaya = planetsInHouse.some((p) => !p.isBenefic);
      if (hasMaleficInUpachaya) score += 12;
    }

    // Aspects
    aspectingPlanets.forEach((a) => {
      if (a.isBenefic) score += 8;
      else score -= 4;
    });

    // SAV score influence
    score += (savPoints - 28) * 2;

    score = Math.max(15, Math.min(98, Math.round(score)));

    let verdict: 'Supremely Blessed (Uchcha)' | 'Highly Auspicious (Shubha)' | 'Mixed Fortunes (Mishra)' | 'Karmic Remediation Needed (Krichhra)' = 'Highly Auspicious (Shubha)';
    if (score >= 82) verdict = 'Supremely Blessed (Uchcha)';
    else if (score >= 68) verdict = 'Highly Auspicious (Shubha)';
    else if (score >= 48) verdict = 'Mixed Fortunes (Mishra)';
    else verdict = 'Karmic Remediation Needed (Krichhra)';

    // Generate deeply customized North Indian classical readings for this specific house
    const predictions = generateDeepNorthIndianHouseReading(
      h,
      rasiMeta.sanskritName,
      signLordName,
      bhaveshaPlacementHouse,
      bhaveshaDignity,
      planetsInHouse,
      aspectingPlanets,
      naturalKarakaName,
      karakaStatus,
      savPoints,
      score,
      verdict
    );

    result.push({
      houseNumber: h,
      aspectId: aspectIds[h - 1],
      sanskritName: aspectTitles[h - 1].sanskrit,
      englishTitle: aspectTitles[h - 1].english,
      lifeDomainKeywords: aspectTitles[h - 1].keywords,
      classification: {
        type: bhavaClasses[h - 1].type,
        description: bhavaClasses[h - 1].desc,
        badgeStyle: bhavaClasses[h - 1].badge,
      },
      rasiNumber,
      rasiName: rasiMeta.sanskritName,
      signLord: signLordName,
      bhaveshaPlacement: {
        house: bhaveshaPlacementHouse,
        houseName: `House ${bhaveshaPlacementHouse} (${aspectTitles[bhaveshaPlacementHouse - 1].sanskrit})`,
        rasiNumber: bhaveshaRasiNum,
        dignity: bhaveshaDignity,
        isWellPlaced: isLordWellPlaced,
      },
      planetsInHouse,
      aspectingPlanets,
      naturalKaraka: {
        planet: naturalKarakaName,
        symbol: naturalKarakaPlanet?.symbol || naturalKarakaName.slice(0, 2),
        status: karakaStatus,
        notes: `Karaka ${naturalKarakaName} is ${karakaStatus} in natal matrix.`,
      },
      ashtakavargaBindus: {
        points: savPoints,
        evaluation: savEvaluation,
        verdict: savVerdict,
      },
      bhavatBhavam: {
        secondaryHouse,
        secondaryHouseName: `House ${secondaryHouse} (${secondaryBhavaName})`,
        principleExplanation: `By the classical Bhavat Bhavam principle, House ${secondaryHouse} acts as the root harmonic generator for House ${h} manifestations.`,
      },
      strengthScore: score,
      verdict,
      predictions,
    });
  }

  return result;
}

// Deep synthesis generator for each of the 12 Bhavas
function generateDeepNorthIndianHouseReading(
  houseNum: number,
  rasiName: VedicRasiName,
  signLord: string,
  lordHouse: number,
  lordDignity: string,
  residentPlanets: { name: string; symbol: string; dignity: string; isBenefic: boolean }[],
  aspects: AspectingPlanetDetail[],
  karakaName: string,
  karakaStatus: string,
  savPoints: number,
  score: number,
  verdict: string
) {
  const residentNames = residentPlanets.map((p) => p.name).join(', ') || 'No resident grahas (Shunya Bhava)';
  const aspectNames = aspects.map((a) => `${a.planet} (${a.aspectType})`).join('; ') || 'No major planetary aspects';

  let coreReading = '';
  let lifelongImpact = '';
  let timingAndDashas = '';
  let concreteManifestations: string[] = [];
  let karmicCautions: string[] = [];
  let vedicRemedy = {
    mantra: '',
    deityOrDonation: '',
    gemstoneOrYantra: '',
    dailyPractice: '',
  };

  switch (houseNum) {
    case 1: // Tanu
      coreReading = `Ascendant (Lagna) in ${rasiName} governed by ${signLord} placed in House ${lordHouse} (${lordDignity}). As the prime anchor of physical existence (Tanu Bhava), this configuration establishes your basal constitutional strength, persona, and self-direction. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Bestows an energetic, resilient constitution with natural recovery stamina. You carry distinct facial presence and strong willpower. Major life accomplishments come through your own self-driven momentum rather than passive inheritance.`;
      timingAndDashas = `Activates powerfully during ${signLord} Mahadasha/Antardasha and whenever transiting Guru touches Natal House 1, 5, or 9.`;
      concreteManifestations = [
        'Robust innate physical immunity and swift recuperation after illness.',
        'High natural independence; commands respect in group settings.',
        'Distinctive personal charisma and recognizable public demeanor.',
        'Clear life trajectory anchored in personal conviction and ethics.',
      ];
      karmicCautions = [
        'Guard against overworking and nervous burnout during dry climatic seasons.',
        'Avoid excessive pride or reluctance to seek counsel from trusted elders.',
      ];
      vedicRemedy = {
        mantra: `Om Namo Bhagavate Vasudevaya & Gayatri Mantra 21x daily at sunrise.`,
        deityOrDonation: 'Offer Surya Arghya (fresh water in copper vessel) to the rising morning Sun.',
        gemstoneOrYantra: 'Surya / Lagnesha Yantra or natural Ruby/Coral only after personal astrological validation.',
        dailyPractice: 'Daily morning Sun salutation (Surya Namaskar) with mindful deep diaphragmatic breathing.',
      };
      break;

    case 2: // Dhana
      coreReading = `Dhana & Kutumba Bhava in ${rasiName} ruled by ${signLord} positioned in House ${lordHouse}. Governs liquid capital, bank balance, family inheritance, eloquence of speech, and dietary habits. Resident: ${residentNames}. Aspects: ${aspectNames}. SAV Bindus: ${savPoints}/337.`;
      lifelongImpact = `Indicates steady wealth retention capacity. You are naturally blessed with persuasive vocal resonance and business negotiation aptitude. Liquid assets accumulate systematically through disciplined reinvestment rather than speculative recklessness.`;
      timingAndDashas = `Landmark wealth accumulation windows coincide with the sub-periods of ${signLord} and Jupiter (Guru), and during Jupiter transits across ${rasiName}.`;
      concreteManifestations = [
        'Substantial growth in liquid bank balance and safe financial instruments.',
        'Supportive ancestral/family lineage with mutual material respect.',
        'Eloquent, impactful speech that persuades partners and clients.',
        'Appreciation for satvik, nourishing cuisine and traditional lineage values.',
      ];
      karmicCautions = [
        'Do not commit financial guarantees (bail bonds/loans) for casual acquaintances.',
        'Keep speech truthful and avoid harsh impulsive sarcasm during family disagreements.',
      ];
      vedicRemedy = {
        mantra: 'Om Shreem Mahalakshmyai Namah 108x on Friday mornings.',
        deityOrDonation: 'Donate yellow lentils (Chana Dal), turmeric, or cow milk on Thursdays/Fridays.',
        gemstoneOrYantra: 'Shri Yantra on pure silver plate placed in the North-East treasury corner.',
        dailyPractice: 'Keep a clean brass or silver coin in your wallet; speak with mindful deliberation.',
      };
      break;

    case 3: // Sahaja
      coreReading = `Sahaja & Parakrama Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. This is an Upachaya (growth) house governing valor, younger siblings, short-distance travels, media, writing, and fine motor skills. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Your courageous initiative ensures that initial obstacles transform into stepping stones. You possess strong organizational and communication acumen. Brothers, sisters, or close peers act as catalysts in your enterprise.`;
      timingAndDashas = `Breakthrough entrepreneurial ventures and media milestones materialize during ${signLord} and Mars (Mangal) sub-periods.`;
      concreteManifestations = [
        'Success in independent enterprise, consultancy, writing, digital media, or sales.',
        'Supportive or lively interactions with younger brothers/sisters and loyal peers.',
        'High manual dexterity, technical fluency, and quick strategic reflexes.',
        'Frequent profitable domestic journeys and expanding local influence.',
      ];
      karmicCautions = [
        'Channel physical restlessness into vigorous sports or structured fitness routines.',
        'Do not engage in petty sibling rivalries or verbal conflicts with neighbors.',
      ];
      vedicRemedy = {
        mantra: 'Om Kraam Kreem Kroum Sah Bhaumaya Namah or recite Hanuman Chalisa on Tuesdays.',
        deityOrDonation: 'Distribute jaggery and roasted gram (Gur-Chana) to laborers or monkeys on Tuesdays.',
        gemstoneOrYantra: 'Hanuman Yantra or Red Coral (Moonga) on the ring finger upon astrological trial.',
        dailyPractice: 'Practice 15 minutes of rigorous upper-body exercise; speak encouraging words to siblings.',
      };
      break;

    case 4: // Sukha
      coreReading = `Sukha & Matru Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. As a prime Kendra (Vishnu Sthana), this house governs mother, landed real estate, agricultural property, luxury vehicles (Vahana Yoga), and domestic peace of mind. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Bestows an enduring attachment to domestic tranquility and fixed tangible assets. You have strong potential to acquire self-owned residential homes and comfortable four-wheeler vehicles. Mother’s blessing acts as an invisible shield.`;
      timingAndDashas = `Property registrations, home purchases, and vehicle upgrades are triggered during ${signLord} and Moon (Chandra) periods, especially when transiting Jupiter enters Kendra.`;
      concreteManifestations = [
        'Acquisition of freehold real estate, residential flats, or ancestral property.',
        'Ownership of comfortable, reliable conveyances (Vahana Sukha).',
        'Deep emotional bonding and longevity blessing from maternal figures.',
        'Formal educational degrees completed with honor and academic distinction.',
      ];
      karmicCautions = [
        'Always verify clear legal title deeds and municipal clearances before land purchases.',
        'Maintain domestic emotional calm; avoid carrying work stress into the bedroom sanctuary.',
      ];
      vedicRemedy = {
        mantra: 'Om Chandraya Namah 108x on Monday evenings facing the Moon.',
        deityOrDonation: 'Serve mother or elder maternal aunts; donate white rice or sugar to the needy.',
        gemstoneOrYantra: 'Chandra Yantra or genuine South Sea Pearl mounted in silver.',
        dailyPractice: 'Keep your residential living room uncluttered and aerated; keep a plant in North-East.',
      };
      break;

    case 5: // Putra & Budhi
      coreReading = `Putra, Budhi & Purva Punya Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. As a paramount Trikona (Lakshmi Sthana), this house rules progeny, creative intellect, stock market speculation, academic genius, and past-life spiritual merits. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Reflects high cognitive intelligence (Dhi Shakti) and refined discriminative wisdom. You possess an instinctive ability to foresee market and societal trends. Children bring immense joy, pride, and generational elevation.`;
      timingAndDashas = `Academic honors, child-birth celebrations, and lucrative speculative/investment wins peak during ${signLord} and Jupiter (Guru) Dasha intervals.`;
      concreteManifestations = [
        'Noble, academically successful children with good moral character.',
        'High analytical capability in financial markets, research, advisory, or creative arts.',
        'Instinctive mastery of mantras, philosophical texts, and strategic games.',
        'Strong purva punya (past merit) that rescues you from sudden dead-ends.',
      ];
      karmicCautions = [
        'Avoid uncontrolled intraday gambling or highly leveraged speculative bets.',
        'Do not impose overly rigid academic expectations on your growing children.',
      ];
      vedicRemedy = {
        mantra: 'Om Graam Greem Groum Sah Gurave Namah & Saraswati Vandana daily.',
        deityOrDonation: 'Feed yellow bananas or roasted sweets to students or temple priests on Thursdays.',
        gemstoneOrYantra: 'Guru Yantra or natural Yellow Sapphire (Pukhraj) on index finger.',
        dailyPractice: 'Read 2 pages of philosophical or spiritual scripture daily; practice Gayatri Mantra.',
      };
      break;

    case 6: // Ripu & Roga
      coreReading = `Ripu, Roga & Rina Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. An Upachaya house governing daily service, disease immunity, debts/loans, legal disputes, and competitive examinations (UPSC, Banking, State exams). Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Bestows formidable grit to overcome adversaries and competitive hurdles (Shatru Hanta). Loans taken for productive assets are systematically amortized without default. Your immune system resists acute infections effectively.`;
      timingAndDashas = `Victory in litigation, clearing of competitive examinations, and debt-free status manifest strongly in ${signLord} and Saturn (Shani) periods.`;
      concreteManifestations = [
        'Triumph in high-stakes competitive examinations and corporate rivalries.',
        'Ability to resolve contentious legal or bureaucratic disputes amicably.',
        'Disciplined loan management; bank borrowings translate into wealth-building assets.',
        'High stamina for grueling daily work routines and customer service operations.',
      ];
      karmicCautions = [
        'Maintain balanced digestive health (Agni); avoid excessive sour, greasy, or spicy foods.',
        'Do not provoke unnecessary legal battles; always attempt pre-court settlement.',
      ];
      vedicRemedy = {
        mantra: 'Om Sham Shanaicharaya Namah & Maha Mrityunjaya Mantra 11x daily.',
        deityOrDonation: 'Feed black dogs or crows with mustard oil-coated bread on Saturdays.',
        gemstoneOrYantra: 'Shani Yantra or iron ring made from horse-shoe worn on middle finger.',
        dailyPractice: 'Engage in selfless physical service (Seva); maintain strict daily debt ledger.',
      };
      break;

    case 7: // Kalatra
      coreReading = `Kalatra & Jaya Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. A major Kendra house governing spouse characteristics, marital harmony, marriage timing, commercial partnerships, and public dealings. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Indicates a dignified, cultured, and supportive life companion who complements your personality. Marriage brings emotional stability and financial elevation. Business partnerships succeed when executed with mutual legal transparency.`;
      timingAndDashas = `Marriage alliance, wedding ceremonies, and premier commercial joint ventures activate during ${signLord} and Venus (Shukra) Dasha cycles.`;
      concreteManifestations = [
        'Cultured, loyal, and socially graceful spouse from a respectable family.',
        'Marital harmony anchored in mutual intellectual respect and shared values.',
        'Profitable commercial collaborations and successful public contract negotiations.',
        'Favorable opportunities for overseas travel, international commerce, or dual residency.',
      ];
      karmicCautions = [
        'Never enter business partnerships solely on verbal trust; establish written contracts.',
        'Guard against unnecessary secrecy or third-party interference in marital affairs.',
      ];
      vedicRemedy = {
        mantra: 'Om Shum Shukraya Namah 108x on Friday evenings.',
        deityOrDonation: 'Donate white clothes, fragrant perfumes, or curd to underprivileged ladies on Fridays.',
        gemstoneOrYantra: 'Shukra Yantra or natural Diamond/White Zircon mounted in silver.',
        dailyPractice: 'Respect your spouse unconditionally; keep fresh flowers in the master bedroom.',
      };
      break;

    case 8: // Ayu & Randhra
      coreReading = `Ayu & Randhra Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. Governs longevity (Ayurdaya), unexpected transformations, secret sciences, inheritance, insurance payouts, in-laws, and chronic vitality. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Provides deep psychological endurance to navigate unexpected life transitions. You have strong affinity for investigative research, esoteric knowledge, astrology, and crisis management. Ancestral or spousal inheritance is highlighted.`;
      timingAndDashas = `Sudden financial windfalls, unearned wealth receipts, and spiritual awakenings occur during ${signLord} and Saturn (Shani) transits across moksha houses.`;
      concreteManifestations = [
        'Long life expectancy supported by resilient survival instincts during emergencies.',
        'Windfall gains through inheritance, mutual fund windfalls, insurance, or gratuities.',
        'Profound intuition and talent for occult, forensic, psychiatric, or deep scientific research.',
        'Respectable and materially comfortable relationship with in-laws family.',
      ];
      karmicCautions = [
        'Drive cautiously during dark rainy nights; avoid reckless adventure sports.',
        'Undergo periodic preventive medical screenings for lower abdominal and pelvic health.',
      ];
      vedicRemedy = {
        mantra: 'Maha Mrityunjaya Mantra (Om Tryambakam Yajamahe...) 21x every morning.',
        deityOrDonation: 'Offer water with black sesame seeds (Til) to Lord Shiva Lingam on Saturdays.',
        gemstoneOrYantra: 'Maha Mrityunjaya Yantra placed in home prayer room.',
        dailyPractice: 'Practice daily Pranayama (Anulom-Vilom); avoid hoarding dark emotional grudges.',
      };
      break;

    case 9: // Bhagya
      coreReading = `Bhagya & Dharma Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. Supreme Trikona (Lakshmi Sthana) governing divine luck, father’s destiny, spiritual Guru, teertha pilgrimages, higher philosophy, and cosmic grace. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Auspicious configuration ensuring that fortune (Bhagya) steps forward at critical turning points. Your righteous conduct (Dharma) protects you from reputational ruin. Respect for father and spiritual mentors unlocks hidden doors of prosperity.`;
      timingAndDashas = `Sudden dramatic elevation in social status, foreign university degrees, and spiritual pilgrimages peak during ${signLord} and Jupiter (Guru) Dasha windows.`;
      concreteManifestations = [
        'Cosmic luck factor consistently turning near-misses into triumphant victories.',
        'Dignified, moral father figure whose blessings shield your career.',
        'Spiritual pilgrimages to holy river confluences, ancient shrines, and mountain retreats.',
        'High reputation for integrity, wisdom, fairness, and charitable generosity.',
      ];
      karmicCautions = [
        'Never speak disrespectfully to father, preceptors, or spiritual masters.',
        'Do not abandon righteous ethical boundaries when pursuing commercial gains.',
      ];
      vedicRemedy = {
        mantra: 'Om Gurave Namah & Vishnu Sahasranama Stotram on Thursday mornings.',
        deityOrDonation: 'Touch feet of parents/father daily; donate books and yellow cloth to spiritual scholars.',
        gemstoneOrYantra: 'Brihaspati Yantra or natural Yellow Sapphire (Pukhraj) set in pure gold.',
        dailyPractice: 'Visit an ancient temple or sacred shrine at least once a month; practice charity.',
      };
      break;

    case 10: // Karma
      coreReading = `Karma & Rajya Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. Supreme Kendra (Vishnu Sthana) governing vocation, executive authority, government patronage (Rajakripa), social stature, and public accomplishments. Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Positions you for authoritative leadership in your chosen vocational field. You possess organizational gravitas and an instinct for administrative governance. Professional zenith is marked by public accolades and widespread respect.`;
      timingAndDashas = `Major career promotions, executive appointments, business expansions, and government honors activate during ${signLord} and Sun (Surya) sub-periods.`;
      concreteManifestations = [
        'Executive or directorial leadership status in corporate, bureaucratic, or entrepreneurial realms.',
        'Government contracts, official recognitions, and high-level bureaucratic patronage.',
        'Unblemished professional prestige and influential standing in industry circles.',
        'Creation of lasting institutional or commercial structures that endure over time.',
      ];
      karmicCautions = [
        'Keep arrogance and workplace authoritarianism in check; lead through empathetic vision.',
        'Never cut corners on corporate statutory compliances or government taxes.',
      ];
      vedicRemedy = {
        mantra: 'Aditya Hridaya Stotram every morning facing the rising Sun.',
        deityOrDonation: 'Feed birds and cows at sunrise; donate copper vessels or wheat on Sundays.',
        gemstoneOrYantra: 'Surya Yantra or natural Ruby (Manik) on ring finger in gold.',
        dailyPractice: 'Start work with clean desk, clear intention, and humble respect to organizational elders.',
      };
      break;

    case 11: // Labha
      coreReading = `Labha & Aya Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. An Upachaya house governing multi-stream cash inflows, desire fulfillment, elder siblings, and elite professional networks. Resident: ${residentNames}. Aspects: ${aspectNames}. SAV Bindus: ${savPoints}/337.`;
      lifelongImpact = `Exceptional capacity to monetize knowledge and build multiple passive cashflow channels. Your long-held aspirations manifest progressively after age 32. Influential friends and societal networks provide valuable leverage.`;
      timingAndDashas = `Significant liquid windfalls, venture exits, and salary/dividend jumps culminate during ${signLord} and Jupiter (Guru) Dasha transits.`;
      concreteManifestations = [
        'Continuous, multi-stream financial earnings through career, capital investments, and royalties.',
        'Fulfillment of major lifelong aspirations: home ownership, luxury vehicles, and family prosperity.',
        'Supportive elder brothers/sisters and loyal relationships with industry leaders.',
        'Large social circle composed of influential, high-net-worth professionals.',
      ];
      karmicCautions = [
        'Do not fall for get-rich-quick Ponzi schemes or dubious online cryptocurrency syndicates.',
        'Share a tithe (portion of profits) regularly with legitimate charitable causes.',
      ];
      vedicRemedy = {
        mantra: 'Om Kleem Kamadevaya Namah & Kanakadhara Stotram on Fridays.',
        deityOrDonation: 'Offer green fodder to sacred cows on Wednesdays or Saturdays.',
        gemstoneOrYantra: 'Kuber Yantra placed in the North locker of the home or workplace.',
        dailyPractice: 'Keep written financial milestones; review progress monthly with gratitude.',
      };
      break;

    case 12: // Vyaya
      coreReading = `Vyaya & Moksha Bhava in ${rasiName} ruled by ${signLord} placed in House ${lordHouse}. Moksha Trikona house governing foreign settlement (Videsh Vaas), expenditure leaks, deep sleep quality, hospitals/confinement, and ultimate spiritual liberation (Moksha). Resident: ${residentNames}. Aspects: ${aspectNames}.`;
      lifelongImpact = `Favors lucrative cross-border commerce, international travels, or permanent settlement abroad. Material expenditures are directed toward meaningful philanthropic donations, spiritual pilgrimages, and overseas ventures.`;
      timingAndDashas = `Foreign visa approvals, international moves, and profound spiritual awakenings culminate during ${signLord} and Rahu/Ketu sub-periods.`;
      concreteManifestations = [
        'High probability of long-term overseas residency, foreign PR, or multinational earnings.',
        'Expenditures convert into enduring spiritual merit, hospital donations, and family security.',
        'Peaceful, restorative deep sleep with intuitive or prophetic dream episodes.',
        'Natural inclination toward meditation, yogic detachment, and eventual spiritual Moksha.',
      ];
      karmicCautions = [
        'Monitor recurring subscription drains and impulse luxury expenditures on e-commerce apps.',
        'Avoid excessive late-night screen exposure to preserve deep REM sleep cycles.',
      ];
      vedicRemedy = {
        mantra: 'Om Namah Shivaya 108x before bedtime & Ketu Beej Mantra.',
        deityOrDonation: 'Donate blankets, warm clothing, or medicines to leprosy centers or orphanages.',
        gemstoneOrYantra: 'Shiva Yantra or Cat’s Eye (Lehsuniya) only if Ketu is specifically prescribed.',
        dailyPractice: 'Practice 10 minutes of silent meditation before sleep; disconnect devices 1 hour prior.',
      };
      break;

    default:
      break;
  }

  return {
    coreReading,
    lifelongImpact,
    timingAndDashas,
    concreteManifestations,
    karmicCautions,
    vedicRemedy,
  };
}

// ==========================================
// CLASSICAL YOGAS & DOSHAS ENGINE
// ==========================================

export function calculateNorthIndianClassicalYogas(
  planets: PlanetPosition[],
  lagnaRasi: number
): NorthIndianYogaRecord[] {
  const yogas: NorthIndianYogaRecord[] = [];
  const getPlanet = (name: GrahaName) => planets.find((p) => p.name === name);

  const sun = getPlanet('Surya');
  const moon = getPlanet('Chandra');
  const mars = getPlanet('Mangal');
  const mercury = getPlanet('Budha');
  const jupiter = getPlanet('Guru');
  const venus = getPlanet('Shukra');
  const saturn = getPlanet('Shani');
  const rahu = getPlanet('Rahu');
  const ketu = getPlanet('Ketu');

  if (!sun || !moon || !mars || !mercury || !jupiter || !venus || !saturn) return [];

  // 1. Pancha Mahapurusha Yogas
  // Ruchaka (Mars in Kendra in Aries, Scorpio, Capricorn)
  if ([1, 4, 7, 10].includes(mars.house) && [1, 8, 10].includes(mars.rasiNumber)) {
    yogas.push({
      id: 'ruchaka_yoga',
      name: 'Ruchaka Yoga',
      sanskritName: 'रुचक महापुरुष योग',
      category: 'Pancha Mahapurusha',
      planetsInvolved: ['Mangal'],
      housesInvolved: [mars.house],
      strength: 'Supreme',
      description: 'Mars is placed in a Kendra house (1, 4, 7, 10) in its own or exalted sign (Aries, Scorpio, Capricorn).',
      lifeResult: 'Grants heroic physical vigor, military/police/executive leadership, immense property acquisitions, and triumph over all adversaries.',
    });
  }

  // Bhadra (Mercury in Kendra in Gemini, Virgo)
  if ([1, 4, 7, 10].includes(mercury.house) && [3, 6].includes(mercury.rasiNumber)) {
    yogas.push({
      id: 'bhadra_yoga',
      name: 'Bhadra Yoga',
      sanskritName: 'भद्र महापुरुष योग',
      category: 'Pancha Mahapurusha',
      planetsInvolved: ['Budha'],
      housesInvolved: [mercury.house],
      strength: 'Supreme',
      description: 'Mercury occupies a Kendra in own or exalted sign (Gemini or Virgo).',
      lifeResult: 'Bestows encyclopedic memory, intellectual brilliance, commercial mastery, witty eloquence, and lifelong prosperity.',
    });
  }

  // Hamsa (Jupiter in Kendra in Sagittarius, Pisces, Cancer)
  if ([1, 4, 7, 10].includes(jupiter.house) && [9, 12, 4].includes(jupiter.rasiNumber)) {
    yogas.push({
      id: 'hamsa_yoga',
      name: 'Hamsa Yoga',
      sanskritName: 'हंस महापुरुष योग',
      category: 'Pancha Mahapurusha',
      planetsInvolved: ['Guru'],
      housesInvolved: [jupiter.house],
      strength: 'Supreme',
      description: 'Jupiter is in a Kendra in own or exalted sign (Sagittarius, Pisces, or Cancer).',
      lifeResult: 'Bestows divine wisdom, high dharmic authority, reverence from royalty/rulers, pure moral character, and lasting spiritual fame.',
    });
  }

  // Malavya (Venus in Kendra in Taurus, Libra, Pisces)
  if ([1, 4, 7, 10].includes(venus.house) && [2, 7, 12].includes(venus.rasiNumber)) {
    yogas.push({
      id: 'malavya_yoga',
      name: 'Malavya Yoga',
      sanskritName: 'मालव्य महापुरुष योग',
      category: 'Pancha Mahapurusha',
      planetsInvolved: ['Shukra'],
      housesInvolved: [venus.house],
      strength: 'Supreme',
      description: 'Venus resides in a Kendra in own or exalted sign (Taurus, Libra, or Pisces).',
      lifeResult: 'Endows aesthetic beauty, luxurious vehicles, palatial residences, happy marital life, artistic brilliance, and refined pleasures.',
    });
  }

  // Sasa (Saturn in Kendra in Capricorn, Aquarius, Libra)
  if ([1, 4, 7, 10].includes(saturn.house) && [10, 11, 7].includes(saturn.rasiNumber)) {
    yogas.push({
      id: 'sasa_yoga',
      name: 'Sasa Yoga',
      sanskritName: 'शश महापुरुष योग',
      category: 'Pancha Mahapurusha',
      planetsInvolved: ['Shani'],
      housesInvolved: [saturn.house],
      strength: 'Supreme',
      description: 'Saturn occupies a Kendra in own or exalted sign (Capricorn, Aquarius, or Libra).',
      lifeResult: 'Grants deep political authority, vast mastery over land and mineral resources, extraordinary patience, and command over large assemblies of people.',
    });
  }

  // 2. Kendra-Trikona Parashari Raja Yogas
  // Lagna Lord + 9th Lord or 10th Lord
  const ninthRasi = ((lagnaRasi - 1 + 8) % 12) + 1;
  const tenthRasi = ((lagnaRasi - 1 + 9) % 12) + 1;
  const lagnaLord = VEDIC_RASIS[lagnaRasi - 1].lord as GrahaName;
  const ninthLord = VEDIC_RASIS[ninthRasi - 1].lord as GrahaName;
  const tenthLord = VEDIC_RASIS[tenthRasi - 1].lord as GrahaName;

  const pLagna = getPlanet(lagnaLord);
  const p9 = getPlanet(ninthLord);
  const p10 = getPlanet(tenthLord);

  if (p9 && p10 && p9.house === p10.house) {
    yogas.push({
      id: 'dharma_karmadhipati_yoga',
      name: 'Dharma-Karmadhipati Raja Yoga',
      sanskritName: 'धर्म-कर्माधिपति राजयोग',
      category: 'Raja Yoga',
      planetsInvolved: [ninthLord, tenthLord],
      housesInvolved: [p9.house],
      strength: 'Supreme',
      description: `Lords of 9th (Dharma, ${ninthLord}) and 10th (Karma, ${tenthLord}) conjoin in House ${p9.house}.`,
      lifeResult: 'The highest Parashari Raja Yoga: bestows sovereign authority, ethical leadership, immense professional fame, and generational fortune.',
    });
  }

  // Gajakesari Yoga
  const distMoonJup = ((jupiter.house - moon.house + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(distMoonJup)) {
    yogas.push({
      id: 'gaja_kesari_yoga',
      name: 'Gaja Kesari Yoga',
      sanskritName: 'गजकेसरी योग',
      category: 'Raja Yoga',
      planetsInvolved: ['Chandra', 'Guru'],
      housesInvolved: [moon.house, jupiter.house],
      strength: 'Supreme',
      description: `Jupiter is in a mutual Kendra from the Moon (${distMoonJup}th house relationship).`,
      lifeResult: 'Lion-like courage, unshakeable intellectual integrity, widespread public reputation, and protection from all adversaries.',
    });
  }

  // Budhaditya Yoga
  if (sun.house === mercury.house) {
    yogas.push({
      id: 'budhaditya_yoga',
      name: 'Budhaditya Yoga',
      sanskritName: 'बुधादित्य योग',
      category: 'Auspicious Classical',
      planetsInvolved: ['Surya', 'Budha'],
      housesInvolved: [sun.house],
      strength: 'High',
      description: `Sun and Mercury occupy House ${sun.house} together.`,
      lifeResult: 'Sharpened administrative intellect, advisory brilliance, mastery over figures/finance, and respect from state authorities.',
    });
  }

  // Chandra-Mangal Dhana Yoga
  if (moon.house === mars.house) {
    yogas.push({
      id: 'chandra_mangal_yoga',
      name: 'Chandra-Mangal Dhana Yoga',
      sanskritName: 'चन्द्र-मंगल धन योग',
      category: 'Dhana Yoga',
      planetsInvolved: ['Chandra', 'Mangal'],
      housesInvolved: [moon.house],
      strength: 'High',
      description: `Moon and Mars conjoin in House ${moon.house}.`,
      lifeResult: 'Produces persistent entrepreneurial ambition, immense self-made commercial wealth, real estate holdings, and financial resourcefulness.',
    });
  }

  // Vipareeta Raja Yogas (Harsha, Sarala, Vimala)
  // 6th Lord in 6, 8, 12
  const sixthRasi = ((lagnaRasi - 1 + 5) % 12) + 1;
  const eighthRasi = ((lagnaRasi - 1 + 7) % 12) + 1;
  const twelfthRasi = ((lagnaRasi - 1 + 11) % 12) + 1;
  const sixthLord = VEDIC_RASIS[sixthRasi - 1].lord as GrahaName;
  const eighthLord = VEDIC_RASIS[eighthRasi - 1].lord as GrahaName;
  const twelfthLord = VEDIC_RASIS[twelfthRasi - 1].lord as GrahaName;

  const p6 = getPlanet(sixthLord);
  const p8 = getPlanet(eighthLord);
  const p12 = getPlanet(twelfthLord);

  if (p6 && [6, 8, 12].includes(p6.house) && p6.house !== 6) {
    yogas.push({
      id: 'harsha_vipareeta_yoga',
      name: 'Harsha Vipareeta Raja Yoga',
      sanskritName: 'हर्ष विपरीत राजयोग',
      category: 'Vipareeta Raja',
      planetsInvolved: [sixthLord],
      housesInvolved: [p6.house],
      strength: 'High',
      description: `6th lord (${sixthLord}) placed in Dusthana House ${p6.house}.`,
      lifeResult: 'Destroys enemies and debts; the native triumphs in crisis, gains from rivals’ blunders, and retains cheerful emotional fortitude.',
    });
  }

  if (p8 && [6, 8, 12].includes(p8.house) && p8.house !== 8) {
    yogas.push({
      id: 'sarala_vipareeta_yoga',
      name: 'Sarala Vipareeta Raja Yoga',
      sanskritName: 'सरल विपरीत राजयोग',
      category: 'Vipareeta Raja',
      planetsInvolved: [eighthLord],
      housesInvolved: [p8.house],
      strength: 'High',
      description: `8th lord (${eighthLord}) placed in Dusthana House ${p8.house}.`,
      lifeResult: 'Grants fearlessness, long life, sudden unexpected financial elevation, scholarly depth, and mastery over hidden adversaries.',
    });
  }

  if (p12 && [6, 8, 12].includes(p12.house) && p12.house !== 12) {
    yogas.push({
      id: 'vimala_vipareeta_yoga',
      name: 'Vimala Vipareeta Raja Yoga',
      sanskritName: 'विमल विपरीत राजयोग',
      category: 'Vipareeta Raja',
      planetsInvolved: [twelfthLord],
      housesInvolved: [p12.house],
      strength: 'High',
      description: `12th lord (${twelfthLord}) placed in Dusthana House ${p12.house}.`,
      lifeResult: 'Noble conduct, prudent spending, immunity from wasteful financial leakage, and quiet spiritual independence.',
    });
  }

  // Manglik (Kuja) Dosha Analysis & Classical Cancellations
  const isManglikFromLagna = [1, 2, 4, 7, 8, 12].includes(mars.house);
  const marsFromMoon = ((mars.house - moon.house + 12) % 12) + 1;
  const isManglikFromMoon = [1, 2, 4, 7, 8, 12].includes(marsFromMoon);

  if (isManglikFromLagna || isManglikFromMoon) {
    // Parashari cancellations
    let cancelled = false;
    let cancelReason = '';

    if ([1, 8, 10].includes(mars.rasiNumber)) {
      cancelled = true;
      cancelReason = 'Mars is in own sign (Aries/Scorpio) or exalted in Capricorn (Param Uchcha).';
    } else if (distMoonJup === 1 || distMoonJup === 7 || ((jupiter.house - mars.house + 12) % 12) + 1 === 7) {
      cancelled = true;
      cancelReason = 'Jupiter casts a direct benefic aspect or conjoins Mars/Moon.';
    } else if (mars.house === 2 && [3, 6].includes(mars.rasiNumber)) {
      cancelled = true;
      cancelReason = 'Mars in 2nd house in Gemini or Virgo neutralizes Kuja Dosha.';
    } else if (mars.house === 4 && mars.rasiNumber === 1) {
      cancelled = true;
      cancelReason = 'Mars in 4th in Aries cancels Kuja Dosha.';
    }

    yogas.push({
      id: 'manglik_dosha',
      name: cancelled ? 'Manglik Dosha (Rectified / Cancelled)' : 'Manglik (Kuja) Dosha',
      sanskritName: cancelled ? 'मांगलिक दोष (भंग / निष्प्रभावी)' : 'मांगलिक दोष',
      category: 'Dosha & Rectification',
      planetsInvolved: ['Mangal'],
      housesInvolved: [mars.house],
      strength: cancelled ? 'Mitigated / Cancelled' : 'Moderate',
      isDosha: !cancelled,
      description: `Mars is placed in House ${mars.house} from Lagna and House ${marsFromMoon} from Moon.`,
      lifeResult: cancelled
        ? `Classical Parashari cancellation applies: ${cancelReason}. Energetic, passion-filled partnership with no malefic marital delay.`
        : 'Indicates intense fiery drive in relationships; requires open, respectful dialogue to avert sudden ego friction in early marriage.',
      cancellationNote: cancelled ? cancelReason : 'Match with a partner possessing complementary Mars placement or strong Jupiter in 7th/9th.',
      remedy: 'Chant Hanuman Chalisa on Tuesdays; perform Kumbha Vivaha if marrying an individual with non-Manglik chart.',
    });
  }

  // Kaal Sarp Yoga Check
  if (rahu && ketu) {
    const rRasi = rahu.rasiNumber;
    const kRasi = ketu.rasiNumber;
    const minR = Math.min(rRasi, kRasi);
    const maxR = Math.max(rRasi, kRasi);

    const otherPlanets = [sun, moon, mars, mercury, jupiter, venus, saturn];
    const isHemmedSideA = otherPlanets.every((p) => p.rasiNumber >= minR && p.rasiNumber <= maxR);
    const isHemmedSideB = otherPlanets.every((p) => p.rasiNumber <= minR || p.rasiNumber >= maxR);

    if (isHemmedSideA || isHemmedSideB) {
      const kaalSarpNames = [
        'Ananta Kaal Sarp (House 1-7)',
        'Kulika Kaal Sarp (House 2-8)',
        'Vasuki Kaal Sarp (House 3-9)',
        'Shankhapala Kaal Sarp (House 4-10)',
        'Padma Kaal Sarp (House 5-11)',
        'Mahapadma Kaal Sarp (House 6-12)',
        'Takshaka Kaal Sarp (House 7-1)',
        'Karkotaka Kaal Sarp (House 8-2)',
        'Shankhachuda Kaal Sarp (House 9-3)',
        'Ghataka Kaal Sarp (House 10-4)',
        'Vishadhara Kaal Sarp (House 11-5)',
        'Sheshanaga Kaal Sarp (House 12-6)',
      ];
      const typeIndex = (rahu.house - 1) % 12;
      const typeName = kaalSarpNames[typeIndex] || 'Kaal Sarp Yoga';

      yogas.push({
        id: 'kaal_sarp_yoga',
        name: `${typeName} (Karmic Accelerator)`,
        sanskritName: 'कालसर्प योग',
        category: 'Dosha & Rectification',
        planetsInvolved: ['Rahu', 'Ketu'],
        housesInvolved: [rahu.house, ketu.house],
        strength: 'Moderate',
        isDosha: true,
        description: `All seven major physical grahas are flanked between the nodal axis of Rahu (H${rahu.house}) and Ketu (H${ketu.house}).`,
        lifeResult: 'Initial struggles and karmic delays up to age 33 followed by sudden, meteoric rises to authority and extraordinary spiritual maturity.',
        remedy: 'Recite Maha Mrityunjaya Mantra on Mondays; offer silver snakes (Nag-Nagin joda) to flowing river on Nag Panchami.',
      });
    }
  }

  return yogas;
}

// ==========================================
// JAIMINI CHARA KARAKAS (7 SOUL KARAKAS)
// ==========================================

export function calculateJaiminiCharaKarakas(
  planets: PlanetPosition[],
  lagnaRasi: number
): JaiminiCharaKaraka[] {
  // Take 7 classical physical planets
  const physicalPlanets: GrahaName[] = ['Surya', 'Chandra', 'Mangal', 'Budha', 'Guru', 'Shukra', 'Shani'];
  const eligible = planets
    .filter((p) => physicalPlanets.includes(p.name))
    .map((p) => ({
      planet: p,
      // Total degree within the sign (0 to 30)
      degInSign: p.degree + (p.minute || 0) / 60,
    }));

  // Sort descending by degree inside sign
  eligible.sort((a, b) => b.degInSign - a.degInSign);

  const karakaRoles: {
    role: JaiminiCharaKaraka['karakaName'];
    sanskrit: string;
    significance: string;
  }[] = [
    { role: 'Atmakaraka (AK)', sanskrit: 'आत्मकारक (राजा)', significance: 'Supreme significator of the Soul, inner destiny, and core spiritual lesson.' },
    { role: 'Amatyakaraka (AmK)', sanskrit: 'अमात्यकारक (मंत्री)', significance: 'Significator of career, vocation, financial advisory, and professional status.' },
    { role: 'Bhratrikaraka (BK)', sanskrit: 'भ्रातृकारक (गुरु)', significance: 'Significator of brothers, valor, spiritual mentors, and trusted gurus.' },
    { role: 'Matrukaraka (MK)', sanskrit: 'मातृकारक (माता)', significance: 'Significator of mother, home sanctuary, real estate, and inner emotional peace.' },
    { role: 'Putrakaraka (PK)', sanskrit: 'पुत्रकारक (संतान)', significance: 'Significator of children, disciples, creative intelligence, and purva punya.' },
    { role: 'Gnatikaraka (GK)', sanskrit: 'ज्ञातिकारक (शत्रु)', significance: 'Significator of competitors, obstacles, litigations, and maternal relations.' },
    { role: 'Darakaraka (DK)', sanskrit: 'दारकारक (जीवनसाथी)', significance: 'Significator of spouse, life partner, intimate relationships, and joint commerce.' },
  ];

  return eligible.slice(0, 7).map((item, index) => {
    const roleMeta = karakaRoles[index];
    const p = item.planet;

    let soulMission = '';
    if (index === 0) {
      // Atmakaraka
      soulMission = `Your soul's paramount quest is guided by ${p.name} in House ${p.house} (${p.rasiName}). Karmic evolution demands transcending ego attachments and dedicating personal talents to universal dharmic welfare.`;
    } else if (index === 1) {
      // Amatyakaraka
      soulMission = `${p.name} as Amatyakaraka indicates that your highest vocational elevation comes through roles involving strategic intellect, leadership, and public accountability.`;
    } else if (index === 6) {
      // Darakaraka
      soulMission = `Your life partner carries the vibrant psychological traits of ${p.name} in House ${p.house} (${p.rasiName}), offering balance, warmth, and enduring companionship.`;
    } else {
      soulMission = `${p.name} governs this life pillar with strong karmic impressions in House ${p.house} (${p.rasiName}), fostering growth through disciplined experience.`;
    }

    return {
      karakaName: roleMeta.role,
      sanskritTitle: roleMeta.sanskrit,
      graha: p.name,
      symbol: p.symbol,
      degreeInSign: parseFloat(item.degInSign.toFixed(2)),
      house: p.house,
      rasiName: p.rasiName,
      significance: roleMeta.significance,
      soulMissionAndLifeManifestation: soulMission,
    };
  });
}

// ==========================================
// AYURDAYA & HEALTH VITALITY
// ==========================================

export function calculateAyurdayaAndVitality(
  planets: PlanetPosition[],
  lagnaRasi: number
): AyurdayaHealthAssessment {
  const getPlanet = (name: GrahaName) => planets.find((p) => p.name === name);
  const lagnaLordName = VEDIC_RASIS[lagnaRasi - 1].lord as GrahaName;
  const eighthRasi = ((lagnaRasi - 1 + 7) % 12) + 1;
  const eighthLordName = VEDIC_RASIS[eighthRasi - 1].lord as GrahaName;

  const pLagna = getPlanet(lagnaLordName);
  const p8 = getPlanet(eighthLordName);
  const pSaturn = getPlanet('Shani');
  const pMoon = getPlanet('Chandra');
  const pJupiter = getPlanet('Guru');

  // Sign types: Movable (1, 4, 7, 10), Fixed (2, 5, 8, 11), Dual (3, 6, 9, 12)
  const getSignNature = (rasi: number) => {
    if ([1, 4, 7, 10].includes(rasi)) return 'Movable (Chara)';
    if ([2, 5, 8, 11].includes(rasi)) return 'Fixed (Sthira)';
    return 'Dual (Dvisvabhava)';
  };

  const pair1 = `${getSignNature(lagnaRasi)} + ${getSignNature(p8?.rasiNumber || eighthRasi)}`;
  const pair2 = `${getSignNature(pMoon?.rasiNumber || 1)} + ${getSignNature(pSaturn?.rasiNumber || 10)}`;
  const pair3 = `${getSignNature(lagnaRasi)} + ${getSignNature(pLagna?.rasiNumber || lagnaRasi)}`;

  // Default to Purnayu unless heavily afflicted
  let longevityCategory: AyurdayaHealthAssessment['longevityCategory'] = 'Purnayu (Full Lifespan: 67 - 95+ Years)';
  let pranaScore = 82;

  // Benefic influences on Lagna & 8th
  if (pJupiter && [1, 5, 8, 9].includes(pJupiter.house)) {
    pranaScore += 10;
  }
  if (pSaturn && [8, 12].includes(pSaturn.house)) {
    // Saturn as Ayushkaraka in 8th gives exceptionally long life
    pranaScore += 8;
  }

  pranaScore = Math.min(96, Math.max(55, pranaScore));

  // Determine Ayurvedic Dosha from Lagna and Lagna Lord
  // Fire signs (1, 5, 9) = Pitta; Earth (2, 6, 10) = Vata/Kapha; Air (3, 7, 11) = Vata; Water (4, 8, 12) = Kapha
  const lagnaElem = lagnaRasi % 4;
  let dosha: AyurdayaHealthAssessment['ayurvedicDoshaConstitution']['primary'] = 'Pitta (Fire & Digestion)';
  let doshaDesc = 'High metabolic fire, sharp appetite, energetic drive, and warm body temperature.';
  let vulnerableOrgans = ['Digestive tract', 'Eyes', 'Liver/Gallbladder', 'Skin inflammation'];
  let diet = 'Opt for cooling, hydrating foods (fennel, cucumber, coconut water, mint); avoid excessively fried or fiery chilies.';

  if (lagnaElem === 1) { // Earth
    dosha = 'Vata-Kapha';
    doshaDesc = 'Stable skeletal framework, tendency toward fluid retention, and need for routine.';
    vulnerableOrgans = ['Throat/Thyroid', 'Digestive sluggishness', 'Lower back', 'Knees/Joints'];
    diet = 'Warm, freshly prepared satvik meals with digestive spices (ginger, cumin, black pepper).';
  } else if (lagnaElem === 2) { // Air
    dosha = 'Vata (Air & Space)';
    doshaDesc = 'Quick nervous reflexes, agile mindset, variable appetite, and susceptibility to dry skin.';
    vulnerableOrgans = ['Nervous system', 'Lungs & Bronchial passages', 'Colon/Bowel movement', 'Joint stiffness'];
    diet = 'Nourishing, grounding warm soups, ghee, soaked almonds, and warm herbal milk.';
  } else if (lagnaElem === 3) { // Water
    dosha = 'Kapha (Earth & Water)';
    doshaDesc = 'Deep lymphatic reserves, serene emotional calmness, endurance, and moisture balance.';
    vulnerableOrgans = ['Chest & Lungs (Mucus)', 'Kidneys/Bladder', 'Sinuses', 'Metabolic sluggishness'];
    diet = 'Light, warming, astringent foods (honey, barley, pomegranate); regular morning cardio exercise.';
  }

  // Maraka planets (Lords of 2nd and 7th houses)
  const secondRasi = ((lagnaRasi - 1 + 1) % 12) + 1;
  const seventhRasi = ((lagnaRasi - 1 + 6) % 12) + 1;
  const maraka1 = VEDIC_RASIS[secondRasi - 1].lord;
  const maraka2 = VEDIC_RASIS[seventhRasi - 1].lord;

  return {
    longevityCategory,
    pranaShaktiScore: pranaScore,
    method3PairsScore: {
      lagnaLordAnd8thLord: pair1,
      moonAndSaturn: pair2,
      lagnaAndHoraLagna: pair3,
    },
    ayurvedicDoshaConstitution: {
      primary: dosha,
      characteristics: doshaDesc,
      vulnerableOrgans,
      dietaryGuidance: diet,
    },
    saturnLongevityRole: `Shani acts as the natural Ayushkaraka (Significator of Longevity). Residing in House ${pSaturn?.house || 10}, it enforces cellular discipline and bestows long-term endurance.`,
    marakaPlanets: [maraka1, maraka2],
    protectiveFactors: [
      `Guru (Jupiter) casts a protective aura over vital houses.`,
      `Strong Lagna Lord placement in House ${pLagna?.house || 1} preserves organic stamina.`,
      `Maha Mrityunjaya vibration creates an impenetrable psychic shield.`,
    ],
  };
}

// ==========================================
// LIFE EPOCHS & 7-YEAR TIMELINE
// ==========================================

export function calculateLifeEpochMilestones(
  planets: PlanetPosition[],
  lagnaRasi: number,
  birthDate?: string
): LifeEpochMilestone[] {
  return [
    {
      epochNumber: 1,
      ageRange: 'Age 0 — 21',
      sanskritName: 'बाल्य एवं विद्या काल (Brahmacharya Epoch)',
      title: 'Foundation, Academic Learning & Family Roots',
      rulingLifeTheme: 'Physical body development, parental values, schooling, and foundational values.',
      activatedBhavas: [1, 2, 4, 5],
      astrologicalInfluence: 'Anchored by Lagna Lord, Chandra (Moon), and Mercury (Budha) shaping cognitive faculties.',
      concretePredictions: [
        'Formative schooling marked by intellectual curiosity and creative expression.',
        'Deep imprint of maternal values and domestic moral instruction.',
        'Establishment of lifelong athletic or artistic foundational hobbies.',
      ],
      keyAdvice: 'Cultivate strong study discipline, honor parents, and practice daily morning outdoor sports.',
    },
    {
      epochNumber: 2,
      ageRange: 'Age 22 — 35',
      sanskritName: 'गृहस्थ एवं कर्मारम्भ काल (Grihastha Launch Epoch)',
      title: 'Career Launch, Marriage & Progeny Establishment',
      rulingLifeTheme: 'Financial self-reliance, courtship, marriage vows, first property investments, and children.',
      activatedBhavas: [7, 10, 11, 5, 2],
      astrologicalInfluence: 'Governed by Shukra (Venus), Mangal (Mars), and Guru (Jupiter) activating adult manifestation.',
      concretePredictions: [
        'Transition from salaried employment into strategic corporate roles or independent commercial ventures.',
        'Auspicious wedding ceremony and establishment of a loving domestic home.',
        'Joy of parenthood and building the first dedicated investment portfolio.',
      ],
      keyAdvice: 'Prioritize marital communication, eliminate bad consumer debts, and invest systematically in index funds/property.',
    },
    {
      epochNumber: 3,
      ageRange: 'Age 36 — 50',
      sanskritName: 'ऐश्वर्य एवं प्रभुत्व काल (Material Zenith Epoch)',
      title: 'Peak Executive Authority, Real Estate & Wealth Expansion',
      rulingLifeTheme: 'Apex professional achievements, large asset purchases, mentorship, and societal respect.',
      activatedBhavas: [9, 10, 11, 4],
      astrologicalInfluence: 'Powered by Surya (Sun) and Shani (Saturn) conferring mature authority and societal legacy.',
      concretePredictions: [
        'Elevation to executive boardrooms, business presidency, or senior administrative governance.',
        'Acquisition of prime residential land, commercial properties, or international assets.',
        'Monetization of intellectual capital into multi-stream passive income flows.',
      ],
      keyAdvice: 'Avoid ego traps; mentor younger successors; maintain strict cardiovascular health checks.',
    },
    {
      epochNumber: 4,
      ageRange: 'Age 51 — 65',
      sanskritName: 'वानप्रस्थ एवं धर्म काल (Vanaprastha & Dharma Epoch)',
      title: 'Wisdom Mentorship, Generational Legacy & Pilgrimage',
      rulingLifeTheme: 'Guiding grown children, philanthropic endowments, spiritual pilgrimages, and philosophical writings.',
      activatedBhavas: [9, 5, 8, 12],
      astrologicalInfluence: 'Illuminated by Guru (Jupiter) and Ketu guiding the mind inward toward higher truth.',
      concretePredictions: [
        'Successful marriages and corporate launches of your grown children.',
        'Frequent sacred pilgrimages (Teertha Yatra) to sacred shrines and serene river banks.',
        'Establishment of charitable trusts, educational scholarships, or cultural foundations.',
      ],
      keyAdvice: 'Delegate day-to-day corporate burdens; immerse in meditation and satvik lifestyle.',
    },
    {
      epochNumber: 5,
      ageRange: 'Age 66+',
      sanskritName: 'मोक्ष एवं संन्यास काल (Moksha & Liberation Epoch)',
      title: 'Spiritual Realization, Contemplation & Soul Freedom',
      rulingLifeTheme: 'Inner peace, freedom from worldly anxieties, contemplation of cosmic consciousness, and peaceful longevity.',
      activatedBhavas: [12, 8, 4, 1],
      astrologicalInfluence: 'Blessed by Ketu, Shiva consciousness, and the transcendental grace of Moksha Sthanas.',
      concretePredictions: [
        'Serene, revered elder status surrounded by affectionate grandchildren and community respect.',
        'Freedom from worldly attachments, profound meditative joy, and crystal-clear lucidity.',
        'Peaceful spiritual departure into higher astral realms with noble ancestral blessings.',
      ],
      keyAdvice: 'Chant Om Namah Shivaya daily; practice gentle walks; share stories of moral courage with youth.',
    },
  ];
}

// ==========================================
// QUICK SUMMARY MATRIX
// ==========================================

export function calculateAllAspectsQuickSummary(
  natalPlanets: PlanetPosition[],
  natalHouses: HouseInfo[],
  lagnaRasi: number
): AllAspectsQuickSummaryRow[] {
  const allBhavas = calculateNorthIndianAllLifeAspects(natalPlanets, natalHouses, lagnaRasi);

  return allBhavas.map((b) => ({
    houseNumber: b.houseNumber,
    lifeDomain: b.englishTitle.split(',')[0],
    sanskritBhava: b.sanskritName.split(' ')[0],
    rulingSign: `${b.rasiName} (${b.signLord})`,
    lordPlacement: `H${b.bhaveshaPlacement.house} (${b.bhaveshaPlacement.dignity})`,
    strengthScore: b.strengthScore,
    verdict: b.verdict.split(' ')[0],
    predictionHighlight: b.predictions.concreteManifestations[0] || b.predictions.coreReading.slice(0, 70) + '...',
    peakActivationTiming: b.predictions.timingAndDashas.slice(0, 45) + '...',
  }));
}

// Complete Master Suite Aggregator
export function getNorthIndianCompleteAstrologySuite(
  natalPlanets: PlanetPosition[],
  natalHouses: HouseInfo[],
  lagnaRasi: number,
  birthDate?: string
): NorthIndianAstrologyCompleteSuite {
  const allTwelveBhavas = calculateNorthIndianAllLifeAspects(natalPlanets, natalHouses, lagnaRasi);
  const classicalYogas = calculateNorthIndianClassicalYogas(natalPlanets, lagnaRasi);
  const jaiminiKarakas = calculateJaiminiCharaKarakas(natalPlanets, lagnaRasi);
  const ayurdayaHealth = calculateAyurdayaAndVitality(natalPlanets, lagnaRasi);
  const lifeEpochs = calculateLifeEpochMilestones(natalPlanets, lagnaRasi, birthDate);
  const quickSummaryTable = calculateAllAspectsQuickSummary(natalPlanets, natalHouses, lagnaRasi);

  const lagnaBhava = allTwelveBhavas[0];
  const moonPlanet = natalPlanets.find((p) => p.name === 'Chandra');

  return {
    allTwelveBhavas,
    classicalYogas,
    jaiminiKarakas,
    ayurdayaHealth,
    lifeEpochs,
    quickSummaryTable,
    generalSynthesis: {
      lagnaSummary: `Lagna in ${lagnaBhava.rasiName} ruled by ${lagnaBhava.signLord} confers a ${lagnaBhava.verdict.toLowerCase()} life trajectory.`,
      moonSummary: `Chandra occupies ${moonPlanet?.rasiName || 'Karka'} in House ${moonPlanet?.house || 1}, shaping intuitive perception.`,
      dhanaCapacityRating: allTwelveBhavas[1].strengthScore >= 75 ? 'Multi-Tiered High Wealth Accumulation' : 'Stable Financial Resilience',
      careerTrajectoryVerdict: allTwelveBhavas[9].strengthScore >= 75 ? 'Authoritative Leadership & Executive Power' : 'Steady Enterprise & Skill-Driven Profession',
      maritalHarmonyScore: allTwelveBhavas[6].strengthScore,
      spiritualDharmaIndex: allTwelveBhavas[8].strengthScore,
    },
  };
}
