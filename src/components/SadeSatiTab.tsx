import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, AlertTriangle, CheckCircle, Flame, HeartHandshake, BookOpen } from 'lucide-react';
import { VEDIC_RASIS } from '../data';
import { UserProfile, VedicRasiName } from '../types';
import { calculatePlanetaryPositions } from '../vedicMath';

interface SadeSatiTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
}

export function SadeSatiTab({ activeProfileId, profiles }: SadeSatiTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const [selectedRasi, setSelectedRasi] = useState<VedicRasiName>('Meena');

  // Sync with current profile's Moon Rasi
  useEffect(() => {
    if (currentProfile) {
      const [year, month, day] = currentProfile.birthDate.split('-').map(Number);
      const [hour, minute] = currentProfile.birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      const natalCalc = calculatePlanetaryPositions(
        birthDateTime,
        currentProfile.latitude ?? 28.6139,
        currentProfile.longitude ?? 77.2090
      );

      const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
      const rasiName = natalMoon.rasiName as VedicRasiName;
      if (rasiName) {
        setSelectedRasi(rasiName);
      }
    }
  }, [currentProfile]);

  // Currently Saturn is in Meena (Pisces, Rasi 12)
  const saturnRasiNum = 12; // Pisces

  const getSadeSatiDetails = (rasiName: VedicRasiName) => {
    const rasiObj = VEDIC_RASIS.find((r) => r.sanskritName === rasiName) || VEDIC_RASIS[0];
    const diff = ((saturnRasiNum - rasiObj.number + 12) % 12);

    if (diff === 11) {
      return {
        status: 'Rising Phase (1st Dhaiya of Sade Sati)',
        severity: 'Moderate',
        isSadeSati: true,
        bg: 'bg-amber-50 border-amber-300 text-amber-900',
        description:
          'Saturn is transiting the 12th house from your natal Moon sign. This initial 2.5-year phase prompts reflection on expenses, foreign travel, sleep patterns, and spiritual detachment.',
        advice: 'Prudent budgeting, charitable acts, evening meditation, and reciting the Dasharatha Shani Stotram.',
      };
    } else if (diff === 0) {
      return {
        status: 'Peak Phase (2nd Dhaiya - Janma Shani)',
        severity: 'High Focus Required',
        isSadeSati: true,
        bg: 'bg-red-50 border-red-300 text-red-900',
        description:
          'Saturn is transiting directly over your natal Moon sign. This is the core 2.5-year period demanding uncompromising integrity, health care, emotional fortitude, and patience.',
        advice: 'Remain humble, respect elders and laborers, avoid hasty career gambles, and visit Hanuman or Shani temples on Saturdays.',
      };
    } else if (diff === 1) {
      return {
        status: 'Setting Phase (3rd Dhaiya of Sade Sati)',
        severity: 'Relieving & Consolidating',
        isSadeSati: true,
        bg: 'bg-orange-50 border-orange-300 text-orange-900',
        description:
          'Saturn is transiting the 2nd house from your natal Moon. The hardest lessons have been learned. Focus now turns to stabilizing family harmony and financial assets.',
        advice: 'Maintain gentle speech with family members, consolidate your career gains, and feed birds or stray animals.',
      };
    } else if (diff === 3) {
      return {
        status: 'Kantaka Shani (4th House Dhaiya)',
        severity: 'Medium',
        isSadeSati: false,
        bg: 'bg-stone-50 border-stone-300 text-stone-800',
        description:
          'Saturn transits the 4th house from Moon (Artha Dhaiya). Urges conscious maintenance of domestic tranquility and vehicular caution.',
        advice: 'Keep a clean and peaceful living space, spend quality time with mother, and recite Hanuman Chalisa.',
      };
    } else if (diff === 7) {
      return {
        status: 'Ashtama Shani (8th House Dhaiya)',
        severity: 'Transformational',
        isSadeSati: false,
        bg: 'bg-stone-50 border-stone-300 text-stone-800',
        description:
          'Saturn transits the 8th house from Moon. Calls for profound spiritual surrender, regular wellness checkups, and steady endurance.',
        advice: 'Avoid speculation, engage in Pranayama and spiritual charity, and respect Saturn as the divine guru of karma.',
      };
    }

    return {
      status: 'Free from Sade Sati & Dhaiya',
      severity: 'Favorable',
      isSadeSati: false,
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      description:
        'Your Janma Rasi currently enjoys auspicious distance from Saturn. Lord Shani acts as a benevolent karmic stabilizer.',
      advice: 'Channel this productive period to initiate ambitious projects and expand your dharmic foundations.',
    };
  };

  const details = getSadeSatiDetails(selectedRasi);

  return (
    <div className="w-full p-0.5 space-y-0.5">
      {/* Intro Header */}
      <div className="bg-amber-50/40 border border-amber-100 rounded-lg px-1 py-0.5 flex flex-col sm:flex-row items-center justify-between gap-1 shadow-3xs">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3 text-amber-700" />
          <h1 className="text-[10px] font-black text-stone-800 uppercase tracking-widest font-vedic leading-tight">
            Sade Sati
          </h1>
        </div>

        <div className="text-[9px] font-black uppercase tracking-widest text-stone-600 shrink-0">
          Saturn in <span className="text-amber-800">Meena</span>
        </div>
      </div>

      {/* Rasi Selection - Zero Pill Grid */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-stone-100 px-1 py-0.5 shadow-3xs space-y-0.5">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0.5">
          {VEDIC_RASIS.map((rasi) => (
            <button
              key={rasi.sanskritName}
              onClick={() => setSelectedRasi(rasi.sanskritName)}
              className={`py-0.5 rounded text-center transition-all cursor-pointer border ${
                selectedRasi === rasi.sanskritName
                  ? 'bg-amber-700 border-amber-800 text-white shadow-3xs'
                  : 'bg-white border-stone-50 text-stone-600 hover:text-stone-800'
              }`}
            >
              <div className="text-[9px] font-black uppercase tracking-tighter leading-none">
                {rasi.sanskritName.slice(0, 3)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-white rounded-lg border border-stone-200 p-1 shadow-3xs space-y-1">
        <div className="flex items-center justify-between pb-0.5 border-b border-stone-100 gap-1">
          <h2 className="text-sm font-vedic font-bold text-stone-950">
            {details.status}
          </h2>
          <span className={`text-[8px] px-1 py-0 rounded-full font-bold border ${details.bg}`}>
            {details.severity}
          </span>
        </div>

        <p className="text-[10px] text-stone-800 leading-tight">
          {details.description}
        </p>

        {/* Vedic Remedies (Upayas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 text-[9px]">
          <div className="bg-stone-50/70 p-1 rounded border border-stone-100">
            <strong className="text-stone-950 font-semibold block">Mantra</strong>
            <p className="text-stone-700">Shani Gayatri / Mrityunjaya</p>
          </div>
          <div className="bg-stone-50/70 p-1 rounded border border-stone-100">
            <strong className="text-stone-950 font-semibold block">Charity</strong>
            <p className="text-stone-700">Black sesame / iron</p>
          </div>
          <div className="bg-stone-50/70 p-1 rounded border border-stone-100">
            <strong className="text-stone-950 font-semibold block">Karma</strong>
            <p className="text-stone-700">Punctuality / patience</p>
          </div>
        </div>
      </div>
    </div>
  );
}
