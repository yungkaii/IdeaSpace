import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts';
import type { Idea } from '../types/idea';

interface ScoreBarChartProps {
  ideas: Idea[];
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  onOpenDetailModal: (idea: Idea) => void;
}

export const ScoreBarChart: React.FC<ScoreBarChartProps> = ({
  ideas,
  selectedIdea,
  onSelectIdea,
  onOpenDetailModal,
}) => {
  const [isStacked, setIsStacked] = useState(true);

  // Sort ideas by order_num for the X-axis
  const sortedIdeas = [...ideas].sort((a, b) => a.order_num - b.order_num);

  const chartData = sortedIdeas.map((idea) => ({
    id: idea.id,
    order_num: idea.order_num,
    name: idea.name,
    shortName: `Ide ${idea.order_num}`,
    feasibility: idea.feasibility,
    impact: idea.impact,
    total_score: idea.total_score,
    quadrant: idea.quadrant,
  }));

  // Calculate statistics
  const avgFeasibility = ideas.length > 0
    ? (ideas.reduce((acc, i) => acc + i.feasibility, 0) / ideas.length).toFixed(1)
    : '0';
  const avgImpact = ideas.length > 0
    ? (ideas.reduce((acc, i) => acc + i.impact, 0) / ideas.length).toFixed(1)
    : '0';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#10241B] text-white p-3.5 rounded-2xl shadow-xl border border-[#1B3A2A] text-xs max-w-xs z-30">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
            <span className="font-extrabold text-[#BEF264]">
              Ide #{data.order_num}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300">
              {data.quadrant}
            </span>
          </div>
          <p className="font-bold text-white text-xs mb-2 leading-tight">
            {data.name}
          </p>
          <div className="space-y-1 bg-black/40 p-2 rounded-xl text-[11px]">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10241B] border border-white/40" />
                Feasibility (Kelayakan):
              </span>
              <strong className="text-white">{data.feasibility} / 5</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#8BC53F]" />
                Impact (Dampak):
              </span>
              <strong className="text-white">{data.impact} / 5</strong>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/10">
              <span className="font-bold text-[#BEF264]">Total Skor:</span>
              <strong className="text-sm font-extrabold text-[#BEF264]">
                {data.total_score} / 10
              </strong>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center italic">
            Klik bar untuk melihat detail analisis
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-[0_6px_24px_rgba(16,36,27,0.06)] flex flex-col justify-between h-full min-h-[440px] sm:min-h-[480px] min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-2 shrink-0">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#10241B] tracking-tight">
            Grafik Skor Ide
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            {isStacked
              ? 'Akumulasi Feasibility + Impact (Total Skor 0–10)'
              : 'Komparasi Feasibility & Impact Berdampingan (Skala 1–5)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Toggle Mode: Tumpuk (Total 0–10) vs Berdampingan (1–5) */}
          <div className="flex items-center gap-1 bg-[#F4F7F4] p-1 rounded-2xl border border-[#E5ECE5] text-[10px] sm:text-[11px] font-bold">
            <button
              onClick={() => setIsStacked(true)}
              className={`px-2 sm:px-2.5 py-1 rounded-xl transition-all ${
                isStacked
                  ? 'bg-[#10241B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tumpuk Feasibility + Impact menjadi Total Skor (0–10)"
            >
              Tumpuk (0–10)
            </button>
            <button
              onClick={() => setIsStacked(false)}
              className={`px-2 sm:px-2.5 py-1 rounded-xl transition-all ${
                !isStacked
                  ? 'bg-[#10241B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan Feasibility & Impact berdampingan (Skala 1–5)"
            >
              Berdampingan (1–5)
            </button>
          </div>

          {/* Legend pills */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700 bg-[#F4F7F4] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl border border-[#E5ECE5]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-md bg-[#10241B]" />
              <span className="text-[10px] sm:text-[11px]">Feas</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-md bg-[#8BC53F]" />
              <span className="text-[10px] sm:text-[11px]">Impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Grouped / Stacked Bar Chart */}
      <div className="w-full h-[350px] sm:h-[420px] md:h-[450px] pt-2 pb-1 relative">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minHeight={340}
          initialDimension={{ width: 700, height: 420 }}
        >
          <BarChart
            data={chartData}
            margin={{ top: 25, right: 15, left: -10, bottom: 8 }}
            barGap={4}
            barCategoryGap={isStacked ? '24%' : '16%'}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const clicked = state.activePayload[0].payload;
                const found = ideas.find((i) => i.id === clicked.id);
                if (found) {
                  onSelectIdea(found);
                  onOpenDetailModal(found);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2EA" />
            <XAxis
              dataKey="order_num"
              stroke="#475569"
              fontSize={12}
              fontWeight={700}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              dy={4}
            />
            <YAxis
              domain={isStacked ? [0, 10] : [0, 5]}
              ticks={isStacked ? [0, 2, 4, 6, 8, 10] : [0, 1, 2, 3, 4, 5]}
              width={34}
              stroke="#475569"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dx={-2}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(183, 234, 92, 0.15)' }} />
            
            {/* Reference Line */}
            {isStacked ? (
              <ReferenceLine
                y={8}
                stroke="#8BC53F"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Ambang Prioritas (≥8)',
                  position: 'top',
                  fill: '#2D5A1E',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            ) : (
              <ReferenceLine
                y={4}
                stroke="#8BC53F"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Tinggi (≥4)',
                  position: 'top',
                  fill: '#2D5A1E',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Feasibility Bar (#10241B - dark navy slate) */}
            <Bar
              dataKey="feasibility"
              name="Feasibility"
              stackId={isStacked ? 'score' : undefined}
              fill="#10241B"
              radius={isStacked ? [0, 0, 4, 4] : [4, 4, 0, 0]}
              cursor="pointer"
              maxBarSize={isStacked ? 36 : 24}
              animationDuration={800}
            />

            {/* Impact Bar (#8BC53F - lime green) */}
            <Bar
              dataKey="impact"
              name="Impact"
              stackId={isStacked ? 'score' : undefined}
              fill="#8BC53F"
              radius={isStacked ? [6, 6, 0, 0] : [4, 4, 0, 0]}
              cursor="pointer"
              maxBarSize={isStacked ? 36 : 24}
              animationDuration={800}
            >
              {isStacked && (
                <LabelList
                  dataKey="total_score"
                  position="top"
                  fill="#10241B"
                  fontSize={11}
                  fontWeight={800}
                  offset={6}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info & Summary Badges */}
      <div className="pt-2.5 mt-auto border-t border-[#E5ECE5] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
            Rata-rata: Feas <strong>{avgFeasibility}</strong> · Imp <strong>{avgImpact}</strong>
          </span>
          {selectedIdea && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#E7F5CF] font-bold text-[#3F6212]">
              Terpilih: Ide #{selectedIdea.order_num}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400">
          Klik bar ide untuk melihat analisis
        </span>
      </div>
    </div>
  );
};
