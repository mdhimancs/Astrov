import React, { useState } from 'react';
import { Orbit, Activity, Briefcase, TrendingUp, Users, Heart, Sparkles, Filter } from 'lucide-react';
import { PlanetaryImpactRecord } from '../types';

interface UnifiedPlanetaryImpactTableProps {
  records: PlanetaryImpactRecord[];
  title?: string;
  subtitle?: string;
}

type ColumnFilter = 'all' | 'health' | 'job' | 'business' | 'relation' | 'marriage';

export function UnifiedPlanetaryImpactTable({
  records,
  title = 'Planetary Transits & Life Impacts Table',
  subtitle = 'Specific effects of major planetary changes across Health, Job, Business, Relations, and Marriage',
}: UnifiedPlanetaryImpactTableProps) {
  const [activeFilter, setActiveFilter] = useState<ColumnFilter>('all');

  const getToneBadge = (tone: PlanetaryImpactRecord['tone']) => {
    switch (tone) {
      case 'Auspicious':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Auspicious
          </span>
        );
      case 'Caution':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Caution
          </span>
        );
      case 'Transformative':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            Transformative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Balanced
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-3xs overflow-hidden">
      {/* Dimension Filter Tabs - Zero Pill Underline Style */}
      <div className="px-1 py-0.5 border-b border-stone-100 bg-white/50 backdrop-blur-sm flex items-center justify-between gap-1">
        <div className="flex items-center space-x-1">
          <Orbit className="w-3 h-3 text-amber-700" />
          <h3 className="font-vedic font-bold text-stone-950 text-[9px] uppercase tracking-widest">
            Impacts
          </h3>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'health', label: 'Health', icon: Activity },
            { id: 'job', label: 'Job', icon: Briefcase },
            { id: 'relation', label: 'Relation', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`text-[8px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer border-b-2 flex items-center space-x-0.5 whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'text-amber-800 border-amber-600'
                  : 'text-stone-600 border-transparent hover:text-stone-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The Single Master Unified Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-[9px] border-collapse">
          <thead>
            <tr className="bg-stone-100/80 text-stone-800 border-b border-stone-200 text-[8px] uppercase tracking-wider font-semibold">
              <th className="py-0.5 px-1 sticky left-0 bg-stone-100/95 z-10 min-w-[100px]">
                Planet
              </th>

              {(activeFilter === 'all' || activeFilter === 'health') && (
                <th className="py-0.5 px-1 min-w-[120px]">Health</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'job') && (
                <th className="py-0.5 px-1 min-w-[120px]">Job</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'relation') && (
                <th className="py-0.5 px-1 min-w-[120px]">Relation</th>
              )}

              {activeFilter === 'all' && (
                <th className="py-0.5 px-1 min-w-[140px]">Effect</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200">
            {records.map((rec) => (
              <tr key={rec.planet} className="group hover:bg-[#FAF6EE] transition-colors">
                <td className="py-0.5 px-1 align-top sticky left-0 bg-white group-hover:bg-[#FAF6EE] z-10 border-r border-stone-200/80 shadow-2xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-amber-800 font-bold">{rec.symbol}</span>
                    <span className="font-semibold text-stone-950 text-[9px]">{rec.englishName}</span>
                  </div>
                  <div className="text-[8px] text-stone-500">H{rec.houseFromMoon}M • H{rec.houseFromLagna}L</div>
                </td>

                {(activeFilter === 'all' || activeFilter === 'health') && (
                  <td className="py-0.5 px-1 align-top text-stone-800 leading-tight border-r border-stone-100">
                    <p>{rec.healthEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'job') && (
                  <td className="py-0.5 px-1 align-top text-stone-800 leading-tight border-r border-stone-100">
                    <p>{rec.jobEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'relation') && (
                  <td className="py-0.5 px-1 align-top text-stone-800 leading-tight border-r border-stone-100">
                    <p>{rec.relationEffect}</p>
                  </td>
                )}

                {activeFilter === 'all' && (
                  <td className="py-0.5 px-1 align-top text-stone-950 leading-tight bg-stone-50/40">
                    <p>{rec.specificEffect}</p>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info Strip */}
      <div className="bg-[#FAF8F5] px-2 py-1 border-t border-stone-200 flex flex-wrap items-center justify-between gap-1 text-[10px] text-stone-600">
        <span>
          Calculated via Parashari Hora Shastra Gochar from Janma Rasi (Moon) & Lagna (Ascendant)
        </span>
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Auspicious</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            <span>Caution</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
            <span>Transformative</span>
          </span>
        </div>
      </div>
    </div>
  );
}
