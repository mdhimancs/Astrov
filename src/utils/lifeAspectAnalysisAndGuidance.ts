import { PlanetPosition, HouseInfo } from '../types';
import { VEDIC_RASIS } from '../data';

// ==========================================
// TYPES FOR LIFE ASPECT ANALYSIS & PROBABILITY
// ==========================================

export type AspectProbabilityTier =
  | 'Very High (85-98%)'
  | 'High (70-84%)'
  | 'Moderate (50-69%)'
  | 'Guarded / Challenging (35-49%)'
  | 'Low (15-34%)';

export interface AspectProbabilityItem {
  id: string;
  title: string;
  sanskritTitle: string;
  category: 'vital_events' | 'career_wealth' | 'family_relationships' | 'karmic_risks';
  probability: number; // 0 - 100
  probabilityTier: AspectProbabilityTier;
  verdict: string;
  governingHouses: number[];
  keyPlanets: string[];
  yogasDetected: string[];
  timingWindow: string;
  detailedAnalysis: string;
  protectiveMeasures: string;
  metrics: { label: string; value: string; score: number }[];
}

// ==========================================
// TYPES FOR PERSONALIZED LIFE GUIDANCE
// ==========================================

export interface EducationStreamOption {
  stream: string;
  suitabilityScore: number;
  rulingPlanets: string[];
  keyCareers: string[];
  rationale: string;
}

export interface OccupationOption {
  role: string;
  alignmentScore: number;
  archetype: 'Leadership & Governance' | 'Commercial & Enterprise' | 'Technical & Advisory' | 'Creative & Media';
  industry: string;
  rationale: string;
}

export interface CareerTransitionWindow {
  window: string;
  type: 'Promotion & Recognition' | 'Strategic Job Switch' | 'Department / City Transfer' | 'Salary Revision';
  favorabilityScore: number;
  astrologicalTrigger: string;
}

export interface MaxWealthProjection {
  peakNetWorthTier: string;
  dhanaYogaMultiplier: number;
  induLagnaScore: number;
  peakWealthAgeRange: string;
  peakWealthMahadasha: string;
  assetAllocation: {
    realEstate: number;
    goldAndCommodities: number;
    equityAndMarkets: number;
    businessEnterprise: number;
    liquidTreasury: number;
  };
  wealthSummary: string;
  wealthDrivers: string[];
  cautionaryLeakingHoles: string[];
}

export interface LifeGuidanceProfile {
  education: {
    recommendedStream: string;
    streamOptions: EducationStreamOption[];
    examSuccessProbability: number;
    optimalStudyEnvironment: string;
    higherEducationAbroadProbability: number;
  };
  occupation: {
    primaryVocation: string;
    careerArchetype: string;
    occupationOptions: OccupationOption[];
    workCultureSuitability: string;
    independentVsJobRatio: { business: number; salariedJob: number };
  };
  foreignVsMotherland: {
    settlementVerdict: 'Strong Foreign Settlement Favored' | 'Prosperity in Native Motherland' | 'Dual-Base / Cross-Border Career';
    foreignStayProbability: number;
    motherlandProsperityScore: number;
    favorableGlobalDirections: string[];
    travelTiming: string;
    rationale: string;
  };
  careerTransition: {
    nextPromotionProbability: number;
    jobSwitchTiming: string;
    transferLikelihood: number;
    expectedSalaryHikeMultiplier: string;
    transitionWindows: CareerTransitionWindow[];
  };
  maxWealth: MaxWealthProjection;
  vastuAndDirections: {
    auspiciousFacing: string;
    workDeskFacing: string;
    sleepingHeadDirection: string;
    luckyColor: string;
    luckyDay: string;
  };
  businessPartnerGuidance: {
    idealPartnerSigns: string[];
    essentialTraits: string[];
    criticalRedFlags: string[];
    partnershipSuccessScore: number;
  };
  atmakarakaMission: {
    planet: string;
    soulLesson: string;
    dharmicCalling: string;
  };
  personality: {
    strongPoints: string[];
    weakPoints: string[];
    stages: {
      childhood: string;
      teenage: string;
      adult: string;
    };
  };
  lifeAspects: {
    wealth: string;
    housesProperty: string;
    marriage: string;
    jobBusiness: string;
    nameFameReputation: string;
  };
  higherKnowledge: {
    lifePathGuidance: string;
    mysticism: string;
  };
}

// ==========================================
// COMPUTATION ENGINE
// ==========================================

