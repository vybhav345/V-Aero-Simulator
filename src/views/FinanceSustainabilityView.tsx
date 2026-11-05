/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Coins,
  TrendingUp,
  Leaf,
  Zap,
  Recycle,
  AlertTriangle,
  Clock,
  Briefcase,
  Wrench,
  Users,
  Boxes,
  Building2,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';

export const FinanceSustainabilityView: React.FC = () => {
  const { sim } = useSimStore();

  const fin = sim.financials;
  const sust = sim.sustainability;

  const totalOpexINR =
    (fin.totalOpex.materialsINR || fin.totalOpex.materials * 85) +
    (fin.totalOpex.directLaborINR || fin.totalOpex.directLabor * 85) +
    (fin.totalOpex.machineDepreciation * 85) +
    (fin.totalOpex.energyAndUtilitiesINR || fin.totalOpex.energyAndUtilities * 85) +
    (fin.totalOpex.facilityOverheadINR || fin.totalOpex.facilityOverhead * 85) +
    (fin.totalOpex.scrapAndReworkLossesINR || fin.totalOpex.scrapAndReworkLosses * 85) +
    (fin.totalOpex.vendorDevelopmentGrantsINR || 0);

  // Shop floor operational cost breakdown items
  const costBreakdown = [
    {
      label: 'Aerospace Raw Materials & Cryo Stock',
      icon: Boxes,
      amountINR: fin.totalOpex.materialsINR || fin.totalOpex.materials * 85,
      color: '#38bdf8',
    },
    {
      label: 'Certified Shop-Floor Operators & Machinists Wages',
      icon: Users,
      amountINR: fin.totalOpex.directLaborINR || fin.totalOpex.directLabor * 85,
      color: '#60a5fa',
    },
    {
      label: 'Machine Spindle Runtime & Capital Depreciation',
      icon: Wrench,
      amountINR: fin.totalOpex.machineDepreciation * 85,
      color: '#a78bfa',
    },
    {
      label: 'Factory Floor High-Voltage Power & Clean Argon Grid',
      icon: Zap,
      amountINR: fin.totalOpex.energyAndUtilitiesINR || fin.totalOpex.energyAndUtilities * 85,
      color: '#c084fc',
    },
    {
      label: 'Shop Floor Scrap, Weld Defects & Rework Losses',
      icon: AlertTriangle,
      amountINR: fin.totalOpex.scrapAndReworkLossesINR || fin.totalOpex.scrapAndReworkLosses * 85,
      color: '#f43f5e',
    },
    {
      label: 'Atmanirbhar Vendor Development & Tooling Grants',
      icon: Building2,
      amountINR: fin.totalOpex.vendorDevelopmentGrantsINR || 450000000,
      color: '#fb923c',
    },
    {
      label: 'Cleanroom & Testing Facility Overhead',
      icon: Building2,
      amountINR: fin.totalOpex.facilityOverheadINR || fin.totalOpex.facilityOverhead * 85,
      color: '#818cf8',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Shop-Floor Economics & ESG Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Operating Working Capital</span>
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-emerald-400 flex items-center">
            <Rupee className="w-5 h-5 inline mr-0.5 text-emerald-400" />
            <span>{(fin.cashBalanceINR / 1e7).toFixed(1)} Cr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Liquid Shop-Floor Liquidity</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Cumulative Launch Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-white flex items-center">
            <Rupee className="w-5 h-5 inline mr-0.5 text-white" />
            <span>{(fin.totalRevenueINR / 1e7).toFixed(1)} Cr</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">NSIL, Commercial & Defense</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Scope 1 & 2 Carbon Footprint</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-emerald-400">
            {(sust.scope1CO2eTonnes + sust.scope2CO2eTonnes).toFixed(1)} <span className="text-xs">t CO2e</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Per Rocket Manufactured</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Material Recycling Circularity</span>
            <Recycle className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-blue-400">
            {sust.recycledMaterialRatioPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Al-Li & Copper Turnings Recovered</div>
        </div>
      </div>

      {/* Main Grid: Operating Cost Breakdown & Launch Backlog Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Shop-Floor Operating Expenditures Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-orange-400" />
                <span>Shop-Floor Operations Cost Breakdown</span>
              </h4>
              <p className="text-xs text-slate-400">
                Total Operational Outlay: ₹{(totalOpexINR / 1e7).toFixed(1)} Crores
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {costBreakdown.map((item, idx) => {
              const pct = totalOpexINR > 0 ? ((item.amountINR / totalOpexINR) * 100).toFixed(1) : '0';
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="font-semibold text-slate-300 font-sans flex items-center space-x-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.label}</span>
                    </span>
                    <span className="text-white font-bold flex items-center">
                      <Rupee className="w-3.5 h-3.5 inline mr-0.5 text-white" />
                      <span>{(item.amountINR / 1e7).toFixed(2)} Cr ({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Launch Contract Backlog with Penalty Timers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Indian & Global Satellite Launch Contract Backlog</span>
              </h4>
              <p className="text-xs text-slate-400">
                Fixed-price launch commitments with IN-SPACe & NSIL delivery milestone penalties.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {fin.backlogContracts.map((cnt) => {
              const remainingTicks = cnt.deadlineTick - sim.tick;
              const valueINR = cnt.contractValueINR || cnt.contractValue * 85;
              const penaltyPerHourINR = cnt.penaltyPerHourINR || cnt.penaltyPerHour * 85;

              return (
                <div key={cnt.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{cnt.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Assigned Launcher: <span className="text-cyan-400 font-bold">{cnt.rocketSerialAssigned || 'UNASSIGNED'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center">
                      <Rupee className="w-3.5 h-3.5 inline mr-0.5 text-emerald-400" />
                      <span>{(valueINR / 1e7).toFixed(1)} Cr</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Deadline: {cnt.deadlineTick}h ({remainingTicks > 0 ? `${remainingTicks}h remaining` : 'OVERDUE'})</span>
                    </div>
                    <div className="text-rose-400 font-semibold flex items-center">
                      <span>-</span>
                      <Rupee className="w-3 h-3 inline mx-0.5 text-rose-400" />
                      <span>{penaltyPerHourINR.toLocaleString()}/hr delay penalty</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
