import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Trash2, AlertTriangle, Check } from 'lucide-react';
import type { Idea, IdeaInput } from '../types/idea';
import { calculateQuadrant, calculateTotalScore, QUADRANT_CONFIG } from '../types/idea';

interface IdeaCRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaToEdit: Idea | null;
  onSave: (input: IdeaInput, editId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onResetToDefault?: () => Promise<void>;
  totalIdeasCount: number;
}

export const IdeaCRUDModal: React.FC<IdeaCRUDModalProps> = ({
  isOpen,
  onClose,
  ideaToEdit,
  onSave,
  onDelete,
  totalIdeasCount,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [feasibility, setFeasibility] = useState<number>(4);
  const [impact, setImpact] = useState<number>(4);
  const [orderNum, setOrderNum] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (ideaToEdit) {
      setName(ideaToEdit.name);
      setDescription(ideaToEdit.description);
      setFeasibility(ideaToEdit.feasibility);
      setImpact(ideaToEdit.impact);
      setOrderNum(ideaToEdit.order_num);
    } else {
      setName('');
      setDescription('');
      setFeasibility(4);
      setImpact(4);
      setOrderNum(totalIdeasCount + 1);
    }
    setShowConfirmDelete(false);
  }, [ideaToEdit, isOpen, totalIdeasCount]);

  if (!isOpen) return null;

  const currentTotal = calculateTotalScore(feasibility, impact);
  const currentQuadrant = calculateQuadrant(feasibility, impact);
  const currentQuadrantConfig = QUADRANT_CONFIG[currentQuadrant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          order_num: orderNum,
          name: name.trim(),
          description: description.trim(),
          feasibility,
          impact,
        },
        ideaToEdit ? ideaToEdit.id : undefined
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!ideaToEdit) return;
    setIsSubmitting(true);
    try {
      await onDelete(ideaToEdit.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-[#E5ECE5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#F4F7F4]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#BEF264] text-[#0F1C24] flex items-center justify-center shadow-xs">
              {ideaToEdit ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0F1C24]">
                {ideaToEdit ? `Edit Ide #${ideaToEdit.order_num}` : 'Tambah Ide Inovatif Baru'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                KIK LKPD 6 · Matriks Prioritas Ide (Kelompok 8)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#0F1C24] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Idea Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Ide Inovatif
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Fitur Virtual AR Foot Measuring"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#BEF264] focus:ring-2 focus:ring-[#BEF264]/40 font-medium text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi & Nilai Tambah Ide
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan bagaimana ide ini menyelesaikan masalah nyata..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#BEF264] focus:ring-2 focus:ring-[#BEF264]/40 text-xs text-slate-700 resize-none font-normal"
            />
          </div>

          {/* Feasibility & Impact Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F7F4] p-4 rounded-2xl border border-[#E5ECE5]">
            {/* Feasibility */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-[#0F1C24]">Feasibility (Kelayakan)</span>
                <span className="px-2 py-0.5 rounded-md bg-[#0F1C24] text-white font-extrabold text-xs">
                  {feasibility} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={feasibility}
                onChange={(e) => setFeasibility(Number(e.target.value))}
                className="w-full accent-[#0F1C24] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                <span>1 (Sangat Sulit)</span>
                <span>5 (Mudah/Siap)</span>
              </div>
            </div>

            {/* Impact */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-[#0F1C24]">Impact (Dampak)</span>
                <span className="px-2 py-0.5 rounded-md bg-[#65A30D] text-white font-extrabold text-xs">
                  {impact} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className="w-full accent-[#65A30D] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                <span>1 (Rendah)</span>
                <span>5 (Sangat Signifikan)</span>
              </div>
            </div>
          </div>

          {/* Live Preview Calculated Quadrant & Score Box */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between"
            style={{
              backgroundColor: currentQuadrantConfig.bgTint,
              borderColor: currentQuadrantConfig.borderTint,
            }}
          >
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Prediksi Kuadran Otomatis
              </span>
              <span
                className="text-sm font-black tracking-tight"
                style={{ color: currentQuadrantConfig.color }}
              >
                {currentQuadrant}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {currentQuadrantConfig.desc}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block">Total Skor</span>
              <span className="text-2xl font-black text-[#0F1C24]">
                {currentTotal}
                <span className="text-xs text-slate-400 font-bold"> / 10</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 gap-2">
            {ideaToEdit ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Ide</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#BEF264] hover:bg-[#a3e635] text-[#0F1C24] font-black text-xs shadow-md shadow-lime-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{ideaToEdit ? 'Simpan Perubahan' : 'Tambahkan Ide'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Confirm Delete Confirmation Overlay */}
        {showConfirmDelete && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 p-6 flex flex-col justify-center items-center text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">
              Hapus Ide Ini?
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              "{ideaToEdit?.name}" akan dihapus dari Matriks Prioritas dan Database.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
