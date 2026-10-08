import React, { useMemo, useState } from 'react';
import {
  Moon,
  Sparkles,
  Compass,
  Activity,
  Flame,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react';
import { PlanetPosition, UserProfile } from '../types';
import { normalizeDegrees } from '../vedicMath';
import { VEDIC_RASIS } from '../data';

interface LunarPhaseWidgetProps {
  currentPlanets: PlanetPosition[];
  natalPlanets?: PlanetPosition[];
  natalLagnaRasi?: number;
  currentDate?: Date;
  locationName?: string;
}

export interface VedicLunarPhaseInfo {
  phaseKey: string;
  phaseName: string;
  sanskritPhase: string;
  paksha: 'Shukla (Bright Half)' | 'Krishna (Dark Half)';
  pakshaSanskrit: string;
  tithiNumber: number; // 1 to 30 (1-15 Shukla, 16-30 Krishna)
  tithiInPaksha: number; // 1 to 15
  tithiName: string;
  tithiSanskrit: string;
  tithiCategory: string; // Nanda, Bhadra, Jaya, Rikta, Poorna
  tithiRulingDeity: string;
  illumination: number; // 0 to 100%
  phaseAngle: number; // elongation in deg
  vedicSignificance: string;
  karmicQuality: string;
  recommendedActivities: string[];
  activitiesToAvoid: string[];
  mindEnergy: string;
  element: string;
  moonIconSvg: (props: { className?: string; size?: number }) => React.ReactElement;
}

// 15 Tithis details with Vedic categorization (Pancha Tithi Varga: Nanda, Bhadra, Jaya, Rikta, Poorna)
const TITHI_METADATA: Record<
  number,
  {
    name: string;
    sanskrit: string;
    category: string;
    deity: string;
    element: string;
    meaning: string;
  }
> = {
  1: { name: 'Pratipada', sanskrit: 'प्रतिपदा', category: 'Nanda (Joyous / Prosperity)', deity: 'Agni (Fire)', element: 'Fire', meaning: 'Initiation of new cycles and ceremonies.' },
  2: { name: 'Dwitiya', sanskrit: 'द्वितीया', category: 'Bhadra (Auspicious / Stable)', deity: 'Brahma (Creation)', element: 'Earth', meaning: 'Foundational works, architecture, long-term plans.' },
  3: { name: 'Tritiya', sanskrit: 'तृतीया', category: 'Jaya (Victory / Conquest)', deity: 'Gauri (Grace)', element: 'Space / Ether', meaning: 'Overcoming limitations, creative arts, festive celebrations.' },
  4: { name: 'Chaturthi', sanskrit: 'चतुर्थी', category: 'Rikta (Empty / Cleansing)', deity: 'Ganesha (Remover of Obstacles)', element: 'Water', meaning: 'Overcoming obstacles, introspection, avoiding high-risk starts.' },
  5: { name: 'Panchami', sanskrit: 'पंचमी', category: 'Poorna (Fullness / Abundant)', deity: 'Nagas / Saraswati (Wisdom)', element: 'Air', meaning: 'Healing therapies, medicine, study, wisdom development.' },
  6: { name: 'Shashthi', sanskrit: 'षष्ठी', category: 'Nanda (Joyous / Dynamic)', deity: 'Kartikeya (Courage)', element: 'Fire', meaning: 'Courage, leadership, competitive strategy, defence.' },
  7: { name: 'Saptami', sanskrit: 'सप्तमी', category: 'Bhadra (Auspicious / Travelling)', deity: 'Surya (Solar Vitality)', element: 'Earth', meaning: 'Journeys, vehicle purchase, vitality routines, public meetings.' },
  8: { name: 'Ashtami', sanskrit: 'अष्टमी', category: 'Jaya (Victory / Power)', deity: 'Durga / Shiva (Strength)', element: 'Ether', meaning: 'Deep inner meditation, self-discipline, spiritual protection.' },
  9: { name: 'Navami', sanskrit: 'नवमी', category: 'Rikta (Empty / Pruning)', deity: 'Durga (Eradication of evil)', element: 'Water', meaning: 'Pruning bad habits, confronting challenges, internal purification.' },
  10: { name: 'Dashami', sanskrit: 'दशमी', category: 'Poorna (Completion)', deity: 'Dharmaraja / Yamaraja (Order)', element: 'Air', meaning: 'Righteous affairs, legal settlements, virtue, dharma.' },
  11: { name: 'Ekadashi', sanskrit: 'एकादशी', category: 'Nanda (Spiritual Elevation)', deity: 'Vishnu (Preservation)', element: 'Fire', meaning: 'Fasting, high spiritual vibration, mental purification, meditation.' },
  12: { name: 'Dwadashi', sanskrit: 'द्वादशी', category: 'Bhadra (Auspicious Bounty)', deity: 'Vishnu / Savitar', element: 'Earth', meaning: 'Charity (Daan), sacred meals, social harmony, concluding vows.' },
  13: { name: 'Trayodashi', sanskrit: 'त्रयोदशी', category: 'Jaya (Victory & Devotion)', deity: 'Kamadeva / Shiva (Pradosha)', element: 'Ether', meaning: 'Pradosham worship, removing karmic debts, rejuvenation.' },
  14: { name: 'Chaturdashi', sanskrit: 'चतुर्दशी', category: 'Rikta (Dissolution / Shiva)', deity: 'Shiva (Transformation)', element: 'Water', meaning: 'Spiritual surrender, clearing mental clutter, intense focus.' },
  15: { name: 'Purnima', sanskrit: 'पूर्णिमा', category: 'Poorna (Supreme Fullness)', deity: 'Chandra / Satyanarayana', element: 'Light / Cosmic Nectar', meaning: 'Maximum Soma, heightened psychic intuition, spiritual climax.' },
  30: { name: 'Amavasya', sanskrit: 'अमावस्या', category: 'Darsha / Shunya (Silent Void)', deity: 'Pitris (Ancestors) & Yama', element: 'Stillness / Void', meaning: 'Deep contemplation, ancestral Tarpan, rest, resetting karmic intention.' },
};

export function getDetailedLunarPhase(moonDeg: number, sunDeg: number): VedicLunarPhaseInfo {
  const diff = normalizeDegrees(moonDeg - sunDeg); // 0 to 360 elongation
  const tithiIndex = Math.floor(diff / 12) + 1; // 1 to 30
  const isShukla = tithiIndex <= 15;
  const tithiInPaksha = isShukla ? tithiIndex : tithiIndex - 15;
  const actualTithiKey = tithiIndex === 30 ? 30 : tithiInPaksha;

  // Illumination formula
  const phaseAngleRad = (diff * Math.PI) / 180;
  const illumination = Math.round(((1 - Math.cos(phaseAngleRad)) / 2) * 100);

  const tithiMeta = TITHI_METADATA[actualTithiKey] || TITHI_METADATA[1];

  // Specific Phase Classifications (8 phases)
  let phaseKey = 'waxing_crescent';
  let phaseName = 'Waxing Crescent';
  let sanskritPhase = 'शुक्ल वर्धमान चन्द्र';
  let karmicQuality = 'Nourishing & Expanding';
  let mindEnergy = 'Awakening & Building';
  let vedicSignificance = '';
  let recommendedActivities: string[] = [];
  let activitiesToAvoid: string[] = [];

  if (diff >= 354 || diff < 6) {
    phaseKey = 'new_moon';
    phaseName = 'New Moon (Amavasya)';
    sanskritPhase = 'अमावस्या (शून्य कला)';
    karmicQuality = 'Ancestral Introspection & Karmic Reset';
    mindEnergy = 'Still, Subconscious, Inward-drawn';
    vedicSignificance =
      'Amavasya marks the celestial union of the Sun (Atman / Soul) and Moon (Manas / Mind). The physical illumination reaches 0%, symbolising the silent womb of cosmic stillness. In Vedic tradition, this is the day sacred to Pitris (Ancestral Lineage). The conscious mind rests, granting profound access to the subconscious seed instincts.';
    recommendedActivities = [
      'Ancestral prayers (Pitri Tarpan / Daan)',
      'Silent meditation and mindfulness walks',
      'Fasting or cleansing diet (Sattvic)',
      'Journaling emotional intentions for the upcoming waxing cycle',
    ];
    activitiesToAvoid = [
      'Commencing public ventures or lavish contracts',
      'Heavy material investments or purchase of luxury items',
      'Confrontational debates or volatile emotional discussions',
    ];
  } else if (diff >= 6 && diff < 84) {
    phaseKey = 'waxing_crescent';
    phaseName = 'Waxing Crescent (Shukla Pratipada – Panchami)';
    sanskritPhase = 'शुक्ल बाल चन्द्र (वर्धमान कला)';
    karmicQuality = 'Seed Germination & Creative Genesis';
    mindEnergy = 'Optimistic, Curious, Receptive';
    vedicSignificance =
      'The young silver crescent reappears as Lord Shiva wears the crescent moon (Chandrashekhara) on his brow. Cosmic Prana and Soma (lunar nectar) begin their ascending curve. The mind gathers clarity, eagerness to explore, and fresh vitality to sow the seeds of aspiration.';
    recommendedActivities = [
      'Drafting new project blueprints and business milestones',
      'Beginning educational coursework, mantra sadhana, and skills',
      'Creative brain-storming and constructive networking',
      'Planting seeds, gardening, and commencing wellness regimes',
    ];
    activitiesToAvoid = [
      'Impatient expectation of immediate harvest',
      'Overextending financial capital before foundation solidifies',
    ];
  } else if (diff >= 84 && diff < 96) {
    phaseKey = 'first_quarter';
    phaseName = 'First Quarter (Shukla Ashtami)';
    sanskritPhase = 'शुक्ल अर्धचन्द्र (प्रथम पाद)';
    karmicQuality = 'Dynamic Breakthrough & Creative Tension';
    mindEnergy = 'Focused, Action-Oriented, Resolute';
    vedicSignificance =
      'The Moon forms a 90° square aspect to the Sun. Exactly half illuminated, this Vedic threshold represents the test of resolve. Under Durga and Shiva’s patron energy on Ashtami, internal hesitations must be converted into resolute action.';
    recommendedActivities = [
      'Addressing bottlenecks and clearing administrative backlogs',
      'Physically demanding tasks and assertive discussions',
      'Honing technical proficiencies and structured discipline',
      'Durga & Hanuman devotional recitations for internal vigor',
    ];
    activitiesToAvoid = [
      'Procrastinating on necessary structural decisions',
      'Letting emotional self-doubt erode established plans',
    ];
  } else if (diff >= 96 && diff < 174) {
    phaseKey = 'waxing_gibbous';
    phaseName = 'Waxing Gibbous (Shukla Navami – Chaturdashi)';
    sanskritPhase = 'शुक्ल प्रवर्धमान चन्द्र (समीप पूर्णिमा)';
    karmicQuality = 'Ripening, Refinement & Acceleration';
    mindEnergy = 'Expansive, Confident, Collaborative';
    vedicSignificance =
      'Approaching complete radiance, the Moon infuses life-force into emotional, intellectual, and physical endeavors. The mind experiences rapid processing ability and collective cohesion. It is an optimal period for fine-tuning creations before unveiling.';
    recommendedActivities = [
      'Finalizing complex negotiations and creative productions',
      'Marketing campaigns, presentations, and product launches',
      'Group collaborations, satsangs, and knowledge exchanges',
      'Ekadashi observance (mental clarity and physical purification)',
    ];
    activitiesToAvoid = [
      'Rushing prematurely without finishing the crucial details',
      'Over-indulgence in sensory stimulants',
    ];
  } else if (diff >= 174 && diff < 186) {
    phaseKey = 'full_moon';
    phaseName = 'Full Moon (Purnima)';
    sanskritPhase = 'पूर्णिमा (पूर्ण सोम कला)';
    karmicQuality = 'Supreme Illumination & Culmination';
    mindEnergy = 'Peak Radiance, Intuitive, Sensitive';
    vedicSignificance =
      'The Moon opposes the Sun at 180°, receiving unobstructed cosmic radiance. Soma (the divine lunar ambrosia) reaches maximum potency. In Vedic science, the water element (Jala Tattva) within blood and neurotransmitters surges, magnifying emotions, psychic intuition, and spiritual prayer potency.';
    recommendedActivities = [
      'Satyanarayana Puja, Moon-gazing (Trataka on Chandra)',
      'Meditation, sound healing, chanting Om Som Somaya Namah',
      'Celebrating milestones, public ceremonies, and grand releases',
      'Practicing gratitude, charity (Daan), and peace vigils',
    ];
    activitiesToAvoid = [
      'Entering hostile arguments or making rash emotional decisions',
      'Elective surgical procedures sensitive to fluid pressure',
      'Excessive psychological strain or sleep deprivation',
    ];
  } else if (diff >= 186 && diff < 264) {
    phaseKey = 'waning_gibbous';
    phaseName = 'Waning Gibbous (Krishna Pratipada – Panchami)';
    sanskritPhase = 'कृष्ण अवतरण चन्द्र (कृतज्ञता कला)';
    karmicQuality = 'Distribution of Harvest & Mentorship';
    mindEnergy = 'Generous, Synthesizing, Pedagogical';
    vedicSignificance =
      'As the Moon starts its Krishna Paksha descent, the heightened fullness transforms from personal acquisition to generous sharing. The Vedic wisdom recommends distributing wealth, knowledge, and mentorship to others.';
    recommendedActivities = [
      'Mentoring students, publishing findings, teaching workshops',
      'Reviewing results of recent efforts and sharing rewards',
      'Hosting reunions, community meals, and diplomatic talks',
      'Expressing gratitude to elders and professional mentors',
    ];
    activitiesToAvoid = [
      'Hoarding knowledge or clinging greedily to past praise',
      'Embarking on speculative brand-new solo start-ups',
    ];
  } else if (diff >= 264 && diff < 276) {
    phaseKey = 'third_quarter';
    phaseName = 'Third Quarter (Krishna Ashtami)';
    sanskritPhase = 'कृष्ण अर्धचन्द्र (त्याग पाद)';
    karmicQuality = 'Discernment, Pruning & Release';
    mindEnergy = 'Critical, Analytical, Detached';
    vedicSignificance =
      'The Moon forms a closing square to the Sun. In Vedic astrology, this phase demands rigorous truth and detachment (Vairagya). What is unproductive or burdensome is intentionally shed to make room for evolutionary rebirth.';
    recommendedActivities = [
      'Decluttering physical spaces, digital drives, and workspaces',
      'Terminating draining agreements and breaking destructive habits',
      'Auditing financial balance sheets and cutting waste',
      'Introspective meditation on impermanence and detachment',
    ];
    activitiesToAvoid = [
      'Taking on heavy new commitments or signing long leases',
      'Resisting necessary life changes out of nostalgia',
    ];
  } else {
    // 276 to 354
    phaseKey = 'waning_crescent';
    phaseName = 'Waning Crescent (Krishna Navami – Chaturdashi)';
    sanskritPhase = 'कृष्ण सूक्ष्म चन्द्र (शिवरात्री कला)';
    karmicQuality = 'Spiritual Dissolution & Rejuvenation';
    mindEnergy = 'Deep, Contemplative, Restorative';
    vedicSignificance =
      'The sliver of silver dims towards the silent night of Amavasya. During Masa Shivaratri (Chaturdashi), the mind surrenders worldly ambition to the cosmic silence of Mahadeva. The body repairs tissue, and the spirit prepares for a clean slate.';
    recommendedActivities = [
      'Rest, gentle yoga (Yin / Nidra), restorative sleep',
      'Shiva Pradosham and Rudra Abhishekam meditation',
      'Subconscious shadow work, journaling, dream analysis',
      'Completing loose ends rather than opening new doors',
    ];
    activitiesToAvoid = [
      'High-stress physical exhaustion or intense social overload',
      'Public inaugurations or aggressive marketing pushes',
    ];
  }

  return {
    phaseKey,
    phaseName,
    sanskritPhase,
    paksha: isShukla ? 'Shukla (Bright Half)' : 'Krishna (Dark Half)',
    pakshaSanskrit: isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष',
    tithiNumber: tithiIndex,
    tithiInPaksha,
    tithiName: tithiMeta.name,
    tithiSanskrit: tithiMeta.sanskrit,
    tithiCategory: tithiMeta.category,
    tithiRulingDeity: tithiMeta.deity,
    illumination,
    phaseAngle: Math.round(diff * 10) / 10,
    vedicSignificance,
    karmicQuality,
    recommendedActivities,
    activitiesToAvoid,
    mindEnergy,
    element: tithiMeta.element,
    moonIconSvg: renderMoonSvg(illumination, isShukla),
  };
}

// Function to render an SVG depicting the accurate moon phase illumination
function renderMoonSvg(illumination: number, isShukla: boolean) {
  return function MoonPhaseSvg({
    className = 'w-16 h-16',
    size = 64,
  }: {
    className?: string;
    size?: number;
  }) {
    // Generate realistic crescent / gibbous SVG path
    const r = size / 2 - 2;
    const cx = size / 2;
    const cy = size / 2;

    // k goes from -1 (New Moon) to +1 (Full Moon)
    // For illumination 0..100:
    // If Shukla (waxing): from 0 to 180 deg
    // If Krishna (waning): from 180 to 360 deg
    // We compute rx for the terminator ellipse:
    const factor = (illumination / 100) * 2 - 1; // -1 to 1
    const terminatorRx = Math.abs(factor) * r;

    // Path constructing the lit hemisphere:
    // Waxing: lit on the Right (in Northern Hemisphere sidereal convention)
    // Waning: lit on the Left
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
      >
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#fef08a" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="moonSurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id="darkSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Glow halo */}
        <circle cx={cx} cy={cy} r={r + 3} fill="url(#moonGlow)" />

        {/* Base dark moon disk */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="url(#darkSide)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Craters hint on dark side */}
        <circle cx={cx - 5} cy={cy - 6} r={2.5} fill="#334155" opacity="0.4" />
        <circle cx={cx + 6} cy={cy + 7} r={3.5} fill="#334155" opacity="0.4" />
        <circle cx={cx - 8} cy={cy + 8} r={2} fill="#334155" opacity="0.3" />

        {/* Lit portion dynamic rendering */}
        {illumination > 0 && illumination < 100 && (
          <path
            d={
              isShukla
                ? factor < 0
                  ? // Crescent waxing: lit on right, terminator concave right
                    `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 1 ${cx} ${cy - r} Z`
                  : // Gibbous waxing: lit on right, terminator convex left
                    `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 0 ${cx} ${cy - r} Z`
                : factor < 0
                ? // Crescent waning: lit on left, terminator concave left
                  `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 0 ${cx} ${cy - r} Z`
                : // Gibbous waning: lit on left, terminator convex right
                  `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${terminatorRx} ${r} 0 0 1 ${cx} ${cy - r} Z`
            }
            fill="url(#moonSurface)"
            stroke="#fef08a"
            strokeWidth="0.5"
          />
        )}

        {/* 100% Full Moon */}
        {illumination >= 99 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="url(#moonSurface)"
            stroke="#fef08a"
            strokeWidth="1"
          />
        )}

        {/* High detail craters on lit portion */}
        {illumination > 30 && (
          <>
            <circle
              cx={isShukla ? cx + 7 : cx - 7}
              cy={cy - 4}
              r={2}
              fill="#ca8a04"
              opacity="0.3"
            />
            <circle
              cx={isShukla ? cx + 4 : cx - 4}
              cy={cy + 6}
              r={3}
              fill="#ca8a04"
              opacity="0.25"
            />
          </>
        )}

        {/* Perimeter Rim */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    );
  };
}

export function LunarPhaseWidget({
  currentPlanets,
  natalPlanets = [],
  natalLagnaRasi = 1,
  currentDate = new Date(),
  locationName = 'Current Location',
}: LunarPhaseWidgetProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'significance' | 'guidance' | 'chart_impact'>('significance');

  const moonGraha = currentPlanets.find((p) => p.name === 'Chandra');
  const sunGraha = currentPlanets.find((p) => p.name === 'Surya');

  const lunarData = useMemo(() => {
    if (!moonGraha || !sunGraha) return null;
    return getDetailedLunarPhase(moonGraha.totalDeg || 0, sunGraha.totalDeg || 0);
  }, [moonGraha, sunGraha]);

  // Natal Astrological Correlation
  const natalImpact = useMemo(() => {
    if (!moonGraha || !natalLagnaRasi) return null;

    // Transiting House from Lagna
    const transitHouseFromLagna = ((moonGraha.rasiNumber - natalLagnaRasi + 12) % 12) + 1;

    // Chandra Bala (Transit Moon relative to Natal Moon)
    const natalMoon = natalPlanets.find((p) => p.name === 'Chandra');
    const chandraBalaHouse = natalMoon
      ? ((moonGraha.rasiNumber - natalMoon.rasiNumber + 12) % 12) + 1
      : 1;

    const isAuspiciousChandraBala = [1, 3, 6, 7, 10, 11].includes(chandraBalaHouse);
    const isSensitiveChandraBala = [4, 8, 12].includes(chandraBalaHouse);

    const chandraBalaMeaning: Record<number, string> = {
      1: 'Prathama Chandra: Physical vitality, personal charisma, and fresh mental clarity.',
      2: 'Dwitiya Chandra: Financial evaluation, voice dignity, and nourishment caution.',
      3: 'Tritiya Chandra: Vigorous courage, winning momentum, sibling rapport, and successful travels.',
      4: 'Chaturtha Chandra: Emotional sensitivity; prioritize peace of mind over conflict.',
      5: 'Panchama Chandra: Creative brilliance, spiritual mantra resonance, and romantic intuition.',
      6: 'Shashtha Chandra: High resilience to defeat adversaries and conquer pending debts/work.',
      7: 'Saptama Chandra: Partnership harmony, public rapport, and charismatic diplomacy.',
      8: 'Ashtama Chandra (Chandrashtama): Deep karmic vulnerability; pause major risks, meditate.',
      9: 'Navama Chandra: Spiritual expansion, guru blessings, philosophical inquiry.',
      10: 'Dashama Chandra: Career peak, professional respect, leadership accomplishment.',
      11: 'Ekadasha Chandra: Auspicious profits, realization of hopes, joyful social connections.',
      12: 'Dwadasha Chandra: Expenditure awareness; ideal for meditation, retreat, and quiet rest.',
    };

    return {
      transitHouseFromLagna,
      chandraBalaHouse,
      isAuspiciousChandraBala,
      isSensitiveChandraBala,
      verdictText: chandraBalaMeaning[chandraBalaHouse] || 'Favorable transit alignment.',
      natalMoonSign: natalMoon ? VEDIC_RASIS[natalMoon.rasiNumber - 1]?.sanskritName : null,
    };
  }, [moonGraha, natalLagnaRasi, natalPlanets]);

  if (!lunarData || !moonGraha || !sunGraha) {
    return null;
  }

  const MoonSvgComponent = lunarData.moonIconSvg;

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-stone-50 to-sky-50/60 rounded-xl border border-amber-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Widget Header */}
      <div className="p-3 sm:p-3.5 bg-gradient-to-r from-stone-900 via-stone-850 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-3">
          <div className="relative shrink-0">
            <MoonSvgComponent size={44} className="w-11 h-11 drop-shadow-md" />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 text-[9px] font-black px-1 rounded-full border border-stone-900">
              {lunarData.illumination}%
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-300">
                Vedic Lunar Phase Observatory
              </span>
              <span className="text-stone-400 text-[10px]">•</span>
              <span className="text-[10px] text-sky-200 font-semibold">{lunarData.pakshaSanskrit}</span>
            </div>
            <h3 className="font-vedic font-black text-white text-[16px] sm:text-[17px] leading-tight flex items-center space-x-2">
              <span>{lunarData.phaseName}</span>
              <span className="text-amber-300 text-[12px] font-normal">({lunarData.sanskritPhase})</span>
            </h3>
            <p className="text-[11.5px] text-stone-300 flex items-center space-x-1.5 mt-0.5">
              <span>Tithi:</span>
              <strong className="text-amber-200 font-bold">
                {lunarData.tithiName} ({lunarData.tithiSanskrit})
              </strong>
              <span className="text-stone-500">•</span>
              <span className="text-stone-300">{lunarData.tithiCategory}</span>
            </p>
          </div>
        </div>

        {/* Quick Badges & Expand Button */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <div className="bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/15 text-[11px] text-right">
            <div className="text-[10px] text-stone-300">Elongation Angle</div>
            <div className="font-mono font-bold text-amber-300">{lunarData.phaseAngle}° from Sun</div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15 flex items-center space-x-1 text-[11px]"
            title={isExpanded ? 'Collapse Lunar Widget' : 'Expand Lunar Widget'}
          >
            <span>{isExpanded ? 'Details' : 'Expand'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Highlights Bar (Always Visible) */}
      <div className="px-3 py-2 bg-amber-100/50 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center space-x-1 text-stone-700">
            <Moon className="w-3.5 h-3.5 text-amber-700" />
            <span>Moon (Chandra):</span>
            <strong className="text-stone-900 font-bold">
              {moonGraha.rasiName} {moonGraha.degree}° {moonGraha.minute}&apos;
            </strong>
          </span>

          <span className="text-stone-300">|</span>

          <span className="flex items-center space-x-1 text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Nakshatra:</span>
            <strong className="text-stone-900 font-bold">
              {moonGraha.nakshatra} (Pada {moonGraha.pada})
            </strong>
          </span>

          <span className="text-stone-300">|</span>

          <span className="flex items-center space-x-1 text-stone-700">
            <Compass className="w-3.5 h-3.5 text-indigo-700" />
            <span>Ruling Deity:</span>
            <strong className="text-stone-900 font-bold">{lunarData.tithiRulingDeity}</strong>
          </span>
        </div>

        {natalImpact && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[10.5px] uppercase font-bold text-stone-500">Chandra Bala:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-black border ${
                natalImpact.isAuspiciousChandraBala
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : natalImpact.isSensitiveChandraBala
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              H{natalImpact.chandraBalaHouse} from Natal Moon •{' '}
              {natalImpact.isAuspiciousChandraBala
                ? 'Shubha (Auspicious)'
                : natalImpact.isSensitiveChandraBala
                ? 'Sensitive (Caution)'
                : 'Madhyama (Moderate)'}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-1.5 border-b border-stone-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('significance')}
              className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'significance'
                  ? 'bg-amber-700 text-white shadow-3xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Vedic Astrological Significance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('guidance')}
              className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'guidance'
                  ? 'bg-amber-700 text-white shadow-3xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Muhurta &amp; Action Guidance</span>
            </button>

            {natalImpact && (
              <button
                type="button"
                onClick={() => setActiveSubTab('chart_impact')}
                className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeSubTab === 'chart_impact'
                    ? 'bg-amber-700 text-white shadow-3xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Impact on Birth Chart</span>
              </button>
            )}
          </div>

          {/* TAB 1: SIGNIFICANCE */}
          {activeSubTab === 'significance' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Detailed Vedic Narrative */}
              <div className="md:col-span-2 bg-white/90 rounded-lg p-3 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-1.5">
                  <h4 className="font-vedic font-bold text-stone-950 text-[14px] flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Cosmic Principle of {lunarData.phaseName}</span>
                  </h4>
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                    Tattva: {lunarData.element}
                  </span>
                </div>

                <p className="text-[12.5px] text-stone-700 leading-relaxed">
                  {lunarData.vedicSignificance}
                </p>

                <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
                    <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wide text-amber-900">
                      Mental (Manas) Energy State
                    </span>
                    <p className="text-stone-600 mt-0.5 font-medium">{lunarData.mindEnergy}</p>
                  </div>

                  <div className="bg-[#FAF8F5] p-2 rounded border border-stone-200/80">
                    <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wide text-amber-900">
                      Karmic &amp; Pranic Quality
                    </span>
                    <p className="text-stone-600 mt-0.5 font-medium">{lunarData.karmicQuality}</p>
                  </div>
                </div>
              </div>

              {/* Tithi & Panchang Snapshot Card */}
              <div className="bg-gradient-to-br from-stone-900 to-indigo-950 text-white rounded-lg p-3 space-y-2.5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-300">
                      Tithi Technicals
                    </span>
                    <span className="text-[11px] font-mono text-stone-300">
                      #{lunarData.tithiNumber} of 30
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-[12px]">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Paksha:</span>
                      <strong className="text-white font-semibold">{lunarData.paksha}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Tithi Varga:</span>
                      <strong className="text-amber-200 font-semibold">{lunarData.tithiCategory}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Presiding Deity:</span>
                      <strong className="text-white font-semibold">{lunarData.tithiRulingDeity}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Soma (Illumination):</span>
                      <strong className="text-amber-300 font-mono font-bold">{lunarData.illumination}%</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Observation Point:</span>
                      <span className="text-stone-200 text-[11px] truncate max-w-[130px]">{locationName}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded p-2 border border-white/10 text-[11px] text-stone-200">
                  <span className="font-bold text-amber-300 block mb-0.5">Sanskrit Shastra Note:</span>
                  <em>&ldquo;चन्द्रमा मनसो जातः&rdquo;</em> — The Moon is born of the Cosmic Mind, mirroring our daily emotional rhythm and receptivity.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MUHURTA & ACTION GUIDANCE */}
          {activeSubTab === 'guidance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Recommended Activities */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2 border-b border-emerald-200 pb-1.5 text-emerald-950 font-bold text-[13.5px]">
                  <span className="p-1 rounded bg-emerald-100 text-emerald-700">✓</span>
                  <span>Auspicious Undertakings Today ({lunarData.tithiName})</span>
                </div>
                <ul className="space-y-1.5 text-[12px] text-emerald-900">
                  {lunarData.recommendedActivities.map((act, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-600 font-bold mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities to Avoid */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2 border-b border-rose-200 pb-1.5 text-rose-950 font-bold text-[13.5px]">
                  <span className="p-1 rounded bg-rose-100 text-rose-700">✕</span>
                  <span>Activities to Exercise Restraint or Postpone</span>
                </div>
                <ul className="space-y-1.5 text-[12px] text-rose-900">
                  {lunarData.activitiesToAvoid.map((act, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-rose-600 font-bold mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: BIRTH CHART CORRELATION */}
          {activeSubTab === 'chart_impact' && natalImpact && (
            <div className="bg-white/95 rounded-lg p-3 border border-amber-200/90 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200/80 pb-2">
                <div>
                  <h4 className="font-vedic font-bold text-stone-950 text-[14.5px]">
                    How Today’s Lunar Phase Resonates with Your Birth Chart
                  </h4>
                  <p className="text-[11.5px] text-stone-600">
                    Calculated against your Natal Lagna and Natal Moon (Chandra) sign
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                    Transit House: H{natalImpact.transitHouseFromLagna}
                  </span>
                  <span className="text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded">
                    Chandra Bala: H{natalImpact.chandraBalaHouse}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-stone-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-amber-900 block">
                    Chandra Bala Analysis (Transit Moon vs Natal Moon)
                  </span>
                  <p className="text-[12.5px] text-stone-800 font-medium leading-relaxed">
                    {natalImpact.verdictText}
                  </p>
                  <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                    Vedic Astrology considers the Moon’s placement in 1st, 3rd, 6th, 7th, 10th, or 11th from your Natal Moon as exceptionally auspicious (*Shubha Phala*).
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-stone-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-900 block">
                    House Activation: Transit Through Your House {natalImpact.transitHouseFromLagna}
                  </span>
                  <p className="text-[12.5px] text-stone-800 font-medium leading-relaxed">
                    The {lunarData.phaseName} activates your natal House {natalImpact.transitHouseFromLagna} ({VEDIC_RASIS[moonGraha.rasiNumber - 1]?.sanskritName} Rasi), sensitizing the themes of that house to emotional reflection, decision-making, and intuitive insights.
                  </p>
                  <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                    Current Nakshatra: <strong className="text-stone-800">{moonGraha.nakshatra}</strong> (ruled by {moonGraha.nakshatraLord}).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
