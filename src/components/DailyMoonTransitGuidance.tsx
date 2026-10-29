import React, { useState, useMemo } from 'react';
import {
  Moon,
  Heart,
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react';
import { PlanetPosition, UserProfile } from '../types';
import { calculatePlanetaryPositions, normalizeDegrees } from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';

interface DailyMoonTransitGuidanceProps {
  activeProfile?: UserProfile;
  natalPlanets?: PlanetPosition[];
  natalLagnaRasi?: number;
  onNavigateToDasha?: () => void;
  onNavigateToTransits?: () => void;
}

export function DailyMoonTransitGuidance({
  activeProfile,
  natalPlanets = [],
  natalLagnaRasi = 1,
  onNavigateToDasha,
  onNavigateToTransits,
}: DailyMoonTransitGuidanceProps) {
  // Day offset for interactive planning: 0 = Today, +1 = Tomorrow, -1 = Yesterday, etc.
  const [dayOffset, setDayOffset] = useState<number>(0);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  // 1. Calculate Live / Target Moon Position
  const transitCalc = useMemo(() => {
    return calculatePlanetaryPositions(
      targetDate,
      activeProfile?.latitude || 28.6139,
      activeProfile?.longitude || 77.2090
    );
  }, [activeProfile, targetDate]);

  const transitingMoon = transitCalc.planets.find((p) => p.name === 'Chandra');
  const transitingSun = transitCalc.planets.find((p) => p.name === 'Surya');

  // 2. Locate Natal Moon (Janma Rasi)
  const natalMoon = useMemo(() => {
    return (
      natalPlanets.find((p) => p.name === 'Chandra') || {
        name: 'Chandra',
        englishName: 'Moon',
        symbol: 'Mo',
        rasiNumber: 4,
        rasiName: 'Karka',
        degree: 12,
        minute: 30,
        house: 1,
        nakshatra: 'Pushya',
        pada: 2,
        isRetrograde: false,
      }
    );
  }, [natalPlanets]);

  // 3. Compute House of Transiting Moon from Natal Moon (Chandra Gochar House: 1 to 12)
  const chandraGocharHouse = useMemo(() => {
    if (!transitingMoon || !natalMoon) return 1;
    return ((transitingMoon.rasiNumber - natalMoon.rasiNumber + 12) % 12) + 1;
  }, [transitingMoon, natalMoon]);

  // 4. Compute Transiting Moon from Natal Lagna (Ascendant)
  const lagnaGocharHouse = useMemo(() => {
    if (!transitingMoon || !natalLagnaRasi) return 1;
    return ((transitingMoon.rasiNumber - natalLagnaRasi + 12) % 12) + 1;
  }, [transitingMoon, natalLagnaRasi]);

  // 5. Lunar Phase (Tithi & Paksha)
  const lunarPhase = useMemo(() => {
    if (!transitingMoon || !transitingSun) {
      return { tithi: 5, isShukla: true, illumination: 65, phaseName: 'Waxing Crescent' };
    }
    const moonDeg = (transitingMoon.rasiNumber - 1) * 30 + transitingMoon.degree;
    const sunDeg = (transitingSun.rasiNumber - 1) * 30 + transitingSun.degree;
    const diff = normalizeDegrees(moonDeg - sunDeg);
    const tithiNum = Math.floor(diff / 12) + 1;
    const isShukla = tithiNum <= 15;

    let illumination = 0;
    if (diff <= 180) illumination = (diff / 180) * 100;
    else illumination = ((360 - diff) / 180) * 100;

    let phaseName = 'Waxing Phase';
    if (diff < 12 || diff >= 348) phaseName = 'New Moon (Amavasya)';
    else if (diff >= 168 && diff <= 192) phaseName = 'Full Moon (Purnima)';
    else if (isShukla) phaseName = illumination < 50 ? 'Waxing Crescent' : 'Waxing Gibbous';
    else phaseName = illumination > 50 ? 'Waning Gibbous' : 'Waning Crescent';

    return {
      tithi: tithiNum,
      isShukla,
      illumination: Math.round(illumination),
      phaseName,
    };
  }, [transitingMoon, transitingSun]);

  // 6. Classical North Indian / Parashari Daily Emotional & Mental Phala for all 12 Lunar Houses
  const dailyGuidanceData = useMemo(() => {
    const h = chandraGocharHouse;
    const isChandrashtama = h === 8;
    const isUpachaya = [3, 6, 10, 11].includes(h);
    const isKantaka = h === 4;

    const houseDetails: Record<
      number,
      {
        title: string;
        sanskrit: string;
        quality: 'Auspicious & Victorious' | 'Highly Creative & Rewarding' | 'Balanced & Productive' | 'Sensitive & Restful (Chandrashtama)' | 'Introspective & Grounding';
        emotionalClimate: string;
        mentalFocusIndex: number; // 0 - 100
        mindsetTheme: string;
        recommendedFocus: string[];
        stressTriggers: string[];
        dos: string[];
        donts: string[];
        ayurvedicRemedy: string;
      }
    > = {
      1: {
        title: '1st House from Moon (Janma Chandra)',
        sanskrit: 'जन्म चन्द्र गोचर (देह एवं मन स्थिति)',
        quality: 'Balanced & Productive',
        emotionalClimate: 'Sensory attunement, heightened personal awareness, and mood sensitivity.',
        mentalFocusIndex: 78,
        mindsetTheme: 'Focus turns inward toward physical comfort, personal grooming, and self-care. Energy fluctuates like the lunar tide.',
        recommendedFocus: [
          'Personal health assessment, grooming, and restorative self-care.',
          'Setting weekly intentions and reviewing personal goals.',
          'Gentle movement, yoga, and walking in fresh air.',
        ],
        stressTriggers: [
          'High sensory overload, crowded chaotic spaces.',
          'Criticism directed at your appearance or personal habits.',
        ],
        dos: [
          'Start your day with quiet hydration and gentle morning sun.',
          'Wear calming, clean white or light pastel clothes.',
          'Eat freshly prepared satvik meals with digestive ghee.',
        ],
        donts: [
          'Avoid taking minor remarks too personally or emotionally.',
          'Do not commit to grueling physical overexertion today.',
        ],
        ayurvedicRemedy: 'Drink warm fennel or coriander tea; apply cooling sandalwood or rose water to forehead.',
      },
      2: {
        title: '2nd House from Moon (Dhana & Vani)',
        sanskrit: 'द्वितीय चन्द्र गोचर (वाणी एवं कोष)',
        quality: 'Balanced & Productive',
        emotionalClimate: 'Grounded, materially practical, communicative, and family-oriented.',
        mentalFocusIndex: 84,
        mindsetTheme: 'Clarity around budgets, savings, dietary choices, and articulate verbal discussions with family or colleagues.',
        recommendedFocus: [
          'Reviewing monthly financial ledgers and bank accounts.',
          'Important diplomatic conversations requiring pleasant, reassuring speech.',
          'Enjoying wholesome meals in the company of loved ones.',
        ],
        stressTriggers: [
          'Impulsive grocery or luxury shopping splurges.',
          'Petty disagreements over family expenses or past dues.',
        ],
        dos: [
          'Practice speaking with warm, deliberate, and truthful kindness.',
          'Set aside a modest savings amount into long-term assets.',
          'Consume warm, nourishing homemade foods.',
        ],
        donts: [
          'Do not lend cash on verbal assurances today.',
          'Avoid sharp, sarcastic retorts during domestic conversations.',
        ],
        ayurvedicRemedy: 'Chew a pinch of green cardamom or roasted fennel seeds after meals to harmonize speech energy.',
      },
      3: {
        title: '3rd House from Moon (Sahaja & Parakrama)',
        sanskrit: 'तृतीय चन्द्र गोचर (पराक्रम एवं विजय)',
        quality: 'Auspicious & Victorious',
        emotionalClimate: 'Courageous, bold, entrepreneurial, communicative, and lively.',
        mentalFocusIndex: 92,
        mindsetTheme: 'An Upachaya (growth) day! Mental fog dissolves into proactive initiative, decisive problem-solving, and optimistic vitality.',
        recommendedFocus: [
          'Reaching out to new clients, pitching bold proposals, and closing sales.',
          'Writing, blogging, publishing, or creating digital media content.',
          'Short commercial trips and coordinating with younger siblings/peers.',
        ],
        stressTriggers: [
          'Forced delays and feeling micromanaged by indecisive teammates.',
          'Excess nervous restlessness if physical energy is not discharged.',
        ],
        dos: [
          'Take the initiative on pending challenging emails or difficult calls.',
          'Engage in brisk morning exercise to channel high adrenaline.',
          'Express encouragement to younger brothers, sisters, or staff.',
        ],
        donts: [
          'Avoid rushing headlong into traffic or hazardous shortcuts.',
          'Do not let confidence become boastful or dismissive of others.',
        ],
        ayurvedicRemedy: 'Practice Kapalabhati pranayama 3 rounds followed by chanting "Om Som Somaya Namaha" 21x.',
      },
      4: {
        title: '4th House from Moon (Kantaka Chandra)',
        sanskrit: 'चतुर्थ चन्द्र गोचर (कण्टक चन्द्र - विश्राम काल)',
        quality: 'Introspective & Grounding',
        emotionalClimate: 'Emotionally tender, domestically focused, seeking sanctuary, slightly restless.',
        mentalFocusIndex: 64,
        mindsetTheme: 'Kantaka Chandra transit tests domestic serenity. Demands stepping back from external battles to replenish inner peace and emotional roots.',
        recommendedFocus: [
          'Tidying and decluttering your residential home space.',
          'Spending quality, affectionate moments with your mother or maternal elders.',
          'Grounding activities: gardening, cooking, reading soothing literature.',
        ],
        stressTriggers: [
          'Bringing unresolved office friction into the domestic dining room.',
          'Sudden vehicle repairs or domestic appliance breakdowns.',
        ],
        dos: [
          'Take short mental breathing breaks every 90 minutes.',
          'Bless maternal figures and speak softly in domestic spaces.',
          'Ensure early bedtime with reduced blue-light exposure.',
        ],
        donts: [
          'Avoid signing major long-term property contracts if feeling emotionally agitated.',
          'Do not escalate domestic friction or engage in blame games.',
        ],
        ayurvedicRemedy: 'Drink warm organic milk with a pinch of nutmeg and turmeric before sleep; massage soles of feet with sesame oil.',
      },
      5: {
        title: '5th House from Moon (Putra & Budhi)',
        sanskrit: 'पञ्चम चन्द्र गोचर (प्रज्ञा एवं उल्लास)',
        quality: 'Highly Creative & Rewarding',
        emotionalClimate: 'Playful, intellectually inspired, affectionate, romantic, and visionary.',
        mentalFocusIndex: 88,
        mindsetTheme: 'Trikona blessing! Sharp creative intellect (Dhi Shakti) awakens. Ideas flow effortlessly; joy through children, arts, or strategic thinking.',
        recommendedFocus: [
          'Brainstorming innovative concepts, product architecture, or artistic design.',
          'Enjoying playful, joyful interactions with your children.',
          'Reading spiritual mantras, philosophical texts, or sacred poetry.',
        ],
        stressTriggers: [
          'Impulsive speculative gambling or stock options trading.',
          'Overthinking romantic gestures or demanding immediate validation.',
        ],
        dos: [
          'Channel your creative instincts into tangible drawings, plans, or prototypes.',
          'Recite Gayatri Mantra or Saraswati Stotram for sharp cognitive brilliance.',
          'Compliment loved ones and foster an atmosphere of joy.',
        ],
        donts: [
          'Avoid taking highly leveraged financial bets in intraday markets.',
          'Do not let intellectual pride dismiss simple commonsense advice.',
        ],
        ayurvedicRemedy: 'Eat 5 soaked almonds in the morning; practice Anulom-Vilom pranayama facing East.',
      },
      6: {
        title: '6th House from Moon (Shatru & Roga Vijaya)',
        sanskrit: 'षष्ठ चन्द्र गोचर (शत्रु-बाधा विजय)',
        quality: 'Auspicious & Victorious',
        emotionalClimate: 'Pragmatic, disciplined, organized, resilient, and problem-solving oriented.',
        mentalFocusIndex: 94,
        mindsetTheme: 'A premier Upachaya victory day! The mind is sharp, methodical, and immune to emotional self-pity. Superb for clearing backlogs and settling debts.',
        recommendedFocus: [
          'Tackling demanding technical audits, spreadsheets, and backlogged tasks.',
          'Resolving pending disputes, bureaucratic clearances, and clearing debts.',
          'Starting a disciplined dietary detox or beginning a new fitness program.',
        ],
        stressTriggers: [
          'Petty coworker gossip or procedural bottlenecks.',
          'Digestive acidity if meals are skipped during intense work stretches.',
        ],
        dos: [
          'Crush through your hardest task first thing in the morning.',
          'Drink abundant water and keep a clean, clutter-free workspace.',
          'Maintain calm, factual diplomacy when dealing with opponents.',
        ],
        donts: [
          'Avoid spicy, deep-fried street foods that aggravate digestive Pitta.',
          'Do not nurse secret grudges; convert tension into productive stamina.',
        ],
        ayurvedicRemedy: 'Drink warm water with fresh lemon and a drop of honey; offer food to stray animals.',
      },
      7: {
        title: '7th House from Moon (Kalatra & Jaya)',
        sanskrit: 'सप्तम चन्द्र गोचर (साझेदारी एवं सौहार्द)',
        quality: 'Highly Creative & Rewarding',
        emotionalClimate: 'Warm, cooperative, romantic, socially engaging, and diplomatic.',
        mentalFocusIndex: 86,
        mindsetTheme: 'Direct opposition (Full Moon aspect) to your natal Moon highlights relationships, business negotiations, and romantic intimacy.',
        recommendedFocus: [
          'Joint business discussions, client presentations, and signing cooperative MOUs.',
          'Romantic dinner, meaningful heart-to-heart dialogue with spouse/partner.',
          'Social diplomacy, attending gatherings, and expanding professional network.',
        ],
        stressTriggers: [
          'Self-centered inflexibility or refusal to see the other person’s perspective.',
          'Over-promising commitments to please others.',
        ],
        dos: [
          'Listen twice as much as you speak in partnership discussions.',
          'Gift fresh flowers or small token of appreciation to your spouse.',
          'Wear elegant, clean, and pleasant fragrances.',
        ],
        donts: [
          'Avoid picking arguments over domestic duties right before dinner.',
          'Do not agree to one-sided partnership conditions out of social courtesy.',
        ],
        ayurvedicRemedy: 'Chant "Om Shukraya Namaha" or "Om Som Somaya Namaha" 11x; offer white flowers at home altar.',
      },
      8: {
        title: '8th House from Moon (CHANDRASHTAMA)',
        sanskrit: 'अष्टम चन्द्र गोचर (चन्द्राष्टम - मानसिक सतर्कता)',
        quality: 'Sensitive & Restful (Chandrashtama)',
        emotionalClimate: 'Introspective, emotionally vulnerable, reactive, cautious, and deep.',
        mentalFocusIndex: 52,
        mindsetTheme: 'Vedic Chandrashtama Alert! Moon transits the 8th house of hidden turbulence. Demands conscious emotional composure, slow driving, and spiritual surrender.',
        recommendedFocus: [
          'Routine, familiar, low-stress operational tasks without deadlines.',
          'Meditation, spiritual chanting, research, and deep introspection.',
          'Early rest, gentle walks in nature, and psychological decluttering.',
        ],
        stressTriggers: [
          'Sudden unexpected confrontations or unsolicited aggressive feedback.',
          'Rushing through traffic, impulsive major investments, or starting arguments.',
        ],
        dos: [
          'Keep your calendar light and avoid scheduling high-stakes negotiations today.',
          'Recite Maha Mrityunjaya Mantra or Shiva Panchakshara Stotra (Om Namah Shivaya).',
          'Drink pure water stored in a silver tumbler; practice deep abdominal breathing.',
        ],
        donts: [
          'STRICTLY AVOID signing major financial commitments, loans, or investments today.',
          'Do not react instantly to provocative texts, emails, or criticisms.',
          'Avoid long-distance late-night driving or risky physical sports.',
        ],
        ayurvedicRemedy: 'Chant Maha Mrityunjaya Mantra 11x; offer pure milk or water to Shiva Lingam; eat light satvik khichdi.',
      },
      9: {
        title: '9th House from Moon (Bhagya & Dharma)',
        sanskrit: 'नवम चन्द्र गोचर (भाग्य एवं गुरु कृपा)',
        quality: 'Highly Creative & Rewarding',
        emotionalClimate: 'Philosophical, optimistic, benevolent, expansive, and high-spirited.',
        mentalFocusIndex: 90,
        mindsetTheme: 'Supreme Trikona grace! Mind connects with higher wisdom, fortune, and preceptors (Guru). Difficult knots unravel with unexpected ease.',
        recommendedFocus: [
          'Strategic long-range planning, higher academic study, and legal reviews.',
          'Seeking counsel from seasoned mentors, father figures, or spiritual teachers.',
          'Charitable donations (Daan), temple visits, and spiritual contemplation.',
        ],
        stressTriggers: [
          'Dogmatic arguments over politics, religion, or theoretical ideologies.',
          'Restlessness caused by routine, repetitive administrative paperwork.',
        ],
        dos: [
          'Touch feet of parents/elders or express gratitude to mentors.',
          'Dedicate 20 minutes to reading elevating philosophical literature.',
          'Donate yellow sweets or books to students in need.',
        ],
        donts: [
          'Avoid speaking cynically or disparaging traditional customs.',
          'Do not overlook fine-print details while absorbed in grand visions.',
        ],
        ayurvedicRemedy: 'Apply a small tilak of pure sandalwood or saffron on the forehead; chant "Om Gurave Namaha".',
      },
      10: {
        title: '10th House from Moon (Karma & Rajya)',
        sanskrit: 'दशम चन्द्र गोचर (कर्म सिद्धि एवं प्रतिष्ठा)',
        quality: 'Auspicious & Victorious',
        emotionalClimate: 'Authoritative, ambitious, organized, commanding, and focused.',
        mentalFocusIndex: 96,
        mindsetTheme: 'Upachaya zenith! Moon touches your midheaven from natal Moon. Superb focus, organizational executive mastery, and recognition from seniors.',
        recommendedFocus: [
          'High-stakes client presentations, executive boardroom meetings, and pitches.',
          'Launching new corporate initiatives or restructuring business operations.',
          'Seeking endorsements, promotions, or official government approvals.',
        ],
        stressTriggers: [
          'Sloppy execution by subordinates or bureaucratic delay.',
          'Workaholism leading to neglecting lunch or hydration.',
        ],
        dos: [
          'Lead your meetings with poise, clarity, and well-researched facts.',
          'Acknowledge and praise hardworking team members publicly.',
          'Dress sharply in dignified, commanding professional attire.',
        ],
        donts: [
          'Avoid displaying irritable impatience with junior team members.',
          'Do not compromise statutory compliances for quick short-term wins.',
        ],
        ayurvedicRemedy: 'Practice Surya Namaskar in the morning; keep a clean, uncluttered work desk facing North or East.',
      },
      11: {
        title: '11th House from Moon (Labha & Aya)',
        sanskrit: 'एकादश चन्द्र गोचर (सर्व लाभ एवं मनोरथ सिद्धि)',
        quality: 'Auspicious & Victorious',
        emotionalClimate: 'Joyful, sociable, abundant, fulfilled, and celebration-oriented.',
        mentalFocusIndex: 95,
        mindsetTheme: 'Highest Upachaya reward house! Transiting Moon here delivers fulfilled aspirations, financial inflows, and pleasant camaraderie with friends.',
        recommendedFocus: [
          'Closing profitable deals, invoicing clients, and collecting pending receivables.',
          'Social gatherings, team celebrations, and networking with influential peers.',
          'Manifestation journaling and celebrating recent personal milestones.',
        ],
        stressTriggers: [
          'Superficial social obligations that drain real connection.',
          'Over-indulgence in heavy party food or late-night drinks.',
        ],
        dos: [
          'Express sincere gratitude for incoming revenues and supportive friends.',
          'Share your wins generously with teammates or donate to charity.',
          'Envision and write down ambitious goals for the coming quarter.',
        ],
        donts: [
          'Avoid speculative impulse shopping just because cashflow is strong.',
          'Do not let pride isolate you from genuine, loyal childhood friends.',
        ],
        ayurvedicRemedy: 'Offer fresh fruits to cows or children; chant "Om Shreem Mahalakshmyai Namaha" 11x.',
      },
      12: {
        title: '12th House from Moon (Vyaya & Moksha)',
        sanskrit: 'द्वादश चन्द्र गोचर (व्यय एवं आन्तरिक शांति)',
        quality: 'Introspective & Grounding',
        emotionalClimate: 'Solitary, dreamy, introspective, sensitive to expense, peaceful.',
        mentalFocusIndex: 62,
        mindsetTheme: 'Completion of the lunar cycle. The mind seeks quiet solitude, spiritual prayer, restful sleep, and release of outworn baggage.',
        recommendedFocus: [
          'Solo deep work, auditing, research, and creative writing in quiet spaces.',
          'Spiritual meditation, yoga nidra, and early restorative sleep.',
          'International cross-border communications and philanthropic donations.',
        ],
        stressTriggers: [
          'Heavy crowd pressure, chaotic meetings, and demanding social events.',
          'Unplanned recurring subscription fees or unexpected expense drains.',
        ],
        dos: [
          'Carve out at least 45 minutes of complete silent solitude today.',
          'Audit your financial subscriptions and eliminate wasteful leakage.',
          'Practice 10 minutes of restorative breathing before getting into bed.',
        ],
        donts: [
          'Avoid late-night blue-light screen exposure right before sleeping.',
          'Do not engage in spiteful debates or aggressive corporate politicking.',
        ],
        ayurvedicRemedy: 'Diffuse lavender or sandalwood essential oil in the bedroom; chant "Om Namah Shivaya" 108x.',
      },
    };

    return (
      houseDetails[h] || {
        title: `House ${h} from Moon`,
        sanskrit: 'चन्द्र गोचर',
        quality: 'Balanced & Productive',
        emotionalClimate: 'Balanced mental state.',
        mentalFocusIndex: 75,
        mindsetTheme: 'Steady day for standard duties.',
        recommendedFocus: ['Daily duties', 'Healthy routine'],
        stressTriggers: ['Rushing'],
        dos: ['Stay calm', 'Breathe deeply'],
        donts: ['Avoid haste'],
        ayurvedicRemedy: 'Practice mindful breathing.',
      }
    );
  }, [chandraGocharHouse]);

  const seekerName = activeProfile?.name || 'Seeker';
  const natalMoonRasiObj = VEDIC_RASIS[natalMoon.rasiNumber - 1];
  const transitMoonRasiObj = transitingMoon ? VEDIC_RASIS[transitingMoon.rasiNumber - 1] : natalMoonRasiObj;

  const isChandrashtama = chandraGocharHouse === 8;
  const isUpachaya = [3, 6, 10, 11].includes(chandraGocharHouse);

  return (
    <div className="bg-[#FAF6EE] rounded-xl border border-sky-300/80 p-3 sm:p-4 shadow-xs space-y-3 break-words text-[11px] animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/80 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <Moon className="w-3 h-3 text-sky-700" />
              <span>Chandra Gochar (Lunar Transit)</span>
            </span>
            <span className="text-stone-400 text-xs">•</span>
            <span className="text-[11px] text-stone-600 font-medium">
              Daily Emotional &amp; Mental Guidance for {seekerName}
            </span>
          </div>

          <h2 className="font-vedic font-black text-[15px] sm:text-[16px] text-amber-950 flex items-center space-x-2">
            <span>Current Moon Transit vs. Natal Moon Sign</span>
          </h2>
        </div>

        {/* Interactive Day Switcher: Yesterday, Today, Tomorrow */}
        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-md border border-stone-200 shadow-3xs self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDayOffset((prev) => prev - 1)}
            className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setDayOffset(0)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              dayOffset === 0
                ? 'bg-amber-800 text-white'
                : 'text-stone-700 hover:bg-amber-50'
            }`}
          >
            {dayOffset === 0 ? 'Today (Live)' : targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </button>

          <button
            type="button"
            onClick={() => setDayOffset((prev) => prev + 1)}
            className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chandrashtama Alert Banner (If in 8th house) */}
      {isChandrashtama && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-lg p-2.5 sm:p-3 text-rose-950 space-y-1 animate-pulse">
          <div className="flex items-center space-x-2 font-vedic font-black text-[13px] text-rose-900">
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            <span>⚠️ CHANDRASHTAMA IN EFFECT TODAY (8th House Transit from Natal Moon)</span>
          </div>
          <p className="text-[11px] text-rose-900 leading-snug">
            In Vedic astrology, when the transiting Moon enters the 8th house from your Janma Rasi ({natalMoonRasiObj?.sanskritName}),
            the subconscious mind is sensitive to anxiety, impulsive remarks, and temporary fatigue.
            <strong className="block mt-0.5 font-bold text-rose-950">
              Golden Advice: Defer major financial investments, avoid ego arguments, drive mindfully, and chant Maha Mrityunjaya Mantra.
            </strong>
          </p>
        </div>
      )}

      {/* Upachaya Victory Banner (If 3, 6, 10, 11) */}
      {isUpachaya && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 sm:p-2.5 text-emerald-950 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-vedic font-bold text-[12px] text-emerald-950">
              Upachaya Growth Day ({chandraGocharHouse}th from Moon): Supreme Mental Energy &amp; High Productivity!
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[9.5px] font-bold shrink-0">
            Favorable Day
          </span>
        </div>
      )}

      {/* Core Telemetry Cards: Natal Moon vs Transiting Moon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Natal Moon Box */}
        <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-3xs space-y-1">
          <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold uppercase">
            <span>Natal Moon (Janma Rasi)</span>
            <span className="text-amber-800 font-bold">Birth Matrix</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-vedic font-bold text-[14px] text-stone-950">
              {natalMoonRasiObj?.sanskritName} ({natalMoonRasiObj?.westernEquivalent})
            </span>
          </div>
          <p className="text-[10px] text-stone-600">
            Nakshatra: <strong>{natalMoon.nakshatra}</strong> • Lord: {natalMoonRasiObj?.lord}
          </p>
        </div>

        {/* Transiting Moon Box */}
        <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-3xs space-y-1">
          <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold uppercase">
            <span>Transiting Moon (Gochar)</span>
            <span className="text-sky-700 font-bold">{dayOffset === 0 ? 'Live Now' : 'Target Day'}</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-vedic font-bold text-[14px] text-sky-950">
              {transitMoonRasiObj?.sanskritName} ({transitMoonRasiObj?.westernEquivalent})
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              {transitingMoon?.degree}°{transitingMoon?.minute}&apos;
            </span>
          </div>
          <p className="text-[10px] text-stone-600">
            Nakshatra: <strong>{transitingMoon?.nakshatra || 'Rohini'}</strong> • {lunarPhase.phaseName}
          </p>
        </div>

        {/* Angular Chandra Bala Relationship */}
        <div className={`p-2.5 rounded-lg border shadow-3xs space-y-1 ${
          isChandrashtama
            ? 'bg-rose-100/70 border-rose-300 text-rose-950'
            : isUpachaya
            ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
            : 'bg-amber-100/70 border-amber-300 text-amber-950'
        }`}>
          <div className="flex justify-between items-center text-[10px] font-semibold uppercase">
            <span>Chandra Bala Alignment</span>
            <span className="font-bold">House {chandraGocharHouse} from Moon</span>
          </div>
          <div className="text-[13px] font-vedic font-black leading-tight">
            {dailyGuidanceData.title}
          </div>
          <p className="text-[10px] opacity-90 truncate">
            {dailyGuidanceData.sanskrit} • Lagna H{lagnaGocharHouse}
          </p>
        </div>
      </div>

      {/* Deep Daily Psychological & Emotional Narrative */}
      <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-3xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-stone-100 pb-1.5">
          <div className="flex items-center space-x-2">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <h3 className="font-vedic font-bold text-[12.5px] text-amber-950">
              Daily Emotional Mindset &amp; Psychological Climate
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-stone-500 font-semibold">Cognitive Focus Index:</span>
            <div className="w-20 bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  dailyGuidanceData.mentalFocusIndex >= 85
                    ? 'bg-emerald-600'
                    : dailyGuidanceData.mentalFocusIndex >= 70
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${dailyGuidanceData.mentalFocusIndex}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-stone-800">{dailyGuidanceData.mentalFocusIndex}%</span>
          </div>
        </div>

        <p className="text-stone-800 leading-relaxed text-[11px]">
          {dailyGuidanceData.mindsetTheme}
        </p>

        {/* 2-Column Actionable Focus vs Triggers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10.5px]">
          <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-900 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Recommended Focus Today</span>
            </span>
            <ul className="space-y-0.5 text-stone-700">
              {dailyGuidanceData.recommendedFocus.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1">
                  <span className="text-emerald-700 leading-none">•</span>
                  <span className="leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200 space-y-1">
            <span className="font-bold text-amber-900 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>Stress &amp; Reaction Triggers to Avoid</span>
            </span>
            <ul className="space-y-0.5 text-stone-700">
              {dailyGuidanceData.stressTriggers.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-1">
                  <span className="text-amber-700 leading-none">•</span>
                  <span className="leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Daily Dos and Don'ts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10.5px]">
          <div className="bg-white p-2 rounded-lg border border-stone-200 space-y-0.5">
            <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wider">
              Daily Mental Do&apos;s
            </span>
            {dailyGuidanceData.dos.map((d, i) => (
              <p key={i} className="text-stone-700 leading-tight">
                ✓ {d}
              </p>
            ))}
          </div>

          <div className="bg-white p-2 rounded-lg border border-stone-200 space-y-0.5">
            <span className="font-bold text-rose-800 block text-[10px] uppercase tracking-wider">
              Daily Mental Don&apos;ts
            </span>
            {dailyGuidanceData.donts.map((d, i) => (
              <p key={i} className="text-stone-700 leading-tight">
                ✗ {d}
              </p>
            ))}
          </div>
        </div>

        {/* Ayurvedic & Mind Balance Remedy (Chandra Shanti) */}
        <div className="bg-[#FAF2E1] p-2 rounded-lg border border-amber-800/30 text-[10.5px] flex items-start space-x-2 text-stone-800">
          <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">Vedic Mind Harmony (Chandra Shanti): </span>
            <span>{dailyGuidanceData.ayurvedicRemedy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
