/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const p = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(p)) return p;
  }
  for (const arg of process.argv) {
    if (arg.startsWith('--port=')) {
      const p = parseInt(arg.split('=')[1], 10);
      if (!isNaN(p)) return p;
    }
  }
  if (process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }
  return 3000;
}

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  for (const arg of process.argv) {
    if (arg.startsWith('--host=')) {
      return arg.split('=')[1];
    }
  }
  return process.env.HOST || '0.0.0.0';
}

const port = getPort();
const host = getHost();

// Initialize Google GenAI client if key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// AI Plant Advisor Route
// -------------------------------------------------------------
// Helper: High-Intelligence Industrial Advisor Engine (Zero-Latency Aerospace Diagnostics)
function generateIntelligentAdvisory(simSnapshot: any, userQuery: string = '') {
  const kpis = simSnapshot?.kpis || {};
  const bottleneck = kpis.activeBottleneckStation || '5-Axis CNC Bay (Bengaluru)';
  const openNcrs = simSnapshot?.openNcrs ?? (kpis.openNCRCount || 0);
  const cashINR = kpis.cashBalanceINR || (kpis.cashBalance ? kpis.cashBalance * 85 : 14200000000);
  const indigenization = kpis.indigenizationRatioPct || 78;
  const rockets = simSnapshot?.rocketsInWip || [];
  const oee = kpis.overallEquipmentEffectiveness || 84.5;
  const q: string = (userQuery || '').toLowerCase().trim();

  let response = '';
  const actionDirectives: Array<{
    label: string;
    actionType: 'maintenance' | 'ncr_rework' | 'fund_vendor' | 'hotfire' | 'goto_tab';
    targetId?: string;
    tabTarget?: string;
    payload?: any;
    rationale?: string;
  }> = [];

  // Mode 1: Vendor Development, Sourcing & Indigenization
  if (q.includes('vendor') || q.includes('indigeniz') || q.includes('atmanirbhar') || q.includes('import') || q.includes('material') || q.includes('midhani') || q.includes('supplier')) {
    response = `### 🇮🇳 V-Aero Atmanirbhar Space Supply-Chain Directive
**Current Domestic Content:** ${indigenization}% (Target: ≥92% for IN-SPACe Heavy Launch Tier)

#### 1. Strategic Vendor Bottlenecks:
- **MIDHANI (Hyderabad)**: Vacuum Arc Remelted (VAR) Inconel 718 billets & Ti-6Al-4V ELI plates. Lead time is 420h.
- **MTAR Technologies (Hyderabad)**: Semi-cryogenic turbopump impellers & LOX/RP-1 pre-valves. Single-source exposure.
- **Godrej Aerospace (Mumbai)**: Regeneratively-cooled nozzle skirts & electro-pneumatic cryo valves.
- **SCL Chandigarh (Semi-Conductor Lab)**: 180nm CMOS rad-hard space-grade navigation ASICs. Qualification batch yield: 74%.

#### 2. Operations Directive:
1. Issue **Transfer of Technology (ToT)** grants to Indian MSMEs to eliminate foreign ITAR dependencies.
2. Maintain dual-sourcing for electro-pneumatic cryogenic helium valves.
3. Establish a 90-day buffer inventory of GRCop-42 copper powder for DMLS 3D printing.`;

    actionDirectives.push({
      label: '🇮🇳 Grant ₹5 Cr ToT Subsidy to MIDHANI',
      actionType: 'fund_vendor',
      targetId: 'vp_midhani_inconel_01',
      payload: 50000000,
      rationale: 'Fast-tracks vacuum arc remelt furnace qualification',
    });
    actionDirectives.push({
      label: '📋 Open Vendor Development Board',
      actionType: 'goto_tab',
      tabTarget: 'vendor_development',
    });
  }
  // Mode 2: Quality & Non-Conformance (NCR / MRB)
  else if (q.includes('quality') || q.includes('ncr') || q.includes('defect') || q.includes('mrb') || q.includes('inspection') || q.includes('as9100')) {
    response = `### 🛡️ Quality Assurance & MRB Engineering Disposition
**AS9100 Rev D Compliance Level:** Active | **Open Non-Conformance Reports (NCRs):** ${openNcrs}

#### 1. Shop-Floor Defect Root-Cause Assessment:
- **Weld Seams (FSW Gantry)**: Ultrasonic phased array metrology detected intermittent root-lack-of-penetration on aluminum-lithium 2195 tank barrels.
- **Additive Combustion Chambers (DMLS)**: Optical pyrometer recorded local laser spatter during layer 420. Micro-void risk: 1.2%.
- **Turbopump Blisks (5-Axis CNC)**: Surface finish roughness Ra measured 0.42µm (within 0.8µm limit). Nominal.

#### 2. Material Review Board (MRB) Directives:
1. **Immediate Disposition**: Convene MRB to clear rework on open NCRs with laser cladding or automated weld skim cut.
2. **First Pass Yield (FPY)**: Ensure FPY remains ≥94.5% to avoid vehicle stacking delays.
3. **Lot Traceability**: Sign off on ultrasonic NDT scan reports before releasing Stage 1 propellant tanks to Vehicle Assembly Building (VAB).`;

    if (openNcrs > 0) {
      actionDirectives.push({
        label: `⚖️ Convene MRB: Auto-Disposition Open NCRs`,
        actionType: 'ncr_rework',
        targetId: 'first_open',
        rationale: 'Queues open non-conformance lots for precision rework',
      });
    }
    actionDirectives.push({
      label: '🔬 Open Metrology Lab',
      actionType: 'goto_tab',
      tabTarget: 'quality_lab',
    });
  }
  // Mode 3: Machine Maintenance, Tooling & OEE
  else if (q.includes('machine') || q.includes('tool') || q.includes('maintenance') || q.includes('spindle') || q.includes('oee') || q.includes('bottleneck') || q.includes('jitter')) {
    response = `### ⚙️ Capital Machinery Health & OEE Optimization
**Plant OEE:** ${oee.toFixed(1)}% | **Critical Bottleneck Station:** ${bottleneck}

#### 1. Machine Cell Status & Degradation Telemetry:
- **Primary Bottleneck [${bottleneck}]**: High spindle load with tool wear approaching warning limits. Elevated thermal growth detected on Z-axis ball screw.
- **DMLS Dual-Laser Metal 3D Printer**: Recoater blade drag torque normal; chamber argon purity at 99.992% (O2 < 10 ppm).
- **FSW Friction Stir Welder**: Hydraulic forge ram load at 42 kN; tool pin wear at nominal 12%.

#### 2. Preventive Maintenance Action Plan:
1. **Tool Change Protocol**: Replace carbide ball-nose end mills before wear index exceeds 35% to prevent surface waviness on regenerative cooling channels.
2. **Vibration Analysis**: Re-balance high-speed 24,000 RPM spindle to maintain radial runout below 1.2 microns.
3. **Takt Re-balancing**: Route secondary deburring operations to auxiliary Bay 3 to de-constrain ${bottleneck}.`;

    actionDirectives.push({
      label: `🛠️ Calibrate Spindle & Reset Tool Wear`,
      actionType: 'maintenance',
      targetId: 'bottleneck',
      rationale: 'Resets axis jitter below 0.8µm and restores 100% feed rate',
    });
    actionDirectives.push({
      label: '🔍 View Factory Bay Telemetry',
      actionType: 'goto_tab',
      tabTarget: 'factory_bays',
    });
  }
  // Mode 4: Launch Readiness & Testing (Sriharikota / Mahendragiri)
  else if (q.includes('launch') || q.includes('test') || q.includes('sriharikota') || q.includes('mahendragiri') || q.includes('hotfire') || q.includes('static') || q.includes('rocket')) {
    const activeVehicles = rockets.map((r: any) => `${r.serial} (${r.progress}% assembled, ${r.reliability}% reliability)`).join(', ') || 'VA-SN-001 (Flight Ready)';
    response = `### 🚀 Sriharikota Launch Complex (SDSC-SHAR) & Static Fire Status
**Active Vehicles in Pipeline:** ${activeVehicles}
**IN-SPACe Mission Clearance:** Stage Gate 4 (Range Safety Sign-off Pending Final Hotfire)

#### 1. Mahendragiri Test Stand C-1 Telemetry:
- **SCE-200 Semi-Cryo Engine Acceptance**: LOX/RP-1 full-duration 120s hotfire scheduled. Chamber pressure nominal target: 110 bar.
- **Acoustic Water Deluge Suppression**: 150,000 L/min deluge pump manifold armed and pressurized at 12 bar.
- **Gimbal Actuation Sweep**: ±6.0° electro-hydraulic test passed with zero phase lag.

#### 2. Flight Readiness Review (FRR) Checklist:
1. Complete Stage 2 Vacuum Cryogenic C-25 engine cold-gas thruster roll-control test.
2. Confirm vehicle dry mass margin is within ±0.4% of IN-SPACe mission envelope.
3. Verify telemetry encryption key handshake with Ground Station TRAC-1.`;

    if (rockets.length > 0) {
      actionDirectives.push({
        label: `🔥 Trigger Acceptance Hotfire for ${rockets[0]?.serial || 'VA-SN-001'}`,
        actionType: 'hotfire',
        targetId: rockets[0]?.serial || 'VA-SN-001',
        rationale: 'Executes 120s hotfire test on Mahendragiri Test Stand C-1',
      });
    }
    actionDirectives.push({
      label: '🚀 Go to Sriharikota Pad Console',
      actionType: 'goto_tab',
      tabTarget: 'mahendragiri_launch',
    });
  }
  // General / Operational Synthesis
  else {
    response = `### 🏢 V-Aero Operations Directive & Plant Synthesis
**DEFCON Level:** DEFCON-5 (NOMINAL) | **Active Shift:** Shift A (Peenya/Adibatla) | **Working Capital:** ₹${(cashINR / 1e7).toFixed(1)} Cr

#### 1. Executive Telemetry Overview:
- **Shop-Floor Pacing**: Active constraint is **${bottleneck}**. Factory overall throughput is currently tracking at **${oee.toFixed(1)}% OEE**.
- **Quality & Airworthiness**: **${openNcrs} open NCRs** awaiting Material Review Board disposition under AS9100 Rev D.
- **Atmanirbhar Indigenization**: **${indigenization}% domestic content**. Local supply chains (MIDHANI, MTAR, Godrej Aerospace, L&T) are handling major assemblies.
- **Vehicle Pipeline**: ${rockets.length} active launchers undergoing staging and pre-flight qualification.

#### 2. High-Priority Directives:
1. **De-bottleneck ${bottleneck}**: Dispatch maintenance team to apply spindle offset compensation and re-balance carbide tooling.
2. **Clear Quality Gates**: Convene MRB to disposition open non-conformance lots to unlock Stage 1 tank stacking.
3. **Supply-Chain Assurance**: Accelerate vendor technology transfer grants to preserve component buffer levels.`;

    actionDirectives.push({
      label: `🛠️ Calibrate ${bottleneck.split(' ')[0]} Spindle`,
      actionType: 'maintenance',
      targetId: 'bottleneck',
    });
    if (openNcrs > 0) {
      actionDirectives.push({
        label: `⚖️ MRB: Rework Open NCRs (${openNcrs})`,
        actionType: 'ncr_rework',
        targetId: 'first_open',
      });
    }
    actionDirectives.push({
      label: '🇮🇳 Grant ₹5 Cr ToT to MIDHANI',
      actionType: 'fund_vendor',
      targetId: 'vp_midhani_inconel_01',
      payload: 50000000,
    });
    actionDirectives.push({
      label: '📊 Open Takt Board',
      actionType: 'goto_tab',
      tabTarget: 'shop_floor_takt',
    });
  }

  return { response, actionDirectives };
}

