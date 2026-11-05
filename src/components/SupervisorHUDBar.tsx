/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Wrench,
  ShieldCheck,
  Building2,
  Flame,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Bot,
} from 'lucide-react';

export const SupervisorHUDBar: React.FC = () => {
  const {
    sim,
    performMaintenance,
    dispositionNCR,
    fundVendorProgram,
    runQualificationTest,
    setActiveTab,
    activeTab,
  } = useSimStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [quickQuery, setQuickQuery] = useState<string>('');
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const openNcrs = sim.ncrs.filter((n) => n.status !== 'resolved');
  const bottleneckMachine =
    sim.machines.find((m) => m.name.toLowerCase().includes('cnc')) || sim.machines[0];
  const firstRocket = sim.rockets[0];

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleQuickAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickQuery.trim() || isAsking) return;

    setIsAsking(true);

    try {
      const snapshot = {
        tick: sim.tick,
        kpis: sim.kpis,
        openNcrs: openNcrs.length,
      };

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simSnapshot: snapshot, userQuery: quickQuery }),
      });

      const data = await res.json();
      setQuickAnswer(data.response || 'Telemetry analyzed. Floor operations tracking nominally.');
    } catch {
      setQuickAnswer(
        `Active constraint: ${sim.kpis.activeBottleneckStation || 'Nominal Flow (Balanced)'}. Tool wear offset nominal. ${openNcrs.length} NCRs pending MRB review.`
      );
    } finally {
      setIsAsking(false);
      setQuickQuery('');
    }
  };

  // Do not render HUD on ai_advisor tab since it has the full console
  if (activeTab === 'ai_advisor') return null;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-16 right-6 z-50 bg-emerald-950 border border-emerald-600 px-4 py-2 rounded-xl text-xs text-emerald-200 font-mono flex items-center space-x-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-emerald-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Floating Pop-up Copilot Widget (Bottom-Right Anchor) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end select-none">
        {/* Pop-up Card when Open */}
        {isOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs font-mono space-y-3 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-orange-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI OPERATIONS SUPERVISOR</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Answer Area */}
            {quickAnswer && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed text-[11px]">
                {quickAnswer}
              </div>
            )}

            {/* Natural Query Input */}
            <form onSubmit={handleQuickAsk} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask Supervisor: spindle wear, weld porosity..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={isAsking || !quickQuery.trim()}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Directives Strip */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Quick Dispatch Directives
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <button
                  onClick={() => {
                    performMaintenance(bottleneckMachine.id);
                    showToastMsg(`Spindle recalibrated on ${bottleneckMachine.name}. Tool wear reset to 0%.`);
                  }}
                  className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 flex items-center space-x-1 text-left cursor-pointer transition-colors"
                >
                  <Wrench className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Spindle Offset</span>
                </button>

                {openNcrs.length > 0 && (
                  <button
                    onClick={() => {
                      const target = openNcrs[0];
                      dispositionNCR(target.id, 'rework');
                      showToastMsg(`MRB disposition applied: ${target.ncrNumber} queued for rework.`);
                    }}
                    className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 flex items-center space-x-1 text-left cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Clear NCR ({openNcrs.length})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    fundVendorProgram('vp_midhani_inconel_01', 50000000);
                    showToastMsg('Disbursed ₹5.0 Cr grant to MIDHANI Hyderabad.');
                  }}
                  className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-orange-300 flex items-center space-x-1 text-left cursor-pointer transition-colors"
                >
                  <Building2 className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="truncate">MIDHANI Grant</span>
                </button>

                {firstRocket && (
                  <button
                    onClick={() => {
                      runQualificationTest(firstRocket.serialNumber, 'engine_hotfire');
                      showToastMsg(`Test Stand C-1 hotfire burn completed on ${firstRocket.serialNumber}!`);
                    }}
                    className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-300 flex items-center space-x-1 text-left cursor-pointer transition-colors"
                  >
                    <Flame className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">Engine Hotfire</span>
                  </button>
                )}
              </div>
            </div>

            {/* Link to Full Advisor */}
            <div className="pt-1 text-right">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('ai_advisor');
                }}
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1 text-[11px] cursor-pointer"
              >
                <span>Open Full AI Console</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Trigger Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-full font-mono text-xs font-bold shadow-2xl transition-all cursor-pointer ${
            isOpen
              ? 'bg-orange-600 text-white'
              : 'bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white'
          }`}
          title="Open AI Plant Supervisor Rapid Dispatch Pop-up"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <Bot className="w-4 h-4 text-orange-400" />
          <span>AI Supervisor</span>
        </button>
      </div>
    </>
  );
};
