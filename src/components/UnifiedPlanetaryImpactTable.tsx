import React, { useState } from 'react';
import { Orbit, Activity, Briefcase, TrendingUp, Users, Heart, Sparkles, Filter, GraduationCap, Brain } from 'lucide-react';
import { PlanetaryImpactRecord } from '../types';

interface UnifiedPlanetaryImpactTableProps {
  records: PlanetaryImpactRecord[];
  title?: string;
  subtitle?: string;
}

type ColumnFilter = 'all' | 'health' | 'job' | 'business' | 'relation' | 'marriage' | 'education' | 'mentalState';

export function UnifiedPlanetaryImpactTable({
  records,
  title = 'Planetary Transits & Life Impacts Table',
  subtitle = 'Specific effects of major planetary changes across Health, Job, Relations, Education, and Mental State',
}: UnifiedPlanetaryImpactTableProps) {
  const [activeFilter, setActiveFilter] = useState<ColumnFilter>('all');

  const getToneBadge = (tone: PlanetaryImpactRecord['tone']) => {
    switch (tone) {
      case 'Auspicious':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[14px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Auspicious
          </span>
        );
      case 'Caution':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[14px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Caution
          </span>
        );
      case 'Transformative':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[14px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            Transformative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[14px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Balanced
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-3xs overflow-hidden">
      {/* Dimension Filter Tabs - Zero Pill Underline Style */}
      <div className="px-2.5 py-1.5 border-b border-stone-100 bg-white/60 backdrop-blur-sm flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <Orbit className="w-3.5 h-3.5 text-amber-700" />
          <h3 className="font-vedic font-bold text-stone-950 text-[13px] uppercase tracking-wider">
            Impacts
          </h3>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'all', label: 'All', icon: Orbit },
            { id: 'health', label: 'Health', icon: Activity },
            { id: 'job', label: 'Job', icon: Briefcase },
            { id: 'business', label: 'Wealth', icon: TrendingUp },
            { id: 'relation', label: 'Relation', icon: Users },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'mentalState', label: 'Mental State', icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all duration-150 cursor-pointer border flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
              >
                <span>{tab.label}</span>
                <Icon className={`w-3 h-3 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* The Single Master Unified Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="bg-stone-100/80 text-stone-800 border-b border-stone-200 text-[12px] uppercase tracking-wider font-semibold">
              <th className="py-1 px-2 sticky left-0 bg-stone-100/95 z-10 min-w-[110px]">
                Planet
              </th>

              {(activeFilter === 'all' || activeFilter === 'health') && (
                <th className="py-1 px-2 min-w-[140px]">Health</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'job') && (
                <th className="py-1 px-2 min-w-[140px]">Job</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'business') && (
                <th className="py-1 px-2 min-w-[140px]">Wealth</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'relation') && (
                <th className="py-1 px-2 min-w-[140px]">Relation</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'education') && (
                <th className="py-1 px-2 min-w-[140px]">Education</th>
              )}

              {(activeFilter === 'all' || activeFilter === 'mentalState') && (
                <th className="py-1 px-2 min-w-[140px]">Mental State</th>
              )}

              {activeFilter === 'all' && (
                <th className="py-1 px-2 min-w-[160px]">Effect</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200">
            {records.map((rec) => (
              <tr key={rec.planet} className="group hover:bg-[#FAF6EE] transition-colors">
                <td className="py-1.5 px-2 align-top sticky left-0 bg-white group-hover:bg-[#FAF6EE] z-10 border-r border-stone-200/80 shadow-2xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-800 font-bold">{rec.symbol}</span>
                    <span className="font-semibold text-stone-950 text-[13px]">{rec.englishName}</span>
                  </div>
                  <div className="text-[12px] text-stone-500">H{rec.houseFromMoon}M • H{rec.houseFromLagna}L</div>
                </td>

                {(activeFilter === 'all' || activeFilter === 'health') && (
                  <td className="py-1.5 px-2 align-top text-stone-800 leading-snug border-r border-stone-100">
                    <p>{rec.healthEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'job') && (
                  <td className="py-1.5 px-2 align-top text-stone-800 leading-snug border-r border-stone-100">
                    <p>{rec.jobEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'business') && (
                  <td className="py-1.5 px-2 align-top text-stone-800 leading-snug border-r border-stone-100">
                    <p>{rec.businessEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'relation') && (
                  <td className="py-1.5 px-2 align-top text-stone-800 leading-snug border-r border-stone-100">
                    <p>{rec.relationEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'education') && (
                  <td className="py-1.5 px-2 align-top text-stone-800 leading-snug border-r border-stone-100">
                    <p>{rec.educationEffect}</p>
                  </td>
                )}

                {(activeFilter === 'all' || activeFilter === 'mentalState') && (
                  <td className="py-1.5 px-2 align-top text-stone-800 leading-snug border-r border-stone-100">
                    <p>{rec.mentalStateEffect}</p>
                  </td>
                )}

                {activeFilter === 'all' && (
                  <td className="py-1.5 px-2 align-top text-stone-950 leading-snug bg-stone-50/40">
                    <p>{rec.specificEffect}</p>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info Strip */}
      <div className="bg-[#FAF8F5] px-2.5 py-1.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[14px] text-stone-600">
        <span>
          Calculated via Parashari Hora Shastra Gochar from Janma Rasi (Moon) & Lagna (Ascendant)
        </span>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Auspicious</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Caution</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            <span>Transformative</span>
          </span>
        </div>
      </div>
    </div>
  );
}
