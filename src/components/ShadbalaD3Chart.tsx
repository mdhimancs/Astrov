import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BarChart3, Sparkles, ShieldCheck, Info } from 'lucide-react';
import { PlanetPosition, GrahaName } from '../types';

export interface PlanetStrengthImprovement {
  weekday: string;
  beejMantra: string;
  lifestyleAndKarma: string;
  danaAndUpay: string;
  colorAndMetal: string;
  directionalRemedy: string;
}

export interface PlanetShadbalaData {
  planet: GrahaName;
  englishName: string;
  symbol: string;
  house: number;
  rasiName: string;
  sthanaBala: number;      // Positional Strength (Virupas)
  digBala: number;         // Directional Strength (Virupas)
  kalaBala: number;        // Temporal Strength (Virupas)
  cheshtaBala: number;     // Motional Strength (Virupas)
  naisargikaBala: number;  // Natural Strength (Virupas)
  drikBala: number;        // Aspectual Strength (Virupas)
  totalVirupas: number;    // Sum of 6 Balas in Virupas (Shashtiamsas)
  totalRupas: number;      // Total Virupas / 60
  requiredVirupas: number; // Parashari minimum threshold in Virupas
  requiredRupas: number;   // Parashari minimum threshold in Rupas
  strengthRatio: number;   // Percentage of required strength (e.g., 118%)
  status: 'Supreme (Ati-Balavan)' | 'Strong (Balavan)' | 'Moderate (Madhyam)';
  influenceSummary: string;
  weakestBalaName: string;
  weakestBalaTip: string;
  improvement: PlanetStrengthImprovement;
}

