/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ManufacturingStage = 
  | 'stage1_raw'
  | 'stage2_primary'
  | 'stage3_components'
  | 'stage4_subsystems'
  | 'stage5_testing'
  | 'stage6_integration'
  | 'stage7_launch';

export type MaterialCategory = 
  | 'metallic'
  | 'composite'
  | 'propellant'
  | 'electronic'
  | 'thermal_fluid';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  stage: 1 | 2;
  unit: string; // 'kg', 'liter', 'ton', 'sqm'
  spotPriceINR: number; // INR per unit (1 USD ~= 85 INR)
  spotPrice: number; // USD per unit
  basePrice: number;
  priceVolatility: number; // 0 - 1
  density?: number;
  leadTimeHours: number;
  minOrderQty: number;
  supplierCountry: string;
  supplierName: string;
  geopoliticalRisk: number; // 1 - 10
  stockLevel: number;
  reorderPoint: number;
  safetyStock: number;
  specifications: string;
  co2PerUnitKg: number;
  canBeInhouse: boolean; // if false, requires vendor development / Tier-1 partner indigenization
  vendorDevelopmentStatus?: 'in_progress' | 'qualified' | 'not_started';
}

export interface Supplier {
  id: string;
  name: string;
  tier: 'Tier-1' | 'Tier-2' | 'MSME' | 'PSU';
  country: string;
  city: string;
  state?: string;
  lat: number;
  lng: number;
  materialsSupplied: string[]; // Material IDs
  reliabilityRating: number; // 0 - 1
  qualityRating: number; // 0 - 1
  leadTimeVariance: number; // std dev hours
  shippingCostPerKmINR: number;
  isSingleSource: boolean;
  status: 'active' | 'delayed' | 'auditing' | 'qualified';
  contactPerson: string;
  indigenizationPartner: boolean;
}

export type MachineType = 
  | 'smelter'
  | 'rolling_mill'
  | 'atomizer'
  | 'spinning_prepreg'
  | 'cryo_separator'
  | 'cnc_5axis'
  | 'slm_dmls_3d'
  | 'fsw_gantry'
  | 'afp_autoclave'
  | 'cleanroom_smt'
  | 'valve_assembly_bench'
  | 'hydrostatic_tank'
  | 'vibration_shaker'
  | 'vacuum_chamber'
  | 'ct_scanner'
  | 'cmm_metrology'
  | 'engine_hotfire_stand'
  | 'stage_static_pad'
  | 'vertical_stacking_bay';

export interface MachineTelemetry {
  // CNC
  spindleRpm?: number;
  feedRateMmMin?: number;
  currentToolId?: string;
  coolantActive?: boolean;
  axisJitterMicrons?: number;
  // SLM/DMLS
  bedTempC?: number;
  laserPowerWatts?: number;
  argonPurityPct?: number;
  currentLayer?: number;
  totalLayers?: number;
  // FSW
  plungeDepthMm?: number;
  weldLoadKn?: number;
  traverseSpeedMmMin?: number;
  // Autoclave
  chamberPressureBar?: number;
  cureStep?: 'heatup' | 'soak_180c' | 'cooldown' | 'idle';
  vacuumBagInHg?: number;
  // Cleanroom SMT
  particleCountIso?: number;
  esdVoltageVolts?: number;
  reflowTempC?: number;
  // Smelter
  furnaceTempC?: number;
  vacuumTorr?: number;
}

export interface Machine {
  id: string;
  name: string;
  bayName: string;
  bayCode: string;
  type: MachineType;
  facilityId: string;
  stage: ManufacturingStage;
  hourlyOperatingCostINR: number;
  hourlyOperatingCost: number;
  powerKw: number;
  mtbfHours: number;
  mttrHours: number;
  operatingHoursTotal: number;
  hoursSinceLastMaintenance: number;
  toolingWearPct: number;
  status: 'idle' | 'running' | 'breakdown' | 'maintenance' | 'setup';
  currentWorkOrderId?: string;
  operatorId?: string;
  efficiency: number;
  installationDate: string;
  telemetry: MachineTelemetry;
  fixtureId?: string;
  toolCarouselPocket?: number;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  skillLevel: 1 | 2 | 3 | 4 | 5; // 1: Trainee/Apprentice, 3: Senior Technician, 5: Master Craftsman
  shift: 'Shift A (06:00-14:00)' | 'Shift B (14:00-22:00)' | 'Shift C (22:00-06:00)';
  hourlyWageINR: number;
  hourlyWage: number;
  certifications: string[];
  fatiguePct: number;
  assignedMachineId?: string;
  facilityId: string;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  stagesHandled: ManufacturingStage[];
  capacitySqM: number;
  cleanlinessClass?: string;
  operatingOverheadPerHourINR: number;
  operatingOverheadPerHour: number;
}

