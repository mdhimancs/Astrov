import { GrahaName, PlanetPosition } from '../types';
import { calculatePlanetaryPositions, calculateVimshottariDasha, calculateAntardashas } from '../vedicMath';
import { VEDIC_RASIS } from '../data';

export type LifeMilestoneDomain =
  | 'Career'
  | 'Education'
  | 'Wealth & Property'
  | 'Marriage & Family'
  | 'Spiritual & Foreign'
  | 'Health & Restructuring';

export type MilestoneTimingStatus = 'Past Best' | 'Current Best' | 'Future Best' | 'Karmic Transition';

export interface CheiroProfileSummary {
  birthNumber: number; // 1-9 (Root / Psychic)
  destinyNumber: number; // 1-9 (Life Path)
  rulingPlanet: string;
  cheiroArchetype: string;
  fatefulTurningAges: number[];
  fortunateDays: string[];
  luckyDates: number[];
  powerColors: string[];
  luckyGems: string[];
  corePredictiveMotto: string;
}

export interface CriticalDashaTransitMilestone {
  id: string;
  periodStartMonthYear: string;
  periodEndMonthYear: string;
  startAge: number;
  endAge: number;
  startDate: string;
  endDate: string;
  status: MilestoneTimingStatus;
  isCurrent: boolean;

  // Dasha breakdown
  mahadashaLord: GrahaName;
  antardashaLord: GrahaName;
  dashaDescription: string;

  // Critical Gochar Transits during this window
  criticalTransits: {
    saturnTransit: string;
    saturnHouseFromMoon: number;
    saturnHouseFromLagna: number;
    jupiterTransit: string;
    jupiterHouseFromMoon: number;
    jupiterHouseFromLagna: number;
    rahuKetuAxis: string;
    summary: string;
  };

  // Highlights & Verdict: "Was best" / "Will be best" / "Current best"
  primaryDomain: LifeMilestoneDomain;
  secondaryDomain?: LifeMilestoneDomain;
  verdictHeadline: string;
  verdictType: 'was_best' | 'current_best' | 'will_be_best' | 'karmic_restructuring';
  ratingStars: number; // 3 to 5
  ratingLabel: 'Golden Era (5/5)' | 'Prime Growth (4.5/5)' | 'High Auspiciousness (4/5)' | 'Karmic Maturation (3.5/5)';

  // Short, punchy, high-accuracy predictive points (Cheiro & B.V. Raman style)
  predictivePoints: string[];

  // Cheiro's Turning Point & Numerical Synchronicity
  cheiroTurningPoint: string;

  // Double-Transit Law (K.N. Rao & Dr. B.V. Raman: Saturn + Jupiter simultaneous aspect)
  doubleTransitVerdict: string;

  // Key Highlights
  highlights: string[];

  // Technical Astrological Rationale
  astrologicalMechanism: string;

  // Practical Strategic Guidance
  strategicAdvice: string;
}

