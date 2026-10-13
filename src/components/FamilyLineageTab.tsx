import React, { useState, useMemo } from 'react';
import {
  Users,
  Heart,
  ShieldCheck,
  Sparkles,
  BookOpen,
  User,
  Award,
  ChevronRight,
  Flame,
  Star,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RefreshCw,
  Sun,
  Moon,
  ArrowRight,
  Compass
} from 'lucide-react';
import { UserProfile, PlanetPosition, VedicRasiName } from '../types';

interface FamilyLineageTabProps {
  activeProfile?: UserProfile;
  profiles: UserProfile[];
  natalPlanets: PlanetPosition[];
  natalHouses: any[];
  lagnaRasi: string;
}

const RASI_ORDER: VedicRasiName[] = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrischika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena'
];

const RASI_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Mesha: 'Fire',
  Simha: 'Fire',
  Dhanu: 'Fire',
  Vrishabha: 'Earth',
  Kanya: 'Earth',
  Makara: 'Earth',
  Mithuna: 'Air',
  Tula: 'Air',
  Kumbha: 'Air',
  Karka: 'Water',
  Vrischika: 'Water',
  Meena: 'Water'
};

const RASI_LORDS: Record<string, string> = {
  Mesha: 'Mangal',
  Vrishabha: 'Shukra',
  Mithuna: 'Budha',
  Karka: 'Chandra',
  Simha: 'Surya',
  Kanya: 'Budha',
  Tula: 'Shukra',
  Vrischika: 'Mangal',
  Dhanu: 'Guru',
  Makara: 'Shani',
  Kumbha: 'Shani',
  Meena: 'Guru'
};

