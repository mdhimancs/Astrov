import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Users,
  AlertTriangle,
  Flame,
  Layers,
  Heart,
  Calendar,
  Compass,
} from 'lucide-react';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { UserProfile } from '../types';
import { calculatePlanetaryPositions } from '../vedicMath';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';

interface KundaliMatchingTabProps {
  activeProfileId: string;
  profiles: UserProfile[];
}

export function KundaliMatchingTab({ activeProfileId, profiles }: KundaliMatchingTabProps) {
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [partner1ProfileId, setPartner1ProfileId] = useState<string>(currentProfile?.id || 'profile-1');
  const [partner2ProfileId, setPartner2ProfileId] = useState<string>('custom');

  const [person1, setPerson1] = useState({
    name: currentProfile?.name || 'Aarav Patel',
    rasi: 'Mesha',
    nakshatra: 'Ashwini',
    isManglik: false,
    lagnaRasi: 1,
  });

  const [person2, setPerson2] = useState({
    name: 'Priya Sharma',
    rasi: 'Simha',
    nakshatra: 'Magha',
    isManglik: false,
    lagnaRasi: 5,
  });

  // Sync with selected profile 1
  useEffect(() => {
    const prof = profiles.find((p) => p.id === partner1ProfileId) || currentProfile;
    if (prof) {
      const [year, month, day] = prof.birthDate.split('-').map(Number);
      const [hour, minute] = prof.birthTime.split(':').map(Number);
      const birthDateTime = new Date(year, month - 1, day, hour, minute);

      const natalCalc = calculatePlanetaryPositions(
        birthDateTime,
        prof.latitude ?? 28.6139,
        prof.longitude ?? 77.209
      );

      const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
      const mars = natalCalc.planets.find((p) => p.name === 'Mangal');
      // Manglik: Mars in 1, 4, 7, 8, 12 from Lagna or Moon
      const isManglik = mars ? [1, 4, 7, 8, 12].includes(mars.house) : false;

      setPerson1({
        name: prof.name,
        rasi: natalMoon.rasiName || 'Mesha',
        nakshatra: natalMoon.nakshatra || 'Ashwini',
        isManglik,
        lagnaRasi: natalCalc.lagnaRasi,
      });
    }
  }, [partner1ProfileId, currentProfile, profiles]);

  // Sync with selected profile 2 if choosing from saved profiles
  useEffect(() => {
    if (partner2ProfileId !== 'custom') {
      const prof = profiles.find((p) => p.id === partner2ProfileId);
      if (prof) {
        const [year, month, day] = prof.birthDate.split('-').map(Number);
        const [hour, minute] = prof.birthTime.split(':').map(Number);
        const birthDateTime = new Date(year, month - 1, day, hour, minute);

        const natalCalc = calculatePlanetaryPositions(
          birthDateTime,
          prof.latitude ?? 28.6139,
          prof.longitude ?? 77.209
        );

        const natalMoon = natalCalc.planets.find((p) => p.name === 'Chandra') || natalCalc.planets[1];
        const mars = natalCalc.planets.find((p) => p.name === 'Mangal');
        const isManglik = mars ? [1, 4, 7, 8, 12].includes(mars.house) : false;

        setPerson2({
          name: prof.name,
          rasi: natalMoon.rasiName || 'Simha',
          nakshatra: natalMoon.nakshatra || 'Magha',
          isManglik,
          lagnaRasi: natalCalc.lagnaRasi,
        });
      }
    }
  }, [partner2ProfileId, profiles]);

  // Dynamic Ashtakoot Guna Milan Calculation (Full 36 Points)
  const calculateGunas = () => {
    const rasi1Idx = VEDIC_RASIS.findIndex((r) => r.sanskritName === person1.rasi);
    const rasi2Idx = VEDIC_RASIS.findIndex((r) => r.sanskritName === person2.rasi);
    const nak1Idx = NAKSHATRAS.findIndex((n) => n.name === person1.nakshatra);
    const nak2Idx = NAKSHATRAS.findIndex((n) => n.name === person2.nakshatra);

    // 1. Varna (1 Point): Brahmin (Water), Kshatriya (Fire), Vaishya (Earth), Shudra (Air)
    const getVarna = (rIdx: number) => {
      const el = VEDIC_RASIS[rIdx]?.element;
      if (el?.includes('Water')) return 4;
      if (el?.includes('Fire')) return 3;
      if (el?.includes('Earth')) return 2;
      return 1;
    };
    const varnaPoints = getVarna(rasi1Idx) >= getVarna(rasi2Idx) ? 1 : 0;

    // 2. Vashya (2 Points): Mutual attraction & devotion
    const vashyaPoints = (rasi1Idx === rasi2Idx || Math.abs(rasi1Idx - rasi2Idx) === 4) ? 2 : 1;

    // 3. Tara (3 Points): Destiny & Longevity
    const diffTara = ((nak2Idx - nak1Idx + 27) % 9) + 1;
    const taraPoints = [3, 5, 7].includes(diffTara) ? 1.5 : 3;

    // 4. Yoni (4 Points): Biological & sexual harmony
    const yoniPoints = 3;

    // 5. Graha Maitri (5 Points): Moon sign lord friendship
    const lord1 = VEDIC_RASIS[rasi1Idx]?.lord;
    const lord2 = VEDIC_RASIS[rasi2Idx]?.lord;
    const maitriPoints = (lord1 === lord2) ? 5 : [1, 5, 9].includes(((rasi2Idx - rasi1Idx + 12) % 12) + 1) ? 4 : 3;

    // 6. Gana (6 Points): Deva, Manushya, Rakshasa
    const gana1 = (nak1Idx % 3 === 0) ? 'Deva' : (nak1Idx % 3 === 1) ? 'Manushya' : 'Rakshasa';
    const gana2 = (nak2Idx % 3 === 0) ? 'Deva' : (nak2Idx % 3 === 1) ? 'Manushya' : 'Rakshasa';
    const ganaPoints = (gana1 === gana2) ? 6 : (gana1 === 'Rakshasa' && gana2 !== 'Rakshasa') ? 1 : 5;

    // 7. Bhakoot (7 Points): 2/12, 6/8 (Shadashtak), or 9/5 (Navapancham)
    const dist = ((rasi2Idx - rasi1Idx + 12) % 12) + 1;
    const isBhakootDosha = [2, 12, 6, 8].includes(dist);
    const bhakootPoints = isBhakootDosha ? 0 : 7;

    // 8. Nadi (8 Points): Aadi, Madhya, Antya
    const nadi1 = nak1Idx % 3;
    const nadi2 = nak2Idx % 3;
    const isNadiDosha = nadi1 === nadi2;
    const nadiPoints = isNadiDosha ? 0 : 8;

    const total = varnaPoints + vashyaPoints + taraPoints + yoniPoints + maitriPoints + ganaPoints + bhakootPoints + nadiPoints;

    return {
      total: Math.round(total),
      max: 36,
      verdict: total >= 28 ? 'Uttama (Excellent Match)' : total >= 18 ? 'Madhyama (Auspicious & Acceptable)' : 'Adhama (Vulnerable — Remedies Advised)',
      isManglikMatch: person1.isManglik === person2.isManglik,
      isBhakootDosha,
      isNadiDosha,
      koots: [
        { name: 'Varna (Work & Spiritual Compatibility)', points: varnaPoints, max: 1 },
        { name: 'Vashya (Mutual Attraction & Harmony)', points: vashyaPoints, max: 2 },
        { name: 'Tara (Destiny, Health & Longevity)', points: taraPoints, max: 3 },
        { name: 'Yoni (Biological & Physical Harmony)', points: yoniPoints, max: 4 },
        { name: 'Graha Maitri (Psychological Alignment & Friendship)', points: maitriPoints, max: 5 },
        { name: 'Gana (Temperament & Behavioral Compatibility)', points: ganaPoints, max: 6 },
        { name: 'Bhakoot (Emotional Joy & Family Prosperity)', points: bhakootPoints, max: 7 },
        { name: 'Nadi (Genetic Health & Future Progeny)', points: nadiPoints, max: 8 },
      ],
    };
  };

  const results = calculateGunas();

  return (
    <div className="w-full space-y-2">
      {/* Intro Header */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-3xs">
        <div className="flex items-center space-x-1.5">
          <HeartHandshake className="w-4 h-4 text-amber-700" />
          <h1 className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
            Ashtakoot Milan &amp; Synastry Suite (36 Gunas)
          </h1>
        </div>

        <div className="text-[12px] font-black uppercase tracking-wider text-stone-600 shrink-0">
          Threshold: <span className="text-amber-800">18 / 36 Minimum</span>
        </div>
      </div>

      {/* Input Columns for Both Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Partner 1 Card */}
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1">
            <h3 className="font-vedic font-bold text-[14px] text-stone-950 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>First Partner (Seeker)</span>
            </h3>
            {/* Quick Profile Select */}
            <select
              value={partner1ProfileId}
              onChange={(e) => setPartner1ProfileId(e.target.value)}
              className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-0.5">
              Full Name
            </label>
            <input
              type="text"
              value={person1.name}
              onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2.5 py-1 text-stone-950 text-[13px] focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-0.5">
                Moon Rasi
              </label>
              <select
                value={person1.rasi}
                onChange={(e) => setPerson1({ ...person1, rasi: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-950 text-[13px] focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
              >
                {VEDIC_RASIS.map((r) => (
                  <option key={r.sanskritName} value={r.sanskritName}>
                    {r.sanskritName} ({r.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-0.5">
                Nakshatra
              </label>
              <select
                value={person1.nakshatra}
                onChange={(e) => setPerson1({ ...person1, nakshatra: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-950 text-[13px] focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name} ({n.lord})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Manglik Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[12px]">
            <span className="font-semibold text-stone-700">Manglik Dosha Status:</span>
            <button
              onClick={() => setPerson1({ ...person1, isManglik: !person1.isManglik })}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                person1.isManglik
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {person1.isManglik ? 'Manglik (Active)' : 'Non-Manglik'}
            </button>
          </div>
        </div>

        {/* Partner 2 Card */}
        <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-1">
            <h3 className="font-vedic font-bold text-[14px] text-stone-950 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Second Partner</span>
            </h3>
            <select
              value={partner2ProfileId}
              onChange={(e) => setPartner2ProfileId(e.target.value)}
              className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 cursor-pointer"
            >
              <option value="custom">Custom Partner</option>
              {profiles
                .filter((p) => p.id !== partner1ProfileId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-0.5">
              Full Name
            </label>
            <input
              type="text"
              value={person2.name}
              onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2.5 py-1 text-stone-950 text-[13px] focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-0.5">
                Moon Rasi
              </label>
              <select
                value={person2.rasi}
                onChange={(e) => setPerson2({ ...person2, rasi: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-950 text-[13px] focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
              >
                {VEDIC_RASIS.map((r) => (
                  <option key={r.sanskritName} value={r.sanskritName}>
                    {r.sanskritName} ({r.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-800 uppercase tracking-wider mb-0.5">
                Nakshatra
              </label>
              <select
                value={person2.nakshatra}
                onChange={(e) => setPerson2({ ...person2, nakshatra: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-950 text-[13px] focus:outline-none focus:border-amber-600 focus:bg-white cursor-pointer"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name} ({n.lord})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Manglik Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[12px]">
            <span className="font-semibold text-stone-700">Manglik Dosha Status:</span>
            <button
              onClick={() => setPerson2({ ...person2, isManglik: !person2.isManglik })}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                person2.isManglik
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {person2.isManglik ? 'Manglik (Active)' : 'Non-Manglik'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Score Box */}
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-stone-100 gap-2">
          <div>
            <span className="text-[11px] text-stone-600 font-semibold uppercase tracking-wider block">
              Guna Milan Score:
            </span>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <span className="text-[22px] font-vedic font-black text-amber-800">
                {results.total} / {results.max} Gunas
              </span>
              <span
                className={`text-[12px] font-bold px-2 py-0.5 rounded-full border ${
                  results.total >= 28
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : results.total >= 18
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {results.verdict}
              </span>
            </div>
          </div>

          {/* Dosha & Synastry Quick Flags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                results.isManglikMatch
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {results.isManglikMatch ? 'Manglik Balanced (Kuja Dosha Cancelled)' : 'Manglik Mismatch'}
            </span>
            {results.isNadiDosha && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                Nadi Dosha Present
              </span>
            )}
            {results.isBhakootDosha && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                Bhakoot Dosha Present
              </span>
            )}
          </div>
        </div>

        {/* 8 Koot Detailed Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {results.koots.map((koot) => (
            <div
              key={koot.name}
              className={`p-2 rounded border space-y-0.5 transition-colors ${
                koot.points === koot.max
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : koot.points > 0
                  ? 'bg-[#FAF8F5] border-stone-200'
                  : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-stone-950 truncate">{koot.name.split(' (')[0]}</span>
                <span
                  className={`text-[13px] font-black ${
                    koot.points === koot.max
                      ? 'text-emerald-800'
                      : koot.points > 0
                      ? 'text-amber-800'
                      : 'text-rose-700'
                  }`}
                >
                  {koot.points} / {koot.max}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 truncate leading-snug">
                {koot.name.split(' (')[1]?.replace(')', '')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
