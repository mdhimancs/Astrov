import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI if key exists
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API endpoint for Real-Time Vedic Astrological Prediction based on North Indian Kundali & Current Planetary Transits
  app.post("/api/astrology/vedic-prediction", async (req, res) => {
    try {
      const {
        name,
        birthDate,
        birthTime,
        birthPlace,
        lagnaRasi,
        moonRasi,
        nakshatra,
        sadeSatiStatus,
        transitSummary,
        selectedMonth,
      } = req.body;

      const ai = getAI();

      if (!ai) {
        return res.json({
          reading: `Vedic Astrological Synthesis for ${name || 'Seeker'}:
Your North Indian Janam Kundali reveals Lagna in ${lagnaRasi} with Moon in ${moonRasi} (${nakshatra} Nakshatra).
Current real-time Gochar (planetary transit) places Jupiter and Saturn in pivotal positions relative to your natal chart.
${sadeSatiStatus?.inSadeSati ? `Note on Shani: You are experiencing ${sadeSatiStatus.phase}. Focus on patience, service, and steady discipline.` : 'Saturn is bestowing stability and endurance without direct Sade Sati pressure.'}

Key Planetary Movements & Effects:
- Jupiter's protective gaze fosters intellectual growth, ethical enterprise, and strategic partnerships.
- Saturn's transit demands meticulous consistency and long-term asset building.

Month-Wise Highlights ${selectedMonth ? `(${selectedMonth})` : '(Upcoming Cycle)'}:
- Favorable window for organizing finances, executing long-delayed goals, and cultivating family goodwill.

Vedic Do's and Don'ts as per Planetary Moments:
✓ DO: Maintain a consistent morning routine with Surya Namaskar and Gayatri Mantra japa.
✓ DO: Secure written documentation for financial commitments and asset acquisitions.
✗ DON'T: Engage in hasty speculative risks or unverified financial bets during sensitive transit phases.
✗ DON'T: Escalate interpersonal disagreements into ego confrontations.

Vedic Upaya: Chant Maha Mrityunjaya Mantra and offer water to the rising Sun in a copper vessel daily.`,
        });
      }

      const prompt = `You are an elite master astrologer combining the legendary predictive accuracy of CHEIRO (Chaldean timing, fateful turning ages, specific power dates, uncannily accurate real-world event forecasting) and DR. B.V. RAMAN (authoritative Parashari Vedic precision and Double-Transit laws).

Seeker Details:
- Name: ${name || 'Seeker'}
- Date of Birth: ${birthDate}
- Time of Birth: ${birthTime}
- Place of Birth: ${birthPlace}
- Natal Lagna (Ascendant): ${lagnaRasi}
- Natal Moon Sign (Janma Rasi): ${moonRasi}
- Birth Nakshatra: ${nakshatra}
- Shani Sade Sati / Dhaiya Status: ${sadeSatiStatus?.phase || 'None'} - ${sadeSatiStatus?.description || ''}
- Current Planetary Transits (Gochar): ${JSON.stringify(transitSummary || {})}
${selectedMonth ? `- Focus Month: ${selectedMonth}` : ''}

CRITICAL INSTRUCTIONS:
- Write strictly in SHORT, PUNCHY, HIGH-CONVICTION BULLET POINTS (no long narrative walls of text).
- Be highly predictive, definitive, and specific: state exact event manifestations, critical pivot months, financial surges, career leaps, and fateful turning points.
- Include Cheiro-style fortunate dates of the month, power days of the week, and lucky numbers.

Structure your response with these clean sections:
1. 🎯 Cheiro & Raman Direct Predictive Forecast (3-4 crisp, high-accuracy predictive bullet points on what WILL manifest)
2. 💼 Career, Leadership & Wealth Window (Short bullet points on job promotions, business contracts, and financial compounding)
3. 🏡 Marriage, Relationships & Domestic Alliances (Definitive points on spousal harmony, family milestones, and partnership timing)
4. ⏳ Critical Pivot Dates & Auspicious Timing (Specific fortunate dates of the month, power weekdays, and peak transition windows)
5. ⚖️ Strategic Do's and Don'ts (2 punchy green DO's, 2 sharp red DON'Ts)
6. 🪔 Vedic Upayas (Prescribed mantra japa, gem/color vibration, and karmic remedy)`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a world-renowned master predictive astrologer in the tradition of Cheiro, Dr. B.V. Raman, and K.N. Rao. Your style is concise, authoritative, definitive, and strictly formatted in short predictive bullet points with high accuracy and zero fluff.",
          temperature: 0.6,
        }
      });

      res.json({ reading: response.text || "The divine cosmos reveals auspicious alignments for your journey." });
    } catch (err: any) {
      console.error("Vedic prediction error:", err);
      res.status(500).json({ error: err.message || "Failed to generate Vedic prediction" });
    }
  });

  // API endpoint for AI Natal Chart Reading
  app.post("/api/astrology/reading", async (req, res) => {
    try {
      const { name, birthDate, birthTime, birthLocation, sunSign, moonSign, risingSign } = req.body;
      const ai = getAI();

      if (!ai) {
        // Fallback reading if no API key
        return res.json({
          reading: `Greetings ${name || 'Seeker'}. Your Sun in ${sunSign}, Moon in ${moonSign}, and Rising in ${risingSign} create a magnificent tapestry of cosmic energy. With your birth in ${birthLocation || 'the cosmos'} on ${birthDate}, you are uniquely attuned to profound spiritual growth and creative manifestation. Trust your intuition and embrace the transformative transits ahead.`
        });
      }

      const prompt = `Provide an insightful, mystical, and deeply encouraging astrological natal chart reading for:
Name: ${name || 'Seeker'}
Birth Date: ${birthDate}
Birth Time: ${birthTime || 'Unknown'}
Birth Location: ${birthLocation || 'Earth'}
Sun Sign: ${sunSign}
Moon Sign: ${moonSign}
Rising Sign (Ascendant): ${risingSign}

Structure the reading into 3 elegant paragraphs:
1. Core Essence (Sun & Rising)
2. Emotional Landscape & Subconscious (Moon)
3. Cosmic Purpose & Current Astrological Guidance
Keep the tone inspiring, professional, and evocative.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert master astrologer with deep wisdom in celestial alignment, synastry, and soulful guidance.",
          temperature: 0.7,
        }
      });

      res.json({ reading: response.text || "The stars are whispering profound insights for your journey." });
    } catch (err: any) {
      console.error("Gemini reading error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI reading" });
    }
  });

  // API endpoint for AI Compatibility / Synastry Analysis
  app.post("/api/astrology/compatibility", async (req, res) => {
    try {
      const { sign1, sign2 } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          analysis: `${sign1} and ${sign2} share a fascinating elemental dance. While their rhythms differ, mutual respect and open communication bridge any cosmic distance into a rewarding partnership.`
        });
      }

      const prompt = `Provide a detailed astrological synastry and compatibility analysis between ${sign1} and ${sign2}. Cover love, communication, and shared growth in 2 insightful paragraphs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text || "A harmonious blend of celestial vibrations." });
    } catch (err: any) {
      console.error("Compatibility AI error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API endpoint for Free-Form Geocoding Location Search
  app.get("/api/astrology/geocode", async (req, res) => {
    try {
      const query = (req.query.q as string || '').trim();
      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }

      // 1. Try OpenStreetMap Nominatim geocoder
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'VedicAstrologyKundali/2.0 (contact: munish.world@gmail.com)',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const results = data.map((item: any) => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const countryCode = item.address?.country_code?.toLowerCase() || '';

              // Calculate timezone offset
              let tz = 5.5; // default IST for Indian locations
              if (countryCode === 'in' || (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 98)) {
                tz = 5.5;
              } else if (countryCode === 'np') {
                tz = 5.75;
              } else if (countryCode === 'gb') {
                tz = 1.0;
              } else if (countryCode === 'ae') {
                tz = 4.0;
              } else if (countryCode === 'sg') {
                tz = 8.0;
              } else {
                tz = Math.round((lng / 15) * 2) / 2;
              }

              // Create clean display name: City, State, Country
              const addr = item.address || {};
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || item.name;
              const state = addr.state || addr.province || addr.region || '';
              const country = addr.country || '';
              const shortName = [city, state, country].filter(Boolean).join(', ');

              return {
                name: shortName || item.display_name,
                fullName: item.display_name,
                lat,
                lng,
                tz,
                country: country || (countryCode ? countryCode.toUpperCase() : 'World'),
              };
            });

            return res.json({ results });
          }
        }
      } catch (nomErr) {
        // Continue to Gemini fallback if Nominatim timed out or failed
      }

      // 2. Gemini Fallback for Location Resolution
      const ai = getAI();
      if (ai) {
        try {
          const prompt = `Given the location query "${query}", provide geographic coordinates and standard UTC timezone offset.
Return strictly valid JSON with this format:
[
  {
    "name": "City, State, Country",
    "lat": 31.634,
    "lng": 74.872,
    "tz": 5.5,
    "country": "India"
  }
]
If the place is in India, tz is 5.5. Only output the JSON array, no commentary.`;

          const aiRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              temperature: 0.1,
            },
          });

          const rawText = aiRes.text || '';
          const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({ results: parsed });
          }
        } catch (aiErr) {
          // fallback gracefully
        }
      }

      return res.json({ results: [] });
    } catch (err: any) {
      console.error("Geocoding error:", err);
      res.json({ results: [] });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Astrology server running on http://localhost:${PORT}`);
  });
}

startServer();
