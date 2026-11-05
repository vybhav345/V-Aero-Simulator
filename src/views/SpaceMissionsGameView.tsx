/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Rocket,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Globe,
  ArrowRight,
  Info,
  X,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';
import {
  REAL_WORLD_SPACE_MISSIONS,
  SpaceMission,
} from '../data/spaceMissionsGameData.ts';
import { FlightMission3DVisualizer } from '../components/game/FlightMission3DVisualizer.tsx';

export const SpaceMissionsGameView: React.FC = () => {
  const {
    sim,
    activeMissionId,
    setActiveMissionId,
    completedMissions,
    completeMission,
    playerXP,
    setActiveTab,
  } = useSimStore();

  const [visualizingMission, setVisualizingMission] = useState<SpaceMission | null>(null);

  // Pop-up modals state for clean first-look UX
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(false);
  const [showCareerModal, setShowCareerModal] = useState<boolean>(false);
  const [dossierMission, setDossierMission] = useState<SpaceMission | null>(null);

  // Selected or active mission
  const currentMission =
    REAL_WORLD_SPACE_MISSIONS.find((m) => m.id === activeMissionId) ||
    REAL_WORLD_SPACE_MISSIONS[0];

  // Calculate Player Rank based on XP
  const getPlayerRank = (xp: number) => {
    if (xp >= 7000) return { title: 'Chief Flight Director', level: 5, nextXp: 10000 };
    if (xp >= 3500) return { title: 'Launch Vehicle Mission Director', level: 4, nextXp: 7000 };
    if (xp >= 1500) return { title: 'Lead Propulsion & Systems Engineer', level: 3, nextXp: 3500 };
    if (xp >= 500) return { title: 'Quality & Flight Testing Engineer', level: 2, nextXp: 1500 };
    return { title: 'Aerospace Flight Trainee', level: 1, nextXp: 500 };
  };

  const rank = getPlayerRank(playerXP);
  const xpProgressPct = Math.min(
    100,
    Math.round(((playerXP - (rank.level === 1 ? 0 : 500)) / (rank.nextXp - (rank.level === 1 ? 0 : 500))) * 100)
  );

  const completedCount = Object.keys(completedMissions).length;

  // Check milestone completion against live simulation state
  const isMilestoneMet = (mId: string): boolean => {
    switch (mId) {
      case 'm0_gslv_gs2':
        return true;
      case 'm0_fairing_sep':
      case 'm0_cus_ign':
      case 'm0_nvs_sep':
        return completedMissions['gslv_nvs03'] !== undefined;
      case 'm1_cnc':
        return true;
      case 'm1_leak':
        return sim.testRecords.some((t) => t.testType === 'cryo_leak' && t.status === 'passed');
      case 'm1_test':
        return sim.testRecords.some((t) => t.testType === 'engine_hotfire' && t.status === 'passed');
      case 'm1_launch':
        return completedMissions['aditya_l1'] !== undefined;

      case 'm2_dmls':
        return sim.machines.some((m) => m.type === 'slm_dmls_3d');
      case 'm2_fsw':
        return sim.machines.some((m) => m.type === 'fsw_gantry');
      case 'm2_static':
        return sim.testRecords.some((t) => t.testType === 'stage_static_fire' && t.status === 'passed');
      case 'm2_launch':
        return completedMissions['chandrayaan_4'] !== undefined;

      case 'm3_qa':
        return sim.ncrs.filter((n) => n.status !== 'resolved').length === 0;
      case 'm3_pcb':
        return sim.machines.some((m) => m.type === 'cleanroom_smt');
      case 'm3_fairing':
        return sim.machines.some((m) => m.type === 'afp_autoclave');
      case 'm3_crew':
        return completedMissions['gaganyaan_hrlv'] !== undefined;

      default:
        return false;
    }
  };

  const handleLaunch3DSimulator = (mission: SpaceMission) => {
    setVisualizingMission(mission);
  };

  const handleMissionFinish = (success: boolean, stats: { maxAltKm: number; stars: number }) => {
    if (visualizingMission && success) {
      completeMission(
        visualizingMission.id,
        stats.stars,
        stats.maxAltKm,
        visualizingMission.rewardINR,
        visualizingMission.rewardXP
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      {/* =========================================================================
          1. CLEAN FIRST-LOOK HERO COMMAND DECK
          (Clean visual layout: Launch CTA upfront, details in pop-up modals)
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-[#0c1f38] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Mission Identity & High-Level Specs */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-950/80 text-orange-400 border border-orange-800/80 font-bold uppercase tracking-wider">
                ACTIVE FLIGHT MISSION
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {currentMission.codename}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{currentMission.agency}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              {currentMission.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans line-clamp-2">
              {currentMission.storyBrief}
            </p>

            {/* Quick Metrics Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">Orbit:</span>
                <span className="text-cyan-400 font-bold">
                  {currentMission.targetOrbit.split('(')[0]}
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">Contract Bounty:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{(currentMission.rewardINR / 1e7).toFixed(1)} Cr
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">Prestige:</span>
                <span className="text-cyan-400 font-bold">+{currentMission.rewardXP} XP</span>
              </div>
            </div>

            {/* Pop-up Modals Triggers (Replaces dense inline text with clean on-demand pop-ups) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowBriefingModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mission Briefing & Directives</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </button>

              <button
                onClick={() => setShowCareerModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Career Rank: Level {rank.level}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right: Primary 3D Launch Action Button */}
          <div className="w-full lg:w-72 shrink-0 space-y-3">
            <button
              onClick={() => handleLaunch3DSimulator(currentMission)}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-cyan-600 hover:from-orange-500 hover:to-cyan-500 text-white font-extrabold text-sm tracking-wider shadow-xl shadow-orange-950/70 transition-all flex items-center justify-center space-x-2.5 cursor-pointer transform hover:scale-[1.02]"
            >
              <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>LAUNCH 3D FLIGHT SIMULATION</span>
            </button>
            <p className="text-[11px] font-mono text-center text-slate-400">
              Photorealistic Earth • Trajectory Arc • Dual PiP Mode
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CAMPAIGN PORTFOLIO GRID (CLEAN, SCANNABLE FIRST LOOK)
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rocket className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Space Missions Campaign Fleet
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {completedCount} of 5 Missions Mastered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REAL_WORLD_SPACE_MISSIONS.map((mission) => {
            const isCurrent = mission.id === activeMissionId;
            const completion = completedMissions[mission.id];
            const isCleared = completion !== undefined;

            return (
              <div
                key={mission.id}
                className={`bg-slate-900/90 rounded-xl border p-4 shadow-lg flex flex-col justify-between space-y-3 transition-all ${
                  isCurrent
                    ? 'border-orange-500/90 shadow-orange-950/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Codename & Difficulty */}
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-orange-400 font-bold">{mission.codename}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        mission.difficulty === 'Human-Rated'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : mission.difficulty === 'Master'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {mission.difficulty}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {mission.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans truncate">
                      {mission.subtitle}
                    </p>
                  </div>

                  {/* Key Stats Bar */}
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Contract Bounty</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{(mission.rewardINR / 1e7).toFixed(1)} Cr
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Target Orbit</span>
                      <span className="text-slate-300 font-semibold truncate max-w-[140px] block" title={mission.targetOrbit}>
                        {mission.targetOrbit.split('(')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Mastered Badge if Completed */}
                  {isCleared && (
                    <div className="flex items-center justify-between px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300">
                      <span className="flex items-center space-x-1 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </span>
                      <span className="text-amber-400 text-xs">⭐⭐⭐</span>
                    </div>
                  )}
                </div>

                {/* Clean Actions: Select + Pop-up Dossier */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 font-mono text-xs">
                  <button
                    onClick={() => setActiveMissionId(mission.id)}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-orange-600 text-white shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isCurrent ? 'Active Mission' : 'Select'}
                  </button>

                  <button
                    onClick={() => setDossierMission(mission)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    title="View Full Mission Dossier (Pop-up)"
                  >
                    <Info className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. POP-UP MODAL: MISSION BRIEFING & PRE-FLIGHT DIRECTIVES
          ========================================================================= */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-950 border border-orange-800 flex items-center justify-center text-orange-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Mission Flight Briefing & Directives
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {currentMission.codename} • {currentMission.agency}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBriefingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Narrative Story */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Mission Objective & Flight Sequence
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {currentMission.storyBrief}
              </p>
            </div>

            {/* Real-World Context */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start space-x-2 font-sans">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-200">Real-World Mission Context: </strong>
                {currentMission.realWorldContext}
              </span>
            </div>

            {/* Pre-Flight Directives Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Pre-Flight Directives Checklist</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentMission.missionMilestones.filter((m) => isMilestoneMet(m.id)).length} of 4 Cleared
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentMission.missionMilestones.map((m, idx) => {
                  const isDone = isMilestoneMet(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border font-mono text-xs ${
                        isDone
                          ? 'bg-slate-950 border-emerald-800/80 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold text-orange-400">Phase {idx + 1}</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded uppercase ${isDone ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-500'}`}>
                          {isDone ? 'CLEARED' : 'PENDING'}
                        </span>
                      </div>
                      <div className="text-xs font-sans font-semibold text-white mb-2 leading-tight">
                        {m.label}
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-900">
                        <span className="text-slate-500 truncate">{m.targetValue}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <button
                            onClick={() => {
                              setShowBriefingModal(false);
                              if (m.category === 'manufacturing') setActiveTab('factory_bays');
                              else if (m.category === 'testing' || m.category === 'launch') setActiveTab('mahendragiri_launch');
                              else setActiveTab('quality_lab');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer font-bold"
                          >
                            <span>Go</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBriefingModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. POP-UP MODAL: CAREER PROGRESSION & RANKS
          ========================================================================= */}
      {showCareerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Aerospace Career & Prestige XP
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Level {rank.level} • {rank.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCareerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* XP Bar */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Prestige Experience Points</span>
                <span className="text-cyan-400 font-bold">{playerXP} / {rank.nextXp} XP</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgressPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                Next Promotion: Level {rank.level + 1}
              </div>
            </div>

            {/* Career Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Missions Mastered</span>
                <span className="text-cyan-400 font-bold text-lg">{completedCount} / 5</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Program Treasury</span>
                <span className="text-emerald-400 font-bold text-lg">
                  ₹{(sim.financials.cashBalanceINR / 1e7).toFixed(1)} Cr
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCareerModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. POP-UP MODAL: MISSION DOSSIER FOR ANY CAMPAIGN CARD
          ========================================================================= */}
      {dossierMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-orange-400 uppercase">
                  {dossierMission.codename} • {dossierMission.difficulty}
                </span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                  {dossierMission.title}
                </h3>
              </div>
              <button
                onClick={() => setDossierMission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real World Inspiration */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans">
              <strong className="text-white block font-mono text-[11px] uppercase mb-1">
                Real-World Mission Profile:
              </strong>
              {dossierMission.realWorldContext}
            </div>

            {/* Vehicle & Payload Details */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Recommended Vehicle</span>
                <span className="text-slate-200 font-semibold">{dossierMission.recommendedVehicle}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Target Orbit</span>
                <span className="text-cyan-300 font-semibold">{dossierMission.targetOrbit}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Contract Bounty</span>
                <span className="text-emerald-400 font-bold">
                  ₹{(dossierMission.rewardINR / 1e7).toFixed(1)} Cr
                </span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Prestige Reward</span>
                <span className="text-cyan-400 font-bold">+{dossierMission.rewardXP} XP</span>
              </div>
            </div>

            {/* Actions in Dossier */}
            <div className="pt-3 border-t border-slate-800 flex items-center space-x-3">
              <button
                onClick={() => {
                  setActiveMissionId(dossierMission.id);
                  setDossierMission(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Set as Active Mission
              </button>
              <button
                onClick={() => {
                  const m = dossierMission;
                  setDossierMission(null);
                  handleLaunch3DSimulator(m);
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Launch 3D Flight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. FULLSCREEN 3D FLIGHT MISSION SIMULATOR MODAL
          ========================================================================= */}
      {visualizingMission && (
        <FlightMission3DVisualizer
          mission={visualizingMission}
          onMissionComplete={(success, stats) => {
            handleMissionFinish(success, stats);
          }}
          onClose={() => setVisualizingMission(null)}
        />
      )}
    </div>
  );
};
