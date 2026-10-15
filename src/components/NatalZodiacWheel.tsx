import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanetPosition, HouseInfo, GrahaName } from '../types';
import { VEDIC_RASIS } from '../data';
import { RotateCw, Sparkles, Compass, Info, CheckCircle2 } from 'lucide-react';

interface NatalZodiacWheelProps {
  planets: PlanetPosition[];
  houses: HouseInfo[];
  lagnaRasi: number; // 1-12
}

// Classical planetary color palettes & Vedic glyphs
const PLANET_STYLES: Record<
  GrahaName,
  { bg: string; border: string; text: string; glyph: string; vedicName: string }
> = {
  Lagna: { bg: '#854d0e', border: '#ca8a04', text: '#ffffff', glyph: 'Asc', vedicName: 'Lagna' },
  Surya: { bg: '#b45309', border: '#f59e0b', text: '#ffffff', glyph: '☉ Su', vedicName: 'Surya' },
  Chandra: { bg: '#0369a1', border: '#38bdf8', text: '#ffffff', glyph: '☽ Mo', vedicName: 'Chandra' },
  Mangal: { bg: '#b91c1c', border: '#f87171', text: '#ffffff', glyph: '♂ Ma', vedicName: 'Mangal' },
  Budha: { bg: '#047857', border: '#34d399', text: '#ffffff', glyph: '☿ Me', vedicName: 'Budha' },
  Guru: { bg: '#d97706', border: '#fbbf24', text: '#ffffff', glyph: '♃ Ju', vedicName: 'Guru' },
  Shukra: { bg: '#db2777', border: '#f472b6', text: '#ffffff', glyph: '♀ Ve', vedicName: 'Shukra' },
  Shani: { bg: '#475569', border: '#94a3b8', text: '#ffffff', glyph: '♄ Sa', vedicName: 'Shani' },
  Rahu: { bg: '#581c87', border: '#a855f7', text: '#ffffff', glyph: '☊ Ra', vedicName: 'Rahu' },
  Ketu: { bg: '#4c1d95', border: '#c084fc', text: '#ffffff', glyph: '☋ Ke', vedicName: 'Ketu' },
};

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const NatalZodiacWheel: React.FC<NatalZodiacWheelProps> = ({
  planets,
  houses,
  lagnaRasi,
}) => {
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [hoveredSignIndex, setHoveredSignIndex] = useState<number | null>(null);

  const size = 520;
  const center = size / 2;
  const outerRadius = 230;
  const signRingInner = 185;
  const houseRingInner = 145;
  const innerHubRadius = 55;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Align Aries 0° at the top (subtract 90 degrees)
  const getCoordinates = (totalDeg: number, r: number) => {
    const angle = totalDeg - 90;
    const rad = toRad(angle);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  // Group planets in the same sign to radially stagger them and prevent visual overlaps
  const planetsWithRadialOffset = React.useMemo(() => {
    const signBuckets: Record<number, PlanetPosition[]> = {};
    planets.forEach((p) => {
      const rasi = p.rasiNumber;
      if (!signBuckets[rasi]) signBuckets[rasi] = [];
      signBuckets[rasi].push(p);
    });

    return planets.map((p) => {
      const sameSignList = signBuckets[p.rasiNumber] || [p];
      const indexInSign = sameSignList.findIndex((item) => item.name === p.name);
      const totalInSign = sameSignList.length;

      // Base radius in the planetary band (between innerHub and houseRingInner)
      const minR = innerHubRadius + 22;
      const maxR = houseRingInner - 18;
      let r = (minR + maxR) / 2;
      if (totalInSign > 1) {
        const step = (maxR - minR) / (totalInSign + 1);
        r = minR + step * (indexInSign + 1);
      }

      const totalDeg =
        p.totalDeg !== undefined
          ? p.totalDeg
          : (p.rasiNumber - 1) * 30 + (p.degree || 0) + (p.minute || 0) / 60;

      return {
        ...p,
        totalDeg,
        displayRadius: r,
      };
    });
  }, [planets]);

  // Lagna degree
  const lagnaDegree = (lagnaRasi - 1) * 30;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-4 sm:p-6 bg-white/95 rounded-2xl shadow-sm border border-stone-200">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4 gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-3xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-vedic font-bold text-stone-900 leading-tight">
              Natal Zodiac Wheel (Bhachakra)
            </h3>
            <p className="text-[12px] text-stone-500 font-medium">
              360° Sidereal Circular Chart • Lahiri Ayanamsha • Lagna in{' '}
              <span className="font-semibold text-amber-800">
                {VEDIC_RASIS[lagnaRasi - 1]?.sanskritName} ({VEDIC_RASIS[lagnaRasi - 1]?.englishName})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Re-trigger Entry Animation button */}
          <button
            type="button"
            onClick={() => setAnimationKey((prev) => prev + 1)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 border border-stone-300/80 transition-all cursor-pointer shadow-3xs active:scale-95"
            title="Re-run rotating fade-in animation"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Re-animate Wheel</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas with Framer Motion entry animation */}
      <div className="relative flex items-center justify-center w-full overflow-x-auto py-2">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, rotate: -40, scale: 0.9 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1], // Smooth cubic-bezier ease out
          }}
          className="relative origin-center"
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-sm select-none"
          >
            <defs>
              {/* Radial gradient for central hub */}
              <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="60%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>
              {/* Subtle outer glow filter */}
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Decorative & Background Circles */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius + 8}
              fill="#fafaf9"
              stroke="#e7e5e4"
              strokeWidth="1.5"
            />
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="#ffffff"
              stroke="#d6d3d1"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r={signRingInner}
              fill="#faf8f5"
              stroke="#e7e5e4"
              strokeWidth="1.5"
            />
            <circle
              cx={center}
              cy={center}
              r={houseRingInner}
              fill="#ffffff"
              stroke="#e7e5e4"
              strokeWidth="1.5"
            />

            {/* 12 Zodiac Sign Wedges & Dividers */}
            {[...Array(12)].map((_, i) => {
              const startAngle = i * 30;
              const endAngle = (i + 1) * 30;
              const midAngle = startAngle + 15;
              const isEven = i % 2 === 0;
              const isHovered = hoveredSignIndex === i;

              // Arc path for the sign ring
              const p1 = getCoordinates(startAngle, outerRadius);
              const p2 = getCoordinates(endAngle, outerRadius);
              const p3 = getCoordinates(endAngle, signRingInner);
              const p4 = getCoordinates(startAngle, signRingInner);

              const arcPath = `
                M ${p1.x} ${p1.y}
                A ${outerRadius} ${outerRadius} 0 0 1 ${p2.x} ${p2.y}
                L ${p3.x} ${p3.y}
                A ${signRingInner} ${signRingInner} 0 0 0 ${p4.x} ${p4.y}
                Z
              `;

              // Coordinates for labels
              const midPos = getCoordinates(midAngle, (outerRadius + signRingInner) / 2);
              const dividerEnd = getCoordinates(startAngle, innerHubRadius);

              const rasiData = VEDIC_RASIS[i];
              const isLagnaSign = lagnaRasi === i + 1;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredSignIndex(i)}
                  onMouseLeave={() => setHoveredSignIndex(null)}
                  className="cursor-pointer transition-colors duration-200"
                >
                  {/* Sign Arc Sector */}
                  <path
                    d={arcPath}
                    fill={
                      isLagnaSign
                        ? '#fef3c7'
                        : isHovered
                        ? '#fef9c3'
                        : isEven
                        ? '#fcfbf7'
                        : '#f5f3ef'
                    }
                    stroke="#e7e5e4"
                    strokeWidth="1"
                    className="transition-colors duration-150"
                  />

                  {/* Sign Radial Divider Line extending to inner hub */}
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={dividerEnd.x}
                    y2={dividerEnd.y}
                    stroke="#d6d3d1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Sign Glyph and Names */}
                  <text
                    x={midPos.x}
                    y={midPos.y - 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    className="font-bold fill-stone-800"
                  >
                    {ZODIAC_SYMBOLS[i]} {rasiData.sanskritName}
                  </text>
                  <text
                    x={midPos.x}
                    y={midPos.y + 11}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9.5"
                    className="font-semibold fill-stone-500"
                  >
                    {rasiData.englishName.slice(0, 3)} • {i * 30}°
                  </text>
                </g>
              );
            })}

            {/* 12 House Cusps & Numbers (from Lagna) */}
            {[...Array(12)].map((_, i) => {
              // House 1 starts at Lagna
              const houseNumber = i + 1;
              const signNumber = ((lagnaRasi - 1 + i) % 12) + 1;
              const houseAngle = (signNumber - 1) * 30 + 15;
              const housePos = getCoordinates(houseAngle, (signRingInner + houseRingInner) / 2);

              return (
                <g key={`house-${i}`}>
                  <circle
                    cx={housePos.x}
                    cy={housePos.y}
                    r="9.5"
                    fill={houseNumber === 1 ? '#d97706' : '#f1f5f9'}
                    stroke={houseNumber === 1 ? '#b45309' : '#cbd5e1'}
                    strokeWidth="1"
                  />
                  <text
                    x={housePos.x}
                    y={housePos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9"
                    fontWeight="bold"
                    fill={houseNumber === 1 ? '#ffffff' : '#475569'}
                  >
                    H{houseNumber}
                  </text>
                </g>
              );
            })}

            {/* Lagna Marker Line at exact Lagna position */}
            {(() => {
              const lagnaCoord1 = getCoordinates(lagnaDegree, outerRadius + 6);
              const lagnaCoord2 = getCoordinates(lagnaDegree, innerHubRadius);
              return (
                <g>
                  <line
                    x1={lagnaCoord1.x}
                    y1={lagnaCoord1.y}
                    x2={lagnaCoord2.x}
                    y2={lagnaCoord2.y}
                    stroke="#d97706"
                    strokeWidth="2.5"
                  />
                  {/* Little indicator arrow for Lagna */}
                  <polygon
                    points={`
                      ${lagnaCoord1.x},${lagnaCoord1.y}
                      ${lagnaCoord1.x - 4},${lagnaCoord1.y - 6}
                      ${lagnaCoord1.x + 4},${lagnaCoord1.y - 6}
                    `}
                    fill="#d97706"
                  />
                </g>
              );
            })()}

            {/* Central Sacred Vedic Hub */}
            <circle
              cx={center}
              cy={center}
              r={innerHubRadius}
              fill="url(#hubGradient)"
              stroke="#b45309"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            <circle
              cx={center}
              cy={center}
              r={innerHubRadius - 6}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            {/* Sacred Vedic OM in Center */}
            <text
              x={center}
              y={center - 4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="24"
              fontWeight="bold"
              fill="#78350f"
              className="font-vedic"
            >
              ॐ
            </text>
            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fontWeight="bold"
              fill="#92400e"
              className="uppercase tracking-wider"
            >
              Bhachakra
            </text>

            {/* Planets Plotted around the chart */}
            {planetsWithRadialOffset.map((p, i) => {
              const style = PLANET_STYLES[p.name] || PLANET_STYLES.Lagna;
              const coords = getCoordinates(p.totalDeg, p.displayRadius);
              const isSelected = selectedPlanet?.name === p.name;

              return (
                <g
                  key={i}
                  onClick={() => setSelectedPlanet(isSelected ? null : p)}
                  className="cursor-pointer group"
                >
                  {/* Subtle radiating connection line to sign rim */}
                  <line
                    x1={coords.x}
                    y1={coords.y}
                    x2={getCoordinates(p.totalDeg, houseRingInner).x}
                    y2={getCoordinates(p.totalDeg, houseRingInner).y}
                    stroke={style.border}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={isSelected ? 0.9 : 0.4}
                  />

                  {/* Planet Node Circle */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 14 : 11}
                    fill={style.bg}
                    stroke={isSelected ? '#ffffff' : style.border}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-all duration-200 group-hover:scale-110"
                    style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' : undefined }}
                  />

                  {/* Planet Glyph/Abbreviation */}
                  <text
                    x={coords.x}
                    y={coords.y + 0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isSelected ? '9.5' : '8.5'}
                    fontWeight="bold"
                    fill={style.text}
                    className="pointer-events-none"
                  >
                    {p.symbol || p.name.slice(0, 2)}
                  </text>

                  {/* Retrograde 'R' Badge */}
                  {p.isRetrograde && (
                    <g transform={`translate(${coords.x + 6}, ${coords.y - 10})`}>
                      <circle cx="3" cy="3" r="4.5" fill="#9333ea" stroke="#ffffff" strokeWidth="1" />
                      <text
                        x="3"
                        y="4"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="6"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        R
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      {/* Selected Planet Details Card / Quick Drawer */}
      <div className="w-full mt-4">
        <AnimatePresence mode="wait">
          {selectedPlanet ? (
            <motion.div
              key={selectedPlanet.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-amber-50/70 border border-amber-300/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-3xs"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs text-[13px]"
                  style={{
                    backgroundColor:
                      PLANET_STYLES[selectedPlanet.name]?.bg || '#78350f',
                  }}
                >
                  {selectedPlanet.symbol}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-vedic font-bold text-stone-900 text-sm sm:text-base">
                      {selectedPlanet.name} ({selectedPlanet.englishName})
                    </h4>
                    {selectedPlanet.isRetrograde && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                        Retrograde (Vakri)
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-stone-600">
                    Sign: <strong className="text-amber-900">{selectedPlanet.rasiName}</strong> (
                    {VEDIC_RASIS[selectedPlanet.rasiNumber - 1]?.englishName}) • House:{' '}
                    <strong className="text-amber-900">H{selectedPlanet.house}</strong> • Degree:{' '}
                    <span className="font-mono font-semibold">
                      {selectedPlanet.degree}° {selectedPlanet.minute}&apos;
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[12px] shrink-0">
                <div className="bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                  <span className="text-stone-500">Nakshatra:</span>{' '}
                  <strong className="text-stone-800">
                    {selectedPlanet.nakshatra} (Pada {selectedPlanet.pada})
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(null)}
                  className="px-2 py-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 rounded border border-stone-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-[12px] text-stone-500 py-1 bg-stone-50/80 rounded-lg border border-stone-200/60">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>
                Click on any planetary node in the wheel to inspect exact coordinates, house placement, and nakshatra pada.
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Planetary Legend */}
      <div className="w-full mt-3 pt-3 border-t border-stone-100">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-stone-600">
          <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px]">
            Planets Legend:
          </span>
          {planets.map((p) => {
            const style = PLANET_STYLES[p.name] || PLANET_STYLES.Lagna;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setSelectedPlanet(selectedPlanet?.name === p.name ? null : p)}
                className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded cursor-pointer transition-all border ${
                  selectedPlanet?.name === p.name
                    ? 'bg-amber-100 border-amber-400 font-bold text-amber-950 scale-105'
                    : 'bg-white border-stone-200 hover:border-amber-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: style.bg }}
                />
                <span>{p.name}</span>
                <span className="text-[10px] text-stone-400">
                  {p.degree}°
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
