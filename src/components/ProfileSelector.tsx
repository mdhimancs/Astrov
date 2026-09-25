import React, { useState } from 'react';
import { User, Plus, Edit2, Trash2, Check, X, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { POPULAR_CITIES } from '../data';
import { PlaceOfBirthInput } from './PlaceOfBirthInput';

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

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-100 px-2 py-2 shadow-3xs space-y-2">
      <div className="flex items-center justify-between border-b border-stone-50 pb-1.5">
        <div className="flex items-center space-x-2">
          <User className="w-3.5 h-3.5 text-amber-700" />
          <h3 className="font-vedic font-black text-stone-900 text-[10px] uppercase tracking-widest">
            Seeker Deck
          </h3>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="text-[9px] font-black uppercase tracking-widest text-amber-800 hover:text-amber-950 flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>New Seeker</span>
        </button>
      </div>

      {/* Profiles Deck of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {profiles.map((profile, idx) => {
          const isActive = profile.id === activeProfileId;
          return (
            <div
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className={`group relative rounded-lg p-2 transition-all duration-200 cursor-pointer border text-left flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200 shadow-3xs'
                  : 'bg-white border-stone-100 hover:border-amber-200 hover:shadow-3xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-amber-800' : 'text-stone-300'}`}>
                  {isActive ? 'Active' : `Card ${idx + 1}`}
                </span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(profile);
                    }}
                    className="text-stone-400 hover:text-amber-700"
                  >
                    <Edit2 className="w-2 h-2" />
                  </button>
                </div>
              </div>

              <div className="font-vedic font-bold text-stone-800 text-[11px] truncate leading-tight">
                {profile.name}
              </div>
              <div className="text-[9px] text-stone-400 font-medium truncate">
                {profile.birthDate.split('-')[0]} • {profile.place.split(',')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Profile Modal / Form */}
      {isEditing && editForm && (
        <form
          onSubmit={handleSaveForm}
          className="p-2 sm:p-2.5 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-amber-200 pb-1">
            <h4 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Save / Edit Birth Profile Details</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditForm(null);
              }}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-stone-700 uppercase mb-0.5">
                Profile Label
              </label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Profile 1 (Self)"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-700 uppercase mb-0.5">
                Full Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-700 uppercase mb-0.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-700 uppercase mb-0.5">
                Time of Birth (24h)
              </label>
              <input
                type="time"
                value={editForm.birthTime}
                onChange={(e) => setEditForm({ ...editForm, birthTime: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
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
              <label className="block text-[10px] font-semibold text-stone-700 uppercase mb-0.5">
                Profile Notes (Optional)
              </label>
              <input
                type="text"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-md px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Birth details verified with hospital certificate"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-amber-200">
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
                className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Profile</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(null);
                }}
                className="px-2.5 py-1 rounded-md border border-stone-300 text-xs text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
