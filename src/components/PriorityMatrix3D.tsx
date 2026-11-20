import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  Line,
  ContactShadows,
  Edges,
  Sparkles as FloatingSparkles,
  Environment,
  Lightformer,
  Stars,
  RoundedBox,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';
import type { Idea } from '../types/idea';
import { QUADRANT_CONFIG } from '../types/idea';
import { PriorityMatrix2D } from './PriorityMatrix2D';
import {
  Box,
  Compass,
  Sparkles,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PriorityMatrixProps {
  ideas: Idea[];
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  onOpenDetailModal: (idea: Idea) => void;
}

// Convert Feasibility (1-5), Impact (1-5), Total Score (2-10) to 3D Coordinates
function mapIdeaTo3D(
  feasibility: number,
  impact: number,
  totalScore: number,
  jitterX = 0,
  jitterZ = 0
): [number, number, number] {
  const x = ((feasibility - 3.0) / 2.0) * 3.6 + jitterX;
  const z = -(((impact - 3.0) / 2.0) * 3.6) + jitterZ;
  const y = 0.65 + ((totalScore - 2) / 8) * 3.6;

  return [x, y, z];
}

// Helper menentukan jenis bentuk kristal dari skor numerik (aman untuk tipe quadrant apapun)
function getQuadrantShape(feasibility: number, impact: number): 'utama' | 'potensi' | 'pertimbangkan' | 'tunda' {
  if (feasibility >= 3.5 && impact >= 3.5) return 'utama';
  if (feasibility < 3.5 && impact >= 3.5) return 'potensi';
  if (feasibility >= 3.5 && impact < 3.5) return 'pertimbangkan';
  return 'tunda';
}

// ---------- Konstanta tata letak ----------
const HALF = 4.5;
const SPLIT_X = 0.9;   // batas Feasibility 3.5
const SPLIT_Z = -0.9;  // batas Impact 3.5
const TILE_GAP = 0.08;

const scoreToY = (score: number) => 0.65 + ((score - 2) / 8) * 3.6;
const feasToX = (f: number) => ((f - 3.0) / 2.0) * 3.6;
const impactToZ = (i: number) => -(((i - 3.0) / 2.0) * 3.6);

const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

const QUADRANT_TILES = [
  { key: 'utama', x0: SPLIT_X, x1: HALF, z0: -HALF, z1: SPLIT_Z, color: '#10B981', label: '★ PRIORITAS UTAMA', pill: 'bg-emerald-600/95', top: true },
  { key: 'potensi', x0: -HALF, x1: SPLIT_X, z0: -HALF, z1: SPLIT_Z, color: '#0EA5E9', label: '✦ POTENSI', pill: 'bg-sky-600/95', top: true },
  { key: 'pertimbangkan', x0: SPLIT_X, x1: HALF, z0: SPLIT_Z, z1: HALF, color: '#F59E0B', label: '◆ PERTIMBANGKAN', pill: 'bg-amber-600/95', top: false },
  { key: 'tunda', x0: -HALF, x1: SPLIT_X, z0: SPLIT_Z, z1: HALF, color: '#64748B', label: '● TUNDA', pill: 'bg-slate-600/95', top: false },
];

// ---------- 1. Podium Arsitektural Beveled + Holodeck Rings ----------
const GlassFloorTiles: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const utamaMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const ledMat = useRef<THREE.MeshBasicMaterial>(null);
  const outerRing1 = useRef<THREE.Mesh>(null);
  const outerRing2 = useRef<THREE.Mesh>(null);
  const groupRefs = useRef<Record<string, THREE.Group | null>>({});

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (utamaMat.current) {
      utamaMat.current.emissiveIntensity = isDark
        ? 0.25 + Math.sin(t * 1.8) * 0.1
        : 0.14 + Math.sin(t * 1.5) * 0.06;
    }
    if (ledMat.current) {
      ledMat.current.opacity = isDark
        ? 0.65 + Math.sin(t * 2.2) * 0.2
        : 0.75 + Math.sin(t * 2.0) * 0.15;
    }
    if (outerRing1.current) outerRing1.current.rotation.z = t * 0.08;
    if (outerRing2.current) outerRing2.current.rotation.z = -t * 0.05;

    QUADRANT_TILES.forEach((tile, i) => {
      const g = groupRefs.current[tile.key];
      if (!g) return;
      const p = THREE.MathUtils.clamp((t - i * 0.09) / 0.85, 0, 1);
      g.scale.setScalar(Math.max(easeOutCubic(p), 0.0001));
    });
  });

  const corners: [number, number][] = [
    [-HALF - 0.24, -HALF - 0.24],
    [HALF + 0.24, -HALF - 0.24],
    [-HALF - 0.24, HALF + 0.24],
    [HALF + 0.24, HALF + 0.24],
  ];

  return (
    <group>
      {/* Cincin Holodeck Melayang di Luar Podium */}
      <mesh ref={outerRing1} position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.9, 6.96, 96]} />
        <meshBasicMaterial
          color={isDark ? '#38BDF8' : '#10B981'}
          transparent
          opacity={isDark ? 0.28 : 0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={outerRing2} position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.45, 7.49, 64, 1, 0, Math.PI * 1.4]} />
        <meshBasicMaterial
          color={isDark ? '#BEF264' : '#0EA5E9'}
          transparent
          opacity={isDark ? 0.22 : 0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Tingkat 1: Fondasi Brushed Metal Beveled */}
      <RoundedBox
        args={[HALF * 2 + 1.35, 0.18, HALF * 2 + 1.35]}
        radius={0.07}
        smoothness={4}
        position={[0, -0.35, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color={isDark ? '#020617' : '#0F241B'}
          roughness={0.28}
          metalness={0.65}
        />
      </RoundedBox>

      {/* Tingkat 2: Cincin Aksen LED Recessed Menyala */}
      <RoundedBox
        args={[HALF * 2 + 0.98, 0.06, HALF * 2 + 0.98]}
        radius={0.02}
        smoothness={2}
        position={[0, -0.24, 0]}
      >
        <meshBasicMaterial
          ref={ledMat}
          color={isDark ? '#38BDF8' : '#84CC16'}
          transparent
          opacity={0.75}
        />
      </RoundedBox>

      {/* Tingkat 3: Upper Deck Keramik / Obsidian Beveled */}
      <RoundedBox
        args={[HALF * 2 + 0.56, 0.22, HALF * 2 + 0.56]}
        radius={0.06}
        smoothness={4}
        position={[0, -0.13, 0]}
        receiveShadow
      >
        <meshPhysicalMaterial
          color={isDark ? '#0B1324' : '#F8FAFC'}
          roughness={isDark ? 0.22 : 0.15}
          metalness={isDark ? 0.35 : 0.08}
          clearcoat={0.8}
          clearcoatRoughness={0.12}
          envMapIntensity={1.1}
        />
      </RoundedBox>

      {/* 4 Corner Accent Brackets */}
      {corners.map(([cx, cz], idx) => (
        <RoundedBox
          key={idx}
          args={[0.26, 0.26, 0.26]}
          radius={0.04}
          smoothness={3}
          position={[cx, -0.11, cz]}
        >
          <meshStandardMaterial
            color={isDark ? '#1E293B' : '#10241B'}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      ))}

      {/* Garis Grid Koordinat Halus 1-5 di Lantai */}
      {[1, 2, 3, 4, 5].map((tick) => (
        <React.Fragment key={`grid-${tick}`}>
          <Line
            points={[
              [feasToX(tick), 0.032, -HALF + 0.08],
              [feasToX(tick), 0.032, HALF - 0.08],
            ]}
            color={isDark ? '#FFFFFF' : '#0F172A'}
            lineWidth={0.7}
            transparent
            opacity={isDark ? 0.1 : 0.09}
          />
          <Line
            points={[
              [-HALF + 0.08, 0.032, impactToZ(tick)],
              [HALF - 0.08, 0.032, impactToZ(tick)],
            ]}
            color={isDark ? '#FFFFFF' : '#0F172A'}
            lineWidth={0.7}
            transparent
            opacity={isDark ? 0.1 : 0.09}
          />
        </React.Fragment>
      ))}

      {/* 4 Tile Kuadran Kaca Beveled */}
      {QUADRANT_TILES.map((t) => {
        const w = t.x1 - t.x0 - TILE_GAP;
        const d = t.z1 - t.z0 - TILE_GAP;
        const cx = (t.x0 + t.x1) / 2;
        const cz = (t.z0 + t.z1) / 2;
        return (
          <group
            key={t.key}
            ref={(el) => {
              groupRefs.current[t.key] = el;
            }}
          >
            <RoundedBox
              args={[w, 0.07, d]}
              radius={0.028}
              smoothness={3}
              position={[cx, -0.005, cz]}
              receiveShadow
            >
              <meshPhysicalMaterial
                ref={t.key === 'utama' ? utamaMat : undefined}
                color={t.color}
                emissive={t.color}
                emissiveIntensity={isDark ? 0.1 : 0.12}
                transparent
                opacity={isDark ? 0.52 : 0.72}
                roughness={0.1}
                metalness={0.08}
                clearcoat={1}
                clearcoatRoughness={0.05}
                reflectivity={0.9}
                envMapIntensity={isDark ? 1.4 : 1.0}
              />
              <Edges threshold={22} color={isDark ? '#E2E8F0' : '#FFFFFF'} />
            </RoundedBox>
          </group>
        );
      })}

      {/* 4 Label Kuadran di Lantai (Render di luar group animasi scale agar tidak mengalami glitch de-sinkronisasi matrix) */}
      {QUADRANT_TILES.map((t) => {
        const cx = (t.x0 + t.x1) / 2;
        const cz = t.top ? SPLIT_Z - 0.45 : HALF - 0.68;
        return (
          <Html
            key={`quadrant-label-${t.key}`}
            position={[cx, 0.072, cz]}
            center
            transform
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.78}
            zIndexRange={[10, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              className={`px-4 py-1.5 rounded-full ${t.pill} text-white font-black text-xs sm:text-sm shadow-2xl tracking-wider whitespace-nowrap border-2 border-white select-none flex items-center justify-center`}
              style={{
                letterSpacing: '0.08em',
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                boxShadow: `0 4px 18px rgba(0,0,0,0.5), 0 0 14px ${t.color}`,
              }}
            >
              {t.label}
            </div>
          </Html>
        );
      })}
    </group>
  );
};

// ---------- 2. Dinding Kaca Arsitektural + Pilar Metalik ----------
const BackWalls: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const levels = [2, 4, 6, 8, 10];
  const lineColor = isDark ? '#38BDF8' : '#22C55E';
  const wallColor = isDark ? '#0F172A' : '#FFFFFF';
  const wallOpacity = isDark ? 0.14 : 0.22;
  const wallH = scoreToY(10) + 0.45;
  const frameColor = isDark ? '#334155' : '#CBD5E1';

  const pillars: [number, number][] = [
    [-HALF - 0.03, -HALF - 0.03],
    [HALF + 0.03, -HALF - 0.03],
    [-HALF - 0.03, HALF + 0.03],
  ];

  return (
    <group>
      {/* Panel kaca belakang & kiri */}
      <mesh position={[0, wallH / 2, -HALF - 0.03]}>
        <planeGeometry args={[HALF * 2, wallH]} />
        <meshPhysicalMaterial
          color={wallColor}
          transparent
          opacity={wallOpacity}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-HALF - 0.03, wallH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[HALF * 2, wallH]} />
        <meshPhysicalMaterial
          color={wallColor}
          transparent
          opacity={wallOpacity}
          roughness={0.15}
          metalness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Pilar vertikal sudut */}
      {pillars.map(([px, pz], i) => (
        <mesh key={i} position={[px, wallH / 2, pz]}>
          <cylinderGeometry args={[0.035, 0.045, wallH, 16]} />
          <meshStandardMaterial color={frameColor} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Rel bingkai atas */}
      <mesh position={[0, wallH, -HALF - 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, HALF * 2 + 0.06, 12]} />
        <meshStandardMaterial color={frameColor} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[-HALF - 0.03, wallH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, HALF * 2 + 0.06, 12]} />
        <meshStandardMaterial color={frameColor} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Garis elevasi skor 2..10 */}
      {levels.map((s) => (
        <React.Fragment key={s}>
          <Line
            points={[
              [-HALF, scoreToY(s), -HALF - 0.01],
              [HALF, scoreToY(s), -HALF - 0.01],
            ]}
            color={lineColor}
            lineWidth={1}
            dashed
            dashSize={0.2}
            gapSize={0.14}
            transparent
            opacity={isDark ? 0.45 : 0.55}
          />
          <Line
            points={[
              [-HALF - 0.01, scoreToY(s), -HALF],
              [-HALF - 0.01, scoreToY(s), HALF],
            ]}
            color={lineColor}
            lineWidth={1}
            dashed
            dashSize={0.2}
            gapSize={0.14}
            transparent
            opacity={isDark ? 0.45 : 0.55}
          />
        </React.Fragment>
      ))}
    </group>
  );
};

