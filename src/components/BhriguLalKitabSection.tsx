import React, { useState } from 'react';
import { ScrollText, BookOpen, Compass, Sparkles, ShieldAlert, CheckCircle2, Flame, Clock } from 'lucide-react';
import { BhriguLalKitabSummary } from '../types';

interface BhriguLalKitabSectionProps {
  data: BhriguLalKitabSummary;
  seekerName: string;
  forcedView?: 'both' | 'bhrigu' | 'lalkitab';
}

export function BhriguLalKitabSection({
  data,
  seekerName,
  forcedView,
}: BhriguLalKitabSectionProps) {
  const [internalView, setInternalView] = useState<'both' | 'bhrigu' | 'lalkitab'>('both');
  const activeView = forcedView || internalView;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-stone-200 shadow-2xs overflow-hidden space-y-2 p-2.5">
      {/* Section Header & Filter Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-1.5">
        <div className="flex items-center space-x-1.5">
          <ScrollText className="w-4 h-4 text-amber-700" />
          <h3 className="font-vedic font-bold text-stone-950 text-[15px] tracking-tight">
            {activeView === 'bhrigu'
              ? `Maharishi Bhrigu Samhita Interpretation — ${seekerName}`
              : activeView === 'lalkitab'
              ? `Lal Kitab (Red Book) Interpretation & Upay — ${seekerName}`
              : `Bhrigu Samhita & Lal Kitab Interpretation — ${seekerName}`}
          </h3>
        </div>

        {!forcedView && (
          <div className="flex items-center space-x-3 text-[12px] font-black uppercase tracking-wider">
            {[
              { id: 'both', label: 'Both Treatises' },
              { id: 'bhrigu', label: 'Bhrigu Samhita' },
              { id: 'lalkitab', label: 'Lal Kitab' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInternalView(tab.id as any)}
                className={`pb-0.5 border-b-2 transition-all cursor-pointer ${
                  activeView === tab.id
                    ? 'text-amber-800 border-amber-600'
                    : 'text-stone-600 border-transparent hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. MAHARISHI BHRIGU SAMHITA INTERPRETATION */}
      {(activeView === 'both' || activeView === 'bhrigu') && (
        <div className="space-y-2">
          <div className="bg-purple-50/40 rounded-lg border border-purple-200/80 p-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-purple-200/60 pb-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <h4 className="font-vedic font-bold text-purple-950 text-[14px] uppercase tracking-wider">
                  Maharishi Bhrigu Samhita (Nadi & Karmic Blueprint)
                </h4>
              </div>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                Bhrigu Bindu: {data.bhriguBindu.degree}°{data.bhriguBindu.minute}&apos; {data.bhriguBindu.rasiName} (H{data.bhriguBindu.houseFromLagna})
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {/* Purva-Janma Samskara */}
              <div className="bg-white/90 rounded-md border border-purple-100 p-2 space-y-1">
                <span className="text-[12px] font-black text-purple-900 uppercase tracking-wider block">
                  Purva-Janma Samskara & Soul Destiny
                </span>
                <p className="text-[13px] text-stone-800 leading-snug">
                  {data.karmicBlueprint}
                </p>
              </div>

              {/* Bhrigu Bindu Destiny Point */}
              <div className="bg-white/90 rounded-md border border-purple-100 p-2 space-y-1">
                <span className="text-[12px] font-black text-amber-900 uppercase tracking-wider block">
                  Bhrigu Bindu (Rahu–Moon Destiny Midpoint)
                </span>
                <p className="text-[13px] text-stone-800 leading-snug">
                  {data.bhriguBindu.interpretation}
                </p>
              </div>
            </div>

            {/* Bhrigu Chakra Bhagyodaya Ages */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[12px] font-black text-purple-900 uppercase tracking-wider">
                <Clock className="w-3 h-3 text-purple-700" />
                <span>Bhrigu Chakra Progressive Activation Years (Bhagyodaya Ages)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-1.5">
                {data.bhagyodayaAges.map((item) => (
                  <div
                    key={item.age}
                    className="bg-white/95 rounded border border-purple-200/70 px-2 py-1.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-vedic font-bold text-purple-950 text-[13px]">
                        Year {item.age} — {item.planet}
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                        H{item.house}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-700 leading-snug mt-0.5">
                      {item.milestone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LAL KITAB (ARUN SAMHITA / RED BOOK) INTERPRETATION */}
      {(activeView === 'both' || activeView === 'lalkitab') && (
        <div className="space-y-2">
          <div className="bg-rose-50/40 rounded-lg border border-rose-200/80 p-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-rose-200/60 pb-1">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rose-700" />
                <h4 className="font-vedic font-bold text-rose-950 text-[14px] uppercase tracking-wider">
                  Lal Kitab (Red Book) Khana & Karmic Rina Analysis
                </h4>
              </div>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                Fixed Kalpurusha Khana System (Houses 1–12)
              </span>
            </div>

            {/* 4 Ancestral Rina (Karmic Debts) & Lal Kitab Upay */}
            <div className="space-y-1">
              <span className="text-[12px] font-black text-rose-900 uppercase tracking-wider block">
                Lal Kitab Rina (Ancestral & Karmic Debts) & Remedies
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {data.lalKitabRina.map((rina) => (
                  <div
                    key={rina.name}
                    className="bg-white/95 rounded-md border border-rose-200/70 p-2 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-vedic font-bold text-stone-950 text-[13px]">
                        {rina.name}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                          rina.status === 'Harmonized'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        {rina.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-700 leading-snug">{rina.reason}</p>
                    <p className="text-[12px] text-rose-950 leading-snug pt-0.5 border-t border-stone-100">
                      <strong className="text-rose-800 uppercase">Upay: </strong>
                      {rina.upay}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lal Kitab Planetary Khana Placements Table */}
            <div className="space-y-1">
              <span className="text-[12px] font-black text-rose-900 uppercase tracking-wider block">
                Graha Phal in Lal Kitab Khana & Practical Totke (Upay)
              </span>
              <div className="overflow-x-auto w-full bg-white rounded-md border border-rose-200/70">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-rose-50/70 text-stone-900 border-b border-rose-200/70 text-[12px] uppercase tracking-wider font-bold">
                      <th className="py-1 px-2">Graha</th>
                      <th className="py-1 px-2">Natal Khana</th>
                      <th className="py-1 px-2">Pakka Ghar</th>
                      <th className="py-1 px-2">State</th>
                      <th className="py-1 px-2 min-w-[200px]">Lal Kitab Phal (Interpretation)</th>
                      <th className="py-1 px-2 min-w-[200px]">Lal Kitab Upay (Remedy)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.lalKitabPlanetPlacements.map((item) => (
                      <tr key={item.planet} className="hover:bg-rose-50/20 transition-colors">
                        <td className="py-1.5 px-2 font-bold text-stone-950 whitespace-nowrap">
                          {item.planet}
                        </td>
                        <td className="py-1.5 px-2 font-semibold text-amber-900 whitespace-nowrap">
                          Khana {item.khana}
                        </td>
                        <td className="py-1.5 px-2 text-stone-700 whitespace-nowrap text-[12px]">
                          {item.pakkaGhar}
                        </td>
                        <td className="py-1.5 px-2 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                              item.status === 'Awakened (Shubh)'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.status === 'Caution (Manda)'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-stone-50 text-stone-800 border-stone-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-stone-800 leading-snug">
                          {item.effect}
                        </td>
                        <td className="py-1.5 px-2 text-rose-950 leading-snug bg-rose-50/15">
                          {item.remedy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
