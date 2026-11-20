import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  isSupabaseLive?: boolean;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
}) => {
  return (
    <header className="relative mb-4 sm:mb-6 min-h-0 sm:min-h-[150px] no-print">
      {/* Dekorasi gelombang gelap + lime di pojok kanan atas */}
      <div
        className="pointer-events-none absolute -top-4 sm:-top-6 md:-top-8 -right-4 sm:-right-6 md:-right-8 w-[340px] md:w-[560px] h-[190px] md:h-[210px] hidden sm:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 560 210" className="w-full h-full" preserveAspectRatio="xMaxYMin meet">
          {/* Lime wave */}
          <path
            d="M0,0 C6,70 60,118 150,150 C250,188 350,206 450,150 C500,122 535,108 560,104 L560,0 Z"
            fill="#B7EA5C"
          />
          <path
            d="M20,0 C30,60 80,100 160,128 C250,158 340,172 430,128 C490,100 530,92 560,88 L560,0 Z"
            fill="#8CCB3A"
            opacity="0.55"
          />
          {/* Dark wave */}
          <path
            d="M120,0 C120,62 160,110 230,138 C300,166 370,166 440,126 C480,104 520,96 560,94 L560,0 Z"
            fill="#10241B"
          />
        </svg>

        {/* Lightbulb */}
        <svg
          viewBox="0 0 120 130"
          className="absolute left-[52%] top-[22px] w-[96px] md:w-[112px] drop-shadow-[0_0_18px_rgba(251,213,60,0.55)]"
        >
          <g stroke="#FBD53C" strokeWidth="5" strokeLinecap="round">
            <line x1="60" y1="4" x2="60" y2="15" />
            <line x1="24" y1="16" x2="31" y2="24" />
            <line x1="96" y1="16" x2="89" y2="24" />
            <line x1="10" y1="52" x2="21" y2="52" />
            <line x1="110" y1="52" x2="99" y2="52" />
          </g>
          <circle cx="60" cy="54" r="33" fill="#FBD53C" />
          <path d="M40,76 Q42,90 46,96 H74 Q78,90 80,76 Z" fill="#FBD53C" />
          <path d="M38,40 Q42,28 54,24" stroke="#FDE98A" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path
            d="M50,92 L50,64 C46,54 56,46 60,56 C64,46 74,54 70,64 L70,92"
            stroke="#10241B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="45" y="97" width="30" height="8" rx="4" fill="#E5E7EB" stroke="#10241B" strokeWidth="3" />
          <rect x="47" y="106" width="26" height="8" rx="4" fill="#E5E7EB" stroke="#10241B" strokeWidth="3" />
          <rect x="52" y="115" width="16" height="8" rx="4" fill="#E5E7EB" stroke="#10241B" strokeWidth="3" />
        </svg>
      </div>

      {/* Konten utama */}
      <div className="relative z-10 space-y-2 sm:space-y-3 pt-1 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Innovation Dashboard Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#E7F5CF] text-[#10241B] text-xs font-semibold">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#5DAE2B]" />
            <span>Innovation Dashboard</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#10241B] flex items-center gap-2 sm:gap-3">
          Good Morning, Team!
          <span className="inline-block text-2xl sm:text-4xl origin-bottom-right hover:rotate-12 transition-transform">👋</span>
        </h1>
        <p className="text-xs sm:text-base md:text-lg text-slate-500 font-medium">
          Analisis ide dengan data, pilih yang terbaik untuk dikembangkan.
        </p>
      </div>
    </header>
  );
};
