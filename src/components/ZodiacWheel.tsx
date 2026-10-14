import React from 'react';
import { PlanetPosition } from '../types';

interface ZodiacWheelProps {
  planets: PlanetPosition[];
}

export const ZodiacWheel: React.FC<ZodiacWheelProps> = ({ planets }) => {
  const size = 300;
  const center = size / 2;
  const radius = 120;

  // Degrees to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Background Circle */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="2" />
      
      {/* Sign Dividers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
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
            stroke="#d1d5db"
            strokeWidth="1"
          />
        );
      })}

      {/* Planets */}
      {planets.map((p, i) => {
        const angle = p.longitude - 90; // Rotate to align 0 with top
        const rad = toRad(angle);
        const x = center + (radius - 15) * Math.cos(rad);
        const y = center + (radius - 15) * Math.sin(rad);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill={p.isRetrograde ? '#9333ea' : '#d97706'} />
            <text x={x} y={y + 3} fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">
              {p.name.slice(0, 1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
