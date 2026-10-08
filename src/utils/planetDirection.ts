import { GrahaName } from '../types';

export interface PlanetDirectionInfo {
  graha: string;
  compassDirection: string;
  sanskritDirection: string;
  digbalaHouse: number;
  digbalaDirection: string;
  description: string;
}

export const PLANET_DIRECTIONS: Record<string, PlanetDirectionInfo> = {
  Surya: {
    graha: 'Surya (Sun)',
    compassDirection: 'East',
    sanskritDirection: 'Purva (पूर्व)',
    digbalaHouse: 10,
    digbalaDirection: 'South (Dakshina)',
    description: 'Surya rules the East and gains maximum directional strength (Digbala) in the 10th house facing South.',
  },
  Chandra: {
    graha: 'Chandra (Moon)',
    compassDirection: 'North-West',
    sanskritDirection: 'Vayavya (वायव्य)',
    digbalaHouse: 4,
    digbalaDirection: 'North (Uttara)',
    description: 'Chandra rules the North-West and gains maximum directional strength (Digbala) in the 4th house facing North.',
  },
  Mangal: {
    graha: 'Mangal (Mars)',
    compassDirection: 'South',
    sanskritDirection: 'Dakshina (दक्षिण)',
    digbalaHouse: 10,
    digbalaDirection: 'South (Dakshina)',
    description: 'Mangal rules the South and gains maximum directional strength (Digbala) in the 10th house facing South.',
  },
  Budha: {
    graha: 'Budha (Mercury)',
    compassDirection: 'North',
    sanskritDirection: 'Uttara (उत्तर)',
    digbalaHouse: 1,
    digbalaDirection: 'East (Purva)',
    description: 'Budha rules the North and gains maximum directional strength (Digbala) in the 1st house (Lagna) facing East.',
  },
  Guru: {
    graha: 'Guru (Jupiter)',
    compassDirection: 'North-East',
    sanskritDirection: 'Eshanya (ईशान्य)',
    digbalaHouse: 1,
    digbalaDirection: 'East (Purva)',
    description: 'Guru rules the North-East (Eshanya Kona) and gains maximum directional strength in the 1st house facing East.',
  },
  Shukra: {
    graha: 'Shukra (Venus)',
    compassDirection: 'South-East',
    sanskritDirection: 'Agneya (आग्नेय)',
    digbalaHouse: 4,
    digbalaDirection: 'North (Uttara)',
    description: 'Shukra rules the South-East (Agneya Kona) and gains maximum directional strength in the 4th house facing North.',
  },
  Shani: {
    graha: 'Shani (Saturn)',
    compassDirection: 'West',
    sanskritDirection: 'Paschima (पश्चिम)',
    digbalaHouse: 7,
    digbalaDirection: 'West (Paschima)',
    description: 'Shani rules the West and gains maximum directional strength (Digbala) in the 7th house facing West.',
  },
  Rahu: {
    graha: 'Rahu',
    compassDirection: 'South-West',
    sanskritDirection: 'Nairrita (नैऋत्य)',
    digbalaHouse: 6,
    digbalaDirection: 'South-West',
    description: 'Rahu rules the South-West (Nairrita Kona) and represents shadow expansion and subterranean directions.',
  },
  Ketu: {
    graha: 'Ketu',
    compassDirection: 'North-West',
    sanskritDirection: 'Vayavya (वायव्य)',
    digbalaHouse: 12,
    digbalaDirection: 'North-West',
    description: 'Ketu rules the North-West and governs spiritual liberation and mystical directions.',
  },
  Lagna: {
    graha: 'Lagna (Ascendant)',
    compassDirection: 'East',
    sanskritDirection: 'Purva (पूर्व / Udaya)',
    digbalaHouse: 1,
    digbalaDirection: 'East (Horizon)',
    description: 'The Ascendant represents the eastern horizon at the exact time of birth.',
  },
};

export function getPlanetDirectionInfo(planetName: string): PlanetDirectionInfo {
  return PLANET_DIRECTIONS[planetName] || {
    graha: planetName,
    compassDirection: 'East',
    sanskritDirection: 'Purva',
    digbalaHouse: 1,
    digbalaDirection: 'East',
    description: 'Standard directional alignment.',
  };
}

export function getRasiDirection(rasiNumber: number): { direction: string; sanskrit: string } {
  // 1: Mesha (East), 2: Vrishabha (South), 3: Mithuna (West), 4: Karka (North), etc. (mod 4)
  const mod = (rasiNumber - 1) % 4;
  switch (mod) {
    case 0: return { direction: 'East', sanskrit: 'Purva (पूर्व)' };
    case 1: return { direction: 'South', sanskrit: 'Dakshina (दक्षिण)' };
    case 2: return { direction: 'West', sanskrit: 'Paschima (पश्चिम)' };
    case 3: return { direction: 'North', sanskrit: 'Uttara (उत्तर)' };
    default: return { direction: 'East', sanskrit: 'Purva' };
  }
}
