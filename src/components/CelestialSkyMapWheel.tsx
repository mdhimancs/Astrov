import React, { useState, useMemo } from 'react';
import {
  Globe,
  Compass,
  Layers,
  Info,
  Maximize2,
  Minimize2,
  Star,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sun,
  Moon,
  Shield,
  Zap,
} from 'lucide-react';
import { PlanetPosition, GrahaName } from '../types';
import { VEDIC_RASIS, NAKSHATRAS, BHAVA_DETAILS } from '../data';
import { getFixedStarForNakshatra } from '../utils/ephemerisHelper';
import { getPlanetDirectionInfo, getRasiDirection } from '../utils/planetDirection';

interface CelestialSkyMapWheelProps {
  livePlanets: PlanetPosition[];
  natalPlanets?: PlanetPosition[];
  lagnaRasi?: number;
  seekerName?: string;
  locationName?: string;
}

// Element styling definitions for 12 Rasis
const RASI_ELEMENT_STYLES: Record<string, { bg: string; border: string; text: string; lightBg: string; glyphColor: string }> = {
  'Agni (Fire)': { bg: '#FEF2F2', border: '#F87171', text: '#991B1B', lightBg: '#FFF5F5', glyphColor: '#DC2626' },
  'Prithvi (Earth)': { bg: '#FEFCE8', border: '#FACC15', text: '#854D0E', lightBg: '#FFFDF0', glyphColor: '#CA8A04' },
  'Vayu (Air)': { bg: '#F0FDF4', border: '#4ADE80', text: '#166534', lightBg: '#F6FEF8', glyphColor: '#16A34A' },
  'Jala (Water)': { bg: '#EFF6FF', border: '#60A5FA', text: '#1E40AF', lightBg: '#F4F9FF', glyphColor: '#2563EB' },
};

