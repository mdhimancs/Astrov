import { VedicRasiName, GrahaName } from './types';

export const VEDIC_RASIS: {
  number: number;
  sanskritName: VedicRasiName;
  englishName: string;
  symbol: string;
  lord: GrahaName;
  element: 'Agni (Fire)' | 'Prithvi (Earth)' | 'Vayu (Air)' | 'Jala (Water)';
  nature: 'Chara (Movable)' | 'Sthira (Fixed)' | 'Dvisvabhava (Dual)';
}[] = [
  { number: 1, sanskritName: 'Mesha', englishName: 'Aries', symbol: '♈', lord: 'Mangal', element: 'Agni (Fire)', nature: 'Chara (Movable)' },
  { number: 2, sanskritName: 'Vrishabha', englishName: 'Taurus', symbol: '♉', lord: 'Shukra', element: 'Prithvi (Earth)', nature: 'Sthira (Fixed)' },
  { number: 3, sanskritName: 'Mithuna', englishName: 'Gemini', symbol: '♊', lord: 'Budha', element: 'Vayu (Air)', nature: 'Dvisvabhava (Dual)' },
  { number: 4, sanskritName: 'Karka', englishName: 'Cancer', symbol: '♋', lord: 'Chandra', element: 'Jala (Water)', nature: 'Chara (Movable)' },
  { number: 5, sanskritName: 'Simha', englishName: 'Leo', symbol: '♌', lord: 'Surya', element: 'Agni (Fire)', nature: 'Sthira (Fixed)' },
  { number: 6, sanskritName: 'Kanya', englishName: 'Virgo', symbol: '♍', lord: 'Budha', element: 'Prithvi (Earth)', nature: 'Dvisvabhava (Dual)' },
  { number: 7, sanskritName: 'Tula', englishName: 'Libra', symbol: '♎', lord: 'Shukra', element: 'Vayu (Air)', nature: 'Chara (Movable)' },
  { number: 8, sanskritName: 'Vrischika', englishName: 'Scorpio', symbol: '♏', lord: 'Mangal', element: 'Jala (Water)', nature: 'Sthira (Fixed)' },
  { number: 9, sanskritName: 'Dhanu', englishName: 'Sagittarius', symbol: '♐', lord: 'Guru', element: 'Agni (Fire)', nature: 'Dvisvabhava (Dual)' },
  { number: 10, sanskritName: 'Makara', englishName: 'Capricorn', symbol: '♑', lord: 'Shani', element: 'Prithvi (Earth)', nature: 'Chara (Movable)' },
  { number: 11, sanskritName: 'Kumbha', englishName: 'Aquarius', symbol: '♒', lord: 'Shani', element: 'Vayu (Air)', nature: 'Sthira (Fixed)' },
  { number: 12, sanskritName: 'Meena', englishName: 'Pisces', symbol: '♓', lord: 'Guru', element: 'Jala (Water)', nature: 'Dvisvabhava (Dual)' },
];

