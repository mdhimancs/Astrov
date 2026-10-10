import React, { useMemo } from 'react';
import { UserProfile } from '../types';
import { Calculator, Target, Lightbulb, Compass, MessageCircle, BarChart3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface NumerologyMeaning {
  analysis: string;
  prediction: string;
  suggestion: string;
}

const NUMEROLOGY_MEANINGS: Record<number, NumerologyMeaning> = {
  1: { analysis: "Driven, independent, and pioneering.", prediction: "Success through bold action and leadership.", suggestion: "Cultivate patience and teamwork." },
  2: { analysis: "Diplomatic, harmonious, and intuitive.", prediction: "Growth through partnerships and collaboration.", suggestion: "Develop self-confidence." },
  3: { analysis: "Creative, expressive, and optimistic.", prediction: "Opportunities in communication and arts.", suggestion: "Focus and finish what you start." },
  4: { analysis: "Stable, methodical, and hardworking.", prediction: "Solid long-term achievements.", suggestion: "Remain flexible to change." },
  5: { analysis: "Adventurous, versatile, and freedom-loving.", prediction: "Exciting travel and unexpected changes.", suggestion: "Focus your energy to avoid restlessness." },
  6: { analysis: "Nurturing, responsible, and caring.", prediction: "Fulfillment through family and service.", suggestion: "Avoid over-burdening yourself." },
  7: { analysis: "Introspective, analytical, and spiritual.", prediction: "Deep wisdom and intellectual breakthroughs.", suggestion: "Share your knowledge with others." },
  8: { analysis: "Ambitious, authoritative, and successful.", prediction: "Mastery over material and financial affairs.", suggestion: "Balance work with personal integrity." },
  9: { analysis: "Humanitarian, compassionate, and selfless.", prediction: "Completion of cycles and broad influence.", suggestion: "Let go of past grievances." },
};

interface NumerologyTabProps {
  activeProfile?: UserProfile;
}

export function NumerologyTab({ activeProfile }: NumerologyTabProps) {
  const calculations = useMemo(() => {
    if (!activeProfile) return null;

    const name = activeProfile.name.toLowerCase().replace(/[^a-z]/g, '');
    const dob = activeProfile.birthDate.replace(/-/g, '');

    const reduceToSingleDigit = (n: number): number => {
      while (n > 9) {
        n = n.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      }
      return n;
    };

    const lifePath = reduceToSingleDigit(
      dob.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0)
    );

    const expression = reduceToSingleDigit(
      name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) - 96), 0)
    );
    
    // Soul Urge is commonly calculated from vowels
    const soulUrge = reduceToSingleDigit(
      name.split('').reduce((acc, char) => {
        if ('aeiou'.includes(char)) {
          return acc + (char.charCodeAt(0) - 96);
        }
        return acc;
      }, 0)
    );

    return { lifePath, expression, soulUrge };
  }, [activeProfile]);

  if (!activeProfile || !calculations) {
    return <div className="p-4 text-stone-600">Please select a profile to view numerology analysis.</div>;
  }

  const lifePathDetails = NUMEROLOGY_MEANINGS[calculations.lifePath];
  const expressionDetails = NUMEROLOGY_MEANINGS[calculations.expression];
  const soulUrgeDetails = NUMEROLOGY_MEANINGS[calculations.soulUrge];

  const chartData = [
    { subject: 'Life Path', A: calculations.lifePath * 10, fullMark: 90 },
    { subject: 'Expression', A: calculations.expression * 10, fullMark: 90 },
    { subject: 'Soul Urge', A: calculations.soulUrge * 10, fullMark: 90 },
  ];

  return (
    <div className="space-y-6 p-4 bg-[#FAF6EE] rounded-xl border border-amber-200 shadow-sm">
      <h2 className="text-2xl font-bold text-stone-900 flex items-center space-x-3">
        <Calculator className="w-8 h-8 text-amber-700" />
        <span>Numerology Analysis: {activeProfile.name}</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NumerologyCard title="Life Path Number" number={calculations.lifePath} details={lifePathDetails} />
          <NumerologyCard title="Expression Number" number={calculations.expression} details={expressionDetails} />
          <NumerologyCard title="Soul Urge Number" number={calculations.soulUrge} details={soulUrgeDetails} />
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-inner flex flex-col items-center">
            <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5" />
                Influence Map
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 90]} />
                <Radar name="Influence" dataKey="A" stroke="#b45309" fill="#d97706" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function NumerologyCard({ title, number, details }: { title: string; number: number; details: NumerologyMeaning }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-inner space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-amber-900 text-lg">{title}</h3>
        <span className="text-4xl font-black text-amber-700">{number}</span>
      </div>
      <div className="space-y-3">
        <DetailItem icon={Target} label="Analysis" text={details.analysis} />
        <DetailItem icon={Compass} label="Prediction" text={details.prediction} />
        <DetailItem icon={Lightbulb} label="Suggestion" text={details.suggestion} />
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, text }: { icon: any; label: string; text: string }) {
  return (
    <div className="flex items-start space-x-3">
      <Icon className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
        <p className="text-stone-800">{text}</p>
      </div>
    </div>
  );
}
