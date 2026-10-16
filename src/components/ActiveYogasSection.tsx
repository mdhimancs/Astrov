import React, { useState, useMemo } from 'react';
import {
  Award,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Coins,
  BookOpen,
  Compass,
  ArrowUpRight,
  Flame,
  Info,
} from 'lucide-react';
import { NatalYoga, VimshottariDashaInfo, GrahaName } from '../types';

interface ActiveYogasSectionProps {
  yogas: NatalYoga[];
  vimshottariDasha?: VimshottariDashaInfo | null;
  activeAntardashaLord?: GrahaName;
  onNavigateToDasha?: () => void;
}

export function ActiveYogasSection({
  yogas,
  vimshottariDasha,
  activeAntardashaLord,
  onNavigateToDasha,
}: ActiveYogasSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  const currentMahaLord = vimshottariDasha?.currentLord;
  const currentAntarLord = activeAntardashaLord;

  // Filtered Yogas
  const filteredYogas = useMemo(() => {
    return yogas.filter((y) => {
      if (filterActiveOnly && !y.isDashaActive) {
        return false;
      }
      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'ACTIVE') return y.isDashaActive;
      if (selectedCategory === 'RAJA') return y.category === 'Raja Yoga';
      if (selectedCategory === 'DHANA') return y.category === 'Dhana Yoga';
      if (selectedCategory === 'MAHAPURUSHA') return y.category === 'Mahapurusha Yoga';
      if (selectedCategory === 'INTELLECT') return y.category === 'Intellect & Speech';
      if (selectedCategory === 'SPIRITUAL') return y.category === 'Spiritual & Protection';
      return true;
    });
  }, [yogas, selectedCategory, filterActiveOnly]);

  const activeCount = useMemo(() => yogas.filter((y) => y.isDashaActive).length, [yogas]);
  const rajaCount = useMemo(() => yogas.filter((y) => y.category === 'Raja Yoga').length, [yogas]);
  const dhanaCount = useMemo(() => yogas.filter((y) => y.category === 'Dhana Yoga').length, [yogas]);

  return (
    <div className="bg-white rounded-lg border border-[#E8DEC8] p-3 shadow-2xs space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DEC8] pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              <Crown className="w-4 h-4 text-amber-800" />
            </span>
            <h3 className="font-vedic font-bold text-stone-950 text-[16px] leading-tight">
              Active Yogas &amp; Dasha Activation
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-bold text-[11px]">
              {yogas.length} Natal Yogas
            </span>
          </div>
          <p className="text-[12px] text-stone-600">
            Classical planetary yogas in your natal chart and their live activation by current Vimshottari Dasha
          </p>
        </div>

        {/* Current Active Dasha Badge & Cross-Nav */}
        <div className="flex items-center space-x-2 shrink-0">
          {currentMahaLord && (
            <div className="px-2.5 py-1 rounded bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200 text-[11px] shadow-3xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-1 ring-emerald-300 inline-block" />
              <span className="text-stone-700 font-medium">Running:</span>
              <strong className="text-purple-950 font-bold">
                {currentMahaLord} Maha {currentAntarLord ? `• ${currentAntarLord} Antar` : ''}
              </strong>
            </div>
          )}
          {onNavigateToDasha && (
            <button
              type="button"
              onClick={onNavigateToDasha}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-bold transition-colors cursor-pointer shadow-3xs"
              title="Open Vimshottari Dasha timeline for sub-periods"
            >
              <span>Dasha Tab</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Dasha Activation Principle Callout */}
      <div className="bg-gradient-to-r from-amber-50/80 via-[#FAF7F0] to-purple-50/60 rounded-md border border-amber-300/80 p-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[11.5px] shadow-3xs">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-stone-700 leading-snug">
            <strong className="text-stone-900">Parashari Principle:</strong> Natal yogas represent inherent potential. They deliver their strongest material and spiritual breakthroughs when the running{' '}
            <strong className="text-purple-950">Mahadasha</strong> or <strong className="text-amber-950">Antardasha</strong> belongs to one of the planets forming the yoga.
          </p>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer border flex items-center space-x-1.5 shadow-3xs ${
              filterActiveOnly
                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-300'
                : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Zap className={`w-3 h-3 ${filterActiveOnly ? 'text-amber-200' : 'text-emerald-600'}`} />
            <span>Show Only Dasha-Activated ({activeCount})</span>
          </button>
        </div>
      </div>

      {/* Summary Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#FAF8F5] rounded-md border border-stone-200 p-2 text-center">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Natal Yogas
          </span>
          <span className="text-[18px] font-vedic font-black text-stone-900">
            {yogas.length}
          </span>
        </div>
        <div className="bg-emerald-50/70 rounded-md border border-emerald-200 p-2 text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center justify-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active in Dasha</span>
          </span>
          <span className="text-[18px] font-vedic font-black text-emerald-950">
            {activeCount}
          </span>
        </div>
        <div className="bg-amber-50/70 rounded-md border border-amber-200 p-2 text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Raja Yogas
          </span>
          <span className="text-[18px] font-vedic font-black text-amber-950">
            {rajaCount}
          </span>
        </div>
        <div className="bg-purple-50/70 rounded-md border border-purple-200 p-2 text-center">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Dhana Yogas
          </span>
          <span className="text-[18px] font-vedic font-black text-purple-950">
            {dhanaCount}
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 pb-1.5 text-[11px]">
        {[
          { id: 'ALL', label: `All Yogas (${yogas.length})` },
          { id: 'ACTIVE', label: `⚡ Active in Dasha (${activeCount})` },
          { id: 'RAJA', label: `Raja Yogas (${rajaCount})` },
          { id: 'DHANA', label: `Dhana Yogas (${dhanaCount})` },
          { id: 'MAHAPURUSHA', label: 'Mahapurusha' },
          { id: 'INTELLECT', label: 'Intellect & Speech' },
          { id: 'SPIRITUAL', label: 'Spiritual' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedCategory(tab.id);
                if (tab.id === 'ACTIVE') setFilterActiveOnly(true);
                else setFilterActiveOnly(false);
              }}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300 shadow-3xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:bg-[#FAF8F5]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Yogas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredYogas.map((yoga, idx) => {
          const isActive = yoga.isDashaActive;
          return (
            <div
              key={`${yoga.name}-${idx}`}
              className={`rounded-lg border p-3 space-y-2 transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40 border-emerald-400 ring-1 ring-emerald-300 shadow-2xs'
                  : 'bg-white border-stone-200/90 hover:border-amber-300 shadow-3xs'
              }`}
            >
              <div className="space-y-1.5">
                {/* Top Row: Name, Sanskrit, and Dasha Status Pill */}
                <div className="flex flex-wrap items-start justify-between gap-1 border-b border-stone-100 pb-1.5">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-vedic font-bold text-stone-950 text-[14px] leading-tight">
                        {yoga.name}
                      </h4>
                      <span className="text-[12px] font-vedic text-stone-500">
                        ({yoga.sanskritName})
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                      {yoga.category || 'Vedic Yoga'} • {yoga.auspiciousness}
                    </span>
                  </div>

                  {/* Dasha Activation Badge */}
                  <div>
                    {isActive ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse inline-block" />
                        <span>{yoga.activationStatus || 'Active in Dasha'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>Dormant (Awaiting Dasha)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Planets Involved Chips */}
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Planets Involved:
                  </span>
                  {yoga.planetsInvolved.map((pName) => {
                    const isParticipatingInCurrentDasha =
                      pName === currentMahaLord || pName === currentAntarLord;
                    return (
                      <span
                        key={pName}
                        className={`px-1.5 py-0.2 rounded border font-semibold text-[10.5px] ${
                          isParticipatingInCurrentDasha
                            ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold ring-1 ring-amber-300'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {pName}
                        {isParticipatingInCurrentDasha && ' ★ (Active)'}
                      </span>
                    );
                  })}
                </div>

                {/* Significance Callout */}
                {yoga.significance && (
                  <div className="bg-amber-50/50 rounded p-2 border border-amber-200/70 text-[11.5px] text-stone-800 leading-snug">
                    <strong className="text-amber-950 font-bold block mb-0.5">
                      Significance &amp; Life Impact:
                    </strong>
                    <span>{yoga.significance}</span>
                  </div>
                )}

                {/* Effect Details */}
                <p className="text-[12px] text-stone-700 leading-snug">
                  {yoga.effect}
                </p>
              </div>

              {/* Dasha Activation Context Footer */}
              <div
                className={`rounded px-2 py-1 text-[11px] leading-snug border ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200 font-medium'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                <div className="flex items-start space-x-1.5">
                  <Zap
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      isActive ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  />
                  <div>
                    <strong className={isActive ? 'text-emerald-900 font-bold' : 'text-stone-700 font-semibold'}>
                      Dasha Timing Status:
                    </strong>{' '}
                    <span>
                      {yoga.activationExplanation ||
                        (isActive
                          ? `Energized by ${yoga.activatingPlanet} in your current Dasha cycle.`
                          : `Operates as inherent talent; peaks during ${yoga.planetsInvolved.join(' or ')} dasha periods.`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredYogas.length === 0 && (
        <div className="bg-stone-50 rounded-md border border-stone-200 p-6 text-center text-stone-500 text-[13px]">
          No yogas found under this filter. Switch to "All Yogas" to view your full natal blueprint.
        </div>
      )}
    </div>
  );
}
