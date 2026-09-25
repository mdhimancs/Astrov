import React, { useState } from 'react';
import {
  HouseInfo,
  PlanetPosition,
  BirthTimeHousePrediction,
} from '../types';
import { VEDIC_RASIS } from '../data';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Eye,
  Flame,
  Award,
  BookOpen,
  Compass,
} from 'lucide-react';

interface HouseCardDeckProps {
  houses: HouseInfo[];
  housePredictions: BirthTimeHousePrediction[];
  natalPlanets: PlanetPosition[];
  selectedHouseNumber: number;
  onSelectHouseNumber: (houseNumber: number) => void;
}

// Classification of Vedic Bhavas
function getHouseClassification(houseNum: number): {
  type: string;
  badgeClass: string;
  description: string;
} {
  if (houseNum === 1) {
    return {
      type: 'Kendra & Trikona',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Supreme Pillar of Life & Dharma (Center of Vitality & Destiny)',
    };
  }
  if ([4, 7, 10].includes(houseNum)) {
    return {
      type: 'Kendra Bhava',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'Pillar of Material Manifestation, Action & Relationships (Vishnu Sthana)',
    };
  }
  if ([5, 9].includes(houseNum)) {
    return {
      type: 'Trikona Bhava',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Auspicious Lakshmi Sthana of Divine Grace, Fortune & Past Merit',
    };
  }
  if ([3, 6, 11].includes(houseNum)) {
    return {
      type: 'Upachaya Bhava',
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      description: 'House of Cumulative Growth, Competitive Mastery & Financial Expansion',
    };
  }
  if ([2].includes(houseNum)) {
    return {
      type: 'Dhana & Maraka',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Treasury of Liquid Wealth, Speech, Lineage & Life Energy Sustenance',
    };
  }
  if ([8, 12].includes(houseNum)) {
    return {
      type: 'Dusthana & Moksha',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      description: 'House of Deep Transformation, Occult Secrets, Overseas Shores & Liberation',
    };
  }
  return {
    type: 'Bhava',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    description: 'Vedic House of Experience',
  };
}

// Compute which natal planets cast a Vedic aspect (Drishti) on the given house
function getAspectingPlanets(targetHouse: number, planets: PlanetPosition[]) {
  const aspecting: { planet: PlanetPosition; aspectType: string; isBenefic: boolean }[] = [];

  for (const p of planets) {
    if (p.house === targetHouse) continue; // Occupying, not aspecting

    const dist = ((targetHouse - p.house + 12) % 12) || 12; // 1-based distance from planet to target
    const isBenefic = ['Guru', 'Shukra', 'Budha', 'Chandra'].includes(p.name);

    // 7th house aspect (All planets aspect 7th from their position)
    if (dist === 7) {
      aspecting.push({
        planet: p,
        aspectType: '7th Full Aspect (Direct Focus)',
        isBenefic,
      });
      continue;
    }

    // Mars (Mangal) special aspects: 4th, 8th
    if (p.name === 'Mangal' && (dist === 4 || dist === 8)) {
      aspecting.push({
        planet: p,
        aspectType: `${dist}th Special Aspect (Drive & Vigour)`,
        isBenefic: false,
      });
    }

    // Jupiter (Guru) special aspects: 5th, 9th
    if (p.name === 'Guru' && (dist === 5 || dist === 9)) {
      aspecting.push({
        planet: p,
        aspectType: `${dist}th Special Trinal Aspect (Divine Protection & Wisdom)`,
        isBenefic: true,
      });
    }

    // Saturn (Shani) special aspects: 3rd, 10th
    if (p.name === 'Shani' && (dist === 3 || dist === 10)) {
      aspecting.push({
        planet: p,
        aspectType: `${dist}th Special Aspect (Karmic Discipline & Endurance)`,
        isBenefic: false,
      });
    }

    // Rahu & Ketu aspects: 5th, 9th
    if ((p.name === 'Rahu' || p.name === 'Ketu') && (dist === 5 || dist === 9)) {
      aspecting.push({
        planet: p,
        aspectType: `${dist}th Trinal Aspect (Intensified Karmic Pull)`,
        isBenefic: false,
      });
    }
  }

  return aspecting;
}

