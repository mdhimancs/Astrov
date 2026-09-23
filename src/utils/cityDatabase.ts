export interface CityLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  tz: number;
  isPopularVedicHub?: boolean;
}

export const COMPREHENSIVE_CITIES: CityLocation[] = [
  // --- Punjab, Haryana, Chandigarh & North India ---
  { name: 'Amritsar, Punjab, India', state: 'Punjab', country: 'India', lat: 31.6340, lng: 74.8723, tz: 5.5, isPopularVedicHub: true },
  { name: 'Ludhiana, Punjab, India', state: 'Punjab', country: 'India', lat: 30.9010, lng: 75.8573, tz: 5.5 },
  { name: 'Jalandhar, Punjab, India', state: 'Punjab', country: 'India', lat: 31.3260, lng: 75.5762, tz: 5.5 },
  { name: 'Patiala, Punjab, India', state: 'Punjab', country: 'India', lat: 30.3398, lng: 76.3869, tz: 5.5 },
  { name: 'Bathinda, Punjab, India', state: 'Punjab', country: 'India', lat: 30.2110, lng: 74.9455, tz: 5.5 },
  { name: 'Hoshiarpur, Punjab, India', state: 'Punjab', country: 'India', lat: 31.5273, lng: 75.9149, tz: 5.5 },
  { name: 'Mohali (SAS Nagar), Punjab, India', state: 'Punjab', country: 'India', lat: 30.7046, lng: 76.7179, tz: 5.5 },
  { name: 'Pathankot, Punjab, India', state: 'Punjab', country: 'India', lat: 32.2688, lng: 75.6483, tz: 5.5 },
  { name: 'Chandigarh, India', state: 'Chandigarh', country: 'India', lat: 30.7333, lng: 76.7794, tz: 5.5, isPopularVedicHub: true },
  { name: 'Ambala, Haryana, India', state: 'Haryana', country: 'India', lat: 30.3782, lng: 76.7767, tz: 5.5 },
  { name: 'Gurugram (Gurgaon), Haryana, India', state: 'Haryana', country: 'India', lat: 28.4595, lng: 77.0266, tz: 5.5 },
  { name: 'Faridabad, Haryana, India', state: 'Haryana', country: 'India', lat: 28.4089, lng: 77.3178, tz: 5.5 },
  { name: 'Panipat, Haryana, India', state: 'Haryana', country: 'India', lat: 29.3909, lng: 76.9635, tz: 5.5 },
  { name: 'Karnal, Haryana, India', state: 'Haryana', country: 'India', lat: 29.6857, lng: 76.9905, tz: 5.5 },
  { name: 'Kurukshetra, Haryana, India', state: 'Haryana', country: 'India', lat: 29.9695, lng: 76.8783, tz: 5.5, isPopularVedicHub: true },
  { name: 'Hisar, Haryana, India', state: 'Haryana', country: 'India', lat: 29.1492, lng: 75.7217, tz: 5.5 },
  { name: 'Rohtak, Haryana, India', state: 'Haryana', country: 'India', lat: 28.8955, lng: 76.6066, tz: 5.5 },

  // --- Delhi & NCR ---
  { name: 'New Delhi, India', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, tz: 5.5, isPopularVedicHub: true },
  { name: 'Noida, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 28.5355, lng: 77.3910, tz: 5.5 },
  { name: 'Ghaziabad, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 28.6692, lng: 77.4538, tz: 5.5 },

  // --- Uttar Pradesh & Uttarakhand (Sacred Vedic Centers) ---
  { name: 'Varanasi (Kashi), Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 25.3176, lng: 82.9739, tz: 5.5, isPopularVedicHub: true },
  { name: 'Ayodhya, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 26.7922, lng: 82.1998, tz: 5.5, isPopularVedicHub: true },
  { name: 'Mathura, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 27.4924, lng: 77.6737, tz: 5.5, isPopularVedicHub: true },
  { name: 'Vrindavan, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 27.5806, lng: 77.7006, tz: 5.5, isPopularVedicHub: true },
  { name: 'Prayagraj (Allahabad), Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 25.4358, lng: 81.8463, tz: 5.5, isPopularVedicHub: true },
  { name: 'Lucknow, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462, tz: 5.5 },
  { name: 'Kanpur, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 26.4499, lng: 80.3319, tz: 5.5 },
  { name: 'Agra, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 27.1767, lng: 78.0081, tz: 5.5 },
  { name: 'Gorakhpur, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 26.7606, lng: 83.3732, tz: 5.5 },
  { name: 'Meerut, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 28.9845, lng: 77.7064, tz: 5.5 },
  { name: 'Bareilly, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 28.3670, lng: 79.4304, tz: 5.5 },
  { name: 'Aligarh, Uttar Pradesh, India', state: 'Uttar Pradesh', country: 'India', lat: 27.8974, lng: 78.0880, tz: 5.5 },
  { name: 'Haridwar, Uttarakhand, India', state: 'Uttarakhand', country: 'India', lat: 29.9457, lng: 78.1642, tz: 5.5, isPopularVedicHub: true },
  { name: 'Rishikesh, Uttarakhand, India', state: 'Uttarakhand', country: 'India', lat: 30.0869, lng: 78.2676, tz: 5.5, isPopularVedicHub: true },
  { name: 'Dehradun, Uttarakhand, India', state: 'Uttarakhand', country: 'India', lat: 30.3165, lng: 78.0322, tz: 5.5 },
  { name: 'Nainital, Uttarakhand, India', state: 'Uttarakhand', country: 'India', lat: 29.3919, lng: 79.4542, tz: 5.5 },

  // --- Himachal Pradesh & Jammu & Kashmir ---
  { name: 'Shimla, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India', lat: 31.1048, lng: 77.1734, tz: 5.5 },
  { name: 'Dharamshala, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India', lat: 32.2190, lng: 76.3234, tz: 5.5 },
  { name: 'Kullu / Manali, Himachal Pradesh, India', state: 'Himachal Pradesh', country: 'India', lat: 31.9579, lng: 77.1095, tz: 5.5 },
  { name: 'Jammu, Jammu & Kashmir, India', state: 'Jammu & Kashmir', country: 'India', lat: 32.7266, lng: 74.8570, tz: 5.5 },
  { name: 'Katra (Vaishno Devi), Jammu & Kashmir, India', state: 'Jammu & Kashmir', country: 'India', lat: 32.9918, lng: 74.9318, tz: 5.5, isPopularVedicHub: true },
  { name: 'Srinagar, Jammu & Kashmir, India', state: 'Jammu & Kashmir', country: 'India', lat: 34.0837, lng: 74.7973, tz: 5.5 },

  // --- Maharashtra & Western India ---
  { name: 'Mumbai, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777, tz: 5.5, isPopularVedicHub: true },
  { name: 'Pune, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567, tz: 5.5 },
  { name: 'Nagpur, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 21.1458, lng: 79.0882, tz: 5.5 },
  { name: 'Nashik, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 19.9975, lng: 73.7898, tz: 5.5, isPopularVedicHub: true },
  { name: 'Shirdi, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 19.7667, lng: 74.4764, tz: 5.5, isPopularVedicHub: true },
  { name: 'Kolhapur, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 16.7050, lng: 74.2433, tz: 5.5 },
  { name: 'Thane, Maharashtra, India', state: 'Maharashtra', country: 'India', lat: 19.2183, lng: 72.9781, tz: 5.5 },
  { name: 'Chhatrapati Sambhajinagar (Aurangabad), India', state: 'Maharashtra', country: 'India', lat: 19.8762, lng: 75.3433, tz: 5.5 },
  { name: 'Panaji, Goa, India', state: 'Goa', country: 'India', lat: 15.4909, lng: 73.8278, tz: 5.5 },

  // --- Gujarat ---
  { name: 'Ahmedabad, Gujarat, India', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714, tz: 5.5 },
  { name: 'Surat, Gujarat, India', state: 'Gujarat', country: 'India', lat: 21.1702, lng: 72.8311, tz: 5.5 },
  { name: 'Vadodara, Gujarat, India', state: 'Gujarat', country: 'India', lat: 22.3072, lng: 73.1812, tz: 5.5 },
  { name: 'Rajkot, Gujarat, India', state: 'Gujarat', country: 'India', lat: 22.3039, lng: 70.8022, tz: 5.5 },
  { name: 'Dwarka, Gujarat, India', state: 'Gujarat', country: 'India', lat: 22.2442, lng: 68.9685, tz: 5.5, isPopularVedicHub: true },
  { name: 'Somnath, Gujarat, India', state: 'Gujarat', country: 'India', lat: 20.8880, lng: 70.4012, tz: 5.5, isPopularVedicHub: true },

  // --- Rajasthan ---
  { name: 'Jaipur, Rajasthan, India', state: 'Rajasthan', country: 'India', lat: 26.9124, lng: 75.7873, tz: 5.5, isPopularVedicHub: true },
  { name: 'Jodhpur, Rajasthan, India', state: 'Rajasthan', country: 'India', lat: 26.2389, lng: 73.0243, tz: 5.5 },
  { name: 'Udaipur, Rajasthan, India', state: 'Rajasthan', country: 'India', lat: 24.5854, lng: 73.7125, tz: 5.5 },
  { name: 'Ajmer / Pushkar, Rajasthan, India', state: 'Rajasthan', country: 'India', lat: 26.4499, lng: 74.6399, tz: 5.5, isPopularVedicHub: true },
  { name: 'Kota, Rajasthan, India', state: 'Rajasthan', country: 'India', lat: 25.2138, lng: 75.8648, tz: 5.5 },
  { name: 'Bikaner, Rajasthan, India', state: 'Rajasthan', country: 'India', lat: 28.0229, lng: 73.3119, tz: 5.5 },

  // --- Madhya Pradesh & Central India ---
  { name: 'Ujjain, Madhya Pradesh, India', state: 'Madhya Pradesh', country: 'India', lat: 23.1765, lng: 75.7885, tz: 5.5, isPopularVedicHub: true },
  { name: 'Indore, Madhya Pradesh, India', state: 'Madhya Pradesh', country: 'India', lat: 22.7196, lng: 75.8577, tz: 5.5 },
  { name: 'Bhopal, Madhya Pradesh, India', state: 'Madhya Pradesh', country: 'India', lat: 23.2599, lng: 77.4126, tz: 5.5 },
  { name: 'Gwalior, Madhya Pradesh, India', state: 'Madhya Pradesh', country: 'India', lat: 26.2183, lng: 78.1828, tz: 5.5 },
  { name: 'Jabalpur, Madhya Pradesh, India', state: 'Madhya Pradesh', country: 'India', lat: 23.1815, lng: 79.9864, tz: 5.5 },
  { name: 'Omkareshwar, Madhya Pradesh, India', state: 'Madhya Pradesh', country: 'India', lat: 22.2436, lng: 76.1517, tz: 5.5, isPopularVedicHub: true },

  // --- South India ---
  { name: 'Bengaluru, Karnataka, India', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946, tz: 5.5, isPopularVedicHub: true },
  { name: 'Mysuru (Mysore), Karnataka, India', state: 'Karnataka', country: 'India', lat: 12.2958, lng: 76.6394, tz: 5.5 },
  { name: 'Udupi, Karnataka, India', state: 'Karnataka', country: 'India', lat: 13.3409, lng: 74.7421, tz: 5.5, isPopularVedicHub: true },
  { name: 'Mangaluru, Karnataka, India', state: 'Karnataka', country: 'India', lat: 12.9141, lng: 74.8560, tz: 5.5 },
  { name: 'Chennai, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'Madurai, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lng: 78.1198, tz: 5.5, isPopularVedicHub: true },
  { name: 'Rameswaram, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India', lat: 9.2876, lng: 79.3129, tz: 5.5, isPopularVedicHub: true },
  { name: 'Kanchipuram, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India', lat: 12.8342, lng: 79.7036, tz: 5.5, isPopularVedicHub: true },
  { name: 'Coimbatore, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558, tz: 5.5 },
  { name: 'Tiruchirappalli, Tamil Nadu, India', state: 'Tamil Nadu', country: 'India', lat: 10.7905, lng: 78.7047, tz: 5.5 },
  { name: 'Hyderabad, Telangana, India', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867, tz: 5.5 },
  { name: 'Tirupati, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India', lat: 13.6288, lng: 79.4192, tz: 5.5, isPopularVedicHub: true },
  { name: 'Visakhapatnam, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lng: 83.2185, tz: 5.5 },
  { name: 'Vijayawada, Andhra Pradesh, India', state: 'Andhra Pradesh', country: 'India', lat: 16.5062, lng: 80.6480, tz: 5.5 },
  { name: 'Kochi (Cochin), Kerala, India', state: 'Kerala', country: 'India', lat: 9.9312, lng: 76.2673, tz: 5.5 },
  { name: 'Thiruvananthapuram, Kerala, India', state: 'Kerala', country: 'India', lat: 8.5241, lng: 76.9366, tz: 5.5 },
  { name: 'Guruvayur, Kerala, India', state: 'Kerala', country: 'India', lat: 10.5946, lng: 76.0407, tz: 5.5, isPopularVedicHub: true },

  // --- East & Northeast India ---
  { name: 'Kolkata, West Bengal, India', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639, tz: 5.5, isPopularVedicHub: true },
  { name: 'Patna, Bihar, India', state: 'Bihar', country: 'India', lat: 25.5941, lng: 85.1376, tz: 5.5 },
  { name: 'Gaya / Bodh Gaya, Bihar, India', state: 'Bihar', country: 'India', lat: 24.7914, lng: 85.0002, tz: 5.5, isPopularVedicHub: true },
  { name: 'Puri, Odisha, India', state: 'Odisha', country: 'India', lat: 19.8135, lng: 85.8312, tz: 5.5, isPopularVedicHub: true },
  { name: 'Bhubaneswar, Odisha, India', state: 'Odisha', country: 'India', lat: 20.2961, lng: 85.8245, tz: 5.5 },
  { name: 'Ranchi, Jharkhand, India', state: 'Jharkhand', country: 'India', lat: 23.3441, lng: 85.3096, tz: 5.5 },
  { name: 'Deoghar, Jharkhand, India', state: 'Jharkhand', country: 'India', lat: 24.4826, lng: 86.7001, tz: 5.5, isPopularVedicHub: true },
  { name: 'Guwahati (Kamakhya), Assam, India', state: 'Assam', country: 'India', lat: 26.1445, lng: 91.7362, tz: 5.5, isPopularVedicHub: true },

  // --- International (Americas, Europe, Middle East, Asia-Pacific) ---
  { name: 'Kathmandu, Nepal', country: 'Nepal', lat: 27.7172, lng: 85.3240, tz: 5.75, isPopularVedicHub: true },
  { name: 'London, United Kingdom', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, tz: 1.0, isPopularVedicHub: true },
  { name: 'Birmingham, United Kingdom', country: 'United Kingdom', lat: 52.4862, lng: -1.8904, tz: 1.0 },
  { name: 'Manchester, United Kingdom', country: 'United Kingdom', lat: 53.4808, lng: -2.2426, tz: 1.0 },
  { name: 'New York, NY, USA', country: 'USA', lat: 40.7128, lng: -74.0060, tz: -4.0, isPopularVedicHub: true },
  { name: 'San Francisco / Bay Area, CA, USA', country: 'USA', lat: 37.7749, lng: -122.4194, tz: -7.0, isPopularVedicHub: true },
  { name: 'San Jose / Silicon Valley, CA, USA', country: 'USA', lat: 37.3382, lng: -121.8863, tz: -7.0 },
  { name: 'Los Angeles, CA, USA', country: 'USA', lat: 34.0522, lng: -118.2437, tz: -7.0 },
  { name: 'Chicago, IL, USA', country: 'USA', lat: 41.8781, lng: -87.6298, tz: -5.0 },
  { name: 'Houston, TX, USA', country: 'USA', lat: 29.7604, lng: -95.3698, tz: -5.0 },
  { name: 'Dallas / Fort Worth, TX, USA', country: 'USA', lat: 32.7767, lng: -96.7970, tz: -5.0 },
  { name: 'Austin, TX, USA', country: 'USA', lat: 30.2672, lng: -97.7431, tz: -5.0 },
  { name: 'Seattle, WA, USA', country: 'USA', lat: 47.6062, lng: -122.3321, tz: -7.0 },
  { name: 'Atlanta, GA, USA', country: 'USA', lat: 33.7490, lng: -84.3880, tz: -4.0 },
  { name: 'Edison / Iselin, NJ, USA', country: 'USA', lat: 40.5187, lng: -74.4121, tz: -4.0 },
  { name: 'Toronto, Ontario, Canada', country: 'Canada', lat: 43.6532, lng: -79.3832, tz: -4.0, isPopularVedicHub: true },
  { name: 'Vancouver, BC, Canada', country: 'Canada', lat: 49.2827, lng: -123.1207, tz: -7.0 },
  { name: 'Calgary, Alberta, Canada', country: 'Canada', lat: 51.0447, lng: -114.0719, tz: -6.0 },
  { name: 'Dubai, United Arab Emirates', country: 'UAE', lat: 25.2048, lng: 55.2708, tz: 4.0, isPopularVedicHub: true },
  { name: 'Abu Dhabi, United Arab Emirates', country: 'UAE', lat: 24.4539, lng: 54.3773, tz: 4.0 },
  { name: 'Doha, Qatar', country: 'Qatar', lat: 25.2854, lng: 51.5310, tz: 3.0 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 8.0, isPopularVedicHub: true },
  { name: 'Kuala Lumpur, Malaysia', country: 'Malaysia', lat: 3.1390, lng: 101.6869, tz: 8.0 },
  { name: 'Sydney, Australia', country: 'Australia', lat: -33.8688, lng: 151.2093, tz: 10.0, isPopularVedicHub: true },
  { name: 'Melbourne, Australia', country: 'Australia', lat: -37.8136, lng: 144.9631, tz: 10.0 },
  { name: 'Auckland, New Zealand', country: 'New Zealand', lat: -36.8485, lng: 174.7633, tz: 12.0 },
  { name: 'Frankfurt, Germany', country: 'Germany', lat: 50.1109, lng: 8.6821, tz: 2.0 },
  { name: 'Paris, France', country: 'France', lat: 48.8566, lng: 2.3522, tz: 2.0 },
  { name: 'Amsterdam, Netherlands', country: 'Netherlands', lat: 52.3676, lng: 4.9041, tz: 2.0 },
  { name: 'Zurich, Switzerland', country: 'Switzerland', lat: 47.3769, lng: 8.5417, tz: 2.0 },
  { name: 'Tokyo, Japan', country: 'Japan', lat: 35.6762, lng: 139.6503, tz: 9.0 },
];

/**
 * Normalizes string for fuzzy matching (removes accents, lowercase, removes punctuation)
 */
function normalizeQuery(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Fast search through local comprehensive cities
 */
export function searchLocalCities(query: string, limit = 8): CityLocation[] {
  if (!query || query.trim().length === 0) {
    return COMPREHENSIVE_CITIES.filter((c) => c.isPopularVedicHub).slice(0, limit);
  }

  const clean = normalizeQuery(query);
  const parts = clean.split(' ').filter((p) => p.length > 0);

  const matched = COMPREHENSIVE_CITIES.filter((city) => {
    const haystack = normalizeQuery(
      `${city.name} ${city.state || ''} ${city.country}`
    );
    // All typed words must appear in haystack
    return parts.every((word) => haystack.includes(word));
  });

  // Sort by priority (popular vedic hubs first, exact startsWith higher)
  matched.sort((a, b) => {
    const aStarts = normalizeQuery(a.name).startsWith(clean) ? 2 : 0;
    const bStarts = normalizeQuery(b.name).startsWith(clean) ? 2 : 0;
    const aHub = a.isPopularVedicHub ? 1 : 0;
    const bHub = b.isPopularVedicHub ? 1 : 0;
    return (bStarts + bHub) - (aStarts + aHub);
  });

  return matched.slice(0, limit);
}

/**
 * Best match or default coordinates for any free-form string
 */
export function resolveLocationFromText(text: string): {
  name: string;
  lat: number;
  lng: number;
  tz: number;
  isCustom: boolean;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      name: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.2090,
      tz: 5.5,
      isCustom: false,
    };
  }

  const matches = searchLocalCities(trimmed, 1);
  if (matches.length > 0) {
    return {
      name: trimmed, // keep user's exact typed label or city name
      lat: matches[0].lat,
      lng: matches[0].lng,
      tz: matches[0].tz,
      isCustom: false,
    };
  }

  // If text mentions India or typical Indian terms, default to IST (5.5) and central India coordinates
  const isIndia = /india|bharat|punjab|delhi|mumbai|up|bihar|gujarat|rajasthan|bengal|kerala|tamil|karnataka|haryana|himachal/i.test(
    trimmed
  );

  return {
    name: trimmed,
    lat: isIndia ? 28.6139 : 40.7128,
    lng: isIndia ? 77.2090 : -74.0060,
    tz: isIndia ? 5.5 : -4.0,
    isCustom: true,
  };
}
