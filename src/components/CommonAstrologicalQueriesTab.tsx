import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Award,
  Layers,
  Compass,
  ArrowRight,
  ShieldCheck,
  Flame,
  Brain,
} from 'lucide-react';

interface ResearchQueryResult {
  question: string;
  category: string;
  answer: string;
  researchCitations: string[];
  keyTakeaways: string[];
}

interface PrebuiltQuery {
  id: string;
  category: string;
  question: string;
  snippet: string;
  defaultAnswer: string;
  citations: string[];
  takeaways: string[];
}

const PREBUILT_QUERIES: PrebuiltQuery[] = [
  {
    id: 'dasha-gochar',
    category: 'Dasha & Transits',
    question: 'How do Mahadasha and Gochar (Transits) interact to deliver concrete life events?',
    snippet: 'Understanding the macro-micro relationship between Vimshottari sub-periods and planetary transits.',
    defaultAnswer: `In classical Vedic astrology (Brihat Parashara Hora Shastra & Dr. B.V. Raman's laws), the **Mahadasha** establishes the overarching karmic environment (the "seed"), while **Gochar (Planetary Transits)** acts as the time-keeper (the "trigger").

A planet during its Mahadasha or Antardasha holds primary executive authority to deliver the fruits of the houses it rules and occupies in the natal chart. However, the concrete timing of event manifestation requires a supportive Gochar.

For instance, marriage, career promotion, or property acquisition promises in the Dasha will manifest precisely when major transiting benefic Grahas—specifically **Guru (Jupiter)** and **Shani (Saturn)**—form a Double-Transit aspect on the relevant house or house lord (e.g., 7th house for marriage, 10th house for career). Without a supportive Dasha, transits produce temporary passing moods; without a supportive transit, Dasha promises remain dormant potential.`,
    citations: ['Brihat Parashara Hora Shastra (Ch. 47-50)', 'Dr. B.V. Raman - How to Judge a Horoscope', 'K.N. Rao - Planets and Children'],
    takeaways: [
      'Mahadasha provides the environment and potential; Gochar provides the exact timing trigger.',
      'Guru (Jupiter) expands and blesses, while Shani (Saturn) consolidates and makes permanent.',
      'Double-Transit of Jupiter & Saturn over a house activates its core fruits.',
    ],
  },
  {
    id: 'sade-sati',
    category: 'Dasha & Transits',
    question: 'Why is Shani Sade Sati widely misunderstood and what is its authentic Vedic purpose?',
    snippet: 'Demystifying the 7.5-year Saturn transit over Janma Rasi.',
    defaultAnswer: `Shani Sade Sati refers to the 7.5-year transit of **Shani (Saturn)** through the 12th, 1st, and 2nd houses from the natal **Janma Rasi (Moon sign)**. Contrary to popular fear, Sade Sati is not an unconditional curse; it is a profound cosmic crucible designed for karmic auditing, emotional maturity, and spiritual refinement.

In Maharishi Parashara's system, the Moon represents the mind (*Manas*) and emotional security. When Saturn transits adjacent to and over the Moon, it strips away superficial illusions, ego vanity, and unviable commitments.

If Saturn is a functional benefic for your Lagna (e.g., Taurus, Libra, Capricorn, Aquarius) or if Saturn occupies strong Ashtakavarga points (30+ points in Rasi), Sade Sati frequently delivers major professional authority, lasting real estate acquisitions, political power, and deep spiritual grounding. It demands three virtues: honesty, hard work, and humility.`,
    citations: ['Phaladeepika by Mantreswara (Ch. 17)', 'Bhrigu Samhita', 'Dr. B.V. Raman - Planets and the Next World'],
    takeaways: [
      'Sade Sati audits past karmas and builds unshakeable emotional resilience.',
      'Benefic Saturn for Taurus, Libra, Capricorn & Aquarius Lagnas brings high status during Sade Sati.',
      'Remedies emphasize selfless service (Seva), Hanuman Chalisa japa, and integrity.',
    ],
  },
  {
    id: 'raja-yogas',
    category: 'Yogas & Doshas',
    question: 'What makes a Raja Yoga fruitful versus dormant in a birth chart?',
    snippet: 'Evaluating Kendra-Trikona lordships, Avasthas, and Dasha timing.',
    defaultAnswer: `A **Raja Yoga** is classically formed by the mutual association (conjunction, mutual aspect, or sign exchange) between a **Kendra lord** (Houses 1, 4, 7, 10 — Vishnu Sthanas representing action & power) and a **Trikona lord** (Houses 1, 5, 9 — Lakshmi Sthanas representing grace & fortune).

However, a Raja Yoga can remain dormant or produce muted results under three key conditions:
1. **Dasha Non-Activation**: If the native does not run the Mahadasha or Antardasha of the participating planets during their active working years.
2. **Combustion or Debilitation**: If participating planets are combust (*Astha*) by the Sun, severely afflicted by Rahu/Ketu, or debilitated (*Neecha*) without Neecha Bhanga.
3. **Shadbala Deficit**: If the planets lack required positional and directional strength (*Digbala*).

When activated by Dasha and supported by Shadbala, Raja Yogas elevate the native to executive authority, widespread honor, and financial prosperity.`,
    citations: ['Brihat Parashara Hora Shastra (Ch. 41 - Raja Yoga Adhyaya)', 'Saravali by Kalyana Varma'],
    takeaways: [
      'Kendra (Vishnu) + Trikona (Lakshmi) lordships create supreme Raja Yogas.',
      'Dasha activation during prime working years is required for full physical manifestation.',
      'Neecha Bhanga (Cancellation of Debilitation) converts early struggles into legendary success.',
    ],
  },
  {
    id: 'manglik-dosha',
    category: 'Yogas & Doshas',
    question: 'What is Manglik Dosha and what are its classical cancellations (Bhanga)?',
    snippet: 'Authentic Parashari rules on Mars placement in houses 1, 2, 4, 7, 8, 12.',
    defaultAnswer: `**Kuja / Manglik Dosha** occurs when **Mangal (Mars)** occupies the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Lagna, Moon, or Venus. Mars is a fiery planet of energy, initiative, and assertion; in partnership houses (7th, 8th, 4th), unchanneled Martian energy can trigger temperament clashes or impatience.

However, classical Vedic texts list extensive **Cancellations (Bhanga)** that invalidate Kuja Dosha in over 85% of charts:
1. Mars in own sign (Aries, Scorpio) or exalted sign (Capricorn).
2. Mars in the 2nd house in Gemini/Virgo, or 4th house in Aries/Scorpio, or 7th house in Cancer/Capricorn.
3. Conjunction or strong aspect from **Guru (Jupiter)**—Jupiter's divine gaze neutralizes Martian aggression completely.
4. Mars in Saturnian signs (Capricorn, Aquarius) or conjoint Saturn/Rahu.
5. Both partners having Kuja Dosha creates mutual energy balance (*Dosha Samyam*).`,
    citations: ['Brihat Parashara Hora Shastra', 'Muhurta Chintamani', 'Dr. B.V. Raman - Muhurta / Electional Astrology'],
    takeaways: [
      'Manglik Dosha is cancelled by Jupiterian aspects or Mars in own/exalted sign.',
      'Age 28+ naturally matures Martian energy for harmonious relationships.',
      'Matching charts through Ashtakoota & Bhava Maitri ensures long-term companionship.',
    ],
  },
  {
    id: 'd9-navamsha',
    category: 'Divisional Charts',
    question: 'Why is the Navamsha (D9) chart considered the soul chart and backbone of prediction?',
    snippet: 'How D9 reveals inner strength, spousal nature, and late-life dharma.',
    defaultAnswer: `In Vedic astrology, the **D1 (Rasi Chart)** represents the physical tree, while the **D9 (Navamsha Chart)** represents the inner fruit and root strength. Every 30° Rasi sign is divided into 9 equal parts of 3°20' (matching the 108 Nakshatra Padas).

The Navamsha serves three critical predictive purposes:
1. **Planetary Confirmation (*Vargottama & Bala*)**: A planet exalted in D1 but debilitated in D9 loses its true capacity to deliver. Conversely, a planet weak in D1 that gains strength in D9 (*Vargottama* or exalted) produces enduring success.
2. **Marriage & Spousal Temperament**: The 7th house of D9 and the Navamsha lord of the 7th house reveal the true character, spiritual alignment, and background of the spouse.
3. **Dharmic Destiny in Second Half of Life**: As a person matures past age 30-36, life experiences align increasingly with the D9 blueprint.`,
    citations: ['Brihat Parashara Hora Shastra (Dasha Varga Adhyaya)', 'Jaimini Sutramritam', 'K.N. Rao - Predicting through Navamsha'],
    takeaways: [
      'D1 shows physical circumstances; D9 reveals inner capacity and true strength.',
      'Vargottama planets (same sign in D1 & D9) grant high confidence and royal results.',
      'D9 confirms the permanent quality of marriage and spiritual dharma.',
    ],
  },
  {
    id: 'ayanamsha',
    category: 'Astronomy vs Astrology',
    question: 'What is Ayanamsha and why does Sidereal (Vedic) differ from Tropical (Western) astrology?',
    snippet: 'The precession of equinoxes (24° offset) and Chitra Paksha (Lahiri) precision.',
    defaultAnswer: `The fundamental difference between **Sidereal (Vedic / Nirayana)** and **Tropical (Western / Sayana)** astrology lies in the reference point used to fix 0° Aries:

- **Tropical System**: Fixes 0° Aries at the Vernal Equinox (the spring equinox point). Because the Earth’s rotational axis wobbles slowly (Precession of Equinoxes at ~50.29 arcseconds per year), the equinox point shifts backward against the fixed star background.
- **Sidereal System**: Fixes 0° Aries against the observable physical star constellation (specifically opposite the star Spica / Chitra at 180°).

The angular difference between these two systems is called **Ayanamsha**. Currently (in 2026), the Ayanamsha is approximately **24° 14'**. 

Vedic astrology uses the Sidereal zodiac because planetary positions align with the true physical constellations in the night sky. The most widely accepted Ayanamsha in Indian research is **Chitra Paksha Ayanamsha (Lahiri)**, standardized by the Indian Calendar Reform Committee.`,
    citations: ['Suriya Siddhanta', 'Indian Ephemeris & Nautical Almanac', 'Dr. B.V. Raman - Planetary Influences on Human Affairs'],
    takeaways: [
      'Ayanamsha (~24° 14\') compensates for Earth’s axial precession over ~25,772 years.',
      'Vedic astrology uses Sidereal positions matched to observable night sky constellations.',
      'Chitra Paksha (Lahiri) Ayanamsha is the standard for Sidereal planetary calculations.',
    ],
  },
  {
    id: 'vedic-remedies',
    category: 'Vedic Remedies',
    question: 'How do Vedic Remedies (Mantras, Gemstones, Daan, Seva) scientifically and spiritually work?',
    snippet: 'Harmonizing planetary ray frequencies, subconscious sound resonance, and karmic balance.',
    defaultAnswer: `In Maharishi Parashara's framework, planetary Grahas are not external punishers; they are cosmic mirrors reflecting our past *Samskaras* (subconscious impressions). Remedies (**Upayas**) work through three distinct modalities:

1. **Mantra Japa (Sound Resonance)**: Sanskrit mantras are precise acoustic formulas. Chanting planetary seed mantras (*Beeja Mantras*) at specific frequencies creates sympathetic resonance in the nervous system, calming brainwaves and harmonizing emotional turbulence.
2. **Daan & Seva (Karmic Balancing)**: Giving specific items (e.g. food, sesame oil, copper, green moong) or service on a planet's day neutralizes *Karmic Rina* (debts). Action creates an opposing positive karma that dissipates friction.
3. **Ratna / Gemstones (Light Frequency)**: Natural untreated gemstones act as optical filters that concentrate specific cosmic color frequencies (*Rays*) through skin contact into the energetic subtle body (*Pranamaya Kosha*). Gemstones should only be worn for functional benefic planets.`,
    citations: ['Brihat Samhita by Varahamihira', 'Phaladeepika (Upaya Adhyaya)', 'Dr. B.V. Raman - Astrology and Remedies'],
    takeaways: [
      'Mantras re-tune subconscious nervous system frequencies through sound resonance.',
      'Charity (Daan) directly neutralizes specific past karmic debts.',
      'Gemstones amplify functional benefic planet rays and should be prescribed with care.',
    ],
  },
];

export function CommonAstrologicalQueriesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeQuery, setActiveQuery] = useState<PrebuiltQuery | null>(PREBUILT_QUERIES[0]);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<ResearchQueryResult | null>(null);

  const categories = [
    'All',
    'Dasha & Transits',
    'Yogas & Doshas',
    'Divisional Charts',
    'Astronomy vs Astrology',
    'Vedic Remedies',
  ];

  const filteredQueries = PREBUILT_QUERIES.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  );

  const handleSelectQuery = (query: PrebuiltQuery) => {
    setActiveQuery(query);
    setAiResponse(null);
    setAiError(null);
  };

  const handleAskCustomQuery = async (queryText?: string, categoryText?: string) => {
    const qToAsk = queryText || customQuestion;
    if (!qToAsk.trim()) return;

    setIsLoadingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/astrology/common-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToAsk,
          category: categoryText || selectedCategory || 'Vedic Concepts',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI research answer');
      }

      setAiResponse(data);
    } catch (err: any) {
      setAiError(err.message || 'Unable to connect to AI research engine right now.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-50/90 via-[#FFFDF9] to-amber-50/80 border border-amber-300/80 rounded-lg p-3 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-amber-800" />
            <h2 className="text-[15px] font-black text-stone-950 uppercase tracking-wider font-vedic leading-tight">
              Common Astrological Queries (AI Research Portal)
            </h2>
          </div>
          <p className="text-[12px] text-stone-700 font-medium">
            Concise, research-backed answers grounded in classical texts (Parashara, Phaladeepika, B.V. Raman, Cheiro, K.N. Rao)
          </p>
        </div>

        <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-950 border border-amber-300 font-bold text-[11px] shrink-0 self-start sm:self-auto flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          <span>Gemini 3.8 Research Engine</span>
        </span>
      </div>

      {/* Interactive Custom Question Bar */}
      <div className="bg-white rounded-lg border border-amber-200 p-2.5 shadow-3xs space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="custom-astrology-question" className="text-[12px] font-black uppercase tracking-wider text-amber-950 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-amber-700" />
            <span>Ask Any Vedic Astrology Concept or Custom Query</span>
          </label>
          <span className="text-[10.5px] font-semibold text-stone-500">
            Type any question regarding Yogas, Dashas, Transits, or Remedies
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="custom-astrology-question"
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskCustomQuery();
            }}
            placeholder="e.g. What is Ashtakavarga and how is it used in Gochar? Or Explain Bhrigu Bindu..."
            className="flex-1 px-3 py-1.5 rounded border border-stone-300 text-[12.5px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300"
          />

          <button
            type="button"
            onClick={() => handleAskCustomQuery()}
            disabled={isLoadingAi || !customQuestion.trim()}
            className="px-4 py-1.5 rounded bg-amber-800 hover:bg-amber-900 text-white font-bold text-[12px] transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI Scholar</span>
              </>
            )}
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-stone-100">
          <span className="text-[11px] font-bold text-stone-600 mr-1">Categories:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-[#FAF8F5]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {aiError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[12px] px-3 py-2 rounded">
          {aiError}
        </div>
      )}

      {/* Main Content Layout: Prebuilt Query Library (Left) + AI/Selected Answer View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Left Column: List of Common Prebuilt Queries */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-3xs space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
              <span className="text-[12px] font-black uppercase tracking-wider text-stone-900 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Core Vedic Concepts ({filteredQueries.length})</span>
              </span>
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredQueries.map((q) => {
                const isSelected = activeQuery?.id === q.id && !aiResponse;
                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuery(q)}
                    className={`p-2 rounded border cursor-pointer transition-all space-y-1 ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                        : 'bg-[#FAF8F5]/80 border-stone-200 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 border border-amber-200">
                        {q.category}
                      </span>
                    </div>
                    <div className="font-vedic font-bold text-stone-950 text-[12.5px] leading-tight">
                      {q.question}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                      {q.snippet}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Answer Display (AI Custom or Selected Query) */}
        <div className="lg:col-span-2 space-y-2">
          {aiResponse ? (
            /* Custom AI Answer View */
            <div className="bg-white rounded-lg border border-amber-300 p-3 shadow-3xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                    {aiResponse.category} • AI Research Synthesis
                  </span>
                  <h3 className="font-vedic font-black text-stone-950 text-[16px] tracking-tight mt-1 leading-snug">
                    {aiResponse.question}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setAiResponse(null)}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer"
                >
                  Clear AI Answer
                </button>
              </div>

              {/* Research Answer Text */}
              <div className="text-[13px] text-stone-800 leading-relaxed whitespace-pre-line space-y-2">
                {aiResponse.answer}
              </div>

              {/* Key Takeaways */}
              {aiResponse.keyTakeaways && aiResponse.keyTakeaways.length > 0 && (
                <div className="bg-emerald-50/50 rounded-md p-2.5 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Core Practical Insights</span>
                  </span>
                  <ul className="space-y-1 text-[12px] text-stone-800">
                    {aiResponse.keyTakeaways.map((t, tidx) => (
                      <li key={tidx} className="flex items-start space-x-1.5 leading-snug">
                        <span className="text-emerald-700 font-bold mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citations */}
              {aiResponse.researchCitations && aiResponse.researchCitations.length > 0 && (
                <div className="bg-amber-50/60 rounded-md p-2 border border-amber-200/80 space-y-0.5 text-[11px]">
                  <strong className="text-amber-950 uppercase tracking-wider block font-bold">
                    Research Sources &amp; Classical Citations:
                  </strong>
                  <div className="flex flex-wrap gap-1.5 text-stone-700">
                    {aiResponse.researchCitations.map((c, cidx) => (
                      <span key={cidx} className="px-2 py-0.5 bg-white rounded border border-amber-200 text-amber-900 font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeQuery ? (
            /* Selected Prebuilt Query Answer View */
            <div className="bg-white rounded-lg border border-amber-200/90 p-3 shadow-3xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200/80 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                    {activeQuery.category}
                  </span>
                  <h3 className="font-vedic font-black text-stone-950 text-[16px] tracking-tight mt-1 leading-snug">
                    {activeQuery.question}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleAskCustomQuery(activeQuery.question, activeQuery.category)}
                  disabled={isLoadingAi}
                  className="inline-flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold py-1 px-2.5 rounded transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Deep AI Research</span>
                </button>
              </div>

              {/* Research Answer Text */}
              <div className="text-[13px] text-stone-800 leading-relaxed whitespace-pre-line space-y-2">
                {activeQuery.defaultAnswer}
              </div>

              {/* Key Takeaways */}
              <div className="bg-emerald-50/50 rounded-md p-2.5 border border-emerald-200/80 space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Core Practical Takeaways</span>
                </span>
                <ul className="space-y-1 text-[12px] text-stone-800">
                  {activeQuery.takeaways.map((t, tidx) => (
                    <li key={tidx} className="flex items-start space-x-1.5 leading-snug">
                      <span className="text-emerald-700 font-bold mt-0.5">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Citations */}
              <div className="bg-amber-50/60 rounded-md p-2 border border-amber-200/80 space-y-0.5 text-[11px]">
                <strong className="text-amber-950 uppercase tracking-wider block font-bold">
                  Classical Vedic Research Citations:
                </strong>
                <div className="flex flex-wrap gap-1.5 text-stone-700">
                  {activeQuery.citations.map((c, cidx) => (
                    <span key={cidx} className="px-2 py-0.5 bg-white rounded border border-amber-200 text-amber-900 font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-stone-200 p-6 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-amber-700 mx-auto opacity-80" />
              <p className="text-stone-600 text-[13px] font-semibold">
                Select a concept from the left library or ask a custom question above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
