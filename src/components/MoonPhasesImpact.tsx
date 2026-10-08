import React, { useMemo } from 'react';
import {
  Moon,
  Zap,
  ShieldCheck,
  Brain,
  Sparkles,
  Compass,
  Activity,
  Heart,
} from 'lucide-react';
import { PlanetPosition, UserProfile } from '../types';
import { calculatePlanetaryPositions, normalizeDegrees } from '../vedicMath';
import { VEDIC_RASIS } from '../data';

interface MoonPhasesImpactProps {
  activeProfile?: UserProfile;
  natalPlanets?: PlanetPosition[];
  natalLagnaRasi?: number;
}

export function MoonPhasesImpact({
  activeProfile,
  natalPlanets = [],
  natalLagnaRasi = 1,
}: MoonPhasesImpactProps) {
  const currentDate = new Date();

  // 1. Calculate Current Moon & Sun for Phase
  const transitCalc = useMemo(() => {
    return calculatePlanetaryPositions(currentDate, activeProfile?.latitude || 28.6, activeProfile?.longitude || 77.2);
  }, [activeProfile, currentDate]);

  const currentMoon = transitCalc.planets.find((p) => p.name === 'Chandra');
  const currentSun = transitCalc.planets.find((p) => p.name === 'Surya');

  // 2. Determine Moon Phase (Tithi)
  const moonPhaseData = useMemo(() => {
    if (!currentMoon || !currentSun) return null;
    
    const diff = normalizeDegrees(currentMoon.totalDeg! - currentSun.totalDeg!);
    const tithiNum = Math.floor(diff / 12) + 1; // 1 to 30
    const isShukla = tithiNum <= 15;
    
    // Percent illumination (approximate)
    let illumination = 0;
    if (diff <= 180) illumination = (diff / 180) * 100;
    else illumination = ((360 - diff) / 180) * 100;

    const phases = [
      { name: 'New Moon (Amavasya)', range: [354, 6] },
      { name: 'Waxing Crescent', range: [6, 84] },
      { name: 'First Quarter', range: [84, 96] },
      { name: 'Waxing Gibbous', range: [96, 174] },
      { name: 'Full Moon (Purnima)', range: [174, 186] },
      { name: 'Waning Gibbous', range: [186, 264] },
      { name: 'Third Quarter', range: [264, 276] },
      { name: 'Waning Crescent', range: [276, 354] },
    ];

    const phase = phases.find(p => {
      const [min, max] = p.range;
      if (min > max) return diff >= min || diff < max;
      return diff >= min && diff < max;
    }) || phases[0];

    return {
      tithi: tithiNum,
      isShukla,
      illumination: Math.round(illumination),
      phaseName: phase.name,
      diff,
    };
  }, [currentMoon, currentSun]);

  // 3. Astrological Impact on Natal Chart
  const impactData = useMemo(() => {
    if (!currentMoon || !natalLagnaRasi) return null;

    // Transiting House relative to Natal Lagna
    const transitHouse = ((currentMoon.rasiNumber - natalLagnaRasi + 12) % 12) + 1;
    
    // Chandra-Bala (Moon's strength for the day relative to Natal Moon Rasi)
    const natalMoon = natalPlanets.find(p => p.name === 'Chandra');
    const chandraBalaHouse = natalMoon 
      ? ((currentMoon.rasiNumber - natalMoon.rasiNumber + 12) % 12) + 1
      : 1;

    const chandraBalaVerdicts: Record<number, { quality: 'Auspicious' | 'Moderate' | 'Sensitive', text: string }> = {
      1: { quality: 'Auspicious', text: 'Excellent for health, vitality, and personal new beginnings.' },
      2: { quality: 'Moderate', text: 'Good for financial planning and family discussions.' },
      3: { quality: 'Auspicious', text: 'Highly energetic; great for communication and short journeys.' },
      4: { quality: 'Sensitive', text: 'Focus on domestic peace; avoid emotional confrontations.' },
      5: { quality: 'Moderate', text: 'Creative inspiration is high; good for intellectual pursuits.' },
      6: { quality: 'Auspicious', text: 'Success in overcoming obstacles; discipline pays off today.' },
      7: { quality: 'Auspicious', text: 'Harmony in partnerships and social interactions.' },
      8: { quality: 'Sensitive', text: 'Karmic pressure; avoid major risks or surgery today.' },
      9: { quality: 'Moderate', text: 'Dharmic expansion; good for spiritual study or long travel.' },
      10: { quality: 'Auspicious', text: 'Professional peak; recognition and career growth likely.' },
      11: { quality: 'Auspicious', text: 'Gains from friends and social networks; ambitions fulfilled.' },
      12: { quality: 'Sensitive', text: 'Internal reflection required; watch your expenses.' },
    };

    const houseImpacts: Record<number, string> = {
      1: 'Focus on self-identity and physical appearance.',
      2: 'Activity in wealth and speech sectors.',
      3: 'Strong communicative drive and sibling interactions.',
      4: 'Emotional roots and home life are highlighted.',
      5: 'Children, romance, and creative intelligence take center stage.',
      6: 'Daily routine, health, and service tasks.',
      7: 'Significant focus on one-on-one relationships.',
      8: 'Deep transformation and shared resources.',
      9: 'Higher learning, belief systems, and long-range goals.',
      10: 'Public reputation and professional status.',
      11: 'Social associations and larger community goals.',
      12: 'Seclusion, spiritual healing, and subconscious work.',
    };

    return {
      transitHouse,
      chandraBala: chandraBalaVerdicts[chandraBalaHouse],
      houseVerdict: houseImpacts[transitHouse],
      chandraBalaHouse,
    };
  }, [currentMoon, natalLagnaRasi, natalPlanets]);

  if (!moonPhaseData || !impactData || !currentMoon) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-sky-200 shadow-2xs overflow-hidden space-y-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-full bg-sky-50 text-sky-700">
            <Moon className="w-4 h-4" />
          </div>
          <h3 className="font-vedic font-black text-stone-900 text-[15px] uppercase tracking-tight">
            Daily Moon Phase & Impact
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-bold text-stone-500">
          <span>{currentDate.toLocaleDateString()}</span>
          <span className="text-stone-300">|</span>
          <span className="text-sky-700 uppercase">{moonPhaseData.phaseName}</span>
        </div>
      </div>

      {/* Visual Phase Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-sky-950 rounded-lg p-3 text-white relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="relative z-10">
            <div className="text-[11px] font-black uppercase text-sky-300 tracking-widest mb-1">
              Current Lunar State
            </div>
            <div className="text-[22px] font-vedic font-black leading-tight">
              {moonPhaseData.isShukla ? 'Shukla' : 'Krishna'} Paksha
            </div>
            <div className="text-[13px] text-sky-100 font-semibold">
              Tithi: {moonPhaseData.tithi} • Illumination: {moonPhaseData.illumination}%
            </div>
          </div>
          
          {/* Moon Icon Animation/Visual */}
          <div className="absolute right-[-10px] bottom-[-10px] opacity-20">
            <Moon className="w-24 h-24 text-white" fill="currentColor" />
          </div>

          <div className="relative z-10 flex items-center space-x-1.5 mt-2 bg-black/30 w-fit px-2 py-0.5 rounded-full border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="text-[11px] font-bold uppercase">{moonPhaseData.phaseName}</span>
          </div>
        </div>

        {/* Natal Impact Card */}
        <div className="bg-white border border-stone-200 rounded-lg p-3 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Natal Analysis</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                impactData.chandraBala.quality === 'Auspicious' ? 'bg-emerald-100 text-emerald-800' :
                impactData.chandraBala.quality === 'Sensitive' ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {impactData.chandraBala.quality}
              </span>
            </div>
            <h4 className="font-vedic font-bold text-stone-900 text-[14px] leading-tight">
              Moon Transiting your {impactData.transitHouse}th House
            </h4>
            <p className="text-[12px] text-stone-600 mt-1 leading-snug">
              {impactData.houseVerdict}
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-stone-50">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <div className="text-[11px] text-stone-700 font-medium">
              <strong>Chandra Bala:</strong> {impactData.chandraBala.text}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Emotion', icon: Heart, val: moonPhaseData.isShukla ? 'Rising' : 'Introspective', color: 'text-rose-600' },
          { label: 'Intellect', icon: Brain, val: impactData.transitHouse % 2 === 0 ? 'Analytical' : 'Expansive', color: 'text-purple-600' },
          { label: 'Energy', icon: Zap, val: moonPhaseData.illumination > 50 ? 'High' : 'Steady', color: 'text-amber-600' },
          { label: 'Protection', icon: ShieldCheck, val: impactData.chandraBala.quality, color: 'text-emerald-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#FAF8F5] rounded border border-stone-200 p-2 text-center">
            <item.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${item.color}`} />
            <div className="text-[10px] font-black uppercase text-stone-400 tracking-tight">{item.label}</div>
            <div className="text-[12px] font-bold text-stone-900">{item.val}</div>
          </div>
        ))}
      </div>

      {/* Technical Detail Strip */}
      <div className="bg-stone-50 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px] border border-stone-100">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Compass className="w-3 h-3 text-stone-400" />
            <span className="text-stone-500">Moon Rasi:</span>
            <span className="font-bold text-stone-800">{currentMoon.rasiName} ({currentMoon.degree}°)</span>
          </span>
          <span className="text-stone-300">|</span>
          <span className="flex items-center space-x-1">
            <span className="text-stone-500">Nakshatra:</span>
            <span className="font-bold text-stone-800">{currentMoon.nakshatra}</span>
          </span>
        </div>
        <div className="hidden sm:block text-stone-400 font-medium">
          Sidereal Lahiri System
        </div>
      </div>
    </div>
  );
}
