/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Play,
  Pause,
  StepForward,
  PlusCircle,
  HelpCircle,
  Save,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Users,
  BarChart3,
  X,
  Building2,
  CheckCircle2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Rupee } from './Rupee.tsx';

export const Navbar: React.FC = () => {
  const {
    sim,
    startSim,
    pauseSim,
    setSpeed,
    stepOnce,
    setActiveModal,
    setActiveTab,
  } = useSimStore();

  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);

  useEffect(() => {
    if (!sim.isRunning) return;

    const intervalMs =
      sim.speed === 1000 ? 15 : sim.speed === 100 ? 80 : sim.speed === 10 ? 300 : 1000;

    const timer = setInterval(() => {
      stepOnce();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [sim.isRunning, sim.speed, stepOnce]);

  const formatTime = (totalHours: number) => {
    const dayOfYear = Math.floor(totalHours / 24) + 1;
    const hour = totalHours % 24;
    const utcHour = (hour + 18) % 24; // IST is UTC+5:30
    const shift =
      hour >= 6 && hour < 14 ? 'Shift A (Morning)' : hour >= 14 && hour < 22 ? 'Shift B (Evening)' : 'Shift C (Night)';
    return {
      clockIST: `D${String(dayOfYear).padStart(3, '0')} ${String(hour).padStart(2, '0')}:00 IST`,
      clockUTC: `${String(utcHour).padStart(2, '0')}:30 UTC`,
      met: `MET T+ ${Math.floor(totalHours / 24)}d ${String(hour).padStart(2, '0')}h`,
      shift,
    };
  };

  const timeData = formatTime(sim.tick);
  const openNcrs = sim.ncrs.filter((n) => n.status !== 'resolved').length;

  return (
    <>
      <header className="bg-slate-950 border-b border-slate-800 text-slate-100 select-none sticky top-0 z-40 px-4 py-2.5 shadow-xl">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Clean Hub Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-blue-950/40 overflow-hidden">
              <img
                src="/assets/aistudio/logo-vv_51cd0b98.png"
                alt="V-AERO Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-xl text-white font-mono">
                  V-<span className="text-orange-400">AERO</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold hidden sm:inline">
                  Heavy Aerospace Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Rocket Manufacturing & Flight Operations Simulator
              </p>
            </div>
          </div>

          {/* Central Shop-Floor Clock & Active Shift Controls */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 shadow-inner space-x-2">
            {/* Calendar & Shift Indicator */}
            <div className="px-3 py-1 bg-slate-950 rounded border border-slate-800/80 font-mono text-xs font-semibold tracking-wider flex items-center space-x-2.5">
              <span className="relative flex h-2 w-2">
                {sim.isRunning ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
                )}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-cyan-400 font-bold">{timeData.clockIST}</span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
                  <span>{timeData.clockUTC}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{timeData.met}</span>
                </span>
              </div>
              <span className="text-orange-300 border-l border-slate-800 pl-2 text-[11px] font-sans font-bold flex items-center space-x-1 hidden md:flex">
                <Users className="w-3 h-3 text-orange-400" />
                <span>{timeData.shift}</span>
              </span>
            </div>

            {/* Controls: Play/Pause, Step, Speed */}
            <div className="flex items-center space-x-1">
              {sim.isRunning ? (
                <button
                  onClick={pauseSim}
                  title="Pause Operations"
                  className="p-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={startSim}
                  title="Start Shop Floor Run"
                  className="p-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={stepOnce}
                title="Advance 1 Hour (Step)"
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <StepForward className="w-4 h-4" />
              </button>

              {/* Speed Selector Buttons */}
              <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800 text-xs font-mono">
                {([1, 10, 100, 1000] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeed(spd)}
                    className={`px-2 py-1 rounded transition-colors ${
                      sim.speed === spd
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clean Action Cluster: Pop-up Telemetry Drawer + Primary Action */}
          <div className="flex items-center space-x-2.5">
            {/* Pop-up Telemetry & KPI Trigger Button */}
            <button
              onClick={() => setShowTelemetryModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-semibold transition-all shadow-md group cursor-pointer"
              title="Click to view full Plant Telemetry, Shop OEE, Capital, and AS9100 Quality Metrics"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-200 hidden sm:inline">Telemetry & KPIs</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {sim.kpis.overallEquipmentEffectiveness}% OEE
              </span>
              {openNcrs > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${openNcrs} Open NCRs`} />
              )}
            </button>

            {/* Action: New Production Order */}
            <button
              onClick={() => setActiveModal('new_order')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-950 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Rocket Order</span>
            </button>

            {/* Save / Load */}
            <button
              onClick={() => setActiveModal('save_load')}
              title="Save / Load JSON Simulation State"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Glossary */}
            <button
              onClick={() => setActiveModal('glossary')}
              title="Aerospace Manufacturing Glossary & Technical Guide"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          POPOVER / POP-UP STYLE PLANT TELEMETRY MODAL
          (Eliminates first-look clutter, opens rich data on demand)
          ========================================================================= */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Plant Operations Telemetry & High-Level KPIs
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live discrete-event manufacturing status across 5 Indian aerospace clusters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono">
              {/* OEE */}
              <div
                onClick={() => { setShowTelemetryModal(false); setActiveTab('factory_bays'); }}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-700 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="uppercase text-[10px] font-bold">Shop OEE</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-cyan-400">
                  {sim.kpis.overallEquipmentEffectiveness}%
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  5-Axis CNC & FSW availability and speed
                </div>
              </div>

              {/* Indigenization Ratio */}
              <div
                onClick={() => { setShowTelemetryModal(false); setActiveTab('vendor_development'); }}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-emerald-700 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="uppercase text-[10px] font-bold">Indigenized</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {sim.kpis.indigenizationRatioPct}%
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Local MSME vendor tier content
                </div>
              </div>

              {/* Capital Balance */}
              <div
                onClick={() => { setShowTelemetryModal(false); setActiveTab('shop_economics'); }}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-700 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="uppercase text-[10px] font-bold">Capital</span>
                  <Rupee className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  ₹{(sim.financials.cashBalanceINR / 1e7).toFixed(1)} Cr
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Liquid working balance
                </div>
              </div>
            </div>

            {/* Quality & Production Status */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-900 pb-2">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span>Quality Assurance & Active Work Orders</span>
                </span>
                <span className="text-slate-500 text-[11px]">
                  AS9100 Rev D Compliance: 98.5% FPY
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Open NCRs:</span>
                  <span className={openNcrs > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {openNcrs} {openNcrs > 0 ? 'Pending MRB' : 'All Cleared'}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-400">Rockets in Stacking:</span>
                  <span className="text-cyan-400 font-bold">
                    {sim.rockets.length} Vehicles
                  </span>
                </div>
              </div>
            </div>

            {/* Aerospace Operational Clearances */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-bold">DEFCON:</span>
                <span className="text-emerald-400 font-semibold">STAGE-5 (NOMINAL)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-bold">SDSC-SHAR:</span>
                <span className="text-cyan-400 font-semibold">RANGE GREEN</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-slate-300 font-bold">CENTERS:</span>
                <span className="text-slate-300">BLR • HYD • TVM • IPRC • SHAR</span>
              </span>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Telemetry Card
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
