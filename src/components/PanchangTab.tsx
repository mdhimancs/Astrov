import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  Clock,
  Compass,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Award,
} from 'lucide-react';
import { PlaceOfBirthInput, PlaceValue } from './PlaceOfBirthInput';

// Convert Western digits to Devanagari (Hindi) numerals
function toHindiDigits(num: number | string): string {
  const hindiMap = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => hindiMap[parseInt(d, 10)]);
}

// 12 Hindu Lunar Months (Vikrami Samvat Chaitradi System)
const HINDU_MASAS = [
  { num: 1, hindi: 'चैत्र', english: 'Chaitra', gregMonths: 'Mar – Apr', rituHindi: 'वसंत ऋतु', rituEng: 'Vasanta (Spring)' },
  { num: 2, hindi: 'वैशाख', english: 'Vaishakha', gregMonths: 'Apr – May', rituHindi: 'वसंत ऋतु', rituEng: 'Vasanta (Spring)' },
  { num: 3, hindi: 'ज्येष्ठ', english: 'Jyeshtha', gregMonths: 'May – Jun', rituHindi: 'ग्रीष्म ऋतु', rituEng: 'Grishma (Summer)' },
  { num: 4, hindi: 'आषाढ़', english: 'Ashadha', gregMonths: 'Jun – Jul', rituHindi: 'ग्रीष्म ऋतु', rituEng: 'Grishma (Summer)' },
  { num: 5, hindi: 'श्रावण', english: 'Shravana', gregMonths: 'Jul – Aug', rituHindi: 'वर्षा ऋतु', rituEng: 'Varsha (Monsoon)' },
  { num: 6, hindi: 'भाद्रपद', english: 'Bhadrapada', gregMonths: 'Aug – Sep', rituHindi: 'वर्षा ऋतु', rituEng: 'Varsha (Monsoon)' },
  { num: 7, hindi: 'आश्विन', english: 'Ashwin', gregMonths: 'Sep – Oct', rituHindi: 'शरद ऋतु', rituEng: 'Sharad (Autumn)' },
  { num: 8, hindi: 'कार्तिक', english: 'Kartika', gregMonths: 'Oct – Nov', rituHindi: 'शरद ऋतु', rituEng: 'Sharad (Autumn)' },
  { num: 9, hindi: 'मार्गशीर्ष', english: 'Margashirsha (Agrahayana)', gregMonths: 'Nov – Dec', rituHindi: 'हेमंत ऋतु', rituEng: 'Hemanta (Pre-Winter)' },
  { num: 10, hindi: 'पौष', english: 'Pausha', gregMonths: 'Dec – Jan', rituHindi: 'हेमंत ऋतु', rituEng: 'Hemanta (Pre-Winter)' },
  { num: 11, hindi: 'माघ', english: 'Magha', gregMonths: 'Jan – Feb', rituHindi: 'शिशिर ऋतु', rituEng: 'Shishira (Winter)' },
  { num: 12, hindi: 'फाल्गुन', english: 'Phalguna', gregMonths: 'Feb – Mar', rituHindi: 'शिशिर ऋतु', rituEng: 'Shishira (Winter)' },
];

const TITHI_NAMES = [
  { num: 1, hindi: 'प्रतिपदा', english: 'Pratipada', shortHindi: '१ प्रतिपदा' },
  { num: 2, hindi: 'द्वितीया', english: 'Dwitiya', shortHindi: '२ द्वितीया' },
  { num: 3, hindi: 'तृतीया', english: 'Tritiya', shortHindi: '३ तृतीया' },
  { num: 4, hindi: 'चतुर्थी', english: 'Chaturthi', shortHindi: '४ चतुर्थी' },
  { num: 5, hindi: 'पंचमी', english: 'Panchami', shortHindi: '५ पंचमी' },
  { num: 6, hindi: 'षष्ठी', english: 'Shashthi', shortHindi: '६ षष्ठी' },
  { num: 7, hindi: 'सप्तमी', english: 'Saptami', shortHindi: '७ सप्तमी' },
  { num: 8, hindi: 'अष्टमी', english: 'Ashtami', shortHindi: '८ अष्टमी' },
  { num: 9, hindi: 'नवमी', english: 'Navami', shortHindi: '९ नवमी' },
  { num: 10, hindi: 'दशमी', english: 'Dashami', shortHindi: '१० दशमी' },
  { num: 11, hindi: 'एकादशी', english: 'Ekadashi', shortHindi: '११ एकादशी' },
  { num: 12, hindi: 'द्वादशी', english: 'Dwadashi', shortHindi: '१२ द्वादशी' },
  { num: 13, hindi: 'त्रयोदशी', english: 'Trayodashi', shortHindi: '१३ त्रयोदशी' },
  { num: 14, hindi: 'चतुर्दशी', english: 'Chaturdashi', shortHindi: '१४ चतुर्दशी' },
  { num: 15, hindi: 'पूर्णिमा', english: 'Purnima', shortHindi: '१५ पूर्णिमा' },
  { num: 30, hindi: 'अमावस्या', english: 'Amavasya', shortHindi: '३० अमावस्या' },
];

const NAKSHATRA_LIST = [
  { hindi: 'अश्विनी', english: 'Ashwini', meaning: 'Swiftness & Healing' },
  { hindi: 'भरणी', english: 'Bharani', meaning: 'Restraint & Creativity' },
  { hindi: 'कृत्तिका', english: 'Krittika', meaning: 'Purifying Fire & Honour' },
  { hindi: 'रोहिणी', english: 'Rohini', meaning: 'Growth, Abundance & Art' },
  { hindi: 'मृगशिरा', english: 'Mrigashira', meaning: 'Curiosity & Quest' },
  { hindi: 'आर्द्रा', english: 'Ardra', meaning: 'Renewal & Deep Clarity' },
  { hindi: 'पुनर्वसु', english: 'Punarvasu', meaning: 'Return of Light & Grace' },
  { hindi: 'पुष्य', english: 'Pushya', meaning: 'Supreme Nourishment' },
  { hindi: 'आश्लेषा', english: 'Ashlesha', meaning: 'Mystic Insight' },
  { hindi: 'मघा', english: 'Magha', meaning: 'Ancestral Royal Dignity' },
  { hindi: 'पूर्वा फाल्गुनी', english: 'Purva Phalguni', meaning: 'Joy & Prosperity' },
  { hindi: 'उत्तरा फाल्गुनी', english: 'Uttara Phalguni', meaning: 'Generosity & Patronage' },
  { hindi: 'हस्त', english: 'Hasta', meaning: 'Skillful Manifestation' },
  { hindi: 'चित्रा', english: 'Chitra', meaning: 'Celestial Architecture' },
  { hindi: 'स्वाति', english: 'Swati', meaning: 'Independence & Diplomacy' },
  { hindi: 'विशाखा', english: 'Vishakha', meaning: 'Single-Pointed Triumph' },
  { hindi: 'अनुराधा', english: 'Anuradha', meaning: 'Devotion & Friendship' },
  { hindi: 'ज्येष्ठा', english: 'Jyeshtha', meaning: 'Protective Seniority' },
  { hindi: 'मूल', english: 'Mula', meaning: 'Root Truth & Foundation' },
  { hindi: 'पूर्वाषाढ़ा', english: 'Purva Ashadha', meaning: 'Invincible Enthusiasm' },
  { hindi: 'उत्तराषाढ़ा', english: 'Uttara Ashadha', meaning: 'Enduring Victory' },
  { hindi: 'श्रवण', english: 'Shravana', meaning: 'Sacred Listening & Learning' },
  { hindi: 'धनिष्ठा', english: 'Dhanishta', meaning: 'Symphony & Wealth' },
  { hindi: 'शतभिषा', english: 'Shatabhisha', meaning: 'Hundred Healers' },
  { hindi: 'पूर्वा भाद्रपद', english: 'Purva Bhadrapada', meaning: 'Spiritual Fire' },
  { hindi: 'उत्तरा भाद्रपद', english: 'Uttara Bhadrapada', meaning: 'Deep Cosmic Stability' },
  { hindi: 'रेवती', english: 'Revati', meaning: 'Safe Journey & Abundance' },
];

