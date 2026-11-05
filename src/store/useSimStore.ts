/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import {
  SimState,
  SimulationEngine,
} from '../engine/simulationEngine.ts';
import {
  initialMaterials,
  initialSuppliers,
  initialMachines,
  initialWorkers,
  initialFacilities,
  rocketDesigns,
  initialFinancials,
  initialVendorPrograms,
} from '../data/seedData.ts';
import {
  BOMNode,
  NCR,
  TestRecord,
  SimEvent,
  LaunchReport,
  RocketInstance,
  SerializedPartGenealogy,
  VendorProgram,
  ActiveResearchProject,
} from '../types/index.ts';
import { TECH_TREE_NODES, UNLOCKED_NEXTGEN_ROCKETS } from '../data/techTreeData.ts';

export type ActiveTab =
  | 'space_missions'
  | 'factory_hangar_3d'
  | 'rd_tech_tree'
  | 'shop_floor_takt'
  | 'factory_bays'
  | 'route_job_cards'
  | 'vendor_development'
  | 'quality_lab'
  | 'tooling_maintenance'
  | 'bom_traceability'
  | 'value_stream'
  | 'mahendragiri_launch'
  | 'shop_economics'
  | 'ai_advisor';

export interface SimStoreState {
  engine: SimulationEngine;
  sim: SimState;
  activeTab: ActiveTab;
  selectedGenealogy?: SerializedPartGenealogy;
  selectedMachineId?: string;
  selectedRocketSerial?: string;
  selectedNcrId?: string;
  selectedBayFilter?: string;
  activeModal?: 'new_order' | 'glossary' | 'save_load' | 'launch_modal' | 'vendor_audit';
  lastLaunchReport?: LaunchReport;

  // Game Campaign & Real-World Missions State
  activeMissionId: string;
  completedMissions: Record<string, { stars: number; completedAt: string; maxAltKm: number }>;
  playerXP: number;
  setActiveMissionId: (id: string) => void;
  completeMission: (id: string, stars: number, maxAltKm: number, rewardINR?: number, rewardXP?: number) => void;

  // R&D Tech Tree State
  unlockedTechIds: string[];
  activeResearch: ActiveResearchProject | null;
  researchPoints: number;
  startResearch: (techId: string, allocatedINRPerHour?: number) => void;
  cancelResearch: () => void;
  instantUnlockTech: (techId: string) => void;
  addResearchPoints: (amount: number) => void;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedGenealogy: (gen?: SerializedPartGenealogy) => void;
  setSelectedMachineId: (id?: string) => void;
  setSelectedRocketSerial: (serial?: string) => void;
  setSelectedNcrId: (id?: string) => void;
  setSelectedBayFilter: (bay?: string) => void;
  setActiveModal: (modal?: 'new_order' | 'glossary' | 'save_load' | 'launch_modal' | 'vendor_audit') => void;

  startSim: () => void;
  pauseSim: () => void;
  setSpeed: (speed: 1 | 10 | 100 | 1000) => void;
  stepOnce: () => void;