export function computeLifeAspectProbabilities(
  natalPlanets: PlanetPosition[],
  natalHouses: HouseInfo[],
  lagnaRasi: number
): AspectProbabilityItem[] {
  // Helper functions
  const getHouseLord = (houseNum: number): string => {
    const rasiIdx = (lagnaRasi + houseNum - 2) % 12;
    return VEDIC_RASIS[rasiIdx]?.lord || 'Guru';
  };

  const getPlanet = (name: string): PlanetPosition | undefined =>
    natalPlanets.find((p) => p.name === name);

  const getHouseOfPlanet = (planetName: string): number => {
    const pl = getPlanet(planetName);
    if (!pl) return 1;
    if (pl.house) return pl.house;
    for (const h of natalHouses) {
      if (h.planets.some((p) => p.name === planetName)) {
        return h.houseNumber;
      }
    }
    // Fallback based on sign
    return ((pl.rasiNumber - lagnaRasi + 12) % 12) + 1;
  };

  const isPlanetInGoodHouse = (planetName: string): boolean => {
    const h = getHouseOfPlanet(planetName);
    return [1, 4, 5, 7, 9, 10, 11].includes(h);
  };

  // Specific planetary positions
  const sunHouse = getHouseOfPlanet('Surya');
  const moonHouse = getHouseOfPlanet('Chandra');
  const marsHouse = getHouseOfPlanet('Mangal');
  const mercHouse = getHouseOfPlanet('Budha');
  const jupHouse = getHouseOfPlanet('Guru');
  const venHouse = getHouseOfPlanet('Shukra');
  const satHouse = getHouseOfPlanet('Shani');
  const rahuHouse = getHouseOfPlanet('Rahu');
  const ketuHouse = getHouseOfPlanet('Ketu');

  const h4Lord = getHouseLord(4);
  const h5Lord = getHouseLord(5);
  const h7Lord = getHouseLord(7);
  const h10Lord = getHouseLord(10);
  const h11Lord = getHouseLord(11);

  // 1. BUSINESS VS JOB / ENTREPRENEURSHIP
  let businessScore = 50;
  if ([7, 10, 11, 2, 3].includes(mercHouse)) businessScore += 14;
  if ([1, 10, 11].includes(sunHouse)) businessScore += 10;
  if ([10, 11, 7].includes(jupHouse)) businessScore += 10;
  if (getHouseOfPlanet(h7Lord) === 10 || getHouseOfPlanet(h10Lord) === 7) businessScore += 12;
  if (rahuHouse === 10 || rahuHouse === 11) businessScore += 8;
  if (satHouse === 6 || satHouse === 10) businessScore -= 6; // Strong service inclination
  businessScore = Math.max(25, Math.min(94, businessScore));

  const businessTier: AspectProbabilityTier =
    businessScore >= 80 ? 'Very High (85-98%)' : businessScore >= 70 ? 'High (70-84%)' : 'Moderate (50-69%)';

  const businessItem: AspectProbabilityItem = {
    id: 'business',
    title: 'Business & Entrepreneurship Success',
    sanskritTitle: 'व्यापार व वाणिज्य योग (Vyapar)',
    category: 'career_wealth',
    probability: businessScore,
    probabilityTier: businessTier,
    verdict:
      businessScore >= 70
        ? 'Excellent commercial acumen. Independent enterprise and trade ventures yield far higher financial returns than standard salaried service.'
        : 'Hybrid or progressive path favored: Build deep industry mastery in a structured executive role before launching proprietary enterprise.',
    governingHouses: [7, 10, 11, 3],
    keyPlanets: ['Budha', 'Surya', 'Guru', 'Rahu'],
    yogasDetected: [
      businessScore >= 70 ? 'Vanik Yoga (Mercurial Trade)' : 'Karmic Vyapar Yoga',
      [10, 11].includes(mercHouse) ? 'Budhaditya Business Intelligence' : 'Lakshmi Dhana Aspect',
      rahuHouse === 11 ? 'Rahu Labha Windfall Trade' : 'Dharma-Karmadhipati Synergy',
    ],
    timingWindow: 'Peak business inception window: Age 30–34, especially during Mercury, Sun, or Jupiter sub-dasha.',
    detailedAnalysis: `The 7th house governs contractual trade, retail, and public transactions, while the 10th and 11th bhavas govern executive authority and profit margins. With Budha (Mercury) in House ${mercHouse} and Surya in House ${sunHouse}, your chart displays ${businessScore >= 70 ? 'powerful entrepreneurial resilience and strategic risk tolerance' : 'prudent commercial judgment backed by systematic execution'}. Partnership vs Solopreneur: ${[1, 5, 9].includes(getHouseOfPlanet(h7Lord)) ? 'Independent ownership or unequal equity partnerships are most profitable' : 'Strategic technical co-founders create multiplicative value'}.`,
    protectiveMeasures: 'Incorporate business ventures on auspicious Wednesdays or Thursdays during Shukla Paksha. Keep commercial accounts audited without ambiguity.',
    metrics: [
      { label: 'Trade Acumen (Budha)', value: `${Math.min(98, businessScore + 5)}%`, score: Math.min(98, businessScore + 5) },
      { label: 'Capital Expansion (Guru)', value: `${isPlanetInGoodHouse('Guru') ? 85 : 65}%`, score: isPlanetInGoodHouse('Guru') ? 85 : 65 },
      { label: 'Market Dominance', value: `${businessScore}%`, score: businessScore },
    ],
  };

  // 2. PROPERTY PURCHASE YOGA
  let purchaseScore = 52;
  if ([4, 1, 9, 10, 11].includes(marsHouse)) purchaseScore += 18;
  if ([4, 2, 11].includes(venHouse)) purchaseScore += 14;
  if ([4, 9, 1, 5].includes(jupHouse)) purchaseScore += 10;
  purchaseScore = Math.max(30, Math.min(96, purchaseScore));

  const purchaseTier: AspectProbabilityTier =
    purchaseScore >= 80 ? 'Very High (85-98%)' : purchaseScore >= 68 ? 'High (70-84%)' : 'Moderate (50-69%)';

  const purchaseItem: AspectProbabilityItem = {
    id: 'property_purchase',
    title: 'Property Purchase Potential',
    sanskritTitle: 'भूमि-गृह क्रय योग (Bhoomi Kraya)',
    category: 'vital_events',
    probability: purchaseScore,
    probabilityTier: purchaseTier,
    verdict: purchaseScore >= 72
      ? 'Strong Bhoomi-Kraya Yoga: Exceptional likelihood of purchasing prime land, houses, or independent villas.'
      : 'Steady accumulation of real estate assets favored, with acquisition likely during auspicious transit cycles.',
    governingHouses: [4, 2, 11],
    keyPlanets: ['Mangal', 'Shukra', 'Guru'],
    yogasDetected: [
      marsHouse === 4 || marsHouse === 1 ? 'Bhoomi Karaka Yoga' : 'Property Acquisition Yoga',
      venHouse === 4 ? 'Malavya Mansion Yoga' : 'Real Estate Dhan Yoga',
    ],
    timingWindow: 'Optimal purchase window: During Mars or Jupiter transit over 4th or 11th houses.',
    detailedAnalysis: 'The 4th House governs land and fixed assets. Mars acts as the architect, while Venus provides the resources for luxury.',
    protectiveMeasures: 'Purchase land/home on auspicious days in Shukla Paksha.',
    metrics: [
      { label: 'Land Acquisition (Mangal)', value: `${purchaseScore}%`, score: purchaseScore },
      { label: 'Asset Value (Shukra)', value: `${isPlanetInGoodHouse('Shukra') ? 88 : 70}%`, score: isPlanetInGoodHouse('Shukra') ? 88 : 70 },
    ],
  };

  // 3. PROPERTY SALE YOGA
  let saleScore = 50;
  const h4LordHouse = getHouseOfPlanet(h4Lord);
  if ([8, 12].includes(h4LordHouse)) saleScore += 22; // 4th lord in 8/12 implies change/loss/sale
  if ([6, 8, 12].includes(marsHouse)) saleScore += 15; // Mars in malefic houses can drive sale
  if (satHouse === 4 || satHouse === 8) saleScore += 12;
  saleScore = Math.max(25, Math.min(95, saleScore));

  const saleTier: AspectProbabilityTier =
    saleScore >= 80 ? 'Very High (85-98%)' : saleScore >= 68 ? 'High (70-84%)' : 'Moderate (50-69%)';

  const saleItem: AspectProbabilityItem = {
    id: 'property_sale',
    title: 'Property Sale Potential',
    sanskritTitle: 'भूमि-गृह विक्रय योग (Bhoomi Vikraya)',
    category: 'vital_events',
    probability: saleScore,
    probabilityTier: saleTier,
    verdict: saleScore >= 70
      ? 'Active Property Monetization Yoga: Favorable periods for liquidating fixed assets for reinvestment or capital restructuring.'
      : 'Potential for strategic asset disposal when supported by dasha/transit triggers, particularly during 4th/12th house activations.',
    governingHouses: [4, 8, 12],
    keyPlanets: ['Mangal', 'Shani', 'Rahu'],
    yogasDetected: [
      h4LordHouse === 12 ? 'Asset Liquidation Yoga' : 'Property Sale Yoga',
      'Dhana-Vriddhi through Asset Realization',
    ],
    timingWindow: 'Optimal sale window: When the 12th lord or Rahu activates the 4th house or lord.',
    detailedAnalysis: 'The 4th house lord in 8th/12th houses often triggers the transfer, sale, or sudden change in ownership of real estate.',
    protectiveMeasures: 'Ensure documentation is thorough to avoid complications during asset disposal.',
    metrics: [
      { label: 'Liquidity Potential', value: `${saleScore}%`, score: saleScore },
      { label: 'Market Timing (Rahu)', value: `${[8, 12].includes(rahuHouse) ? 90 : 65}%`, score: [8, 12].includes(rahuHouse) ? 90 : 65 },
    ],
  };

  // 3. EXTRA MARITAL AFFAIRS & MARITAL FIDELITY VULNERABILITIES
  let affairRisk = 22;
  // Classical combinations: Rahu in 7th or 12th, Venus-Mars conjunction or aspect, Venus in dual rasi, 7th lord in 6th/8th/12th
  if (rahuHouse === 7 || rahuHouse === 12) affairRisk += 26;
  if (Math.abs(venHouse - marsHouse) === 0 || Math.abs(venHouse - marsHouse) === 6) affairRisk += 18; // Venus-Mars aspect
  if (rahuHouse === venHouse) affairRisk += 16;
  if ([6, 8, 12].includes(getHouseOfPlanet(h7Lord))) affairRisk += 10;
  // Protective factors: Jupiter aspecting 7th house, Venus, or Lagna
  if ([1, 3, 5, 7, 9, 11].includes(jupHouse) && Math.abs(jupHouse - 7) <= 2) affairRisk -= 18;
  if (isPlanetInGoodHouse('Guru')) affairRisk -= 12;
  if (satHouse === 7) affairRisk -= 8; // Saturn gives loyalty/restraint
  affairRisk = Math.max(12, Math.min(84, affairRisk));

  const affairTier: AspectProbabilityTier =
    affairRisk >= 65 ? 'High (70-84%)' : affairRisk >= 45 ? 'Moderate (50-69%)' : affairRisk >= 25 ? 'Guarded / Challenging (35-49%)' : 'Low (15-34%)';

  const affairItem: AspectProbabilityItem = {
    id: 'extra_marital_affairs',
    title: 'Marital Fidelity & Affair Vulnerabilities',
    sanskritTitle: 'पर-स्त्री/पुरुष आकर्षण व संयम योग (Vivaha Shuchi)',
    category: 'karmic_risks',
    probability: affairRisk,
    probabilityTier: affairTier,
    verdict:
      affairRisk >= 50
        ? 'Heightened sensory romantic temptations during Rahu/Venus dasha transits. Conscious emotional boundaries and transparent marital communication are vital.'
        : 'High moral integrity and foundational dharmic loyalty. Strong Jupiter/Saturn influences shield the native from disruptive external romantic entanglement.',
    governingHouses: [7, 5, 12, 8],
    keyPlanets: ['Shukra', 'Rahu', 'Mangal', 'Guru'],
    yogasDetected: [
      rahuHouse === 7 || rahuHouse === 12 ? 'Rahu-Kalatra Maya Yoga (Sensory Illusion)' : 'Satya-Dharma Marital Protection',
      affairRisk >= 45 ? 'Kama-Karaka Sensual Amplification' : 'Brihaspati Moral Armor',
      'Navamsha (D9) Saptama Balance',
    ],
    timingWindow: 'Vulnerability window: Rahu-Venus, Venus-Mars, or Rahu-Moon Antardashas, and Saturn transit over natal 7th house.',
    detailedAnalysis: `In classical Parashari Jyotish, external romantic attraction is examined through the interplay of Venus (sensory desire), Mars (impulsive passion), and Rahu (unconventional taboos and secret infatuations) in the 5th (infatuation), 7th (partnership), and 12th (bed pleasures) bhavas. With Rahu in House ${rahuHouse} and Shukra in House ${venHouse}, the chart indicates ${affairRisk >= 50 ? 'intense romantic magnetism that must be consciously anchored within matrimonial vows' : 'a deeply rooted sense of marital commitment and ethical clarity that prioritizes family honor'}.`,
    protectiveMeasures: 'Install a Sphatik (Quartz) Shiva Linga or chant Om Namah Shivaya daily. Avoid ambiguous one-on-one late-night emotional disclosures with colleagues during Rahu transits.',
    metrics: [
      { label: 'Sensory Attraction (Shukra-Rahu)', value: `${affairRisk}%`, score: affairRisk },
      { label: 'Moral Restraint (Guru-Shani)', value: `${100 - affairRisk}%`, score: 100 - affairRisk },
      { label: 'Marital Armor', value: `${Math.max(20, 100 - affairRisk + 10)}%`, score: Math.max(20, 100 - affairRisk + 10) },
    ],
  };

  // 4. HOW MANY KIDS / WHEN PROGENY
  let kidsScore = 60;
  if ([5, 1, 9, 11].includes(jupHouse)) kidsScore += 16; // Jupiter Santan Karaka
  if (isPlanetInGoodHouse(h5Lord)) kidsScore += 12;
  if ([1, 4, 5, 7, 9].includes(moonHouse)) kidsScore += 10;
  if (ketuHouse === 5 || rahuHouse === 5) kidsScore -= 8; // Rahu/Ketu in 5th gives delay or need for medical IVF/modern assistance
  kidsScore = Math.max(35, Math.min(95, kidsScore));

  const kidsCountEstimate = kidsScore >= 75 ? '2 to 3 Children (Highly Auspicious Progeny)' : '1 to 2 Children (Blessed & Accomplished Progeny)';

  const kidsItem: AspectProbabilityItem = {
    id: 'kids_progeny',
    title: 'How Many Kids & Progeny Timing',
    sanskritTitle: 'सन्तान योग व पुत्र भाव (Santan Bhava)',
    category: 'family_relationships',
    probability: kidsScore,
    probabilityTier: kidsScore >= 75 ? 'Very High (85-98%)' : 'High (70-84%)',
    verdict: `Strong Santan Yoga verified. Count indication: ${kidsCountEstimate}. Progeny will bring intellectual distinction, joy, and spiritual elevation to the lineage.`,
    governingHouses: [5, 9, 2],
    keyPlanets: ['Guru', 'Budha', 'Chandra', 'Surya'],
    yogasDetected: [
      'Putra Prapthi Yoga (5th Bhava Benefic)',
      jupHouse === 5 || jupHouse === 9 ? 'Devaguru Santan Ashirwad' : 'Kshetra-Beeja Vitality Yoga',
      'Kuladipika (Family Light) Lineage Yoga',
    ],
    timingWindow: 'Optimal conception and birth windows: Ages 27–31 and 33–36, synchronized with Jupiter transit over 1st, 5th, or 9th house.',
    detailedAnalysis: `The 5th House (Putra Bhava) is the seat of Purva Punya (past meritorious karma) and progeny. Devaguru Jupiter is the sovereign Karaka for children. In your chart, Jupiter is situated in House ${jupHouse} while the 5th Lord (${h5Lord}) is positioned in a ${isPlanetInGoodHouse(h5Lord) ? 'favorable trine/kendra house' : 'supportive astrological house'}. This grants strong reproductive vitality, filial respect, and children who excel in academia, sciences, or arts.`,
    protectiveMeasures: 'Perform Santan Gopala Japa or recite Harivamsa Purana chapters during planning phases. Fast or offer yellow flowers to Lord Vishnu on Thursdays.',
    metrics: [
      { label: 'Putra Bala (5th House)', value: `${kidsScore}%`, score: kidsScore },
      { label: 'Beeja / Kshetra Vitality', value: `${Math.min(96, kidsScore + 4)}%`, score: Math.min(96, kidsScore + 4) },
      { label: 'Filial Harmony (Guru)', value: `${isPlanetInGoodHouse('Guru') ? 90 : 72}%`, score: isPlanetInGoodHouse('Guru') ? 90 : 72 },
    ],
  };

  // 5. MARRIAGE TIME & SPOUSE DYNAMICS
  let marriageScore = 65;
  if ([7, 1, 4, 10, 5, 9].includes(venHouse)) marriageScore += 14;
  if ([7, 1, 9, 11].includes(jupHouse)) marriageScore += 12;
  if (isPlanetInGoodHouse(h7Lord)) marriageScore += 10;
  if (satHouse === 7) marriageScore -= 8; // Saturn gives mature or delayed marriage (after 28)
  marriageScore = Math.max(35, Math.min(95, marriageScore));

  const optimalAgeWindow = satHouse === 7 ? 'Age 29–33 (Mature, stable & prosperous union)' : 'Age 25–29 (Peak romantic & matrimonial harmony)';

  const marriageItem: AspectProbabilityItem = {
    id: 'marriage_time',
    title: 'Marriage Timing & Navamsha Compatibility',
    sanskritTitle: 'विवाह काल व कलत्र योग (Vivaha Muhurta)',
    category: 'family_relationships',
    probability: marriageScore,
    probabilityTier: marriageScore >= 75 ? 'Very High (85-98%)' : 'High (70-84%)',
    verdict: `Auspicious Vivaha Yoga active. Optimal window: ${optimalAgeWindow}. Spouse will be cultured, intellectually engaging, and mutually supportive in wealth creation.`,
    governingHouses: [7, 2, 11],
    keyPlanets: ['Shukra', 'Guru', 'Chandra', 'Budha'],
    yogasDetected: [
      'Kalatra Sukha Yoga (Marital Bliss)',
      venHouse === 7 || jupHouse === 7 ? 'Saptama Guru/Shukra Manglik Neutralizer' : 'D9 Navamsha Harmony Yoga',
      'Saubhagyavati / Pati Sukha Combination',
    ],
    timingWindow: `Peak marriage window: ${optimalAgeWindow}. Next active transit trigger: When Jupiter aspects natal Venus or Lagna.`,
    detailedAnalysis: `The 7th House (Kalatra Bhava) dictates marriage and spouse traits. With Shukra in House ${venHouse} and the 7th Lord (${h7Lord}) in House ${getHouseOfPlanet(h7Lord)}, your chart reflects ${satHouse === 7 ? 'a grounded, pragmatic partner with maturity and enduring loyalty' : 'an attractive, dynamic, and emotionally intelligent partner who elevates your social and professional status'}. Marriage brings substantial financial luck and domestic stability.`,
    protectiveMeasures: 'Ensure Kundali matching (Ashtakoota minimum 21+ Gunas) and perform Navagraha Shanti before wedding muhurta. Recite Katyayani Mantra (for females) or Patni Sanjeevani (for males).',
    metrics: [
      { label: 'Vivaha Bala (7th House)', value: `${marriageScore}%`, score: marriageScore },
      { label: 'Spouse Status & Grace', value: `${isPlanetInGoodHouse('Shukra') ? 88 : 72}%`, score: isPlanetInGoodHouse('Shukra') ? 88 : 72 },
      { label: 'Marital Longevity', value: `${Math.min(96, marriageScore + 6)}%`, score: Math.min(96, marriageScore + 6) },
    ],
  };

  // 6. GOVERNANCE / GOVERNMENT JOB VS PRIVATE JOB
  let govtScore = 40;
  if ([1, 10, 9, 5].includes(sunHouse)) govtScore += 22; // Sun authority
  if ([1, 10, 9].includes(jupHouse)) govtScore += 14;
  if (satHouse === 6 || satHouse === 10) govtScore += 12; // Saturn 6th = victory in competitive exams
  if (marsHouse === 6 || marsHouse === 10) govtScore += 14;
  govtScore = Math.max(20, Math.min(92, govtScore));

  let pvtScore = 55;
  if ([3, 6, 10, 11].includes(mercHouse)) pvtScore += 15;
  if ([10, 11].includes(rahuHouse)) pvtScore += 18;
  if ([10, 11, 2].includes(venHouse)) pvtScore += 12;
  pvtScore = Math.max(35, Math.min(96, pvtScore));

  const govtJobItem: AspectProbabilityItem = {
    id: 'governance_private_job',
    title: 'Government Job vs Private / MNC Career',
    sanskritTitle: 'राजयोग व शासकीय सेवा (Raja Seva)',
    category: 'career_wealth',
    probability: govtScore,
    probabilityTier: govtScore >= 68 ? 'High (70-84%)' : govtScore >= 50 ? 'Moderate (50-69%)' : 'Guarded / Challenging (35-49%)',
    verdict:
      govtScore >= 65
        ? `Surya-Guru Raja Yoga: High capability for Union/State Public Services (IAS/IPS/IRS), PSU executive roles, judiciary, or regulatory bodies (Govt Job: ${govtScore}%, Private MNC: ${pvtScore}%).`
        : `Corporate & Technology Sector Ascendant: Private Sector MNCs, Global Consulting, or Private Financial Institutions yield 2.5x higher velocity and wealth (Private Job: ${pvtScore}%, Govt Job: ${govtScore}%).`,
    governingHouses: [10, 6, 1, 9],
    keyPlanets: ['Surya', 'Guru', 'Shani', 'Mangal'],
    yogasDetected: [
      govtScore >= 65 ? 'Simhasana Raja Yoga (Govt Authority)' : 'Vanik-Karmadhipati Corporate Yoga',
      satHouse === 6 || marsHouse === 6 ? 'Shatru Hanta Exam Victory (6th Bhava)' : 'Global MNC Matrix Yoga',
      'Dashamsha (D10) Vocation Alignment',
    ],
    timingWindow: 'Competitive exams / major promotions: Age 24–28 for early service entrance, or Age 32–36 for executive government advisory panels.',
    detailedAnalysis: `Classical authority is conferred by Surya (King/Government), Jupiter (Adviser/Law), and Mars (Commander/Police/Defense). In your horoscope, Surya resides in House ${sunHouse} and Shani in House ${satHouse}. ${govtScore >= 65 ? 'Your planetary configuration commands administrative respect, public policy acumen, and institutional trust.' : 'While government consulting is viable, private corporate enterprises and multinational firms offer vastly greater creative autonomy and capital remuneration.'}`,
    protectiveMeasures: 'Offer Arghya (water mixed with red kumkum and rice) to Surya every morning chanting Gayatri Mantra. Wear Ruby or Yellow Sapphire under strict consultation.',
    metrics: [
      { label: 'Govt / Civil Authority', value: `${govtScore}%`, score: govtScore },
      { label: 'Private MNC Velocity', value: `${pvtScore}%`, score: pvtScore },
      { label: 'Competitive Exam Victory', value: `${satHouse === 6 || marsHouse === 6 ? 86 : 64}%`, score: satHouse === 6 || marsHouse === 6 ? 86 : 64 },
    ],
  };

  // 7. LEGAL DISPUTES & COURT VICTORY
  let courtScore = 55;
  if (marsHouse === 6) courtScore += 24; // Shatru Hanta
  if (satHouse === 6) courtScore += 20;
  if (isPlanetInGoodHouse('Guru')) courtScore += 12;
  courtScore = Math.max(35, Math.min(95, courtScore));

  const legalItem: AspectProbabilityItem = {
    id: 'legal_disputes',
    title: 'Legal Disputes & Court Litigation Victory',
    sanskritTitle: 'शत्रु हन्ता व विजय योग (Nyaya Vijaya)',
    category: 'karmic_risks',
    probability: courtScore,
    probabilityTier: courtScore >= 75 ? 'Very High (85-98%)' : 'High (70-84%)',
    verdict: `Formidable Shatru-Hanta Yoga active. High probability of decisive legal triumphs and negotiated out-of-court settlements in property, corporate, or financial disputes.`,
    governingHouses: [6, 8, 10],
    keyPlanets: ['Mangal', 'Shani', 'Guru'],
    yogasDetected: ['Shatru Hanta Yoga (Adversary Annihilation)', 'Vijaya Yoga', 'Dharma Nyaya Karaka'],
    timingWindow: 'Resolution periods: During Mars or Jupiter antardashas, or transits of Saturn through the 6th/11th houses.',
    detailedAnalysis: `The 6th House (Rina-Roga-Shatru Bhava) governs court cases, audits, and competitors. With strong malefic placement in or aspecting the 6th bhava, opposition collapses or capitulates before causing substantial harm. Truth and legal documentation ultimately prevail.`,
    protectiveMeasures: 'Recite Bagalamukhi Stotram or Hanuman Chalisa 7 times on Tuesdays. Avoid initiating frivolous lawsuits during Saturn retrograde.',
    metrics: [
      { label: 'Litigation Victory', value: `${courtScore}%`, score: courtScore },
      { label: 'Negotiation Leverage', value: `${Math.min(95, courtScore + 5)}%`, score: Math.min(95, courtScore + 5) },
      { label: 'Dharmic Immunity', value: `${isPlanetInGoodHouse('Guru') ? 88 : 70}%`, score: isPlanetInGoodHouse('Guru') ? 88 : 70 },
    ],
  };

  // 8. SUDDEN WINDFALL, INHERITANCE & SPECULATION
  let windfallScore = 48;
  if ([8, 11].includes(rahuHouse)) windfallScore += 18;
  if ([5, 11, 2].includes(jupHouse)) windfallScore += 14;
  if ([5, 9].includes(mercHouse)) windfallScore += 10;
  windfallScore = Math.max(25, Math.min(90, windfallScore));

  const windfallItem: AspectProbabilityItem = {
    id: 'sudden_windfall',
    title: 'Sudden Windfalls, Speculation & Inheritance',
    sanskritTitle: 'आकस्मिक धन लाभ व वसीयत (Gupta Dhana)',
    category: 'career_wealth',
    probability: windfallScore,
    probabilityTier: windfallScore >= 70 ? 'High (70-84%)' : 'Moderate (50-69%)',
    verdict:
      windfallScore >= 65
        ? 'Gupta Dhana & Akasmika Labha Yoga detected: Significant windfall gains through inheritance, venture equity buyouts, or timely market investments.'
        : 'Steady compounding favored over high-stakes day trading. Speculative windfalls require disciplined risk management to prevent sudden retracements.',
    governingHouses: [8, 5, 11, 2],
    keyPlanets: ['Rahu', 'Guru', 'Budha', 'Shukra'],
    yogasDetected: ['Gupta Dhana (Hidden Wealth) Yoga', 'Ashtama Labha Combination', 'Purva Punya Speculation Ray'],
    timingWindow: 'Windfall activation: Rahu-Jupiter or Jupiter-Mercury dasha sub-periods.',
    detailedAnalysis: `The 8th Bhava is the reservoir of unearned assets, ancestral wills, patents, and sudden capital inflows. Rahu in House ${rahuHouse} acts as a dramatic windfall catalyst. While capital surges occur, 5th house discipline is necessary to retain the accumulated wealth.`,
    protectiveMeasures: 'Never reinvest 100% of sudden speculative profits back into the same volatile vehicle. Immediately park 50% in land, gold, or debt instruments.',
    metrics: [
      { label: 'Sudden Windfall Potential', value: `${windfallScore}%`, score: windfallScore },
      { label: 'Ancestral Inheritance', value: `${isPlanetInGoodHouse('Guru') ? 82 : 60}%`, score: isPlanetInGoodHouse('Guru') ? 82 : 60 },
      { label: 'Market Timing Intellect', value: `${[5, 10, 11].includes(mercHouse) ? 88 : 65}%`, score: [5, 10, 11].includes(mercHouse) ? 88 : 65 },
    ],
  };

  // 9. FOREIGN SETTLEMENT & LONG-TERM RELOCATION PROBABILITY
  let foreignScore = 45;
  if ([12, 9, 3].includes(rahuHouse)) foreignScore += 22; // Rahu foreign indicator
  if ([12, 9].includes(moonHouse)) foreignScore += 16; // Moon traveling karaka
  if ([12, 9].includes(satHouse)) foreignScore += 12;
  if ([1, 4, 7, 10].includes(lagnaRasi)) foreignScore += 8; // Movable ascendants relocate
  foreignScore = Math.max(25, Math.min(95, foreignScore));

  const foreignItem: AspectProbabilityItem = {
    id: 'foreign_settlement',
    title: 'Foreign PR, Settlement & Long-Term Relocation',
    sanskritTitle: 'विदेश वास व जलधि पार गमन योग (Videsh Vasa)',
    category: 'vital_events',
    probability: foreignScore,
    probabilityTier: foreignScore >= 75 ? 'Very High (85-98%)' : foreignScore >= 60 ? 'High (70-84%)' : 'Moderate (50-69%)',
    verdict:
      foreignScore >= 68
        ? 'Videsh Vasa Yoga fully activated: High probability of overseas PR, long-term multinational employment, or international citizenship.'
        : 'Cross-border assignments, foreign client tours, and frequent global travel favored, with strong financial anchoring in home territory.',
    governingHouses: [12, 9, 3, 7],
    keyPlanets: ['Rahu', 'Chandra', 'Shani', 'Guru'],
    yogasDetected: ['Videsh Bhagya Yoga (9th-12th synergy)', 'Sagara Paar (Trans-Oceanic) Yoga', 'Pravasa Karaka Movement'],
    timingWindow: 'Major overseas relocation window: Rahu, Moon, or Saturn dasha periods, specifically Ages 26–31 and 35–39.',
    detailedAnalysis: `The 12th Bhava signifies foreign lands, offshore contracts, and distant shores, while the 9th governs long-distance journeys. Rahu in House ${rahuHouse} acts as the primary catalyst for foreign assimilation. Combined with Chandra in House ${moonHouse}, your chart possesses innate adaptability to international cultures and foreign currency earnings.`,
    protectiveMeasures: 'Donate coconut or blue cloth on Saturdays before international visa interviews. Keep passport in North or Northwest sector of the room.',
    metrics: [
      { label: 'Foreign Residence Potential', value: `${foreignScore}%`, score: foreignScore },
      { label: 'Multinational Client Success', value: `${Math.min(96, foreignScore + 8)}%`, score: Math.min(96, foreignScore + 8) },
      { label: 'Cultural Adaptability (Chandra)', value: `${isPlanetInGoodHouse('Chandra') ? 86 : 68}%`, score: isPlanetInGoodHouse('Chandra') ? 86 : 68 },
    ],
  };

  // 10. LUXURY VEHICLES & CONVEYANCE FORTUNE
  let vehicleScore = 52;
  if ([4, 1, 2, 11].includes(venHouse)) vehicleScore += 20; // Venus Vahan Karaka
  if ([4, 10, 11].includes(marsHouse)) vehicleScore += 14; // Mars mechanical engines
  if (isPlanetInGoodHouse(h4Lord)) vehicleScore += 10;
  vehicleScore = Math.max(35, Math.min(96, vehicleScore));

  const vehicleItem: AspectProbabilityItem = {
    id: 'luxury_vehicles',
    title: 'Luxury Vehicles & Conveyance Fortune',
    sanskritTitle: 'वाहन सुख व यान योग (Vahan Sukha)',
    category: 'vital_events',
    probability: vehicleScore,
    probabilityTier: vehicleScore >= 75 ? 'Very High (85-98%)' : 'High (70-84%)',
    verdict:
      vehicleScore >= 70
        ? 'Rajakiyo Vahana Yoga active: High probability of owning premium luxury vehicles, sports cars, and smooth travel conveyances.'
        : 'Guaranteed reliable vehicle ownership with progressive upgrades to premium utility models.',
    governingHouses: [4, 11, 2],
    keyPlanets: ['Shukra', 'Mangal', 'Chandra'],
    yogasDetected: ['Vahana Karaka Sukha Yoga', 'Shukra Malavya Conveyance Ray', 'Chaturtha Dhana Yoga'],
    timingWindow: 'Best vehicle purchases: Friday or Wednesday in Shukla Paksha, during Venus or Moon sub-periods.',
    detailedAnalysis: `The 4th House is the seat of all vehicles (Vahana Sukha), with Shukra acting as the luxury significator and Mangal governing the mechanical horsepower. With Venus in House ${venHouse}, you enjoy comfortable journeys and protection from transit mishaps.`,
    protectiveMeasures: 'Keep a small silver or brass idol of Lord Ganesha or Hanuman Yantra in the vehicle dashboard. Avoid taking delivery of new vehicles on Saturday evenings.',
    metrics: [
      { label: 'Vehicle Luxury Index (Shukra)', value: `${vehicleScore}%`, score: vehicleScore },
      { label: 'Road Safety & Protection', value: `${isPlanetInGoodHouse('Guru') ? 92 : 75}%`, score: isPlanetInGoodHouse('Guru') ? 92 : 75 },
      { label: 'Fleet / Multi-Vehicle Fortune', value: `${Math.min(90, vehicleScore - 5)}%`, score: Math.min(90, vehicleScore - 5) },
    ],
  };

  // 11. HEALTH CRISIS RESILIENCE & LONGEVITY
  let healthScore = 60;
  if ([1, 5, 9].includes(jupHouse)) healthScore += 18; // Jupiter Amrita Aspect
  if (satHouse === 8) healthScore += 16; // Saturn in 8th gives long life
  if ([1, 10].includes(sunHouse)) healthScore += 12; // Sun Atma Karaka vitality
  healthScore = Math.max(40, Math.min(96, healthScore));

  const healthItem: AspectProbabilityItem = {
    id: 'health_vitality',
    title: 'Health Vitality & Crisis Resilience',
    sanskritTitle: 'आयुर्भाव व संजीवनी रक्षा योग (Ayur Bala)',
    category: 'vital_events',
    probability: healthScore,
    probabilityTier: healthScore >= 75 ? 'Very High (85-98%)' : 'High (70-84%)',
    verdict:
      healthScore >= 72
        ? 'Deerghayu (Long Life) & Sanjeevani Shield active: Exceptional recuperative vitality, high metabolic resilience, and immunity against chronic setbacks.'
        : 'Solid physical baseline with periodic digestive and stress fluctuations. Preventive lifestyle habits and yogic pranayama ensure enduring vitality.',
    governingHouses: [1, 8, 6],
    keyPlanets: ['Surya', 'Guru', 'Shani'],
    yogasDetected: ['Sanjeevani Amrita Yoga', 'Deerghayu Ayur Yoga', 'Maraka Neutralization Ray'],
    timingWindow: 'Preventive health attention: During Sade Sati peaks or 6th Lord antardashas. Routine health checkups recommended.',
    detailedAnalysis: `The 1st Bhava establishes foundational physical constitution (Tanushri), while the 8th Bhava dictates longevity and deep cellular rejuvenation. With Surya in House ${sunHouse} and Jupiter providing protective glances, vitality rebounds quickly even following severe exhaustion or medical procedures.`,
    protectiveMeasures: 'Chant Maha Mrityunjaya Mantra 11 times every morning. Drink warm copper-infused water at dawn and practice Surya Namaskar.',
    metrics: [
      { label: 'Cellular Immunity & Vitality', value: `${healthScore}%`, score: healthScore },
      { label: 'Longevity Protection (Shani-Guru)', value: `${satHouse === 8 || jupHouse === 1 ? 94 : 80}%`, score: satHouse === 8 || jupHouse === 1 ? 94 : 80 },
      { label: 'Recuperation Speed', value: `${Math.min(95, healthScore + 5)}%`, score: Math.min(95, healthScore + 5) },
    ],
  };

  // 12. NAME, FAME & CELEBRITY PUBLIC RECOGNITION
  let fameScore = 50;
  if ([1, 10, 9, 11].includes(sunHouse)) fameScore += 18;
  if ([1, 10, 5].includes(jupHouse)) fameScore += 14;
  if ([10, 11].includes(rahuHouse)) fameScore += 16; // Rahu in 10/11 creates massive public buzz
  if ([1, 10].includes(moonHouse)) fameScore += 10;
  fameScore = Math.max(30, Math.min(96, fameScore));

  const fameItem: AspectProbabilityItem = {
    id: 'name_and_fame',
    title: 'Name, Fame & Public Recognition',
    sanskritTitle: 'कीर्ति व यश प्राप्ति योग (Yashasvi Yoga)',
    category: 'career_wealth',
    probability: fameScore,
    probabilityTier: fameScore >= 75 ? 'Very High (85-98%)' : fameScore >= 60 ? 'High (70-84%)' : 'Moderate (50-69%)',
    verdict:
      fameScore >= 70
        ? 'Keerti & Yashasvi Yoga active: Wide public acclaim, professional accolades, media exposure, and enduring institutional reputation.'
        : 'Respected domain authority: Solid industry reputation and peer honor based on consistent merit and ethical leadership.',
    governingHouses: [10, 1, 11, 5],
    keyPlanets: ['Surya', 'Guru', 'Rahu', 'Chandra'],
    yogasDetected: ['Yashasvi Yoga (Fame)', 'Surya-Pratishtha Authority Yoga', 'Digbala 10th House Eminence'],
    timingWindow: 'Peak public acclaim: Ages 32–36 and 44–48, during Sun, Jupiter, or 10th lord dasha periods.',
    detailedAnalysis: `The 10th Bhava governs public standing, titles, and social footprint, while Surya is the cosmic dispenser of honor. In your chart, Surya in House ${sunHouse} alongside Rahu in House ${rahuHouse} fosters charismatic presence and widespread domain acclaim.`,
    protectiveMeasures: 'Wear clean white or saffron clothing during important public appearances. Donate wheat or copper on Sundays.',
    metrics: [
      { label: 'Public Recognition Index', value: `${fameScore}%`, score: fameScore },
      { label: 'Domain Authority & Respect', value: `${Math.min(96, fameScore + 6)}%`, score: Math.min(96, fameScore + 6) },
      { label: 'Charismatic Appeal (Surya-Rahu)', value: `${[10, 11, 1].includes(sunHouse) ? 92 : 72}%`, score: [10, 11, 1].includes(sunHouse) ? 92 : 72 },
    ],
  };

  return [
    businessItem,
    purchaseItem,
    saleItem,
    affairItem,
    kidsItem,
    marriageItem,
    govtJobItem,
    legalItem,
    windfallItem,
    foreignItem,
    vehicleItem,
    healthItem,
    fameItem,
  ];
}

