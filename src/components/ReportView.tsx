import React, { useState, useMemo, useRef } from 'react';
import { Printer, Award, FileText, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { Idea } from '../types/idea';
import { QUADRANT_CONFIG } from '../types/idea';

interface ReportViewProps {
  ideas: Idea[];
  onOpenDetailModal: (idea: Idea) => void;
  onReorderIdeas?: (reordered: Idea[]) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  ideas,
  onOpenDetailModal,
  onReorderIdeas,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  const handlePrint = () => {
    window.print();
  };

  const highPriority = ideas.filter((i) => i.quadrant === 'PRIORITAS UTAMA');
  const potential = ideas.filter((i) => i.quadrant === 'POTENSI');
  const consider = ideas.filter((i) => i.quadrant === 'PERTIMBANGKAN');
  const postpone = ideas.filter((i) => i.quadrant === 'TUNDA');

  // Skor tertinggi nomor satu (tie-breaker: total_score desc, impact desc, feasibility desc, order_num asc)
  const topIdea = useMemo(() => {
    if (!ideas || ideas.length === 0) return null;
    return [...ideas].sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (b.impact !== a.impact) return b.impact - a.impact;
      if (b.feasibility !== a.feasibility) return b.feasibility - a.feasibility;
      return a.order_num - b.order_num;
    })[0];
  }, [ideas]);

  // Move item and reassign sequential numbers 1..N
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= ideas.length || fromIndex === toIndex) return;
    const updated = [...ideas];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    // Otomatis sesuaikan nomor urut menjadi berurutan 1..N
    const renumbered = updated.map((item, idx) => ({
      ...item,
      order_num: idx + 1,
    }));

    if (onReorderIdeas) {
      onReorderIdeas(renumbered);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (index: number, e: React.DragEvent) => {
    isDraggingRef.current = true;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveItem(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Print Action */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-[#E5ECE5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFCCB] text-[#3F6212] text-xs font-bold mb-1.5 sm:mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen Resmi LKPD 6</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F1C24] tracking-tight">
            Laporan Validasi & Matriks Prioritas Ide
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1">
            Mata Pelajaran: Konsentrasi Keahlian PPLG (KIK) · Kelas XI PPLG 2 · Kelompok 8
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0F1C24] hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#BEF264]" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="printable-report bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 border border-[#E5ECE5] shadow-sm space-y-6 sm:space-y-8">
        {/* Header Document */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#10241B] text-[#BEF264] text-[10px] font-black uppercase tracking-wider mb-2">
                Dokumen Resmi LKPD 6 · KIK
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F1C24] tracking-tight">
                IDEA SPACE — EXECUTIVE REPORT
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Topik: Membuat Aplikasi Validitas Ide Menggunakan Logika Quadran (Matriks Prioritas)
              </p>
              <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-extrabold text-[#10241B] block mb-0.5">Daftar Anggota Kelompok:</span>
                <span className="font-medium text-slate-800">
                  1. Abdul Haqim · 2. Disya Al Fanesa · 3. Rangga Danadyaksa · 4. Yukafii
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600 shrink-0 space-y-1">
              <p className="font-black text-[#0F1C24] text-sm">Kelas: XI PPLG 2</p>
              <p><strong className="text-slate-800">Mata Pelajaran:</strong> KIK (Kreativitas Inovasi & Kewirausahaan)</p>
              <p><strong className="text-slate-800">Semester / TP:</strong> Ganjil / 2026-2027</p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 block">Prioritas Utama</span>
            <span className="text-2xl font-black text-emerald-700">{highPriority.length} Ide</span>
            <p className="text-[10px] text-emerald-600 mt-0.5">Feasibility & Impact ≥ 4</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-blue-800 block">Potensi</span>
            <span className="text-2xl font-black text-blue-700">{potential.length} Ide</span>
            <p className="text-[10px] text-blue-600 mt-0.5">Strategic Future Bets</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-800 block">Pertimbangkan</span>
            <span className="text-2xl font-black text-amber-700">{consider.length} Ide</span>
            <p className="text-[10px] text-amber-600 mt-0.5">Quick Wins (Impact Rendah)</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block">Tunda</span>
            <span className="text-2xl font-black text-slate-600">{postpone.length} Ide</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Efisiensi Minimal</p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-[#0F1C24] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BEF264]" />
              Daftar Ide Inovatif & Urutan Prioritas ({ideas.length} Ide)
            </h3>
            <span className="no-print text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              Tahan & geser baris untuk mengubah nomor urut
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0F1C24] text-white font-extrabold select-none">
                  <th className="py-3 px-2 text-center w-16">No</th>
                  <th className="py-3 px-4">Nama Ide Inovatif</th>
                  <th className="py-3 px-3 text-center w-24">Feasibility</th>
                  <th className="py-3 px-3 text-center w-20">Impact</th>
                  <th className="py-3 px-3 text-center w-24">Total Skor</th>
                  <th className="py-3 px-4 text-center w-36">Kuadran</th>
                  <th className="py-3 px-4">Deskripsi & Nilai Tambah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {ideas.map((idea, index) => {
                  const config = QUADRANT_CONFIG[idea.quadrant];
                  const isTop = topIdea?.id === idea.id;
                  const isBeingDragged = draggedIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <tr
                      key={idea.id}
                      draggable
                      onDragStart={(e) => handleDragStart(index, e)}
                      onDragOver={(e) => handleDragOver(index, e)}
                      onDrop={(e) => handleDrop(index, e)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        onOpenDetailModal(idea);
                      }}
                      className={`group transition-all cursor-pointer ${
                        isBeingDragged
                          ? 'opacity-40 bg-slate-100'
                          : isOver
                          ? 'bg-lime-50/80 ring-2 ring-[#BEF264]'
                          : isTop
                          ? 'bg-amber-50/50 hover:bg-amber-50/80'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Kolom No + Drag Handle + Quick Move */}
                      <td className="py-3 px-2 text-center font-black text-slate-900 bg-slate-50/50 w-16 select-none">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className="no-print cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-600 transition-colors p-0.5"
                            title="Klik & Geser untuk mengubah nomor urutan"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>
                          <span className="min-w-[1.2rem] text-center">{index + 1}</span>
                          <div className="hidden sm:group-hover:flex flex-col no-print ml-0.5">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveItem(index, index - 1);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xs transition-colors"
                                title="Geser ke Atas"
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {index < ideas.length - 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveItem(index, index + 1);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xs transition-colors"
                                title="Geser ke Bawah"
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kolom Nama Ide + Badge TOP #1 */}
                      <td className="py-3 px-4 font-bold text-[#0F1C24]">
                        <div className="flex items-center gap-2">
                          <span>{idea.name}</span>
                          {isTop && (
                            <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-xs bg-amber-400 text-[#0F1C24] font-black text-[9px] shadow-xs shrink-0 animate-in fade-in">
                              ★ TOP #1
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {idea.feasibility} / 5
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#65A30D]">
                        {idea.impact} / 5
                      </td>
                      <td className="py-3 px-3 text-center font-black text-base text-[#0F1C24]">
                        {idea.total_score}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block"
                          style={{
                            backgroundColor: config.bgTint,
                            color: config.color,
                          }}
                        >
                          {idea.quadrant}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                        {idea.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Analysis & Recommendation */}
        <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 space-y-4 print-avoid-break">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-extrabold text-[#0F1C24] uppercase tracking-wider">
              Kesimpulan & Rekomendasi Eksekusi Kelompok 8
            </h4>
          </div>

          <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
            <p>
              Berdasarkan hasil analisis matriks 2D dan 3D di atas, dari total {ideas.length} ide yang dievaluasi, sebanyak{' '}
              <strong>{highPriority.length} ide</strong> berhasil masuk ke dalam kuadran <strong>PRIORITAS UTAMA</strong>.
              Hal ini menunjukkan bahwa kelompok memiliki pondasi solusi yang sangat matang baik dari segi kelayakan teknis (Feasibility) maupun dampak bisnis (Impact).
            </p>
            {topIdea ? (
              <p>
                Solusi prioritas tertinggi yang direkomendasikan adalah <strong>{topIdea.name}</strong> dengan skor total{' '}
                <strong>{topIdea.total_score} / 10</strong> (Feasibility: {topIdea.feasibility}/5, Impact: {topIdea.impact}/5 — Kuadran: {topIdea.quadrant}). Solusi ini disarankan untuk menjadi <em>Minimum Viable Product (MVP)</em> tahap pertama karena memiliki rasio efektivitas dan kelayakan paling optimal dalam pengujian LKPD 6.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