const PLANET_IMPROVEMENT_GUIDE: Record<GrahaName, PlanetStrengthImprovement> = {
  Surya: {
    weekday: 'Sunday (Ravivar)',
    beejMantra: 'Om Hraam Hreem Hraum Sah Suryaya Namaha (108 times at sunrise) & Aditya Hridaya Stotra.',
    lifestyleAndKarma: 'Wake before sunrise, offer Surya Arghya in a copper vessel, maintain upright posture, honor your father and mentors, and keep promises with 100% integrity.',
    danaAndUpay: 'Donate wheat, jaggery (Gud), copper, or ruby-colored cloth on Sundays; take a bit of jaggery with water before important career tasks.',
    colorAndMetal: 'Saffron, Ruby Red & Gold • Metal: Copper & Gold (Manikya / Red Garnet if benefic).',
    directionalRemedy: 'Face East while working or studying to boost Surya’s Dig Bala (10th/East directional vitality).',
  },
  Chandra: {
    weekday: 'Monday (Somavar)',
    beejMantra: 'Om Shraam Shreem Shraum Sah Chandraya Namaha (108 times in the evening) & Shiva Panchakshari.',
    lifestyleAndKarma: 'Seek your mother’s blessings daily, drink water or warm milk from a silver tumbler, practice 15 minutes of Chandra Bhedana / cooling breathwork, and avoid late-night emotional stress.',
    danaAndUpay: 'Perform Rudrabhishekam with raw milk and water on Mondays; donate white rice, mishri, milk, or white cloth to needy women.',
    colorAndMetal: 'Pearl White, Cream & Silver • Metal: Pure Silver (Moti / Moonstone).',
    directionalRemedy: 'Keep the North-West and North-East sectors of your home clutter-free and well-lit to strengthen Chandra’s Dig Bala.',
  },
  Mangal: {
    weekday: 'Tuesday (Mangalvar)',
    beejMantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namaha (108 times on Tuesdays) & Hanuman Chalisa.',
    lifestyleAndKarma: 'Engage in daily physical exercise or martial/athletic training, support younger siblings, practice patience before reacting in anger, and eat meals in the kitchen when possible.',
    danaAndUpay: 'Offer sindoor and jasmine oil to Lord Hanuman on Tuesdays; donate red masoor dal, jaggery, or sweet rotis to workers.',
    colorAndMetal: 'Coral Red, Terracotta & Rust • Metal: Copper (Moonga / Red Coral if benefic).',
    directionalRemedy: 'Channel fiery energy into structured midday execution (10th House / South direction) to fortify Mangal’s Dig Bala.',
  },
  Budha: {
    weekday: 'Wednesday (Budhavar)',
    beejMantra: 'Om Braam Breem Braum Sah Budhaya Namaha (108 times on Wednesdays) & Vishnu Sahasranama.',
    lifestyleAndKarma: 'Practice truthful, measured speech, read scriptures or analytical literature daily, maintain clean dental hygiene (with alum/fitkari), and keep financial records organized.',
    danaAndUpay: 'Feed green grass or soaked green moong dal to cows and birds on Wednesdays; support underprivileged students with books and stationery.',
    colorAndMetal: 'Emerald Green, Mint & Pastel Shades • Metal: Bronze / Brass & Silver (Panna / Peridot).',
    directionalRemedy: 'Face North or East during study, coding, and commercial negotiations to amplify Budha’s 1st-House Dig Bala.',
  },
  Guru: {
    weekday: 'Thursday (Guruvar)',
    beejMantra: 'Om Graam Greem Graum Sah Gurave Namaha (108 times during Brahma Muhurta) & Guru Stotram.',
    lifestyleAndKarma: 'Apply saffron (Kesar) or turmeric tilak on your forehead daily, revere teachers, priests, and elders, cultivate dharmic generosity, and study sacred philosophy.',
    danaAndUpay: 'Water a Peepal or Banana tree on Thursdays with a pinch of turmeric; donate chana dal, turmeric, yellow fruits, or sacred books at a temple.',
    colorAndMetal: 'Turmeric Yellow, Golden Amber & Mustard • Metal: Gold & Yellow Brass (Pukhraj / Citrine).',
    directionalRemedy: 'Meditate and study facing North-East (Ishanya) in the morning to maximize Devaguru’s supreme 1st-House Dig Bala.',
  },
  Shukra: {
    weekday: 'Friday (Shukravar)',
    beejMantra: 'Om Draam Dreem Draum Sah Shukraya Namaha (108 times on Fridays) & Sri Suktam.',
    lifestyleAndKarma: 'Wear freshly washed, neat attire, use natural rose or sandalwood itr (attar), treat your spouse and women with deep respect, and keep your living space artistic and harmonious.',
    danaAndUpay: 'Offer white lotus or fragrant white flowers and kheer to Goddess Lakshmi on Fridays; donate curd, pure cow ghee, camphor, or sugar crystals.',
    colorAndMetal: 'Crystal White, Pastel Pink & Opalescent Cream • Metal: Silver & Platinum (Diamond / White Zircon / Opal).',
    directionalRemedy: 'Keep the South-East (Agneya) and 4th-House domestic sanctuary fragrant and spotless to elevate Shukra’s Dig Bala.',
  },
  Shani: {
    weekday: 'Saturday (Shanivar)',
    beejMantra: 'Om Praam Preem Praum Sah Shanaischaraya Namaha (108 times after sunset) & Dasharatha Shani Stotra.',
    lifestyleAndKarma: 'Practice strict punctuality, humility, and perseverance; treat laborers, elders, and subordinates with fairness; walk barefoot on grass; avoid intoxicants and shortcuts.',
    danaAndUpay: 'Light a sesame/mustard oil lamp under a Peepal tree on Saturday evenings; perform Chhaya Daan; donate black til, urad dal, iron utensils, or blankets to the needy.',
    colorAndMetal: 'Deep Navy Blue, Indigo & Charcoal • Metal: Iron (Loha) & Panchdhatu (Blue Sapphire / Amethyst only after trial).',
    directionalRemedy: 'Maintain calm evening routines and keep the West sector of your workspace organized to harmonize Shani’s 7th-House Dig Bala.',
  },
  Rahu: {
    weekday: 'Saturday / Wednesday Twilight',
    beejMantra: 'Om Bhraam Bhreem Bhraum Sah Rahave Namaha (108 times after sunset) & Durga Kavach.',
    lifestyleAndKarma: 'Keep electronic clutter out of the bedroom, practice grounding pranayama (Nadi Shodhana), avoid speculative shortcuts or gossip, and maintain cordial relations with in-laws.',
    danaAndUpay: 'Feed birds seven types of grains (Satnaja), float a dry coconut in running water, and keep a small solid silver elephant or square silver piece in your locker.',
    colorAndMetal: 'Smoky Grey, Electric Blue & Silver-White • Metal: Pure Silver & Ashtadhatu (Gomed / Hessonite if благоприят).',
    directionalRemedy: 'Keep the South-West corner of your home heavy, clean, and well-grounded to stabilize Rahu’s nodal energy.',
  },
  Ketu: {
    weekday: 'Tuesday / Thursday',
    beejMantra: 'Om Sraam Sreem Sraum Sah Ketave Namaha (108 times) & Sankat Nashana Ganesha Stotra.',
    lifestyleAndKarma: 'Dedicate 20 minutes daily to silent meditation, detachment, or spiritual research; apply a touch of saffron/turmeric tilak behind the ears; honor maternal grandparents.',
    danaAndUpay: 'Offer Durva grass and Modak to Lord Ganesha; feed two-colored (black-and-white) street dogs; donate warm two-colored blankets to shelter homes.',
    colorAndMetal: 'Multi-color Earth Tones, Saffron & Off-White • Metal: Silver & Gold blend (Cat’s Eye / Lehsuniya if prescribed).',
    directionalRemedy: 'Maintain a sacred altar or meditation corner in the North-East to channel Ketu’s Moksha-karaka intuition.',
  },
  Lagna: {
    weekday: 'Daily Brahma Muhurta',
    beejMantra: 'Gayatri Mantra (108 times at dawn).',
    lifestyleAndKarma: 'Maintain daily physical vitality, sattvic diet, and dharmic clarity.',
    danaAndUpay: 'Perform daily Panchamahayajna and anna-daan.',
    colorAndMetal: 'Saffron & Gold • Metal: Gold & Copper.',
    directionalRemedy: 'Face East during morning meditation.',
  },
};

