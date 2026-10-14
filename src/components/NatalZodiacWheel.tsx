import React from 'react';
import { PlanetPosition, HouseInfo } from '../types';

interface NatalZodiacWheelProps {
  planets: PlanetPosition[];
  houses: HouseInfo[];
  lagnaRasi: number; // 1-12
}

export const NatalZodiacWheel: React.FC<NatalZodiacWheelProps> = ({ planets, houses, lagnaRasi }) => {
  const size = 400;
  const center = size / 2;
  const radius = 160;

  // Degrees to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Natal Zodiac Wheel</h3>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="2" />
        
        {/* Sign Dividers & Labels */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30; // 0, 30, 60...
          const rad = toRad(angle);
          const x2 = center + radius * Math.cos(rad);
          const y2 = center + radius * Math.sin(rad);
          
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Planets */}
        {planets.map((p, i) => {
          // Calculate absolute angle based on Rasi and degree (assuming 30 degrees per Rasi)
          // Rasi 1 is Aries (0 deg), 2 is Taurus (30 deg), etc.
          const rasiOffset = (p.rasiNumber - 1) * 30;
          const absoluteAngle = rasiOffset + (p.degree || 0);
          
          // Rotate to align Lagna/Start with top (or 0 degrees)
          // For now, aligning 0 degrees with top for simplicity
          const angle = absoluteAngle - 90;
          const rad = toRad(angle);
          const x = center + (radius - 30) * Math.cos(rad);
          const y = center + (radius - 30) * Math.sin(rad);
          
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill={p.isRetrograde ? '#9333ea' : '#d97706'} />
              <text x={x} y={y + 4} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
                {p.name.slice(0, 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
