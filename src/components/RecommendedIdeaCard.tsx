import React from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import type { Idea } from '../types/idea';

interface RecommendedIdeaCardProps {
  ideas: Idea[];
  onOpenDetailModal: (idea: Idea) => void;
}

export const RecommendedIdeaCard: React.FC<RecommendedIdeaCardProps> = ({
  ideas,
  onOpenDetailModal,
}) => {
  // Find top recommended idea (Instant Auto-Gateway Payment or highest total_score)
  const recommended =
    ideas.find((i) => i.name.toLowerCase().includes('auto-gateway')) ||
    [...ideas].sort((a, b) => b.total_score - a.total_score)[0] ||
    ideas[0];

  if (!recommended) return null;

  return (
    <div className="relative bg-[#10241B] text-white rounded-3xl p-6 md:p-7 shadow-[0_10px_30px_rgba(16,36,27,0.25)] overflow-hidden min-h-[230px] flex flex-col justify-center">
      {/* Lime wave di pojok kanan bawah */}
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="absolute right-0 bottom-0 w-[75%] h-full pointer-events-none"
        aria-hidden="true"
      >
        <path d="M400,40 C330,60 300,130 230,180 C190,208 120,225 60,240 L400,240 Z" fill="#8CCB3A" opacity="0.9" />
        <path d="M400,90 C350,105 320,160 260,200 C230,220 190,232 150,240 L400,240 Z" fill="#B7EA5C" opacity="0.55" />
      </svg>

      {/* Main Content & Illustration Layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Text & Badges */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A2A] text-[#D9F99D] text-[11px] font-bold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#B7EA5C]" />
            <span>RECOMMENDED IDEA</span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {recommended.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
              {recommended.description}
            </p>
          </div>

          {/* Score Pill & Action Button */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-[#B7EA5C] text-[#10241B] font-bold text-xs sm:text-sm">
              <span className="w-6 h-6 rounded-full bg-[#10241B] text-[#B7EA5C] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </span>
              <span>Skor: {recommended.total_score} / 10</span>
            </div>

            <button
              onClick={() => onOpenDetailModal(recommended)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/15 cursor-pointer"
            >
              <span>Lihat lebih lanjut</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Ilustrasi HP + kartu + koin */}
        <div className="md:col-span-5 relative flex items-center justify-center min-h-[190px]">
          <svg viewBox="0 0 260 240" className="w-full max-w-[260px] h-auto drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]" aria-hidden="true">
            {/* Smartphone */}
            <g transform="rotate(14 150 110)">
              <rect x="100" y="14" width="104" height="188" rx="18" fill="#1E3A8A" />
              <rect x="106" y="20" width="92" height="176" rx="13" fill="#F8FAFC" />
              <rect x="136" y="24" width="32" height="5" rx="2.5" fill="#1E3A8A" />
              <circle cx="152" cy="92" r="26" fill="#22A55A" />
              <path d="M139,92 L148,101 L166,82" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <rect x="124" y="132" width="56" height="6" rx="3" fill="#CBD5E1" />
              <rect x="134" y="144" width="36" height="6" rx="3" fill="#E2E8F0" />
            </g>

            {/* Credit card */}
            <g transform="rotate(-18 62 168)">
              <rect x="14" y="132" width="104" height="66" rx="9" fill="#3B6FE0" />
              <rect x="14" y="146" width="104" height="10" fill="#2A56C0" />
              <rect x="24" y="166" width="22" height="16" rx="3" fill="#F5C242" />
              <rect x="24" y="186" width="54" height="5" rx="2.5" fill="#A9C1F5" />
            </g>

            {/* Gold coins */}
            <g>
              <ellipse cx="206" cy="212" rx="32" ry="10" fill="#B7791F" />
              <rect x="174" y="196" width="64" height="16" fill="#E0A526" />
              <ellipse cx="206" cy="196" rx="32" ry="10" fill="#F6C945" />
              <ellipse cx="206" cy="194" rx="32" ry="10" fill="#F6C945" />
              <ellipse cx="206" cy="180" rx="30" ry="9" fill="#B7791F" />
              <rect x="176" y="166" width="60" height="14" fill="#E0A526" />
              <ellipse cx="206" cy="166" rx="30" ry="9" fill="#F6C945" />
              <ellipse cx="206" cy="152" rx="28" ry="8" fill="#B7791F" />
              <rect x="178" y="140" width="56" height="12" fill="#E0A526" />
              <ellipse cx="206" cy="140" rx="28" ry="8" fill="#FBDA6B" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
