import React from 'react';
import { Compass, Clock, Shield, Calendar, HeartHandshake, Sparkles, Orbit, Layers, Award, Brain } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTransitTime: string;
}

export function Navbar({ activeTab, setActiveTab, currentTransitTime }: NavbarProps) {
  const tabs = [
    { id: 'birth-predictions', label: 'Birth', icon: Compass },
    { id: 'monthly-predictions', label: 'Monthly', icon: Calendar },
    { id: 'vimshottari-dasha', label: 'Dasha', icon: Layers },
    { id: 'critical-transits', label: 'Milestones', icon: Award },
    { id: 'divisional-charts', label: 'Divisional', icon: Brain },
    { id: 'transits', label: 'Live', icon: Orbit },
    { id: 'sadesati', label: 'Sade Sati', icon: Shield },
    { id: 'panchang', label: 'Panchang', icon: Clock },
    { id: 'compatibility', label: 'Matching', icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7DEC8] shadow-xs">
      {/* Main Navbar Row */}
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center justify-between h-10 sm:h-11">
          {/* Logo & Portal Title */}
          <div
            className="flex items-center space-x-2 cursor-pointer select-none"
            onClick={() => setActiveTab('birth-predictions')}
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-600 to-stone-800 p-0.5 shadow-2xs flex items-center justify-center shrink-0">
              <span className="text-sm font-serif text-white font-bold leading-none">ॐ</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm sm:text-base font-vedic font-black text-stone-900 tracking-tight leading-none uppercase">
                  JyotishVeda
                </span>
              </div>
              <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                Sidereal Kundali
              </p>
            </div>
          </div>

          {/* Transit Info - Merged for Desktop */}
          <div className="hidden lg:flex items-center space-x-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gochar: <span className="text-amber-800">{currentTransitTime}</span></span>
            </div>
            <div className="flex items-center space-x-2 border-l border-stone-200 pl-3">
              <span>Lahiri Ayanamsha</span>
            </div>
          </div>
        </div>

        {/* Desktop Tabs - Zero Pill Underline Style */}
        <nav className="hidden lg:flex items-center space-x-6 h-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-1.5 h-full text-[10px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-amber-800 border-amber-600'
                    : 'text-stone-400 border-transparent hover:text-stone-600 hover:border-stone-200'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-amber-600'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile / Tablet Scroll Navigation */}
      <div className="lg:hidden flex overflow-x-auto px-2 py-1 space-x-4 border-t border-[#F5F0E8] bg-[#FDFBF7] scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-150 cursor-pointer border-b-2 ${
                isActive
                  ? 'text-amber-800 border-amber-600'
                  : 'text-stone-400 border-transparent'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
