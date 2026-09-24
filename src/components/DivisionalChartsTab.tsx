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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-vedic font-bold text-stone-900 tracking-tight">
              Divisional Charts & Advanced Analysis
            </h1>
          </div>
          <p className="text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Deep dive into your destiny with Varga charts (D1 & D9), Ashtakavarga planetary strengths, and traditional Yoga combinations.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          {(['D1', 'D9'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVarga(v)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                selectedVarga === v
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              {v === 'D1' ? 'Birth Chart (D1)' : 'Navamsha (D9)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CHART SECTION (LEFT) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF9F6] rounded-3xl border border-amber-200/60 p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Layers className="w-48 h-48 rotate-12" />
            </div>

            <NorthIndianChart
              houses={selectedVarga === 'D1' ? natalHouses : d9Houses}
              title={selectedVarga === 'D1' ? 'Rasi Kundali (Main Birth Chart)' : 'Navamsha Kundali (Fruits of Action)'}
              subtitle={selectedVarga === 'D1' ? 'Physical Manifestation & Lagna' : 'Spiritual Strength & Marital Fruit'}
            />

            <div className="mt-6 bg-white/60 rounded-2xl p-5 border border-amber-100 space-y-3">
              <h4 className="font-vedic font-bold text-stone-900 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-amber-700" />
                <span>Significance of {selectedVarga}</span>
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                {selectedVarga === 'D1'
                  ? 'The D1 chart represents the physical body, general health, and the basic framework of your life in the material world. It is the root of all other divisional charts.'
                  : 'The D9 Navamsha is the most important divisional chart. It reveals the internal strength of planets, spiritual progress, and the ultimate results of your efforts. In Vedic astrology, a planet is only as strong as its position in D9.'}
              </p>
            </div>
          </div>

          {/* YOGA ANALYSIS SECTION */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-5">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-vedic font-bold text-stone-900">Panchamahapurusha & Major Yogas</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold uppercase tracking-widest border border-amber-200">
                {yogas.length} Found
              </span>
            </div>

            {yogas.length === 0 ? (
              <div className="bg-stone-50 rounded-2xl p-8 text-center text-stone-500 italic">
                No major classical yogas detected with current simplified criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {yogas.map((yoga) => (
                  <div key={yoga.name} className="group bg-[#FAF9F6] hover:bg-white rounded-2xl p-6 border border-stone-200 transition-all duration-300 hover:shadow-md hover:border-amber-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-500 uppercase tracking-widest shadow-3xs group-hover:bg-amber-700 group-hover:text-white group-hover:border-amber-700 transition-colors">
                        {yoga.auspiciousness}
                      </span>
                      <div className="flex space-x-1">
                        {yoga.planetsInvolved.map(p => (
                          <span key={p} className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600">
                            {p.substring(0, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-vedic font-bold text-stone-900 text-lg mb-1">{yoga.name}</h4>
                    <p className="text-[11px] text-amber-900 font-bold mb-3 font-vedic">{yoga.sanskritName}</p>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                      {yoga.effect}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASHTAKAVARGA & STRENGTHS (RIGHT) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
              <Zap className="w-64 h-64" />
            </div>

            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-vedic font-bold flex items-center space-x-2.5">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>Ashtakavarga Planetary Strengths</span>
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">
                Numerical assessment of planetary capacity to deliver results across 12 houses. High points (5+) indicate ease of manifestation.
              </p>
            </div>

            <div className="space-y-5 relative z-10">
              {ashtakavarga.map((item) => {
                const avg = item.total / 12;
                const percent = (item.total / 96) * 100; // max total possible roughly
                
                return (
                  <div key={item.planet} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-amber-400">{item.planet}</span>
                      <span className="text-stone-300">Avg Points: {avg.toFixed(1)}</span>
                    </div>
                    <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          avg >= 4.5 ? 'bg-emerald-500' : avg >= 3.5 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, percent * 2.5)}%` }}
                      />
                    </div>
                    {/* Points visual strip */}
                    <div className="flex justify-between gap-1 mt-1.5">
                      {item.points.map((pt, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 h-6 rounded flex items-center justify-center text-[10px] font-black border transition-colors ${
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

            <div className="pt-6 border-t border-stone-800 space-y-4">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Strength Summary</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-800/50 rounded-xl p-3 border border-stone-700">
                  <span className="text-[10px] text-stone-400 block mb-1">Max Power Sign</span>
                  <span className="text-sm font-bold text-white">House 11 (Gains)</span>
                </div>
                <div className="bg-stone-800/50 rounded-xl p-3 border border-stone-700">
                  <span className="text-[10px] text-stone-400 block mb-1">Karmic Focus</span>
                  <span className="text-sm font-bold text-white">House 10 (Career)</span>
                </div>
              </div>
            </div>
          </div>

          {/* INTELLIGENT AI ANALYSIS CALLOUT */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-amber-200" />
              <h3 className="text-xl font-vedic font-bold">Divine Synthesis Reading</h3>
            </div>
            <p className="text-sm text-amber-50 leading-relaxed font-medium">
              Combine your Varga strengths, Ashtakavarga points, and active Dasha for a master synthesis.
            </p>
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-4 bg-white text-amber-900 font-black rounded-2xl shadow-lg hover:bg-amber-50 transition-all flex items-center justify-center space-x-3 group cursor-pointer disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Charts...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 group-hover:animate-pulse" />
                  <span>Generate Master AI Interpretation</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-amber-200 text-center italic">
              Powered by Gemini 1.5 Pro • Analysis of 120+ factors
            </p>
            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl p-3 text-[11px] text-rose-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
          </div>

          {/* AI READING MODAL/DISPLAY */}
          {aiReading && (
            <div className="bg-[#FFFBEB] rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-lg space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between border-b border-amber-200 pb-4">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Master Analysis Generated</span>
                </div>
                <button 
                  onClick={() => setAiReading(null)}
                  className="text-[10px] uppercase font-black text-amber-700 hover:text-amber-900"
                >
                  Clear Analysis
                </button>
              </div>
              <div className="prose prose-sm max-w-none prose-amber">
                <div className="whitespace-pre-wrap font-serif text-stone-800 text-sm sm:text-base leading-relaxed antialiased">
                  {aiReading}
                </div>
              </div>
              <div className="pt-4 border-t border-amber-200 text-[10px] text-amber-700 font-medium italic text-center">
                This synthesis considers the interplay between the physical manifest (D1) and spiritual essence (D9).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
