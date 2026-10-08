import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Clock,
  Shield,
  Calendar,
  HeartHandshake,
  Sparkles,
  Orbit,
  Layers,
  Award,
  Brain,
  User,
  ChevronDown,
  Check,
  MapPin,
  CalendarDays,
  BookOpen,
  Globe,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTransitTime: string;
  currentProfile?: UserProfile;
  profiles?: UserProfile[];
  onProfileChange?: (id: string) => void;
}

function formatProfileDoc(dateStr?: string, timeStr?: string) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const formattedDate = `${parseInt(d, 10)} ${monthName} ${y}`;
    return timeStr ? `${formattedDate} (${timeStr})` : formattedDate;
  } catch {
    return dateStr;
  }
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentTransitTime,
  currentProfile,
  profiles = [],
  onProfileChange,
}: NavbarProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'birth-predictions', label: 'Birth Charts', icon: Compass },
    { id: 'monthly-predictions', label: 'Monthly & Yearly Readings', icon: Calendar },
    { id: 'vimshottari-dasha', label: 'Dasha', icon: Layers },
    { id: 'upay-remedies', label: 'Upay & Remedies', icon: Sparkles },
    { id: 'critical-transits', label: 'Milestones', icon: Award },
    { id: 'astrology-systems', label: 'Systems & Cosmology', icon: BookOpen },
    { id: 'divisional-charts', label: 'Divisional', icon: Brain },
    { id: 'sadesati', label: 'Sade Sati', icon: Shield },
    { id: 'transits', label: 'Live', icon: Orbit },
    { id: 'astronomical-ephemeris', label: 'Ephemeris & Nakshatras', icon: Globe },
    { id: 'panchang', label: 'Panchang', icon: Clock },
    { id: 'compatibility', label: 'Matching', icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7DEC8] shadow-3xs">
      {/* Main Navbar Row */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-3">
        <div className="flex items-center justify-between py-1.5 gap-2">
          {/* Sacred Vedic Logo & Portal Title */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none group shrink-0"
            onClick={() => setActiveTab('birth-predictions')}
          >
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-red-900 p-[1.5px] shadow-xs group-hover:shadow-md transition-all shrink-0">
              <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#2C1206] via-[#4A1C07] to-[#1E0B03] flex items-center justify-center relative overflow-hidden">
                {/* Sacred Mandala / Sunburst & Lotus SVG */}
                <svg viewBox="0 0 40 40" className="w-8 h-8 text-amber-300" fill="none">
                  {/* Outer Sacred Circle & 8 Directions */}
                  <circle
                    cx="20"
                    cy="20"
                    r="17"
                    stroke="currentColor"
                    strokeWidth="0.75"
                    strokeDasharray="2 1.5"
                    className="opacity-60"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="14"
                    stroke="#F59E0B"
                    strokeWidth="0.9"
                    className="opacity-80"
                  />
                  {/* Sacred Yantra Triangles */}
                  <polygon
                    points="20,5 33,27 7,27"
                    stroke="#FBBF24"
                    strokeWidth="0.9"
                    fill="rgba(245, 158, 11, 0.12)"
                  />
                  <polygon
                    points="20,35 33,13 7,13"
                    stroke="#FDE68A"
                    strokeWidth="0.9"
                    fill="rgba(251, 191, 36, 0.08)"
                  />
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

          {/* PERSON'S PROFILE TITLE BAR CHIP (NAME — DOC/DOB — PLACE) - VISIBLE ACROSS ALL TABS */}
          {currentProfile && (
            <div className="relative shrink min-w-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-amber-50/95 via-amber-50/70 to-[#FAF6EE] hover:from-amber-100 hover:to-amber-50/90 border border-amber-300/90 rounded-lg px-2 sm:px-3 py-1 text-left transition-all shadow-3xs cursor-pointer group max-w-full"
                title="Active Person Profile — Click to switch profile"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-700 via-orange-700 to-amber-900 text-amber-100 flex items-center justify-center font-bold text-[11px] shadow-3xs shrink-0 border border-amber-400/40">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  {/* Name — DOC — Place Header Display */}
                  <div className="flex items-center space-x-1 sm:space-x-1.5 leading-tight text-[11px] sm:text-[12px] truncate">
                    <span className="font-vedic font-black text-amber-950 tracking-tight truncate max-w-[110px] sm:max-w-[140px]">
                      {currentProfile.name}
                    </span>
                    <span className="text-amber-400 font-bold select-none">—</span>
                    <span className="text-stone-800 font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                      {formatProfileDoc(currentProfile.birthDate, currentProfile.birthTime)}
                    </span>
                    <span className="text-amber-400 font-bold select-none hidden md:inline">—</span>
                    <span className="text-stone-600 font-medium truncate max-w-[120px] sm:max-w-[160px] hidden md:inline">
                      {currentProfile.place}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-800 transition-transform shrink-0 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profiles Dropdown Switcher */}
              {isProfileDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-amber-200 py-1.5 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1 border-b border-stone-100 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-900">
                    <span>Select Person Profile</span>
                    <span className="text-stone-400 font-normal">{profiles.length} Saved</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-stone-50">
                    {profiles.map((p) => {
                      const isSelected = p.id === currentProfile.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (onProfileChange) {
                              onProfileChange(p.id);
                            }
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-amber-50/90 text-amber-950 font-bold'
                              : 'hover:bg-[#FAF8F5] text-stone-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-vedic font-bold text-[13px] truncate">
                                {p.name}
                              </span>
                              {p.label && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-normal">
                                  {p.label}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-600 flex items-center space-x-1 mt-0.5 truncate">
                              <span>{formatProfileDoc(p.birthDate, p.birthTime)}</span>
                              <span>•</span>
                              <span className="truncate">{p.place}</span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-700 shrink-0 font-bold" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-3 py-1.5 border-t border-stone-100 bg-[#FAF8F5] text-[11px] text-stone-500 flex items-center justify-between">
                    <span>Title bar active across all tabs</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('birth-predictions');
                      }}
                      className="text-amber-800 font-bold hover:underline cursor-pointer"
                    >
                      Manage Profiles →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transit Info */}
          <div className="hidden lg:flex items-center space-x-2 text-[12px] text-stone-600 font-bold uppercase tracking-wider shrink-0">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Gochar: <span className="text-amber-800">{currentTransitTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Compact Profile Sub-Bar for smaller screens */}
        {currentProfile && (
          <div className="md:hidden flex items-center justify-between py-0.5 px-1 border-t border-amber-100/60 text-[11px] text-stone-600">
            <div className="flex items-center space-x-1 truncate">
              <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">{currentProfile.place}</span>
            </div>
            <span className="text-[10px] text-amber-900 font-semibold bg-amber-50 px-1.5 py-0.2 rounded shrink-0">
              {currentProfile.birthDate} ({currentProfile.birthTime})
            </span>
          </div>
        )}

        {/* Desktop Tabs - Compact 2-Row Deck of Cards */}
        <nav className="hidden lg:flex lg:flex-col gap-1.5 py-1.5 border-t border-stone-100/80">
          <div className="grid grid-cols-6 gap-1.5">
            {tabs.slice(0, 6).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative rounded-lg px-2.5 py-1.5 transition-all duration-150 cursor-pointer flex items-center justify-between gap-1 shadow-none border ${
                    isActive
                      ? 'bg-amber-50/50 border-amber-200 border-b-2 border-b-amber-500 text-amber-950 font-bold'
                      : 'bg-white border-stone-200/50 border-b-2 border-b-stone-200 text-stone-700 hover:border-amber-200 hover:border-b-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="font-vedic font-bold text-[12px] leading-none truncate">
                    {tab.label}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-amber-800' : 'text-stone-400 group-hover:text-amber-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {tabs.slice(6).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative rounded-lg px-2.5 py-1.5 transition-all duration-150 cursor-pointer flex items-center justify-between gap-1 shadow-none border ${
                    isActive
                      ? 'bg-amber-50/50 border-amber-200 border-b-2 border-b-amber-500 text-amber-950 font-bold'
                      : 'bg-white border-stone-200/50 border-b-2 border-b-stone-200 text-stone-700 hover:border-amber-200 hover:border-b-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="font-vedic font-bold text-[12px] leading-none truncate">
                    {tab.label}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-amber-800' : 'text-stone-400 group-hover:text-amber-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile / Tablet Scroll Navigation - Compact 1-Row Deck of Cards */}
      <div className="lg:hidden border-t border-[#F5F0E8] bg-[#FDFBF7]">
        <div className="w-full max-w-6xl mx-auto flex overflow-x-auto px-2 sm:px-3 py-1.5 space-x-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 transition-all duration-150 cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-50 via-amber-100/60 to-amber-50 border-t border-l border-r border-amber-400 border-b-4 border-b-amber-700 text-amber-950 font-bold'
                    : 'bg-white border-t border-l border-r border-stone-200/90 border-b-4 border-b-stone-300 text-stone-700'
                }`}
              >
                <span className="font-vedic font-bold text-[12px] leading-none">{tab.label}</span>
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-amber-800' : 'text-stone-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
