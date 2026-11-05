/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Wrench,
  Zap,
  RotateCcw,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Settings,
  Disc,
} from 'lucide-react';

export const ToolingMaintenanceView: React.FC = () => {
  const { sim, performMaintenance, changeMachineTool, realignFixture } = useSimStore();
  const [selectedMachineId, setSelectedMachineId] = useState<string>(sim.machines[0].id);

  const selectedMachine =
    sim.machines.find((m) => m.id === selectedMachineId) || sim.machines[0];

  const tools = [
    { id: 'TOOL-P1', name: 'Ø50mm Face Mill (CoroMill 390)', wearPct: 18, lifeHours: 120 },
    { id: 'TOOL-P2', name: 'Ø20mm High-Performance End Mill', wearPct: 25, lifeHours: 95 },
    { id: 'TOOL-P3', name: 'Ø16mm 5-Axis Ball Nose (Inconel Vane)', wearPct: 42, lifeHours: 60 },
    { id: 'TOOL-P4', name: 'Ø12mm Micro Impeller Blisk Cutter', wearPct: 15, lifeHours: 85 },
    { id: 'TOOL-P5', name: 'Cryogenic Valve Port Boring Bar', wearPct: 30, lifeHours: 110 },
    { id: 'TOOL-P6', name: 'FSW Threaded Pin Tool (Tungsten Rhenium)', wearPct: 22, lifeHours: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-orange-400" />
            <span>Shop Tooling, Fixtures & Preventive Maintenance Cell</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tool magazines, spindle vibration calibration, laser interferometer checks, and fixture re-indexing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Select Machine Cell:</span>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-orange-500"
          >
            {sim.machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.bayCode}: {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tool Carousel & Fixture Alignment */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                  {selectedMachine.bayName}
                </span>
                <h4 className="font-bold text-white text-base">{selectedMachine.name}</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                OEE Efficiency: {(selectedMachine.efficiency * 100).toFixed(0)}%
              </span>
            </div>

            {/* Tool Carousel Grid */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Disc className="w-4 h-4 text-orange-400" />
                <span>Automatic Tool Magazine (ATC Pockets)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tools.map((t, idx) => (
                  <div
                    key={t.id}
                    onClick={() => changeMachineTool(selectedMachine.id, t.name)}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-orange-500 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-orange-400 font-bold">Pocket {idx + 1}</span>
                      <span className="text-slate-400">{t.lifeHours}h remaining</span>
                    </div>
                    <div className="text-white text-xs font-semibold line-clamp-1">{t.name}</div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Wear:</span>
                        <span className="font-mono text-cyan-400 font-bold">{t.wearPct}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${t.wearPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixture Alignment System */}
            <div className="pt-3 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Precision Fixtures & Rotary Chuck Clamps</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">
                    {selectedMachine.fixtureId || 'ISRO-SPEC-CHUCK-01'}
                  </div>
                  <p className="text-slate-400 text-xs">
                    Hydraulic radial zero-point clamping system with laser reference datum pins.
                  </p>
                </div>
                <button
                  onClick={() => realignFixture(selectedMachine.id, selectedMachine.fixtureId || 'CHUCK-ZERO-POINT-01')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Re-Index Datum Pins (0.5µm)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Preventive Maintenance Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Total Productive Maintenance (TPM)</span>
              </h4>
              <p className="text-xs text-slate-400">
                Keep overall equipment effectiveness (OEE) above 80% to eliminate bottleneck delays.
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-sans">Hours Since Last Service</span>
                <span className="text-white text-base font-bold">
                  {selectedMachine.hoursSinceLastMaintenance} hrs
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-sans">Mean Time Between Failures</span>
                <span className="text-cyan-400 text-base font-bold">
                  {selectedMachine.mtbfHours} hrs
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-sans">Current Spindle / Tool Wear</span>
                <span className="text-amber-400 text-base font-bold">
                  {selectedMachine.toolingWearPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => performMaintenance(selectedMachine.id)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-950 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Perform Overhaul & Re-Hom Spindle (₹18.5 L)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
