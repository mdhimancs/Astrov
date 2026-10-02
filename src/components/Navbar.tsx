import React from 'react';
import { Compass, Clock, Shield, Calendar, HeartHandshake, Sparkles, Orbit, Layers, Award, Brain } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTransitTime: string;
}

export function Navbar({ activeTab, setActiveTab, currentTransitTime }: NavbarProps) {
  const tabs = [
    { id: 'birth-predictions', label: 'Birth Charts', icon: Compass },
    { id: 'monthly-predictions', label: 'Monthly & Yearly Readings', icon: Calendar },
    { id: 'vimshottari-dasha', label: 'Dasha', icon: Layers },
    { id: 'upay-remedies', label: 'Upay & Remedies', icon: Sparkles },
    { id: 'critical-transits', label: 'Milestones', icon: Award },
    { id: 'divisional-charts', label: 'Divisional', icon: Brain },
    { id: 'sadesati', label: 'Sade Sati', icon: Shield },
    { id: 'transits', label: 'Live', icon: Orbit },
    { id: 'panchang', label: 'Panchang', icon: Clock },
    { id: 'compatibility', label: 'Matching', icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7DEC8] shadow-3xs">
      {/* Main Navbar Row */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-3">
        <div className="flex items-center justify-between py-1.5">
          {/* Attractive Sacred Vedic Logo & Portal Title */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
            onClick={() => setActiveTab('birth-predictions')}
          >
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-red-900 p-[1.5px] shadow-xs group-hover:shadow-md transition-all shrink-0">
              <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#2C1206] via-[#4A1C07] to-[#1E0B03] flex items-center justify-center relative overflow-hidden">
                {/* Sacred Mandala / Sunburst & Lotus SVG */}
                <svg viewBox="0 0 40 40" className="w-8 h-8 text-amber-300" fill="none">
                  {/* Outer Sacred Circle & 8 Directions */}
                  <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 1.5" className="opacity-60" />
                  <circle cx="20" cy="20" r="14" stroke="#F59E0B" strokeWidth="0.9" className="opacity-80" />
                  {/* Sacred Yantra Triangles */}
                  <polygon points="20,5 33,27 7,27" stroke="#FBBF24" strokeWidth="0.9" fill="rgba(245, 158, 11, 0.12)" />
                  <polygon points="20,35 33,13 7,13" stroke="#FDE68A" strokeWidth="0.9" fill="rgba(251, 191, 36, 0.08)" />
                  {/* CornerBindu Dots */}
                  <circle cx="20" cy="3" r="1" fill="#FDE68A" />
                  <circle cx="20" cy="37" r="1" fill="#FDE68A" />
                  <circle cx="3" cy="20" r="1" fill="#FDE68A" />
                  <circle cx="37" cy="20" r="1" fill="#FDE68A" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[15px] font-serif text-amber-200 font-bold leading-none drop-shadow">
                  ॐ
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-[17px] font-vedic font-black bg-gradient-to-r from-amber-900 via-orange-800 to-stone-900 bg-clip-text text-transparent tracking-tight leading-none uppercase">
                  Astrov
                </span>
                <span className="text-amber-500 font-light text-[16px] leading-none">|</span>
                <span className="text-[16px] font-vedic font-bold text-stone-900 tracking-wide leading-none uppercase">
                  Jotishveda
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800/90 leading-none mt-0.5">
                Parashari • Bhrigu • Lal Kitab
              </span>
            </div>
          </div>

          {/* Transit Info - Merged for Desktop */}
          <div className="hidden lg:flex items-center space-x-2 text-[13px] text-stone-600 font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Gochar: <span className="text-amber-800">{currentTransitTime}</span></span>
            </div>
          </div>
        </div>

        {/* Desktop Tabs - Compact 1-Row Deck of Cards */}
        <nav className="hidden lg:grid lg:grid-cols-10 gap-1 py-1.5 border-t border-stone-100/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative rounded-md px-2 py-1 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1 ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5] shadow-3xs'
                }`}
              >
                <span className="font-vedic font-bold text-[12px] leading-none truncate">
                  {tab.label}
                </span>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600'}`} />
              </div>
            );
          })}
        </nav>
      </div>

      {/* Mobile / Tablet Scroll Navigation - Compact 1-Row Deck of Cards */}
      <div className="lg:hidden border-t border-[#F5F0E8] bg-[#FDFBF7]">
        <div className="w-full max-w-6xl mx-auto flex overflow-x-auto px-2 sm:px-3 py-1.5 space-x-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-2.5 py-1 transition-all duration-150 cursor-pointer border flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200/80 text-stone-700'
                }`}
              >
                <span className="font-vedic font-bold text-[12px] leading-none">{tab.label}</span>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-500'}`} />
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
