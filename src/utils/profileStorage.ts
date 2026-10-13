import { UserProfile } from '../types';
import { POPULAR_CITIES } from '../data';

const STORAGE_KEY = 'jyotish_saved_user_profiles_v1';
const ACTIVE_PROFILE_KEY = 'jyotish_active_profile_id_v1';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile-1',
    label: '',
    name: 'Munish Sharma',
    birthDate: '1990-05-18',
    birthTime: '07:30',
    place: 'New Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    gender: 'Male',
    notes: 'Birth chart calibrated with Lahiri Ayanamsha',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'profile-2',
    label: 'Partner',
    name: 'Priyanka Sharma',
    birthDate: '1993-11-22',
    birthTime: '14:15',
    place: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5,
    gender: 'Female',
    notes: 'Secondary profile for relationship and transit analysis',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'profile-3',
    label: 'Child',
    name: 'Aarav Sharma',
    birthDate: '2018-09-08',
    birthTime: '09:10',
    place: 'Bengaluru, India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 5.5,
    gender: 'Male',
    notes: 'Education and health focus',
    updatedAt: new Date().toISOString(),
  },
];

export function getSavedProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((p: UserProfile) => {
        let updatedProfile = { ...p };
        // Strip legacy 'Profile 1 (Primary / Self)' label
        if (updatedProfile.label && (/profile\s*1/i.test(updatedProfile.label) || /primary/i.test(updatedProfile.label) || /self/i.test(updatedProfile.label))) {
          updatedProfile.label = '';
        }
        // Normalize name if legacy placeholder was stored
        if (updatedProfile.name && (/profile\s*1\s*\(primary\s*\/\s*self\)/i.test(updatedProfile.name) || /profile\s*1/i.test(updatedProfile.name))) {
          updatedProfile.name = 'Munish Sharma';
        }
        if (updatedProfile.label === 'Profile 2 (Family / Partner)') {
          updatedProfile.label = 'Partner';
        }
        if (updatedProfile.label === 'Profile 3 (Family / Child)') {
          updatedProfile.label = 'Child';
        }
        return updatedProfile;
      });
    }
    return DEFAULT_PROFILES;
  } catch (err) {
    console.error('Failed to load profiles from storage:', err);
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles to storage:', err);
  }
}

export function upsertProfile(profile: UserProfile): UserProfile[] {
  const profiles = getSavedProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  let updated: UserProfile[];
  if (index >= 0) {
    updated = [...profiles];
    updated[index] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    updated = [...profiles, { ...profile, updatedAt: new Date().toISOString() }];
  }
  saveProfiles(updated);
  return updated;
}

export function deleteProfile(id: string): UserProfile[] {
  const profiles = getSavedProfiles();
  const updated = profiles.filter((p) => p.id !== id);
  const finalProfiles = updated.length > 0 ? updated : DEFAULT_PROFILES;
  saveProfiles(finalProfiles);
  return finalProfiles;
}

export function getActiveProfileId(): string {
  try {
    const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (stored) return stored;
    return 'profile-1';
  } catch {
    return 'profile-1';
  }
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch (err) {
    console.error('Failed to set active profile ID:', err);
  }
}