// Vedic Remedial Recommendations for each House Lord
function getHouseUpaya(signLord: string, houseNum: number): {
  mantra: string;
  deity: string;
  remedyAction: string;
  auspiciousColor: string;
} {
  switch (signLord.toLowerCase()) {
    case 'sun':
    case 'surya':
      return {
        mantra: 'Om Suryaya Namaha (ॐ सूर्याय नमः)',
        deity: 'Surya Narayana',
        remedyAction: 'Offer water to the rising sun (Arghya) in a copper vessel daily; cultivate truthfulness and honor father figures.',
        auspiciousColor: 'Ruby Red, Gold & Saffron',
      };
    case 'moon':
    case 'chandra':
      return {
        mantra: 'Om Chandraya Namaha (ॐ चन्द्राय नमः)',
        deity: 'Goddess Parvati / Shiva',
        remedyAction: 'Respect and serve the mother; drink water from silver vessels; practice mindful breathing and meditation on Mondays.',
        auspiciousColor: 'Pearl White & Silver',
      };
    case 'mars':
    case 'mangal':
      return {
        mantra: 'Om Bhaumaya Namaha (ॐ भौमाय नमः)',
        deity: 'Lord Hanuman / Kartikeya',
        remedyAction: 'Recite Hanuman Chalisa on Tuesdays; channel physical vitality into constructive athletics; support younger siblings.',
        auspiciousColor: 'Coral Red & Ochre',
      };
    case 'mercury':
    case 'budha':
      return {
        mantra: 'Om Budhaya Namaha (ॐ बुधाय नमः)',
        deity: 'Lord Vishnu',
        remedyAction: 'Feed green grass or spinach to cows on Wednesdays; support children’s education; cultivate articulate speech and continuous reading.',
        auspiciousColor: 'Emerald Green & Mint',
      };
    case 'jupiter':
    case 'guru':
      return {
        mantra: 'Om Brihaspataye Namaha (ॐ बृहस्पतये नमः)',
        deity: 'Lord Shiva / Guru Dakshinamurthy',
        remedyAction: 'Respect spiritual preceptors, teachers, and elders; donate yellow lentils, turmeric, or scriptures on Thursdays.',
        auspiciousColor: 'Golden Yellow & Honey Amber',
      };
    case 'venus':
    case 'shukra':
      return {
        mantra: 'Om Shukraya Namaha (ॐ शुक्राय नमः)',
        deity: 'Maha Lakshmi',
        remedyAction: 'Maintain personal aesthetics, purity, and artistic harmony; respect women; offer white flowers or sweets at a sanctuary on Fridays.',
        auspiciousColor: 'Diamond White, Rose & Cream',
      };
    case 'saturn':
    case 'shani':
      return {
        mantra: 'Om Sham Shanicharaya Namaha (ॐ शं शनैश्चराय नमः)',
        deity: 'Lord Hanuman / Shani Deva',
        remedyAction: 'Perform selfless seva for underprivileged, elderly, or service workers; feed crows or black dogs on Saturdays; cultivate patience.',
        auspiciousColor: 'Navy Blue, Charcoal & Indigo',
      };
    default:
      return {
        mantra: 'Om Namah Shivaya (ॐ नमः शिवाय)',
        deity: 'Parameshwara',
        remedyAction: 'Practice daily mindfulness, truthfulness, and righteous action aligned with cosmic dharma.',
        auspiciousColor: 'Gold & Ivory',
      };
  }
}

