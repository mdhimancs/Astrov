import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Award,
  Layers,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react';
import { PlanetPosition } from '../types';
import { calculateNandiNadiSuite, NandiNadiSuite } from '../vedicMath';

interface NandiNadiSectionProps {
  planets: PlanetPosition[];
  seekerName: string;
}

export function NandiNadiSection({ planets, seekerName }: NandiNadiSectionProps) {
  const [activeTab, setActiveTab] = useState<'trines' | 'jeeva' | 'karma' | 'knots'>('trines');

  const nadiSuite: NandiNadiSuite = React.useMemo(() => {
    return calculateNandiNadiSuite(planets);
  }, [planets]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-300/80 shadow-2xs overflow-hidden space-y-2 p-2.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-1.5">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-800" />
          </span>
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[15px] leading-tight">
              Nandi Nadi Astrology — Maharishi Agastya &amp; Bhrigu Heritage
            </h3>
            <p className="text-[11px] text-stone-600">
              Celebrated South Indian Nadi technique reading Jeeva Karaka (Guru), Karma Karaka (Shani), and Directional Trines without ascendant dependency
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin shrink-0">
          {[
            { id: 'trines', label: '4 Directional Trines', icon: Compass },
            { id: 'jeeva', label: 'Jeeva Karaka (Jupiter)', icon: Sparkles },
            { id: 'karma', label: 'Karma Karaka (Saturn)', icon: Award },
            { id: 'knots', label: 'Rahu-Ketu Karmic Knots', icon: Layers },
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
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-amber-300'
                }`}
              >
                <span>{tab.label}</span>
                <Icon className={`w-3 h-3 ${isActive ? 'text-amber-800' : 'text-stone-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 4 DIRECTIONAL TRINES (EAST, SOUTH, WEST, NORTH) */}
      {activeTab === 'trines' && (
        <div className="space-y-2">
          <div className="text-[11px] text-stone-500 font-semibold px-0.5">
            In Nadi astrology, planets located in trinal houses (1-5-9, 2-6-10, 3-7-11, 4-8-12) share the same cosmic direction and act as direct conjunctions.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {nadiSuite.directionalTrines.map((dt) => (
              <div
                key={dt.direction}
                className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-1.5 shadow-3xs flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                    <span className="font-vedic font-bold text-stone-950 text-[12.5px]">
                      {dt.direction}
                    </span>
                    <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                      H{dt.houses.join(', ')}
                    </span>
                  </div>

                  <div className="py-1">
                    <span className="text-[10px] font-black uppercase text-stone-500 block mb-0.5">
                      Grahas in Alignment:
                    </span>
                    {dt.planets.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {dt.planets.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded bg-white border border-amber-300 text-stone-900 font-bold text-[11px] shadow-3xs"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">No direct occupants</span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-snug border-t border-stone-200/50 pt-1">
                  {dt.significance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. JEEVA KARAKA (GURU / JUPITER) */}
      {activeTab === 'jeeva' && (
        <div className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-100 pb-1">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
                Jeeva Karaka (Guru / Jupiter) — Life Force &amp; Moral Path
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold">
              Guru in House {nadiSuite.jeevaKaraka.house} ({nadiSuite.jeevaKaraka.rasiName})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white rounded border border-amber-100 p-2 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-900 block">
                Planets in Trine with Guru
              </span>
              <p className="text-stone-800 font-semibold">
                {nadiSuite.jeevaKaraka.connectedPlanets.length > 0
                  ? nadiSuite.jeevaKaraka.connectedPlanets.join(', ')
                  : 'Independent placement (Self-Guided Soul)'}
              </p>
              <p className="text-[11.5px] text-stone-600 leading-snug">
                In Nandi Nadi, the planets placed in the 1st, 5th, and 9th from Jupiter directly influence the native’s personality, guiding ideals, and daily breath.
              </p>
            </div>

            <div className="bg-white rounded border border-amber-100 p-2 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-900 block">
                Nadi Progression Rounds
              </span>
              <p className="text-stone-700 leading-snug">
                Jupiter traverses the 12 signs in 12 years. Ages 12, 24, 36, 48, 60, and 72 mark profound spiritual, bodily, and destiny resets (Guru Rounds).
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded p-2 border border-amber-200 text-[12px] text-stone-800 leading-snug">
            <strong className="text-amber-950 font-vedic mr-1">Jeeva Karaka Synthesis:</strong>
            {nadiSuite.jeevaKaraka.lifePathReading}
          </div>
        </div>
      )}

      {/* 3. KARMA KARAKA (SHANI / SATURN) */}
      {activeTab === 'karma' && (
        <div className="bg-[#FAF8F5] rounded-lg border border-stone-300 p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-stone-200 pb-1">
            <div className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-stone-700" />
              <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
                Karma Karaka (Shani / Saturn) — Livelihood &amp; Past Debts
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-900 border border-stone-300 text-[11px] font-bold">
              Shani in House {nadiSuite.karmaKaraka.house} ({nadiSuite.karmaKaraka.rasiName})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white rounded border border-stone-200 p-2 space-y-1">
              <span className="text-[10px] font-black uppercase text-stone-600 block">
                Planets Influencing Career (Trine with Saturn)
              </span>
              <p className="text-stone-800 font-semibold">
                {nadiSuite.karmaKaraka.connectedPlanets.length > 0
                  ? nadiSuite.karmaKaraka.connectedPlanets.join(', ')
                  : 'Independent craftsman (Solo perseverance)'}
              </p>
              <p className="text-[11.5px] text-stone-600 leading-snug">
                Nandi Nadi derives your true professional calling not only from the 10th house, but from the planets directly modifying Saturn by trinal contact.
              </p>
            </div>

            <div className="bg-white rounded border border-stone-200 p-2 space-y-1">
              <span className="text-[10px] font-black uppercase text-stone-600 block">
                Saturn 30-Year Great Cycle
              </span>
              <p className="text-stone-700 leading-snug">
                Saturn’s transit through your natal chart establishes professional maturity at age 30 and legacy mastery at age 60.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 rounded p-2 border border-stone-200 text-[12px] text-stone-800 leading-snug">
            <strong className="text-stone-950 font-vedic mr-1">Karma Karaka Vocation Verdict:</strong>
            {nadiSuite.karmaKaraka.careerKarmaReading}
          </div>
        </div>
      )}

      {/* 4. RAHU-KETU KARMIC KNOTS */}
      {activeTab === 'knots' && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
            <div className="bg-[#FAF8F5] rounded-lg border border-purple-200 p-2.5 space-y-1.5 shadow-3xs">
              <div className="flex items-center justify-between border-b border-purple-100 pb-1">
                <span className="font-vedic font-bold text-purple-950 text-[13px]">
                  Ketu (Mastery &amp; Detachment)
                </span>
                <span className="text-[10px] font-mono text-purple-900 bg-purple-50 px-1.5 py-0.2 rounded font-bold">
                  Mukti Point
                </span>
              </div>
              <p className="text-stone-700 leading-snug">
                {nadiSuite.karmicKnots.pastLifeDebts}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-1.5 shadow-3xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-1">
                <span className="font-vedic font-bold text-amber-950 text-[13px]">
                  Rahu (Hunger &amp; Destiny Frontier)
                </span>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                  Karma Horizon
                </span>
              </div>
              <p className="text-stone-700 leading-snug">
                {nadiSuite.karmicKnots.spiritualLiberationPath}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
