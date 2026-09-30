import React, { useState } from 'react';
import {
  HouseInfo,
  PlanetPosition,
  NatalYoga,
  AshtakavargaPoints,
  UserProfile,
} from '../types';
import { NorthIndianChart } from './NorthIndianChart';
import {
  Layers,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Flame,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { VEDIC_RASIS } from '../data';

interface DivisionalChartsTabProps {
  natalHouses: HouseInfo[];
  natalPlanets: PlanetPosition[];
  yogas: NatalYoga[];
  ashtakavarga: AshtakavargaPoints[];
  lagnaRasi: number;
  activeProfile?: UserProfile;
}

export function DivisionalChartsTab({
  natalHouses,
  natalPlanets,
  yogas,
  ashtakavarga,
  lagnaRasi,
  activeProfile,
}: DivisionalChartsTabProps) {
  const [selectedVarga, setSelectedVarga] = useState<'D1' | 'D9'>('D1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build D9 House Structure
  const buildD9Houses = (): HouseInfo[] => {
    // A simplified way to show D9 positions in the chart component
    // In a real Vedic engine, you'd re-calculate houses based on Navamsha Lagna
    // Here we use the D9 positions calculated in vedicMath.ts
    const d9Houses: HouseInfo[] = [];
    const lagnaPlanet = natalPlanets.find((p) => p.name === 'Lagna');
    const d9LagnaRasi = lagnaPlanet?.d9Position?.rasiNumber || 1;

    for (let h = 1; h <= 12; h++) {
      const rasiNumber = ((d9LagnaRasi - 1 + (h - 1)) % 12) + 1;
      const rasiData = VEDIC_RASIS[rasiNumber - 1];

      const d9Planets = natalPlanets
        .filter((p) => p.name !== 'Lagna' && p.d9Position?.rasiNumber === rasiNumber)
        .map((p) => ({
          ...p,
          rasiNumber: p.d9Position!.rasiNumber,
          rasiName: p.d9Position!.rasiName,
          house: h,
        }));

      d9Houses.push({
        houseNumber: h,
        rasiNumber,
        rasiName: rasiData.sanskritName,
        signLord: rasiData.lord,
        planets: d9Planets,
        significance: '',
        karaka: '',
        vedicName: '',
      });
    }
    return d9Houses;
  };

  const d9Houses = buildD9Houses();

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
          yogas: yogas.map(y => y.name).join(', '),
          vargaFocus: 'D9 Navamsha & Ashtakavarga Synthesis',
          additionalData: {
            ashtakavarga: ashtakavarga.map(a => `${a.planet}: ${a.total} total points`).join('; ')
          }
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
            Advanced Analysis
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {(['D1', 'D9'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVarga(v)}
              className={`text-[12px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer pb-0.5 border-b-2 ${
                selectedVarga === v
                  ? 'text-amber-800 border-amber-600'
                  : 'text-stone-600 border-transparent hover:text-stone-800'
              }`}
            >
              {v === 'D1' ? 'Birth (D1)' : 'Navamsha (D9)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* CHART SECTION (LEFT) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="bg-[#FAF9F6] rounded-lg border border-amber-200/60 p-2 shadow-3xs overflow-hidden relative">
            <div className="absolute top-0 right-0 p-1 opacity-5 pointer-events-none">
              <Layers className="w-24 h-24 rotate-12" />
            </div>

            <NorthIndianChart
              houses={selectedVarga === 'D1' ? natalHouses : d9Houses}
              title={selectedVarga === 'D1' ? 'Rasi (D1)' : 'Navamsha (D9)'}
              subtitle={selectedVarga === 'D1' ? 'Lagna' : 'Spiritual'}
            />

            <div className="mt-2 bg-white/80 rounded-md p-2 border border-amber-100 space-y-1">
              <h4 className="font-vedic font-bold text-stone-950 text-[14px] flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-700" />
                <span>{selectedVarga} Scope</span>
              </h4>
              <p className="text-[13px] text-stone-800 leading-snug">
                {selectedVarga === 'D1'
                  ? 'The D1 represents the physical framework and root of life.'
                  : 'The D9 reveals internal strength and spiritual essence.'}
              </p>
            </div>
          </div>

          {/* YOGA ANALYSIS SECTION */}
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-[16px] font-vedic font-bold text-stone-950">Yogas</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[12px] font-bold uppercase tracking-wider border border-amber-200">
                {yogas.length} Found
              </span>
            </div>

            {yogas.length === 0 ? (
              <div className="bg-stone-50 rounded p-2 text-center text-stone-600 text-[14px] italic">
                No major classical yogas detected.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yogas.map((yoga) => (
                  <div key={yoga.name} className="group bg-[#FAF9F6] hover:bg-white rounded-md p-2 border border-stone-200 transition-all duration-150 hover:shadow-3xs hover:border-amber-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 uppercase tracking-wider group-hover:bg-amber-700 group-hover:text-white group-hover:border-amber-700 transition-colors">
                        {yoga.auspiciousness}
                      </span>
                      <div className="flex space-x-1">
                        {yoga.planetsInvolved.map(p => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-stone-200 flex items-center justify-center text-[12px] font-bold text-stone-800">
                            {p.substring(0, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-vedic font-bold text-stone-950 text-[15px] leading-snug">{yoga.name}</h4>
                    <p className="text-[12px] text-amber-900 font-bold font-vedic leading-snug">{yoga.sanskritName}</p>
                    <p className="text-[13px] text-stone-800 leading-snug mt-1">
                      {yoga.effect}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASHTAKAVARGA & STRENGTHS (RIGHT) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="bg-stone-900 rounded-lg p-2.5 text-white shadow-sm space-y-2 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
              <Zap className="w-24 h-24" />
            </div>

            <div className="relative z-10 space-y-0.5">
              <h3 className="text-[16px] font-vedic font-bold flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Ashtakavarga</span>
              </h3>
              <p className="text-[12px] text-stone-400 leading-snug">
                Numerical capacity. High (5+) is excellent.
              </p>
            </div>

            <div className="space-y-2 relative z-10">
              {ashtakavarga.map((item) => {
                const avg = item.total / 12;
                const percent = (item.total / 96) * 100;
                
                return (
                  <div key={item.planet} className="space-y-1">
                    <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-wider">
                      <span className="text-amber-400">{item.planet}</span>
                      <span className="text-stone-300 text-[12px]">Avg: {avg.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          avg >= 4.5 ? 'bg-emerald-500' : avg >= 3.5 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, percent * 2.5)}%` }}
                      />
                    </div>
                    {/* Points visual strip */}
                    <div className="grid grid-cols-12 gap-0.5 mt-0.5">
                      {item.points.map((pt, i) => (
                        <div 
                          key={i} 
                          className={`py-0.5 rounded flex items-center justify-center text-[11px] font-black border transition-colors ${
                            pt >= 5 
                              ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400' 
                              : pt >= 4 
                              ? 'bg-stone-800 border-stone-700 text-stone-400' 
                              : 'bg-rose-900/40 border-rose-500/50 text-rose-400'
                          }`}
                        >
                          {pt}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-stone-800 space-y-1">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-stone-800/50 rounded p-1.5 border border-stone-700">
                  <span className="text-[12px] text-stone-400 block">Max Power</span>
                  <span className="text-[14px] font-bold text-white">House 11</span>
                </div>
                <div className="bg-stone-800/50 rounded p-1.5 border border-stone-700">
                  <span className="text-[12px] text-stone-400 block">Karmic Focus</span>
                  <span className="text-[14px] font-bold text-white">House 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* INTELLIGENT AI ANALYSIS CALLOUT */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-900 rounded-lg p-2.5 text-white shadow-sm space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-amber-200" />
              <h3 className="text-[16px] font-vedic font-bold">Divine Synthesis</h3>
            </div>
            <p className="text-[13px] text-amber-100 leading-snug">
              Master synthesis of Varga, Ashtakavarga, and Dasha.
            </p>
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-1.5 bg-white text-amber-900 font-bold text-[14px] rounded-md shadow-sm hover:bg-amber-50 transition-all flex items-center justify-center space-x-1.5 group cursor-pointer disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 group-hover:animate-pulse" />
                  <span>Generate Master AI Interpretation</span>
                </>
              )}
            </button>
            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded p-1.5 text-[12px] text-rose-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
          </div>

          {/* AI READING DISPLAY */}
          {aiReading && (
            <div className="bg-[#FFFBEB] rounded-lg p-2.5 border border-amber-400 shadow-3xs space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[14px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analysis Ready</span>
                </div>
                <button 
                  onClick={() => setAiReading(null)}
                  className="text-[12px] uppercase font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="prose prose-xs max-w-none">
                <div className="whitespace-pre-wrap font-serif text-stone-800 text-[14px] leading-relaxed antialiased">
                  {aiReading}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