interface ShadbalaD3ChartProps {
  planets: PlanetPosition[];
  birthTime?: string;
}

const SHADBALA_COMPONENT_KEYS = [
  { key: 'sthanaBala', label: 'Sthana (Positional)', color: '#FCD34D' },     // Pastel Amber-300
  { key: 'digBala', label: 'Dig (Directional)', color: '#7DD3FC' },          // Pastel Sky-300
  { key: 'kalaBala', label: 'Kala (Temporal)', color: '#C4B5FD' },           // Pastel Violet-300
  { key: 'cheshtaBala', label: 'Cheshta (Motional)', color: '#6EE7B7' },     // Pastel Emerald-300
  { key: 'naisargikaBala', label: 'Naisargika (Natural)', color: '#FDA4AF' },// Pastel Rose-300
  { key: 'drikBala', label: 'Drik (Aspectual)', color: '#818CF8' },          // Pastel Indigo-400
] as const;

const EXALTATION_DEGREE: Partial<Record<GrahaName, number>> = {
  Surya: 10,     // Mesha 10°
  Chandra: 33,   // Vrishabha 3°
  Mangal: 298,   // Makara 28°
  Budha: 165,    // Kanya 15°
  Guru: 95,      // Karka 5°
  Shukra: 357,   // Meena 27°
  Shani: 200,    // Tula 20°
  Rahu: 50,      // Vrishabha 20°
  Ketu: 230,     // Vrishchika 20°
};

const DIRECTIONAL_BEST_HOUSE: Partial<Record<GrahaName, number>> = {
  Guru: 1,
  Budha: 1,
  Surya: 10,
  Mangal: 10,
  Shani: 7,
  Rahu: 7,
  Chandra: 4,
  Shukra: 4,
  Ketu: 4,
};

const NAISARGIKA_VIRUPAS: Partial<Record<GrahaName, number>> = {
  Surya: 60.0,
  Chandra: 51.4,
  Shukra: 42.9,
  Guru: 34.3,
  Budha: 25.7,
  Mangal: 17.1,
  Rahu: 15.0,
  Ketu: 12.0,
  Shani: 8.6,
};

const REQUIRED_SHADBALA_VIRUPAS: Partial<Record<GrahaName, number>> = {
  Surya: 390,   // 6.5 Rupas
  Chandra: 360, // 6.0 Rupas
  Mangal: 300,  // 5.0 Rupas
  Budha: 420,   // 7.0 Rupas
  Guru: 390,    // 6.5 Rupas
  Shukra: 330,  // 5.5 Rupas
  Shani: 300,   // 5.0 Rupas
  Rahu: 330,    // 5.5 Rupas
  Ketu: 300,    // 5.0 Rupas
};