export function CelestialSkyMapWheel({
  livePlanets,
  natalPlanets = [],
  lagnaRasi = 1,
  locationName = 'Observation Location',
}: CelestialSkyMapWheelProps) {
  const [wheelMode, setWheelMode] = useState<'live' | 'natal' | 'dual'>('live');
  const [selectedGraha, setSelectedGraha] = useState<GrahaName | 'Lagna' | null>(null);
  const [hoveredNakshatra, setHoveredNakshatra] = useState<number | null>(null); // 1-27
  const [hoveredRasi, setHoveredRasi] = useState<number | null>(null); // 1-12
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // Visibility Toggles for Layers
  const [showAspectLines, setShowAspectLines] = useState<boolean>(true);
  const [showMotionPaths, setShowMotionPaths] = useState<boolean>(true);
  const [showHouseBhavas, setShowHouseBhavas] = useState<boolean>(true);
  const [showDegreeTicks, setShowDegreeTicks] = useState<boolean>(true);
  const [showNakshatras, setShowNakshatras] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // SVG Center & Proportional Geometry for High-Resolution ViewBox
  const size = 760;
  const center = size / 2;

  // Concentric Radial Bands
  const rOuterRim = 368;
  const rDegreeTicksOuter = 366;
  const rDegreeTicksInner = 352;
  const rNakshatraOuter = 350;
  const rNakshatraInner = 286;
  const rRasiOuter = 284;
  const rRasiInner = 216;
  const rHouseInner = 216;
  const rPlanetBase = 168;
  const rPlanetInnerLimit = 95;
  const rCenterHub = 62;

  // Converts 0-360 degrees (0° = Mesha 0° at 12 o'clock / top) to SVG polar coordinates
  const degToXY = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);
    return { x, y };
  };

  // Helper to construct circular sector arc path
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

  // Currently displayed primary planets array
  const activePlanetsList = useMemo(() => {
    if (wheelMode === 'natal' && natalPlanets.length > 0) return natalPlanets;
    return livePlanets;
  }, [wheelMode, natalPlanets, livePlanets]);

  // Active highlighted detail planet
  const activeDetailPlanet = useMemo(() => {
    const target = selectedGraha || hoveredPlanet;
    if (target) {
      const found = activePlanetsList.find((p) => p.name === target);
      if (found) return found;
      if (wheelMode === 'dual') {
        const foundLive = livePlanets.find((p) => p.name === target);
        if (foundLive) return foundLive;
      }
    }
    return activePlanetsList[0] || livePlanets[0] || null;
  }, [selectedGraha, hoveredPlanet, activePlanetsList, livePlanets, wheelMode]);

  const activeFixedStar = activeDetailPlanet
    ? getFixedStarForNakshatra(activeDetailPlanet.nakshatra)
    : null;

  // Collision avoidance & radial tiering algorithm for conjunct planets
  const positionedPlanets = useMemo(() => {
    if (activePlanetsList.length === 0) return [];

    // Sort by absolute degree
    const sorted = [...activePlanetsList].sort((a, b) => (a.totalDeg || 0) - (b.totalDeg || 0));

    // Group close planets into clusters within 10 degrees of each other
    const clusters: PlanetPosition[][] = [];
    let currentCluster: PlanetPosition[] = [];

    sorted.forEach((planet, idx) => {
      if (idx === 0) {
        currentCluster.push(planet);
      } else {
        const prev = sorted[idx - 1];
        const diff = Math.abs((planet.totalDeg || 0) - (prev.totalDeg || 0));
        const circularDiff = diff > 180 ? 360 - diff : diff;

        if (circularDiff < 10) {
          currentCluster.push(planet);
        } else {
          clusters.push(currentCluster);
          currentCluster = [planet];
        }
      }
    });
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // Check circular wrap-around between last and first
    if (clusters.length > 1) {
      const first = clusters[0][0];
      const last = clusters[clusters.length - 1][clusters[clusters.length - 1].length - 1];
      const wrapDiff = Math.abs((last.totalDeg || 0) - (first.totalDeg || 0));
      const circularWrap = wrapDiff > 180 ? 360 - wrapDiff : wrapDiff;
      if (circularWrap < 10) {
        const lastCluster = clusters.pop()!;
        clusters[0] = [...lastCluster, ...clusters[0]];
      }
    }

    // Assign staggered radii to each planet based on its cluster position
    const result: Array<PlanetPosition & { displayRadius: number; clusterSize: number; clusterRank: number }> = [];

    clusters.forEach((cluster) => {
      const count = cluster.length;
      cluster.forEach((planet, rank) => {
        let r = rPlanetBase;
        if (wheelMode === 'dual') {
          // In dual mode, primary (natal) sits on inner sub-track
          const offsets = [0, -22, 22, -40];
          r = 138 + (offsets[rank % offsets.length] || 0);
        } else {
          if (count === 2) {
            r = rank === 0 ? rPlanetBase + 16 : rPlanetBase - 18;
          } else if (count >= 3) {
            const tiers = [rPlanetBase + 22, rPlanetBase - 4, rPlanetBase - 28, rPlanetBase + 38];
            r = tiers[rank % tiers.length];
          }
        }
        result.push({
          ...planet,
          displayRadius: r,
          clusterSize: count,
          clusterRank: rank,
        });
      });
    });

    return result;
  }, [activePlanetsList, wheelMode]);

  // Positioned live transit planets for dual overlay
  const positionedDualTransits = useMemo(() => {
    if (wheelMode !== 'dual') return [];
    return livePlanets.map((planet) => ({
      ...planet,
      displayRadius: rPlanetBase + 18,
    }));
  }, [wheelMode, livePlanets]);

  // Planet color palette
  const getGrahaColor = (name: string) => {
    switch (name) {
      case 'Surya': return { bg: '#F59E0B', text: '#451A03', line: '#D97706', ring: '#B45309' }; // Gold Sun
      case 'Chandra': return { bg: '#0284C7', text: '#FFFFFF', line: '#0284C7', ring: '#0369A1' }; // Sky Moon
      case 'Mangal': return { bg: '#DC2626', text: '#FFFFFF', line: '#DC2626', ring: '#991B1B' }; // Red Mars
      case 'Budha': return { bg: '#059669', text: '#FFFFFF', line: '#059669', ring: '#047857' }; // Emerald Mercury
      case 'Guru': return { bg: '#D97706', text: '#FFFFFF', line: '#D97706', ring: '#B45309' }; // Amber Jupiter
      case 'Shukra': return { bg: '#DB2777', text: '#FFFFFF', line: '#DB2777', ring: '#BE185D' }; // Pink Venus
      case 'Shani': return { bg: '#4F46E5', text: '#FFFFFF', line: '#4F46E5', ring: '#3730A3' }; // Indigo Saturn
      case 'Rahu': return { bg: '#7C3AED', text: '#FFFFFF', line: '#7C3AED', ring: '#6D28D9' }; // Purple Rahu
      case 'Ketu': return { bg: '#475569', text: '#FFFFFF', line: '#475569', ring: '#334155' }; // Slate Ketu
      case 'Lagna': return { bg: '#EA580C', text: '#FFFFFF', line: '#EA580C', ring: '#C2410C' }; // Orange Lagna
      default: return { bg: '#B45309', text: '#FFFFFF', line: '#B45309', ring: '#92400E' };
    }
  };

  // Helper to format degree & minute
  const formatDegMin = (deg?: number, min?: number) => {
    return `${deg || 0}°${String(min || 0).padStart(2, '0')}'`;
  };

  // Selected planet aspects list for inspector
  const planetAspects = useMemo(() => {
    if (!activeDetailPlanet) return [];
    const deg1 = activeDetailPlanet.totalDeg || 0;
    const list: Array<{ targetName: string; type: string; angle: number; color: string; exactDiff: number }> = [];

    activePlanetsList.forEach((p2) => {
      if (p2.name === activeDetailPlanet.name) return;
      const deg2 = p2.totalDeg || 0;
      const diff = Math.abs(deg1 - deg2) % 360;
      const angleDiff = diff > 180 ? 360 - diff : diff;

      if (Math.abs(angleDiff - 180) <= 6) {
        list.push({ targetName: p2.name, type: 'Opposition (180°)', angle: 180, color: '#DC2626', exactDiff: Math.round(angleDiff * 10) / 10 });
      } else if (Math.abs(angleDiff - 120) <= 6) {
        list.push({ targetName: p2.name, type: 'Trine (120°)', angle: 120, color: '#059669', exactDiff: Math.round(angleDiff * 10) / 10 });
      } else if (Math.abs(angleDiff - 90) <= 6) {
        list.push({ targetName: p2.name, type: 'Square (90°)', angle: 90, color: '#D97706', exactDiff: Math.round(angleDiff * 10) / 10 });
      } else if (Math.abs(angleDiff - 60) <= 5) {
        list.push({ targetName: p2.name, type: 'Sextile (60°)', angle: 60, color: '#2563EB', exactDiff: Math.round(angleDiff * 10) / 10 });
      } else if (angleDiff <= 8) {
        list.push({ targetName: p2.name, type: 'Conjunction (0°)', angle: 0, color: '#CA8A04', exactDiff: Math.round(angleDiff * 10) / 10 });
      }
    });

    return list;
  }, [activeDetailPlanet, activePlanetsList]);

  // Lagna degree for house cusps calculation (default 0 of lagnaRasi if exact degree not set)
  const lagnaDegree = useMemo(() => {
    const lagnaGraha = activePlanetsList.find((p) => p.name === 'Lagna');
    if (lagnaGraha?.totalDeg !== undefined) return lagnaGraha.totalDeg;
    return ((lagnaRasi - 1) * 30 + 15) % 360;
  }, [activePlanetsList, lagnaRasi]);

  return (
    <div className={`bg-white rounded-2xl border border-amber-200/90 shadow-xl transition-all duration-300 overflow-hidden ${
      isExpanded ? 'fixed inset-2 z-50 overflow-y-auto p-4 bg-[#FFFCF7]' : 'p-3 sm:p-5 space-y-4'
    }`}>
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-amber-200/70 pb-2" style={{ minHeight: '76.8px' }}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-md">
            <Globe className="w-5 h-5 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-vedic font-black text-stone-900 text-[14px] tracking-wide flex items-center gap-1.5">
                <span style={{ fontSize: '14px' }}>360° Sidereal Celestial Wheel</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase">
                  Vedic Coordinate System
                </span>
              </h3>
            </div>
            <p className="text-[12px] text-stone-600 mt-0.5">
              Precision 360° degree graduations, 27 Nakshatras with pada divisions, 12 Rasis with elements, planetary motion vectors, and classical Drishti chords.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Wheel Mode Switcher */}
          <div
            className="bg-stone-100 border border-stone-300/80 rounded-lg p-0.5 flex items-center space-x-1 text-[11px] shadow-2xs"
            style={{ height: '23.8px' }}
          >
            <button
              type="button"
              onClick={() => setWheelMode('live')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer text-[10.5px] leading-none ${
                wheelMode === 'live'
                  ? 'bg-amber-700 text-white shadow-xs font-black'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Live Sky (Gochar)
            </button>
            {natalPlanets.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setWheelMode('natal')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer text-[10.5px] leading-none ${
                    wheelMode === 'natal'
                      ? 'bg-amber-700 text-white shadow-xs font-black'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Birth Wheel (D1)
                </button>
                <button
                  type="button"
                  onClick={() => setWheelMode('dual')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer text-[10.5px] leading-none ${
                    wheelMode === 'dual'
                      ? 'bg-amber-700 text-white shadow-xs font-black'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Dual Overlay
                </button>
              </>
            )}
          </div>

          {/* Layer Visibility Toggles */}
          <div
            className="flex items-center space-x-1"
            style={{ height: '17px' }}
          >
            <button
              type="button"
              onClick={() => setShowAspectLines(!showAspectLines)}
              className={`px-2 py-0.5 rounded border text-[10px] leading-none font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs h-full ${
                showAspectLines
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-700'
              }`}
              title="Toggle Drishti / Planetary Aspect Geometric Lines"
            >
              <Activity className="w-3 h-3 text-emerald-700" />
              <span className="hidden sm:inline">Drishti</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMotionPaths(!showMotionPaths)}
              className={`px-2 py-0.5 rounded border text-[10px] leading-none font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs h-full ${
                showMotionPaths
                  ? 'bg-amber-50 border-amber-400 text-amber-900'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-700'
              }`}
              title="Toggle Transit Vectors & Direct/Retrograde Motion"
            >
              <Compass className="w-3 h-3 text-amber-700" />
              <span className="hidden sm:inline">Motion</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHouseBhavas(!showHouseBhavas)}
              className={`px-2 py-0.5 rounded border text-[10px] leading-none font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs h-full ${
                showHouseBhavas
                  ? 'bg-purple-50 border-purple-400 text-purple-900'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-700'
              }`}
              title="Toggle 12 House Bhava Radial Cusps from Lagna"
            >
              <Layers className="w-3 h-3 text-purple-700" />
              <span className="hidden sm:inline">Houses</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDegreeTicks(!showDegreeTicks)}
              className={`px-2 py-0.5 rounded border text-[10px] leading-none font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs h-full ${
                showDegreeTicks
                  ? 'bg-sky-50 border-sky-400 text-sky-900'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-700'
              }`}
              title="Toggle 360° Precision Degree Ticks"
            >
              <span className="font-mono text-[9.5px] font-black text-sky-800">360°</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 cursor-pointer shadow-2xs h-full flex items-center justify-center"
              title={isExpanded ? 'Exit Full Screen' : 'Expand Full Screen View'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Wheel Viewport & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SVG Graphic Map Column */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0] rounded-2xl border-2 border-amber-300/80 p-2 sm:p-4 shadow-lg">
          {/* Quick Legend Bar Top */}
          <div className="w-full flex flex-wrap items-center justify-between text-[11px] font-semibold text-stone-600 mb-2 px-2 border-b border-amber-200/50 pb-1.5">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span>Agni (Fire)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Prithvi (Earth)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Vayu (Air)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Jala (Water)</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-amber-800 font-bold">Lagna: {VEDIC_RASIS[lagnaRasi - 1]?.sanskritName}</span>
              <span>•</span>
              <span className="text-stone-500">Ayanamsha: Chitra Paksha (Lahiri)</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[700px] aspect-square select-none drop-shadow-md"
          >
            <defs>
              {/* Radial Gradients */}
              <radialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFDF5" />
                <stop offset="60%" stopColor="#F9F0DB" />
                <stop offset="100%" stopColor="#EBD7B2" />
              </radialGradient>
              <radialGradient id="innerWheelGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFC" />
                <stop offset="70%" stopColor="#FAF5E8" />
                <stop offset="100%" stopColor="#F3E9D5" />
              </radialGradient>
              <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#78350F" floodOpacity="0.2" />
              </filter>
              <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.6" />
              </filter>

              <style>{`
                @keyframes pulseAspectLine {
                  0% { opacity: 0.65; }
                  50% { opacity: 1; }
                  100% { opacity: 0.65; }
                }
                @keyframes orbitDashMotion {
                  0% { stroke-dashoffset: 40; }
                  100% { stroke-dashoffset: -40; }
                }
                .pulse-aspect {
                  animation: pulseAspectLine 3s ease-in-out infinite;
                }
                .orbit-dash-path {
                  animation: orbitDashMotion 5s linear infinite;
                }
              `}</style>
            </defs>

            {/* Base Background Circle */}
            <circle cx={center} cy={center} r={rOuterRim} fill="url(#innerWheelGrad)" stroke="#B45309" strokeWidth="2.5" />

            {/* 1. 360° PRECISION DEGREE TICKS RING */}
            {showDegreeTicks && (
              <g id="degreeTicksGroup" opacity="0.9">
                {Array.from({ length: 360 }).map((_, deg) => {
                  const isMajor30 = deg % 30 === 0;
                  const isMajor10 = deg % 10 === 0;
                  const isMajor5 = deg % 5 === 0;

                  const tickInnerR = isMajor30
                    ? rDegreeTicksInner - 6
                    : isMajor10
                    ? rDegreeTicksInner - 2
                    : isMajor5
                    ? rDegreeTicksInner + 2
                    : rDegreeTicksInner + 6;

                  const p1 = degToXY(deg, tickInnerR);
                  const p2 = degToXY(deg, rDegreeTicksOuter);

                  const strokeColor = isMajor30 ? '#B45309' : isMajor10 ? '#D97706' : '#E5C287';
                  const strokeW = isMajor30 ? 2 : isMajor10 ? 1.4 : 0.75;

                  return (
                    <g key={`tick-${deg}`}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={strokeColor} strokeWidth={strokeW} />
                      {/* Degree Number Label every 30° */}
                      {isMajor30 && (
                        (() => {
                          const numPos = degToXY(deg + 1.2, rDegreeTicksOuter - 7);
                          return (
                            <text
                              x={numPos.x}
                              y={numPos.y}
                              fill="#92400E"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {deg}°
                            </text>
                          );
                        })()
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* 2. OUTER RING: 27 NAKSHATRAS (13°20' = 13.333° each) */}
            {showNakshatras && NAKSHATRAS.map((nak, idx) => {
              const startAngle = idx * 13.333333;
              const endAngle = (idx + 1) * 13.333333;
              const midAngle = startAngle + 6.666666;
              const isHovered = hoveredNakshatra === idx + 1;
              const nakNumber = idx + 1;

              const arcPath = describeArc(startAngle, endAngle, rNakshatraInner, rNakshatraOuter);
              const labelPos = degToXY(midAngle, (rNakshatraOuter + rNakshatraInner) / 2);
              const numPos = degToXY(startAngle + 3.2, rNakshatraOuter - 7);

              // Calculate tangential text rotation so labels remain upright & readable
              const rotAngle = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;

              return (
                <g
                  key={nak.name}
                  onMouseEnter={() => setHoveredNakshatra(nakNumber)}
                  onMouseLeave={() => setHoveredNakshatra(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={arcPath}
                    fill={isHovered ? '#FED7AA' : idx % 2 === 0 ? '#FAF4E8' : '#F4ECE0'}
                    stroke="#D97706"
                    strokeWidth="0.8"
                    opacity={isHovered ? 1 : 0.95}
                    className="transition-colors"
                  />

                  {/* Nakshatra Sector Radial Boundary Line */}
                  {(() => {
                    const lStart = degToXY(startAngle, rNakshatraInner);
                    const lEnd = degToXY(startAngle, rNakshatraOuter);
                    return <line x1={lStart.x} y1={lStart.y} x2={lEnd.x} y2={lEnd.y} stroke="#B45309" strokeWidth="1" opacity="0.6" />;
                  })()}

                  {/* Nakshatra Number Badge */}
                  <circle cx={numPos.x} cy={numPos.y} r="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" />
                  <text
                    x={numPos.x}
                    y={numPos.y}
                    fill="#92400E"
                    fontSize="6.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {nakNumber}
                  </text>

                  {/* Nakshatra Name Label */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={isHovered ? '#78350F' : '#451A03'}
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${rotAngle}, ${labelPos.x}, ${labelPos.y})`}
                    className="pointer-events-none select-none"
                  >
                    {nak.name.length > 11 ? `${nak.name.slice(0, 10)}.` : nak.name}
                  </text>
                </g>
              );
            })}

            {/* Concentric Boundary Circle: Nakshatra Inner / Rasi Outer */}
            <circle cx={center} cy={center} r={rNakshatraInner} fill="none" stroke="#B45309" strokeWidth="1.8" />

            {/* 3. MIDDLE RING: 12 SIDEREAL RASIS (30° each) */}
            {VEDIC_RASIS.map((rasi, idx) => {
              const startAngle = idx * 30;
              const endAngle = (idx + 1) * 30;
              const midAngle = startAngle + 15;
              const isLagna = lagnaRasi === rasi.number;
              const isHovered = hoveredRasi === rasi.number;

              const elemStyle = RASI_ELEMENT_STYLES[rasi.element] || RASI_ELEMENT_STYLES['Agni (Fire)'];
              const arcPath = describeArc(startAngle, endAngle, rRasiInner, rRasiOuter);

              const namePos = degToXY(midAngle, (rRasiOuter + rRasiInner) / 2 + 3);
              const degRangePos = degToXY(midAngle, rRasiInner + 9);

              return (
                <g
                  key={rasi.number}
                  onMouseEnter={() => setHoveredRasi(rasi.number)}
                  onMouseLeave={() => setHoveredRasi(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={arcPath}
                    fill={isLagna ? '#FEF08A' : isHovered ? '#FDE68A' : elemStyle.bg}
                    stroke={elemStyle.border}
                    strokeWidth={isLagna ? 2.5 : 1.2}
                    className="transition-colors"
                  />

                  {/* Rasi Boundary Line */}
                  {(() => {
                    const lStart = degToXY(startAngle, rRasiInner);
                    const lEnd = degToXY(startAngle, rRasiOuter);
                    return <line x1={lStart.x} y1={lStart.y} x2={lEnd.x} y2={lEnd.y} stroke="#B45309" strokeWidth="2" opacity="0.85" />;
                  })()}

                  {/* Vedic Rashi Sanskrit Name */}
                  <text
                    x={namePos.x}
                    y={namePos.y}
                    fill={isLagna ? '#78350F' : elemStyle.text}
                    fontSize="11.5"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none tracking-wide"
                  >
                    {rasi.sanskritName}
                  </text>

                  {/* Degree Span Label */}
                  <text
                    x={degRangePos.x}
                    y={degRangePos.y}
                    fill="#92400E"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none opacity-80"
                  >
                    {idx * 30}° - {(idx + 1) * 30}°
                  </text>

                  {/* Lagna / Ascendant Banner Badge */}
                  {isLagna && (
                    (() => {
                      const badgePos = degToXY(midAngle, rRasiOuter - 8);
                      return (
                        <g transform={`translate(${badgePos.x}, ${badgePos.y})`}>
                          <rect x="-16" y="-6" width="32" height="12" rx="3" fill="#B45309" stroke="#FFFBEB" strokeWidth="1" />
                          <text fill="#FFFFFF" fontSize="7.5" fontWeight="black" textAnchor="middle" dominantBaseline="central">
                            LAGNA
                          </text>
                        </g>
                      );
                    })()
                  )}
                </g>
              );
            })}

            {/* Concentric Boundary Circle: Rasi Inner / House Cusps Outer */}
            <circle cx={center} cy={center} r={rRasiInner} fill="none" stroke="#B45309" strokeWidth="2.5" />

            {/* 4. 12 HOUSE / BHAVA RADIAL CUSPS & LABELS FROM LAGNA */}
            {showHouseBhavas && Array.from({ length: 12 }).map((_, hIdx) => {
              const houseNum = hIdx + 1;
              const houseAngle = (lagnaDegree + hIdx * 30) % 360;
              const midHouseAngle = (houseAngle + 15) % 360;

              const cuspStart = degToXY(houseAngle, rCenterHub + 4);
              const cuspEnd = degToXY(houseAngle, rRasiInner);

              const isKendra = [1, 4, 7, 10].includes(houseNum);
              const isTrikona = [5, 9].includes(houseNum);

              const labelPos = degToXY(midHouseAngle, (rRasiInner + rPlanetBase) / 2 + 10);

              return (
                <g key={`house-${houseNum}`}>
                  {/* House Cusp Divider Line */}
                  <line
                    x1={cuspStart.x}
                    y1={cuspStart.y}
                    x2={cuspEnd.x}
                    y2={cuspEnd.y}
                    stroke={isKendra ? '#DC2626' : isTrikona ? '#059669' : '#D97706'}
                    strokeWidth={isKendra ? '1.8' : '1'}
                    strokeDasharray={isKendra ? 'none' : '4 3'}
                    opacity="0.65"
                  />

                  {/* House Number Identifier */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={isKendra ? '#991B1B' : isTrikona ? '#065F46' : '#92400E'}
                    fontSize="9"
                    fontWeight="black"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="opacity-60 select-none"
                  >
                    H{houseNum}
                  </text>
                </g>
              );
            })}

            {/* 5. PLANETARY DRISHTI / ASPECT GEOMETRIC CHORDS */}
            {showAspectLines && (
              <g id="aspectLinesGroup">
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="currentColor" />
                  </marker>
                </defs>
                {activePlanetsList.map((p1, idx1) => {
                  return activePlanetsList.slice(idx1 + 1).map((p2) => {
                    const deg1 = p1.totalDeg || 0;
                    const deg2 = p2.totalDeg || 0;
                    const diff = Math.abs(deg1 - deg2) % 360;
                    const angleDiff = diff > 180 ? 360 - diff : diff;

                    let aspectColor = '';
                    // Based on Vedic principles for benefic/malefic/neutral
                    // Here simplified for demonstration as requested
                    if (Math.abs(angleDiff - 180) <= 6) {
                      aspectColor = '#ef4444'; // Bad (Red)
                    } else if (Math.abs(angleDiff - 120) <= 6) {
                      aspectColor = '#22c55e'; // Good (Green)
                    } else if (Math.abs(angleDiff - 90) <= 6) {
                      aspectColor = '#f59e0b'; // Neutral (Beige/Gold)
                    } else if (Math.abs(angleDiff - 60) <= 5) {
                      aspectColor = '#22c55e'; // Good (Green)
                    }

                    if (!aspectColor) return null;

                    const isHighlight =
                      selectedGraha === p1.name ||
                      selectedGraha === p2.name ||
                      hoveredPlanet === p1.name ||
                      hoveredPlanet === p2.name;

                    const lineOpacity = isHighlight ? 1 : selectedGraha ? 0.2 : 0.65;
                    const strokeWidth = isHighlight ? 2.5 : 1.3;

                    const pos1 = degToXY(deg1, rPlanetBase - 15);
                    const pos2 = degToXY(deg2, rPlanetBase - 15);

                    return (
                      <g key={`${p1.name}-${p2.name}-aspect`} color={aspectColor}>
                        <line
                          x1={pos1.x}
                          y1={pos1.y}
                          x2={pos2.x}
                          y2={pos2.y}
                          stroke={aspectColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={angleDiff === 180 ? 'none' : '4 4'}
                          opacity={lineOpacity}
                          markerEnd="url(#arrowhead)"
                          className={isHighlight ? 'pulse-aspect' : ''}
                        />
                      </g>
                    );
                  });
                })}
              </g>
            )}

            {/* 6. ANIMATED PLANETARY MOTION VECTORS (→ Direct or ← Retrograde) */}
            {showMotionPaths && positionedPlanets.map((p) => {
              const deg = p.totalDeg || 0;
              const colors = getGrahaColor(p.name);
              const trailSpan = 16;
              const startDeg = p.isRetrograde ? deg : deg - trailSpan;
              const endDeg = p.isRetrograde ? deg + trailSpan : deg;
              const pathArc = describeArc(startDeg, endDeg, p.displayRadius - 10, p.displayRadius + 10);

              const aheadDeg = p.isRetrograde ? deg - 6 : deg + 6;
              const vectorPos = degToXY(aheadDeg, p.displayRadius);
              const isSelected = selectedGraha === p.name || hoveredPlanet === p.name;

              return (
                <g key={`motion-${p.name}`}>
                  <path
                    d={pathArc}
                    fill="none"
                    stroke={p.isRetrograde ? '#DC2626' : colors.line}
                    strokeWidth={isSelected ? '2.5' : '1.4'}
                    strokeDasharray="4 4"
                    opacity={isSelected ? 0.9 : 0.6}
                    className="orbit-dash-path pointer-events-none"
                  />
                  <circle
                    cx={vectorPos.x}
                    cy={vectorPos.y}
                    r={isSelected ? 4 : 2.8}
                    fill={p.isRetrograde ? '#DC2626' : colors.line}
                    stroke="#FFFBF0"
                    strokeWidth="1.2"
                    className="pointer-events-none"
                  />
                </g>
              );
            })}

            {/* 7. DUAL OVERLAY LIVE TRANSITS TRACK (OUTER RING) */}
            {wheelMode === 'dual' && positionedDualTransits.map((p) => {
              const deg = p.totalDeg || 0;
              const pos = degToXY(deg, p.displayRadius);
              const colors = getGrahaColor(p.name);
              const isSelected = selectedGraha === p.name || hoveredPlanet === p.name;

              return (
                <g
                  key={`dual-live-${p.name}`}
                  onClick={() => setSelectedGraha(p.name as any)}
                  onMouseEnter={() => setHoveredPlanet(p.name)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                  className="cursor-pointer"
                >
                  {/* Leader line from transit planet to rasi inner edge */}
                  {(() => {
                    const rimPos = degToXY(deg, rRasiInner);
                    return <line x1={pos.x} y1={pos.y} x2={rimPos.x} y2={rimPos.y} stroke={colors.line} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />;
                  })()}

                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 14 : 11.5}
                    fill="#FFFFFF"
                    stroke={colors.line}
                    strokeWidth={isSelected ? 3 : 2}
                    filter="url(#shadowFilter)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    fill={colors.ring}
                    fontSize={isSelected ? '10.5' : '9'}
                    fontWeight="black"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {p.symbol}
                  </text>
                  {/* Transit Pill Tag */}
                  <g transform={`translate(${pos.x + 9}, ${pos.y - 9})`}>
                    <rect x="-6" y="-5" width="12" height="10" rx="3" fill="#0284C7" stroke="#FFFFFF" strokeWidth="0.75" />
                    <text fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                      G
                    </text>
                  </g>
                </g>
              );
            })}

            {/* 8. PRIMARY PLANETARY NODES WITH LEADER LINES & DEGREE LABELS */}
            {positionedPlanets.map((p) => {
              const deg = p.totalDeg || 0;
              const nodePos = degToXY(deg, p.displayRadius);
              const pointerPos = degToXY(deg, rRasiInner);
              const colors = getGrahaColor(p.name);
              const isSelected = selectedGraha === p.name || (!selectedGraha && p.name === 'Surya');
              const isHovered = hoveredPlanet === p.name;

              const nodeRadius = isSelected ? 16 : isHovered ? 15 : 13;

              return (
                <g
                  key={`primary-${p.name}`}
                  onClick={() => setSelectedGraha(p.name as any)}
                  onMouseEnter={() => setHoveredPlanet(p.name)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                  className="cursor-pointer"
                >
                  {/* Leader line connecting planet circle to its exact degree on Rasi inner ring */}
                  <line
                    x1={nodePos.x}
                    y1={nodePos.y}
                    x2={pointerPos.x}
                    y2={pointerPos.y}
                    stroke={colors.line}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    strokeDasharray={p.clusterSize > 1 ? '3 2' : 'none'}
                    opacity={isSelected ? 1 : 0.75}
                  />

                  {/* Little exact point pip on the rim */}
                  <circle cx={pointerPos.x} cy={pointerPos.y} r={isSelected ? 3 : 2} fill={colors.line} />

                  {/* Planet Node Circle */}
                  <circle
                    cx={nodePos.x}
                    cy={nodePos.y}
                    r={nodeRadius}
                    fill={colors.bg}
                    stroke={isSelected ? '#78350F' : '#FFFFFF'}
                    strokeWidth={isSelected ? 3 : 2}
                    filter={isSelected ? 'url(#glowGold)' : 'url(#shadowFilter)'}
                    className="transition-all"
                  />

                  {/* Vedic Symbol */}
                  <text
                    x={nodePos.x}
                    y={nodePos.y}
                    fill={colors.text}
                    fontSize={isSelected ? '12.5' : '11'}
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {p.symbol}
                  </text>

                  {/* Motion Direction Badge: → (Direct) or ← (Retrograde / Vakri) */}
                  <g transform={`translate(${nodePos.x + 11}, ${nodePos.y - 11})`}>
                    <circle
                      r="7.5"
                      fill={p.isRetrograde ? '#FEE2E2' : '#FEF3C7'}
                      stroke={p.isRetrograde ? '#DC2626' : '#D97706'}
                      strokeWidth="1.2"
                    />
                    <text
                      fill={p.isRetrograde ? '#DC2626' : '#92400E'}
                      fontSize="8.5"
                      fontWeight="black"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {p.isRetrograde ? '←' : '→'}
                    </text>
                  </g>

                  {/* Planet Degree Tag underneath */}
                  <g transform={`translate(${nodePos.x}, ${nodePos.y + nodeRadius + 8})`}>
                    <rect
                      x="-17"
                      y="-6"
                      width="34"
                      height="12"
                      rx="3"
                      fill={isSelected ? '#78350F' : '#FFFFFF'}
                      stroke={isSelected ? '#F59E0B' : '#E5D6BD'}
                      strokeWidth="1"
                    />
                    <text
                      fill={isSelected ? '#FFFFFF' : '#451A03'}
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {formatDegMin(p.degree, p.minute)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* 9. CENTER MANDALA HUB */}
            <circle cx={center} cy={center} r={rCenterHub} fill="url(#centerHubGrad)" stroke="#B45309" strokeWidth="2.5" />
            <circle cx={center} cy={center} r={rCenterHub - 6} fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" />

            {/* Sacred Vedic Emblem in Hub */}
            <text x={center} y={center - 20} fill="#B45309" fontSize="16" fontWeight="bold" textAnchor="middle">
              ॐ
            </text>
            <text x={center} y={center - 4} fill="#78350F" fontSize="11" fontWeight="900" textAnchor="middle">
              ASTROV
            </text>
            <text x={center} y={center + 10} fill="#92400E" fontSize="8.5" fontWeight="black" textAnchor="middle">
              360° WHEEL
            </text>
            <text x={center} y={center + 24} fill="#B45309" fontSize="7.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {wheelMode === 'natal' ? 'NATAL D1' : wheelMode === 'dual' ? 'DUAL SKY' : 'GOCHAR'}
            </text>
          </svg>

          {/* Quick Planet Selector Bar at bottom of map */}
          <div className="w-full mt-3 pt-2.5 border-t border-amber-200/70 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider mr-1">
              Focus Graha:
            </span>
            {activePlanetsList.map((p) => {
              const isSelected = selectedGraha === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedGraha(p.name as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all border flex items-center space-x-1 shadow-2xs ${
                    isSelected
                      ? 'bg-amber-700 text-white border-amber-800 font-black shadow-xs ring-1 ring-amber-400'
                      : 'bg-white text-stone-800 border-amber-200/80 hover:bg-amber-50 hover:border-amber-400'
                  }`}
                >
                  <span className="font-bold">{p.symbol}</span>
                  <span>{p.name}</span>
                  <span className={`text-[10px] font-black ${p.isRetrograde ? 'text-rose-600' : 'text-amber-600'}`}>
                    {p.isRetrograde ? '←' : '→'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Planet Inspector Panel Column */}
        <div className="lg:col-span-4 bg-[#FAF7F0] rounded-2xl border-2 border-amber-300/80 p-4 space-y-3.5 shadow-sm">
          {activeDetailPlanet ? (
            <div className="space-y-3.5">
              {/* Header Box: Name, English, Motion Status */}
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[18px] shadow-sm text-white"
                    style={{ backgroundColor: getGrahaColor(activeDetailPlanet.name).bg }}
                  >
                    {activeDetailPlanet.symbol}
                  </span>
                  <div>
                    <h4 className="font-vedic font-black text-stone-900 text-[18px] leading-tight">
                      {activeDetailPlanet.name} ({activeDetailPlanet.englishName})
                    </h4>
                    <span className="text-[11.5px] text-amber-900 font-bold">
                      {wheelMode === 'natal' ? 'Natal Janam Placement' : 'Current Sky Transit (Gochar)'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {activeDetailPlanet.isRetrograde ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black uppercase flex items-center space-x-1 shadow-2xs">
                      <span>← Vakri (Retrograde)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase flex items-center space-x-1 shadow-2xs">
                      <span>→ Direct Motion</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Exact Coordinate Cards */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="bg-white rounded-xl p-2.5 border border-amber-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Sidereal Rashi</span>
                  <div className="font-bold text-stone-950 text-[14px]">
                    {activeDetailPlanet.rasiName}
                  </div>
                  <div className="text-[12px] text-stone-700 font-mono font-semibold">
                    {activeDetailPlanet.degree}° {activeDetailPlanet.minute}&apos;
                  </div>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-amber-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Absolute 360° Longitude</span>
                  <div className="font-bold text-stone-950 text-[14px] font-mono">
                    {Math.round((activeDetailPlanet.totalDeg || 0) * 100) / 100}°
                  </div>
                  <div className="text-[11px] text-stone-600">0° Mesha Reference</div>
                </div>
              </div>

              {/* Dignity & House Placement Card */}
              <div className="bg-white rounded-xl p-3 border border-amber-200/90 shadow-2xs space-y-2 text-[12px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
                  <span className="font-bold text-stone-700">Bhava / House Placement:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[11px]">
                    House {activeDetailPlanet.house || Math.floor((activeDetailPlanet.rasiNumber - lagnaRasi + 12) % 12) + 1}
                  </span>
                </div>
                {activeDetailPlanet.dignity && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-700">Vedic Dignity:</span>
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-purple-100 text-purple-900 border border-purple-300">
                      {activeDetailPlanet.dignity}
                    </span>
                  </div>
                )}
              </div>

              {/* Nakshatra & Astronomical Fixed Star Box */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2.5 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">
                    Nakshatra: <strong className="text-amber-950">{activeDetailPlanet.nakshatra}</strong>
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Pada {activeDetailPlanet.pada}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11.5px] pt-1 border-t border-amber-200/60">
                  <div>
                    <span className="text-stone-500 text-[10.5px]">Nakshatra Lord:</span>
                    <div className="font-bold text-stone-900">{activeDetailPlanet.nakshatraLord || '—'}</div>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10.5px]">KP Sub-Lord:</span>
                    <div className="font-bold text-amber-900">{activeDetailPlanet.subLord || '—'}</div>
                  </div>
                </div>

                {activeFixedStar && (
                  <div className="bg-white rounded-lg p-2.5 border border-amber-200/80 text-[11.5px] space-y-1 shadow-2xs">
                    <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Astronomical Fixed Star:</span>
                    </div>
                    <p className="text-stone-900 font-bold">
                      {activeFixedStar.fixedStar} ({activeFixedStar.constellation})
                    </p>
                    <p className="text-[11px] text-stone-600">
                      Deity: {activeFixedStar.deity} • Element: {activeFixedStar.element}
                    </p>
                  </div>
                )}
              </div>

              {/* Digbala & Direction Card */}
              {(() => {
                const dirInfo = getPlanetDirectionInfo(activeDetailPlanet.name);
                const rasiDir = getRasiDirection(activeDetailPlanet.rasiNumber);
                return (
                  <div className="bg-white rounded-xl p-3 border border-amber-200/90 text-[11.5px] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-amber-900 font-bold border-b border-amber-200/70 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Compass className="w-4 h-4 text-amber-600" />
                        <span>Directional Strength (Digbala):</span>
                      </div>
                      <span className="text-[10.5px] text-amber-800 font-black uppercase">
                        {dirInfo.compassDirection}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
                      <div>
                        <span className="text-stone-500 text-[10px]">Rashi Direction:</span>
                        <div className="font-bold text-stone-900">{rasiDir.direction}</div>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px]">Digbala House:</span>
                        <div className="font-bold text-amber-800">House {dirInfo.digbalaHouse} ({dirInfo.digbalaDirection})</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Active Aspects Cast & Received */}
              <div className="bg-white rounded-xl p-3 border border-amber-200/90 text-[11.5px] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-stone-900 border-b border-amber-100 pb-1">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <span>Planetary Aspects &amp; Drishti:</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {planetAspects.length} Active
                  </span>
                </div>

                {planetAspects.length > 0 ? (
                  <div className="space-y-1">
                    {planetAspects.map((asp, idx) => (
                      <div key={idx} className="flex items-center justify-between py-0.5 text-[11.5px]">
                        <span className="font-bold text-stone-800">{asp.targetName}:</span>
                        <span className="font-semibold" style={{ color: asp.color }}>
                          {asp.type} ({asp.exactDiff}°)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-500 italic">
                    No major geometric aspects within classical 6° orb.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-stone-500 text-[12px] italic">
              Click any planet node on the 360° celestial wheel to inspect its complete coordinates and dignities.
            </div>
          )}
        </div>
      </div>

      {/* Explanatory Technical Notes & Classical Legend */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11.5px] text-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-stone-900 font-bold block">Classical 360° Sidereal Astronomical Wheel:</strong>
            <p className="text-stone-600 leading-relaxed">
              Planets are mapped across the continuous 360° sidereal zodiac starting at 0°00&apos; Mesha (Aries).
              Each of the 12 rashis encompasses exactly 30°, while the 27 Nakshatras span 13°20&apos; each.
              <span className="font-bold text-amber-900 ml-1">→ Direct motion</span> indicates regular celestial progression, while
              <span className="font-bold text-rose-700 ml-1">← Vakri (Retrograde)</span> indicates apparent backward motion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