  createProductionOrder: (designId: string, customSerial?: string) => void;
  orderMaterialManual: (materialId: string, quantity: number, supplierId?: string) => void;
  dispositionNCR: (ncrId: string, disposition: 'rework' | 'scrap' | 'use_as_is') => void;
  runQualificationTest: (rocketSerial: string, testType: TestRecord['testType']) => void;
  launchRocket: (rocketSerial: string) => LaunchReport;
  expediteWorkOrder: (woId: string, hours?: number) => void;
  injectDisruption: (disruption: { title: string; description: string; severity?: SimEvent['severity'] }) => void;
  performMaintenance: (machineId: string) => void;
  changeMachineTool: (machineId: string, toolId: string) => void;
  realignFixture: (machineId: string, fixtureId: string) => void;
  fundVendorProgram: (programId: string, amountINR: number) => void;
  auditVendorProgram: (programId: string) => void;
  updateBOMNode: (designId: string, partId: string, changes: Partial<BOMNode>) => void;
  resetSimulation: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const initialSimState: SimState = {
  tick: 0,
  isRunning: false,
  speed: 1,
  rngSeed: 1337,
  materials: initialMaterials,
  suppliers: initialSuppliers,
  machines: initialMachines,
  workers: initialWorkers,
  facilities: initialFacilities,
  rocketDesigns,
  rockets: [],
  workOrders: [],
  purchaseOrders: [],
  shipments: [],
  inventoryLots: [],
  ncrs: [],
  testRecords: [],
  vendorPrograms: initialVendorPrograms,
  events: [
    {
      id: 'evt_init',
      tick: 0,
      timestamp: 'Y1 D001 06:00 (Shift A)',
      category: 'manufacturing',
      severity: 'info',
      title: 'V-Aero Aerospace Manufacturing Mission Control Online',
      description: 'End-to-End Indian Rocket Manufacturing Discrete-Event Simulator Active. 5 Centers (Bengaluru, Hyderabad, Trivandrum, Mahendragiri, Sriharikota) and 10 Industry Suppliers connected.',
      resolved: true,
    },
  ],
  financials: initialFinancials,
  sustainability: {
    totalEnergyMWh: 380,
    scope1CO2eTonnes: 42,
    scope2CO2eTonnes: 95,
    scrapGeneratedKg: 280,
    recycledMaterialRatioPct: 91,
  },
  kpis: {
    rocketsCompleted: 0,
    rocketsInProduction: 0,
    onTimeDeliveryRate: 100,
    firstPassYieldRate: 98,
    overallEquipmentEffectiveness: 82,
    averageCostPerRocketINR: 2800000000, // ₹280 Crores
    averageCostPerRocket: 33000000,
    averageCycleTimeDays: 210,
    activeBottleneckStation: 'Nominal Operations (Balanced Flow)',
    cashBalanceINR: 14200000000,
    cashBalance: 167000000,
    openNCRCount: 0,
    fleetReliabilityScore: 97.4,
    indigenizationRatioPct: 88,
  },
  learningCurveRate: 0.85,
  cumulativeRocketsBuilt: 0,
};

export const useSimStore = create<SimStoreState>((set, get) => {
  const engine = new SimulationEngine(initialSimState.rngSeed);

  // Automatically prime the first rocket VA-SN-001 (Agni-Orbiter)
  const firstOrder = engine.explodeBOMForRocket(
    initialSimState,
    'rocket_agni_semicryo',
    'VA-SN-001'
  );

  const primedSimState: SimState = {
    ...initialSimState,
    rockets: [firstOrder.rocket],
    workOrders: firstOrder.newWorkOrders,
    purchaseOrders: firstOrder.newPurchaseOrders,
    shipments: firstOrder.newShipments,
    events: [...initialSimState.events, ...firstOrder.events],
    kpis: {
      ...initialSimState.kpis,
      rocketsInProduction: 1,
    },
  };

  return {
    engine,
    sim: primedSimState,
    activeTab: 'space_missions',
    selectedGenealogy: undefined,
    selectedMachineId: undefined,
    selectedRocketSerial: 'VA-SN-001',
    selectedNcrId: undefined,
    selectedBayFilter: 'all',
    activeModal: undefined,
    lastLaunchReport: undefined,

    // Real-World Missions Campaign State
    activeMissionId: 'gslv_nvs03',
    completedMissions: {},
    playerXP: 850,
    setActiveMissionId: (id) => set({ activeMissionId: id }),
    completeMission: (id, stars, maxAltKm, rewardINR = 3800000000, rewardXP = 800) => {
      const state = get();
      set({
        completedMissions: {
          ...state.completedMissions,
          [id]: {
            stars,
            completedAt: state.engine.formatSimTime(state.sim.tick),
            maxAltKm,
          },
        },
        playerXP: state.playerXP + rewardXP,
        sim: {
          ...state.sim,
          financials: {
            ...state.sim.financials,
            cashBalanceINR: state.sim.financials.cashBalanceINR + rewardINR,
            totalRevenueINR: state.sim.financials.totalRevenueINR + rewardINR,
            totalRevenue: state.sim.financials.totalRevenue + rewardINR / 83.5,
          },
        },
      });
    },

    // R&D Tech Tree Initial State
    unlockedTechIds: ['tech_maraging_steel', 'tech_vikas_heritage', 'tech_al_li_isogrid'],
    activeResearch: null,
    researchPoints: 2800,

    startResearch: (techId: string, allocatedINRPerHour: number = 6000000) => {
      const state = get();
      const tech = TECH_TREE_NODES.find((t) => t.id === techId);
      if (!tech) return;
      if (state.unlockedTechIds.includes(techId)) return;
      if (state.researchPoints < tech.costRP) return;

      // Deduct RP upfront
      set({
        researchPoints: state.researchPoints - tech.costRP,
        activeResearch: {
          techId,
          progressPct: 0,
          allocatedINRPerHour,
          startedAtTick: state.sim.tick,
        },
        sim: {
          ...state.sim,
          events: [
            ...state.sim.events,
            {
              id: `evt_rd_start_${techId}_${state.sim.tick}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'manufacturing',
              severity: 'info',
              title: `R&D Project Initiated: ${tech.title}`,
              description: `Allocated ₹${(allocatedINRPerHour / 1e5).toFixed(1)} Lakhs/hr for research. Objective: ${tech.tagline}`,
              resolved: true,
            },
          ],
        },
      });
    },

    cancelResearch: () => {
      const state = get();
      if (!state.activeResearch) return;
      const tech = TECH_TREE_NODES.find((t) => t.id === state.activeResearch?.techId);
      // Refund 80% of RP
      const refundedRP = tech ? Math.floor(tech.costRP * 0.8) : 0;
      set({
        activeResearch: null,
        researchPoints: state.researchPoints + refundedRP,
      });
    },

    instantUnlockTech: (techId: string) => {
      const state = get();
      const tech = TECH_TREE_NODES.find((t) => t.id === techId);
      if (!tech) return;
      if (state.unlockedTechIds.includes(techId)) return;

      const newUnlocked = [...state.unlockedTechIds, techId];
      let newRocketDesigns = [...state.sim.rocketDesigns];

      // Check if this tech unlocks new next-gen rockets
      if (tech.unlockedRocketDesignIds) {
        tech.unlockedRocketDesignIds.forEach((rdId) => {
          if (UNLOCKED_NEXTGEN_ROCKETS[rdId] && !newRocketDesigns.some((d) => d.id === rdId)) {
            newRocketDesigns.push(UNLOCKED_NEXTGEN_ROCKETS[rdId]);
          }
        });
      }

      set({
        unlockedTechIds: newUnlocked,
        activeResearch: state.activeResearch?.techId === techId ? null : state.activeResearch,
        sim: {
          ...state.sim,
          rocketDesigns: newRocketDesigns,
          events: [
            ...state.sim.events,
            {
              id: `evt_rd_instant_${techId}_${state.sim.tick}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'manufacturing',
              severity: 'info',
              title: `Technology Breakthrough: ${tech.title}`,
              description: `Unlocked: ${tech.bonuses.description}`,
              resolved: true,
            },
          ],
        },
      });
    },

    addResearchPoints: (amount: number) => {
      set((state) => ({ researchPoints: state.researchPoints + amount }));
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedGenealogy: (gen) => set({ selectedGenealogy: gen }),
    setSelectedMachineId: (id) => set({ selectedMachineId: id }),
    setSelectedRocketSerial: (serial) => set({ selectedRocketSerial: serial }),
    setSelectedNcrId: (id) => set({ selectedNcrId: id }),
    setSelectedBayFilter: (bay) => set({ selectedBayFilter: bay }),
    setActiveModal: (modal) => set({ activeModal: modal }),

    startSim: () =>
      set((state) => ({
        sim: { ...state.sim, isRunning: true },
      })),

    pauseSim: () =>
      set((state) => ({
        sim: { ...state.sim, isRunning: false },
      })),

    setSpeed: (speed) =>
      set((state) => ({
        sim: { ...state.sim, speed },
      })),

    stepOnce: () => {
      const state = get();
      const nextSim = state.engine.step(state.sim);

      // Advance active research if in progress
      let updatedActiveResearch = state.activeResearch;
      let updatedUnlockedTechs = state.unlockedTechIds;
      let updatedDesigns = nextSim.rocketDesigns;
      let addedEvents: SimEvent[] = [];

      if (state.activeResearch) {
        const tech = TECH_TREE_NODES.find((t) => t.id === state.activeResearch?.techId);
        if (tech) {
          // Progress increment per simulated hour
          const standardCostPerHour = tech.costINR / Math.max(1, tech.researchTimeTicks);
          const fundingRatio = Math.min(2.5, state.activeResearch.allocatedINRPerHour / Math.max(1, standardCostPerHour));
          const progressInc = (100 / Math.max(1, tech.researchTimeTicks)) * Math.max(0.4, fundingRatio);
          const newProgress = Math.min(100, state.activeResearch.progressPct + progressInc);

          // Deduct hourly R&D capex from financials
          const hourlyCost = state.activeResearch.allocatedINRPerHour;
          nextSim.financials.cashBalanceINR -= hourlyCost;
          nextSim.financials.cashBalance -= hourlyCost / 83.5;

          if (newProgress >= 100) {
            // Breakthrough completed!
            updatedUnlockedTechs = [...state.unlockedTechIds, tech.id];
            updatedActiveResearch = null;

            // Unlock new rocket designs if applicable
            if (tech.unlockedRocketDesignIds) {
              const designsToAdd = [...updatedDesigns];
              tech.unlockedRocketDesignIds.forEach((rdId) => {
                if (UNLOCKED_NEXTGEN_ROCKETS[rdId] && !designsToAdd.some((d) => d.id === rdId)) {
                  designsToAdd.push(UNLOCKED_NEXTGEN_ROCKETS[rdId]);
                }
              });
              updatedDesigns = designsToAdd;
            }

            addedEvents.push({
              id: `evt_rd_complete_${tech.id}_${nextSim.tick}`,
              tick: nextSim.tick,
              timestamp: state.engine.formatSimTime(nextSim.tick),
              category: 'manufacturing',
              severity: 'info',
              title: `R&D Breakthrough Achieved: ${tech.title}`,
              description: `Technology operational! ${tech.bonuses.description}`,
              resolved: true,
            });
          } else {
            updatedActiveResearch = {
              ...state.activeResearch,
              progressPct: newProgress,
            };
          }
        }
      }

      // Automatically accrue RP from shop floor machine operations (1 RP every 5 machine operating hours)
      const rpAccrual = nextSim.tick % 4 === 0 ? 10 : 0;

      set({
        sim: {
          ...nextSim,
          rocketDesigns: updatedDesigns,
          events: addedEvents.length > 0 ? [...nextSim.events, ...addedEvents] : nextSim.events,
        },
        activeResearch: updatedActiveResearch,
        unlockedTechIds: updatedUnlockedTechs,
        researchPoints: state.researchPoints + rpAccrual,
      });
    },

    createProductionOrder: (designId: string, customSerial?: string) => {
      const state = get();
      const serial =
        customSerial ||
        `VA-SN-00${state.sim.rockets.length + 1}`;
      const result = state.engine.explodeBOMForRocket(state.sim, designId, serial);

      set({
        sim: {
          ...state.sim,
          rockets: [...state.sim.rockets, result.rocket],
          workOrders: [...state.sim.workOrders, ...result.newWorkOrders],
          purchaseOrders: [...state.sim.purchaseOrders, ...result.newPurchaseOrders],
          shipments: [...state.sim.shipments, ...result.newShipments],
          events: [...state.sim.events, ...result.events],
          kpis: {
            ...state.sim.kpis,
            rocketsInProduction: state.sim.kpis.rocketsInProduction + 1,
          },
        },
        selectedRocketSerial: serial,
        activeModal: undefined,
      });
    },

    orderMaterialManual: (materialId: string, quantity: number, supplierId?: string) => {
      const state = get();
      const material = state.sim.materials.find((m) => m.id === materialId);
      if (!material) return;

      const supplier = supplierId
        ? state.sim.suppliers.find((s) => s.id === supplierId)
        : state.sim.suppliers.find((s) => s.materialsSupplied.includes(materialId)) ||
          state.sim.suppliers[0];

      if (!supplier) return;

      const poId = `po_${materialId}_${Math.floor(Math.random() * 90000 + 10000)}`;
      const totalCostINR = quantity * material.spotPriceINR;
      const totalCost = quantity * material.spotPrice;
      const leadTime = material.leadTimeHours;

      const newPo = {
        id: poId,
        poNumber: `PO-VA-${poId.toUpperCase()}`,
        materialId,
        materialName: material.name,
        supplierId: supplier.id,
        quantity,
        unitCostINR: material.spotPriceINR,
        unitCost: material.spotPrice,
        totalCostINR,
        totalCost,
        orderTick: state.sim.tick,
        expectedDeliveryTick: state.sim.tick + leadTime,
        status: 'in_transit' as const,
        lotNumber: `LOT-VA-${materialId.substring(4, 9).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
        shipmentId: `shp_${poId}`,
        indigenizationPo: !material.canBeInhouse,
      };

      const targetFacility = state.sim.facilities[0];
      const newShipment = {
        id: `shp_${poId}`,
        poId,
        supplierId: supplier.id,
        originLat: supplier.lat,
        originLng: supplier.lng,
        originCity: `${supplier.city}, ${supplier.state || supplier.country}`,
        destFacilityId: targetFacility.id,
        destLat: targetFacility.lat,
        destLng: targetFacility.lng,
        destCity: targetFacility.city,
        progressPct: 0,
        transportMode: supplier.country === 'India' ? ('road_convoy' as const) : ('express_air' as const),
        status: 'in_transit' as const,
      };

      set({
        sim: {
          ...state.sim,
          purchaseOrders: [...state.sim.purchaseOrders, newPo],
          shipments: [...state.sim.shipments, newShipment],
          financials: {
            ...state.sim.financials,
            cashBalanceINR: state.sim.financials.cashBalanceINR - totalCostINR,
            cashBalance: state.sim.financials.cashBalance - totalCost,
            totalOpex: {
              ...state.sim.financials.totalOpex,
              materialsINR: state.sim.financials.totalOpex.materialsINR + totalCostINR,
              materials: state.sim.financials.totalOpex.materials + totalCost,
            },
          },
          events: [
            ...state.sim.events,
            {
              id: `evt_manual_order_${poId}_${state.sim.tick}_${Math.random().toString(36).slice(2, 7)}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'supply_chain',
              severity: 'info',
              title: `Material Indent Released: ${material.name}`,
              description: `Purchased ${quantity} ${material.unit} from ${supplier.name} for ₹${(totalCostINR / 1e5).toFixed(1)} Lakhs.`,
              impactMetrics: { costINR: totalCostINR, costUSD: totalCost },
              resolved: true,
            },
          ],
        },
      });
    },

