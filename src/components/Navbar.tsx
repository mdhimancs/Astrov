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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7DEC8] shadow-3xs">
      {/* Main Navbar Row */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-3">
        <div className="flex items-center justify-between py-1.5">
          {/* Logo & Portal Title */}
          <div
            className="flex items-center space-x-1.5 cursor-pointer select-none"
            onClick={() => setActiveTab('birth-predictions')}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-600 to-stone-800 flex items-center justify-center shrink-0">
              <span className="text-[14px] font-serif text-white font-bold leading-none">ॐ</span>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-[16px] font-vedic font-black text-stone-900 tracking-tight leading-none uppercase">
                  JyotishVeda
                </span>
              </div>
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

        {/* Desktop Tabs - Zero Pill Underline Style */}
        <nav className="hidden lg:flex items-center justify-between gap-2 py-1 border-t border-stone-100/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-1.5 py-1 text-[13px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-amber-800 border-amber-600'
                    : 'text-stone-600 border-transparent hover:text-stone-800 hover:border-stone-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-600 group-hover:text-amber-600'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile / Tablet Scroll Navigation */}
      <div className="lg:hidden border-t border-[#F5F0E8] bg-[#FDFBF7]">
        <div className="w-full max-w-6xl mx-auto flex overflow-x-auto px-2 sm:px-3 py-1 space-x-3 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 py-1 text-[13px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-amber-800 border-amber-600'
                    : 'text-stone-600 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
