import React from 'react';
import { HouseInfo, PlanetPosition } from '../types';
import { VEDIC_RASIS } from '../data';

interface SouthIndianChartProps {
  houses: HouseInfo[];
  title?: string;
  subtitle?: string;
  isTransit?: boolean;
  onSelectHouse?: (house: HouseInfo) => void;
  selectedHouseNumber?: number;
}

// In South Indian Kundali, the signs (Rasis) are fixed in a 4x4 grid:
// Top row: Pisces (12), Aries (1), Taurus (2), Gemini (3)
// Right col: Cancer (4), Leo (5)
// Bottom row: Virgo (6), Libra (7), Scorpio (8), Sagittarius (9)
// Left col: Capricorn (10), Aquarius (11)
// Center 2x2 is empty or displays title / info.
// The Lagna (Ascendant) moves according to the native's chart, labeled with "Asc" or diagonal lines.
const SOUTH_INDIAN_GRID_CELLS: { rasiNumber: number; row: number; col: number; rasiName: string }[] = [
  // Row 0
  { rasiNumber: 12, row: 0, col: 0, rasiName: 'Meena' },
  { rasiNumber: 1, row: 0, col: 1, rasiName: 'Mesha' },
  { rasiNumber: 2, row: 0, col: 2, rasiName: 'Vrishabha' },
  { rasiNumber: 3, row: 0, col: 3, rasiName: 'Mithuna' },
  // Row 1
  { rasiNumber: 11, row: 1, col: 0, rasiName: 'Kumbha' },
  { rasiNumber: 4, row: 1, col: 3, rasiName: 'Karka' },
  // Row 2
  { rasiNumber: 10, row: 2, col: 0, rasiName: 'Makara' },
  { rasiNumber: 5, row: 2, col: 3, rasiName: 'Simha' },
  // Row 3
  { rasiNumber: 9, row: 3, col: 0, rasiName: 'Dhanu' },
  { rasiNumber: 8, row: 3, col: 1, rasiName: 'Vrischika' },
  { rasiNumber: 7, row: 3, col: 2, rasiName: 'Tula' },
  { rasiNumber: 6, row: 3, col: 3, rasiName: 'Kanya' },
];

export function SouthIndianChart({
  houses,
  title = 'Lagna Kundali (Birth Chart)',
  subtitle = 'South Indian Fixed-Rasi Grid Layout',
  isTransit = false,
  onSelectHouse,
  selectedHouseNumber,
}: SouthIndianChartProps) {
  // Map rasiNumber to HouseInfo
  const rasiToHouseMap = new Map<number, HouseInfo>();
  houses.forEach((h) => {
    rasiToHouseMap.set(h.rasiNumber, h);
  });

  const getPlanetBadgeColor = (name: string) => {
    switch (name) {
      case 'Surya': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Chandra': return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Mangal': return 'bg-red-100 text-red-900 border-red-300';
      case 'Budha': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Guru': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Shukra': return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Shani': return 'bg-slate-200 text-slate-900 border-slate-400';
      case 'Rahu':
      case 'Ketu': return 'bg-purple-100 text-purple-900 border-purple-300';
      default: return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-gradient-to-b from-[#FDFBF7] to-white rounded-lg border border-[#E8DEC8] p-2 shadow-2xs">
      {title && (
        <div className="text-center mb-1.5">
          <h3 className="text-[14px] font-vedic font-bold text-stone-950 tracking-tight leading-snug">{title}</h3>
          <p className="text-[12px] text-stone-600 leading-snug">{subtitle}</p>
        </div>
      )}

      {/* 4x4 Grid representation */}
      <div className="relative w-full max-w-[360px] aspect-square select-none mx-auto grid grid-cols-4 grid-rows-4 border-2 border-amber-800/80 bg-[#FAF7F2] rounded overflow-hidden">
        {SOUTH_INDIAN_GRID_CELLS.map((cell) => {
          const house = rasiToHouseMap.get(cell.rasiNumber);
          const isLagna = house?.houseNumber === 1;
          const isSelected = selectedHouseNumber === house?.houseNumber;

          // Position style in 4x4 grid
          const gridStyle: React.CSSProperties = {
            gridRowStart: cell.row + 1,
            gridColumnStart: cell.col + 1,
          };

          return (
            <div
              key={cell.rasiNumber}
              style={gridStyle}
              onClick={() => house && onSelectHouse?.(house)}
              className={`border border-amber-800/40 p-1 flex flex-col justify-between relative transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-amber-100/90 ring-2 ring-amber-600 z-10'
                  : isLagna
                  ? 'bg-amber-50/70 hover:bg-amber-100/50'
                  : 'hover:bg-white/70 bg-[#FAF7F2]'
              }`}
            >
              {/* Lagna Diagonal Stripe indicator if Ascendant */}
              {isLagna && (
                <div className="absolute top-0 right-0 w-3.5 h-3.5 overflow-hidden pointer-events-none">
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 rotate-45" />
                </div>
              )}

              {/* Rasi & House Tag */}
              <div className="flex items-center justify-between text-[10px] leading-tight font-bold">
                <span className="text-amber-900 truncate">
                  {cell.rasiName.slice(0, 3)}
                </span>
                {house && (
                  <span className={`px-1 rounded text-[9px] ${isLagna ? 'bg-red-800 text-white font-black' : 'text-stone-700'}`}>
                    {isLagna ? 'ASC' : `H${house.houseNumber}`}
                  </span>
                )}
              </div>

              {/* Planets in this Rasi */}
              <div className="flex flex-wrap gap-0.5 my-auto justify-center content-center">
                {house?.planets.map((p) => (
                  <span
                    key={p.name}
                    title={`${p.name} (${p.degree}° ${p.minute}')`}
                    className={`inline-flex items-center text-[10px] px-1 py-0.2 rounded border font-bold leading-none ${getPlanetBadgeColor(p.name)}`}
                  >
                    {p.symbol}
                    {p.isRetrograde && <span className="text-red-700 font-black ml-0.5">R</span>}
                  </span>
                ))}
              </div>

              {/* Sign Lord and degree snippet */}
              <div className="text-[9px] text-stone-500 flex justify-between font-mono leading-none">
                <span>{VEDIC_RASIS[cell.rasiNumber - 1]?.lord.slice(0, 2)}</span>
                <span>{cell.rasiNumber}</span>
              </div>
            </div>
          );
        })}

        {/* Center 2x2 Cell (Spans rows 2-3, cols 2-3) */}
        <div
          style={{ gridRow: '2 / span 2', gridColumn: '2 / span 2' }}
          className="border border-amber-800/40 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0] p-2 flex flex-col items-center justify-center text-center space-y-1 shadow-inner"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-serif font-black text-sm shadow-3xs">
            ॐ
          </div>
          <span className="font-vedic font-bold text-[12px] text-amber-950 uppercase tracking-wider">
            South Indian
          </span>
          <span className="text-[10px] text-stone-600 font-semibold leading-tight">
            Fixed Zodiac (Rasi) Chakra
          </span>
        </div>
      </div>
    </div>
  );
}
