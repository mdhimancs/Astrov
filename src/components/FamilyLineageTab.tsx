import React, { useState } from 'react';
import {
  Users,
  Heart,
  ShieldCheck,
  Sparkles,
  Compass,
  Calendar,
  BookOpen,
  User,
  Award,
  ChevronRight,
  Flame,
  Star,
  Info
} from 'lucide-react';
import { UserProfile, PlanetPosition } from '../types';

interface FamilyLineageTabProps {
  activeProfile?: UserProfile;
  profiles: UserProfile[];
  natalPlanets: PlanetPosition[];
  natalHouses: any[];
  lagnaRasi: string;
}

export function FamilyLineageTab({
  activeProfile,
  natalPlanets,
  natalHouses,
  lagnaRasi,
}: FamilyLineageTabProps) {
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<'father' | 'mother' | 'siblings' | 'spouse' | 'children' | 'inlaws' | 'ancestral'>('father');

  if (!activeProfile) {
    return (
      <div className="p-6 text-center text-stone-600 bg-[#FAF6EE] rounded-xl border border-amber-200">
        Please select or add a profile to view family member predictions.
      </div>
    );
  }

  const house3 = natalHouses.find((h) => h.houseNumber === 3) || { rasiName: 'Mithuna', planets: [] };
  const house4 = natalHouses.find((h) => h.houseNumber === 4) || { rasiName: 'Karka', planets: [] };
  const house5 = natalHouses.find((h) => h.houseNumber === 5) || { rasiName: 'Simha', planets: [] };
  const house7 = natalHouses.find((h) => h.houseNumber === 7) || { rasiName: 'Tula', planets: [] };
  const house9 = natalHouses.find((h) => h.houseNumber === 9) || { rasiName: 'Dhanu', planets: [] };
  const house11 = natalHouses.find((h) => h.houseNumber === 11) || { rasiName: 'Kumbha', planets: [] };

  const sunPlanet = natalPlanets.find((p) => p.name === 'Surya');
  const moonPlanet = natalPlanets.find((p) => p.name === 'Chandra');
  const jupiterPlanet = natalPlanets.find((p) => p.name === 'Guru');
  const venusPlanet = natalPlanets.find((p) => p.name === 'Shukra');

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200 bg-[#FAF6EE] p-3 sm:p-5 rounded-2xl border border-amber-300/70 shadow-xs">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 text-amber-50 p-4 sm:p-6 rounded-xl shadow-md border border-amber-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Vedic Lineage & Family Horoscopy (Kutumba & Vamsha Vigyan)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
              Family Members Predictions & Ancestral Analysis
            </h1>
            <p className="text-amber-200/90 text-[13px] sm:text-[14px] mt-1 max-w-2xl">
              Derived from <span className="font-bold text-white">{activeProfile.name}'s</span> precise birth chart (Lagna: <span className="text-amber-300 font-bold">{lagnaRasi}</span>), mapping parentage, siblings, spouse, children, and ancestral lineage through classical Jyotish principles (2nd, 4th, 5th, 7th, 9th, and 11th houses).
            </p>
          </div>
          <div className="bg-amber-900/80 border border-amber-600/60 px-3 py-2 rounded-lg text-right shrink-0">
            <div className="text-[11px] text-amber-300 font-bold uppercase">Active Native Chart</div>
            <div className="text-sm font-bold text-white">{activeProfile.name}</div>
            <div className="text-[12px] text-amber-200">{activeProfile.birthDate} • {activeProfile.birthTime}</div>
          </div>
        </div>
      </div>

      {/* Navigation Member Selector Tabs (30% bigger with robust text padding) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-1">
        {[
          { id: 'father', label: 'Father (9th House)', icon: ShieldCheck, desc: 'Paternal Line & Guidance' },
          { id: 'mother', label: 'Mother (4th House)', icon: Heart, desc: 'Maternal Roots & Home' },
          { id: 'siblings', label: 'Siblings (3rd/11th)', icon: Users, desc: 'Co-borns & Support' },
          { id: 'spouse', label: 'Spouse (7th House)', icon: Heart, desc: 'Partner & Union' },
          { id: 'children', label: 'Children (5th House)', icon: Star, desc: 'Progeny & Legacy' },
          { id: 'inlaws', label: 'In-Laws & Kin', icon: Users, desc: 'Extended Family Dynamics' },
          { id: 'ancestral', label: 'Ancestors & Pitru', icon: BookOpen, desc: 'Karmic Lineage' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedFamilyMember === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedFamilyMember(item.id as any)}
              className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer shadow-3xs ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-900 to-amber-950 text-amber-50 border-amber-700 shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-amber-50/80 text-stone-800 border-amber-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-300' : 'text-amber-700'}`} />
              <span className={`font-bold text-[14px] sm:text-[15px] leading-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                {item.label}
              </span>
              <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Family Member Detailed Analysis Box */}
      <div className="bg-white rounded-xl border border-amber-200 p-4 sm:p-6 shadow-sm space-y-4">
        {selectedFamilyMember === 'father' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Father & Paternal Lineage Prediction (9th House & Sun)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  In Vedic Astrology, the 9th house governs the father, dharma, mentor figures, and higher wisdom. The Sun (Surya) represents paternal karaka.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">9th House Sign & Rasi</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house9.rasiName}</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  {house9.rasiName === 'Mesha' || house9.rasiName === 'Simha' || house9.rasiName === 'Dhanu'
                    ? 'Fire sign in 9th house bestows a dynamic, principled, and spirited father with strong leadership traits.'
                    : house9.rasiName === 'Vrishabha' || house9.rasiName === 'Kanya' || house9.rasiName === 'Makara'
                    ? 'Earth sign in 9th house indicates a hardworking, grounded, and financially prudent father.'
                    : house9.rasiName === 'Mithuna' || house9.rasiName === 'Tula' || house9.rasiName === 'Kumbha'
                    ? 'Air sign in 9th house points to an intellectual, communicative, and forward-thinking father.'
                    : 'Water sign in 9th house signifies an intuitive, compassionate, and deeply emotional bond with paternal figures.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Sun (Surya) Placement</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {sunPlanet ? `${sunPlanet.name} in ${sunPlanet.rasiName} (${sunPlanet.house}th House)` : 'Placed in chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1">
                  {sunPlanet?.house === 1 || sunPlanet?.house === 10 || sunPlanet?.house === 9
                    ? 'Strong Sun placement indicates high social standing, authority, or respect achieved by the father.'
                    : 'Indicates a protective and steady paternal influence shaping the native’s ethical foundation.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Paternal Legacy & Fortune</div>
                <div className="text-base font-bold text-stone-900 mt-1">High Lifelong Blessings</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  The native receives ancestral guidance and protective grace during pivotal career milestones and major Dasha transits.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFamilyMember === 'mother' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Mother & Domestic Roots Prediction (4th House & Moon)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 4th house governs the mother, emotional security, inner peace, and real estate. The Moon (Chandra) represents the maternal mind and heart.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">4th House Sign & Rasi</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house4.rasiName}</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  {house4.rasiName === 'Karka' || house4.rasiName === 'Vrischika' || house4.rasiName === 'Meena'
                    ? 'Water sign in 4th house reflects an exceptionally nurturing, intuitive, and spiritually inclined mother.'
                    : 'Brings strong structural support, home-oriented stability, and disciplined caregiving in early life.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Moon (Chandra) Placement</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {moonPlanet ? `${moonPlanet.name} in ${moonPlanet.rasiName} (${moonPlanet.house}th House)` : 'Placed in chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Governs emotional resonance with the mother and domestic peace. Strong lunar aspects bring lasting property and vehicle acquisitions.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Domestic Bliss & Property</div>
                <div className="text-base font-bold text-stone-900 mt-1">Favorable Ancestral Shelter</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Indicates peaceful family atmosphere and favorable outcomes in matters of ancestral real estate and domestic harmony.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFamilyMember === 'siblings' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Users className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Siblings & Co-borns Prediction (3rd & 11th Houses)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 3rd house represents younger siblings, courage, and teamwork. The 11th house governs elder siblings, gains, and social circles.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Younger Siblings (3rd House: {house3.rasiName})</div>
                <div className="text-base font-bold text-stone-900 mt-1">Courage & Joint Enterprise</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Indicates cooperative bonds with younger siblings or close peers. Mars energy in or ruling 3rd house imparts enterprise and competitive resilience.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Elder Siblings (11th House: {house11.rasiName})</div>
                <div className="text-base font-bold text-stone-900 mt-1">Prosperity & Gains</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Elder siblings or mentors play a constructive role in career networking, financial growth, and long-term ambition fulfillment.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFamilyMember === 'spouse' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Spouse & Marital Family Extension (7th House)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 7th house governs marriage, life partner characteristics, and extended family relationships formed post-union.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">7th House Sign ({house7.rasiName})</div>
                <div className="text-base font-bold text-stone-900 mt-1">Partner Archetype</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Reflects the partner’s temperament, professional background, and social standing, blending harmoniously with the native’s Lagna.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Venus (Shukra) Placement</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {venusPlanet ? `${venusPlanet.name} in ${venusPlanet.rasiName}` : 'Placed in chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Indicates romance, mutual affection, devotion, and shared prosperity within the marital household.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">In-Laws & Extended Family</div>
                <div className="text-base font-bold text-stone-900 mt-1">Supportive Dynamics</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Favorable 7th house configurations foster respectful relationships with in-laws and collaborative joint family undertakings.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFamilyMember === 'children' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Star className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Children & Progeny Lineage (5th House & Jupiter)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 5th house governs children, higher intelligence, creativity, and the continuation of family lineage (Putra Bhava).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">5th House Sign ({house5.rasiName})</div>
                <div className="text-base font-bold text-stone-900 mt-1">Progeny Prospects</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Indicates intelligent, creative, and academically gifted children who bring honor and joy to the family name.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Jupiter (Guru) Placement</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {jupiterPlanet ? `${jupiterPlanet.name} in ${jupiterPlanet.rasiName}` : 'Placed in chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Jupiter's grace in the chart ensures wisdom, moral uprightness, and prosperous advancement for descendants.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Lineage Continuation</div>
                <div className="text-base font-bold text-stone-900 mt-1">Strong Ancestral Continuity</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Favorable 5th house aspects guarantee legacy preservation and strong familial bonds across generations.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFamilyMember === 'inlaws' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Users className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  In-Laws & Extended Relatives (Secondary Houses)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Analyzes relationships with in-laws (2nd and 8th house interactions) and near relatives, focusing on familial harmony and mutual support structures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">In-Laws (8th House: {natalHouses.find((h) => h.houseNumber === 8)?.rasiName || 'Vrischika'})</div>
                <div className="text-base font-bold text-stone-900 mt-1">Deep Family Bonds</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  The 8th house reflects the hidden dynamics of in-law relations, joint assets, and the transformative power of extended family ties.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Immediate Kin (2nd House: {natalHouses.find((h) => h.houseNumber === 2)?.rasiName || 'Vrishabha'})</div>
                <div className="text-base font-bold text-stone-900 mt-1">Family Support Base</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  The 2nd house governs family wealth, speech, and early childhood upbringing, influencing how one relates to near relatives.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Relational Harmony</div>
                <div className="text-base font-bold text-stone-900 mt-1">Constructive Synergy</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Favorable aspects in the 2nd and 8th houses facilitate respectful and supportive interactions within the extended kin network.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFamilyMember === 'ancestral' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Ancestral Lineage & Pitru Karma (8th & 9th Houses)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Unlocking ancestral karmic patterns, inherited talents, and generational blessings based on planetary nodal placements (Rahu/Ketu).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Karmic Heritage (Ketu)</div>
                <div className="text-base font-bold text-stone-900 mt-1">Spiritual Roots</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Ketu indicates past-life spiritual merits and ancestral disciplines carried forward into the native's subconscious.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Material Lineage (Rahu)</div>
                <div className="text-base font-bold text-stone-900 mt-1">Generational Ambitions</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Rahu highlights unfulfilled material aspirations of ancestors that the native is destined to explore and transcend.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Pitru Dosha & Parihar</div>
                <div className="text-base font-bold text-stone-900 mt-1">Harmonious Remediation</div>
                <p className="text-[12px] text-stone-600 mt-1">
                  Performing charitable deeds and honoring ancestors during Amavasya brings immense peace and prosperity to the entire family.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Methodology Note */}
      <div className="bg-amber-100/70 border border-amber-300 p-3.5 rounded-xl text-[13px] text-amber-950 flex items-start space-x-2.5">
        <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Astrological Researcher Note:</span> Family predictions in Vedic astrology operate on the principle of holographic synchronization. The native's chart reflects not only their own destiny but also the interwoven karma of parents, siblings, partner, and children through the 2nd, 4th, 5th, 7th, 9th, and 11th bhavas.
        </div>
      </div>
    </div>
  );
}
