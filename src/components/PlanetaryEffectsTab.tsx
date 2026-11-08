import React, { useState, useMemo, useRef } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Compass,
  Award,
  Shield,
  Layers,
  BookOpen,
  Info,
  Flame,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Search,
  Scale,
  Activity,
  Heart,
  Briefcase,
  User,
  Star,
  RefreshCw,
  Zap,
  ArrowUp,
  SlidersHorizontal,
  Bookmark,
  Eye,
  Check,
  Filter,
} from 'lucide-react';
import { UserProfile, PlanetPosition, HouseInfo } from '../types';
import { GRAHA_EFFECTS_DATA, GrahaDetail, GrahaHouseEffect } from '../data/planetaryEffectsData';
import { VEDIC_RASIS } from '../data';
import { NorthIndianChart } from './NorthIndianChart';

interface PlanetaryEffectsTabProps {
  activeProfile?: UserProfile;
  profiles?: UserProfile[];
  natalPlanets?: PlanetPosition[];
  natalHouses?: HouseInfo[];
  lagnaRasi?: number;
  onNavigateToBirthCharts?: () => void;
  onNavigateToDasha?: () => void;
  onNavigateToUpay?: () => void;
}

interface AiPlanetaryResponse {
  headline: string;
  summary: string;
  lifeDomainEffects: { domain: string; effect: string }[];
  specialStrengths: string[];
  potentialChallenges: string[];
  remedies: string[];
  researchCitations: string[];
}

// Vedic House metadata for intuitive navigation and labeling
const VEDIC_HOUSES_META = [
  { num: 1, vedicName: 'Tanu Bhava (तनु भाव)', shortName: '1st: Self & Vitality', category: 'Kendra & Trikona', icon: User, domain: 'Self, Physique, Aura & Lifespan' },
  { num: 2, vedicName: 'Dhana Bhava (धन भाव)', shortName: '2nd: Wealth & Speech', category: 'Dhana & Maraka', icon: Briefcase, domain: 'Family Wealth, Speech, Lineage & Diet' },
  { num: 3, vedicName: 'Sahaja Bhava (सहज भाव)', shortName: '3rd: Courage & Drive', category: 'Upachaya', icon: Flame, domain: 'Siblings, Valor, Writing & Communication' },
  { num: 4, vedicName: 'Sukha Bhava (सुख भाव)', shortName: '4th: Home & Mother', category: 'Kendra', icon: Heart, domain: 'Mother, Real Estate, Vehicles & Inner Peace' },
  { num: 5, vedicName: 'Putra Bhava (पुत्र भाव)', shortName: '5th: Intellect & Progeny', category: 'Trikona', icon: Sparkles, domain: 'Children, Wisdom, Mantras, Romance & Past Karma' },
  { num: 6, vedicName: 'Shatru Bhava (शत्रु भाव)', shortName: '6th: Health & Victory', category: 'Upachaya & Dusthana', icon: Shield, domain: 'Litigation, Enemies, Diseases, Debts & Service' },
  { num: 7, vedicName: 'Yuvati Bhava (युवति भाव)', shortName: '7th: Marriage & Spouse', category: 'Kendra & Maraka', icon: Heart, domain: 'Spouse, Partnerships, Public Standing & Commerce' },
  { num: 8, vedicName: 'Randhra Bhava (रन्ध्र भाव)', shortName: '8th: Longevity & Occult', category: 'Dusthana', icon: Compass, domain: 'Longevity, Transformation, Hidden Wealth & Occult' },
  { num: 9, vedicName: 'Bhagya Bhava (भाग्य भाव)', shortName: '9th: Fortune & Dharma', category: 'Trikona', icon: Award, domain: 'Luck, Father, Guru, Higher Truth & Pilgrimage' },
  { num: 10, vedicName: 'Karma Bhava (कर्म भाव)', shortName: '10th: Career & Status', category: 'Kendra & Upachaya', icon: Briefcase, domain: 'Profession, Leadership, Fame & Executive Power' },
  { num: 11, vedicName: 'Labha Bhava (लाभ भाव)', shortName: '11th: Gains & Desires', category: 'Upachaya', icon: Zap, domain: 'Income, Big Ambitions, Social Circle & Elder Siblings' },
  { num: 12, vedicName: 'Vyaya Bhava (व्यय भाव)', shortName: '12th: Moksha & Foreign', category: 'Dusthana & Moksha', icon: Compass, domain: 'Spiritual Liberation, Foreign Lands, Expenses & Solitude' },
];

const TOPIC_FILTERS = [
  { key: 'all', label: 'All Topics' },
  { key: 'career', label: 'Career & Authority', keywords: ['career', 'profession', 'leadership', 'job', 'work', 'status', 'fame', 'executive', 'business'] },
  { key: 'wealth', label: 'Wealth & Assets', keywords: ['wealth', 'financial', 'money', 'property', 'land', 'income', 'gains', 'assets', 'inheritance'] },
  { key: 'marriage', label: 'Love & Marriage', keywords: ['spouse', 'marriage', 'partner', 'romantic', 'relationships', 'family', 'marital'] },
  { key: 'health', label: 'Health & Immunity', keywords: ['health', 'immunity', 'physical', 'stamina', 'vitality', 'disease', 'illness', 'body'] },
  { key: 'spirituality', label: 'Spiritual & Moksha', keywords: ['spiritual', 'moksha', 'meditation', 'mantra', 'dharma', 'occult', 'guru', 'divine'] },
  { key: 'children', label: 'Children & Education', keywords: ['children', 'progeny', 'education', 'intellect', 'academic', 'wisdom', 'study'] },
];

