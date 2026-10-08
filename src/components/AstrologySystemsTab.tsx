import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Crown,
  Compass,
  Flame,
  Globe2,
  Calendar,
  Sparkles,
  Layers,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, PlanetPosition } from '../types';
import {
  calculatePlanetaryPositions,
  calculateBhriguAndLalKitab,
} from '../vedicMath';
import { BhriguLalKitabSection } from './BhriguLalKitabSection';
import { JaiminiSection } from './JaiminiSection';
import { KpSystemSection } from './KpSystemSection';
import { NandiNadiSection } from './NandiNadiSection';
import { VedicCosmologySection } from './VedicCosmologySection';
import { TajikaSection } from './TajikaSection';

interface AstrologySystemsTabProps {
  activeProfile?: UserProfile;
  profiles: UserProfile[];
  onProfileChange?: (id: string) => void;
}

export type AstrologySystemId =
  | 'bhrigu'
  | 'lalkitab'
  | 'jaimini'
  | 'kp'
  | 'nadi'
  | 'cosmology'
  | 'tajika';

interface AstrologySystemMeta {
  id: AstrologySystemId;
  name: string;
  hindiTitle: string;
  tradition: string;
  accuracyHighlight: string;
  icon: any;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  tag: string;
  description: string;
}

const ASTROLOGY_SYSTEMS: AstrologySystemMeta[] = [
  {
    id: 'bhrigu',
    name: 'Bhrigu Samhita',
    hindiTitle: 'भृगु संहिता',
    tradition: 'Maharishi Bhrigu (Vedic Rishi Era)',
    accuracyHighlight: 'Past-Life Karma & Past-Future Soul Dossiers',
    icon: Award,
    colorBorder: 'border-amber-300',
    colorBg: 'bg-amber-50/70',
    colorText: 'text-amber-900',
    tag: 'Past Karma & Destiny',
    description:
      'Legendary mystic compendium decoding the soul’s previous birth infractions, karmic debts, and precise destiny milestones.',
  },
  {
    id: 'lalkitab',
    name: 'Lal Kitab',
    hindiTitle: 'लाल किताब',
    tradition: '1939–1952 Farman Tradition (Pt. Roop Chand Joshi)',
    accuracyHighlight: 'Remedial Astrology & Blind/Sleeping House Decoders',
    icon: ShieldCheck,
    colorBorder: 'border-rose-300',
    colorBg: 'bg-rose-50/70',
    colorText: 'text-rose-900',
    tag: 'Practical Upay & Debts',
    description:
      'Celebrated wonder system treating houses as fixed signs (Aries ascendant matrix), focusing on planetary debts and practical remedies.',
  },
  {
    id: 'jaimini',
    name: 'Jaimini Sutras',
    hindiTitle: 'जैमिनी उपदेश सूत्र',
    tradition: 'Maharishi Jaimini (Parashara Disciple)',
    accuracyHighlight: 'Chara Karakas, Karakamsha Lagna & Arudha Padas',
    icon: Crown,
    colorBorder: 'border-purple-300',
    colorBg: 'bg-purple-50/70',
    colorText: 'text-purple-900',
    tag: 'Soul Purpose & Illusion',
    description:
      'Profound sign-based astrology utilizing 7 movable karakas (Atmakaraka), Karakamsha Navamsha soul sign, and Arudha Lagna (AL/UL) for external status.',
  },
  {
    id: 'kp',
    name: 'KP System (Krishnamurti Padhdhati)',
    hindiTitle: 'कृष्णमूर्ति पद्धति',
    tradition: 'Prof. K.S. Krishnamurti (Stellar Astrology)',
    accuracyHighlight: 'Placidus Cuspal Sub-Lords & 249 Division Precision',
    icon: Compass,
    colorBorder: 'border-emerald-300',
    colorBg: 'bg-emerald-50/70',
    colorText: 'text-emerald-900',
    tag: 'Pinpoint Event Timing',
    description:
      'Renowned for razor-sharp event confirmation: uses Placidus unequal house cusps and Sub-Lords to deliver binary Yes/No verdicts for career, marriage, and wealth.',
  },
  {
    id: 'nadi',
    name: 'Nandi Nadi Astrology',
    hindiTitle: 'नन्दि नाडी ज्योतिष',
    tradition: 'Maharishi Agastya & Sage Nandi (South Indian Lineage)',
    accuracyHighlight: 'Jeeva & Karma Karakas with 4 Directional Trines',
    icon: Flame,
    colorBorder: 'border-orange-300',
    colorBg: 'bg-orange-50/70',
    colorText: 'text-orange-900',
    tag: 'Directional Conjunctions',
    description:
      'Independent of ascendant math; decodes life purely through planetary clusters in trinal directions (1-5-9 East, 2-6-10 South, 3-7-11 West, 4-8-12 North) and Rahu-Ketu knots.',
  },
  {
    id: 'cosmology',
    name: 'Vedic Cosmology & Sarvatobhadra',
    hindiTitle: 'वैदिक ब्रह्माण्ड विज्ञान व सर्वतोभद्र',
    tradition: 'Classical Jyotish Siddhanta & Kalachakra',
    accuracyHighlight: 'Pancha Mahabhutas, 6 Vedha Stars & 28-Nakshatra Sphere',
    icon: Globe2,
    colorBorder: 'border-sky-300',
    colorBg: 'bg-sky-50/70',
    colorText: 'text-sky-900',
    tag: 'Cosmic Coordinates & Vedha',
    description:
      'Maps individual micro-consciousness onto the universal macrocosm: evaluates element balance (Tatvas), 6 Vedha sensitive stars, and the ancient 28-Nakshatra Abhijit grid.',
  },
  {
    id: 'tajika',
    name: 'Tajika Varshaphal System',
    hindiTitle: 'ताजिक वर्षफल (नीलकण्ठी)',
    tradition: 'Tajik Neelakanthi (Vedic-Persian Synthesis)',
    accuracyHighlight: 'Annual Solar Return, Muntha Progression & 6 Sahams',
    icon: Calendar,
    colorBorder: 'border-amber-300',
    colorBg: 'bg-amber-50/70',
    colorText: 'text-amber-900',
    tag: 'Solar Return & Sahams',
    description:
      'The paramount system for annual solar return forecasts: calculates Muntha year progression, Varshesha ruler, 16 Tajik aspect Yogas, and sensitive Saham Arabic parts.',
  },
];