// ==========================================
// GUIDANCE FOR THE PERSON COMPUTATION ENGINE
// ==========================================

export function computePersonalizedLifeGuidance(
  natalPlanets: PlanetPosition[],
  natalHouses: HouseInfo[],
  lagnaRasi: number
): LifeGuidanceProfile {
  const getPlanet = (name: string): PlanetPosition | undefined =>
    natalPlanets.find((p) => p.name === name);

  const getHouseOfPlanet = (planetName: string): number => {
    const pl = getPlanet(planetName);
    if (!pl) return 1;
    if (pl.house) return pl.house;
    for (const h of natalHouses) {
      if (h.planets.some((p) => p.name === planetName)) {
        return h.houseNumber;
      }
    }
    return ((pl.rasiNumber - lagnaRasi + 12) % 12) + 1;
  };

  const sunHouse = getHouseOfPlanet('Surya');
  const mercHouse = getHouseOfPlanet('Budha');
  const jupHouse = getHouseOfPlanet('Guru');
  const marsHouse = getHouseOfPlanet('Mangal');
  const venHouse = getHouseOfPlanet('Shukra');
  const satHouse = getHouseOfPlanet('Shani');
  const rahuHouse = getHouseOfPlanet('Rahu');
  const ketuHouse = getHouseOfPlanet('Ketu');

  // 1. CHOICE OF EDUCATION (STREAMS)
  const streamOptions: EducationStreamOption[] = [
    {
      stream: 'STEM, Engineering & Data Architecture',
      suitabilityScore: [1, 3, 5, 10].includes(marsHouse) || [3, 10, 11].includes(satHouse) ? 92 : 74,
      rulingPlanets: ['Mangal', 'Shani', 'Budha'],
      keyCareers: ['Computer Engineering', 'Aerospace / Robotics', 'Data Sciences / AI Architecture'],
      rationale: 'Mars provides structural precision and logic, combined with Saturn’s systemic rigor and Mercury’s analytical computation.',
    },
    {
      stream: 'Commerce, Chartered Accountancy & Global Finance',
      suitabilityScore: [2, 5, 10, 11].includes(mercHouse) || [2, 11].includes(jupHouse) ? 95 : 70,
      rulingPlanets: ['Budha', 'Guru', 'Shukra'],
      keyCareers: ['Investment Banking', 'Corporate Treasury & CA', 'Fintech & Wealth Asset Management'],
      rationale: 'Mercury governs commercial arithmetic and contracts, while Jupiter provides expansive fiscal prudence and fiduciary ethics.',
    },
    {
      stream: 'Medicine, Surgery, Life Sciences & Pharmaceuticals',
      suitabilityScore: [6, 8, 10].includes(sunHouse) || [6, 8].includes(marsHouse) ? 88 : 65,
      rulingPlanets: ['Surya', 'Mangal', 'Guru', 'Chandra'],
      keyCareers: ['Clinical Medicine / Surgery', 'Biotechnology', 'Psychiatry & Holistic Ayurveda'],
      rationale: 'Sun is the cosmic physician (Dhanvantari), Mars commands surgery/instruments, and Moon governs diagnostics and empathy.',
    },
    {
      stream: 'Law, Public Administration & Governance',
      suitabilityScore: [1, 9, 10].includes(sunHouse) || [6, 9].includes(jupHouse) ? 89 : 68,
      rulingPlanets: ['Guru', 'Surya', 'Shani'],
      keyCareers: ['Constitutional Law & Litigation', 'Civil Services (IAS/IRS)', 'Public Policy & Diplomacy'],
      rationale: 'Jupiter represents Nyaya (jurisprudence) and Dharma, paired with the Sun’s sovereign state authority.',
    },
    {
      stream: 'Creative Arts, Media, Design & Architecture',
      suitabilityScore: [1, 4, 5, 10].includes(venHouse) ? 90 : 66,
      rulingPlanets: ['Shukra', 'Chandra', 'Rahu'],
      keyCareers: ['Industrial & UI/UX Design', 'Film & Creative Direction', 'Luxury Architecture & Media'],
      rationale: 'Venus and Moon stimulate visual aesthetics, spatial harmony, and mass communicative resonance.',
    },
  ];
  streamOptions.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // 2. CHOICE OF OCCUPATION (VOCATION)
  const occupationOptions: OccupationOption[] = [
    {
      role: 'Executive Corporate Leadership / Founder-CEO',
      alignmentScore: [1, 10, 11].includes(sunHouse) ? 94 : 78,
      archetype: 'Leadership & Governance',
      industry: 'Enterprise Technology, Global Conglomerates & Venture-Backed Startups',
      rationale: 'Natural command presence, strategic decision-making under ambiguity, and mastery over capital allocation.',
    },
    {
      role: 'Strategic Consultant & Principal Financial Advisor',
      alignmentScore: [2, 5, 9, 11].includes(jupHouse) ? 92 : 76,
      archetype: 'Technical & Advisory',
      industry: 'Management Consulting, Mergers & Acquisitions, Fiscal Advisory',
      rationale: 'Sage counsel, deep pattern recognition, and trust-building that institutional clients revere.',
    },
    {
      role: 'Technology Systems Architect & Quantitative Specialist',
      alignmentScore: [3, 10, 11].includes(mercHouse) || [10, 11].includes(rahuHouse) ? 91 : 75,
      archetype: 'Technical & Advisory',
      industry: 'Software Engineering, Algorithmic Trading, AI Infrastructure',
      rationale: 'Mercurial intellect capable of deconstructing complex multi-tier technological and market systems.',
    },
    {
      role: 'Independent Merchant, Trade Investor & Real Estate Mogul',
      alignmentScore: [7, 10, 11].includes(venHouse) || marsHouse === 4 ? 89 : 72,
      archetype: 'Commercial & Enterprise',
      industry: 'Real Estate Development, Global Import/Export, Commodity Broking',
      rationale: 'Sharp asset valuation instincts and the ability to negotiate high-stakes liquidity transactions.',
    },
  ];
  occupationOptions.sort((a, b) => b.alignmentScore - a.alignmentScore);

  // 3. LONG TERM STAY — FOREIGN VS MOTHERLAND
  let foreignScore = 45;
  if ([9, 12].includes(rahuHouse)) foreignScore += 24;
  if ([9, 12].includes(jupHouse)) foreignScore += 14;
  if ([9, 12].includes(satHouse)) foreignScore += 12;
  if ([1, 4, 7, 10].some((h) => h === 12)) foreignScore += 8;
  foreignScore = Math.max(25, Math.min(95, foreignScore));

  const motherlandScore = Math.max(30, 100 - foreignScore + 20);

  const foreignVerdict =
    foreignScore >= 75
      ? 'Strong Foreign Settlement Favored'
      : foreignScore >= 55
      ? 'Dual-Base / Cross-Border Career'
      : 'Prosperity in Native Motherland';

  // 4. PROMOTION, TRANSFER & JOB CHANGE
  const nextPromotionProb = [10, 11, 1].includes(sunHouse) || [10, 11].includes(jupHouse) ? 88 : 72;
  const transferLikelihood = [3, 9, 12].includes(satHouse) || [3, 9, 12].includes(marsHouse) ? 78 : 45;

  const transitionWindows: CareerTransitionWindow[] = [
    {
      window: 'Next 3 to 6 Months',
      type: 'Promotion & Recognition',
      favorabilityScore: nextPromotionProb,
      astrologicalTrigger: 'Solar and Mercurial ingress across 10th/11th Bhavas illuminates leadership capability.',
    },
    {
      window: '6 to 12 Months Forthcoming',
      type: 'Salary Revision',
      favorabilityScore: Math.min(96, nextPromotionProb + 4),
      astrologicalTrigger: 'Jupiter direct motion activates 2nd & 11th wealth houses, unleashing equity/bonus increases.',
    },
    {
      window: '12 to 18 Months Forthcoming',
      type: 'Department / City Transfer',
      favorabilityScore: transferLikelihood,
      astrologicalTrigger: 'Saturn Gochar aspects movable signs, encouraging geographic expansion and international responsibility.',
    },
  ];

  // 5. MAX WEALTH CALCULATOR
  let dhanaMultiplier = 2.4;
  if ([1, 2, 5, 9, 11].includes(jupHouse)) dhanaMultiplier += 0.8;
  if ([2, 11].includes(venHouse)) dhanaMultiplier += 0.6;
  if ([2, 11].includes(mercHouse)) dhanaMultiplier += 0.5;
  if ([10, 11].includes(sunHouse)) dhanaMultiplier += 0.4;
  dhanaMultiplier = Math.round(dhanaMultiplier * 10) / 10;

  const induLagnaScore = Math.min(96, Math.round(65 + (dhanaMultiplier - 2) * 12));

  const maxWealth: MaxWealthProjection = {
    peakNetWorthTier:
      dhanaMultiplier >= 3.8
        ? 'Tier 1: Sovereign Ultra-High-Net-Worth (Multi-Generational Empire)'
        : dhanaMultiplier >= 3.0
        ? 'Tier 2: High-Net-Worth (HNW / Multi-Crore Financial Independence)'
        : 'Tier 3: Upper Affluent (Robust Liquid & Fixed Asset Capital)',
    dhanaYogaMultiplier: dhanaMultiplier,
    induLagnaScore,
    peakWealthAgeRange: 'Ages 38 to 48 (Golden Mahadasha Peak Window)',
    peakWealthMahadasha:
      [2, 11].includes(jupHouse) ? 'Guru (Jupiter) or Shukra (Venus) Mahadasha' : 'Budha (Mercury) or Surya (Sun) Mahadasha',
    assetAllocation: {
      realEstate: marsHouse === 4 || satHouse === 4 ? 35 : 25,
      equityAndMarkets: mercHouse === 5 || mercHouse === 11 ? 35 : 25,
      goldAndCommodities: jupHouse === 1 || jupHouse === 9 ? 15 : 10,
      businessEnterprise: 20,
      liquidTreasury: 10,
    },
    wealthSummary: `Your birth chart generates a ${dhanaMultiplier}x planetary Dhana Yoga compounding multiplier. The convergence of 2nd (accumulated treasury), 9th (fortune/grace), and 11th (unrestricted cashflow) houses indicates that lifetime net worth will surge exponentially rather than linearly.`,
    wealthDrivers: [
      'Compound equity growth in high-margin businesses or technology stock',
      'Acquisition of appreciating land and luxury residential real estate',
      'Strategic intellectual property, royalties, or venture partnerships',
    ],
    cautionaryLeakingHoles: [
      'Lending capital to emotional acquaintances without collateral contracts',
      'Impulsive retail splurges during Rahu-Venus sub-periods',
      'Over-leveraging margin debt in speculative derivatives',
    ],
  };

  // 6. VASTU & AUSPICIOUS DIRECTIONS
  const lagnaRasiObj = VEDIC_RASIS[lagnaRasi - 1] || VEDIC_RASIS[0];
  const directionMap: Record<string, string> = {
    Surya: 'East (Purva) — Radiating Vitality & Royal Fame',
    Chandra: 'Northwest (Vayavya) — Emotional Flow & Social Grace',
    Mangal: 'South (Dakshina) — Fiery Courage & Real Estate Mastery',
    Budha: 'North (Uttara) — Kubera’s Wealth & Commercial Intellect',
    Guru: 'Northeast (Ishanya) — Divine Wisdom & Spiritual Prosperity',
    Shukra: 'Southeast (Agneya) — Luxury, Art & Material Pleasures',
    Shani: 'West (Pashchima) — Discipline, Longevity & Enduring Assets',
  };

  const auspiciousFacing = directionMap[lagnaRasiObj.lord] || 'East (Purva)';
  const workDeskFacing = 'North or East (Stimulates Kubera & Surya currents)';
  const sleepingHeadDirection = 'South (Anchors magnetic polarity, deep restorative sleep & longevity)';

  // 7. BUSINESS PARTNER GUIDANCE
  const partnerSigns = [
    VEDIC_RASIS[(lagnaRasi + 6) % 12]?.englishName || 'Libra',
    VEDIC_RASIS[(lagnaRasi + 4) % 12]?.englishName || 'Leo',
    VEDIC_RASIS[(lagnaRasi + 8) % 12]?.englishName || 'Sagittarius',
  ];

  // 8. ATMAKARAKA MISSION
  // Planet with highest degree in traditional Jamini, or prime soul indicator (Sun/Jupiter)
  const defaultPlanet: PlanetPosition = natalPlanets[0] || {
    name: 'Surya',
    englishName: 'Sun',
    symbol: '☉',
    rasiNumber: 1,
    rasiName: 'Mesha',
    degree: 15,
    minute: 0,
    isRetrograde: false,
    nakshatra: 'Ashwini',
    pada: 1,
    house: 1,
  };
  const atmakarakaPlanet = natalPlanets.length > 0
    ? natalPlanets.reduce((prev, curr) => ((curr.degree || 0) > (prev.degree || 0) ? curr : prev), natalPlanets[0])
    : defaultPlanet;

  return {
    education: {
      recommendedStream: streamOptions[0].stream,
      streamOptions,
      examSuccessProbability: Math.min(95, Math.round(68 + dhanaMultiplier * 5)),
      optimalStudyEnvironment: 'Quiet North-East facing study desk with natural morning sunlight and organized library.',
      higherEducationAbroadProbability: foreignScore,
    },
    occupation: {
      primaryVocation: occupationOptions[0].role,
      careerArchetype: occupationOptions[0].archetype,
      occupationOptions,
      workCultureSuitability: 'High-autonomy meritocracy with clear executive accountability and direct P&L ownership.',
      independentVsJobRatio: {
        business: Math.min(75, Math.round(40 + (dhanaMultiplier - 2) * 15)),
        salariedJob: Math.max(25, 100 - Math.round(40 + (dhanaMultiplier - 2) * 15)),
      },
    },
    foreignVsMotherland: {
      settlementVerdict: foreignVerdict,
      foreignStayProbability: foreignScore,
      motherlandProsperityScore: motherlandScore,
      favorableGlobalDirections: foreignScore >= 55 ? ['North America (West)', 'United Kingdom / Europe (Northwest)', 'Singapore / Dubai (Southeast / West)'] : ['Capital Metros of Native Homeland', 'Ancestral Northern/Western Corridors'],
      travelTiming: 'Active foreign visa / relocation windows: Age 24–27 (Studies), and Age 33–37 (Global Corporate Postings).',
      rationale: `Rahu in House ${rahuHouse} and the 12th/9th Bhava lords dictate cross-border karma. ${foreignScore >= 60 ? 'Global shores offer monumental career elevation, accelerated citizenship/PR prospects, and financial compounding.' : 'While overseas travel for education or business is rewarding, the deepest wealth roots and family peace anchor in the native motherland.'}`,
    },
    careerTransition: {
      nextPromotionProbability: nextPromotionProb,
      jobSwitchTiming: 'Favorable strategic transition: Q1 or Q3 when Sun/Jupiter transit benefics.',
      transferLikelihood,
      expectedSalaryHikeMultiplier: '28% to 45% uplift on lateral move',
      transitionWindows,
    },
    maxWealth,
    vastuAndDirections: {
      auspiciousFacing,
      workDeskFacing,
      sleepingHeadDirection,
      luckyColor: lagnaRasiObj.lord === 'Budha' ? 'Emerald Green & White' : lagnaRasiObj.lord === 'Guru' ? 'Golden Yellow & Saffron' : 'Royal Amber & Ivory',
      luckyDay: lagnaRasiObj.lord === 'Surya' ? 'Sunday' : lagnaRasiObj.lord === 'Budha' ? 'Wednesday' : 'Thursday',
    },
    businessPartnerGuidance: {
      idealPartnerSigns: partnerSigns,
      essentialTraits: [
        'Operational execution rigor and contract compliance',
        'Transparent fiscal accounting and non-defensive communication',
        'Complementary risk appetite (balanced against your bold vision)',
      ],
      criticalRedFlags: [
        'Reluctance to sign clear legal operating agreements with dispute clauses',
        'Excessive Rahu impulsiveness or secret financial accounts',
        'Inability to manage steady cash flows during market contractions',
      ],
      partnershipSuccessScore: Math.min(94, Math.round(60 + dhanaMultiplier * 8)),
    },
    atmakarakaMission: {
      planet: atmakarakaPlanet.name,
      soulLesson: 'Cultivating detachment from ego while executing supreme excellence in worldly responsibility (Karma Yoga).',
      dharmicCalling: 'To establish enduring institutions, create abundant livelihoods for others, and lead by ethical example.',
    },
    personality: {
      strongPoints: ['Optimism', 'Analytical Mind', 'Resilience'],
      weakPoints: ['Impatience', 'Over-analysis'],
      stages: { childhood: 'Stable', teenage: 'Active', adult: 'Successful' },
    },
    lifeAspects: {
      wealth: 'Promising',
      housesProperty: 'Stable',
      marriage: 'Harmonious',
      jobBusiness: 'Balanced',
      nameFameReputation: 'High',
    },
    higherKnowledge: {
      lifePathGuidance: 'Focus on service and wisdom.',
      mysticism: 'Strong intuitive connection.',
    },
  };
}