export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras' },
  { id: 2, name: 'Bharani', lord: 'Shukra', deity: 'Yama' },
  { id: 3, name: 'Krittika', lord: 'Surya', deity: 'Agni' },
  { id: 4, name: 'Rohini', lord: 'Chandra', deity: 'Brahma' },
  { id: 5, name: 'Mrigashira', lord: 'Mangal', deity: 'Soma' },
  { id: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra' },
  { id: 7, name: 'Punarvasu', lord: 'Guru', deity: 'Aditi' },
  { id: 8, name: 'Pushya', lord: 'Shani', deity: 'Brihaspati' },
  { id: 9, name: 'Ashlesha', lord: 'Budha', deity: 'Sarpas' },
  { id: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris' },
  { id: 11, name: 'Purva Phalguni', lord: 'Shukra', deity: 'Bhaga' },
  { id: 12, name: 'Uttara Phalguni', lord: 'Surya', deity: 'Aryaman' },
  { id: 13, name: 'Hasta', lord: 'Chandra', deity: 'Savitar' },
  { id: 14, name: 'Chitra', lord: 'Mangal', deity: 'Tvashtar' },
  { id: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu' },
  { id: 16, name: 'Vishakha', lord: 'Guru', deity: 'Indra-Agni' },
  { id: 17, name: 'Anuradha', lord: 'Shani', deity: 'Mitra' },
  { id: 18, name: 'Jyeshtha', lord: 'Budha', deity: 'Indra' },
  { id: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti' },
  { id: 20, name: 'Purva Ashadha', lord: 'Shukra', deity: 'Apas' },
  { id: 21, name: 'Uttara Ashadha', lord: 'Surya', deity: 'Vishvadevas' },
  { id: 22, name: 'Shravana', lord: 'Chandra', deity: 'Vishnu' },
  { id: 23, name: 'Dhanishta', lord: 'Mangal', deity: 'Vasus' },
  { id: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna' },
  { id: 25, name: 'Purva Bhadrapada', lord: 'Guru', deity: 'Aja Ekapada' },
  { id: 26, name: 'Uttara Bhadrapada', lord: 'Shani', deity: 'Ahir Budhnya' },
  { id: 27, name: 'Revati', lord: 'Budha', deity: 'Pushan' },
];

export const BHAVA_DETAILS: {
  house: number;
  vedicName: string;
  theme: string;
  karaka: string;
  significance: string;
}[] = [
  { house: 1, vedicName: 'Tanu Bhava (Lagna)', theme: 'Self & Vitality', karaka: 'Surya', significance: 'Physical body, appearance, constitution, vitality, character, life path, and general destiny.' },
  { house: 2, vedicName: 'Dhana Bhava', theme: 'Wealth & Family', karaka: 'Guru', significance: 'Accumulated assets, family lineage, speech, values, facial features, and nutrition.' },
  { house: 3, vedicName: 'Sahaja Bhava', theme: 'Siblings & Courage', karaka: 'Mangal', significance: 'Bravery, younger siblings, communication, creative writing, short journeys, and hand skills.' },
  { house: 4, vedicName: 'Sukha / Bandhu Bhava', theme: 'Mother & Inner Peace', karaka: 'Chandra', significance: 'Mother, home sanctuary, emotional happiness, vehicles, landed property, and ancestral roots.' },
  { house: 5, vedicName: 'Putra Bhava', theme: 'Progeny & Intellect', karaka: 'Guru', significance: 'Purva Punya (past-life merit), children, creative intelligence, speculative luck, and romance.' },
  { house: 6, vedicName: 'Ari / Shatru Bhava', theme: 'Health, Debts & Competition', karaka: 'Mangal / Shani', significance: 'Overcoming obstacles, daily routine, enemies, physical vitality against disease, and service.' },
  { house: 7, vedicName: 'Yuvati / Kalatra Bhava', theme: 'Spouse & Partnerships', karaka: 'Shukra', significance: 'Marriage, intimate relationships, business partnerships, foreign travels, and public interactions.' },
  { house: 8, vedicName: 'Randhra / Ayu Bhava', theme: 'Longevity & Transformation', karaka: 'Shani', significance: 'Occult wisdom, unexpected inheritance, deep transformation, research, and longevity.' },
  { house: 9, vedicName: 'Dharma / Bhagya Bhava', theme: 'Fortune & Higher Wisdom', karaka: 'Guru / Surya', significance: 'Guru (spiritual teacher), father, higher philosophy, divine grace, pilgrimages, and good karma.' },
  { house: 10, vedicName: 'Karma Bhava', theme: 'Career, Status & Action', karaka: 'Budha / Surya / Shani', significance: 'Professional reputation, leadership, public fame, achievements, ambitions, and dharma in action.' },
  { house: 11, vedicName: 'Labha Bhava', theme: 'Gains & Aspirations', karaka: 'Guru', significance: 'Income, financial gains, elder siblings, social network, fulfillment of desires, and community.' },
  { house: 12, vedicName: 'Vyaya Bhava', theme: 'Liberation (Moksha) & Solitude', karaka: 'Shani / Ketu', significance: 'Spiritual liberation, subconscious dreams, expenditure, foreign residence, meditation, and charity.' },
];

export const POPULAR_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 5.5 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 5.5 },
  { name: 'Varanasi, India', lat: 25.3176, lng: 82.9739, tz: 5.5 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 5.5 },
  { name: 'London, United Kingdom', lat: 51.5074, lng: -0.1278, tz: 1.0 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: -4.0 },
  { name: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, tz: -7.0 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 8.0 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 4.0 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, tz: 10.0 },
];
