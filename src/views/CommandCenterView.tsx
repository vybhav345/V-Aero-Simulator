/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Rocket,
  CheckCircle,
  AlertTriangle,
  Factory,
  TrendingUp,
  Flame,
  ShieldAlert,
  ArrowRight,
  Filter,
  Zap,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';

export const CommandCenterView: React.FC = () => {
  const { sim, setActiveTab, setSelectedRocketSerial, setActiveModal } = useSimStore();
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');

  const filteredEvents = sim.events.filter((evt) =>
    eventCategoryFilter === 'all' ? true : evt.category === eventCategoryFilter
  );

  const activeRockets = sim.rockets.filter(
    (r) => r.status === 'in_production' || r.status === 'testing' || r.status === 'flight_ready'
  );

  const runningMachines = sim.machines.filter((m) => m.status === 'running').length;
  const breakdownMachines = sim.machines.filter((m) => m.status === 'breakdown').length;

  return (
    <div className="space-y-6">
      {/* Top 8 Aerospace KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Rockets Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Rockets Done</span>
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {sim.kpis.rocketsCompleted}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {sim.kpis.rocketsInProduction} in active WIP
          </div>
        </div>

        {/* First Pass Yield (FPY) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>First Pass Yield</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            {sim.kpis.firstPassYieldRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">AS9100 Acceptance</div>
        </div>

        {/* OEE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Factory OEE</span>
            <Zap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-400 font-mono">
            {sim.kpis.overallEquipmentEffectiveness}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {runningMachines}/{sim.machines.length} Cells Active
          </div>
        </div>

        {/* Fleet Reliability */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Launch Reliability</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            {sim.kpis.fleetReliabilityScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Statistical Model</div>
        </div>

        {/* Working Capital */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Cash Capital</span>
            <Rupee className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono flex items-center">
            <span>₹{(sim.financials.cashBalanceINR / 1e7).toFixed(1)} Cr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">IN-SPACe Escrow</div>
        </div>

        {/* Unit Cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Avg Vehicle Cost</span>
            <Rupee className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono flex items-center">
            <span>₹{(sim.kpis.averageCostPerRocketINR / 1e7).toFixed(0)} Cr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Wright's 85% Curve</div>
        </div>

        {/* Open NCRs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Open NCRs</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">
            {sim.kpis.openNCRCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MRB Decisions Due</div>
        </div>

        {/* Theory of Constraints Bottleneck */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>TOC Bottleneck</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-sm font-extrabold text-rose-400 truncate" title={sim.kpis.activeBottleneckStation}>
            {sim.kpis.activeBottleneckStation}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Theory of Constraints</div>
        </div>
      </div>

      {/* Main Grid: Active Production Rockets & Factory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Rockets in Production */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>Active Rocket Production & Test Status</span>
            </h3>
            <button
              onClick={() => setActiveModal('new_order')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>+ Order Another Vehicle</span>
            </button>
          </div>

          <div className="space-y-4">
            {activeRockets.map((rocket) => {
              const isFlightReady = rocket.status === 'flight_ready';
              const isTesting = rocket.status === 'testing';

              return (
                <div
                  key={rocket.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-extrabold text-cyan-400 text-sm">
                        {rocket.serialNumber.replace('SN-', '')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-white text-base">
                            {rocket.serialNumber} — {rocket.designName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                              isFlightReady
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : isTesting
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {rocket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          Calculated Flight Reliability: {rocket.calculatedReliability}% | AS9100 Inspected Lots: {rocket.genealogyRecords.length}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons based on vehicle state */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRocketSerial(rocket.serialNumber);
                          setActiveTab('bom_traceability');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Inspect BOM
                      </button>

                      {isFlightReady ? (
                        <button
                          onClick={() => {
                            setSelectedRocketSerial(rocket.serialNumber);
                            setActiveTab('mahendragiri_launch');
                          }}
                          className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 animate-pulse transition-all cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Go For Launch!</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRocketSerial(rocket.serialNumber);
                            setActiveTab('mahendragiri_launch');
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Test Stands ({rocket.qualificationTestsPassed.length}/7)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Overall Production Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400 font-semibold">Assembly Completion</span>
                      <span className="text-cyan-400 font-bold">{rocket.productionProgressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${rocket.productionProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Subsystem Readiness Mini-Meters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Stage 1 Booster</div>
                      <div className="font-mono text-slate-200 font-bold">
                        {rocket.subsystemReadiness.first_stage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Stage 2 Vacuum</div>
                      <div className="font-mono text-slate-200 font-bold">
                        {rocket.subsystemReadiness.second_stage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Engines (9x)</div>
                      <div className="font-mono text-slate-200 font-bold">
                        {rocket.subsystemReadiness.engines}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Avionics / GNC</div>
                      <div className="font-mono text-slate-200 font-bold">
                        {rocket.subsystemReadiness.avionics_gnc}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeRockets.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                <p className="mb-3">No active rockets in production.</p>
                <button
                  onClick={() => setActiveModal('new_order')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Create Production Order
                </button>
              </div>
            )}
          </div>

          {/* Quick Machine Floor Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Factory className="w-3.5 h-3.5 text-cyan-400" />
                <span>Capital Machinery Health (25 Cells)</span>
              </h4>
              <button
                onClick={() => setActiveTab('factory_bays')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                View 2D Shop Layout →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Running</div>
                <div className="font-mono text-base font-extrabold text-emerald-400">
                  {runningMachines}
                </div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Idle / Ready</div>
                <div className="font-mono text-base font-extrabold text-slate-300">
                  {sim.machines.filter((m) => m.status === 'idle').length}
                </div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Breakdown / Repair</div>
                <div className="font-mono text-base font-extrabold text-rose-400">
                  {breakdownMachines}
                </div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">High Tooling Wear</div>
                <div className="font-mono text-base font-extrabold text-amber-400">
                  {sim.machines.filter((m) => m.toolingWearPct > 40).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Simulation Event & Disruption Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Mission Telemetry & Alerts</span>
            </h3>
            {/* Filter buttons */}
            <div className="flex space-x-1 text-[10px] font-mono">
              {(['all', 'supply_chain', 'quality', 'manufacturing'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEventCategoryFilter(cat)}
                  className={`px-1.5 py-0.5 rounded uppercase ${
                    eventCategoryFilter === cat
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'supply_chain' ? 'Supply' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-[580px] overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 font-sans">
            {filteredEvents.map((evt, idx) => {
              const isCritical = evt.severity === 'critical';
              const isWarning = evt.severity === 'warning';
              const isError = evt.severity === 'error';

              return (
                <div
                  key={`${evt.id}-${evt.tick}-${idx}`}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    isCritical
                      ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                      : isError
                      ? 'bg-rose-950/40 border-rose-900 text-rose-300'
                      : isWarning
                      ? 'bg-amber-950/40 border-amber-900 text-amber-200'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                    <span className="text-cyan-400 font-semibold">{evt.timestamp}</span>
                    <span
                      className={`uppercase font-bold px-1.5 py-0.2 rounded text-[9px] ${
                        evt.category === 'quality'
                          ? 'bg-amber-950 text-amber-300'
                          : evt.category === 'supply_chain'
                          ? 'bg-blue-950 text-blue-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {evt.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-bold text-slate-100 mb-0.5 text-xs">{evt.title}</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{evt.description}</p>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                No events recorded in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
