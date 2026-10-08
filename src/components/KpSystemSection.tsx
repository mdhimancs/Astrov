import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  HeartHandshake,
  Briefcase,
  Coins,
  Globe2,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PlanetPosition } from '../types';
import { calculateKpChartSuite, KpChartSuite } from '../vedicMath';

interface KpSystemSectionProps {
  lagnaRasi: number;
  lagnaDeg?: number;
  planets: PlanetPosition[];
  seekerName: string;
}

export function KpSystemSection({
  lagnaRasi,
  lagnaDeg = 15,
  planets,
  seekerName,
}: KpSystemSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'promises' | 'cusps' | 'planets' | 'ruling'>('promises');

  const kpSuite: KpChartSuite = React.useMemo(() => {
    return calculateKpChartSuite(lagnaRasi, lagnaDeg, planets);
  }, [lagnaRasi, lagnaDeg, planets]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-200 shadow-2xs overflow-hidden space-y-2 p-2.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-1.5">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
            <Compass className="w-3.5 h-3.5 text-amber-800" />
          </span>
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[15px] leading-tight">
              KP System (Krishnamurti Padhdhati) — Stellar Event Precision
            </h3>
            <p className="text-[11px] text-stone-600">
              Celebrated stellar system using Cuspal Sub-Lords (CSL) &amp; 249 sub-divisions for exact timing and event promises
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin shrink-0">
          {[
            { id: 'promises', label: 'Event Promises', icon: Award },
            { id: 'cusps', label: '12 Cusp Sub-Lords', icon: Layers },
            { id: 'planets', label: 'Planet Sub-Lords', icon: Sparkles },
            { id: 'ruling', label: 'Ruling Planets (RP)', icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* 1. EVENT PROMISES (KP CUSPAL SUB-LORD VERDICTS) */}
      {activeSubTab === 'promises' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
            <span>Core Life Outcomes via Cusp Sub-Lord Significations</span>
            <span className="text-amber-900 font-bold">Ayanamsha: KP ({kpSuite.ayanamshaValue.toFixed(2)}°)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {kpSuite.eventPromises.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-lg border border-amber-200/80 p-2.5 space-y-1.5 shadow-3xs hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-amber-100 pb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-800 text-white font-mono font-bold text-[10px]">
                      Cusp {item.cuspEvaluated}
                    </span>
                    <h4 className="font-vedic font-bold text-stone-950 text-[13px]">
                      {item.category}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      item.verdict === 'Highly Favorable'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}
                  >
                    {item.verdict}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>
                    Sub-Lord: <strong className="text-purple-900">{item.cuspSubLord}</strong>
                  </span>
                  <span>
                    Signifies Bhavas:{' '}
                    <strong className="text-stone-900 font-mono">
                      {item.connectingHouses.join(', ')}
                    </strong>
                  </span>
                </div>

                <p className="text-[12px] text-stone-700 leading-snug">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 12 CUSP SUB-LORDS TABLE */}
      {activeSubTab === 'cusps' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
            <span>Exact Placidus / Sripati Cusp Longitudes &amp; Sub-Lords</span>
            <span className="text-purple-900 font-bold">249 Sub-Division Table</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="bg-amber-50/90 text-amber-950 border-b border-amber-200 font-vedic font-bold">
                  <th className="py-1 px-2">Cusp</th>
                  <th className="py-1 px-2">Rasi (Sign)</th>
                  <th className="py-1 px-2">Longitude</th>
                  <th className="py-1 px-2">Sign Lord</th>
                  <th className="py-1 px-2">Star Lord (Nakshatra)</th>
                  <th className="py-1 px-2 text-amber-900 font-black">Sub-Lord (CSL)</th>
                  <th className="py-1 px-2">Sub-Sub Lord</th>
                  <th className="py-1 px-2">Resident Grahas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {kpSuite.cusps.map((c) => (
                  <tr key={c.houseNumber} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-1 px-2 font-bold font-mono text-stone-900">
                      H{c.houseNumber}
                    </td>
                    <td className="py-1 px-2 font-medium text-stone-800">
                      {c.rasiName}
                    </td>
                    <td className="py-1 px-2 font-mono text-stone-600">
                      {c.degree}° {c.minute}&apos;
                    </td>
                    <td className="py-1 px-2 text-stone-700">{c.signLord}</td>
                    <td className="py-1 px-2 text-stone-700">{c.starLord}</td>
                    <td className="py-1 px-2 font-bold text-amber-900 bg-amber-50/50">
                      {c.subLord}
                    </td>
                    <td className="py-1 px-2 text-stone-500">{c.subSubLord}</td>
                    <td className="py-1 px-2">
                      {c.significators.length > 0 ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10.5px] font-semibold">
                          {c.significators.join(', ')}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic text-[10.5px]">Vacant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PLANET SUB-LORDS TABLE */}
      {activeSubTab === 'planets' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
            <span>Planetary Significations &amp; Sub-Lord Alignment</span>
            <span className="text-stone-600 font-bold">4-Fold Significators (Bhavas Signified)</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="bg-amber-50/90 text-amber-950 border-b border-amber-200 font-vedic font-bold">
                  <th className="py-1 px-2">Graha</th>
                  <th className="py-1 px-2">Rasi</th>
                  <th className="py-1 px-2">Degree</th>
                  <th className="py-1 px-2">House</th>
                  <th className="py-1 px-2">Star Lord</th>
                  <th className="py-1 px-2 text-amber-900 font-black">Sub-Lord</th>
                  <th className="py-1 px-2">Sub-Sub Lord</th>
                  <th className="py-1 px-2">Signified Bhavas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {kpSuite.planets.map((p) => (
                  <tr key={p.planet} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-1 px-2 font-bold text-stone-900">
                      {p.planet} ({p.englishName})
                    </td>
                    <td className="py-1 px-2 text-stone-800">{p.rasiName}</td>
                    <td className="py-1 px-2 font-mono text-stone-600">
                      {p.degree}° {p.minute}&apos;
                    </td>
                    <td className="py-1 px-2 font-mono font-bold text-purple-900">
                      H{p.house}
                    </td>
                    <td className="py-1 px-2 text-stone-700">{p.starLord}</td>
                    <td className="py-1 px-2 font-bold text-amber-900 bg-amber-50/50">
                      {p.subLord}
                    </td>
                    <td className="py-1 px-2 text-stone-500">{p.subSubLord}</td>
                    <td className="py-1 px-2 font-mono font-bold text-stone-800">
                      {p.signifiesHouses.map((h) => `H${h}`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. RULING PLANETS (RP) */}
      {activeSubTab === 'ruling' && (
        <div className="bg-[#FAF8F5] rounded-lg border border-amber-200/90 p-2.5 space-y-2">
          <div className="flex items-center space-x-1.5 border-b border-amber-200/70 pb-1">
            <Compass className="w-3.5 h-3.5 text-amber-800" />
            <h4 className="font-vedic font-bold text-stone-950 text-[13px]">
              Ruling Planets (RP) at Chart Epoch
            </h4>
          </div>

          <p className="text-[12px] text-stone-700 leading-snug">
            In KP stellar methodology, Ruling Planets (RP) are the divine cosmic clock hands operating at the moment of inquiry or birth. They act as supreme filters to confirm event occurrence and verify timing accuracy.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
            <div className="bg-white rounded p-1.5 border border-amber-200 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-stone-500 block">Day Lord</span>
              <strong className="text-[13px] font-vedic text-stone-950">{kpSuite.rulingPlanets.dayLord}</strong>
            </div>
            <div className="bg-white rounded p-1.5 border border-amber-200 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-stone-500 block">Moon Sign Lord</span>
              <strong className="text-[13px] font-vedic text-stone-950">{kpSuite.rulingPlanets.moonSignLord}</strong>
            </div>
            <div className="bg-white rounded p-1.5 border border-purple-200 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-purple-900 block">Moon Star Lord</span>
              <strong className="text-[13px] font-vedic text-purple-950">{kpSuite.rulingPlanets.moonStarLord}</strong>
            </div>
            <div className="bg-white rounded p-1.5 border border-amber-200 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-stone-500 block">Lagna Sign Lord</span>
              <strong className="text-[13px] font-vedic text-stone-950">{kpSuite.rulingPlanets.lagnaSignLord}</strong>
            </div>
            <div className="bg-white rounded p-1.5 border border-emerald-200 shadow-3xs">
              <span className="text-[10px] font-black uppercase text-emerald-900 block">Lagna Star Lord</span>
              <strong className="text-[13px] font-vedic text-emerald-950">{kpSuite.rulingPlanets.lagnaStarLord}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
