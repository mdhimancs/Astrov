import React, { useState, useMemo } from 'react';
import {
  Users,
  Home,
  Heart,
  TrendingUp,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Compass,
  Activity,
  Layers,
  BookOpen,
  ArrowRight,
  Sun,
  Flame,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PlanetPosition } from '../types';
import { VEDIC_RASIS } from '../data';

interface VedicReadingsObservationsProps {
  natalPlanets: PlanetPosition[];
  natalLagnaRasi: number;
  natalMoonRasi: number;
  userName?: string;
}

export type ObservationDomainKey = 'all' | 'family' | 'relatives' | 'home' | 'health_wealth' | 'education';

interface DomainObservation {
  id: ObservationDomainKey;
  label: string;
  sanskritTitle: string;
  icon: React.ElementType;
  themeColor: string;
  badgeBg: string;
  governingBhavas: string;
  karakaGrahas: string;
  currentSituation: {
    headline: string;
    description: string;
    specificProblems: string[];
    severity: 'Moderate' | 'Noticeable' | 'Manageable';
  };
  futureEffects: {
    goodEffects: string[];
    badEffects: string[];
    timelineForecast: string;
  };
  guidanceAndPrecautions: {
    actionableGuidance: string[];
    precautions: string[];
    vedicUpay: string;
  };
}