// ---------- 3. Sumbu X / Z / Y ----------
const AxisTicks: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const ticks = [1, 2, 3, 4, 5];
  const scores = [2, 4, 6, 8, 10];
  const tickText = isDark ? 'text-slate-200' : 'text-slate-600';
  const pillBg = isDark ? 'bg-slate-900/85 border border-white/15' : 'bg-white/90 border border-slate-200/80';
  const labelStyle = { pointerEvents: 'none' as const, userSelect: 'none' as const };

  return (
    <group>
      {/* X: Feasibility */}
      <Line
        points={[
          [-HALF, 0.03, HALF + 0.42],
          [HALF + 0.25, 0.03, HALF + 0.42],
        ]}
        color="#10B981"
        lineWidth={2.2}
      />
      <mesh position={[HALF + 0.32, 0.03, HALF + 0.42]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.24, 16]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.4} />
      </mesh>
      {ticks.map((f) => (
        <Html key={`x-${f}`} position={[feasToX(f), 0.03, HALF + 0.82]} center distanceFactor={10} zIndexRange={[10, 0]} style={labelStyle}>
          <span className={`text-xs font-black ${tickText}`}>{f}</span>
        </Html>
      ))}
      <Html position={[HALF + 1.35, 0.03, HALF + 0.42]} center distanceFactor={10} zIndexRange={[10, 0]} style={labelStyle}>
        <div className={`text-xs font-black text-emerald-500 whitespace-nowrap px-2.5 py-1 rounded-lg shadow-sm border ${pillBg}`}>
          X: Feasibility →
        </div>
      </Html>

      {/* Z: Impact */}
      <Line
        points={[
          [-HALF - 0.42, 0.03, HALF],
          [-HALF - 0.42, 0.03, -HALF - 0.25],
        ]}
        color="#3B82F6"
        lineWidth={2.2}
      />
      <mesh position={[-HALF - 0.42, 0.03, -HALF - 0.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.24, 16]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} />
      </mesh>
      {ticks.map((i) => (
        <Html key={`z-${i}`} position={[-HALF - 0.82, 0.03, impactToZ(i)]} center distanceFactor={10} zIndexRange={[10, 0]} style={labelStyle}>
          <span className={`text-xs font-black ${tickText}`}>{i}</span>
        </Html>
      ))}
      <Html position={[-HALF - 0.42, 0.03, -HALF - 1.15]} center distanceFactor={10} zIndexRange={[10, 0]} style={labelStyle}>
        <div className={`text-xs font-black text-sky-500 whitespace-nowrap px-2.5 py-1 rounded-lg shadow-sm border ${pillBg}`}>
          Z: Impact ↑
        </div>
      </Html>

      {/* Y: Skor Total */}
      <Line
        points={[
          [-HALF - 0.42, 0, HALF + 0.42],
          [-HALF - 0.42, scoreToY(10) + 0.3, HALF + 0.42],
        ]}
        color="#F59E0B"
        lineWidth={2.2}
      />
      <mesh position={[-HALF - 0.42, scoreToY(10) + 0.38, HALF + 0.42]}>
        <coneGeometry args={[0.09, 0.24, 16]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.4} />
      </mesh>
      {scores.map((sc) => (
        <Html key={`y-${sc}`} position={[-HALF - 0.82, scoreToY(sc), HALF + 0.42]} center distanceFactor={10} zIndexRange={[10, 0]} style={labelStyle}>
          <span className="text-xs font-black text-amber-500">{sc}</span>
        </Html>
      ))}
      <Html position={[-HALF - 0.42, scoreToY(10) + 0.78, HALF + 0.42]} center distanceFactor={10} zIndexRange={[10, 0]} style={labelStyle}>
        <div className={`text-xs font-black text-amber-500 whitespace-nowrap px-2.5 py-1 rounded-lg shadow-sm border ${pillBg}`}>
          Y: Skor Total (2-10) ↑
        </div>
      </Html>
    </group>
  );
};