export function FamilyLineageTab({
  activeProfile,
  profiles,
  natalPlanets,
  natalHouses,
  lagnaRasi,
}: FamilyLineageTabProps) {
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<
    'father' | 'mother' | 'siblings' | 'spouse' | 'children' | 'inlaws' | 'ancestral' | 'combinations' | 'synastry'
  >('father');

  // Relative Synastry Tester State
  const [synastryRelation, setSynastryRelation] = useState<'Spouse' | 'Father' | 'Mother' | 'Sibling' | 'Child' | 'In-Law'>('Spouse');
  const [comparedRasi, setComparedRasi] = useState<string>('Tula');
  const [selectedSavedProfileId, setSelectedSavedProfileId] = useState<string>('');

  if (!activeProfile) {
    return (
      <div className="p-6 text-center text-stone-600 bg-[#FAF6EE] rounded-xl border border-amber-200">
        Please select or add a profile to view family member predictions.
      </div>
    );
  }

  // Natal Houses Helper
  const getHouse = (num: number) => {
    return (
      natalHouses.find((h) => h.houseNumber === num) || {
        houseNumber: num,
        rasiName: RASI_ORDER[(num - 1) % 12],
        rasiNumber: ((num - 1) % 12) + 1,
        signLord: RASI_LORDS[RASI_ORDER[(num - 1) % 12]] || 'Surya',
        planets: []
      }
    );
  };

  const getPlanet = (name: string) => {
    return natalPlanets.find((p) => p.name === name);
  };

  const house1 = getHouse(1);
  const house2 = getHouse(2);
  const house3 = getHouse(3);
  const house4 = getHouse(4);
  const house5 = getHouse(5);
  const house6 = getHouse(6);
  const house7 = getHouse(7);
  const house8 = getHouse(8);
  const house9 = getHouse(9);
  const house10 = getHouse(10);
  const house11 = getHouse(11);
  const house12 = getHouse(12);

  const sunPlanet = getPlanet('Surya');
  const moonPlanet = getPlanet('Chandra');
  const marsPlanet = getPlanet('Mangal');
  const mercuryPlanet = getPlanet('Budha');
  const jupiterPlanet = getPlanet('Guru');
  const venusPlanet = getPlanet('Shukra');
  const saturnPlanet = getPlanet('Shani');
  const rahuPlanet = getPlanet('Rahu');
  const ketuPlanet = getPlanet('Ketu');

  // Compute Bhavat Bhavam House (House from House)
  const getBhavatBhavamHouse = (fromHouse: number, count: number): number => {
    return (((fromHouse - 1 + count - 1) % 12) + 1);
  };

  // Lineage Yogas Computed Dynamically
  const lineageYogas = useMemo(() => {
    const yogas = [];

    // 1. Kuladipika Yoga (Light of the Clan)
    const isJupiterStrong = jupiterPlanet && [1, 4, 5, 7, 9, 10, 11].includes(jupiterPlanet.house);
    const isH5Strong = [1, 4, 5, 7, 9, 10, 11].includes(house5.houseNumber);
    yogas.push({
      name: 'Kuladipika Yoga (कूलादीपिका योग)',
      title: 'Beacon of the Lineage',
      status: isJupiterStrong ? 'Vigorous & Active' : 'Supportive Potential',
      isActive: Boolean(isJupiterStrong),
      description: 'Occurs when Devaguru Jupiter or 5th Lord occupies auspicious Kendras or Trikonas. The native elevates the prestige, prosperity, and spiritual legacy of the entire family line.',
      impact: 'Native gains renown as the central pillar of the ancestral clan, bringing honor and stability.'
    });

    // 2. Pitru Bhakta Yoga (Filial Devotion & Paternal Grace)
    const isSunWellPlaced = sunPlanet && ![6, 8, 12].includes(sunPlanet.house);
    yogas.push({
      name: 'Pitru Bhakta Yoga (पितृ भक्त योग)',
      title: 'Devotion to Paternal Wisdom',
      status: isSunWellPlaced ? 'Fully Manifest' : 'Karmic Remediation Beneficial',
      isActive: Boolean(isSunWellPlaced),
      description: 'Surya (Father Karaka) and the 9th house are fortified without deep dusthana affliction. Grants natural obedience, intellectual harmony, and inheritance of paternal virtues.',
      impact: 'Native receives protective paternal blessings, smooth career elevation, and spiritual mentorship.'
    });

    // 3. Matru Sneha & Matru Kripa Yoga (Maternal Blessedness)
    const isMoonWellPlaced = moonPlanet && ![6, 8, 12].includes(moonPlanet.house);
    yogas.push({
      name: 'Matru Sneha Yoga (मातृ स्नेह योग)',
      title: 'Abundant Maternal Fortune',
      status: isMoonWellPlaced ? 'Active & Nurturing' : 'Moderate',
      isActive: Boolean(isMoonWellPlaced),
      description: '4th house (Matru Bhava) and Chandra signify domestic peace, maternal lifespan, and inheritance of land and shelter.',
      impact: 'Strong emotional shelter, lasting psychological resilience, and fruitful ownership of vehicles and ancestral property.'
    });

    // 4. Kulavardhana Yoga (Dynasty Expander)
    const isGuruInTrine = jupiterPlanet && [1, 5, 9].includes(jupiterPlanet.house);
    yogas.push({
      name: 'Kulavardhana Yoga (कुलवर्धन योग)',
      title: 'Expander of the Family Line',
      status: isGuruInTrine ? 'Auspicious' : 'Promising',
      isActive: Boolean(isGuruInTrine),
      description: 'Devaguru Jupiter aspecting or occupying the 1st, 5th, or 9th bhava ensures that the family lineage multiplies with righteous, dutiful descendants.',
      impact: 'Preservation of gotra, sustained family name through noble children and meritorious descendants.'
    });

    // 5. Bandhu Pujya Yoga (Venerated Among Kinsmen)
    const isH4Benefic = [1, 4, 7, 10, 5, 9, 11].includes(house4.houseNumber);
    yogas.push({
      name: 'Bandhu Pujya Yoga (बन्धु पूज्य योग)',
      title: 'Respected by All Relatives',
      status: isH4Benefic ? 'Prominent' : 'Latent',
      isActive: Boolean(isH4Benefic),
      description: 'Formed when 4th and 2nd bhava lords are in mutual harmony. The native is admired, consulted for family councils, and regarded as a peacemaker.',
      impact: 'Kinsmen and extended in-laws look up to the native for advice, guidance, and financial leadership.'
    });

    // 6. Santan Saukhya Yoga (Bliss of Progeny)
    const isJupiterOrH5Benefic = jupiterPlanet && [2, 5, 9, 11].includes(jupiterPlanet.house);
    yogas.push({
      name: 'Santan Saukhya Yoga (सन्तान सौख्य योग)',
      title: 'Filial Accomplishment & Joy',
      status: isJupiterOrH5Benefic ? 'Blessed' : 'Favorable',
      isActive: Boolean(isJupiterOrH5Benefic),
      description: 'Putra Bhava (5th house) nourished by benefic rays promises scholarly, morally upright, and loving offspring.',
      impact: 'Children achieve distinction in science, academia, or arts, offering deep emotional fulfillment in mature years.'
    });

    // 7. Bhratru Sahaya Yoga (Sibling Alliance)
    const isMarsBenefic = marsPlanet && [3, 6, 10, 11].includes(marsPlanet.house);
    yogas.push({
      name: 'Bhratru Sahaya Yoga (भ्रातृ सहाय योग)',
      title: 'Unyielding Brotherly Alliance',
      status: isMarsBenefic ? 'Strong Courage & Support' : 'Harmonious Cooperation',
      isActive: Boolean(isMarsBenefic),
      description: '3rd House (Bhratru Bhava) and Mangala grant courage, enterprise, and steadfast solidarity between brothers and sisters.',
      impact: 'Siblings act as defensive shields and strategic allies in commercial or community endeavors.'
    });

    // 8. Pitru Dosha Assessment
    const isSunWithRahuKetu = sunPlanet && (sunPlanet.house === rahuPlanet?.house || sunPlanet.house === ketuPlanet?.house);
    const isRahuIn9th = rahuPlanet?.house === 9 || ketuPlanet?.house === 9;
    const pitruDoshaPresent = isSunWithRahuKetu || isRahuIn9th;
    yogas.push({
      name: 'Pitru Karma / Rina (पितृ ऋण परीक्षा)',
      title: 'Ancestral Karmic Debt Evaluation',
      status: pitruDoshaPresent ? 'Mild Karmic Debt Indicated' : 'Pitru Ashirwad (Ancestral Grace Clear)',
      isActive: !pitruDoshaPresent,
      description: pitruDoshaPresent
        ? 'Nodal axis touching 9th house or Sun indicates unfulfilled vows of ancestors. Performing Tarpanam on Amavasya releases immense trapped blessings.'
        : 'The native carries favorable ancestral goodwill (Purva Punya) without heavy karmic afflictions in the paternal tree.',
      impact: pitruDoshaPresent
        ? 'Routine delays in milestones until Shraddha and ancestral charity are performed.'
        : 'Spontaneous protection during crises and clean lineage karma.'
    });

    return yogas;
  }, [sunPlanet, moonPlanet, marsPlanet, jupiterPlanet, rahuPlanet, ketuPlanet, house4, house5]);

  // Synastry Calculator between Native's Lagna and Selected Relative Rasi
  const nativeLagnaIndex = RASI_ORDER.indexOf(lagnaRasi as VedicRasiName);
  const comparedIndex = RASI_ORDER.indexOf(comparedRasi as VedicRasiName);
  const relativeDistance = nativeLagnaIndex >= 0 && comparedIndex >= 0
    ? ((comparedIndex - nativeLagnaIndex + 12) % 12) + 1
    : 1;

  const synastryDetails = useMemo(() => {
    const nativeEl = RASI_ELEMENTS[lagnaRasi] || 'Fire';
    const compEl = RASI_ELEMENTS[comparedRasi] || 'Earth';

    let score = 75;
    let dispositionName = '';
    let reading = '';
    let recommendation = '';

    if (relativeDistance === 1) {
      score = 88;
      dispositionName = '1-1 (Eka Rasi - Identical Horizon)';
      reading = 'Profound instinctual empathy and shared outlook. You resonate with identical life priorities and psychological rhythms.';
      recommendation = 'Maintain healthy individuality to prevent mutual stubbornness during high-stress periods.';
    } else if (relativeDistance === 7) {
      score = 92;
      dispositionName = '1-7 (Sama-Saptaka - Magnetic Complementarity)';
      reading = 'Classical polarity of mutual attraction and completion. What one lacks, the other provides with natural elegance.';
      recommendation = 'Ideal for marriage, partnership, and deep familial collaboration. Cherish differing viewpoints.';
    } else if (relativeDistance === 5 || relativeDistance === 9) {
      score = 95;
      dispositionName = `${relativeDistance}-${14 - relativeDistance} (Nava-Panchama - Divine Trinal Grace)`;
      reading = 'The most auspicious Vedic relationship geometry. Brings innate spiritual goodwill, unconditional generosity, and mutual pride.';
      recommendation = 'Nurture joint creative, educational, or charitable initiatives together.';
    } else if (relativeDistance === 3 || relativeDistance === 11) {
      score = 85;
      dispositionName = `${relativeDistance}-${14 - relativeDistance} (Labha & Sahaya - Supportive Growth)`;
      reading = 'Dynamic alliance centered on communication, humor, mutual enterprise, and social network expansion.';
      recommendation = 'Work together on commercial or household problem-solving; communication flows effortlessly.';
    } else if (relativeDistance === 4 || relativeDistance === 10) {
      score = 78;
      dispositionName = `${relativeDistance}-${14 - relativeDistance} (Kendra - Structural Duty & Power)`;
      reading = 'Relationship structured around responsibility, public standing, and domestic organization. Respect is immense, though demands are high.';
      recommendation = 'Balance practical responsibilities with warmth and verbal appreciation.';
    } else if (relativeDistance === 6 || relativeDistance === 8) {
      score = 55;
      dispositionName = '6-8 (Shadashtaka - Karmic Transformation)';
      reading = 'Karmic debt pattern requiring conscious patience. Differing temperaments can trigger misunderstandings if expectations are unstated.';
      recommendation = 'Avoid financial ambiguity. Practice selfless service and forgiveness to transform friction into deep spiritual maturity.';
    } else if (relativeDistance === 2 || relativeDistance === 12) {
      score = 62;
      dispositionName = '2-12 (Dvi-Dvadasha - Expenditure & Preservation)';
      reading = 'One party naturally gives and sacrifices while the other receives and anchors. Can create subtle feelings of asymmetry over decades.';
      recommendation = 'Establish clear personal boundaries and openly celebrate mutual contributions.';
    }

    return {
      score,
      dispositionName,
      reading,
      recommendation,
      nativeEl,
      compEl
    };
  }, [lagnaRasi, comparedRasi, relativeDistance]);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200 bg-[#FAF6EE] p-3 sm:p-5 rounded-2xl border border-amber-300/70 shadow-xs">
      {/* Top Banner Header (Strictly NO personal names to keep names only in dropdown) */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 text-amber-50 p-4 sm:p-6 rounded-xl shadow-md border border-amber-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Vedic Lineage & Family Horoscopy (Kutumba, Gotra & Vamsha Vigyan)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
              Family Members Predictions, Lineage Yogas & Kinship Horoscopy
            </h1>
            <p className="text-amber-200/90 text-[13px] sm:text-[14px] mt-1 max-w-2xl leading-relaxed">
              Derived from the native&apos;s precise birth chart (Lagna: <span className="text-amber-300 font-bold">{lagnaRasi}</span>), mapping parentage, siblings, spouse, children, in-laws, and ancestral lineage through classical Brihat Parashara Hora Shastra principles (2nd, 3rd, 4th, 5th, 7th, 8th, 9th, and 11th bhavas).
            </p>
          </div>
          <div className="bg-amber-900/80 border border-amber-600/60 px-3.5 py-2.5 rounded-lg text-right shrink-0">
            <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">Birth Chart Metrics</div>
            <div className="text-sm font-bold text-white">Lagna: {lagnaRasi} • {house1.rasiName}</div>
            <div className="text-[12px] text-amber-200 mt-0.5">
              Moon: {moonPlanet?.rasiName || lagnaRasi} • Sun: {sunPlanet?.rasiName || 'Surya'}
            </div>
          </div>
        </div>

        {/* Quick Vedic Lineage Metrics Ribbon */}
        <div className="mt-4 pt-3 border-t border-amber-700/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="bg-black/20 rounded-lg p-2 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Paternal (9th)</span>
            <span className="text-xs font-bold text-white">{house9.rasiName} • {house9.signLord}</span>
          </div>
          <div className="bg-black/20 rounded-lg p-2 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Maternal (4th)</span>
            <span className="text-xs font-bold text-white">{house4.rasiName} • {house4.signLord}</span>
          </div>
          <div className="bg-black/20 rounded-lg p-2 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Siblings (3rd/11th)</span>
            <span className="text-xs font-bold text-white">{house3.rasiName} &amp; {house11.rasiName}</span>
          </div>
          <div className="bg-black/20 rounded-lg p-2 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Spouse (7th)</span>
            <span className="text-xs font-bold text-white">{house7.rasiName} • {house7.signLord}</span>
          </div>
          <div className="bg-black/20 rounded-lg p-2 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Progeny (5th)</span>
            <span className="text-xs font-bold text-white">{house5.rasiName} • {house5.signLord}</span>
          </div>
          <div className="bg-black/20 rounded-lg p-2 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Pitru Axis</span>
            <span className="text-xs font-bold text-white">Rahu {rahuPlanet?.house || 1} • Ketu {ketuPlanet?.house || 7}</span>
          </div>
        </div>
      </div>

      {/* Navigation Member Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-1.5 pt-1">
        {[
          { id: 'father', label: 'Father (9th)', icon: ShieldCheck, desc: 'Paternal Dynasty' },
          { id: 'mother', label: 'Mother (4th)', icon: Heart, desc: 'Maternal Roots' },
          { id: 'siblings', label: 'Siblings (3rd/11th)', icon: Users, desc: 'Co-born Alliances' },
          { id: 'spouse', label: 'Spouse (7th)', icon: Heart, desc: 'Marital Destiny' },
          { id: 'children', label: 'Children (5th)', icon: Star, desc: 'Vamsha Progeny' },
          { id: 'inlaws', label: 'In-Laws & Kin', icon: Users, desc: 'Extended Family' },
          { id: 'ancestral', label: 'Ancestors & Pitru', icon: BookOpen, desc: 'Karmic Lineage' },
          { id: 'combinations', label: 'Lineage Yogas', icon: Award, desc: 'Bhavat Bhavam' },
          { id: 'synastry', label: 'Kinship Synastry', icon: Compass, desc: 'Compatibility Test' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedFamilyMember === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedFamilyMember(item.id as any)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer shadow-3xs ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-900 to-amber-950 text-amber-50 border-amber-700 shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-amber-50/80 text-stone-800 border-amber-200'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${isSelected ? 'text-amber-300' : 'text-amber-700'}`} />
              <span className={`font-bold text-[12.5px] sm:text-[13px] leading-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                {item.label}
              </span>
              <span className={`text-[10px] mt-0.5 truncate max-w-full ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Family Member Detailed Analysis Box */}
      <div className="bg-white rounded-xl border border-amber-200 p-4 sm:p-6 shadow-sm space-y-5">
        {/* ================= FATHER & PATERNAL LINEAGE ================= */}
        {selectedFamilyMember === 'father' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Father & Paternal Lineage Prediction (Pitru Bhava • 9th &amp; 10th Houses)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Governed by the 9th house (Dharma &amp; Father), 10th house (Father&apos;s status), and Surya (Natural Father Karaka). Dwadashamsha (D12) reveals deep ancestral impressions.
                </p>
              </div>
            </div>

            {/* Core Astrological Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">9th Bhava Sign & Lord</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house9.rasiName} (Lord: {house9.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  {house9.rasiName === 'Mesha' || house9.rasiName === 'Simha' || house9.rasiName === 'Dhanu'
                    ? 'Fiery sign in 9th house bestows a spirited, highly principled, and dignified father who values self-respect and leadership.'
                    : house9.rasiName === 'Vrishabha' || house9.rasiName === 'Kanya' || house9.rasiName === 'Makara'
                    ? 'Earthy sign indicates an industrious, practical, and financially prudent father who lays enduring family foundations.'
                    : house9.rasiName === 'Mithuna' || house9.rasiName === 'Tula' || house9.rasiName === 'Kumbha'
                    ? 'Airy sign points to an intellectual, communicative, and socially networked father who prioritizes higher education.'
                    : 'Water sign signifies an empathetic, intuitive father with strong spiritual leanings and emotional sensitivity.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Surya (Sun) - Father Karaka</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {sunPlanet ? `${sunPlanet.name} in ${sunPlanet.rasiName} (${sunPlanet.house}th House)` : 'Sun in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  {sunPlanet?.house === 1 || sunPlanet?.house === 9 || sunPlanet?.house === 10
                    ? 'Excellent solar dignity: Father holds high respect, societal standing, and instills an unwavering moral compass.'
                    : 'Promotes steady paternal guidance. The father imparts essential endurance, practical ethics, and life discipline.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Patrimony & Paternal Legacy</div>
                <div className="text-base font-bold text-stone-900 mt-1">Ancestral Dharma & Blessing</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  The native carries paternal blessings that manifest prominently during Jupiter and Sun major Dasha periods, easing career hurdles.
                </p>
              </div>
            </div>

            {/* Extended Lineage Combinations (Bhavat Bhavam) */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Paternal Kinship Combinations (Bhavat Bhavam &amp; Extended Lineage)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Paternal Grandfather (Pitamaah)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>5th House ({house5.rasiName})</strong> — 9th from 9th bhava. Shows paternal grandfather&apos;s character, intellect, and longevity legacy.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Paternal Uncle (Chacha / Tau)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>11th House ({house11.rasiName})</strong> — 3rd from 9th bhava. Indicates relationship with father&apos;s siblings and cooperative inheritance.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Father&apos;s Wealth &amp; Assets</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>10th House ({house10.rasiName})</strong> — 2nd from 9th bhava. Represents paternal financial accumulation and occupational pride.
                  </span>
                </div>
              </div>
            </div>

            {/* Prescribed Remedies for Paternal Harmony */}
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Sun className="w-4 h-4 text-amber-700" />
                <span>Vedic Remedial Actions for Paternal Harmony (Surya &amp; Pitru Shanti):</span>
              </span>
              <p className="text-stone-700">
                Offer copper water (Surya Arghya) to the rising Sun daily with the Gayatri Mantra. Touching the father&apos;s feet on Sunday mornings or honoring elder father-figures channels unhindered divine protection and accelerates professional promotions.
              </p>
            </div>
          </div>
        )}

        {/* ================= MOTHER & MATERNAL LINEAGE ================= */}
        {selectedFamilyMember === 'mother' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Heart className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Mother & Maternal Lineage Prediction (Matru Bhava • 4th House &amp; Chandra)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 4th house governs maternal bonding, emotional sanctuary, peace of mind (Sukha), and immovable property. Chandra is the biological Matru Karaka.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">4th Bhava Sign & Lord</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house4.rasiName} (Lord: {house4.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  {house4.rasiName === 'Karka' || house4.rasiName === 'Vrischika' || house4.rasiName === 'Meena'
                    ? 'Water sign in 4th house reflects an exceptionally devoted, caring, and emotionally attuned mother whose blessings protect the home.'
                    : house4.rasiName === 'Vrishabha' || house4.rasiName === 'Kanya' || house4.rasiName === 'Makara'
                    ? 'Earth sign in 4th house indicates a disciplined, resilient mother who provides rock-solid domestic order and financial prudence.'
                    : 'Brings active intellectual companionship, fostering early education, culture, and positive domestic values.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Chandra (Moon) - Mother Karaka</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {moonPlanet ? `${moonPlanet.name} in ${moonPlanet.rasiName} (${moonPlanet.house}th House)` : 'Moon in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  {moonPlanet?.house === 4 || moonPlanet?.house === 1 || moonPlanet?.house === 9
                    ? 'Deep psychic alignment with mother; maternal intuition frequently guides the native away from hidden traps.'
                    : 'Governs subconscious emotional grounding. Fulfilling the mother’s wishes generates immense domestic luck.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Domestic Shelter & Property</div>
                <div className="text-base font-bold text-stone-900 mt-1">Matru Dhan & Vastu Blessings</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Favorable 4th house and lunar configurations indicate lifelong comfort in owned residences, peaceful vehicle ownership, and maternal gifts.
                </p>
              </div>
            </div>

            {/* Extended Maternal Lineage Combinations (Bhavat Bhavam) */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Maternal Lineage Combinations (Matula &amp; Grandparent Lineage)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Maternal Grandmother (Maataamahi)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>7th House ({house7.rasiName})</strong> — 4th from 4th bhava. Governs maternal grandmother&apos;s longevity, blessings, and domestic legacy.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Maternal Grandfather (Maataamaha)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>12th House ({house12.rasiName})</strong> — 9th from 4th bhava. Reveals ancestral maternal lineage, spirituality, and past-life merits.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Maternal Uncle (Mama / Matula)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>6th House ({house6.rasiName} &amp; Budha)</strong> — 3rd from 4th bhava. Determines assistance, commercial ties, and relations with maternal relatives.
                  </span>
                </div>
              </div>
            </div>

            {/* Prescribed Remedies for Maternal Harmony */}
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Moon className="w-4 h-4 text-amber-700" />
                <span>Vedic Remedial Actions for Maternal Peace (Chandra &amp; Gauri Shanti):</span>
              </span>
              <p className="text-stone-700">
                Offer silver or white milk/rice to mother on Mondays. Chanting &quot;Om Som Somaya Namah&quot; and honoring female elders in the household dissolves mental restlessness and ensures steady prosperity.
              </p>
            </div>
          </div>
        )}

        {/* ================= SIBLINGS & CO-BORNS ================= */}
        {selectedFamilyMember === 'siblings' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Users className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Siblings & Co-borns Prediction (Bhratru Bhava • 3rd &amp; 11th Houses)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  3rd house governs younger siblings (Kanishtha Bhrata) and valor; 11th house signifies elder siblings (Jyeshtha Bhrata) and social gains. Mangala is Bhratru Karaka.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Younger Siblings (3rd House)</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house3.rasiName} (Lord: {house3.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Indicates cooperative bonds with younger siblings. The native acts as a protective mentor, fostering courage and mutual enterprise.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Elder Siblings (11th House)</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house11.rasiName} (Lord: {house11.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Elder siblings or trusted elder mentors play an instrumental role in introducing key career connections, financial windfalls, and high-status networks.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Mangal (Mars) - Sibling Karaka</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {marsPlanet ? `${marsPlanet.name} in ${marsPlanet.rasiName} (${marsPlanet.house}th House)` : 'Mars in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  {marsPlanet?.house === 3 || marsPlanet?.house === 6 || marsPlanet?.house === 11
                    ? 'Exceptional sibling solidarity; brothers/sisters provide tangible defensive backing during major crises.'
                    : 'Good mutual warmth; minor competitiveness yields to strong unity when facing outside adversity.'}
                </p>
              </div>
            </div>

            {/* Sibling Combinations & Count Estimation */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Sahodara Dynamics &amp; Extended Co-Born Combinations</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Younger Sibling&apos;s Progeny</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>7th House ({house7.rasiName})</strong> — 5th from 3rd bhava. Governs nieces and nephews from younger siblings.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Elder Sibling&apos;s Children</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>3rd House ({house3.rasiName})</strong> — 5th from 11th bhava. Reflects family joy and affection from elder sibling&apos;s descendants.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Joint Commercial Ventures</span>
                  <span className="text-stone-700 block mt-0.5">
                    Co-ownership of assets between siblings thrives when Mars does not aspect 8th bhava. Collaborative ventures bring substantial gains.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-amber-700" />
                <span>Vedic Remedial Actions for Sibling Harmony:</span>
              </span>
              <p className="text-stone-700">
                Offering sweet jaggery or wheat to cows or feeding birds on Tuesday clears stubborn sibling disputes. Celebrating Raksha Bandhan and Bhai Dooj with heart-felt offerings ensures life-long protective camaraderie.
              </p>
            </div>
          </div>
        )}

        {/* ================= SPOUSE & MARITAL LINEAGE ================= */}
        {selectedFamilyMember === 'spouse' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Heart className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Spouse &amp; Marital Union Prediction (Kalatra Bhava • 7th House &amp; Navamsha D9)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 7th house rules the life partner, marital destiny, and spouse&apos;s character. Shukra (Venus) is the primary Kalatra Karaka, with Guru (Jupiter) representing the husband in female charts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">7th Bhava Sign & Lord</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house7.rasiName} (Lord: {house7.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Reflects the partner&apos;s physical appearance tendencies, moral fiber, and domestic orientation, forming a natural psychological counterweight to the native&apos;s Lagna.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Shukra (Venus) - Kalatra Karaka</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {venusPlanet ? `${venusPlanet.name} in ${venusPlanet.rasiName} (${venusPlanet.house}th House)` : 'Venus in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Signifies aesthetic harmony, shared affection, and mutual devotion. When untainted by malefic aspects, grants lasting matrimonial stability.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Marital Fortune & Pedigree</div>
                <div className="text-base font-bold text-stone-900 mt-1">Kula &amp; Family Background</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Partner stems from a respected family with firm values. Joint financial prosperity accelerates significantly post-marriage.
                </p>
              </div>
            </div>

            {/* Extended Marital Combinations (Navamsha & In-Laws) */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Spousal Combinations &amp; Joint Karmic Trajectory</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Spouse&apos;s Profession (10th from 7th)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>4th House ({house4.rasiName})</strong> — Indicates partner&apos;s professional pursuits, often linked with management, teaching, arts, or commerce.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Spouse&apos;s Wealth (2nd from 7th)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>8th House ({house8.rasiName})</strong> — Governs joint matrimonial finances, partner&apos;s savings, and inheritance received through marriage.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Spouse&apos;s Spiritual Orientation</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>3rd House ({house3.rasiName})</strong> — 9th from 7th bhava. Reflects the partner&apos;s dharma, higher values, and devotion to family rituals.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-amber-700" />
                <span>Vedic Remedial Actions for Marital Bliss:</span>
              </span>
              <p className="text-stone-700">
                Worship Lord Shiva and Goddess Parvati together on Fridays. Reciting the Argala Stotram or lighting a pure ghee lamp in the Ishanya (North-East) corner eliminates marital friction and ensures lifelong warmth.
              </p>
            </div>
          </div>
        )}

        {/* ================= CHILDREN & PROGENY ================= */}
        {selectedFamilyMember === 'children' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Star className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Children &amp; Progeny Lineage (Putra Bhava • 5th House &amp; Saptamsha D7)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  The 5th house rules children, past-life merit (Purva Punya), intelligence, and lineage continuation (Vamsha Vriddhi). Devaguru Jupiter is the sovereign Santan Karaka.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">5th Bhava Sign & Lord</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house5.rasiName} (Lord: {house5.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Promises intelligent, creative, and academically gifted offspring who elevate the family reputation through notable accomplishments.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Jupiter (Guru) - Santan Karaka</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {jupiterPlanet ? `${jupiterPlanet.name} in ${jupiterPlanet.rasiName} (${jupiterPlanet.house}th House)` : 'Jupiter in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Jupiter&apos;s benefic disposition ensures moral uprightness, respectful communication from children, and strong filial duty.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Lineage Continuation (Vamsha)</div>
                <div className="text-base font-bold text-stone-900 mt-1">Vigorous Generational Legacy</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Indicates unbroken gotra continuity, high educational honors for children, and lifelong emotional support in the native&apos;s elder years.
                </p>
              </div>
            </div>

            {/* Progeny Multi-Child Combinations (Bhavat Bhavam) */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Multi-Child Horoscopy (Successive Progeny Bhavas)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">First Child (1st Issue)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>5th House ({house5.rasiName})</strong>: Reflects first child&apos;s vitality, intellectual prowess, and parental bond.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Second Child (2nd Issue)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>7th House ({house7.rasiName})</strong>: 3rd from 5th bhava. Governs second child&apos;s creativity and social charm.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Third Child (3rd Issue)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>9th House ({house9.rasiName})</strong>: 3rd from 7th bhava. Governs third child&apos;s philosophical and fortune legacy.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Grandchildren (Pautra)</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>9th House ({house9.rasiName})</strong>: 5th from 5th bhava. Shows joy, longevity, and pride brought by grandchildren.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-700" />
                <span>Vedic Remedial Actions for Progeny Bliss (Santan Gopal):</span>
              </span>
              <p className="text-stone-700">
                Chant the Santan Gopal Mantra (&quot;Om Shreem Hreem Kleem Glaum Devakisuta Govinda Vasudeva Jagatpate Dehi Me Tanayam Krishna Tvaamaham Sharanam Gatah&quot;) or observe fast on Putrada Ekadashi. Donating yellow fruits or turmeric to priests on Thursdays bestows righteous descendants.
              </p>
            </div>
          </div>
        )}

        {/* ================= IN-LAWS & EXTENDED KIN ================= */}
        {selectedFamilyMember === 'inlaws' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Users className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  In-Laws & Extended Kin Prediction (Shvashura &amp; Sambandhi Vigyan)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Relationships with in-laws are derived using Bhavat Bhavam from the 7th house: 8th house (Spouse&apos;s family &amp; wealth), 10th house (Mother-in-law), and 3rd house (Father-in-law).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">In-Laws Family (8th House)</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house8.rasiName} (Lord: {house8.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  2nd from 7th bhava. Governs the economic status, cultural demeanor, and speech patterns of the spouse&apos;s family. Indicates positive joint support.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Mother-in-Law (10th House)</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house10.rasiName} (Lord: {house10.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  4th from 7th bhava (Mother of spouse). Reflects her nurturing habits, household authority, and domestic expectations. Respectful boundaries foster enduring peace.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Father-in-Law (3rd House)</div>
                <div className="text-base font-bold text-stone-900 mt-1">{house3.rasiName} (Lord: {house3.signLord})</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  9th from 7th bhava (Father of spouse). Shows his wisdom, career guidance, and paternal encouragement toward the native.
                </p>
              </div>
            </div>

            {/* Extended In-Law Combinations */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Extended Sambandhi Relations (Brothers &amp; Sisters-in-Law)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Spouse&apos;s Younger Siblings</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>9th House ({house9.rasiName})</strong> — 3rd from 7th bhava (Devar / Sali). Indicates playful, supportive camaraderie without jealousy.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Spouse&apos;s Elder Siblings</span>
                  <span className="text-stone-700 block mt-0.5">
                    <strong>5th House ({house5.rasiName})</strong> — 11th from 7th bhava (Jeth / Nanad). Fosters mature guidance and collaborative celebration.
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200/80">
                  <span className="font-bold text-amber-900 block">Joint Assets &amp; Heritage</span>
                  <span className="text-stone-700 block mt-0.5">
                    Favorable disposition of 8th lord ensures that in-law property or family gifts pass smoothly without contentious litigation.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Vedic Remedial Actions for In-Law Harmony:</span>
              </span>
              <p className="text-stone-700">
                Gifting garments to mother-in-law on festive tithis and offering respectful greetings on visitations removes Rahu-induced misunderstandings. Keeping a silver square in the cash safe protects in-law financial peace.
              </p>
            </div>
          </div>
        )}

        {/* ================= ANCESTORS & PITRU KARMA ================= */}
        {selectedFamilyMember === 'ancestral' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Ancestral Lineage &amp; Pitru Karma (Vamsha &amp; Gotra Karmic Axis)
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Illuminates ancestral karmic inheritances, generational aspirations, and spiritual merit carried across lifetimes through the Rahu-Ketu nodal axis, 8th bhava, and 9th bhava.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Ketu - Ancestral Spiritual Merit</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {ketuPlanet ? `House ${ketuPlanet.house} in ${ketuPlanet.rasiName}` : 'Ketu in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Reflects ancestral austerity (Tapasya), spiritual disciplines, and subconscious intuitive wisdom passed down through bloodline DNA.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Rahu - Lineage Aspiration</div>
                <div className="text-base font-bold text-stone-900 mt-1">
                  {rahuPlanet ? `House ${rahuPlanet.house} in ${rahuPlanet.rasiName}` : 'Rahu in Chart'}
                </div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  Highlights unfulfilled worldly ambitions of ancestors that the native is karmically appointed to explore, achieve, and transcend in this lifetime.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
                <div className="text-[12px] font-bold text-amber-900 uppercase">Pitru Ashirwad (Ancestral Grace)</div>
                <div className="text-base font-bold text-stone-900 mt-1">High Karmic Protection</div>
                <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
                  The native enjoys profound lineage shields during sudden crises, emerging unharmed from accidents or sudden health challenges.
                </p>
              </div>
            </div>

            {/* Diagnostic Pitru Karma Checklist */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Ancestral Karmic Diagnostic Indicators &amp; Symptoms</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 bg-white rounded-lg border border-stone-200/80 space-y-1">
                  <span className="font-bold text-stone-900 block flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Positive Lineage Indicators (Purva Punya)</span>
                  </span>
                  <ul className="text-stone-600 list-disc list-inside space-y-0.5">
                    <li>Unexplained last-minute rescues during financial or career pinches.</li>
                    <li>Natural respect for ancient heritage, temple architecture, and scripture.</li>
                    <li>Peaceful sleep without recurrent dreams of snake bites or drowning.</li>
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-lg border border-stone-200/80 space-y-1">
                  <span className="font-bold text-stone-900 block flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Pitru Rina Cleansing Recommendations</span>
                  </span>
                  <ul className="text-stone-600 list-disc list-inside space-y-0.5">
                    <li>Perform water and black sesame Tarpanam on Amavasya (New Moon).</li>
                    <li>Feed stray cows (Gau Seva) with jaggery and green spinach on Saturdays.</li>
                    <li>Plant a Peepal or Banyan tree in public spaces to honor departed elders.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 text-[12.5px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Classical Pitru Gayatri Remedy:</span>
              </span>
              <p className="text-stone-700">
                Chant the Pitru Gayatri: &quot;Om Pitru Ganaya Vidmahe Jagat Dharine Dheemahi Tanno Pitro Prachodayat&quot; 11 times during midday sandhya. Dedicating meals to ancestors during Pitru Paksha unlocks blocked prosperity and grants generational peace.
              </p>
            </div>
          </div>
        )}

        {/* ================= LINEAGE YOGAS & BHAVAT BHAVAM COMBINATIONS ================= */}
        {selectedFamilyMember === 'combinations' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Award className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Classical Lineage Yogas &amp; Bhavat Bhavam Kinship Matrix
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Real-time algorithmic evaluation of classical dynastic Yogas (Brihat Parashara &amp; Bhrigu Samhita) with full Bhavat Bhavam kinship derivations.
                </p>
              </div>
            </div>

            {/* Lineage Yogas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {lineageYogas.map((yoga, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    yoga.isActive
                      ? 'bg-gradient-to-br from-amber-50/90 to-[#FAF6EE] border-amber-300/80 shadow-3xs'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-vedic font-bold text-stone-950 text-sm">{yoga.name}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        yoga.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {yoga.status}
                    </span>
                  </div>
                  <div className="text-[12px] font-bold text-amber-900 mt-1">{yoga.title}</div>
                  <p className="text-[12px] text-stone-600 mt-1 leading-snug">{yoga.description}</p>
                  <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11.5px] text-stone-700">
                    <strong className="text-stone-900">Karmic Manifestation:</strong> {yoga.impact}
                  </div>
                </div>
              ))}
            </div>

            {/* Comprehensive Bhavat Bhavam Reference Table */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-vedic font-bold text-stone-900 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Universal Bhavat Bhavam Kinship Mapping Engine</span>
                </h3>
                <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Parashari Holographic Principle
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-amber-200 text-amber-950 font-bold bg-amber-100/60">
                      <th className="py-2 px-3">Kinship Relation</th>
                      <th className="py-2 px-3">Bhavat Bhavam Derivation</th>
                      <th className="py-2 px-3">Target Natal Bhava</th>
                      <th className="py-2 px-3">Current Natal Sign</th>
                      <th className="py-2 px-3">Governing Lord</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70 text-stone-700">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Paternal Grandfather (Dada)</td>
                      <td className="py-2 px-3">9th from 9th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">5th Bhava</td>
                      <td className="py-2 px-3">{house5.rasiName}</td>
                      <td className="py-2 px-3">{house5.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Maternal Grandmother (Nani)</td>
                      <td className="py-2 px-3">4th from 4th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">7th Bhava</td>
                      <td className="py-2 px-3">{house7.rasiName}</td>
                      <td className="py-2 px-3">{house7.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Maternal Grandfather (Nana)</td>
                      <td className="py-2 px-3">9th from 4th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">12th Bhava</td>
                      <td className="py-2 px-3">{house12.rasiName}</td>
                      <td className="py-2 px-3">{house12.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Maternal Uncle (Mama)</td>
                      <td className="py-2 px-3">3rd from 4th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">6th Bhava</td>
                      <td className="py-2 px-3">{house6.rasiName}</td>
                      <td className="py-2 px-3">{house6.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">In-Laws Family &amp; Wealth</td>
                      <td className="py-2 px-3">2nd from 7th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">8th Bhava</td>
                      <td className="py-2 px-3">{house8.rasiName}</td>
                      <td className="py-2 px-3">{house8.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Mother-in-Law (Saas)</td>
                      <td className="py-2 px-3">4th from 7th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">10th Bhava</td>
                      <td className="py-2 px-3">{house10.rasiName}</td>
                      <td className="py-2 px-3">{house10.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Father-in-Law (Sasur)</td>
                      <td className="py-2 px-3">9th from 7th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">3rd Bhava</td>
                      <td className="py-2 px-3">{house3.rasiName}</td>
                      <td className="py-2 px-3">{house3.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Second Child (2nd Progeny)</td>
                      <td className="py-2 px-3">3rd from 5th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">7th Bhava</td>
                      <td className="py-2 px-3">{house7.rasiName}</td>
                      <td className="py-2 px-3">{house7.signLord}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-stone-900">Grandchildren (Pautra)</td>
                      <td className="py-2 px-3">5th from 5th Bhava</td>
                      <td className="py-2 px-3 font-bold text-amber-900">9th Bhava</td>
                      <td className="py-2 px-3">{house9.rasiName}</td>
                      <td className="py-2 px-3">{house9.signLord}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= KINSHIP SYNASTRY & COMPATIBILITY ================= */}
        {selectedFamilyMember === 'synastry' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Compass className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-amber-950">
                  Kinship Synastry &amp; Family Harmony Matrix
                </h2>
                <p className="text-stone-600 text-[13px]">
                  Calculate mutual astrological compatibility between your natal Lagna (<strong className="text-stone-900">{lagnaRasi}</strong>) and any family member&apos;s Moon sign or Ascendant.
                </p>
              </div>
            </div>

            {/* Interactive Relative Compatibility Controls */}
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/90 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-amber-950 uppercase block mb-1">
                    Select Kinship Role
                  </label>
                  <select
                    value={synastryRelation}
                    onChange={(e) => setSynastryRelation(e.target.value as any)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Spouse">Spouse / Life Partner</option>
                    <option value="Father">Father / Paternal Elder</option>
                    <option value="Mother">Mother / Maternal Elder</option>
                    <option value="Sibling">Sibling / Brother / Sister</option>
                    <option value="Child">Child / Son / Daughter</option>
                    <option value="In-Law">In-Law / Extended Kin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-amber-950 uppercase block mb-1">
                    Relative&apos;s Lagna or Moon Sign
                  </label>
                  <select
                    value={comparedRasi}
                    onChange={(e) => setComparedRasi(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {RASI_ORDER.map((rasi) => (
                      <option key={rasi} value={rasi}>
                        {rasi} ({RASI_ELEMENTS[rasi]} Element)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Saved Profiles Quick Link if Available */}
              {profiles.length > 1 && (
                <div className="pt-2 border-t border-amber-200/70 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="font-bold text-amber-900">Compare with Saved Profiles:</span>
                  {profiles
                    .filter((p) => p.id !== activeProfile.id)
                    .map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => {
                          setSelectedSavedProfileId(prof.id);
                          // Select a representative Rasi if available or default
                          setComparedRasi(house7.rasiName);
                        }}
                        className={`px-2.5 py-1 rounded border text-xs font-bold transition-all cursor-pointer ${
                          selectedSavedProfileId === prof.id
                            ? 'bg-amber-800 text-white border-amber-900'
                            : 'bg-white hover:bg-amber-100 text-stone-800 border-amber-300'
                        }`}
                      >
                        {prof.label || `Saved Chart (${prof.place.split(',')[0]})`}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Synastry Verdict Card */}
            <div className="bg-white rounded-xl border border-amber-200 p-4 sm:p-5 shadow-3xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Synastry Dynamic: Your {lagnaRasi} vs {synastryRelation}&apos;s {comparedRasi}
                  </div>
                  <h3 className="text-base sm:text-lg font-vedic font-bold text-stone-950 mt-0.5">
                    {synastryDetails.dispositionName}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">Harmony Index</span>
                    <span className="text-xl font-black text-amber-900">{synastryDetails.score}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 flex items-center justify-center font-bold text-sm bg-amber-50 text-amber-900">
                    {synastryDetails.score >= 80 ? '★ ★ ★' : synastryDetails.score >= 65 ? '★ ★' : '★'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/70">
                  <span className="font-bold text-amber-950 block">Elemental Interplay</span>
                  <span className="text-stone-700 mt-1 block">
                    Your <strong>{synastryDetails.nativeEl}</strong> element meeting their <strong>{synastryDetails.compEl}</strong> element creates a dynamic that is{' '}
                    {synastryDetails.nativeEl === synastryDetails.compEl
                      ? 'harmoniously synchronized, mirroring fundamental values and reflexes.'
                      : (synastryDetails.nativeEl === 'Fire' && synastryDetails.compEl === 'Air') || (synastryDetails.nativeEl === 'Air' && synastryDetails.compEl === 'Fire')
                      ? 'mutually invigorating; ideas inspire enthusiasm and decisive action.'
                      : (synastryDetails.nativeEl === 'Earth' && synastryDetails.compEl === 'Water') || (synastryDetails.nativeEl === 'Water' && synastryDetails.compEl === 'Earth')
                      ? 'deeply fertile and grounding; stability and emotional trust flourish naturally.'
                      : 'complementary, though requiring conscious alignment of communicative styles.'}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/70">
                  <span className="font-bold text-amber-950 block">Astrological Interpretation</span>
                  <span className="text-stone-700 mt-1 block">{synastryDetails.reading}</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-stone-200 text-[12.5px]">
                <strong className="text-amber-900 block mb-0.5">Vedic Guidance for This Relationship:</strong>
                <p className="text-stone-700">{synastryDetails.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Methodology Note */}
      <div className="bg-amber-100/70 border border-amber-300 p-3.5 rounded-xl text-[13px] text-amber-950 flex items-start space-x-2.5">
        <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Astrological Researcher Note:</span> Family predictions in Vedic astrology operate on the principle of holographic synchronization. The native&apos;s chart reflects not only their own destiny but also the interwoven karma of parents, siblings, partner, and children through the 2nd, 3rd, 4th, 5th, 7th, 8th, 9th, and 11th bhavas.
        </div>
      </div>
    </div>
  );
}