export function AstrologySystemsTab({
  activeProfile,
  profiles,
  onProfileChange,
}: AstrologySystemsTabProps) {
  const [selectedSystem, setSelectedSystem] = useState<AstrologySystemId>('bhrigu');

  const seekerName = activeProfile?.name || 'Munish Sharma';
  const birthDate = activeProfile?.birthDate || '1990-05-18';
  const birthTime = activeProfile?.birthTime || '07:30';
  const lat = activeProfile?.latitude ?? 28.6139;
  const lng = activeProfile?.longitude ?? 77.2090;
  const tz = activeProfile?.timezone ?? 5.5;

  // Planetary Calculation for Seeker
  const natalCalc = React.useMemo(() => {
    const dateObj = new Date(`${birthDate}T${birthTime}:00`);
    return calculatePlanetaryPositions(dateObj, lat, lng);
  }, [birthDate, birthTime, lat, lng]);

  const activeMeta = ASTROLOGY_SYSTEMS.find((s) => s.id === selectedSystem) || ASTROLOGY_SYSTEMS[0];

  return (
    <div className="space-y-2.5 pb-8">
      {/* Top Banner: Authentic Systems & Cosmology Header */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 rounded-lg p-3 text-amber-50 shadow-xs border border-amber-800/40 space-y-1.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-800/50 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-700 text-stone-950 flex items-center justify-center font-bold text-[15px] shadow-2xs">
              ॐ
            </div>
            <div>
              <h2 className="font-vedic font-black text-amber-100 text-[16px] sm:text-[18px] leading-tight tracking-wide">
                Sacred Astrology Systems &amp; Cosmic Cosmology Suite
              </h2>
              <p className="text-[12px] text-amber-200/80">
                Beyond standard Parashari: Dive into 7 world-renowned, classical systems celebrated for uncanny accuracy &amp; celestial cosmology.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[12px] bg-black/40 border border-amber-600/40 rounded-md px-2.5 py-1 text-amber-200 shrink-0">
            <span className="font-bold text-amber-300">Active Dossier:</span>
            <span className="font-semibold text-white">{seekerName}</span>
          </div>
        </div>

        {/* System Highlights Carousel / Badge Line */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5 text-amber-200/90 font-medium">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            Classical Lineages:
          </span>
          <span>Bhrigu Samhita</span>
          <span className="text-amber-500">•</span>
          <span>Lal Kitab</span>
          <span className="text-amber-500">•</span>
          <span>Jaimini Sutras</span>
          <span className="text-amber-500">•</span>
          <span>KP System</span>
          <span className="text-amber-500">•</span>
          <span>Nandi Nadi</span>
          <span className="text-amber-500">•</span>
          <span>Vedic Cosmology</span>
          <span className="text-amber-500">•</span>
          <span>Tajika Varshaphal</span>
        </div>
      </div>

      {/* HORIZONTAL VERTICAL DECK OF SYSTEM SELECTOR CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
        {ASTROLOGY_SYSTEMS.map((system) => {
          const Icon = system.icon;
          const isSelected = system.id === selectedSystem;
          return (
            <div
              key={system.id}
              onClick={() => setSelectedSystem(system.id)}
              className={`rounded-lg border p-2 transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                isSelected
                  ? 'bg-amber-50/95 border-amber-500 ring-2 ring-amber-400/80 shadow-xs'
                  : 'bg-white hover:bg-[#FAF8F5] border-stone-200/90 hover:border-amber-300 shadow-3xs'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`p-1 rounded ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span
                  className={`text-[9.5px] font-black uppercase px-1 py-0.2 rounded leading-tight text-right ${
                    isSelected
                      ? 'bg-amber-200 text-amber-950 font-bold'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {system.tag}
                </span>
              </div>

              <div>
                <h4
                  className={`font-vedic font-black text-[12.5px] leading-tight truncate ${
                    isSelected ? 'text-amber-950' : 'text-stone-900'
                  }`}
                >
                  {system.name}
                </h4>
                <span className="text-[10px] text-stone-500 font-medium block leading-none mt-0.5">
                  {system.hindiTitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SYSTEM SPOTLIGHT SYNOPSIS CALLOUT */}
      <div className="bg-[#FAF8F5] rounded-lg border border-amber-200 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] shadow-3xs">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="font-vedic font-black text-amber-950 text-[13.5px]">
              {activeMeta.name} ({activeMeta.hindiTitle})
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 font-semibold">{activeMeta.tradition}</span>
          </div>
          <p className="text-stone-700 leading-snug">
            {activeMeta.description}
          </p>
        </div>

        <div className="shrink-0 bg-white border border-amber-300/80 px-2 py-1 rounded text-right">
          <span className="text-[10px] font-black uppercase text-amber-800 block">
            Accuracy Core
          </span>
          <span className="text-[11.5px] font-bold text-stone-900">
            {activeMeta.accuracyHighlight}
          </span>
        </div>
      </div>

      {/* RENDER THE ACTIVE ASTROLOGY SYSTEM DOSSIER */}
      <div className="transition-all">
        {selectedSystem === 'bhrigu' && (
          <BhriguLalKitabSection
            data={calculateBhriguAndLalKitab(natalCalc.lagnaRasi, natalCalc.planets)}
            seekerName={seekerName}
            forcedView="bhrigu"
          />
        )}

        {selectedSystem === 'lalkitab' && (
          <BhriguLalKitabSection
            data={calculateBhriguAndLalKitab(natalCalc.lagnaRasi, natalCalc.planets)}
            seekerName={seekerName}
            forcedView="lalkitab"
          />
        )}

        {selectedSystem === 'jaimini' && (
          <JaiminiSection
            lagnaRasi={natalCalc.lagnaRasi}
            planets={natalCalc.planets}
            seekerName={seekerName}
          />
        )}

        {selectedSystem === 'kp' && (
          <KpSystemSection
            lagnaRasi={natalCalc.lagnaRasi}
            lagnaDeg={15}
            planets={natalCalc.planets}
            seekerName={seekerName}
          />
        )}

        {selectedSystem === 'nadi' && (
          <NandiNadiSection
            planets={natalCalc.planets}
            seekerName={seekerName}
          />
        )}

        {selectedSystem === 'cosmology' && (
          <VedicCosmologySection
            natalMoonRasi={natalCalc.moonRasi}
            natalMoonDeg={natalCalc.moonDeg}
            natalNakshatra={natalCalc.nakshatra}
            planets={natalCalc.planets}
            seekerName={seekerName}
          />
        )}

        {selectedSystem === 'tajika' && (
          <TajikaSection
            birthDate={birthDate}
            lagnaRasi={natalCalc.lagnaRasi}
            planets={natalCalc.planets}
            seekerName={seekerName}
          />
        )}
      </div>
    </div>
  );
}