    dispositionNCR: (ncrId: string, disposition: 'rework' | 'scrap' | 'use_as_is') => {
      const state = get();
      const ncr = state.sim.ncrs.find((n) => n.id === ncrId);
      if (!ncr) return;

      const updatedNcrs = state.sim.ncrs.map((n) => {
        if (n.id === ncrId) {
          return {
            ...n,
            status: 'resolved' as const,
            mrbDisposition: disposition,
            resolvedTick: state.sim.tick,
          };
        }
        return n;
      });

      const updatedWos = state.sim.workOrders.map((wo) => {
        if (wo.id === ncr.workOrderId) {
          if (disposition === 'rework') {
            return {
              ...wo,
              status: 'rework' as const,
              remainingHours: ncr.timeDelayHours,
            };
          } else if (disposition === 'scrap') {
            return {
              ...wo,
              status: 'scrapped' as const,
            };
          } else {
            return {
              ...wo,
              status: 'completed' as const,
            };
          }
        }
        return wo;
      });

      set({
        sim: {
          ...state.sim,
          ncrs: updatedNcrs,
          workOrders: updatedWos,
          events: [
            ...state.sim.events,
            {
              id: `evt_mrb_${ncrId}_${state.sim.tick}_${Math.random().toString(36).slice(2, 7)}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'quality',
              severity: 'info',
              title: `MRB Disposition Applied: ${ncr.ncrNumber}`,
              description: `Material Review Board dispositioned part as [${disposition.toUpperCase()}]. Action logged in V-Aero space registry.`,
              resolved: true,
            },
          ],
        },
      });
    },

    runQualificationTest: (rocketSerial: string, testType: TestRecord['testType']) => {
      const state = get();
      const result = state.engine.executeQualificationTest(state.sim, rocketSerial, testType);
      set({ sim: result.state });
    },

    launchRocket: (rocketSerial: string) => {
      const state = get();
      const result = state.engine.launchRocket(state.sim, rocketSerial);
      set({
        sim: result.state,
        lastLaunchReport: result.report,
        activeModal: 'launch_modal',
      });
      return result.report;
    },

    injectDisruption: (disruption) => {
      const state = get();
      const event: SimEvent = {
        id: `evt_disruption_${Math.floor(Math.random() * 90000 + 10000)}`,
        tick: state.sim.tick,
        timestamp: state.engine.formatSimTime(state.sim.tick),
        category: 'disruption',
        severity: disruption.severity || 'warning',
        title: disruption.title,
        description: disruption.description,
        resolved: false,
      };

      set({
        sim: {
          ...state.sim,
          events: [...state.sim.events, event],
        },
      });
    },

    performMaintenance: (machineId: string) => {
      const state = get();
      const machine = state.sim.machines.find((m) => m.id === machineId);
      if (!machine) return;

      const costINR = 1850000; // ₹18.5 Lakhs
      const updatedMachines = state.sim.machines.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            toolingWearPct: 0,
            hoursSinceLastMaintenance: 0,
            status: 'idle' as const,
            efficiency: 1.1,
          };
        }
        return m;
      });

      set({
        sim: {
          ...state.sim,
          machines: updatedMachines,
          financials: {
            ...state.sim.financials,
            cashBalanceINR: state.sim.financials.cashBalanceINR - costINR,
          },
          kpis: {
            ...state.sim.kpis,
            activeBottleneckStation: 'Nominal Operations (Takt Flow Balanced)',
            overallEquipmentEffectiveness: Math.min(94, state.sim.kpis.overallEquipmentEffectiveness + 6),
          },
          events: [
            ...state.sim.events,
            {
              id: `evt_pm_${machineId}_${state.sim.tick}_${Math.random().toString(36).slice(2, 7)}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'manufacturing',
              severity: 'info',
              title: `Shop-Floor PM Completed: ${machine.name}`,
              description: `Spindle alignment, laser interferometer verification, and tool pocket re-indexing certified in ${machine.bayName}. Tool wear reset to 0%. Cost: ₹18.5 Lakhs.`,
              impactMetrics: { costINR },
              resolved: true,
            },
          ],
        },
      });
    },

