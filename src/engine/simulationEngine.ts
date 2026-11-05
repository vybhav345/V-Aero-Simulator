/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Material,
  Supplier,
  Machine,
  Worker,
  Facility,
  BOMNode,
  RocketDesign,
  RocketInstance,
  WorkOrder,
  PurchaseOrder,
  Shipment,
  InventoryLot,
  NCR,
  TestRecord,
  SimEvent,
  FinancialLedger,
  SustainabilityMetrics,
  KPIs,
  LaunchReport,
  SerializedPartGenealogy,
  VendorProgram,
} from '../types/index.ts';
import { SeededRNG } from './rng.ts';

export interface SimState {
  tick: number; // 1 tick = 1 simulated hour
  isRunning: boolean;
  speed: 1 | 10 | 100 | 1000;
  rngSeed: number;
  materials: Material[];
  suppliers: Supplier[];
  machines: Machine[];
  workers: Worker[];
  facilities: Facility[];
  rocketDesigns: RocketDesign[];
  rockets: RocketInstance[];
  workOrders: WorkOrder[];
  purchaseOrders: PurchaseOrder[];
  shipments: Shipment[];
  inventoryLots: InventoryLot[];
  ncrs: NCR[];
  testRecords: TestRecord[];
  events: SimEvent[];
  vendorPrograms: VendorProgram[];
  financials: FinancialLedger;
  sustainability: SustainabilityMetrics;
  kpis: KPIs;
  learningCurveRate: number; // 0.85
  cumulativeRocketsBuilt: number;
}

export class SimulationEngine {
  private rng: SeededRNG;

  constructor(seed: number = 42) {
    this.rng = new SeededRNG(seed);
  }

  public setSeed(seed: number): void {
    this.rng.setSeed(seed);
  }

  /**
   * Explodes the Bill of Materials for a rocket design into:
   * 1. Required Purchase Orders for missing raw materials
   * 2. Hierarchical Work Orders with prerequisite dependency mapping
   */
  public explodeBOMForRocket(
    state: SimState,
    designId: string,
    rocketSerial: string
  ): {
    rocket: RocketInstance;
    newWorkOrders: WorkOrder[];
    newPurchaseOrders: PurchaseOrder[];
    newShipments: Shipment[];
    events: SimEvent[];
  } {
    const design = state.rocketDesigns.find((d) => d.id === designId);
    if (!design) {
      throw new Error(`Rocket design ${designId} not found`);
    }

    const newWorkOrders: WorkOrder[] = [];
    const newPurchaseOrders: PurchaseOrder[] = [];
    const newShipments: Shipment[] = [];
    const generatedEvents: SimEvent[] = [];

    const materialRequirements: Record<string, number> = {};

    // Recursive traversal to create route job cards
    const processNode = (node: BOMNode): string => {
      const woId = `wo_${rocketSerial}_${node.id}_${this.rng.nextInt(1000, 9999)}`;
      
      const unitsBuilt = state.cumulativeRocketsBuilt + 1;
      const learningFactor = Math.pow(unitsBuilt, Math.log2(state.learningCurveRate));
      const adjustedCycleHours = Math.max(1, Math.round(node.cycleTimeHours * learningFactor));

      if (node.materialId && node.materialQtyNeeded) {
        const qtyNeeded = node.materialQtyNeeded * (1 + node.scrapRate);
        materialRequirements[node.materialId] = (materialRequirements[node.materialId] || 0) + qtyNeeded;
      }

      const childWoIds: string[] = [];
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const childWoId = processNode(child);
          childWoIds.push(childWoId);
        }
      }

      const wo: WorkOrder = {
        id: woId,
        orderNumber: `JC-${rocketSerial}-${node.partNumber}`,
        jobCardNumber: `JOB-${this.rng.nextInt(10000, 99999)}`,
        routeCardId: `RC-${node.partNumber}`,
        rocketSerial,
        bomPartId: node.id,
        partName: node.name,
        stage: node.stage,
        machineTypeNeeded: node.machineTypeNeeded,
        quantity: node.quantity,
        status: childWoIds.length === 0 ? 'ready' : 'planned',
        priority: 'normal',
        scheduledStartHour: state.tick + 1,
        estimatedDurationHours: node.setupTimeHours + adjustedCycleHours,
        remainingHours: node.setupTimeHours + adjustedCycleHours,
        dependencies: childWoIds,
        firstPassYield: node.baseYieldRate,
        defectsDetected: 0,
        reworkHours: 0,
        setupDone: false,
        fixtureAligned: false,
      };

