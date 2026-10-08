import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Gem,
  BookOpen,
  Sun,
  HeartHandshake,
  Compass,
  CheckCircle2,
  Loader2,
  Layers,
  Award,
  Clock,
  Activity,
  Feather,
} from 'lucide-react';
import {
  calculatePlanetaryPositions,
  calculateVimshottariDasha,
  calculateAntardashas,
  checkSadeSati,
} from '../vedicMath';
import { calculatePlanetShadbala } from './ShadbalaD3Chart';
import { VEDIC_RASIS } from '../data';
import { GrahaName, UserProfile } from '../types';

interface UpayRemediesTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
  onNavigateToDasha?: () => void;
  onNavigateToBirthCharts?: () => void;
}

interface GrahaRemedyMaster {
  planet: GrahaName;
  englishName: string;
  sanskritTitle: string;
  rulingDay: string;
  deity: string;
  beejMantra: string;
  gayatriMantra: string;
  stotra: string;
  japaCount: string;
  bestTime: string;
  primaryGemstone: string;
  substituteGem: string;
  gemWeight: string;
  gemMetal: string;
  gemFinger: string;
  rudraksha: string;
  lifestyleChanges: string[];
  charityDana: string;
  vastuDirection: string;
  lalKitabUpay: string;
}

const GRAHA_REMEDY_MASTER: Record<GrahaName, GrahaRemedyMaster> = {
  Surya: {
    planet: 'Surya',
    englishName: 'Sun',
    sanskritTitle: 'Surya Deva (Atmakaraka)',
    rulingDay: 'Sunday (Ravivar)',
    deity: 'Lord Surya Narayana & Sri Rama',
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः (Om Hram Hreem Hroum Sah Suryaya Namah)',
    gayatriMantra: 'ॐ भास्कराय विद्महे महातेजाय धीमहि तन्नो सूर्यः प्रचोदयात्',
    stotra: 'Aditya Hridaya Stotra (3 recitations at sunrise)',
    japaCount: '108 times daily (7,000 in 40-day Anushthan)',
    bestTime: 'Sunrise (within 45 mins of dawn facing East)',
    primaryGemstone: 'Natural Burma Ruby (Manikya)',
    substituteGem: 'Red Garnet (Tamda) or Sunstone',
    gemWeight: '5.25 – 6.25 Ratti (approx. 4.7 – 5.6 Carats)',
    gemMetal: 'Gold or Pure Copper',
    gemFinger: 'Ring Finger (Right Hand)',
    rudraksha: '1 Mukhi or 12 Mukhi Rudraksha',
    lifestyleChanges: [
      'Wake before sunrise during Brahma Muhurta and offer water (Arghya) in a copper vessel to the rising Sun.',
      'Practice upright spinal posture, keep promises unfailingly, and show heartfelt respect to your father and elders.',
      'Drink water stored overnight in a pure copper tumbler and reduce excessive late-night salt intake.',
    ],
    charityDana: 'Donate whole wheat, jaggery (Gud), copper vessels, or red cloth to needy elders on Sundays before noon.',
    vastuDirection: 'East (Purva) — Keep the eastern windows and entrance clean, bright, and unobstructed.',
    lalKitabUpay: 'Extinguish kitchen fire with a few drops of milk at night; feed wheat & jaggery to brown cows or monkeys on Sundays.',
  },
  Chandra: {
    planet: 'Chandra',
    englishName: 'Moon',
    sanskritTitle: 'Chandra Deva (Manokaraka)',
    rulingDay: 'Monday (Somvar)',
    deity: 'Lord Shiva (Somnath) & Goddess Gauri',
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (Om Shram Shreem Shroum Sah Chandramase Namah)',
    gayatriMantra: 'ॐ पद्मध्वजाय विद्महे हेमरूपाय धीमहि तन्नो सोमः प्रचोदयात्',
    stotra: 'Shiva Panchakshara Stotra & Chandrashekhara Ashtakam',
    japaCount: '108 times daily (11,000 in 40-day Anushthan)',
    bestTime: 'Monday evening during waxing Moon (Shukla Paksha)',
    primaryGemstone: 'Natural Basra / South Sea Pearl (Moti)',
    substituteGem: 'Natural Moonstone (Chandrakanta Mani)',
    gemWeight: '6.25 – 8.25 Ratti (approx. 5.6 – 7.5 Carats)',
    gemMetal: 'Pure Sterling Silver',
    gemFinger: 'Little Finger (Right Hand)',
    rudraksha: '2 Mukhi Rudraksha',
    lifestyleChanges: [
      'Seek your mother’s blessings daily; nurture emotional calm through 15 minutes of evening Chandra-Bhedana or Nadi Shodhana Pranayama.',
      'Drink water or warm milk from a pure silver glass and avoid cold/stale foods after sunset.',
      'Avoid wasting potable water; repair any dripping taps in the home immediately.',
    ],
    charityDana: 'Donate white basmati rice, raw cow milk, sugar candy (Mishri), white cloth, or silver items on Monday evenings.',
    vastuDirection: 'North-West (Vayavya) — Keep this zone serene, clutter-free, and softly lit with white/cream tones.',
    lalKitabUpay: 'Keep a solid square piece of pure silver in your pocket/wallet and offer raw milk + water to Shiva Lingam on Mondays.',
  },
  Mangal: {
    planet: 'Mangal',
    englishName: 'Mars',
    sanskritTitle: 'Mangal Deva (Bhauma)',
    rulingDay: 'Tuesday (Mangalvar)',
    deity: 'Lord Hanuman & Lord Kartikeya (Skanda)',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (Om Kram Kreem Kroum Sah Bhaumaya Namah)',
    gayatriMantra: 'ॐ अङ्गारकाय विद्महे शक्तिहस्ताय धीमहि तन्नो भौमः प्रचोदयात्',
    stotra: 'Sri Hanuman Chalisa & Bajrang Baan (on Tuesdays)',
    japaCount: '108 times daily (10,000 in 40-day Anushthan)',
    bestTime: 'Tuesday morning (1 hour after sunrise facing South)',
    primaryGemstone: 'Italian / Mediterranean Red Coral (Moonga)',
    substituteGem: 'Red Carnelian',
    gemWeight: '6.25 – 8.25 Ratti (approx. 5.6 – 7.5 Carats)',
    gemMetal: 'Gold or Copper',
    gemFinger: 'Ring Finger (Right Hand)',
    rudraksha: '3 Mukhi Rudraksha',
    lifestyleChanges: [
      'Channel fiery Mars energy into structured daily physical exercise, running, or Surya Namaskar.',
      'Maintain warm brotherhood with younger siblings; avoid impulsive anger, harsh speech, or kitchen arguments.',
      'Walk barefoot on natural soil or grass for 15 minutes to balance excess Pitta element.',
    ],
    charityDana: 'Donate red masoor lentils, jaggery, roasted gram (chana), sindoor, or pomegranates on Tuesdays.',
    vastuDirection: 'South (Dakshina) — Avoid placing water tanks in the South; keep the kitchen in South-East clean.',
    lalKitabUpay: 'Distribute sweet rotis or boondi prasad on Tuesdays; float sweet batasha or rewari in clean flowing water.',
  },
  Budha: {
    planet: 'Budha',
    englishName: 'Mercury',
    sanskritTitle: 'Budha Deva (Buddhikaraka)',
    rulingDay: 'Wednesday (Budhavar)',
    deity: 'Lord Maha Vishnu & Lord Krishna',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (Om Bram Breem Broum Sah Budhaya Namah)',
    gayatriMantra: 'ॐ गजध्वजाय विद्महे सुखहस्ताय धीमहि तन्नो बुधः प्रचोदयात्',
    stotra: 'Sri Vishnu Sahasranama Stotram',
    japaCount: '108 times daily (9,000 in 40-day Anushthan)',
    bestTime: 'Wednesday morning during Budha Hora facing North',
    primaryGemstone: 'Zambian / Colombian Emerald (Panna)',
    substituteGem: 'Natural Peridot or Green Tourmaline',
    gemWeight: '5.25 – 6.25 Ratti (approx. 4.7 – 5.6 Carats)',
    gemMetal: 'Gold or Silver',
    gemFinger: 'Little Finger (Right Hand)',
    rudraksha: '4 Mukhi Rudraksha',
    lifestyleChanges: [
      'Care for sacred Tulsi and green indoor plants; practice truthful, articulate, and compassionate speech.',
      'Dedicate 30 minutes daily to reading scriptures, journaling, or sharpening analytical skills.',
      'Maintain impeccable oral hygiene and practice evening digital detox to soothe the nervous system.',
    ],
    charityDana: 'Feed fresh green grass/spinach to cows (Gau-Seva) and donate green moong dal or notebooks to students on Wednesdays.',
    vastuDirection: 'North (Uttara) — Keep your study desk or treasury in the North facing North or East.',
    lalKitabUpay: 'Pierce nose/ear or keep an alum (Phitkari) piece for oral hygiene; gift green clothes/bangles to young girls (Kanyas).',
  },
  Guru: {
    planet: 'Guru',
    englishName: 'Jupiter',
    sanskritTitle: 'Devaguru Brihaspati (Jeevakaraka)',
    rulingDay: 'Thursday (Guruvar)',
    deity: 'Lord Dakshinamurthy, Lord Vishnu & Brihaspati',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (Om Gram Greem Groum Sah Gurave Namah)',
    gayatriMantra: 'ॐ वृषभध्वजाय विद्महे क्रुणिहस्ताय धीमहि तन्नो गुरुः प्रचोदयात्',
    stotra: 'Sri Guru Paduka Stotram & Vishnu Sahasranama',
    japaCount: '108 times daily (19,000 in 40-day Anushthan)',
    bestTime: 'Thursday morning during Brahma Muhurta facing North-East',
    primaryGemstone: 'Ceylon Yellow Sapphire (Pukhraj)',
    substituteGem: 'Natural Golden Topaz or Citrine (Sunela)',
    gemWeight: '5.25 – 6.25 Ratti (approx. 4.7 – 5.6 Carats)',
    gemMetal: 'Yellow Gold',
    gemFinger: 'Index Finger (Right Hand)',
    rudraksha: '5 Mukhi Rudraksha',
    lifestyleChanges: [
      'Apply a pinch of Kesar (saffron) or Haldi (turmeric) tilak on your forehead and navel every morning after bath.',
      'Honor teachers, mentors, and spiritual elders; never speak cynically about dharma or sacred traditions.',
      'Water a Banana or Peepal tree on Thursdays and maintain a clean, sattvic diet on Guruvar.',
    ],
    charityDana: 'Donate chana dal (Bengal gram), turmeric, yellow bananas, saffron, or sacred books on Thursdays.',
    vastuDirection: 'North-East (Ishanya) — Keep the North-East corner sacred, spotless, and free of heavy storage.',
    lalKitabUpay: 'Apply saffron tilak daily for 43 days; offer yellow chana dal and jaggery to a cow on Thursdays.',
  },
  Shukra: {
    planet: 'Shukra',
    englishName: 'Venus',
    sanskritTitle: 'Shukracharya (Kalatrakaraka)',
    rulingDay: 'Friday (Shukravar)',
    deity: 'Goddess Mahalakshmi & Maa Lalita Tripurasundari',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (Om Dram Dreem Droum Sah Shukraya Namah)',
    gayatriMantra: 'ॐ अश्वध्वजाय विद्महे धनुर्हस्ताय धीमहि तन्नो शुक्रः प्रचोदयात्',
    stotra: 'Sri Suktam (Rigveda) & Kanakadhara Stotram',
    japaCount: '108 times daily (16,000 in 40-day Anushthan)',
    bestTime: 'Friday morning at sunrise or evening Pradosha facing South-East',
    primaryGemstone: 'Natural Diamond (Heera) or White Sapphire',
    substituteGem: 'Natural White Zircon (Jarkan) or Opal',
    gemWeight: '0.50 – 1.00 Carat (Diamond) or 5.25 Ratti (Opal/White Sapphire)',
    gemMetal: 'Platinum, Silver, or White Gold',
    gemFinger: 'Middle or Ring Finger (Right Hand)',
    rudraksha: '6 Mukhi Rudraksha',
    lifestyleChanges: [
      'Wear freshly laundered, neat attire daily; use natural rose, sandalwood, or mogra attar (fragrance).',
      'Treat your spouse and women in the household with utmost dignity, gentleness, and appreciation.',
      'Keep your bedroom and living space aesthetically harmonious, fragrant, and free of torn fabrics.',
    ],
    charityDana: 'Donate white rice Kheer, pure cow ghee, camphor, curd, or white silk/cotton cloth on Fridays.',
    vastuDirection: 'South-East (Agneya) — Light a pure cow-ghee lamp with camphor in the evening.',
    lalKitabUpay: 'Feed green fodder and jaggery to a white cow on Fridays; donate pure cow ghee and camphor at a temple.',
  },
  Shani: {
    planet: 'Shani',
    englishName: 'Saturn',
    sanskritTitle: 'Shani Deva (Karmakaraka)',
    rulingDay: 'Saturday (Shanivar)',
    deity: 'Lord Shani Deva, Lord Hanuman & Kaal Bhairava',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (Om Pram Preem Proum Sah Shanaishcharaya Namah)',
    gayatriMantra: 'ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नो मन्दः प्रचोदयात्',
    stotra: 'Dasharatha Krit Shani Stotra & Sri Hanuman Chalisa',
    japaCount: '108 times daily (23,000 in 40-day Anushthan)',
    bestTime: 'Saturday evening after sunset facing West',
    primaryGemstone: 'Ceylon Blue Sapphire (Neelam — Strict 7-day trial required)',
    substituteGem: 'Natural Amethyst (Jamuniya) or Lapis Lazuli',
    gemWeight: '4.25 – 5.25 Ratti (approx. 3.8 – 4.7 Carats)',
    gemMetal: 'Panchdhatu or Pure Silver',
    gemFinger: 'Middle Finger (Right Hand)',
    rudraksha: '7 Mukhi or 14 Mukhi Rudraksha',
    lifestyleChanges: [
      'Practice strict punctuality, humility, and patience; always pay laborers, drivers, and domestic staff fairly and on time.',
      'Perform warm sesame oil (Til Taila) foot and joint massage before bath on Saturdays; avoid alcohol and tamasic habits.',
      'Light a sesame/mustard oil diya under a Peepal tree on Saturday evenings and walk 7 parikramas silently.',
    ],
    charityDana: 'Donate black urad dal, black sesame seeds (Til), mustard oil, iron utensils, or footwear to the needy on Saturdays.',
    vastuDirection: 'West (Paschima) — Keep storage areas organized, dark-free, and free of rusted iron scrap.',
    lalKitabUpay: 'Perform Chhaya-Patra Dana (view your reflection in a bowl of mustard oil and donate it) on 7 consecutive Saturdays.',
  },
  Rahu: {
    planet: 'Rahu',
    englishName: 'North Node',
    sanskritTitle: 'Rahu Graha (Chhaya Graha)',
    rulingDay: 'Saturday / Wednesday Night',
    deity: 'Goddess Maa Durga & Maa Saraswati',
    beejMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः (Om Bhram Bhreem Bhroum Sah Rahave Namah)',
    gayatriMantra: 'ॐ नाकध्वजाय विद्महे पद्महस्ताय धीमहि तन्नो राहुः प्रचोदयात्',
    stotra: 'Sri Durga Kavach & Siddha Kunjika Stotram',
    japaCount: '108 times daily (18,000 in 40-day Anushthan)',
    bestTime: 'After sunset during Pradosha or Rahu Kaal facing South-West',
    primaryGemstone: 'Ceylon Hessonite Garnet (Gomed — Only if Rahu is favorable in Kendra/Upachaya)',
    substituteGem: 'Natural Spessartite or Agate (Hakik)',
    gemWeight: '6.25 Ratti (approx. 5.6 Carats)',
    gemMetal: 'Pure Silver or Ashtadhatu',
    gemFinger: 'Middle Finger (Right Hand)',
    rudraksha: '8 Mukhi Rudraksha',
    lifestyleChanges: [
      'Keep electronic devices away from your bed at night; maintain fixed sleep/wake hours to prevent mental restlessness.',
      'Practice daily Anulom-Vilom and Bhramari Pranayama to clear mental fog, anxiety, and overthinking.',
      'Eat meals in the kitchen or dining area with calm focus rather than on the bed.',
    ],
    charityDana: 'Feed seven types of grains (Satnaja) to birds daily; donate whole coconuts, black/blue blankets, or radishes on Saturdays.',
    vastuDirection: 'South-West (Nairutya) — Keep the South-West heavy, stable, and free of faulty electronics.',
    lalKitabUpay: 'Keep a small solid silver elephant in the home/office; float 4 dry coconuts in flowing water on a Saturday.',
  },
  Ketu: {
    planet: 'Ketu',
    englishName: 'South Node',
    sanskritTitle: 'Ketu Graha (Mokshakaraka)',
    rulingDay: 'Tuesday / Thursday',
    deity: 'Lord Maha Ganapati & Lord Matsya',
    beejMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः (Om Sram Sreem Sroum Sah Ketave Namah)',
    gayatriMantra: 'ॐ अश्वध्वजाय विद्महे शूलहस्ताय धीमहि तन्नो केतुः प्रचोदयात्',
    stotra: 'Sankat Nashan Ganesha Stotra & Ganapati Atharvashirsha',
    japaCount: '108 times daily (17,000 in 40-day Anushthan)',
    bestTime: 'Early morning Brahma Muhurta or sunset facing North-East',
    primaryGemstone: 'Chrysoberyl Cat’s Eye (Lehsuniya — Only under strict dasha guidance)',
    substituteGem: 'Tiger’s Eye or Turquoise',
    gemWeight: '5.25 Ratti (approx. 4.7 Carats)',
    gemMetal: 'Pure Silver or Gold',
    gemFinger: 'Middle or Little Finger (Right Hand)',
    rudraksha: '9 Mukhi Rudraksha',
    lifestyleChanges: [
      'Offer 21 blades of fresh Durva grass to Lord Ganesha on Wednesdays and practice silent Dhyana (meditation).',
      'Show compassion and feed stray dogs regularly; avoid sudden detachment or isolating yourself from family.',
      'Apply a light saffron-sandalwood tilak on the forehead and behind the ear.',
    ],
    charityDana: 'Donate two-colored (black & white) blankets, sesame-jaggery laddoos, or warm clothes to needy ascetics/shelters.',
    vastuDirection: 'North-East & Staircase — Keep prayer altar and staircases well-lit and sacred.',
    lalKitabUpay: 'Feed sweet chapatis/milk to a two-colored dog; donate black-and-white sesame seeds at a shrine.',
  },
  Lagna: {
    planet: 'Surya',
    englishName: 'Ascendant',
    sanskritTitle: 'Janma Lagna',
    rulingDay: 'Sunday',
    deity: 'Ishta Devata',
    beejMantra: 'ॐ तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    gayatriMantra: 'Savitri Gayatri Mantra',
    stotra: 'Gayatri Stotram',
    japaCount: '108 times daily',
    bestTime: 'Brahma Muhurta',
    primaryGemstone: 'Lagna Lord Gemstone',
    substituteGem: 'Clear Quartz (Sphatik)',
    gemWeight: '5.25 Ratti',
    gemMetal: 'Gold / Silver',
    gemFinger: 'Ring Finger',
    rudraksha: '5 Mukhi Rudraksha',
    lifestyleChanges: ['Follow sattvic Dinacharya'],
    charityDana: 'Anna-Dana (Feeding the hungry)',
    vastuDirection: 'East / North-East',
    lalKitabUpay: 'Honor parents and elders daily.',
  },
};

