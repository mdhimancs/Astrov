import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Award,
  Layers,
  Compass,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { PlanetPosition, TajikaSuite } from '../types';
import { calculateTajikaSuite } from '../vedicMath';

interface TajikaSectionProps {
  birthDate: string;
  lagnaRasi: number;
  planets: PlanetPosition[];
  seekerName: string;
}

export function TajikaSection({
  birthDate,
  lagnaRasi,
  planets,
  seekerName,
}: TajikaSectionProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeSubTab, setActiveSubTab] = useState<'muntha' | 'varshesha' | 'sahams' | 'yogas'>('muntha');

  const tajikaSuite: TajikaSuite = React.useMemo(() => {
    return calculateTajikaSuite(birthDate, lagnaRasi, planets, selectedYear);
  }, [birthDate, lagnaRasi, planets, selectedYear]);

  const yearOptions = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
    currentYear + 5,
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-amber-300/80 shadow-2xs overflow-hidden space-y-2 p-2.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-1.5">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-800" />
          </span>
          <div>
            <h3 className="font-vedic font-black text-stone-950 text-[15px] leading-tight">
              Tajika Varshaphal System — Tajik Neelakanthi &amp; Solar Return
            </h3>
            <p className="text-[11px] text-stone-600">
              Classical annual progression science decoding Muntha, Varshesha (Year Lord), 16 Tajik Yogas, and sensitive Sahams (Arabic Parts)
            </p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[11px] font-bold text-stone-600">Year:</span>
          <div className="flex rounded border border-stone-200 bg-[#FAF8F5] p-0.5 text-[11px] shadow-3xs">
            {yearOptions.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin">
        {[
          { id: 'muntha', label: 'Muntha Progression', icon: TrendingUp },
          { id: 'varshesha', label: 'Varshesha (Lord of Year)', icon: Award },
          { id: 'sahams', label: '6 Tajik Sahams', icon: Sparkles },
          { id: 'yogas', label: 'Tajik 16 Yogas', icon: Layers },
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

      {/* 1. MUNTHA PROGRESSION VIEW */}
      {activeSubTab === 'muntha' && (
        <div className="space-y-2">
          <div className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-100 pb-1.5">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                  Solar Annual Pivot Point
                </span>
                <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
                  Muntha in {tajikaSuite.muntha.rasiName} (Bhava {tajikaSuite.muntha.houseFromLagna})
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Lord: {tajikaSuite.muntha.signLord}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    tajikaSuite.muntha.nature === 'Auspicious'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : tajikaSuite.muntha.nature === 'Moderate'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {tajikaSuite.muntha.nature}
                </span>
              </div>
            </div>

            <p className="text-[12.5px] text-stone-800 leading-relaxed font-medium">
              {tajikaSuite.muntha.verdict}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-white rounded border border-stone-200/80 p-2 text-[11px]">
                <span className="text-stone-500 font-bold block">Solar Cycle:</span>
                <span className="font-vedic font-bold text-stone-950 text-[12px]">
                  Age {tajikaSuite.completedAge} Solar Year
                </span>
              </div>
              <div className="bg-white rounded border border-stone-200/80 p-2 text-[11px]">
                <span className="text-stone-500 font-bold block">Progression Rule:</span>
                <span className="font-vedic font-bold text-stone-950 text-[12px]">
                  1 Sign / Year from Janma Lagna
                </span>
              </div>
              <div className="bg-white rounded border border-stone-200/80 p-2 text-[11px]">
                <span className="text-stone-500 font-bold block">Benefic Placements:</span>
                <span className="font-vedic font-bold text-stone-950 text-[12px]">
                  9th, 10th, 11th, 1st Bhavas
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VARSHESHA (LORD OF THE YEAR) */}
      {activeSubTab === 'varshesha' && (
        <div className="space-y-2">
          <div className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-2">
            <div className="flex items-center space-x-2 border-b border-amber-100 pb-1.5">
              <div className="w-8 h-8 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-[14px]">
                👑
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  Supreme Cosmic Administrator
                </span>
                <h4 className="font-vedic font-black text-stone-950 text-[15px]">
                  {tajikaSuite.varshesha.title}
                </h4>
              </div>
            </div>

            <div className="text-[12px] text-amber-900 font-bold">
              {tajikaSuite.varshesha.office}
            </div>

            <p className="text-[12.5px] text-stone-800 leading-relaxed font-medium">
              {tajikaSuite.varshesha.rulingEffect}
            </p>

            <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-stone-700 leading-snug">
              <strong>Pancha-Adhikari Canon:</strong> In Tajik Neelakanthi, the Varsha Lord is elected through rigorous Panchavargiya Bala evaluating Muntha Lord, Janma Lagna Lord, Varsha Lagna Lord, Tri-Rasi Lord, and Dina/Ratri Lord.
            </div>
          </div>
        </div>
      )}

      {/* 3. 6 TAJIK SAHAMS (ARABIC SENSITIVE POINTS) */}
      {activeSubTab === 'sahams' && (
        <div className="space-y-2">
          <div className="text-[11px] text-stone-500 font-semibold px-0.5">
            Sahams are exact mathematical intersection points between planetary arc degrees and the ascendant, pinpointing specific life manifestations.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tajikaSuite.sahams.map((s) => (
              <div
                key={s.name}
                className="bg-[#FAF8F5] rounded-lg border border-stone-200/90 p-2.5 space-y-1.5 shadow-3xs hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <div>
                    <h5 className="font-vedic font-bold text-stone-950 text-[13px]">
                      {s.name}
                    </h5>
                    <span className="text-[10px] text-amber-900 font-semibold">{s.sanskritName}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
                    H{s.house}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-700">
                  <span>Sign: <strong className="text-stone-900">{s.rasiName}</strong> ({s.degree}°)</span>
                  <span>Lord: <strong className="text-stone-900">{s.lord}</strong></span>
                </div>

                <p className="text-[11.5px] text-stone-600 leading-snug">
                  {s.significance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAJIK 16 YOGAS */}
      {activeSubTab === 'yogas' && (
        <div className="space-y-2">
          <div className="text-[11px] text-stone-500 font-semibold px-0.5">
            Unlike classical Parashari aspects based on whole signs, Tajik Yogas operate on exact planetary degree orbs (Deepthamsa).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tajikaSuite.tajikYogas.map((yoga, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-lg border border-amber-200 p-2.5 space-y-1.5 shadow-3xs"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <span className="font-vedic font-bold text-stone-950 text-[13px]">
                    {yoga.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900">
                    Orb: {yoga.orb}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-amber-900 font-semibold">
                  <span>Active Grahas: {yoga.planetsInvolved.join(', ')}</span>
                  <span>•</span>
                  <span>{yoga.category}</span>
                </div>

                <p className="text-[11.5px] text-stone-700 leading-snug">
                  {yoga.verdict}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
