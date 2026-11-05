/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface MissionPayloadHandle {
  payloadGroup: THREE.Group;
  deploySolarArrays: (deployed: boolean) => void;
  updateAnimation: (deltaSec: number, flightSec: number, deployed: boolean) => void;
}

/**
 * Creates authentic 3-12 part procedural spacecraft payload models
 */
export function buildMissionSpecificPayload(missionId: string): MissionPayloadHandle {
  const rootGroup = new THREE.Group();

  // =========================================================================
  // 0. NVS-03: NavIC SECOND-GENERATION NAVIGATION SATELLITE (GSLV-F18)
  // =========================================================================
  if (missionId === 'gslv_nvs03') {
    // A. Main Gold MLI Spacecraft Bus (as seen clearly in the photos!)
    const busGeom = new THREE.BoxGeometry(1.6, 1.8, 1.5);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Gold Multi-Layer Insulation (MLI)
      metalness: 0.95,
      roughness: 0.18,
    });
    const bus = new THREE.Mesh(busGeom, busMat);
    bus.position.y = 0.9;
    rootGroup.add(bus);

    // Silver Thermal Radiator Side Panels
    const radGeom = new THREE.PlaneGeometry(1.4, 1.5);
    const radMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.9,
      roughness: 0.1,
      side: THREE.DoubleSide,
    });
    const rad1 = new THREE.Mesh(radGeom, radMat);
    rad1.position.set(0.81, 0.9, 0);
    rad1.rotation.y = Math.PI / 2;
    const rad2 = new THREE.Mesh(radGeom, radMat);
    rad2.position.set(-0.81, 0.9, 0);
    rad2.rotation.y = Math.PI / 2;
    rootGroup.add(rad1, rad2);

    // B. Earth-Facing Navigation Antenna Deck (Top)
    const deckGeom = new THREE.CylinderGeometry(0.75, 0.82, 0.25, 24);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    const deck = new THREE.Mesh(deckGeom, deckMat);
    deck.position.set(0, 1.9, 0);
    rootGroup.add(deck);

    // S-Band / L1 / L5 Helical Navigation Antennas & Horn Feeds
    const antMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
    const antGeom = new THREE.CylinderGeometry(0.18, 0.28, 0.7, 16);
    const antMain = new THREE.Mesh(antGeom, antMat);
    antMain.position.set(0, 2.3, 0);
    rootGroup.add(antMain);

    // 4 Corner Navigation Horns
    for (let h = 0; h < 4; h++) {
      const angle = (h * Math.PI) / 2 + Math.PI / 4;
      const hornGeom = new THREE.ConeGeometry(0.1, 0.45, 12);
      const horn = new THREE.Mesh(hornGeom, antMat);
      horn.position.set(Math.cos(angle) * 0.5, 2.15, Math.sin(angle) * 0.5);
      rootGroup.add(horn);
    }

    // C. Indigenous Rubidium Atomic Frequency Standard (RAFS) Housing
    const rafsGeom = new THREE.BoxGeometry(0.65, 0.45, 0.45);
    const rafsMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    const rafs = new THREE.Mesh(rafsGeom, rafsMat);
    rafs.position.set(0, 0.9, 0.82);
    rootGroup.add(rafs);

    // D. Deployable NavIC Solar Arrays (Left & Right Wings)
    const wingGeom = new THREE.BoxGeometry(3.2, 0.08, 1.3);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Silicon photovoltaic cells (dark cyan-blue)
      metalness: 0.95,
      roughness: 0.12,
    });

    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-0.85, 0.9, 0);
    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.set(-1.6, 0, 0);
    leftWingPivot.add(leftWing);
    rootGroup.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(0.85, 0.9, 0);
    const rightWing = new THREE.Mesh(wingGeom, wingMat);
    rightWing.position.set(1.6, 0, 0);
    rightWingPivot.add(rightWing);
    rootGroup.add(rightWingPivot);

    // E. Payload Adapter / Separation Clamp Ring at base
    const adapterGeom = new THREE.CylinderGeometry(0.9, 1.1, 0.5, 32);
    const adapterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 });
    const adapter = new THREE.Mesh(adapterGeom, adapterMat);
    adapter.position.set(0, -0.2, 0);
    rootGroup.add(adapter);

    // Stowed by default inside fairing, deployed in GTO
    leftWingPivot.scale.set(0.1, 1, 1);
    rightWingPivot.scale.set(0.1, 1, 1);

    return {
      payloadGroup: rootGroup,
      deploySolarArrays: (deployed) => {
        leftWingPivot.scale.set(deployed ? 1 : 0.1, 1, 1);
        rightWingPivot.scale.set(deployed ? 1 : 0.1, 1, 1);
      },
      updateAnimation: (_delta, _sec, deployed) => {
        if (deployed) {
          leftWingPivot.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
          rightWingPivot.rotation.y = -Math.sin(Date.now() * 0.001) * 0.05;
        }
      },
    };
  }

  // =========================================================================
  // 1. ADITYA-L1: SOLAR CORONAGRAPH & UV IMAGER OBSERVATORY
  // =========================================================================
  if (missionId === 'aditya_l1') {
    // A. Main Gold MLI Spacecraft Bus
    const busGeom = new THREE.BoxGeometry(1.6, 2.0, 1.6);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Gold Multi-Layer Insulation
      metalness: 0.95,
      roughness: 0.15,
    });
    const bus = new THREE.Mesh(busGeom, busMat);
    rootGroup.add(bus);

    // B. VELC (Visible Emission Line Coronagraph) Optical Telescope
    const velcGeom = new THREE.CylinderGeometry(0.42, 0.42, 1.8, 24);
    const velcMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark sun-aperture baffle
      metalness: 0.8,
      roughness: 0.3,
    });
    const velc = new THREE.Mesh(velcGeom, velcMat);
    velc.position.set(0, 1.5, 0);
    rootGroup.add(velc);

    // VELC Aperture Sunshield Cap
    const capGeom = new THREE.CylinderGeometry(0.55, 0.42, 0.4, 24);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const cap = new THREE.Mesh(capGeom, capMat);
    cap.position.set(0, 2.3, 0);
    rootGroup.add(cap);

    // C. SUIT (Solar Ultraviolet Imaging Telescope) Side Cylinder
    const suitGeom = new THREE.CylinderGeometry(0.28, 0.28, 1.1, 16);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });
    const suit = new THREE.Mesh(suitGeom, suitMat);
    suit.position.set(0.65, 0.5, 0.65);
    rootGroup.add(suit);

    // D. Deployable Solar Wings (Left & Right)
    const wingGeom = new THREE.BoxGeometry(2.8, 0.08, 1.1);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Silicon photovoltaic cells
      metalness: 0.9,
      roughness: 0.15,
    });

    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-0.8, 0, 0);
    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.set(-1.4, 0, 0);
    leftWingPivot.add(leftWing);
    rootGroup.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(0.8, 0, 0);
    const rightWing = new THREE.Mesh(wingGeom, wingMat);
    rightWing.position.set(1.4, 0, 0);
    rightWingPivot.add(rightWing);
    rootGroup.add(rightWingPivot);

    // E. 6-Meter Magnetometer Boom (extends outward in orbit)
    const boomGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.rotation.z = Math.PI / 3;
    boom.position.set(1.5, -0.6, 0);
    boom.scale.set(0.1, 0.1, 0.1); // Stowed initially
    rootGroup.add(boom);

    return {
      payloadGroup: rootGroup,
      deploySolarArrays: (deployed) => {
        leftWingPivot.scale.set(deployed ? 1 : 0.2, 1, 1);
        rightWingPivot.scale.set(deployed ? 1 : 0.2, 1, 1);
        boom.scale.set(deployed ? 1 : 0.1, deployed ? 1 : 0.1, deployed ? 1 : 0.1);
      },
      updateAnimation: (_delta, _sec, deployed) => {
        if (deployed) {
          leftWingPivot.rotation.y = Math.sin(Date.now() * 0.001) * 0.08;
          rightWingPivot.rotation.y = -Math.sin(Date.now() * 0.001) * 0.08;
        }
      },
    };
  }

  // =========================================================================
  // 2. CHANDRAYAAN-4: LUNAR LANDER + ASCENDER SAMPLE RETURN MODULE
  // =========================================================================
  if (missionId === 'chandrayaan_4') {
    // A. Main Octagonal Descent Module Body
    const landerGeom = new THREE.CylinderGeometry(1.4, 1.6, 1.4, 8);
    const landerMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.7,
      roughness: 0.35,
    });
    const landerBody = new THREE.Mesh(landerGeom, landerMat);
    rootGroup.add(landerBody);

    // Gold Insulated Spherical Propellant Tanks (4 clusters)
    const tankGeom = new THREE.SphereGeometry(0.48, 16, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95, roughness: 0.1 });
    for (let t = 0; t < 4; t++) {
      const tank = new THREE.Mesh(tankGeom, tankMat);
      const angle = (t * Math.PI) / 2;
      tank.position.set(Math.cos(angle) * 1.1, 0, Math.sin(angle) * 1.1);
      rootGroup.add(tank);
    }

    // 4 Articulated Landing Legs with Gold Footpads
    const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
    for (let l = 0; l < 4; l++) {
      const legGroup = new THREE.Group();
      const angle = (l * Math.PI) / 2 + Math.PI / 4;
      legGroup.rotation.y = angle;

      // Upper strut
      const strutGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8);
      const strut = new THREE.Mesh(strutGeom, legMat);
      strut.rotation.z = Math.PI / 4;
      strut.position.set(0.6, -0.6, 0);
      legGroup.add(strut);

      // Footpad
      const padGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12);
      const pad = new THREE.Mesh(padGeom, padMat);
      pad.position.set(1.15, -1.15, 0);
      legGroup.add(pad);

      rootGroup.add(legGroup);
    }

    // B. Top Ascent Stage & Sample Return Capsule
    const ascenderGeom = new THREE.CylinderGeometry(0.7, 0.9, 0.8, 8);
    const ascenderMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.15 });
    const ascender = new THREE.Mesh(ascenderGeom, ascenderMat);
    ascender.position.set(0, 1.05, 0);
    rootGroup.add(ascender);

    // Conical Earth Atmospheric Re-entry Sample Capsule on Top
    const sampleCapGeom = new THREE.ConeGeometry(0.55, 0.65, 16);
    const sampleCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const sampleCap = new THREE.Mesh(sampleCapGeom, sampleCapMat);
    sampleCap.position.set(0, 1.7, 0);
    rootGroup.add(sampleCap);

    return {
      payloadGroup: rootGroup,
      deploySolarArrays: () => {},
      updateAnimation: (_delta, _sec) => {},
    };
  }

  // =========================================================================
  // 3. GAGANYAAN-1: HUMAN CREW MODULE & SERVICE MODULE (HRLV)
  // =========================================================================
  if (missionId === 'gaganyaan_hrlv') {
    // A. Service Module (Cylindrical base with propellant feed)
    const smGeom = new THREE.CylinderGeometry(1.4, 1.4, 1.5, 32);
    const smMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.7 });
    const sm = new THREE.Mesh(smGeom, smMat);
    sm.position.set(0, -0.6, 0);
    rootGroup.add(sm);

    // Service Module Engine Nozzle Bell
    const smNozzleGeom = new THREE.ConeGeometry(0.4, 0.6, 16, 1, true);
    const smNozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const smNozzle = new THREE.Mesh(smNozzleGeom, smNozzleMat);
    smNozzle.position.set(0, -1.6, 0);
    rootGroup.add(smNozzle);

    // B. Conical Human Crew Module (400 km LEO Vyomnauts)
    const cmGeom = new THREE.CylinderGeometry(0.7, 1.42, 1.8, 32);
    const cmMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.8,
    });
    const cm = new THREE.Mesh(cmGeom, cmMat);
    cm.position.set(0, 1.0, 0);
    rootGroup.add(cm);

    // ISRO Saffron Tricolor Band on Crew Module
    const bandGeom = new THREE.CylinderGeometry(1.1, 1.25, 0.35, 32);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const band = new THREE.Mesh(bandGeom, bandMat);
    band.position.set(0, 0.8, 0);
    rootGroup.add(band);

    // Optical Crew Windows (Dual viewports)
    const winGeom = new THREE.CircleGeometry(0.14, 16);
    const winMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.05 });
    const win1 = new THREE.Mesh(winGeom, winMat);
    win1.position.set(0.35, 1.1, 1.15);
    win1.rotation.y = 0.2;
    rootGroup.add(win1);

    const win2 = new THREE.Mesh(winGeom, winMat);
    win2.position.set(-0.35, 1.1, 1.15);
    win2.rotation.y = -0.2;
    rootGroup.add(win2);

    // C. Hexagonal Deployable Solar Arrays (2 wings on Service Module)
    const solarGeom = new THREE.BoxGeometry(2.4, 0.06, 0.9);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.95,
      roughness: 0.15,
    });

    const leftSolar = new THREE.Mesh(solarGeom, solarMat);
    leftSolar.position.set(-2.4, -0.6, 0);
    rootGroup.add(leftSolar);

    const rightSolar = new THREE.Mesh(solarGeom, solarMat);
    rightSolar.position.set(2.4, -0.6, 0);
    rootGroup.add(rightSolar);

    return {
      payloadGroup: rootGroup,
      deploySolarArrays: (deployed) => {
        leftSolar.scale.set(deployed ? 1 : 0.1, 1, 1);
        rightSolar.scale.set(deployed ? 1 : 0.1, 1, 1);
      },
      updateAnimation: (_delta, _sec) => {},
    };
  }

  // =========================================================================
  // 4. NISAR: 12-METER DEPLOYABLE RADAR MESH BOOM & SWEEPSAR
  // =========================================================================
  if (missionId === 'nisar_radar') {
    // A. Main Radar Electronics Bay
    const bayGeom = new THREE.BoxGeometry(1.6, 1.8, 1.5);
    const bayMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
    const bay = new THREE.Mesh(bayGeom, bayMat);
    rootGroup.add(bay);

    // B. Articulated Carbon-Composite Boom
    const boomGeom = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.5 });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.rotation.z = Math.PI / 3.5;
    boom.position.set(1.4, 1.2, 0);
    rootGroup.add(boom);

    // C. 12-Meter Deployable Gold Wire-Mesh Radar Reflector Dish
    const dishGeom = new THREE.CylinderGeometry(2.6, 0.6, 0.5, 32, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold wire mesh
      metalness: 0.95,
      roughness: 0.15,
      wireframe: true,
    });
    const dish = new THREE.Mesh(dishGeom, dishMat);
    dish.position.set(2.7, 2.5, 0);
    dish.rotation.z = -Math.PI / 4;
    dish.rotation.x = Math.PI / 6;
    rootGroup.add(dish);

    // D. Solar Wings
    const wingGeom = new THREE.BoxGeometry(2.6, 0.08, 0.9);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    const wingL = new THREE.Mesh(wingGeom, wingMat);
    wingL.position.set(-2.0, -0.2, 0);
    rootGroup.add(wingL);

    return {
      payloadGroup: rootGroup,
      deploySolarArrays: (deployed) => {
        dish.scale.set(deployed ? 1 : 0.2, deployed ? 1 : 0.2, deployed ? 1 : 0.2);
        wingL.scale.set(deployed ? 1 : 0.1, 1, 1);
      },
      updateAnimation: (_delta, _sec, deployed) => {
        if (deployed) {
          dish.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
        }
      },
    };
  }

  // =========================================================================
  // 5. BHARATIYA ANTARIKSH STATION (BAS-1): 20-TONNE HABITAT
  // =========================================================================
  // Core Pressurized Habitat Module
  const habGeom = new THREE.CylinderGeometry(1.6, 1.6, 3.8, 32);
  const habMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.85 });
  const hab = new THREE.Mesh(habGeom, habMat);
  rootGroup.add(hab);

  // APAS Docking Hub on Top
  const ringGeom = new THREE.TorusGeometry(0.8, 0.18, 16, 24);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 2.0, 0);
  rootGroup.add(ring);

  // Indian Tricolor Ring Banner
  const triGeom = new THREE.CylinderGeometry(1.62, 1.62, 0.6, 32);
  const triMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
  const tri = new THREE.Mesh(triGeom, triMat);
  tri.position.set(0, 0, 0);
  rootGroup.add(tri);

  // Deployable High-Output Solar Array Wings
  const stationArrayGeom = new THREE.BoxGeometry(3.6, 0.08, 1.2);
  const stationArrayMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.95,
    roughness: 0.1,
  });
  const wing1 = new THREE.Mesh(stationArrayGeom, stationArrayMat);
  wing1.position.set(-2.8, 0, 0);
  rootGroup.add(wing1);

  const wing2 = new THREE.Mesh(stationArrayGeom, stationArrayMat);
  wing2.position.set(2.8, 0, 0);
  rootGroup.add(wing2);

  return {
    payloadGroup: rootGroup,
    deploySolarArrays: (deployed) => {
      wing1.scale.set(deployed ? 1 : 0.1, 1, 1);
      wing2.scale.set(deployed ? 1 : 0.1, 1, 1);
    },
    updateAnimation: (_delta, _sec) => {},
  };
}
