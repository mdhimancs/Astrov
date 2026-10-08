import { PlanetPosition, GrahaName, VedicRasiName } from '../types';
import { calculatePlanetaryPositions, normalizeDegrees, AyanamshaSystem } from '../vedicMath';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';

export interface FixedStarInfo {
  id: number;
  name: string;
  sanskritName: string;
  fixedStar: string;
  constellation: string;
  lord: string;
  deity: string;
  element: string;
  symbol: string;
  span: string;
}

export const NAKSHATRA_ASTRONOMICAL_DATA: FixedStarInfo[] = [
  { id: 1, name: 'Ashwini', sanskritName: 'अश्विनी', fixedStar: 'β and γ Arietis (Sheratan & Mesarthim)', constellation: 'Aries', lord: 'Ketu', deity: 'Ashwini Kumaras (Divine Healers)', element: 'Prithvi (Earth)', symbol: 'Horse’s Head', span: '00°00\' – 13°20\' Mesha' },
  { id: 2, name: 'Bharani', sanskritName: 'भरणी', fixedStar: '35, 39, and 41 Arietis', constellation: 'Aries', lord: 'Shukra', deity: 'Yama (Lord of Dharma & Time)', element: 'Prithvi (Earth)', symbol: 'Yoni / Vessel', span: '13°20\' – 26°40\' Mesha' },
  { id: 3, name: 'Krittika', sanskritName: 'कृत्तिका', fixedStar: 'Eta Tauri (Pleiades Star Cluster)', constellation: 'Taurus / Aries', lord: 'Surya', deity: 'Agni (Sacred Fire)', element: 'Agni (Fire)', symbol: 'Razor / Flame', span: '26°40\' Mesha – 10°00\' Vrishabha' },
  { id: 4, name: 'Rohini', sanskritName: 'रोहिणी', fixedStar: 'Alpha Tauri (Aldebaran)', constellation: 'Taurus', lord: 'Chandra', deity: 'Brahma / Prajapati (Creator)', element: 'Prithvi (Earth)', symbol: 'Chariot / Temple', span: '10°00\' – 23°20\' Vrishabha' },
  { id: 5, name: 'Mrigashira', sanskritName: 'मृगशिरा', fixedStar: 'Lambda and Phi Orionis (Meissa)', constellation: 'Orion / Taurus', lord: 'Mangal', deity: 'Soma (Moon God of Nectar)', element: 'Prithvi (Earth)', symbol: 'Deer’s Head', span: '23°20\' Vrishabha – 06°40\' Mithuna' },
  { id: 6, name: 'Ardra', sanskritName: 'आर्द्रा', fixedStar: 'Alpha Orionis (Betelgeuse)', constellation: 'Orion / Gemini', lord: 'Rahu', deity: 'Rudra (Storm & Transformation)', element: 'Jala (Water)', symbol: 'Teardrop / Diamond', span: '06°40\' – 20°00\' Mithuna' },
  { id: 7, name: 'Punarvasu', sanskritName: 'पुनर्वसु', fixedStar: 'Alpha and Beta Geminorum (Castor & Pollux)', constellation: 'Gemini / Cancer', lord: 'Guru', deity: 'Aditi (Cosmic Mother)', element: 'Jala (Water)', symbol: 'Bow and Quiver', span: '20°00\' Mithuna – 03°20\' Karka' },
  { id: 8, name: 'Pushya', sanskritName: 'पुष्य', fixedStar: 'Gamma, Delta and Theta Cancri (Asellus)', constellation: 'Cancer', lord: 'Shani', deity: 'Brihaspati (Divine Teacher)', element: 'Jala (Water)', symbol: 'Cow’s Udder / Lotus', span: '03°20\' – 16°40\' Karka' },
  { id: 9, name: 'Ashlesha', sanskritName: 'आश्लेषा', fixedStar: 'Epsilon, Delta, Mu, Rho Hydrae', constellation: 'Hydra / Cancer', lord: 'Budha', deity: 'Nagas (Serpent Deities)', element: 'Jala (Water)', symbol: 'Coiled Serpent', span: '16°40\' – 30°00\' Karka' },
  { id: 10, name: 'Magha', sanskritName: 'मघा', fixedStar: 'Alpha Leonis (Regulus)', constellation: 'Leo', lord: 'Ketu', deity: 'Pitris (Ancestral Lineage)', element: 'Agni (Fire)', symbol: 'Royal Throne Room', span: '00°00\' – 13°20\' Simha' },
  { id: 11, name: 'Purva Phalguni', sanskritName: 'पूर्वा फाल्गुनी', fixedStar: 'Delta and Theta Leonis (Zosma & Chertan)', constellation: 'Leo', lord: 'Shukra', deity: 'Bhaga (God of Fortune & Love)', element: 'Agni (Fire)', symbol: 'Front Legs of Couch', span: '13°20\' – 26°40\' Simha' },
  { id: 12, name: 'Uttara Phalguni', sanskritName: 'उत्तरा फाल्गुनी', fixedStar: 'Beta Leonis (Denebola)', constellation: 'Leo / Virgo', lord: 'Surya', deity: 'Aryaman (God of Patronage)', element: 'Agni (Fire)', symbol: 'Back Legs of Couch', span: '26°40\' Simha – 10°00\' Kanya' },
  { id: 13, name: 'Hasta', sanskritName: 'हस्त', fixedStar: 'Alpha, Beta, Gamma, Delta Corvi', constellation: 'Corvus (Crow) / Virgo', lord: 'Chandra', deity: 'Savitar (Solar Creator)', element: 'Agni (Fire)', symbol: 'Open Hand / Palm', span: '10°00\' – 23°20\' Kanya' },
  { id: 14, name: 'Chitra', sanskritName: 'चित्रा', fixedStar: 'Alpha Virginis (Spica)', constellation: 'Virgo / Libra', lord: 'Mangal', deity: 'Tvashtar / Vishwakarma (Architect)', element: 'Agni (Fire)', symbol: 'Shining Jewel / Pearl', span: '23°20\' Kanya – 06°40\' Tula' },
  { id: 15, name: 'Swati', sanskritName: 'स्वाति', fixedStar: 'Alpha Boötis (Arcturus)', constellation: 'Boötes / Libra', lord: 'Rahu', deity: 'Vayu (Wind God)', element: 'Vayu (Air)', symbol: 'Coral / Young Shoot in Wind', span: '06°40\' – 20°00\' Tula' },
  { id: 16, name: 'Vishakha', sanskritName: 'विशाखा', fixedStar: 'Alpha and Beta Librae (Zubenelgenubi)', constellation: 'Libra / Scorpio', lord: 'Guru', deity: 'Indra and Agni (All-Conquering)', element: 'Vayu (Air)', symbol: 'Triumphal Arch / Gateway', span: '20°00\' Tula – 03°20\' Vrischika' },
  { id: 17, name: 'Anuradha', sanskritName: 'अनुराधा', fixedStar: 'Beta, Delta, and Pi Scorpii (Dschubba)', constellation: 'Scorpio', lord: 'Shani', deity: 'Mitra (God of Divine Friendship)', element: 'Vayu (Air)', symbol: 'Triumphal Lotus / Staff', span: '03°20\' – 16°40\' Vrischika' },
  { id: 18, name: 'Jyeshtha', sanskritName: 'ज्येष्ठा', fixedStar: 'Alpha Scorpii (Antares)', constellation: 'Scorpio', lord: 'Budha', deity: 'Indra (King of Gods)', element: 'Vayu (Air)', symbol: 'Circular Earring / Amulet', span: '16°40\' – 30°00\' Vrischika' },
  { id: 19, name: 'Mula', sanskritName: 'मूल', fixedStar: 'Epsilon, Zeta, Eta, Theta Scorpii (Shaula)', constellation: 'Scorpio / Sagittarius', lord: 'Ketu', deity: 'Nirriti (Goddess of Root Truth)', element: 'Agni (Fire)', symbol: 'Tied Bundle of Roots', span: '00°00\' – 13°20\' Dhanu' },
  { id: 20, name: 'Purva Ashadha', sanskritName: 'पूर्वाषाढ़ा', fixedStar: 'Delta and Epsilon Sagittarii (Kaus)', constellation: 'Sagittarius', lord: 'Shukra', deity: 'Apas (Cosmic Water Goddess)', element: 'Jala (Water)', symbol: 'Elephant’s Tusk / Fan', span: '13°20\' – 26°40\' Dhanu' },
  { id: 21, name: 'Uttara Ashadha', sanskritName: 'उत्तराषाढ़ा', fixedStar: 'Zeta and Sigma Sagittarii (Nunki)', constellation: 'Sagittarius / Capricorn', lord: 'Surya', deity: 'Vishvadevas (Universal Gods)', element: 'Prithvi (Earth)', symbol: 'Small Bed / Elephant Tusk', span: '26°40\' Dhanu – 10°00\' Makara' },
  { id: 22, name: 'Shravana', sanskritName: 'श्रवण', fixedStar: 'Alpha, Beta, Gamma Aquilae (Altair)', constellation: 'Aquila (Eagle) / Capricorn', lord: 'Chandra', deity: 'Lord Vishnu (Preserver)', element: 'Vayu (Air)', symbol: 'Three Footprints / Ear', span: '10°00\' – 23°20\' Makara' },
  { id: 23, name: 'Dhanishta', sanskritName: 'धनिष्ठा', fixedStar: 'Alpha to Delta Delphini (Delphinus)', constellation: 'Capricorn / Aquarius', lord: 'Mangal', deity: 'Eight Vasus (Gods of Abundance)', element: 'Agni (Fire)', symbol: 'Drum / Flute', span: '23°20\' Makara – 06°40\' Kumbha' },
  { id: 24, name: 'Shatabhisha', sanskritName: 'शतभिषा', fixedStar: 'Gamma Aquarii (Sadachbia)', constellation: 'Aquarius', lord: 'Rahu', deity: 'Varuna (God of Waters & Cosmic Law)', element: 'Jala (Water)', symbol: 'Empty Circle / 100 Healers', span: '06°40\' – 20°00\' Kumbha' },
  { id: 25, name: 'Purva Bhadrapada', sanskritName: 'पूर्वा भाद्रपद', fixedStar: 'Alpha and Beta Pegasi (Markab & Scheat)', constellation: 'Pegasus / Aquarius', lord: 'Guru', deity: 'Aja Ekapada (One-Footed Cosmic Fire)', element: 'Agni (Fire)', symbol: 'Two-Faced Man / Sword', span: '20°00\' Kumbha – 03°20\' Meena' },
  { id: 26, name: 'Uttara Bhadrapada', sanskritName: 'उत्तरा भाद्रपद', fixedStar: 'Gamma Pegasi and Alpha Andromedae', constellation: 'Andromeda / Pisces', lord: 'Shani', deity: 'Ahir Budhnya (Dragon of Deep Waters)', element: 'Jala (Water)', symbol: 'Twin Back Legs of Bed', span: '03°20\' – 16°40\' Meena' },
  { id: 27, name: 'Revati', sanskritName: 'रेवती', fixedStar: 'Zeta Piscium', constellation: 'Pisces', lord: 'Budha', deity: 'Pushan (Nourisher & Protector)', element: 'Jala (Water)', symbol: 'Drum for Time / Fish', span: '16°40\' – 30°00\' Meena' },
];

