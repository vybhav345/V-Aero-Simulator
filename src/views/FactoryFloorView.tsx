/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Factory,
  Wrench,
  Zap,
  Cpu,
  Flame,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Machine, Facility } from '../types/index.ts';

export const FactoryFloorView: React.FC = () => {
  const { sim, performMaintenance, setSelectedMachineId } = useSimStore();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const facilities = sim.facilities;

  const filteredMachines = sim.machines.filter((m) => {
    const matchFacility = selectedFacilityId === 'all' ? true : m.facilityId === selectedFacilityId;
    const matchStatus = filterStatus === 'all' ? true : m.status === filterStatus;
    return matchFacility && matchStatus;
  });

  const runningCount = sim.machines.filter((m) => m.status === 'running').length;
  const breakdownCount = sim.machines.filter((m) => m.status === 'breakdown').length;

  return (
    <div className="space-y-6">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Factory className="w-4 h-4 text-cyan-400" />
            <span>2D Factory Floor & Advanced Manufacturing Bays</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time telemetry from 25 capital machinery cells across 6 aerospace manufacturing centers.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Facility Filter */}
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          >
            <option value="all">All Facilities (6 Centers)</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.code}: {fac.name}
              </option>
            ))}
          </select>

          {/* Machine Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 rounded-lg p-1 border border-slate-800 font-mono text-xs">
            {(['all', 'running', 'idle', 'breakdown'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Machine Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMachines.map((machine) => {
          const isRunning = machine.status === 'running';
          const isBreakdown = machine.status === 'breakdown';
          const isMaintenance = machine.status === 'maintenance';
          const isWearHigh = machine.toolingWearPct > 40;

          const assignedWo = machine.currentWorkOrderId
            ? sim.workOrders.find((w) => w.id === machine.currentWorkOrderId)
            : undefined;

          const facility = sim.facilities.find((f) => f.id === machine.facilityId);

          return (
            <div
              key={machine.id}
              onClick={() => setSelectedMachineId(machine.id)}
              className={`bg-slate-900 rounded-xl p-4 border transition-all hover:border-slate-600 shadow-md flex flex-col justify-between ${
                isBreakdown
                  ? 'border-rose-800 bg-rose-950/20'
                  : isRunning
                  ? 'border-cyan-800/80'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: Machine Name & Status Pulse */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                      {facility?.code || 'SHOP CELL'}
                    </span>
                    <h4 className="font-bold text-white text-sm line-clamp-1" title={machine.name}>
                      {machine.name}
                    </h4>
                  </div>
                  {/* Status Indicator Badge */}
                  <span
                    className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isRunning
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : isBreakdown
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRunning ? 'bg-cyan-400 animate-ping' : isBreakdown ? 'bg-rose-500' : 'bg-slate-500'
                      }`}
                    />
                    <span>{machine.status}</span>
                  </span>
                </div>

                {/* Active Work Order Chip if running */}
                {assignedWo ? (
                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800/80 mb-3 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-cyan-400 font-bold">{assignedWo.orderNumber}</span>
                      <span className="text-slate-400">{assignedWo.remainingHours}h remaining</span>
                    </div>
                    <div className="text-white font-semibold line-clamp-1">{assignedWo.partName}</div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-1.5 rounded-full"
                        style={{
                          width: `${Math.round(
                            ((assignedWo.estimatedDurationHours - assignedWo.remainingHours) /
                              Math.max(1, assignedWo.estimatedDurationHours)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/50 mb-3 text-xs text-slate-500 font-mono text-center">
                    Cell Standing By (Idle)
                  </div>
                )}

                {/* Tooling Wear Gauge */}
                <div className="mb-3 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                    <span className="text-slate-400">Tooling & Bearing Wear</span>
                    <span className={`font-bold ${isWearHigh ? 'text-amber-400' : 'text-slate-300'}`}>
                      {machine.toolingWearPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        machine.toolingWearPct > 60
                          ? 'bg-rose-500'
                          : isWearHigh
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, machine.toolingWearPct)}%` }}
                    />
                  </div>
                </div>

                {/* Machine Specs row */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-3 bg-slate-950/50 p-2 rounded">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{machine.powerKw} kW</span>
                  </div>
                  <div className="flex items-center space-x-1 text-right justify-end">
                    <span>${machine.hourlyOperatingCost}/hr</span>
                  </div>
                  <div className="col-span-2 text-slate-500">
                    MTBF: {machine.mtbfHours}h | MTTR: {machine.mttrHours}h
                  </div>
                </div>
              </div>

              {/* Preventative Maintenance Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  performMaintenance(machine.id);
                }}
                className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                  machine.toolingWearPct > 30 || isBreakdown
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Service Tooling ($25k)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
