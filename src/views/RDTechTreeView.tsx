/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  TECH_TREE_NODES,
  UNLOCKED_NEXTGEN_ROCKETS,
} from '../data/techTreeData.ts';
import { TechNode, TechCategory } from '../types/index.ts';
import {
  Compass,
  Zap,
  Flame,
  Shield,
  Layers,
  Cpu,
  Target,
  Anchor,
  Navigation,
  Grid,
  CheckCircle2,
  Lock,
  Play,
  XCircle,
  Sparkles,
  Rocket,
  Info,
  DollarSign,
  Clock,
  ArrowRight,
  Gauge,
  Activity,
  Award,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';

export const RDTechTreeView: React.FC = () => {
  const {
    unlockedTechIds,
    activeResearch,
    researchPoints,
    startResearch,
    cancelResearch,
    instantUnlockTech,
    addResearchPoints,
    createProductionOrder,
    setActiveTab,
    sim,
  } = useSimStore();

  const [selectedCategory, setSelectedCategory] = useState<TechCategory | 'all'>('all');
  const [selectedTechModal, setSelectedTechModal] = useState<TechNode | null>(null);
  const [fundingRateLakhs, setFundingRateLakhs] = useState<number>(60); // ₹60 Lakhs/hr
  const [testFiring, setTestFiring] = useState<boolean>(false);
  const [testFireLogs, setTestFireLogs] = useState<string[]>([]);

  const categories: { id: TechCategory | 'all'; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Technologies', icon: Compass },
    { id: 'propulsion', label: 'Propulsion & Engines', icon: Flame },
    { id: 'structures', label: 'Cryotanks & Materials', icon: Layers },
    { id: 'reusability', label: 'Sea Recovery & Grid Fins', icon: Anchor },
    { id: 'manufacturing', label: 'Additive & 5-Axis CNC', icon: Cpu },
    { id: 'avionics', label: 'Hypersonic Guidance', icon: Navigation },
  ];

  const filteredTechs = TECH_TREE_NODES.filter((tech) => {
    if (selectedCategory === 'all') return true;
    return tech.category === selectedCategory;
  });

  const getTechStatus = (tech: TechNode) => {
    if (unlockedTechIds.includes(tech.id)) return 'unlocked';
    if (activeResearch?.techId === tech.id) return 'in_progress';
    const prereqsMet = tech.prerequisites.every((pId) => unlockedTechIds.includes(pId));
    if (prereqsMet) return 'available';
    return 'locked';
  };

  const getTechIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Shield': return Shield;
      case 'Grid': return Grid;
      case 'Zap': return Zap;
      case 'Compass': return Compass;
      case 'Cpu': return Cpu;
      case 'Navigation': return Navigation;
      case 'Layers': return Layers;
      case 'Target': return Target;
      case 'Anchor': return Anchor;
      default: return Sparkles;
    }
  };

  const activeTechDetails = activeResearch
    ? TECH_TREE_NODES.find((t) => t.id === activeResearch.techId)
    : null;

  // Hotfire test bench simulator
  const runHotfireTest = (techId: string) => {
    if (testFiring) return;
    setTestFiring(true);
    setTestFireLogs(['[T-03s] Igniter spark plug energized...', '[T-01s] LOX / Methane turbopumps spun up to 34,000 RPM...']);

    // Play procedural audio
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    } catch {
      // AudioContext fallback
    }

    setTimeout(() => {
      setTestFireLogs((prev) => [
        ...prev,
        '[T+00s] Main Stage Ignition: Full-Flow Staged Combustion established.',
        '[T+02s] Chamber pressure stabilized at 298.4 bar (Rated: 300 bar).',
        '[T+04s] Thrust output verified: 2,448 kN. Regenerative GRCop-42 cooling nominal.',
        '[SUCCESS] Hotfire acceptance test complete! Qualification data recorded (+250 RP).',
      ]);
      addResearchPoints(250);
      setTestFiring(false);
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / R&D Mission Control */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Next-Gen Propulsion & Aerospace Tech</span>
              </span>
              <span className="text-xs font-mono text-slate-400">ISRO / IN-SPACe Advanced R&D Bureau</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Research & Development <span className="text-purple-400">Tech Tree</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Unlock disruptive aerospace breakthroughs: <strong>Full-Flow Methane-LOX engines</strong>, <strong>Linerless CFRP Cryotanks</strong>, <strong>Toroidal Aerospike nozzles</strong>, and <strong>Autonomous Sea Drone Ship landings</strong>.
            </p>
          </div>

          {/* Research Economy HUD */}
          <div className="flex flex-wrap items-center gap-3">
            {/* RP Balance Card */}
            <div className="bg-slate-950/80 border border-purple-800/60 rounded-xl px-4 py-2.5 shadow-lg">
              <div className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold flex items-center justify-between">
                <span>Research Points (RP)</span>
                <span className="text-emerald-400">+{sim.tick % 4 === 0 ? '10' : '0'}/hr</span>
              </div>
              <div className="text-2xl font-black font-mono text-white flex items-center space-x-1.5">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{researchPoints.toLocaleString()}</span>
                <span className="text-xs font-sans text-slate-400 font-normal">RP</span>
              </div>
              <button
                onClick={() => addResearchPoints(1500)}
                className="mt-1 text-[10px] text-purple-300 hover:text-white underline cursor-pointer"
              >
                +1,500 RP Grant (Sandbox)
              </button>
            </div>

            {/* Unlocked Stats */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Techs Breakthroughs
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {unlockedTechIds.length} <span className="text-xs text-slate-500 font-normal">/ {TECH_TREE_NODES.length}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Next-Gen Rockets: {Object.keys(UNLOCKED_NEXTGEN_ROCKETS).filter((k) => sim.rocketDesigns.some((d) => d.id === k)).length}/3
              </div>
            </div>
          </div>
        </div>

        {/* Active Research Banner (if in progress) */}
        {activeResearch && activeTechDetails && (
          <div className="mt-5 pt-5 border-t border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase">ACTIVE PROJECT</span>
                  <span className="text-xs text-slate-400">Tier {activeTechDetails.tier}</span>
                </div>
                <div className="font-bold text-white text-base">{activeTechDetails.title}</div>
              </div>
            </div>

            {/* Progress bar and controls */}
            <div className="flex-1 max-w-xl">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Development Progress</span>
                <span className="text-purple-300 font-bold">{Math.round(activeResearch.progressPct)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-purple-900/80">
                <div
                  className="bg-gradient-to-r from-purple-600 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${activeResearch.progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>Budget: ₹{(activeResearch.allocatedINRPerHour / 1e5).toFixed(1)} Lakhs/hr</span>
                <span className="text-cyan-400">Estimated ~{Math.max(1, Math.round(((100 - activeResearch.progressPct) / 100) * activeTechDetails.researchTimeTicks))} hrs left</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => instantUnlockTech(activeTechDetails.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Instant Breakthrough</span>
              </button>
              <button
                onClick={cancelResearch}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 text-xs font-mono transition-all cursor-pointer"
                title="Cancel Research"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tech Tree Nodes Grid across Tiers 1-6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTechs.map((tech) => {
          const status = getTechStatus(tech);
          const Icon = getTechIcon(tech.iconName);
          const isUnlocked = status === 'unlocked';
          const isInProgress = status === 'in_progress';
          const isAvailable = status === 'available';
          const isLocked = status === 'locked';

          return (
            <div
              key={tech.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between relative overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : isInProgress
                  ? 'bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/50'
                  : isAvailable
                  ? 'bg-slate-900/90 border-cyan-800/80 hover:border-cyan-500 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              {/* Top Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 uppercase">
                      Tier {tech.tier}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {tech.category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isUnlocked && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>RESEARCHED</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-purple-400" />
                        <span>IN PROGRESS</span>
                      </span>
                    )}
                    {isAvailable && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        READY TO RESEARCH
                      </span>
                    )}
                    {isLocked && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Tagline */}
                <div className="flex items-start space-x-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : isInProgress
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-snug">{tech.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{tech.tagline}</p>
                  </div>
                </div>

                {/* Key Aerospace Specs */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                  {tech.specs.slice(0, 2).map((sp, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-slate-500 uppercase text-[9px] truncate">{sp.label}</span>
                      <span className="text-slate-200 font-bold truncate">{sp.value}</span>
                    </div>
                  ))}
                </div>

                {/* Stat Bonus Highlight */}
                <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-2 mb-3">
                  <span className="font-bold">Bonus: </span>
                  {tech.bonuses.description}
                </div>

                {/* Unlocks Next-Gen Rocket Badge */}
                {tech.unlockedRocketDesignIds && tech.unlockedRocketDesignIds.length > 0 && (
                  <div className="flex items-center space-x-1.5 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-lg px-2.5 py-1 mb-3 font-mono font-bold">
                    <Rocket className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unlocks: {UNLOCKED_NEXTGEN_ROCKETS[tech.unlockedRocketDesignIds[0]]?.name || 'Next-Gen Launcher'}</span>
                  </div>
                )}

                {/* Prerequisites Check */}
                {isLocked && tech.prerequisites.length > 0 && (
                  <div className="text-[11px] text-slate-400 font-mono mb-3">
                    <span className="text-red-400">Requires: </span>
                    {tech.prerequisites.map((pId) => {
                      const pNode = TECH_TREE_NODES.find((n) => n.id === pId);
                      return pNode?.title || pId;
                    }).join(', ')}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 mt-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-slate-200">{tech.costRP} RP</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Rupee className="w-3 h-3 text-slate-400" />
                    <span>{(tech.costINR / 1e7).toFixed(0)} Cr</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{tech.researchTimeTicks} hrs</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Detailed Specs Modal Trigger */}
                  <button
                    onClick={() => setSelectedTechModal(tech)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    title="View Technical Dossier"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* Research Actions */}
                  {isUnlocked ? (
                    <div className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Operational</span>
                    </div>
                  ) : isInProgress ? (
                    <div className="flex-1 py-2 rounded-xl bg-purple-900/60 border border-purple-700 text-purple-200 text-xs font-bold font-mono text-center animate-pulse">
                      Simulating R&D ({Math.round(activeResearch?.progressPct || 0)}%)
                    </div>
                  ) : isAvailable ? (
                    <div className="flex-1 flex items-center space-x-1.5">
                      <button
                        onClick={() => startResearch(tech.id, fundingRateLakhs * 100000)}
                        disabled={researchPoints < tech.costRP}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center space-x-1.5 ${
                          researchPoints >= tech.costRP
                            ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-md shadow-purple-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start R&D</span>
                      </button>
                      <button
                        onClick={() => instantUnlockTech(tech.id)}
                        className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
                        title="Instant Unlock (Sandbox Mode)"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => instantUnlockTech(tech.id)}
                      className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" />
                      <span>Unlock (Sandbox)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlocked Next-Gen Rocket Launchers Showcase */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-orange-400" />
              <span>Next-Generation Launch Architectures</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Vehicle blueprints unlocked by advanced propulsion & cryotank breakthroughs
            </p>
          </div>
          <button
            onClick={() => setActiveTab('shop_floor_takt')}
            className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Shop Floor Fleet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(UNLOCKED_NEXTGEN_ROCKETS).map(([key, rocket]) => {
            const isUnlocked = sim.rocketDesigns.some((d) => d.id === key);

            return (
              <div
                key={key}
                className={`rounded-xl p-4 border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-cyan-800/80 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isUnlocked ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isUnlocked ? 'FLEET READY' : 'REQUIRES R&D'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{rocket.propellantType}</span>
                </div>

                <h4 className="font-extrabold text-white text-sm mb-1">{rocket.name}</h4>
                <p className="text-slate-400 text-xs mb-3 line-clamp-2">{rocket.tagline}</p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">LEO Payload</span>
                    <span className="font-bold text-white">{(rocket.payloadCapacityLeoKg / 1000).toFixed(1)} Tonnes</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Launch Cost</span>
                    <span className="font-bold text-emerald-400">₹{(rocket.targetLaunchPriceINR / 1e7).toFixed(0)} Cr</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Dry Mass</span>
                    <span className="font-bold text-slate-300">{(rocket.dryMassKg / 1000).toFixed(1)} T</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Stages</span>
                    <span className="font-bold text-cyan-400">{rocket.stagesCount} {rocket.stagesCount === 1 ? '(SSTO)' : 'Stage'}</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => createProductionOrder(rocket.id)}
                    className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-orange-950"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Order Production Build</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Find which tech unlocks this
                      const unlockingTech = TECH_TREE_NODES.find((t) => t.unlockedRocketDesignIds?.includes(key));
                      if (unlockingTech) instantUnlockTech(unlockingTech.id);
                    }}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-purple-900 text-slate-300 hover:text-white font-mono font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unlock Prototype</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* R&D Propulsion Hotfire Test Bench Simulation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              <span>Propulsion Hotfire Qualification Bench</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Static test stand for full-flow staged combustion Methalox and altitude-compensating aerospikes
            </p>
          </div>

          <button
            onClick={() => runHotfireTest('tech_methalox_ffsc')}
            disabled={testFiring}
            className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              testFiring
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-950/50'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>{testFiring ? 'HOTFIRE IN PROGRESS (STAND ACTIVE)...' : 'IGNITE STATIC TEST STAND'}</span>
          </button>
        </div>

        {/* Live Test Stand Telemetry Console */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px] text-slate-400">
            <span className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${testFiring ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>TEST STAND: MAHENDRAGIRI HIGH-PRESSURE CELL 04</span>
            </span>
            <span className="text-slate-500">SAMPLING RATE: 10 kHz</span>
          </div>

          {testFireLogs.length === 0 ? (
            <div className="text-slate-500 py-4 text-center">
              Stand idle. Click "IGNITE STATIC TEST STAND" to simulate hotfire firing cycle and gather acoustic qualification data.
            </div>
          ) : (
            <div className="space-y-1 text-slate-300">
              {testFireLogs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    log.includes('[SUCCESS]')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('T+00s')
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deep-Dive Tech Dossier Modal */}
      {selectedTechModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                  Tier {selectedTechModal.tier} • {selectedTechModal.category}
                </span>
                <h3 className="text-xl font-black text-white">{selectedTechModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTechModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 text-sm">{selectedTechModal.tagline}</p>

            {/* Aerospace Engineering Lore */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
              <span className="font-bold text-purple-300 block mb-1 font-mono uppercase text-[10px]">
                Aerospace Engineering Dossier & ISRO Heritage
              </span>
              {selectedTechModal.lore}
            </div>

            {/* Specs Grid */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">Technical Specifications</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {selectedTechModal.specs.map((sp, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">{sp.label}</span>
                    <span className="text-white font-bold">{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus */}
            <div className="text-xs font-mono bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 p-2.5 rounded-xl">
              <span className="font-bold">Operational Multiplier: </span>
              {selectedTechModal.bonuses.description}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedTechModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono font-bold cursor-pointer"
              >
                Close
              </button>
              {!unlockedTechIds.includes(selectedTechModal.id) && (
                <button
                  onClick={() => {
                    instantUnlockTech(selectedTechModal.id);
                    setSelectedTechModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Instant Unlock</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
