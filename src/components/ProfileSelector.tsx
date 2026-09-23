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
    <div className="bg-[#FAF8F5] rounded-xl border border-stone-200/90 p-3 sm:p-3.5 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <User className="w-3 h-3" />
          </div>
          <h3 className="font-vedic font-bold text-stone-900 text-xs sm:text-sm">
            Seeker Profile Deck
          </h3>
          <span className="text-[10px] text-stone-500 hidden sm:inline">
            (Select any card to load birth chart & transits)
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-amber-900 border border-amber-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-3 h-3 text-amber-700" />
          <span>Add Seeker Card</span>
        </button>
      </div>

      {/* Profiles Deck of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-0.5">
        {profiles.map((profile, idx) => {
          const isActive = profile.id === activeProfileId;
          return (
            <div
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className={`group relative rounded-xl p-3 transition-all duration-200 cursor-pointer border text-left flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-amber-400 ring-2 ring-amber-300/60 shadow-xs -translate-y-0.5'
                  : 'bg-[#FCFAF6] border-stone-200/90 hover:bg-white hover:border-amber-300 hover:shadow-2xs'
              }`}
            >
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-500">
                  {profile.label || `Card #${idx + 1}`}
                </span>

                <div className="flex items-center space-x-1">
                  {isActive ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-stone-400 group-hover:text-amber-700 transition-colors">
                      Select
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(profile);
                    }}
                    title="Edit Card"
                    className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove profile card "${profile.name}"?`)) {
                          onDeleteProfile(profile.id);
                        }
                      }}
                      title="Delete Card"
                      className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Seeker Name */}
              <div className="font-vedic font-bold text-stone-900 text-sm truncate mb-1">
                {profile.name}
              </div>

              {/* Minimal Birth Parameters on Card */}
              <div className="space-y-0.5 text-[11px] text-stone-600 border-t border-stone-100 pt-1.5">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{profile.birthDate}</span>
                  <span className="text-stone-300">•</span>
                  <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{profile.birthTime}</span>
                </div>
                <div className="flex items-center space-x-1.5 truncate text-[10px] text-stone-500">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="truncate">{profile.place}</span>
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Edit / Add Profile Modal / Form */}
      {isEditing && editForm && (
        <form
          onSubmit={handleSaveForm}
          className="p-4 sm:p-5 rounded-xl border-2 border-amber-300 bg-amber-50/40 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h4 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
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
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                Profile Label
              </label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Profile 1 (Self)"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                Time of Birth (24h)
              </label>
              <input
                type="time"
                value={editForm.birthTime}
                onChange={(e) => setEditForm({ ...editForm, birthTime: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
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
              <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                Profile Notes (Optional)
              </label>
              <input
                type="text"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Birth details verified with hospital certificate"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-amber-200">
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
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
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
