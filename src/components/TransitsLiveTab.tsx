import React, { useState, useEffect } from 'react';
import { Orbit, Clock, Sparkles, Compass, AlertCircle, CheckCircle } from 'lucide-react';
import { NorthIndianChart } from './NorthIndianChart';
import { calculatePlanetaryPositions, buildHouseStructure } from '../vedicMath';
import { HouseInfo, PlanetPosition } from '../types';
import { POPULAR_CITIES, VEDIC_RASIS } from '../data';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';

export function TransitsLiveTab() {
  const [selectedCity, setSelectedCity] = useState<PlaceValue>({
    name: 'New Delhi, India',
    lat: 28.6139,
    lng: 77.2090,
    tz: 5.5,
  });
  const [liveDate, setLiveDate] = useState(new Date());
  const [transitPlanets, setTransitPlanets] = useState<PlanetPosition[]>([]);
  const [transitHouses, setTransitHouses] = useState<HouseInfo[]>([]);

  useEffect(() => {
    const calc = calculatePlanetaryPositions(liveDate, selectedCity.lat, selectedCity.lng);
    setTransitPlanets(calc.planets);
    setTransitHouses(buildHouseStructure(calc.lagnaRasi, calc.planets));
  }, [liveDate, selectedCity]);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full px-0.5 sm:px-1 py-1.5 space-y-2">
      {/* Intro Header */}
      <div className="bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1 shadow-3xs">
        <div className="flex items-center space-x-2">
          <Orbit className="w-4 h-4 text-amber-700" />
          <h1 className="text-xs font-black text-stone-800 uppercase tracking-widest font-vedic leading-tight">
            Live Gochar
          </h1>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-stone-400 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{liveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {liveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Observation Point - Zero Pill */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-100 px-2 py-1.5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          Observation Point
        </div>

        <div className="w-full sm:w-64">
          <PlaceOfBirthInput
            id="transit-observation-point"
            value={selectedCity.name}
            latitude={selectedCity.lat}
            longitude={selectedCity.lng}
            timezone={selectedCity.tz}
            onChange={(newCity) => setSelectedCity(newCity)}
            label=""
            placeholder="Search City..."
            compact
          />
        </div>
      </div>

      {/* Grid: Gochar North Indian Chart + Live Transit Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <div className="lg:col-span-6">
          <NorthIndianChart
            houses={transitHouses}
            title="Real-Time Gochar Kundali"
            subtitle={`Sidereal positions at ${selectedCity.name}`}
            isTransit={true}
          />
        </div>

        <div className="lg:col-span-6 space-y-2">
          <div className="bg-white rounded-xl border border-stone-200 p-2 sm:p-2.5 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900 mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Current Transit Coordinates (Graha Sthiti)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-700 text-[10px] font-semibold">
                    <th className="py-1 px-2">Graha</th>
                    <th className="py-1 px-2">Transit Rasi</th>
                    <th className="py-1 px-2">Degree</th>
                    <th className="py-1 px-2">Nakshatra</th>
                    <th className="py-1 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transitPlanets.map((p) => (
                    <tr key={p.name} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-1 px-2 font-semibold text-stone-900 text-xs">
                        {p.englishName} ({p.name})
                      </td>
                      <td className="py-1 px-2 text-stone-700 text-xs">
                        {p.rasiName} (#{p.rasiNumber})
                      </td>
                      <td className="py-1 px-2 font-mono text-stone-800 text-xs">
                        {p.degree}° {p.minute}'
                      </td>
                      <td className="py-1 px-2 text-stone-600 text-xs">
                        {p.nakshatra}
                      </td>
                      <td className="py-1 px-2">
                        {p.isRetrograde ? (
                          <span className="text-red-700 bg-red-50 border border-red-200 px-1 py-0.2 rounded text-[9px] font-bold">
                            Vakri
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded text-[9px] font-medium">
                            Direct
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Transit Highlights */}
          <div className="bg-[#FAF5EC] rounded-xl border border-[#E8DEC8] p-2 sm:p-2.5 shadow-2xs space-y-1.5">
            <h4 className="font-vedic font-bold text-stone-900 text-xs">
              Prominent Celestial Transits of the Epoch
            </h4>
            <ul className="space-y-1 text-[11px] text-stone-700">
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Shani in Meena (Saturn in Pisces):</strong> Saturn demands psychological maturity, creative structure, and karmic dissolution of past illusions.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Guru in Mithuna (Jupiter in Gemini):</strong> Wisdom flourishes through authentic communication, emotional intelligence, and philosophical inquiry.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Rahu-Ketu Axis:</strong> Rahu stimulates innovative breakthroughs while Ketu encourages selfless service and meditation.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
