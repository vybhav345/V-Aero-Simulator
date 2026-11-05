/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  RefreshCw,
  Trash2,
  Check,
  BarChart3,
  Activity,
} from 'lucide-react';
import { NCR } from '../types/index.ts';
import { Rupee } from '../components/Rupee.tsx';

export const QualityLabView: React.FC = () => {
  const { sim, dispositionNCR } = useSimStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const ncrs = sim.ncrs;
  const openNcrs = ncrs.filter((n) => n.status !== 'resolved');

  const filteredNcrs = ncrs.filter((n) =>
    filterSeverity === 'all' ? true : n.severity === filterSeverity
  );

  // Pareto distribution of defect root causes
  const categoriesCount: Record<string, number> = {
    dimensional: 0,
    weld_porosity: 0,
    composite_delamination: 0,
    surface_crack: 0,
    electronic_fault: 0,
    leak_rate_exceeded: 0,
  };

  for (const n of ncrs) {
    if (categoriesCount[n.defectCategory] !== undefined) {
      categoriesCount[n.defectCategory] += 1;
    }
  }

  const paretoData = Object.entries(categoriesCount).map(([key, count]) => ({
    label: key.replace(/_/g, ' '),
    count,
  }));

  // Mock SPC (Statistical Process Control) X-Bar points
  const spcPoints = [
    { sample: 1, val: 25.02 },
    { sample: 2, val: 25.01 },
    { sample: 3, val: 24.99 },
    { sample: 4, val: 25.04 },
    { sample: 5, val: 24.98 },
    { sample: 6, val: 25.06 },
    { sample: 7, val: 25.00 },
    { sample: 8, val: 25.02 },
    { sample: 9, val: 24.97 },
    { sample: 10, val: 25.03 },
    { sample: 11, val: 25.05 },
    { sample: 12, val: 25.01 },
  ];
  const ucl = 25.08;
  const lcl = 24.92;
  const mean = 25.00;

  return (
    <div className="space-y-6">
      {/* Top Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>First-Pass Yield (FPY)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-emerald-400">
            {sim.kpis.firstPassYieldRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">AS9100 Standard ≥ 95%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Open NCRs (Under MRB)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-amber-400">
            {openNcrs.length} Reports
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pending Engineering Review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Quality Escapes</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-rose-400">
            0 Escapes
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">100% NDT Intercept Rate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Certified Lots</span>
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-cyan-400">
            {sim.inventoryLots.length} Lots
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">NADCAP Accredited</div>
        </div>
      </div>

      {/* Main Grid: NCR MRB Disposition Center & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Non-Conformance Reports (NCR) & Material Review Board Actions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Material Review Board (MRB) NCR Registry</span>
              </h4>
              <p className="text-xs text-slate-400">
                Review deviations and apply authorized MRB dispositions: [Rework], [Scrap], or [Use-As-Is Concession].
              </p>
            </div>

            {/* Filter by severity */}
            <div className="flex space-x-1 text-xs font-mono">
              {(['all', 'minor', 'major', 'critical'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    filterSeverity === sev
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* NCR Table */}
          <div className="overflow-x-auto max-h-[460px] scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">NCR Number</th>
                  <th className="p-3">Part & Description</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Defect Category</th>
                  <th className="p-3">Cost / Delay</th>
                  <th className="p-3 text-right">MRB Disposition Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredNcrs.map((ncr) => {
                  const isResolved = ncr.status === 'resolved';
                  const isCritical = ncr.severity === 'critical';

                  return (
                    <tr key={ncr.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {ncr.ncrNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{ncr.partName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {ncr.description}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : ncr.severity === 'major'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {ncr.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300 capitalize whitespace-nowrap">
                        {ncr.defectCategory.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                        <div className="text-rose-400 font-bold flex items-center">
                          <Rupee className="w-3 h-3 inline mr-0.5 text-rose-400" />
                          <span>{(((ncr.costImpactINR || ncr.costImpact * 85)) / 1e5).toFixed(1)} L</span>
                        </div>
                        <div className="text-slate-400">+{ncr.timeDelayHours} hrs</div>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {isResolved ? (
                          <span className="font-mono text-emerald-400 font-bold text-xs uppercase px-2 py-1 bg-emerald-950/70 rounded border border-emerald-800">
                            ✓ {ncr.mrbDisposition}
                          </span>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => dispositionNCR(ncr.id, 'rework')}
                              title="Send for Rework (Deburr / Recalibrate)"
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-[10px] flex items-center space-x-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Rework</span>
                            </button>
                            <button
                              onClick={() => dispositionNCR(ncr.id, 'use_as_is')}
                              title="Concession: Use-As-Is with minor reliability risk"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[10px] flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Concession</span>
                            </button>
                            <button
                              onClick={() => dispositionNCR(ncr.id, 'scrap')}
                              title="Scrap part and remake"
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px] flex items-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Scrap</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredNcrs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 font-mono text-xs">
                      Zero non-conformance defects in this classification. Quality systems nominal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Pareto Chart & SPC Control Chart */}
        <div className="space-y-6">
          {/* Defect Pareto Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Pareto of Defect Root Causes</span>
            </h4>
            <div className="space-y-2 text-xs">
              {paretoData.map((item, idx) => {
                const maxCount = Math.max(1, ...paretoData.map((p) => p.count));
                const pct = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-300 capitalize">{item.label}</span>
                      <span className="text-cyan-400 font-bold">{item.count} defects</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistical Process Control (SPC) X-Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>SPC X-Bar Critical Tolerance</span>
              </h4>
              <span className="font-mono text-[10px] text-slate-400">3-Sigma Limits</span>
            </div>

            {/* SVG Control Chart */}
            <div className="w-full bg-slate-950 rounded-lg p-2 border border-slate-800">
              <svg viewBox="0 0 280 120" className="w-full h-auto">
                {/* UCL line */}
                <line x1="20" y1="20" x2="260" y2="20" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                <text x="262" y="23" fill="#f43f5e" fontSize="7" fontFamily="monospace">UCL 25.08</text>

                {/* Mean line */}
                <line x1="20" y1="60" x2="260" y2="60" stroke="#38bdf8" strokeWidth="1" />
                <text x="262" y="63" fill="#38bdf8" fontSize="7" fontFamily="monospace">Mean 25.00</text>

                {/* LCL line */}
                <line x1="20" y1="100" x2="260" y2="100" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                <text x="262" y="103" fill="#f43f5e" fontSize="7" fontFamily="monospace">LCL 24.92</text>

                {/* Data Points and Polyline */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  points={spcPoints
                    .map((pt, i) => {
                      const x = 30 + i * 19;
                      const y = 60 - (pt.val - mean) * 350;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {spcPoints.map((pt, i) => {
                  const x = 30 + i * 19;
                  const y = 60 - (pt.val - mean) * 350;
                  return (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="#34d399" stroke="#047857" strokeWidth="1" />
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              All 12 latest CMM metrology samples fall strictly within 3-sigma Upper & Lower Control Limits. Zero drift.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