export interface DailyEphemerisRow {
  date: Date;
  dayOfMonth: number;
  formattedDate: string;
  dayOfWeek: string;
  planets: Record<GrahaName, {
    rasiNumber: number;
    rasiName: VedicRasiName;
    degree: number;
    minute: number;
    totalDeg: number;
    nakshatra: string;
    pada: number;
    nakshatraLord: string;
    subLord: string;
    isRetrograde: boolean;
    dignity: string;
    houseFromNatalLagna?: number;
  }>;
}

export function getFixedStarForNakshatra(nakshatraName: string): FixedStarInfo | undefined {
  return NAKSHATRA_ASTRONOMICAL_DATA.find(
    (n) => n.name.toLowerCase() === nakshatraName.toLowerCase()
  );
}

export function generateMonthlyEphemerisGrid(
  year: number,
  month: number, // 0-indexed (0 = Jan, 11 = Dec)
  lat: number = 28.6139,
  lng: number = 77.209,
  ayanamshaSystem: AyanamshaSystem = 'Lahiri',
  natalLagnaRasi?: number
): DailyEphemerisRow[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows: DailyEphemerisRow[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d, 12, 0, 0); // Noon ephemeris
    const calc = calculatePlanetaryPositions(currentDate, lat, lng, ayanamshaSystem);
    
    const planetMap: DailyEphemerisRow['planets'] = {} as any;

    calc.planets.forEach((p) => {
      let dignity = 'Neutral';
      if (p.name === 'Surya') {
        if (p.rasiNumber === 1) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 7) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 5) dignity = 'Own Sign (Swakshetra)';
      } else if (p.name === 'Chandra') {
        if (p.rasiNumber === 2) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 8) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 4) dignity = 'Own Sign (Swakshetra)';
      } else if (p.name === 'Mangal') {
        if (p.rasiNumber === 10) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 4) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 1 || p.rasiNumber === 8) dignity = 'Own Sign (Swakshetra)';
      } else if (p.name === 'Budha') {
        if (p.rasiNumber === 6) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 12) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 3) dignity = 'Own Sign (Swakshetra)';
      } else if (p.name === 'Guru') {
        if (p.rasiNumber === 4) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 10) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 9 || p.rasiNumber === 12) dignity = 'Own Sign (Swakshetra)';
      } else if (p.name === 'Shukra') {
        if (p.rasiNumber === 12) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 6) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 2 || p.rasiNumber === 7) dignity = 'Own Sign (Swakshetra)';
      } else if (p.name === 'Shani') {
        if (p.rasiNumber === 7) dignity = 'Exalted (Ucca)';
        else if (p.rasiNumber === 1) dignity = 'Debilitated (Neeca)';
        else if (p.rasiNumber === 10 || p.rasiNumber === 11) dignity = 'Own Sign (Swakshetra)';
      }

      const houseFromNatal = natalLagnaRasi
        ? ((p.rasiNumber - natalLagnaRasi + 12) % 12) + 1
        : p.house;

      planetMap[p.name] = {
        rasiNumber: p.rasiNumber,
        rasiName: p.rasiName,
        degree: p.degree,
        minute: p.minute,
        totalDeg: p.totalDeg || (p.rasiNumber - 1) * 30 + p.degree,
        nakshatra: p.nakshatra,
        pada: p.pada,
        nakshatraLord: p.nakshatraLord || '—',
        subLord: p.subLord || '—',
        isRetrograde: p.isRetrograde,
        dignity,
        houseFromNatalLagna: houseFromNatal,
      };
    });

    rows.push({
      date: currentDate,
      dayOfMonth: d,
      formattedDate: `${d} ${currentDate.toLocaleDateString('en-US', { month: 'short' })} ${year}`,
      dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      planets: planetMap,
    });
  }

  return rows;
}

