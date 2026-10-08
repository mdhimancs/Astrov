import React, { useState, useMemo } from 'react';
import {
  Globe,
  Sparkles,
  Compass,
  Zap,
  Layers,
  Eye,
  Info,
  Maximize2,
  RefreshCw,
  Star,
  Activity,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { PlanetPosition, UserProfile, GrahaName } from '../types';
import { VEDIC_RASIS, NAKSHATRAS } from '../data';
import { getFixedStarForNakshatra, NAKSHATRA_ASTRONOMICAL_DATA } from '../utils/ephemerisHelper';
import { getPlanetDirectionInfo, getRasiDirection } from '../utils/planetDirection';

interface CelestialSkyMapWheelProps {
  livePlanets: PlanetPosition[];
  natalPlanets?: PlanetPosition[];
  lagnaRasi?: number;
  seekerName?: string;
  locationName?: string;
}

export function CelestialSkyMapWheel({
  livePlanets,
  natalPlanets = [],
  lagnaRasi = 1,
  seekerName = 'Seeker',
  locationName = 'Observation Location',
}: CelestialSkyMapWheelProps) {
  const [wheelMode, setWheelMode] = useState<'live' | 'natal' | 'dual'>('live');
  const [selectedGraha, setSelectedGraha] = useState<GrahaName | 'Lagna' | null>(null);
  const [hoveredNakshatra, setHoveredNakshatra] = useState<number | null>(null); // 1-27
  const [showAspectLines, setShowAspectLines] = useState<boolean>(true);
  const [showMotionPaths, setShowMotionPaths] = useState<boolean>(true);

  // SVG Center & Radii (Scaled up by 10% from 600 to 660)
  const size = 660;
  const center = size / 2;
  const rOuterBorder = 315;
  const rNakshatraOuter = 310;
  const rNakshatraInner = 250;
  const rRasiOuter = 250;
  const rRasiInner = 195;
  const rPlanetOuter = 168;
  const rPlanetInner = 112;
  const rCenterHub = 50;

  // Converts 0-360 degrees (0° = Mesha 0°) to SVG polar coordinates
  const degToXY = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);
    return { x, y };
  };

  // Helper to construct arc path
  const describeArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startOuter = degToXY(startAngle, outerR);
    const endOuter = degToXY(endAngle, outerR);
    const startInner = degToXY(startAngle, innerR);
    const endInner = degToXY(endAngle, innerR);

    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');
  };

  // Currently displayed planets array
  const activePlanetsList = useMemo(() => {
    if (wheelMode === 'natal' && natalPlanets.length > 0) return natalPlanets;
    return livePlanets;
  }, [wheelMode, natalPlanets, livePlanets]);

  // Active highlighted detail
  const activeDetailPlanet = useMemo(() => {
    if (!selectedGraha) return activePlanetsList[0] || livePlanets[0];
    return activePlanetsList.find((p) => p.name === selectedGraha) || activePlanetsList[0];
  }, [selectedGraha, activePlanetsList, livePlanets]);

  const activeFixedStar = activeDetailPlanet
    ? getFixedStarForNakshatra(activeDetailPlanet.nakshatra)
    : null;

  // Light color theme planet palette optimized for bright backgrounds
  const getGrahaColor = (name: string) => {
    switch (name) {
      case 'Surya': return { bg: '#F59E0B', text: '#451A03', line: '#D97706' }; // Gold
      case 'Chandra': return { bg: '#0284C7', text: '#FFFFFF', line: '#0284C7' }; // Sky
      case 'Mangal': return { bg: '#DC2626', text: '#FFFFFF', line: '#DC2626' }; // Red
      case 'Budha': return { bg: '#059669', text: '#FFFFFF', line: '#059669' }; // Emerald
      case 'Guru': return { bg: '#CA8A04', text: '#FFFFFF', line: '#CA8A04' }; // Amber
      case 'Shukra': return { bg: '#DB2777', text: '#FFFFFF', line: '#DB2777' }; // Pink
      case 'Shani': return { bg: '#4F46E5', text: '#FFFFFF', line: '#4F46E5' }; // Indigo
      case 'Rahu': return { bg: '#7C3AED', text: '#FFFFFF', line: '#7C3AED' }; // Purple
      case 'Ketu': return { bg: '#475569', text: '#FFFFFF', line: '#475569' }; // Slate
      case 'Lagna': return { bg: '#B45309', text: '#FFFFFF', line: '#B45309' }; // Orange
      default: return { bg: '#B45309', text: '#FFFFFF', line: '#B45309' };
    }
  };

  return (
    <div className="bg-white/95 rounded-xl border border-amber-200/90 p-4 text-stone-900 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-full bg-amber-100 text-amber-700 border border-amber-300 shadow-2xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-vedic font-black text-stone-900 text-[16px] uppercase tracking-wide">
              360° Graphical Celestial Wheel &amp; Planet Sky Map (+10% Larger)
            </h3>
            <p className="text-[12px] text-stone-600">
              Sidereal longitudes, full 27 Nakshatras, direct (→) &amp; retrograde (←) vectors, and planetary drishti aspects
            </p>
          </div>
        </div>

        {/* Wheel Mode Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-stone-100 border border-amber-200 rounded-lg p-1 flex items-center space-x-1 text-[12px] shadow-2xs">
            <button
              type="button"
              onClick={() => setWheelMode('live')}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                wheelMode === 'live'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Live Sky
            </button>
            {natalPlanets.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setWheelMode('natal')}
                  className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                    wheelMode === 'natal'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Natal Wheel ({seekerName})
                </button>
                <button
                  type="button"
                  onClick={() => setWheelMode('dual')}
                  className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                    wheelMode === 'dual'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Dual Overlay
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAspectLines(!showAspectLines)}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-[12px] flex items-center space-x-1.5 font-bold shadow-2xs ${
              showAspectLines
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-700'
            }`}
            title="Toggle Planetary Drishti / Aspect Lines"
          >
            <Activity className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Aspects</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMotionPaths(!showMotionPaths)}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-[12px] flex items-center space-x-1.5 font-bold shadow-2xs ${
              showMotionPaths
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-700'
            }`}
            title="Toggle Animated Planetary Motion Paths & Direction Vectors"
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Motion Paths</span>
          </button>
        </div>
      </div>

      {/* Main Wheel View & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* SVG Graphic Map Column - Light Aesthetic Background */}
        <div className="lg:col-span-8 flex justify-center items-center relative overflow-hidden bg-[#FFFCF7] rounded-2xl border border-amber-300/70 p-3 shadow-inner">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[620px] max-h-[620px] aspect-square select-none drop-shadow-sm"
          >
            <defs>
              <radialGradient id="hubLightGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFBF0" />
                <stop offset="100%" stopColor="#F3E8D3" />
              </radialGradient>
              <radialGradient id="wheelLightBgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFDF9" />
                <stop offset="100%" stopColor="#F7F1E5" />
              </radialGradient>
              <style>{`
                @keyframes orbitDashLight {
                  0% { stroke-dashoffset: 40; opacity: 0.4; }
                  50% { stroke-dashoffset: 0; opacity: 0.95; }
                  100% { stroke-dashoffset: -40; opacity: 0.4; }
                }
                @keyframes vectorPulseLight {
                  0% { transform: scale(1); opacity: 0.7; }
                  50% { transform: scale(1.3); opacity: 1; }
                  100% { transform: scale(1); opacity: 0.7; }
                }
                .animated-orbit-path-light {
                  animation: orbitDashLight 4s linear infinite;
                }
                .direction-indicator-arrow-light {
                  animation: vectorPulseLight 2.5s ease-in-out infinite;
                  transform-origin: center;
                }
              `}</style>
            </defs>

            {/* Background Base */}
            <circle cx={center} cy={center} r={rOuterBorder} fill="url(#wheelLightBgGrad)" stroke="#D97706" strokeWidth="2.5" />

            {/* 1. OUTER RING: 27 NAKSHATRAS (Full Names with Rotation) */}
            {NAKSHATRAS.map((nak, idx) => {
              const startAngle = idx * 13.333333;
              const endAngle = (idx + 1) * 13.333333;
              const midAngle = startAngle + 6.666666;
              const isHovered = hoveredNakshatra === idx + 1;
              const nakNumber = idx + 1;

              const arcPath = describeArc(startAngle, endAngle, rNakshatraInner, rNakshatraOuter);
              const labelPos = degToXY(midAngle, (rNakshatraOuter + rNakshatraInner) / 2);
              // Calculate text rotation so text is always readable (not upside down)
              const rotAngle = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;

              return (
                <g key={nak.name} onMouseEnter={() => setHoveredNakshatra(nakNumber)} onMouseLeave={() => setHoveredNakshatra(null)}>
                  <path
                    d={arcPath}
                    fill={isHovered ? '#FED7AA' : idx % 2 === 0 ? '#FAF6ED' : '#F3ECE1'}
                    stroke="#E7D5B8"
                    strokeWidth="1"
                    className="transition-colors cursor-pointer"
                  />
                  {/* Radial Divider */}
                  {(() => {
                    const lineStart = degToXY(startAngle, rNakshatraInner);
                    const lineEnd = degToXY(startAngle, rNakshatraOuter);
                    return <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="#D97706" strokeWidth="1" opacity="0.4" />;
                  })()}

                  {/* Nakshatra Full Name Label with Increased Font & Word Wrap */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={isHovered ? '#78350F' : '#451A03'}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${rotAngle}, ${labelPos.x}, ${labelPos.y})`}
                    className="pointer-events-none"
                  >
                    {(() => {
                      const parts = nak.name.split(' ');
                      if (parts.length > 1) {
                        return (
                          <>
                            <tspan x={labelPos.x} dy="-5">{parts[0]}</tspan>
                            <tspan x={labelPos.x} dy="11">{parts[1]}</tspan>
                          </>
                        );
                      }
                      return nak.name;
                    })()}
                  </text>
                </g>
              );
            })}

            {/* 2. MIDDLE RING: 12 SIDEREAL RASIS (30° each) */}
            {VEDIC_RASIS.map((rasi, idx) => {
              const startAngle = idx * 30;
              const endAngle = (idx + 1) * 30;
              const midAngle = startAngle + 15;

              const arcPath = describeArc(startAngle, endAngle, rRasiInner, rRasiOuter);
              const labelPos = degToXY(midAngle, (rRasiOuter + rRasiInner) / 2);
              const isLagnaRasi = lagnaRasi === rasi.number;

              return (
                <g key={rasi.number}>
                  <path
                    d={arcPath}
                    fill={isLagnaRasi ? '#FEF3C7' : idx % 2 === 0 ? '#FEF9EC' : '#F7F0E3'}
                    stroke="#D97706"
                    strokeWidth="1.5"
                  />
                  {/* Rasi Boundary Radial Line */}
                  {(() => {
                    const lineStart = degToXY(startAngle, rRasiInner);
                    const lineEnd = degToXY(startAngle, rRasiOuter);
                    return <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="#B45309" strokeWidth="2" opacity="0.8" />;
                  })()}

                  {/* Rasi Name with Word Wrap */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={isLagnaRasi ? '#78350F' : '#92400E'}
                    fontSize="10.5"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none"
                  >
                    <tspan x={labelPos.x} dy="-5">{rasi.sanskritName}</tspan>
                    <tspan x={labelPos.x} dy="12">({rasi.westernEquivalent.slice(0, 3)})</tspan>
                  </text>
                </g>
              );
            })}

            {/* Concentric Circle Separators */}
            <circle cx={center} cy={center} r={rNakshatraOuter} fill="none" stroke="#B45309" strokeWidth="2" />
            <circle cx={center} cy={center} r={rNakshatraInner} fill="none" stroke="#D97706" strokeWidth="2" />
            <circle cx={center} cy={center} r={rRasiInner} fill="none" stroke="#B45309" strokeWidth="2" />
            <circle cx={center} cy={center} r={rPlanetInner} fill="none" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* 3. PLANETARY DRISHTI / ASPECT LINES */}
            {showAspectLines && activePlanetsList.length > 1 && (
              <g opacity="0.75">
                {activePlanetsList.map((p1, idx1) => {
                  return activePlanetsList.slice(idx1 + 1).map((p2) => {
                    const deg1 = p1.totalDeg || 0;
                    const deg2 = p2.totalDeg || 0;
                    const diff = Math.abs(deg1 - deg2) % 360;
                    const angleDiff = diff > 180 ? 360 - diff : diff;

                    let aspectColor = '';
                    if (Math.abs(angleDiff - 180) < 6) aspectColor = '#DC2626'; // Opposition (Red)
                    else if (Math.abs(angleDiff - 120) < 6) aspectColor = '#059669'; // Trine (Emerald)
                    else if (Math.abs(angleDiff - 90) < 6) aspectColor = '#D97706'; // Square (Amber)

                    if (!aspectColor) return null;

                    const pos1 = degToXY(deg1, rPlanetOuter - 18);
                    const pos2 = degToXY(deg2, rPlanetOuter - 18);

                    return (
                      <line
                        key={`${p1.name}-${p2.name}`}
                        x1={pos1.x}
                        y1={pos1.y}
                        x2={pos2.x}
                        y2={pos2.y}
                        stroke={aspectColor}
                        strokeWidth="1.8"
                        strokeDasharray={angleDiff === 180 ? 'none' : '4 4'}
                      />
                    );
                  });
                })}
              </g>
            )}

            {/* ANIMATED PLANETARY MOTION PATHS & DIRECTIONAL VECTORS (→ Direct or ← Retrograde) */}
            {showMotionPaths && activePlanetsList.map((p) => {
              const deg = p.totalDeg || 0;
              const colors = getGrahaColor(p.name);
              const trailSpan = 18;
              // If retrograde, motion path points backward (counter-clockwise/decreasing), else forward (increasing)
              const startDeg = p.isRetrograde ? deg : deg - trailSpan;
              const endDeg = p.isRetrograde ? deg + trailSpan : deg;
              const pathArc = describeArc(startDeg, endDeg, rPlanetInner + 10, rPlanetOuter - 10);

              const aheadDeg = p.isRetrograde ? deg - 6 : deg + 6;
              const vectorPos = degToXY(aheadDeg, (rPlanetInner + rPlanetOuter) / 2);
              const isSelected = selectedGraha === p.name;

              return (
                <g key={`motion-${p.name}`}>
                  <path
                    d={pathArc}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth={isSelected ? '3' : '1.8'}
                    strokeDasharray="5 5"
                    opacity="0.85"
                    className="animated-orbit-path-light pointer-events-none"
                  />
                  <circle
                    cx={vectorPos.x}
                    cy={vectorPos.y}
                    r={isSelected ? '5' : '3.5'}
                    fill={p.isRetrograde ? '#DC2626' : colors.line}
                    stroke="#FFFBF0"
                    strokeWidth="1.5"
                    className="direction-indicator-arrow-light pointer-events-none"
                  />
                </g>
              );
            })}

            {/* 4. PLANETARY NODES & MARKERS WITH DIRECTION ARROWS */}
            {wheelMode === 'dual' && livePlanets.map((p) => {
              const deg = p.totalDeg || 0;
              const pos = degToXY(deg, rRasiInner + 20);
              const colors = getGrahaColor(p.name);
              const isSelected = selectedGraha === p.name;

              return (
                <g key={`live-${p.name}`} onClick={() => setSelectedGraha(p.name as any)} className="cursor-pointer">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 12 : 10}
                    fill={colors.bg}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    fill={colors.text}
                    fontSize="9.5"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {p.symbol}
                  </text>
                </g>
              );
            })}

            {/* Draw Primary Selected Planets (Live or Natal) */}
            {activePlanetsList.map((p) => {
              const deg = p.totalDeg || 0;
              const planetR = wheelMode === 'dual' ? rPlanetOuter - 22 : rPlanetOuter;
              const nodePos = degToXY(deg, planetR);
              const pointerPos = degToXY(deg, rRasiInner);
              const colors = getGrahaColor(p.name);
              const isSelected = selectedGraha === p.name || (!selectedGraha && p.name === 'Surya');

              return (
                <g key={`primary-${p.name}`} onClick={() => setSelectedGraha(p.name as any)} className="cursor-pointer">
                  {/* Leader line pointing to exact degree on rasi inner ring */}
                  <line
                    x1={nodePos.x}
                    y1={nodePos.y}
                    x2={pointerPos.x}
                    y2={pointerPos.y}
                    stroke={colors.line}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    opacity="0.9"
                  />

                  {/* Planet Node Circle */}
                  <circle
                    cx={nodePos.x}
                    cy={nodePos.y}
                    r={isSelected ? '16' : '13'}
                    fill={colors.bg}
                    stroke={isSelected ? '#78350F' : '#FFFFFF'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                    className="transition-all shadow-sm"
                  />

                  {/* Symbol */}
                  <text
                    x={nodePos.x}
                    y={nodePos.y}
                    fill={colors.text}
                    fontSize={isSelected ? '13' : '11'}
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {p.symbol}
                  </text>

                  {/* Direction Arrow Badge (→ or ←) */}
                  <g transform={`translate(${nodePos.x + 12}, ${nodePos.y - 12})`}>
                    <circle r="8" fill={p.isRetrograde ? '#FEE2E2' : '#FEF3C7'} stroke={p.isRetrograde ? '#DC2626' : '#D97706'} strokeWidth="1.5" />
                    <text
                      fill={p.isRetrograde ? '#DC2626' : '#92400E'}
                      fontSize="9"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {p.isRetrograde ? '←' : '→'}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Center Focal Hub */}
            <circle cx={center} cy={center} r={rCenterHub} fill="url(#hubLightGrad)" stroke="#B45309" strokeWidth="2.5" />
            <text x={center} y={center - 8} fill="#78350F" fontSize="13" fontWeight="900" textAnchor="middle">
              ASTROV
            </text>
            <text x={center} y={center + 8} fill="#92400E" fontSize="10" fontWeight="bold" textAnchor="middle">
              360° SKY MAP
            </text>
          </svg>
        </div>

        {/* Selected Planet Sky Inspector Panel Column - Light Aesthetic */}
        <div className="lg:col-span-4 bg-[#FAF7F0] rounded-2xl border border-amber-300/80 p-4 space-y-3 shadow-sm">
          {activeDetailPlanet ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[15px] shadow-sm"
                    style={{
                      backgroundColor: getGrahaColor(activeDetailPlanet.name).bg,
                      color: getGrahaColor(activeDetailPlanet.name).text,
                    }}
                  >
                    {activeDetailPlanet.symbol}
                  </span>
                  <div>
                    <h4 className="font-vedic font-black text-stone-900 text-[16px] leading-tight">
                      {activeDetailPlanet.name} ({activeDetailPlanet.englishName})
                    </h4>
                    <span className="text-[11px] text-amber-800 font-semibold">
                      {wheelMode === 'natal' ? `Natal (${seekerName})` : 'Live Astronomical Positioning'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {activeDetailPlanet.isRetrograde ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-black uppercase flex items-center space-x-1">
                      <span>← Vakri (Retrograde)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase flex items-center space-x-1">
                      <span>→ Direct Motion</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Exact Coordinates Grid */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="bg-white rounded-lg p-2.5 border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Sidereal Sign</span>
                  <div className="font-bold text-stone-900 text-[13.5px]">{activeDetailPlanet.rasiName}</div>
                  <div className="text-[11px] text-stone-600">
                    {activeDetailPlanet.degree}° {activeDetailPlanet.minute}&apos;
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Longitude &amp; Motion</span>
                  <div className="font-bold text-stone-900 text-[13.5px] font-mono flex items-center space-x-1.5">
                    <span>{Math.round((activeDetailPlanet.totalDeg || 0) * 100) / 100}°</span>
                    <span className={`text-[12px] font-black px-1.5 py-0.2 rounded ${activeDetailPlanet.isRetrograde ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>
                      {activeDetailPlanet.isRetrograde ? '← Retrograde' : '→ Direct'}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600">0° Mesha Datum</div>
                </div>
              </div>

              {/* Nakshatra & Fixed Star Box */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">
                    Nakshatra: <strong className="text-amber-900">{activeDetailPlanet.nakshatra}</strong>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Pada {activeDetailPlanet.pada}
                  </span>
                </div>

                <div className="text-[11.5px] text-stone-700 flex items-center justify-between pt-1.5 border-t border-amber-200/60">
                  <span>Nakshatra Lord: <strong className="text-stone-900">{activeDetailPlanet.nakshatraLord || '—'}</strong></span>
                  <span>KP Sub-Lord: <strong className="text-amber-800">{activeDetailPlanet.subLord || '—'}</strong></span>
                </div>

                {activeFixedStar && (
                  <div className="bg-white/90 rounded-lg p-2 border border-amber-200 text-[11.5px] space-y-1 shadow-2xs">
                    <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Astronomical Fixed Star:</span>
                    </div>
                    <p className="text-stone-900 font-semibold">
                      {activeFixedStar.fixedStar} ({activeFixedStar.constellation})
                    </p>
                    <p className="text-[10.5px] text-stone-600">
                      Deity: {activeFixedStar.deity}
                    </p>
                  </div>
                )}

                {/* Planetary Direction & Digbala Info */}
                {(() => {
                  const dirInfo = getPlanetDirectionInfo(activeDetailPlanet.name);
                  const rasiDir = getRasiDirection(activeDetailPlanet.rasiNumber);
                  return (
                    <div className="bg-white rounded-lg p-2.5 border border-amber-200 text-[11.5px] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-amber-900 font-bold border-b border-amber-200 pb-1">
                        <div className="flex items-center space-x-1.5">
                          <Compass className="w-4 h-4 text-amber-600" />
                          <span>Planetary Direction &amp; Digbala:</span>
                        </div>
                        <span className="text-[10px] text-amber-800 font-extrabold uppercase">
                          {dirInfo.compassDirection} ({dirInfo.sanskritDirection})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
                        <div>
                          <span className="text-stone-500 text-[10px]">Sign Direction:</span>
                          <div className="font-bold text-stone-900">{rasiDir.direction}</div>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[10px]">Digbala (Direction Strength):</span>
                          <div className="font-bold text-amber-800">House {dirInfo.digbalaHouse} ({dirInfo.digbalaDirection})</div>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-stone-600 italic pt-0.5">
                        {dirInfo.description}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Quick Planet Selector Buttons */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[10.5px] font-black uppercase text-amber-800 tracking-wider block">
                  Select Planet on Map:
                </span>
                <div className="flex flex-wrap gap-1">
                  {activePlanetsList.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setSelectedGraha(p.name as any)}
                      className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold cursor-pointer transition-all border flex items-center space-x-1 ${
                        selectedGraha === p.name
                          ? 'bg-amber-600 text-white border-amber-700 font-black shadow-xs'
                          : 'bg-white text-stone-800 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <span>{p.symbol}</span>
                      <span>{p.name}</span>
                      <span className={`text-[10px] font-black ml-0.5 ${p.isRetrograde ? 'text-rose-600' : 'text-amber-600'}`}>
                        {p.isRetrograde ? '←' : '→'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-500 text-[12px] italic">
              Click any planet node on the 360° sky map to inspect its astronomical coordinates.
            </div>
          )}
        </div>
      </div>

      {/* Chart Motion & Dot Movement Explanation Legend */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-[11.5px] text-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-900 font-bold block mb-0.5">Understanding Celestial Dot Movement &amp; Direction Vectors:</strong>
            <p className="text-stone-600 leading-relaxed">
              The animated orbiting dots and dashed arcs depict real-time transit trajectories across the 360° sidereal zodiac.
              <span className="font-bold text-amber-800 ml-1">→ Direct (Forward)</span> indicates standard progression through zodiac signs, while
              <span className="font-bold text-rose-700 ml-1">← Retrograde / Vakri</span> indicates apparent backward motion due to Earth&apos;s relative orbital perspective.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0 text-[11px] font-semibold text-stone-600">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span>Direct (→)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Retrograde (←)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
