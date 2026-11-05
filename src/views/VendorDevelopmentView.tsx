/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Building2,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  FileCheck2,
  Zap,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';
import { VendorProgram } from '../types/index.ts';

export const VendorDevelopmentView: React.FC = () => {
  const { sim, fundVendorProgram, auditVendorProgram } = useSimStore();
  const [selectedProgramId, setSelectedProgramId] = useState<string>(sim.vendorPrograms[0].id);

  const programs = sim.vendorPrograms;
  const selectedProgram =
    programs.find((p) => p.id === selectedProgramId) || programs[0];

  const handleFund = (progId: string) => {
    // Release ₹15 Crores ToT / Tooling Setup Grant
    fundVendorProgram(progId, 150000000);
  };

  const handleAudit = (progId: string) => {
    auditVendorProgram(progId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-orange-950 border border-orange-800 text-orange-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                V-Aero Vendor Development & Indigenization Center
              </h3>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 uppercase">
                Atmanirbhar Bharat
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Developing Indian MSME & PSU vendor ecosystem for critical space materials that cannot be produced in-house.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Domestic Content</span>
            <span className="text-emerald-400 font-extrabold text-sm">{sim.kpis.indigenizationRatioPct}% Local Provenance</span>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Invested Grants</span>
            <span className="text-white font-extrabold text-sm flex items-center justify-end font-mono">
              <Rupee className="w-3.5 h-3.5 inline mr-0.5 text-white" />
              <span>{(sim.financials.totalOpex.vendorDevelopmentGrantsINR / 1e7).toFixed(1)} Cr</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Vendor Programs List & Selected Program Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Indigenization Programs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>Outsourced Space Materials & Subsystem Indigenization Pipeline</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {programs.length} Active Partner Programs
            </span>
          </div>

          <div className="space-y-3">
            {programs.map((prog) => {
              const isSelected = selectedProgramId === prog.id;
              const isCertified = prog.status === 'certified' || prog.indigenizationProgressPct >= 100;

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-950/40 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-orange-300 border border-slate-700">
                        {prog.vendorTier}
                      </span>
                      <h5 className="font-bold text-white text-sm">{prog.targetItemName}</h5>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        isCertified
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {prog.currentStage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-3">
                    Partner: <span className="font-bold text-white">{prog.vendorName}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">Indigenization & Space Qualification</span>
                      <span className="text-emerald-400 font-bold">{prog.indigenizationProgressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${prog.indigenizationProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Lead Time:</span>
                      <span className="text-cyan-300 font-bold">
                        {prog.leadTimeBeforeWeeks}w → {prog.leadTimeTargetWeeks}w
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Domestic Cost:</span>
                      <span className="text-emerald-400 font-bold flex items-center font-mono">
                        <Rupee className="w-3 h-3 inline mr-0.5 text-emerald-400" />
                        <span>{prog.targetUnitCostINR.toLocaleString()}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Import Saving:</span>
                      <span className="text-white font-bold">
                        {Math.round(((prog.foreignImportCostINR - prog.targetUnitCostINR) / prog.foreignImportCostINR) * 100)}% Cheaper
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Audit Score:</span>
                      <span className="text-cyan-400 font-bold">{prog.auditPassRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Program Deep Dive & Action Center */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-orange-400 uppercase block">
                Vendor Indigenization Partner
              </span>
              <h4 className="font-extrabold text-white text-base">
                {selectedProgram.vendorName}
              </h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Target: {selectedProgram.targetItemName}
              </p>
            </div>

            {/* Why This Can't Be In-House */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase text-orange-400 flex items-center space-x-1">
                <span>Rationale for External Vendor Development</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Requires heavy capital metallurgy (Vacuum Arc Remelting, specialized powder gas-atomization towers, or precision forging) best suited for specialized industrial partners like MIDHANI, Godrej, MTAR, and MSMEs.
              </p>
            </div>

            {/* Program Metrics */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-sans">Current Program Stage:</span>
                <span className="font-bold text-orange-300 uppercase">
                  {selectedProgram.currentStage.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono">
                <span className="text-slate-400 font-sans">Total V-Aero Grant Funding:</span>
                <span className="font-bold text-emerald-400 flex items-center">
                  <Rupee className="w-3.5 h-3.5 inline mr-0.5 text-emerald-400" />
                  <span>{(selectedProgram.fundingInvestedINR / 1e7).toFixed(1)} Crores</span>
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-sans">Lead Time Compression:</span>
                <span className="font-bold text-cyan-400">
                  -{selectedProgram.leadTimeBeforeWeeks - selectedProgram.leadTimeTargetWeeks} Weeks
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-sans">First Article Inspection (FAI):</span>
                <span className="font-bold text-emerald-400">
                  {selectedProgram.auditPassRate >= 98 ? 'APPROVED (100% SPEC)' : `${selectedProgram.auditPassRate}% PASS RATE`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => handleFund(selectedProgram.id)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-950 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Grant Technology Transfer (ToT) Funding (₹15 Cr)</span>
            </button>

            <button
              onClick={() => handleAudit(selectedProgram.id)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Conduct Space-Grade Vendor Audit (Sample Test)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