const YOGA_LIST = [
  { hindi: 'विष्कुम्भ', english: 'Vishkumbha', meaning: 'Steadfast Resolve' },
  { hindi: 'प्रीति', english: 'Priti', meaning: 'Affection & Harmony' },
  { hindi: 'आयुष्मान', english: 'Ayushman', meaning: 'Longevity & Vitality' },
  { hindi: 'सौभाग्य', english: 'Saubhagya', meaning: 'Auspicious Fortune' },
  { hindi: 'शोभन', english: 'Shobhana', meaning: 'Splendor & Virtue' },
  { hindi: 'अतिगण्ड', english: 'Atiganda', meaning: 'Obstacle Caution' },
  { hindi: 'सुकर्मा', english: 'Sukarma', meaning: 'Noble Righteous Deeds' },
  { hindi: 'धृति', english: 'Dhriti', meaning: 'Patience & Steadiness' },
  { hindi: 'शूल', english: 'Shula', meaning: 'Sharp Focus' },
  { hindi: 'गण्ड', english: 'Ganda', meaning: 'Karmic Knot' },
  { hindi: 'वृद्धि', english: 'Vriddhi', meaning: 'Progressive Expansion' },
  { hindi: 'ध्रुव', english: 'Dhruva', meaning: 'Fixed Permanence' },
  { hindi: 'व्याघात', english: 'Vyaghata', meaning: 'Vigorous Action' },
  { hindi: 'हर्षण', english: 'Harshana', meaning: 'Delight & Joy' },
  { hindi: 'वज्र', english: 'Vajra', meaning: 'Diamond Strength' },
  { hindi: 'सिद्धि', english: 'Siddhi', meaning: 'Accomplishment & Mastery' },
  { hindi: 'व्यतीपात', english: 'Vyatipata', meaning: 'Spiritual Introspection' },
  { hindi: 'वरीयान', english: 'Variyan', meaning: 'Comfort & Nobility' },
  { hindi: 'परिघ', english: 'Parigha', meaning: 'Protective Boundary' },
  { hindi: 'शिव', english: 'Shiva', meaning: 'Benevolent Auspiciousness' },
  { hindi: 'सिद्ध', english: 'Siddha', meaning: 'Fulfillment of Works' },
  { hindi: 'साध्य', english: 'Sadhya', meaning: 'Attainable Goals' },
  { hindi: 'शुभ', english: 'Shubha', meaning: 'Pure Goodness' },
  { hindi: 'शुक्ल', english: 'Shukla', meaning: 'Radiant Clarity' },
  { hindi: 'ब्रह्म', english: 'Brahma', meaning: 'Supreme Wisdom' },
  { hindi: 'इन्द्र', english: 'Indra', meaning: 'Royal Leadership' },
  { hindi: 'वैधृति', english: 'Vaidhriti', meaning: 'Restraint & Meditation' },
];

const KARANA_LIST = [
  { hindi: 'बव', english: 'Bava', meaning: 'Constructive Beginnings' },
  { hindi: 'बालव', english: 'Balava', meaning: 'Youthful Vigour & Dharma' },
  { hindi: 'कौलव', english: 'Kaulava', meaning: 'Friendship & Alliances' },
  { hindi: 'तैतिल', english: 'Taitila', meaning: 'Trade, Craft & Wealth' },
  { hindi: 'गर', english: 'Gara', meaning: 'Agriculture & Effort' },
  { hindi: 'वणिज', english: 'Vanija', meaning: 'Commerce & Contracts' },
  { hindi: 'विष्टि (भद्रा)', english: 'Vishti (Bhadra)', meaning: 'Pause Worldly Risks' },
];

const VARA_LIST = [
  { hindi: 'रविवार', shortHindi: 'रवि', english: 'Sunday', lord: 'सूर्य (Surya)', quality: 'Vitality, Authority & Dharma', rahuKaal: '04:30 PM – 06:00 PM', yamaganda: '12:00 PM – 01:30 PM', gulika: '03:00 PM – 04:30 PM' },
  { hindi: 'सोमवार', shortHindi: 'सोम', english: 'Monday', lord: 'चन्द्र (Chandra)', quality: 'Peace, Healing & Nurturing', rahuKaal: '07:30 AM – 09:00 AM', yamaganda: '10:30 AM – 12:00 PM', gulika: '01:30 PM – 03:00 PM' },
  { hindi: 'मंगलवार', shortHindi: 'मंगल', english: 'Tuesday', lord: 'मंगल (Mangal)', quality: 'Courage, Property & Victory', rahuKaal: '03:00 PM – 04:30 PM', yamaganda: '09:00 AM – 10:30 AM', gulika: '12:00 PM – 01:30 PM' },
  { hindi: 'बुधवार', shortHindi: 'बुध', english: 'Wednesday', lord: 'बुध (Budha)', quality: 'Intellect, Trade & Learning', rahuKaal: '12:00 PM – 01:30 PM', yamaganda: '07:30 AM – 09:00 AM', gulika: '10:30 AM – 12:00 PM' },
  { hindi: 'गुरुवार', shortHindi: 'गुरु', english: 'Thursday', lord: 'गुरु (Brihaspati)', quality: 'Wisdom, Wealth & Worship', rahuKaal: '01:30 PM – 03:00 PM', yamaganda: '06:00 AM – 07:30 AM', gulika: '09:00 AM – 10:30 AM' },
  { hindi: 'शुक्रवार', shortHindi: 'शुक्र', english: 'Friday', lord: 'शुक्र (Shukra)', quality: 'Luxury, Love & Fine Arts', rahuKaal: '10:30 AM – 12:00 PM', yamaganda: '03:00 PM – 04:30 PM', gulika: '07:30 AM – 09:00 AM' },
  { hindi: 'शनिवार', shortHindi: 'शनि', english: 'Saturday', lord: 'शनि (Shani)', quality: 'Discipline, Seva & Endurance', rahuKaal: '09:00 AM – 10:30 AM', yamaganda: '01:30 PM – 03:00 PM', gulika: '06:00 AM – 07:30 AM' },
];

