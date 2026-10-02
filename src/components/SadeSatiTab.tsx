import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Flame,
  Calendar,
  Clock,
  BookOpen,
  Activity,
  Briefcase,
  Heart,
  Compass,
} from 'lucide-react';
import { VEDIC_RASIS } from '../data';
import { UserProfile, VedicRasiName } from '../types';
import { calculatePlanetaryPositions } from '../vedicMath';

interface SadeSatiTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
}

interface DhaiyaPhaseDetail {
  phaseTitle: string;
  houseFromMoon: string;
  transitRasi: string;
  period: string;
  payaMetal: 'Silver (Rajata Paya)' | 'Copper (Tamra Paya)' | 'Gold (Swarna Paya)' | 'Iron (Loha Paya)';
  payaEffect: string;
  effects: string;
  remediation: string;
  isCurrentPhase: boolean;
}

interface OverallSadeSatiCycle {
  overallPeriod: string;
  cycleStatusLabel: string;
  phases: DhaiyaPhaseDetail[];
  overallEffects: {
    career: string;
    finance: string;
    health: string;
    relationships: string;
    spiritual: string;
  };
  overallRemedies: {
    mantra: string;
    charity: string;
    karma: string;
    lalKitab: string;
  };
}

interface MonthlySadeSatiRecord {
  monthIndex: number;
  monthName: string;
  periodRange: string;
  shaniNakshatra: string;
  shaniMotion: 'Direct (Margi)' | 'Combust (Asta)' | 'Retrograde (Vakri)' | 'Stationary Direct';
  intensity: 'High Vigilance' | 'Moderate Discipline' | 'Constructive Growth' | 'Favorable Relief';
  activePhaseLabel: string;
  monthlyEffects: string;
  careerAndFinanceEffect: string;
  healthAndMindEffect: string;
  monthlyRemediation: string;
}

// Saturn's 30-year sidereal transit window per Rashi (1-12) for calculating exact 7.5-year Sade Sati & 3 Dhaiya periods
const SHANI_RASI_TRANSIT_WINDOWS: Record<number, { start: string; end: string; rasiLabel: string }> = {
  9: { start: 'Jan 2017', end: 'Jan 2020', rasiLabel: 'Dhanu (Sagittarius)' },
  10: { start: 'Jan 2020', end: 'Jan 2023', rasiLabel: 'Makara (Capricorn)' },
  11: { start: 'Jan 2023', end: 'Mar 2025', rasiLabel: 'Kumbha (Aquarius)' },
  12: { start: 'Mar 2025', end: 'Jun 2027', rasiLabel: 'Meena (Pisces)' },
  1: { start: 'Jun 2027', end: 'Aug 2029', rasiLabel: 'Mesha (Aries)' },
  2: { start: 'Aug 2029', end: 'May 2032', rasiLabel: 'Vrishabha (Taurus)' },
  3: { start: 'May 2032', end: 'Jul 2034', rasiLabel: 'Mithuna (Gemini)' },
  4: { start: 'Jul 2034', end: 'Aug 2036', rasiLabel: 'Karka (Cancer)' },
  5: { start: 'Aug 2036', end: 'Sep 2038', rasiLabel: 'Simha (Leo)' },
  6: { start: 'Sep 2038', end: 'Oct 2040', rasiLabel: 'Kanya (Virgo)' },
  7: { start: 'Oct 2040', end: 'Nov 2042', rasiLabel: 'Tula (Libra)' },
  8: { start: 'Nov 2042', end: 'Dec 2044', rasiLabel: 'Vrishchika (Scorpio)' },
};

