/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { WorkOrder } from '../types/index.ts';

export const ProductionPlannerView: React.FC = () => {
  const { sim, selectedRocketSerial, setSelectedRocketSerial, expediteWorkOrder } = useSimStore();
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = sim.workOrders.filter((wo) => {
    const matchRocket = selectedRocketSerial ? wo.rocketSerial === selectedRocketSerial : true;
    const matchStage = filterStage === 'all' ? true : wo.stage === filterStage;
    const matchStatus = filterStatus === 'all' ? true : wo.status === filterStatus;
    return matchRocket && matchStage && matchStatus;
  });

  // Calculate bottleneck work orders (orders with dependencies waiting)
  const totalWos = sim.workOrders.length;
  const inProgressWos = sim.workOrders.filter((w) => w.status === 'in_progress').length;
  const readyWos = sim.workOrders.filter((w) => w.status === 'ready').length;
  const completedWos = sim.workOrders.filter((w) => w.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Telemetry Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Work Orders (WIP)</span>
            <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-white">
            {totalWos} Dispatched
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across All Vehicles</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>In-Progress on Floor</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-blue-400">
            {inProgressWos} Workstations
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active Spindle Time</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Queued & Ready</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-amber-400">
            {readyWos} Operations
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting Machine Bay</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Completed Operations</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-emerald-400">
            {completedWos} Passed
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Inspected & Cleared</div>
        </div>
      </div>

      {/* Filter and Vehicle Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Rocket Switcher */}
          <select
            value={selectedRocketSerial || ''}
            onChange={(e) => setSelectedRocketSerial(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
          >
            {sim.rockets.map((r) => (
              <option key={r.id} value={r.serialNumber}>
                {r.serialNumber}: {r.designName}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          >
            <option value="all">All Stages</option>
            <option value="stage3_components">Stage 3 – Components</option>
            <option value="stage4_subsystems">Stage 4 – Subsystems</option>
            <option value="stage5_testing">Stage 5 – Testing</option>
            <option value="stage6_integration">Stage 6 – Integration</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready to Machine</option>
            <option value="planned">Planned (Waiting Prereqs)</option>
            <option value="rework">Under MRB Rework</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredOrders.length} of {sim.workOrders.length} Work Orders
        </div>
      </div>

      {/* Gantt & Operations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Order Number</th>
              <th className="p-3">Operation / Part</th>
              <th className="p-3">Stage</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned Cell</th>
              <th className="p-3">Remaining Time</th>
              <th className="p-3 min-w-[180px]">Progress (Gantt Schedule)</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredOrders.map((wo) => {
              const isCompleted = wo.status === 'completed';
              const isInProgress = wo.status === 'in_progress';
              const isRework = wo.status === 'rework';
              const isReady = wo.status === 'ready';

              const progressPct = isCompleted
                ? 100
                : isInProgress
                ? Math.round(
                    ((wo.estimatedDurationHours - wo.remainingHours) /
                      Math.max(1, wo.estimatedDurationHours)) *
                      100
                  )
                : 0;

              const assignedMac = sim.machines.find((m) => m.id === wo.assignedMachineId);

              return (
                <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400 text-[11px] whitespace-nowrap">
                    {wo.orderNumber}
                  </td>
                  <td className="p-3 font-semibold text-slate-200">
                    <div>{wo.partName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Dependencies: {wo.dependencies.length} prerequisite parts
                    </div>
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px] capitalize whitespace-nowrap">
                    {wo.stage.replace('_', ' ')}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isInProgress
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                          : isRework
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : isReady
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {wo.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-xs truncate max-w-[150px]">
                    {assignedMac ? assignedMac.name : <span className="text-slate-500 italic">Unassigned</span>}
                  </td>
                  <td className="p-3 font-mono text-cyan-300 whitespace-nowrap">
                    {isCompleted ? 'Done' : `${wo.remainingHours} hrs`}
                  </td>
                  <td className="p-3">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isRework
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {isInProgress || isRework ? (
                      <button
                        onClick={() => expediteWorkOrder(wo.id, 12)}
                        className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-[10px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                        title="Accelerate operation by 12 hours"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{wo.remainingHours <= 12 ? 'Complete' : '⚡ -12h'}</span>
                      </button>
                    ) : isCompleted ? (
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">✓ Cleared</span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">Queued</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
