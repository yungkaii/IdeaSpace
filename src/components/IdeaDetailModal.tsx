import React from 'react';
import { X, Edit3, Lightbulb } from 'lucide-react';
import type { Idea } from '../types/idea';
import { QUADRANT_CONFIG } from '../types/idea';

interface IdeaDetailModalProps {
  idea: Idea | null;
  onClose: () => void;
  onEdit: (idea: Idea) => void;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  idea,
  onClose,
  onEdit,
}) => {
  if (!idea) return null;

  const config = QUADRANT_CONFIG[idea.quadrant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-[#E5ECE5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#F4F7F4]/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-sm"
              style={{ backgroundColor: config.color }}
            >
              {idea.order_num}
            </div>
            <div>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-0.5"
                style={{
                  backgroundColor: config.bgTint,
                  color: config.color,
                }}
              >
                {idea.quadrant}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F1C24] leading-snug">
                {idea.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#0F1C24] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Deskripsi Solusi Inovatif
            </h4>
            <p className="text-sm text-slate-700 font-medium leading-relaxed bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200">
              {idea.description || 'Tidak ada deskripsi rinci.'}
            </p>
          </div>

          {/* Scores Breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#F4F7F4] p-3 rounded-2xl border border-[#E5ECE5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Feasibility
              </span>
              <span className="text-xl font-black text-[#0F1C24]">
                {idea.feasibility} <span className="text-xs text-slate-400 font-bold">/ 5</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {idea.feasibility >= 4 ? 'Tinggi (Mudah)' : 'Rendah (Kompleks)'}
              </span>
            </div>

            <div className="bg-[#F4F7F4] p-3 rounded-2xl border border-[#E5ECE5]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Impact
              </span>
              <span className="text-xl font-black text-[#65A30D]">
                {idea.impact} <span className="text-xs text-slate-400 font-bold">/ 5</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {idea.impact >= 4 ? 'Sangat Tinggi' : 'Sedang/Rendah'}
              </span>
            </div>

            <div className="bg-[#0F1C24] text-white p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Total Skor
              </span>
              <span className="text-xl font-black text-[#BEF264]">
                {idea.total_score} <span className="text-xs text-slate-400 font-bold">/ 10</span>
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                {idea.total_score >= 8 ? 'Unggulan' : 'Standar'}
              </span>
            </div>
          </div>

          {/* Quadrant Analysis Note */}
          <div
            className="p-3.5 rounded-2xl border text-xs"
            style={{
              backgroundColor: config.bgTint,
              borderColor: config.borderTint,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold" style={{ color: config.color }}>
                Analisis Kuadran: {idea.quadrant}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed font-normal">
              {config.desc}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-400">
            Dibuat: {new Date(idea.created_at).toLocaleDateString('id-ID')}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(idea);
              }}
              className="px-4 py-2 rounded-xl bg-[#0F1C24] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data Ide</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