const MONTHLY_SHANI_EPHEMERIS_BASE = [
  {
    monthIndex: 0,
    monthName: 'January',
    days: 31,
    nakshatra: 'Purva Bhadrapada (Pada 4) / Uttara Bhadrapada',
    motion: 'Direct (Margi)' as const,
    focusTheme: 'Annual karmic audit, structural planning, and disciplined routines',
    remedyFocus: 'Recite Dasharatha Shani Stotra on Saturdays and donate black sesame (Kala Til) with jaggery.',
  },
  {
    monthIndex: 1,
    monthName: 'February',
    days: 28,
    nakshatra: 'Uttara Bhadrapada (Pada 1)',
    motion: 'Direct (Margi)' as const,
    focusTheme: 'Financial prudence, debt consolidation, and steady professional execution',
    remedyFocus: 'Offer mustard oil Abhishekam to Lord Shani and perform Maha Shivaratri Rudrabhishekam.',
  },
  {
    monthIndex: 2,
    monthName: 'March',
    days: 31,
    nakshatra: 'Uttara Bhadrapada (Pada 2)',
    motion: 'Combust (Asta)' as const,
    focusTheme: 'Solar combustion of Saturn tests ego vs. authority; avoid workplace friction',
    remedyFocus: 'Offer water mixed with black sesame to Surya at sunrise and recite Aditya Hridaya Stotra + Shani Chalisa.',
  },
  {
    monthIndex: 3,
    monthName: 'April',
    days: 30,
    nakshatra: 'Uttara Bhadrapada (Pada 2–3)',
    motion: 'Direct (Margi)' as const,
    focusTheme: 'Shani Udaya (re-emergence) restores career clarity, institutional backing, and endurance',
    remedyFocus: 'Recite Sunderkand on Hanuman Jayanti / Saturdays and donate footwear or umbrellas to laborers.',
  },
  {
    monthIndex: 4,
    monthName: 'May',
    days: 31,
    nakshatra: 'Uttara Bhadrapada (Pada 3–4)',
    motion: 'Direct (Margi)' as const,
    focusTheme: 'Long-term asset building, skill mastery, and resolving ancestral obligations (Shani Jayanti)',
    remedyFocus: 'Observe Shani Jayanti puja; light a mustard oil lamp under a Peepal tree on Saturday evening.',
  },
  {
    monthIndex: 5,
    monthName: 'June',
    days: 30,
    nakshatra: 'Uttara Bhadrapada (Pada 4)',
    motion: 'Direct (Margi)' as const,
    focusTheme: 'Pre-retrograde slowing of Saturn; double-check legal contracts and domestic responsibilities',
    remedyFocus: 'Feed soaked black gram (Kala Chana) to birds/crows and chant "Om Sham Shanaischaraya Namah" (108x).',
  },
  {
    monthIndex: 6,
    monthName: 'July',
    days: 31,
    nakshatra: 'Uttara Bhadrapada (Pada 4 - Vakri)',
    motion: 'Retrograde (Vakri)' as const,
    focusTheme: 'Shani Vakri begins: deep internal introspection, revisiting unfinished duties, and joint/nerve care',
    remedyFocus: 'Perform Guru Purnima seva, practice daily Pranayama, and avoid speculative investments.',
  },
  {
    monthIndex: 7,
    monthName: 'August',
    days: 31,
    nakshatra: 'Uttara Bhadrapada (Pada 3 - Vakri)',
    motion: 'Retrograde (Vakri)' as const,
    focusTheme: 'Peak retrograde testing of patience in partnerships, family elders, and work deadlines',
    remedyFocus: 'Offer Bilva leaves & water on Shiva Lingam during Shravana Mondays and Saturdays.',
  },
  {
    monthIndex: 8,
    monthName: 'September',
    days: 30,
    nakshatra: 'Uttara Bhadrapada (Pada 2 - Vakri)',
    motion: 'Retrograde (Vakri)' as const,
    focusTheme: 'Ancestral karma cleansing (Pitru Paksha) and releasing outdated career attachments',
    remedyFocus: 'Perform Pitri Tarpan and donate food/grains to the elderly and underprivileged on Saturdays.',
  },
  {
    monthIndex: 9,
    monthName: 'October',
    days: 31,
    nakshatra: 'Uttara Bhadrapada (Pada 1–2 - Vakri)',
    motion: 'Retrograde (Vakri)' as const,
    focusTheme: 'Final stretch of Shani Vakri; emotional resilience yields sudden breakthroughs after delays',
    remedyFocus: 'Worship Maa Kalaratri / Goddess Durga during Navratri and light a sesame oil lamp in the West.',
  },
  {
    monthIndex: 10,
    monthName: 'November',
    days: 30,
    nakshatra: 'Uttara Bhadrapada (Pada 1 - Margi)',
    motion: 'Stationary Direct' as const,
    focusTheme: 'Shani turns Direct (Margi): stagnant projects unlock, financial flow improves, and mental fog lifts',
    remedyFocus: 'Perform Deepdaan on Kartik Saturdays and recite Maha Mrityunjaya Mantra for vitality.',
  },
  {
    monthIndex: 11,
    monthName: 'December',
    days: 31,
    nakshatra: 'Uttara Bhadrapada (Pada 2–3)',
    motion: 'Direct (Margi)' as const,
    focusTheme: 'Year-end consolidation of hard-earned rewards, karmic maturity, and stable domestic peace',
    remedyFocus: 'Donate warm blankets or woolens to the needy on Saturdays and read Bhagavad Gita Chapter 12.',
  },
];

