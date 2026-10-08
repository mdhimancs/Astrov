import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Crown,
  Heart,
  Briefcase,
  Layers,
  Compass,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { PlanetPosition } from '../types';
import { calculateJaiminiSuite, JaiminiSuite } from '../vedicMath';

interface JaiminiSectionProps {
  lagnaRasi: number;
  planets: PlanetPosition[];
  seekerName: string;
}

export function JaiminiSection({
  lagnaRasi,
  planets,
  seekerName,
}: JaiminiSectionProps) {
  const [activeSubView, setActiveSubView] = useState<'karakas' | 'karakamsha' | 'arudhas' | 'drishti'>('karakas');

  const jaiminiSuite: JaiminiSuite = React.useMemo(() => {
    return calculateJaiminiSuite(lagnaRasi, planets);
  }, [lagnaRasi, planets]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-purple-200 shadow-2xs overflow-hidden space-y-2 p-2.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/70 pb-1.5">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold">
            <Crown className="w-3.5 h-3.5 text-purple-800" />
          </span>
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[15px] leading-tight">
              Maharishi Jaimini Sutras — Chara Karakas &amp; Arudha Padas
            </h3>
            <p className="text-[11px] text-stone-600">
              Profound sign-based soul astrology decoding Atmakaraka (AK), Karakamsha Lagna, Arudha Lagna (AL), and Rasi Drishti
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin shrink-0">
          {[
            { id: 'karakas', label: '7 Chara Karakas', icon: Award },
            { id: 'karakamsha', label: 'Karakamsha & Soul', icon: Sparkles },
            { id: 'arudhas', label: 'Arudha Padas (AL/UL)', icon: Layers },
            { id: 'drishti', label: 'Rasi Drishti (Aspects)', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubView(tab.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-vedic transition-all cursor-pointer border flex items-center space-x-1 shrink-0 ${
                  isActive
                    ? 'bg-purple-100 text-purple-950 border-purple-400 ring-1 ring-purple-300 shadow-2xs'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-purple-300'
                }`}
              >
                <span>{tab.label}</span>
                <Icon className={`w-3 h-3 ${isActive ? 'text-purple-800' : 'text-stone-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 7 CHARA KARAKAS CARDS */}
      {activeSubView === 'karakas' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
            <span>Ranked by Highest Arc Degree in Sign (Parashara &amp; Jaimini Classical Consensus)</span>
            <span className="text-purple-900 font-bold">
              Atmakaraka: {jaiminiSuite.atmakaraka.planet} ({jaiminiSuite.atmakaraka.degreeInSign}°)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {jaiminiSuite.karakas.map((k, idx) => {
              const isAK = idx === 0;
              const isAmK = idx === 1;
              const isDK = idx === 6;
              return (
                <div
                  key={k.karaka}
                  className={`rounded-lg border p-2.5 space-y-1.5 transition-all shadow-3xs ${
                    isAK
                      ? 'bg-gradient-to-br from-amber-50 to-purple-50/70 border-amber-300 ring-1 ring-amber-200'
                      : isAmK
                      ? 'bg-purple-50/40 border-purple-200'
                      : isDK
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-[#FAF8F5] border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-serif font-black text-amber-900 text-[11px]">{idx + 1}.</span>
                      <h4 className="font-vedic font-bold text-stone-950 text-[13px]">
                        {k.karaka}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-purple-900">
                      {k.degreeInSign}°
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-vedic font-bold text-stone-900">
                      Graha: <strong className="text-amber-900">{k.planet}</strong>
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 font-serif">
                      {k.sanskritName}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-stone-700 leading-snug">
                    {k.significance}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. KARAKAMSHA LAGNA & SOUL DESTINY */}
      {activeSubView === 'karakamsha' && (
        <div className="bg-[#FAF8F5] rounded-lg border border-purple-200 p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-purple-100 pb-1">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
                Karakamsha Lagna (KL): {jaiminiSuite.karakamshaRasiName} (Sign {jaiminiSuite.karakamshaRasi})
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-950 border border-purple-300 text-[11px] font-bold">
              Ishta Devata: {jaiminiSuite.karakamshaDeity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white rounded border border-purple-100 p-2 space-y-1">
              <span className="text-[11px] font-black uppercase text-purple-900 block">
                1. Atmakaraka Soul Purpose
              </span>
              <p className="text-stone-700 leading-snug">
                Your Atmakaraka is <strong>{jaiminiSuite.atmakaraka.planet}</strong>. In Jaimini philosophy, the Atmakaraka acts as the king of the chart; wherever it is placed in Navamsha establishes Karakamsha Lagna, revealing what your soul came to master in this earthly incarnation.
              </p>
            </div>

            <div className="bg-white rounded border border-amber-100 p-2 space-y-1">
              <span className="text-[11px] font-black uppercase text-amber-900 block">
                2. Ishta Devata &amp; 12th from Karakamsha
              </span>
              <p className="text-stone-700 leading-snug">
                The 12th house from Karakamsha Lagna governs Moksha and spiritual emancipation. Guided by {jaiminiSuite.karakamshaDeity}, your daily prayers and meditation unlock rapid spiritual peace and karmic absolution.
              </p>
            </div>
          </div>

          <div className="bg-purple-50/60 rounded p-2 border border-purple-200 text-[12px] text-stone-800 leading-snug">
            <strong className="text-purple-950 font-vedic mr-1">Jaimini Soul Verdict:</strong>
            {jaiminiSuite.soulDestinyReading}
          </div>
        </div>
      )}

      {/* 3. ARUDHA PADAS (AL, UL, A10) */}
      {activeSubView === 'arudhas' && (
        <div className="space-y-2">
          <div className="text-[11px] text-stone-500 font-semibold px-0.5">
            Arudha Padas represent how your karmic destiny manifests externally in the eyes of society (Maya vs Satya).
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Arudha Lagna (AL) */}
            <div className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-1.5 shadow-3xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-1">
                <span className="font-vedic font-bold text-stone-950 text-[13px]">
                  Arudha Lagna (AL)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-mono font-bold text-[11px]">
                  {jaiminiSuite.arudhaLagnaName}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-900 block">
                Public Image &amp; Perceived Stature
              </span>
              <p className="text-[11.5px] text-stone-700 leading-snug">
                The reflection of the 1st house. Shows your reputation, brand, social standing, and how colleagues and the world perceive your prosperity.
              </p>
            </div>

            {/* Upapada Lagna (UL) */}
            <div className="bg-[#FAF8F5] rounded-lg border border-rose-200 p-2.5 space-y-1.5 shadow-3xs">
              <div className="flex items-center justify-between border-b border-rose-100 pb-1">
                <span className="font-vedic font-bold text-stone-950 text-[13px]">
                  Upapada Lagna (UL)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-950 font-mono font-bold text-[11px]">
                  {jaiminiSuite.upapadaLagnaName}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-rose-900 block">
                Marriage Partner &amp; In-Laws Harmony
              </span>
              <p className="text-[11.5px] text-stone-700 leading-snug">
                The Arudha of the 12th house (bed comforts and marital sacrifices). Dictates the family background, virtue, and enduring bond of your spouse.
              </p>
            </div>

            {/* Rajyapada (A10) */}
            <div className="bg-[#FAF8F5] rounded-lg border border-purple-200 p-2.5 space-y-1.5 shadow-3xs">
              <div className="flex items-center justify-between border-b border-purple-100 pb-1">
                <span className="font-vedic font-bold text-stone-950 text-[13px]">
                  Rajyapada (A10)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-950 font-mono font-bold text-[11px]">
                  {jaiminiSuite.rajyapadaName}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-purple-900 block">
                Career Zenith &amp; Authority Padha
              </span>
              <p className="text-[11.5px] text-stone-700 leading-snug">
                The Arudha of the 10th house. Shows the tangible professional projects, executive appointments, and royal/governmental favors attained.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. RASI DRISHTI (SIGN ASPECTS) */}
      {activeSubView === 'drishti' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
            <span>Jaimini Sign Aspects (Movable signs aspect Fixed; Fixed aspect Movable; Dual aspect Dual)</span>
            <span className="text-purple-900 font-bold">Immutable Classical Drishti</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {jaiminiSuite.rasiDrishtiMatrix.map((item) => (
              <div key={item.sign} className="bg-white rounded border border-stone-200 p-2 text-[11.5px] shadow-3xs space-y-0.5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-0.5">
                  <strong className="text-stone-900 font-vedic">{item.sign}</strong>
                  <span className="text-[10px] text-stone-400 font-mono">Sign {item.signNumber}</span>
                </div>
                <div className="text-stone-600">
                  <span className="text-[10px] font-semibold text-purple-900 uppercase block">Aspects (Drishti):</span>
                  <span className="font-medium text-stone-800">{item.aspectsSigns.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
