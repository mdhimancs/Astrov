import React, { useState } from 'react';
import { Calendar, Sun, Moon, Clock, Compass, AlertCircle, Sparkles } from 'lucide-react';
import { POPULAR_CITIES } from '../data';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';

export function PanchangTab() {
  const [selectedCity, setSelectedCity] = useState<PlaceValue>({
    name: 'Varanasi (Kashi), India',
    lat: 25.3176,
    lng: 82.9739,
    tz: 5.5,
  });
  const today = new Date();

  return (
    <div className="w-full px-0.5 sm:px-1 py-1.5 space-y-2">
      {/* Intro Header */}
      <div className="bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1 shadow-3xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-700" />
          <h1 className="text-xs font-black text-stone-800 uppercase tracking-widest font-vedic leading-tight">
            Vedic Panchang
          </h1>
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 shrink-0">
          {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Meridian - Zero Pill */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-100 px-2 py-1.5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          Calculation Meridian
        </div>

        <div className="w-full sm:w-64">
          <PlaceOfBirthInput
            id="panchang-location-input"
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

      {/* The 5 Limbs (Panch-Anga) Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
            1. Tithi (Lunar Day)
          </span>
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">Shukla Dashami</h3>
          <p className="text-[10px] text-stone-500 mt-0.5">10th waxing phase • Auspicious for noble beginnings</p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[9px] font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
            2. Vara (Solar Day)
          </span>
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">
            {today.toLocaleDateString('en-US', { weekday: 'long' })}
          </h3>
          <p className="text-[10px] text-stone-500 mt-0.5">Governed by Surya & solar vitality</p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
            3. Nakshatra
          </span>
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">Uttara Phalguni</h3>
          <p className="text-[10px] text-stone-500 mt-0.5">Lord Surya • Generosity and friendship</p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[9px] font-bold text-purple-800 uppercase tracking-wider block mb-0.5">
            4. Yoga
          </span>
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">Sobhana Yoga</h3>
          <p className="text-[10px] text-stone-500 mt-0.5">Fosters beauty, harmony, and virtue</p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[9px] font-bold text-rose-800 uppercase tracking-wider block mb-0.5">
            5. Karana
          </span>
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">Taitila Karana</h3>
          <p className="text-[10px] text-stone-500 mt-0.5">Supportive for trade, craft, and construction</p>
        </div>
      </div>

      {/* Muhurta Windows (Auspicious vs Inauspicious) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Auspicious Timings (Shubh Muhurta) */}
        <div className="bg-white rounded-xl border border-emerald-200/90 p-2.5 sm:p-3 shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-vedic font-bold text-xs sm:text-sm text-stone-900">
              Shubh Muhurta (Auspicious Timings)
            </h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[11px]">Abhijit Muhurta (Universal Success):</span>
              <span className="font-bold text-emerald-800 text-[11px]">11:52 AM – 12:42 PM</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[11px]">Amrit Kaal (Divine Grace):</span>
              <span className="font-bold text-emerald-800 text-[11px]">03:15 PM – 04:48 PM</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[11px]">Brahma Muhurta (Meditation):</span>
              <span className="font-bold text-emerald-800 text-[11px]">04:32 AM – 05:18 AM</span>
            </div>
          </div>
        </div>

        {/* Inauspicious Timings (Ashubh Timings) */}
        <div className="bg-white rounded-xl border border-red-200/90 p-2.5 sm:p-3 shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-red-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <h3 className="font-vedic font-bold text-xs sm:text-sm text-stone-900">
              Ashubh Kaal (Avoid New Initiatives)
            </h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[11px]">Rahu Kaal (Inauspicious Window):</span>
              <span className="font-bold text-red-800 text-[11px]">04:45 PM – 06:15 PM</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[11px]">Yamaganda Kaal:</span>
              <span className="font-bold text-red-800 text-[11px]">12:15 PM – 01:45 PM</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[11px]">Gulika Kaal:</span>
              <span className="font-bold text-red-800 text-[11px]">03:15 PM – 04:45 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
