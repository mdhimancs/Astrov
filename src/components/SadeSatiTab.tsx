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
    <div className="max-w-5xl sm:max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-vedic font-bold text-stone-900">
              Shani Sade Sati & Dhaiya Analysis
            </h1>
            <p className="text-[11px] text-stone-600">
              Real-time Saturn transit evaluation for your Janma Rasi (Moon sign) and traditional Upayas
            </p>
          </div>
        </div>

        <div className="text-[11px] text-stone-600 shrink-0 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
          Current Saturn Transit: <strong>Meena (Pisces)</strong>
        </div>
      </div>

      {/* Rasi Selection Buttons */}
      <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
          Select Your Janma Rasi (Moon Sign):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {VEDIC_RASIS.map((rasi) => (
            <button
              key={rasi.sanskritName}
              onClick={() => setSelectedRasi(rasi.sanskritName)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                selectedRasi === rasi.sanskritName
                  ? 'bg-amber-700 border-amber-700 text-white shadow-2xs font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{rasi.sanskritName}</span>
                <span className="text-sm">{rasi.symbol}</span>
              </div>
              <span className={`text-[10px] block mt-0.5 ${selectedRasi === rasi.sanskritName ? 'text-amber-100' : 'text-stone-500'}`}>
                {rasi.englishName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
              Active Status for {selectedRasi} Moon Sign:
            </span>
            <h2 className="text-lg sm:text-xl font-vedic font-bold text-stone-900 mt-0.5">
              {details.status}
            </h2>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${details.bg}`}>
            Impact: {details.severity}
          </span>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-stone-200/80 space-y-1">
          <h4 className="font-vedic font-bold text-stone-900 text-xs">
            Astrological Dynamics & Influence
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed">
            {details.description}
          </p>
        </div>

        {/* Vedic Remedies (Upayas) */}
        <div className="space-y-2.5">
          <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Recommended Vedic Upayas (Remedies)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200 space-y-1">
              <strong className="text-stone-900 font-semibold block text-[11px]">Mantra Sadhana</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Recite the Shani Gayatri or Maha Mrityunjaya Mantra 108 times on Saturdays during dusk.
              </p>
            </div>

            <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200 space-y-1">
              <strong className="text-stone-900 font-semibold block text-[11px]">Charity & Karma</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Donate black sesame seeds, mustard oil, or iron utensils to the needy on Saturday.
              </p>
            </div>

            <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200 space-y-1">
              <strong className="text-stone-900 font-semibold block text-[11px]">Lifestyle Discipline</strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Practice punctuality, avoid arrogance, honor domestic help, and cultivate patience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
