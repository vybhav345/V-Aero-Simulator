/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Sparkles,
  Send,
  Bot,
  User,
  AlertTriangle,
  Lightbulb,
  Zap,
  RefreshCw,
  Wrench,
  ShieldAlert,
  Building2,
  Flame,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Radio,
  Play,
  RotateCcw,
  Check,
  Terminal,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionChips?: {
    label: string;
    actionType: 'maintenance' | 'ncr_rework' | 'fund_vendor' | 'hotfire' | 'goto_tab' | 'restock';
    targetId?: string;
    tabTarget?: any;
    payload?: any;
    rationale?: string;
  }[];
}

interface AutonomousLogEntry {
  id: string;
  tick: number;
  timeStr: string;
  action: string;
  system: string;
  status: 'nominal' | 'mitigated' | 'triaged';
}

// Visual Markdown Formatter for Aerospace Directives
const RenderMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed font-sans select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <div
              key={idx}
              className="text-sm font-extrabold text-orange-300 font-mono tracking-wide pt-2 pb-1 border-b border-slate-800 flex items-center space-x-2"
            >
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              <span>{trimmed.replace('### ', '')}</span>
            </div>
          );
        }

        // Heading 4
        if (trimmed.startsWith('#### ')) {
          return (
            <div
              key={idx}
              className="text-xs font-bold text-cyan-300 font-mono tracking-wider pt-2 uppercase"
            >
              {trimmed.replace('#### ', '')}
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const rawText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-orange-400 font-mono text-sm leading-none">•</span>
              <span className="text-slate-300">
                {parseFormattedInline(rawText)}
              </span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-[10px] rounded font-bold">
                {numMatch[1]}
              </span>
              <span className="text-slate-300">
                {parseFormattedInline(numMatch[2])}
              </span>
            </div>
          );
        }

        // Regular paragraph with bolding
        return (
          <p key={idx} className="text-slate-300">
            {parseFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

function parseFormattedInline(text: string): React.ReactNode[] {
  // Regex match bold **term**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={i} className="text-white font-semibold">
          {boldContent}
        </strong>
      );
    }
    return part;
  });
}