export interface BOMNode {
  id: string;
  partNumber: string;
  name: string;
  stage: ManufacturingStage;
  subsystem: 'first_stage' | 'second_stage' | 'engines' | 'avionics_gnc' | 'structures' | 'propulsion_feed' | 'launch_interface';
  quantity: number;
  unit: string;
  unitWeightKg: number;
  materialId?: string;
  materialQtyNeeded?: number;
  machineTypeNeeded?: MachineType;
  setupTimeHours: number;
  cycleTimeHours: number;
  baseYieldRate: number;
  scrapRate: number;
  requiredCert: string;
  inspectionType: 'visual' | 'cmm' | 'xray_ct' | 'ultrasonic' | 'pressure_leak' | 'hotfire';
  defectSeverityRisk: number;
  makeOrBuy: 'make_inhouse' | 'buy_vendor_development';
  preferredVendorId?: string;
  children?: BOMNode[];
}

export interface RocketDesign {
  id: string;
  name: string;
  tagline: string;
  payloadCapacityLeoKg: number;
  stagesCount: number;
  propellantType:
    | 'Semi-Cryo Kerolox'
    | 'Cryogenic Hydrolox'
    | 'Solid/Liquid Hybrid'
    | 'Methane-LOX (Methalox)'
    | 'CFRP Methane-LOX Deep Space'
    | 'Subcooled Methalox Aerospike';
  targetLaunchPriceINR: number; // e.g. ₹280 Crores
  targetLaunchPriceUSD: number;
  dryMassKg: number;
  propellantMassKg: number;
  bomRoot: BOMNode;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  jobCardNumber: string;
  routeCardId: string;
  rocketSerial: string;
  bomPartId: string;
  partName: string;
  stage: ManufacturingStage;
  machineTypeNeeded?: MachineType;
  quantity: number;
  status: 'planned' | 'ready' | 'in_progress' | 'inspection' | 'completed' | 'rework' | 'scrapped';
  priority: 'low' | 'normal' | 'high' | 'critical';
  assignedMachineId?: string;
  assignedWorkerId?: string;
  scheduledStartHour: number;
  actualStartHour?: number;
  estimatedDurationHours: number;
  remainingHours: number;
  completedHour?: number;
  dependencies: string[];
  lotId?: string;
  firstPassYield: number;
  defectsDetected: number;
  reworkHours: number;
  setupDone: boolean;
  fixtureAligned: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  materialId: string;
  materialName: string;
  supplierId: string;
  quantity: number;
  unitCostINR: number;
  unitCost: number;
  totalCostINR: number;
  totalCost: number;
  orderTick: number;
  expectedDeliveryTick: number;
  actualDeliveryTick?: number;
  status: 'ordered' | 'in_transit' | 'customs_hold' | 'delivered' | 'cancelled';
  lotNumber?: string;
  shipmentId?: string;
  indigenizationPo: boolean;
}

export interface Shipment {
  id: string;
  poId: string;
  supplierId: string;
  originLat: number;
  originLng: number;
  originCity: string;
  destFacilityId: string;
  destLat: number;
  destLng: number;
  destCity: string;
  progressPct: number;
  transportMode: 'road_convoy' | 'express_air' | 'coastal_barge' | 'rail_freight';
  status: 'in_transit' | 'customs_clearing' | 'delivered';
  currentRiskEvent?: string;
}