// -------------------------------------------------------------
// AI Plant Advisor Route
// -------------------------------------------------------------
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { simSnapshot, userQuery } = req.body;

    // Fast-fallback generator ready immediately
    const fallback = generateIntelligentAdvisory(simSnapshot, userQuery);

    if (!aiClient) {
      return res.json(fallback);
    }

    const systemPrompt = `You are the V-Aero Lead Aerospace Industrial Operations Director for India's premier commercial rocket manufacturing plant.
You have 25+ years experience managing advanced rocket factories with ISRO, IN-SPACe, AS9100, and Indian defense PSU suppliers (MIDHANI, Godrej, MTAR, HAL, L&T Precision).
You are an expert on shop-floor operations: 5-axis CNC machining in Bengaluru, Friction-Stir Welding in Hyderabad, Mahendragiri cryogenic test stands, Sriharikota launch pad integration, and vendor development for specialized materials that cannot be produced in-house.
Always format currency in Indian Rupees (₹ Crores / ₹ Lakhs).
Analyze the provided compact JSON snapshot of the simulation state and answer the user's question with precise, actionable shop-floor and vendor development advice.
Keep answers concise, direct, professional, and formatted in clean markdown bullet points.`;

    const contentPrompt = `Current V-Aero Telemetry Snapshot:
${JSON.stringify(simSnapshot, null, 2)}

User Question:
${userQuery || 'Analyze our plant throughput, bottlenecks, and recommend top 3 immediate optimizations.'}`;

    // Race remote API with a 2.5 second timeout so it NEVER hangs
    try {
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('AI inference timeout')), 2500)
      );

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text) {
        return res.json({
          response: response.text,
          actionDirectives: fallback.actionDirectives,
        });
      }
    } catch {
      return res.json(fallback);
    }

    return res.json(fallback);
  } catch (error: any) {
    console.error('Gemini Advisor Error:', error);
    res.status(500).json({
      error: 'Failed to generate advisor response',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// AI Event & Disruption Generator Route
// -------------------------------------------------------------
app.post('/api/gemini/event-generator', async (req, res) => {
  try {
    const { simSnapshot, context } = req.body;

    const fallbackDisruptions = [
      {
        title: 'MIDHANI VAR Inconel 718 Vacuum Ingot Delay',
        description: 'Mishra Dhatu Nigam (MIDHANI) reported vacuum arc remelting crucible re-lining maintenance, delaying space-grade Inconel billets by 72 hours.',
        category: 'supply_chain',
        severity: 'warning',
        costImpact: 14000000,
        delayHours: 72,
      },
      {
        title: 'FSW Gantry Plunge Pin Runout Anomaly',
        description: 'Laser metrology detected 45µm runout on the Hyderabad Friction Stir Welder during LOX tank barrel seam welding.',
        category: 'manufacturing',
        severity: 'error',
        costImpact: 9500000,
        delayHours: 48,
      },
      {
        title: 'Semi-Cryo Turbopump Cavitation Drift at Mahendragiri',
        description: 'During SCE-200 engine pre-chill, LOX inducer pressure transducer registered 2.8-sigma cavitation vibration harmonics.',
        category: 'testing',
        severity: 'critical',
        costImpact: 28000000,
        delayHours: 120,
      },
      {
        title: 'High-Purity Argon Grid Pressure Drop',
        description: 'Peenya industrial gas line pressure dropped to 3.2 bar, momentarily suspending dual-laser DMLS 3D printing of injector domes.',
        category: 'manufacturing',
        severity: 'warning',
        costImpact: 4500000,
        delayHours: 24,
      },
      {
        title: 'IN-SPACe Range Sensor Recalibration Notice',
        description: 'Sriharikota Radar Tracking Station requires telemetry transponder Doppler frequency validation prior to static hotfire approval.',
        category: 'testing',
        severity: 'info',
        costImpact: 2000000,
        delayHours: 16,
      },
    ];

    const randomEvt = fallbackDisruptions[Math.floor(Math.random() * fallbackDisruptions.length)];

    if (!aiClient) {
      return res.json({ disruption: randomEvt });
    }

    try {
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Event generator timeout')), 2200)
      );

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Current Plant Snapshot: ${JSON.stringify(simSnapshot)}. Context request: ${context || 'Unexpected supply chain or engineering bottleneck'}`,
        config: {
          systemInstruction: `You are the V-Aero Simulation Scenario Injector for Indian Rocket Manufacturing. Generate strict JSON: {"title": string, "description": string, "category": string, "severity": "warning"|"error"|"critical", "costImpact": number, "delayHours": number}`,
          responseMimeType: 'application/json',
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ disruption: parsed });
      }
    } catch {
      return res.json({ disruption: randomEvt });
    }

    return res.json({ disruption: randomEvt });
  } catch (error: any) {
    console.error('Gemini Event Generator Error:', error);
    res.status(500).json({
      error: 'Failed to generate disruption event',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// Vite Server Integration (Middleware in Dev, Static in Prod)
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: Number(port), host },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const server = app.listen(Number(port), host, () => {
    console.log(`🚀 AeroForge Industry Simulator running on http://${host}:${port}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer();
