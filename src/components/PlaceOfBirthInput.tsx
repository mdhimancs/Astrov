import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { CityLocation, searchLocalCities, resolveLocationFromText } from '../utils/cityDatabase';

export interface PlaceValue {
  name: string;
  lat: number;
  lng: number;
  tz: number;
}

interface PlaceOfBirthInputProps {
  value: string;
  latitude: number;
  longitude: number;
  timezone: number;
  onChange: (place: PlaceValue) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
  id?: string;
}

export function PlaceOfBirthInput({
  value,
  latitude,
  longitude,
  timezone,
  onChange,
  label = 'Place of Birth',
  placeholder = 'Type city, town, village, or state (e.g. Amritsar, Punjab, India)',
  required = true,
  compact = false,
  id = 'place-of-birth-input',
}: PlaceOfBirthInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value change
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle outside click to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on local database + remote API
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    setIsDropdownOpen(true);

    // 1. Instant local search
    const localMatches = searchLocalCities(text, 6);
    setSuggestions(localMatches);

    // Notify parent immediately of free-form place name, keeping current coordinates
    onChange({
      name: text,
      lat: latitude,
      lng: longitude,
      tz: timezone,
    });

    // 2. Debounced remote geocoding search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length >= 3) {
      debounceTimerRef.current = setTimeout(async () => {
        setIsLoadingGeocode(true);
        try {
          const res = await fetch(`/api/astrology/geocode?q=${encodeURIComponent(text)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.results && Array.isArray(data.results) && data.results.length > 0) {
              const remoteCities: CityLocation[] = data.results.map((r: any) => ({
                name: r.name,
                country: r.country || 'Location',
                lat: r.lat,
                lng: r.lng,
                tz: r.tz ?? 5.5,
              }));

              setSuggestions((prev) => {
                const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
                const filtered = remoteCities.filter(
                  (rc) => !existingNames.has(rc.name.toLowerCase())
                );
                return [...prev, ...filtered].slice(0, 8);
              });
            }
          }
        } catch (err) {
          // silently keep local suggestions
        } finally {
          setIsLoadingGeocode(false);
        }
      }, 350);
    }
  };

  // User selects an item from autocomplete dropdown
  const handleSelectSuggestion = (city: CityLocation) => {
    setInputValue(city.name);
    setIsDropdownOpen(false);
    onChange({
      name: city.name,
      lat: Number(city.lat.toFixed(4)),
      lng: Number(city.lng.toFixed(4)),
      tz: city.tz,
    });
  };

  // When input loses focus or user presses enter
  const handleBlur = () => {
    if (inputValue.trim()) {
      const resolved = resolveLocationFromText(inputValue);
      if (Math.abs(latitude - resolved.lat) > 0.001 || Math.abs(longitude - resolved.lng) > 0.001) {
        onChange({
          name: inputValue.trim(),
          lat: Number(resolved.lat.toFixed(4)),
          lng: Number(resolved.lng.toFixed(4)),
          tz: resolved.tz,
        });
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions(searchLocalCities('', 6));
    onChange({
      name: '',
      lat: latitude,
      lng: longitude,
      tz: timezone,
    });
  };

  return (
    <div ref={containerRef} className="space-y-1 w-full relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      {/* Main Free-Form Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
        </div>

        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsDropdownOpen(true);
            if (suggestions.length === 0) {
              setSuggestions(searchLocalCities(inputValue, 6));
            }
          }}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions.length > 0 && isDropdownOpen) {
                handleSelectSuggestion(suggestions[0]);
              } else {
                handleBlur();
                setIsDropdownOpen(false);
              }
            } else if (e.key === 'Escape') {
              setIsDropdownOpen(false);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-[#FAF8F5] border border-stone-300 rounded-lg pl-9 pr-8 ${
            compact ? 'py-1.5 text-xs' : 'py-2 text-xs'
          } text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all`}
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center space-x-1">
          {isLoadingGeocode && (
            <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          )}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
              title="Clear location"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-52 overflow-y-auto divide-y divide-stone-100">
          {suggestions.map((city, idx) => (
            <button
              key={`${city.name}-${idx}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectSuggestion(city);
              }}
              className="w-full text-left px-3 py-2 hover:bg-amber-50/70 transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <MapPin className="w-3 h-3 text-stone-400 group-hover:text-amber-600 shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-medium text-stone-900 group-hover:text-amber-950 block truncate">
                    {city.name}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {city.state ? `${city.state}, ` : ''}{city.country}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
