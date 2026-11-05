/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSimStore } from '../../store/useSimStore.ts';
import confetti from 'canvas-confetti';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  X,
  Gauge,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Rupee } from '../Rupee.tsx';

export const LaunchModal: React.FC = () => {
  const { lastLaunchReport, setActiveModal } = useSimStore();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!lastLaunchReport) return;

    if (lastLaunchReport.overallSuccess) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    // Step through flight milestones
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < lastLaunchReport.telemetryLogs.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [lastLaunchReport]);

  if (!lastLaunchReport) return null;

  const currentTelemetry = lastLaunchReport.telemetryLogs[activeStep] || lastLaunchReport.telemetryLogs[lastLaunchReport.telemetryLogs.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${
                lastLaunchReport.overallSuccess
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                  : 'bg-rose-950 border-rose-700 text-rose-400'
              }`}
            >
              <Rocket className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">
                  {lastLaunchReport.missionName}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    lastLaunchReport.overallSuccess
                      ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-900/80 text-rose-300 border border-rose-700'
                  }`}
                >
                  {lastLaunchReport.overallSuccess ? 'ORBITAL INSERTION CONFIRMED' : 'MISSION ANOMALY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Vehicle Serial: {lastLaunchReport.rocketSerial} | Target Orbit: {lastLaunchReport.targetOrbit}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(undefined)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Flight Telemetry Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-center space-x-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>Altitude</span>
            </div>
            <div className="font-mono text-lg font-bold text-cyan-400">
              {currentTelemetry.altitudeKm} <span className="text-xs text-slate-400">km</span>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-center space-x-1">
              <Gauge className="w-3 h-3 text-blue-400" />
              <span>Velocity</span>
            </div>
            <div className="font-mono text-lg font-bold text-blue-400">
              {currentTelemetry.velocityKmh.toLocaleString()} <span className="text-xs text-slate-400">km/h</span>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-center space-x-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Dynamic Q</span>
            </div>
            <div className="font-mono text-lg font-bold text-amber-400">
              {currentTelemetry.dynamicPressureKpa} <span className="text-xs text-slate-400">kPa</span>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-center space-x-1">
              <Rupee className="w-3 h-3 text-emerald-400" />
              <span>Contract Payout</span>
            </div>
            <div className="font-mono text-lg font-bold text-emerald-400">
              ₹{(lastLaunchReport.financialRevenueINR / 1e7 || (lastLaunchReport.financialRevenue * 85) / 1e7 || 280).toFixed(1)} Cr
            </div>
          </div>
        </div>

        {/* Flight Events Sequence Checklist */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Flight Telemetry Timeline (T+ Seconds)
          </div>
          <div className="space-y-2 bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-48 overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {lastLaunchReport.telemetryLogs.map((log, idx) => {
              const isPastOrCurrent = idx <= activeStep;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-1.5 rounded transition-colors ${
                    idx === activeStep
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                      : isPastOrCurrent
                      ? 'text-slate-300'
                      : 'text-slate-600 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400 font-bold">T+{log.timeSec}s:</span>
                    <span>{log.event}</span>
                  </div>
                  {isPastOrCurrent && (
                    <span className="text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Root Cause Analysis if failed */}
        {!lastLaunchReport.overallSuccess && lastLaunchReport.rootCauseAnalysis && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200">
            <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-rose-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Material Review Board Investigation Root Cause</span>
            </div>
            <p className="text-sm leading-relaxed">{lastLaunchReport.rootCauseAnalysis}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Customer Satisfaction Index:{' '}
            <span className="font-bold text-white">
              {lastLaunchReport.customerSatisfactionScore}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveModal(undefined);
                useSimStore.getState().setActiveTab('space_missions');
              }}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-950 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>🎮 Play 3D Mission Campaign</span>
            </button>
            <button
              onClick={() => setActiveModal(undefined)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
