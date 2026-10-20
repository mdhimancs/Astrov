import React, { useState } from 'react';
import { User, Plus, Edit2, Trash2, Check, X, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { POPULAR_CITIES } from '../data';
import { PlaceOfBirthInput } from './PlaceOfBirthInput';
import { generateProfileInsights } from '../vedicMath';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profile: UserProfile) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
}: ProfileSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const insights = React.useMemo(() => {
    const target = editForm || activeProfile;
    if (!target) return null;
    return generateProfileInsights(
      target.birthDate || '1990-05-18',
      target.birthTime || '12:00',
      target.latitude ?? 28.6139,
      target.longitude ?? 77.2090
    );
  }, [editForm, activeProfile]);

  const handleStartEdit = (profileToEdit?: UserProfile) => {
    const target = profileToEdit || activeProfile;
    setEditForm({ ...target });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    const newIndex = profiles.length + 1;
    const newProfile: UserProfile = {
      id: `profile-${Date.now()}`,
      label: `Profile ${newIndex}`,
      name: `Seeker ${newIndex}`,
      birthDate: '1995-01-01',
      birthTime: '12:00',
      place: POPULAR_CITIES[0].name,
      latitude: POPULAR_CITIES[0].lat,
      longitude: POPULAR_CITIES[0].lng,
      timezone: POPULAR_CITIES[0].tz,
      gender: 'Other',
      notes: '',
      updatedAt: new Date().toISOString(),
    };
    setEditForm(newProfile);
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    onSaveProfile(editForm);
    setIsEditing(false);
    setEditForm(null);
  };

  const formatDateDdMmYyyy = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="bg-white/75 backdrop-blur-sm rounded-lg border border-stone-200/80 px-2 py-1 shadow-3xs space-y-1">
      <div className="flex items-center justify-between border-b border-stone-100 pb-0.5">
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3 text-amber-700" />
          <h3 className="font-vedic font-black text-stone-900 text-[11px] uppercase tracking-wider">
            Person&apos;s Profile
          </h3>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="text-[10px] font-black uppercase tracking-wider text-amber-800 hover:text-amber-950 flex items-center space-x-0.5 transition-colors cursor-pointer"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>New</span>
        </button>
      </div>

      {/* Profiles Deck of Cards — Compact 1-Row Cards without Card Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;
          return (
            <div
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className={`group relative rounded px-1.5 py-0.5 transition-all duration-150 cursor-pointer border flex items-center justify-between gap-1 shadow-3xs ${
                isActive
                  ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                  : 'bg-white border-stone-200/80 hover:border-amber-300 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center space-x-1 min-w-0">
                <span
                  className={`font-ui font-semibold text-[10px] truncate leading-none ${
                    isActive ? 'text-amber-950 font-bold' : 'text-stone-900'
                  }`}
                >
                  {profile.name}
                </span>
                <span className="text-[9px] text-stone-500 font-medium shrink-0 leading-none">
                  ({formatDateDdMmYyyy(profile.birthDate)})
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(profile);
                }}
                className="opacity-75 group-hover:opacity-100 text-stone-500 hover:text-amber-800 p-0.5 rounded transition-opacity cursor-pointer shrink-0"
                title="Edit profile"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Profile Modal / Form */}
      {isEditing && editForm && (
        <form
          onSubmit={handleSaveForm}
          className="p-2.5 sm:p-3 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2.5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
            <h4 className="font-vedic font-bold text-stone-900 text-[16px] sm:text-[18px] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Save / Edit Birth Profile Details</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditForm(null);
              }}
              className="text-stone-600 hover:text-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[14px] font-semibold text-stone-800 uppercase mb-0.5">
                Profile Label
              </label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1 text-[16px] text-stone-900 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Self, Spouse, Child"
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-stone-800 uppercase mb-0.5">
                Full Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1 text-[16px] text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-stone-800 uppercase mb-0.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1 text-[16px] text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-stone-800 uppercase mb-0.5">
                Time of Birth (24h)
              </label>
              <input
                type="time"
                value={editForm.birthTime}
                onChange={(e) => setEditForm({ ...editForm, birthTime: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1 text-[16px] text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
              <PlaceOfBirthInput
                id={`edit-profile-place-${editForm.id}`}
                value={editForm.place}
                latitude={editForm.latitude}
                longitude={editForm.longitude}
                timezone={editForm.timezone}
                onChange={(newPlace) => {
                  setEditForm({
                    ...editForm,
                    place: newPlace.name,
                    latitude: newPlace.lat,
                    longitude: newPlace.lng,
                    timezone: newPlace.tz,
                  });
                }}
                label="Birth Place (City/Town)"
                placeholder="Type city, town, village, or country (e.g. New Delhi, India)"
                compact
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-stone-800 uppercase mb-0.5">
                Profile Notes (Optional)
              </label>
              <input
                type="text"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1 text-[16px] text-stone-900 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Birth details verified with hospital certificate"
              />
            </div>
          </div>

          {insights && (
            <div className="space-y-2 bg-white rounded-lg border border-amber-200 p-3">
              <div className="flex items-center space-x-1.5 text-amber-950 border-b border-stone-200 pb-1">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <h5 className="font-vedic font-bold text-[15px]">
                  Personality Traits &amp; Whole Life Reading Synthesis
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px]">
                <div className="bg-amber-50/50 rounded p-2 border border-amber-200/60 space-y-1">
                  <span className="font-bold text-amber-950 uppercase text-[11px] block">
                    Personality Traits &amp; Temperament
                  </span>
                  <p className="text-stone-800 leading-snug">
                    {insights.personality.coreTemperament}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-semibold">
                      Element: {insights.personality.element}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold">
                      Ruling Planet: {insights.personality.rulingPlanet}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50/50 rounded p-2 border border-purple-200/60 space-y-1">
                  <span className="font-bold text-purple-950 uppercase text-[11px] block">
                    Whole Life Reading &amp; Trajectory
                  </span>
                  <p className="text-stone-800 leading-snug">
                    {insights.wholeLife.lifePathSummary}
                  </p>
                  <p className="text-stone-800 leading-snug text-[12px] italic mt-1">
                    {insights.wholeLife.careerWealthTrajectory}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1.5 border-t border-amber-200">
            {profiles.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${editForm.label}?`)) {
                    onDeleteProfile(editForm.id);
                    setIsEditing(false);
                    setEditForm(null);
                  }
                }}
                className="inline-flex items-center space-x-1 text-[16px] text-red-600 hover:text-red-800 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(null);
                }}
                className="px-3 py-1 rounded-md border border-stone-300 text-[16px] text-stone-900 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1 px-3.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-[16px] font-semibold text-white shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
