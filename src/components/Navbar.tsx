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
  Plus,
  X,
  UserPlus,
  Edit3,
  Trash2,
  Flame,
  GraduationCap,
  Users,
  Calculator,
  Circle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTransitTime: string;
  currentProfile?: UserProfile;
  profiles?: UserProfile[];
  onProfileChange?: (id: string) => void;
  onAddProfile?: (profile: UserProfile) => void;
  onSaveProfile?: (profile: UserProfile) => void;
  onDeleteProfile?: (id: string) => void;
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
  onAddProfile,
  onSaveProfile,
  onDeleteProfile,
}: NavbarProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('1992-06-15');
  const [formBirthTime, setFormBirthTime] = useState('10:30');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formLabel, setFormLabel] = useState('Family / Friend');
  const [formNotes, setFormNotes] = useState('');
  const [formPlace, setFormPlace] = useState<PlaceValue>({
    name: 'New Delhi, India',
    lat: 28.6139,
    lng: 77.2090,
    tz: 5.5,
  });

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

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingProfileId(null);
    setShowDeleteConfirm(false);
    setFormName('');
    setFormBirthDate('1995-01-01');
    setFormBirthTime('12:00');
    setFormGender('Male');
    setFormLabel('');
    setFormNotes('');
    setFormPlace({
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.2090,
      tz: 5.5,
    });
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleOpenEditModal = (profileToEdit?: UserProfile) => {
    const target = profileToEdit || currentProfile;
    if (!target) return;
    setModalMode('edit');
    setEditingProfileId(target.id);
    setShowDeleteConfirm(false);
    setFormName(target.name || '');
    setFormBirthDate(target.birthDate || '1990-01-01');
    setFormBirthTime(target.birthTime || '12:00');
    setFormGender((target.gender as any) || 'Male');
    const cleanLabel = (target.label || '').replace(/^Profile\s*1\s*\(.*?\)$/i, '');
    setFormLabel(cleanLabel);
    setFormNotes(target.notes || '');
    setFormPlace({
      name: target.place || 'New Delhi, India',
      lat: target.latitude ?? 28.6139,
      lng: target.longitude ?? 77.2090,
      tz: target.timezone ?? 5.5,
    });
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleSubmitProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (modalMode === 'edit' && editingProfileId) {
      const existing = profiles.find((p) => p.id === editingProfileId);
      const updatedProfile: UserProfile = {
        id: editingProfileId,
        label: formLabel.trim() || existing?.label || 'Profile',
        name: formName.trim(),
        birthDate: formBirthDate,
        birthTime: formBirthTime,
        place: formPlace.name,
        latitude: formPlace.lat,
        longitude: formPlace.lng,
        timezone: formPlace.tz,
        gender: formGender,
        notes: formNotes.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (onSaveProfile) {
        onSaveProfile(updatedProfile);
      } else if (onAddProfile) {
        onAddProfile(updatedProfile);
      }
    } else {
      const newProfile: UserProfile = {
        id: `profile-${Date.now()}`,
        label: formLabel.trim() || 'Profile',
        name: formName.trim(),
        birthDate: formBirthDate,
        birthTime: formBirthTime,
        place: formPlace.name,
        latitude: formPlace.lat,
        longitude: formPlace.lng,
        timezone: formPlace.tz,
        gender: formGender,
        notes: formNotes.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (onAddProfile) {
        onAddProfile(newProfile);
      }
    }

    setIsProfileModalOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleDeleteProfileClick = () => {
    if (!editingProfileId) return;
    if (onDeleteProfile) {
      onDeleteProfile(editingProfileId);
    }
    setIsProfileModalOpen(false);
    setIsProfileDropdownOpen(false);
    setShowDeleteConfirm(false);
  };

  const tabs = [
    { id: 'birth-predictions', label: 'Birth Charts', icon: Compass },
    { id: 'celestial-wheel', label: '360° Wheel', icon: Globe },
    { id: 'divisional-charts', label: 'Divisional', icon: Brain },
    { id: 'astronomical-ephemeris', label: 'Ephemeris & Nakshatras', icon: Orbit },
    { id: 'astrology-systems', label: 'Systems & Cosmology', icon: BookOpen },
    { id: 'panchang', label: 'Panchang', icon: Clock },
    { id: 'monthly-predictions', label: 'Monthly & Yearly', icon: Calendar },
    { id: 'life-events', label: 'Life Events & Matters', icon: Flame },
    { id: 'vimshottari-dasha', label: 'Dasha', icon: Layers },
    { id: 'critical-transits', label: 'Milestones', icon: Award },
    { id: 'sadesati', label: 'Sade Sati', icon: Shield },
    { id: 'transits', label: 'Live', icon: Orbit },
    { id: 'personalized-guidance', label: 'Personalized Guidance', icon: GraduationCap },
    { id: 'family-lineage', label: 'Family Members & Lineage', icon: Users },
    { id: 'compatibility', label: 'Matching & Remedies', icon: HeartHandshake },
    { id: 'numerology', label: 'Numerology', icon: Calculator },
    { id: 'real-planets', label: 'Real Planets & Nakshatra', icon: Sparkles },
    { id: 'natal-chart', label: 'Natal Zodiac Wheel', icon: Circle },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7DEC8] shadow-3xs">

      {/* Main Navbar Row */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-3">
        <div className="flex items-center justify-between py-1.5 gap-2">
          {/* Left Side: Sacred Vedic Logo ONLY */}
          <div
            className="flex items-center space-x-2 cursor-pointer select-none group shrink-0"
            onClick={() => setActiveTab('birth-predictions')}
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-red-900 p-[1.5px] shadow-xs group-hover:shadow-md transition-all shrink-0">
              <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#2C1206] via-[#4A1C07] to-[#1E0B03] flex items-center justify-center relative overflow-hidden">
                {/* Sacred Mandala / Sunburst & Lotus SVG */}
                <svg viewBox="0 0 40 40" className="w-7 h-7 text-amber-300" fill="none">
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
                  <circle cx="20" cy="3" r="1" fill="#FDE68A" />
                  <circle cx="20" cy="37" r="1" fill="#FDE68A" />
                  <circle cx="3" cy="20" r="1" fill="#FDE68A" />
                  <circle cx="37" cy="20" r="1" fill="#FDE68A" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-vedic text-amber-200 font-bold leading-none drop-shadow">
                  ॐ
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-1.5">
                <span className="text-[16px] font-vedic font-bold bg-gradient-to-r from-amber-900 via-orange-800 to-stone-900 bg-clip-text text-transparent tracking-tight leading-none uppercase">
                  Astrov
                </span>
                <span className="text-amber-500 font-light text-[15px] leading-none">|</span>
                <span className="text-[15px] font-vedic font-bold text-stone-900 tracking-wide leading-none uppercase">
                  Jotishveda
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Profile Dropdown Selector + Extreme Right Gochar */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* PROFILE DROPDOWN WITH COMPACT SELECTOR BUTTON */}
            {currentProfile && (
              <div className="relative shrink min-w-0" ref={dropdownRef}>
                {/* PROFILE BUTTON SELECTOR (Compact Size) */}
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-amber-50/95 via-amber-50/80 to-[#FAF6EE] hover:from-amber-100 hover:to-amber-50 border border-amber-300 rounded-md px-1.5 py-0 text-left transition-all shadow-3xs cursor-pointer group max-w-[200px] sm:max-w-[310px] md:max-w-[360px]"
                  style={{ height: '23.8px', fontSize: '9px' }}
                  title="Switch Active Profile"
                >
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-700 via-orange-700 to-amber-900 text-amber-100 flex items-center justify-center font-bold text-[8px] shadow-3xs shrink-0 border border-amber-400/40">
                    <User className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center space-x-0.5 leading-tight truncate">
                      <span className="font-sans font-bold text-amber-950 truncate max-w-[95px] sm:max-w-[130px]" style={{ fontSize: '11px' }}>
                        {currentProfile.name && /profile\s*1\s*\(primary\s*\/\s*self\)/i.test(currentProfile.name) ? 'Munish Sharma' : currentProfile.name}
                      </span>
                      <span className="text-amber-400 font-bold select-none" style={{ fontSize: '10.5px' }}>—</span>
                      <span className="text-stone-800 font-semibold truncate max-w-[85px] sm:max-w-[120px]" style={{ fontSize: '10.5px' }}>
                        {formatProfileDoc(currentProfile.birthDate, currentProfile.birthTime)}
                      </span>
                      <span className="text-amber-400 font-bold select-none hidden xl:inline" style={{ fontSize: '10.5px' }}>—</span>
                      <span className="text-stone-600 font-medium truncate max-w-[90px] hidden xl:inline" style={{ fontSize: '10.5px' }}>
                        {currentProfile.place}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-amber-800 transition-transform shrink-0 ml-0.5 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profiles Dropdown Switcher Menu (Reduced compact size) */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-amber-200 py-1 z-50 animate-in fade-in duration-100">
                    <div className="max-h-60 overflow-y-auto py-0.5 divide-y divide-stone-50">
                      {profiles.map((p) => {
                        const isSelected = p.id === currentProfile.id;
                        const cleanDisplayName = p.name && /profile\s*1\s*\(primary\s*\/\s*self\)/i.test(p.name) ? 'Munish Sharma' : p.name;
                        // Filter out Profile 1 (Primary / Self) labels completely from the drop down menu
                        const showCustomLabel = p.label && !/profile\s*1|primary|self/i.test(p.label) && p.label.trim() !== '';

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (onProfileChange) {
                                onProfileChange(p.id);
                              }
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`px-2.5 py-1.5 text-left transition-colors flex items-center justify-between gap-1.5 cursor-pointer group/item ${
                              isSelected
                                ? 'bg-amber-50/90 text-amber-950 font-bold'
                                : 'hover:bg-[#FAF8F5] text-stone-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-sans font-bold text-[13px] truncate">
                                  {cleanDisplayName}
                                </span>
                                {showCustomLabel && (
                                  <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-normal">
                                    {p.label.replace(/^Profile\s*\d*\s*\(?(.*?)\)?$/, '$1') || p.label}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-600 flex items-center space-x-1 mt-0.5 truncate">
                                <span>{formatProfileDoc(p.birthDate, p.birthTime)}</span>
                                <span>•</span>
                                <span className="truncate">{p.place}</span>
                              </div>
                            </div>

                            {/* ACTIONS: EDIT, DELETE & ACTIVE CHECKMARK */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(p);
                                }}
                                title={`Edit ${cleanDisplayName}`}
                                className="p-1.5 rounded bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer flex items-center justify-center shadow-3xs"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                              </button>

                              {profiles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(p);
                                    setShowDeleteConfirm(true);
                                  }}
                                  title={`Remove profile ${cleanDisplayName}`}
                                  className="p-1 rounded text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}

                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0 ml-0.5" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LIVE GOCHAR TRANSIT INFO — REDUCED COMPACT SIZE */}
            <div className="hidden md:flex items-center space-x-1 text-[10.5px] text-stone-600 font-bold uppercase tracking-wider bg-stone-50 border border-stone-200/90 px-2 py-0.5 rounded-md shrink-0 shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Gochar: <span className="text-amber-900 font-mono font-bold text-[10.5px]">{currentTransitTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Compact Profile Sub-Bar for smaller screens */}
        {currentProfile && (
          <div className="md:hidden flex items-center justify-between py-1 px-1 border-t border-amber-100/60 text-[12px] text-stone-600">
            <div className="flex items-center space-x-1 truncate">
              <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">{currentProfile.place}</span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[12px] text-amber-900 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                {currentProfile.birthDate} ({currentProfile.birthTime})
              </span>
              <button
                type="button"
                onClick={() => handleOpenEditModal(currentProfile)}
                className="text-amber-800 font-bold hover:underline text-[12px]"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Desktop Tabs - 2 rows of 9 tabs */}
        <nav className="hidden lg:block pb-1 pt-0.5 space-y-0.5">
          <div className="grid grid-cols-9 gap-1">
            {tabs.slice(0, 9).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative rounded-md px-2 py-[3px] sm:py-[4px] min-h-[25px] sm:min-h-[26px] transition-all duration-150 cursor-pointer flex items-center justify-between gap-0.5 shadow-none border ${
                    isActive
                      ? 'bg-amber-50/80 border-amber-300 border-b-2 border-b-amber-600 text-amber-950 font-bold shadow-3xs'
                      : 'bg-white border-stone-200/60 border-b-2 border-b-stone-200 text-stone-700 hover:border-amber-300 hover:border-b-amber-400 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="font-ui font-semibold text-[10.5px] leading-tight truncate">
                    {tab.label}
                  </span>
                  <Icon
                    className={`w-3 h-3 shrink-0 ${
                      isActive ? 'text-amber-800' : 'text-stone-400 group-hover:text-amber-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-9 gap-1">
            {tabs.slice(9).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative rounded-md px-2 py-[3px] sm:py-[4px] min-h-[25px] sm:min-h-[26px] transition-all duration-150 cursor-pointer flex items-center justify-between gap-0.5 shadow-none border ${
                    isActive
                      ? 'bg-amber-50/80 border-amber-300 border-b-2 border-b-amber-600 text-amber-950 font-bold shadow-3xs'
                      : 'bg-white border-stone-200/60 border-b-2 border-b-stone-200 text-stone-700 hover:border-amber-300 hover:border-b-amber-400 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="font-ui font-semibold text-[10.5px] leading-tight truncate">
                    {tab.label}
                  </span>
                  <Icon
                    className={`w-3 h-3 shrink-0 ${
                      isActive ? 'text-amber-800' : 'text-stone-400 group-hover:text-amber-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile / Tablet Scroll Navigation - Reduced Vertical Height by 10% */}
      <div className="lg:hidden border-t border-[#F5F0E8] bg-[#FDFBF7]">
        <div className="w-full max-w-6xl mx-auto flex overflow-x-auto px-2 sm:px-3 py-0.5 space-x-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-2 py-0.5 min-h-[24px] transition-all duration-150 cursor-pointer flex items-center space-x-1 whitespace-nowrap shrink-0 shadow-3xs ${
                  isActive
                    ? 'bg-amber-50 border-t border-l border-r border-amber-400 border-b-2 border-b-amber-700 text-amber-950 font-bold'
                    : 'bg-white border-t border-l border-r border-stone-200 border-b-2 border-b-stone-300 text-stone-700'
                }`}
              >
                <span className="font-ui font-semibold text-[11px] leading-none">{tab.label}</span>
                <Icon
                  className={`w-3 h-3 shrink-0 ${
                    isActive ? 'text-amber-800' : 'text-stone-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* PROFILE MODAL (EDIT OR ADD NEW) — POSITIONED RIGHT NEAR THE TOP OF PROFILE DROPDOWN */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileModalOpen(false);
          }}
        >
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-3 pt-2 sm:pt-2.5 pb-6 flex justify-center sm:justify-end pr-1 sm:pr-4">
            <div className="bg-white rounded-xl shadow-2xl border border-amber-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 shadow-amber-950/15 mt-1 sm:mt-0">
            {/* Modal Header */}
            <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-50 to-[#FAF8F5] border-b border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-amber-700 text-white flex items-center justify-center shadow-3xs">
                  {modalMode === 'edit' ? <Edit3 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h3 className="font-heading-3 font-bold text-stone-950 text-[14px] leading-tight">
                    {modalMode === 'edit' ? 'Edit Profile & Birth Details' : 'Add New Person Profile'}
                  </h3>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Calibrates Janam Kundali, transits, and dashas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitProfileForm} className="p-3.5 space-y-2.5 text-[12px]">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2.5 py-1 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Time of Birth *
                  </label>
                  <input
                    type="time"
                    required
                    value={formBirthTime}
                    onChange={(e) => setFormBirthTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                  Place of Birth (City / Coordinates) *
                </label>
                <PlaceOfBirthInput
                  value={formPlace.name}
                  latitude={formPlace.lat}
                  longitude={formPlace.lng}
                  timezone={formPlace.tz}
                  onChange={(p) => setFormPlace(p)}
                  compact
                  label=""
                  placeholder="Search city, town, village..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Gender
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-1 py-0 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[10px]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Category / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Partner, Child, Self"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accurate birth time from hospital record"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  {modalMode === 'edit' && profiles.length > 1 && (
                    <>
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-red-700 hover:text-red-800 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-red-600 font-bold">Confirm delete?</span>
                          <button
                            type="button"
                            onClick={handleDeleteProfileClick}
                            className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="text-stone-500 text-[10px] px-1 py-0.5 rounded cursor-pointer hover:bg-stone-100"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-1.5 rounded text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer font-semibold text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-1.5 px-5 rounded shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer text-[14px]"
                  >
                    {modalMode === 'edit' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save &amp; Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </header>

      {/* PROFILE MODAL (EDIT OR ADD NEW) — ROOT LEVEL VIEWPORT OVERLAY WITH Z-[99999] */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProfileModalOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-amber-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 shadow-amber-950/25 my-auto">
            {/* Modal Header */}
            <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-50 to-[#FAF8F5] border-b border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-amber-700 text-white flex items-center justify-center shadow-3xs">
                  {modalMode === 'edit' ? <Edit3 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h3 className="font-heading-3 font-bold text-stone-950 text-[14px] leading-tight">
                    {modalMode === 'edit' ? 'Edit Profile & Birth Details' : 'Add New Person Profile'}
                  </h3>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    Calibrates Janam Kundali, transits, and dashas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitProfileForm} className="p-3.5 space-y-2.5 text-[12px]">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2.5 py-1 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Time of Birth *
                  </label>
                  <input
                    type="time"
                    required
                    value={formBirthTime}
                    onChange={(e) => setFormBirthTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                  Place of Birth (City / Coordinates) *
                </label>
                <PlaceOfBirthInput
                  value={formPlace.name}
                  latitude={formPlace.lat}
                  longitude={formPlace.lng}
                  timezone={formPlace.tz}
                  onChange={(p) => setFormPlace(p)}
                  compact
                  label=""
                  placeholder="Search city, town, village..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Gender
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-1 py-0 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[10px]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                    Category / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Partner, Child, Self"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-0.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accurate birth time from hospital record"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded px-2 py-1 text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white text-[12px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  {modalMode === 'edit' && profiles.length > 1 && (
                    <>
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-red-700 hover:text-red-800 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-red-600 font-bold">Confirm delete?</span>
                          <button
                            type="button"
                            onClick={handleDeleteProfileClick}
                            className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="text-stone-500 text-[10px] px-1 py-0.5 rounded cursor-pointer hover:bg-stone-100"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-1.5 rounded text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer font-semibold text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-1.5 px-5 rounded shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer text-[14px]"
                  >
                    {modalMode === 'edit' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save &amp; Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
