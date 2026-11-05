/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimStore } from '../../store/useSimStore.ts';
import {
  X,
  ShieldCheck,
  Cpu,
  UserCheck,
  Factory,
  FileCheck2,
  AlertCircle,
  QrCode,
  Globe,
} from 'lucide-react';

export const PartGenealogyDrawer: React.FC = () => {
  const { selectedGenealogy, setSelectedGenealogy } = useSimStore();

  if (!selectedGenealogy) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-700 shadow-2xl p-6 text-slate-100 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-mono font-bold text-base text-white">
                  {selectedGenealogy.serialNumber}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                  AS9100 Rev D Traceable
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold">{selectedGenealogy.partName}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedGenealogy(undefined)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health & Vehicle Assignment Banner */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
              Installed Rocket Vehicle
            </div>
            <div className="font-mono text-sm font-extrabold text-cyan-400">
              {selectedGenealogy.rocketSerial}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
              Component Health Score
            </div>
            <div className="font-mono text-sm font-extrabold text-emerald-400 flex items-center justify-end space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{selectedGenealogy.healthScorePct}%</span>
            </div>
          </div>
        </div>

        {/* Traceability Grid */}
        <div className="space-y-4 mb-6 text-xs">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Genealogical Provenance & Manufacturing Chain
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Raw Material Lot */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">Material Lot #</span>
              </div>
              <div className="font-mono text-slate-200 font-bold">
                {selectedGenealogy.lotNumber}
              </div>
            </div>

            {/* Supplier & Origin */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Origin & Supplier</span>
              </div>
              <div className="text-slate-200 font-bold truncate">
                {selectedGenealogy.supplierName} ({selectedGenealogy.supplierCountry})
              </div>
            </div>

            {/* Manufacturing Machine */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Factory className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Manufacturing Cell</span>
              </div>
              <div className="text-slate-200 font-bold truncate">
                {selectedGenealogy.machineName}
              </div>
            </div>

            {/* Certified Operator */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold">Operator / Tech</span>
              </div>
              <div className="text-slate-200 font-bold truncate">
                {selectedGenealogy.workerName}
              </div>
            </div>
          </div>
        </div>

        {/* NDT Inspection History */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Non-Destructive Testing (NDT) & Metrology
          </div>
          <div className="space-y-2 bg-slate-950 rounded-xl p-3 border border-slate-800">
            {selectedGenealogy.inspections.map((insp, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <div>
                  <div className="font-semibold text-slate-200">{insp.testType}</div>
                  <div className="text-[10px] text-slate-400">Auditor: {insp.inspector}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  PASSED
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* NCR Records if any */}
        {selectedGenealogy.ncrs.length > 0 && (
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Historical Non-Conformance Records</span>
            </div>
            <div className="space-y-2 bg-slate-950 rounded-xl p-3 border border-amber-900/50">
              {selectedGenealogy.ncrs.map((ncr) => (
                <div key={ncr.id} className="text-xs py-1 border-b border-slate-800/80 last:border-0">
                  <div className="flex items-center justify-between font-mono text-amber-300 font-bold mb-0.5">
                    <span>{ncr.ncrNumber}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      MRB: {ncr.mrbDisposition}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{ncr.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Close */}
      <div className="pt-4 border-t border-slate-800 text-right mt-6">
        <button
          onClick={() => setSelectedGenealogy(undefined)}
          className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          Close Genealogy Inspector
        </button>
      </div>
    </div>
  );
};
