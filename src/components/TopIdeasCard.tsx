import React from 'react';
import { Trophy } from 'lucide-react';
import type { Idea } from '../types/idea';

interface TopIdeasCardProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  onOpenDetailModal: (idea: Idea) => void;
}

export const TopIdeasCard: React.FC<TopIdeasCardProps> = ({
  ideas,
  onSelectIdea,
  onOpenDetailModal,
}) => {
  const topThree = [...ideas]
    .sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (b.impact !== a.impact) return b.impact - a.impact;
      return b.feasibility - a.feasibility;
    })
    .slice(0, 3);

  const rankBadges = [
    { bg: 'bg-[#F9C23C]', text: 'text-[#10241B]', ring: 'ring-[#FCE9AE]' }, // Gold
    { bg: 'bg-[#CBD5E1]', text: 'text-[#334155]', ring: 'ring-[#E8EDF3]' }, // Silver
    { bg: 'bg-[#D98A3D]', text: 'text-white', ring: 'ring-[#F3D9BE]' },     // Bronze
  ];

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_6px_24px_rgba(16,36,27,0.06)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <Trophy className="w-7 h-7 text-[#F5B301] fill-[#F5B301]/30 stroke-[2]" />
        <h3 className="text-lg md:text-xl font-extrabold text-[#10241B] tracking-tight">
          Top 3 Ide Terbaik
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 flex flex-col">
        {topThree.map((idea, index) => {
          const rank = rankBadges[index] || rankBadges[2];
          const progressPercent = Math.min(100, (idea.total_score / 10) * 100);

          return (
            <div
              key={idea.id}
              onClick={() => {
                onSelectIdea(idea);
                onOpenDetailModal(idea);
              }}
              className="flex items-center gap-3 sm:gap-4 py-3.5 border-b last:border-b-0 border-slate-100 hover:bg-[#F7FBEF] rounded-xl px-1 transition-colors cursor-pointer group"
            >
              {/* Rank Medal Circle */}
              <div
                className={`w-8 h-8 rounded-full ${rank.bg} ${rank.text} flex items-center justify-center font-bold text-sm shrink-0 ring-4 ${rank.ring}`}
              >
                {index + 1}
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#10241B] truncate">
                  {idea.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                  Feasibility: {idea.feasibility} | Impact: {idea.impact}
                </p>
              </div>

              {/* Green Progress Bar */}
              <div className="hidden sm:block w-28 lg:w-36 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-[#86C232] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Total Score Box */}
              <div className="w-12 h-12 rounded-2xl bg-[#F4F6F2] flex items-center justify-center shrink-0 group-hover:bg-[#B7EA5C] transition-colors">
                <span className="text-xl font-extrabold text-[#10241B]">
                  {idea.total_score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
