import React, { useState, useMemo } from 'react';
import type { Idea, QuadrantType } from '../types/idea';
import { QUADRANT_CONFIG } from '../types/idea';
import { Star, Maximize2, Compass } from 'lucide-react';

interface PriorityMatrix2DProps {
  ideas: Idea[];
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  onOpenDetailModal: (idea: Idea) => void;
}

// Map Feasibility (1-5) to continuous horizontal percentage (%) with threshold 3.5 at 50%
function getFeasibilityPercent(f: number): number {
  if (f <= 3.5) {
    // 1 maps to 12%, 3.5 maps to 48% (just to the left of the 50% divider)
    return 12 + ((f - 1) / 2.5) * (48 - 12);
  } else {
    // 3.5 maps to 52% (just to the right of divider), 5 maps to 86%
    return 52 + ((f - 3.5) / 1.5) * (86 - 52);
  }
}

// Map Impact (1-5) to continuous vertical percentage (%) from top (5) to bottom (1)
function getImpactPercent(i: number): number {
  if (i >= 3.5) {
    // 5 maps to 18% (safe clearance below quadrant header), 3.5 maps to 48%
    return 18 + ((5 - i) / 1.5) * (48 - 18);
  } else {
    // 3.5 maps to 52%, 1 maps to 88%
    return 52 + ((3.5 - i) / 2.5) * (88 - 52);
  }
}