// Reduce a number to single digit (1-9)
export function reduceToSingleDigit(num: number): number {
  let val = Math.abs(num);
  while (val > 9) {
    val = val
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return val === 0 ? 9 : val;
}

// Compute Cheiro's Chaldean Numerology & Astrological Profile
export function getCheiroProfileSummary(birthDateStr: string): CheiroProfileSummary {
  const parts = birthDateStr.split('-').map(Number);
  const year = parts[0] || 1990;
  const month = parts[1] || 5;
  const day = parts[2] || 18;

  const birthNumber = reduceToSingleDigit(day);
  const totalSum = day + month + year;
  const destinyNumber = reduceToSingleDigit(totalSum);

  const CHEIRO_MAP: Record<
    number,
    {
      planet: string;
      archetype: string;
      fortunateDays: string[];
      luckyDates: number[];
      powerColors: string[];
      gems: string[];
      motto: string;
    }
  > = {
    1: {
      planet: 'Sun (Surya)',
      archetype: 'The Visionary Pioneer & Natural Leader',
      fortunateDays: ['Sunday', 'Monday'],
      luckyDates: [1, 10, 19, 28],
      powerColors: ['Gold', 'Amber', 'Bright Yellow', 'Royal Bronze'],
      gems: ['Ruby', 'Garnet', 'Amber'],
      motto: 'Born to command authority, initiate breakthroughs, and establish independent enterprises.',
    },
    2: {
      planet: 'Moon (Chandra)',
      archetype: 'The Intuitive Diplomat & Creative Mystic',
      fortunateDays: ['Monday', 'Friday', 'Sunday'],
      luckyDates: [2, 11, 20, 29],
      powerColors: ['Pearl White', 'Cream', 'Sea Green', 'Silver'],
      gems: ['Pearl', 'Moonstone', 'Jade'],
      motto: 'Governed by instinct, magnetic charisma, collaborative genius, and artistic vision.',
    },
    3: {
      planet: 'Jupiter (Guru / Brihaspati)',
      archetype: 'The Wise Architect & Dharmic Sovereign',
      fortunateDays: ['Thursday', 'Tuesday', 'Friday'],
      luckyDates: [3, 12, 21, 30],
      powerColors: ['Yellow', 'Saffron', 'Violet', 'Purple'],
      gems: ['Yellow Sapphire', 'Topaz', 'Citrine'],
      motto: 'Destined for higher knowledge, mentorship, large-scale financial management, and social honors.',
    },
    4: {
      planet: 'Rahu (Uranus / The Cosmic Catalyst)',
      archetype: 'The Revolutionary Reformer & Tech Strategist',
      fortunateDays: ['Saturday', 'Sunday', 'Monday'],
      luckyDates: [4, 13, 22, 31],
      powerColors: ['Electric Blue', 'Grey', 'Indigo', 'Patterned Khaki'],
      gems: ['Hessonite (Gomed)', 'Lapis Lazuli', 'Sapphire'],
      motto: 'Breaks orthodox molds to pioneer radical unconventional solutions and global technological networks.',
    },
    5: {
      planet: 'Mercury (Budha)',
      archetype: 'The Master Communicator & Commercial Alchemist',
      fortunateDays: ['Wednesday', 'Friday'],
      luckyDates: [5, 14, 23],
      powerColors: ['Emerald Green', 'Light Grey', 'Turquoise', 'White'],
      gems: ['Emerald', 'Peridot', 'Aquamarine'],
      motto: 'Quick-silver intellect, commercial sharpness, rapid adaptability, and versatile fortune in trade.',
    },
    6: {
      planet: 'Venus (Shukra)',
      archetype: 'The Magnanimous Luminary & Harmonizer of Luxuries',
      fortunateDays: ['Friday', 'Tuesday', 'Thursday'],
      luckyDates: [6, 15, 24],
      powerColors: ['Rose Pink', 'Silk Blue', 'Ivory', 'Lavender'],
      gems: ['Diamond', 'White Sapphire', 'Opal'],
      motto: 'Gifted with deep artistic refinement, magnetic alliances, immense material comfort, and public affection.',
    },
    7: {
      planet: 'Ketu (Neptune / Spiritual Seer)',
      archetype: 'The Philosophical Innovator & Metaphysical Researcher',
      fortunateDays: ['Sunday', 'Monday'],
      luckyDates: [7, 16, 25],
      powerColors: ['Sea Foam Green', 'Smoky White', 'Yellow', 'Silver'],
      gems: ['Cat’s Eye (Chrysoberyl)', 'Moonstone', 'Tiger’s Eye'],
      motto: 'Profound introspective depth, spiritual detachment, esoteric wisdom, and foreign breakthroughs.',
    },
    8: {
      planet: 'Saturn (Shani)',
      archetype: 'The Master of Endurance & Monumental Builder',
      fortunateDays: ['Saturday', 'Monday', 'Friday'],
      luckyDates: [8, 17, 26],
      powerColors: ['Midnight Blue', 'Charcoal Black', 'Dark Purple'],
      gems: ['Blue Sapphire', 'Amethyst', 'Black Onyx'],
      motto: 'Carves lasting worldly empires through relentless perseverance, stoic discipline, and late-life triumph.',
    },
    9: {
      planet: 'Mars (Mangal)',
      archetype: 'The Dynamic Warrior & Indomitable Executive',
      fortunateDays: ['Tuesday', 'Thursday', 'Sunday'],
      luckyDates: [9, 18, 27],
      powerColors: ['Crimson Red', 'Scarlet', 'Deep Coral', 'Gold'],
      gems: ['Red Coral', 'Bloodstone', 'Carnelian'],
      motto: 'Unstoppable willpower, fearless initiative, executive dominance, and rapid triumph over obstacles.',
    },
  };

  const meta = CHEIRO_MAP[birthNumber] || CHEIRO_MAP[1];

  // Calculate Cheiro's Fateful Turning Ages (based on Root Number and 7/9 year cycles)
  const baseYears = [birthNumber, birthNumber + 9, birthNumber + 18, birthNumber + 27, birthNumber + 36, birthNumber + 45, birthNumber + 54];
  const standardAges = [19, 21, 28, 33, 35, 42, 49, 56];
  const fatefulTurningAges = Array.from(new Set([...baseYears, ...standardAges]))
    .filter((a) => a >= 15 && a <= 80)
    .sort((a, b) => a - b);

  return {
    birthNumber,
    destinyNumber,
    rulingPlanet: meta.planet,
    cheiroArchetype: meta.archetype,
    fatefulTurningAges,
    fortunateDays: meta.fortunateDays,
    luckyDates: meta.luckyDates,
    powerColors: meta.powerColors,
    luckyGems: meta.gems,
    corePredictiveMotto: meta.motto,
  };
}

// Generate the curated timeline of Critical Transits & Dashas for a given profile
export function generateLifeMilestonesAndCriticalTransits(
  birthDateStr: string,
  birthTimeStr: string,
  latitude: number,
  longitude: number
): {
  milestones: CriticalDashaTransitMilestone[];
  bestCareerPeriods: CriticalDashaTransitMilestone[];
  bestEducationPeriods: CriticalDashaTransitMilestone[];
  bestWealthPeriods: CriticalDashaTransitMilestone[];
  currentPeriod: CriticalDashaTransitMilestone | undefined;
  cheiroSummary: CheiroProfileSummary;
} {
  const birthDateTime = new Date(`${birthDateStr}T${birthTimeStr}:00`);
  const natalCalc = calculatePlanetaryPositions(birthDateTime, latitude, longitude);

  const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra');
  const natalMoonTotalDeg = natalMoon ? (natalMoon.rasiNumber - 1) * 30 + natalMoon.degree : 45;
  const natalMoonRasi = natalMoon?.rasiNumber || 2;
  const natalLagnaRasi = natalCalc.lagnaRasi || 1;

  // 1. Calculate Vimshottari Mahadashas
  const vimshottariDasha = calculateVimshottariDasha(natalMoonTotalDeg, birthDateStr);
  const cheiroSummary = getCheiroProfileSummary(birthDateStr);

  const dateParts = birthDateStr.split('-').map(Number);
  const birthYear = dateParts[0] || 1990;
  const birthMonth = (dateParts[1] || 5) - 1;
  const birthDay = dateParts[2] || 15;
  const baseBirthDate = new Date(birthYear, birthMonth, birthDay);

  const now = new Date();
  const currentAge = (now.getTime() - baseBirthDate.getTime()) / (365.25 * 24 * 3600 * 1000);

  const milestones: CriticalDashaTransitMilestone[] = [];

  // Iterate through Mahadashas and their key Antardashas
  vimshottariDasha.cycle.forEach((maha, mahaIdx) => {
    // Get all 9 Antardashas for this Mahadasha
    const antardashas = calculateAntardashas(
      maha.planet,
      maha.durationYears,
      maha.startAge,
      birthDateStr
    );

    antardashas.forEach((antar, antarIdx) => {
      // Calculate mid-date for Gochar transit calculation
      const midAge = (antar.startAge + antar.endAge) / 2;
      const midDate = new Date(baseBirthDate.getTime());
      midDate.setMonth(midDate.getMonth() + Math.round(midAge * 12));

      // Calculate sidereal Gochar positions at midDate
      const transitCalc = calculatePlanetaryPositions(midDate, latitude, longitude);
      const saturn = transitCalc.planets.find((p) => p.name === 'Shani');
      const jupiter = transitCalc.planets.find((p) => p.name === 'Guru');
      const rahu = transitCalc.planets.find((p) => p.name === 'Rahu');

      const satRasi = saturn?.rasiNumber || 1;
      const jupRasi = jupiter?.rasiNumber || 1;
      const rahuRasi = rahu?.rasiNumber || 1;

      const satHouseFromMoon = ((satRasi - natalMoonRasi + 12) % 12) + 1;
      const satHouseFromLagna = ((satRasi - natalLagnaRasi + 12) % 12) + 1;

      const jupHouseFromMoon = ((jupRasi - natalMoonRasi + 12) % 12) + 1;
      const jupHouseFromLagna = ((jupRasi - natalLagnaRasi + 12) % 12) + 1;

      const isCurrent = currentAge >= antar.startAge && currentAge < antar.endAge;
      const isPast = antar.endAge <= currentAge;
      const isFuture = antar.startAge > currentAge;

      // Evaluate Astrological Potency
      const isJupiterBenefic = [1, 2, 5, 7, 9, 11].includes(jupHouseFromMoon) || [1, 5, 9, 10, 11].includes(jupHouseFromLagna);
      const isSaturnUpachaya = [3, 6, 11].includes(satHouseFromMoon) || [3, 6, 11].includes(satHouseFromLagna);
      const isSadeSati = [12, 1, 2].includes(satHouseFromMoon);

      // Check Dr. B.V. Raman & K.N. Rao's Double Transit Lock (Saturn + Jupiter concurrent activation)
      let doubleTransitHouse = 10;
      let doubleTransitEvent = 'Career zenith and recognition';
      if ([1, 5, 9].includes(jupHouseFromLagna) && [3, 6, 10, 11].includes(satHouseFromLagna)) {
        doubleTransitHouse = 10;
        doubleTransitEvent = 'High promotion, title elevation, and professional breakthrough';
      } else if ([2, 11].includes(jupHouseFromLagna) || [2, 11].includes(satHouseFromLagna)) {
        doubleTransitHouse = 2;
        doubleTransitEvent = 'Surge in liquid capital, property acquisition, and profitable deal closures';
      } else if ([5, 9].includes(jupHouseFromMoon) || [5, 9].includes(satHouseFromMoon)) {
        doubleTransitHouse = 5;
        doubleTransitEvent = 'Scholastic honors, competitive examination triumphs, or child-related bliss';
      } else if ([7].includes(jupHouseFromLagna) || [7].includes(jupHouseFromMoon)) {
        doubleTransitHouse = 7;
        doubleTransitEvent = 'Sacred matrimonial union, lucrative business partnerships, and public alliances';
      }

      const doubleTransitVerdict = `Double-Transit Law (Dr. B.V. Raman / K.N. Rao): Saturn & Jupiter jointly energize House ${doubleTransitHouse} — ${doubleTransitEvent} is cosmically guaranteed to manifest.`;

      // Determine Primary Domain based on Age and Planetary Significations
      let primaryDomain: LifeMilestoneDomain = 'Career';
      let secondaryDomain: LifeMilestoneDomain | undefined = undefined;
      let verdictHeadline = '';
      let verdictType: 'was_best' | 'current_best' | 'will_be_best' | 'karmic_restructuring' = 'was_best';
      let ratingStars = 4.0;
      let ratingLabel: CriticalDashaTransitMilestone['ratingLabel'] = 'High Auspiciousness (4/5)';

      // Short, punchy predictive bullet points (Cheiro & Raman Style)
      const predictivePoints: string[] = [];

      // Cheiro turning age relevance
      const isCheiroTurningAge = cheiroSummary.fatefulTurningAges.some(
        (age) => Math.abs(age - midAge) <= 1.2
      );
      const cheiroTurningPoint = isCheiroTurningAge
        ? `Cheiro Fateful Turning Age (${Math.round(midAge)} yrs): A major destiny pivot point; sudden structural jump in worldly status.`
        : `Harmonic Cycle Period (Age ${antar.startAge}–${antar.endAge}): Steady compounding of karmic seeds.`;

      // 1. Education Priority (ages 4 to 25)
      if (midAge >= 4 && midAge <= 25) {
        primaryDomain = 'Education';
        if (['Budha', 'Guru', 'Shukra', 'Surya'].includes(antar.planet) || isJupiterBenefic) {
          ratingStars = 5.0;
          ratingLabel = 'Golden Era (5/5)';
          secondaryDomain = 'Career';
          if (isPast) {
            verdictHeadline = `Was the Best Period for Academic Excellence, University Degrees & Competitive Laurels`;
            verdictType = 'was_best';
            predictivePoints.push(
              `• Academic Distinction: Breakthrough success in competitive entrance tests and degree honors.`,
              `• Intellectual Agility: Mercury/Jupiter ray sharpened retentive memory and analytical writing.`,
              `• Mentorship Catalyst: Gained invaluable patronage from esteemed professors or academic guides.`,
              `• Cheiro Timing Law: Key pivot occurred on dates carrying numbers ${cheiroSummary.luckyDates.slice(0, 2).join(', ')}.`
            );
          } else if (isCurrent) {
            verdictHeadline = `Current Golden Window for Academic Triumphs & Competitive Examination Success`;
            verdictType = 'current_best';
            predictivePoints.push(
              `• Landmark Achievement: Prime window to clear civil/national certification or secure university admissions.`,
              `• Focus Multiplier: Highest intellectual focus of this 5-year cycle; submit thesis and publish research now.`,
              `• Golden Days: Schedule critical exams or interviews on ${cheiroSummary.fortunateDays[0]}s.`,
              `• Strict Precaution: Eliminate digital scatter; avoid multitasking during final revision sprints.`
            );
          } else {
            verdictHeadline = `Will be the Best Period for Higher Education, Research & Academic Honors`;
            verdictType = 'will_be_best';
            predictivePoints.push(
              `• Scholastic Leap: Will mark the crowning educational milestone with prestigious scholarships or awards.`,
              `• Strategic Timing: Target premier global institutions or specialized technical accreditations.`,
              `• Karmic Momentum: Intellect and luck conjoin to surpass competing candidates effortlessly.`,
              `• Cheiro Secret: Power dates ${cheiroSummary.luckyDates.join(', ')} will open fateful doors.`
            );
          }
        } else {
          verdictHeadline = isPast
            ? `Formative Schooling & Disciplined Study Period`
            : `Crucial Education & Foundation Building Phase`;
          verdictType = isPast ? 'was_best' : isCurrent ? 'current_best' : 'will_be_best';
          predictivePoints.push(
            `• Foundation Building: Meticulous discipline required to master core technical and quantitative subjects.`,
            `• Steady Progress: Gradual academic climb through persistent revision and routine maintenance.`,
            `• Guidance Note: Strengthen concentration through early-morning study sessions.`
          );
        }
      }
      // 2. Career, Wealth, or Marriage (ages 25 to 65)
      else if (midAge > 25 && midAge <= 65) {
        const isCareerLord = ['Surya', 'Mangal', 'Guru', 'Shani', 'Budha'].includes(antar.planet);
        const isWealthLord = ['Guru', 'Shukra', 'Budha', 'Chandra'].includes(antar.planet);
        const isMarriageLord = ['Shukra', 'Guru'].includes(antar.planet) && midAge >= 23 && midAge <= 38;

        if (isMarriageLord && (jupHouseFromMoon === 7 || jupHouseFromLagna === 7 || isJupiterBenefic) && !isSadeSati) {
          primaryDomain = 'Marriage & Family';
          secondaryDomain = 'Wealth & Property';
          ratingStars = 5.0;
          ratingLabel = 'Golden Era (5/5)';
          if (isPast) {
            verdictHeadline = `Was the Best Period for Marriage, Sacred Union & Domestic Blossoming`;
            verdictType = 'was_best';
            predictivePoints.push(
              `• Sacred Union: Fateful solemnization of marriage and joyful family expansion.`,
              `• Partner Fortune: Conjunction of spouse's horoscope elevated household prosperity.`,
              `• Domestic Harmony: Established lasting residential stability and communal affection.`,
              `• Cheiro Insight: Heart decisions taken in this window proved deeply protective.`
            );
          } else if (isCurrent) {
            verdictHeadline = `Current Prime Window for Marriage, Spousal Harmony & Life Alliances`;
            verdictType = 'current_best';
            predictivePoints.push(
              `• Immediate Alliance Window: Peak planetary alignment to finalize marriage negotiations or deepen spousal bonds.`,
              `• Joint Wealth Surge: Mutual ventures with spouse or close partners yield compounding returns.`,
              `• Power Timing: Plan vital relationship dialogues on ${cheiroSummary.fortunateDays[0]}s wearing ${cheiroSummary.powerColors[0]}.`,
              `• Guardrail: Eliminate third-party interference in intimate marital decisions.`
            );
          } else {
            verdictHeadline = `Will be the Best Period for Auspicious Marriage & Family Prosperity`;
            verdictType = 'will_be_best';
            predictivePoints.push(
              `• Destiny Union: Irresistible karmic alignment leading to matrimonial alliance and deep emotional contentment.`,
              `• Elevation of Status: Alliance brings social prestige, cultural goodwill, and financial stability.`,
              `• Family Milestones: Unlocks joyous domestic events, new residence, and mutual prosperity.`,
              `• Cheiro Rule: Days ruled by ${cheiroSummary.rulingPlanet} will crystallize key agreements.`
            );
          }
        } else if (isSaturnUpachaya && isJupiterBenefic) {
          primaryDomain = 'Career';
          secondaryDomain = 'Wealth & Property';
          ratingStars = 5.0;
          ratingLabel = 'Golden Era (5/5)';
          if (isPast) {
            verdictHeadline = `Was the Best Period for Career Ascension, Promotion & High Professional Authority`;
            verdictType = 'was_best';
            predictivePoints.push(
              `• Executive Rise: Rapid promotion to managerial/supervisory hierarchy with increased mandate.`,
              `• Authority Conferred: Triumph over professional rivals through superior strategic acumen.`,
              `• Financial Re-Rating: Substantial revision in compensation package and equity/bonus allocations.`,
              `• Cheiro Turning Point: Key career breakthrough triggered during age ${Math.round(midAge)}.`
            );
          } else if (isCurrent) {
            verdictHeadline = `Current Peak Window: Best Period for Executive Authority, Business Expansion & Promotion`;
            verdictType = 'current_best';
            predictivePoints.push(
              `• Decisive Breakthrough: Prime window of the decade to demand executive promotion, launch business, or pitch big clients.`,
              `• Maximum Planetary Backing: Saturn in Upachaya guarantees unshakeable victory over competitors.`,
              `• Critical Action: Pitch landmark contracts on ${cheiroSummary.fortunateDays.join(' or ')} for guaranteed success.`,
              `• Strict Warning: Do not accept vague oral promises; insist on executed written contracts.`
            );
          } else {
            verdictHeadline = `Will be the Best Period for Industry Prominence, High-Stakes Career Leadership & Wealth`;
            verdictType = 'will_be_best';
            predictivePoints.push(
              `• Pinnacle of Authority: Will command highest institutional power, industry respect, and executive influence.`,
              `• Capital Creation: Career breakthroughs will directly convert into multi-stream wealth and assets.`,
              `• Legacy Foundation: Projects established during this window will thrive for 12+ years.`,
              `• Cheiro Prophecy: Fortunate dates ${cheiroSummary.luckyDates.slice(0, 2).join(', ')} will seal your defining deal.`
            );
          }
        } else if (isWealthLord && (jupHouseFromMoon === 2 || jupHouseFromMoon === 11 || jupHouseFromLagna === 11)) {
          primaryDomain = 'Wealth & Property';
          secondaryDomain = 'Career';
          ratingStars = 4.5;
          ratingLabel = 'Prime Growth (4.5/5)';
          if (isPast) {
            verdictHeadline = `Was the Best Period for Capital Multiplier, Real Estate Acquisitions & Financial Gains`;
            verdictType = 'was_best';
            predictivePoints.push(
              `• Asset Multiplier: Landmark acquisition of residential real estate, commercial land, or lucrative vehicles.`,
              `• Liquid Wealth Surge: Direct activation of 2nd/11th Dhana Bhavas unlocked unprecedented financial reserves.`,
              `• Investment Triumph: Long-term portfolio bets matured into substantial liquid dividends.`,
              `• Cheiro Guidance: Capital channeled into stone/land yielded impregnable security.`
            );
          } else if (isCurrent) {
            verdictHeadline = `Current Golden Window for Lucrative Investments, Property Purchase & Asset Growth`;
            verdictType = 'current_best';
            predictivePoints.push(
              `• Wealth Multiplication: Optimal cosmic window to execute property deeds, purchase land, or rebalance portfolios.`,
              `• Revenue Expansion: Multiple income channels open up through advisory, investments, or commercial bonuses.`,
              `• Direct Action: Close asset transactions on dates vibrating to ${cheiroSummary.birthNumber} (${cheiroSummary.luckyDates.join(', ')}).`,
              `• Guardrail: Avoid unvetted speculative micro-bets; compound into enduring real-world tangible assets.`
            );
          } else {
            verdictHeadline = `Will be the Best Period for Real Estate Expansion, Compounding Wealth & Prosperity`;
            verdictType = 'will_be_best';
            predictivePoints.push(
              `• Financial Independence: Will solidify permanent generational wealth and debt liquidation.`,
              `• Real Estate Expansion: Multiple property acquisitions and profitable commercial holdings.`,
              `• Compounding Surge: Investments made prior to this era will multiply exponentially.`,
              `• Cheiro Law: Auspicious day ${cheiroSummary.fortunateDays[0]} will bring major financial news.`
            );
          }
        } else if (isSadeSati) {
          primaryDomain = 'Health & Restructuring';
          secondaryDomain = 'Career';
          ratingStars = 3.5;
          ratingLabel = 'Karmic Maturation (3.5/5)';
          verdictHeadline = isPast
            ? `Major Karmic Restructuring & Resilience-Building Phase (Overcame Heavy Obstacles)`
            : isCurrent
            ? `Active Karmic Maturation & Endurance Window (Patience Required for Long-Term Rewards)`
            : `Future Karmic Maturation Window: Deep Character Building & Endurance`;
          verdictType = 'karmic_restructuring';
          predictivePoints.push(
            `• Karmic Realignment: Shani strips away illusion to forge unbreakable inner tenacity and pragmatic wisdom.`,
            `• Structural Reorganization: Heavy workload and delays test patience, preparing you for senior leadership.`,
            `• Vital Health Focus: Guard against spinal/joint fatigue, chronic stress, and sleeplessness through Ayurvedic regimen.`,
            `• Cheiro Antidote: Practice silent perseverance; avoid impulsive legal or verbal disputes.`
          );
        } else if (antar.planet === 'Rahu' || maha.planet === 'Rahu') {
          primaryDomain = 'Spiritual & Foreign';
          secondaryDomain = 'Career';
          ratingStars = 4.0;
          ratingLabel = 'High Auspiciousness (4/5)';
          verdictHeadline = isPast
            ? `Was the Best Period for Global Travel, Foreign Collaborations & Unconventional Expansion`
            : isCurrent
            ? `Current Golden Window for International Relocation, Tech Innovation & High Visibility`
            : `Will be the Best Period for Foreign Ventures, Tech Innovation & Worldwide Recognition`;
          verdictType = isPast ? 'was_best' : isCurrent ? 'current_best' : 'will_be_best';
          predictivePoints.push(
            `• Foreign Horizon: Unlocked cross-border projects, international visas, or collaboration with foreign enterprises.`,
            `• Technological Disruption: Adoption of pioneering digital tools, AI automation, or unconventional media.`,
            `• Sudden Status Jump: Rapid visibility boost in public and industry circles through novel initiatives.`,
            `• Cheiro Precaution: Scrutinize contractual fine-print to guard against sudden misunderstandings.`
          );
        } else {
          primaryDomain = 'Career';
          secondaryDomain = 'Wealth & Property';
          ratingStars = 4.0;
          ratingLabel = 'High Auspiciousness (4/5)';
          verdictHeadline = isPast
            ? `Solid Professional Advancement & Administrative Steady Gains`
            : isCurrent
            ? `Active Phase of Professional Advancement & Compounding Responsibility`
            : `Will be a Steady Window of Professional Elevation & Security`;
          verdictType = isPast ? 'was_best' : isCurrent ? 'current_best' : 'will_be_best';
          predictivePoints.push(
            `• Steady Consolidation: Reliable upward progression in organizational hierarchy and administrative authority.`,
            `• Competence Acknowledged: Superiors and peers rely upon your strategic dependability and sound execution.`,
            `• Incremental Wealth: Consistent earnings, systematic investments, and financial peace of mind.`
          );
        }
      }
      // 3. Senior Years (ages 65+)
      else {
        primaryDomain = 'Spiritual & Foreign';
        secondaryDomain = 'Wealth & Property';
        ratingStars = 4.5;
        ratingLabel = 'Prime Growth (4.5/5)';
        verdictHeadline = isPast
          ? `Period of Elder Guidance, Mentorship & Dharmic Peace`
          : isCurrent
          ? `Current Sacred Era of Dharmic Wisdom, Legacy Mentorship & Inner Awakening`
          : `Will be the Golden Era of Spiritual Wisdom, Family Legacy & Dharmic Peace`;
        verdictType = isPast ? 'was_best' : isCurrent ? 'current_best' : 'will_be_best';
        predictivePoints.push(
          `• Dharmic Legacy: Active sharing of lifetime wisdom through writing, advisory boards, and family guidance.`,
          `• Inner Tranquility: Deepening meditative stillness, philanthropic satisfaction, and spiritual joy.`,
          `• Family Pillar: Revered as the foundational elder whose blessings protect future generations.`
        );
      }

      const status: MilestoneTimingStatus = isCurrent
        ? 'Current Best'
        : isPast
        ? 'Past Best'
        : 'Future Best';

      // Astrological transits description
      const saturnSign = saturn?.rasiName || 'Meena';
      const jupiterSign = jupiter?.rasiName || 'Mithuna';
      const rahuSign = rahu?.rasiName || 'Kumbha';

      const saturnSummary = `Saturn in ${saturnSign} (House ${satHouseFromMoon} from Moon, House ${satHouseFromLagna} from Lagna)`;
      const jupiterSummary = `Jupiter in ${jupiterSign} (House ${jupHouseFromMoon} from Moon, House ${jupHouseFromLagna} from Lagna)`;
      const rahuKetuAxis = `Rahu in ${rahuSign} axis`;

      const transitSummary = `${saturnSummary}; ${jupiterSummary}; ${rahuKetuAxis}`;

      // Highlights
      const highlights: string[] = [
        `Dasha Alignment: ${maha.planet} Mahadasha with ${antar.planet} Antardasha (${antar.durationYearsStr}) activating key karmic bhavas.`,
        `Major Cosmic Transit: ${jupiterSummary} delivering divine blessing; ${saturnSummary} providing structural foundation.`,
        `Parashari Rule: ${
          isJupiterBenefic
            ? 'Jupiter in auspicious trine/angle expands fortune and destroys negative doshas.'
            : 'Disciplined transit conditions demand meticulous preparation.'
        }`,
      ];

      // Astrological Mechanism
      const astrologicalMechanism = `Mahadasha Lord ${maha.planet} establishes the macro life theme of "${maha.lifeTheme}", while sub-lord ${antar.planet} governs immediate daily breakthroughs. Concurrently, Gochar Saturn transits House ${satHouseFromLagna} from Janma Lagna while Jupiter blesses House ${jupHouseFromMoon} from Janma Rasi, concentrating celestial energies into ${primaryDomain.toLowerCase()}.`;

      // Strategic Advice
      const strategicAdvice =
        primaryDomain === 'Education'
          ? 'Prioritize national entrance tests, competitive certifications, and academic mentor guidance.'
          : primaryDomain === 'Career'
          ? 'Step boldly into leadership roles, propose strategic initiatives, formalize contracts, and expand networks.'
          : primaryDomain === 'Wealth & Property'
          ? 'Channel liquid reserves into tangible assets like real estate, sovereign bonds, and compounding portfolios.'
          : primaryDomain === 'Marriage & Family'
          ? 'Celebrate domestic milestones, deepen emotional communication, and cultivate reciprocal respect with family elders.'
          : primaryDomain === 'Spiritual & Foreign'
          ? 'Engage in sacred pilgrimage, study ancient philosophical treatises, and embrace international travel.'
          : 'Conserve emotional stamina, practice daily meditation, prioritize joint and back health through Ayurvedic oil massage, and maintain patient persistence.';

      milestones.push({
        id: `milestone-${mahaIdx}-${antarIdx}`,
        periodStartMonthYear: antar.startMonthYear,
        periodEndMonthYear: antar.endMonthYear,
        startAge: antar.startAge,
        endAge: antar.endAge,
        startDate: antar.startMonthYear,
        endDate: antar.endMonthYear,
        status,
        isCurrent,
        mahadashaLord: maha.planet,
        antardashaLord: antar.planet,
        dashaDescription: `${maha.planet} Mahadasha • ${antar.planet} Antardasha`,
        criticalTransits: {
          saturnTransit: saturnSummary,
          saturnHouseFromMoon: satHouseFromMoon,
          saturnHouseFromLagna: satHouseFromLagna,
          jupiterTransit: jupiterSummary,
          jupiterHouseFromMoon: jupHouseFromMoon,
          jupiterHouseFromLagna: jupHouseFromLagna,
          rahuKetuAxis,
          summary: transitSummary,
        },
        primaryDomain,
        secondaryDomain,
        verdictHeadline,
        verdictType,
        ratingStars,
        ratingLabel,
        predictivePoints,
        cheiroTurningPoint,
        doubleTransitVerdict,
        highlights,
        astrologicalMechanism,
        strategicAdvice,
      });
    });
  });

  // Filter top domain-specific best periods
  const bestCareerPeriods = milestones.filter(
    (m) => (m.primaryDomain === 'Career' || m.secondaryDomain === 'Career') && m.ratingStars >= 4.5
  );

  const bestEducationPeriods = milestones.filter(
    (m) => (m.primaryDomain === 'Education' || m.secondaryDomain === 'Education') && m.ratingStars >= 4.5
  );

  const bestWealthPeriods = milestones.filter(
    (m) => (m.primaryDomain === 'Wealth & Property' || m.secondaryDomain === 'Wealth & Property') && m.ratingStars >= 4.5
  );

  const currentPeriod = milestones.find((m) => m.isCurrent);

  return {
    milestones,
    bestCareerPeriods,
    bestEducationPeriods,
    bestWealthPeriods,
    currentPeriod,
    cheiroSummary,
  };
}
