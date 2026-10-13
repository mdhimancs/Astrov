import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Briefcase,
  Globe,
  TrendingUp,
  IndianRupee,
  Coins,
  Compass,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Calculator,
  PieChart,
  ArrowRight,
  ArrowRightLeft,
  Navigation,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { PlanetPosition, HouseInfo } from '../types';
import {
  computePersonalizedLifeGuidance,
  LifeGuidanceProfile,
} from '../utils/lifeAspectAnalysisAndGuidance';

interface PersonalizedGuidanceSectionProps {
  natalPlanets: PlanetPosition[];
  natalHouses: HouseInfo[];
  lagnaRasi: number;
  userName?: string;
}

export function PersonalizedGuidanceSection({
  natalPlanets,
  natalHouses,
  lagnaRasi,
  userName = 'Seeker',
}: PersonalizedGuidanceSectionProps) {
  const [activeGuidanceTab, setActiveGuidanceTab] = useState<
    'education' | 'occupation' | 'foreign_stay' | 'career_transition' | 'wealth_calculator' | 'vastu_partners'
  >('education');

  // Selected Career Pillar sub-tab
  const [selectedCareerPillar, setSelectedCareerPillar] = useState<
    'jobChange' | 'transfer' | 'promotion' | 'favourFromSeniors'
  >('jobChange');

  // Interactive Wealth Calculator State (strictly INR)
  const [baseAnnualSavingsINR, setBaseAnnualSavingsINR] = useState<number>(500000); // In INR (₹5 Lakhs/year default)

  const guidance = useMemo(() => {
    return computePersonalizedLifeGuidance(natalPlanets, natalHouses, lagnaRasi);
  }, [natalPlanets, natalHouses, lagnaRasi]);

  // Projected wealth calculation (strictly in INR)
  const calculatedProjectedNetWorth = useMemo(() => {
    const mult = guidance.maxWealth.dhanaYogaMultiplier;
    // Compounding over a 20-year prime career window with Dhana multiplier
    const rawVal = baseAnnualSavingsINR * 20 * mult * 1.6;
    return Math.round(rawVal);
  }, [baseAnnualSavingsINR, guidance.maxWealth.dhanaYogaMultiplier]);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crores`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-[#FCFAF7] rounded-xl border border-amber-200/90 shadow-xs p-3 sm:p-4 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="font-vedic font-black text-stone-950 text-[16px] sm:text-[17px] tracking-tight">
              Personalized Guidance for the Person &amp; Strategic Calculators
            </h3>
          </div>
          <p className="text-[12px] text-stone-600 leading-snug">
            Vedic life roadmap tailored to your natal lagna, karmic houses (2nd, 4th, 5th, 9th, 10th, 11th, 12th) and planetary strengths.
          </p>
        </div>

        {/* Tab switcher badge */}
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-950 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-md shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Actionable Guidance Suite</span>
        </div>
      </div>

      {/* Primary Sub-Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {[
          { id: 'education', label: 'Choice of Education', icon: GraduationCap },
          { id: 'occupation', label: 'Choice of Occupation', icon: Briefcase },
          { id: 'foreign_stay', label: 'Foreign vs Motherland', icon: Globe },
          { id: 'career_transition', label: 'Job Change & Promotion', icon: TrendingUp },
          { id: 'wealth_calculator', label: 'Max Wealth Calculator', icon: Calculator },
          { id: 'vastu_partners', label: 'Vastu & Co-Founders', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeGuidanceTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveGuidanceTab(tab.id as any)}
              className={`p-2 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-1.5 ${
                isActive
                  ? 'bg-amber-800 text-white border-amber-950 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200/80 hover:bg-[#FAF8F5] hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-amber-800'}`}
                />
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] font-bold leading-tight ${
                  isActive ? 'text-white' : 'text-stone-900'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CHOICE OF EDUCATION (ACADEMIC STREAM GUIDANCE) */}
      {/* ======================================================== */}
      {activeGuidanceTab === 'education' && (
        <div className="space-y-3 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-3xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-vedic">
                Vedic Academic Stream &amp; Higher Education Guidance
              </span>
              <h4 className="font-vedic font-bold text-stone-950 text-[15px]">
                Recommended Stream: {guidance.education.recommendedStream}
              </h4>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-bold">
              <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                Competitive Exam Success: {guidance.education.examSuccessProbability}%
              </span>
              <span className="bg-sky-100 text-sky-950 px-2 py-0.5 rounded border border-sky-300">
                Foreign Degrees: {guidance.education.higherEducationAbroadProbability}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11.5px] font-bold text-stone-800 block">
              Ranked Academic Disciplines by Planetary Affinity (2nd, 4th &amp; 5th Bhavas):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {guidance.education.streamOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] p-2.5 rounded-md border border-stone-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-950 text-[12.5px]">{opt.stream}</span>
                    <span className="font-vedic font-black text-amber-900 text-[12px] bg-amber-100/80 px-2 py-0.5 rounded">
                      {opt.suitabilityScore}% Match
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-600"
                      style={{ width: `${opt.suitabilityScore}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-stone-600 leading-snug">
                    {opt.rationale}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 text-[10px] text-stone-700 pt-0.5">
                    <span className="font-semibold text-stone-500">Key Careers:</span>
                    {opt.keyCareers.map((c, i) => (
                      <span
                        key={i}
                        className="bg-white px-1.5 py-0.2 rounded border border-stone-200 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimal Study Environment */}
          <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200 text-[11.5px] text-stone-800 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-950">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
              <span>Auspicious Academic Environment &amp; Focus Formula</span>
            </div>
            <p className="text-stone-700 text-[11px] leading-snug">
              {guidance.education.optimalStudyEnvironment} Keeping Saraswati Yantra or a green emerald crystal on the study desk energizes Mercury’s recall speed during high-pressure examinations.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CHOICE OF OCCUPATION (VEDIC CAREER VOCATION) */}
      {/* ======================================================== */}
      {activeGuidanceTab === 'occupation' && (
        <div className="space-y-3 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-3xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-vedic">
                10th Bhava Karmasthana &amp; Amatyakaraka Vocation
              </span>
              <h4 className="font-vedic font-bold text-stone-950 text-[15px]">
                Primary Career Vocation: {guidance.occupation.primaryVocation}
              </h4>
            </div>
            <span className="bg-amber-100 text-amber-950 font-bold text-[11px] px-2.5 py-1 rounded border border-amber-300">
              Archetype: {guidance.occupation.careerArchetype}
            </span>
          </div>

          {/* Independent Enterprise vs Salaried Job Ratio */}
          <div className="bg-[#FAF8F5] p-2.5 rounded border border-amber-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-stone-800">
              <span>Independent Venture / Business ({guidance.occupation.independentVsJobRatio.business}%)</span>
              <span>Corporate / Salaried Executive ({guidance.occupation.independentVsJobRatio.salariedJob}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-stone-200 flex overflow-hidden">
              <div
                className="bg-amber-600 h-full"
                style={{ width: `${guidance.occupation.independentVsJobRatio.business}%` }}
              />
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${guidance.occupation.independentVsJobRatio.salariedJob}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-600 italic">
              Ideal Path: {guidance.occupation.workCultureSuitability}
            </p>
          </div>

          {/* Occupation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {guidance.occupation.occupationOptions.map((occ, idx) => (
              <div
                key={idx}
                className="bg-[#FCFAF7] p-2.5 rounded-md border border-stone-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-[12.5px]">{occ.role}</span>
                  <span className="font-bold font-vedic text-emerald-800 text-[11.5px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {occ.alignmentScore}% Synergy
                  </span>
                </div>
                <div className="text-[10.5px] text-stone-500 font-semibold">
                  Industry: <span className="text-stone-800">{occ.industry}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {occ.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LONG TERM STAY — FOREIGN VS MOTHERLAND */}
      {/* ======================================================== */}
      {activeGuidanceTab === 'foreign_stay' && (
        <div className="space-y-3 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-3xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-vedic">
                Desh-Videsh Nirnaya (4th vs 9th &amp; 12th Bhavas)
              </span>
              <h4 className="font-vedic font-bold text-stone-950 text-[15px]">
                Verdict: {guidance.foreignVsMotherland.settlementVerdict}
              </h4>
            </div>
            <span className="bg-sky-100 text-sky-950 font-bold text-[11px] px-2.5 py-1 rounded border border-sky-300">
              Cross-Border Dasha Active
            </span>
          </div>

          {/* Dual Bar: Foreign Stay vs Motherland */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-[#FAF8F5] p-3 rounded border border-sky-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-sky-950">Foreign Settlement (PR / Living Abroad)</span>
                <span className="text-[14px] font-black font-vedic text-sky-900">
                  {guidance.foreignVsMotherland.foreignStayProbability}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sky-100 overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full"
                  style={{ width: `${guidance.foreignVsMotherland.foreignStayProbability}%` }}
                />
              </div>
              <span className="text-[10.5px] text-stone-500 block pt-0.5">
                Rahu in 12th/9th bhava &amp; movable rasis drive long-term overseas relocation.
              </span>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-amber-950">Motherland Root Prosperity</span>
                <span className="text-[14px] font-black font-vedic text-amber-900">
                  {guidance.foreignVsMotherland.motherlandProsperityScore}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${guidance.foreignVsMotherland.motherlandProsperityScore}%` }}
                />
              </div>
              <span className="text-[10.5px] text-stone-500 block pt-0.5">
                4th house Sukha bhava preserves ancestral property and domestic respect.
              </span>
            </div>
          </div>

          {/* Favorable Global Directions */}
          <div className="bg-stone-50 p-2.5 rounded border border-stone-200 text-[11.5px] space-y-1">
            <span className="font-bold text-stone-900 block">
              Favorable Global Corridors &amp; Timing:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {guidance.foreignVsMotherland.favorableGlobalDirections.map((dir, i) => (
                <span
                  key={i}
                  className="bg-white px-2 py-0.5 rounded border border-stone-300 font-semibold text-stone-800 text-[11px]"
                >
                  🌐 {dir}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-stone-600 pt-1 leading-snug">
              {guidance.foreignVsMotherland.rationale}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PROMOTION / TRANSFER / JOB CHANGE / SENIOR FAVOUR */}
      {/* ======================================================== */}
      {activeGuidanceTab === 'career_transition' && (
        <div className="space-y-3.5 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-3xs">
          {/* Header & Overall Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 font-vedic">
                Vedic Career Transition &amp; Auspicious Timing Radar
              </span>
              <h4 className="font-vedic font-bold text-stone-950 text-[16px]">
                Job Change, Transfer, Promotion &amp; Senior Patronage
              </h4>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-bold">
              <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                Salary Uplift: {guidance.careerTransition.expectedSalaryHikeMultiplier}
              </span>
            </div>
          </div>

          {/* 4 Pillars Probability Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: 'jobChange' as const,
                title: 'Job Change / New Job',
                sanskrit: 'कर्म परिवर्तन',
                score: guidance.careerTransition.jobChangeProbability,
                icon: ArrowRightLeft,
                color: 'text-indigo-800',
                border: 'border-indigo-200',
                bg: 'bg-indigo-50/60',
              },
              {
                id: 'transfer' as const,
                title: 'Transfer / Relocation',
                sanskrit: 'स्थान परिवर्तन',
                score: guidance.careerTransition.transferLikelihood,
                icon: Navigation,
                color: 'text-amber-800',
                border: 'border-amber-200',
                bg: 'bg-amber-50/60',
              },
              {
                id: 'promotion' as const,
                title: 'Promotion & Elevation',
                sanskrit: 'पदोन्नति योग',
                score: guidance.careerTransition.nextPromotionProbability,
                icon: TrendingUp,
                color: 'text-emerald-800',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50/60',
              },
              {
                id: 'favourFromSeniors' as const,
                title: 'Favour from Seniors',
                sanskrit: 'अधिकारी कृपा',
                score: guidance.careerTransition.favourFromSeniorsScore,
                icon: Users,
                color: 'text-blue-800',
                border: 'border-blue-200',
                bg: 'bg-blue-50/60',
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = selectedCareerPillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setSelectedCareerPillar(pillar.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-1 ${
                    isSelected
                      ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                      : `${pillar.bg} ${pillar.border} hover:border-amber-400`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wide truncate">
                      {pillar.sanskrit}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-200' : pillar.color}`} />
                  </div>
                  <div>
                    <h5 className={`font-bold text-[12px] truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {pillar.title}
                    </h5>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className={`text-[15px] font-black font-vedic ${isSelected ? 'text-amber-300' : pillar.color}`}>
                        {pillar.score}%
                      </span>
                      <span className={`text-[9.5px] ${isSelected ? 'text-amber-200/80' : 'text-stone-500'}`}>
                        Favorability
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Deep Dive Card */}
          {guidance.careerTransition.pillars && (
            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-stone-200/90 space-y-2.5">
              {(() => {
                const current = guidance.careerTransition.pillars[selectedCareerPillar];
                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-200/70 pb-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                            {current.sanskritTitle}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500">
                            Houses: {current.governingHouses.map((h) => `${h}th`).join(', ')}
                          </span>
                        </div>
                        <h5 className="font-bold text-stone-950 text-[14px] mt-0.5">
                          {current.title} Analysis &amp; Astrological Potential
                        </h5>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <span className="font-bold text-stone-700">Key Karakas:</span>
                        <div className="flex gap-1">
                          {current.keyPlanets.map((p) => (
                            <span key={p} className="bg-white border border-stone-200 px-1.5 py-0.2 rounded font-medium text-stone-800 text-[10px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-[12px] text-stone-700 leading-snug">
                      {current.verdict}
                    </p>

                    {/* Detected Yogas & Timing Window */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                      <div className="bg-white p-2 rounded border border-stone-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide block">
                          Classical Yogas Identified:
                        </span>
                        <ul className="space-y-0.5 text-stone-800">
                          {current.yogasDetected.map((y, idx) => (
                            <li key={idx} className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{y}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-2 rounded border border-stone-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide block">
                          Optimal Timing &amp; Ingress:
                        </span>
                        <p className="text-stone-700 leading-snug">
                          {current.timingWindow}
                        </p>
                        <div className="pt-0.5 text-[10.5px] text-amber-900 font-medium">
                          <strong>Vedic Counsel:</strong> {current.strategicAdvice}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Transition Windows Chronological Radar */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-900 block">
              24-Month Astrological Transition Timeline:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {guidance.careerTransition.transitionWindows.map((win, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] p-2.5 rounded-md border border-stone-200/90 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                      {win.window}
                    </span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded">
                      {win.favorabilityScore}% Favored
                    </span>
                  </div>
                  <h5 className="font-bold text-stone-950 text-[11.5px]">{win.type}</h5>
                  <p className="text-[10.5px] text-stone-600 leading-snug">
                    {win.astrologicalTrigger}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200 text-[11.5px] text-stone-800">
            <strong className="text-amber-950">Strategic Counsel:</strong> {guidance.careerTransition.jobSwitchTiming}. Schedule major negotiations and resignation notices on Shukla Paksha Wednesdays or Thursdays.
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MAX WEALTH CALCULATOR (INTERACTIVE ENGINE - INR) */}
      {/* ======================================================== */}
      {activeGuidanceTab === 'wealth_calculator' && (
        <div className="space-y-3.5 bg-white p-3.5 rounded-lg border border-amber-300 shadow-3xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
            <div>
              <div className="flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-amber-800" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 font-vedic">
                  Vedic Max Wealth Potential &amp; Lifetime Compounding Calculator
                </span>
              </div>
              <h4 className="font-vedic font-bold text-stone-950 text-[16px]">
                {guidance.maxWealth.peakNetWorthTier}
              </h4>
            </div>

            {/* INR Only Indicator */}
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-950 bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded">
              <IndianRupee className="w-3.5 h-3.5 text-amber-800" />
              <span>Indian Rupees (₹ Lakhs &amp; Crores)</span>
            </div>
          </div>

          {/* Top Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#FAF8F5] p-2.5 rounded border border-amber-200 text-center">
              <span className="text-[10px] text-stone-500 font-bold block">
                Dhana Yoga Multiplier
              </span>
              <span className="font-vedic font-black text-amber-900 text-[18px]">
                {guidance.maxWealth.dhanaYogaMultiplier}x
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-2.5 rounded border border-amber-200 text-center">
              <span className="text-[10px] text-stone-500 font-bold block">
                Indu Lagna Wealth Score
              </span>
              <span className="font-vedic font-black text-emerald-800 text-[18px]">
                {guidance.maxWealth.induLagnaScore} / 100
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-2.5 rounded border border-amber-200 text-center">
              <span className="text-[10px] text-stone-500 font-bold block">
                Peak Wealth Window
              </span>
              <span className="font-bold text-stone-900 text-[12px] block pt-1">
                {guidance.maxWealth.peakWealthAgeRange}
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-2.5 rounded border border-amber-200 text-center">
              <span className="text-[10px] text-stone-500 font-bold block">
                Peak Mahadasha
              </span>
              <span className="font-bold text-amber-950 text-[11px] block pt-1 truncate">
                {guidance.maxWealth.peakWealthMahadasha.split('(')[0]}
              </span>
            </div>
          </div>

          {/* Interactive Input Slider */}
          <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-[12px] font-bold text-amber-950">
              <span className="flex items-center space-x-1">
                <Calculator className="w-3.5 h-3.5 text-amber-800" />
                <span>Simulate Annual Savings / Surplus Capital (INR):</span>
              </span>
              <span className="font-vedic font-black text-[15px] text-amber-900">
                ₹{(baseAnnualSavingsINR / 100000).toFixed(2)} Lakhs (₹{baseAnnualSavingsINR.toLocaleString('en-IN')}) / year
              </span>
            </div>

            <input
              type="range"
              min={100000}
              max={5000000}
              step={50000}
              value={baseAnnualSavingsINR}
              onChange={(e) => setBaseAnnualSavingsINR(Number(e.target.value))}
              className="w-full accent-amber-800 cursor-pointer"
            />

            {/* Projected Net Worth Banner */}
            <div className="bg-white p-3 rounded-md border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
              <div>
                <span className="text-[10.5px] text-stone-500 font-bold block uppercase tracking-wider">
                  Astrologically Projected Peak Net Worth Potential
                </span>
                <span className="text-[20px] sm:text-[22px] font-black font-vedic text-emerald-800">
                  {formatCurrency(calculatedProjectedNetWorth)}
                </span>
              </div>
              <div className="text-right text-[11px] text-stone-600 sm:max-w-xs">
                Reflects {guidance.maxWealth.dhanaYogaMultiplier}x Dhana Yoga compound velocity combined with Indu Lagna prosperity rays.
              </div>
            </div>
          </div>

          {/* Recommended Astrological Asset Allocation */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1 text-[12px] font-bold text-stone-900">
              <PieChart className="w-3.5 h-3.5 text-amber-800" />
              <span>Recommended Asset Allocation (Based on Planet Strengths):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[11px]">
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[10px]">Real Estate (Mangal)</span>
                <span className="font-black text-stone-900 text-[13px]">
                  {guidance.maxWealth.assetAllocation.realEstate}%
                </span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[10px]">Stocks/Equities (Budha)</span>
                <span className="font-black text-stone-900 text-[13px]">
                  {guidance.maxWealth.assetAllocation.equityAndMarkets}%
                </span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[10px]">Gold/Precious (Guru)</span>
                <span className="font-black text-stone-900 text-[13px]">
                  {guidance.maxWealth.assetAllocation.goldAndCommodities}%
                </span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[10px]">Enterprise Equity</span>
                <span className="font-black text-stone-900 text-[13px]">
                  {guidance.maxWealth.assetAllocation.businessEnterprise}%
                </span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200 col-span-2 sm:col-span-1">
                <span className="text-stone-500 block text-[10px]">Liquid Treasury</span>
                <span className="font-black text-stone-900 text-[13px]">
                  {guidance.maxWealth.assetAllocation.liquidTreasury}%
                </span>
              </div>
            </div>
          </div>

          {/* Drivers & Leaks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-950 block">⚡ Key Wealth Accelerators:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                {guidance.maxWealth.wealthDrivers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-50/70 p-2.5 rounded border border-rose-200 space-y-1">
              <span className="font-bold text-rose-950 block">🛡️ Avoid Wealth-Leaking Holes:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                {guidance.maxWealth.cautionaryLeakingHoles.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: VASTU & CO-FOUNDER PARTNERSHIP GUIDANCE */}
      {/* ======================================================== */}
      {activeGuidanceTab === 'vastu_partners' && (
        <div className="space-y-3 bg-white p-3.5 rounded-lg border border-amber-200/80 shadow-3xs">
          {/* Vastu & Compass Directions */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[13px]">
              <Compass className="w-4 h-4 text-amber-800" />
              <span>Auspicious Facing &amp; Vastu Alignment</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px]">
              <div className="bg-[#FAF8F5] p-2.5 rounded border border-stone-200">
                <span className="text-stone-500 font-medium block text-[10.5px]">Work Desk Facing:</span>
                <span className="font-bold text-stone-900">{guidance.vastuAndDirections.workDeskFacing}</span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded border border-stone-200">
                <span className="text-stone-500 font-medium block text-[10.5px]">Sleeping Head Direction:</span>
                <span className="font-bold text-stone-900">{guidance.vastuAndDirections.sleepingHeadDirection}</span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded border border-stone-200">
                <span className="text-stone-500 font-medium block text-[10.5px]">Lucky Colors &amp; Day:</span>
                <span className="font-bold text-stone-900">{guidance.vastuAndDirections.luckyColor} • {guidance.vastuAndDirections.luckyDay}</span>
              </div>
            </div>
          </div>

          {/* Business Partner & Co-founder Guidance */}
          <div className="space-y-2 pt-2 border-t border-stone-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[13px]">
                <Users className="w-4 h-4 text-amber-800" />
                <span>Optimal Business Partner / Co-founder Selection</span>
              </div>
              <span className="bg-emerald-100 text-emerald-950 text-[10.5px] font-bold px-2 py-0.5 rounded">
                Partnership Success: {guidance.businessPartnerGuidance.partnershipSuccessScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
              <div className="bg-[#FAF8F5] p-2.5 rounded border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">Compatible Partner Signs:</span>
                <div className="flex flex-wrap gap-1">
                  {guidance.businessPartnerGuidance.idealPartnerSigns.map((s, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-stone-300 font-semibold text-stone-800 text-[11px]">
                      🤝 {s}
                    </span>
                  ))}
                </div>
                <div className="pt-1">
                  <span className="font-bold text-stone-800 block text-[10.5px]">Essential Traits to Demand:</span>
                  <ul className="list-disc list-inside text-stone-600 text-[11px]">
                    {guidance.businessPartnerGuidance.essentialTraits.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-2.5 rounded border border-stone-200 space-y-1">
                <span className="font-bold text-rose-900 block">Critical Partnership Red Flags:</span>
                <ul className="list-disc list-inside text-stone-600 text-[11px]">
                  {guidance.businessPartnerGuidance.criticalRedFlags.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
                <div className="pt-1 border-t border-stone-200/60 text-[11px] text-stone-700">
                  <strong className="text-amber-900">Soul Calling (Atmakaraka {guidance.atmakarakaMission.planet}):</strong> {guidance.atmakarakaMission.dharmicCalling}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
