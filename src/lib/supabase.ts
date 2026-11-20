import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Idea, IdeaInput } from '../types/idea';
import { calculateQuadrant, calculateTotalScore } from '../types/idea';
import { INITIAL_IDEAS, createNewIdea } from '../data/initialIdeas';

// ==============================================================================
// Mode Penyimpanan: LocalStorage Aktif (Supabase disimpan untuk nanti)
// ==============================================================================
export const USE_SUPABASE = false; // Ubah ke true nanti jika sudah siap menghubungkan Supabase

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  USE_SUPABASE &&
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const STORAGE_KEY = 'idea_space_ideas_v1';

// Membaca data langsung dari LocalStorage (dengan fallback ke 10 Ide LKPD 5)
export function getLocalIdeas(): Idea[] {
  if (typeof window === 'undefined') return INITIAL_IDEAS;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_IDEAS));
      return INITIAL_IDEAS;
    }
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_IDEAS));
      return INITIAL_IDEAS;
    }
    return parsed;
  } catch (err) {
    console.warn('Gagal membaca LocalStorage, memakai data default:', err);
    return INITIAL_IDEAS;
  }
}

// Menyimpan data ke LocalStorage
export function saveLocalIdeas(ideas: Idea[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    // Trigger custom event untuk tab sync
    window.dispatchEvent(new Event('ideas_local_updated'));
  } catch (err) {
    console.error('Gagal menyimpan ke LocalStorage:', err);
  }
}

// Ambil data ide (LocalStorage sebagai prioritas utama)
export async function fetchIdeasFromSource(): Promise<{ ideas: Idea[]; source: 'supabase' | 'local' }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('order_num', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Idea[] = data.map((row) => ({
          id: row.id,
          order_num: row.order_num,
          name: row.name,
          description: row.description || '',
          feasibility: row.feasibility,
          impact: row.impact,
          total_score: row.total_score ?? calculateTotalScore(row.feasibility, row.impact),
          quadrant: row.quadrant ?? calculateQuadrant(row.feasibility, row.impact),
          created_at: row.created_at || new Date().toISOString(),
        }));
        saveLocalIdeas(mapped);
        return { ideas: mapped, source: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase fetch exception, memakai LocalStorage:', err);
    }
  }

  // Default: Ambil dari LocalStorage
  const local = getLocalIdeas();
  return { ideas: local, source: 'local' };
}

// Tambah Ide baru ke LocalStorage
export async function addIdeaSource(input: IdeaInput): Promise<Idea> {
  const f = Math.min(5, Math.max(1, Math.round(input.feasibility)));
  const i = Math.min(5, Math.max(1, Math.round(input.impact)));
  const newIdea = createNewIdea(input.order_num, input.name, input.description, f, i);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert([
          {
            order_num: newIdea.order_num,
            name: newIdea.name,
            description: newIdea.description,
            feasibility: newIdea.feasibility,
            impact: newIdea.impact,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        newIdea.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase insert skipped, disimpan ke LocalStorage:', err);
    }
  }

  const local = getLocalIdeas();
  const updated = [...local, newIdea];
  saveLocalIdeas(updated);
  return newIdea;
}

// Update Ide di LocalStorage
export async function updateIdeaSource(id: string, updates: Partial<IdeaInput>): Promise<Idea | null> {
  const currentList = getLocalIdeas();
  const target = currentList.find((it) => it.id === id);
  if (!target) return null;

  const f = updates.feasibility !== undefined
    ? Math.min(5, Math.max(1, Math.round(updates.feasibility)))
    : target.feasibility;
  const i = updates.impact !== undefined
    ? Math.min(5, Math.max(1, Math.round(updates.impact)))
    : target.impact;

  const updatedTarget: Idea = {
    ...target,
    name: updates.name ?? target.name,
    description: updates.description ?? target.description,
    order_num: updates.order_num ?? target.order_num,
    feasibility: f,
    impact: i,
    total_score: calculateTotalScore(f, i),
    quadrant: calculateQuadrant(f, i),
  };

  if (isSupabaseConfigured && supabase && !id.startsWith('local-')) {
    try {
      await supabase
        .from('ideas')
        .update({
          order_num: updatedTarget.order_num,
          name: updatedTarget.name,
          description: updatedTarget.description,
          feasibility: updatedTarget.feasibility,
          impact: updatedTarget.impact,
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase update skipped, disimpan ke LocalStorage:', err);
    }
  }

  const updatedList = currentList.map((it) => (it.id === id ? updatedTarget : it));
  saveLocalIdeas(updatedList);
  return updatedTarget;
}

// Hapus Ide dari LocalStorage
export async function deleteIdeaSource(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase && !id.startsWith('local-')) {
    try {
      await supabase.from('ideas').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete skipped:', err);
    }
  }

  const currentList = getLocalIdeas();
  const updatedList = currentList.filter((it) => it.id !== id);
  saveLocalIdeas(updatedList);
  return true;
}

// Reset data ke 10 Ide Awal LKPD 5
export async function resetIdeasSource(): Promise<Idea[]> {
  saveLocalIdeas(INITIAL_IDEAS);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('ideas').delete().neq('order_num', 999999);
      const rowsToInsert = INITIAL_IDEAS.map((it) => ({
        order_num: it.order_num,
        name: it.name,
        description: it.description,
        feasibility: it.feasibility,
        impact: it.impact,
      }));
      await supabase.from('ideas').insert(rowsToInsert);
    } catch (err) {
      console.warn('Supabase reset skipped:', err);
    }
  }

  return INITIAL_IDEAS;
}

// Reorder / Urutkan Ulang Ide (LocalStorage sync)
export async function reorderIdeasSource(reorderedIdeas: Idea[]): Promise<void> {
  const updated = reorderedIdeas.map((idea, index) => ({
    ...idea,
    order_num: index + 1,
  }));
  saveLocalIdeas(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      for (const item of updated) {
        if (!item.id.startsWith('local-')) {
          await supabase.from('ideas').update({ order_num: item.order_num }).eq('id', item.id);
        }
      }
    } catch (err) {
      console.warn('Supabase reorder sync skipped:', err);
    }
  }
}

// Listener perubahan data (LocalStorage sync)
export function subscribeToRealtimeIdeas(onChange: () => void): () => void {
  const handleLocalUpdate = () => {
    onChange();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('ideas_local_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  let cleanupSupabase = () => {};
  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel('public:ideas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => {
        onChange();
      })
      .subscribe();

    cleanupSupabase = () => {
      supabase.removeChannel(channel);
    };
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('ideas_local_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
    cleanupSupabase();
  };
}
