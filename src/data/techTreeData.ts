/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TechNode, RocketDesign } from '../types/index.ts';

export const TECH_TREE_NODES: TechNode[] = [
  // ==========================================
  // TIER 1: Heritage Materials & Solid Propulsion
  // ==========================================
  {
    id: 'tech_maraging_steel',
    title: 'MDN-250 Maraging Steel Metallurgy',
    tagline: 'High-nickel vacuum induction melted steel for monolithic solid booster casings.',
    tier: 1,
    category: 'structures',
    costRP: 400,
    costINR: 150000000, // ₹15 Cr
    researchTimeTicks: 48,
    prerequisites: [],
    bonuses: {
      description: 'Solid rocket motor casing pressure rating increased by 15%; scrap rate reduced by 25%.',
      launchSuccessBonus: 0.02,
      machineCycleTimeMultiplier: 0.95,
    },
    specs: [
      { label: 'Tensile Strength', value: '1,750 MPa' },
      { label: 'Yield Strength', value: '1,680 MPa' },
      { label: 'Alloy Composition', value: '18% Ni, 8% Co, 5% Mo, 0.4% Ti' },
      { label: 'ISRO Heritage', value: 'PSLV PS1 / GSLV S139 Booster Casings' },
    ],
    lore: 'Developed with MIDHANI (Mishra Dhatu Nigam Ltd), MDN-250 eliminated India’s reliance on foreign maraging steel imports for large-diameter solid rocket motor segments.',
    iconName: 'Shield',
  },
  {
    id: 'tech_vikas_heritage',
    title: 'Vikas Gas-Generator Liquid Engine',
    tagline: 'Hypergolic N2O4/UDMH storable liquid propellant engine for second stages.',
    tier: 1,
    category: 'propulsion',
    costRP: 500,
    costINR: 200000000, // ₹20 Cr
    researchTimeTicks: 60,
    prerequisites: [],
    bonuses: {
      description: 'Stage 2 reliability boosted to 99.4%; engine hotfire qualification time reduced by 20%.',
      launchSuccessBonus: 0.03,
    },
    specs: [
      { label: 'Sea Level Thrust', value: '800 kN' },
      { label: 'Vacuum Isp', value: '304.5 s' },
      { label: 'Chamber Pressure', value: '58.5 bar' },
      { label: 'Propellants', value: 'UDMH + Nitrogen Tetroxide (N2O4)' },
    ],
    lore: 'Named after Vikram Ambalal Sarabhai, the Vikas engine has powered PSLV, GSLV, and LVM3 core stages over dozens of missions with 100% operational success record.',
    iconName: 'Flame',
  },

  // ==========================================
  // TIER 2: Semi-Cryogenic & Precision Isogrid
  // ==========================================
  {
    id: 'tech_al_li_isogrid',
    title: '5-Axis CNC Al-Li 2195 Isogrid Milling',
    tagline: 'Ultra-lightweight waffle-grid tank barrel skin milling for cryogenic stages.',
    tier: 2,
    category: 'manufacturing',
    costRP: 900,
    costINR: 450000000, // ₹45 Cr
    researchTimeTicks: 96,
    prerequisites: ['tech_maraging_steel'],
    bonuses: {
      description: 'Tank structural weight reduced by 14%; eliminates need for internal ring stiffeners.',
      dryMassMultiplier: 0.88,
      machineCycleTimeMultiplier: 0.9,
    },
    specs: [
      { label: 'Alloy', value: 'Al-Li 2195-T8' },
      { label: 'Pocket Thickness', value: '1.25 mm ± 0.05 mm' },
      { label: 'Skin Mass Saving', value: '28% vs Standard 2219' },
      { label: 'Bay Equipment', value: 'DMG MORI 5-Axis Gantry Mill' },
    ],
    lore: 'Isogrid structural architecture uses triangular internal ribs machined directly out of thick rolled plates, creating a monocoque skin with exceptional buckling resistance against flight aeroloads.',
    iconName: 'Grid',
  },
  {
    id: 'tech_semi_cryo_sce200',
    title: 'SCE-200 Staged Combustion Kerolox Booster',
    tagline: 'Oxidizer-rich staged combustion engine producing 2,000 kN sea-level thrust.',
    tier: 2,
    category: 'propulsion',
    costRP: 1200,
    costINR: 650000000, // ₹65 Cr
    researchTimeTicks: 120,
    prerequisites: ['tech_vikas_heritage'],
    bonuses: {
      description: 'Replaces toxic hypergols with eco-friendly RP-1/LOX; payload to LEO increased by 40%.',
      payloadMultiplier: 1.4,
      launchSuccessBonus: 0.04,
    },
    specs: [
      { label: 'Sea Level Thrust', value: '2,000 kN (~200 tonnes)' },
      { label: 'Vacuum Isp', value: '335 s' },
      { label: 'Chamber Pressure', value: '180 bar' },
      { label: 'Cycle', value: 'Oxidizer-Rich Staged Combustion' },
    ],
    lore: 'The SCE-200 represents India’s leap into high-pressure staged combustion, enabling heavy-lift architectures like the Next-Generation Launch Vehicle (NGLV).',
    iconName: 'Zap',
  },

  // ==========================================
  // TIER 3: Cryogenic Upper Stages & Monolithic Additive
  // ==========================================
  {
    id: 'tech_cryo_c25',
    title: 'CE-20 High-Thrust Cryogenic Upper Stage',
    tagline: 'Liquid Hydrogen and Liquid Oxygen (Hydrolox) upper stage with 443s vacuum Isp.',
    tier: 3,
    category: 'propulsion',
    costRP: 2000,
    costINR: 900000000, // ₹90 Cr
    researchTimeTicks: 160,
    prerequisites: ['tech_semi_cryo_sce200'],
    bonuses: {
      description: 'Delivers payloads to geostationary transfer orbit (GTO) and lunar trajectories with top-tier specific impulse.',
      payloadMultiplier: 1.25,
      launchSuccessBonus: 0.05,
    },
    specs: [
      { label: 'Vacuum Thrust', value: '200 kN' },
      { label: 'Vacuum Specific Impulse', value: '443.5 s' },
      { label: 'Turbopump RPM', value: '39,000 RPM (LH2 pump)' },
      { label: 'Chamber Cooling', value: 'Milled copper channels with Nickel electroform jacket' },
    ],
    lore: 'High-energy Hydrolox engines operate at -253°C liquid hydrogen temperatures, demanding advanced cryo seals, vacuum insulation, and multi-restart ignition systems.',
    iconName: 'Compass',
  },
  {
    id: 'tech_grcop42_additive',
    title: 'Monolithic GRCop-42 DMLS Additive Chambers',
    tagline: '3D printed copper-chromium-niobium regenerative thrust chambers with integrated cooling channels.',
    tier: 3,
    category: 'manufacturing',
    costRP: 2200,
    costINR: 800000000, // ₹80 Cr
    researchTimeTicks: 140,
    prerequisites: ['tech_al_li_isogrid'],
    bonuses: {
      description: 'Eliminates 120 brazed joints; prints complete regeneratively cooled combustion chambers in 72 hours.',
      machineCycleTimeMultiplier: 0.75,
      launchSuccessBonus: 0.04,
    },
    specs: [
      { label: 'Material', value: 'GRCop-42 (Cu-4at% Cr-2at% Nb)' },
      { label: 'Thermal Conductivity', value: '340 W/m·K at 600K' },
      { label: 'Layer Thickness', value: '40 microns' },
      { label: 'Part Count Reduction', value: '92% reduction vs fabricated' },
    ],
    lore: 'Direct Metal Laser Sintering of GRCop-42 allows conformal cooling channels with complex internal cross-sections that cannot be produced by conventional CNC machining or brazing.',
    iconName: 'Cpu',
  },

  // ==========================================
  // TIER 4: Methane-LOX (Methalox) Reusable Engines
  // ==========================================
  {
    id: 'tech_methalox_ffsc',
    title: 'Methane-LOX (Methalox) Reusable Engine',
    tagline: 'Full-Flow Staged Combustion Cycle (FFSC) engine with clean-burning liquid methane for 50+ reuses.',
    tier: 4,
    category: 'propulsion',
    costRP: 3800,
    costINR: 1500000000, // ₹150 Cr
    researchTimeTicks: 240,
    prerequisites: ['tech_semi_cryo_sce200', 'tech_grcop42_additive'],
    unlockedRocketDesignIds: ['rocket_methalox_reusable'],
    bonuses: {
      description: 'Zero soot / coking enables 24-hour turnaround; throttling from 40% to 100% for pinpoint propulsive landing; refurbishment cost slashed by 70%.',
      refurbCostMultiplier: 0.3,
      payloadMultiplier: 1.35,
      launchSuccessBonus: 0.06,
    },
    specs: [
      { label: 'Sea Level Thrust', value: '2,450 kN (~250 tonnes)' },
      { label: 'Vacuum Specific Impulse', value: '382 s' },
      { label: 'Chamber Pressure', value: '300 bar' },
      { label: 'Propellants', value: 'Subcooled Liquid Methane (CH4) & LOX' },
      { label: 'Reusability Target', value: '50 Flights without overhaul' },
      { label: 'Throttling Range', value: '40% - 100% continuously' },
    ],
    lore: 'Methalox Full-Flow Staged Combustion uses twin preburners (fuel-rich and oxygen-rich) so both propellants enter the main chamber completely gaseous, preventing injector erosion and yielding unprecedented thermodynamic efficiency.',
    iconName: 'Flame',
  },
  {
    id: 'tech_reusable_booster_avionics',
    title: 'Autonomous Boostback & Entry Burn Guidance',
    tagline: 'Hypersonic trajectory optimization algorithms with cold-gas RCS thrusters and radar altimetry.',
    tier: 4,
    category: 'avionics',
    costRP: 3200,
    costINR: 1200000000, // ₹120 Cr
    researchTimeTicks: 200,
    prerequisites: ['tech_al_li_isogrid'],
    bonuses: {
      description: 'Enables guided boostback burn, supersonic entry deceleration, and atmospheric angle-of-attack management.',
      launchSuccessBonus: 0.05,
    },
    specs: [
      { label: 'IMU Architecture', value: 'Tri-redundant Ring Laser Gyro (RLG) + NavIC RTK' },
      { label: 'Control Loop Rate', value: '250 Hz real-time flight computer' },
      { label: 'RCS Reaction Thrusters', value: 'High-pressure cold nitrogen / gaseous oxygen thrusters' },
      { label: 'Target Landing Error', value: '< 10 meters CEP' },
    ],
    lore: 'Combines convex optimization guidance (G-FOLD) with real-time terrain relative navigation to fly the booster backwards through hypersonic atmospheric entry.',
    iconName: 'Navigation',
  },

  // ==========================================
  // TIER 5: Carbon-Fiber Composite Cryotanks (CFRP)
  // ==========================================
  {
    id: 'tech_cfrp_cryotanks',
    title: 'Carbon-Fiber Composite Cryotanks (CFRP)',
    tagline: 'Linerless automated fiber placement (AFP) carbon-composite tanks with cryogenic barrier resins.',
    tier: 5,
    category: 'structures',
    costRP: 5500,
    costINR: 2400000000, // ₹240 Cr
    researchTimeTicks: 300,
    prerequisites: ['tech_methalox_ffsc', 'tech_al_li_isogrid'],
    unlockedRocketDesignIds: ['rocket_cfrp_deepspace'],
    bonuses: {
      description: 'Reduces tank dry mass by 35% compared to aluminum-lithium alloys; increases payload fraction to LEO to unprecedented 4.5%.',
      dryMassMultiplier: 0.65,
      payloadMultiplier: 1.45,
    },
    specs: [
      { label: 'Material', value: 'Intermediate Modulus Carbon Fiber (IM7/T1000) + Toughened Epoxy' },
      { label: 'Manufacturing Method', value: 'Linerless Robotic Automated Fiber Placement (AFP)' },
      { label: 'Cryo Compatibility', value: 'Liquid Methane (-161°C) & Liquid Oxygen (-183°C)' },
      { label: 'Microcrack Permeation', value: '< 10^-8 mbar·L/s·m²' },
      { label: 'Dry Weight Reduction', value: '35% less than Al-Li tanks' },
    ],
    lore: 'Cryogenic carbon-composite tanks solve the classic micro-cracking and LOX-reactivity barriers through nano-particle enriched resins and automated laser consolidation, delivering enormous payload mass gains.',
    iconName: 'Layers',
  },
  {
    id: 'tech_hypersonic_grid_fins',
    title: 'Titanium Additive Hypersonic Grid Fins',
    tagline: 'Foldable aerogrid fins providing 3-axis aerodynamic steering at Mach 6 through subsonic landing.',
    tier: 5,
    category: 'reusability',
    costRP: 4800,
    costINR: 1800000000, // ₹180 Cr
    researchTimeTicks: 260,
    prerequisites: ['tech_reusable_booster_avionics'],
    bonuses: {
      description: 'Maintains aerodynamic pitch and roll authority through high heating during atmospheric reentry without burning up.',
      launchSuccessBonus: 0.06,
    },
    specs: [
      { label: 'Material', value: 'Electron Beam Melted Ti-6Al-4V Cast Titanium' },
      { label: 'Aerodynamic Lift/Drag', value: 'Optimized for transonic and supersonic flow (Mach 0.8 - 6.0)' },
      { label: 'Actuation Mechanism', value: 'High-pressure closed hydraulic circuit (350 bar)' },
      { label: 'Thermal Resistance', value: 'Withstands up to 1,200°C shockwave stagnation heating' },
    ],
    lore: 'Grid fins behave as multi-planar lattice wings. Unlike conventional planar fins, their center of pressure does not shift with angle-of-attack, making them extraordinarily stable for precision booster landing.',
    iconName: 'Boxes',
  },

  // ==========================================
  // TIER 6: Aerospike Nozzles & Autonomous Drone Ship Sea Recovery
  // ==========================================
  {
    id: 'tech_aerospike_nozzle',
    title: 'Altitude-Compensating Aerospike Nozzles',
    tagline: 'Toroidal aerospike engine eliminating atmospheric overexpansion losses for SSTO architectures.',
    tier: 6,
    category: 'propulsion',
    costRP: 8500,
    costINR: 3800000000, // ₹380 Cr
    researchTimeTicks: 400,
    prerequisites: ['tech_cfrp_cryotanks', 'tech_grcop42_additive'],
    unlockedRocketDesignIds: ['rocket_aerospike_ssto'],
    bonuses: {
      description: 'Continuous ideal aerodynamic expansion from sea level to vacuum; sea-level payload efficiency improved by 18%; enables Single-Stage-To-Orbit (SSTO).',
      payloadMultiplier: 1.55,
      launchSuccessBonus: 0.07,
    },
    specs: [
      { label: 'Nozzle Type', value: 'Toroidal Aerospike with Centerbody Base Bleed' },
      { label: 'Sea-Level Isp', value: '345 s (vs 305s bell nozzle)' },
      { label: 'Vacuum Isp', value: '388 s' },
      { label: 'Expansion Ratio', value: 'Altitude-compensating (Effective 15:1 to 300:1)' },
      { label: 'Chamber Cooling', value: 'Regenerative liquid methane circulation through center spike' },
    ],
    lore: 'In an aerospike engine, the exhaust plume flows along the outside of a truncated central spike, with ambient air pressure confining the other side. This creates an aerodynamic virtual wall that automatically optimizes the expansion ratio at all altitudes.',
    iconName: 'Target',
  },
  {
    id: 'tech_autonomous_droneship',
    title: 'Autonomous Drone Ship Sea Recovery (ASDS)',
    tagline: 'Ocean-going autonomous platform with dynamic positioning thrusters (DP-2) and robotic octagrabber.',
    tier: 6,
    category: 'reusability',
    costRP: 9000,
    costINR: 4200000000, // ₹420 Cr
    researchTimeTicks: 420,
    prerequisites: ['tech_hypersonic_grid_fins', 'tech_reusable_booster_avionics'],
    bonuses: {
      description: 'Enables downrange ocean recovery for high-energy missions; saves 15% booster propellant otherwise needed for boostback to launch site.',
      refurbCostMultiplier: 0.2,
      launchSuccessBonus: 0.08,
      payloadMultiplier: 1.3,
    },
    specs: [
      { label: 'Vessel Designation', value: 'ASDS "INS Samudra-Setu"' },
      { label: 'Dynamic Positioning', value: 'DP-2 with four 360° azimuth thrusters' },
      { label: 'Station-Keeping Precision', value: '< 1.5 meters in sea state 5' },
      { label: 'Landing Deck Surface', value: 'Blast-deflecting blast steel with water deluge fire suppression' },
      { label: 'Securing Robot', value: 'Automated track-guided Octagrabber with hydraulic hold-down clamps' },
    ],
    lore: 'Landing on an autonomous barge at sea eliminates the fuel penalty of returning to launch site (RTLS), allowing heavy payloads to GTO and interplanetary space while still recovering the first-stage rocket intact.',
    iconName: 'Anchor',
  },
];

