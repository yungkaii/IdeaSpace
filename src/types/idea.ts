export type QuadrantType = 'PRIORITAS UTAMA' | 'POTENSI' | 'PERTIMBANGKAN' | 'TUNDA';

export interface Idea {
  id: string;
  order_num: number;
  name: string;
  description: string;
  feasibility: number; // 1 - 5
  impact: number;      // 1 - 5
  total_score: number; // 2 - 10
  quadrant: QuadrantType;
  created_at: string;
}

export interface IdeaInput {
  order_num: number;
  name: string;
  description: string;
  feasibility: number;
  impact: number;
}

export function calculateQuadrant(feasibility: number, impact: number): QuadrantType {
  if (feasibility >= 4 && impact >= 4) {
    return 'PRIORITAS UTAMA';
  } else if (feasibility <= 3 && impact >= 4) {
    return 'POTENSI';
  } else if (feasibility >= 4 && impact <= 3) {
    return 'PERTIMBANGKAN';
  } else {
    return 'TUNDA';
  }
}

export function calculateTotalScore(feasibility: number, impact: number): number {
  return feasibility + impact;
}

export const QUADRANT_CONFIG: Record<QuadrantType, {
  label: string;
  color: string;
  bgTint: string;
  borderTint: string;
  badgeBg: string;
  badgeText: string;
  desc: string;
}> = {
  'PRIORITAS UTAMA': {
    label: 'Prioritas Utama',
    color: '#22C55E',
    bgTint: 'rgba(34, 197, 94, 0.12)',
    borderTint: 'rgba(34, 197, 94, 0.4)',
    badgeBg: '#DCFCE7',
    badgeText: '#15803D',
    desc: 'Kelayakan Tinggi (4-5), Dampak Tinggi (4-5). Kerjakan sekarang!',
  },
  'POTENSI': {
    label: 'Potensi',
    color: '#3B82F6',
    bgTint: 'rgba(59, 130, 246, 0.12)',
    borderTint: 'rgba(59, 130, 246, 0.4)',
    badgeBg: '#DBEAFE',
    badgeText: '#1D4ED8',
    desc: 'Kelayakan Rendah (1-3), Dampak Tinggi (4-5). Proyek strategis masa depan.',
  },
  'PERTIMBANGKAN': {
    label: 'Pertimbangkan',
    color: '#F59E0B',
    bgTint: 'rgba(245, 158, 11, 0.12)',
    borderTint: 'rgba(245, 158, 11, 0.4)',
    badgeBg: '#FEF3C7',
    badgeText: '#B45309',
    desc: 'Kelayakan Tinggi (4-5), Dampak Rendah (1-3). Kemenangan cepat (quick wins).',
  },
  'TUNDA': {
    label: 'Tunda',
    color: '#64748B',
    bgTint: 'rgba(100, 116, 139, 0.12)',
    borderTint: 'rgba(100, 116, 139, 0.4)',
    badgeBg: '#F1F5F9',
    badgeText: '#475569',
    desc: 'Kelayakan Rendah (1-3), Dampak Rendah (1-3). Efisiensi rendah, abaikan sementara.',
  },
};

