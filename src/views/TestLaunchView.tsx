/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  Gauge,
  Rocket,
  Gamepad2,
  Award,
} from 'lucide-react';
import { TestRecord } from '../types/index.ts';
import { FlightMission3DVisualizer } from '../components/game/FlightMission3DVisualizer.tsx';
import { REAL_WORLD_SPACE_MISSIONS } from '../data/spaceMissionsGameData.ts';

interface QualTestItem {
  type: TestRecord['testType'];
  title: string;
  description: string;
  nominalDuration: string;
}

const qualificationTestList: QualTestItem[] = [
  {
    type: 'hydro_proof',
    title: 'Stage 1 Cryogenic Hydrostatic Proof Test',
    description: 'Pressurize Al-Li 2195 propellant tank to 1.25x Maximum Expected Operating Pressure (MEOP) with demineralized water.',
    nominalDuration: '30 mins (145 Bar)',
  },
  {
    type: 'cryo_leak',
    title: 'Helium Mass-Spectrometer Cryo Leak Check',
    description: 'Chill tanks with liquid nitrogen and probe circumferential friction-stir welds with helium mass spectrometer.',
    nominalDuration: '45 mins (< 1x10^-6 scc/s)',
  },
  {
    type: 'vibro_acoustic',
    title: 'Acoustic Fatigue & Random Vibration Shaker',
    description: 'Subject avionics bay and interstage to 160kN electrodynamic vibration profile simulating transonic Max-Q buffeting.',
    nominalDuration: '180s (14.8 Grms)',
  },
  {
    type: 'emi_emc',
    title: 'Avionics Radiated EMI & FTS Lightning Immunity',
    description: 'Verify tri-redundant flight computer and Autonomous Flight Termination System (AFTS) under high RF fields.',
    nominalDuration: '60 mins',
  },
  {
    type: 'turbopump_spin',
    title: 'Turbopump Cryogenic High-RPM Spin Test',
    description: 'Spin dual-shaft Inconel 718 impeller assembly to 38,000 RPM on cold gaseous nitrogen to verify bearing balance.',
    nominalDuration: '120s (38,000 RPM)',
  },
  {
    type: 'engine_hotfire',
    title: 'V-Aero Semi-Cryo SCE-200 Engine Acceptance Hotfire',
    description: 'Ignite semi-cryogenic rocket engine on Mahendragiri IPRC Test Stand C-1 for 120s full mission duration with regenerative GRCop cooling.',
    nominalDuration: '120s (2,000 kN Thrust)',
  },
  {
    type: 'stage_static_fire',
    title: 'Stage 1 Integrated Hold-Down Static Fire (Mahendragiri)',
    description: 'Integrated booster stage static ignition for 3.5 seconds on Stage Test Facility (STF) Mahendragiri with high-pressure acoustic water deluge.',
    nominalDuration: '3.5s (Hold-Down Clamp)',
  },
];

