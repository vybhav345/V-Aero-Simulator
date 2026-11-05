/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  GitFork,
  CheckCircle2,
  AlertOctagon,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface StageFlowStep {
  stageNumber: number;
  id: string;
  title: string;
  subtitle: string;
  inputs: string[];
  outputs: string[];
  activeWIP: number;
  scrapLossPct: number;
  reworkPct: number;
  color: string;
}

export const ValueStreamSankeyView: React.FC = () => {
  const { sim } = useSimStore();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(2); // Default Stage 3 components

  // 7-Stage Aerospace Value Chain
  const stages: StageFlowStep[] = [
    {
      stageNumber: 1,
      id: 'stage1_raw',
      title: 'Stage 1 – Raw Materials & Mining',
      subtitle: 'Global Extraction & Refining Feedstocks',
      inputs: ['Bauxite Ore', 'Titanium Sponge (Rutile)', 'Class-1 Nickel', 'Lithium Carbonate', 'PAN Precursor', 'LOX/RP-1 Feedstock'],
      outputs: ['Refined Pure Ingot', 'Gas Atomization Stock', 'Polymer Resins', 'Cryogenic Liquids'],
      activeWIP: 28,
      scrapLossPct: 1.2,
      reworkPct: 0.5,
      color: '#38bdf8',
    },
    {
      stageNumber: 2,
      id: 'stage2_primary',
      title: 'Stage 2 – Primary Processing',
      subtitle: 'Vacuum Arc Melting, Rolling & Gas Atomization',
      inputs: ['Refined Met Ingot', 'Alloy Constituents', 'Towpreg Precursor'],
      outputs: ['Al-Li 2195 Cryo Plate', 'Ti-6Al-4V Bar', 'Inconel 718 Billets', 'GRCop-84 AM Powder', 'T1000G Prepreg Rolls'],
      activeWIP: 14,
      scrapLossPct: 3.5,
      reworkPct: 1.8,
      color: '#60a5fa',
    },
    {
      stageNumber: 3,
      id: 'stage3_components',
      title: 'Stage 3 – Component Manufacturing (Tier 2/3)',
      subtitle: '5-Axis CNC, SLM/DMLS Metal 3D Printing, Autoclaves',
      inputs: ['Al-Li Plates', 'GRCop-84 Powder', 'Inconel Billets', 'Carbon Prepreg', 'Rad-Hard Silicon'],
      outputs: ['DMLS Regenerative Chambers', 'CNC Turbopump Impellers', 'Main Valves', 'Avionics Computers', 'Fairing Halves'],
      activeWIP: sim.workOrders.filter((w) => w.stage === 'stage3_components').length,
      scrapLossPct: 5.8,
      reworkPct: 4.2,
      color: '#818cf8',
    },
    {
      stageNumber: 4,
      id: 'stage4_subsystems',
      title: 'Stage 4 – Subsystem Assembly',
      subtitle: 'Friction-Stir Welded Tanks, Octaweb Clusters & Engines',
      inputs: ['Tank Isogrid Barrels', 'DMLS Chambers', 'Turbopumps', 'Composite Rings'],
      outputs: ['First Stage LOX Tank', 'Second Stage Tank', '9-Engine Thrust Cluster', 'Interstage Structure'],
      activeWIP: sim.workOrders.filter((w) => w.stage === 'stage4_subsystems').length,
      scrapLossPct: 2.8,
      reworkPct: 3.1,
      color: '#a78bfa',
    },
    {
      stageNumber: 5,
      id: 'stage5_testing',
      title: 'Stage 5 – Testing & Quality Assurance',
      subtitle: 'NDT CT Scans, Hydro Proof Burst, Turbopump Spin, Hotfire',
      inputs: ['Complete Tanks', 'Rocket Engines', 'Avionics Packages'],
      outputs: ['Flight-Qualified Tanks', 'Acceptance Hotfire Certified Engines', 'EMI Verified Avionics'],
      activeWIP: sim.testRecords.length,
      scrapLossPct: 1.5,
      reworkPct: 6.5,
      color: '#c084fc',
    },
    {
      stageNumber: 6,
      id: 'stage6_integration',
      title: 'Stage 6 – Vehicle Integration',
      subtitle: 'Sriharikota SDSC-SHAR Vehicle Assembly Building (VAB) & Stacking',
      inputs: ['Stage 1 Booster', 'Interstage', 'Stage 2 Vacuum / Cryo Stage', 'Payload Fairing'],
      outputs: ['Integrated Flight Stack', 'Wet Dress Rehearsal Verified Vehicle'],
      activeWIP: sim.rockets.filter((r) => r.status === 'in_production' || r.status === 'testing').length,
      scrapLossPct: 0.2,
      reworkPct: 1.2,
      color: '#e879f9',
    },
    {
      stageNumber: 7,
      id: 'stage7_launch',
      title: 'Stage 7 – Logistics & Orbital Launch',
      subtitle: 'Sriharikota Second Launch Pad (SLP) Terminal Countdown & Orbit',
      inputs: ['Integrated Flight Stack', 'Satellite Payload', 'Cryogenic LOX/Isrosene'],
      outputs: ['Orbital Payload Delivery', 'Mission Revenue (₹280 Cr)', 'Atmanirbhar Space Clearance'],
      activeWIP: sim.rockets.filter((r) => r.status === 'flight_ready' || r.status === 'launched_success').length,
      scrapLossPct: 0.0,
      reworkPct: 0.0,
      color: '#34d399',
    },
  ];

  const currentStage = stages[selectedStageIdx];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <GitFork className="w-4 h-4 text-cyan-400" />
          <span>End-to-End Aerospace Value Stream (7 Manufacturing Gates)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Material mass and cost progression through all transformation phases. Click any gate below to inspect throughput, scrap losses, and rework loops.
        </p>
      </div>

      {/* Interactive 7-Stage Horizontal Value Stream Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {stages.map((stage, idx) => {
          const isSelected = selectedStageIdx === idx;
          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStageIdx(idx)}
              className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950 text-white scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                    GATE {stage.stageNumber}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>
                <h4 className="font-bold text-xs text-white line-clamp-1 mb-1">
                  {stage.title.split('–')[1]?.trim() || stage.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>

              {/* Yield & Scrap mini stats */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Scrap:</span>
                <span className="text-rose-400 font-bold">{stage.scrapLossPct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Gate Analysis View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Flow Transformation Diagram */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div>
              <div className="font-mono text-cyan-400 text-xs font-bold uppercase tracking-wider">
                Gate {currentStage.stageNumber} Transformation Engine
              </div>
              <h4 className="text-base font-extrabold text-white">{currentStage.title}</h4>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">Active Orders</span>
              <span className="font-extrabold text-cyan-300 text-base">{currentStage.activeWIP}</span>
            </div>
          </div>

          {/* Transformation Visual (Inputs -> Process -> Outputs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Inputs Box */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1">
                <span>Material Inputs</span>
              </div>
              {currentStage.inputs.map((inp, i) => (
                <div
                  key={i}
                  className="p-1.5 bg-slate-900 rounded border border-slate-800 text-xs font-medium text-slate-200"
                >
                  {inp}
                </div>
              ))}
            </div>

            {/* Middle Transformation Node */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-cyan-900/60 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950">
                <Layers className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs text-white">{currentStage.subtitle}</div>
              <div className="text-[11px] text-slate-400">
                First-Pass Yield:{' '}
                <span className="text-emerald-400 font-bold font-mono">
                  {(100 - currentStage.scrapLossPct - currentStage.reworkPct).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Outputs Box */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1">
                <span>Certified Outputs</span>
              </div>
              {currentStage.outputs.map((outp, i) => (
                <div
                  key={i}
                  className="p-1.5 bg-slate-900 rounded border border-slate-800 text-xs font-medium text-emerald-300"
                >
                  {outp}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Yield Loss, Scrap & Rework Economics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Yield Losses & Rework Economics</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Material shrinkage and non-conformance impact at this stage.
            </p>
          </div>

          <div className="space-y-3">
            {/* Scrap Rate */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-semibold">Material Scrap Loss</span>
                <span className="font-mono font-bold text-rose-400">{currentStage.scrapLossPct}%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Irrecoverable machining chips, trim offal, and rejected weld coupons. Recycled to foundry at 88% circularity.
              </p>
            </div>

            {/* Rework Loop */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-semibold">MRB Rework Loop</span>
                <span className="font-mono font-bold text-amber-400">{currentStage.reworkPct}%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Parts requiring secondary deburring, EDM skim passes, or seal re-lapping before clearance.
              </p>
            </div>

            {/* AS9100 Quality Gate Check */}
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/50">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>AS9100 Quality Gate Clearance</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                100% of lots exiting Gate {currentStage.stageNumber} receive automated certificate numbers with genealogy records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
