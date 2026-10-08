import React, { useState } from 'react';
import {
  Globe2,
  Sparkles,
  Compass,
  Layers,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { PlanetPosition } from '../types';
import { calculateVedicCosmologySuite, VedicCosmologySuite } from '../vedicMath';

interface VedicCosmologySectionProps {
  natalMoonRasi: number;
  natalMoonDeg?: number;
  natalNakshatra: string;
  planets: PlanetPosition[];
  seekerName: string;
}

export function VedicCosmologySection({
  natalMoonRasi,
  natalMoonDeg = 15,
  natalNakshatra,
  planets,
  seekerName,
}: VedicCosmologySectionProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'nakshatras' | 'sarvatobhadra'>('elements');

  const cosmologySuite: VedicCosmologySuite = React.useMemo(() => {
    return calculateVedicCosmologySuite(
      natalMoonRasi,
      natalMoonDeg,
      natalNakshatra,
      planets
    );
  }, [natalMoonRasi, natalMoonDeg, natalNakshatra, planets]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-sky-300 shadow-2xs overflow-hidden space-y-2 p-2.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/70 pb-1.5">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-sky-100 text-sky-900 border border-sky-300 font-bold">
            <Globe2 className="w-3.5 h-3.5 text-sky-800" />
          </span>
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[15px] leading-tight">
              Vedic Cosmology &amp; Sarvatobhadra Chakra — Celestial Coordinates
            </h3>
            <p className="text-[11px] text-stone-600">
              Cosmic macrocosm mapping Pancha Mahabhuta (Elements), 6 Sensitive Vedha Nakshatras, and the 28-Star Sarvatobhadra Sphere
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin shrink-0">
          {[
            { id: 'elements', label: 'Pancha Mahabhutas (Elements)', icon: Flame },
            { id: 'nakshatras', label: '6 Vedha Nakshatras', icon: Sparkles },
            { id: 'sarvatobhadra', label: 'Sarvatobhadra & Kalachakra', icon: Globe2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-vedic transition-all cursor-pointer border flex items-center space-x-1 shrink-0 ${
                  isActive
                    ? 'bg-sky-100 text-sky-950 border-sky-400 ring-1 ring-sky-300 shadow-2xs'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-sky-300'
                }`}
              >
                <span>{tab.label}</span>
                <Icon className={`w-3 h-3 ${isActive ? 'text-sky-800' : 'text-stone-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PANCHA MAHABHUTAS (COSMIC ELEMENTS DISTRIBUTION) */}
      {activeTab === 'elements' && (
        <div className="space-y-2">
          <div className="text-[11px] text-stone-500 font-semibold px-0.5">
            The fundamental five cosmic elements (Tatvas) forming your mind-body constitution and karmic temperament.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {cosmologySuite.panchaMahabhutas.map((em) => (
              <div
                key={em.element}
                className="bg-[#FAF8F5] rounded-lg border border-stone-200 p-2.5 space-y-1.5 shadow-3xs flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                    <span className="font-vedic font-bold text-stone-950 text-[13px]">
                      {em.element}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 font-bold font-mono text-[11px]">
                      {em.percentage}%
                    </span>
                  </div>

                  {/* Visual Percentage Bar */}
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        em.element.startsWith('Agni')
                          ? 'bg-amber-600'
                          : em.element.startsWith('Prithvi')
                          ? 'bg-emerald-600'
                          : em.element.startsWith('Vayu')
                          ? 'bg-sky-600'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${em.percentage}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-stone-600 pt-0.5">
                    <span>Grahas: </span>
                    <strong className="text-stone-900">
                      {em.planetsInElement.length > 0 ? em.planetsInElement.join(', ') : 'None'}
                    </strong>
                  </div>
                </div>

                <p className="text-[11.5px] text-stone-700 leading-snug border-t border-stone-200/60 pt-1">
                  {em.diagnosis}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 6 SENSITIVE VEDHA NAKSHATRAS */}
      {activeTab === 'nakshatras' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
            <span>Special Sensitive Constellations (Pancha Shaka Vedha) measured from Birth Star {natalNakshatra}</span>
            <span className="text-sky-950 font-bold">Sarvatobhadra Sensitivity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {cosmologySuite.specialNakshatras.map((sn) => (
              <div
                key={sn.category}
                className="bg-[#FAF8F5] rounded-lg border border-sky-200/80 p-2.5 space-y-1 shadow-3xs"
              >
                <div className="flex items-center justify-between border-b border-sky-100 pb-1">
                  <span className="font-vedic font-bold text-sky-950 text-[12.5px]">
                    {sn.category}
                  </span>
                  <span className="text-[10px] font-mono text-sky-900 bg-sky-50 px-1.5 py-0.2 rounded font-bold">
                    Star #{sn.nakshatraNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px] pt-0.5">
                  <span className="font-vedic font-bold text-stone-900">
                    {sn.nakshatraName}
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Lord: <strong className="text-stone-900">{sn.rulingLord}</strong>
                  </span>
                </div>

                <p className="text-[11.5px] text-stone-700 leading-snug pt-0.5">
                  {sn.celestialCosmologyVerdict}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SARVATOBHADRA COORDINATES & KALACHAKRA */}
      {activeTab === 'sarvatobhadra' && (
        <div className="bg-[#FAF8F5] rounded-lg border border-sky-200 p-2.5 space-y-2">
          <div className="flex items-center space-x-1.5 border-b border-sky-100 pb-1">
            <Globe2 className="w-3.5 h-3.5 text-sky-800" />
            <h4 className="font-vedic font-bold text-stone-950 text-[13px]">
              Vedic Cosmogony &amp; Sarvatobhadra 28-Star Celestial Grid
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white rounded p-2 border border-sky-100 space-y-1 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-sky-900 block">
                Abhijit Intercalary Constellation
              </span>
              <p className="font-mono text-stone-900 font-bold">
                {cosmologySuite.sarvatobhadraCoordinates.abhijitNakshatraSpan}
              </p>
              <p className="text-[11.5px] text-stone-600 leading-snug">
                In classical 28-nakshatra Sarvatobhadra cosmology, Abhijit (Vega) represents supreme divine victory, utilized for sovereign inaugurations and celestial protection.
              </p>
            </div>

            <div className="bg-white rounded p-2 border border-sky-100 space-y-1 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-sky-900 block">
                Precession of Equinoxes (Ayanamsha Shift)
              </span>
              <p className="font-mono text-stone-900 font-bold">
                {cosmologySuite.sarvatobhadraCoordinates.equinoxPrecessionRate}
              </p>
              <p className="text-[11.5px] text-stone-600 leading-snug">
                Current Chitra Paksha (Lahiri) Ayanamsha calibration stands at {cosmologySuite.sarvatobhadraCoordinates.chitraPakshaAyanamshaNow}, reconciling physical constellations with the tropical seasons.
              </p>
            </div>
          </div>

          <div className="bg-sky-50/70 rounded p-2 border border-sky-200 text-[12px] text-stone-800 leading-snug">
            <strong className="text-sky-950 font-vedic mr-1">Cosmic Kalachakra:</strong>
            The Great Platonic / Vedic Yuga Cycle spans <strong>{cosmologySuite.sarvatobhadraCoordinates.cosmicKalachakraCycle}</strong>, harmonizing individual human breath with the vast cosmic expansion of the solar system.
          </div>
        </div>
      )}
    </div>
  );
}