export function PlanetaryEffectsTab({
  activeProfile,
  profiles = [],
  natalPlanets = [],
  natalHouses = [],
  lagnaRasi = 1,
  onNavigateToBirthCharts,
  onNavigateToDasha,
  onNavigateToUpay,
}: PlanetaryEffectsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'seeker_planets' | 'encyclopedia' | 'friendship_matrix' | 'ai_consultation'
  >('encyclopedia');

  // Encyclopedia Article Mode
  const [selectedGrahaKey, setSelectedGrahaKey] = useState<string>('Surya');
  const [articleReadingMode, setArticleReadingMode] = useState<'continuous' | 'single_house'>('continuous');
  const [selectedHouseNum, setSelectedHouseNum] = useState<number>(1);
  const [houseCategoryFilter, setHouseCategoryFilter] = useState<'all' | 'kendra' | 'trikona' | 'upachaya' | 'dusthana'>('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedArticleHouses, setExpandedArticleHouses] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: true,
    7: true, 8: true, 9: true, 10: true, 11: true, 12: true,
  });

  // Seeker's Active Chart View States
  const [seekerCategoryFilter, setSeekerCategoryFilter] = useState<'all' | 'kendra' | 'trikona' | 'upachaya' | 'dusthana'>('all');
  const [expandedSeekerGrahas, setExpandedSeekerGrahas] = useState<Record<string, boolean>>({
    Surya: true, Chandra: true, Mangal: true, Guru: true, Shani: true,
  });

  // AI Deep Dive Query State
  const [aiPlanetSelect, setAiPlanetSelect] = useState<string>('Surya');
  const [aiCustomQuery, setAiCustomQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<AiPlanetaryResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const articleTopRef = useRef<HTMLDivElement>(null);

  const lagnaRasiInfo = VEDIC_RASIS[lagnaRasi - 1] || VEDIC_RASIS[0];
  const activeGrahaDetail = GRAHA_EFFECTS_DATA[selectedGrahaKey] || GRAHA_EFFECTS_DATA['Surya'];

  // Identify where activeGraha is located in the seeker's chart
  const seekerPlacementOfActiveGraha = useMemo(() => {
    return natalPlanets.find((p) => p.name === selectedGrahaKey);
  }, [natalPlanets, selectedGrahaKey]);

  // Map natal planets to GrahaDetails + Kundali House Info
  const seekerKundaliPlanets = useMemo(() => {
    const list: Array<{
      planet: PlanetPosition;
      grahaDetail: GrahaDetail;
      houseEffect: GrahaHouseEffect;
      houseInfo?: HouseInfo;
      houseMeta: typeof VEDIC_HOUSES_META[0];
    }> = [];

    natalPlanets.forEach((p) => {
      if (p.name === 'Lagna') return;
      const key = p.name as string;
      const detail = GRAHA_EFFECTS_DATA[key];
      if (detail) {
        const hNum = p.house || 1;
        const effect = detail.houseEffects[hNum] || {
          title: `${detail.hindiName} in House ${hNum}`,
          description: `Placement of ${detail.englishName} in House ${hNum} activates the corresponding Bhava significations.`,
          positiveEffects: ['Focuses energy on this life domain'],
          challengingEffects: ['Requires conscious balance'],
          vedicRemedy: `Chant ${detail.beejMantra}`,
        };
        const hInfo = natalHouses.find((h) => h.houseNumber === hNum);
        const hMeta = VEDIC_HOUSES_META.find((m) => m.num === hNum) || VEDIC_HOUSES_META[0];
        list.push({
          planet: p,
          grahaDetail: detail,
          houseEffect: effect,
          houseInfo: hInfo,
          houseMeta: hMeta,
        });
      }
    });

    return list;
  }, [natalPlanets, natalHouses]);

  // Filtered Seeker Planets
  const filteredSeekerPlanets = useMemo(() => {
    if (seekerCategoryFilter === 'all') return seekerKundaliPlanets;
    if (seekerCategoryFilter === 'kendra') {
      return seekerKundaliPlanets.filter((item) => [1, 4, 7, 10].includes(item.planet.house));
    }
    if (seekerCategoryFilter === 'trikona') {
      return seekerKundaliPlanets.filter((item) => [1, 5, 9].includes(item.planet.house));
    }
    if (seekerCategoryFilter === 'upachaya') {
      return seekerKundaliPlanets.filter((item) => [3, 6, 10, 11].includes(item.planet.house));
    }
    if (seekerCategoryFilter === 'dusthana') {
      return seekerKundaliPlanets.filter((item) => [6, 8, 12].includes(item.planet.house));
    }
    return seekerKundaliPlanets;
  }, [seekerKundaliPlanets, seekerCategoryFilter]);

  // Filtered Houses for the Article
  const filteredArticleHouses = useMemo(() => {
    let houses = VEDIC_HOUSES_META;

    if (houseCategoryFilter === 'kendra') {
      houses = houses.filter((h) => [1, 4, 7, 10].includes(h.num));
    } else if (houseCategoryFilter === 'trikona') {
      houses = houses.filter((h) => [1, 5, 9].includes(h.num));
    } else if (houseCategoryFilter === 'upachaya') {
      houses = houses.filter((h) => [3, 6, 10, 11].includes(h.num));
    } else if (houseCategoryFilter === 'dusthana') {
      houses = houses.filter((h) => [6, 8, 12].includes(h.num));
    }

    // Filter by Topic
    if (selectedTopicFilter !== 'all') {
      const topicObj = TOPIC_FILTERS.find((t) => t.key === selectedTopicFilter);
      if (topicObj && topicObj.keywords) {
        houses = houses.filter((h) => {
          const effect = activeGrahaDetail.houseEffects[h.num];
          if (!effect) return false;
          const fullText = `${h.domain} ${effect.title} ${effect.description} ${effect.positiveEffects.join(' ')} ${effect.challengingEffects.join(' ')}`.toLowerCase();
          return topicObj.keywords.some((kw) => fullText.includes(kw));
        });
      }
    }

    // Search query filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      houses = houses.filter((h) => {
        const effect = activeGrahaDetail.houseEffects[h.num];
        if (!effect) return false;
        const fullText = `${h.shortName} ${h.domain} ${effect.title} ${effect.description} ${effect.positiveEffects.join(' ')} ${effect.challengingEffects.join(' ')} ${effect.vedicRemedy}`.toLowerCase();
        return fullText.includes(q);
      });
    }

    return houses;
  }, [houseCategoryFilter, selectedTopicFilter, searchQuery, activeGrahaDetail]);

  const toggleAllArticleHouses = (expand: boolean) => {
    const next: Record<number, boolean> = {};
    for (let i = 1; i <= 12; i++) {
      next[i] = expand;
    }
    setExpandedArticleHouses(next);
  };

  const toggleAllSeekerPlanets = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    seekerKundaliPlanets.forEach((item) => {
      next[item.planet.name] = expand;
    });
    setExpandedSeekerGrahas(next);
  };

  const scrollToHouse = (houseNum: number) => {
    setSelectedHouseNum(houseNum);
    const element = document.getElementById(`house-article-section-${houseNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle AI Deep Dive Request
  const handleAiConsultation = async (pName?: string) => {
    setIsLoadingAi(true);
    setAiError(null);
    const targetPlanetKey = pName || aiPlanetSelect;
    const pDetail = GRAHA_EFFECTS_DATA[targetPlanetKey] || GRAHA_EFFECTS_DATA['Surya'];
    const seekerPlanetObj = natalPlanets.find((p) => p.name === targetPlanetKey);

    try {
      const res = await fetch('/api/astrology/planetary-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeProfile?.name || 'Seeker',
          birthDate: activeProfile?.birthDate || '1990-05-18',
          birthTime: activeProfile?.birthTime || '07:30',
          birthPlace: activeProfile?.place || 'New Delhi, India',
          lagnaRasi: lagnaRasiInfo.sanskritName,
          moonRasi: VEDIC_RASIS[(activeProfile as any)?.moonRasi - 1]?.sanskritName || 'Simha',
          planetName: pDetail.title,
          houseNumber: seekerPlanetObj?.house || selectedHouseNum || 1,
          rasiName: seekerPlanetObj?.rasiName || 'Mesha',
          isRetrograde: seekerPlanetObj?.isRetrograde || false,
          nakshatra: seekerPlanetObj?.nakshatra || 'Ashwini',
          dignity: seekerPlanetObj?.dignity || 'Own',
          userQuery: aiCustomQuery,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI planetary analysis');
      }
      setAiResponse(data);
    } catch (err: any) {
      setAiError(err.message || 'Unable to load AI analysis. Showing Parashari dataset.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-3 font-sans text-stone-900 break-words" ref={articleTopRef}>
      {/* Top Banner & Seeker Context Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-50 rounded-lg p-3 shadow-md border border-amber-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-vedic font-black text-[18px] md:text-[20px] text-amber-100 uppercase tracking-wide">
                Planetary Effects on Kundali (ग्रह प्रभाव एवं कुण्डली फल)
              </h2>
            </div>
            <p className="text-[12px] text-amber-200/90 font-medium">
              Authoritative Parashari &amp; Jaimini study on Navagraha placements, Bhava Phala (Houses 1–12), Drishti, Dignity, and Remedies
            </p>
          </div>

          {/* Active Seeker Vitals Pill */}
          <div className="bg-amber-950/90 rounded-md px-3 py-1.5 border border-amber-700/70 text-[11px] flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center space-x-1.5 font-bold text-amber-200">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeProfile?.name || 'Seeker Profile'}</span>
            </div>
            <span className="text-amber-600">•</span>
            <span className="text-amber-300 font-semibold">
              Lagna: <strong>{lagnaRasiInfo.sanskritName}</strong>
            </span>
            <span className="text-amber-600">•</span>
            <span className="text-amber-300 font-semibold">
              Planets Evaluated: <strong>9 Grahas</strong>
            </span>
          </div>
        </div>

        {/* Primary Sub-Tab Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-amber-800/80">
          {[
            {
              id: 'encyclopedia',
              label: '9 Graha Treatise & Encyclopedia (Houses 1–12)',
              icon: BookOpen,
              badge: 'Comprehensive Article',
            },
            {
              id: 'seeker_planets',
              label: `Your Chart's 9 Planets (${activeProfile?.name || 'Seeker'})`,
              icon: Sparkles,
              badge: 'Personalized',
            },
            {
              id: 'friendship_matrix',
              label: 'Graha Maitri & Functional Benefics',
              icon: Scale,
              badge: 'Dignity Matrix',
            },
            {
              id: 'ai_consultation',
              label: 'Ask AI Graha Scholar',
              icon: HelpCircle,
              badge: 'Research Q&A',
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeSubTab === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveSubTab(mode.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-sm font-black'
                    : 'bg-amber-900/60 text-amber-200 border-amber-700/70 hover:bg-amber-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-800' : 'text-amber-300'}`} />
                <span>{mode.label}</span>
                <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                  isActive ? 'bg-amber-200/90 text-amber-900' : 'bg-amber-950/80 text-amber-300'
                }`}>
                  {mode.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: 9 GRAHA TREATISE & ENCYCLOPEDIA (HIGH READABILITY ARTICLE VIEW)
          ===================================================================== */}
      {activeSubTab === 'encyclopedia' && (
        <div className="space-y-3">
          {/* 1. Quick Planet Picker Navigation Bar */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-200/90 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-1.5">
              <span className="font-vedic font-black text-amber-950 text-[13.5px] uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span>Select Planet for Full Article &amp; 12-House Analysis:</span>
              </span>
              <span className="text-[11px] font-bold text-stone-600">
                Current: <strong>{activeGrahaDetail.hindiName} ({activeGrahaDetail.englishName})</strong>
              </span>
            </div>

            {/* 9 Planet Pills with clear Symbols and Names */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {Object.keys(GRAHA_EFFECTS_DATA).map((gKey) => {
                const item = GRAHA_EFFECTS_DATA[gKey];
                const isSelected = selectedGrahaKey === gKey;
                const hasSeekerPlanet = natalPlanets.some((p) => p.name === gKey);

                return (
                  <button
                    key={gKey}
                    type="button"
                    onClick={() => {
                      setSelectedGrahaKey(gKey);
                      setSelectedTopicFilter('all');
                      setSearchQuery('');
                    }}
                    className={`p-1.5 rounded-md border text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 text-amber-950 font-black shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    {hasSeekerPlanet && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600" title="Present in your chart" />
                    )}
                    <div className="text-[16px] leading-none mb-0.5">{item.symbol}</div>
                    <div className="text-[12px] font-bold leading-tight">{item.hindiName}</div>
                    <div className="text-[10px] text-stone-500 font-medium">{item.englishName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Planet Executive Summary Dossier (Magazine / Treatise Style) */}
          <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-100/50 p-3.5 rounded-lg border border-amber-300/90 shadow-2xs space-y-2.5">
            {/* Headline and In-Chart Callout */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-950 flex items-center justify-center font-black text-[18px] border border-amber-300 shadow-3xs">
                    {activeGrahaDetail.symbol}
                  </span>
                  <h3 className="font-vedic font-black text-amber-950 text-[18px] tracking-tight">
                    {activeGrahaDetail.title}
                  </h3>
                </div>
                <p className="text-[12.5px] text-stone-700 font-medium mt-1">
                  <strong>Element:</strong> {activeGrahaDetail.element} • <strong>Nature:</strong> {activeGrahaDetail.nature} • <strong>Gunas:</strong> {activeGrahaDetail.gunas} • <strong>Governs:</strong> {activeGrahaDetail.governsBody}
                </p>
              </div>

              {/* Seeker chart presence highlight */}
              {seekerPlacementOfActiveGraha ? (
                <div className="bg-amber-200/70 border border-amber-400/90 rounded-md px-3 py-1.5 text-[11.5px] font-bold text-amber-950 flex items-center space-x-2 shrink-0 shadow-3xs">
                  <Star className="w-4 h-4 text-amber-800 fill-amber-500" />
                  <div>
                    <span>In Your Kundali: <strong>House {seekerPlacementOfActiveGraha.house} ({seekerPlacementOfActiveGraha.rasiName})</strong></span>
                    <button
                      type="button"
                      onClick={() => scrollToHouse(seekerPlacementOfActiveGraha.house)}
                      className="ml-2 text-amber-900 underline font-black hover:text-black cursor-pointer text-[10.5px]"
                    >
                      Jump to Your Reading ↓
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Classical Attributes Badge Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
              <div className="bg-white/90 p-2 rounded border border-amber-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Own Signs &amp; Moolatrikona</span>
                <span className="font-bold text-amber-950">{activeGrahaDetail.ownSigns.join(', ')}</span>
                <div className="text-[10px] text-stone-600">MT: {activeGrahaDetail.moolatrikona}</div>
              </div>

              <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Exaltation (Ucha)</span>
                <span className="font-bold text-emerald-950">{activeGrahaDetail.exaltationSign}</span>
                <div className="text-[10px] text-emerald-800">Peak dignity &amp; divine fruits</div>
              </div>

              <div className="bg-rose-50/70 p-2 rounded border border-rose-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Debilitation (Neecha)</span>
                <span className="font-bold text-rose-950">{activeGrahaDetail.debilitationSign}</span>
                <div className="text-[10px] text-rose-800">Requires conscious remedies</div>
              </div>

              <div className="bg-amber-100/60 p-2 rounded border border-amber-300 space-y-0.5">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Gemstone &amp; Direction</span>
                <span className="font-bold text-amber-950">{activeGrahaDetail.gemstone}</span>
                <div className="text-[10px] text-stone-600">Direction: {activeGrahaDetail.direction}</div>
              </div>
            </div>

            {/* Sacred Beej Mantra & Karakatvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
              <div className="bg-white/95 p-2.5 rounded border border-amber-200 space-y-1">
                <span className="font-black text-amber-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                  <span>Karakatvas (Core Soul Significations):</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeGrahaDetail.karakaSignifications.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-100/60 p-2.5 rounded border border-amber-300 space-y-1">
                <span className="font-black text-amber-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                  <span>Sacred Parashari Beej Mantra:</span>
                </span>
                <p className="font-vedic font-black text-stone-950 text-[13px] leading-tight">
                  {activeGrahaDetail.beejMantra}
                </p>
                <div className="text-[10.5px] text-stone-600 flex items-center space-x-2">
                  <span>Deity: <strong>{activeGrahaDetail.deity}</strong></span>
                  <span>•</span>
                  <span>Special Drishti: <strong>{activeGrahaDetail.aspectHouses}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Intuitive Article Reader Controls & Jump TOC */}
          <div className="bg-white p-3 rounded-lg border border-amber-200/90 shadow-2xs space-y-2.5">
            {/* View Mode & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-vedic font-black text-amber-950 text-[13.5px] uppercase tracking-wide flex items-center space-x-1">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>Article Chapter Navigation (Houses 1 to 12)</span>
                </span>
                <span className="text-[10.5px] text-stone-500 font-medium">
                  (Showing {filteredArticleHouses.length} of 12 chapters)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Continuous Reading vs Single House Focus Switch */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded border border-stone-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setArticleReadingMode('continuous')}
                    className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      articleReadingMode === 'continuous'
                        ? 'bg-amber-700 text-white shadow-3xs font-black'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    📖 Full Article Flow
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleReadingMode('single_house')}
                    className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      articleReadingMode === 'single_house'
                        ? 'bg-amber-700 text-white shadow-3xs font-black'
                        : 'text-stone-600 hover:text-black'
                    }`}
                  >
                    🗂️ Single House Focus
                  </button>
                </div>

                {articleReadingMode === 'continuous' && (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => toggleAllArticleHouses(true)}
                      className="px-2 py-0.5 rounded bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10.5px] font-bold cursor-pointer"
                    >
                      Expand All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllArticleHouses(false)}
                      className="px-2 py-0.5 rounded bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10.5px] font-bold cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick-Jump House TOC (Table of Contents) with Plain-English Domain Badges */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
                Quick-Jump to Any House Chapter:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                {VEDIC_HOUSES_META.map((h) => {
                  const isSelected = selectedHouseNum === h.num;
                  const isSeekerHouse = seekerPlacementOfActiveGraha?.house === h.num;

                  return (
                    <button
                      key={h.num}
                      type="button"
                      onClick={() => scrollToHouse(h.num)}
                      className={`p-1.5 rounded-md border text-left transition-all cursor-pointer text-[11px] ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 ring-1 ring-amber-400 font-black text-amber-950 shadow-3xs'
                          : isSeekerHouse
                          ? 'bg-amber-50/90 border-amber-300 font-bold text-amber-900'
                          : 'bg-stone-50/80 border-stone-200 text-stone-700 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11.5px]">H{h.num}: {h.vedicName.split(' ')[0]}</span>
                        {isSeekerHouse && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-600 text-white font-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-stone-500 truncate mt-0.5">
                        {h.domain.split(',')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Box & Topic Filters */}
            <div className="pt-1.5 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
              {/* Topic Filters */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10.5px] font-bold text-stone-500 mr-1 flex items-center space-x-1">
                  <Filter className="w-3 h-3 text-stone-500" />
                  <span>Topic:</span>
                </span>
                {TOPIC_FILTERS.map((t) => {
                  const isSelected = selectedTopicFilter === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setSelectedTopicFilter(t.key)}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-700 text-white border-amber-800 font-black shadow-3xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Keyword Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in effects (e.g., job, eye, gold)..."
                  className="w-full pl-8 pr-2.5 py-1 rounded-md border border-stone-200 text-[11.5px] focus:outline-none focus:ring-1 focus:ring-amber-500 bg-[#FAF8F5]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1 text-[11px] text-stone-400 hover:text-black font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================
              ARTICLE CONTENT: CONTINUOUS READING MODE
              ================================================================= */}
          {articleReadingMode === 'continuous' && (
            <div className="space-y-3">
              {filteredArticleHouses.length === 0 ? (
                <div className="bg-amber-50 p-6 rounded-lg text-center border border-amber-200 text-stone-700 space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-700 mx-auto" />
                  <p className="font-bold text-[13px]">No houses matched your topic or search filter.</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedTopicFilter('all'); setSearchQuery(''); }}
                    className="px-3 py-1 rounded bg-amber-700 text-white text-[11.5px] font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredArticleHouses.map((hMeta) => {
                  const houseEffect = activeGrahaDetail.houseEffects[hMeta.num] || {
                    title: `${activeGrahaDetail.hindiName} in House ${hMeta.num}`,
                    description: `General effect of ${activeGrahaDetail.englishName} in House ${hMeta.num}.`,
                    positiveEffects: ['Activates this Bhava domain with planetary energy'],
                    challengingEffects: ['Requires conscious emotional balance'],
                    vedicRemedy: `Chant ${activeGrahaDetail.beejMantra}`,
                  };

                  const isExpanded = expandedArticleHouses[hMeta.num] !== false;
                  const isSeekerHouse = seekerPlacementOfActiveGraha?.house === hMeta.num;

                  return (
                    <article
                      key={hMeta.num}
                      id={`house-article-section-${hMeta.num}`}
                      className={`bg-white rounded-lg border transition-all shadow-2xs overflow-hidden ${
                        isSeekerHouse
                          ? 'border-amber-400 ring-2 ring-amber-300'
                          : 'border-amber-200/80 hover:border-amber-300'
                      }`}
                    >
                      {/* Chapter Header Banner */}
                      <header
                        onClick={() =>
                          setExpandedArticleHouses((prev) => ({
                            ...prev,
                            [hMeta.num]: !isExpanded,
                          }))
                        }
                        className={`p-3 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 transition-colors border-b ${
                          isSeekerHouse
                            ? 'bg-gradient-to-r from-amber-100 via-amber-50 to-white border-amber-300'
                            : 'bg-gradient-to-r from-[#FAF8F5] via-white to-amber-50/40 border-stone-100 hover:bg-amber-50/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-[12.5px] flex items-center justify-center shrink-0 shadow-3xs">
                            H{hMeta.num}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-vedic font-black text-stone-950 text-[15px] tracking-tight">
                                {houseEffect.title}
                              </h4>
                              {isSeekerHouse && (
                                <span className="px-2 py-0.2 rounded bg-amber-600 text-white font-black text-[9.5px] uppercase tracking-wider flex items-center space-x-1 shadow-3xs">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>Your Kundali Placement</span>
                                </span>
                              )}
                              <span className="px-2 py-0.2 rounded bg-amber-100/80 text-amber-950 border border-amber-200 text-[10px] font-bold">
                                {hMeta.category}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-stone-600 font-medium">
                              {hMeta.vedicName} • Governs: {hMeta.domain}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAiPlanetSelect(selectedGrahaKey);
                              setSelectedHouseNum(hMeta.num);
                              setActiveSubTab('ai_consultation');
                              handleAiConsultation(selectedGrahaKey);
                            }}
                            className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-white text-[10.5px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                            title="Ask AI Scholar specific questions on this placement"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Ask AI</span>
                          </button>
                          <ChevronDown
                            className={`w-4 h-4 text-stone-500 transition-transform ${
                              isExpanded ? 'rotate-180 text-amber-800' : ''
                            }`}
                          />
                        </div>
                      </header>

                      {/* Chapter Body Content (Readable Article Flow) */}
                      {isExpanded && (
                        <div className="p-3.5 space-y-3 bg-white text-[13px] leading-relaxed">
                          {/* Core Parashari Treatise Description */}
                          <div className="bg-[#FAF8F5] p-3 rounded-md border border-stone-200/80 text-stone-900 leading-relaxed font-medium">
                            <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block mb-1">
                              Parashari Synthesis &amp; Astrological Dynamics:
                            </span>
                            <p>{houseEffect.description}</p>
                          </div>

                          {/* 2-Column Benefits vs Sensitivities */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {/* Auspicious Siddhis */}
                            <div className="bg-emerald-50/60 p-3 rounded-md border border-emerald-200/90 space-y-1.5">
                              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center space-x-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>Auspicious Parashari Manifestations (शुभ फल)</span>
                              </span>
                              <ul className="space-y-1 text-stone-800 text-[12px]">
                                {houseEffect.positiveEffects.map((pEff, pidx) => (
                                  <li key={pidx} className="flex items-start space-x-1.5 leading-snug">
                                    <span className="text-emerald-700 font-bold text-[14px] leading-none">•</span>
                                    <span>{pEff}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Sensitivities & Cautions */}
                            <div className="bg-rose-50/60 p-3 rounded-md border border-rose-200/90 space-y-1.5">
                              <span className="text-[11px] font-black uppercase tracking-wider text-rose-950 flex items-center space-x-1.5">
                                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                                <span>Karmic Lessons &amp; Cautions (सावधानी एवं दोष)</span>
                              </span>
                              <ul className="space-y-1 text-stone-800 text-[12px]">
                                {houseEffect.challengingEffects.map((cEff, cidx) => (
                                  <li key={cidx} className="flex items-start space-x-1.5 leading-snug">
                                    <span className="text-rose-700 font-bold text-[14px] leading-none">•</span>
                                    <span>{cEff}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Authentic Parashari Vedic Upay Box */}
                          <div className="bg-amber-100/70 p-3 rounded-md border border-amber-300 text-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-3xs">
                            <div className="space-y-0.5">
                              <span className="font-black text-amber-950 uppercase text-[11px] tracking-wider flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                                <span>Prescribed Vedic Upay for House {hMeta.num}:</span>
                              </span>
                              <p className="text-stone-900 font-medium">
                                {houseEffect.vedicRemedy}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setAiPlanetSelect(selectedGrahaKey);
                                setSelectedHouseNum(hMeta.num);
                                setActiveSubTab('ai_consultation');
                                handleAiConsultation(selectedGrahaKey);
                              }}
                              className="px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 self-start sm:self-auto flex items-center space-x-1"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>AI Deep Dive →</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}

              {/* Back to top floating pill */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => articleTopRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11.5px] font-bold transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-amber-800" />
                  <span>Back to Top of Article</span>
                </button>
              </div>
            </div>
          )}

          {/* =================================================================
              ARTICLE CONTENT: SINGLE HOUSE FOCUS CARD VIEW
              ================================================================= */}
          {articleReadingMode === 'single_house' && (
            <div className="space-y-2.5">
              {/* House Tab Bar */}
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1 bg-white p-2 rounded-lg border border-amber-200">
                {VEDIC_HOUSES_META.map((h) => {
                  const isSelected = selectedHouseNum === h.num;
                  const isSeekerHouse = seekerPlacementOfActiveGraha?.house === h.num;
                  return (
                    <button
                      key={h.num}
                      type="button"
                      onClick={() => setSelectedHouseNum(h.num)}
                      className={`p-1.5 rounded text-center transition-all cursor-pointer border text-[11px] ${
                        isSelected
                          ? 'bg-amber-700 text-white border-amber-800 font-black shadow-2xs'
                          : isSeekerHouse
                          ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-amber-50'
                      }`}
                    >
                      <div className="font-bold">H{h.num}</div>
                      <div className="text-[9px] truncate">{h.vedicName.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>

              {/* Single Selected House Card */}
              {(() => {
                const hMeta = VEDIC_HOUSES_META.find((m) => m.num === selectedHouseNum) || VEDIC_HOUSES_META[0];
                const houseEffect = activeGrahaDetail.houseEffects[selectedHouseNum] || {
                  title: `${activeGrahaDetail.hindiName} in House ${selectedHouseNum}`,
                  description: `General effect of ${activeGrahaDetail.englishName} in House ${selectedHouseNum}.`,
                  positiveEffects: ['Activates this Bhava domain with planetary energy'],
                  challengingEffects: ['Requires conscious emotional balance'],
                  vedicRemedy: `Chant ${activeGrahaDetail.beejMantra}`,
                };

                return (
                  <div className="bg-white rounded-lg border border-amber-300 p-4 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 pb-2">
                      <div>
                        <h4 className="font-vedic font-black text-amber-950 text-[17px]">
                          {houseEffect.title}
                        </h4>
                        <p className="text-[12px] text-stone-600 font-medium">
                          {hMeta.vedicName} • {hMeta.domain} ({hMeta.category})
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-950 font-black text-[11px] border border-amber-300 self-start sm:self-auto">
                        House {selectedHouseNum} of 12
                      </span>
                    </div>

                    <div className="bg-[#FAF8F5] p-3 rounded-md border border-stone-200/80 text-[13px] leading-relaxed text-stone-900 font-medium">
                      {houseEffect.description}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]">
                      <div className="bg-emerald-50/60 p-3 rounded-md border border-emerald-200 space-y-1.5">
                        <span className="text-[11.5px] font-black uppercase text-emerald-950 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Positive Fruits &amp; Siddhis (शुभ फल)</span>
                        </span>
                        <ul className="space-y-1 text-stone-800">
                          {houseEffect.positiveEffects.map((p, pidx) => (
                            <li key={pidx} className="flex items-start space-x-1.5">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-rose-50/60 p-3 rounded-md border border-rose-200 space-y-1.5">
                        <span className="text-[11.5px] font-black uppercase text-rose-950 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4 text-rose-700" />
                          <span>Sensitivities &amp; Lessons (सावधानी)</span>
                        </span>
                        <ul className="space-y-1 text-stone-800">
                          {houseEffect.challengingEffects.map((c, cidx) => (
                            <li key={cidx} className="flex items-start space-x-1.5">
                              <span className="text-rose-700 font-bold">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-100/70 p-3 rounded-md border border-amber-300 text-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-black text-amber-950 uppercase text-[11px] flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                          <span>Parashari Upay for House {selectedHouseNum}:</span>
                        </span>
                        <p className="text-stone-900 font-medium">
                          {houseEffect.vedicRemedy}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAiPlanetSelect(selectedGrahaKey);
                          setActiveSubTab('ai_consultation');
                          handleAiConsultation(selectedGrahaKey);
                        }}
                        className="px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 shrink-0 self-start sm:self-auto"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Consult AI Scholar →</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 2: SEEKER'S KUNDALI PLANETS (ACTIVE PROFILE BREAKDOWN)
          ===================================================================== */}
      {activeSubTab === 'seeker_planets' && (
        <div className="space-y-3">
          {/* Header Bar & Quick Links */}
          <div className="bg-[#FAF8F5] rounded-lg p-3 border border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
            <div>
              <h3 className="font-vedic font-black text-stone-950 text-[15px] uppercase tracking-wide flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-amber-800" />
                <span>Navagraha Analysis for {activeProfile?.name || 'Seeker’s Birth Chart'}</span>
              </h3>
              <p className="text-[12px] text-stone-600 font-medium">
                Detailed Parashari effects of all 9 planets in {activeProfile?.name || 'Seeker'}’s Lagna Kundali ({lagnaRasiInfo.sanskritName} Lagna)
              </p>
            </div>

            {/* Quick Actions & Navigation */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {onNavigateToBirthCharts && (
                <button
                  type="button"
                  onClick={onNavigateToBirthCharts}
                  className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>View Full Lagna Chart</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {onNavigateToUpay && (
                <button
                  type="button"
                  onClick={onNavigateToUpay}
                  className="px-2.5 py-1 rounded bg-amber-800 hover:bg-amber-900 text-white font-bold transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Personalized Upay</span>
                </button>
              )}
            </div>
          </div>

          {/* Seeker Filter Bar */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-stone-600 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-stone-500" />
                <span>Filter by House Group:</span>
              </span>
              {[
                { key: 'all', label: 'All 9 Grahas' },
                { key: 'kendra', label: 'Kendras (1, 4, 7, 10)' },
                { key: 'trikona', label: 'Trikonas (1, 5, 9)' },
                { key: 'upachaya', label: 'Upachayas (3, 6, 10, 11)' },
                { key: 'dusthana', label: 'Dusthanas (6, 8, 12)' },
              ].map((grp) => {
                const isSelected = seekerCategoryFilter === grp.key;
                return (
                  <button
                    key={grp.key}
                    type="button"
                    onClick={() => setSeekerCategoryFilter(grp.key as any)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-700 text-white border-amber-800 font-black shadow-3xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {grp.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => toggleAllSeekerPlanets(true)}
                className="px-2 py-0.5 rounded bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10.5px] font-bold cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={() => toggleAllSeekerPlanets(false)}
                className="px-2 py-0.5 rounded bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-[10.5px] font-bold cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Grid Layout: North Indian Chart on Side, Graha Cards on Main Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Column: Compact Kundali Chart Display */}
            <div className="lg:col-span-4 bg-white rounded-lg border border-amber-200/90 p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                <span className="font-vedic font-black text-amber-950 text-[13px] uppercase tracking-wider flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  <span>North Indian Janam Kundali</span>
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {lagnaRasiInfo.sanskritName} Lagna
                </span>
              </div>

              <div className="flex justify-center p-1">
                <NorthIndianChart
                  houses={natalHouses}
                  title="Lagna Kundali"
                  subtitle={`${lagnaRasiInfo.sanskritName} Lagna Chart`}
                />
              </div>

              {/* Quick Planet House Summary Table */}
              <div className="border-t border-stone-100 pt-2 space-y-1">
                <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block">
                  Kundali Placement Summary:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10.5px]">
                  {seekerKundaliPlanets.map(({ planet }) => (
                    <button
                      key={planet.name}
                      type="button"
                      onClick={() => {
                        setExpandedSeekerGrahas((prev) => ({
                          ...prev,
                          [planet.name]: true,
                        }));
                        const el = document.getElementById(`seeker-graha-card-${planet.name}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="px-1.5 py-1 rounded text-left border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer"
                    >
                      <div className="font-bold text-stone-900 flex items-center justify-between">
                        <span>{planet.name}</span>
                        <span className="text-[9.5px] text-amber-800 font-black">H{planet.house}</span>
                      </div>
                      <div className="text-[9.5px] text-stone-500 truncate">
                        {planet.rasiName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Planetary Effect Cards */}
            <div className="lg:col-span-8 space-y-2.5">
              {filteredSeekerPlanets.map(({ planet, grahaDetail, houseEffect, houseInfo, houseMeta }) => {
                const isExpanded = expandedSeekerGrahas[planet.name] !== false;
                const dignityBadge = planet.dignity || 'Standard';

                return (
                  <div
                    key={planet.name}
                    id={`seeker-graha-card-${planet.name}`}
                    className={`bg-white rounded-lg border transition-all shadow-2xs overflow-hidden ${
                      isExpanded
                        ? 'border-amber-400 ring-1 ring-amber-300/80'
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      onClick={() =>
                        setExpandedSeekerGrahas((prev) => ({
                          ...prev,
                          [planet.name]: !isExpanded,
                        }))
                      }
                      className="p-2.5 bg-gradient-to-r from-[#FAF8F5] via-white to-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 cursor-pointer border-b border-stone-100"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-950 flex items-center justify-center font-bold text-[14px] border border-amber-300 shadow-3xs shrink-0">
                          {grahaDetail.symbol}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-vedic font-black text-stone-950 text-[14px]">
                              {grahaDetail.hindiName} ({planet.englishName}) in House {planet.house} ({planet.rasiName})
                            </span>
                            {planet.isRetrograde && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[9.5px] font-black uppercase">
                                Retrograde (Vakra)
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-950 border border-amber-200 text-[10px] font-bold">
                              {dignityBadge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 font-medium">
                            {houseMeta.vedicName} • {planet.nakshatra} Nakshatra (Pada {planet.pada}) • Degree: {planet.degree.toFixed(1)}°
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <span className="text-[10.5px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                          {houseMeta.category}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-180 text-amber-800' : ''}`} />
                      </div>
                    </div>

                    {/* Card Body - Expanded Details */}
                    {isExpanded && (
                      <div className="p-3.5 space-y-2.5 bg-white text-[12.5px] leading-relaxed">
                        {/* Title & Description */}
                        <div className="bg-[#FAF8F5] p-2.5 rounded-md border border-stone-200/80 space-y-1">
                          <span className="font-vedic font-black text-amber-950 text-[13.5px] block">
                            {houseEffect.title}
                          </span>
                          <p className="text-stone-800 leading-snug">
                            {houseEffect.description}
                          </p>
                          {houseInfo && (
                            <p className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60 font-medium">
                              <strong className="text-stone-900">House {planet.house} Significance:</strong> {houseInfo.significance} ({houseInfo.vedicName})
                            </p>
                          )}
                        </div>

                        {/* Positive vs Challenging Effects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-200/80 space-y-1">
                            <span className="text-[11px] font-black uppercase text-emerald-950 tracking-wider flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Auspicious Parashari Results</span>
                            </span>
                            <ul className="space-y-0.5 text-stone-800 text-[11.5px]">
                              {houseEffect.positiveEffects.map((eff, eidx) => (
                                <li key={eidx} className="flex items-start space-x-1 leading-snug">
                                  <span className="text-emerald-700 font-bold">•</span>
                                  <span>{eff}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-rose-50/50 p-2.5 rounded border border-rose-200/80 space-y-1">
                            <span className="text-[11px] font-black uppercase text-rose-950 tracking-wider flex items-center space-x-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>Sensitivities &amp; Lessons</span>
                            </span>
                            <ul className="space-y-0.5 text-stone-800 text-[11.5px]">
                              {houseEffect.challengingEffects.map((eff, eidx) => (
                                <li key={eidx} className="flex items-start space-x-1 leading-snug">
                                  <span className="text-rose-700 font-bold">•</span>
                                  <span>{eff}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Graha Vitals & Specific Upay */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-[11px]">
                          <div className="bg-amber-50/70 p-2 rounded border border-amber-200/80 space-y-0.5">
                            <span className="font-bold text-amber-950 block">Karaka Significations:</span>
                            <p className="text-stone-700 leading-tight">
                              {grahaDetail.karakaSignifications.join(' • ')}
                            </p>
                          </div>

                          <div className="bg-amber-50/70 p-2 rounded border border-amber-200/80 space-y-0.5">
                            <span className="font-bold text-amber-950 block">Drishti (Aspects):</span>
                            <p className="text-stone-700 leading-tight">
                              Casts aspect on <strong>{grahaDetail.aspectHouses}</strong>
                            </p>
                          </div>

                          <div className="bg-amber-100/60 p-2 rounded border border-amber-300 space-y-0.5">
                            <span className="font-black text-amber-950 block flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-amber-800" />
                              <span>Prescribed Vedic Upay:</span>
                            </span>
                            <p className="text-stone-900 font-medium leading-snug">
                              {houseEffect.vedicRemedy}
                            </p>
                          </div>
                        </div>

                        {/* Direct Jump to Encyclopedia Treatise or AI */}
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGrahaKey(planet.name);
                              setSelectedHouseNum(planet.house);
                              setActiveSubTab('encyclopedia');
                              scrollToHouse(planet.house);
                            }}
                            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            Read Full {grahaDetail.hindiName} 12-House Treatise →
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGrahaKey(planet.name);
                              setSelectedHouseNum(planet.house);
                              setAiPlanetSelect(planet.name);
                              setActiveSubTab('ai_consultation');
                              handleAiConsultation(planet.name);
                            }}
                            className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ask AI Scholar about {planet.name} in H{planet.house} →</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: GRAHA MAITRI & FUNCTIONAL BENEFICS / MALEFICS
          ===================================================================== */}
      {activeSubTab === 'friendship_matrix' && (
        <div className="space-y-3">
          {/* Header Card */}
          <div className="bg-white p-3 rounded-lg border border-amber-300/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <span className="font-vedic font-black text-amber-950 text-[15px] uppercase tracking-wider flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-amber-800" />
                <span>Graha Maitri &amp; Functional Benefic/Malefic Matrix ({lagnaRasiInfo.sanskritName} Lagna)</span>
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Parashari Functional Dignity
              </span>
            </div>
            <p className="text-[12px] text-stone-600 font-medium leading-relaxed">
              In Vedic astrology, planetary relationships operate on two distinct levels: <strong>Natural Friendship (Naisargika Maitri)</strong> inherent to their elemental chemistry, and <strong>Functional Roles</strong> determined exclusively by which houses each planet owns relative to your Ascendant ({lagnaRasiInfo.sanskritName} Lagna).
            </p>

            {/* Functional Roles Table for Seeker's Lagna */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[12px]">
              <div className="bg-emerald-50/70 p-3 rounded-md border border-emerald-200 space-y-1">
                <span className="font-black text-emerald-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Functional Benefics for {lagnaRasiInfo.sanskritName}</span>
                </span>
                <p className="text-stone-800 leading-snug">
                  Lagna Lord, 5th Lord, and 9th Lord (Yogakaraka planets) always act as auspicious life protectors and wealth givers for this Lagna.
                </p>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-md border border-amber-200 space-y-1">
                <span className="font-black text-amber-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-amber-700" />
                  <span>Functional Neutrals / Dual Lords</span>
                </span>
                <p className="text-stone-800 leading-snug">
                  Planets owning Kendras without Trikona ownership or neutral house lords act according to their association and planetary dignity.
                </p>
              </div>

              <div className="bg-rose-50/70 p-3 rounded-md border border-rose-200 space-y-1">
                <span className="font-black text-rose-950 uppercase text-[11px] tracking-wider block flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>Functional Malefics / Marakas</span>
                </span>
                <p className="text-stone-800 leading-snug">
                  Lords of Trika Houses (6th, 8th, 12th) and Maraka Houses (2nd, 7th) require conscious remedies and caution during their Dasha.
                </p>
              </div>
            </div>
          </div>

          {/* Classical Naisargika Maitri (Natural Friendship Table) */}
          <div className="bg-white p-3.5 rounded-lg border border-amber-200/90 shadow-2xs space-y-2">
            <span className="font-vedic font-black text-stone-950 text-[14px] uppercase tracking-wider block border-b border-stone-100 pb-1.5">
              Naisargika Maitri (Natural Planetary Relationships in Vedic Astrology)
            </span>

            <div className="overflow-x-auto text-[11.5px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 text-amber-950 font-black border-b border-amber-300">
                    <th className="p-2.5">Graha</th>
                    <th className="p-2.5">Mitra (Friends)</th>
                    <th className="p-2.5">Sama (Neutrals)</th>
                    <th className="p-2.5">Shatru (Enemies)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Surya (Sun)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Chandra, Mangal, Guru</td>
                    <td className="p-2.5 text-stone-700">Budha</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Shukra, Shani, Rahu, Ketu</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Chandra (Moon)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Surya, Budha</td>
                    <td className="p-2.5 text-stone-700">Mangal, Guru, Shukra, Shani</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Rahu, Ketu (No natural enemy otherwise)</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Mangal (Mars)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Surya, Chandra, Guru</td>
                    <td className="p-2.5 text-stone-700">Shukra, Shani</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Budha, Rahu, Ketu</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Budha (Mercury)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Surya, Shukra</td>
                    <td className="p-2.5 text-stone-700">Mangal, Guru, Shani</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Chandra</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Guru (Jupiter)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Surya, Chandra, Mangal</td>
                    <td className="p-2.5 text-stone-700">Shani</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Budha, Shukra</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Shukra (Venus)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Budha, Shani, Rahu, Ketu</td>
                    <td className="p-2.5 text-stone-700">Mangal, Guru</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Surya, Chandra</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Shani (Saturn)</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Budha, Shukra, Rahu</td>
                    <td className="p-2.5 text-stone-700">Guru</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Surya, Chandra, Mangal</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40">
                    <td className="p-2.5 font-bold text-amber-950">Rahu / Ketu</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">Shukra, Shani</td>
                    <td className="p-2.5 text-stone-700">Budha, Guru</td>
                    <td className="p-2.5 text-rose-800 font-semibold">Surya, Chandra, Mangal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 4: ASK AI GRAHA SCHOLAR (INTERACTIVE AI DEEP DIVE)
          ===================================================================== */}
      {activeSubTab === 'ai_consultation' && (
        <div className="space-y-3">
          {/* AI Search Header */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-100/70 p-3.5 rounded-lg border border-amber-300 shadow-2xs space-y-2.5">
            <div className="flex items-center space-x-2 border-b border-amber-200/80 pb-1.5">
              <Sparkles className="w-5 h-5 text-amber-800" />
              <h3 className="font-vedic font-black text-amber-950 text-[16px] uppercase tracking-wide">
                Ask AI Graha Scholar — Planetary Deep Dive &amp; Research
              </h3>
            </div>
            <p className="text-[12.5px] text-stone-700 font-medium">
              Ask AI for specialized research-backed Parashari &amp; Jaimini interpretation of any planet, house placement, conjunction, or aspect in your birth chart.
            </p>

            {/* Input Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <select
                value={aiPlanetSelect}
                onChange={(e) => setAiPlanetSelect(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-amber-300 bg-white font-bold text-[12px] text-amber-950 cursor-pointer shadow-3xs"
              >
                {Object.keys(GRAHA_EFFECTS_DATA).map((gKey) => (
                  <option key={gKey} value={gKey}>
                    {GRAHA_EFFECTS_DATA[gKey].hindiName} ({GRAHA_EFFECTS_DATA[gKey].englishName})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={aiCustomQuery}
                onChange={(e) => setAiCustomQuery(e.target.value)}
                placeholder="e.g., How does Jupiter in 10th house aspecting 2nd house impact wealth and career?"
                className="flex-1 px-3 py-1.5 rounded-md border border-amber-300 bg-white text-[12px] text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-3xs"
              />

              <button
                type="button"
                onClick={() => handleAiConsultation()}
                disabled={isLoadingAi}
                className="px-4 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-bold text-[12px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-2xs shrink-0"
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate AI Insights</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-stone-500 mr-1">Suggested Research Prompts:</span>
              {[
                `How does my ${selectedGrahaKey} affect my career & status?`,
                `What remedies should I perform for ${selectedGrahaKey}?`,
                `Analyze the mutual aspects of ${selectedGrahaKey} with other planets`,
                `What is the Dasha result of ${selectedGrahaKey} for my Lagna?`,
              ].map((pText, pidx) => (
                <button
                  key={pidx}
                  type="button"
                  onClick={() => {
                    setAiCustomQuery(pText);
                    setAiPlanetSelect(selectedGrahaKey);
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-amber-100/70 border border-amber-200 text-stone-800 cursor-pointer font-medium"
                >
                  {pText}
                </button>
              ))}
            </div>
          </div>

          {aiError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] p-2.5 rounded-md font-medium">
              {aiError}
            </div>
          )}

          {/* AI Response Card */}
          {aiResponse && (
            <div className="bg-white rounded-lg border border-amber-300/90 p-4 shadow-sm space-y-3.5">
              <div className="border-b border-amber-200/80 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-vedic font-black text-amber-950 text-[17px]">
                  {aiResponse.headline}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 text-[10px] font-black border border-amber-300 self-start sm:self-auto">
                  AI Parashari Synthesis
                </span>
              </div>

              <p className="text-[13px] text-stone-900 leading-relaxed font-medium">
                {aiResponse.summary}
              </p>

              {/* Life Domains Analysis */}
              <div className="space-y-1.5">
                <span className="font-black text-amber-950 text-[12px] uppercase tracking-wider block">
                  Life Domain Impacts:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {aiResponse.lifeDomainEffects.map((item, idx) => (
                    <div key={idx} className="bg-[#FAF8F5] p-3 rounded-md border border-stone-200/80 space-y-1 text-[12px]">
                      <strong className="text-amber-900 font-black block text-[11.5px] uppercase">
                        {item.domain}
                      </strong>
                      <p className="text-stone-800 leading-snug">
                        {item.effect}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths vs Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[12px]">
                <div className="bg-emerald-50/60 p-3 rounded-md border border-emerald-200 space-y-1">
                  <span className="font-black uppercase text-emerald-950 text-[11px] tracking-wider block flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Special Planetary Strengths</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-800">
                    {aiResponse.specialStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/60 p-3 rounded-md border border-rose-200 space-y-1">
                  <span className="font-black uppercase text-rose-950 text-[11px] tracking-wider block flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    <span>Potential Sensitivities</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-800">
                    {aiResponse.potentialChallenges.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-rose-700 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Remedies & Citations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 border-t border-stone-100 text-[11.5px]">
                <div className="bg-amber-100/60 p-3 rounded-md border border-amber-300 space-y-1">
                  <span className="font-black text-amber-950 uppercase text-[11px] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span>Prescribed Upayas:</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-900 font-medium">
                    {aiResponse.remedies.map((rem, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-amber-800 font-bold">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-stone-50 p-3 rounded-md border border-stone-200 space-y-1">
                  <span className="font-black text-stone-900 uppercase text-[11px] flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                    <span>Classical Research References:</span>
                  </span>
                  <ul className="space-y-0.5 text-stone-700">
                    {aiResponse.researchCitations.map((cit, idx) => (
                      <li key={idx} className="flex items-start space-x-1 leading-snug">
                        <span className="text-stone-500 font-bold">•</span>
                        <span>{cit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
