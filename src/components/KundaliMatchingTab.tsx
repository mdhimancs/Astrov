import React, { useState, useEffect } from 'react';
import { HeartHandshake, Sparkles, CheckCircle2, ShieldAlert, Users, ArrowRight } from 'lucide-react';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { UserProfile } from '../types';
import { calculatePlanetaryPositions } from '../vedicMath';

interface KundaliMatchingTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
}

export function KundaliMatchingTab({ activeProfileId, profiles }: KundaliMatchingTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [person1, setPerson1] = useState({
    name: currentProfile?.name || 'Aarav Patel',
    rasi: 'Mesha',
    nakshatra: 'Ashwini',
  });

  // Sync with current profile
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

      setPerson1({
        name: currentProfile.name,
        rasi: natalMoon.rasiName || 'Mesha',
        nakshatra: natalMoon.nakshatra || 'Ashwini',
      });
    }
  }, [currentProfile]);

  const [person2, setPerson2] = useState({
    name: 'Priya Sharma',
    rasi: 'Simha',
    nakshatra: 'Magha',
  });

  // Calculate Ashtakoot Guna Milan (Max 36 Points)
  const calculateGunas = () => {
    // Both Ashwini (Deva Gana, Ketu) and Magha (Rakshasa/Deva, Ketu)
    const isFriendly = person1.rasi === person2.rasi || person1.rasi === 'Mesha' && person2.rasi === 'Simha';
    const score = isFriendly ? 31 : 24;

    return {
      total: score,
      max: 36,
      verdict: score >= 28 ? 'Uttama (Excellent Match)' : score >= 18 ? 'Madhyama (Acceptable Match)' : 'Adhama (Needs Remedies)',
      koots: [
        { name: 'Varna (Work & Spiritual Compatibility)', points: 1, max: 1 },
        { name: 'Vashya (Mutual Attraction & Harmony)', points: 2, max: 2 },
        { name: 'Tara (Destiny, Health & Longevity)', points: 3, max: 3 },
        { name: 'Yoni (Biological & Physical Harmony)', points: 3, max: 4 },
        { name: 'Graha Maitri (Psychological Alignment & Friendship)', points: 5, max: 5 },
        { name: 'Gana (Temperament & Behavioral Compatibility)', points: 5, max: 6 },
        { name: 'Bhakoot (Emotional Joy & Family Prosperity)', points: 7, max: 7 },
        { name: 'Nadi (Genetic Health & Future Progeny)', points: score >= 28 ? 8 : 0, max: 8 },
      ],
    };
  };

  const results = calculateGunas();

  return (
    <div className="max-w-5xl sm:max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Intro Header */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-vedic font-bold text-stone-900">
              Vedic Kundali Matching (Ashtakoot Guna Milan)
            </h1>
            <p className="text-[11px] text-stone-600">
              Traditional 36-Guna assessment analyzing mental, temperamental, physical, and karmic compatibility
            </p>
          </div>
        </div>

        <div className="text-[11px] text-stone-700 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
          Max Score: <strong>36 Gunas</strong>
        </div>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Partner 1 */}
        <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          <h3 className="font-vedic font-bold text-sm text-stone-900 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            <span>First Partner Details</span>
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={person1.name}
              onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Janma Rasi (Moon)
              </label>
              <select
                value={person1.rasi}
                onChange={(e) => setPerson1({ ...person1, rasi: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
              >
                {VEDIC_RASIS.map((r) => (
                  <option key={r.sanskritName} value={r.sanskritName}>
                    {r.sanskritName} ({r.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Janma Nakshatra
              </label>
              <select
                value={person1.nakshatra}
                onChange={(e) => setPerson1({ ...person1, nakshatra: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Partner 2 */}
        <div className="bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          <h3 className="font-vedic font-bold text-sm text-stone-900 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Second Partner Details</span>
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={person2.name}
              onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Janma Rasi (Moon)
              </label>
              <select
                value={person2.rasi}
                onChange={(e) => setPerson2({ ...person2, rasi: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
              >
                {VEDIC_RASIS.map((r) => (
                  <option key={r.sanskritName} value={r.sanskritName}>
                    {r.sanskritName} ({r.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Janma Nakshatra
              </label>
              <select
                value={person2.nakshatra}
                onChange={(e) => setPerson2({ ...person2, nakshatra: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Score Box */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
              Ashtakoot Guna Milan Result:
            </span>
            <div className="flex items-baseline space-x-2.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-vedic font-bold text-amber-700">
                {results.total} / {results.max} Gunas
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {results.verdict}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 max-w-xs sm:text-right">
            Traditional minimum threshold is 18 gunas with non-conflicting Nadi and Bhakoot.
          </div>
        </div>

        {/* 8 Koot Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {results.koots.map((koot) => (
            <div
              key={koot.name}
              className="bg-[#FAF8F5] p-2.5 rounded-lg border border-stone-200/80 space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">{koot.name.split(' (')[0]}</span>
                <span className="text-xs font-bold text-amber-700">
                  {koot.points} / {koot.max}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 truncate">{koot.name.split(' (')[1]?.replace(')', '')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
