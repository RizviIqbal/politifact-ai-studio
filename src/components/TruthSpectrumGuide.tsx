'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface TruthBucketInfo {
  label: string;
  name: string;
  color: string;
  definition: string;
  criteria: string;
  example: string;
}

const SPECTRUM_DETAILS: TruthBucketInfo[] = [
  {
    label: 'pants-fire',
    name: 'Pants on Fire',
    color: '#DC2626',
    definition: 'The statement is not accurate and makes a ridiculous claim.',
    criteria: 'Outright fabrication or outrageous conspiracy theory without any factual basis.',
    example: '"The CDC secretly admitted in court documents that vaccines contain microchips."',
  },
  {
    label: 'false',
    name: 'False',
    color: '#EA580C',
    definition: 'The statement is not accurate.',
    criteria: 'Main assertion is demonstrably wrong based on available official records.',
    example: '"My opponent voted to completely eliminate Social Security benefits for all current retirees."',
  },
  {
    label: 'barely-true',
    name: 'Barely True',
    color: '#D97706',
    definition: 'The statement contains an element of truth but ignores critical facts that would give a different impression.',
    criteria: 'Selectively uses isolated data while omitting primary context that contradicts the overall claim.',
    example: '"Our state lost 50,000 manufacturing jobs during the last administration."',
  },
  {
    label: 'half-true',
    name: 'Half True',
    color: '#CA8A04',
    definition: 'The statement is partially accurate but leaves out important details or takes things out of context.',
    criteria: 'Contains accurate core facts but oversimplifies or leaves room for misunderstanding.',
    example: '"We cut state income taxes for middle-class families by 15 percent this year."',
  },
  {
    label: 'mostly-true',
    name: 'Mostly True',
    color: '#65A30D',
    definition: 'The statement is accurate but needs clarification or additional information.',
    criteria: 'Substantially correct with minor statistical nuances or rounding differences.',
    example: '"Over 80 percent of small business owners say access to affordable healthcare is a top issue."',
  },
  {
    label: 'true',
    name: 'True',
    color: '#059669',
    definition: 'The statement is accurate and there’s nothing significant missing.',
    criteria: 'Fully supported by official legislation, census data, or verifiable public records.',
    example: '"The federal minimum wage has remained at $7.25 per hour since July 2009."',
  },
];

export const TruthSpectrumGuide: React.FC = () => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>PolitiFact Benchmark Reference</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          The 6-Point PolitiFact Truth Spectrum Guide
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Understanding the taxonomy for each PolitiFact truthfulness rating evaluated in our NLP research.
        </p>
      </div>

      {/* 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SPECTRUM_DETAILS.map((b) => (
          <div
            key={b.label}
            className="bg-[#111827] p-6 rounded-2xl border border-slate-800 hover:border-slate-700 space-y-3 relative overflow-hidden shadow-xl transition-all hover:translate-y-[-2px]"
            style={{ borderLeftWidth: '4px', borderLeftColor: b.color }}
          >
            <div className="flex items-center space-x-3">
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: b.color }} />
              <h3 className="text-base font-bold text-white font-masthead tracking-wide">{b.name}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{b.definition}</p>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Criteria:</span>
              <p className="text-xs text-slate-400 font-sans">{b.criteria}</p>
            </div>

            <div className="bg-[#0B0F17] p-3.5 rounded-xl border border-slate-800/80 text-xs italic text-slate-200 font-sans leading-relaxed">
              {b.example}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