export interface HinduFestivalItem {
  month: number; // 1-12 Gregorian
  day: number;
  hindiName: string;
  englishName: string;
  vikramMasa: string;
  tithiLabel: string;
  category: 'Major Parva' | 'Vrat & Ekadashi' | 'Sankranti & Parva';
  significance: string;
}

// Curated Major Hindu Festivals, Vrats, Sankrantis & Important Dates across the 12 Months
const MAJOR_HINDU_FESTIVALS: HinduFestivalItem[] = [
  // January (Pausha / Magha)
  { month: 1, day: 13, hindiName: 'लोहड़ी पर्व', english: 'Lohri Festival', vikramMasa: 'पौष (Pausha)', tithiLabel: 'पौष कृष्ण दशमी', category: 'Sankranti & Parva', significance: 'Sacred bonfire harvest festival celebrating Surya’s northward journey.' },
  { month: 1, day: 14, hindiName: 'मकर संक्रांति / उत्तरायण पुण्यकाल', english: 'Makar Sankranti / Pongal', vikramMasa: 'माघ (Magha)', tithiLabel: 'सूर्य धनु से मकर में प्रवेश', category: 'Major Parva', significance: 'Surya enters Makara Rashi; marks the sacred beginning of Uttarayana, Ganga Snan, and sesame-jaggery charity.' },
  { month: 1, day: 18, hindiName: 'मौनी अमावस्या', english: 'Mauni Amavasya', vikramMasa: 'माघ (Magha)', tithiLabel: 'माघ अमावस्या', category: 'Vrat & Ekadashi', significance: 'Sacred day for silent meditation (Mauna Vrat), holy river bath, and Pitri Tarpan.' },
  { month: 1, day: 23, hindiName: 'बसंत पंचमी / सरस्वती पूजा', english: 'Vasant Panchami (Saraswati Puja)', vikramMasa: 'माघ (Magha)', tithiLabel: 'माघ शुक्ल पंचमी', category: 'Major Parva', significance: 'Abhijit-like Abujh Muhurta honoring Goddess Saraswati, wisdom, music, and the arrival of spring.' },
  // February (Magha / Phalguna)
  { month: 2, day: 1, hindiName: 'माघी पूर्णिमा / संत रविदास जयंती', english: 'Magha Purnima', vikramMasa: 'माघ (Magha)', tithiLabel: 'माघ शुक्ल पूर्णिमा', category: 'Vrat & Ekadashi', significance: 'Culmination of Magha Kalpavas; highly auspicious for Satyanarayana Puja and charity.' },
  { month: 2, day: 15, hindiName: 'महाशिवरात्रि महापर्व', english: 'Maha Shivaratri', vikramMasa: 'फाल्गुन (Phalguna)', tithiLabel: 'फाल्गुन कृष्ण चतुर्दशी', category: 'Major Parva', significance: 'Supreme night of Lord Shiva worship, Four-Prahara Rudrabhishekam, Bilva leaf offering, and spiritual awakening.' },
  // March (Phalguna / Chaitra)
  { month: 3, day: 3, hindiName: 'होलिका दहन / फाल्गुन पूर्णिमा', english: 'Holika Dahan', vikramMasa: 'फाल्गुन (Phalguna)', tithiLabel: 'फाल्गुन शुक्ल पूर्णिमा', category: 'Major Parva', significance: 'Victory of devotion (Bhakta Prahlada) over arrogance; burning of negativity in the sacred fire.' },
  { month: 3, day: 4, hindiName: 'रंगवाली होली (धुलेंडी)', english: 'Holi (Dhulandi)', vikramMasa: 'चैत्र (Chaitra)', tithiLabel: 'चैत्र कृष्ण प्रतिपदा', category: 'Major Parva', significance: 'Joyous festival of colors, spring rejuvenation, and social harmony.' },
  { month: 3, day: 19, hindiName: 'हिन्दू नववर्ष (विक्रम संवत २०८३) / चैत्र नवरात्रि प्रारंभ / गुड़ी पड़वा', english: 'Vikram Samvat 2083 New Year & Chaitra Navratri Begins', vikramMasa: 'चैत्र (Chaitra)', tithiLabel: 'चैत्र शुक्ल प्रतिपदा', category: 'Major Parva', significance: 'Sacred commencement of Vikrami Samvat 2083, Ghatasthapana, and 9 days of Shakti worship.' },
  { month: 3, day: 27, hindiName: 'श्री राम नवमी महापर्व', english: 'Shri Ram Navami', vikramMasa: 'चैत्र (Chaitra)', tithiLabel: 'चैत्र शुक्ल नवमी', category: 'Major Parva', significance: 'Divine appearance day of Maryada Purushottama Lord Shri Rama during Abhijit Muhurta.' },
  // April (Chaitra / Vaishakha)
  { month: 4, day: 2, hindiName: 'श्री हनुमान जन्मोत्सव / चैत्र पूर्णिमा', english: 'Hanuman Jayanti', vikramMasa: 'चैत्र (Chaitra)', tithiLabel: 'चैत्र शुक्ल पूर्णिमा', category: 'Major Parva', significance: 'Birth anniversary of Lord Sankatmochan Hanuman; recite Sundarkand & Hanuman Chalisa for strength.' },
  { month: 4, day: 14, hindiName: 'मेष संक्रांति / बैसाखी / सौर नववर्ष', english: 'Mesha Sankranti / Baisakhi', vikramMasa: 'वैशाख (Vaishakha)', tithiLabel: 'सूर्य मेष राशि में प्रवेश', category: 'Sankranti & Parva', significance: 'Solar New Year as exalted Surya enters Mesha (Aries); sacred harvest celebration.' },
  { month: 4, day: 20, hindiName: 'अक्षय तृतीया (आखा तीज) / परशुराम जयंती', english: 'Akshaya Tritiya', vikramMasa: 'वैशाख (Vaishakha)', tithiLabel: 'वैशाख शुक्ल तृतीया', category: 'Major Parva', significance: 'Swayam-Siddha Abujh Muhurta of imperishable merit; ideal for gold purchase, charity, and new ventures.' },
  // May (Vaishakha / Jyeshtha)
  { month: 5, day: 1, hindiName: 'बुद्ध पूर्णिमा / वैशाख पूर्णिमा', english: 'Buddha Purnima', vikramMasa: 'वैशाख (Vaishakha)', tithiLabel: 'वैशाख शुक्ल पूर्णिमा', category: 'Major Parva', significance: 'Sacred full moon of dharma, truth, and compassionate service.' },
  { month: 5, day: 16, hindiName: 'वट सावित्री व्रत / शनि जयंती', english: 'Vat Savitri Vrat & Shani Jayanti', vikramMasa: 'ज्येष्ठ (Jyeshtha)', tithiLabel: 'ज्येष्ठ अमावस्या', category: 'Vrat & Ekadashi', significance: 'Auspicious observance for marital longevity and appeasing Lord Shani Deva.' },
  { month: 5, day: 26, hindiName: 'गंगा दशहरा', english: 'Ganga Dussehra', vikramMasa: 'ज्येष्ठ (Jyeshtha)', tithiLabel: 'ज्येष्ठ शुक्ल दशमी', category: 'Major Parva', significance: 'Descent of Mother Ganga to Earth; cleanses tenfold karmic impurities.' },
  // June (Jyeshtha / Ashadha)
  { month: 6, day: 25, hindiName: 'निर्जला एकादशी (भीमसेनी एकादशी)', english: 'Nirjala Ekadashi', vikramMasa: 'ज्येष्ठ (Jyeshtha)', tithiLabel: 'ज्येष्ठ शुक्ल एकादशी', category: 'Vrat & Ekadashi', significance: 'Most austere and meritorious Ekadashi granting the fruit of all 24 Ekadashis of the year.' },
  // July (Ashadha / Shravana)
  { month: 7, day: 16, hindiName: 'भगवान जगन्नाथ रथयात्रा', english: 'Jagannath Rath Yatra', vikramMasa: 'आषाढ़ (Ashadha)', tithiLabel: 'आषाढ़ शुक्ल द्वितीया', category: 'Major Parva', significance: 'Grand festival of Lord Jagannath, Balabhadra, and Subhadra.' },
  { month: 7, day: 25, hindiName: 'देवशयनी हरिप्रबोधिनी एकादशी (चातुर्मास प्रारंभ)', english: 'Devshayani Ekadashi (Chaturmas Begins)', vikramMasa: 'आषाढ़ (Ashadha)', tithiLabel: 'आषाढ़ शुक्ल एकादशी', category: 'Vrat & Ekadashi', significance: 'Lord Vishnu enters Yoga Nidra; begins the 4-month sacred period of spiritual sadhana and restraint.' },
  { month: 7, day: 29, hindiName: 'गुरु पूर्णिमा (व्यास पूर्णिमा)', english: 'Guru Purnima (Vyasa Purnima)', vikramMasa: 'आषाढ़ (Ashadha)', tithiLabel: 'आषाढ़ शुक्ल पूर्णिमा', category: 'Major Parva', significance: 'Supreme day to worship Maharishi Vedavyasa, spiritual teachers, and guiding mentors.' },
  // August (Shravana / Bhadrapada)
  { month: 8, day: 15, hindiName: 'हरियाली तीज', english: 'Hariyali Teej', vikramMasa: 'श्रावण (Shravana)', tithiLabel: 'श्रावण शुक्ल तृतीया', category: 'Vrat & Ekadashi', significance: 'Celebrates the union of Shiva and Parvati amidst monsoon greenery.' },
  { month: 8, day: 17, hindiName: 'नाग पंचमी', english: 'Nag Panchami', vikramMasa: 'श्रावण (Shravana)', tithiLabel: 'श्रावण शुक्ल पंचमी', category: 'Major Parva', significance: 'Sacred worship of Naga Devatas; especially auspicious for Kaal Sarp & Rahu–Ketu harmonization.' },
  { month: 8, day: 28, hindiName: 'रक्षा बंधन (श्रावणी उपाकर्म)', english: 'Raksha Bandhan', vikramMasa: 'श्रावण (Shravana)', tithiLabel: 'श्रावण शुक्ल पूर्णिमा', category: 'Major Parva', significance: 'Sacred thread of protection between siblings and Vedic renewal of sacred thread (Upakarma).' },
  // September (Bhadrapada / Ashwin)
  { month: 9, day: 4, hindiName: 'श्री कृष्ण जन्माष्टमी महापर्व', english: 'Shri Krishna Janmashtami', vikramMasa: 'भाद्रपद (Bhadrapada)', tithiLabel: 'भाद्रपद कृष्ण अष्टमी (रोहिणी)', category: 'Major Parva', significance: 'Midnight divine appearance of Lord Yogeshwara Shri Krishna.' },
  { month: 9, day: 14, hindiName: 'श्री गणेश चतुर्थी (विनायक चतुर्थी)', english: 'Ganesh Chaturthi', vikramMasa: 'भाद्रपद (Bhadrapada)', tithiLabel: 'भाद्रपद शुक्ल चतुर्थी', category: 'Major Parva', significance: 'Prana-Pratishtha and worship of Lord Siddhivinayaka Ganesha for wisdom and obstacle removal.' },
  { month: 9, day: 25, hindiName: 'अनंत चतुर्दशी / गणेश विसर्जन', english: 'Anant Chaturdashi', vikramMasa: 'भाद्रपद (Bhadrapada)', tithiLabel: 'भाद्रपद शुक्ल चतुर्दशी', category: 'Vrat & Ekadashi', significance: 'Worship of Lord Ananta Padmanabha and sacred immersion of Lord Ganesha.' },
  { month: 9, day: 27, hindiName: 'पितृ पक्ष (श्राद्ध) प्रारंभ', english: 'Pitru Paksha Begins', vikramMasa: 'आश्विन (Ashwin)', tithiLabel: 'भाद्रपद पूर्णिमा / आश्विन कृष्ण प्रतिपदा', category: 'Sankranti & Parva', significance: '16-day sacred fortnight dedicated to ancestral Tarpan, Pind Daan, and Pitri Rina clearance.' },
  // October (Ashwin / Kartika)
  { month: 10, day: 10, hindiName: 'सर्वपितृ मोक्ष अमावस्या', english: 'Sarva Pitru Amavasya', vikramMasa: 'आश्विन (Ashwin)', tithiLabel: 'आश्विन अमावस्या', category: 'Vrat & Ekadashi', significance: 'Culmination of Pitru Paksha; universal day to seek blessings of all ancestors.' },
  { month: 10, day: 11, hindiName: 'शारदीय नवरात्रि प्रारंभ (घटस्थापना)', english: 'Sharadiya Navratri Begins', vikramMasa: 'आश्विन (Ashwin)', tithiLabel: 'आश्विन शुक्ल प्रतिपदा', category: 'Major Parva', significance: 'Nine sacred nights of Maa Durga Navadurga sadhana, Kalash Sthapana, and Shakti invocation.' },
  { month: 10, day: 19, hindiName: 'दुर्गा महाष्टमी / कन्या पूजन', english: 'Durga Maha Ashtami & Kanya Pujan', vikramMasa: 'आश्विन (Ashwin)', tithiLabel: 'आश्विन शुक्ल अष्टमी', category: 'Major Parva', significance: 'Worship of Maa Mahagauri and Kanya Pujan for divine grace and prosperity.' },
  { month: 10, day: 20, hindiName: 'विजयादशमी (दशहरा)', english: 'Vijayadashami (Dussehra)', vikramMasa: 'आश्विन (Ashwin)', tithiLabel: 'आश्विन शुक्ल दशमी', category: 'Major Parva', significance: 'Triumph of Dharma over Adharma; Swayam-Siddha Abujh Muhurta for Shastra Puja and new initiatives.' },
  { month: 10, day: 29, hindiName: 'करवा चौथ (संकष्टी चतुर्थी)', english: 'Karwa Chauth', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक कृष्ण चतुर्थी', category: 'Vrat & Ekadashi', significance: 'Sacred nirjala fast and Moon Arghya observed for spouse’s longevity and marital bliss.' },
  // November (Kartika / Margashirsha)
  { month: 11, day: 6, hindiName: 'धनतेरस (धन्वंतरि जयंती)', english: 'Dhanteras (Dhantrayodashi)', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक कृष्ण त्रयोदशी', category: 'Major Parva', significance: 'Worship of Lord Dhanvantari, Maa Lakshmi, and Kubera; auspicious for gold, silver, and vessel purchases.' },
  { month: 11, day: 8, hindiName: 'दीपावली महापर्व (महालक्ष्मी पूजन)', english: 'Diwali (Deepavali & Lakshmi Puja)', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक अमावस्या', category: 'Major Parva', significance: 'Festival of lights; Pradosh & Nishita Kaal Maha Lakshmi-Ganesha Puja for wealth and illumination.' },
  { month: 11, day: 9, hindiName: 'गोवर्धन पूजा (अन्नकूट)', english: 'Govardhan Puja & Annakoot', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक शुक्ल प्रतिपदा', category: 'Major Parva', significance: 'Gratitude to nature, Gau-Seva, and Annakoot offering to Lord Giriraj.' },
  { month: 11, day: 10, hindiName: 'भाई दूज (यम द्वितीया)', english: 'Bhai Dooj (Yama Dwitiya)', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक शुक्ल द्वितीया', category: 'Major Parva', significance: 'Honors the sacred bond between brothers and sisters.' },
  { month: 11, day: 15, hindiName: 'छठ महापर्व (सूर्य षष्ठी)', english: 'Chhath Puja (Surya Shashthi)', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक शुक्ल षष्ठी', category: 'Major Parva', significance: 'Rigorous Vedic worship of Surya Narayana and Chhathi Maiya offering evening and dawn Arghya.' },
  { month: 11, day: 20, hindiName: 'देवउठनी (प्रबोधिनी) एकादशी / तुलसी विवाह', english: 'Dev Uthani Ekadashi & Tulsi Vivah', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक शुक्ल एकादशी', category: 'Major Parva', significance: 'Lord Vishnu awakens from Yoga Nidra; auspicious wedding and griha-pravesh muhurtas resume.' },
  { month: 11, day: 24, hindiName: 'देव दीपावली / कार्तिक पूर्णिमा', english: 'Kartik Purnima & Dev Deepawali', vikramMasa: 'कार्तिक (Kartika)', tithiLabel: 'कार्तिक शुक्ल पूर्णिमा', category: 'Major Parva', significance: 'Gods descend to bathe in the Ganga at Kashi; Deepdaan grants immense spiritual punya.' },
  // December (Margashirsha / Pausha)
  { month: 12, day: 20, hindiName: 'गीता जयंती / मोक्षदा एकादशी', english: 'Gita Jayanti & Mokshada Ekadashi', vikramMasa: 'मार्गशीर्ष (Margashirsha)', tithiLabel: 'मार्गशीर्ष शुक्ल एकादशी', category: 'Major Parva', significance: 'Sacred day Lord Krishna revealed the Bhagavad Gita to Arjuna at Kurukshetra.' },
  { month: 12, day: 23, hindiName: 'दत्तात्रेय जयंती / मार्गशीर्ष पूर्णिमा', english: 'Dattatreya Jayanti', vikramMasa: 'मार्गशीर्ष (Margashirsha)', tithiLabel: 'मार्गशीर्ष शुक्ल पूर्णिमा', category: 'Vrat & Ekadashi', significance: 'Incarnation day of Adi-Guru Lord Dattatreya (combined trinity of Brahma, Vishnu, and Shiva).' },
];

interface DailyPanchangCell {
  date: Date;
  dayOfMonth: number;
  hindiDayDigits: string;
  vara: typeof VARA_LIST[0];
  pakshaHindi: string;
  pakshaEng: 'Shukla Paksha' | 'Krishna Paksha';
  tithiNum: number; // 1 to 15, or 30 for Amavasya
  tithiHindi: string;
  tithiEng: string;
  nakshatra: typeof NAKSHATRA_LIST[0];
  yoga: typeof YOGA_LIST[0];
  karana: typeof KARANA_LIST[0];
  vikramSamvatYear: number;
  shakaSamvatYear: number;
  hinduMasa: typeof HINDU_MASAS[0];
  ayanaHindi: string;
  ayanaEng: string;
  specialVratBadge: string | null;
  festival: HinduFestivalItem | null;
}

// Compute accurate daily Vedic Panchang & Vikrami Samvat attributes for any Date
function computeDailyPanchang(date: Date): DailyPanchangCell {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Julian day at noon local time
  const utcMs = Date.UTC(year, month - 1, day, 12, 0, 0);
  const jd = utcMs / 86400000 + 2440587.5;

  // Synodic lunar cycle from reference New Moon (Jan 18, 2026 ~ JD 2461059.3)
  const synodicMonth = 29.530588853;
  const refNewMoonJd = 2461059.25;
  let lunarAgeDays = (jd - refNewMoonJd) % synodicMonth;
  if (lunarAgeDays < 0) lunarAgeDays += synodicMonth;

  // Tithi index 1 to 30
  const tithiIndex30 = Math.min(30, Math.max(1, Math.floor((lunarAgeDays / synodicMonth) * 30) + 1));
  const isShukla = tithiIndex30 <= 15;
  const pakshaHindi = isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const pakshaEng = isShukla ? 'Shukla Paksha' : 'Krishna Paksha';

  const tithiNum = isShukla ? tithiIndex30 : tithiIndex30 === 30 ? 30 : tithiIndex30 - 15;
  const tithiObj = TITHI_NAMES.find((t) => t.num === tithiNum) || TITHI_NAMES[0];

  // Sidereal Moon longitude for Nakshatra (27 Nakshatras across 27.321661 days)
  const siderealMonth = 27.321661;
  let siderealPhase = ((jd - 2461055.0) % siderealMonth + siderealMonth) % siderealMonth;
  const nakIndex = Math.floor((siderealPhase / siderealMonth) * 27) % 27;
  const nakshatra = NAKSHATRA_LIST[nakIndex] || NAKSHATRA_LIST[0];

  // Yoga (Sun + Moon progression)
  const yogaIndex = (nakIndex + tithiIndex30) % 27;
  const yoga = YOGA_LIST[yogaIndex] || YOGA_LIST[0];

  // Karana (Half-Tithi)
  const karanaIndex = (tithiIndex30 * 2 + (day % 2)) % KARANA_LIST.length;
  const karana = KARANA_LIST[karanaIndex] || KARANA_LIST[0];

  // Vikrami Samvat Year: Starts on Chaitra Shukla Pratipada (~mid-March)
  const isAfterChaitraNewYear = month > 3 || (month === 3 && day >= 19);
  const vikramSamvatYear = isAfterChaitraNewYear ? year + 57 : year + 56;
  const shakaSamvatYear = isAfterChaitraNewYear ? year - 78 : year - 79;

  // Map Gregorian month/day to Hindu Lunar Masa
  // Jan: Pausha/Magha, Feb: Magha/Phalguna, Mar: Phalguna/Chaitra, Apr: Chaitra/Vaishakha, etc.
  const masaIndexByGregMonth = [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Mid-month transition
  const baseMasaIdx = masaIndexByGregMonth[month - 1];
  const adjustedMasaIdx = day >= 16 ? baseMasaIdx : (baseMasaIdx + 11) % 12;
  const hinduMasa = HINDU_MASAS[adjustedMasaIdx] || HINDU_MASAS[0];

  // Uttarayana (Jan 14 to Jul 15) vs Dakshinayana (Jul 16 to Jan 13)
  const isUttarayana =
    (month === 1 && day >= 14) ||
    (month >= 2 && month <= 6) ||
    (month === 7 && day <= 15);
  const ayanaHindi = isUttarayana ? 'उत्तरायण' : 'दक्षिणायन';
  const ayanaEng = isUttarayana ? 'Uttarayana' : 'Dakshinayana';

  // Match curated festival if present
  const festival = MAJOR_HINDU_FESTIVALS.find((f) => f.month === month && f.day === day) || null;

  // Automatic Vrat / Parva badge based on Tithi
  let specialVratBadge: string | null = null;
  if (tithiNum === 15) {
    specialVratBadge = 'पूर्णिमा व्रत (Purnima)';
  } else if (tithiNum === 30) {
    specialVratBadge = 'अमावस्या (Amavasya)';
  } else if (tithiNum === 11) {
    specialVratBadge = `${isShukla ? 'शुक्ल' : 'कृष्ण'} एकादशी व्रत`;
  } else if (tithiNum === 13) {
    specialVratBadge = 'प्रदोष व्रत (Pradosh)';
  } else if (tithiNum === 4 && !isShukla) {
    specialVratBadge = 'संकष्टी चतुर्थी';
  }

  return {
    date,
    dayOfMonth: day,
    hindiDayDigits: toHindiDigits(day),
    vara: VARA_LIST[date.getDay()],
    pakshaHindi,
    pakshaEng,
    tithiNum,
    tithiHindi: tithiObj.hindi,
    tithiEng: tithiObj.english,
    nakshatra,
    yoga,
    karana,
    vikramSamvatYear,
    shakaSamvatYear,
    hinduMasa,
    ayanaHindi,
    ayanaEng,
    specialVratBadge,
    festival,
  };
}

export function PanchangTab() {
  const [selectedCity, setSelectedCity] = useState<PlaceValue>({
    name: 'Varanasi (Kashi), India',
    lat: 25.3176,
    lng: 82.9739,
    tz: 5.5,
  });

  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [festivalFilter, setFestivalFilter] = useState<'month' | 'all' | 'major' | 'vrat'>('month');

  // Build all days of the currently selected month
  const monthDaysData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: DailyPanchangCell[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(computeDailyPanchang(new Date(currentYear, currentMonth, d)));
    }
    return cells;
  }, [currentYear, currentMonth]);

  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const activeDayCell =
    monthDaysData.find((c) => c.dayOfMonth === selectedDay) || monthDaysData[0];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  const monthGregorianName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Determine the two Hindu Masas spanning this Gregorian month
  const startMasa = monthDaysData[0]?.hinduMasa;
  const endMasa = monthDaysData[monthDaysData.length - 1]?.hinduMasa;
  const masaSpanLabel =
    startMasa && endMasa && startMasa.hindi !== endMasa.hindi
      ? `${startMasa.hindi} – ${endMasa.hindi} (${startMasa.english} – ${endMasa.english})`
      : `${activeDayCell.hinduMasa.hindi} (${activeDayCell.hinduMasa.english})`;

  // Filtered Festivals list
  const displayedFestivals = useMemo(() => {
    if (festivalFilter === 'month') {
      return MAJOR_HINDU_FESTIVALS.filter((f) => f.month === currentMonth + 1);
    }
    if (festivalFilter === 'major') {
      return MAJOR_HINDU_FESTIVALS.filter((f) => f.category === 'Major Parva');
    }
    if (festivalFilter === 'vrat') {
      return MAJOR_HINDU_FESTIVALS.filter((f) => f.category === 'Vrat & Ekadashi');
    }
    return MAJOR_HINDU_FESTIVALS;
  }, [festivalFilter, currentMonth]);

  return (
    <div className="w-full space-y-2">
      {/* VIKRAMI SAMVAT & HINDI PANCHANG MASTER HEADER */}
      <div className="bg-gradient-to-r from-amber-50/90 via-[#FFFDF9] to-amber-50/80 border border-amber-300/80 rounded-lg px-3 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2 shadow-3xs">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <h1 className="text-[15px] font-black text-stone-950 uppercase tracking-wider font-vedic leading-tight">
              विक्रमी संवत पंचांग एवं हिन्दू कैलेंडर • Vikrami Samvat &amp; Hindi Calendar
            </h1>
          </div>
          <p className="text-[12px] text-stone-700 font-medium">
            विक्रम संवत {toHindiDigits(activeDayCell.vikramSamvatYear)} ({activeDayCell.vikramSamvatYear}) • शक संवत {toHindiDigits(activeDayCell.shakaSamvatYear)} ({activeDayCell.shakaSamvatYear}) • {activeDayCell.ayanaHindi} ({activeDayCell.ayanaEng}) • {activeDayCell.hinduMasa.rituHindi} ({activeDayCell.hinduMasa.rituEng})
          </p>
        </div>

        {/* Location Input */}
        <div className="w-full sm:w-72 shrink-0">
          <PlaceOfBirthInput
            id="panchang-location-input"
            value={selectedCity.name}
            latitude={selectedCity.lat}
            longitude={selectedCity.lng}
            timezone={selectedCity.tz}
            onChange={(newCity) => setSelectedCity(newCity)}
            label=""
            placeholder="Search City..."
            compact
          />
        </div>
      </div>

      {/* SELECTED DATE VIKRAMI SAMVAT & PANCH-ANGA SUMMARY STRIP */}
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-700 text-white font-vedic font-bold text-[13px]">
              {activeDayCell.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="font-vedic font-bold text-stone-950 text-[15px]">
              {activeDayCell.hinduMasa.hindi} मास • {activeDayCell.pakshaHindi} • {activeDayCell.tithiHindi} ({activeDayCell.tithiEng})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200 font-bold">
              विक्रम संवत {toHindiDigits(activeDayCell.vikramSamvatYear)}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-950 border border-purple-200 font-bold">
              {activeDayCell.hinduMasa.rituHindi}
            </span>
            {activeDayCell.festival && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                ★ {activeDayCell.festival.hindiName}
              </span>
            )}
          </div>
        </div>

        {/* The 5 Limbs (पंचांग के ५ अंग — Panch-Anga) Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          <div className="bg-[#FAF8F5] p-2 rounded-md border border-stone-200/90">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              १. तिथि (Tithi)
            </span>
            <h3 className="text-[14px] font-vedic font-bold text-stone-950 mt-0.5">
              {activeDayCell.pakshaHindi} {activeDayCell.tithiHindi}
            </h3>
            <p className="text-[12px] text-stone-600 leading-snug">
              {activeDayCell.pakshaEng} • {activeDayCell.tithiEng}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-2 rounded-md border border-stone-200/90">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
              २. वार (Vara / Day)
            </span>
            <h3 className="text-[14px] font-vedic font-bold text-stone-950 mt-0.5">
              {activeDayCell.vara.hindi} ({activeDayCell.vara.english})
            </h3>
            <p className="text-[12px] text-stone-600 leading-snug">
              Lord: {activeDayCell.vara.lord}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-2 rounded-md border border-stone-200/90">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              ३. नक्षत्र (Nakshatra)
            </span>
            <h3 className="text-[14px] font-vedic font-bold text-stone-950 mt-0.5">
              {activeDayCell.nakshatra.hindi} ({activeDayCell.nakshatra.english})
            </h3>
            <p className="text-[12px] text-stone-600 leading-snug">
              {activeDayCell.nakshatra.meaning}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-2 rounded-md border border-stone-200/90">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              ४. योग (Yoga)
            </span>
            <h3 className="text-[14px] font-vedic font-bold text-stone-950 mt-0.5">
              {activeDayCell.yoga.hindi} ({activeDayCell.yoga.english})
            </h3>
            <p className="text-[12px] text-stone-600 leading-snug">
              {activeDayCell.yoga.meaning}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-2 rounded-md border border-stone-200/90 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              ५. करण (Karana)
            </span>
            <h3 className="text-[14px] font-vedic font-bold text-stone-950 mt-0.5">
              {activeDayCell.karana.hindi} ({activeDayCell.karana.english})
            </h3>
            <p className="text-[12px] text-stone-600 leading-snug">
              {activeDayCell.karana.meaning}
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MONTHLY HINDI PANCHANG CALENDAR GRID */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-3xs overflow-hidden">
        {/* Calendar Month Navigation Bar */}
        <div className="px-3 py-2 bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-vedic font-black text-stone-950 text-[16px]">
                {monthGregorianName}
              </span>
              <span className="text-stone-300">|</span>
              <span className="font-vedic font-bold text-amber-900 text-[14px]">
                हिन्दू मास: {masaSpanLabel}
              </span>
            </div>
            <p className="text-[12px] text-stone-600">
              Click any date in the Hindi calendar below to inspect its Tithi, Nakshatra, Muhurta, and Vrat
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded bg-white border border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-800 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentMonth}
              onChange={(e) => {
                setCurrentMonth(parseInt(e.target.value, 10));
                setSelectedDay(1);
              }}
              className="bg-[#FAF8F5] border border-amber-300 text-stone-900 text-[13px] font-bold rounded px-2.5 py-1 focus:outline-none focus:border-amber-600 cursor-pointer"
            >
              {[
                'January (पौष–माघ)',
                'February (माघ–फाल्गुन)',
                'March (फाल्गुन–चैत्र)',
                'April (चैत्र–वैशाख)',
                'May (वैशाख–ज्येष्ठ)',
                'June (ज्येष्ठ–आषाढ़)',
                'July (आषाढ़–श्रावण)',
                'August (श्रावण–भाद्रपद)',
                'September (भाद्रपद–आश्विन)',
                'October (आश्विन–कार्तिक)',
                'November (कार्तिक–मार्गशीर्ष)',
                'December (मार्गशीर्ष–पौष)',
              ].map((label, idx) => (
                <option key={label} value={idx}>
                  {label} {currentYear}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded bg-white border border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-800 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-Day Weekday Header Row (Hindi + English) */}
        <div className="grid grid-cols-7 bg-amber-50/60 border-b border-stone-200 text-center">
          {VARA_LIST.map((v, idx) => (
            <div
              key={v.english}
              className={`py-1.5 px-1 text-[12px] font-black uppercase tracking-wider border-r last:border-r-0 border-stone-200/70 ${
                idx === 0 ? 'text-rose-800' : 'text-stone-800'
              }`}
            >
              <div>{v.shortHindi}</div>
              <div className="text-[10px] font-semibold text-stone-500">{v.english.slice(0, 3)}</div>
            </div>
          ))}
        </div>

        {/* Monthly Calendar Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-200/80 border-b border-stone-200">
          {/* Empty leading slots before 1st of month */}
          {Array.from({ length: firstDayWeekday }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[78px] bg-stone-50/40 p-1" />
          ))}

          {/* Actual Days of Month */}
          {monthDaysData.map((cell) => {
            const isSelected = cell.dayOfMonth === activeDayCell.dayOfMonth;
            const isPurnima = cell.tithiNum === 15;
            const isAmavasya = cell.tithiNum === 30;
            const isEkadashi = cell.tithiNum === 11;

            return (
              <div
                key={cell.dayOfMonth}
                onClick={() => setSelectedDay(cell.dayOfMonth)}
                className={`min-h-[82px] p-1.5 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50/90 ring-2 ring-inset ring-amber-500'
                    : cell.festival
                    ? 'bg-rose-50/30 hover:bg-amber-50/40'
                    : isPurnima
                    ? 'bg-yellow-50/40 hover:bg-amber-50/40'
                    : 'bg-white hover:bg-stone-50/80'
                }`}
              >
                {/* Top Row: Hindi & English Date Numbers + Moon Phase Badge */}
                <div className="flex items-start justify-between gap-0.5">
                  <div className="flex items-baseline space-x-1">
                    <span
                      className={`text-[14px] font-black leading-none ${
                        cell.date.getDay() === 0 ? 'text-rose-700' : 'text-stone-950'
                      }`}
                    >
                      {cell.dayOfMonth}
                    </span>
                    <span className="text-[12px] font-bold text-amber-800 leading-none">
                      ({cell.hindiDayDigits})
                    </span>
                  </div>

                  {isPurnima && (
                    <span className="text-[10px] px-1 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      पूर्णिमा
                    </span>
                  )}
                  {isAmavasya && (
                    <span className="text-[10px] px-1 rounded bg-stone-200 text-stone-900 font-bold border border-stone-300">
                      अमावस्या
                    </span>
                  )}
                  {isEkadashi && (
                    <span className="text-[10px] px-1 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200">
                      एकादशी
                    </span>
                  )}
                </div>

                {/* Middle Row: Hindi Tithi & Nakshatra */}
                <div className="my-0.5 space-y-0.5">
                  <div className="text-[11px] font-semibold text-stone-800 leading-tight truncate">
                    {cell.pakshaEng === 'Shukla Paksha' ? 'शु०' : 'कृ०'} {cell.tithiHindi}
                  </div>
                  <div className="text-[10px] text-stone-500 leading-tight truncate">
                    नक्षत्र: {cell.nakshatra.hindi}
                  </div>
                </div>

                {/* Bottom Row: Festival or Vrat Highlight */}
                {cell.festival ? (
                  <div className="text-[10px] font-bold text-rose-800 bg-rose-100/80 border border-rose-200 rounded px-1 py-0.5 leading-tight truncate">
                    ★ {cell.festival.hindiName}
                  </div>
                ) : cell.specialVratBadge ? (
                  <div className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/70 rounded px-1 py-0.5 leading-tight truncate">
                    {cell.specialVratBadge}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* ALL 12 VIKRAMI SAMVAT HINDU MONTHS (द्वादश हिन्दू मास) REFERENCE */}
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-1.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-1">
          <h3 className="font-vedic font-bold text-stone-950 text-[14px]">
            विक्रमी संवत के १२ हिन्दू मास (12 Lunar Months of Vikrami Samvat)
          </h3>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Chaitradi System
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {HINDU_MASAS.map((m) => {
            const isCurrentMasa = m.hindi === activeDayCell.hinduMasa.hindi;
            return (
              <div
                key={m.num}
                className={`rounded border px-2 py-1.5 text-[12px] ${
                  isCurrentMasa
                    ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-[#FAF8F5]/70 border-stone-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-vedic font-bold text-stone-950 text-[13px]">
                    {toHindiDigits(m.num)}. {m.hindi}
                  </span>
                  <span className="text-[10px] font-bold text-stone-500">{m.gregMonths}</span>
                </div>
                <div className="text-[11px] font-semibold text-amber-900">{m.english}</div>
                <div className="text-[10px] text-stone-600">{m.rituHindi}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IMPORTANT DATES, VRATS & HINDU FESTIVALS DIRECTORY (प्रमुख व्रत एवं त्यौहार) */}
      <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-1.5">
          <div className="flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-700" />
            <h3 className="font-vedic font-bold text-stone-950 text-[15px]">
              प्रमुख हिन्दू पर्व, व्रत एवं महत्वपूर्ण तिथियाँ (Important Dates &amp; Festivals)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Year Festivals' },
              { id: 'major', label: 'Major Parvas' },
              { id: 'vrat', label: 'Ekadashi & Vrats' },
            ].map((tab) => {
              const isActive = festivalFilter === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setFestivalFilter(tab.id as any)}
                  className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                      : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {displayedFestivals.map((fest, idx) => {
            const festDate = new Date(currentYear, fest.month - 1, fest.day);
            const dateStr = festDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={`${fest.month}-${fest.day}-${idx}`}
                onClick={() => {
                  setCurrentMonth(fest.month - 1);
                  setSelectedDay(fest.day);
                }}
                className="bg-[#FAF8F5] hover:bg-amber-50/40 rounded-md border border-stone-200/90 hover:border-amber-300 p-2 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-vedic font-bold text-stone-950 text-[14px] leading-snug">
                      {fest.hindiName}
                    </h4>
                    <span className="text-[12px] font-semibold text-amber-900 block">
                      {fest.englishName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100/90 text-amber-950 border border-amber-300 font-bold text-[11px] shrink-0">
                    {dateStr}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-800 font-semibold">
                    मास: {fest.vikramMasa}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-900 font-semibold">
                    तिथि: {fest.tithiLabel}
                  </span>
                </div>

                <p className="text-[12px] text-stone-700 leading-snug">
                  {fest.significance}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Muhurta Windows (Auspicious vs Inauspicious) for Selected Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Auspicious Timings (Shubh Muhurta) */}
        <div className="bg-white rounded-lg border border-emerald-200/90 p-2.5 shadow-3xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <h3 className="font-vedic font-bold text-[14px] text-stone-950">
              शुभ मुहूर्त (Shubh Muhurta — {activeDayCell.vara.hindi})
            </h3>
          </div>

          <div className="space-y-1 text-[14px]">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[13px]">अभिजित मुहूर्त (Abhijit):</span>
              <span className="font-bold text-emerald-800 text-[13px]">11:52 AM – 12:42 PM</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[13px]">अमृत काल (Amrit Kaal):</span>
              <span className="font-bold text-emerald-800 text-[13px]">03:15 PM – 04:48 PM</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-50/70 border border-emerald-100">
              <span className="font-semibold text-emerald-950 text-[13px]">ब्रह्म मुहूर्त (Brahma Muhurta):</span>
              <span className="font-bold text-emerald-800 text-[13px]">04:32 AM – 05:18 AM</span>
            </div>
          </div>
        </div>

        {/* Inauspicious Timings (Ashubh Timings) */}
        <div className="bg-white rounded-lg border border-red-200/90 p-2.5 shadow-3xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-red-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <h3 className="font-vedic font-bold text-[14px] text-stone-950">
              अशुभ काल (Ashubh Kaal — {activeDayCell.vara.hindi})
            </h3>
          </div>

          <div className="space-y-1 text-[14px]">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[13px]">राहु काल (Rahu Kaal):</span>
              <span className="font-bold text-red-800 text-[13px]">{activeDayCell.vara.rahuKaal}</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[13px]">यमगण्ड (Yamaganda):</span>
              <span className="font-bold text-red-800 text-[13px]">{activeDayCell.vara.yamaganda}</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-50/70 border border-red-100">
              <span className="font-semibold text-red-950 text-[13px]">गुलिक काल (Gulika):</span>
              <span className="font-bold text-red-800 text-[13px]">{activeDayCell.vara.gulika}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
