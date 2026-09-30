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
    <div className="w-full space-y-2">
      {/* Intro Header */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-3xs">
        <div className="flex items-center space-x-1.5">
          <Orbit className="w-4 h-4 text-amber-700" />
          <h1 className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
            Live Gochar
          </h1>
        </div>

        <div className="flex items-center space-x-1.5 text-[13px] font-black uppercase tracking-wider text-stone-600 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{liveDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {liveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Observation Point - Zero Pill */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2.5 py-1.5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-[13px] font-black uppercase tracking-wider text-stone-600">
          Observation Point
        </div>

        <div className="w-full sm:w-72">
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
            title="Gochar Kundali"
            subtitle={`${selectedCity.name}`}
            isTransit={true}
          />
        </div>

        <div className="lg:col-span-6 space-y-2">
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs">
            <h3 className="text-[14px] font-vedic font-bold text-stone-950 mb-1.5 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Transit Coordinates</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-800 text-[13px] font-semibold">
                    <th className="py-1 px-2">Graha</th>
                    <th className="py-1 px-2">Sign</th>
                    <th className="py-1 px-2">Deg</th>
                    <th className="py-1 px-2">Nak</th>
                    <th className="py-1 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transitPlanets.map((p) => (
                    <tr key={p.name} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-1 px-2 font-semibold text-stone-950">
                        {p.name}
                      </td>
                      <td className="py-1 px-2 text-stone-800">
                        {p.rasiName}
                      </td>
                      <td className="py-1 px-2 font-mono text-stone-900">
                        {p.degree}°
                      </td>
                      <td className="py-1 px-2 text-stone-700">
                        {p.nakshatra}
                      </td>
                      <td className="py-1 px-2">
                        {p.isRetrograde ? (
                          <span className="text-red-700 text-[12px] font-bold">V</span>
                        ) : (
                          <span className="text-emerald-700 text-[12px] font-medium">D</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Transit Highlights */}
          <div className="bg-[#FAF5EC] rounded-lg border border-[#E8DEC8] p-2.5 shadow-3xs space-y-1">
            <h4 className="font-vedic font-bold text-stone-950 text-[14px]">
              Transit Highlights
            </h4>
            <ul className="space-y-1 text-[13px] text-stone-800">
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Saturn:</strong> Psychological maturity and karmic structure.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Jupiter:</strong> authentic communication and wisdom.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-amber-700 font-bold">•</span>
                <span><strong>Rahu-Ketu:</strong> innovative breakthroughs and service.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