export const AiAdvisorView: React.FC = () => {
  const {
    sim,
    engine,
    injectDisruption,
    performMaintenance,
    dispositionNCR,
    fundVendorProgram,
    runQualificationTest,
    orderMaterialManual,
    setActiveTab,
  } = useSimStore();

  const [autonomousMode, setAutonomousMode] = useState<boolean>(true);
  const [autonomousLogs, setAutonomousLogs] = useState<AutonomousLogEntry[]>([
    {
      id: 'log-init-1',
      tick: sim.tick,
      timeStr: 'Shift A',
      action: 'Initialized SCADA telemetry stream across 5 Indian Space manufacturing centers.',
      system: 'Peenya / Adibatla / Mahendragiri',
      status: 'nominal',
    },
    {
      id: 'log-init-2',
      tick: sim.tick,
      timeStr: 'Shift A',
      action: 'Verified AS9100 Rev D audit compliance and Inconel 718 lot certs with MIDHANI.',
      system: 'MIDHANI Hyderabad',
      status: 'nominal',
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `### 🇮🇳 Namaste Operations Chief. V-Aero Industrial Telemetry Online.\n\nI am your **AI Plant Operations Supervisor & Chief Industrial Engineer**, monitoring real-time telemetry across our 5 aerospace clusters:\n- **Bengaluru Peenya SEZ**: 5-Axis CNC & SMT Cleanroom\n- **Hyderabad Adibatla Aerospace Park**: Friction Stir Welding (FSW) Gantry & Cryo Tanks\n- **IPRC Mahendragiri**: Semi-Cryogenic SCE-200 Engine Test Stand C-1\n- **SDSC-SHAR Sriharikota**: Launch Complexes FLP/SLP\n- **Atmanirbhar Vendor Tier**: MIDHANI, MTAR, Godrej, L&T, and SCL\n\nHow may I direct the manufacturing floor today? Select an operational directive or enter a custom query.`,
      timestamp: 'Now',
      actionChips: [
        { label: '🚨 Triage Active Bottleneck', actionType: 'goto_tab', tabTarget: 'shop_floor_takt' },
        { label: '🇮🇳 Audit Vendor Domestic Content', actionType: 'goto_tab', tabTarget: 'vendor_development' },
        { label: '🛡️ Convene MRB Quality Board', actionType: 'goto_tab', tabTarget: 'quality_lab' },
        { label: '🔥 Mahendragiri Test Stand C-1 Status', actionType: 'goto_tab', tabTarget: 'mahendragiri_launch' },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingEvent, setIsGeneratingEvent] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAutoTickRef = useRef<number>(sim.tick);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const openNcrs = sim.ncrs.filter((n) => n.status !== 'resolved');
  const bottleneckMachine =
    sim.machines.find((m) => m.name.toLowerCase().includes('cnc')) || sim.machines[0];
  const firstOpenNcr = openNcrs[0];
  const firstRocket = sim.rockets[0];
  const cashCr = (sim.financials.cashBalanceINR / 1e7).toFixed(1);

  // Autonomous Co-Pilot Surveillance Loop
  useEffect(() => {
    if (!autonomousMode) return;
    if (sim.tick === lastAutoTickRef.current) return;
    lastAutoTickRef.current = sim.tick;

    // 1. Spindle Tool Wear Surveillance
    const highWearMac = sim.machines.find((m) => m.toolingWearPct > 40 && m.status === 'running');
    if (highWearMac) {
      performMaintenance(highWearMac.id);
      const newLog: AutonomousLogEntry = {
        id: `auto-${Date.now()}-${Math.random()}`,
        tick: sim.tick,
        timeStr: engine.formatSimTime(sim.tick),
        action: `Auto-dispatched spindle offset compensation and carbide tool change on ${highWearMac.name}. Tool wear reset to 0%.`,
        system: highWearMac.bayName,
        status: 'mitigated',
      };
      setAutonomousLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    }

    // 2. Minor NCR Auto-Clear
    const minorNcr = openNcrs.find((n) => n.severity === 'minor');
    if (minorNcr) {
      dispositionNCR(minorNcr.id, 'use_as_is');
      const newLog: AutonomousLogEntry = {
        id: `auto-${Date.now()}-${Math.random()}`,
        tick: sim.tick,
        timeStr: engine.formatSimTime(sim.tick),
        action: `MRB Engineering Waiver applied to minor NCR ${minorNcr.ncrNumber}. Cleared within AS9100 Rev D limit.`,
        system: 'Quality Lab',
        status: 'triaged',
      };
      setAutonomousLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    }
  }, [sim.tick, autonomousMode, sim.machines, openNcrs, engine, performMaintenance, dispositionNCR]);

  // Suggested prompt quick-commands
  const promptSuggestions = [
    {
      label: '🚨 De-bottleneck 5-Axis CNC Spindle',
      query: 'Analyze active shop-floor bottleneck on 5-Axis CNC Bay and recommend throughput optimization.',
    },
    {
      label: '🇮🇳 Indigenize Cryo Valves & Inconel',
      query: 'How do we accelerate vendor indigenization for cryogenic valves and MIDHANI superalloys?',
    },
    {
      label: '🛡️ Quality Defect & MRB Disposition',
      query: 'What is our current AS9100 defect rate and how should we disposition open non-conformance lots?',
    },
    {
      label: '🚀 Flight Readiness Review (FRR)',
      query: 'Evaluate our Sriharikota launch readiness and Mahendragiri static hotfire verification checklist.',
    },
    {
      label: '⚡ Auto-Tune All Machine Cells',
      query: 'Execute comprehensive spindle calibration and axis jitter audit across all bays.',
    },
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const snapshot = {
        tick: sim.tick,
        kpis: sim.kpis,
        runningMachines: sim.machines.filter((m) => m.status === 'running').length,
        breakdownMachines: sim.machines.filter((m) => m.status === 'breakdown').length,
        openNcrs: openNcrs.length,
        rocketsInWip: sim.rockets.map((r) => ({
          serial: r.serialNumber,
          design: r.designName,
          progress: r.productionProgressPct,
          reliability: r.calculatedReliability,
        })),
        cashBalanceINR: sim.financials.cashBalanceINR,
      };

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simSnapshot: snapshot, userQuery: textToSend }),
      });

      const data = await res.json();

      let chips: ChatMessage['actionChips'] = data.actionDirectives || [];

      // Fallback chip population if none returned
      if (!chips || chips.length === 0) {
        chips = [
          {
            label: `🛠️ Calibrate ${bottleneckMachine.name.split(' ')[0]} Spindle`,
            actionType: 'maintenance',
            targetId: bottleneckMachine.id,
          },
          {
            label: '📊 Takt Board',
            actionType: 'goto_tab',
            tabTarget: 'shop_floor_takt',
          },
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.response || 'Telemetry logged. Operational health remains nominal across all aerospace cells.',
        timestamp: 'Now',
        actionChips: chips,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Advisor fetch error:', err);
      // Instant Client-Side Zero-Latency Aerospace Telemetry Synthesis
      const fallbackText = `### 🏢 V-Aero Operations Directive & Plant Synthesis
**DEFCON Level:** DEFCON-5 (NOMINAL) | **Active Shift:** Shift A (Peenya/Adibatla) | **Working Capital:** ₹${cashCr} Cr

#### 1. Executive Telemetry Overview:
- **Shop-Floor Pacing**: Active constraint is **${sim.kpis.activeBottleneckStation || '5-Axis CNC Bay (Bengaluru)'}**. Factory overall throughput is tracking at **${sim.kpis.overallEquipmentEffectiveness.toFixed(1)}% OEE**.
- **Quality & Airworthiness**: **${openNcrs.length} open NCRs** awaiting Material Review Board review. Zero escape defects recorded across Tier-1 space components.
- **Atmanirbhar Indigenization**: **${sim.kpis.indigenizationRatioPct}% domestic content**. Local supply chains (MIDHANI, MTAR, Godrej Aerospace, L&T) are handling major assemblies.

#### 2. High-Priority Directives:
1. **De-bottleneck Spindle**: Dispatch maintenance team to apply spindle offset compensation and re-balance carbide tooling.
2. **Clear Quality Gates**: Disposition pending non-conformance lots to unlock Stage 1 tank stacking.
3. **Mahendragiri Hotfire**: Authorize SCE-200 semi-cryo engine static acceptance firing.`;

      const fallbackChips: ChatMessage['actionChips'] = [
        {
          label: `🛠️ Calibrate ${bottleneckMachine.name.split(' ')[0]} Spindle`,
          actionType: 'maintenance',
          targetId: bottleneckMachine.id,
        },
        ...(firstOpenNcr
          ? [
              {
                label: `⚖️ MRB: Rework NCR ${firstOpenNcr.id}`,
                actionType: 'ncr_rework' as const,
                targetId: firstOpenNcr.id,
              },
            ]
          : []),
        {
          label: '🇮🇳 Grant ₹5 Cr ToT to MIDHANI',
          actionType: 'fund_vendor',
          targetId: 'vp_midhani_inconel_01',
          payload: 50000000,
        },
      ];

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-fallback-${Date.now()}`,
          sender: 'ai',
          text: fallbackText,
          timestamp: 'Now',
          actionChips: fallbackChips,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionExecute = (chip: NonNullable<ChatMessage['actionChips']>[0]) => {
    switch (chip.actionType) {
      case 'maintenance': {
        const target = chip.targetId === 'bottleneck' ? bottleneckMachine.id : chip.targetId || bottleneckMachine.id;
        performMaintenance(target);
        setActionFeedback(`✅ Preventive maintenance executed on ${target}. Spindle runout reset to < 0.8 µm.`);
        break;
      }
      case 'ncr_rework': {
        const targetNcrId = chip.targetId === 'first_open' ? firstOpenNcr?.id : chip.targetId || firstOpenNcr?.id;
        if (targetNcrId) {
          dispositionNCR(targetNcrId, 'rework');
          setActionFeedback(`✅ MRB disposition applied: ${targetNcrId} queued for precision laser weld rework.`);
        } else {
          setActionFeedback(`ℹ️ Zero open NCRs pending Material Review Board disposition.`);
        }
        break;
      }
      case 'fund_vendor':
        if (chip.targetId) {
          fundVendorProgram(chip.targetId, chip.payload || 50000000);
          setActionFeedback(`✅ Transfer of Technology (ToT) grant of ₹5.0 Cr disbursed to vendor partner.`);
        }
        break;
      case 'hotfire':
        if (chip.targetId || firstRocket) {
          const serial = chip.targetId || firstRocket.serialNumber;
          runQualificationTest(serial, 'engine_hotfire');
          setActionFeedback(`🔥 Mahendragiri Test Stand C-1 hotfire burn completed with 100% nominal chamber pressure!`);
        }
        break;
      case 'restock':
        if (chip.targetId) {
          orderMaterialManual(chip.targetId, chip.payload || 50);
          setActionFeedback(`📦 Emergency raw stock indent placed for aerospace material consignment.`);
        }
        break;
      case 'goto_tab':
        if (chip.tabTarget) {
          setActiveTab(chip.tabTarget);
        }
        break;
    }

    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

  const handleGenerateDisruption = async () => {
    setIsGeneratingEvent(true);
    try {
      const snapshot = {
        tick: sim.tick,
        kpis: sim.kpis,
        openNcrs: openNcrs.length,
      };

      const res = await fetch('/api/gemini/event-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simSnapshot: snapshot }),
      });

      const data = await res.json();
      if (data.disruption) {
        injectDisruption({
          title: data.disruption.title,
          description: data.disruption.description,
          severity: data.disruption.severity || 'warning',
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `evt-${Date.now()}`,
            sender: 'ai',
            text: `### ⚠️ IN-PLANT DISRUPTION INJECTED: ${data.disruption.title}
${data.disruption.description}

**Financial Outlay**: ₹${((data.disruption.costImpact || 10000000) / 1e7).toFixed(2)} Cr | **Schedule Slippage**: +${data.disruption.delayHours || 48}h`,
            timestamp: 'Now',
            actionChips: [
              { label: '🛠️ Service Spindle / Cleanroom', actionType: 'maintenance', targetId: bottleneckMachine.id },
              { label: '📊 Inspect Shop-Floor Impact', actionType: 'goto_tab', tabTarget: 'shop_floor_takt' },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error('Event generator error:', err);
    } finally {
      setIsGeneratingEvent(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Aerospace Telemetry HUD Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Plant Directive</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="font-mono text-sm font-extrabold text-emerald-400 mt-1">
            DEFCON-5 (NOMINAL)
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Shift A • Peenya / Adibatla</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Bottleneck</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-mono text-xs font-bold text-amber-300 mt-1 truncate">
            {sim.kpis.activeBottleneckStation || 'Nominal Flow (Balanced)'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">OEE: {sim.kpis.overallEquipmentEffectiveness.toFixed(1)}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Domestic Content</span>
            <Building2 className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="font-mono text-sm font-extrabold text-orange-400 mt-1">
            {sim.kpis.indigenizationRatioPct}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Atmanirbhar Space Tier</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>MRB Quality Cases</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="font-mono text-sm font-extrabold text-white mt-1">
            {openNcrs.length} <span className="text-xs text-rose-400">Open NCRs</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">AS9100 Rev D Audited</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Working Capital</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-mono text-sm font-extrabold text-cyan-400 mt-1 flex items-center">
            <Rupee className="w-3.5 h-3.5 inline mr-0.5" />
            <span>{cashCr} Cr</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">IN-SPACe Escrow Account</div>
        </div>
      </div>

      {/* Action Execution Toast Alert */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-xl text-xs text-emerald-200 font-mono flex items-center space-x-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Main Grid: Left Chat & Directives Console, Right Autonomous Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Console Box Container (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col h-[680px] overflow-hidden">
          {/* Console Header Bar */}
          <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-950 border border-orange-800 flex items-center justify-center text-orange-400 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm font-mono tracking-wide">
                    V-AERO PLANT SUPERVISOR & MISSION COPILOT
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ONLINE • ZERO-LATENCY SCADA</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  ISRO / IN-SPACe Certified Industrial AI • Grounded in Real-Time Machine Telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Autonomous Mode Toggle */}
              <button
                onClick={() => setAutonomousMode(!autonomousMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                  autonomousMode
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Toggles autonomous floor supervision (auto-tool change and MRB waivers)"
              >
                <Cpu className={`w-3.5 h-3.5 ${autonomousMode ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>COPILOT: {autonomousMode ? 'ACTIVE' : 'STANDBY'}</span>
              </button>

              <button
                disabled={isGeneratingEvent}
                onClick={handleGenerateDisruption}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isGeneratingEvent ? 'Injecting...' : 'Inject Disruption'}</span>
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
                      isAi
                        ? 'bg-slate-950 border border-slate-700 text-orange-400'
                        : 'bg-cyan-900 border border-cyan-700 text-cyan-200'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-2 max-w-2xl w-full">
                    <div
                      className={`rounded-2xl p-4 text-xs leading-relaxed ${
                        isAi
                          ? 'bg-slate-950 border border-slate-800 text-slate-200 font-sans shadow-md'
                          : 'bg-cyan-600 text-white font-medium font-sans shadow-md'
                      }`}
                    >
                      {isAi ? <RenderMarkdown content={msg.text} /> : <div>{msg.text}</div>}
                    </div>

                    {/* Interactive Action Chips */}
                    {msg.actionChips && msg.actionChips.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 pl-1">
                        {msg.actionChips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleActionExecute(chip)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white font-mono text-[11px] font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer hover:border-cyan-500"
                          >
                            <span>{chip.label}</span>
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-orange-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-cyan-400 font-mono flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Interrogating machine cell sensors, MRB registries, and vendor lead times...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Operations Directives Ribbon */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex space-x-2 text-[11px] font-mono">
              {promptSuggestions.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.query)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask Plant Supervisor: machine vibrations, friction-stir weld porosity, MIDHANI alloys, hotfire countdown..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-xs font-bold font-mono transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md shadow-orange-950"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Directive</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Real-Time SCADA Surveillance & Autonomous Log Feed (1 Col) */}
        <div className="space-y-4">
          {/* Quick-Action Operations Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-orange-400" />
                <span>Mission Director Directives</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                1-CLICK
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              <button
                onClick={() =>
                  handleActionExecute({
                    label: 'Spindle Calibration',
                    actionType: 'maintenance',
                    targetId: bottleneckMachine.id,
                  })
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-600 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-cyan-400 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Calibrate 5-Axis Spindle</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Resets axis jitter & thermal growth</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() =>
                  handleActionExecute({
                    label: 'MRB Clearance',
                    actionType: 'ncr_rework',
                    targetId: firstOpenNcr?.id,
                  })
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-600 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-amber-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Convene MRB Board ({openNcrs.length} NCRs)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Auto-dispositions rework queue</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400" />
              </button>

              <button
                onClick={() =>
                  handleActionExecute({
                    label: 'MIDHANI ToT Grant',
                    actionType: 'fund_vendor',
                    targetId: 'vp_midhani_inconel_01',
                    payload: 50000000,
                  })
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-orange-600 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-orange-400 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Disburse ₹5 Cr ToT Grant</span>
                  </div>
                  <div className="text-[10px] text-slate-500">MIDHANI VAR Inconel 718 ingot line</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400" />
              </button>

              <button
                onClick={() =>
                  handleActionExecute({
                    label: 'SCE-200 Hotfire',
                    actionType: 'hotfire',
                    targetId: firstRocket?.serialNumber,
                  })
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-600 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-emerald-400 flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mahendragiri Hotfire Ignition</span>
                  </div>
                  <div className="text-[10px] text-slate-500">120s acceptance burn on Stand C-1</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Autonomous Copilot Surveillance Telemetry Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Autonomous Supervisor Feed</span>
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                  autonomousMode
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {autonomousMode ? 'ENGAGED' : 'PAUSED'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-800">
              {autonomousLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-orange-400 font-bold">{log.system}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        log.status === 'mitigated'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : log.status === 'triaged'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-slate-300">{log.action}</p>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Tick #{log.tick}</span>
                    <span>{log.timeStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
