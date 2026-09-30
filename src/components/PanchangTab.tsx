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
    <div className="w-full space-y-2">
      {/* Intro Header */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-3xs">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-amber-700" />
          <h1 className="text-[14px] font-black text-stone-800 uppercase tracking-wider font-vedic leading-tight">
            Vedic Panchang
          </h1>
        </div>

        <div className="text-[13px] font-black uppercase tracking-wider text-stone-600 shrink-0">
          {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Meridian - Zero Pill */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2.5 py-1.5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-[13px] font-black uppercase tracking-wider text-stone-600">
          Calculation Meridian
        </div>

        <div className="w-full sm:w-72">
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
        <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-3xs">
          <span className="text-[12px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
            1. Tithi (Lunar)
          </span>
          <h3 className="text-[15px] font-vedic font-bold text-stone-950 truncate">Shukla Dashami</h3>
          <p className="text-[13px] text-stone-700 leading-snug">10th waxing phase</p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-3xs">
          <span className="text-[12px] font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
            2. Vara (Day)
          </span>
          <h3 className="text-[15px] font-vedic font-bold text-stone-950 truncate">
            {today.toLocaleDateString('en-US', { weekday: 'long' })}
          </h3>
          <p className="text-[13px] text-stone-700 leading-snug">Surya Vitality</p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-3xs">
          <span className="text-[12px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
            3. Nakshatra
          </span>
          <h3 className="text-[15px] font-vedic font-bold text-stone-950 truncate">Uttara Phalguni</h3>
          <p className="text-[13px] text-stone-700 leading-snug">Generosity</p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-3xs">
          <span className="text-[12px] font-bold text-purple-800 uppercase tracking-wider block mb-0.5">
            4. Yoga
          </span>
          <h3 className="text-[15px] font-vedic font-bold text-stone-950 truncate">Sobhana Yoga</h3>
          <p className="text-[13px] text-stone-700 leading-snug">Beauty & Virtue</p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-3xs col-span-2 sm:col-span-1">
          <span className="text-[12px] font-bold text-rose-800 uppercase tracking-wider block mb-0.5">
            5. Karana
          </span>
          <h3 className="text-[15px] font-vedic font-bold text-stone-950 truncate">Taitila Karana</h3>
          <p className="text-[13px] text-stone-700 leading-snug">Trade & Craft</p>
        </div>
      </div>

      {/* Muhurta Windows (Auspicious vs Inauspicious) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Auspicious Timings (Shubh Muhurta) */}
        <div className="bg-white rounded-lg border border-emerald-200/90 p-2.5 shadow-3xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-vedic font-bold text-[14px] text-stone-950">
              Shubh Muhurta
            </h3>
          </div>

          <div className="space-y-1 text-[14px]">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[13px]">Abhijit:</span>
              <span className="font-bold text-emerald-800 text-[13px]">11:52 AM – 12:42 PM</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[13px]">Amrit Kaal:</span>
              <span className="font-bold text-emerald-800 text-[13px]">03:15 PM – 04:48 PM</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[13px]">Brahma:</span>
              <span className="font-bold text-emerald-800 text-[13px]">04:32 AM – 05:18 AM</span>
            </div>
          </div>
        </div>

        {/* Inauspicious Timings (Ashubh Timings) */}
        <div className="bg-white rounded-lg border border-red-200/90 p-2.5 shadow-3xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-red-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <h3 className="font-vedic font-bold text-[14px] text-stone-950">
              Ashubh Kaal
            </h3>
          </div>

          <div className="space-y-1 text-[14px]">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[13px]">Rahu Kaal:</span>
              <span className="font-bold text-red-800 text-[13px]">04:45 PM – 06:15 PM</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[13px]">Yamaganda:</span>
              <span className="font-bold text-red-800 text-[13px]">12:15 PM – 01:45 PM</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[13px]">Gulika:</span>
              <span className="font-bold text-red-800 text-[13px]">03:15 PM – 04:45 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