export const PriorityMatrix2D: React.FC<PriorityMatrix2DProps> = ({
  ideas,
  selectedIdea,
  onSelectIdea,
  onOpenDetailModal,
}) => {
  const [hoveredIdea, setHoveredIdea] = useState<Idea | null>(null);
  const [filterQuadrant, setFilterQuadrant] = useState<QuadrantType | null>(null);

  // Group ideas by exact coordinates to generate smart diamond/fan-out clusters
  const groupedByCoord = useMemo(() => {
    const map: Record<string, Idea[]> = {};
    ideas.forEach((idea) => {
      const key = `${idea.feasibility}-${idea.impact}`;
      if (!map[key]) map[key] = [];
      map[key].push(idea);
    });
    return map;
  }, [ideas]);

  // Compute cluster offset for an idea so nodes never overlap
  const getClusterOffset = (idea: Idea): { dx: number; dy: number } => {
    const key = `${idea.feasibility}-${idea.impact}`;
    const group = groupedByCoord[key] || [];
    const total = group.length;
    if (total <= 1) return { dx: 0, dy: 0 };

    const index = group.findIndex((i) => i.id === idea.id);

    if (total === 2) {
      // Side by side
      return {
        dx: index === 0 ? -15 : 15,
        dy: 0,
      };
    }

    if (total === 3) {
      // Symmetrical triangle
      if (index === 0) return { dx: 0, dy: -14 };
      if (index === 1) return { dx: -14, dy: 12 };
      return { dx: 14, dy: 12 };
    }

    if (total === 4) {
      // 2x2 Diamond square
      const s = 14;
      if (index === 0) return { dx: -s, dy: -s };
      if (index === 1) return { dx: s, dy: -s };
      if (index === 2) return { dx: -s, dy: s };
      return { dx: s, dy: s };
    }

    // >= 5 ideas: circular rosette
    const angle = (index * 2 * Math.PI) / total;
    const radius = 20;
    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
    };
  };

  // Quadrant counts
  const quadrantCounts = useMemo(() => {
    const counts = {
      'PRIORITAS UTAMA': 0,
      POTENSI: 0,
      PERTIMBANGKAN: 0,
      TUNDA: 0,
    };
    ideas.forEach((i) => {
      if (counts[i.quadrant] !== undefined) {
        counts[i.quadrant]++;
      }
    });
    return counts;
  }, [ideas]);

  // Active guide coordinate for crosshair
  const activeFocusIdea = hoveredIdea || selectedIdea;
  const focusX = activeFocusIdea ? getFeasibilityPercent(activeFocusIdea.feasibility) : null;
  const focusY = activeFocusIdea ? getImpactPercent(activeFocusIdea.impact) : null;

  return (
    <div className="relative w-full bg-white p-2.5 sm:p-4 rounded-2xl flex flex-col justify-between select-none">
      {/* 2D Matrix Chart Container */}
      <div className="relative w-full h-[370px] sm:h-[430px] md:h-[460px] flex">
        {/* Y-Axis Label & Numerical Ruler (Impact) */}
        <div className="w-9 sm:w-11 flex flex-col justify-between items-end pr-1.5 sm:pr-2 pb-9 pt-1 text-[10px] sm:text-[11px] font-bold text-slate-400 pointer-events-none select-none">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-black uppercase text-emerald-700 tracking-tighter">5 · Max</span>
            <span className={`transition-colors ${activeFocusIdea?.impact === 5 ? 'text-emerald-600 font-black' : ''}`}>5</span>
          </div>
          <span className={`transition-colors ${activeFocusIdea?.impact === 4 ? 'text-emerald-600 font-black' : ''}`}>4</span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-slate-400">3.5</span>
            <span className="w-1.5 h-0.5 bg-slate-300 rounded-full" />
          </div>
          <span className={`transition-colors ${activeFocusIdea?.impact === 3 ? 'text-amber-600 font-black' : ''}`}>3</span>
          <span className={`transition-colors ${activeFocusIdea?.impact === 2 ? 'text-slate-700 font-black' : ''}`}>2</span>
          <div className="flex flex-col items-center gap-0.5">
            <span className={`transition-colors ${activeFocusIdea?.impact === 1 ? 'text-slate-700 font-black' : ''}`}>1</span>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Min</span>
          </div>
        </div>

        {/* Rotated Vertical Title: Impact */}
        <div className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none z-10 flex items-center gap-1 text-[11px] font-extrabold text-[#10241B] tracking-wider uppercase">
          <span>Impact</span>
          <span className="text-emerald-600 text-[10px]">▲</span>
        </div>

        {/* Center Plot Area */}
        <div className="relative flex-1 h-full pb-9">
          {/* Main 4 Quadrant Background Grid Panels */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-0.5">
            {/* Top-Left: KUADRAN II - POTENSI */}
            <div
              onClick={() =>
                setFilterQuadrant((prev) => (prev === 'POTENSI' ? null : 'POTENSI'))
              }
              className={`relative rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${filterQuadrant && filterQuadrant !== 'POTENSI'
                  ? 'opacity-40 bg-slate-50 border-slate-200'
                  : 'bg-gradient-to-br from-sky-500/10 via-sky-50/50 to-blue-50/70 border-sky-400/40 hover:border-sky-500 shadow-[inset_0_1px_4px_rgba(2,132,199,0.06)]'
                }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 bg-white/70 backdrop-blur-xs border-b border-sky-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-black text-sky-900 tracking-tight">
                    ✦ Potensi
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-sky-700 bg-sky-100/90 px-1.5 sm:px-2 py-0.5 rounded-full border border-sky-300/60">
                  {quadrantCounts.POTENSI} Ide
                </span>
              </div>

              {/* Watermark Roman Numeral */}
              <div className="absolute bottom-1.5 left-2.5 text-4xl sm:text-5xl font-black text-sky-900/5 select-none pointer-events-none">
                II
              </div>
              <div className="p-2 self-start pointer-events-none">
                <span className="text-[9px] font-semibold text-sky-800/60 hidden sm:inline-block">
                  Kelayakan Rendah · Dampak Tinggi
                </span>
              </div>
            </div>

            {/* Top-Right: KUADRAN I - PRIORITAS UTAMA */}
            <div
              onClick={() =>
                setFilterQuadrant((prev) => (prev === 'PRIORITAS UTAMA' ? null : 'PRIORITAS UTAMA'))
              }
              className={`relative rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${filterQuadrant && filterQuadrant !== 'PRIORITAS UTAMA'
                  ? 'opacity-40 bg-slate-50 border-slate-200'
                  : 'bg-gradient-to-br from-emerald-500/15 via-emerald-50/60 to-lime-500/15 border-emerald-400/50 hover:border-emerald-500 shadow-[inset_0_1px_6px_rgba(22,163,74,0.08)]'
                }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 bg-white/80 backdrop-blur-xs border-b border-emerald-200/70">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-600" />
                  <span className="text-[11px] sm:text-xs font-black text-emerald-950 tracking-tight">
                    ★ Prioritas Utama
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-800 bg-emerald-100/95 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-300/70 shadow-2xs">
                  {quadrantCounts['PRIORITAS UTAMA']} Ide
                </span>
              </div>

              {/* Watermark Roman Numeral */}
              <div className="absolute bottom-1.5 right-2.5 text-4xl sm:text-5xl font-black text-emerald-900/5 select-none pointer-events-none">
                I
              </div>
              <div className="p-2 self-end pointer-events-none">
                <span className="text-[9px] font-semibold text-emerald-800/70 hidden sm:inline-block">
                  Kelayakan Tinggi · Dampak Tinggi (Quick Wins)
                </span>
              </div>
            </div>

            {/* Bottom-Left: KUADRAN III - TUNDA */}
            <div
              onClick={() =>
                setFilterQuadrant((prev) => (prev === 'TUNDA' ? null : 'TUNDA'))
              }
              className={`relative rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${filterQuadrant && filterQuadrant !== 'TUNDA'
                  ? 'opacity-40 bg-slate-50 border-slate-200'
                  : 'bg-gradient-to-br from-slate-100/80 to-slate-200/40 border-slate-300/60 hover:border-slate-400 shadow-[inset_0_1px_4px_rgba(71,85,105,0.04)]'
                }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 bg-white/60 backdrop-blur-xs border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[11px] sm:text-xs font-black text-slate-700 tracking-tight">
                    ● Tunda
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 bg-slate-200/80 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-300/60">
                  {quadrantCounts.TUNDA} Ide
                </span>
              </div>

              {/* Watermark Roman Numeral */}
              <div className="absolute bottom-1.5 left-2.5 text-4xl sm:text-5xl font-black text-slate-800/5 select-none pointer-events-none">
                III
              </div>
              <div className="p-2 self-start pointer-events-none">
                <span className="text-[9px] font-semibold text-slate-500/70 hidden sm:inline-block">
                  Kelayakan Rendah · Dampak Rendah
                </span>
              </div>
            </div>

            {/* Bottom-Right: KUADRAN IV - PERTIMBANGKAN */}
            <div
              onClick={() =>
                setFilterQuadrant((prev) => (prev === 'PERTIMBANGKAN' ? null : 'PERTIMBANGKAN'))
              }
              className={`relative rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${filterQuadrant && filterQuadrant !== 'PERTIMBANGKAN'
                  ? 'opacity-40 bg-slate-50 border-slate-200'
                  : 'bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50/60 border-amber-400/40 hover:border-amber-500 shadow-[inset_0_1px_4px_rgba(217,119,6,0.06)]'
                }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 bg-white/70 backdrop-blur-xs border-b border-amber-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rotate-45 bg-amber-500" />
                  <span className="text-[11px] sm:text-xs font-black text-amber-900 tracking-tight">
                    ◆ Pertimbangkan
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-300/60">
                  {quadrantCounts.PERTIMBANGKAN} Ide
                </span>
              </div>

              {/* Watermark Roman Numeral */}
              <div className="absolute bottom-1.5 right-2.5 text-4xl sm:text-5xl font-black text-amber-900/5 select-none pointer-events-none">
                IV
              </div>
              <div className="p-2 self-end pointer-events-none">
                <span className="text-[9px] font-semibold text-amber-800/60 hidden sm:inline-block">
                  Kelayakan Tinggi · Dampak Rendah
                </span>
              </div>
            </div>
          </div>

          {/* Center Quadrant Threshold Crosshair Indicator */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal Line at 50% */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-400/40" />
            {/* Vertical Line at 50% */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-400/40" />
            {/* Center Axis Pill */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#10241B] text-[#BEF264] text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-white z-10 flex items-center gap-0.5">
              <span>3.5</span>
            </div>
          </div>

          {/* Interactive Crosshair Coordinate Guide Lines (Appears when hovering) */}
          {activeFocusIdea && focusX !== null && focusY !== null && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-emerald-500/70 transition-all duration-150"
                style={{ left: `${focusX}%` }}
              />
              <div
                className="absolute left-0 right-0 border-t border-dashed border-emerald-500/70 transition-all duration-150"
                style={{ top: `${focusY}%` }}
              />
            </div>
          )}

          {/* Plotted Interactive Idea Pin Badges */}
          <div className="absolute inset-0 pointer-events-none">
            {ideas.map((idea) => {
              const baseX = getFeasibilityPercent(idea.feasibility);
              const baseY = getImpactPercent(idea.impact);
              const offset = getClusterOffset(idea);

              const isHovered = hoveredIdea?.id === idea.id;
              const isSelected = selectedIdea?.id === idea.id;
              const isTopScore = idea.total_score === 10;
              const isFilteredOut = filterQuadrant !== null && idea.quadrant !== filterQuadrant;

              // Color Theme per Quadrant
              let bgClass = 'bg-gradient-to-tr from-emerald-600 to-green-500';
              let shadowClass = 'shadow-[0_4px_12px_rgba(22,163,74,0.35)]';

              if (idea.quadrant === 'POTENSI') {
                bgClass = 'bg-gradient-to-tr from-sky-600 to-blue-500';
                shadowClass = 'shadow-[0_4px_12px_rgba(2,132,199,0.35)]';
              } else if (idea.quadrant === 'PERTIMBANGKAN') {
                bgClass = 'bg-gradient-to-tr from-amber-600 to-amber-500';
                shadowClass = 'shadow-[0_4px_12px_rgba(217,119,6,0.35)]';
              } else if (idea.quadrant === 'TUNDA') {
                bgClass = 'bg-gradient-to-tr from-slate-600 to-slate-500';
                shadowClass = 'shadow-[0_4px_12px_rgba(71,85,105,0.35)]';
              }

              if (isTopScore) {
                bgClass = 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300';
                shadowClass = 'shadow-[0_4px_16px_rgba(245,158,11,0.55)]';
              }

              return (
                <div
                  key={idea.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-200 cursor-pointer ${isFilteredOut ? 'opacity-20 scale-90' : 'opacity-100'
                    }`}
                  style={{
                    left: `calc(${baseX}% + ${offset.dx}px)`,
                    top: `calc(${baseY}% + ${offset.dy}px)`,
                    zIndex: isHovered || isSelected ? 40 : 20,
                  }}
                  onMouseEnter={() => setHoveredIdea(idea)}
                  onMouseLeave={() => setHoveredIdea(null)}
                  onClick={() => {
                    onSelectIdea(idea);
                    onOpenDetailModal(idea);
                  }}
                >
                  {/* Outer Pulsing Ping Ring for Top Score (#1) */}
                  {isTopScore && (
                    <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                  )}

                  {/* Circular Numbered Pin Badge */}
                  <div
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-white transition-transform duration-200 ${bgClass} ${shadowClass} ${isHovered || isSelected
                        ? 'scale-125 ring-3 ring-[#10241B] ring-offset-2'
                        : 'hover:scale-115'
                      }`}
                  >
                    {/* Centered Number */}
                    <span
                      className={`text-xs sm:text-[13px] font-black select-none ${isTopScore ? 'text-[#10241B]' : 'text-white'
                        }`}
                    >
                      {idea.order_num}
                    </span>

                    {/* Golden Star Chip for Top Score */}
                    {isTopScore && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-[#10241B] flex items-center justify-center text-[8px] font-black shadow-xs border border-white">
                        ★
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Glassmorphism Detail Card when Hovered */}
          {hoveredIdea && (
            <div
              className="absolute bottom-2 left-2 right-2 sm:right-auto sm:w-80 z-50 bg-[#10241B]/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-[#224434] shadow-2xl transition-all animate-in fade-in zoom-in-95 pointer-events-auto"
              onMouseEnter={() => setHoveredIdea(hoveredIdea)}
              onMouseLeave={() => setHoveredIdea(null)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#BEF264] text-[#10241B] font-black text-xs flex items-center justify-center">
                    {hoveredIdea.order_num}
                  </span>
                  <span className="text-xs font-bold text-slate-300">Ide Terpilih</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: QUADRANT_CONFIG[hoveredIdea.quadrant].bgTint,
                    color: QUADRANT_CONFIG[hoveredIdea.quadrant].color,
                  }}
                >
                  {hoveredIdea.quadrant}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                {hoveredIdea.name}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {hoveredIdea.description}
              </p>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center bg-black/40 p-2 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Feasibility</span>
                  <span className="font-bold text-white">{hoveredIdea.feasibility} / 5</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Impact</span>
                  <span className="font-bold text-white">{hoveredIdea.impact} / 5</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Skor</span>
                  <span className="font-extrabold text-[#BEF264]">
                    {hoveredIdea.total_score} / 10
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenDetailModal(hoveredIdea)}
                className="mt-2.5 w-full py-1.5 rounded-xl bg-[#BEF264] hover:bg-[#a3e635] text-[#10241B] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Buka Analisis Lengkap</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* X-Axis Numerical Ruler & Label (Feasibility) */}
      <div className="relative pl-9 sm:pl-11 pr-2 pt-1 border-t border-slate-100 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-slate-400 select-none">
          <div className="flex flex-col items-center">
            <span className={`transition-colors ${activeFocusIdea?.feasibility === 1 ? 'text-slate-700 font-black' : ''}`}>1</span>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Min</span>
          </div>
          <span className={`transition-colors ${activeFocusIdea?.feasibility === 2 ? 'text-slate-700 font-black' : ''}`}>2</span>
          <span className={`transition-colors ${activeFocusIdea?.feasibility === 3 ? 'text-sky-600 font-black' : ''}`}>3</span>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-extrabold text-[#10241B] bg-slate-100 px-1.5 py-0.2 rounded-md">3.5</span>
            <span className="text-[8px] font-semibold text-slate-400">Batas</span>
          </div>
          <span className={`transition-colors ${activeFocusIdea?.feasibility === 4 ? 'text-emerald-600 font-black' : ''}`}>4</span>
          <div className="flex flex-col items-center">
            <span className={`transition-colors ${activeFocusIdea?.feasibility === 5 ? 'text-emerald-600 font-black' : ''}`}>5</span>
            <span className="text-[9px] font-black uppercase text-emerald-700 tracking-tighter">Max</span>
          </div>
        </div>

        {/* X-Axis Center Title */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#10241B] uppercase tracking-wider select-none">
          <span>Feasibility (Kelayakan Teknis & Biaya)</span>
          <span className="text-emerald-600 text-xs">▶</span>
        </div>
      </div>

      {/* Footer Interactive Quadrant Legend */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Filter:
          </span>

          {/* Legend Button: Prioritas Utama */}
          <button
            onClick={() =>
              setFilterQuadrant((prev) => (prev === 'PRIORITAS UTAMA' ? null : 'PRIORITAS UTAMA'))
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${filterQuadrant === 'PRIORITAS UTAMA'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>Prioritas Utama ({quadrantCounts['PRIORITAS UTAMA']})</span>
          </button>

          {/* Legend Button: Potensi */}
          <button
            onClick={() =>
              setFilterQuadrant((prev) => (prev === 'POTENSI' ? null : 'POTENSI'))
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${filterQuadrant === 'POTENSI'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span>Potensi ({quadrantCounts.POTENSI})</span>
          </button>

          {/* Legend Button: Pertimbangkan */}
          <button
            onClick={() =>
              setFilterQuadrant((prev) => (prev === 'PERTIMBANGKAN' ? null : 'PERTIMBANGKAN'))
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${filterQuadrant === 'PERTIMBANGKAN'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>Pertimbangkan ({quadrantCounts.PERTIMBANGKAN})</span>
          </button>

          {/* Legend Button: Tunda */}
          <button
            onClick={() =>
              setFilterQuadrant((prev) => (prev === 'TUNDA' ? null : 'TUNDA'))
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${filterQuadrant === 'TUNDA'
                ? 'bg-[#475569] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#475569]" />
            <span>Tunda ({quadrantCounts.TUNDA})</span>
          </button>

          {filterQuadrant && (
            <button
              onClick={() => setFilterQuadrant(null)}
              className="text-[10px] text-slate-400 hover:text-slate-700 underline font-semibold ml-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Klik pin untuk detail · Skala 1–5</span>
        </div>
      </div>
    </div>
  );
};