export interface MajorAstronomicalIngress {
  dateStr: string;
  timestamp: number;
  planet: GrahaName;
  planetEnglish: string;
  eventType: 'Rasi Ingress' | 'Nakshatra Ingress' | 'Retrograde Station' | 'Direct Station' | 'Eclipse' | 'Major Conjunction';
  fromSign?: string;
  toSign?: string;
  nakshatraName?: string;
  pada?: number;
  description: string;
  significanceRating: 'High' | 'Transformative' | 'Routine';
  natalHouseImpact?: string;
}

export function generateYearlyAstronomicalMilestones(
  year: number,
  lat: number = 28.6139,
  lng: number = 77.209,
  natalLagnaRasi?: number
): MajorAstronomicalIngress[] {
  const events: MajorAstronomicalIngress[] = [];

  // Scan key sample checkpoints throughout the year to detect planetary shifts
  // We check sample dates: 1st of every month + mid-month for key slow/medium planets
  const sampleDates: Date[] = [];
  for (let m = 0; m < 12; m++) {
    sampleDates.push(new Date(year, m, 1));
    sampleDates.push(new Date(year, m, 15));
  }

  const slowPlanets: GrahaName[] = ['Shani', 'Guru', 'Rahu', 'Ketu', 'Mangal', 'Surya'];

  let prevPositions: Record<GrahaName, { rasiNumber: number; rasiName: string; nakshatra: string; isRetro: boolean }> | null = null;

  for (let i = 0; i < sampleDates.length; i++) {
    const d = sampleDates[i];
    const calc = calculatePlanetaryPositions(d, lat, lng, 'Lahiri');
    const currMap: Record<GrahaName, { rasiNumber: number; rasiName: string; nakshatra: string; isRetro: boolean }> = {} as any;

    calc.planets.forEach((p) => {
      currMap[p.name] = {
        rasiNumber: p.rasiNumber,
        rasiName: p.rasiName,
        nakshatra: p.nakshatra,
        isRetro: p.isRetrograde,
      };
    });

    if (prevPositions) {
      slowPlanets.forEach((pName) => {
        const prev = prevPositions![pName];
        const curr = currMap[pName];

        if (prev && curr) {
          // Sign Ingress
          if (prev.rasiNumber !== curr.rasiNumber) {
            const natalH = natalLagnaRasi ? ((curr.rasiNumber - natalLagnaRasi + 12) % 12) + 1 : undefined;
            events.push({
              dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              timestamp: d.getTime(),
              planet: pName,
              planetEnglish: pName === 'Surya' ? 'Sun' : pName === 'Guru' ? 'Jupiter' : pName === 'Shani' ? 'Saturn' : pName,
              eventType: 'Rasi Ingress',
              fromSign: prev.rasiName,
              toSign: curr.rasiName,
              description: `${pName} transits from ${prev.rasiName} into ${curr.rasiName}.`,
              significanceRating: ['Shani', 'Guru', 'Rahu', 'Ketu'].includes(pName) ? 'High' : 'Routine',
              natalHouseImpact: natalH ? `Activates Natal House ${natalH}` : undefined,
            });
          }

          // Nakshatra Shift
          if (prev.nakshatra !== curr.nakshatra && prev.rasiNumber === curr.rasiNumber) {
            events.push({
              dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              timestamp: d.getTime(),
              planet: pName,
              planetEnglish: pName === 'Surya' ? 'Sun' : pName === 'Guru' ? 'Jupiter' : pName === 'Shani' ? 'Saturn' : pName,
              eventType: 'Nakshatra Ingress',
              nakshatraName: curr.nakshatra,
              description: `${pName} enters ${curr.nakshatra} Nakshatra in ${curr.rasiName}.`,
              significanceRating: ['Shani', 'Guru', 'Rahu', 'Ketu'].includes(pName) ? 'Transformative' : 'Routine',
            });
          }

          // Retrograde Shift
          if (!prev.isRetro && curr.isRetro && pName !== 'Rahu' && pName !== 'Ketu') {
            events.push({
              dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              timestamp: d.getTime(),
              planet: pName,
              planetEnglish: pName,
              eventType: 'Retrograde Station',
              description: `${pName} turns Retrograde (Vakri) in ${curr.rasiName} (${curr.nakshatra}).`,
              significanceRating: 'Transformative',
            });
          } else if (prev.isRetro && !curr.isRetro && pName !== 'Rahu' && pName !== 'Ketu') {
            events.push({
              dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              timestamp: d.getTime(),
              planet: pName,
              planetEnglish: pName,
              eventType: 'Direct Station',
              description: `${pName} turns Direct (Marga) in ${curr.rasiName} (${curr.nakshatra}).`,
              significanceRating: 'High',
            });
          }
        }
      });
    }

    prevPositions = currMap;
  }

  // Add key astronomical eclipse benchmarks for sample reference
  events.push({
    dateStr: `Mid-Spring ${year}`,
    timestamp: new Date(year, 3, 15).getTime(),
    planet: 'Surya',
    planetEnglish: 'Sun & Rahu/Ketu Axis',
    eventType: 'Eclipse',
    description: `Solar & Lunar Eclipse Alignment Season along the Rahu-Ketu nodal axis in ${year}.`,
    significanceRating: 'Transformative',
  });

  return events.sort((a, b) => a.timestamp - b.timestamp);
}