export function VedicReadingsObservations({
  natalPlanets,
  natalLagnaRasi,
  natalMoonRasi,
  userName = 'Seeker',
}: VedicReadingsObservationsProps) {
  const [selectedDomain, setSelectedDomain] = useState<ObservationDomainKey>('all');
  const [activeTabType, setActiveTabType] = useState<'all' | 'problems' | 'future' | 'guidance'>('all');

  const lagnaRasiObj = VEDIC_RASIS[natalLagnaRasi - 1] || VEDIC_RASIS[0];
  const moonRasiObj = VEDIC_RASIS[natalMoonRasi - 1] || VEDIC_RASIS[0];

  // Helper to find planet in natal chart
  const getPlanet = (name: string) => natalPlanets.find((p) => p.name === name);
  const jupPlanet = getPlanet('Guru');
  const satPlanet = getPlanet('Shani');
  const marsPlanet = getPlanet('Mangal');
  const mercPlanet = getPlanet('Budha');
  const sunPlanet = getPlanet('Surya');
  const venPlanet = getPlanet('Shukra');
  const rahuPlanet = getPlanet('Rahu');

  // Synthesize domain observations based on natal placements
  const observationsData: DomainObservation[] = useMemo(() => {
    return [
      // 1. FAMILY
      {
        id: 'family',
        label: 'Family Dynamics',
        sanskritTitle: 'कुटुंब व कुल (Kutumba Sambandha)',
        icon: Users,
        themeColor: 'text-rose-800',
        badgeBg: 'bg-rose-50 border-rose-200 text-rose-950',
        governingBhavas: '2nd House (Speech/Treasury) & 4th House (Domestic Bliss)',
        karakaGrahas: 'Devaguru Guru (Wisdom) & Chandra (Emotional Bond)',
        currentSituation: {
          headline: 'Domestic Responsibilities & Subconscious Emotional Fatigue',
          description: `With Lagna in ${lagnaRasiObj.sanskritName} and Moon in ${moonRasiObj.sanskritName}, the 2nd and 4th Bhavas reflect high devotion to domestic well-being, but active transits create temporary communication gaps. You often shoulder disproportionate household burdens without verbalizing your personal exhaustion.`,
          specificProblems: [
            'Minor conversational friction caused by misinterpreted tones during stressful workdays',
            'Divergent perspectives on financial priorities or long-term household investments',
            'Emotional fatigue from acting as the family anchor and conflict mediator',
          ],
          severity: 'Moderate',
        },
        futureEffects: {
          goodEffects: [
            'Approaching Jupiter trine ingress heralds joyful family celebrations and reconciliation of past misunderstandings',
            'Maternal health stabilizes and elder family members extend wholehearted blessings and strategic support',
            'Shared family asset appreciation brings collective domestic pride and financial security',
          ],
          badEffects: [
            'Vulnerable period during forthcoming nodal Mars transits: Risk of heated arguments over minor household boundaries',
            'Periodic anxiety regarding children or younger siblings needing urgent attention',
          ],
          timelineForecast: '6-Month Outlook: Progressive harmony peaking in Q3/Q4 with substantial domestic peace.',
        },
        guidanceAndPrecautions: {
          actionableGuidance: [
            'Institute a dedicated weekly family meal without smartphones or professional distractions',
            'Practice conscious pause before replying to emotional inquiries; allow 10 seconds before speaking',
            'Acknowledge and praise family contributions openly rather than focusing only on pending tasks',
          ],
          precautions: [
            'Strictly avoid bringing contentious financial discussions to the dining table or late at night',
            'Do not act as a unilateral judge in disputes between other family members; encourage direct dialogue',
          ],
          vedicUpay: 'Light a pure cow-ghee lamp in the Northeast (Ishanya) corner at dusk and chant "Om Namo Bhagavate Vasudevaya" 11 times.',
        },
      },

      // 2. RELATIVES
      {
        id: 'relatives',
        label: 'Relatives & Kinship',
        sanskritTitle: 'बंधु व ज्ञाति जन (Bandhu & Jnati)',
        icon: Heart,
        themeColor: 'text-amber-800',
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-950',
        governingBhavas: '3rd House (Bhratri/Siblings) & 4th House (Maternal Kin)',
        karakaGrahas: 'Mangal (Siblings/Courage) & Budha (Peers/Cousins)',
        currentSituation: {
          headline: 'Superficial Politeness Masking Underlying Competitive Tensions',
          description: `The 3rd and 4th houses indicate that while relationships with extended relatives appear peaceful on the surface, unspoken competitive comparisons exist. Distant relatives frequently monitor your lifestyle, career strides, and asset acquisitions with covert curiosity.`,
          specificProblems: [
            'Unsolicited advice regarding personal life decisions from elder relatives or distant in-laws',
            'Expectations of financial or logistical favors without reciprocal appreciation or boundaries',
            'Subtle hearsay or family gossip misrepresenting your intentions to third parties',
          ],
          severity: 'Manageable',
        },
        futureEffects: {
          goodEffects: [
            'Favorable Mercury transit clears historical misunderstandings with maternal cousins and siblings',
            'Collaborative family religious ceremonies restore mutual warmth and ancestral unity',
            'Unexpected support from an influential relative during an institutional or career juncture',
          ],
          badEffects: [
            'Potential property or inheritance boundary debates during upcoming Saturn-Mars transit squares',
            'Disappointment if lending money to relatives without formal written terms',
          ],
          timelineForecast: '9-Month Outlook: Guarded cordiality advised; major social unity observed during festival seasons.',
        },
        guidanceAndPrecautions: {
          actionableGuidance: [
            'Maintain a warm, polite demeanor while keeping private financial figures and career moves confidential',
            'Celebrate relatives milestones genuinely without comparing timelines or achievements',
            'Set gentle, unambiguous boundaries regarding your personal schedule and household space',
          ],
          precautions: [
            'Never lend significant capital to extended relatives without legal documentation or collateral',
            'Refrain from venting grievances in family group chats or through common intermediaries',
          ],
          vedicUpay: 'Feed soaked green moong dal or fresh green grass to cows on Wednesdays to dissolve kinship jealousy and Budha-dosha.',
        },
      },

      // 3. HOME & PROPERTY
      {
        id: 'home',
        label: 'Home & Real Estate',
        sanskritTitle: 'गृह, भूमि व वास्तु (Griha & Vastu)',
        icon: Home,
        themeColor: 'text-emerald-800',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
        governingBhavas: '4th House (Bhoomi & Sukha) & 12th House (Relocation)',
        karakaGrahas: 'Mangal (Land/Bhoomi) & Shukra (Comfort/Architecture)',
        currentSituation: {
          headline: 'Domestic Restlessness & Subtle Spatial/Vastu Energy Stagnation',
          description: `Your 4th house governs physical living comfort. Currently, accumulated clutter or minor maintenance backlogs (plumbing, lighting, air ventilation) cause subtle energetic friction. You may periodically feel restless in your current living quarters or desire spatial upgrading.`,
          specificProblems: [
            'Recurring maintenance hassles or delayed contractor repairs causing domestic irritation',
            'Energy drainage in the bedroom due to electromagnetic devices or cluttered storage under beds',
            'Indecision between renovating existing premises versus purchasing a new residential unit',
          ],
          severity: 'Noticeable',
        },
        futureEffects: {
          goodEffects: [
            'Bhoomi Karaka Yoga activation: Exceptional window to acquire prime residential land, villas, or modern apartments',
            'Substantial capital appreciation of existing fixed real estate holdings over the next 12 months',
            'Successful home beautification and interior enhancement that elevates household peace and prestige',
          ],
          badEffects: [
            'Risk of contractor delays and cost overruns if commencing structural renovations during retrograde cycles',
            'Documentation ambiguities or delayed municipal approvals if rushing purchases during Amavasya',
          ],
          timelineForecast: '12-Month Outlook: Prime acquisition and interior elevation window starting within 3 to 6 months.',
        },
        guidanceAndPrecautions: {
          actionableGuidance: [
            'Declutter the Northeast (Ishanya) and center (Brahmasthan) zones of the residence immediately',
            'Ensure the sleeping head direction is strictly South or East for deep REM sleep and cellular rejuvenation',
            'Conduct structural property inspections thoroughly before entering binding financial agreements',
          ],
          precautions: [
            'Never sign property registry deeds or take possession of a house during Rahu Kaal or on Saturdays',
            'Avoid heavy metallic junk or broken mirrors in the North/Northwest sectors of the residence',
          ],
          vedicUpay: 'Sprinkle water infused with raw turmeric and sea-salt at all four corners of the house on Thursdays, and place a brass Vastu turtle facing North.',
        },
      },

      // 4. HEALTH & WEALTH ("EARLTH")
      {
        id: 'health_wealth',
        label: 'Health & Wealth (Swasthya & Dhana)',
        sanskritTitle: 'स्वास्थ्य व धन-समृद्धि (Swasthya & Dhana)',
        icon: TrendingUp,
        themeColor: 'text-indigo-800',
        badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
        governingBhavas: '1st (Tanu/Vitality), 2nd (Dhana), 6th (Roga), 11th (Labha)',
        karakaGrahas: 'Surya (Vitality/Atma), Guru & Shukra (Prosperity/Treasury)',
        currentSituation: {
          headline: 'High Earning Velocity Counterbalanced by Lifestyle Stress & Expenditure Leaks',
          description: `Your natal configuration generates formidable Dhana Yoga compounding, but high professional demands create physiological strain. Earning capacity is robust, yet wealth leaks through impulsive convenience spending, while physical vitality suffers from erratic sleep and prolonged screen fatigue.`,
          specificProblems: [
            'Digestive Pitta aggravation (acid reflux, sluggish metabolism) caused by late meals and cognitive pressure',
            'Cervical neck stiffness and lower back strain from prolonged posture in front of digital monitors',
            'Cashflow friction where high gross receivables are momentarily locked in illiquid or delayed payments',
          ],
          severity: 'Noticeable',
        },
        futureEffects: {
          goodEffects: [
            'Dhana Yoga Multiplier surge: Exponential wealth accumulation through high-margin business, equities, and salary hikes',
            'Restoration of metabolic stamina and physical endurance under supportive solar transit aspects',
            'Liquidation of legacy debt or unlocking of sudden inherited/speculative gains via Indu Lagna activation',
          ],
          badEffects: [
            'Vulnerability to unexpected medical diagnostic expenses during seasonal transit shifts if preventive checkups are skipped',
            'Risk of market retracements if over-leveraging margin capital in volatile speculative instruments',
          ],
          timelineForecast: '12-Month Outlook: Golden financial acceleration window; physical vitality demands scheduled workouts and clean diet.',
        },
        guidanceAndPrecautions: {
          actionableGuidance: [
            'Adopt Ayurvedic Dinacharya: Drink warm copper-charged water at dawn and finish dinner strictly before 8 PM',
            'Automate wealth allocation: Route 30% of incoming surplus capital directly into fixed land, gold, or index funds before discretionary spending',
            'Dedicate 20 minutes daily to Surya Namaskar and Nadi Shodhana pranayama to balance nervous Vata energy',
          ],
          precautions: [
            'Avoid speculative high-leverage day-trading during Moon-Rahu conjunctions or eclipse windows',
            'Do not ignore persistent dental, spine, or eye fatigue; address minor symptoms proactively',
          ],
          vedicUpay: 'Chant the Maha Mrityunjaya Mantra 11 times at sunrise facing East for health immunity, and offer yellow flowers to Vishnu on Thursdays for treasury growth.',
        },
      },

      // 5. EDUCATION & INTELLECT
      {
        id: 'education',
        label: 'Education & Intellect',
        sanskritTitle: 'विद्या, बुद्धि व अध्ययन (Vidya & Buddhi)',
        icon: GraduationCap,
        themeColor: 'text-purple-800',
        badgeBg: 'bg-purple-50 border-purple-200 text-purple-950',
        governingBhavas: '4th (Foundational Vidya), 5th (Buddhi/Exams), 9th (Higher Wisdom)',
        karakaGrahas: 'Budha (Analytical Wit/Scholarship) & Guru (Higher Dharma)',
        currentSituation: {
          headline: 'Sharp Native Intellect Challenged by Information Overload & Multitasking',
          description: `Your 5th house confers high conceptual intelligence, analytical clarity, and strong problem-solving reflexes. However, current Mercurial transits create attention fragmentation. You often pursue multiple intellectual avenues simultaneously, leading to unfinished certifications or study fatigue.`,
          specificProblems: [
            'Digital distraction and micro-interruptions eroding deep focus during technical study sessions',
            'Periodic imposter syndrome or self-critique prior to high-stakes examinations or competitive presentations',
            'Difficulty balancing urgent operational work with long-term strategic learning and credentialing',
          ],
          severity: 'Moderate',
        },
        futureEffects: {
          goodEffects: [
            'Budhaditya Yoga activation in Kendra Bhavas: Exceptional retention, rapid mastery of complex systems, and stellar exam marks',
            'Prestigious executive certifications, institutional awards, and invitations to deliver keynote/advisory papers',
            'Seamless clearing of competitive selections, corporate interviews, or overseas academic fellowship applications',
          ],
          badEffects: [
            'Temporary exam anxiety or memory blocks if attempting to cram curriculum without adequate restorative sleep',
            'Frustration with slow institutional administrative responses regarding transcripts or admissions',
          ],
          timelineForecast: '9-Month Outlook: Peak intellectual prowess and academic distinction; optimal study window during morning hours.',
        },
        guidanceAndPrecautions: {
          actionableGuidance: [
            'Position your study desk strictly facing East or North with clear natural daylight illumination',
            'Employ Pomodoro technique (45 minutes deep study, 10 minutes walk without screens) for memory consolidation',
            'Focus on completing one accredited qualification fully before opening secondary study materials',
          ],
          precautions: [
            'Do not change study strategy, reference books, or core mentors right before test dates',
            'Avoid studying in bed or reclining postures, as this dulls mental alertness and induces tamasic lethargy',
          ],
          vedicUpay: 'Keep a Saraswati Yantra or image on the study table, and recite the Saraswati Gayatri Mantra 7 times every morning before beginning study.',
        },
      },
    ];
  }, [lagnaRasiObj, moonRasiObj, natalPlanets]);

  const filteredObservations = useMemo(() => {
    if (selectedDomain === 'all') return observationsData;
    return observationsData.filter((obs) => obs.id === selectedDomain);
  }, [selectedDomain, observationsData]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200/90 shadow-3xs overflow-hidden space-y-3">
      {/* Header Bar */}
      <div className="px-3 py-2.5 bg-gradient-to-r from-amber-50/90 via-[#FAF8F5] to-white border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="font-vedic font-black text-stone-950 text-[16px] tracking-tight">
              Astrological Readings &amp; Observations Dossier
            </h3>
          </div>
          <p className="text-[12px] text-stone-600 leading-snug">
            Comprehensive diagnostic readings across <strong className="text-stone-800">Family, Relatives, Home, Health/Wealth &amp; Education</strong> with current problems, future effects, and Vedic guidance.
          </p>
        </div>

        {/* Natal Lagna & Moon Badge */}
        <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-950 bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded shrink-0">
          <span>Lagna: {lagnaRasiObj.sanskritName}</span>
          <span>•</span>
          <span>Moon: {moonRasiObj.sanskritName}</span>
        </div>
      </div>

      {/* Domain Selector Deck */}
      <div className="px-3 pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDomain('all')}
            className={`p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
              selectedDomain === 'all'
                ? 'bg-stone-900 text-white border-stone-950 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200/80 hover:bg-[#FAF8F5] hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Layers className={`w-3.5 h-3.5 ${selectedDomain === 'all' ? 'text-amber-200' : 'text-stone-500'}`} />
              <span className="text-[9.5px] uppercase font-bold tracking-wider opacity-80">Overview</span>
            </div>
            <div className="mt-1">
              <span className="font-bold text-[11.5px] block truncate">All 5 Domains</span>
              <span className={`text-[10px] block ${selectedDomain === 'all' ? 'text-amber-200/80' : 'text-stone-500'}`}>
                Full Reading
              </span>
            </div>
          </button>

          {observationsData.map((obs) => {
            const Icon = obs.icon;
            const isSelected = selectedDomain === obs.id;
            return (
              <button
                key={obs.id}
                type="button"
                onClick={() => setSelectedDomain(obs.id)}
                className={`p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200/80 hover:bg-[#FAF8F5] hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-200' : obs.themeColor}`} />
                  <span className="text-[9.5px] uppercase font-bold tracking-wider opacity-80 truncate">
                    {obs.currentSituation.severity}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="font-bold text-[11.5px] block truncate">
                    {obs.label}
                  </span>
                  <span className={`text-[10px] block truncate ${isSelected ? 'text-amber-200/80' : 'text-stone-500'}`}>
                    {obs.sanskritTitle.split('(')[0].trim()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Filter Lens: All vs Problems vs Future Effects vs Guidance */}
      <div className="px-3 flex items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <span className="text-stone-500 font-bold mr-1">Section View:</span>
          {[
            { id: 'all', label: 'All 3 Pillars Overlaid' },
            { id: 'problems', label: '🔴 Current Situation & Problems' },
            { id: 'future', label: '🟡 Future Good & Bad Effects' },
            { id: 'guidance', label: '🟢 Suggestions, Guidance & Precautions' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveTabType(mode.id as any)}
              className={`px-2 py-0.5 rounded border font-semibold cursor-pointer transition-all ${
                activeTabType === mode.id
                  ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-3xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <span className="text-[10.5px] text-stone-500 font-medium hidden sm:inline">
          Scroll down to inspect individual domain dossiers
        </span>
      </div>

      {/* Scrollable Container with Visible Scrollbar (prevents endless long web page) */}
      <div className="px-3 pb-3">
        <div className="max-h-[620px] overflow-y-auto pr-2 space-y-4 rounded-lg border border-stone-200/70 p-2.5 bg-[#FCFAF7] scrollbar-thin scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400 scrollbar-track-stone-100 shadow-inner">
          {filteredObservations.map((obs) => {
            const Icon = obs.icon;
            return (
              <div
                key={obs.id}
                className="bg-white rounded-lg border border-stone-200 shadow-3xs overflow-hidden space-y-2.5 p-3 sm:p-3.5 transition-all"
              >
                {/* Domain Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-vedic font-black text-stone-950 text-[15px] leading-tight">
                        {obs.label} • {obs.sanskritTitle}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium">
                        Bhavas: {obs.governingBhavas} | Karakas: {obs.karakaGrahas}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${obs.badgeBg}`}>
                    Severity Index: {obs.currentSituation.severity}
                  </span>
                </div>

                {/* 3 Pillars Grid */}
                <div className="space-y-3">
                  {/* PILLAR 1: CURRENT SITUATION & PROBLEMS */}
                  {(activeTabType === 'all' || activeTabType === 'problems') && (
                    <div className="bg-rose-50/50 rounded-lg border border-rose-200/80 p-2.5 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-rose-950 font-bold text-[12px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                        <span className="uppercase tracking-wider font-vedic text-[11px]">
                          1. Current Situation &amp; Active Problems:
                        </span>
                        <span className="font-semibold text-rose-900 text-[11px] truncate">
                          ({obs.currentSituation.headline})
                        </span>
                      </div>
                      <p className="text-[12px] text-stone-700 leading-snug">
                        {obs.currentSituation.description}
                      </p>
                      <div className="space-y-1 pt-1">
                        <span className="text-[10.5px] font-bold text-rose-900 block uppercase tracking-wide">
                          Active Symptoms &amp; Karmic Friction Points:
                        </span>
                        <ul className="space-y-1 text-[11.5px] text-stone-800">
                          {obs.currentSituation.specificProblems.map((prob, idx) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{prob}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* PILLAR 2: FUTURE GOOD & BAD EFFECTS */}
                  {(activeTabType === 'all' || activeTabType === 'future') && (
                    <div className="bg-amber-50/50 rounded-lg border border-amber-200/80 p-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-1 text-amber-950 font-bold text-[12px]">
                        <div className="flex items-center space-x-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                          <span className="uppercase tracking-wider font-vedic text-[11px]">
                            2. Future Good &amp; Bad Effects:
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                          {obs.futureEffects.timelineForecast}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px]">
                        {/* Good Effects */}
                        <div className="bg-white rounded p-2 border border-emerald-200/90 space-y-1">
                          <span className="text-[10.5px] font-bold text-emerald-950 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Auspicious Future Effects (Good):</span>
                          </span>
                          <ul className="space-y-1 text-stone-800">
                            {obs.futureEffects.goodEffects.map((good, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <span className="text-emerald-700 font-bold">•</span>
                                <span className="leading-tight">{good}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Bad / Challenging Effects */}
                        <div className="bg-white rounded p-2 border border-rose-200/90 space-y-1">
                          <span className="text-[10.5px] font-bold text-rose-950 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Vulnerabilities &amp; Challenges (Bad):</span>
                          </span>
                          <ul className="space-y-1 text-stone-800">
                            {obs.futureEffects.badEffects.map((bad, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <span className="text-rose-700 font-bold">•</span>
                                <span className="leading-tight">{bad}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PILLAR 3: SUGGESTIONS, GUIDANCE & PRECAUTIONS */}
                  {(activeTabType === 'all' || activeTabType === 'guidance') && (
                    <div className="bg-emerald-50/50 rounded-lg border border-emerald-200/80 p-2.5 space-y-2">
                      <div className="flex items-center space-x-1.5 text-emerald-950 font-bold text-[12px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="uppercase tracking-wider font-vedic text-[11px]">
                          3. Actionable Suggestions, Guidance &amp; Precautions:
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px]">
                        {/* Actionable Guidance */}
                        <div className="bg-white rounded p-2 border border-emerald-200/90 space-y-1">
                          <span className="text-[10.5px] font-bold text-emerald-950 block">
                            💡 Strategic Actionable Counsel:
                          </span>
                          <ul className="space-y-1 text-stone-800">
                            {obs.guidanceAndPrecautions.actionableGuidance.map((g, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <span className="text-emerald-700 font-bold">✓</span>
                                <span className="leading-tight">{g}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Critical Precautions */}
                        <div className="bg-white rounded p-2 border border-amber-200/90 space-y-1">
                          <span className="text-[10.5px] font-bold text-amber-950 block">
                            ⚠️ Critical Precautions &amp; Red Lines:
                          </span>
                          <ul className="space-y-1 text-stone-800">
                            {obs.guidanceAndPrecautions.precautions.map((p, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <span className="text-amber-700 font-bold">✕</span>
                                <span className="leading-tight">{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Vedic Upay Remedy Box */}
                      <div className="bg-white p-2 rounded border border-amber-300 text-[11.5px] flex items-start space-x-2">
                        <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-950 font-vedic">Classical Vedic Upay:</strong>{' '}
                          <span className="text-stone-800">{obs.guidanceAndPrecautions.vedicUpay}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
