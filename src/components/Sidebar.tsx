import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Grid2X2,
  BarChart3,
  FileText,
  Lightbulb,
  X
} from 'lucide-react';

export type NavTab = 'dashboard' | 'input' | 'matrix' | 'chart' | 'report';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenAddModal,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'input', label: 'Input Ide', icon: <PlusCircle className="w-5 h-5" />, isAction: true },
    { id: 'matrix', label: 'Matriks Prioritas', icon: <Grid2X2 className="w-5 h-5" /> },
    { id: 'chart', label: 'Grafik', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'report', label: 'Laporan', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 w-56 bg-[#10241B] text-white flex flex-col overflow-hidden transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header & Navigation */}
        <div className="relative z-10 px-4 pt-6 space-y-8">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full border border-dashed border-[#B7EA5C]/70 flex items-center justify-center text-[#C8F26B]">
                <Lightbulb className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <h1 className="text-[17px] font-extrabold tracking-tight text-white">
                  IDEA SPACE
                </h1>
                <p className="text-[10px] font-medium text-slate-400">
                  Turn Ideas into Impact
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction) {
                      onOpenAddModal();
                    } else {
                      onSelectTab(item.id);
                    }
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-[#B7EA5C] text-[#10241B] font-bold'
                      : 'text-slate-200 font-medium hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className={isActive ? 'text-[#10241B]' : 'text-slate-300'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Rocket, Tagline & Wave */}
        <div className="relative mt-auto h-[400px] shrink-0">
          {/* Wave: dark -> lime -> white */}
          <svg
            viewBox="0 0 224 240"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-[230px]"
            aria-hidden="true"
          >
            <path d="M0,70 C50,40 70,95 120,70 C170,45 200,30 224,10 L224,240 L0,240 Z" fill="#1F3F25" />
            <path d="M0,110 C60,125 110,70 160,50 C190,38 210,32 224,20 L224,240 L0,240 Z" fill="#A9DC4E" />
            <path d="M0,150 C60,165 120,105 170,85 C195,75 212,70 224,62 L224,240 L0,240 Z" fill="#FFFFFF" />
          </svg>

          {/* Rocket */}
          <svg
            viewBox="0 0 120 120"
            className="absolute left-3 top-0 w-28 h-28 drop-shadow-[0_6px_14px_rgba(183,234,92,0.25)]"
            aria-hidden="true"
          >
            <g transform="rotate(40 60 60)">
              <path d="M60,8 C78,26 82,52 76,80 L44,80 C38,52 42,26 60,8 Z" fill="#F8FAFC" />
              <path d="M60,8 C68,16 73,26 75,36 L45,36 C47,26 52,16 60,8 Z" fill="#E2E8F0" />
              <circle cx="60" cy="50" r="9" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="3" />
              <path d="M44,62 L28,82 L44,80 Z" fill="#8CCB3A" />
              <path d="M76,62 L92,82 L76,80 Z" fill="#8CCB3A" />
              <path d="M50,80 L70,80 L60,108 Z" fill="#F59E0B" />
              <path d="M54,80 L66,80 L60,98 Z" fill="#FDE68A" />
            </g>
          </svg>

          {/* Tagline */}
          <div className="absolute left-4 right-4 top-[128px]">
            <p className="text-[17px] font-extrabold text-white leading-snug tracking-tight">
              Better Ideas,
              <br />
              Bigger Impact!
            </p>
          </div>

          <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-medium text-slate-400">
            KIK LKPD 6 · Kelompok 8
          </div>
        </div>
      </aside>
    </>
  );
};