// ---------- 4. Cincin Pulse untuk Skor 10/10 ----------
const PulseRing: React.FC<{ position: [number, number, number]; color: string }> = ({
  position,
  color,
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = (state.clock.getElapsedTime() % 2) / 2;
    const scale = 1 + t * 1.9;
    ringRef.current.scale.set(scale, scale, scale);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = 0.8 * (1 - t);
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.38, 0.44, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

// ---------- 5. Cosmic Space Environment (Dark Mode) ----------
const CosmicSpaceEnvironment: React.FC = () => {
  const planetRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.06;
    }
    if (shardsRef.current) {
      shardsRef.current.rotation.y = -t * 0.03;
    }
  });

  const shards = useMemo(
    () => [
      { pos: [-16, 7, -18] as [number, number, number], scale: 0.45, color: '#38BDF8' },
      { pos: [18, 9, -15] as [number, number, number], scale: 0.55, color: '#BEF264' },
      { pos: [-14, 2, 16] as [number, number, number], scale: 0.35, color: '#818CF8' },
      { pos: [15, 4, 14] as [number, number, number], scale: 0.4, color: '#34D399' },
    ],
    []
  );

  return (
    <group>
      <Stars radius={70} depth={55} count={4500} factor={4.2} saturation={0.75} fade speed={1.2} />
      <Stars radius={120} depth={45} count={2500} factor={3.2} saturation={1} fade speed={0.6} />

      {/* Planet Bercincin Jauh untuk Kedalaman Visual */}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.6}>
        <group ref={planetRef} position={[-19, 12, -26]} rotation={[0.35, 0.2, 0.25]}>
          <mesh>
            <sphereGeometry args={[2.6, 36, 36]} />
            <meshStandardMaterial
              color="#0F172A"
              emissive="#1E3A8A"
              emissiveIntensity={0.65}
              roughness={0.55}
              metalness={0.3}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[3.4, 5.1, 64]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.24}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      </Float>

      {/* Kristal Kosmik Jauh */}
      <group ref={shardsRef}>
        {shards.map((s, idx) => (
          <Float key={idx} speed={1.2 + idx * 0.2} rotationIntensity={1.2} floatIntensity={0.8}>
            <mesh position={s.pos} scale={s.scale}>
              <octahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial
                color={s.color}
                emissive={s.color}
                emissiveIntensity={0.8}
                roughness={0.15}
                metalness={0.5}
                transparent
                opacity={0.55}
              />
            </mesh>
          </Float>
        ))}
      </group>
    </group>
  );
};

