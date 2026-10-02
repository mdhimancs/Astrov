import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const currentDirname = typeof __dirname !== 'undefined' 
  ? __dirname 
  : process.cwd();

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

  const callWithRetry = async (fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const isTransient = err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('high demand') || err.message?.includes('UNAVAILABLE');
        if (!isTransient || i === maxRetries - 1) throw err;
        
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API busy (503/429). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
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

      const response = await callWithRetry(() => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a world-renowned master predictive astrologer in the tradition of Cheiro, Dr. B.V. Raman, and K.N. Rao. Your style is concise, authoritative, definitive, and strictly formatted in short predictive bullet points with high accuracy and zero fluff.",
          temperature: 0.6,
        }
      }));

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

      const response = await callWithRetry(() => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert master astrologer with deep wisdom in celestial alignment, synastry, and soulful guidance.",
          temperature: 0.7,
        }
      }));

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

      const response = await callWithRetry(() => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      }));

      res.json({ analysis: response.text || "A harmonious blend of celestial vibrations." });
    } catch (err: any) {
      console.error("Compatibility AI error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API endpoint for AI-Driven Dasha Interpretation (Spiritual & Practical Summary of Mahadasha + Antardasha)
  app.post("/api/astrology/dasha-interpretation", async (req, res) => {
    try {
      const {
        name,
        birthDate,
        birthTime,
        birthPlace,
        lagnaRasi,
        moonRasi,
        nakshatra,
        mahadashaLord,
        mahadashaPeriod,
        antardashaLord,
        antardashaPeriod,
        mahaNatalPlacement,
        antarNatalPlacement,
      } = req.body;

      const ai = getAI();

      if (!ai) {
        return res.json({
          headline: `${mahadashaLord} Mahadasha • ${antardashaLord} Antardasha (${antardashaPeriod})`,
          spiritualSummary: `Under the macro-influence of ${mahadashaLord} (${mahaNatalPlacement}) combined with the sub-period of ${antardashaLord} (${antarNatalPlacement}), your soul is invited to align inner dharma with disciplined detachment. With Janma Nakshatra ${nakshatra} in ${moonRasi} and ${lagnaRasi} Lagna, this period awakens deeper self-inquiry, ancestral grace, and karmic maturation.`,
          practicalSummary: `Practically, the ${mahadashaLord}–${antardashaLord} window activates the houses governed and occupied by both grahas. Focus on structured execution in career, prudent wealth allocation, transparent communication in key relationships, and consistent daily vitality routines during ${antardashaPeriod}.`,
          mahadashaCoreTheme: `${mahadashaLord} Mahadasha (${mahadashaPeriod}) establishes your overarching multi-year life direction through ${mahaNatalPlacement}.`,
          antardashaSubTheme: `${antardashaLord} Antardasha (${antardashaPeriod}) acts as the immediate timing catalyst, delivering tangible events through ${antarNatalPlacement}.`,
          actionableSteps: [
            `Align major career and financial milestones with the strengths of ${mahadashaLord} and ${antardashaLord}.`,
            `Maintain ethical clarity and patience during planetary transition windows within ${antardashaPeriod}.`,
            `Dedicate morning Brahma Muhurta to mantra japa and dharmic reflection to harmonize both Dasha lords.`,
          ],
          vedicRemedy: `Recite the Vedic Beej Mantras of ${mahadashaLord} and ${antardashaLord} daily, and perform charitable seva on the weekdays ruled by these two planets.`,
        });
      }

      const prompt = `You are an authoritative Parashari & Bhrigu Vedic Astrologer. Provide a deeply insightful, structured AI-driven Dasha Interpretation covering both the SPIRITUAL and PRACTICAL summary of the seeker's active Vimshottari Mahadasha and Antardasha.

Seeker Context:
- Name: ${name || "Seeker"}
- Birth Details: ${birthDate} at ${birthTime} in ${birthPlace}
- Natal Lagna (Ascendant): ${lagnaRasi}
- Natal Moon Sign (Janma Rashi): ${moonRasi} (Nakshatra: ${nakshatra})
- Active Mahadasha: ${mahadashaLord} (${mahadashaPeriod}) — Natal Placement: ${mahaNatalPlacement}
- Active Antardasha (Sub-period): ${antardashaLord} (${antardashaPeriod}) — Natal Placement: ${antarNatalPlacement}

Provide a clear, high-conviction Vedic synthesis in JSON matching the schema.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction:
              "You are a master Vedic astrologer specializing in Vimshottari Dasha analysis (Brihat Parashara Hora Shastra & Phaladeepika). Deliver precise, inspiring, and actionable spiritual and practical interpretations.",
            temperature: 0.6,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: {
                  type: Type.STRING,
                  description: "Concise title summarizing the Mahadasha and Antardasha synergy.",
                },
                spiritualSummary: {
                  type: Type.STRING,
                  description: "3-4 sentences on the spiritual, karmic, inner consciousness, and dharmic evolution during this Mahadasha and Antardasha.",
                },
                practicalSummary: {
                  type: Type.STRING,
                  description: "3-4 sentences on the practical real-world impact across career, wealth, relationships, and health during this period.",
                },
                mahadashaCoreTheme: {
                  type: Type.STRING,
                  description: "1-2 sentences on the overarching theme of the Mahadasha lord in its natal house/sign.",
                },
                antardashaSubTheme: {
                  type: Type.STRING,
                  description: "1-2 sentences on how the Antardasha lord modifies and triggers events in its natal house/sign.",
                },
                actionableSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 concrete practical and spiritual action steps for this period.",
                },
                vedicRemedy: {
                  type: Type.STRING,
                  description: "Specific Vedic mantra, charity, and karmic upay for the Mahadasha and Antardasha combination.",
                },
              },
              required: [
                "headline",
                "spiritualSummary",
                "practicalSummary",
                "mahadashaCoreTheme",
                "antardashaSubTheme",
                "actionableSteps",
                "vedicRemedy",
              ],
            },
          },
        })
      );

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Dasha interpretation AI error:", err);
      res.status(500).json({ error: err.message || "Failed to generate Dasha interpretation" });
    }
  });

  // API endpoint for Comprehensive Yearly Life-Path Forecast (Birth Chart + Annual Transits)
  app.post("/api/astrology/yearly-lifepath", async (req, res) => {
    try {
      const {
        name,
        birthDate,
        birthTime,
        birthPlace,
        year,
        ageInYear,
        lagnaRasi,
        moonRasi,
        nakshatra,
        munthaRasi,
        munthaHouse,
        varsheshwara,
        progressedHouse,
        progressedRasi,
        doubleTransitHouses,
        natalSummary,
        annualTransits,
      } = req.body;

      const ai = getAI();

      if (!ai) {
        return res.json({
          destinyHeadline: `${year} Life-Path Synthesis • Age ${ageInYear} (Progressed H${progressedHouse} ${progressedRasi} & Muntha H${munthaHouse} ${munthaRasi})`,
          lifePathOverview: `In ${year} (Age ${ageInYear}), ${name || "Seeker"}'s natal ${lagnaRasi} Lagna and ${moonRasi} Moon (${nakshatra} Nakshatra) enter a pivotal cycle as Bhrigu/Sudarshana progression activates House ${progressedHouse} (${progressedRasi}) alongside Varshaphal Muntha in House ${munthaHouse} under Varsheshwara ${varsheshwara}. Simultaneous Guru–Shani Double-Transit activation across Houses ${(doubleTransitHouses || [1, 9]).join(", ")} crystallizes long-term dharmic and material milestones.`,
          careerWealthTrajectory: `Annual Jupiter and Saturn transits interacting with your natal birth chart favor structured career elevation, authoritative leadership roles, and compounding asset growth. Focus on high-conviction execution during your peak auspicious months.`,
          relationshipsFamilyPath: `Domestic harmony, supportive alliances, and meaningful family milestones are strengthened by benefic trinal aspects to your natal houses. Practice patient, transparent dialogue during retrograde transit windows.`,
          spiritualKarmicLesson: `Your soul lesson in ${year} centers on balancing external ambition with inner meditative poise, honoring Varsheshwara ${varsheshwara}, and transforming karmic tests into enduring wisdom.`,
          keyMilestones: [
            `Activate House ${progressedHouse} (${progressedRasi}) initiatives during the first half of ${year} for maximum natal-transit resonance.`,
            `Leverage the Guru–Shani Double-Transit in Houses ${(doubleTransitHouses || [1, 9]).join(" & ")} for permanent career and financial agreements.`,
            `Perform Varshaphal remedies for ${varsheshwara} on Thursdays and birth Nakshatra days to harmonize annual planetary currents.`,
          ],
        });
      }

      const prompt = `You are a master Vedic Astrologer specializing in Tajika Varshaphal, Bhrigu Nandi Nadi, Sudarshana Chakra Progression, and Parashari Double-Transit (Gochar) synthesis.
Generate a comprehensive Yearly Life-Path Forecast for the year ${year} based on the seeker's Birth Chart data and Annual Planetary Transits.

Seeker & Birth Chart Context:
- Name: ${name || "Seeker"}
- Birth Details: ${birthDate} at ${birthTime} in ${birthPlace}
- Target Forecast Year: ${year} (Age in Year: ${ageInYear})
- Natal Lagna (Ascendant): ${lagnaRasi}
- Natal Moon Sign (Janma Rashi): ${moonRasi} (Birth Nakshatra: ${nakshatra})
- Varshaphal Muntha: ${munthaRasi} in House ${munthaHouse} (Varsheshwara / Year Lord: ${varsheshwara})
- Bhrigu / Sudarshana Progressed House for Age ${ageInYear}: House ${progressedHouse} (${progressedRasi})
- Guru–Shani Double-Transit Activated Houses: ${JSON.stringify(doubleTransitHouses || [])}
- Natal Planetary Placements: ${JSON.stringify(natalSummary || [])}
- Annual Major Transits (Guru, Shani, Rahu-Ketu): ${JSON.stringify(annualTransits || {})}

Return a structured JSON response matching the schema.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction:
              "You are an authoritative Vedic astrologer combining birth chart (Janam Kundali) placements, Bhrigu age progression, Tajika Muntha, and Guru-Shani Double-Transit rules to deliver deeply accurate, inspiring, and practical yearly life-path predictions.",
            temperature: 0.6,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                destinyHeadline: {
                  type: Type.STRING,
                  description: "Compelling headline summarizing the seeker's overarching life-path theme for the year.",
                },
                lifePathOverview: {
                  type: Type.STRING,
                  description: "3-4 sentences synthesizing how annual transits and age progression activate the natal birth chart.",
                },
                careerWealthTrajectory: {
                  type: Type.STRING,
                  description: "2-3 sentences on career, leadership, wealth, and material trajectory based on natal + transit synergy.",
                },
                relationshipsFamilyPath: {
                  type: Type.STRING,
                  description: "2-3 sentences on marriage, family, relationships, and domestic life-path developments.",
                },
                spiritualKarmicLesson: {
                  type: Type.STRING,
                  description: "2-3 sentences on inner spiritual evolution, karmic maturation, and dharmic purpose for the year.",
                },
                keyMilestones: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 concrete, high-impact life-path milestones and strategic actions for the year.",
                },
              },
              required: [
                "destinyHeadline",
                "lifePathOverview",
                "careerWealthTrajectory",
                "relationshipsFamilyPath",
                "spiritualKarmicLesson",
                "keyMilestones",
              ],
            },
          },
        })
      );

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Yearly life-path AI error:", err);
      res.status(500).json({ error: err.message || "Failed to generate yearly life-path forecast" });
    }
  });

  // API endpoint for Personalized Upay & Remedies based on Natal Chart Challenges & Current Dasha Period
  app.post("/api/astrology/upay-remedies", async (req, res) => {
    try {
      const {
        name,
        birthDate,
        birthTime,
        birthPlace,
        lagnaRasi,
        moonRasi,
        nakshatra,
        mahadashaLord,
        antardashaLord,
        sadeSatiStatus,
        natalChallenges,
      } = req.body;

      const ai = getAI();

      if (!ai) {
        return res.json({
          headline: `Personalized Vedic Upay Sankalpa for ${name || "Seeker"} (${mahadashaLord}–${antardashaLord} Dasha)`,
          diagnosticSummary: `With ${lagnaRasi} Lagna, ${moonRasi} Janma Rashi (${nakshatra} Nakshatra), and active ${mahadashaLord} Mahadasha / ${antardashaLord} Antardasha, your primary remedial priority is harmonizing ${mahadashaLord} and ${antardashaLord} while fortifying your Lagna and Trikona lords against Dusthana (6/8/12) or Shadbala sensitivities.`,
          mantraSadhana: `Chant the Vedic Beej Mantras of ${mahadashaLord} and ${antardashaLord} 108 times during Brahma Muhurta, followed by Gayatri Mantra and Maha Mrityunjaya Japa for subtle body protection.`,
          gemstoneGuidance: `Prioritize your Lagna-benefic Ratna (Life Stone or Bhagya Stone) set in its prescribed metal after a 3-day trial. Strictly avoid gemstones of functional malefics (6th, 8th, 12th lords).`,
          lifestyleAndKarma: `Maintain sattvic Dinacharya: rise before sunrise, offer copper-vessel Arghya to Surya, practice evening Pranayama, and perform targeted Dana (charity) on the weekdays of ${mahadashaLord} and ${antardashaLord}.`,
          lalKitabSpecialUpay: `Keep a square piece of pure silver with you for Lunar equilibrium, feed green fodder to cows on Wednesdays, and offer mustard/sesame oil lamp under a Peepal tree on Saturday evenings.`,
        });
      }

      const prompt = `You are a master Parashari, Ratna-Shastra (Vedic Gemology), and Lal Kitab Remedial Astrologer.
Generate a deeply personalized, actionable Vedic Upay & Remedies protocol for the seeker based on their specific natal chart challenges and active Vimshottari Dasha period.

Seeker Profile:
- Name: ${name || "Seeker"}
- Birth: ${birthDate} at ${birthTime} in ${birthPlace}
- Natal Lagna (Ascendant): ${lagnaRasi}
- Natal Moon Sign (Janma Rashi): ${moonRasi} (Nakshatra: ${nakshatra})
- Current Active Dasha: ${mahadashaLord} Mahadasha / ${antardashaLord} Antardasha
- Sade Sati Status: ${sadeSatiStatus}
- Identified Natal Chart Challenges & Weaknesses: ${JSON.stringify(natalChallenges || [])}

Return a structured JSON object matching the schema.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            systemInstruction:
              "You are an authoritative Vedic astrologer specializing in Brihat Parashara Hora Shastra, Mantra Mahodadhi, Garuda Purana Ratna-Pariksha, and Lal Kitab Upayas. Provide safe, authentic, and actionable remedies.",
            temperature: 0.6,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                diagnosticSummary: { type: Type.STRING },
                mantraSadhana: { type: Type.STRING },
                gemstoneGuidance: { type: Type.STRING },
                lifestyleAndKarma: { type: Type.STRING },
                lalKitabSpecialUpay: { type: Type.STRING },
              },
              required: [
                "headline",
                "diagnosticSummary",
                "mantraSadhana",
                "gemstoneGuidance",
                "lifestyleAndKarma",
                "lalKitabSpecialUpay",
              ],
            },
          },
        })
      );

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Upay remedies AI error:", err);
      res.status(500).json({ error: err.message || "Failed to generate Upay remedies" });
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

          const aiRes = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: {
              temperature: 0.1,
            },
          }));

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
    // In production, server.cjs is in the dist folder along with static files
    const possibleDistPath = path.join(currentDirname, 'dist');
    const distPath = fs.existsSync(possibleDistPath) ? possibleDistPath : currentDirname;
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Astrology server running on http://localhost:${PORT}`);
  });
}

startServer();