      newWorkOrders.push(wo);
      return woId;
    };

    processNode(design.bomRoot);

    // MRP Net Requirements check
    for (const [matId, grossQty] of Object.entries(materialRequirements)) {
      const material = state.materials.find((m) => m.id === matId);
      if (!material) continue;

      const netNeeded = Math.max(0, grossQty + material.safetyStock - material.stockLevel);

      if (netNeeded > 0) {
        const orderQty = Math.max(netNeeded, material.minOrderQty);
        const bestSupplier = state.suppliers.find((s) => s.materialsSupplied.includes(matId)) || state.suppliers[0];

        const poId = `po_${matId}_${this.rng.nextInt(10000, 99999)}`;
        const shipmentId = `shp_${this.rng.nextInt(10000, 99999)}`;
        const leadVariance = this.rng.nextGaussian(0, bestSupplier.leadTimeVariance || 12);
        const actualLeadHours = Math.max(12, Math.round(material.leadTimeHours + leadVariance));
        const totalCostINR = orderQty * material.spotPriceINR;
        const totalCost = orderQty * material.spotPrice;

        const po: PurchaseOrder = {
          id: poId,
          poNumber: `PO-VA-${poId.toUpperCase()}`,
          materialId: matId,
          materialName: material.name,
          supplierId: bestSupplier.id,
          quantity: orderQty,
          unitCostINR: material.spotPriceINR,
          unitCost: material.spotPrice,
          totalCostINR,
          totalCost,
          orderTick: state.tick,
          expectedDeliveryTick: state.tick + actualLeadHours,
          status: 'in_transit',
          lotNumber: `LOT-${matId.substring(4, 9).toUpperCase()}-${this.rng.nextInt(100, 999)}`,
          shipmentId,
          indigenizationPo: !material.canBeInhouse,
        };

        const targetFacility = state.facilities[0]; // Bengaluru machining hub
        const shipment: Shipment = {
          id: shipmentId,
          poId,
          supplierId: bestSupplier.id,
          originLat: bestSupplier.lat,
          originLng: bestSupplier.lng,
          originCity: `${bestSupplier.city}, ${bestSupplier.state || bestSupplier.country}`,
          destFacilityId: targetFacility.id,
          destLat: targetFacility.lat,
          destLng: targetFacility.lng,
          destCity: targetFacility.city,
          progressPct: 0,
          transportMode: bestSupplier.country === 'India' ? 'road_convoy' : 'express_air',
          status: 'in_transit',
        };

        newPurchaseOrders.push(po);
        newShipments.push(shipment);

        generatedEvents.push({
          id: `evt_mrp_po_${poId}`,
          tick: state.tick,
          timestamp: this.formatSimTime(state.tick),
          category: 'supply_chain',
          severity: 'info',
          title: `MRP Generated Consignment: ${material.name}`,
          description: `Dispatched PO to ${bestSupplier.name} for ${orderQty} ${material.unit} (Value: ₹${(totalCostINR / 1e5).toFixed(1)} Lakhs, ETA: ${actualLeadHours} hrs).`,
          impactMetrics: { costINR: totalCostINR, costUSD: totalCost, delayHours: actualLeadHours },
          resolved: true,
        });
      }
    }

    const rocket: RocketInstance = {
      id: `rkt_${rocketSerial}`,
      serialNumber: rocketSerial,
      designId: design.id,
      designName: design.name,
      status: 'in_production',
      productionProgressPct: 0,
      startTick: state.tick,
      totalCostIncurredINR: 0,
      totalCostIncurred: 0,
      calculatedReliability: 96.8,
      qualityEscapesCount: 0,
      subsystemReadiness: {
        first_stage: 0,
        second_stage: 0,
        engines: 0,
        avionics_gnc: 0,
        structures: 0,
        propulsion_feed: 0,
      },
      qualificationTestsPassed: [],
      genealogyRecords: [],
    };

    generatedEvents.push({
      id: `evt_wo_explosion_${rocketSerial}_${state.tick}_${this.rng.nextInt(1000, 9999)}`,
      tick: state.tick,
      timestamp: this.formatSimTime(state.tick),
      category: 'manufacturing',
      severity: 'info',
      title: `Shop-Floor Production Order Dispatched: ${rocketSerial}`,
      description: `BOM exploded into ${newWorkOrders.length} route cards across 6 Indian aerospace centers for ${design.name}.`,
      resolved: true,
    });

    return {
      rocket,
      newWorkOrders,
      newPurchaseOrders,
      newShipments,
      events: generatedEvents,
    };
  }

  /**
   * Advances the simulation by exactly 1 tick (1 simulated hour).
   */
  public step(state: SimState): SimState {
    const nextTick = state.tick + 1;
    const newEvents: SimEvent[] = [...state.events];
    const newNcrs: NCR[] = [...state.ncrs];
    const newTestRecords: TestRecord[] = [...state.testRecords];
    let hourlyLaborCostINR = 0;
    let hourlyLaborCost = 0;
    let hourlyPowerCostINR = 0;
    let hourlyPowerCost = 0;
    let hourlyFacilityCostINR = 0;
    let hourlyFacilityCost = 0;
    let scrapCostINR = 0;
    let scrapCost = 0;
    let energyUsedThisTick = 0;

    // 1. Advance Facility Overhead Costs
    for (const fac of state.facilities) {
      hourlyFacilityCostINR += fac.operatingOverheadPerHourINR;
      hourlyFacilityCost += fac.operatingOverheadPerHour;
    }

    // 2. Advance In-Transit Shipments & Purchase Orders
    const updatedShipments: Shipment[] = [];
    const updatedPurchaseOrders: PurchaseOrder[] = [...state.purchaseOrders];
    const updatedMaterials: Material[] = [...state.materials];
    const newInventoryLots: InventoryLot[] = [...state.inventoryLots];

    for (const shp of state.shipments) {
      if (shp.status === 'in_transit') {
        const po = updatedPurchaseOrders.find((p) => p.id === shp.poId);
        if (po) {
          const totalDuration = Math.max(1, po.expectedDeliveryTick - po.orderTick);
          const elapsed = nextTick - po.orderTick;
          const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));

          if (nextTick >= po.expectedDeliveryTick) {
            shp.status = 'delivered';
            shp.progressPct = 100;
            po.status = 'delivered';
            po.actualDeliveryTick = nextTick;

            const matIndex = updatedMaterials.findIndex((m) => m.id === po.materialId);
            if (matIndex !== -1) {
              updatedMaterials[matIndex] = {
                ...updatedMaterials[matIndex],
                stockLevel: updatedMaterials[matIndex].stockLevel + po.quantity,
              };

              const lot: InventoryLot = {
                id: `lot_${this.rng.nextInt(100000, 999999)}`,
                lotNumber: po.lotNumber || `LOT-${nextTick}`,
                materialOrPartId: po.materialId,
                name: po.materialName,
                quantity: po.quantity,
                unit: updatedMaterials[matIndex].unit,
                unitCostINR: po.unitCostINR,
                unitCost: po.unitCost,
                supplierId: po.supplierId,
                receiptTick: nextTick,
                qcStatus: 'accepted',
                as9100CertificateNumber: `VA-QC-PASS-${this.rng.nextInt(10000, 99999)}`,
                heatNumber: `HEAT-IN-${this.rng.nextInt(100, 999)}`,
              };
              newInventoryLots.push(lot);
            }

            newEvents.push({
              id: `evt_delivery_${po.id}_${nextTick}_${this.rng.nextInt(1000, 9999)}`,
              tick: nextTick,
              timestamp: this.formatSimTime(nextTick),
              category: 'supply_chain',
              severity: 'info',
              title: `Consignment Arrived: ${po.materialName}`,
              description: `${po.quantity} units received and verified by Receiving QA dock.`,
              resolved: true,
            });
          } else {
            shp.progressPct = progress;
          }
        }
      }
      updatedShipments.push(shp);
    }

    // 3. Update Machines & Real-Time Shop Floor Telemetry
    const updatedMachines: Machine[] = state.machines.map((m) => {
      const mac = { ...m };
      if (mac.status === 'running') {
        mac.operatingHoursTotal += 1;
        mac.hoursSinceLastMaintenance += 1;
        mac.toolingWearPct = Math.min(100, mac.toolingWearPct + 0.06);

        // Power consumption
        const mwh = (mac.powerKw * 1) / 1000;
        energyUsedThisTick += mwh;
        hourlyPowerCostINR += mwh * 8500; // ~₹8.5/kWh industrial power tariff
        hourlyPowerCost += mwh * 100;

        // Dynamic Machine Telemetry Jitter based on process type
        if (mac.type === 'cnc_5axis') {
          mac.telemetry = {
            ...mac.telemetry,
            spindleRpm: 18000 + this.rng.nextInt(-250, 250),
            feedRateMmMin: 1200 + this.rng.nextInt(-30, 30),
            axisJitterMicrons: Math.max(0.4, Number((0.8 + mac.toolingWearPct / 100).toFixed(2))),
            coolantActive: true,
          };
        } else if (mac.type === 'slm_dmls_3d') {
          const curLay = (mac.telemetry.currentLayer || 1000) + 2;
          const totLay = mac.telemetry.totalLayers || 3500;
          mac.telemetry = {
            ...mac.telemetry,
            currentLayer: curLay > totLay ? totLay : curLay,
            argonPurityPct: Number((99.995 + this.rng.next() * 0.003).toFixed(4)),
            bedTempC: 198 + this.rng.nextInt(-2, 2),
          };
        } else if (mac.type === 'fsw_gantry') {
          mac.telemetry = {
            ...mac.telemetry,
            plungeDepthMm: Number((6.2 + this.rng.nextInt(-1, 1) * 0.02).toFixed(2)),
            weldLoadKn: Number((42.5 + this.rng.nextInt(-2, 2) * 0.5).toFixed(1)),
            traverseSpeedMmMin: 110 + this.rng.nextInt(-2, 2),
          };
        }

        // Breakdown check
        const breakdownRisk = (1 / mac.mtbfHours) * (1 + mac.toolingWearPct / 100);
        if (this.rng.chance(breakdownRisk)) {
          mac.status = 'breakdown';
          mac.hoursSinceLastMaintenance = 0;
          newEvents.push({
            id: `evt_break_${mac.id}_${nextTick}`,
            tick: nextTick,
            timestamp: this.formatSimTime(nextTick),
            category: 'manufacturing',
            severity: 'error',
            title: `Shop-Floor Breakdown: ${mac.name}`,
            description: `Spindle bearing thermal runout alarm triggered in ${mac.bayName}. Maintenance team dispatched (MTTR: ${mac.mttrHours}h).`,
            impactMetrics: { costINR: mac.hourlyOperatingCostINR * mac.mttrHours, delayHours: mac.mttrHours },
            resolved: false,
          });
        }
      } else if (mac.status === 'breakdown') {
        mac.hoursSinceLastMaintenance += 1;
        if (mac.hoursSinceLastMaintenance >= mac.mttrHours) {
          mac.status = 'idle';
          mac.hoursSinceLastMaintenance = 0;
          mac.toolingWearPct = Math.max(0, mac.toolingWearPct - 30);
          newEvents.push({
            id: `evt_repair_${mac.id}_${nextTick}`,
            tick: nextTick,
            timestamp: this.formatSimTime(nextTick),
            category: 'manufacturing',
            severity: 'info',
            title: `Cell Restored to Active Duty: ${mac.name}`,
            description: `Tooling replaced, calibration re-homed in ${mac.bayName}. Ready for next job card.`,
            resolved: true,
          });
        }
      }
      return mac;
    });

    // 4. Finite Capacity Scheduling & Job Card Execution
    const updatedWorkOrders: WorkOrder[] = state.workOrders.map((wo) => ({ ...wo }));
    const completedWoIds = new Set(
      updatedWorkOrders.filter((wo) => wo.status === 'completed').map((wo) => wo.id)
    );

    // Free up completed machines
    for (const mac of updatedMachines) {
      if (mac.status === 'running' && mac.currentWorkOrderId) {
        const wo = updatedWorkOrders.find((w) => w.id === mac.currentWorkOrderId);
        if (!wo || wo.status === 'completed' || wo.status === 'scrapped') {
          mac.status = 'idle';
          mac.currentWorkOrderId = undefined;
        }
      }
    }

    // Schedule 'ready' operations
    for (const wo of updatedWorkOrders) {
      if (wo.status === 'planned') {
        const allPrereqsMet = wo.dependencies.every((depId) => completedWoIds.has(depId));
        if (allPrereqsMet) {
          wo.status = 'ready';
        }
      }

      if ((wo.status === 'ready' || wo.status === 'rework') && !wo.assignedMachineId) {
        const matchingMachine = updatedMachines.find((m) => {
          if (m.status !== 'idle') return false;
          if (wo.machineTypeNeeded) {
            return m.type === wo.machineTypeNeeded;
          }
          return m.stage === wo.stage;
        });

        if (matchingMachine) {
          const worker = state.workers.find((w) => !w.assignedMachineId);

          matchingMachine.status = 'running';
          matchingMachine.currentWorkOrderId = wo.id;
          wo.assignedMachineId = matchingMachine.id;
          wo.status = 'in_progress';
          wo.actualStartHour = wo.actualStartHour || nextTick;
          wo.setupDone = true;
          wo.fixtureAligned = true;

          if (worker) {
            worker.assignedMachineId = matchingMachine.id;
            wo.assignedWorkerId = worker.id;
          }
        }
      }

      if (wo.status === 'in_progress') {
        const assignedMac = updatedMachines.find((m) => m.id === wo.assignedMachineId);
        const assignedWrk = state.workers.find((w) => w.id === wo.assignedWorkerId);

        if (assignedMac && assignedMac.status === 'running') {
          wo.remainingHours = Math.max(0, wo.remainingHours - 1);
          hourlyLaborCostINR += assignedWrk ? assignedWrk.hourlyWageINR : 1400;
          hourlyLaborCost += assignedWrk ? assignedWrk.hourlyWage : 16;

          if (wo.remainingHours === 0) {
            // First-Pass Yield check
            const toolWearPenalty = assignedMac.toolingWearPct / 450;
            const effectiveYield = Math.max(0.75, wo.firstPassYield - toolWearPenalty);
            const passedInspection = this.rng.chance(effectiveYield);

            if (passedInspection) {
              wo.status = 'completed';
              wo.completedHour = nextTick;
              assignedMac.status = 'idle';
              assignedMac.currentWorkOrderId = undefined;
              if (assignedWrk) assignedWrk.assignedMachineId = undefined;

              const currentRocket = state.rockets.find((r) => r.serialNumber === wo.rocketSerial);
              if (currentRocket) {
                const genealogy: SerializedPartGenealogy = {
                  serialNumber: `VA-SN-${wo.partName.substring(0, 3).toUpperCase()}-${this.rng.nextInt(10000, 99999)}`,
                  partNumber: wo.orderNumber,
                  partName: wo.partName,
                  rocketSerial: wo.rocketSerial,
                  lotNumber: `LOT-VA-QC-${nextTick}`,
                  heatNumber: `HEAT-MIDHANI-${this.rng.nextInt(100, 999)}`,
                  supplierName: 'V-Aero In-House Manufacturing Bay',
                  supplierCountry: 'India',
                  machineName: assignedMac.name,
                  workerName: assignedWrk ? assignedWrk.name : 'Automated Robotic Cell',
                  manufacturingDate: this.formatSimTime(nextTick),
                  inspections: [
                    {
                      testType: 'ISRO Stage Quality & CMM Metrology Clearance',
                      result: 'passed',
                      inspector: 'Ananya Deshmukh (NDT Level III)',
                      date: this.formatSimTime(nextTick),
                    },
                  ],
                  ncrs: [],
                  healthScorePct: 98 + this.rng.nextInt(0, 2),
                };
                currentRocket.genealogyRecords.push(genealogy);
              }
            } else {
              // Quality Non-Conformance detected!
              wo.defectsDetected += 1;
              const ncrId = `ncr_${this.rng.nextInt(10000, 99999)}`;
              const severityRoll = this.rng.next();
              const severity = severityRoll > 0.85 ? 'critical' : severityRoll > 0.5 ? 'major' : 'minor';
              
              const defectCategories: NCR['defectCategory'][] = [
                'dimensional',
                'weld_porosity',
                'composite_delamination',
                'surface_crack',
                'electronic_fault',
                'leak_rate_exceeded',
              ];
              const defectCat = this.rng.pick(defectCategories);

              const costImpactINR = severity === 'critical' ? 7200000 : severity === 'major' ? 2100000 : 680000;
              const costImpact = costImpactINR / 85;

              const newNcr: NCR = {
                id: ncrId,
                ncrNumber: `VA-NCR-${ncrId.toUpperCase()}`,
                workOrderId: wo.id,
                partId: wo.bomPartId,
                partName: wo.partName,
                lotNumber: `LOT-FAIL-${nextTick}`,
                machineId: assignedMac.id,
                detectedAtStage: wo.stage,
                severity,
                defectCategory: defectCat,
                description: `Non-conformance detected during NDT QA scan: ${defectCat.replace(/_/g, ' ')} exceeding ISRO space-grade tolerance.`,
                status: 'open',
                createdTick: nextTick,
                costImpactINR,
                costImpact,
                timeDelayHours: severity === 'critical' ? 48 : severity === 'major' ? 24 : 12,
                reliabilityImpactPct: severity === 'critical' ? 1.5 : severity === 'major' ? 0.6 : 0.2,
              };

              newNcrs.push(newNcr);

              if (severity === 'minor') {
                newNcr.status = 'resolved';
                newNcr.mrbDisposition = 'use_as_is';
                wo.status = 'completed';
                wo.completedHour = nextTick;
                assignedMac.status = 'idle';
                assignedMac.currentWorkOrderId = undefined;
              } else if (severity === 'major') {
                newNcr.status = 'under_mrb';
                newNcr.mrbDisposition = 'rework';
                wo.status = 'rework';
                wo.remainingHours = newNcr.timeDelayHours;
                wo.reworkHours += newNcr.timeDelayHours;
              } else {
                newNcr.status = 'under_mrb';
                newNcr.mrbDisposition = 'scrap';
                wo.status = 'scrapped';
                scrapCostINR += costImpactINR;
                scrapCost += costImpact;
                assignedMac.status = 'idle';
                assignedMac.currentWorkOrderId = undefined;
              }

              newEvents.push({
                id: `evt_ncr_${ncrId}_${nextTick}_${this.rng.nextInt(1000, 9999)}`,
                tick: nextTick,
                timestamp: this.formatSimTime(nextTick),
                category: 'quality',
                severity: severity === 'critical' ? 'critical' : 'warning',
                title: `NCR Issued: ${wo.partName}`,
                description: `${newNcr.ncrNumber}: ${newNcr.description} (MRB Disposition: ${newNcr.mrbDisposition?.toUpperCase() || 'PENDING'}).`,
                impactMetrics: { costINR: costImpactINR, delayHours: newNcr.timeDelayHours },
                resolved: newNcr.status === 'resolved',
              });
            }
          }
        }
      }
    }

    // 5. Update Rocket Instances
    const updatedRockets: RocketInstance[] = state.rockets.map((rkt) => {
      const rocketWos = updatedWorkOrders.filter((w) => w.rocketSerial === rkt.serialNumber);
      if (rocketWos.length === 0) return rkt;

      const completedCount = rocketWos.filter((w) => w.status === 'completed').length;
      const progressPct = Math.round((completedCount / rocketWos.length) * 100);

      const firstStageWos = rocketWos.filter((w) => w.stage === 'stage4_subsystems' || w.partName.includes('Stage 1') || w.partName.includes('Booster'));
      const secondStageWos = rocketWos.filter((w) => w.partName.includes('Stage 2') || w.partName.includes('Upper'));
      const enginesWos = rocketWos.filter((w) => w.partName.includes('Engine') || w.partName.includes('Turbopump') || w.partName.includes('Chamber'));
      const avionicsWos = rocketWos.filter((w) => w.stage === 'stage3_components' || w.partName.includes('Avionics') || w.partName.includes('Computer'));

      const calcReadiness = (wos: WorkOrder[]) =>
        wos.length === 0 ? 100 : Math.round((wos.filter((w) => w.status === 'completed').length / wos.length) * 100);

      const subReadiness = {
        first_stage: calcReadiness(firstStageWos),
        second_stage: calcReadiness(secondStageWos),
        engines: calcReadiness(enginesWos),
        avionics_gnc: calcReadiness(avionicsWos),
        structures: progressPct,
        propulsion_feed: Math.min(100, progressPct + 4),
      };

      const rocketNcrs = newNcrs.filter((n) => rocketWos.some((w) => w.id === n.workOrderId));
      const penalty = rocketNcrs.reduce((acc, n) => acc + (n.mrbDisposition === 'use_as_is' ? n.reliabilityImpactPct : 0.05), 0);
      const calculatedReliability = Math.max(88, Number((98.5 - penalty).toFixed(2)));

      let newStatus = rkt.status;
      if (progressPct >= 95 && rkt.status === 'in_production') {
        newStatus = 'testing';
      } else if (progressPct === 100 && rkt.qualificationTestsPassed.length >= 6 && rkt.status === 'testing') {
        newStatus = 'flight_ready';
      }

      return {
        ...rkt,
        productionProgressPct: progressPct,
        calculatedReliability,
        subsystemReadiness: subReadiness,
        status: newStatus,
      };
    });

    // 6. Vendor Development Progress Tick (Atmanirbhar Space)
    const updatedVendorPrograms: VendorProgram[] = state.vendorPrograms.map((vp) => {
      if (vp.status === 'active' && vp.indigenizationProgressPct < 100) {
        // Slow organic indigenization progress
        const delta = Number((this.rng.next() * 0.05).toFixed(2));
        const newPct = Math.min(100, Number((vp.indigenizationProgressPct + delta).toFixed(1)));
        let newStage = vp.currentStage;
        if (newPct >= 95) newStage = 'serial_production';
        else if (newPct >= 80) newStage = 'space_qualification';
        else if (newPct >= 60) newStage = 'prototype_fai';

        return {
          ...vp,
          indigenizationProgressPct: newPct,
          currentStage: newStage,
          status: newPct >= 100 ? ('certified' as const) : ('active' as const),
        };
      }
      return vp;
    });

    // 7. Financial Updates in INR
    const totalHourlyBurnINR = hourlyLaborCostINR + hourlyPowerCostINR + hourlyFacilityCostINR + scrapCostINR;
    const totalHourlyBurn = totalHourlyBurnINR / 85;

    const updatedFinancials: FinancialLedger = {
      ...state.financials,
      cashBalanceINR: state.financials.cashBalanceINR - totalHourlyBurnINR,
      cashBalance: state.financials.cashBalance - totalHourlyBurn,
      totalOpex: {
        ...state.financials.totalOpex,
        materialsINR: state.financials.totalOpex.materialsINR,
        materials: state.financials.totalOpex.materials,
        directLaborINR: state.financials.totalOpex.directLaborINR + hourlyLaborCostINR,
        directLabor: state.financials.totalOpex.directLabor + hourlyLaborCost,
        energyAndUtilitiesINR: state.financials.totalOpex.energyAndUtilitiesINR + hourlyPowerCostINR,
        energyAndUtilities: state.financials.totalOpex.energyAndUtilities + hourlyPowerCost,
        facilityOverheadINR: state.financials.totalOpex.facilityOverheadINR + hourlyFacilityCostINR,
        facilityOverhead: state.financials.totalOpex.facilityOverhead + hourlyFacilityCost,
        scrapAndReworkLossesINR: state.financials.totalOpex.scrapAndReworkLossesINR + scrapCostINR,
        scrapAndReworkLosses: state.financials.totalOpex.scrapAndReworkLosses + scrapCost,
      },
      history:
        nextTick % 24 === 0
          ? [
              ...state.financials.history.slice(-30),
              {
                tick: nextTick,
                cashINR: state.financials.cashBalanceINR - totalHourlyBurnINR,
                burnRateHourlyINR: totalHourlyBurnINR,
                cumulativeRevenueINR: state.financials.totalRevenueINR,
              },
            ]
          : state.financials.history,
    };

    const updatedSustainability: SustainabilityMetrics = {
      totalEnergyMWh: state.sustainability.totalEnergyMWh + energyUsedThisTick,
      scope1CO2eTonnes: state.sustainability.scope1CO2eTonnes + energyUsedThisTick * 0.11,
      scope2CO2eTonnes: state.sustainability.scope2CO2eTonnes + energyUsedThisTick * 0.25,
      scrapGeneratedKg: state.sustainability.scrapGeneratedKg + (scrapCostINR > 0 ? 120 : 0),
      recycledMaterialRatioPct: 91,
    };

    const runningMachinesCount = updatedMachines.filter((m) => m.status === 'running').length;
    const oee = Math.round((runningMachinesCount / Math.max(1, updatedMachines.length)) * 100);

    const completedRockets = updatedRockets.filter((r) => r.status === 'launched_success' || r.status === 'flight_ready').length;
    const inProdRockets = updatedRockets.filter((r) => r.status === 'in_production' || r.status === 'testing').length;
    const openNcrs = newNcrs.filter((n) => n.status !== 'resolved').length;

    const totalWos = updatedWorkOrders.length;
    const defectiveWos = updatedWorkOrders.filter((w) => w.defectsDetected > 0).length;
    const fpy = totalWos > 0 ? Math.round(((totalWos - defectiveWos) / totalWos) * 100) : 98;

    // Indigenization Ratio (% of components sourced domestically in India)
    const domesticSuppliers = state.suppliers.filter((s) => s.country === 'India').map((s) => s.id);
    const domesticPos = updatedPurchaseOrders.filter((p) => domesticSuppliers.includes(p.supplierId)).length;
    const indigenizationRatioPct = updatedPurchaseOrders.length > 0 ? Math.round((domesticPos / updatedPurchaseOrders.length) * 100) : 88;

    // Dynamic Bottleneck Detection across machine cells
    // Evaluates tool wear, active maintenance status, and cycle pacing
    let dynamicBottleneck = 'Nominal Operations (Balanced Flow)';
    const machinesByStress = [...updatedMachines].sort((a, b) => {
      const aScore =
        (a.toolingWearPct * 1.5) +
        (a.status === 'breakdown' ? 100 : a.status === 'running' ? 15 : 0) +
        ((a.telemetry?.axisJitterMicrons ?? 0) > 1.0 ? 30 : 0);
      const bScore =
        (b.toolingWearPct * 1.5) +
        (b.status === 'breakdown' ? 100 : b.status === 'running' ? 15 : 0) +
        ((b.telemetry?.axisJitterMicrons ?? 0) > 1.0 ? 30 : 0);
      return bScore - aScore;
    });

    if (machinesByStress.length > 0) {
      const worst = machinesByStress[0];
      if (worst.status === 'breakdown') {
        dynamicBottleneck = `${worst.bayName} (Station Offline)`;
      } else if (worst.toolingWearPct > 35 || (worst.telemetry?.axisJitterMicrons ?? 0) > 1.2) {
        dynamicBottleneck = `${worst.bayName} (Tool Wear ${worst.toolingWearPct.toFixed(0)}%)`;
      } else {
        dynamicBottleneck = 'Nominal Operations (Takt Flow Balanced)';
      }
    }

    const kpis: KPIs = {
      rocketsCompleted: completedRockets,
      rocketsInProduction: inProdRockets,
      onTimeDeliveryRate: 95,
      firstPassYieldRate: fpy,
      overallEquipmentEffectiveness: Math.max(72, oee),
      averageCostPerRocketINR: 2800000000, // ₹280 Crores
      averageCostPerRocket: 33000000,
      averageCycleTimeDays: 210,
      activeBottleneckStation: dynamicBottleneck,
      cashBalanceINR: updatedFinancials.cashBalanceINR,
      cashBalance: updatedFinancials.cashBalance,
      openNCRCount: openNcrs,
      fleetReliabilityScore: updatedRockets.length > 0 ? updatedRockets[0].calculatedReliability : 96.8,
      indigenizationRatioPct: Math.max(78, indigenizationRatioPct),
    };

    return {
      ...state,
      tick: nextTick,
      materials: updatedMaterials,
      purchaseOrders: updatedPurchaseOrders,
      shipments: updatedShipments,
      inventoryLots: newInventoryLots,
      machines: updatedMachines,
      workOrders: updatedWorkOrders,
      rockets: updatedRockets,
      ncrs: newNcrs,
      testRecords: newTestRecords,
      vendorPrograms: updatedVendorPrograms,
      events: newEvents.slice(-80),
      financials: updatedFinancials,
      sustainability: updatedSustainability,
      kpis,
    };
  }

  /**
   * Executes a qualification test campaign for a rocket instance.
   */
  public executeQualificationTest(
    state: SimState,
    rocketSerial: string,
    testType: TestRecord['testType']
  ): { state: SimState; testRecord: TestRecord } {
    const rocket = state.rockets.find((r) => r.serialNumber === rocketSerial);
    if (!rocket) throw new Error(`Rocket ${rocketSerial} not found`);

    const testNames: Record<TestRecord['testType'], string> = {
      hydro_proof: 'Stage 1 Cryogenic Hydrostatic Proof Test (1.25x MEOP)',
      cryo_leak: 'Helium Sniffer Mass-Spectrometer Cryo Leak Rate Check',
      vibro_acoustic: 'Acoustic Fatigue & Random Vibration Shaker Acceptance',
      emi_emc: 'SCL Avionics Radiated Immunity & Lightning Strike Checkout',
      turbopump_spin: 'Semi-Cryo Turbopump Cryogenic High-RPM Spin Test',
      engine_hotfire: 'SCE-200 Semi-Cryogenic Engine Hotfire (Mahendragiri Stand)',
      stage_static_fire: 'Stage 1 Full Cluster Hold-Down Static Fire (Pad 2)',
      wet_dress_rehearsal: 'Sriharikota (SDSC SHAR) Launch Pad Wet Dress Rehearsal',
    };

    const passChance = rocket.calculatedReliability / 100;
    const passed = this.rng.chance(passChance);

    const testRecord: TestRecord = {
      id: `tst_${this.rng.nextInt(10000, 99999)}`,
      testName: testNames[testType],
      rocketSerial,
      componentOrStage: testType.includes('engine') ? 'SCE-200 / CE-20' : 'Vehicle Stage',
      stage: 'stage5_testing',
      testType,
      testStandId: testType.includes('hotfire') ? 'mac_semi_cryo_stand_01' : 'mac_ct_scanner_01',
      operatorId: 'wrk_05',
      executedTick: state.tick,
      durationSeconds: testType === 'engine_hotfire' ? 120 : testType === 'stage_static_fire' ? 3.5 : 1800,
      peakPressureBar: testType === 'hydro_proof' ? 145 : undefined,
      thrustKn: testType.includes('hotfire') ? 2000 : undefined,
      vibrationGrms: testType === 'vibro_acoustic' ? 14.8 : undefined,
      status: passed ? 'passed' : 'failed',
      notes: passed ? 'All sensors nominal within ISRO 3-sigma specifications.' : 'Pressure transducer fluctuation exceeded allowable margin.',
      telemetryAnomalyDetected: !passed,
    };

    const updatedRockets = state.rockets.map((r) => {
      if (r.serialNumber === rocketSerial && passed) {
        const tests = Array.from(new Set([...r.qualificationTestsPassed, testType]));
        return {
          ...r,
          qualificationTestsPassed: tests,
          status: tests.length >= 6 ? 'flight_ready' : r.status,
        };
      }
      return r;
    });

    const newEvent: SimEvent = {
      id: `evt_test_${testRecord.id}_${state.tick}_${this.rng.nextInt(1000, 9999)}`,
      tick: state.tick,
      timestamp: this.formatSimTime(state.tick),
      category: 'testing',
      severity: passed ? 'info' : 'error',
      title: `${testRecord.testName}: ${passed ? 'PASSED & CERTIFIED' : 'ANOMALY LOGGED'}`,
      description: `Results logged for vehicle ${rocketSerial} at Mahendragiri Propulsion Complex.`,
      resolved: passed,
    };

    return {
      state: {
        ...state,
        rockets: updatedRockets,
        testRecords: [...state.testRecords, testRecord],
        events: [...state.events, newEvent],
      },
      testRecord,
    };
  }

  /**
   * Simulates orbital launch from Sriharikota (SDSC SHAR).
   */
  public launchRocket(
    state: SimState,
    rocketSerial: string
  ): { state: SimState; report: LaunchReport } {
    const rocket = state.rockets.find((r) => r.serialNumber === rocketSerial);
    if (!rocket) throw new Error(`Rocket ${rocketSerial} not found`);

    const openCriticalNcrs = state.ncrs.filter(
      (n) => n.status !== 'resolved' && (n.severity === 'critical' || n.severity === 'major')
    );

    let isSuccess = false;
    let rootCause = '';
    let maxAlt = 605;
    let flightSec = 610;
    let logs: { timeSec: number; altitudeKm: number; velocityKmh: number; dynamicPressureKpa: number; thrustKn: number; event: string }[] = [];

    // Condition 1: Structural Assembly Completion Check
    if (rocket.productionProgressPct < 50) {
      isSuccess = false;
      maxAlt = 1.2;
      flightSec = 14;
      rootCause = `Catastrophic primary fuselage disintegration at T+14s: Vehicle structural integration was only at ${rocket.productionProgressPct.toFixed(0)}%. Aerodynamic drag sheared incomplete interstage fastenings.`;
      logs = [
        { timeSec: 0, altitudeKm: 0, velocityKmh: 0, dynamicPressureKpa: 0, thrustKn: 2000, event: 'LIFTOFF FROM SRIHARIKOTA (SHAR PAD 2)' },
        { timeSec: 8, altitudeKm: 0.4, velocityKmh: 120, dynamicPressureKpa: 4.2, thrustKn: 2000, event: 'INITIAL PITCH KICK ATTEMPT' },
        { timeSec: 14, altitudeKm: 1.2, velocityKmh: 280, dynamicPressureKpa: 11.5, thrustKn: 0, event: '💥 STRUCTURAL COLLAPSE - INCOMPLETE FUSELAGE FAILURE' },
      ];
    } else if (rocket.productionProgressPct < 98) {
      isSuccess = false;
      maxAlt = 14;
      flightSec = 58;
      rootCause = `Aerodynamic breakup at Max-Q (T+58s, Alt 14 km): Incomplete propellant tank skin stringers (${rocket.productionProgressPct.toFixed(0)}% complete) buckled under 42 kPa dynamic pressure.`;
      logs = [
        { timeSec: 0, altitudeKm: 0, velocityKmh: 0, dynamicPressureKpa: 0, thrustKn: 2000, event: 'LIFTOFF FROM SRIHARIKOTA (SHAR PAD 2)' },
        { timeSec: 32, altitudeKm: 6.2, velocityKmh: 980, dynamicPressureKpa: 22.4, thrustKn: 2100, event: 'TRANSONIC REGIME ACCELERATION' },
        { timeSec: 58, altitudeKm: 14.0, velocityKmh: 1950, dynamicPressureKpa: 42.1, thrustKn: 0, event: '💥 MAX-Q TANK RUPTURE - INCOMPLETE SKIN ASSEMBLY FAILED' },
      ];
    } else if (openCriticalNcrs.length > 0) {
      isSuccess = false;
      maxAlt = 68;
      flightSec = 148;
      rootCause = `Stage 1 catastrophic failure at T+148s: Flight anomaly directly caused by unresolved critical non-conformance [${openCriticalNcrs[0].ncrNumber}: ${openCriticalNcrs[0].description}].`;
      logs = [
        { timeSec: 0, altitudeKm: 0, velocityKmh: 0, dynamicPressureKpa: 0, thrustKn: 2000, event: 'LIFTOFF FROM SRIHARIKOTA (SHAR PAD 2)' },
        { timeSec: 58, altitudeKm: 14, velocityKmh: 1950, dynamicPressureKpa: 39.2, thrustKn: 2150, event: 'MAX-Q CLEARED' },
        { timeSec: 148, altitudeKm: 65, velocityKmh: 6800, dynamicPressureKpa: 1.1, thrustKn: 0, event: `💥 TURBOPUMP FAILURE - TRACED TO OPEN NCR ${openCriticalNcrs[0].ncrNumber}` },
      ];
    } else if (rocket.qualificationTestsPassed.length < 4) {
      isSuccess = false;
      maxAlt = 85;
      flightSec = 162;
      rootCause = `CE-20 Stage 2 ignition failure at T+162s: Stage had not passed mandatory cryogenic leak or engine hotfire qualification testing.`;
      logs = [
        { timeSec: 0, altitudeKm: 0, velocityKmh: 0, dynamicPressureKpa: 0, thrustKn: 2000, event: 'LIFTOFF FROM SRIHARIKOTA (SHAR PAD 2)' },
        { timeSec: 58, altitudeKm: 14, velocityKmh: 1950, dynamicPressureKpa: 39.2, thrustKn: 2150, event: 'MAX-Q CLEARED' },
        { timeSec: 148, altitudeKm: 65, velocityKmh: 6800, dynamicPressureKpa: 1.1, thrustKn: 2200, event: 'STAGE 1 MECO' },
        { timeSec: 152, altitudeKm: 68, velocityKmh: 6850, dynamicPressureKpa: 0.6, thrustKn: 0, event: 'STAGE SEPARATION' },
        { timeSec: 162, altitudeKm: 78, velocityKmh: 7100, dynamicPressureKpa: 0, thrustKn: 0, event: '💥 STAGE 2 UNQUALIFIED HOTFIRE ANOMALY DETECTED' },
      ];
    } else {
      // 100% Assembled, no critical NCRs, tests completed:
      const reliability = rocket.calculatedReliability / 100;
      isSuccess = this.rng.chance(reliability);
      maxAlt = isSuccess ? 605 : 120;
      flightSec = isSuccess ? 610 : 218;
      if (!isSuccess) {
        rootCause = 'Telemetry fluctuation on second-stage gimbal actuator seal during vacuum orbital burn.';
        logs = [
          { timeSec: 0, altitudeKm: 0, velocityKmh: 0, dynamicPressureKpa: 0, thrustKn: 2000, event: 'LIFTOFF FROM SRIHARIKOTA (SHAR PAD 2)' },
          { timeSec: 58, altitudeKm: 14, velocityKmh: 1950, dynamicPressureKpa: 39.2, thrustKn: 2150, event: 'MAX-Q CLEARED' },
          { timeSec: 148, altitudeKm: 65, velocityKmh: 6800, dynamicPressureKpa: 1.1, thrustKn: 2200, event: 'STAGE 1 MECO' },
          { timeSec: 152, altitudeKm: 68, velocityKmh: 6850, dynamicPressureKpa: 0.6, thrustKn: 0, event: 'STAGE SEPARATION' },
          { timeSec: 160, altitudeKm: 78, velocityKmh: 7100, dynamicPressureKpa: 0, thrustKn: 200, event: 'STAGE 2 CE-20 CRYOGENIC IGNITION' },
          { timeSec: 218, altitudeKm: 120, velocityKmh: 10200, dynamicPressureKpa: 0, thrustKn: 0, event: '💥 SECOND STAGE GIMBAL DRIFT - ORBIT MISSED' },
        ];
      } else {
        logs = [
          { timeSec: 0, altitudeKm: 0, velocityKmh: 0, dynamicPressureKpa: 0, thrustKn: 2000, event: 'LIFTOFF FROM SRIHARIKOTA (SHAR PAD 2)' },
          { timeSec: 58, altitudeKm: 14, velocityKmh: 1950, dynamicPressureKpa: 39.2, thrustKn: 2150, event: 'MAX-Q CLEARED (NOMINAL BUFFETING)' },
          { timeSec: 148, altitudeKm: 65, velocityKmh: 6800, dynamicPressureKpa: 1.1, thrustKn: 2200, event: 'STAGE 1 MAIN ENGINE CUTOFF (MECO)' },
          { timeSec: 152, altitudeKm: 68, velocityKmh: 6850, dynamicPressureKpa: 0.6, thrustKn: 0, event: 'STAGE SEPARATION NOMINAL' },
          { timeSec: 160, altitudeKm: 78, velocityKmh: 7100, dynamicPressureKpa: 0, thrustKn: 200, event: 'STAGE 2 CE-20 CRYOGENIC IGNITION' },
          { timeSec: 215, altitudeKm: 115, velocityKmh: 9400, dynamicPressureKpa: 0, thrustKn: 200, event: 'PAYLOAD FAIRING JETTISON OVER BAY OF BENGAL' },
          { timeSec: 580, altitudeKm: 600, velocityKmh: 27800, dynamicPressureKpa: 0, thrustKn: 200, event: 'ORBITAL INJECTION ACHIEVED (600 KM SSPO)' },
        ];
      }
    }

    const report: LaunchReport = {
      rocketSerial,
      missionName: `V-Aero Flight VA-D${this.rng.nextInt(10, 99)}`,
      payloadMassKg: 6200,
      targetOrbit: 'Low Earth Polar Sun-Synchronous (600 km)',
      timestamp: this.formatSimTime(state.tick),
      overallSuccess: isSuccess,
      maxAltitudeKm: maxAlt,
      apogeeKm: isSuccess ? maxAlt + 3 : maxAlt,
      perigeeKm: isSuccess ? maxAlt - 7 : 0,
      flightDurationSeconds: flightSec,
      telemetryLogs: logs,
      customerSatisfactionScore: isSuccess ? 99 : 12,
      financialRevenueINR: isSuccess ? 2800000000 : 0, // ₹280 Crores
      financialRevenue: isSuccess ? 33000000 : 0,
      rootCauseAnalysis: !isSuccess ? rootCause : undefined,
    };

    const updatedRockets = state.rockets.map((r) => {
      if (r.serialNumber === rocketSerial) {
        return {
          ...r,
          status: isSuccess ? ('launched_success' as const) : ('launched_failed' as const),
          launchTick: state.tick,
          launchReport: report,
        };
      }
      return r;
    });

    const revenueGainedINR = isSuccess ? 2800000000 : 0;
    const revenueGainedUSD = revenueGainedINR / 85;

    const updatedFinancials: FinancialLedger = {
      ...state.financials,
      cashBalanceINR: state.financials.cashBalanceINR + revenueGainedINR,
      cashBalance: state.financials.cashBalance + revenueGainedUSD,
      totalRevenueINR: state.financials.totalRevenueINR + revenueGainedINR,
      totalRevenue: state.financials.totalRevenue + revenueGainedUSD,
    };

    const newEvent: SimEvent = {
      id: `evt_launch_${rocketSerial}_${state.tick}`,
      tick: state.tick,
      timestamp: this.formatSimTime(state.tick),
      category: 'testing',
      severity: isSuccess ? 'info' : 'critical',
      title: `Sriharikota Mission Outcome: ${report.missionName} ${isSuccess ? 'SUCCESSFUL INSERTION' : 'LAUNCH FAILURE'}`,
      description: isSuccess
        ? `Rocket ${rocketSerial} successfully deployed payload to 600km orbit. NSIL milestone revenue of ₹${(revenueGainedINR / 1e7).toFixed(1)} Crores received.`
        : `Mission failure investigation convened. Root cause: ${report.rootCauseAnalysis}`,
      impactMetrics: { costINR: revenueGainedINR, costUSD: revenueGainedUSD },
      resolved: true,
    };

    return {
      state: {
        ...state,
        rockets: updatedRockets,
        financials: updatedFinancials,
        events: [...state.events, newEvent],
        cumulativeRocketsBuilt: state.cumulativeRocketsBuilt + 1,
      },
      report,
    };
  }

  /**
   * Helper to format simulated tick into Indian Aerospace Calendar string:
   * Displays Day, Time, and Active Shop Shift (Shift A: 06:00-14:00, Shift B: 14:00-22:00, Shift C: 22:00-06:00).
   */
  public formatSimTime(tick: number): string {
    const totalHours = tick;
    const year = Math.floor(totalHours / (24 * 365)) + 1;
    const dayOfYear = Math.floor((totalHours % (24 * 365)) / 24) + 1;
    const hour = totalHours % 24;
    const shift = hour >= 6 && hour < 14 ? 'Shift A' : hour >= 14 && hour < 22 ? 'Shift B' : 'Shift C';
    return `Y${year} D${String(dayOfYear).padStart(3, '0')} ${String(hour).padStart(2, '0')}:00 (${shift})`;
  }
}
