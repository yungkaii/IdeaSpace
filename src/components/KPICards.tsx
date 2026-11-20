import React from 'react';
import { Lightbulb, Star, Trophy, Target, ArrowRight } from 'lucide-react';
import type { Idea } from '../types/idea';
import { QUADRANT_CONFIG } from '../types/idea';

interface KPICardsProps {
  ideas: Idea[];
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  onOpenDetailModal: (idea: Idea) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  ideas,
  selectedIdea,
  onOpenDetailModal,
}) => {
  const totalIdeas = ideas.length;
  const highPriorityCount = ideas.filter((i) => i.quadrant === 'PRIORITAS UTAMA').length;

  const highestScore = ideas.reduce((max, i) => Math.max(max, i.total_score), 0);

  // If no idea selected, default to top scoring idea
  const topIdea = selectedIdea || (ideas.length > 0 ? [...ideas].sort((a, b) => b.total_score - a.total_score)[0] : null);

  const formattedOrderNum = topIdea ? String(topIdea.order_num).padStart(2, '0') : '--';

  const cardBase =
    'bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:px-5 sm:py-5 shadow-[0_6px_24px_rgba(16,36,27,0.06)] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-[0_10px_30px_rgba(16,36,27,0.10)] transition-shadow';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.15fr] gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-6">
      {/* 1. Total Ideas Card */}
      <div className={cardBase}>
        <div className="w-11 h-11 sm:w-[68px] sm:h-[68px] shrink-0 rounded-full bg-[#E2F4CC] text-[#10241B] flex items-center justify-center">
          <Lightbulb className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">Total Ideas</p>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#10241B]">{totalIdeas}</span>
          </div>
        </div>
      </div>

      {/* 2. High Priority Card */}
      <div className={cardBase}>
        <div className="w-11 h-11 sm:w-[68px] sm:h-[68px] shrink-0 rounded-full bg-[#FDF1C7] text-[#F5B301] flex items-center justify-center">
          <Star className="w-5 h-5 sm:w-8 sm:h-8 fill-[#F5B301] stroke-[#F5B301]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">High Priority</p>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#10241B]">{highPriorityCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Highest Score Card */}
      <div className={cardBase}>
        <div className="w-11 h-11 sm:w-[68px] sm:h-[68px] shrink-0 rounded-full bg-[#FDEBC4] text-[#E89B0C] flex items-center justify-center">
          <Trophy className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">Highest Score</p>
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#10241B]">{highestScore}</span>
            <span className="text-lg sm:text-3xl font-extrabold text-[#10241B]">/ 10</span>
          </div>
        </div>
      </div>

      {/* 4. Selected Idea (Dark Card) */}
      <div className="bg-[#10241B] text-white rounded-2xl sm:rounded-3xl p-3.5 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(16,36,27,0.25)] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group">
        <div className="w-11 h-11 sm:w-[64px] sm:h-[64px] shrink-0 rounded-full bg-[#1B3A2A] text-[#B7EA5C] flex items-center justify-center">
          <Target className="w-5 h-5 sm:w-9 sm:h-9 stroke-[2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">Selected Idea</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{formattedOrderNum}</span>
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#B7EA5C] text-[#10241B] truncate max-w-[110px] sm:max-w-none">
              {topIdea ? QUADRANT_CONFIG[topIdea.quadrant].label : 'Ide Unggulan'}
            </span>
          </div>
        </div>

        {topIdea && (
          <button
            onClick={() => onOpenDetailModal(topIdea)}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-white/20 hover:bg-[#B7EA5C] hover:text-[#10241B] text-white flex items-center justify-center transition-all duration-200 self-end sm:self-center"
            title="Lihat Detail Ide"
            aria-label="Lihat Detail Ide"
          >
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
