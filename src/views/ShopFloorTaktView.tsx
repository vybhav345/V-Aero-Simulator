/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Gauge,
  Layers,
  Wrench,
  Boxes,
  Play,
} from 'lucide-react';

export const ShopFloorTaktView: React.FC = () => {
  const {
    sim,
    setActiveTab,
    setSelectedRocketSerial,
    setActiveModal,
    expediteWorkOrder,
    startSim,
    stepOnce,
  } = useSimStore();
  const [bayFilter, setBayFilter] = useState<string>('all');

  const runningMachines = sim.machines.filter((m) => m.status === 'running').length;
  const breakdownMachines = sim.machines.filter((m) => m.status === 'breakdown').length;
  const highWearMachines = sim.machines.filter((m) => m.toolingWearPct > 35).length;

  const currentRocket = sim.rockets[0];

  // Current Shift calculation
  const hour = sim.tick % 24;
  const shiftName =
    hour >= 6 && hour < 14
      ? 'Shift A (06:00 – 14:00 IST)'
      : hour >= 14 && hour < 22
      ? 'Shift B (14:00 – 22:00 IST)'
      : 'Shift C (22:00 – 06:00 IST)';

  const activeOrders = sim.workOrders.filter((w) => w.status === 'in_progress');
  const readyOrders = sim.workOrders.filter((w) => w.status === 'ready');

  // Dynamic real-time calculation of WIP parts per manufacturing bay
  const cncOrders = sim.workOrders.filter(
    (w) =>
      (w.machineTypeNeeded === 'cnc_5axis' || w.assignedMachineId?.includes('cnc')) &&
      w.status !== 'completed' &&
      w.status !== 'scrapped'
  );
  const cncActive = cncOrders.filter((w) => w.status === 'in_progress').length;
  const cncQueued = cncOrders.filter((w) => w.status === 'ready' || w.status === 'planned').length;

  const dmlsOrders = sim.workOrders.filter(
    (w) =>
      (w.machineTypeNeeded === 'slm_dmls_3d' || w.assignedMachineId?.includes('dmls')) &&
      w.status !== 'completed' &&
      w.status !== 'scrapped'
  );
  const dmlsActive = dmlsOrders.filter((w) => w.status === 'in_progress').length;
  const dmlsQueued = dmlsOrders.filter((w) => w.status === 'ready' || w.status === 'planned').length;

  const fswOrders = sim.workOrders.filter(
    (w) =>
      (w.machineTypeNeeded === 'fsw_gantry' || w.assignedMachineId?.includes('fsw')) &&
      w.status !== 'completed' &&
      w.status !== 'scrapped'
  );
  const fswActive = fswOrders.filter((w) => w.status === 'in_progress').length;
  const fswQueued = fswOrders.filter((w) => w.status === 'ready' || w.status === 'planned').length;

  const smtOrders = sim.workOrders.filter(
    (w) =>
      (w.machineTypeNeeded === 'cleanroom_smt' || w.assignedMachineId?.includes('cleanroom') || w.assignedMachineId?.includes('smt')) &&
      w.status !== 'completed' &&
      w.status !== 'scrapped'
  );
  const smtActive = smtOrders.filter((w) => w.status === 'in_progress').length;
  const smtQueued = smtOrders.filter((w) => w.status === 'ready' || w.status === 'planned').length;

  return (
    <div className="space-y-6">
      {/* Top Shop-Floor Takt & Operations Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Active Shift */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm col-span-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Active Factory Shift</span>
            <Users className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-base font-extrabold text-orange-300 font-mono">
            {shiftName}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {sim.workers.length} Certified Operators Logged In
          </div>
        </div>

        {/* Shop Floor OEE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Plant OEE</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            {sim.kpis.overallEquipmentEffectiveness}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {runningMachines}/{sim.machines.length} Cells In Spindle
          </div>
        </div>

        {/* First-Pass Yield */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>First-Pass Yield</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {sim.kpis.firstPassYieldRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Stage QA Pass Rate</div>
        </div>

        {/* In-Spindle Jobs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Active In-Spindle</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-400 font-mono">
            {activeOrders.length} Ops
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {readyOrders.length} Queued in Bay
          </div>
        </div>

        {/* Indigenization Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Atmanirbhar %</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {sim.kpis.indigenizationRatioPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Local Vendor Provenance</div>
        </div>

        {/* Open NCRs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>MRB Non-Conformance</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">
            {sim.kpis.openNCRCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Shop Floor Holds</div>
        </div>

        {/* Primary Bottleneck */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Shop Bottleneck</span>
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-amber-300 truncate" title={sim.kpis.activeBottleneckStation}>
            {sim.kpis.activeBottleneckStation || 'Nominal Flow (Balanced)'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Theory of Constraints (TOC)</div>
        </div>
      </div>

      {/* Simulation Clock Guidance Banner */}
      {!sim.isRunning && (
        <div className="bg-amber-950/70 border border-amber-700/60 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shadow-md">
          <div className="flex items-center space-x-2 text-amber-200">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Simulation Clock is Paused</strong> ({shiftName.split(' ')[0]}). Machines process parts when the clock runs, or click <strong>⚡ Expedite</strong> on any card to complete it immediately.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => startSim()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Simulation (▶)</span>
            </button>
            <button
              onClick={() => stepOnce()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
            >
              Step +1h
            </button>
          </div>
        </div>
      )}

      {/* Main Shop-Floor Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Job Route Cards & Manufacturing Bays Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Factory className="w-4 h-4 text-orange-400" />
              <span>Active Job Route Cards & Machine Assignments</span>
            </h3>
            <button
              onClick={() => setActiveTab('factory_bays')}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
            >
              <span>Inspect Machine Bay Layouts →</span>
            </button>
          </div>

          {/* Active Job Cards on Floor */}
          <div className="space-y-3">
            {activeOrders.map((wo) => {
              const assignedMac = sim.machines.find((m) => m.id === wo.assignedMachineId);
              const assignedWrk = sim.workers.find((w) => w.id === wo.assignedWorkerId);
              const progressPct = Math.round(
                ((wo.estimatedDurationHours - wo.remainingHours) / Math.max(1, wo.estimatedDurationHours)) * 100
              );

              return (
                <div
                  key={wo.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                        {wo.orderNumber}
                      </span>
                      <h4 className="font-bold text-white text-sm">{wo.partName}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      {wo.remainingHours}h remaining
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400 mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Workstation</span>
                      <span className="text-slate-200 font-bold truncate block">
                        {assignedMac ? assignedMac.name.split('(')[0] : 'In Buffer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Operator</span>
                      <span className="text-slate-200 font-bold truncate block">
                        {assignedWrk ? assignedWrk.name : 'Automated Gantry'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Job Card / Route</span>
                      <span className="text-orange-300 font-bold truncate block">
                        {wo.jobCardNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Fixture Alignment</span>
                      <span className="text-emerald-400 font-bold block">✓ VERIFIED</span>
                    </div>
                  </div>

                  {/* Progress Bar & Expedite Button */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-400">Operation Progress ({progressPct}%)</span>
                      <button
                        onClick={() => expediteWorkOrder(wo.id, 12)}
                        className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-sm shadow-orange-950"
                        title="Accelerate spindle machining hours for this part"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{wo.remainingHours <= 12 ? 'Complete & Clear Spindle' : '⚡ Expedite (-12 hrs)'}</span>
                      </button>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {activeOrders.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                <p className="mb-2">All dispatched route cards completed or waiting prerequisite staging.</p>
                <button
                  onClick={() => setActiveModal('new_order')}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Create Production Order
                </button>
              </div>
            )}
          </div>

          {/* Queued Work in Progress (WIP) by Bay */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Shop-Floor Work-in-Progress (WIP) Buffers by Bay</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">5-Axis CNC Bay</div>
                <div className="text-lg font-mono font-bold text-white mt-1">
                  {cncActive > 0 ? `${cncActive} In Spindle` : cncQueued > 0 ? `${cncQueued} Queued` : '0 Parts (Idle)'}
                </div>
                <div className={`text-[10px] mt-0.5 ${cncOrders.length === 0 ? 'text-emerald-400' : sim.kpis.activeBottleneckStation.includes('CNC') ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {cncOrders.length === 0 ? 'All Parts Machined ✓' : sim.kpis.activeBottleneckStation.includes('CNC') ? 'Active Constraint (TOC)' : 'Balanced Pacing'}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Laser DMLS Bay</div>
                <div className="text-lg font-mono font-bold text-white mt-1">
                  {dmlsActive > 0 ? `${dmlsActive} Printing` : dmlsQueued > 0 ? `${dmlsQueued} Queued` : '0 Parts (Idle)'}
                </div>
                <div className={`text-[10px] mt-0.5 ${dmlsOrders.length === 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {dmlsOrders.length === 0 ? 'All Parts Sintered ✓' : 'Argon Buffer Nominal'}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">FSW Gantry Bay</div>
                <div className="text-lg font-mono font-bold text-white mt-1">
                  {fswActive > 0 ? `${fswActive} Welding` : fswQueued > 0 ? `${fswQueued} Queued` : '0 Parts (Idle)'}
                </div>
                <div className={`text-[10px] mt-0.5 ${fswOrders.length === 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {fswOrders.length === 0 ? 'All Welds Certified ✓' : 'Pre-Weld Aligned'}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Cleanroom SMT Bay</div>
                <div className="text-lg font-mono font-bold text-white mt-1">
                  {smtActive > 0 ? `${smtActive} Pick & Place` : smtQueued > 0 ? `${smtQueued} Queued` : '0 Parts (Idle)'}
                </div>
                <div className={`text-[10px] mt-0.5 ${smtOrders.length === 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {smtOrders.length === 0 ? 'All PCBs Populated ✓' : 'IPC Space Verified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Current Vehicle Build Telemetry & Shop Floor Alerts */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-orange-400 font-bold uppercase block">
                  Active Vehicle Assembly
                </span>
                <h4 className="font-extrabold text-white text-base">
                  {currentRocket ? currentRocket.serialNumber : 'VA-SN-001'}
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-mono">
                {currentRocket ? currentRocket.status.replace('_', ' ') : 'In Production'}
              </span>
            </div>

            {currentRocket && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-400">Total Structural Completion</span>
                    <span className="text-orange-400 font-bold">{currentRocket.productionProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${currentRocket.productionProgressPct}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Architecture:</span>
                    <span className="text-slate-200 font-bold">{currentRocket.designName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flight Reliability:</span>
                    <span className="text-emerald-400 font-bold">{currentRocket.calculatedReliability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inspected Route Cards:</span>
                    <span className="text-cyan-400 font-bold">{currentRocket.genealogyRecords.length} Cleared</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qualification Tests:</span>
                    <span className="text-orange-300 font-bold">{currentRocket.qualificationTestsPassed.length}/7 Completed</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('mahendragiri_launch')}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-cyan-950"
                >
                  <span>Go to Mahendragiri Propulsion Grounds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Real-Time Shop Floor Telemetry Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Shop-Floor Event Dispatch & Alarms</span>
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1 text-xs">
              {sim.events.slice(-6).reverse().map((evt, idx) => (
                <div
                  key={`${evt.id}-${evt.tick}-${idx}`}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-orange-400">{evt.timestamp}</span>
                    <span className="uppercase text-slate-400">{evt.category}</span>
                  </div>
                  <div className="font-semibold text-slate-200">{evt.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{evt.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
