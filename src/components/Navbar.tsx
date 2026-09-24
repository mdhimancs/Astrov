import React from 'react';
import { Compass, Clock, Shield, Calendar, HeartHandshake, Sparkles, Orbit, Layers, Award, Brain } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTransitTime: string;
}

export function Navbar({ activeTab, setActiveTab, currentTransitTime }: NavbarProps) {
  const tabs = [
    { id: 'birth-predictions', label: 'Birth Time Predictions', icon: Compass },
    { id: 'monthly-predictions', label: 'Month-Wise Predictions', icon: Calendar },
    { id: 'vimshottari-dasha', label: 'Vimshottari Dasha', icon: Layers },
    { id: 'critical-transits', label: 'Life Milestones & Transits', icon: Award },
    { id: 'divisional-charts', label: 'Advanced Analysis', icon: Brain },
    { id: 'transits', label: 'Live Gochar Transits', icon: Orbit },
    { id: 'sadesati', label: 'Shani Sade Sati', icon: Shield },
    { id: 'panchang', label: 'Daily Panchang', icon: Clock },
    { id: 'compatibility', label: 'Kundali Matching', icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E7DEC8] shadow-xs">
      {/* Top Banner with Real-Time Planetary Clock */}
      <div className="bg-[#FAF5EC] border-b border-[#EFE8D8] px-3 sm:px-4 py-1.5 text-xs text-stone-600">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-800">Gochar Transits Active:</span>
            <span className="text-amber-800 font-bold">{currentTransitTime}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-xs text-stone-600">
            <span>Ayanamsha: <strong className="text-stone-800 font-semibold">Lahiri (24°15')</strong></span>
            <span>Kundali: <strong className="text-stone-800 font-semibold">North Indian Sidereal</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Portal Title */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('birth-predictions')}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-stone-800 p-0.5 shadow-2xs flex items-center justify-center">
              <div className="w-full h-full bg-[#FAF7F2] rounded-[6px] flex items-center justify-center">
                <span className="text-base font-serif text-amber-700 font-bold leading-none">ॐ</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-vedic font-bold text-stone-900 tracking-tight leading-none">
                  JyotishVeda
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-semibold uppercase tracking-wider">
                  Sidereal
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium leading-tight">
                Vedic Kundali & Planetary Predictions
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation: Light Colored Deck of Cards (Moved Below Main Row) */}
        <nav className="hidden lg:flex items-center space-x-1.5 pt-1.5">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-t-xl text-[11px] sm:text-xs font-medium transition-all duration-200 cursor-pointer border-t border-x ${
                  isActive
                    ? 'bg-white text-stone-950 font-bold border-amber-400 border-b-2 border-b-amber-600 shadow-sm -translate-y-1 z-10'
                    : 'bg-[#F9F6F0] text-stone-600 border-stone-200/80 hover:bg-white hover:text-stone-900 hover:-translate-y-0.5 shadow-2xs'
                }`}
                style={{
                  boxShadow: isActive
                    ? '0 -2px 6px -1px rgba(180, 83, 9, 0.12), 0 2px 4px -2px rgba(0,0,0,0.06)'
                    : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span
                  className={`w-1 h-1 rounded-full ${
                    isActive ? 'bg-amber-600 ring-2 ring-amber-200' : 'bg-stone-300 group-hover:bg-amber-400'
                  }`}
                />
                <Icon className={`w-3 h-3 ${isActive ? 'text-amber-700' : 'text-stone-500 group-hover:text-amber-700'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile / Tablet Horizontal Scroll Navigation: Light Colored Deck of Cards */}
      <div className="lg:hidden flex overflow-x-auto px-3 py-2 space-x-1.5 border-t border-[#EFE8D8] bg-[#F7F3EA] scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-all duration-150 cursor-pointer border ${
                isActive
                  ? 'bg-white text-stone-900 font-bold border-amber-400 shadow-2xs ring-1 ring-amber-300/70 -translate-y-0.5'
                  : 'bg-[#FCFAF6] text-stone-600 border-stone-200 hover:bg-white'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-amber-700' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