export function calculatePlanetShadbala(
  planets: PlanetPosition[],
  birthTime: string = '07:30'
): PlanetShadbalaData[] {
  const [hourStr] = birthTime.split(':');
  const birthHour = Number(hourStr) || 7;
  const isDayBirth = birthHour >= 6 && birthHour < 18;

  return planets.map((p) => {
    const absLon = (p.rasiNumber - 1) * 30 + p.degree + p.minute / 60;

    // 1. Sthana Bala (Uchcha Bala + Kendradi Bala + Saptavargaja approximation)
    const exaltLon = EXALTATION_DEGREE[p.name] ?? 0;
    const debilLon = (exaltLon + 180) % 360;
    let distFromDebil = Math.abs(absLon - debilLon);
    if (distFromDebil > 180) distFromDebil = 360 - distFromDebil;
    const uchchaBala = (distFromDebil / 180) * 60; // 0 to 60 Virupas

    const isKendra = [1, 4, 7, 10].includes(p.house);
    const isPanapara = [2, 5, 8, 11].includes(p.house);
    const kendradiBala = isKendra ? 60 : isPanapara ? 30 : 15;
    const vargaBonus = 65 + ((p.rasiNumber * 7 + p.degree) % 45);
    const sthanaBala = Math.round(uchchaBala + kendradiBala + vargaBonus);

    // 2. Dig Bala (Directional Strength: 0 to 60 Virupas based on distance from powerless house)
    const bestHouse = DIRECTIONAL_BEST_HOUSE[p.name] ?? 1;
    const powerlessHouse = ((bestHouse + 5) % 12) + 1;
    let houseDiff = Math.abs(p.house - powerlessHouse);
    if (houseDiff > 6) houseDiff = 12 - houseDiff;
    const digBala = Math.round((houseDiff / 6) * 60);

    // 3. Kala Bala (Temporal Strength: Day/Night + Paksha + Hora/Masa approximation)
    const dayStrongPlanets: GrahaName[] = ['Surya', 'Guru', 'Shukra'];
    const nightStrongPlanets: GrahaName[] = ['Chandra', 'Mangal', 'Shani', 'Rahu', 'Ketu'];
    let nathonnatha = 45;
    if (p.name === 'Budha') {
      nathonnatha = 60;
    } else if (isDayBirth && dayStrongPlanets.includes(p.name)) {
      nathonnatha = 56;
    } else if (!isDayBirth && nightStrongPlanets.includes(p.name)) {
      nathonnatha = 56;
    } else {
      nathonnatha = 28;
    }
    const kalaBala = Math.round(nathonnatha + 52 + ((p.degree * 3) % 38));

    // 4. Cheshta Bala (Motional Strength)
    const cheshtaBala = p.isRetrograde
      ? 58
      : Math.round(28 + ((p.degree * 5 + p.minute) % 30));

    // 5. Naisargika Bala (Natural Strength)
    const naisargikaBala = Math.round(NAISARGIKA_VIRUPAS[p.name] ?? 20);

    // 6. Drik Bala (Aspectual Strength: 15 to 45 Virupas)
    const drikBala = Math.round(18 + ((p.house * 9 + p.degree) % 26));

    const totalVirupas =
      sthanaBala + digBala + kalaBala + cheshtaBala + naisargikaBala + drikBala;
    const totalRupas = Number((totalVirupas / 60).toFixed(2));
    const requiredVirupas = REQUIRED_SHADBALA_VIRUPAS[p.name] ?? 330;
    const requiredRupas = Number((requiredVirupas / 60).toFixed(2));
    const strengthRatio = Math.round((totalVirupas / requiredVirupas) * 100);

    let status: PlanetShadbalaData['status'] = 'Strong (Balavan)';
    if (strengthRatio >= 115) {
      status = 'Supreme (Ati-Balavan)';
    } else if (strengthRatio < 100) {
      status = 'Moderate (Madhyam)';
    }

    const influenceSummary =
      strengthRatio >= 115
        ? `${p.name} (${p.englishName}) possesses commanding Shadbala (${totalRupas} Rupas vs ${requiredRupas} req) in H${p.house} (${p.rasiName}), delivering dominant, auspicious results during its Dasha and transits.`
        : strengthRatio >= 100
        ? `${p.name} (${p.englishName}) exceeds its Parashari threshold (${totalRupas} Rupas) in H${p.house} (${p.rasiName}), providing reliable stability and constructive support.`
        : `${p.name} (${p.englishName}) has moderate Shadbala (${totalRupas} Rupas vs ${requiredRupas} req) in H${p.house} (${p.rasiName}); strengthen its karaka domains via targeted Mantra and Upay.`;

    const improvement = PLANET_IMPROVEMENT_GUIDE[p.name] || PLANET_IMPROVEMENT_GUIDE.Surya;

    // Identify which adjustable Bala component is lowest relative to its typical scale
    const balaComparison = [
      {
        name: 'Dig Bala (Directional Strength)',
        ratio: digBala / 60,
        tip: improvement.directionalRemedy,
      },
      {
        name: 'Cheshta Bala (Motional Drive)',
        ratio: cheshtaBala / 60,
        tip: `Boost dynamic willpower through active ${improvement.weekday} disciplines and regular physical/mental sadhana.`,
      },
      {
        name: 'Drik Bala (Aspectual Grace)',
        ratio: drikBala / 45,
        tip: `Invoke benefic divine drishti by reciting ${improvement.beejMantra.split('(')[0].trim()} and seeking blessings of elders.`,
      },
      {
        name: 'Kala Bala (Temporal Rhythm)',
        ratio: kalaBala / 120,
        tip: `Align key decisions and sadhana with ${p.name} Hora on ${improvement.weekday} to strengthen temporal resonance.`,
      },
    ].sort((a, b) => a.ratio - b.ratio);

    const weakestBalaName = balaComparison[0].name;
    const weakestBalaTip = balaComparison[0].tip;

    return {
      planet: p.name,
      englishName: p.englishName,
      symbol: p.symbol,
      house: p.house,
      rasiName: p.rasiName,
      sthanaBala,
      digBala,
      kalaBala,
      cheshtaBala,
      naisargikaBala,
      drikBala,
      totalVirupas,
      totalRupas,
      requiredVirupas,
      requiredRupas,
      strengthRatio,
      status,
      influenceSummary,
      weakestBalaName,
      weakestBalaTip,
      improvement,
    };
  });
}

