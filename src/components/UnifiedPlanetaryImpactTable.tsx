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
    <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
      {/* Dimension Filter Tabs - Zero Pill Underline Style */}
      <div className="px-2.5 py-2 border-b border-stone-100 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Orbit className="w-4 h-4 text-amber-700" />
          <h3 className="font-vedic font-black text-stone-900 text-[10px] uppercase tracking-widest">
            Transit Impact Table
          </h3>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'health', label: 'Health', icon: Activity },
            { id: 'job', label: 'Job', icon: Briefcase },
            { id: 'business', label: 'Business', icon: TrendingUp },
            { id: 'relation', label: 'Relation', icon: Users },
            { id: 'marriage', label: 'Marriage', icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer pb-0.5 border-b-2 flex items-center space-x-1 whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'text-amber-800 border-amber-600'
                  : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
            >
              {tab.icon && <tab.icon className="w-3 h-3" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The Single Master Unified Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-100/80 text-stone-700 border-b border-stone-200 text-[10px] uppercase tracking-wider font-semibold">
              <th className="py-1 px-1.5 whitespace-nowrap sticky left-0 bg-stone-100/95 z-10 min-w-[120px]">
                Planet & Transit
              </th>

              {(activeFilter === 'all' || activeFilter === 'health') && (
                <th className="py-1 px-1.5 min-w-[150px]">
                  <div className="flex items-center space-x-1 text-emerald-800">
                    <Activity className="w-3 h-3" />
                    <span>Health</span>
                  </div>
                </th>
              )}

              {(activeFilter === 'all' || activeFilter === 'job') && (
                <th className="py-1 px-1.5 min-w-[150px]">
                  <div className="flex items-center space-x-1 text-blue-800">
                    <Briefcase className="w-3 h-3" />
                    <span>Job</span>
                  </div>
                </th>
              )}

              {(activeFilter === 'all' || activeFilter === 'business') && (
                <th className="py-1 px-1.5 min-w-[150px]">
                  <div className="flex items-center space-x-1 text-amber-900">
                    <TrendingUp className="w-3 h-3" />
                    <span>Business</span>
                  </div>
                </th>
              )}

              {(activeFilter === 'all' || activeFilter === 'relation') && (
                <th className="py-1 px-1.5 min-w-[150px]">
                  <div className="flex items-center space-x-1 text-purple-800">
                    <Users className="w-3 h-3" />
                    <span>Relation</span>
                  </div>
                </th>
              )}

              {(activeFilter === 'all' || activeFilter === 'marriage') && (
                <th className="py-1 px-1.5 min-w-[150px]">
                  <div className="flex items-center space-x-1 text-rose-800">
                    <Heart className="w-3 h-3" />
                    <span>Marriage</span>
                  </div>
                </th>
              )}

              {activeFilter === 'all' && (
                <th className="py-1 px-1.5 min-w-[170px]">
                  <div className="flex items-center space-x-1 text-stone-800">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Specific Effect of Planet</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200">
            {records.map((rec) => (
              <tr key={rec.planet} className="group hover:bg-[#FAF6EE] transition-colors">
                {/* Sticky Planet & Transit Info Cell */}
                <td className="py-1 px-1.5 align-top sticky left-0 bg-white group-hover:bg-[#FAF6EE] z-10 border-r border-stone-200/80 shadow-2xs transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <span className="w-4 h-4 rounded bg-stone-100 font-bold text-amber-800 flex items-center justify-center text-[10px]">
                        {rec.symbol}
                      </span>
                      <div>
                        <div className="font-semibold text-stone-900 text-[11px] leading-tight">
                          {rec.englishName}
                        </div>
                        <div className="text-[9px] text-stone-500 font-medium">
                          {rec.planet}
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-stone-600 bg-stone-50 p-1 rounded border border-stone-200/60 space-y-0.2">
                      <div className="font-mono text-stone-800 font-semibold truncate">
                        {rec.transitSign}
                      </div>
                      <div className="text-[9px] text-stone-500">
                        H{rec.houseFromMoon} (M) • H{rec.houseFromLagna} (L)
                      </div>
                      <div className="text-[9px] text-stone-500 truncate">
                        {rec.motionStatus}
                      </div>
                    </div>

                    <div className="pt-0.5">
                      {getToneBadge(rec.tone)}
                    </div>
                  </div>
                </td>

                {/* Health Column */}
                {(activeFilter === 'all' || activeFilter === 'health') && (
                  <td className="py-1 px-1.5 align-top text-stone-700 leading-snug text-[10px] sm:text-[11px] border-r border-stone-100">
                    <div className="space-y-0.5">
                      <span className="sm:hidden font-semibold text-emerald-800 block text-[9px] uppercase">
                        Health:
                      </span>
                      <p>{rec.healthEffect}</p>
                    </div>
                  </td>
                )}

                {/* Job Column */}
                {(activeFilter === 'all' || activeFilter === 'job') && (
                  <td className="py-1 px-1.5 align-top text-stone-700 leading-snug text-[10px] sm:text-[11px] border-r border-stone-100">
                    <div className="space-y-0.5">
                      <span className="sm:hidden font-semibold text-blue-800 block text-[9px] uppercase">
                        Job:
                      </span>
                      <p>{rec.jobEffect}</p>
                    </div>
                  </td>
                )}

                {/* Business Column */}
                {(activeFilter === 'all' || activeFilter === 'business') && (
                  <td className="py-1 px-1.5 align-top text-stone-700 leading-snug text-[10px] sm:text-[11px] border-r border-stone-100">
                    <div className="space-y-0.5">
                      <span className="sm:hidden font-semibold text-amber-900 block text-[9px] uppercase">
                        Business:
                      </span>
                      <p>{rec.businessEffect}</p>
                    </div>
                  </td>
                )}

                {/* Relation Column */}
                {(activeFilter === 'all' || activeFilter === 'relation') && (
                  <td className="py-1 px-1.5 align-top text-stone-700 leading-snug text-[10px] sm:text-[11px] border-r border-stone-100">
                    <div className="space-y-0.5">
                      <span className="sm:hidden font-semibold text-purple-800 block text-[9px] uppercase">
                        Relation:
                      </span>
                      <p>{rec.relationEffect}</p>
                    </div>
                  </td>
                )}

                {/* Marriage Column */}
                {(activeFilter === 'all' || activeFilter === 'marriage') && (
                  <td className="py-1 px-1.5 align-top text-stone-700 leading-snug text-[10px] sm:text-[11px] border-r border-stone-100">
                    <div className="space-y-0.5">
                      <span className="sm:hidden font-semibold text-rose-800 block text-[9px] uppercase">
                        Marriage:
                      </span>
                      <p>{rec.marriageEffect}</p>
                    </div>
                  </td>
                )}

                {/* Specific Effect of the Planet Column */}
                {activeFilter === 'all' && (
                  <td className="py-1 px-1.5 align-top text-stone-800 leading-snug text-[10px] sm:text-[11px] bg-stone-50/40">
                    <div className="space-y-0.5">
                      <span className="sm:hidden font-semibold text-stone-900 block text-[9px] uppercase">
                        Specific Effect:
                      </span>
                      <p className="font-normal text-stone-800">{rec.specificEffect}</p>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info Strip */}
      <div className="bg-[#FAF8F5] px-2 py-1 border-t border-stone-200 flex flex-wrap items-center justify-between gap-1 text-[10px] text-stone-500">
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