// ---------- 6. Radar Sweep ----------
const RadarWave: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = ((state.clock.getElapsedTime() + 1.5) % 4.5) / 4.5;
    const s = 0.4 + t * 4.8;
    ringRef.current.scale.set(s, s, s);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (mat) mat.opacity = Math.sin(Math.PI * t) * 0.3;
  });

  return (
    <mesh ref={ringRef} position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.96, 1, 96]} />
      <meshBasicMaterial
        color={isDark ? '#BEF264' : '#10B981'}
        transparent
        opacity={0.28}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// ---------- 7. Focus FX + Laser Proyeksi Koordinat ke Dinding ----------
const FocusFX: React.FC<{
  idea: Idea | null;
  position: [number, number, number] | null;
}> = ({ idea, position }) => {
  const nodeGroup = useRef<THREE.Group>(null);
  const floorGroup = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const nodeTarget = useRef(new THREE.Vector3());
  const floorTarget = useRef(new THREE.Vector3());
  const lightColor = useRef(new THREE.Color('#B7EA5C'));

  const color = idea ? QUADRANT_CONFIG[idea.quadrant].color : '#B7EA5C';

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const has = !!position;

    if (position) {
      nodeTarget.current.set(position[0], position[1], position[2]);
      floorTarget.current.set(position[0], 0, position[2]);
      lightColor.current.set(color);
    }

    const k = Math.min(1, delta * 9);
    if (nodeGroup.current) {
      nodeGroup.current.position.lerp(nodeTarget.current, k);
      nodeGroup.current.visible = has;
    }
    if (floorGroup.current) {
      floorGroup.current.position.lerp(floorTarget.current, k);
      floorGroup.current.visible = has;
    }
    if (lightRef.current) {
      lightRef.current.color.lerp(lightColor.current, k);
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, has ? 3.2 : 0, k);
      lightRef.current.position.set(
        nodeGroup.current ? nodeGroup.current.position.x : 0,
        nodeGroup.current ? nodeGroup.current.position.y + 0.8 : 1,
        nodeGroup.current ? nodeGroup.current.position.z : 0
      );
    }
    if (ring1.current) {
      ring1.current.rotation.x = t * 1.2;
      ring1.current.rotation.y = t * 0.8;
    }
    if (ring2.current) {
      ring2.current.rotation.z = t * 1.0;
      ring2.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.8) * 0.5;
    }
    if (ripple.current) {
      const r = (t % 1.5) / 1.5;
      const sc = 1 + r * 2.6;
      ripple.current.scale.set(sc, sc, sc);
      const mat = ripple.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.6 * (1 - r);
    }
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={0} distance={6.5} decay={1.6} color="#B7EA5C" />

      {/* Laser Proyeksi Koordinat ke Dinding Belakang (-Z) & Dinding Kiri (-X) */}
      {position && (
        <group>
          <Line
            points={[position, [position[0], position[1], -HALF]]}
            color={color}
            lineWidth={1.6}
            dashed
            dashSize={0.14}
            gapSize={0.1}
            transparent
            opacity={0.85}
          />
          <Line
            points={[position, [-HALF, position[1], position[2]]]}
            color={color}
            lineWidth={1.6}
            dashed
            dashSize={0.14}
            gapSize={0.1}
            transparent
            opacity={0.85}
          />
          {/* Titik Target di Dinding Belakang */}
          <mesh position={[position[0], position[1], -HALF + 0.01]}>
            <ringGeometry args={[0.07, 0.13, 24]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
          {/* Titik Target di Dinding Kiri */}
          <mesh position={[-HALF + 0.01, position[1], position[2]]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.07, 0.13, 24]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Kolom cahaya dari lantai */}
      <group ref={floorGroup} visible={false}>
        <mesh position={[0, 2.9, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.04, 0.48, 5.8, 32, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={ripple} position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[0.3, 0.35, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Cincin giroskop + pill label */}
      <group ref={nodeGroup} visible={false}>
        <mesh ref={ring1} raycast={() => null}>
          <torusGeometry args={[0.56, 0.014, 12, 72]} />
          <meshBasicMaterial color={color} transparent opacity={0.95} />
        </mesh>
        <mesh ref={ring2} raycast={() => null}>
          <torusGeometry args={[0.68, 0.011, 12, 72]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.75} />
        </mesh>

        {idea && (
          <Html
            position={[0, 1.15, 0]}
            center
            distanceFactor={9}
            zIndexRange={[25, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#0C1D16]/95 text-white shadow-xl whitespace-nowrap backdrop-blur-md"
              style={{ border: `1.5px solid ${color}`, boxShadow: `0 6px 20px ${color}66` }}
            >
              <span className="w-5 h-5 rounded-full bg-[#B7EA5C] text-[#10241B] text-[10px] font-black flex items-center justify-center">
                {idea.order_num}
              </span>
              <span className="text-[11px] font-bold">
                {idea.name.length > 30 ? `${idea.name.slice(0, 28)}…` : idea.name}
              </span>
              <span className="text-[11px] font-extrabold text-[#B7EA5C]">{idea.total_score}/10</span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};

// ---------- 8. Node Ide 3D: Glass Shell + Rotating Crystal Core + Socket ----------
const IdeaNode3D: React.FC<{
  idea: Idea;
  position: [number, number, number];
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (idea: Idea | null) => void;
  onClick: (idea: Idea) => void;
}> = ({ idea, position, index, isSelected, isHovered, onHover, onClick }) => {
  const [x, y, z] = position;
  const config = QUADRANT_CONFIG[idea.quadrant];
  const isTopScore = idea.total_score === 10;
  const active = isSelected || isHovered;
  const shapeKind = getQuadrantShape(idea.feasibility, idea.impact);
  const accentColor = isTopScore ? '#FBBF24' : config.color;

  const orbRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const pillarRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Group>(null);
  const hoverScale = useRef(1);
  const phase = idea.order_num * 0.9;
  const delay = 0.55 + index * 0.08;
  const [showBadge, setShowBadge] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setShowBadge(true), (delay + 0.35) * 1000);
    return () => clearTimeout(id);
  }, [delay]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = THREE.MathUtils.clamp((t - delay) / 1.0, 0, 1);
    const e = Math.max(easeOutBack(p), 0);

    if (floorRef.current) {
      floorRef.current.scale.setScalar(Math.max(Math.min(1, p * 2), 0.0001));
    }
    if (pillarRef.current) {
      pillarRef.current.scale.y = Math.max(e, 0.0001);
      pillarRef.current.position.y = (y * e) / 2;
    }
    if (orbRef.current) {
      orbRef.current.position.y = y * e + Math.sin(t * 1.6 + phase) * 0.055 * p;
      hoverScale.current = THREE.MathUtils.lerp(hoverScale.current, active ? 1.32 : 1, 0.16);
      orbRef.current.scale.setScalar(Math.max(hoverScale.current * Math.min(1, p * 3), 0.0001));
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * (active ? 2.4 : 1.0) + phase;
      coreRef.current.rotation.x = Math.sin(t * 0.8 + phase) * 0.45;
    }
    if (crownRef.current) {
      crownRef.current.rotation.y = -t * 1.6;
      crownRef.current.position.y = 0.44 + Math.sin(t * 2.5) * 0.04;
    }
  });

  return (
    <group>
      {/* 1. Dual-Layer Energy Beam Pillar */}
      <group ref={pillarRef} position={[x, 0, z]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, y, 10]} />
          <meshBasicMaterial color={accentColor} transparent opacity={active ? 0.95 : 0.6} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.05, 0.032, y, 12, 1, true]} />
          <meshBasicMaterial color={accentColor} transparent opacity={active ? 0.28 : 0.12} depthWrite={false} />
        </mesh>
      </group>

      {/* 2. Socket Metalik + Glow di Lantai */}
      <group ref={floorRef} position={[x, 0, z]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.13, 0.18, 0.04, 24]} />
          <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.22, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={active ? 1 : 0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={active ? 0.38 : 0.18} depthWrite={false} />
        </mesh>
      </group>

      {/* 3. Node Melayang: Glass Shell + Inner Crystal Artifact */}
      <group ref={orbRef} position={[x, 0, z]} scale={0.0001}>
        {isTopScore && (
          <>
            <PulseRing position={[0, 0, 0]} color="#FBBF24" />
            {/* Mahkota Kristal Emas melayang di atas skor 10/10 */}
            <mesh ref={crownRef} position={[0, 0.44, 0]} raycast={() => null}>
              <octahedronGeometry args={[0.095, 0]} />
              <meshPhysicalMaterial
                color="#FDE047"
                emissive="#F59E0B"
                emissiveIntensity={0.95}
                metalness={0.85}
                roughness={0.1}
              />
            </mesh>
            {/* Cincin Orbit Emas */}
            <mesh rotation={[Math.PI / 2.6, 0.2, 0]} raycast={() => null}>
              <torusGeometry args={[0.39, 0.016, 10, 48]} />
              <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.6} metalness={0.9} roughness={0.15} />
            </mesh>
          </>
        )}

        {/* Halo Atmosfer Lembut */}
        <mesh raycast={() => null}>
          <sphereGeometry args={[0.46, 24, 24]} />
          <meshBasicMaterial color={accentColor} transparent opacity={active ? 0.22 : 0.09} depthWrite={false} />
        </mesh>

        {/* Inti Kristal 3D Berputar (Unik per Kuadran) */}
        <mesh ref={coreRef} raycast={() => null}>
          {shapeKind === 'utama' && <octahedronGeometry args={[0.16, 0]} />}
          {shapeKind === 'potensi' && <icosahedronGeometry args={[0.15, 0]} />}
          {shapeKind === 'pertimbangkan' && <boxGeometry args={[0.2, 0.2, 0.2]} />}
          {shapeKind === 'tunda' && <dodecahedronGeometry args={[0.14, 0]} />}
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={accentColor}
            emissiveIntensity={active ? 1.5 : 0.85}
            metalness={0.4}
            roughness={0.15}
          />
        </mesh>

        {/* Cangkang Kaca Iridescent (Area Klik & Hover) */}
        <mesh
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onClick(idea);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover(idea);
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
            onHover(null);
          }}
        >
          <sphereGeometry args={[0.28, 48, 48]} />
          <meshPhysicalMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={active ? 0.45 : 0.16}
            transparent
            opacity={0.62}
            roughness={0.06}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.04}
            iridescence={0.65}
            iridescenceIOR={1.3}
            envMapIntensity={1.8}
          />
        </mesh>

        {/* Nomor Urut Ide */}
        {showBadge && (
          <Html
            position={[0, isTopScore ? 0.64 : 0.52, 0]}
            center
            distanceFactor={9}
            zIndexRange={[15, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              className={`flex items-center justify-center font-black rounded-full shadow-lg transition-transform duration-150 ${active ? 'scale-125' : ''
                }`}
              style={{
                backgroundColor: isTopScore ? '#FBBF24' : '#0F241B',
                color: isTopScore ? '#0F241B' : '#FFFFFF',
                width: isTopScore ? '30px' : '26px',
                height: isTopScore ? '30px' : '26px',
                fontSize: '12px',
                border: `2px solid ${accentColor}`,
                boxShadow: `0 0 14px ${accentColor}aa`,
              }}
            >
              {idea.order_num}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

// ---------- 9. Kontrol Kamera: Intro + Preset + Focus Selected ----------
const CameraController: React.FC<{
  cameraPreset: 'isometric' | 'top' | 'front';
  autoRotate: boolean;
  nonce: number;
  focusTargetPos: [number, number, number] | null;
}> = ({ cameraPreset, autoRotate, nonce, focusTargetPos }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const goalPos = useRef<THREE.Vector3 | null>(null);
  const goalTarget = useRef(new THREE.Vector3(0, 1.3, 0));
  const goalRate = useRef(0.08);
  const isFirst = useRef(true);
  const transitionFrames = useRef(0);

  React.useEffect(() => {
    const pos: [number, number, number] =
      cameraPreset === 'isometric'
        ? [8.0, 7.6, 8.0]
        : cameraPreset === 'top'
          ? [0.2, 12.8, 3.6]
          : [0, 3.2, 10.6];

    if (isFirst.current) {
      camera.position.set(-13, 5.5, 13);
      goalRate.current = 0.032;
    } else {
      goalRate.current = 0.08;
    }

    transitionFrames.current = 0;
    goalPos.current = new THREE.Vector3(pos[0], pos[1], pos[2]);
    goalTarget.current.set(0, 1.3, 0);
  }, [cameraPreset, nonce, camera]);

  // Fly-to kamera ke ide yang dipilih
  React.useEffect(() => {
    if (!focusTargetPos) return;
    goalRate.current = 0.08;
    goalTarget.current.set(focusTargetPos[0], focusTargetPos[1], focusTargetPos[2]);
    goalPos.current = new THREE.Vector3(
      focusTargetPos[0] + 3.2,
      focusTargetPos[1] + 2.2,
      focusTargetPos[2] + 3.8
    );
    transitionFrames.current = 0;
  }, [focusTargetPos]);

  useFrame(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    const goal = goalPos.current;
    if (goal) {
      // Nonaktifkan rotasi otomatis sementara selama proses transisi kamera
      ctrl.autoRotate = false;
      camera.position.lerp(goal, goalRate.current);
      ctrl.target.lerp(goalTarget.current, goalRate.current);
      ctrl.update();

      transitionFrames.current += 1;
      const maxAllowed = isFirst.current ? 100 : 50;
      if (camera.position.distanceTo(goal) < 0.08 || transitionFrames.current >= maxAllowed) {
        camera.position.copy(goal);
        ctrl.target.copy(goalTarget.current);
        goalPos.current = null;
        transitionFrames.current = 0;
        isFirst.current = false;
        ctrl.autoRotate = autoRotate;
        ctrl.update();
      }
    } else {
      ctrl.autoRotate = autoRotate;
      ctrl.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minDistance={3}
      maxDistance={20}
      autoRotate={autoRotate}
      autoRotateSpeed={1.1}
      onStart={() => {
        goalPos.current = null;
        transitionFrames.current = 0;
      }}
    />
  );
};

// ---------- 10. Main Component ----------
export const PriorityMatrix3D: React.FC<PriorityMatrixProps> = ({
  ideas,
  selectedIdea,
  onSelectIdea,
  onOpenDetailModal,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [isDarkCanvas, setIsDarkCanvas] = useState<boolean>(true);
  const [hoveredIdea, setHoveredIdea] = useState<Idea | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'isometric' | 'top' | 'front'>('isometric');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraNonce, setCameraNonce] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const matrixContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      if (matrixContainerRef.current?.requestFullscreen) {
        try {
          await matrixContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch {
          setIsFullscreen(true);
        }
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {}
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const ideaPositions = useMemo(() => {
    const coordMap: Record<string, number> = {};
    return ideas.map((idea) => {
      const key = `${idea.feasibility}-${idea.impact}`;
      const count = coordMap[key] || 0;
      coordMap[key] = count + 1;

      let jX = 0;
      let jZ = 0;
      if (count > 0) {
        const angle = ((count - 1) * Math.PI * 2) / 5;
        const radius = 0.36;
        jX = Math.cos(angle) * radius;
        jZ = Math.sin(angle) * radius;
      }

      const coords = mapIdeaTo3D(idea.feasibility, idea.impact, idea.total_score, jX, jZ);
      return { idea, position: coords };
    });
  }, [ideas]);

  const focusIdea = hoveredIdea ?? selectedIdea;
  const focusPos = focusIdea
    ? ideaPositions.find((ip) => ip.idea.id === focusIdea.id)?.position ?? null
    : null;

  const selectedPos = selectedIdea
    ? ideaPositions.find((ip) => ip.idea.id === selectedIdea.id)?.position ?? null
    : null;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-[0_6px_24px_rgba(16,36,27,0.06)] flex flex-col justify-between relative z-0 isolate">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-[#10241B] tracking-tight whitespace-nowrap">
              Matriks Prioritas
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#E7F5CF] text-[#3F6212] shrink-0">
              {viewMode === '3d' ? '3D Hologram' : '2D Map'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
            Feasibility vs Impact · Skala 1–5
          </p>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-[#F1F5EC] p-0.5 sm:p-1 rounded-full text-xs">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${viewMode === '3d'
              ? 'bg-[#10241B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Box className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden xs:inline">3D</span> Orbit
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${viewMode === '2d'
              ? 'bg-[#B7EA5C] text-[#10241B] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Compass className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden xs:inline">2D</span> Map
          </button>
        </div>
      </div>

      {/* Main Matrix Container */}
      <div className="relative w-full rounded-2xl overflow-hidden">
        {viewMode === '2d' ? (
          <PriorityMatrix2D
            ideas={ideas}
            selectedIdea={selectedIdea}
            onSelectIdea={onSelectIdea}
            onOpenDetailModal={onOpenDetailModal}
          />
        ) : (
          <div
            ref={matrixContainerRef}
            className={`relative w-full transition-all duration-300 overflow-hidden isolate ${
              isFullscreen
                ? 'fixed inset-0 z-[99999] w-screen h-screen !rounded-none'
                : 'h-[400px] sm:h-[500px] rounded-2xl'
            }`}
            style={{
              backgroundColor: isDarkCanvas ? '#020617' : '#F8FAFC',
              backgroundImage: isDarkCanvas
                ? 'radial-gradient(circle at 50% 25%, #0F172A 0%, #020617 80%)'
                : 'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F1FAF2 40%, #E6F4EA 70%, #E0F2FE 100%)',
            }}
          >
            {/* Quick Controls Toolbar */}
            <div className="absolute top-2.5 inset-x-2.5 z-10 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
              {/* Left Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
                <button
                  onClick={() => setIsDarkCanvas((prev) => !prev)}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold backdrop-blur-md transition-all shadow-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer ${isDarkCanvas
                    ? 'bg-slate-900/90 text-[#BEF264] border border-[#BEF264]/40 hover:bg-slate-800'
                    : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
                    }`}
                >
                  {isDarkCanvas ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3 text-indigo-600" />}
                  <span className="text-[10px] sm:text-[11px] font-bold">
                    {isDarkCanvas ? 'Light' : 'Cosmic'}
                  </span>
                </button>

                <button
                  onClick={() => setAutoRotate((prev) => !prev)}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold backdrop-blur-md transition-all shadow-xs flex items-center gap-1 sm:gap-1.5 cursor-pointer ${autoRotate
                    ? 'bg-[#BEF264] text-[#0F1C24] border border-[#A3E635]'
                    : isDarkCanvas
                      ? 'bg-slate-900/80 text-white hover:bg-slate-800 border border-white/15'
                      : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
                    }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden xs:inline">Auto-Rotate</span>
                  <span>{autoRotate ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Right Controls: Fullscreen & Camera Presets */}
              <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/15 pointer-events-auto">
                <button
                  onClick={toggleFullscreen}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                  title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh (Fullscreen)'}
                  aria-label="Toggle Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-[#BEF264]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-white/90" />
                  )}
                </button>
                <div className="w-[1px] h-3.5 bg-white/20 mx-0.5" />
                {(['isometric', 'front', 'top'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setCameraPreset(preset);
                      setCameraNonce((n) => n + 1);
                    }}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold capitalize transition-all cursor-pointer ${cameraPreset === preset
                      ? 'bg-[#BEF264] text-[#0F1C24]'
                      : 'text-white/80 hover:text-white'
                      }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Canvas */}
            <Canvas
              shadows
              dpr={[1, 2]}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: isDarkCanvas ? 1.15 : 1.05,
              }}
              camera={{ position: [-13, 5.5, 13], fov: 44 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {isDarkCanvas && <color attach="background" args={['#020617']} />}
              {isDarkCanvas && <fog attach="fog" args={['#020617', 24, 62]} />}

              {/* Lighting Setup */}
              <ambientLight intensity={isDarkCanvas ? 0.35 : 0.78} />
              <hemisphereLight
                args={[
                  isDarkCanvas ? '#BAE6FD' : '#FFFFFF',
                  isDarkCanvas ? '#06131C' : '#BBF7D0',
                  isDarkCanvas ? 0.5 : 0.85,
                ]}
              />
              <directionalLight
                position={[9, 15, 8]}
                intensity={isDarkCanvas ? 1.25 : 1.6}
                color={isDarkCanvas ? '#F8FAFC' : '#FFFDF7'}
                castShadow
                shadow-mapSize={[1024, 1024]}
              />
              <pointLight position={[-8, 7, -8]} intensity={isDarkCanvas ? 1.1 : 0.6} color={isDarkCanvas ? '#38BDF8' : '#86EFAC'} />
              <pointLight position={[8, 6, 8]} intensity={isDarkCanvas ? 0.65 : 0.45} color={isDarkCanvas ? '#BEF264' : '#FDE68A'} />

              {/* Studio & Cosmic Procedural Reflections */}
              <Environment key={isDarkCanvas ? 'env-dark' : 'env-light'} resolution={256} frames={1}>
                <Lightformer form="rect" intensity={isDarkCanvas ? 1.8 : 3.5} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 14, 1]} color="#FFFFFF" />
                <Lightformer form="ring" intensity={isDarkCanvas ? 2.5 : 2.6} position={[0, 5, 9]} scale={6} color={isDarkCanvas ? '#38BDF8' : '#FFFFFF'} />
                <Lightformer form="rect" intensity={isDarkCanvas ? 2.4 : 2.0} position={[-8, 3, -3]} rotation={[0, Math.PI / 2, 0]} scale={[9, 5, 1]} color={isDarkCanvas ? '#BEF264' : '#86EFAC'} />
                <Lightformer form="rect" intensity={isDarkCanvas ? 1.8 : 1.8} position={[8, 3, 5]} rotation={[0, -Math.PI / 2, 0]} scale={[9, 5, 1]} color={isDarkCanvas ? '#FDE047' : '#FDE68A'} />
              </Environment>

              <CameraController
                cameraPreset={cameraPreset}
                autoRotate={autoRotate}
                nonce={cameraNonce}
                focusTargetPos={selectedPos}
              />

              {isDarkCanvas && <CosmicSpaceEnvironment />}

              <GlassFloorTiles isDark={isDarkCanvas} />

              <ContactShadows
                position={[0, -0.44, 0]}
                opacity={isDarkCanvas ? 0.55 : 0.36}
                scale={15}
                blur={2.4}
                far={6}
                color={isDarkCanvas ? '#000000' : '#10241B'}
              />

              <RadarWave isDark={isDarkCanvas} />

              <FloatingSparkles
                count={isDarkCanvas ? 100 : 60}
                scale={[12, 7.5, 12]}
                position={[0, 2.6, 0]}
                size={isDarkCanvas ? 3.8 : 3.2}
                speed={0.35}
                opacity={isDarkCanvas ? 0.85 : 0.65}
                color={isDarkCanvas ? '#A7F3D0' : '#F59E0B'}
              />

              <BackWalls isDark={isDarkCanvas} />
              <AxisTicks isDark={isDarkCanvas} />
              <FocusFX idea={focusIdea} position={focusPos} />

              {ideaPositions.map(({ idea, position }, index) => (
                <IdeaNode3D
                  key={idea.id}
                  index={index}
                  idea={idea}
                  position={position}
                  isSelected={selectedIdea?.id === idea.id}
                  isHovered={hoveredIdea?.id === idea.id}
                  onHover={setHoveredIdea}
                  onClick={(clicked) => {
                    onSelectIdea(clicked);
                    onOpenDetailModal(clicked);
                  }}
                />
              ))}
            </Canvas>

            {/* Floating Glassmorphism Card saat Hover */}
            {hoveredIdea && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-80 z-20 bg-[#0B1622]/92 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-700/80 shadow-2xl transition-all animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#BEF264] text-[#0F1C24] font-black text-xs flex items-center justify-center">
                      {hoveredIdea.order_num}
                    </span>
                    <span className="text-xs font-bold text-slate-300">Ide Terpilih</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    style={{
                      backgroundColor: QUADRANT_CONFIG[hoveredIdea.quadrant].bgTint,
                      color: QUADRANT_CONFIG[hoveredIdea.quadrant].color,
                    }}
                  >
                    {hoveredIdea.quadrant}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {hoveredIdea.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {hoveredIdea.description}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center bg-black/40 p-2 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Feasibility</span>
                    <span className="font-bold text-white">{hoveredIdea.feasibility} / 5</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Impact</span>
                    <span className="font-bold text-white">{hoveredIdea.impact} / 5</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total Skor</span>
                    <span className="font-extrabold text-[#BEF264]">{hoveredIdea.total_score} / 10</span>
                  </div>
                </div>

                <div className="mt-2.5 text-center">
                  <button
                    onClick={() => onOpenDetailModal(hoveredIdea)}
                    className="w-full py-1.5 rounded-xl bg-[#BEF264] hover:bg-[#a3e635] text-[#0F1C24] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Buka Analisis Lengkap</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Instruction Badge */}
            <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium pointer-events-none border border-white/10">
              <Compass className="w-3.5 h-3.5 text-[#BEF264]" />
              <span>Drag rotasi 360° · Scroll zoom · Klik titik untuk detail</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <strong className="text-slate-700">Sumbu X:</strong> Kelayakan (Feasibility 1–5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <strong className="text-slate-700">Sumbu Z:</strong> Dampak Bisnis (Impact 1–5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <strong className="text-slate-700">Sumbu Y (Tinggi):</strong> Skor Total (2–10)
          </span>
        </div>
      </div>
    </div>
  );
};