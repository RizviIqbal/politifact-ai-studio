'use client';

import React, { useState, useEffect } from 'react';
import { TsnePoint, fetchTsnePoints } from '../lib/data';
import { LABEL_COLORS, LABEL_DISPLAY_NAMES } from '../lib/inference';
import { Search, Compass, Info, Crosshair, Sparkles, Filter } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const TsneInteractiveExplorer: React.FC = () => {
  const [points, setPoints] = useState<TsnePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TsnePoint | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string>('all');

  useEffect(() => {
    async function loadPoints() {
      const pts = await fetchTsnePoints();
      setPoints(pts);
      if (pts.length > 0) setSelectedPoint(pts[0]);
    }
    loadPoints();
  }, []);

  const filteredPoints = points.filter((pt) => {
    const matchesSearch = searchTerm.trim() === '' || pt.statement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLabel = selectedLabelFilter === 'all' || pt.label === selectedLabelFilter;
    return matchesSearch && matchesLabel;
  });

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive 2D Semantic Embedding Space</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-masthead font-bold text-white tracking-tight">
          2D Statement Embedding & Cluster Explorer
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Explore the t-SNE 2D dimensionality reduction of TF-IDF feature vectors across PolitiFact claims. Click any point to inspect why political statements form intertwined semantic clusters.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search claims (e.g. tax, jobs, cdc, vaccine)..."
            className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto font-mono">
          <button
            onClick={() => setSelectedLabelFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedLabelFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Classes ({points.length})
          </button>
          {Object.keys(LABEL_COLORS).map((lbl) => (
            <button
              key={lbl}
              onClick={() => setSelectedLabelFilter(lbl)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                selectedLabelFilter === lbl
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-[#0B0F17] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LABEL_COLORS[lbl] }} />
              <span>{LABEL_DISPLAY_NAMES[lbl]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Scatter Canvas */}
        <div className="lg:col-span-7 h-[420px] bg-[#111827] border border-slate-800 rounded-2xl p-4 relative shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis type="number" dataKey="x" name="t-SNE Dim 1" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis type="number" dataKey="y" name="t-SNE Dim 2" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <ZAxis type="number" range={[45, 45]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const pt = payload[0].payload as TsnePoint;
                    return (
                      <div className="bg-[#0B0F17] border border-slate-700 p-3 rounded-xl shadow-2xl max-w-xs space-y-1.5 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: LABEL_COLORS[pt.label] }}
                          />
                          <span className="font-bold text-white uppercase">
                            {LABEL_DISPLAY_NAMES[pt.label]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans line-clamp-2">
                          &quot;{pt.statement}&quot;
                        </p>
                        <span className="text-[10px] text-slate-500 block">Click point to lock inspector</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Claims"
                data={filteredPoints}
                onClick={(pt) => setSelectedPoint(pt)}
                cursor="pointer"
              >
                {filteredPoints.map((entry, index) => {
                  const isSelected = selectedPoint && selectedPoint.statement === entry.statement;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={LABEL_COLORS[entry.label] || '#64748B'}
                      opacity={isSelected ? 1.0 : 0.75}
                      stroke={isSelected ? '#ffffff' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Right Point Inspector Card */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-amber-500" />
              <span>Selected Embedding Inspector</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Showing {filteredPoints.length} points
            </span>
          </div>

          {selectedPoint ? (
            <div className="space-y-4">
              {/* Verdict Tag */}
              <div className="flex items-center justify-between bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-mono text-slate-400">PolitiFact Truth Rating:</span>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: LABEL_COLORS[selectedPoint.label] || '#6366F1' }}
                >
                  {LABEL_DISPLAY_NAMES[selectedPoint.label]}
                </span>
              </div>

              {/* Statement Quote */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Original Political Statement:
                </span>
                <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans italic">
                  &quot;{selectedPoint.statement}&quot;
                </div>
              </div>

              {/* Embedding Coordinates */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-center">
                <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">t-SNE X-Coord</span>
                  <span className="text-white font-bold">{selectedPoint.x.toFixed(2)}</span>
                </div>
                <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">t-SNE Y-Coord</span>
                  <span className="text-white font-bold">{selectedPoint.y.toFixed(2)}</span>
                </div>
              </div>

              {/* Semantic Overlap Insight */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-sans leading-relaxed">
                💡 <strong>NLP Cluster Insight:</strong> Statements with similar policy vocabulary (e.g. <em>&quot;taxes&quot;, &quot;spending&quot;, &quot;healthcare&quot;</em>) cluster closely regardless of their truth label, demonstrating why lexical models require deep contextual embeddings (BERT) to distinguish nuanced deception from fact.
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-500 text-center py-12">
              Click any point in the scatter plot on the left to inspect statement details.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
