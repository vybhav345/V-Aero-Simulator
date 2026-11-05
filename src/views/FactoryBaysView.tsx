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
  Layers,
  Flame,
  Activity,
  Gauge,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Disc,
  GraduationCap,
  Sliders,
  CheckSquare,
  Square,
  ArrowRight,
  Info,
  HelpCircle,
  Award,
} from 'lucide-react';
import { PartCADViewer, CADRenderMode } from '../components/cad/PartCADViewer.tsx';
import {
  FACTORY_BAY_PROFILES,
  FactoryBayTrainingProfile,
} from '../data/factoryBayTrainingData.ts';

type BayTabKey =
  | 'cnc_bay'
  | 'dmls_bay'
  | 'fsw_bay'
  | 'autoclave_bay'
  | 'cleanroom_bay'
  | 'ndt_lab'
  | 'hotfire_bay';

export const FactoryBaysView: React.FC = () => {
  const { sim, performMaintenance, changeMachineTool, realignFixture, expediteWorkOrder } = useSimStore();

  // Active bay selection
  const [activeBayTab, setActiveBayTab] = useState<BayTabKey>('cnc_bay');

  // View Mode: 'training' (SOP & Joinee onboarding) vs 'telemetry' (Machine deep-dive & controls)
  const [viewMode, setViewMode] = useState<'training' | 'telemetry'>('training');

  // CAD Render Mode: solid, wireframe, blueprint, cutaway
  const [cadMode, setCadMode] = useState<CADRenderMode>('solid');

  // SOP completed steps tracking per bay
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({
    cnc_bay: [1],
    dmls_bay: [1],
    fsw_bay: [],
    autoclave_bay: [],
    cleanroom_bay: [1, 2],
    ndt_lab: [],
    hotfire_bay: [1],
  });

  // Quiz selected answers & results per bay
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Bay specific interactive operation states
  const [coolantOn, setCoolantOn] = useState<boolean>(true);
  const [argonPurged, setArgonPurged] = useState<boolean>(true);
  const [fswClamped, setFswClamped] = useState<boolean>(true);
  const [vacuumHeld, setVacuumHeld] = useState<boolean>(true);
  const [esdGroundVerified, setEsdGroundVerified] = useState<boolean>(true);
  const [ctBeamActive, setCtBeamActive] = useState<boolean>(true);
  const [delugeActive, setDelugeActive] = useState<boolean>(true);
  const [gimbalSweepAngle, setGimbalSweepAngle] = useState<number>(2.5);
  const [sopSimulating, setSopSimulating] = useState<boolean>(false);

  // Active training profile
  const profile: FactoryBayTrainingProfile =
    FACTORY_BAY_PROFILES[activeBayTab] || FACTORY_BAY_PROFILES.cnc_bay;

  // Machine reference matching the active bay
  const getBayMachine = () => {
    switch (activeBayTab) {
      case 'cnc_bay':
        return sim.machines.find((m) => m.type === 'cnc_5axis') || sim.machines[0];
      case 'dmls_bay':
        return sim.machines.find((m) => m.type === 'slm_dmls_3d') || sim.machines[2];
      case 'fsw_bay':
        return sim.machines.find((m) => m.type === 'fsw_gantry') || sim.machines[4];
      case 'autoclave_bay':
        return sim.machines.find((m) => m.type === 'afp_autoclave') || sim.machines[5];
      case 'cleanroom_bay':
        return sim.machines.find((m) => m.type === 'cleanroom_smt') || sim.machines[6];
      case 'ndt_lab':
        return sim.machines.find((m) => m.type === 'ct_scanner') || sim.machines[8] || sim.machines[0];
      case 'hotfire_bay':
        return sim.machines.find((m) => m.type === 'engine_hotfire_stand') || sim.machines[0];
      default:
        return sim.machines[0];
    }
  };

  const machine = getBayMachine();

  // Toggle SOP step completion
  const handleToggleStep = (stepNumber: number) => {
    const current = completedSteps[activeBayTab] || [];
    const updated = current.includes(stepNumber)
      ? current.filter((s) => s !== stepNumber)
      : [...current, stepNumber];
    setCompletedSteps({ ...completedSteps, [activeBayTab]: updated });
  };

  // Run full automated SOP checklist simulation
  const handleRunFullSOP = () => {
    setSopSimulating(true);
    let step = 1;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => {
        const current = prev[activeBayTab] || [];
        const nextSet = Array.from(new Set([...current, step]));
        return { ...prev, [activeBayTab]: nextSet };
      });
      step++;
      if (step > 4) {
        clearInterval(interval);
        setSopSimulating(false);
      }
    }, 600);
  };

  // Handle Quiz selection & submission
  const handleSelectQuizOption = (optIdx: number) => {
    setQuizAnswers({ ...quizAnswers, [activeBayTab]: optIdx });
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted({ ...quizSubmitted, [activeBayTab]: true });
  };

  const selectedAnswer = quizAnswers[activeBayTab];
  const isSubmitted = quizSubmitted[activeBayTab];
  const isQuizCorrect = selectedAnswer === profile.knowledgeQuiz.correctIndex;
  const bayStepsCompleted = completedSteps[activeBayTab] || [];
  const isBayCertified = bayStepsCompleted.length === 4 && isSubmitted && isQuizCorrect;

  const toolsList = [
    { pocket: 1, name: 'Ø50mm Face Mill (CoroMill 390)', type: 'Roughing' },
    { pocket: 2, name: 'Ø20mm Solid Carbide End Mill', type: 'Finishing' },
    { pocket: 3, name: 'Ø16mm Ball Nose 5-Axis (Sandvik)', type: 'Turbopump Vane' },
    { pocket: 4, name: 'Ø12mm Micro Ball End Mill', type: 'Impeller Blisk' },
    { pocket: 5, name: 'High-Pressure Cryo Valve Boring Bar', type: 'Internal Port' },
    { pocket: 6, name: 'ISRO Stage Thread Forming Tap (M12)', type: 'Threading' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header & Navigation Control Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 mb-0.5">
            <span className="text-orange-400 font-bold uppercase">{profile.facility}</span>
            <span>•</span>
            <span className="text-slate-300 font-semibold">{profile.cellCode}</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">AS9100 Rev D</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
            <Factory className="w-4 h-4 text-orange-400" />
            <span>{profile.title}</span>
          </h3>
        </div>

        {/* Mode Switcher: Training Mode vs Machine Telemetry Mode */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setViewMode('training')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'training'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Joinee Training & SOP</span>
          </button>
          <button
            onClick={() => setViewMode('telemetry')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'telemetry'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Telemetry & Controls</span>
          </button>
        </div>
      </div>

      {/* 2. Process Tabs Bar (All 7 Rocket Manufacturing Bays) */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 text-xs font-mono">
        {[
          { key: 'cnc_bay', label: '1. 5-Axis CNC Mill', icon: Wrench },
          { key: 'dmls_bay', label: '2. Laser DMLS 3D', icon: Zap },
          { key: 'fsw_bay', label: '3. Orbital FSW', icon: Layers },
          { key: 'autoclave_bay', label: '4. Autoclave 8m', icon: Flame },
          { key: 'cleanroom_bay', label: '5. SMT Cleanroom', icon: Cpu },
          { key: 'ndt_lab', label: '6. NDT & CT Lab', icon: Radio },
          { key: 'hotfire_bay', label: '7. Cryo Hotfire Stand', icon: Activity },
        ].map((tab) => {
          const isActive = activeBayTab === tab.key;
          const Icon = tab.icon;
          const isCertified =
            (completedSteps[tab.key]?.length === 4) &&
            quizSubmitted[tab.key] &&
            quizAnswers[tab.key] === FACTORY_BAY_PROFILES[tab.key]?.knowledgeQuiz.correctIndex;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveBayTab(tab.key as BayTabKey)}
              className={`px-3 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-slate-800 text-white border border-orange-500 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {isCertified && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace: Left CAD & Physical Part Inspection Stage (60%), Right SOP / Controls (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Part CAD Viewer & Physical Machine Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 3D CAD Component */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Real Aerospace Part CAD Model • Interactive 3D Orbit
                </span>
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <span>{profile.componentName}</span>
                </h4>
              </div>

              {/* Drawing Reference Callout */}
              <div className="text-right font-mono text-[11px]">
                <div className="text-slate-400">DWG: {profile.drawingNumber}</div>
                <div className="text-emerald-400 font-semibold">Tol: {profile.tolerance}</div>
              </div>
            </div>

            {/* Part CAD Viewer */}
            <PartCADViewer
              partType={profile.cadPartType}
              renderMode={cadMode}
              onRenderModeChange={setCadMode}
              isRunning={coolantOn || argonPurged || ctBeamActive}
            />

            {/* Quick Part Specifications Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                  Material Alloy
                </span>
                <span className="text-slate-200 font-semibold text-[11px] truncate block" title={profile.material}>
                  {profile.material.split('(')[0]}
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                  Finished Mass
                </span>
                <span className="text-cyan-400 font-bold text-sm">
                  {profile.massKg} kg
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                  Machining Tolerance
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">
                  {profile.tolerance}
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                  Surface Spec
                </span>
                <span className="text-amber-400 font-semibold text-[11px] truncate block">
                  {profile.surfaceFinish}
                </span>
              </div>
            </div>

            {/* Interactive Physical Controls Bar */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                {activeBayTab === 'cnc_bay' && (
                  <>
                    <button
                      onClick={() => setCoolantOn(!coolantOn)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                        coolantOn
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{coolantOn ? '70-Bar Coolant: ON' : 'Coolant: OFF'}</span>
                    </button>
                    <button
                      onClick={() => realignFixture(machine.id, 'FIX-TURBOPUMP-ROTARY-01')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      Re-Index Chuck
                    </button>
                  </>
                )}

                {activeBayTab === 'dmls_bay' && (
                  <button
                    onClick={() => setArgonPurged(!argonPurged)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      argonPurged ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {argonPurged ? 'Argon Purge (O2 < 10ppm): ACTIVE' : 'Argon Purge: OFF'}
                  </button>
                )}

                {activeBayTab === 'fsw_bay' && (
                  <button
                    onClick={() => setFswClamped(!fswClamped)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      fswClamped ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fswClamped ? 'Hydraulic Backing Anvil: 50 kN' : 'Anvil: UNCLAMPED'}
                  </button>
                )}

                {activeBayTab === 'autoclave_bay' && (
                  <button
                    onClick={() => setVacuumHeld(!vacuumHeld)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      vacuumHeld ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {vacuumHeld ? 'Vacuum Bag: -0.98 Bar (HELD)' : 'Vacuum: VENTED'}
                  </button>
                )}

                {activeBayTab === 'cleanroom_bay' && (
                  <button
                    onClick={() => setEsdGroundVerified(!esdGroundVerified)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      esdGroundVerified ? 'bg-emerald-600 text-white' : 'bg-rose-900 text-rose-200'
                    }`}
                  >
                    {esdGroundVerified ? 'ESD Continuous Ground: PASS' : 'ESD: DISCONNECTED'}
                  </button>
                )}

                {activeBayTab === 'ndt_lab' && (
                  <button
                    onClick={() => setCtBeamActive(!ctBeamActive)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      ctBeamActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ctBeamActive ? '450 kV X-Ray Beam: ACTIVE' : 'Beam: STANDBY'}
                  </button>
                )}

                {activeBayTab === 'hotfire_bay' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDelugeActive(!delugeActive)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        delugeActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {delugeActive ? 'Acoustic Deluge: 50k L/min' : 'Deluge: OFF'}
                    </button>
                    <div className="flex items-center space-x-1.5 text-slate-400 font-sans text-[11px]">
                      <span>Gimbal:</span>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="0.5"
                        value={gimbalSweepAngle}
                        onChange={(e) => setGimbalSweepAngle(parseFloat(e.target.value))}
                        className="w-20 accent-orange-500 cursor-pointer"
                      />
                      <span className="text-orange-400 font-mono font-bold">{gimbalSweepAngle}°</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preventive Maintenance One-Click Button */}
              <button
                onClick={() => performMaintenance(machine.id)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-amber-950 flex items-center space-x-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Calibrate Bay & Spindle (PM)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Content - Joinee Training vs Live Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* ========================================================================= */}
          {/* MODE A: NEW JOINEE TRAINING & SOP WORKSPACE                               */}
          {/* ========================================================================= */}
          {viewMode === 'training' && (
            <div className="space-y-4">
              {/* 1. Aerospace Engineering Rationale Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-wide">
                    <Info className="w-4 h-4" />
                    <span>Why This Bay Matters in Rocketry</span>
                  </div>
                  {isBayCertified && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>CERTIFIED JOINEE</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {profile.whyThisMatters}
                </p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <span className="text-orange-400 font-bold uppercase block text-[10px] tracking-wide font-mono">
                    Material Science Insight
                  </span>
                  <p className="leading-relaxed">{profile.materialScienceNote}</p>
                </div>
              </div>

              {/* 2. Interactive 4-Step Standard Operating Procedure (SOP) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                      <span>Standard Operating Procedure (SOP)</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Step-by-step checklist required for ISRO flight qualification.
                    </span>
                  </div>

                  <button
                    onClick={handleRunFullSOP}
                    disabled={sopSimulating}
                    className="px-2.5 py-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>{sopSimulating ? 'Simulating...' : 'Auto-Run SOP'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* SOP Steps List */}
                <div className="space-y-2.5">
                  {profile.sopSteps.map((step) => {
                    const isDone = bayStepsCompleted.includes(step.stepNumber);
                    return (
                      <div
                        key={step.stepNumber}
                        onClick={() => handleToggleStep(step.stepNumber)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isDone
                            ? 'bg-slate-950/90 border-emerald-800/80'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2">
                            <button className="mt-0.5 text-slate-400 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center space-x-2">
                                <span className="font-mono text-cyan-400">Step {step.stepNumber}:</span>
                                <span>{step.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans">
                                {step.description}
                              </p>
                              <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center space-x-1">
                                <span className="font-bold">Checkpoint:</span>
                                <span>{step.keyCheck}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span>SOP Checklist Progress:</span>
                  <span className="font-bold text-emerald-400">
                    {bayStepsCompleted.length} of 4 Steps Cleared
                  </span>
                </div>
              </div>

              {/* 3. Critical Failure Modes & How to Prevent Them */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Key Industrial Failure Modes (What to Watch For)</span>
                </div>

                <div className="space-y-2 text-xs">
                  {profile.failureModes.map((fm, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-semibold text-rose-300 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{fm.mode}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500 font-bold">Root Cause:</span> {fm.cause}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        <span className="font-bold">Immediate Mitigation:</span> {fm.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Interactive Joinee Knowledge Check / Quiz */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                    <HelpCircle className="w-4 h-4" />
                    <span>Joinee Knowledge Verification Check</span>
                  </div>
                  {isSubmitted && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isQuizCorrect
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isQuizCorrect ? 'CORRECT (+100 PTS)' : 'INCORRECT'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-white font-medium">
                  {profile.knowledgeQuiz.question}
                </p>

                <div className="space-y-2">
                  {profile.knowledgeQuiz.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === profile.knowledgeQuiz.correctIndex;

                    return (
                      <div
                        key={idx}
                        onClick={() => !isSubmitted && handleSelectQuizOption(idx)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSubmitted
                            ? isCorrect
                              ? 'bg-emerald-950/80 border-emerald-600 text-white font-semibold'
                              : isSelected
                              ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                            : isSelected
                            ? 'bg-cyan-950/80 border-cyan-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="font-mono font-bold text-slate-400 shrink-0">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === undefined || selectedAnswer === null}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs font-mono transition-colors cursor-pointer shadow-md"
                  >
                    Submit Answer & Record Joinee Score
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] leading-relaxed">
                    <span className="text-cyan-400 font-bold block mb-0.5">Engineering Rationale:</span>
                    <span className="text-slate-300">{profile.knowledgeQuiz.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE B: LIVE MACHINE TELEMETRY & CONTROLS WORKSPACE                       */}
          {/* ========================================================================= */}
          {viewMode === 'telemetry' && (
            <div className="space-y-4">
              {/* Active Part in Spindle Status & Expedite Action */}
              {(() => {
                const activeWo = sim.workOrders.find((w) => w.id === machine.currentWorkOrderId);
                const progressPct = activeWo
                  ? Math.round(((activeWo.estimatedDurationHours - activeWo.remainingHours) / Math.max(1, activeWo.estimatedDurationHours)) * 100)
                  : 0;

                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${activeWo ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`} />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {activeWo ? 'Active Part Processing in Bay' : 'Spindle Status: Idle & Available'}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${activeWo ? 'bg-orange-950 text-orange-300 border border-orange-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                        {activeWo ? 'IN SPINDLE' : 'READY FOR QUEUE'}
                      </span>
                    </div>

                    {activeWo ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-white text-xs font-bold">{activeWo.partName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Job Card: {activeWo.orderNumber} • Vehicle: {activeWo.rocketSerial}
                            </div>
                          </div>
                          <button
                            onClick={() => expediteWorkOrder(activeWo.id, 12)}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-[11px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-orange-950 shrink-0"
                            title="Accelerate remaining machining hours on this machine"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>{activeWo.remainingHours <= 12 ? 'Complete & Clear' : '⚡ Expedite (-12 hrs)'}</span>
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                            <span>Cycle: {activeWo.remainingHours} hrs remaining of {activeWo.estimatedDurationHours}h</span>
                            <span className="text-cyan-400 font-bold">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>0 parts currently remaining in spindle. Machine is idle and available.</span>
                        <span className="text-emerald-400 font-mono font-bold text-xs">OEE 100%</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Core Telemetry Strip */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Live SCADA Telemetry Sensors</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Real-time digital twin sensor parameters streaming from {profile.cellCode}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  {profile.essentialMetrics.map((met, idx) => {
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold">{met.label}</span>
                          <span className="text-slate-500 font-sans">{met.unit}</span>
                        </div>
                        <div className="text-lg font-bold text-cyan-300">
                          {idx === 0 && (machine.telemetry?.spindleRpm || 18500)}
                          {idx === 1 && (machine.telemetry?.feedRateMmMin || 1200)}
                          {idx === 2 && (machine.telemetry?.axisJitterMicrons || 0.8)}
                          {idx === 3 && `${machine.toolingWearPct?.toFixed(1) || 22}%`}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate" title={met.description}>
                          Nominal: {met.nominalRange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Machine Health & Maintenance Countdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Machine Reliability & Health</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Health Score: 98.4%
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Operational Runtime:</span>
                    <span className="text-white font-bold">{machine.operatingHoursTotal || 3100} hrs</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Mean Time Between Failure (MTBF):</span>
                    <span className="text-cyan-400 font-bold">{machine.mtbfHours || 420} hrs</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Hours Since Last Service:</span>
                    <span className="text-amber-400 font-bold">{machine.hoursSinceLastMaintenance || 35} hrs</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Hourly Operating Cost:</span>
                    <span className="text-emerald-400 font-bold">₹{(machine.hourlyOperatingCostINR || 14500).toLocaleString('en-IN')}/hr</span>
                  </div>
                </div>
              </div>

              {/* Automatic Tool Changer (ATC) Carousel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    <span>Tool Magazine & Quick Indexer</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Indexed cutters for multi-stage milling & boring.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {toolsList.map((t) => (
                    <button
                      key={t.pocket}
                      onClick={() => changeMachineTool(machine.id, t.name)}
                      className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-orange-400 text-xs font-bold">
                          #{t.pocket}
                        </span>
                        <span className="text-xs text-white font-medium truncate">
                          {t.name}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                        {t.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
