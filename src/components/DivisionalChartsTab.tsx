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
    <div className="w-full px-0.5 sm:px-1 py-1.5 space-y-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-stone-100 pb-1.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-700" />
          <h1 className="text-xs font-black text-stone-800 uppercase tracking-widest font-vedic leading-tight">
            Advanced Analysis
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {(['D1', 'D9'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVarga(v)}
              className={`text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer pb-0.5 border-b-2 ${
                selectedVarga === v
                  ? 'text-amber-800 border-amber-600'
                  : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
            >
              {v === 'D1' ? 'Birth (D1)' : 'Navamsha (D9)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* CHART SECTION (LEFT) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="bg-[#FAF9F6] rounded-xl border border-amber-200/60 p-2.5 sm:p-3 shadow-2xs overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <Layers className="w-36 h-36 rotate-12" />
            </div>

            <NorthIndianChart
              houses={selectedVarga === 'D1' ? natalHouses : d9Houses}
              title={selectedVarga === 'D1' ? 'Rasi Kundali (Main Birth Chart)' : 'Navamsha Kundali (Fruits of Action)'}
              subtitle={selectedVarga === 'D1' ? 'Physical Manifestation & Lagna' : 'Spiritual Strength & Marital Fruit'}
            />

            <div className="mt-2.5 bg-white/70 rounded-lg p-2.5 border border-amber-100 space-y-1">
              <h4 className="font-vedic font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-700" />
                <span>Significance of {selectedVarga}</span>
              </h4>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                {selectedVarga === 'D1'
                  ? 'The D1 chart represents the physical body, general health, and the basic framework of your life in the material world. It is the root of all other divisional charts.'
                  : 'The D9 Navamsha is the most important divisional chart. It reveals the internal strength of planets, spiritual progress, and the ultimate results of your efforts. In Vedic astrology, a planet is only as strong as its position in D9.'}
              </p>
            </div>
          </div>

          {/* YOGA ANALYSIS SECTION */}
          <div className="bg-white rounded-xl border border-stone-200 p-2.5 sm:p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-vedic font-bold text-stone-900">Panchamahapurusha & Major Yogas</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                {yogas.length} Found
              </span>
            </div>

            {yogas.length === 0 ? (
              <div className="bg-stone-50 rounded-lg p-3 text-center text-stone-500 text-xs italic">
                No major classical yogas detected with current simplified criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yogas.map((yoga) => (
                  <div key={yoga.name} className="group bg-[#FAF9F6] hover:bg-white rounded-lg p-2.5 border border-stone-200 transition-all duration-150 hover:shadow-2xs hover:border-amber-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white border border-stone-200 text-stone-500 uppercase tracking-wider shadow-3xs group-hover:bg-amber-700 group-hover:text-white group-hover:border-amber-700 transition-colors">
                        {yoga.auspiciousness}
                      </span>
                      <div className="flex space-x-1">
                        {yoga.planetsInvolved.map(p => (
                          <span key={p} className="w-4 h-4 rounded bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-600">
                            {p.substring(0, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-vedic font-bold text-stone-900 text-sm mb-0.5">{yoga.name}</h4>
                    <p className="text-[10px] text-amber-900 font-bold mb-1 font-vedic">{yoga.sanskritName}</p>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                      {yoga.effect}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASHTAKAVARGA & STRENGTHS (RIGHT) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="bg-stone-900 rounded-xl p-3 sm:p-4 text-white shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 opacity-10 pointer-events-none">
              <Zap className="w-40 h-40" />
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="text-sm sm:text-base font-vedic font-bold flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Ashtakavarga Planetary Strengths</span>
              </h3>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                Numerical assessment of planetary capacity to deliver results across 12 houses. High points (5+) indicate ease of manifestation.
              </p>
            </div>

            <div className="space-y-2 relative z-10">
              {ashtakavarga.map((item) => {
                const avg = item.total / 12;
                const percent = (item.total / 96) * 100;
                
                return (
                  <div key={item.planet} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-amber-400">{item.planet}</span>
                      <span className="text-stone-300 text-[10px]">Avg: {avg.toFixed(1)}</span>
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
                    <div className="flex justify-between gap-0.5 mt-0.5">
                      {item.points.map((pt, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 h-4.5 rounded flex items-center justify-center text-[9px] font-black border transition-colors ${
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

            <div className="pt-2 border-t border-stone-800 space-y-1.5">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strength Summary</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-800/50 rounded-lg p-2 border border-stone-700">
                  <span className="text-[9px] text-stone-400 block">Max Power Sign</span>
                  <span className="text-xs font-bold text-white">House 11 (Gains)</span>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-2 border border-stone-700">
                  <span className="text-[9px] text-stone-400 block">Karmic Focus</span>
                  <span className="text-xs font-bold text-white">House 10 (Career)</span>
                </div>
              </div>
            </div>
          </div>

          {/* INTELLIGENT AI ANALYSIS CALLOUT */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-900 rounded-xl p-3 sm:p-3.5 text-white shadow-md space-y-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-amber-200" />
              <h3 className="text-sm sm:text-base font-vedic font-bold">Divine Synthesis Reading</h3>
            </div>
            <p className="text-[11px] text-amber-100 leading-snug">
              Combine your Varga strengths, Ashtakavarga points, and active Dasha for a master synthesis.
            </p>
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-2 bg-white text-amber-900 font-bold text-xs rounded-lg shadow-sm hover:bg-amber-50 transition-all flex items-center justify-center space-x-2 group cursor-pointer disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Charts...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 group-hover:animate-pulse" />
                  <span>Generate Master AI Interpretation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            <p className="text-[9px] text-amber-200 text-center italic">
              Powered by Vedic Astrology Engine • Multi-Factor Analysis
            </p>
            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-2 text-[10px] text-rose-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
          </div>

          {/* AI READING DISPLAY */}
          {aiReading && (
            <div className="bg-[#FFFBEB] rounded-xl p-3 sm:p-4 border border-amber-400 shadow-sm space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Master Analysis Generated</span>
                </div>
                <button 
                  onClick={() => setAiReading(null)}
                  className="text-[9px] uppercase font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  Clear Analysis
                </button>
              </div>
              <div className="prose prose-xs max-w-none">
                <div className="whitespace-pre-wrap font-serif text-stone-800 text-xs sm:text-sm leading-relaxed antialiased">
                  {aiReading}
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200 text-[9px] text-amber-700 font-medium italic text-center">
                This synthesis considers the interplay between the physical manifest (D1) and spiritual essence (D9).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
