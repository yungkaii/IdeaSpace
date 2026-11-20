import React from 'react';
import {
  LayoutDashboard,
  Grid2X2,
  Plus,
  BarChart3,
  FileText
} from 'lucide-react';
import type { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="no-print fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#10241B]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* 1. Tab Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all ${
            activeTab === 'dashboard'
              ? 'text-[#BEF264]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#BEF264]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Dashboard</span>
        </button>

        {/* 2. Tab Matriks */}
        <button
          onClick={() => onSelectTab('matrix')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all ${
            activeTab === 'matrix'
              ? 'text-[#BEF264]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Grid2X2 className="w-5 h-5 stroke-[2.2]" />
            {activeTab === 'matrix' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#BEF264]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Matriks</span>
        </button>

        {/* 3. Center FAB: Input Ide Baru */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-[#BEF264] text-[#10241B] flex items-center justify-center shadow-[0_4px_20px_rgba(190,242,100,0.5)] active:scale-90 hover:scale-105 transition-all border-3 border-[#10241B]"
            title="Tambah Ide Baru"
            aria-label="Tambah Ide Baru"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[10px] font-extrabold text-[#BEF264] mt-0.5 tracking-tight">
            Input
          </span>
        </div>

        {/* 4. Tab Grafik */}
        <button
          onClick={() => onSelectTab('chart')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all ${
            activeTab === 'chart'
              ? 'text-[#BEF264]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            {activeTab === 'chart' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#BEF264]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Grafik</span>
        </button>

        {/* 5. Tab Laporan */}
        <button
          onClick={() => onSelectTab('report')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all ${
            activeTab === 'report'
              ? 'text-[#BEF264]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileText className="w-5 h-5 stroke-[2.2]" />
            {activeTab === 'report' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#BEF264]" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Laporan</span>
        </button>
      </div>
    </nav>
  );
};

