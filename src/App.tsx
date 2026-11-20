import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { PriorityMatrix3D } from './components/PriorityMatrix3D';
import { ScoreBarChart } from './components/ScoreBarChart';
import { TopIdeasCard } from './components/TopIdeasCard';
import { RecommendedIdeaCard } from './components/RecommendedIdeaCard';
import { IdeaCRUDModal } from './components/IdeaCRUDModal';
import { IdeaDetailModal } from './components/IdeaDetailModal';
import { ReportView } from './components/ReportView';
import { BottomNav } from './components/BottomNav';
import type { Idea, IdeaInput } from './types/idea';
import {
  fetchIdeasFromSource,
  addIdeaSource,
  updateIdeaSource,
  deleteIdeaSource,
  resetIdeasSource,
  reorderIdeasSource,
  subscribeToRealtimeIdeas,
} from './lib/supabase';
import { INITIAL_IDEAS } from './data/initialIdeas';

export const App: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modal States
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState<boolean>(false);
  const [ideaToEdit, setIdeaToEdit] = useState<Idea | null>(null);
  const [ideaForDetail, setIdeaForDetail] = useState<Idea | null>(null);

  // Load Data
  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetchIdeasFromSource();
      setIdeas(res.ideas);
      setIsSupabaseLive(res.source === 'supabase');

      // Set initial selected idea to highest score or idea #1
      setSelectedIdea((current) => {
        if (current && res.ideas.some((i) => i.id === current.id)) {
          return res.ideas.find((i) => i.id === current.id) || null;
        }
        return (
          res.ideas.find((i) => i.order_num === 1) ||
          [...res.ideas].sort((a, b) => b.total_score - a.total_score)[0] ||
          null
        );
      });
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      if (!quiet) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime Listener
    const unsubscribe = subscribeToRealtimeIdeas(() => {
      loadData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Handlers
  const handleOpenAddModal = () => {
    setIdeaToEdit(null);
    setIsCRUDModalOpen(true);
  };

  const handleOpenEditModal = (idea: Idea) => {
    setIdeaToEdit(idea);
    setIsCRUDModalOpen(true);
  };

  const handleOpenDetailModal = (idea: Idea) => {
    setIdeaForDetail(idea);
  };

  const handleSaveIdea = async (input: IdeaInput, editId?: string) => {
    if (editId) {
      await updateIdeaSource(editId, input);
    } else {
      await addIdeaSource(input);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }
    await loadData(true);
  };

  const handleDeleteIdea = async (id: string) => {
    await deleteIdeaSource(id);
    await loadData(true);
  };

  const handleResetToDefault = async () => {
    await resetIdeasSource();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
    await loadData(true);
  };

  const handleReorderIdeas = async (reordered: Idea[]) => {
    setIdeas(reordered);
    await reorderIdeasSource(reordered);
  };

  return (
    <div className="app-bg min-h-screen text-[#10241B] flex">
      {/* Sidebar (Left Fixed) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Workspace Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-56 flex flex-col min-w-0">
        <main className="p-3.5 sm:p-6 md:p-8 max-w-[1500px] w-full mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-28 lg:pb-8">
          {/* Tab 1: Dashboard (Matches exact reference design) */}
          {activeTab === 'dashboard' && (
            <>
              {/* Header Bar */}
              <Header
                onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
                isSupabaseLive={isSupabaseLive}
                onRefreshData={() => loadData(false)}
                isRefreshing={isRefreshing}
              />

              {/* Row 1: 4 KPI Summary Cards */}
              <KPICards
                ideas={ideas}
                selectedIdea={selectedIdea}
                onSelectIdea={setSelectedIdea}
                onOpenDetailModal={handleOpenDetailModal}
              />

              {/* Row 2: Grid 2 Columns (Matriks Prioritas & Grafik Skor Ide) */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
                {/* Left Column: Upgraded 3D/2D Interactive Priority Matrix */}
                <PriorityMatrix3D
                  ideas={ideas}
                  selectedIdea={selectedIdea}
                  onSelectIdea={setSelectedIdea}
                  onOpenDetailModal={handleOpenDetailModal}
                />

                {/* Right Column: Grafik Skor Ide */}
                <ScoreBarChart
                  key="dashboard-chart"
                  ideas={ideas}
                  selectedIdea={selectedIdea}
                  onSelectIdea={setSelectedIdea}
                  onOpenDetailModal={handleOpenDetailModal}
                />
              </div>

              {/* Row 3: Grid 2 Columns (Top 3 Ide Terbaik & RECOMMENDED IDEA Card) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Top 3 Ide Terbaik */}
                <TopIdeasCard
                  ideas={ideas}
                  onSelectIdea={setSelectedIdea}
                  onOpenDetailModal={handleOpenDetailModal}
                />

                {/* Right: RECOMMENDED IDEA Dark Card */}
                <RecommendedIdeaCard
                  ideas={ideas}
                  onOpenDetailModal={handleOpenDetailModal}
                />
              </div>
            </>
          )}

          {/* Tab 2: Matriks Prioritas Dedicated View */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <PriorityMatrix3D
                ideas={ideas}
                selectedIdea={selectedIdea}
                onSelectIdea={setSelectedIdea}
                onOpenDetailModal={handleOpenDetailModal}
              />
            </div>
          )}

          {/* Tab 3: Grafik Dedicated View */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <ScoreBarChart
                key="dedicated-chart"
                ideas={ideas}
                selectedIdea={selectedIdea}
                onSelectIdea={setSelectedIdea}
                onOpenDetailModal={handleOpenDetailModal}
              />
            </div>
          )}

          {/* Tab 4: Laporan View */}
          {activeTab === 'report' && (
            <ReportView
              ideas={ideas}
              onOpenDetailModal={handleOpenDetailModal}
              onReorderIdeas={handleReorderIdeas}
            />
          )}
        </main>
      </div>

      {/* Bottom Navigation Bar (Khusus Tampilan Mobile) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* CRUD Modal (Tambah / Edit / Hapus / Reset) */}
      <IdeaCRUDModal
        isOpen={isCRUDModalOpen}
        onClose={() => setIsCRUDModalOpen(false)}
        ideaToEdit={ideaToEdit}
        onSave={handleSaveIdea}
        onDelete={handleDeleteIdea}
        onResetToDefault={handleResetToDefault}
        totalIdeasCount={ideas.length}
      />

      {/* Detail Modal */}
      <IdeaDetailModal
        idea={ideaForDetail}
        onClose={() => setIdeaForDetail(null)}
        onEdit={handleOpenEditModal}
      />
    </div>
  );
};

export default App;