export function HouseCardDeck({
  houses,
  housePredictions,
  natalPlanets,
  selectedHouseNumber,
  onSelectHouseNumber,
}: HouseCardDeckProps) {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'KENDRA' | 'TRIKONA' | 'DHANA' | 'UPACHAYA' | 'DUSTHANA'>('ALL');

  // Filter houses in the deck if filter selected
  const displayedHouses = houses.filter((h) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'KENDRA') return [1, 4, 7, 10].includes(h.houseNumber);
    if (filterCategory === 'TRIKONA') return [1, 5, 9].includes(h.houseNumber);
    if (filterCategory === 'DHANA') return [2, 5, 9, 11].includes(h.houseNumber);
    if (filterCategory === 'UPACHAYA') return [3, 6, 10, 11].includes(h.houseNumber);
    if (filterCategory === 'DUSTHANA') return [6, 8, 12].includes(h.houseNumber);
    return true;
  });

  // Current selected house and its prediction
  const activeHouse = houses.find((h) => h.houseNumber === selectedHouseNumber) || houses[0];
  const activePrediction =
    housePredictions.find((p) => p.houseNumber === selectedHouseNumber) ||
    housePredictions[0];

  if (!activeHouse || !activePrediction) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 animate-pulse">
        Initializing House Data...
      </div>
    );
  }

  const classification = getHouseClassification(activeHouse.houseNumber);
  const aspectingPlanets = getAspectingPlanets(activeHouse.houseNumber, natalPlanets);
  const upaya = getHouseUpaya(activeHouse.signLord, activeHouse.houseNumber);

  // Previous & Next navigation across all 12 houses
  const handlePrevHouse = () => {
    const prev = activeHouse.houseNumber === 1 ? 12 : activeHouse.houseNumber - 1;
    onSelectHouseNumber(prev);
  };

  const handleNextHouse = () => {
    const next = activeHouse.houseNumber === 12 ? 1 : activeHouse.houseNumber + 1;
    onSelectHouseNumber(next);
  };

  return (
    <div className="space-y-2">
      {/* THE 12 HOUSES DECK CONTAINER */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* DECK HEADER & FILTERS */}
        <div className="px-2 sm:px-2.5 py-1.5 border-b border-stone-100 bg-[#FAF9F6]/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
            <div>
              <h3 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm flex items-center space-x-1.5 tracking-tight">
                <Layers className="w-3 h-3 text-amber-700" />
                <span>Bhava Deck</span>
              </h3>
            </div>

            {/* Category Filter - Zero Pill Style */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'KENDRA', label: 'Kendra' },
                { id: 'TRIKONA', label: 'Trikona' },
                { id: 'DHANA', label: 'Wealth' },
                { id: 'UPACHAYA', label: 'Growth' },
                { id: 'DUSTHANA', label: 'Moksha' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id as any)}
                  className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer pb-0.5 border-b-2 ${
                    filterCategory === cat.id
                      ? 'text-amber-800 border-amber-600'
                      : 'text-stone-400 border-transparent hover:text-stone-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* THE 12 HOUSES NAVIGATION CARDS (H1, H2, etc.) */}
          <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-1 mt-2">
            {displayedHouses.map((h) => {
              const isSelected = h.houseNumber === selectedHouseNumber;
              return (
                <button
                  key={h.houseNumber}
                  onClick={() => onSelectHouseNumber(h.houseNumber)}
                  className={`aspect-square sm:w-8 sm:h-8 rounded-md font-vedic font-bold text-[10px] sm:text-xs flex items-center justify-center transition-all duration-150 border ${
                    isSelected
                      ? 'bg-amber-700 text-white border-amber-600 shadow-2xs ring-1 ring-amber-100'
                      : 'bg-white border-stone-100 text-stone-500 hover:border-amber-300 hover:text-amber-800'
                  }`}
                >
                  H{h.houseNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTED HOUSE COMPREHENSIVE DOSSIER */}
        <div className="px-2 sm:px-2.5 py-2 bg-gradient-to-b from-white to-[#FAF8F5]/30 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Top Navigation & House Title */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
            <div className="flex items-center space-x-2">
              <div className="text-amber-700 font-vedic font-bold text-lg sm:text-xl">
                H{activeHouse.houseNumber}
              </div>

              <div className="space-y-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="font-vedic font-bold text-stone-900 text-sm sm:text-base tracking-tight leading-tight">
                    {activeHouse.vedicName} — {activePrediction.lifeDomain}
                  </h3>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${classification.badgeClass.replace('bg-', 'text-').replace('text-', 'border-').split(' ')[1]}`}>
                    {classification.type}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-medium leading-tight">
                  {classification.description}
                </p>
              </div>
            </div>

            {/* Quick Prev / Next House Flipping Buttons */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={handlePrevHouse}
                className="p-1 rounded bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-amber-700 transition-colors border border-stone-100"
                title="Previous House"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleNextHouse}
                className="p-1 rounded bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-amber-700 transition-colors border border-stone-100"
                title="Next House"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CORE BHAVA ASTROLOGICAL VITALS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50/50 rounded-lg px-2 py-1.5 border border-stone-100">
            <div className="space-y-0">
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block">
                Zodiac Sign
              </span>
              <span className="text-xs sm:text-sm font-vedic font-bold text-stone-800 block">
                {activeHouse.rasiName}
              </span>
            </div>

            <div className="space-y-0 border-l border-stone-200/40 pl-2">
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block">
                Sign Lord
              </span>
              <span className="text-xs sm:text-sm font-vedic font-bold text-stone-800 block">
                {activeHouse.signLord}
              </span>
            </div>

            <div className="space-y-0 border-l border-stone-200/40 pl-2">
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block">
                Natural Karaka
              </span>
              <span className="text-xs sm:text-sm font-vedic font-bold text-stone-800 block">
                {activeHouse.karaka}
              </span>
            </div>

            <div className="space-y-0 border-l border-stone-200/40 pl-2">
              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block">
                Occupancy
              </span>
              <span className="text-xs sm:text-sm font-vedic font-bold text-stone-800 block truncate">
                {activeHouse.planets.length === 0 ? 'Empty' : `${activeHouse.planets.length} Grahas`}
              </span>
            </div>
          </div>

          {/* GRAHAS POSITED & ASPECTS - TIGHTER INTEGRATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Occupants */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Natal Occupants</span>
              </h4>
              {activeHouse.planets.length === 0 ? (
                <p className="text-[10px] text-stone-400 italic">Unoccupied; purely lord governed.</p>
              ) : (
                <div className="space-y-1">
                  {activeHouse.planets.map((planet) => (
                    <div key={planet.name} className="flex items-center justify-between p-1.5 rounded bg-white border border-stone-100 shadow-3xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-amber-700">{planet.symbol}</span>
                        <span className="text-[11px] font-bold text-stone-700">{planet.englishName}</span>
                      </div>
                      <span className="text-[9px] text-stone-400">{planet.degree}° in {planet.nakshatra}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aspects */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center space-x-1">
                <Eye className="w-2.5 h-2.5" />
                <span>Drishti (Aspects)</span>
              </h4>
              {aspectingPlanets.length === 0 ? (
                <p className="text-[10px] text-stone-400 italic">No major aspects converge here.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {aspectingPlanets.map((asp, idx) => (
                    <div key={`${asp.planet.name}-${idx}`} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${asp.isBenefic ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-stone-50 text-stone-600 border-stone-100'}`}>
                      {asp.planet.englishName} (H{asp.planet.house})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PREDICTIVE READING - ELEGANT BLOCK */}
          <div className="bg-amber-50/30 rounded-lg p-2.5 border-l-2 border-amber-300">
            <h4 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1">Sage Parashari Reading</h4>
            <p className="font-serif italic text-stone-800 text-xs sm:text-sm leading-relaxed antialiased">
              "{activePrediction.prediction}"
            </p>
          </div>

          {/* REMEDIES - ZERO CARD LOOK */}
          <div className="pt-1 border-t border-stone-100">
            <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Bhava Harmonization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div>
                <span className="text-stone-400 font-bold block">Mantra</span>
                <span className="text-amber-900 font-bold">{upaya.mantra}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold block">Deity</span>
                <span className="text-stone-700 font-medium">{upaya.deity}</span>
              </div>
              <div className="sm:col-span-1">
                <span className="text-stone-400 font-bold block">Action</span>
                <span className="text-stone-600 leading-tight">{upaya.remedyAction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