    changeMachineTool: (machineId: string, toolId: string) => {
      const state = get();
      const updatedMachines = state.sim.machines.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            telemetry: {
              ...m.telemetry,
              currentToolId: toolId,
            },
            toolingWearPct: 5,
          };
        }
        return m;
      });
      set({ sim: { ...state.sim, machines: updatedMachines } });
    },

    realignFixture: (machineId: string, fixtureId: string) => {
      const state = get();
      const updatedMachines = state.sim.machines.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            fixtureId,
            efficiency: 1.05,
          };
        }
        return m;
      });
      set({ sim: { ...state.sim, machines: updatedMachines } });
    },

    expediteWorkOrder: (woId: string, hours = 12) => {
      const state = get();
      const wo = state.sim.workOrders.find((w) => w.id === woId);
      if (!wo) return;

      const remaining = Math.max(0, wo.remainingHours - hours);
      const isCompleted = remaining === 0;

      // Update work order
      const updatedWorkOrders = state.sim.workOrders.map((w) => {
        if (w.id === woId) {
          return {
            ...w,
            remainingHours: remaining,
            status: isCompleted ? ('completed' as const) : w.status,
            completedHour: isCompleted ? state.sim.tick : w.completedHour,
          };
        }
        return w;
      });

      // If completed, free up machine
      const updatedMachines = state.sim.machines.map((m) => {
        if (m.currentWorkOrderId === woId && isCompleted) {
          return {
            ...m,
            status: 'idle' as const,
            currentWorkOrderId: undefined,
          };
        }
        return m;
      });

      // Check dependent work orders that can now become ready
      if (isCompleted) {
        const completedIds = new Set(
          updatedWorkOrders.filter((w) => w.status === 'completed').map((w) => w.id)
        );
        updatedWorkOrders.forEach((w) => {
          if (w.status === 'planned' && w.dependencies.every((dep) => completedIds.has(dep))) {
            w.status = 'ready';
          }
        });
      }

      // Update rocket production progress
      const updatedRockets = state.sim.rockets.map((rkt) => {
        if (rkt.serialNumber === wo.rocketSerial) {
          const rocketWos = updatedWorkOrders.filter((w) => w.rocketSerial === rkt.serialNumber);
          const done = rocketWos.filter((w) => w.status === 'completed').length;
          const progressPct = rocketWos.length > 0 ? Math.round((done / rocketWos.length) * 100) : 0;
          return {
            ...rkt,
            productionProgressPct: progressPct,
            status: progressPct >= 100 ? ('flight_ready' as const) : rkt.status,
          };
        }
        return rkt;
      });

      set({
        sim: {
          ...state.sim,
          workOrders: updatedWorkOrders,
          machines: updatedMachines,
          rockets: updatedRockets,
          events: isCompleted
            ? [
                ...state.sim.events,
                {
                  id: `evt_expedite_${woId}_${state.sim.tick}`,
                  tick: state.sim.tick,
                  timestamp: state.engine.formatSimTime(state.sim.tick),
                  category: 'manufacturing',
                  severity: 'info',
                  title: `Operation Completed: ${wo.partName}`,
                  description: `Machining completed on schedule. Part cleared from bay and transferred to NDT inspection buffer.`,
                  resolved: true,
                },
              ]
            : state.sim.events,
        },
      });
    },

    fundVendorProgram: (programId: string, amountINR: number) => {
      const state = get();
      const updatedPrograms = state.sim.vendorPrograms.map((vp) => {
        if (vp.id === programId) {
          const newProgress = Math.min(100, vp.indigenizationProgressPct + 15);
          return {
            ...vp,
            fundingInvestedINR: vp.fundingInvestedINR + amountINR,
            indigenizationProgressPct: newProgress,
            status: newProgress >= 100 ? ('certified' as const) : ('active' as const),
          };
        }
        return vp;
      });

      set({
        sim: {
          ...state.sim,
          vendorPrograms: updatedPrograms,
          financials: {
            ...state.sim.financials,
            cashBalanceINR: state.sim.financials.cashBalanceINR - amountINR,
            totalOpex: {
              ...state.sim.financials.totalOpex,
              vendorDevelopmentGrantsINR:
                state.sim.financials.totalOpex.vendorDevelopmentGrantsINR + amountINR,
            },
          },
          events: [
            ...state.sim.events,
            {
              id: `evt_vp_fund_${programId}_${state.sim.tick}_${Math.random().toString(36).slice(2, 7)}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'vendor_dev',
              severity: 'info',
              title: `Vendor Development Grant Released: ₹${(amountINR / 1e7).toFixed(1)} Cr`,
              description: `Transferred technology transfer & tooling grant to vendor for rapid indigenization.`,
              resolved: true,
            },
          ],
        },
      });
    },

    auditVendorProgram: (programId: string) => {
      const state = get();
      const program = state.sim.vendorPrograms.find((p) => p.id === programId);
      if (!program) return;

      const passScore = 95 + Math.floor(Math.random() * 5);
      const updatedPrograms = state.sim.vendorPrograms.map((p) => {
        if (p.id === programId) {
          return {
            ...p,
            auditPassRate: passScore,
            status: 'certified' as const,
            indigenizationProgressPct: 100,
          };
        }
        return p;
      });

      set({
        sim: {
          ...state.sim,
          vendorPrograms: updatedPrograms,
          events: [
            ...state.sim.events,
            {
              id: `evt_audit_${programId}_${state.sim.tick}_${Math.random().toString(36).slice(2, 7)}`,
              tick: state.sim.tick,
              timestamp: state.engine.formatSimTime(state.sim.tick),
              category: 'vendor_dev',
              severity: 'info',
              title: `Vendor Space-Grade Audit Cleared: ${program.vendorName}`,
              description: `Audit Score: ${passScore}%. First Article Inspection (FAI) approved for ${program.targetItemName}. Material certified for flight use.`,
              resolved: true,
            },
          ],
        },
      });
    },

    updateBOMNode: (designId: string, partId: string, changes: Partial<BOMNode>) => {
      const state = get();
      const updateNodeInTree = (node: BOMNode): BOMNode => {
        if (node.id === partId) {
          return { ...node, ...changes };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateNodeInTree),
          };
        }
        return node;
      };

      const updatedDesigns = state.sim.rocketDesigns.map((d) => {
        if (d.id === designId) {
          return {
            ...d,
            bomRoot: updateNodeInTree(d.bomRoot),
          };
        }
        return d;
      });

      set({
        sim: {
          ...state.sim,
          rocketDesigns: updatedDesigns,
        },
      });
    },

    resetSimulation: () => {
      set({
        sim: primedSimState,
        selectedRocketSerial: 'VA-SN-001',
        selectedGenealogy: undefined,
        activeModal: undefined,
        lastLaunchReport: undefined,
      });
    },

    exportJSON: () => {
      const state = get();
      return JSON.stringify(state.sim, null, 2);
    },

    importJSON: (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr) as SimState;
        if (parsed.materials && parsed.machines && parsed.rockets) {
          set({ sim: parsed });
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to import simulation JSON:', err);
        return false;
      }
    },
  };
});
