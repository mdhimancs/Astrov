import React, { useMemo } from 'react';
import { Sparkles, Bell, ArrowRight, Activity, Zap, Compass } from 'lucide-react';
import { PlanetPosition, UserProfile } from '../types';

interface PlanetaryAspectsAndAlertsProps {
  planets: PlanetPosition[];
  activeProfile?: UserProfile;
}

export function PlanetaryAspectsAndAlerts({
  planets,
  activeProfile,
}: PlanetaryAspectsAndAlertsProps) {
  // Compute significant aspects (Conjunction: 0°, Opposition: 180°, Trine: 120°)
  const aspects = useMemo(() => {
    const list: {
      planetA: string;
      planetB: string;
      aspectType: 'Conjunction' | 'Opposition' | 'Trine';
      orb: number;
    }[] = [];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const pA = planets[i];
        const pB = planets[j];
        const degA = (pA.rasiNumber - 1) * 30 + pA.degree;
        const degB = (pB.rasiNumber - 1) * 30 + pB.degree;
        let diff = Math.abs(degA - degB);
        if (diff > 180) diff = 360 - diff;

        // Conjunction (~0°), Trine (~120°), Opposition (~180°)
        if (diff <= 8) {
          list.push({ planetA: pA.name, planetB: pB.name, aspectType: 'Conjunction', orb: Number(diff.toFixed(1)) });
        } else if (Math.abs(diff - 120) <= 6) {
          list.push({ planetA: pA.name, planetB: pB.name, aspectType: 'Trine', orb: Number(Math.abs(diff - 120).toFixed(1)) });
        } else if (Math.abs(diff - 180) <= 7) {
          list.push({ planetA: pA.name, planetB: pB.name, aspectType: 'Opposition', orb: Number(Math.abs(diff - 180).toFixed(1)) });
        }
      }
    }
    return list;
  }, [planets]);

  // Compute upcoming simulated planetary ingresses & stations for active profile
  const upcomingAlerts = useMemo(() => {
    const today = new Date();
    const mockAlerts = [
      {
        id: 1,
        title: 'Guru (Jupiter) Direct Station',
        date: new Date(today.getTime() + 4 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        desc: 'Jupiter turns direct in your 2nd / 10th favorable axis, bringing renewed financial expansion and career clarity.',
        type: 'Station',
      },
      {
        id: 2,
        title: 'Shani (Saturn) Transit Ingress',
        date: new Date(today.getTime() + 11 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        desc: 'Saturn shifts precise nakshatra pada, activating disciplined restructuring in professional partnerships.',
        type: 'Ingress',
      },
      {
        id: 3,
        title: 'Surya & Budha Conjunction (Budhaditya)',
        date: new Date(today.getTime() + 18 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        desc: 'Sun and Mercury unite in 9th house of higher wisdom, amplifying intellectual sharpness and public accolades.',
        type: 'Aspect',
      },
    ];
    return mockAlerts;
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 my-3">
      {/* 1. SIGNIFICANT MUTUAL PLANETARY ASPECTS PANEL */}
      <div className="bg-white rounded-xl border border-amber-200/90 p-3.5 shadow-3xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
              <Activity className="w-4 h-4" />
            </span>
            <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
              Significant Planetary Aspects (Yogas &amp; Mutual Influence)
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[10.5px] font-bold border border-amber-300">
            {aspects.length} Active Connections
          </span>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
          {aspects.length === 0 ? (
            <p className="text-[12px] text-stone-500 text-center py-4">No close conjunctions, trines, or oppositions detected within orb.</p>
          ) : (
            aspects.map((asp, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#FAF6EE] border border-amber-200/70 p-2 rounded-lg text-[12px]">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-950">{asp.planetA}</span>
                  <span className="text-amber-700 font-medium text-[11px]">↔</span>
                  <span className="font-bold text-amber-950">{asp.planetB}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                    asp.aspectType === 'Conjunction' ? 'bg-amber-200 text-amber-950 border border-amber-400' :
                    asp.aspectType === 'Trine' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {asp.aspectType}
                  </span>
                  <span className="text-[11px] font-mono text-stone-600">Orb: {asp.orb}°</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. UPCOMING PLANETARY INGRESSES & STATIONS TOAST PANEL */}
      <div className="bg-white rounded-xl border border-amber-200/90 p-3.5 shadow-3xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
              <Bell className="w-4 h-4 animate-bounce" />
            </span>
            <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
              Upcoming Planetary Ingresses &amp; Stations
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10.5px] font-bold border border-emerald-300 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            <span>Active Alerts</span>
          </span>
        </div>

        <div className="space-y-2">
          {upcomingAlerts.map((alert) => (
            <div key={alert.id} className="bg-gradient-to-r from-amber-50/90 to-[#FAF7F2] border border-amber-300/80 p-2.5 rounded-lg flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 text-[13px] flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>{alert.title}</span>
                </span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                  {alert.date}
                </span>
              </div>
              <p className="text-[11.5px] text-stone-700 leading-snug">
                {alert.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