export function SadeSatiTab({ activeProfileId, profiles }: SadeSatiTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const [selectedRasi, setSelectedRasi] = useState<VedicRasiName>('Meena');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<'all' | 'vakri' | 'high'>('all');

  // Sync with current profile's Moon Rasi
  useEffect(() => {
    if (currentProfile) {
      const [year, month, day] = currentProfile.birthDate.split('-').map(Number);
      const [hour, minute] = currentProfile.birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      const natalCalc = calculatePlanetaryPositions(
        birthDateTime,
        currentProfile.latitude ?? 28.6139,
        currentProfile.longitude ?? 77.2090
      );

      const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
      const rasiName = natalMoon.rasiName as VedicRasiName;
      if (rasiName) {
        setSelectedRasi(rasiName);
      }
    }
  }, [currentProfile]);

  // Currently Saturn is in Meena (Pisces, Rasi 12)
  const saturnRasiNum = 12; // Pisces

  // 2-Card Deck of Cards selector in Sade Sati
  const [activeSadeSatiDeck, setActiveSadeSatiDeck] = useState<'overall' | 'monthly'>('overall');

  const selectedRasiObj = VEDIC_RASIS.find((r) => r.sanskritName === selectedRasi) || VEDIC_RASIS[0];

  const getSadeSatiDetails = (rasiName: VedicRasiName) => {
    const rasiObj = VEDIC_RASIS.find((r) => r.sanskritName === rasiName) || VEDIC_RASIS[0];
    const diff = (saturnRasiNum - rasiObj.number + 12) % 12;

    if (diff === 11) {
      return {
        status: 'Rising Phase (1st Dhaiya of Sade Sati — Udaya Charan)',
        shortPhase: '1st Dhaiya (Rising)',
        severity: 'Moderate Vigilance',
        isSadeSati: true,
        diff,
        bg: 'bg-amber-50 border-amber-300 text-amber-900',
        description:
          'Saturn is transiting the 12th house from your natal Moon sign (Vyaya Shani). This initial 2.5-year phase prompts restructuring of expenses, foreign connections, sleep patterns, and spiritual detachment.',
        advice: 'Prudent budgeting, charitable acts, evening meditation, and reciting the Dasharatha Shani Stotram.',
      };
    } else if (diff === 0) {
      return {
        status: 'Peak Phase (2nd Dhaiya — Janma Shani / Shikhar Charan)',
        shortPhase: '2nd Dhaiya (Peak)',
        severity: 'High Focus Required',
        isSadeSati: true,
        diff,
        bg: 'bg-red-50 border-red-300 text-red-900',
        description:
          'Saturn is transiting directly over your natal Moon sign. This is the core 2.5-year crucible demanding uncompromising integrity, health care, emotional fortitude, and steady perseverance.',
        advice: 'Remain humble, respect elders and laborers, avoid hasty career gambles, and worship Lord Hanuman & Shani on Saturdays.',
      };
    } else if (diff === 1) {
      return {
        status: 'Setting Phase (3rd Dhaiya of Sade Sati — Asta Charan)',
        shortPhase: '3rd Dhaiya (Setting)',
        severity: 'Relieving & Consolidating',
        isSadeSati: true,
        diff,
        bg: 'bg-orange-50 border-orange-300 text-orange-900',
        description:
          'Saturn is transiting the 2nd house from your natal Moon (Dhana/Kutumba Bhava). The hardest tests are behind you; focus now turns to stabilizing family harmony, speech, and financial savings.',
        advice: 'Maintain gentle speech with family members, consolidate your career gains, and feed birds or stray animals.',
      };
    } else if (diff === 3) {
      return {
        status: 'Kantaka Shani (4th House Small Panoti / Dhaiya)',
        shortPhase: '4th House Dhaiya',
        severity: 'Medium Discipline',
        isSadeSati: false,
        diff,
        bg: 'bg-purple-50 border-purple-300 text-purple-900',
        description:
          'Saturn transits the 4th house from Moon (Ardhashtama / Sukha Dhaiya). Urges conscious care of domestic tranquility, property matters, mother’s health, and inner emotional balance.',
        advice: 'Keep a peaceful living space, honor your mother and elders, and recite Hanuman Chalisa daily.',
      };
    } else if (diff === 7) {
      return {
        status: 'Ashtama Shani (8th House Dhaiya)',
        shortPhase: '8th House Dhaiya',
        severity: 'Transformational',
        isSadeSati: false,
        diff,
        bg: 'bg-rose-50 border-rose-300 text-rose-900',
        description:
          'Saturn transits the 8th house from Moon (Ashtama Dhaiya). Calls for profound spiritual maturity, preventative wellness care, financial conservatism, and steady endurance.',
        advice: 'Avoid speculation, engage in Pranayama and spiritual charity, and revere Saturn as the divine teacher of karma.',
      };
    }

    return {
      status: 'Free from Sade Sati & Dhaiya (Shubh Shani Gochar)',
      shortPhase: `Shani in ${diff + 1}th from Moon`,
      severity: 'Favorable Period',
      isSadeSati: false,
      diff,
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      description:
        'Your Janma Rashi currently enjoys auspicious freedom from Sade Sati and Dhaiya. Lord Shani acts as a benevolent karmic stabilizer rewarding your disciplined efforts.',
      advice: 'Channel this productive period to initiate ambitious projects and expand your dharmic foundations.',
    };
  };

  // Compute Overall 7.5-Year Sade Sati Period, 3-Phase Breakdown, Multi-Domain Effects & Remedies for selected Rashi
  const overallCycle = useMemo<OverallSadeSatiCycle>(() => {
    const rasiNum = selectedRasiObj.number; // 1 to 12
    const rasi12th = ((rasiNum + 10) % 12) + 1;
    const rasi1st = rasiNum;
    const rasi2nd = (rasiNum % 12) + 1;

    const w1 = SHANI_RASI_TRANSIT_WINDOWS[rasi12th];
    const w2 = SHANI_RASI_TRANSIT_WINDOWS[rasi1st];
    const w3 = SHANI_RASI_TRANSIT_WINDOWS[rasi2nd];

    const diff = (saturnRasiNum - rasiNum + 12) % 12;
    const isCurrentlyInSadeSati = diff === 11 || diff === 0 || diff === 1;

    const overallPeriod = `${w1.start} – ${w3.end}`;
    const cycleStatusLabel = isCurrentlyInSadeSati
      ? 'Currently Active 7.5-Year Sade Sati Cycle'
      : rasiNum === 10
      ? 'Recently Completed Cycle (Next Cycle: Dec 2044 – Mar 2052)'
      : 'Full 7.5-Year Sade Sati Window for This Rashi';

    const phases: DhaiyaPhaseDetail[] = [
      {
        phaseTitle: '1st Phase: Rising Dhaiya (Udaya Charan)',
        houseFromMoon: '12th House from Moon (Vyaya Bhava)',
        transitRasi: w1.rasiLabel,
        period: `${w1.start} – ${w1.end}`,
        payaMetal: rasiNum % 2 === 0 ? 'Silver (Rajata Paya)' : 'Copper (Tamra Paya)',
        payaEffect:
          rasiNum % 2 === 0
            ? 'Silver Paya brings auspicious recognition and material protection despite initial expenses.'
            : 'Copper Paya supports health recovery, scholarly progress, and domestic restructuring.',
        effects:
          'Initiates the 7.5-year karmic refinement. Elevates expenditure on dharmic causes, prompts relocation or long journeys, tests sleep quality, and dissolves superficial alliances.',
        remediation:
          'Donate black sesame and mustard oil on Saturdays; avoid lending large sums without documentation; recite Dasharatha Shani Stotra before sleep.',
        isCurrentPhase: diff === 11,
      },
      {
        phaseTitle: '2nd Phase: Peak Dhaiya (Janma Shani / Shikhar)',
        houseFromMoon: '1st House over Natal Moon (Tanu/Manas)',
        transitRasi: w2.rasiLabel,
        period: `${w2.start} – ${w2.end}`,
        payaMetal: rasiNum % 3 === 0 ? 'Gold (Swarna Paya)' : 'Iron (Loha Paya)',
        payaEffect:
          rasiNum % 3 === 0
            ? 'Gold Paya demands high mental composure and careful balance between career duty and rest.'
            : 'Iron Paya forges unshakeable resilience through hard work, ultimately yielding lasting authority.',
        effects:
          'Saturn aspects the 3rd, 7th, and 10th houses from Moon. Directly restructures career identity, marital/business partnerships, and self-reliance while testing emotional stamina.',
        remediation:
          'Perform Saturday Tailabhishekam on Lord Shani, chant Hanuman Chalisa daily, maintain strict ethical transparency at work, and serve elders.',
        isCurrentPhase: diff === 0,
      },
      {
        phaseTitle: '3rd Phase: Setting Dhaiya (Asta Charan)',
        houseFromMoon: '2nd House from Moon (Dhana & Kutumba)',
        transitRasi: w3.rasiLabel,
        period: `${w3.start} – ${w3.end}`,
        payaMetal: 'Silver (Rajata Paya)',
        payaEffect:
          'Setting phase under Silver/Tamra influence rewards patience with financial stabilization and family reconciliation.',
        effects:
          'Focus shifts to accumulated wealth, family responsibilities, and speech restraint. As Saturn prepares to exit, Lord Shani bestows durable rewards for lessons mastered during the prior 5 years.',
        remediation:
          'Practice मधुर वाणी (gentle speech), feed seven types of grains (Satnaja) to birds, and offer Shami leaves or blue flowers on Saturdays.',
        isCurrentPhase: diff === 1,
      },
    ];

    return {
      overallPeriod,
      cycleStatusLabel,
      phases,
      overallEffects: {
        career:
          `For ${selectedRasiObj.sanskritName} (${selectedRasiObj.westernEquivalent}), Sade Sati strips away unsustainable shortcuts and replaces them with earned authority. Expect heightened accountability, role restructuring, and eventual durable promotion through persistent effort.`,
        finance:
          'Shifts financial habits from impulsive outflow toward disciplined asset creation. Guard against speculative risks or unverified guarantees during the Rising and Peak phases; long-term real estate and structured savings thrive in the Setting phase.',
        health:
          'Governs Vata balance, bones, teeth, knees, nervous system, and sleep quality. Regular oil massage (Abhyanga), warm nourishing meals, and structured rest prevent chronic fatigue.',
        relationships:
          'Tests mutual loyalty and maturity in marriage and partnerships (via Saturn’s 7th aspect in Peak phase and 2nd house transit in Setting phase). Honest, ego-free communication turns relationships into lifelong pillars.',
        spiritual:
          'Awakens deep Vairagya (inner poise), karmic clarity, and compassion for the underprivileged. Seva (selfless service) and nama-japa yield rapid spiritual elevation.',
      },
      overallRemedies: {
        mantra:
          'Chant Vedic Shani Beej Mantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः" (Om Pram Preem Proum Sah Shanaischaraya Namah — 108 times on Saturdays) & King Dasharatha’s Shani Stotra.',
        charity:
          'On Saturday evenings, donate black sesame (Kala Til), black urad dal, mustard oil, iron utensils, or black blankets to deserving laborers or temples.',
        karma:
          'Treat subordinates, sanitation workers, and elders with utmost respect; uphold 100% integrity in financial and professional commitments; avoid arrogance and intoxicants.',
        lalKitab:
          'Float a dry coconut or 400g black urad in flowing water, perform Chhaya Daan (viewing your reflection in a bowl of mustard oil and donating it on Saturday), and feed chapatis oiled with mustard oil to black dogs and crows.',
      },
    };
  }, [selectedRasiObj, saturnRasiNum]);

  const details = getSadeSatiDetails(selectedRasi);

  // Build Month-Wise Sade Sati Effects, Period & Remediation across all 12 Months
  const monthlyBreakdown = useMemo<MonthlySadeSatiRecord[]>(() => {
    const rasiNum = selectedRasiObj.number;
    const diff = (saturnRasiNum - rasiNum + 12) % 12;

    return MONTHLY_SHANI_EPHEMERIS_BASE.map((m) => {
      const isLeapYear = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0;
      const daysInMonth = m.monthIndex === 1 && isLeapYear ? 29 : m.days;
      const shortMonth = m.monthName.slice(0, 3);
      const periodRange = `01 ${shortMonth} ${selectedYear} – ${daysInMonth} ${shortMonth} ${selectedYear}`;

      const isVakri = m.motion === 'Retrograde (Vakri)';
      const isCombust = m.motion === 'Combust (Asta)';

      let intensity: MonthlySadeSatiRecord['intensity'] = 'Constructive Growth';
      if (diff === 0) {
        intensity = isVakri || isCombust ? 'High Vigilance' : 'Moderate Discipline';
      } else if (diff === 11 || diff === 1 || diff === 3 || diff === 7) {
        intensity = isVakri || isCombust ? 'High Vigilance' : 'Moderate Discipline';
      } else {
        intensity = isVakri ? 'Moderate Discipline' : 'Favorable Relief';
      }

      let careerAndFinanceEffect = '';
      let healthAndMindEffect = '';

      if (diff === 0) {
        careerAndFinanceEffect = isVakri
          ? `Peak Janma Shani + Vakri motion in ${m.monthName}: review pending career commitments, avoid sudden job switches, and audit cash flow carefully.`
          : `Peak Janma Shani in ${m.monthName}: steady execution brings respect from seniors; stick to structured budgets.`;
        healthAndMindEffect = isVakri
          ? 'Heightened mental introspection; prioritize 7–8 hours of sleep, knee/joint care, and evening Pranayama.'
          : 'Emotional steadiness improves through disciplined daily routines and morning sunlight.';
      } else if (diff === 11) {
        careerAndFinanceEffect = isVakri
          ? `Rising Dhaiya (12th house) + Vakri in ${m.monthName}: control unplanned overheads, foreign/travel delays, and hidden costs.`
          : `Rising Dhaiya in ${m.monthName}: favorable for international projects, research, and planned charitable outlays.`;
        healthAndMindEffect =
          'Guard against eye strain, foot fatigue, and late-night overthinking; practice Yoga Nidra before bed.';
      } else if (diff === 1) {
        careerAndFinanceEffect = isVakri
          ? `Setting Dhaiya (2nd house) + Vakri in ${m.monthName}: exercise patience in family property/wealth discussions and avoid harsh speech.`
          : `Setting Dhaiya in ${m.monthName}: steady accumulation of savings and consolidation of past hard work.`;
        healthAndMindEffect =
          'Pay attention to dental/throat care and nurture warm, supportive dialogue within the household.';
      } else if (diff === 3 || diff === 7) {
        careerAndFinanceEffect = isVakri
          ? `${details.shortPhase} + Vakri in ${m.monthName}: slow down major property or joint-asset decisions; focus on compliance.`
          : `${details.shortPhase} in ${m.monthName}: methodical progress at work when maintaining work-life balance.`;
        healthAndMindEffect =
          'Maintain domestic calm, postural care, and regular preventative checkups.';
      } else {
        careerAndFinanceEffect = isVakri
          ? `Favorable Shani Gochar (${details.shortPhase}) in ${m.monthName}: refine long-term strategy and clear backlogs.`
          : `Favorable Shani Gochar (${details.shortPhase}) in ${m.monthName}: strong momentum for career leadership and wealth creation.`;
        healthAndMindEffect =
          'High physical endurance, clear decision-making, and grounded mental peace.';
      }

      return {
        monthIndex: m.monthIndex,
        monthName: m.monthName,
        periodRange,
        shaniNakshatra: m.nakshatra,
        shaniMotion: m.motion,
        intensity,
        activePhaseLabel: details.shortPhase,
        monthlyEffects: `${m.focusTheme}. ${careerAndFinanceEffect}`,
        careerAndFinanceEffect,
        healthAndMindEffect,
        monthlyRemediation: m.remedyFocus,
      };
    });
  }, [selectedRasiObj, selectedYear, details.shortPhase]);

  const filteredMonths = useMemo(() => {
    if (monthFilter === 'vakri') {
      return monthlyBreakdown.filter(
        (m) => m.shaniMotion === 'Retrograde (Vakri)' || m.shaniMotion === 'Combust (Asta)'
      );
    }
    if (monthFilter === 'high') {
      return monthlyBreakdown.filter((m) => m.intensity === 'High Vigilance');
    }
    return monthlyBreakdown;
  }, [monthlyBreakdown, monthFilter]);

  return (
    <div className="w-full space-y-2">
      {/* Intro Header */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-3xs">
        <div className="flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-amber-700" />
          <h1 className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
            Sade Sati — Overall Period, Effects, Remediation &amp; Month-Wise Analysis
          </h1>
        </div>

        <div className="text-[13px] font-black uppercase tracking-wider text-stone-600 shrink-0">
          Current Saturn Transit: <span className="text-amber-800">Meena (Pisces)</span>
        </div>
      </div>

      {/* Rasi Selection - All 12 Rashis in 1 Single Compact Row */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/80 px-1.5 py-1 shadow-3xs">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1">
          {VEDIC_RASIS.map((rasi) => {
            const isSelected = selectedRasi === rasi.sanskritName;
            return (
              <div
                key={rasi.sanskritName}
                onClick={() => setSelectedRasi(rasi.sanskritName)}
                className={`rounded px-1.5 py-1 transition-all duration-150 cursor-pointer border flex flex-col items-center justify-center text-center ${
                  isSelected
                    ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 shadow-3xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
              >
                <span
                  className={`font-vedic font-bold text-[11px] leading-tight truncate w-full ${
                    isSelected ? 'text-amber-950' : 'text-stone-900'
                  }`}
                >
                  {rasi.sanskritName}
                </span>
                <span
                  className={`text-[9px] font-medium leading-tight truncate w-full ${
                    isSelected ? 'text-amber-800' : 'text-stone-500'
                  }`}
                >
                  {rasi.westernEquivalent}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SADE SATI 2-CARD DECK OF CARDS SELECTOR */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/90 px-2 py-1.5 shadow-3xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {[
            {
              id: 'overall',
              title: details.status,
              icon: Shield,
            },
            {
              id: 'monthly',
              title: `Month-Wise Sade Sati Period, Effects & Remediation — ${selectedRasiObj.sanskritName} (${selectedRasiObj.westernEquivalent})`,
              icon: Calendar,
            },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = activeSadeSatiDeck === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveSadeSatiDeck(card.id as 'overall' | 'monthly')}
                className={`group relative rounded-md px-2.5 py-1.5 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1.5 ${
                  isActive
                    ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5] shadow-3xs'
                }`}
              >
                <span
                  className={`font-vedic font-bold text-[12px] leading-snug truncate ${
                    isActive ? 'text-amber-950' : 'text-stone-900'
                  }`}
                >
                  {card.title}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. OVERALL SADE SATI PERIOD, STATUS & 3-PHASE TIMELINE */}
      {activeSadeSatiDeck === 'overall' && (
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between pb-2 border-b border-stone-100 gap-2">
          <div>
            <span className="text-[12px] font-black uppercase tracking-wider text-amber-800 block">
              Janma Rashi: {selectedRasiObj.sanskritName} ({selectedRasiObj.westernEquivalent}) • Lord: {selectedRasiObj.lord}
            </span>
            <h2 className="text-[18px] font-vedic font-bold text-stone-950">
              {details.status}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] px-2.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-950 font-bold">
              Overall 7.5-Yr Period: {overallCycle.overallPeriod}
            </span>
            <span className={`text-[12px] px-2.5 py-0.5 rounded-full font-bold border ${details.bg}`}>
              {details.severity}
            </span>
          </div>
        </div>

        <p className="text-[14px] text-stone-800 leading-snug">
          {details.description}
        </p>

        {/* 3 Dhaiya Phases (Rising, Peak, Setting) with Exact Periods, Effects & Remedies */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Overall 7.5-Year Sade Sati 3-Phase Timeline ({overallCycle.overallPeriod})</span>
            </h3>
            <span className="text-[11px] font-semibold text-stone-500">
              {overallCycle.cycleStatusLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {overallCycle.phases.map((phase) => (
              <div
                key={phase.phaseTitle}
                className={`rounded-lg border p-2.5 space-y-1.5 transition-all ${
                  phase.isCurrentPhase
                    ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-[#FAF8F5] border-stone-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">
                      {phase.houseFromMoon}
                    </span>
                    <h4 className="text-[14px] font-vedic font-bold text-stone-950 leading-snug">
                      {phase.phaseTitle}
                    </h4>
                  </div>
                  {phase.isCurrentPhase && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                      Active Now
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-bold text-stone-900">
                    Period: {phase.period}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 font-semibold text-purple-900">
                    Shani in {phase.transitRasi}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100/70 border border-amber-200 font-semibold text-amber-950">
                    {phase.payaMetal}
                  </span>
                </div>

                <p className="text-[12px] text-stone-700 leading-snug">
                  <strong className="text-stone-900">Effects:</strong> {phase.effects}
                </p>

                <div className="pt-1 border-t border-stone-200/70 text-[12px] text-emerald-950 leading-snug">
                  <strong className="text-emerald-800">Phase Remedy:</strong> {phase.remediation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Sade Sati Effects Across 5 Key Life Domains */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-[13px] font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-700" />
            <span>Overall Sade Sati Effects for {selectedRasiObj.sanskritName} ({selectedRasiObj.westernEquivalent})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5 text-[12px]">
            <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
              <strong className="text-amber-900 font-bold uppercase tracking-wider text-[11px] block mb-0.5">
                1. Career &amp; Authority
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallEffects.career}</p>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
              <strong className="text-emerald-900 font-bold uppercase tracking-wider text-[11px] block mb-0.5">
                2. Wealth &amp; Finance
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallEffects.finance}</p>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
              <strong className="text-rose-900 font-bold uppercase tracking-wider text-[11px] block mb-0.5">
                3. Health &amp; Vitality
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallEffects.health}</p>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
              <strong className="text-purple-900 font-bold uppercase tracking-wider text-[11px] block mb-0.5">
                4. Family &amp; Relations
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallEffects.relationships}</p>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
              <strong className="text-sky-900 font-bold uppercase tracking-wider text-[11px] block mb-0.5">
                5. Mind &amp; Spirituality
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallEffects.spiritual}</p>
            </div>
          </div>
        </div>

        {/* Overall Sade Sati Complete Vedic & Lal Kitab Remediation Protocol */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-[13px] font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Overall Sade Sati Remediation &amp; Upayas (Vedic, Puranic &amp; Lal Kitab)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 text-[12px]">
            <div className="bg-emerald-50/50 p-2 rounded border border-emerald-200/80">
              <strong className="text-emerald-950 font-bold block mb-0.5 text-[13px]">
                Mantra &amp; Stotra Sadhana
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallRemedies.mantra}</p>
            </div>
            <div className="bg-amber-50/50 p-2 rounded border border-amber-200/80">
              <strong className="text-amber-950 font-bold block mb-0.5 text-[13px]">
                Saturday Dana (Charity)
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallRemedies.charity}</p>
            </div>
            <div className="bg-sky-50/50 p-2 rounded border border-sky-200/80">
              <strong className="text-sky-950 font-bold block mb-0.5 text-[13px]">
                Behavioral Karma Yoga
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallRemedies.karma}</p>
            </div>
            <div className="bg-purple-50/50 p-2 rounded border border-purple-200/80">
              <strong className="text-purple-950 font-bold block mb-0.5 text-[13px]">
                Lal Kitab &amp; Chhaya Upay
              </strong>
              <p className="text-stone-700 leading-snug">{overallCycle.overallRemedies.lalKitab}</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. MONTH-WISE SADE SATI PERIOD, EFFECTS & REMEDIATION (ALL 12 MONTHS) */}
      {activeSadeSatiDeck === 'monthly' && (
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-stone-200">
          <div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              <h3 className="text-[15px] font-vedic font-bold text-stone-950">
                Month-Wise Sade Sati Period, Effects &amp; Remediation — {selectedRasiObj.sanskritName} ({selectedRasiObj.westernEquivalent})
              </h3>
            </div>
            <p className="text-[12px] text-stone-600">
              Monthly breakdown of Saturn’s Nakshatra, motion (Direct / Combust / Retrograde), targeted effects, and monthly remedies
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {/* Filter Deck of Cards (Compact 1-Row) */}
            {[
              { id: 'all', label: 'All 12 Months' },
              { id: 'vakri', label: 'Retrograde & Combust' },
              { id: 'high', label: 'High Vigilance' },
            ].map((f) => {
              const isActive = monthFilter === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setMonthFilter(f.id as any)}
                  className={`rounded px-2 py-0.5 text-[11px] font-vedic font-bold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {f.label}
                </div>
              );
            })}

            <div className="h-3.5 w-px bg-stone-200 mx-0.5 shrink-0" />

            {/* Year Deck of Cards (Compact 1-Row) */}
            {[2025, 2026, 2027, 2028].map((yr) => {
              const isYrSelected = selectedYear === yr;
              return (
                <div
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`rounded px-1.5 py-0.5 text-[11px] font-vedic font-bold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                    isYrSelected
                      ? 'bg-amber-50/95 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {yr}
                </div>
              );
            })}
          </div>
        </div>

        {/* 12-Month Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredMonths.map((item) => {
            const isVakri = item.shaniMotion === 'Retrograde (Vakri)';
            const isCombust = item.shaniMotion === 'Combust (Asta)';

            return (
              <div
                key={item.monthName}
                className={`rounded-lg border p-2.5 flex flex-col justify-between space-y-2 ${
                  isVakri
                    ? 'bg-amber-50/40 border-amber-300/90'
                    : isCombust
                    ? 'bg-rose-50/35 border-rose-200/90'
                    : 'bg-[#FAF8F5] border-stone-200/90'
                }`}
              >
                {/* Top Header: Month, Exact Period & Motion Badge */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <h4 className="text-[15px] font-vedic font-bold text-stone-950 leading-none">
                        {item.monthName} {selectedYear}
                      </h4>
                      <span className="text-[11px] font-bold text-amber-900 block mt-0.5">
                        Period: {item.periodRange}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                        isVakri
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : isCombust
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {item.shaniMotion}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-800 font-semibold">
                      Nakshatra: {item.shaniNakshatra}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-900 font-semibold">
                      {item.activePhaseLabel}
                    </span>
                  </div>
                </div>

                {/* Middle: Detailed Monthly Effects */}
                <div className="space-y-1 text-[12px] border-t border-stone-200/70 pt-1.5">
                  <p className="text-stone-800 leading-snug">
                    <strong className="text-stone-950">Career &amp; Finance Effect:</strong>{' '}
                    {item.careerAndFinanceEffect}
                  </p>
                  <p className="text-stone-700 leading-snug">
                    <strong className="text-stone-950">Health &amp; Mind Effect:</strong>{' '}
                    {item.healthAndMindEffect}
                  </p>
                </div>

                {/* Bottom: Monthly Remediation */}
                <div className="bg-white/90 rounded border border-emerald-200/80 p-1.5 text-[12px]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    {item.monthName} Remediation (Upay)
                  </span>
                  <p className="text-stone-800 leading-snug font-medium mt-0.5">
                    {item.monthlyRemediation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
