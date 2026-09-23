import React from 'react';
import { HouseInfo, PlanetPosition } from '../types';
import { VEDIC_RASIS } from '../data';

interface NorthIndianChartProps {
  houses: HouseInfo[];
  title?: string;
  subtitle?: string;
  isTransit?: boolean;
  showTransitsTogether?: boolean;
  onSelectHouse?: (house: HouseInfo) => void;
  selectedHouseNumber?: number;
}

export function NorthIndianChart({
  houses,
  title = 'Lagna Kundali (Birth Chart)',
  subtitle = 'North Indian Vedic Diamond Layout',
  isTransit = false,
  showTransitsTogether = false,
  onSelectHouse,
  selectedHouseNumber,
}: NorthIndianChartProps) {
  // SVG Dimensions
  const size = 500;
  const half = size / 2;
  const qtr = size / 4;
  const threeQtr = size * 0.75;

  // House polygon coordinates in standard North Indian Kundali:
  // House 1 (Top Center Diamond / Tanu Bhava)
  // House 2 (Top Left Triangle)
  // House 3 (Left Top Triangle)
  // House 4 (Left Center Diamond / Sukha Bhava)
  // House 5 (Left Bottom Triangle)
  // House 6 (Bottom Left Triangle)
  // House 7 (Bottom Center Diamond / Kalatra Bhava)
  // House 8 (Bottom Right Triangle)
  // House 9 (Right Bottom Triangle)
  // House 10 (Right Center Diamond / Karma Bhava)
  // House 11 (Right Top Triangle)
  // House 12 (Top Right Triangle)

  const housePaths: { [key: number]: string } = {
    1: `M ${half} 0 L ${threeQtr} ${qtr} L ${half} ${half} L ${qtr} ${qtr} Z`,
    2: `M ${half} 0 L 0 0 L ${qtr} ${qtr} Z`,
    3: `M 0 0 L 0 ${half} L ${qtr} ${qtr} Z`,
    4: `M 0 ${half} L ${qtr} ${qtr} L ${half} ${half} L ${qtr} ${threeQtr} Z`,
    5: `M 0 ${half} L 0 ${size} L ${qtr} ${threeQtr} Z`,
    6: `M 0 ${size} L ${half} ${size} L ${qtr} ${threeQtr} Z`,
    7: `M ${half} ${half} L ${qtr} ${threeQtr} L ${half} ${size} L ${threeQtr} ${threeQtr} Z`,
    8: `M ${half} ${size} L ${size} ${size} L ${threeQtr} ${threeQtr} Z`,
    9: `M ${threeQtr} ${threeQtr} L ${size} ${size} L ${size} ${half} Z`,
    10: `M ${half} ${half} L ${threeQtr} ${qtr} L ${size} ${half} L ${threeQtr} ${threeQtr} Z`,
    11: `M ${threeQtr} ${qtr} L ${size} ${half} L ${size} 0 Z`,
    12: `M ${half} 0 L ${threeQtr} ${qtr} L ${size} 0 Z`,
  };

  // Center anchor points for positioning text & planets inside each house
  const houseTextPositions: { [key: number]: { x: number; y: number; rasiX: number; rasiY: number } } = {
    1: { x: half, y: qtr + 12, rasiX: half, rasiY: 34 },
    2: { x: qtr - 20, y: qtr - 25, rasiX: qtr + 15, rasiY: 26 },
    3: { x: qtr - 55, y: half - 30, rasiX: 25, rasiY: qtr + 10 },
    4: { x: qtr - 5, y: half + 10, rasiX: 30, rasiY: half - 10 },
    5: { x: qtr - 55, y: half + 45, rasiX: 25, rasiY: threeQtr - 10 },
    6: { x: qtr - 20, y: size - 35, rasiX: qtr + 15, rasiY: size - 20 },
    7: { x: half, y: threeQtr + 10, rasiX: half, rasiY: threeQtr - 24 },
    8: { x: threeQtr + 20, y: size - 35, rasiX: threeQtr - 15, rasiY: size - 20 },
    9: { x: size - 70, y: half + 45, rasiX: size - 30, rasiY: threeQtr - 10 },
    10: { x: threeQtr + 10, y: half + 10, rasiX: size - 32, rasiY: half - 10 },
    11: { x: size - 70, y: half - 30, rasiX: size - 30, rasiY: qtr + 10 },
    12: { x: threeQtr + 20, y: qtr - 25, rasiX: threeQtr - 15, rasiY: 26 },
  };

  const getPlanetBadgeColor = (name: string, isTransitPlanet = false) => {
    if (isTransitPlanet) return 'bg-amber-100 text-amber-900 border-amber-400 font-semibold';
    switch (name) {
      case 'Surya': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Chandra': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Mangal': return 'bg-red-100 text-red-800 border-red-300';
      case 'Budha': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Guru': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Shukra': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Shani': return 'bg-slate-200 text-slate-800 border-slate-400';
      case 'Rahu':
      case 'Ketu': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-xl border border-stone-200 p-2.5 sm:p-3 shadow-2xs">
      {title && (
        <div className="text-center mb-2">
          <h3 className="text-xs sm:text-sm font-vedic font-bold text-stone-900">{title}</h3>
          <p className="text-[10px] text-stone-500">{subtitle}</p>
        </div>
      )}

      {/* SVG Container: Increased by 20% horizontally and vertically */}
      <div className="relative w-full max-w-[440px] aspect-square select-none mx-auto">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full drop-shadow-md transition-all"
        >
          {/* Background Outer Box */}
          <rect
            x="0"
            y="0"
            width={size}
            height={size}
            fill="#FDFBF7"
            stroke="#B45309"
            strokeWidth="3"
            rx="4"
          />

          {/* Interactive House Polygons */}
          {houses.map((h) => {
            const isSelected = selectedHouseNumber === h.houseNumber;
            const pathData = housePaths[h.houseNumber];
            return (
              <path
                key={h.houseNumber}
                d={pathData}
                fill={isSelected ? '#FEF3C7' : h.houseNumber === 1 ? '#FFFBEB' : '#FFFFFF'}
                stroke="#C27837"
                strokeWidth={isSelected ? '2.5' : '1.5'}
                className="cursor-pointer transition-colors duration-150 hover:fill-amber-50"
                onClick={() => onSelectHouse?.(h)}
              />
            );
          })}

          {/* House Inner Dividing Lines */}
          {/* Diagonal 1: (0,0) to (size, size) */}
          <line x1="0" y1="0" x2={size} y2={size} stroke="#B45309" strokeWidth="1.75" />
          {/* Diagonal 2: (size, 0) to (0, size) */}
          <line x1={size} y1="0" x2="0" y2={size} stroke="#B45309" strokeWidth="1.75" />
          {/* Inner Diamond connecting midpoints */}
          <polygon
            points={`${half},0 ${size},${half} ${half},${size} 0,${half}`}
            fill="none"
            stroke="#B45309"
            strokeWidth="2"
          />

          {/* House Labels, Rasi numbers, and posited planets */}
          {houses.map((h) => {
            const pos = houseTextPositions[h.houseNumber];
            const rasi = VEDIC_RASIS[h.rasiNumber - 1];

            return (
              <g key={`content-${h.houseNumber}`} className="pointer-events-none">
                {/* Rasi Number Badge (Traditional North Indian indicator) */}
                <circle
                  cx={pos.rasiX}
                  cy={pos.rasiY}
                  r="11"
                  fill="#F5EDE0"
                  stroke="#C27837"
                  strokeWidth="1"
                />
                <text
                  x={pos.rasiX}
                  y={pos.rasiY + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#9A3412"
                  fontFamily="sans-serif"
                >
                  {h.rasiNumber}
                </text>

                {/* House Number subtle watermarking */}
                <text
                  x={pos.x}
                  y={pos.y - 18}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="500"
                  fill="#A8A29E"
                  fontFamily="sans-serif"
                >
                  H{h.houseNumber}
                </text>

                {/* Posited Planets List */}
                <g>
                  {h.planets.map((planet, idx) => {
                    const offsetY = pos.y + idx * 14;
                    return (
                      <text
                        key={planet.name}
                        x={pos.x}
                        y={offsetY}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="#1C1917"
                        fontFamily="sans-serif"
                      >
                        {planet.symbol}
                        {planet.isRetrograde ? '®' : ''}
                        <tspan fontSize="8" fontWeight="normal" fill="#78716C">
                          {' '}{planet.degree}°
                        </tspan>
                      </text>
                    );
                  })}

                  {/* Transit Planets (Gochar) in this house if enabled */}
                  {showTransitsTogether &&
                    h.transitPlanets &&
                    h.transitPlanets.map((tp, idx) => {
                      const offsetY = pos.y + (h.planets.length + idx) * 13;
                      return (
                        <text
                          key={`tr-${tp.name}`}
                          x={pos.x}
                          y={offsetY}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="700"
                          fill="#B45309"
                          fontFamily="sans-serif"
                        >
                          [G]{tp.symbol}
                        </text>
                      );
                    })}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Instructions */}
      <div className="w-full mt-4 flex flex-wrap items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/80 pt-3 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F5EDE0] border border-[#C27837] inline-flex items-center justify-center text-[8px] font-bold text-[#9A3412]">
              1
            </span>
            <span>= Rasi / Zodiac No.</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="text-stone-800 font-bold">Su, Mo, Ju</span>
            <span>= Grahas</span>
          </span>
          {showTransitsTogether && (
            <span className="flex items-center space-x-1 text-amber-800 font-semibold">
              <span>[G] = Gochar (Transit)</span>
            </span>
          )}
        </div>
        <span className="italic text-stone-400">Click any house for details</span>
      </div>
    </div>
  );
}