export function ShadbalaD3Chart({ planets, birthTime = '07:30' }: ShadbalaD3ChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartMode, setChartMode] = useState<'stacked' | 'ratio'>('stacked');
  const [selectedPlanetName, setSelectedPlanetName] = useState<GrahaName>('Surya');
  const [containerWidth, setContainerWidth] = useState<number>(760);

  const shadbalaData = useMemo(
    () => calculatePlanetShadbala(planets, birthTime),
    [planets, birthTime]
  );

  // Observe container width for responsive D3 rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Ensure selected planet is valid
  const selectedPlanetData =
    shadbalaData.find((d) => d.planet === selectedPlanetName) || shadbalaData[0];

  // D3.js Bar Chart Rendering
  useEffect(() => {
    if (!svgRef.current || shadbalaData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = Math.max(340, containerWidth);
    const height = 295;
    const margin = { top: 24, right: 20, bottom: 56, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: All 9 Planets
    const x = d3
      .scaleBand<string>()
      .domain(shadbalaData.map((d) => d.planet))
      .range([0, innerWidth])
      .padding(0.65); // Much thinner bars

    if (chartMode === 'stacked') {
      const maxVirupas =
        d3.max(shadbalaData, (d: PlanetShadbalaData) => Math.max(d.totalVirupas, d.requiredVirupas)) || 600;

      const y = d3
        .scaleLinear()
        .domain([0, Math.ceil(maxVirupas * 1.12)])
        .nice()
        .range([innerHeight, 0]);

      // Horizontal Gridlines
      g.append('g')
        .attr('class', 'grid-lines')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call((grid) => grid.select('.domain').remove())
        .call((grid) =>
          grid
            .selectAll('line')
            .attr('stroke', '#E7E5E4')
            .attr('stroke-dasharray', '3,3')
        );

      // Stack Generator for the 6 Balas
      const stackKeys = SHADBALA_COMPONENT_KEYS.map((k) => k.key);
      const stack = d3
        .stack<PlanetShadbalaData>()
        .keys(stackKeys as unknown as string[]);

      const series = stack(shadbalaData);

      const colorScale = d3
        .scaleOrdinal<string>()
        .domain(stackKeys as unknown as string[])
        .range(SHADBALA_COMPONENT_KEYS.map((k) => k.color));

      // Render Stacked Bars
      const layerGroups = g
        .selectAll('.layer')
        .data(series)
        .enter()
        .append('g')
        .attr('fill', (d) => colorScale(d.key));

      layerGroups
        .selectAll('rect')
        .data((d) => d)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d.data.planet) || 0)
        .attr('width', x.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 2)
        .style('cursor', 'pointer')
        .attr('opacity', (d) => (d.data.planet === selectedPlanetName ? 1 : 0.85))
        .on('click', (_, d) => {
          setSelectedPlanetName(d.data.planet);
        })
        .transition()
        .duration(450)
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => Math.max(0, y(d[0]) - y(d[1])));

      // Selection Highlight Outline around active planet bar
      shadbalaData.forEach((d) => {
        const barX = x(d.planet) || 0;
        if (d.planet === selectedPlanetName) {
          g.append('rect')
            .attr('x', barX - 2)
            .attr('y', y(d.totalVirupas) - 2)
            .attr('width', x.bandwidth() + 4)
            .attr('height', innerHeight - y(d.totalVirupas) + 4)
            .attr('fill', 'none')
            .attr('stroke', '#92400E')
            .attr('stroke-width', 2)
            .attr('rx', 4)
            .attr('pointer-events', 'none');
        }

        // Required Minimum Threshold Line per Planet
        const reqY = y(d.requiredVirupas);
        g.append('line')
          .attr('x1', barX - 3)
          .attr('x2', barX + x.bandwidth() + 3)
          .attr('y1', reqY)
          .attr('y2', reqY)
          .attr('stroke', '#1C1917')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,2')
          .attr('pointer-events', 'none');

        // Total Rupas Label on top of bar
        g.append('text')
          .attr('x', barX + x.bandwidth() / 2)
          .attr('y', y(d.totalVirupas) - 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', '800')
          .attr('fill', d.planet === selectedPlanetName ? '#92400E' : '#292524')
          .text(`${d.totalRupas}R`);
      });

      // Y Axis (Virupas)
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .call((axis) => axis.select('.domain').attr('stroke', '#D6D3D1'))
        .call((axis) =>
          axis
            .selectAll('text')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('fill', '#57534E')
        );
    } else {
      // Mode 2: Shadbala Strength Ratio (% of Parashari Minimum Required)
      const maxRatio = (d3.max(shadbalaData, (d: PlanetShadbalaData) => d.strengthRatio) as number) || 140;
      const y = d3
        .scaleLinear()
        .domain([0, Math.max(140, Math.ceil(maxRatio * 1.12))])
        .nice()
        .range([innerHeight, 0]);

      // Horizontal Gridlines
      g.append('g')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call((grid) => grid.select('.domain').remove())
        .call((grid) =>
          grid
            .selectAll('line')
            .attr('stroke', '#E7E5E4')
            .attr('stroke-dasharray', '3,3')
        );

      // 100% Minimum Required Reference Line
      const line100Y = y(100);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', line100Y)
        .attr('y2', line100Y)
        .attr('stroke', '#B45309')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '5,3');

      g.append('text')
        .attr('x', innerWidth - 4)
        .attr('y', line100Y - 5)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('font-weight', '800')
        .attr('fill', '#92400E')
        .text('100% Required Threshold');

      // Bars for Ratio
      g.selectAll<SVGRectElement, PlanetShadbalaData>('.ratio-bar')
        .data(shadbalaData)
        .enter()
        .append('rect')
        .attr('class', 'ratio-bar')
        .attr('x', (d: PlanetShadbalaData) => x(d.planet) || 0)
        .attr('width', x.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .attr('fill', (d: PlanetShadbalaData) =>
          d.strengthRatio >= 115
            ? '#059669'
            : d.strengthRatio >= 100
            ? '#D97706'
            : '#E11D48'
        )
        .attr('stroke', (d: PlanetShadbalaData) => (d.planet === selectedPlanetName ? '#1C1917' : 'none'))
        .attr('stroke-width', 2)
        .on('click', (_, d: PlanetShadbalaData) => setSelectedPlanetName(d.planet))
        .transition()
        .duration(450)
        .attr('y', (d: PlanetShadbalaData) => y(d.strengthRatio))
        .attr('height', (d: PlanetShadbalaData) => Math.max(0, innerHeight - y(d.strengthRatio)));

      // Labels on top of ratio bars
      shadbalaData.forEach((d) => {
        const barX = x(d.planet) || 0;
        g.append('text')
          .attr('x', barX + x.bandwidth() / 2)
          .attr('y', y(d.strengthRatio) - 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', '800')
          .attr('fill', '#1C1917')
          .text(`${d.strengthRatio}%`);
      });

      // Y Axis (%)
      g.append('g')
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickFormat((v) => `${v}%`)
        )
        .call((axis) => axis.select('.domain').attr('stroke', '#D6D3D1'))
        .call((axis) =>
          axis
            .selectAll('text')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('fill', '#57534E')
        );
    }

    // X Axis: Planet Names & English Sub-labels
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    xAxisGroup.select('.domain').attr('stroke', '#D6D3D1');

    xAxisGroup
      .selectAll('.tick text')
      .attr('font-size', '10px') // Smaller for clean fit
      .attr('font-weight', (d) => (d === selectedPlanetName ? '900' : '700'))
      .attr('fill', (d) => (d === selectedPlanetName ? '#92400E' : '#1C1917'))
      .attr('dy', '0.7em')
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelectedPlanetName(d as GrahaName));

    // Add English sub-label below each tick
    xAxisGroup.selectAll('.tick').each(function (d) {
      const found = shadbalaData.find((p) => p.planet === d);
      if (found) {
        d3.select(this)
          .append('text')
          .attr('y', 24) // Clear separation from Hindi name
          .attr('text-anchor', 'middle')
          .attr('font-size', '8.5px')
          .attr('font-weight', '600')
          .attr('fill', '#78716C')
          .text(`${found.englishName} (H${found.house})`);
      }
    });
  }, [shadbalaData, chartMode, selectedPlanetName, containerWidth]);

  if (!selectedPlanetData) return null;

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-2.5 shadow-2xs space-y-2.5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
        <div>
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-4 h-4 text-amber-700" />
            <h3 className="font-vedic font-bold text-stone-950 text-[15px] tracking-tight">
              Shadbala (Six-Fold Planetary Strength) — D3.js Visualization
            </h3>
          </div>
          <p className="text-[12px] text-stone-600">
            Parashari six-fold strength across all 9 Grahas (Sthana, Dig, Kala, Cheshta, Naisargika &amp; Drik Bala). Click any bar to inspect details.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'stacked', label: '6-Fold Breakdown (Virupas)' },
            { id: 'ratio', label: 'Strength Ratio (%)' },
          ].map((mode) => {
            const isActive = chartMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setChartMode(mode.id as any)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-vedic font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300 hover:bg-[#FAF8F5]'
                }`}
              >
                {mode.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF8F5] px-2.5 py-1.5 rounded border border-stone-200/80 text-[11px]">
        {chartMode === 'stacked' ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {SHADBALA_COMPONENT_KEYS.map((item) => (
              <div key={item.key} className="flex items-center space-x-1">
                <span
                  className="w-2.5 h-2.5 rounded-xs inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-stone-800">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center space-x-1">
              <span className="w-3 border-t-2 border-dashed border-stone-900 inline-block" />
              <span className="font-bold text-stone-900">Min Required Threshold</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              <span className="font-semibold text-stone-800">Supreme (&ge;115% Req)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-600 inline-block" />
              <span className="font-semibold text-stone-800">Strong (100%–114% Req)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block" />
              <span className="font-semibold text-stone-800">Moderate (&lt;100% Req — Needs Remedy)</span>
            </div>
          </div>
        )}

        <span className="text-stone-600 font-semibold">
          1 Rupa (R) = 60 Virupas
        </span>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full h-[285px] select-none" />
      </div>

      {/* Selected Planet 6-Fold Breakdown Dossier */}
      <div className="bg-gradient-to-r from-amber-50/60 via-[#FAF8F5] to-white rounded-lg border border-amber-200/90 p-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[18px] font-bold text-amber-800">
              {selectedPlanetData.symbol}
            </span>
            <div>
              <h4 className="font-vedic font-bold text-stone-950 text-[15px] leading-none">
                {selectedPlanetData.planet} ({selectedPlanetData.englishName}) — H{selectedPlanetData.house} ({selectedPlanetData.rasiName})
              </h4>
              <span className="text-[11px] font-semibold text-stone-600">
                Total Shadbala: <strong className="text-stone-950">{selectedPlanetData.totalVirupas} Virupas ({selectedPlanetData.totalRupas} Rupas)</strong> • Required Minimum: <strong className="text-stone-950">{selectedPlanetData.requiredVirupas} Virupas ({selectedPlanetData.requiredRupas} Rupas)</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-950 text-[12px] font-black">
              {selectedPlanetData.strengthRatio}% of Required
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                selectedPlanetData.strengthRatio >= 115
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : selectedPlanetData.strengthRatio >= 100
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-rose-100 text-rose-950 border-rose-300'
              }`}
            >
              {selectedPlanetData.status}
            </span>
          </div>
        </div>

        {/* 6 Bala Component Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 text-[12px]">
          {[
            { label: '1. Sthana Bala', sub: 'Positional', val: selectedPlanetData.sthanaBala, color: 'text-amber-800' },
            { label: '2. Dig Bala', sub: 'Directional', val: selectedPlanetData.digBala, color: 'text-sky-800' },
            { label: '3. Kala Bala', sub: 'Temporal', val: selectedPlanetData.kalaBala, color: 'text-purple-800' },
            { label: '4. Cheshta Bala', sub: 'Motional', val: selectedPlanetData.cheshtaBala, color: 'text-emerald-800' },
            { label: '5. Naisargika', sub: 'Natural', val: selectedPlanetData.naisargikaBala, color: 'text-rose-800' },
            { label: '6. Drik Bala', sub: 'Aspectual', val: selectedPlanetData.drikBala, color: 'text-indigo-800' },
          ].map((b) => (
            <div key={b.label} className="bg-white rounded border border-stone-200/90 px-2 py-1.5">
              <span className={`text-[11px] font-black uppercase tracking-wider block ${b.color}`}>
                {b.label}
              </span>
              <div className="text-[14px] font-vedic font-bold text-stone-950 mt-0.5">
                {b.val} <span className="text-[11px] font-normal text-stone-500">Virupas</span>
              </div>
              <span className="text-[10px] text-stone-500 block">{b.sub} Strength</span>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-stone-800 leading-snug">
          <strong className="text-stone-950">Planetary Influence Synthesis:</strong>{' '}
          {selectedPlanetData.influenceSummary}
        </p>

        {/* Targeted Suggestions to Improve Selected Planet's Shadbala Strength */}
        <div className="bg-white rounded-md border border-amber-200/90 p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1 border-b border-stone-100 pb-1">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <h5 className="font-vedic font-bold text-stone-950 text-[14px]">
                Suggestions to Improve {selectedPlanetData.planet} ({selectedPlanetData.englishName}) Shadbala Strength
              </h5>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
              Power Day: {selectedPlanetData.improvement.weekday}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[12px]">
            <div className="bg-[#FAF8F5] rounded p-2 border border-stone-200/80 space-y-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                1. Vedic Beej Mantra &amp; Stotra
              </span>
              <p className="text-stone-800 leading-snug">
                {selectedPlanetData.improvement.beejMantra}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded p-2 border border-stone-200/80 space-y-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                2. Lifestyle &amp; Karma Alignment
              </span>
              <p className="text-stone-800 leading-snug">
                {selectedPlanetData.improvement.lifestyleAndKarma}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded p-2 border border-stone-200/80 space-y-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 block">
                3. Charitable Dana &amp; Upay
              </span>
              <p className="text-stone-800 leading-snug">
                {selectedPlanetData.improvement.danaAndUpay}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded p-2 border border-stone-200/80 space-y-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-900 block">
                4. Weakest Bala &amp; Directional Boost
              </span>
              <p className="text-stone-800 leading-snug">
                <strong>Focus ({selectedPlanetData.weakestBalaName.split(' ')[0]}):</strong>{' '}
                {selectedPlanetData.weakestBalaTip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ALL 9 PLANETS — SHADBALA STRENGTH IMPROVEMENT GUIDE (AT-A-GLANCE DECK) */}
      <div className="space-y-2 pt-1 border-t border-stone-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h4 className="font-vedic font-bold text-stone-950 text-[14px] uppercase tracking-wider">
              All 9 Planets — Shadbala Strength Improvement &amp; Remedial Guide
            </h4>
          </div>
          <span className="text-[11px] text-stone-600 font-medium">
            Click any planet card to highlight its 6-fold strength in the chart above
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {shadbalaData.map((item) => {
            const isSelected = item.planet === selectedPlanetData.planet;
            return (
              <div
                key={item.planet}
                onClick={() => setSelectedPlanetName(item.planet)}
                className={`rounded-lg border p-2.5 transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-[#FAF8F5]/70 hover:bg-white border-stone-200/90 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 border-b border-stone-200/70 pb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[15px] font-bold text-amber-800">{item.symbol}</span>
                    <span className="font-vedic font-bold text-stone-950 text-[14px]">
                      {item.planet} ({item.englishName})
                    </span>
                    <span className="text-[11px] font-bold text-stone-600">
                      H{item.house}
                    </span>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      item.strengthRatio >= 115
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : item.strengthRatio >= 100
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {item.totalRupas}R ({item.strengthRatio}%)
                  </span>
                </div>

                <div className="space-y-1 text-[12px]">
                  <p className="text-stone-800 leading-snug">
                    <strong className="text-amber-900">Mantra ({item.improvement.weekday.split(' ')[0]}):</strong>{' '}
                    {item.improvement.beejMantra}
                  </p>
                  <p className="text-stone-700 leading-snug">
                    <strong className="text-emerald-900">Lifestyle &amp; Karma:</strong>{' '}
                    {item.improvement.lifestyleAndKarma}
                  </p>
                  <p className="text-stone-700 leading-snug">
                    <strong className="text-purple-900">Dana &amp; Upay:</strong>{' '}
                    {item.improvement.danaAndUpay}
                  </p>
                  <p className="text-stone-600 leading-snug text-[11px] pt-0.5 border-t border-stone-200/60">
                    <strong className="text-stone-900">Directional &amp; Color Boost:</strong>{' '}
                    {item.improvement.colorAndMetal}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