export interface InventoryLot {
  id: string;
  lotNumber: string;
  materialOrPartId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCostINR: number;
  unitCost: number;
  supplierId?: string;
  receiptTick: number;
  qcStatus: 'pending' | 'accepted' | 'quarantine' | 'rejected';
  inspectorId?: string;
  as9100CertificateNumber: string;
  heatNumber?: string; // metallurgy melt heat
}

export interface NCR {
  id: string;
  ncrNumber: string;
  workOrderId?: string;
  partId: string;
  partName: string;
  lotNumber: string;
  machineId?: string;
  detectedAtStage: ManufacturingStage;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  defectCategory: 'dimensional' | 'weld_porosity' | 'composite_delamination' | 'surface_crack' | 'electronic_fault' | 'leak_rate_exceeded';
  status: 'open' | 'under_mrb' | 'resolved';
  mrbDisposition?: 'rework' | 'scrap' | 'use_as_is';
  createdTick: number;
  resolvedTick?: number;
  costImpactINR: number;
  costImpact: number;
  timeDelayHours: number;
  reliabilityImpactPct: number;
}

export interface TestRecord {
  id: string;
  testName: string;
  rocketSerial: string;
  componentOrStage: string;
  stage: ManufacturingStage;
  testType: 'hydro_proof' | 'cryo_leak' | 'vibro_acoustic' | 'emi_emc' | 'turbopump_spin' | 'engine_hotfire' | 'stage_static_fire' | 'wet_dress_rehearsal';
  testStandId: string;
  operatorId: string;
  executedTick: number;
  durationSeconds: number;
  peakPressureBar?: number;
  thrustKn?: number;
  vibrationGrms?: number;
  status: 'passed' | 'marginal' | 'failed' | 'aborted';
  notes: string;
  telemetryAnomalyDetected: boolean;
}

export interface SerializedPartGenealogy {
  serialNumber: string;
  partNumber: string;
  partName: string;
  rocketSerial: string;
  parentAssemblySerial?: string;
  lotNumber: string;
  heatNumber?: string;
  supplierName: string;
  supplierCountry: string;
  machineName: string;
  workerName: string;
  manufacturingDate: string;
  inspections: {
    testType: string;
    result: 'passed' | 'concession';
    inspector: string;
    date: string;
  }[];
  ncrs: NCR[];
  healthScorePct: number;
}

export interface RocketInstance {
  id: string;
  serialNumber: string;
  designId: string;
  designName: string;
  status: 'in_production' | 'testing' | 'integration' | 'flight_ready' | 'launched_success' | 'launched_failed';
  productionProgressPct: number;
  startTick: number;
  completionTick?: number;
  launchTick?: number;
  totalCostIncurredINR: number;
  totalCostIncurred: number;
  calculatedReliability: number;
  qualityEscapesCount: number;
  subsystemReadiness: {
    first_stage: number;
    second_stage: number;
    engines: number;
    avionics_gnc: number;
    structures: number;
    propulsion_feed: number;
  };
  qualificationTestsPassed: string[];
  genealogyRecords: SerializedPartGenealogy[];
  launchReport?: LaunchReport;
}

export interface LaunchReport {
  rocketSerial: string;
  missionName: string;
  payloadMassKg: number;
  targetOrbit: string;
  timestamp: string;
  overallSuccess: boolean;
  maxAltitudeKm: number;
  apogeeKm: number;
  perigeeKm: number;
  flightDurationSeconds: number;
  telemetryLogs: {
    timeSec: number;
    altitudeKm: number;
    velocityKmh: number;
    dynamicPressureKpa: number;
    thrustKn: number;
    event?: string;
    anomaly?: string;
  }[];
  rootCauseAnalysis?: string;
  customerSatisfactionScore: number;
  financialRevenueINR: number;
  financialRevenue: number;
}

export interface SimEvent {
  id: string;
  tick: number;
  timestamp: string;
  category: 'supply_chain' | 'manufacturing' | 'quality' | 'testing' | 'financial' | 'vendor_dev' | 'disruption';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  impactMetrics?: {
    costINR?: number;
    costUSD?: number;
    delayHours?: number;
    reliabilityDeltaPct?: number;
  };
  resolved: boolean;
}

