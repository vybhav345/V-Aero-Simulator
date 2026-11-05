/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpaceMission {
  id: string;
  codename: string;
  title: string;
  subtitle: string;
  agency: string;
  realWorldContext: string;
  targetOrbit: string;
  difficulty: 'Cadet' | 'Operational' | 'Master' | 'Human-Rated' | 'Deep-Space';
  recommendedVehicle: string;
  payloadName: string;
  payloadMassKg: number;
  rewardINR: number;
  rewardXP: number;
  unlockedTitle: string;
  unlockedTech: string;
  storyBrief: string;
  flightProfile: {
    targetAltitudeKm: number;
    targetVelocityKmh: number;
    inclinationDeg: number;
    maxAllowedVibrationG: number;
    taktTimeLimitHours: number;
  };
  missionMilestones: {
    id: string;
    label: string;
    category: 'manufacturing' | 'quality' | 'testing' | 'launch';
    targetValue: string;
    completed: boolean;
  }[];
}

export const REAL_WORLD_SPACE_MISSIONS: SpaceMission[] = [
  {
    id: 'gslv_nvs03',
    codename: 'HLV3-ORBITAL-GTO',
    title: 'HLV-3 / Heavy Orbital Insertion Mission',
    subtitle: 'Atomic Clock Navigation Spacecraft (Deep Space Range)',
    agency: 'Flight Operations & Space Systems Directorate',
    realWorldContext:
      'High-fidelity orbital telemetry simulation, launching a second-generation navigation satellite equipped with space-qualified Rubidium Atomic Frequency Standards into GTO.',
    targetOrbit: 'Geosynchronous Transfer Orbit (GTO: 170 km x 36,000 km, 19.3° Inclination)',
    difficulty: 'Operational',
    recommendedVehicle: 'HLV-3 Heavy (Liquid Vikas Core & Cryogenic Upper Stage)',
    payloadName: 'Precision Nav Spacecraft (Rubidium Atomic Frequency Standard)',
    payloadMassKg: 2232,
    rewardINR: 4200000000, // ₹420 Cr
    rewardXP: 1200,
    unlockedTitle: 'Orbital Constellation Flight Director',
    unlockedTech: 'Space-Qualified Rubidium Atomic Frequency Standards (RAFS)',
    storyBrief:
      'HLV-3 is poised on the Launch Complex pad. The mission objective is precise injection of the 2,232 kg navigation satellite into GTO. Monitor critical milestones in real-time: solid booster burnout, liquid core acceleration through 125 km altitude, payload fairing jettison, and the high-energy 800+ second vacuum burn of the Cryogenic Upper Stage (CUS).',
    flightProfile: {
      targetAltitudeKm: 170, // GTO Perigee insertion
      targetVelocityKmh: 36800, // ~10.2 km/s injection velocity
      inclinationDeg: 19.3,
      maxAllowedVibrationG: 11.0,
      taktTimeLimitHours: 160,
    },
    missionMilestones: [
      {
        id: 'm0_gslv_gs2',
        label: 'Liquid Engine Full-Duration Acceleration (< 125 km altitude)',
        category: 'testing',
        targetValue: 'Core Thrusting Nominal',
        completed: true,
      },
      {
        id: 'm0_fairing_sep',
        label: 'Payload Fairing Jettison & Spacecraft Unveiled',
        category: 'launch',
        targetValue: 'Fairings Separated at 115 km',
        completed: false,
      },
      {
        id: 'm0_cus_ign',
        label: 'Cryogenic Upper Stage (CUS) Ignition & Vacuum Burn',
        category: 'launch',
        targetValue: 'CUS Thrusting T+275s to T+1105s',
        completed: false,
      },
      {
        id: 'm0_nvs_sep',
        label: 'Spacecraft Separation into Target GTO Orbit',
        category: 'launch',
        targetValue: 'Separation Nominal T+1130s',
        completed: false,
      },
    ],
  },
  {
    id: 'aditya_l1',
    codename: 'SOLAR-L1-CORONA',
    title: 'Aditya-L1: Solar Lagrange Observatory',
    subtitle: 'Sun-Earth L1 Halo Insertion (1.5M km deep space)',
    agency: 'ISRO Solar Physics & Space Applications',
    realWorldContext:
      'Modeled after India’s inaugural solar mission Aditya-L1, launched from Sriharikota into a gravitational halo orbit around the Sun-Earth L1 Lagrange point to monitor coronal mass ejections.',
    targetOrbit: 'Sun-Earth L1 Halo Orbit (1,500,000 km)',
    difficulty: 'Operational',
    recommendedVehicle: 'Horizon-1 / PSLV-XL Standard',
    payloadName: 'VELC Visible Emission Line Coronagraph & SUIT UV Imager',
    payloadMassKg: 1475,
    rewardINR: 3800000000, // ₹380 Cr
    rewardXP: 800,
    unlockedTitle: 'Lagrange Flight Specialist',
    unlockedTech: 'High-Precision 3-Axis Solar Orientation Reaction Wheels',
    storyBrief:
      'Solar Cycle 25 is approaching peak activity. Extreme geomagnetic solar storms risk knocking out global GPS and power grid infrastructure. V-Aero has been awarded the prime manufacturing and launch contract to build and deploy the Aditya-L1 coronagraph observatory. Every turbopump vane and GRCop combustion throat must meet zero-flaw aerospace standards.',
    flightProfile: {
      targetAltitudeKm: 650, // Parking orbit prior to TLI/L1 cruise
      targetVelocityKmh: 36800,
      inclinationDeg: 19.2,
      maxAllowedVibrationG: 12.5,
      taktTimeLimitHours: 180,
    },
    missionMilestones: [
      {
        id: 'm1_cnc',
        label: 'Machine Inconel 718 Turbopump Impeller with < 1.0 µm axis jitter',
        category: 'manufacturing',
        targetValue: 'Bay 1 Tolerance Met',
        completed: true,
      },
      {
        id: 'm1_leak',
        label: 'Helium Mass-Spectrometer Cryo Leak Check (< 1x10⁻⁶ scc/s)',
        category: 'quality',
        targetValue: 'Passed Leak Rate',
        completed: false,
      },
      {
        id: 'm1_test',
        label: 'Mahendragiri SCE-200 Full 120s Acceptance Hotfire',
        category: 'testing',
        targetValue: '2,000 kN Thrust Certified',
        completed: false,
      },
      {
        id: 'm1_launch',
        label: 'Sriharikota SLP Pad 2 Liftoff & Halo Injection Stage Burn',
        category: 'launch',
        targetValue: 'Orbital Insertion T+540s',
        completed: false,
      },
    ],
  },

  {
    id: 'chandrayaan_4',
    codename: 'LUNAR-RETURN-CH4',
    title: 'Chandrayaan-4: Lunar South Pole Sample Return',
    subtitle: 'Robotic Surface Drilling & Autonomous Trans-Earth Docking',
    agency: 'ISRO Planetary Exploration Programme',
    realWorldContext:
      'Inspired by the Chandrayaan-4 mission roadmap, executing robotic sample collection at the lunar south pole and autonomous docking in lunar orbit to return regolith samples to Earth.',
    targetOrbit: 'Trans-Lunar Injection (TLI) & Lunar Polar Orbit',
    difficulty: 'Master',
    recommendedVehicle: 'Horizon-Heavy / LVM3 M4 Heavy-Lift',
    payloadName: 'Lunar Lander + Ascender + Earth Atmospheric Re-entry Capsule',
    payloadMassKg: 4200,
    rewardINR: 6500000000, // ₹650 Cr
    rewardXP: 1600,
    unlockedTitle: 'Lunar Navigator Class',
    unlockedTech: 'Dual-Stage Regolith Sample Transfer & Thermal Shield Re-entry',
    storyBrief:
      'Scientists require un-weathered ice and volatile samples from deep within the permanently shadowed craters of the Lunar South Pole. This mission requires maximum payload lift: a DMLS-printed monolithic cryogenic engine, multi-layer friction stir welded cryogenic propellant tanks, and autonomous orbital rendezvous sensors.',
    flightProfile: {
      targetAltitudeKm: 384400, // Lunar distance
      targetVelocityKmh: 39500, // Escape velocity trajectory
      inclinationDeg: 21.4,
      maxAllowedVibrationG: 14.0,
      taktTimeLimitHours: 240,
    },
    missionMilestones: [
      {
        id: 'm2_dmls',
        label: 'Selective Laser Melt GRCop-42 Regenerative Thrust Chamber',
        category: 'manufacturing',
        targetValue: 'Bay 2 3,200 Layers Complete',
        completed: false,
      },
      {
        id: 'm2_fsw',
        label: 'Orbital Friction Stir Weld Al-Li 2195 Cryo Tank Circumference',
        category: 'manufacturing',
        targetValue: '100% Phased Array Ultrasonic Clear',
        completed: false,
      },
      {
        id: 'm2_static',
        label: 'Stage 1 Full Cluster Hold-Down Static Fire at Mahendragiri',
        category: 'testing',
        targetValue: '3.5s Acoustic Deluge Validated',
        completed: false,
      },
      {
        id: 'm2_launch',
        label: 'Trans-Lunar Injection (TLI) Burn Execution from Sriharikota',
        category: 'launch',
        targetValue: 'Trans-Lunar Orbit Confirmed',
        completed: false,
      },
    ],
  },

  {
    id: 'gaganyaan_hrlv',
    codename: 'VYOMNAUT-HRLV-01',
    title: 'Gaganyaan: Indian Human Spaceflight Mission',
    subtitle: '3-Crew Human-Rated Orbital Insertion & Sea Splashdown',
    agency: 'ISRO Human Space Flight Centre (HSFC)',
    realWorldContext:
      'Based on India’s flagship Gaganyaan programme to demonstrate sovereign human spaceflight capability by launching a 3-member crew to a 400 km orbit for a 3-day mission.',
    targetOrbit: '400 km Low Earth Orbit (LEO, 51.6° Inclination)',
    difficulty: 'Human-Rated',
    recommendedVehicle: 'Human-Rated LVM3 (HRLV-Gaganyaan)',
    payloadName: 'Human-Rated Crew Module + Service Module + ECLSS Life Support',
    payloadMassKg: 5300,
    rewardINR: 11000000000, // ₹1,100 Cr
    rewardXP: 3200,
    unlockedTitle: 'Chief Flight Director (Human Spaceflight)',
    unlockedTech: 'Crew Escape System (CES) & Triple-Redundant Life Support',
    storyBrief:
      'Human lives depend on every weld, bolt, and PCB trace. The Human-Rated Launch Vehicle (HRLV) demands an unprecedented 99.2% calculated reliability rating, zero open Non-Conformance Reports (NCRs), and automated Crew Escape System (CES) fast-abort ignition logic.',
    flightProfile: {
      targetAltitudeKm: 400,
      targetVelocityKmh: 28200,
      inclinationDeg: 51.6,
      maxAllowedVibrationG: 3.8, // Human acceleration limit
      taktTimeLimitHours: 320,
    },
    missionMilestones: [
      {
        id: 'm3_qa',
        label: 'Resolve 100% Material Review Board (MRB) Non-Conformances',
        category: 'quality',
        targetValue: '0 Open NCRs (Class 1 Human-Rated)',
        completed: false,
      },
      {
        id: 'm3_pcb',
        label: 'Assemble Class 5 TMR Rad-Hard Flight Computer in Cleanroom',
        category: 'manufacturing',
        targetValue: 'Parylene Conformal Coating Inspected',
        completed: false,
      },
      {
        id: 'm3_fairing',
        label: '8-Meter Autoclave Carbon Fairing Acoustic Tap & C-Scan',
        category: 'quality',
        targetValue: 'Zero Delamination Detected',
        completed: false,
      },
      {
        id: 'm3_crew',
        label: 'Crew Launch & Automated Orbital Separation at 400 km LEO',
        category: 'launch',
        targetValue: 'Vyomnauts in Stable Orbit',
        completed: false,
      },
    ],
  },

  {
    id: 'nisar_radar',
    codename: 'RADAR-NISAR-SSPO',
    title: 'NISAR: NASA-ISRO Synthetic Aperture Radar',
    subtitle: 'Dual-Frequency L+S Band Earth Tectonic & Glacial Monitor',
    agency: 'Joint NASA-ISRO Earth Science Mission',
    realWorldContext:
      'Reflecting the landmark NASA-ISRO collaborative earth science observatory, deploying the largest deployable radar antenna ever flown by ISRO (12 meters diameter).',
    targetOrbit: '747 km Sun-Synchronous Polar Orbit (SSPO)',
    difficulty: 'Operational',
    recommendedVehicle: 'Horizon-1 / GSLV Mk II Configuration',
    payloadName: 'Dual L-Band & S-Band Polarimetric SweepSAR with 12m Reflector',
    payloadMassKg: 2800,
    rewardINR: 7800000000, // ₹780 Cr
    rewardXP: 1400,
    unlockedTitle: 'Earth Observation Pioneer',
    unlockedTech: '12m Deployable Radar Mesh Boom & Multi-Frequency SweepSAR',
    storyBrief:
      'NISAR will map the entire global landmass every 12 days to measure millimeter-level crustal deformation, earthquake precursors, volcanic swell, and Himalayan glacial melt. Its 12-meter deployable antenna demands extreme payload fairing acoustic dampening during atmospheric ascent.',
    flightProfile: {
      targetAltitudeKm: 747,
      targetVelocityKmh: 27500,
      inclinationDeg: 98.4, // Polar Sun-Synchronous
      maxAllowedVibrationG: 11.2,
      taktTimeLimitHours: 190,
    },
    missionMilestones: [
      {
        id: 'm4_autoclave',
        label: 'Layup & Cure 8m Composite Fairing Shell in Bay 4',
        category: 'manufacturing',
        targetValue: 'Nitrogen 7.5 Bar Soaked 180 min',
        completed: false,
      },
      {
        id: 'm4_shaker',
        label: 'Acoustic Fatigue & Random Shaker Test at 14.8 Grms',
        category: 'testing',
        targetValue: 'Vibro-Acoustic Gate Passed',
        completed: false,
      },
      {
        id: 'm4_rf',
        label: 'SCL Avionics Radiated EMI & Lightning Strike Checkout',
        category: 'testing',
        targetValue: 'Zero RF Sensitivity Spike',
        completed: false,
      },
      {
        id: 'm4_orbit',
        label: 'Polar Dawn-Dusk Orbit Insertion & Antenna Boom Deployment',
        category: 'launch',
        targetValue: 'SSPO 747 km Confirmed',
        completed: false,
      },
    ],
  },

  {
    id: 'bharatiya_antariksh_station',
    codename: 'BAS-HABITAT-01',
    title: 'Bharatiya Antariksh Station: Core Module (BAS-1)',
    subtitle: 'Sovereign 20-Tonne Orbital Laboratory & Space Outpost',
    agency: 'ISRO National Space Infrastructure',
    realWorldContext:
      'Inspired by India’s official roadmap to launch the first module of the Bharatiya Antariksh Station (BAS) by 2028, establishing a permanent crewed space station.',
    targetOrbit: '450 km Low Earth Orbit (LEO, 51.5°)',
    difficulty: 'Deep-Space',
    recommendedVehicle: 'Next-Gen Heavy Launcher (NGLV Heavy)',
    payloadName: '20-Tonne Pressurized Habitation, Airlock & Science Lab Module',
    payloadMassKg: 20500,
    rewardINR: 24000000000, // ₹2,400 Cr
    rewardXP: 6500,
    unlockedTitle: 'Supreme Aerospace Commander',
    unlockedTech: 'Permanent Orbital Life Support, Ion Propulsion & Modular Docking',
    storyBrief:
      'The crown jewel of Indian aerospace: launching the foundational core module for India’s sovereign space station. A 20-tonne pressurized habitat with docking ports for visiting Gaganyaan capsules. This massive payload requires coordinating all 6 manufacturing centers, full indigenization grants, and flawless flight operations.',
    flightProfile: {
      targetAltitudeKm: 450,
      targetVelocityKmh: 28100,
      inclinationDeg: 51.5,
      maxAllowedVibrationG: 3.5,
      taktTimeLimitHours: 480,
    },
    missionMilestones: [
      {
        id: 'm5_indigenization',
        label: 'Fund & Certify MSME Space-Grade Suppliers (MIDHANI, MTAR, Godrej)',
        category: 'quality',
        targetValue: '100% Indigenization Achieved',
        completed: false,
      },
      {
        id: 'm5_fsw_tanks',
        label: 'Friction Stir Weld 5-Meter Cryogenic Propellant Core Tank',
        category: 'manufacturing',
        targetValue: 'Zero Cryogenic Porosity',
        completed: false,
      },
      {
        id: 'm5_stage_fire',
        label: 'Semi-Cryo + Clustered Booster Combined Static Fire Checkout',
        category: 'testing',
        targetValue: '4,500 kN Thrust Verified',
        completed: false,
      },
      {
        id: 'm5_orbital_dock',
        label: 'Core Module Orbit Insertion & Solar Array Deployment',
        category: 'launch',
        targetValue: 'BAS-1 Active & Telemetry Online',
        completed: false,
      },
    ],
  },
];
