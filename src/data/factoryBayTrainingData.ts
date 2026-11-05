/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CADPartType } from '../components/cad/PartCADViewer.tsx';

export interface SOPStep {
  stepNumber: number;
  title: string;
  description: string;
  roleExplanation: string;
  keyCheck: string;
}

export interface FailureMode {
  mode: string;
  cause: string;
  action: string;
}

export interface KnowledgeQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FactoryBayTrainingProfile {
  id: string;
  bayTabKey: 'cnc_bay' | 'dmls_bay' | 'fsw_bay' | 'autoclave_bay' | 'cleanroom_bay' | 'ndt_lab' | 'hotfire_bay';
  title: string;
  cellCode: string;
  facility: string;
  componentName: string;
  cadPartType: CADPartType;
  drawingNumber: string;
  material: string;
  massKg: number;
  tolerance: string;
  surfaceFinish: string;
  whyThisMatters: string;
  materialScienceNote: string;
  sopSteps: SOPStep[];
  failureModes: FailureMode[];
  knowledgeQuiz: KnowledgeQuiz;
  essentialMetrics: {
    label: string;
    key: string;
    unit: string;
    nominalRange: string;
    description: string;
  }[];
}

export const FACTORY_BAY_PROFILES: Record<string, FactoryBayTrainingProfile> = {
  cnc_bay: {
    id: 'bay_cnc',
    bayTabKey: 'cnc_bay',
    title: '5-Axis Precision Gantry CNC Bay',
    cellCode: 'BAY-CNC-01',
    facility: 'Bengaluru Peenya Aerospace SEZ',
    componentName: 'Inconel 718 Turbopump Impeller Blisk',
    cadPartType: 'impeller_blisk',
    drawingNumber: 'ISRO-SCE200-IMP-042 Rev E',
    material: 'Inconel 718 (AMS 5662 Nickel-Chromium Superalloy)',
    massKg: 14.8,
    tolerance: '±0.005 mm (5 microns)',
    surfaceFinish: 'Ra 0.4 µm (Superfinished)',
    whyThisMatters:
      'The Turbopump Impeller feeds 400 kg/sec of cryogenic liquid oxygen (LOX) into the SCE-200 combustion chamber at 18,500 RPM. A 5-axis simultaneous gantry mill is mandatory because the twisted 3D aerodynamic vanes have undercut angles that standard 3-axis machines cannot physically reach. If blade profile deviates by >8 microns, aerodynamic stall induces severe cavitation, causing the turbopump to explode within 40 milliseconds.',
    materialScienceNote:
      'Inconel 718 contains 52% Nickel and 19% Chromium. It work-hardens immediately under tool friction. Therefore, 70-bar high-pressure coolant (HPC) directed right into the cutting shear zone is required to prevent rapid notch wear on the carbide cutter.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Raw Billet Inward Verification',
        description: 'Verify melt heat certificate and ultrasonic testing stamp from MIDHANI. Check hardness is within 36–40 HRC prior to machining.',
        roleExplanation: 'Ensures no subsurface ingot voids exist before committing 14 hours of high-value spindle runtime.',
        keyCheck: 'MIDHANI AS9100 Heat Lot Stamp present on billet end-face.',
      },
      {
        stepNumber: 2,
        title: 'Rotary Trunnion Chuck Zeroing',
        description: 'Seat raw forging in hydraulic rotary trunnion chuck. Run Renishaw optical touch probe on central datum hole to confirm runout < 0.002 mm.',
        roleExplanation: 'Establishes absolute Datum -A- and -B- coordinates in the Siemens 840D CNC controller.',
        keyCheck: 'Dial indicator TIR (Total Indicated Runout) < 2.0 microns.',
      },
      {
        stepNumber: 3,
        title: '5-Axis Adaptive Milling Cycle',
        description: 'Engage roughing at 1,200 mm/min feed rate with ball end mill; maintain 70 Bar flood coolant to clear abrasive chips.',
        roleExplanation: 'Roughs out the helical channels between the 12 impeller blades without inducing thermal stress.',
        keyCheck: 'Spindle load < 75%; vibration jitter < 1.2 µm.',
      },
      {
        stepNumber: 4,
        title: 'CMM & Dynamic Balancing Gate',
        description: 'Transfer part to Zeiss Prismo CMM for 12-blade aerodynamic profile inspection. Dynamic spin balancing at 2,000 RPM.',
        roleExplanation: 'Certifies blade profile contour and certifies dynamic unbalance < 0.2 g·mm before engine cleanroom transfer.',
        keyCheck: 'CMM inspection report signed off by QA Inspector.',
      },
    ],
    failureModes: [
      {
        mode: 'Spindle Axis Thermal Growth',
        cause: 'Continuous 18,500 RPM generates heat along Z-axis ball screw.',
        action: 'Engage refrigerated spindle chiller circuit; verify thermal drift < 1.0 µm.',
      },
      {
        mode: 'Tool Chatter & Resonant Harmonics',
        cause: 'Thin-walled impeller blades vibrating at natural frequency (2.4 kHz).',
        action: 'Reduce depth of cut by 25% and switch to variable-helix micro ball end mill.',
      },
    ],
    knowledgeQuiz: {
      question: 'Why must Inconel 718 turbopump impellers be machined with continuous 70-bar coolant rather than standard air blast?',
      options: [
        'To flush chips and prevent extreme thermal work-hardening that destroys cutting tools',
        'To make the part shiny for cosmetic photography',
        'Air blast is banned by ISRO due to aerodynamic drag on the factory floor',
      ],
      correctIndex: 0,
      explanation: 'Inconel 718 work-hardens instantly when friction raises temperature above 650°C. High-pressure coolant keeps the shear zone cool and flushes abrasive chips.',
    },
    essentialMetrics: [
      { label: 'Spindle RPM', key: 'spindleRpm', unit: 'RPM', nominalRange: '16,000 – 24,000', description: 'Rotational speed of precision ceramic bearing spindle' },
      { label: 'Feed Rate', key: 'feedRateMmMin', unit: 'mm/min', nominalRange: '800 – 1,500', description: 'Table linear velocity along cutting vector' },
      { label: 'Axis Jitter', key: 'axisJitterMicrons', unit: 'µm', nominalRange: '< 1.2 µm', description: 'Radial runout and servo encoder jitter' },
      { label: 'Tool Wear', key: 'toolingWearPct', unit: '%', nominalRange: '< 35%', description: 'Flank and crater wear on current carbide cutter' },
    ],
  },

  dmls_bay: {
    id: 'bay_dmls',
    bayTabKey: 'dmls_bay',
    title: 'Laser DMLS 3D Additive Manufacturing Bay',
    cellCode: 'BAY-DMLS-02',
    facility: 'Bengaluru Additive Propulsion Facility',
    componentName: 'Regenerative Thrust Chamber & Injector Head',
    cadPartType: 'thrust_chamber',
    drawingNumber: 'ISRO-CE20-CC-DMLS-108',
    material: 'GRCop-42 (Copper-Chromium-Niobium Alloy) / Inconel 718',
    massKg: 38.5,
    tolerance: '±0.020 mm layer resolution',
    surfaceFinish: 'Ra 3.2 µm (As-printed) / Ra 0.8 µm (Abrasive flowed)',
    whyThisMatters:
      'Rocket combustion chambers experience temperatures exceeding 3,200°C—hotter than the boiling point of iron. They survive only because sub-zero cryogenic fuel is pumped through dozens of microscopic internal cooling channels wrapped around the nozzle walls. Traditional CNC drilling cannot curve around a DeLaval nozzle; additive Laser Powder Bed Fusion (DMLS) prints these intricate 3D channels in one monolithic piece without weld joints.',
    materialScienceNote:
      'Dual 1000W fiber lasers melt metal powder in 40-micron layers under an inert Argon chamber (O2 < 10 ppm) to prevent oxidation. GRCop-42 retains high thermal conductivity while resisting hydrogen embrittlement.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Powder Sieve & Argon Purge',
        description: 'Verify GRCop-42 spherical powder distribution (15–45µm). Purge build chamber with 99.999% pure Argon until oxygen drops below 10 ppm.',
        roleExplanation: 'Eliminates moisture and oxygen that cause internal gas porosity and brittle inclusions.',
        keyCheck: 'Oxygen sensor display reads < 10 ppm; chamber dew point < -40°C.',
      },
      {
        stepNumber: 2,
        title: 'Substrate Build Plate Levelling',
        description: 'Level titanium substrate plate using dial indicator across 4 corners. Calibrate dual laser beam overlap alignment within 15 microns.',
        roleExplanation: 'Ensures uniform first-layer powder spreading and precise multi-laser stitching.',
        keyCheck: 'Recoater blade clearance gap verified with 40µm feeler gauge.',
      },
      {
        stepNumber: 3,
        title: 'Selective Laser Melting Cycle',
        description: 'Execute 3,200-layer print cycle over 48 hours. Monitor thermal melt pool photodiode emission for hot spots and laser beam focus.',
        roleExplanation: 'Layer-by-layer fusion of the complex internal coolant jacket geometry.',
        keyCheck: 'Melt pool thermal stability indicator steady green (no thermal flare).',
      },
      {
        stepNumber: 4,
        title: 'Depowdering & HIP Cycle',
        description: 'Depowder internal channels using acoustic vibration and vacuum extraction. Transfer to Hot Isostatic Pressing (HIP) at 1000 bar.',
        roleExplanation: 'Removes trapped un-sintered powder and closes microscopic micro-voids via high-pressure argon pressing.',
        keyCheck: '100% coolant channel light transmission and flow check verified.',
      },
    ],
    failureModes: [
      {
        mode: 'Recoater Blade Jamming',
        cause: 'Thermal warping of thin overhang walls catches recoater blade edge.',
        action: 'Pause cycle; inspect layer camera telemetry and re-adjust recoater travel gap.',
      },
      {
        mode: 'Gas Porosity Defect',
        cause: 'Oxygen or moisture contamination in recycled metal powder.',
        action: 'Bake powder in vacuum oven at 120°C; replace gas filter cartridge.',
      },
    ],
    knowledgeQuiz: {
      question: 'Why must the DMLS build chamber maintain an oxygen concentration below 10 ppm?',
      options: [
        'To prevent explosive oxidation and embrittlement of molten superalloy powder',
        'To allow the operator to look inside without safety goggles',
        'To reduce electrical power consumption of the lasers',
      ],
      correctIndex: 0,
      explanation: 'At laser melting temperatures (>1500°C), titanium and copper readily absorb oxygen, forming brittle oxides that cause catastrophic burst failure under rocket chamber pressure.',
    },
    essentialMetrics: [
      { label: 'Chamber O2', key: 'argonPurity', unit: 'ppm', nominalRange: '< 10 ppm', description: 'Oxygen contamination level in inert argon build atmosphere' },
      { label: 'Laser Power', key: 'laserPowerW', unit: 'W', nominalRange: '950 – 1000 W', description: 'Combined optical power of dual single-mode fiber lasers' },
      { label: 'Layer Height', key: 'layerHeightMicrons', unit: 'µm', nominalRange: '30 – 50 µm', description: 'Thickness of powder bed swept per layer cycle' },
      { label: 'Bed Temp', key: 'bedTempC', unit: '°C', nominalRange: '180 – 200 °C', description: 'Pre-heated substrate temperature to minimize residual stress' },
    ],
  },

  fsw_bay: {
    id: 'bay_fsw',
    bayTabKey: 'fsw_bay',
    title: 'Orbital Friction Stir Welding (FSW) Gantry',
    cellCode: 'BAY-FSW-03',
    facility: 'Hyderabad Aerospace Precision Complex',
    componentName: 'Al-Li 2195 Cryogenic Propellant Tank Dome & Ring',
    cadPartType: 'tank_dome_fsw',
    drawingNumber: 'ISRO-LVM3-C25-TANK-003',
    material: 'Aluminium-Lithium 2195 (Ultra-Lightweight Cryogenic Alloy)',
    massKg: 310.0,
    tolerance: 'Seam mismatch < 0.15 mm',
    surfaceFinish: 'Flush welded, 100% joint efficiency',
    whyThisMatters:
      'Rocket propellant tanks hold liquid hydrogen (-253°C) and liquid oxygen. Traditional fusion welding (TIG/MIG) melts the metal, creating dendritic pores and micro-fissures where brittle lithium phases precipitate. Friction Stir Welding (FSW) NEVER melts the metal; instead, a rotating tungsten pin generates frictional heat that plasticizes and forges the metal together in solid state, producing 100% leak-proof cryogenic joints.',
    materialScienceNote:
      'Al-Li 2195 contains 1% Lithium, reducing density by 4% while increasing stiffness by 30%. Because lithium vaporizes under electric arcs, solid-state FSW is the ONLY aerospace certified method to join these tank skins.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Joint Preparation & Edge Milling',
        description: 'Shave dome and barrel edges with planetary mill to square abutment. Degrease with solvent to remove aluminum oxide film.',
        roleExplanation: 'Eliminates root gaps and oxide entrapment that cause weld line kissing bonds.',
        keyCheck: 'Surface roughness Ra < 1.6 µm; gap clearance < 0.1 mm.',
      },
      {
        stepNumber: 2,
        title: 'Internal Mandrel Hydraulic Clamping',
        description: 'Expand hydraulic internal backing anvil with 50 kN pressure to support high downward forging loads during tool plunge.',
        roleExplanation: 'Prevents thin-gauge tank wall deflection under immense tool plunge forces.',
        keyCheck: 'Segmented mandrel pressure gauge reads 50 ± 2 kN.',
      },
      {
        stepNumber: 3,
        title: 'FSW Tool Plunge & Orbit Traverse',
        description: 'Plunge rotating pin tool at 450 RPM until shoulder contacts plate. Traverse orbital gantry at 180 mm/min along circumference.',
        roleExplanation: 'Frictional heating plasticizes aluminum, mechanically stirring the joint solid.',
        keyCheck: 'Spindle downward forge load maintained at 42 kN.',
      },
      {
        stepNumber: 4,
        title: 'Phased Array Ultrasonic NDT',
        description: 'Perform 100% ultrasonic phased array scan along the 12-meter circular weld seam for wormhole or tunnel voids.',
        roleExplanation: 'Verifies zero sub-surface defects before pressure proof testing.',
        keyCheck: 'Zero defects exceeding AS9100 Class-A acceptance limit.',
      },
    ],
    failureModes: [
      {
        mode: 'Wormhole / Tunnel Defect',
        cause: 'Insufficient downward forge pressure or travel speed too high.',
        action: 'Increase downward Z-axis forge force by 5 kN and reduce travel speed by 15%.',
      },
      {
        mode: 'Pin Tool Breakage',
        cause: 'Cold plunge before tool shoulder reaches plastic deformation temperature.',
        action: 'Apply pre-heat dwell of 4 seconds before initiating traverse feed.',
      },
    ],
    knowledgeQuiz: {
      question: 'What is the primary advantage of Friction Stir Welding over traditional fusion welding for rocket propellant tanks?',
      options: [
        'It keeps the alloy in solid state below melting point, eliminating porosity and hot cracking',
        'It uses cheaper consumable electrodes that melt quickly',
        'It does not require any clamping fixtures',
      ],
      correctIndex: 0,
      explanation: 'FSW operates as a solid-state forging process. Because the metal does not melt, shrinkage porosity, dendritic segregation, and thermal distortion are completely avoided.',
    },
    essentialMetrics: [
      { label: 'Forge Load', key: 'forgeRamKn', unit: 'kN', nominalRange: '40 – 48 kN', description: 'Downward axial force applied by tool shoulder to forge plasticized metal' },
      { label: 'Tool RPM', key: 'fswToolRpm', unit: 'RPM', nominalRange: '400 – 500 RPM', description: 'Rotational speed of tungsten alloy threaded stir pin' },
      { label: 'Traverse Speed', key: 'traverseSpeedMmMin', unit: 'mm/min', nominalRange: '150 – 220 mm/min', description: 'Orbital feed rate around propellant tank circumference' },
      { label: 'Clamp Pressure', key: 'mandrelClampBar', unit: 'Bar', nominalRange: '180 – 220 Bar', description: 'Hydraulic pressure holding internal support anvil segments' },
    ],
  },

  autoclave_bay: {
    id: 'bay_autoclave',
    bayTabKey: 'autoclave_bay',
    title: '8-Meter Composite Curing Autoclave Bay',
    cellCode: 'BAY-AUTO-04',
    facility: 'Nagpur Composite Aero-Structures Hub',
    componentName: 'Carbon-Carbon Dual Payload Fairing Half-Shell',
    cadPartType: 'composite_fairing',
    drawingNumber: 'ISRO-PLF-CFRP-800',
    material: 'T1000 Carbon Fiber Prepreg / Aluminum Honeycomb Core',
    massKg: 420.0,
    tolerance: 'Skin thickness ±0.05 mm',
    surfaceFinish: 'Aerodynamic Class-A Laminate',
    whyThisMatters:
      'The Payload Fairing protects sensitive satellites from aerodynamic buffet, acoustic shock, and supersonic friction during launch ascent through the atmosphere. It must be ultra-light yet withstand 150 kPa dynamic aerodynamic pressure. Pre-impregnated carbon fiber layers are laid over honeycomb cores and baked in a pressurized 8-bar nitrogen autoclave at 180°C to compact out every micro-void.',
    materialScienceNote:
      'High-modulus T1000 carbon fiber offers tensile strength of 7,000 MPa. Stacking plies in alternating 0°, +45°, -45°, and 90° orientations gives the fairing quasi-isotropic strength against aerodynamic bending and torsional flutter.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Laser Guided Ply Layup',
        description: 'Place prepreg carbon sheets following laser projection guide at 0°, +45°, -45°, and 90° orientation over invar tool.',
        roleExplanation: 'Ensures exact angular alignment of carbon fibers to carry flight loads.',
        keyCheck: 'Ply count and fiber angle verified by laser projection camera.',
      },
      {
        stepNumber: 2,
        title: 'Vacuum Bagging & Pressure Decay Test',
        description: 'Apply release film, breather cloth, and vacuum bag. Verify vacuum hold at -0.98 bar for 30 minutes without pressure decay.',
        roleExplanation: 'Confirms air-tight seal so nitrogen gas does not leak into the laminate.',
        keyCheck: 'Vacuum decay < 0.02 bar over 30 minutes.',
      },
      {
        stepNumber: 3,
        title: 'Autoclave Nitrogen Cure Profile',
        description: 'Ramp temperature at 2°C/min to 180°C under 7.5 bar nitrogen pressure; soak for 180 minutes under vacuum.',
        roleExplanation: 'Simultaneously cures epoxy resin and collapses micro-voids under hydrostatic pressure.',
        keyCheck: 'Thermocouple uniformity across 24 zones within ±2.5°C.',
      },
      {
        stepNumber: 4,
        title: 'Acoustic Tap & Ultrasonic C-Scan',
        description: 'Perform ultrasonic immersion C-scan across the 8-meter shell to detect skin-to-honeycomb debonds or dry spots.',
        roleExplanation: 'Ensures structural bond integrity before acoustic acoustic acoustic acoustic tile installation.',
        keyCheck: 'Zero debond areas exceeding 6 mm diameter.',
      },
    ],
    failureModes: [
      {
        mode: 'Vacuum Bag Puncture During Heat-up',
        cause: 'Sharp tooling edge or thermocouple wire punctures nylon membrane.',
        action: 'Immediate audible alarm; apply high-temp sealant tape patch before resin gelation.',
      },
      {
        mode: 'Exotherm Thermal Runaway',
        cause: 'Heating too fast on thick laminate sections creates uncontrolled resin exotherm.',
        action: 'Hold dwell temperature at 120°C for 45 minutes to let resin outgas safely.',
      },
    ],
    knowledgeQuiz: {
      question: 'Why are carbon fiber prepreg plies laid in alternating orientations (0°, 45°, 90°, -45°)?',
      options: [
        'To produce a quasi-isotropic laminate that withstands aerodynamic tension, shear, and torsion equally',
        'Because carbon fibers cannot be cut in the same direction',
        'To make the fairing translucent for solar panel charging',
      ],
      correctIndex: 0,
      explanation: 'Carbon fibers have immense strength along their length but almost none across their width. Stacking them in alternating orientations ensures the fairing resists bending, buckling, and aerodynamic twisting from any angle.',
    },
    essentialMetrics: [
      { label: 'Autoclave Temp', key: 'chamberTempC', unit: '°C', nominalRange: '175 – 185 °C', description: 'Thermal soaking setpoint to cure aerospace epoxy resin matrix' },
      { label: 'N2 Pressure', key: 'nitrogenPressureBar', unit: 'Bar', nominalRange: '7.0 – 8.0 Bar', description: 'Inert nitrogen pressure compacting plies and eliminating voids' },
      { label: 'Vacuum Level', key: 'bagVacuumBar', unit: 'Bar', nominalRange: '-0.95 to -0.99 Bar', description: 'Vacuum draw under bag extracting outgassed volatiles' },
      { label: 'Cure Time Left', key: 'cureMinutesRemaining', unit: 'min', nominalRange: '0 – 240 min', description: 'Remaining dwell time in curing cycle' },
    ],
  },

  cleanroom_bay: {
    id: 'bay_cleanroom',
    bayTabKey: 'cleanroom_bay',
    title: 'ISO Class 5 Avionics SMT Cleanroom',
    cellCode: 'BAY-CLEAN-05',
    facility: 'Hyderabad SCL Semiconductor Complex',
    componentName: 'Triple-Modular Redundant NavIC Guidance Computer',
    cadPartType: 'avionics_pcb',
    drawingNumber: 'ISRO-GNC-OBC-TMR-01',
    material: 'High-Tg Polyimide PCB with Electroless Nickel Immersion Gold (ENIG)',
    massKg: 3.2,
    tolerance: 'Component placement ±10 µm',
    surfaceFinish: 'NASA/ISRO Class 3 High-Reliability Solder',
    whyThisMatters:
      'The On-Board Computer (OBC) is the brain of the rocket. It calculates orbital trajectories, executes stage separations, and drives gimbal nozzles at 100 Hz. Spaceflight involves cosmic radiation and extreme launch vibrations up to 20 Gs. The cleanroom ensures zero dust particles (<3,520 particles/m³) short-circuit micro-pitch BGA packages.',
    materialScienceNote:
      'High-Tg polyimide resists board delamination during rocket vibration. Radiation-hardened microcontrollers utilize Triple Modular Redundancy (TMR) where 3 identical processors vote on every flight command, instantly outvoting any single-event upset caused by cosmic rays.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Cleanroom ESD & Gowning Protocol',
        description: 'Pass through high-velocity air shower. Wear cleanroom bunny suit, conductive boots, and continuous-monitoring ESD wrist straps.',
        roleExplanation: 'Eliminates dust shedding and prevents static discharges that destroy sub-micron MOSFETs.',
        keyCheck: 'ESD ground resistance display reads < 1.0 MΩ (Green).',
      },
      {
        stepNumber: 2,
        title: '3D Solder Paste Jet Printing',
        description: 'Deposit space-grade lead-free SAC305 solder paste. Verify 100% paste volume and height with 3D Solder Paste Inspection (SPI).',
        roleExplanation: 'Ensures reliable solder fillets that survive 20G launch vibration without cracking.',
        keyCheck: 'SPI paste volume between 90% and 110% of stencil aperture.',
      },
      {
        stepNumber: 3,
        title: 'Optical Pick & Place Placement',
        description: 'Mount micro-pitch 1152-pin rad-hard FPGA packages and passives using dual-gantry pick and place with sub-10µm vision alignment.',
        roleExplanation: 'Precisely locates tiny solder balls on corresponding PCB gold pads.',
        keyCheck: 'Vision system alignment confirmation offset < 8 microns.',
      },
      {
        stepNumber: 4,
        title: 'Vapor Phase Reflow & Parylene Coating',
        description: 'Execute inert vapor phase soldering. Apply molecular Parylene conformal coating to protect against condensation and tin whiskers.',
        roleExplanation: 'Uniform boiling-liquid condensation reflow prevents localized hot spots on delicate microchips.',
        keyCheck: 'Automated Optical Inspection (AOI) & X-ray solder void < 10%.',
      },
    ],
    failureModes: [
      {
        mode: 'BGA Solder Bridging / Head-in-Pillow',
        cause: 'Board warpage during reflow peak temperature.',
        action: 'Adjust vapor phase thermal ramp rate; inspect 100% via oblique X-ray imaging.',
      },
      {
        mode: 'Electrostatic Discharge (ESD) Latent Damage',
        cause: 'Operator handling board without grounded wrist strap.',
        action: 'Enforce continuous ESD alarm; quarantine affected board lot for micro-probing.',
      },
    ],
    knowledgeQuiz: {
      question: 'What is the purpose of applying a Parylene conformal coating to rocket flight computer PCBs?',
      options: [
        'To seal circuits against condensation, fungal growth, and metallic tin whisker short-circuits in vacuum',
        'To make the circuit board glow green in telemetry displays',
        'To increase the clock frequency of the processor',
      ],
      correctIndex: 0,
      explanation: 'In space vacuum, tin whiskers can grow from solder joints and cause catastrophic electrical shorts. Parylene forms a uniform molecular barrier that locks out moisture and prevents shorts.',
    },
    essentialMetrics: [
      { label: 'Particle Count', key: 'cleanroomClass5Particles', unit: '/m³', nominalRange: '< 3,520', description: 'Airborne particles ≥ 0.5µm in ISO Class 5 laminar airflow' },
      { label: 'Relative Humidity', key: 'cleanroomRhPct', unit: '%', nominalRange: '40 – 50%', description: 'Controlled humidity preventing electrostatic buildup and corrosion' },
      { label: 'Placement Accuracy', key: 'placementAccuracyMicrons', unit: 'µm', nominalRange: '< 10 µm', description: 'Optical alignment tolerance of robotic pick & place head' },
      { label: 'Reflow Peak', key: 'reflowPeakTempC', unit: '°C', nominalRange: '235 – 245 °C', description: 'Peak soldering temperature in inert vapor chamber' },
    ],
  },

  ndt_lab: {
    id: 'bay_ndt',
    bayTabKey: 'ndt_lab',
    title: 'High-Energy CT Scan & Metrology Lab',
    cellCode: 'BAY-NDT-06',
    facility: 'Bengaluru Quality Assurance & Metrology Lab',
    componentName: 'Internal Cryo Manifold & Turbopump Casing',
    cadPartType: 'ct_inspection',
    drawingNumber: 'ISRO-QA-NDT-450-XRAY',
    material: 'Titanium Ti-6Al-4V Cast & Machined Housing',
    massKg: 22.4,
    tolerance: 'Voxel resolution 12 microns',
    surfaceFinish: 'Defect detection threshold > 0.05 mm',
    whyThisMatters:
      'Rocket engines operate at 250 bar pressure. Even a microscopic 0.2mm gas pore hidden deep inside a titanium casing will propagate under cyclic cryogenic stress into a catastrophic fracture. High-energy 450 kV industrial Computed Tomography (CT) penetrates solid metal, generating a 3D volumetric model of the interior to catch sub-surface defects before flight.',
    materialScienceNote:
      'High-energy X-rays generated at 450 kV can penetrate up to 60 mm of solid titanium. Rotating the component 360 degrees allows mathematical filtered back-projection algorithms to reconstruct a 3D voxel density matrix of the part interior.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Radiation Shielding & Turntable Mounting',
        description: 'Fixture component on precision granite rotary turntable. Close and lock lead-lined 350mm safety interlocked doors.',
        roleExplanation: 'Ensures zero radiation leakage and vibration-free rotational scanning.',
        keyCheck: 'Radiation safety door interlocks engaged (Green safety beacon).',
      },
      {
        stepNumber: 2,
        title: 'X-Ray Beam Voltage Calibration',
        description: 'Set X-ray tube to 450 kV / 1.2 mA. Perform flat-field detector calibration to calibrate detector pixel sensitivities.',
        roleExplanation: 'Adjusts radiation intensity for optimum contrast through dense titanium alloy.',
        keyCheck: 'Signal-to-noise ratio (SNR) on flat-field calibration > 150:1.',
      },
      {
        stepNumber: 3,
        title: '360° Rotational Image Acquisition',
        description: 'Acquire 2,400 radiographic 2D projections as component rotates through 360 degrees in 0.15° increments.',
        roleExplanation: 'Captures full angular transmission data for volumetric reconstruction.',
        keyCheck: 'Zero dropped projection frames during rotation.',
      },
      {
        stepNumber: 4,
        title: '3D Voxel Reconstruction & AS9100 Defect Check',
        description: 'Reconstruct 3D volumetric model; algorithms flag any inclusions, voids, or wall thinning exceeding 0.05 mm.',
        roleExplanation: 'Provides 100% volumetric qualification for human-rated and orbital flight hardware.',
        keyCheck: 'Defect volume analysis confirms 0 defects in high-stress zones.',
      },
    ],
    failureModes: [
      {
        mode: 'Beam Hardening Artifacts',
        cause: 'Differential absorption through variable-thickness metal sections.',
        action: 'Apply copper physical pre-filter and iterative software beam hardening correction.',
      },
      {
        mode: 'Ring Artifacts in 3D Volume',
        cause: 'Uncalibrated dead pixel on flat-panel X-ray detector.',
        action: 'Run detector pixel gain map calibration; interpolate dead pixel channel.',
      },
    ],
    knowledgeQuiz: {
      question: 'Why is Computed Tomography (CT) preferred over standard 2D X-ray radiography for complex aerospace housings?',
      options: [
        'Because 3D CT reveals the exact depth, volume, and shape of internal defects without overlapping shadows',
        'Because CT scan machines do not need electricity',
        'Because 2D X-rays are not allowed in aerospace manufacturing',
      ],
      correctIndex: 0,
      explanation: 'In 2D X-ray, complex features overlap and obscure internal voids. 3D CT slices the part virtually in any direction, providing precise spatial coordinate measurements of every void or crack.',
    },
    essentialMetrics: [
      { label: 'Beam Energy', key: 'xrayVoltageKv', unit: 'kV', nominalRange: '400 – 450 kV', description: 'Accelerating voltage of high-energy tungsten reflection tube' },
      { label: 'Voxel Size', key: 'voxelResolutionMicrons', unit: 'µm', nominalRange: '10 – 20 µm', description: 'Spatial 3D resolution of volumetric tomographic reconstruction' },
      { label: 'Projections', key: 'scanProjectionsCount', unit: 'frames', nominalRange: '2,000 – 3,000', description: 'Number of individual angular 2D radiographs captured' },
      { label: 'Max Pore Found', key: 'maxDefectSizeMm', unit: 'mm', nominalRange: '< 0.08 mm', description: 'Largest internal pore or inclusion detected in sample volume' },
    ],
  },

  hotfire_bay: {
    id: 'bay_hotfire',
    bayTabKey: 'hotfire_bay',
    title: 'Semi-Cryogenic Engine Hotfire & Gimbal Stand',
    cellCode: 'BAY-TEST-07',
    facility: 'Mahendragiri ISRO Propulsion Complex (IPRC)',
    componentName: 'SCE-200 Semi-Cryo Engine Assembly & Gimbal',
    cadPartType: 'semi_cryo_engine',
    drawingNumber: 'ISRO-IPRC-SCE200-HOT-01',
    material: 'Semi-Cryogenic Staged Combustion (LOX + Isrosene / RP-1)',
    massKg: 2700.0,
    tolerance: 'Thrust vector alignment ±0.05 degrees',
    surfaceFinish: 'Hotfire Tested & Flight Certified',
    whyThisMatters:
      'At Mahendragiri Propulsion Complex (IPRC), flight engines undergo full-duration hotfire acceptance testing before being bolted to the rocket. The stand restrains 2,000 kN (200 tonnes) of thrust while dual electro-hydraulic actuators gimbal the engine ±8 degrees to prove thrust vector control (TVC). A 50,000 liter/min acoustic water deluge system dampens sound waves that would otherwise shatter the test stand.',
    materialScienceNote:
      'Liquid oxygen at -183°C flows through the regenerative cooling channels in the copper-alloy nozzle before combusting with highly refined Isrosene (kerosene) at 180 bar chamber pressure.',
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Stand Hold-Down Clamp Checkout',
        description: 'Torque 8 hydraulic hold-down bolts to 12,000 Nm. Calibrate 6-component piezoelectric thrust load cells.',
        roleExplanation: 'Ensures the test stand safely restrains 200 tonnes of rocket thrust without shifting.',
        keyCheck: 'Piezo load cell zero-calibration reading within 0.1% accuracy.',
      },
      {
        stepNumber: 2,
        title: 'Cryogenic Chilldown & Inert Gas Purge',
        description: 'Pre-chill LOX feed lines to -183°C. Purge turbopump bearings with gaseous helium to prevent ice crystallization.',
        roleExplanation: 'Thermal pre-conditioning prevents thermal shock when cryogenic oxygen enters at full flow.',
        keyCheck: 'Turbopump casing skin temperature sensor reads < -170°C.',
      },
      {
        stepNumber: 3,
        title: 'Ignition & Acoustic Water Deluge',
        description: 'Trigger hypergolic TEA-TEB cartridge; simultaneously engage 50,000 L/min acoustic water deluge under nozzle.',
        roleExplanation: 'Absorbs destructive acoustic energy (>190 dB) and cools the flame trench deflector.',
        keyCheck: 'Flame trench deluge water flow confirmed at > 50,000 L/min.',
      },
      {
        stepNumber: 4,
        title: 'Thrust Vector Gimbal Sweep Test',
        description: 'Command hydraulic actuators through ±6° figure-8 gimbal sweep at 100% rated thrust; verify pressure stability.',
        roleExplanation: 'Validates attitude control response and structural stiffness under full thrust loads.',
        keyCheck: 'Hydraulic actuator frequency response meets 5 Hz bandwidth specification.',
      },
    ],
    failureModes: [
      {
        mode: 'Combustion Instability (High-Frequency Screech)',
        cause: 'Acoustic resonance between feed line elasticity and combustion flame front.',
        action: 'Verify POGO accumulator helium charge pressure; adjust injector orifice restrictor.',
      },
      {
        mode: 'Turbopump Cavitation Vibration',
        cause: 'Inlet LOX pressure dropping below vapor pressure.',
        action: 'Increase LOX tank ullage pressurization by 0.5 bar immediately.',
      },
    ],
    knowledgeQuiz: {
      question: 'Why is a massive acoustic water deluge system activated during rocket engine hotfire testing?',
      options: [
        'To absorb destructive acoustic energy (decibels) that could reflect back and tear the rocket apart',
        'To make steam clouds for atmospheric cooling',
        'To wash the carbon soot off the test stand floor',
      ],
      correctIndex: 0,
      explanation: 'Rocket exhaust produces over 190 dB of acoustic noise—enough energy to physically rip sheet metal apart. Water deluge absorbs sound energy through droplet vaporization and acoustic inertia.',
    },
    essentialMetrics: [
      { label: 'Thrust Force', key: 'thrustKn', unit: 'kN', nominalRange: '1,900 – 2,050 kN', description: 'Axial force measured by 6-axis piezoelectric load cell cradle' },
      { label: 'Chamber Press', key: 'chamberPressureBar', unit: 'Bar', nominalRange: '175 – 185 Bar', description: 'Main combustion chamber static pressure' },
      { label: 'Gimbal Angle', key: 'gimbalSweepAngle', unit: 'deg', nominalRange: '-8.0° to +8.0°', description: 'Dual-axis electro-hydraulic thrust vector gimbal deflection' },
      { label: 'Deluge Flow', key: 'delugeFlowRateLMin', unit: 'L/min', nominalRange: '48,000 – 52,000', description: 'Sound suppression water deluge rate into launch flame trench' },
    ],
  },
};