// ==========================================
// NEW UNLOCKED NEXT-GEN ROCKET DESIGNS
// ==========================================
export const UNLOCKED_NEXTGEN_ROCKETS: Record<string, RocketDesign> = {
  rocket_methalox_reusable: {
    id: 'rocket_methalox_reusable',
    name: 'V-Aero Surya-Methalox (Full-Flow Reusable)',
    tagline: 'Next-generation reusable two-stage heavy lifter with 9x Methane-LOX FFSC engines and autonomous sea drone-ship recovery.',
    payloadCapacityLeoKg: 18500,
    stagesCount: 2,
    propellantType: 'Methane-LOX (Methalox)',
    targetLaunchPriceINR: 1650000000, // ₹165 Cr (~$19.5M - ultra-low cost due to reusability!)
    targetLaunchPriceUSD: 19500000,
    dryMassKg: 21000,
    propellantMassKg: 520000,
    bomRoot: {
      id: 'bom_surya_root',
      partNumber: 'VA-SURYA-VEHICLE-003',
      name: 'V-Aero Surya-Methalox Reusable Vehicle',
      stage: 'stage6_integration',
      subsystem: 'launch_interface',
      quantity: 1,
      unit: 'vehicle',
      unitWeightKg: 21000,
      setupTimeHours: 10,
      cycleTimeHours: 32,
      baseYieldRate: 0.998,
      scrapRate: 0.002,
      requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
      inspectionType: 'hotfire',
      defectSeverityRisk: 0.95,
      makeOrBuy: 'make_inhouse',
      children: [
        {
          id: 'bom_surya_booster',
          partNumber: 'VA-SURYA-STG1-METHALOX',
          name: 'Stage 1 Reusable Methalox Booster (9x FFSC Engines)',
          stage: 'stage4_subsystems',
          subsystem: 'first_stage',
          quantity: 1,
          unit: 'stage',
          unitWeightKg: 15400,
          setupTimeHours: 8,
          cycleTimeHours: 40,
          baseYieldRate: 0.99,
          scrapRate: 0.01,
          requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
          inspectionType: 'hotfire',
          defectSeverityRisk: 0.95,
          makeOrBuy: 'make_inhouse',
        },
        {
          id: 'bom_surya_upper',
          partNumber: 'VA-SURYA-STG2-VACUUM',
          name: 'Stage 2 Vacuum Methalox Upper Stage (1x Vacuum FFSC Engine)',
          stage: 'stage4_subsystems',
          subsystem: 'second_stage',
          quantity: 1,
          unit: 'stage',
          unitWeightKg: 4200,
          setupTimeHours: 6,
          cycleTimeHours: 28,
          baseYieldRate: 0.992,
          scrapRate: 0.008,
          requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
          inspectionType: 'pressure_leak',
          defectSeverityRisk: 0.94,
          makeOrBuy: 'make_inhouse',
        },
        {
          id: 'bom_surya_fairing',
          partNumber: 'VA-SURYA-FAR-520',
          name: '5.2m Reusable Carbon-Epoxy Fairing with Cold-Gas RCS',
          stage: 'stage4_subsystems',
          subsystem: 'structures',
          quantity: 2,
          unit: 'half',
          unitWeightKg: 700,
          setupTimeHours: 4,
          cycleTimeHours: 22,
          baseYieldRate: 0.985,
          scrapRate: 0.015,
          requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
          inspectionType: 'ultrasonic',
          defectSeverityRisk: 0.9,
          makeOrBuy: 'make_inhouse',
        },
      ],
    },
  },

  rocket_cfrp_deepspace: {
    id: 'rocket_cfrp_deepspace',
    name: 'V-Aero Brahmand-CFRP (Linerless Cryotank Heavy)',
    tagline: 'Super heavy-lift launcher featuring automated fiber-placed carbon-composite tanks and 35% dry mass reduction for deep space missions.',
    payloadCapacityLeoKg: 28000,
    stagesCount: 2,
    propellantType: 'CFRP Methane-LOX Deep Space',
    targetLaunchPriceINR: 2400000000, // ₹240 Cr
    targetLaunchPriceUSD: 28500000,
    dryMassKg: 17500,
    propellantMassKg: 680000,
    bomRoot: {
      id: 'bom_brahmand_root',
      partNumber: 'VA-BRAHMAND-VEHICLE-004',
      name: 'V-Aero Brahmand-CFRP Heavy Vehicle',
      stage: 'stage6_integration',
      subsystem: 'launch_interface',
      quantity: 1,
      unit: 'vehicle',
      unitWeightKg: 17500,
      setupTimeHours: 12,
      cycleTimeHours: 36,
      baseYieldRate: 0.997,
      scrapRate: 0.003,
      requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
      inspectionType: 'hotfire',
      defectSeverityRisk: 0.96,
      makeOrBuy: 'make_inhouse',
      children: [
        {
          id: 'bom_brahmand_cfrp_tanks',
          partNumber: 'VA-BRAHMAND-CFRP-TANKS',
          name: 'Monolithic Linerless CFRP Cryotank Cluster (AFP Wound)',
          stage: 'stage4_subsystems',
          subsystem: 'structures',
          quantity: 2,
          unit: 'tank_assembly',
          unitWeightKg: 8200,
          setupTimeHours: 10,
          cycleTimeHours: 44,
          baseYieldRate: 0.988,
          scrapRate: 0.012,
          requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
          inspectionType: 'ultrasonic',
          defectSeverityRisk: 0.95,
          makeOrBuy: 'make_inhouse',
        },
      ],
    },
  },

  rocket_aerospike_ssto: {
    id: 'rocket_aerospike_ssto',
    name: 'V-Aero Garuda-Aerospike (Altitude-Compensating SSTO)',
    tagline: 'Single-Stage-To-Orbit revolutionary vehicle powered by a toroidal aerospike engine with continuous altitude backpressure compensation.',
    payloadCapacityLeoKg: 12000,
    stagesCount: 1, // True SSTO!
    propellantType: 'Subcooled Methalox Aerospike',
    targetLaunchPriceINR: 980000000, // ₹98 Cr (~$11.5M - lowest cost per kg to orbit!)
    targetLaunchPriceUSD: 11500000,
    dryMassKg: 11500,
    propellantMassKg: 310000,
    bomRoot: {
      id: 'bom_garuda_root',
      partNumber: 'VA-GARUDA-SSTO-005',
      name: 'V-Aero Garuda-Aerospike SSTO Vehicle',
      stage: 'stage6_integration',
      subsystem: 'launch_interface',
      quantity: 1,
      unit: 'vehicle',
      unitWeightKg: 11500,
      setupTimeHours: 14,
      cycleTimeHours: 30,
      baseYieldRate: 0.999,
      scrapRate: 0.001,
      requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
      inspectionType: 'hotfire',
      defectSeverityRisk: 0.98,
      makeOrBuy: 'make_inhouse',
      children: [
        {
          id: 'bom_garuda_aerospike_engine',
          partNumber: 'VA-GARUDA-AEROSPIKE-TOROIDAL',
          name: 'Toroidal Aerospike Propulsion Core with Additive GRCop-42 Spike',
          stage: 'stage4_subsystems',
          subsystem: 'first_stage',
          quantity: 1,
          unit: 'engine_module',
          unitWeightKg: 4800,
          setupTimeHours: 12,
          cycleTimeHours: 38,
          baseYieldRate: 0.994,
          scrapRate: 0.006,
          requiredCert: 'ISRO_AS9100_FLIGHT_SPEC',
          inspectionType: 'hotfire',
          defectSeverityRisk: 0.97,
          makeOrBuy: 'make_inhouse',
        },
      ],
    },
  },
};
