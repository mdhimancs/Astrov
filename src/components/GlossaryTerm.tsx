import React, { useState } from 'react';
import { glossaryDefinitions } from './GlossaryDefinitions';

interface GlossaryTermProps {
  term: keyof typeof glossaryDefinitions;
  children: React.ReactNode;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ term, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative cursor-help border-b border-dotted border-stone-400 hover:border-amber-600 transition-colors"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-stone-900 text-stone-100 text-xs rounded-md shadow-lg border border-stone-700">
          {glossaryDefinitions[term]}
        </span>
      )}
    </span>
  );
};
