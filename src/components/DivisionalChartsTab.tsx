import React, { useState } from 'react';
import {
  HouseInfo,
  PlanetPosition,
  NatalYoga,
  AshtakavargaPoints,
  UserProfile,
} from '../types';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import {
  Layers,
  Sparkles,
  Award,
  Brain,
  Flame,
  Loader2,
  CheckCircle2,
  Compass,
  Star,
  BookOpen,
} from 'lucide-react';
import { VEDIC_RASIS } from '../data';
import {
  VargaCode,
  VARGA_CHART_INFO,
  calculateVargaPosition,
  calculateJaiminiKarakas,
  calculateArudhaLagnas,
} from '../vedicMath';

interface DivisionalChartsTabProps {
  natalHouses: HouseInfo[];
  natalPlanets: PlanetPosition[];
  yogas: NatalYoga[];
  ashtakavarga: AshtakavargaPoints[];
  lagnaRasi: number;
  activeProfile?: UserProfile;
}

const ALL_VARGAS: VargaCode[] = [
  'D1',
  'D9',
  'D2',
  'D3',
  'D4',
  'D7',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D27',
  'D30',
  'D60',
];

export function DivisionalChartsTab({
  natalHouses,
  natalPlanets,
  yogas,
  ashtakavarga,
  lagnaRasi,
  activeProfile,
}: DivisionalChartsTabProps) {
  const [selectedVarga, setSelectedVarga] = useState<VargaCode>('D1');
  const [chartLayout, setChartLayout] = useState<'north' | 'south'>('north');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute Jaimini Karakas & Arudhas
  const jaiminiKarakas = calculateJaiminiKarakas(natalPlanets);
  const { arudhaLagnaRasi, upapadaLagnaRasi } = calculateArudhaLagnas(lagnaRasi, natalPlanets);

  // Build House Structure for any selected Varga (D1 to D60)
  const buildVargaHouses = (varga: VargaCode): HouseInfo[] => {
    if (varga === 'D1') return natalHouses;

    const lagnaPlanet = natalPlanets.find((p) => p.name === 'Lagna');
    const lagnaTotalDeg = lagnaPlanet?.totalDeg ?? (lagnaRasi - 1) * 30 + 15;
    const vargaLagna = calculateVargaPosition(lagnaTotalDeg, varga);
    const vargaLagnaRasi = vargaLagna.rasiNumber;

    const vargaHouses: HouseInfo[] = [];

    for (let h = 1; h <= 12; h++) {
      const rasiNumber = ((vargaLagnaRasi - 1 + (h - 1)) % 12) + 1;
      const rasiData = VEDIC_RASIS[rasiNumber - 1];

      const planetsInRasi = natalPlanets
        .filter((p) => p.name !== 'Lagna')
        .map((p) => {
          const pDeg = p.totalDeg ?? (p.rasiNumber - 1) * 30 + p.degree + p.minute / 60;
          const pos = calculateVargaPosition(pDeg, varga);
          return { planet: p, vargaRasiNumber: pos.rasiNumber, vargaRasiName: pos.rasiName };
        })
        .filter((item) => item.vargaRasiNumber === rasiNumber)
        .map((item) => ({
          ...item.planet,
          rasiNumber,
          rasiName: item.vargaRasiName,
          house: h,
        }));

      vargaHouses.push({
        houseNumber: h,
        rasiNumber,
        rasiName: rasiData.sanskritName,
        signLord: rasiData.lord,
        planets: planetsInRasi,
        significance: '',
        karaka: '',
        vedicName: '',
      });
    }

    return vargaHouses;
  };

  const currentVargaHouses = buildVargaHouses(selectedVarga);
  const vargaInfo = VARGA_CHART_INFO[selectedVarga];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/astrology/vedic-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeProfile?.name || 'Seeker',
          birthDate: activeProfile?.birthDate,
          birthTime: activeProfile?.birthTime,
          birthPlace: activeProfile?.place,
          lagnaRasi: VEDIC_RASIS[lagnaRasi - 1]?.sanskritName,
          yogas: yogas.map((y) => y.name).join(', '),
          vargaFocus: `${selectedVarga} (${vargaInfo.name}) - ${vargaInfo.significance}`,
          additionalData: {
            ashtakavarga: ashtakavarga.map((a) => `${a.planet}: ${a.total} total points`).join('; '),
            jaiminiAtmakaraka: jaiminiKarakas[0]?.planet,
            arudhaLagna: VEDIC_RASIS[arudhaLagnaRasi - 1]?.sanskritName,
            upapadaLagna: VEDIC_RASIS[upapadaLagnaRasi - 1]?.sanskritName,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prediction');
      }

      setAiReading(data.reading);
    } catch (err: any) {
      console.error('AI Reading failed:', err);
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        setError('The cosmic channels are currently busy (High API Demand). Please try again in a few moments.');
      } else {
        setError('The stars are temporarily obscured. Please check your connection and try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-200 pb-1.5">
        <div className="flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-amber-700" />
          <h1 className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
            Shodashavarga &amp; Jaimini Kundali Suite
          </h1>
        </div>

        {/* Chart Style Switcher: North Indian Diamond vs South Indian Fixed Rasi */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">Layout:</span>
          <div className="flex rounded-md border border-stone-200 bg-white p-0.5 shadow-3xs">
            <button
              onClick={() => setChartLayout('north')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors ${
                chartLayout === 'north'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              North (Diamond)
            </button>
            <button
              onClick={() => setChartLayout('south')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors ${
                chartLayout === 'south'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              South (Fixed Rasi)
            </button>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE SHODASHAVARGA 14-CARD SELECTOR */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-stone-200 p-1.5 shadow-3xs">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1">
            <Compass className="w-3 h-3 text-amber-700" />
            <span>Select Divisional Chakra (Varga)</span>
          </span>
          <span className="text-[10px] text-stone-500 font-semibold">Parashari Shodashavarga</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-14 gap-1">
          {ALL_VARGAS.map((v) => {
            const isActive = selectedVarga === v;
            const meta = VARGA_CHART_INFO[v];
            return (
              <button
                key={v}
                onClick={() => setSelectedVarga(v)}
                title={`${meta.name} (${meta.sanskrit}) — ${meta.significance}`}
                className={`rounded px-1.5 py-1 text-center transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-amber-100/90 border-amber-500 ring-1 ring-amber-400 text-amber-950 font-black shadow-2xs'
                    : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-white'
                }`}
              >
                <span className="text-[11px] font-bold leading-none">{v}</span>
                <span className="text-[9px] text-stone-600 truncate max-w-full leading-tight font-serif">
                  {meta.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* CHART SECTION (LEFT) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="bg-[#FAF9F6] rounded-lg border border-amber-200/60 p-2 shadow-3xs overflow-hidden relative">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div>
                <h3 className="font-vedic font-bold text-stone-950 text-[14px]">
                  {selectedVarga}: {vargaInfo.name} ({vargaInfo.sanskrit})
                </h3>
                <p className="text-[11px] text-amber-900 font-semibold">{vargaInfo.focus}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {chartLayout === 'north' ? 'North Indian Diamond' : 'South Indian Fixed'}
              </span>
            </div>

            {chartLayout === 'north' ? (
              <NorthIndianChart
                houses={currentVargaHouses}
                title={`${selectedVarga} ${vargaInfo.name}`}
                subtitle={vargaInfo.focus}
              />
            ) : (
              <SouthIndianChart
                houses={currentVargaHouses}
                title={`${selectedVarga} ${vargaInfo.name}`}
                subtitle={vargaInfo.focus}
              />
            )}

            <div className="mt-2 bg-white/90 rounded-md p-2 border border-amber-100 space-y-1 text-stone-800">
              <h4 className="font-vedic font-bold text-stone-950 text-[13px] flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-700" />
                <span>{selectedVarga} Classical Application</span>
              </h4>
              <p className="text-[12px] leading-snug">{vargaInfo.significance}.</p>
            </div>
          </div>

          {/* JAIMINI 7 KARAKAS & SPECIAL LAGNAS */}
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <div className="flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-600" />
                <h3 className="text-[15px] font-vedic font-bold text-stone-950">
                  Jaimini Karakas &amp; Special Lagnas
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800">Chara Karakas</span>
            </div>

            {/* Special Lagnas: Arudha Lagna (AL) & Upapada Lagna (UL) */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-[#FAF8F5] p-2 rounded border border-amber-200/80">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">
                  Arudha Lagna (AL)
                </span>
                <span className="text-[13px] font-black text-stone-950">
                  {VEDIC_RASIS[arudhaLagnaRasi - 1]?.sanskritName} ({arudhaLagnaRasi})
                </span>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  The Maya/Public Image and external perceived social status.
                </p>
              </div>
              <div className="bg-[#FAF8F5] p-2 rounded border border-amber-200/80">
                <span className="text-[10px] font-bold uppercase text-purple-800 block">
                  Upapada Lagna (UL)
                </span>
                <span className="text-[13px] font-black text-stone-950">
                  {VEDIC_RASIS[upapadaLagnaRasi - 1]?.sanskritName} ({upapadaLagnaRasi})
                </span>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  Marriage, longevity of matrimonial bond, and spouse family grace.
                </p>
              </div>
            </div>

            {/* 7 Jaimini Karakas Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-800 font-bold text-[11px]">
                    <th className="py-1 px-2">Karaka</th>
                    <th className="py-1 px-2">Graha</th>
                    <th className="py-1 px-2">Degree in Sign</th>
                    <th className="py-1 px-2">Soul Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {jaiminiKarakas.map((k) => (
                    <tr key={k.karaka} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-1 px-2 font-bold text-amber-950">
                        {k.karaka} <span className="font-normal text-stone-500 font-serif">({k.sanskritName})</span>
                      </td>
                      <td className="py-1 px-2 font-semibold text-stone-900">{k.planet}</td>
                      <td className="py-1 px-2 font-mono text-stone-800">{k.degreeInSign}°</td>
                      <td className="py-1 px-2 text-stone-600 text-[11px]">{k.significance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* YOGA ANALYSIS SECTION */}
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-[15px] font-vedic font-bold text-stone-950">Yogas</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider border border-amber-200">
                {yogas.length} Found
              </span>
            </div>

            {yogas.length === 0 ? (
              <div className="bg-stone-50 rounded p-2 text-center text-stone-600 text-[13px] italic">
                No major classical yogas detected.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yogas.map((yoga) => (
                  <div
                    key={yoga.name}
                    className="group bg-[#FAF9F6] hover:bg-white rounded-md p-2 border border-stone-200 transition-all duration-150 hover:shadow-3xs hover:border-amber-300"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 uppercase tracking-wider group-hover:bg-amber-700 group-hover:text-white group-hover:border-amber-700 transition-colors">
                        {yoga.auspiciousness}
                      </span>
                      <div className="flex space-x-1">
                        {yoga.planetsInvolved.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded bg-stone-200 flex items-center justify-center text-[11px] font-bold text-stone-800"
                          >
                            {p.substring(0, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-vedic font-bold text-stone-950 text-[14px] leading-snug">{yoga.name}</h4>
                    <p className="text-[11px] text-amber-900 font-bold font-vedic leading-snug">{yoga.sanskritName}</p>
                    <p className="text-[12px] text-stone-800 leading-snug mt-1">{yoga.effect}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SARVASHTAKAVARGA KEY LIFE EFFECTS */}
          <div className="bg-[#FAF8F5] rounded-lg p-2.5 text-stone-900 border border-amber-200/90 shadow-3xs space-y-1.5">
            <span className="text-[12px] font-black uppercase tracking-wider text-amber-900 block">
              Sarvashtakavarga Key Life Effects
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="bg-white rounded p-2 border border-amber-200/70">
                <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                  Labha vs Vyaya (H11 &gt; H12)
                </span>
                <span className="text-[13px] font-bold text-stone-950 block">Strong Wealth Retention</span>
                <p className="text-[12px] text-stone-700 leading-snug mt-0.5">
                  High Bindus in House 11 ensure income outpaces expenses and investments compound steadily.
                </p>
              </div>
              <div className="bg-white rounded p-2 border border-amber-200/70">
                <span className="text-[11px] font-bold uppercase text-amber-800 block">
                  Karma vs Dharma (H10 &amp; H9)
                </span>
                <span className="text-[13px] font-bold text-stone-950 block">Career &amp; Fortune Synergy</span>
                <p className="text-[12px] text-stone-700 leading-snug mt-0.5">
                  Balanced strength in the 9th and 10th houses creates auspicious Raja Yoga for professional authority.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ASHTAKAVARGA + AI MASTER SYNTHESIS */}
        <div className="lg:col-span-5 space-y-2">
          {/* ASHTAKAVARGA TABLE */}
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-[15px] font-vedic font-bold text-stone-950">Ashtakavarga Matrix</h3>
              </div>
              <span className="text-[11px] text-stone-500 font-semibold">Parashari Bindus</span>
            </div>

            <div className="space-y-2">
              {ashtakavarga.map((item) => {
                const strongHouses = item.points
                  .map((pt, idx) => (pt >= 5 ? `H${idx + 1}` : null))
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div key={item.planet} className="bg-stone-50/70 rounded-md p-2 border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[13px] text-stone-900">{item.planet} Ashtakavarga</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                        {item.total} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-0.5">
                      {item.points.map((pt, idx) => (
                        <div
                          key={idx}
                          title={`House ${idx + 1}: ${pt} Bindus`}
                          className={`py-0.5 rounded flex flex-col items-center justify-center text-[10px] font-black border transition-colors ${
                            pt >= 5
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : pt >= 4
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                    {strongHouses && (
                      <p className="text-[11px] text-stone-600 leading-tight">
                        <span className="text-emerald-800 font-bold">Peak Houses:</span> {strongHouses}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI MASTER SYNTHESIS */}
          <div className="bg-gradient-to-br from-amber-700 via-orange-800 to-amber-950 rounded-lg p-2.5 text-white shadow-sm space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-amber-200" />
              <h3 className="text-[15px] font-vedic font-bold">Master Vedic AI Synthesis</h3>
            </div>
            <p className="text-[12px] text-amber-100 leading-snug">
              Synthesize {selectedVarga} Varga, Ashtakavarga, Jaimini Karakas, and Natal Yogas into a cohesive life guidance.
            </p>
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-1.5 bg-white text-amber-950 font-bold text-[13px] rounded-md shadow-sm hover:bg-amber-50 transition-all flex items-center justify-center space-x-1.5 group cursor-pointer disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                  <span>Synthesizing Cosmic Forces...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-amber-700 group-hover:animate-pulse" />
                  <span>Generate Master Interpretation</span>
                </>
              )}
            </button>
            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded p-1.5 text-[11px] text-rose-100">
                {error}
              </div>
            )}
          </div>

          {/* AI READING DISPLAY */}
          {aiReading && (
            <div className="bg-[#FFFBEB] rounded-lg p-2.5 border border-amber-400 shadow-3xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                <div className="flex items-center space-x-1.5 text-amber-950 font-bold text-[13px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Master Analysis Ready</span>
                </div>
                <button
                  onClick={() => setAiReading(null)}
                  className="text-[11px] uppercase font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="whitespace-pre-wrap font-serif text-stone-800 text-[13px] leading-relaxed">
                {aiReading}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