const RASI_LORD_GRAHA: Record<number, GrahaName> = {
  1: 'Mangal',  // Mesha
  2: 'Shukra',  // Vrishabha
  3: 'Budha',   // Mithuna
  4: 'Chandra', // Karka
  5: 'Surya',   // Simha
  6: 'Budha',   // Kanya
  7: 'Shukra',  // Tula
  8: 'Mangal',  // Vrishchika
  9: 'Guru',    // Dhanu
  10: 'Shani',  // Makara
  11: 'Shani',  // Kumbha
  12: 'Guru',   // Meena
};

export function UpayRemediesTab({
  activeProfileId,
  profiles,
  onNavigateToDasha,
  onNavigateToBirthCharts,
}: UpayRemediesTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Deck of Cards selector
  const [selectedDeck, setSelectedDeck] = useState<
    'dasha' | 'challenges' | 'mantras' | 'gemstones' | 'lifestyle' | 'all'
  >('dasha');

  // Interactive daily checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    morningMantra: true,
    dashaRemedy: false,
    lifestyleSadhana: false,
    weeklyDana: false,
  });

  // AI Personalized Synthesis state
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiUpayData, setAiUpayData] = useState<{
    headline: string;
    diagnosticSummary: string;
    mantraSadhana: string;
    gemstoneGuidance: string;
    lifestyleAndKarma: string;
    lalKitabSpecialUpay: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setAiUpayData(null);
    setAiError(null);
  }, [activeProfileId]);

  // 1. Compute Natal Chart, Shadbala, Dasha & Sade Sati for current profile
  const astroDiagnostics = useMemo(() => {
    const birthDate = currentProfile?.birthDate || '1990-05-18';
    const birthTime = currentProfile?.birthTime || '07:30';
    const lat = currentProfile?.latitude ?? 28.6139;
    const lng = currentProfile?.longitude ?? 77.209;

    const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
    const natalCalc = calculatePlanetaryPositions(birthDateTime, lat, lng);
    const transitCalc = calculatePlanetaryPositions(new Date(), lat, lng);

    const lagnaRasi = natalCalc.lagnaRasi || 1;
    const lagnaRasiObj = VEDIC_RASIS[lagnaRasi - 1] || VEDIC_RASIS[0];
    const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
    const moonRasi = natalMoon?.rasiNumber || 1;
    const moonRasiObj = VEDIC_RASIS[moonRasi - 1] || VEDIC_RASIS[0];
    const natalMoonTotalDeg = (moonRasi - 1) * 30 + (natalMoon?.degree || 15);
    const nakshatra = natalMoon?.nakshatra || 'Rohini';

    // Vimshottari Dasha & Antardasha
    const vimshottari = calculateVimshottariDasha(natalMoonTotalDeg, birthDate);
    const mahaLord = vimshottari.currentLord;
    const mahaInfo =
      vimshottari.cycle.find((c) => c.planet === mahaLord) || vimshottari.cycle[0];
    const antardashas = calculateAntardashas(
      mahaLord,
      mahaInfo.durationYears,
      mahaInfo.startAge,
      birthDate
    );
    const antarInfo = antardashas.find((a) => a.isCurrent) || antardashas[0];
    const antarLord = antarInfo.planet;

    // Shadbala strengths
    const shadbalaList = calculatePlanetShadbala(natalCalc.planets, birthTime);

    // Sade Sati check
    const transitShani = transitCalc.planets.find((p) => p.name === 'Shani') || transitCalc.planets[7];
    const sadeSati = checkSadeSati(moonRasi, transitShani.rasiNumber);

    // Detect Specific Natal Chart Challenges
    const challenges: {
      id: string;
      planet: GrahaName;
      badge: string;
      severity: 'High Priority' | 'Moderate Priority';
      challengeTitle: string;
      diagnosticReason: string;
      remedyMaster: GrahaRemedyMaster;
      specificAction: string;
    }[] = [];

    // A. Planets in Dusthana Houses (6th Ari, 8th Randhra, 12th Vyaya)
    const dusthanaPlanets = natalCalc.planets.filter(
      (p) => p.name !== 'Lagna' && [6, 8, 12].includes(p.house)
    );
    for (const dp of dusthanaPlanets) {
      const houseName =
        dp.house === 6
          ? '6th House (Ari / Roga-Runa-Shatru Bhava)'
          : dp.house === 8
          ? '8th House (Randhra / Transformation & Obstacles Bhava)'
          : '12th House (Vyaya / Expenditure & Liberation Bhava)';

      challenges.push({
        id: `dusthana-${dp.name}`,
        planet: dp.name,
        badge: `Dusthana H${dp.house} Placement`,
        severity: dp.house === 8 ? 'High Priority' : 'Moderate Priority',
        challengeTitle: `${dp.name} (${dp.englishName}) in ${houseName} (${dp.rasiName})`,
        diagnosticReason: `Natal ${dp.name} occupies the ${dp.house}th house (${dp.rasiName} at ${dp.degree}°${dp.minute}'). In Parashari Jyotish, Dusthana placement requires conscious pacification to protect ${dp.englishName}'s significations and prevent energy drain during its Dasha/Antardasha.`,
        remedyMaster: GRAHA_REMEDY_MASTER[dp.name],
        specificAction: `Avoid wearing ${dp.name}'s primary gemstone without trial; instead pacify via ${GRAHA_REMEDY_MASTER[dp.name].rulingDay} Dana (${GRAHA_REMEDY_MASTER[dp.name].charityDana}) and daily Beej Mantra.`,
      });
    }

    // B. Shadbala Weak / Moderate Planets (sorted by lowest strengthRatio)
    const sortedByWeakShadbala = [...shadbalaList].sort(
      (a, b) => a.strengthRatio - b.strengthRatio
    );
    for (const sb of sortedByWeakShadbala.slice(0, 3)) {
      if (!challenges.some((c) => c.planet === sb.planet)) {
        challenges.push({
          id: `shadbala-${sb.planet}`,
          planet: sb.planet,
          badge: `Shadbala ${sb.strengthRatio}% (${sb.totalRupas}R)`,
          severity: sb.strengthRatio < 95 ? 'High Priority' : 'Moderate Priority',
          challengeTitle: `${sb.planet} (${sb.englishName}) Shadbala Fortification — Weakest in ${sb.weakestBalaName}`,
          diagnosticReason: `Natal ${sb.planet} in H${sb.house} (${sb.rasiName}) measures ${sb.totalRupas} Rupas (${sb.strengthRatio}% of Parashari threshold), with its lowest component being ${sb.weakestBalaName}. Strengthening ${sb.planet} unlocks steadier results in House ${sb.house}.`,
          remedyMaster: GRAHA_REMEDY_MASTER[sb.planet],
          specificAction: sb.weakestBalaTip,
        });
      }
    }

    // C. Retrograde (Vakri) or Nodal Axis Challenge
    const rahuPos = natalCalc.planets.find((p) => p.name === 'Rahu');
    const ketuPos = natalCalc.planets.find((p) => p.name === 'Ketu');
    if (rahuPos && ketuPos && !challenges.some((c) => c.planet === 'Rahu')) {
      challenges.push({
        id: 'nodal-axis',
        planet: 'Rahu',
        badge: `Rahu H${rahuPos.house} / Ketu H${ketuPos.house} Axis`,
        severity: 'Moderate Priority',
        challengeTitle: `Nodal Karmic Axis: Rahu in H${rahuPos.house} (${rahuPos.rasiName}) & Ketu in H${ketuPos.house} (${ketuPos.rasiName})`,
        diagnosticReason: `The Rahu–Ketu nodal axis across Houses ${rahuPos.house} and ${ketuPos.house} represents your primary Prarabdha karmic pendulum between worldly ambition (H${rahuPos.house}) and spiritual detachment (H${ketuPos.house}).`,
        remedyMaster: GRAHA_REMEDY_MASTER.Rahu,
        specificAction: `Balance H${rahuPos.house} ambition with H${ketuPos.house} contentment; practice evening Pranayama, feed 7 grains to birds, and worship Maa Durga & Lord Ganesha.`,
      });
    }

    // Trikona Gemstones (1st, 5th, 9th House Lords from Natal Lagna)
    const house1Rasi = lagnaRasi;
    const house5Rasi = ((lagnaRasi - 1 + 4) % 12) + 1;
    const house9Rasi = ((lagnaRasi - 1 + 8) % 12) + 1;

    const lagnaLord = RASI_LORD_GRAHA[house1Rasi] || 'Surya';
    const fifthLord = RASI_LORD_GRAHA[house5Rasi] || 'Guru';
    const ninthLord = RASI_LORD_GRAHA[house9Rasi] || 'Guru';

    // Dusthana Lords (6th, 8th, 12th House Lords from Lagna — Gemstones to Avoid)
    const house6Rasi = ((lagnaRasi - 1 + 5) % 12) + 1;
    const house8Rasi = ((lagnaRasi - 1 + 7) % 12) + 1;
    const house12Rasi = ((lagnaRasi - 1 + 11) % 12) + 1;

    const trishadayaDusthanaLords = Array.from(
      new Set([
        RASI_LORD_GRAHA[house6Rasi],
        RASI_LORD_GRAHA[house8Rasi],
        RASI_LORD_GRAHA[house12Rasi],
      ])
    ).filter((g) => g !== lagnaLord && g !== fifthLord && g !== ninthLord);

    const mahaPlanetPos = natalCalc.planets.find((p) => p.name === mahaLord);
    const antarPlanetPos = natalCalc.planets.find((p) => p.name === antarLord);

    return {
      lagnaRasi,
      lagnaRasiObj,
      moonRasi,
      moonRasiObj,
      nakshatra,
      mahaLord,
      mahaInfo,
      mahaPlanetPos,
      antarLord,
      antarInfo,
      antarPlanetPos,
      sadeSati,
      shadbalaList,
      challenges,
      lagnaLord,
      fifthLord,
      ninthLord,
      trishadayaDusthanaLords,
      house5RasiName: VEDIC_RASIS[house5Rasi - 1]?.sanskritName || 'Simha',
      house9RasiName: VEDIC_RASIS[house9Rasi - 1]?.sanskritName || 'Dhanu',
    };
  }, [currentProfile]);

  const mahaRemedy = GRAHA_REMEDY_MASTER[astroDiagnostics.mahaLord];
  const antarRemedy = GRAHA_REMEDY_MASTER[astroDiagnostics.antarLord];

  const handleGenerateAiUpay = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/astrology/upay-remedies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentProfile?.name || 'Seeker',
          birthDate: currentProfile?.birthDate || '1990-05-18',
          birthTime: currentProfile?.birthTime || '07:30',
          birthPlace: currentProfile?.place || 'New Delhi, India',
          lagnaRasi: astroDiagnostics.lagnaRasiObj.sanskritName,
          moonRasi: astroDiagnostics.moonRasiObj.sanskritName,
          nakshatra: astroDiagnostics.nakshatra,
          mahadashaLord: astroDiagnostics.mahaLord,
          antardashaLord: astroDiagnostics.antarLord,
          sadeSatiStatus: astroDiagnostics.sadeSati.inSadeSati
            ? `Active (${astroDiagnostics.sadeSati.phase})`
            : 'Not Active',
          natalChallenges: astroDiagnostics.challenges.map((c) => ({
            planet: c.planet,
            issue: c.challengeTitle,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize AI Upay protocol');
      }
      setAiUpayData(data);
    } catch (err: any) {
      console.error(err);
      setAiError('Cosmic AI channel is busy; full Parashari, Ratna & Lal Kitab remedies are active below.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Deduplicated priority planets for Mantra & Lifestyle tables (Dasha Lords + Challenged Natal Planets)
  const priorityPlanets = useMemo(() => {
    const ordered: { planet: GrahaName; roleBadge: string }[] = [
      {
        planet: astroDiagnostics.mahaLord,
        roleBadge: `Active Mahadasha Lord (H${astroDiagnostics.mahaPlanetPos?.house || 1})`,
      },
    ];
    if (astroDiagnostics.antarLord !== astroDiagnostics.mahaLord) {
      ordered.push({
        planet: astroDiagnostics.antarLord,
        roleBadge: `Active Antardasha Sub-Lord (H${astroDiagnostics.antarPlanetPos?.house || 1})`,
      });
    }
    for (const ch of astroDiagnostics.challenges) {
      if (!ordered.some((o) => o.planet === ch.planet)) {
        ordered.push({
          planet: ch.planet,
          roleBadge: ch.badge,
        });
      }
    }
    if (!ordered.some((o) => o.planet === astroDiagnostics.lagnaLord)) {
      ordered.push({
        planet: astroDiagnostics.lagnaLord,
        roleBadge: `Lagna Lord (${astroDiagnostics.lagnaRasiObj.sanskritName})`,
      });
    }
    return ordered;
  }, [astroDiagnostics]);

  return (
    <div className="w-full space-y-2">
      {/* TOP DIAGNOSTIC HEADER BANNER */}
      <div className="bg-amber-50/60 border border-amber-200/90 rounded-lg px-2.5 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2 shadow-3xs">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-800" />
            </span>
            <h1 className="text-[16px] font-vedic font-bold text-stone-950 leading-tight">
              Vedic Upay &amp; Remedies — {currentProfile?.name || 'Seeker'}
            </h1>
            <span className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-950 text-[11px] font-bold">
              Lagna: {astroDiagnostics.lagnaRasiObj.sanskritName} ({astroDiagnostics.lagnaLord})
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-sky-200 text-sky-950 text-[11px] font-bold">
              Moon: {astroDiagnostics.moonRasiObj.sanskritName} • {astroDiagnostics.nakshatra}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-950 text-[11px] font-bold">
              Active Dasha: {astroDiagnostics.mahaLord} – {astroDiagnostics.antarLord}
            </span>
          </div>
          <p className="text-[12px] text-stone-600">
            Personalized Mantras, Ratna (Gemstones), Rudraksha, Lifestyle Dinacharya &amp; Lal Kitab Upayas tailored to your natal chart challenges and active Dasha period
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleGenerateAiUpay}
            disabled={isLoadingAi}
            className="inline-flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[12px] font-semibold py-1 px-2.5 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Synthesizing Upay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Upay Synthesis</span>
              </>
            )}
          </button>

          {onNavigateToDasha && (
            <div
              onClick={onNavigateToDasha}
              className="rounded px-2 py-1 text-[11px] font-vedic font-bold bg-white border border-purple-200 text-purple-900 hover:border-purple-400 cursor-pointer flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-purple-700" />
              <span>Dasha</span>
            </div>
          )}
        </div>
      </div>

      {/* OPTIONAL AI PERSONALIZED UPAY SYNTHESIS PANEL */}
      {aiError && (
        <div className="text-[12px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2.5 py-1">
          {aiError}
        </div>
      )}

      {aiUpayData && (
        <div className="bg-gradient-to-r from-amber-50/90 via-[#FAF8F5] to-purple-50/80 rounded-lg border border-amber-300 p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-amber-200/70 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[14px]">
                {aiUpayData.headline}
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
              AI Jyotish Prescription
            </span>
          </div>
          <p className="text-[13px] text-stone-800 leading-snug">
            {aiUpayData.diagnosticSummary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[12px]">
            <div className="bg-white/90 rounded border border-purple-200 p-2">
              <strong className="text-purple-950 font-bold block mb-0.5">Mantra Sadhana</strong>
              <p className="text-stone-700 leading-snug">{aiUpayData.mantraSadhana}</p>
            </div>
            <div className="bg-white/90 rounded border border-amber-200 p-2">
              <strong className="text-amber-950 font-bold block mb-0.5">Gemstone Guidance</strong>
              <p className="text-stone-700 leading-snug">{aiUpayData.gemstoneGuidance}</p>
            </div>
            <div className="bg-white/90 rounded border border-emerald-200 p-2">
              <strong className="text-emerald-950 font-bold block mb-0.5">Lifestyle &amp; Karma</strong>
              <p className="text-stone-700 leading-snug">{aiUpayData.lifestyleAndKarma}</p>
            </div>
            <div className="bg-white/90 rounded border border-rose-200 p-2">
              <strong className="text-rose-950 font-bold block mb-0.5">Lal Kitab Special Upay</strong>
              <p className="text-stone-700 leading-snug">{aiUpayData.lalKitabSpecialUpay}</p>
            </div>
          </div>
        </div>
      )}

      {/* UPAY & REMEDIES — COMPACT 1-ROW DECK OF CARDS SELECTOR */}
      <div className="bg-white/85 backdrop-blur-sm rounded-lg border border-stone-200/90 px-2 py-1.5 shadow-3xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {[
            { id: 'dasha', title: 'Current Dasha Upay', icon: Layers },
            { id: 'challenges', title: 'Natal Chart Challenges', icon: AlertTriangle },
            { id: 'mantras', title: 'Mantras & Stotras', icon: BookOpen },
            { id: 'gemstones', title: 'Gemstones & Rudraksha', icon: Gem },
            { id: 'lifestyle', title: 'Lifestyle & Lal Kitab', icon: Sun },
            { id: 'all', title: 'All Remedies View', icon: Sparkles },
          ].map((card) => {
            const Icon = card.icon;
            const isActive = selectedDeck === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedDeck(card.id as any)}
                className={`group relative rounded-md px-2.5 py-1.5 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1.5 ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5] shadow-3xs'
                }`}
              >
                <span
                  className={`font-vedic font-bold text-[12px] leading-none truncate ${
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

      {/* 1. CURRENT MAHADASHA & ANTARDASHA REMEDIAL PROTOCOL (FIRST) */}
      {(selectedDeck === 'all' || selectedDeck === 'dasha') && (
        <div className="bg-white rounded-lg border border-purple-200/90 p-2.5 shadow-3xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-purple-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px]">
                Current Dasha &amp; Sub-Period Remedial Protocol ({astroDiagnostics.mahaLord} Mahadasha • {astroDiagnostics.antarLord} Antardasha)
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-950 text-[11px] font-bold">
              Active Window: {astroDiagnostics.antarInfo.startMonthYear} – {astroDiagnostics.antarInfo.endMonthYear}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Mahadasha Lord Remedy Card */}
            <div className="bg-amber-50/40 rounded-lg border border-amber-200/90 p-2.5 space-y-2">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-1.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                    Macro Mahadasha Lord ({astroDiagnostics.mahaInfo.startMonthYear} – {astroDiagnostics.mahaInfo.endMonthYear})
                  </span>
                  <h3 className="text-[15px] font-vedic font-bold text-stone-950">
                    {mahaRemedy.sanskritTitle} — Natal H{astroDiagnostics.mahaPlanetPos?.house || 1} ({astroDiagnostics.mahaPlanetPos?.rasiName || 'Mesha'})
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold">
                  {mahaRemedy.rulingDay}
                </span>
              </div>

              <div className="space-y-1.5 text-[12px]">
                <div className="bg-white rounded border border-amber-200/80 p-2">
                  <strong className="text-amber-950 block text-[11px] uppercase tracking-wider">
                    1. Mahadasha Beej Mantra &amp; Stotra
                  </strong>
                  <p className="font-bold text-stone-900 mt-0.5">{mahaRemedy.beejMantra}</p>
                  <p className="text-stone-600 mt-0.5">
                    <strong>Stotra:</strong> {mahaRemedy.stotra} • <strong>Timing:</strong> {mahaRemedy.bestTime}
                  </p>
                </div>

                <div className="bg-white rounded border border-stone-200/80 p-2">
                  <strong className="text-stone-900 block text-[11px] uppercase tracking-wider">
                    2. Mahadasha Lifestyle &amp; Karma Alignment
                  </strong>
                  <ul className="mt-0.5 space-y-0.5 text-stone-700">
                    {mahaRemedy.lifestyleChanges.map((item, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded border border-emerald-200/80 p-2">
                  <strong className="text-emerald-950 block text-[11px] uppercase tracking-wider">
                    3. Prescribed Dana (Charity) &amp; Rudraksha
                  </strong>
                  <p className="text-stone-700 mt-0.5">{mahaRemedy.charityDana}</p>
                  <p className="text-emerald-900 font-semibold mt-0.5">
                    Rudraksha: {mahaRemedy.rudraksha} • Vastu Direction: {mahaRemedy.vastuDirection}
                  </p>
                </div>
              </div>
            </div>

            {/* Antardasha Sub-Lord Remedy Card */}
            <div className="bg-purple-50/40 rounded-lg border border-purple-200/90 p-2.5 space-y-2">
              <div className="flex items-center justify-between border-b border-purple-200/70 pb-1.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">
                    Active Antardasha Sub-Lord ({astroDiagnostics.antarInfo.startMonthYear} – {astroDiagnostics.antarInfo.endMonthYear})
                  </span>
                  <h3 className="text-[15px] font-vedic font-bold text-stone-950">
                    {antarRemedy.sanskritTitle} — Natal H{astroDiagnostics.antarPlanetPos?.house || 1} ({astroDiagnostics.antarPlanetPos?.rasiName || 'Mesha'})
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[11px] font-bold">
                  {antarRemedy.rulingDay}
                </span>
              </div>

              <div className="space-y-1.5 text-[12px]">
                <div className="bg-white rounded border border-purple-200/80 p-2">
                  <strong className="text-purple-950 block text-[11px] uppercase tracking-wider">
                    1. Sub-Period Beej Mantra &amp; Stotra
                  </strong>
                  <p className="font-bold text-stone-900 mt-0.5">{antarRemedy.beejMantra}</p>
                  <p className="text-stone-600 mt-0.5">
                    <strong>Stotra:</strong> {antarRemedy.stotra} • <strong>Timing:</strong> {antarRemedy.bestTime}
                  </p>
                </div>

                <div className="bg-white rounded border border-stone-200/80 p-2">
                  <strong className="text-stone-900 block text-[11px] uppercase tracking-wider">
                    2. Sub-Period Lifestyle &amp; Daily Discipline
                  </strong>
                  <ul className="mt-0.5 space-y-0.5 text-stone-700">
                    {antarRemedy.lifestyleChanges.map((item, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-purple-700 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded border border-emerald-200/80 p-2">
                  <strong className="text-emerald-950 block text-[11px] uppercase tracking-wider">
                    3. Sub-Period Dana &amp; Lal Kitab Upay
                  </strong>
                  <p className="text-stone-700 mt-0.5">{antarRemedy.charityDana}</p>
                  <p className="text-purple-900 font-semibold mt-0.5">
                    Lal Kitab: {antarRemedy.lalKitabUpay}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NATAL CHART CHALLENGES & TARGETED REMEDIES */}
      {(selectedDeck === 'all' || selectedDeck === 'challenges') && (
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px]">
                Natal Chart Challenges &amp; Targeted Remedial Prescriptions
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-stone-600">
              Diagnosed from Dusthana (H6/H8/H12) Placements, Shadbala Ratios &amp; Nodal Axis
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {astroDiagnostics.challenges.map((ch) => (
              <div
                key={ch.id}
                className={`rounded-lg border p-2.5 space-y-2 flex flex-col justify-between ${
                  ch.severity === 'High Priority'
                    ? 'bg-amber-50/40 border-amber-300'
                    : 'bg-[#FAF8F5] border-stone-200/90'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        {ch.badge}
                      </span>
                      <h3 className="text-[14px] font-vedic font-bold text-stone-950 leading-snug">
                        {ch.challengeTitle}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                        ch.severity === 'High Priority'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      {ch.severity}
                    </span>
                  </div>

                  <p className="text-[12px] text-stone-700 leading-snug">
                    {ch.diagnosticReason}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-stone-200/80 text-[12px]">
                  <div className="bg-white rounded border border-purple-200/80 p-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 block">
                      Prescribed Mantra ({ch.remedyMaster.rulingDay})
                    </span>
                    <p className="font-semibold text-stone-900 leading-snug mt-0.5">
                      {ch.remedyMaster.beejMantra}
                    </p>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      Stotra: {ch.remedyMaster.stotra}
                    </span>
                  </div>

                  <div className="bg-white rounded border border-emerald-200/80 p-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                      Actionable Upay &amp; Lifestyle Fix
                    </span>
                    <p className="text-stone-800 leading-snug mt-0.5">
                      {ch.specificAction}
                    </p>
                    <span className="text-[11px] text-emerald-900 font-medium block mt-0.5">
                      Lal Kitab: {ch.remedyMaster.lalKitabUpay}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RATNA-SHASTRA (GEMSTONES) & RUDRAKSHA PRESCRIPTION */}
      {(selectedDeck === 'all' || selectedDeck === 'gemstones') && (
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Gem className="w-4 h-4 text-amber-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px]">
                Ratna-Shastra (Vedic Gemstones) &amp; Mukhi Rudraksha — {astroDiagnostics.lagnaRasiObj.sanskritName} Lagna
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-stone-600">
              Classical Trikona Ratna Selection (1st, 5th &amp; 9th House Lords) + Dasha Suitability
            </span>
          </div>

          {/* 3 Benefic Trikona Stones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {[
              {
                stoneRole: '1. Life Stone (Lagna Ratna — 1st House)',
                rasiLabel: `${astroDiagnostics.lagnaRasiObj.sanskritName} Lagna`,
                lord: astroDiagnostics.lagnaLord,
                purpose: 'Physical immunity, self-confidence, longevity, and overall life protection.',
                master: GRAHA_REMEDY_MASTER[astroDiagnostics.lagnaLord],
              },
              {
                stoneRole: '2. Intelligence & Purva-Punya Stone (5th House)',
                rasiLabel: `5th House (${astroDiagnostics.house5RasiName})`,
                lord: astroDiagnostics.fifthLord,
                purpose: 'Sharp intellect, mantra siddhi, children, financial wisdom, and creative merit.',
                master: GRAHA_REMEDY_MASTER[astroDiagnostics.fifthLord],
              },
              {
                stoneRole: '3. Bhagya / Fortune Stone (9th House)',
                rasiLabel: `9th House (${astroDiagnostics.house9RasiName})`,
                lord: astroDiagnostics.ninthLord,
                purpose: 'Divine grace (Bhagyodaya), wealth expansion, higher dharma, and career elevation.',
                master: GRAHA_REMEDY_MASTER[astroDiagnostics.ninthLord],
              },
            ].map((item) => (
              <div
                key={item.stoneRole}
                className="bg-[#FAF8F5] rounded-lg border border-amber-200/90 p-2.5 space-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                      {item.stoneRole}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold">
                      Lord: {item.lord}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-vedic font-bold text-stone-950">
                    {item.master.primaryGemstone}
                  </h3>
                  <p className="text-[12px] text-stone-700 leading-snug">
                    {item.purpose}
                  </p>
                </div>

                <div className="bg-white rounded border border-stone-200/80 p-2 text-[11px] space-y-0.5">
                  <div>
                    <strong className="text-stone-900">Substitute (Uparatna):</strong>{' '}
                    <span className="text-stone-700">{item.master.substituteGem}</span>
                  </div>
                  <div>
                    <strong className="text-stone-900">Weight &amp; Metal:</strong>{' '}
                    <span className="text-amber-950 font-semibold">
                      {item.master.gemWeight} in {item.master.gemMetal}
                    </span>
                  </div>
                  <div>
                    <strong className="text-stone-900">Finger &amp; Day:</strong>{' '}
                    <span className="text-stone-700">
                      {item.master.gemFinger} on {item.master.rulingDay} morning
                    </span>
                  </div>
                  <div>
                    <strong className="text-purple-900">Sacred Rudraksha:</strong>{' '}
                    <span className="text-purple-950 font-semibold">{item.master.rudraksha}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gemstones to Avoid Warning Bar */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-md p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
            <div>
              <strong className="text-rose-950 font-bold uppercase tracking-wider text-[11px] block">
                Ratna-Shastra Safety Rule — Gemstones to Avoid for {astroDiagnostics.lagnaRasiObj.sanskritName} Lagna
              </strong>
              <p className="text-stone-700 leading-snug mt-0.5">
                Avoid wearing primary gemstones of Dusthana (6th, 8th, 12th) lords (
                <strong className="text-rose-900">
                  {astroDiagnostics.trishadayaDusthanaLords
                    .map((g) => `${g} — ${GRAHA_REMEDY_MASTER[g].primaryGemstone}`)
                    .join('; ')}
                </strong>
                ). Pacify those planets strictly through Mantra Japa, Rudraksha, and charitable Dana instead.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black uppercase tracking-wider shrink-0">
              Use Mantra &amp; Dana Only
            </span>
          </div>
        </div>
      )}

      {/* 4. VEDIC MANTRAS & STOTRAS TABLE */}
      {(selectedDeck === 'all' || selectedDeck === 'mantras') && (
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px]">
                Prescribed Vedic Beej Mantras, Gayatri &amp; Stotra Sadhana
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-stone-600">
              Chant using a 108-bead Rudraksha or Sphatik Mala facing East/North-East
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-700 text-[11px] uppercase tracking-wider">
                  <th className="py-1.5 px-2 font-black">Planet &amp; Priority</th>
                  <th className="py-1.5 px-2 font-black">Tantric / Vedic Beej Mantra</th>
                  <th className="py-1.5 px-2 font-black">Prescribed Stotra &amp; Deity</th>
                  <th className="py-1.5 px-2 font-black">Japa &amp; Muhurta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70">
                {priorityPlanets.map((item) => {
                  const m = GRAHA_REMEDY_MASTER[item.planet];
                  return (
                    <tr key={item.planet} className="hover:bg-amber-50/30">
                      <td className="py-2 px-2 align-top">
                        <div className="font-vedic font-bold text-stone-950 text-[13px]">
                          {m.planet} ({m.englishName})
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                          {item.roleBadge}
                        </span>
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="font-bold text-stone-900">{m.beejMantra}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          <strong>Gayatri:</strong> {m.gayatriMantra}
                        </div>
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="font-semibold text-purple-950">{m.stotra}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          <strong>Deity:</strong> {m.deity}
                        </div>
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="font-semibold text-stone-900">{m.japaCount}</div>
                        <div className="text-[11px] text-amber-900 font-medium mt-0.5">
                          {m.rulingDay} • {m.bestTime}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ACTIONABLE LIFESTYLE CHANGES (DINACHARYA), DANA & LAL KITAB UPAYAS */}
      {(selectedDeck === 'all' || selectedDeck === 'lifestyle') && (
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-1.5">
              <Sun className="w-4 h-4 text-amber-700" />
              <h2 className="font-vedic font-bold text-stone-950 text-[15px]">
                Actionable Lifestyle Changes (Dinacharya), Charitable Dana &amp; Lal Kitab Upayas
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-stone-600">
              Practical behavioral Karma Yoga &amp; Vastu adjustments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[12px]">
            {priorityPlanets.slice(0, 3).map((item) => {
              const m = GRAHA_REMEDY_MASTER[item.planet];
              return (
                <div
                  key={`lifestyle-${item.planet}`}
                  className="bg-[#FAF8F5] rounded-lg border border-stone-200/90 p-2.5 space-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-vedic font-bold text-stone-950 text-[14px]">
                        {m.planet} ({m.englishName}) Habits
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-amber-900">
                        {m.rulingDay}
                      </span>
                    </div>
                    <ul className="space-y-1 text-stone-700">
                      {m.lifestyleChanges.map((lc, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-700 font-bold shrink-0">✓</span>
                          <span className="leading-snug">{lc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1.5 border-t border-stone-200/80 space-y-1">
                    <div className="bg-white rounded border border-amber-200/70 p-1.5">
                      <strong className="text-amber-950 block text-[10px] uppercase tracking-wider">
                        Weekly Dana (Charity)
                      </strong>
                      <p className="text-stone-700 leading-snug mt-0.5">{m.charityDana}</p>
                    </div>
                    <div className="bg-white rounded border border-purple-200/70 p-1.5">
                      <strong className="text-purple-950 block text-[10px] uppercase tracking-wider">
                        Lal Kitab &amp; Vastu Remedy
                      </strong>
                      <p className="text-stone-700 leading-snug mt-0.5">{m.lalKitabUpay}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Daily / Weekly Sadhana Checklist */}
          <div className="bg-emerald-50/40 rounded-lg border border-emerald-200/80 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Daily &amp; Weekly Personalized Upay Sadhana Tracker</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                {Object.values(checkedItems).filter(Boolean).length} / 4 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
              {[
                {
                  key: 'morningMantra',
                  title: `Morning ${astroDiagnostics.mahaLord} Mantra (108x)`,
                  sub: mahaRemedy.bestTime,
                },
                {
                  key: 'dashaRemedy',
                  title: `${astroDiagnostics.antarLord} Sub-Period Stotra`,
                  sub: antarRemedy.stotra,
                },
                {
                  key: 'lifestyleSadhana',
                  title: 'Surya Arghya & Dinacharya',
                  sub: 'Copper vessel water + evening Pranayama',
                },
                {
                  key: 'weeklyDana',
                  title: `${mahaRemedy.rulingDay} Seva & Dana`,
                  sub: mahaRemedy.charityDana,
                },
              ].map((task) => {
                const isDone = !!checkedItems[task.key];
                return (
                  <div
                    key={task.key}
                    onClick={() => toggleCheck(task.key)}
                    className={`rounded border p-2 cursor-pointer transition-all flex items-start space-x-2 ${
                      isDone
                        ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950'
                        : 'bg-white border-stone-200/90 text-stone-800 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="mt-0.5 accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[11px] leading-snug">
                      <div className="font-bold">{task.title}</div>
                      <div className="text-stone-600 line-clamp-1">{task.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