// -------------------------------------------------------------
// VENDOR DEVELOPMENT & INDIGENIZATION (Atmanirbhar Space Program)
// -------------------------------------------------------------
export interface VendorProgram {
  id: string;
  materialOrPartId: string;
  targetItemName: string;
  category: 'superalloys' | 'cryo_valves' | 'avionics_sensors' | 'forged_casings' | 'composites';
  vendorId: string;
  vendorName: string;
  vendorTier: 'Tier-1' | 'Tier-2' | 'MSME' | 'PSU';
  currentStage: 'capability_assessment' | 'tot_tooling_setup' | 'prototype_fai' | 'space_qualification' | 'serial_production';
  indigenizationProgressPct: number; // 0 - 100%
  fundingInvestedINR: number; // in INR Crores / Lakhs
  targetUnitCostINR: number;
  foreignImportCostINR: number;
  leadTimeBeforeWeeks: number;
  leadTimeTargetWeeks: number;
  auditPassRate: number; // 0 - 100%
  status: 'active' | 'certified' | 'stalled';
}

export interface FinancialLedger {
  cashBalanceINR: number;
  cashBalance: number;
  totalRevenueINR: number;
  totalRevenue: number;
  totalCapexINR: number;
  totalOpex: {
    materialsINR: number;
    materials: number;
    directLaborINR: number;
    directLabor: number;
    machineDepreciation: number;
    energyAndUtilitiesINR: number;
    energyAndUtilities: number;
    facilityOverheadINR: number;
    facilityOverhead: number;
    scrapAndReworkLossesINR: number;
    scrapAndReworkLosses: number;
    vendorDevelopmentGrantsINR: number;
    penalties: number;
  };
  backlogContracts: {
    id: string;
    customerName: string;
    contractValueINR: number;
    contractValue: number;
    deadlineTick: number;
    penaltyPerHourINR: number;
    penaltyPerHour: number;
    rocketSerialAssigned?: string;
    status: 'pending' | 'in_fulfillment' | 'delivered' | 'late_delivered';
  }[];
  history: {
    tick: number;
    cashINR: number;
    burnRateHourlyINR: number;
    cumulativeRevenueINR: number;
  }[];
}

export interface SustainabilityMetrics {
  totalEnergyMWh: number;
  scope1CO2eTonnes: number;
  scope2CO2eTonnes: number;
  scrapGeneratedKg: number;
  recycledMaterialRatioPct: number;
}

export interface KPIs {
  rocketsCompleted: number;
  rocketsInProduction: number;
  onTimeDeliveryRate: number;
  firstPassYieldRate: number;
  overallEquipmentEffectiveness: number;
  averageCostPerRocketINR: number;
  averageCostPerRocket: number;
  averageCycleTimeDays: number;
  activeBottleneckStation: string;
  cashBalanceINR: number;
  cashBalance: number;
  openNCRCount: number;
  fleetReliabilityScore: number;
  indigenizationRatioPct: number; // % of parts/materials manufactured domestically in India
}

export interface ChallengeModeConfig {
  id: string;
  title: string;
  description: string;
  timeLimitTicks: number;
  rocketsRequired: number;
  budgetLimitINR: number;
  minReliabilityPct: number;
  initialCashINR: number;
  presetDisruptions: {
    tickTrigger: number;
    type: string;
    title: string;
    description: string;
  }[];
}

export type TechCategory = 'propulsion' | 'structures' | 'reusability' | 'manufacturing' | 'avionics';

export interface TechNode {
  id: string;
  title: string;
  tagline: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  category: TechCategory;
  costRP: number;
  costINR: number;
  researchTimeTicks: number;
  prerequisites: string[];
  unlockedRocketDesignIds?: string[];
  bonuses: {
    description: string;
    dryMassMultiplier?: number;
    payloadMultiplier?: number;
    launchSuccessBonus?: number;
    machineCycleTimeMultiplier?: number;
    refurbCostMultiplier?: number;
  };
  specs: {
    label: string;
    value: string;
  }[];
  lore: string;
  iconName?: string;
}

export interface ActiveResearchProject {
  techId: string;
  progressPct: number;
  allocatedINRPerHour: number;
  startedAtTick: number;
}