export const TestLaunchView: React.FC = () => {
  const {
    sim,
    selectedRocketSerial,
    setSelectedRocketSerial,
    runQualificationTest,
    launchRocket,
    activeMissionId,
    completeMission,
    setActiveTab,
    lastLaunchReport,
  } = useSimStore();

  const [activeRunningTest, setActiveRunningTest] = useState<string | null>(null);
  const [show3DVisualizer, setShow3DVisualizer] = useState<boolean>(false);

  const activeMission =
    REAL_WORLD_SPACE_MISSIONS.find((m) => m.id === activeMissionId) ||
    REAL_WORLD_SPACE_MISSIONS[0];

  const currentRocket =
    sim.rockets.find((r) => r.serialNumber === selectedRocketSerial) || sim.rockets[0];

  const testsPassed = currentRocket?.qualificationTestsPassed || [];
  const allTestsComplete = testsPassed.length >= 6;
  const isAssemblyComplete = (currentRocket?.productionProgressPct ?? 0) >= 98;
  const hasOpenCriticalNcr = sim.ncrs.some(
    (n) => n.status !== 'resolved' && (n.severity === 'critical' || n.severity === 'major')
  );
  const isFlightReady = currentRocket?.status === 'flight_ready';
  const isLaunched = currentRocket?.status === 'launched_success' || currentRocket?.status === 'launched_failed';
  const isNominalLaunchReady = isAssemblyComplete && allTestsComplete && !hasOpenCriticalNcr && !isLaunched;

  const handleRunTest = (type: TestRecord['testType']) => {
    if (!currentRocket) return;
    setActiveRunningTest(type);
    setTimeout(() => {
      runQualificationTest(currentRocket.serialNumber, type);
      setActiveRunningTest(null);
    }, 600);
  };

  const handleLaunch = () => {
    if (!currentRocket) return;
    launchRocket(currentRocket.serialNumber);
    setShow3DVisualizer(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Space Flight Campaign Banner */}
      <div className="bg-gradient-to-r from-orange-950/70 via-slate-900 to-slate-900 border border-orange-700/60 rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-600 text-white rounded-lg shadow-md shadow-orange-950">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-orange-400 font-bold uppercase">ACTIVE MISSION:</span>
              <span className="text-white font-bold">{activeMission.title}</span>
              <span className="text-slate-400">({activeMission.codename})</span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Target: {activeMission.targetOrbit} • Contract Bounty: ₹{(activeMission.rewardINR / 1e7).toFixed(1)} Cr
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShow3DVisualizer(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-mono font-bold text-xs shadow-lg shadow-orange-950 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Launch 3D Flight (Best Graphics)</span>
          </button>
          <button
            onClick={() => setActiveTab('space_missions')}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
          >
            Switch Mission
          </button>
        </div>
      </div>

      {/* Top Header & Rocket Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rocket Acceptance Testing, Static Fire & Launch Operations
            </h3>
            <p className="text-xs text-slate-400">
              Rigorous AS9100 / NASA qualification gate checks before final Go/No-Go orbital launch decision.
            </p>
          </div>
        </div>

        {/* Vehicle Selector */}
        {sim.rockets.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Active Vehicle:</span>
            <select
              value={selectedRocketSerial || ''}
              onChange={(e) => setSelectedRocketSerial(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500 text-xs"
            >
              {sim.rockets.map((r) => (
                <option key={r.id} value={r.serialNumber}>
                  {r.serialNumber} — {r.designName} ({r.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentRocket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: 7 Qualification Gate Tests Sequence */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">
                  {currentRocket.serialNumber} Qualification Campaign ({testsPassed.length}/{qualificationTestList.length} Passed)
                </h4>
                <p className="text-xs text-slate-400">
                  Each test physically stresses materials to flight limits and verifies zero quality escapes.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Reliability: {currentRocket.calculatedReliability}%
              </span>
            </div>

            <div className="space-y-3">
              {qualificationTestList.map((test) => {
                const isPassed = testsPassed.includes(test.type);
                const isRunning = activeRunningTest === test.type;

                return (
                  <div
                    key={test.type}
                    className={`p-4 rounded-xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                      isPassed
                        ? 'bg-emerald-950/30 border-emerald-800/60'
                        : isRunning
                        ? 'bg-cyan-950/60 border-cyan-600 animate-pulse'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="max-w-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-white text-xs">{test.title}</span>
                        {isPassed && (
                          <span className="flex items-center space-x-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PASSED & CERTIFIED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{test.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Nominal Parameters: {test.nominalDuration}
                      </div>
                    </div>

                    <div>
                      {isPassed ? (
                        <div className="font-mono text-emerald-400 text-xs font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <button
                          disabled={isRunning || isLaunched}
                          onClick={() => handleRunTest(test.type)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-cyan-950 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isRunning ? 'Firing...' : 'Execute Test'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Go / No-Go Launch Decision Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  <span>SDSC SHAR Sriharikota Launch Pad (SLP) Console</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Mission Director & IN-SPACe orbital flight clearance checklist.
                </p>
              </div>

              {/* Readiness Checks */}
              <div className="space-y-2.5 text-xs mb-4">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">1. Fuselage Airframe Assembly</span>
                  <span
                    className={`font-mono font-bold ${
                      isAssemblyComplete ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isAssemblyComplete ? 'GO (100% Complete)' : `NO-GO (${currentRocket.productionProgressPct.toFixed(0)}% WIP)`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">2. Qualification Ground Tests</span>
                  <span
                    className={`font-mono font-bold ${
                      allTestsComplete ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {allTestsComplete ? 'GO (7/7 Certified)' : `${testsPassed.length}/7 Passed`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">3. Critical NCR Quality Escapes</span>
                  <span
                    className={`font-mono font-bold ${
                      !hasOpenCriticalNcr ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {!hasOpenCriticalNcr ? 'CLEARED (0 Open)' : 'HOLD (Open NCRs)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">4. Calculated Flight Reliability</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {currentRocket.calculatedReliability}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">5. IN-SPACe Range Flight Clearance</span>
                  <span className={`font-mono font-bold ${isNominalLaunchReady ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isNominalLaunchReady ? 'GRANTED' : 'DENIED (WIP)'}
                  </span>
                </div>
              </div>

              {/* Status Box */}
              <div
                className={`p-3.5 rounded-xl border text-center ${
                  isLaunched
                    ? currentRocket.status === 'launched_success'
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950 border-rose-800 text-rose-200'
                    : isNominalLaunchReady
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-mono font-bold text-[10px] uppercase mb-0.5">Vehicle Launch Status</div>
                <div className="text-sm font-extrabold">
                  {currentRocket.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Launch Action Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                disabled={!isNominalLaunchReady}
                onClick={handleLaunch}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-xl shadow-cyan-950 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>
                  {isLaunched
                    ? 'Mission Flight Concluded'
                    : isNominalLaunchReady
                    ? 'INITIATE TERMINAL COUNTDOWN & LAUNCH'
                    : !isAssemblyComplete
                    ? `NO-GO: Assembly Incomplete (${currentRocket.productionProgressPct.toFixed(0)}%)`
                    : 'NO-GO: Pass All 7 Qualification Tests'}
                </span>
              </button>

              {/* Force Early Launch Option (For testing incomplete vehicle breakups) */}
              {!isNominalLaunchReady && !isLaunched && (
                <button
                  onClick={handleLaunch}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/90 border border-rose-600/80 text-rose-300 font-mono text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-rose-950"
                  title="Force early launch to witness real-world structural breakup"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    ⚠️ FORCE EMERGENCY LAUNCH ({currentRocket.productionProgressPct.toFixed(0)}% BUILT — RISK BREAKUP)
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No vehicles in fleet. Create a production order from Command Center first.
        </div>
      )}

      {/* 3D Cinematic Flight Visualizer */}
      {show3DVisualizer && (
        <FlightMission3DVisualizer
          mission={activeMission}
          rocket={currentRocket}
          failureOutcome={lastLaunchReport}
          onMissionComplete={(success, stats) => {
            if (success) {
              completeMission(
                activeMission.id,
                stats.stars,
                stats.maxAltKm,
                activeMission.rewardINR,
                activeMission.rewardXP
              );
            }
          }}
          onClose={() => setShow3DVisualizer(false)}
        />
      )}
    </div>
  );
};
