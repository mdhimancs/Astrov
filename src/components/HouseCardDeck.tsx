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
    <div className="space-y-6">
      {/* THE 12 HOUSES DECK CONTAINER */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* DECK HEADER & FILTERS */}
        <div className="p-5 sm:p-8 border-b border-stone-100 space-y-6 bg-[#FAF9F6]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-vedic font-bold text-stone-900 text-lg sm:text-xl flex items-center space-x-2.5 tracking-tight">
                <Layers className="w-5 h-5 text-amber-700" />
                <span>Bhava Deck (All 12 Houses)</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed max-w-2xl">
                Explore the 12 Bhavas of your natal chart. Select a house card below to reveal its complete Parashari analysis, planetary influences, and aspects.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
              {[
                { id: 'ALL', label: 'All 12' },
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
                  className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer border ${
                    filterCategory === cat.id
                      ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* THE 12 HOUSES NAVIGATION CARDS (H1, H2, etc.) */}
          <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-2.5 pt-1">
            {displayedHouses.map((h) => {
              const isSelected = h.houseNumber === selectedHouseNumber;
              return (
                <button
                  key={h.houseNumber}
                  onClick={() => onSelectHouseNumber(h.houseNumber)}
                  className={`aspect-square sm:w-12 sm:h-12 rounded-xl font-vedic font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-300 border-2 ${
                    isSelected
                      ? 'bg-amber-700 text-white border-amber-600 shadow-md -translate-y-1 ring-4 ring-amber-100'
                      : 'bg-white border-stone-100 text-stone-400 hover:border-amber-400 hover:text-amber-800 hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  H{h.houseNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTED HOUSE COMPREHENSIVE DOSSIER (INSIDE THE DECK) */}
        <div className="p-5 sm:p-10 bg-gradient-to-b from-white to-[#FAF8F5]/40 space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Top Navigation & House Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-stone-100 pb-8">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-800 text-white font-vedic font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                H{activeHouse.houseNumber}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-vedic font-bold text-stone-900 text-2xl sm:text-3xl tracking-tight leading-none">
                    {activeHouse.vedicName} — {activePrediction.lifeDomain}
                  </h3>
                  <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border uppercase tracking-widest ${classification.badgeClass}`}>
                    {classification.type}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-stone-500 font-medium leading-relaxed">
                  {classification.description}
                </p>
              </div>
            </div>

            {/* Quick Prev / Next House Flipping Buttons */}
            <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handlePrevHouse}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-sm font-bold border border-stone-200 shadow-2xs transition-all cursor-pointer hover:border-amber-300"
                title="Previous House"
              >
                <ChevronLeft className="w-5 h-5 text-amber-700" />
                <span>H{activeHouse.houseNumber === 1 ? 12 : activeHouse.houseNumber - 1}</span>
              </button>

              <button
                type="button"
                onClick={handleNextHouse}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-sm font-bold border border-stone-200 shadow-2xs transition-all cursor-pointer hover:border-amber-300"
                title="Next House"
              >
                <span>H{activeHouse.houseNumber === 12 ? 1 : activeHouse.houseNumber + 1}</span>
                <ChevronRight className="w-5 h-5 text-amber-700" />
              </button>
            </div>
          </div>

          {/* CORE BHAVA ASTROLOGICAL VITALS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-[#FAF9F6] rounded-2xl p-6 sm:p-8 border border-stone-200/60 shadow-inner">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block opacity-80">
                Zodiac Sign (Rasi)
              </span>
              <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900 block leading-tight">
                {activeHouse.rasiName}
              </span>
              <span className="text-xs font-medium text-stone-500">
                Sign #{activeHouse.rasiNumber}
              </span>
            </div>

            <div className="space-y-1.5 border-l border-stone-200/60 pl-6 sm:pl-0 sm:border-l-0 sm:text-center sm:px-6">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block opacity-80">
                Sign Lord (Dispositor)
              </span>
              <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900 block leading-tight">
                {activeHouse.signLord}
              </span>
              <span className="text-xs font-medium text-stone-500">
                Rules Bhava Outcomes
              </span>
            </div>

            <div className="space-y-1.5 pt-4 sm:pt-0 sm:border-l border-stone-200/60 sm:text-center sm:px-6">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block opacity-80">
                Natural Karaka
              </span>
              <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900 block leading-tight">
                {activeHouse.karaka}
              </span>
              <span className="text-xs font-medium text-stone-500">
                Universal Significator
              </span>
            </div>

            <div className="space-y-1.5 pt-4 sm:pt-0 border-l border-stone-200/60 pl-6 sm:pl-0 sm:border-l sm:text-right">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block opacity-80">
                Bhava Occupancy
              </span>
              <span className="text-lg sm:text-xl font-vedic font-bold text-stone-900 block leading-tight truncate">
                {activeHouse.planets.length === 0 ? 'Lord Governed' : `${activeHouse.planets.length} Natal Grahas`}
              </span>
              <span className="text-xs font-medium text-stone-500 truncate block">
                {activeHouse.planets.length === 0 ? 'Unoccupied (Pure)' : activeHouse.planets.map((p) => p.name).join(', ')}
              </span>
            </div>
          </div>

          {/* GRAHAS POSITED IN THIS BHAVA */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <h4 className="font-vedic font-bold text-stone-900 text-lg sm:text-xl tracking-tight">
                Natal Grahas Posited in House {activeHouse.houseNumber}
              </h4>
            </div>

            {activeHouse.planets.length === 0 ? (
              <div className="bg-[#FCFAF6] rounded-2xl border border-stone-200/80 p-6 sm:p-8 text-stone-700 text-sm leading-relaxed flex items-start space-x-4">
                <Compass className="w-6 h-6 text-stone-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-bold text-stone-900 text-base sm:text-lg">
                    Unoccupied Bhava (Pure Dispositor Influence)
                  </p>
                  <p className="text-stone-600 leading-relaxed max-w-3xl">
                    No natal planets directly occupy this house. In classical Parashari Jyotish, an unoccupied house expresses its themes in an unobstructed manner, directed purely by its sign lord <strong className="text-amber-900 font-bold">{activeHouse.signLord}</strong> and natural karaka <strong className="text-amber-900 font-bold">{activeHouse.karaka}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeHouse.planets.map((planet) => (
                  <div
                    key={planet.name}
                    className="bg-white rounded-2xl border border-amber-200/60 p-6 space-y-4 shadow-2xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-100 font-bold flex items-center justify-center text-xl shadow-sm">
                          {planet.symbol}
                        </div>
                        <div>
                          <span className="font-vedic font-bold text-stone-900 text-lg sm:text-xl block leading-none">
                            {planet.englishName} ({planet.name})
                          </span>
                          <span className="text-xs font-medium text-stone-500 mt-1.5 block">
                            {planet.degree}°{planet.minute}' in {activeHouse.rasiName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {planet.isRetrograde && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 block mb-1.5">
                            VAKRI (®)
                          </span>
                        )}
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                          PADA {planet.pada}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm sm:text-base text-stone-700 pt-4 border-t border-stone-100 leading-relaxed">
                      Occupies <strong>{planet.nakshatra}</strong> nakshatra. Intensifies the native's active focus on {activePrediction.lifeDomain.toLowerCase()}, bestowing notable willpower and personal karmic emphasis here.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PLANETARY ASPECTS (DRISHTI) ON THIS HOUSE */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-stone-700" />
              </div>
              <h4 className="font-vedic font-bold text-stone-900 text-lg sm:text-xl tracking-tight">
                Planetary Aspects (Drishti) on House {activeHouse.houseNumber}
              </h4>
            </div>

            {aspectingPlanets.length === 0 ? (
              <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200/70 p-6 text-stone-600 text-sm italic leading-relaxed">
                No major classical full aspects converge on this house, keeping its energy shielded from external planetary cross-currents.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aspectingPlanets.map((asp, idx) => (
                  <div
                    key={`${asp.planet.name}-${idx}`}
                    className={`rounded-2xl border p-5 transition-all duration-300 shadow-2xs hover:shadow-sm ${
                      asp.isBenefic
                        ? 'bg-emerald-50/40 border-emerald-200/60 text-emerald-950'
                        : 'bg-stone-50 border-stone-200/80 text-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-base sm:text-lg">{asp.planet.englishName}</span>
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-white/60 border border-stone-200/30 uppercase tracking-tighter shadow-3xs">
                        From H{asp.planet.house}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-stone-600 leading-relaxed">
                      {asp.aspectType}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEEP MASTER PREDICTIVE READING FOR THIS SPECIFIC HOUSE */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 rounded-3xl border border-amber-300 p-8 sm:p-12 space-y-8 shadow-sm">
            <div className="flex items-center space-x-4 border-b border-amber-200/60 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-700 flex items-center justify-center shadow-md">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-vedic font-bold text-stone-900 text-xl sm:text-2xl tracking-tight">
                Parashari & Cheiro Predictive Reading
              </h4>
            </div>

            <div className="space-y-8">
              <p className="font-serif italic text-stone-900 text-lg sm:text-xl leading-relaxed antialiased border-l-4 border-amber-200 pl-6 py-1">
                "{activePrediction.prediction}"
              </p>

              {/* Strategic Pillars of this House */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white/80 rounded-2xl p-6 border border-amber-200/40 space-y-3 shadow-3xs">
                  <span className="font-extrabold text-amber-900 text-xs sm:text-sm flex items-center space-x-2.5 uppercase tracking-widest">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <span>Primary Manifestation</span>
                  </span>
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
                    With <strong className="text-stone-900 font-bold">{activeHouse.rasiName}</strong> ruling this bhava, the native naturally applies structured discernment toward {activePrediction.lifeDomain.toLowerCase()}. Growth is steady and reinforced when aligned with personal values.
                  </p>
                </div>

                <div className="bg-white/80 rounded-2xl p-6 border border-amber-200/40 space-y-3 shadow-3xs">
                  <span className="font-extrabold text-amber-900 text-xs sm:text-sm flex items-center space-x-2.5 uppercase tracking-widest">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span>Karmic Guardrails</span>
                  </span>
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
                    Guard against impatience or impulsive shifts in {activePrediction.lifeDomain.toLowerCase()}. Sustained focus during favorable transits will yield lasting rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* VEDIC REMEDIAL HARMONIZATION (UPAYA) */}
          <div className="bg-[#FAF9F6] rounded-3xl border border-stone-200/80 p-8 sm:p-12 space-y-8">
            <div className="flex items-center space-x-4 border-b border-stone-200 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-vedic font-bold text-stone-900 text-xl tracking-tight">
                Vedic Upaya (Remedial Practice)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-2xs space-y-2">
                <span className="font-extrabold text-stone-400 uppercase text-[10px] tracking-widest block">
                  Vedic Chanting
                </span>
                <span className="font-bold text-amber-900 text-base sm:text-lg block leading-tight">
                  {upaya.mantra}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-2xs space-y-2">
                <span className="font-extrabold text-stone-400 uppercase text-[10px] tracking-widest block">
                  Tones & Deity
                </span>
                <span className="font-bold text-stone-800 text-base sm:text-lg block leading-tight">
                  {upaya.auspiciousColor} • {upaya.deity}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-2xs space-y-2">
                <span className="font-extrabold text-stone-400 uppercase text-[10px] tracking-widest block">
                  Harmonizing Action
                </span>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium">
                  {upaya.remedyAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
