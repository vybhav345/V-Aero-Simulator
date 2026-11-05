/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Procedural texture generator for celestial bodies (Zero external 404 dependencies)
 */
export function createProceduralCanvasTexture(
  type: 'earth' | 'moon' | 'sun' | 'polar_earth' | 'clouds',
  width = 1024,
  height = 512
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (type === 'sun') {
    // Blazing dynamic solar photosphere with granulation and flares
    const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 2);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.25, '#fde047');
    grad.addColorStop(0.55, '#f59e0b');
    grad.addColorStop(0.85, '#d97706');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Solar granulation cells
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 24 + 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 235, 120, 0.25)' : 'rgba(180, 83, 9, 0.35)';
      ctx.fill();
    }

    // Sunspots & magnetic flux tubes
    for (let s = 0; s < 12; s++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const sr = Math.random() * 14 + 5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = '#451a03';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(146, 64, 14, 0.4)';
      ctx.fill();
    }
  } else if (type === 'moon') {
    // Lunar south pole regolith, crater rims, and permanent shadow basins
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, width, height);

    // Base noise and tone variations
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 80 + 20;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.18)';
      ctx.fill();
    }

    // Realistic impact craters with bright rims and deep dark shadowed floors
    for (let c = 0; c < 120; c++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = Math.random() * 28 + 4;

      // Outer raised ejecta rim
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 245, 249, 0.35)';
      ctx.fill();

      // Shadowed interior floor (Lunar South Pole dramatic low-angle illumination)
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Sunlit rim crescent
      ctx.beginPath();
      ctx.arc(cx + cr * 0.25, cy - cr * 0.25, cr * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.fill();
    }

    // Permanent shadow region (PSR) ice sheen near the pole
    ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.88, width * 0.4, height * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'polar_earth') {
    // Earth with distinct focus on ice sheets, Himalayas, and Arctic/Antarctic ice
    ctx.fillStyle = '#0a2342'; // Deep oceanic blue
    ctx.fillRect(0, 0, width, height);

    // Continents
    ctx.fillStyle = '#1e3a1e';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 90 + 35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar ice cap and glaciated mountain ranges (Himalayas & Arctic)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height * 0.22); // Arctic ice cap
    ctx.fillRect(0, height * 0.8, width, height * 0.2); // Antarctic ice cap

    // Himalayan glaciated ridge
    ctx.beginPath();
    ctx.ellipse(width * 0.62, height * 0.42, 60, 20, Math.PI / 10, 0, Math.PI * 2);
    ctx.fill();

    // Swirling polar cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let c = 0; c < 50; c++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 60 + 20, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'clouds') {
    // Transparent atmospheric weather system cloud cover
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let c = 0; c < 140; c++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 75 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // High-Resolution Photorealistic Earth with Indian Subcontinent, Bay of Bengal & Atmosphere
    // Deep oceanic blue
    ctx.fillStyle = '#06162d';
    ctx.fillRect(0, 0, width, height);

    // Oceanic shelf / coastal shallower waters
    ctx.fillStyle = '#0c3560';
    for (let o = 0; o < 35; o++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 80 + 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Helper to map Lat/Lon to Canvas X/Y in Equirectangular projection
    const toCanvasX = (lonDeg: number) => ((lonDeg + 180) / 360) * width;
    const toCanvasY = (latDeg: number) => ((90 - latDeg) / 180) * height;

    // 1. AFRICA & MIDDLE EAST
    ctx.fillStyle = '#654321'; // Warm earth/desert
    ctx.beginPath();
    ctx.ellipse(toCanvasX(25), toCanvasY(5), width * 0.14, height * 0.28, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e3a1e'; // Central African greenery
    ctx.beginPath();
    ctx.ellipse(toCanvasX(22), toCanvasY(0), width * 0.08, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. EURASIA CONTINENT BASE
    ctx.fillStyle = '#2d4a22';
    ctx.beginPath();
    ctx.ellipse(toCanvasX(75), toCanvasY(48), width * 0.26, height * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. INDIAN SUBCONTINENT (Authentic triangular geometry as seen in ISRO broadcast!)
    // Coastal shallow shelf glow around India
    ctx.fillStyle = '#0e4a7b';
    ctx.beginPath();
    ctx.moveTo(toCanvasX(66), toCanvasY(26));
    ctx.lineTo(toCanvasX(78), toCanvasY(5)); // South of Kanyakumari
    ctx.lineTo(toCanvasX(92), toCanvasY(24));
    ctx.closePath();
    ctx.fill();

    // Indian Landmass Peninsula
    ctx.fillStyle = '#166534'; // Lush green coastal plains
    ctx.beginPath();
    ctx.moveTo(toCanvasX(68), toCanvasY(24)); // Gujarat / Saurashtra
    ctx.lineTo(toCanvasX(72), toCanvasY(32)); // Punjab / Kashmir
    ctx.lineTo(toCanvasX(80), toCanvasY(31)); // Himalayas
    ctx.lineTo(toCanvasX(90), toCanvasY(26)); // Bengal / Assam
    ctx.lineTo(toCanvasX(85), toCanvasY(19)); // Andhra / Odisha
    ctx.lineTo(toCanvasX(80), toCanvasY(13.7)); // Sriharikota (SDSC SHAR)
    ctx.lineTo(toCanvasX(77.5), toCanvasY(8.1)); // Kanyakumari (Cape Comorin)
    ctx.lineTo(toCanvasX(75.5), toCanvasY(12)); // Malabar / Kerala coast
    ctx.lineTo(toCanvasX(72.8), toCanvasY(19)); // Konkan / Mumbai coast
    ctx.closePath();
    ctx.fill();

    // Deccan Plateau Interior (warm khaki/earth tone)
    ctx.fillStyle = '#78593a';
    ctx.beginPath();
    ctx.moveTo(toCanvasX(72), toCanvasY(23));
    ctx.lineTo(toCanvasX(84), toCanvasY(21));
    ctx.lineTo(toCanvasX(78), toCanvasY(11));
    ctx.closePath();
    ctx.fill();

    // Sri Lanka Teardrop Island
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(toCanvasX(80.7), toCanvasY(7.5), width * 0.012, height * 0.02, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Andaman and Nicobar Islands Arc (right along the GSLV flight corridor!)
    ctx.fillStyle = '#22c55e';
    for (let an = 0; an < 7; an++) {
      ctx.beginPath();
      ctx.arc(toCanvasX(92.7 + Math.random() * 0.8), toCanvasY(13.5 - an * 1.2), 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Himalayas Snow Ridge & Glaciers
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(toCanvasX(82), toCanvasY(30), width * 0.06, height * 0.016, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // 4. SOUTHEAST ASIA & INDONESIA
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.ellipse(toCanvasX(100), toCanvasY(15), width * 0.05, height * 0.12, 0.3, 0, Math.PI * 2); // Indochina
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(toCanvasX(102), toCanvasY(-2), width * 0.07, height * 0.03, -0.4, 0, Math.PI * 2); // Sumatra
    ctx.fill();

    // 5. AUSTRALIA
    ctx.fillStyle = '#854d0e'; // Red desert interior
    ctx.beginPath();
    ctx.ellipse(toCanvasX(134), toCanvasY(-25), width * 0.08, height * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. SWIRLING WEATHER PATTERNS & CYCLONES (Tropical Bay of Bengal cloud band)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    // Bay of Bengal tropical cloud spiral
    for (let c = 0; c < 30; c++) {
      const angle = c * 0.35;
      const dist = c * 2.8;
      ctx.beginPath();
      ctx.arc(
        toCanvasX(86) + Math.cos(angle) * dist,
        toCanvasY(14) + Math.sin(angle) * dist * 0.6,
        Math.random() * 14 + 6,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // ITCZ (Intertropical Convergence Zone) Equatorial Cloud Band
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(toCanvasX(-180 + i * 6.5), toCanvasY(3 + Math.sin(i * 0.4) * 4), Math.random() * 28 + 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export interface CelestialEnvironmentHandle {
  environmentGroup: THREE.Group;
  primaryBodyMesh: THREE.Mesh | THREE.Group;
  update: (deltaSec: number, flightSec: number, rocketAltKm: number) => void;
  dispose: () => void;
}

/**
 * Creates mission-specific celestial world (Sun for Aditya, Moon for Chandrayaan, LEO for Gaganyaan, Polar for NISAR, Station for BAS)
 */
export function buildMissionCelestialEnvironment(
  missionId: string,
  scene: THREE.Scene
): CelestialEnvironmentHandle {
  const envGroup = new THREE.Group();
  scene.add(envGroup);

  const disposables: { dispose: () => void }[] = [];

  // =========================================================================
  // MISSION 1: ADITYA-L1 — SOLAR LAGRANGE OBSERVATORY
  // =========================================================================
  if (missionId === 'aditya_l1') {
    // 1. Massive Blazing Sun
    const sunGeom = new THREE.SphereGeometry(180, 64, 64);
    const sunTex = createProceduralCanvasTexture('sun', 1024, 512);
    disposables.push(sunGeom, sunTex);

    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      color: 0xfff7ed,
    });
    disposables.push(sunMat);

    const sunSphere = new THREE.Mesh(sunGeom, sunMat);
    sunSphere.position.set(0, 500, -900); // Looming in deep space ahead
    envGroup.add(sunSphere);

    // 2. Multi-layer Glowing Solar Corona
    const coronaGeom = new THREE.SphereGeometry(215, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(coronaGeom, coronaMat);
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    sunSphere.add(coronaMesh);

    // 3. Solar Prominence Plasma Arcs (3 curved glowing plasma loops)
    const arcGroup = new THREE.Group();
    for (let a = 0; a < 4; a++) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(160, -30 + a * 30, 0),
        new THREE.Vector3(260 + a * 20, 10 + a * 25, 0),
        new THREE.Vector3(150, 60 + a * 25, 0)
      );
      const tubeGeom = new THREE.TubeGeometry(curve, 24, 3.2, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(tubeGeom, tubeMat);
      const arcMesh = new THREE.Mesh(tubeGeom, tubeMat);
      arcMesh.rotation.y = (a * Math.PI) / 2;
      arcGroup.add(arcMesh);
    }
    sunSphere.add(arcGroup);

    // 4. Streaming Solar Wind Particles
    const windCount = 800;
    const windGeom = new THREE.BufferGeometry();
    const windPos = new Float32Array(windCount * 3);
    const windVel = new Float32Array(windCount * 3);
    for (let i = 0; i < windCount * 3; i += 3) {
      windPos[i] = (Math.random() - 0.5) * 600;
      windPos[i + 1] = Math.random() * 600 + 100;
      windPos[i + 2] = -Math.random() * 800;

      windVel[i] = (Math.random() - 0.5) * 8;
      windVel[i + 1] = -Math.random() * 30 - 15;
      windVel[i + 2] = Math.random() * 40 + 20;
    }
    windGeom.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
    const windMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 3.2,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(windGeom, windMat);
    const windParticles = new THREE.Points(windGeom, windMat);
    envGroup.add(windParticles);

    // 5. Lissajous L1 Halo Orbit Trajectory Ring
    const haloCurve = new THREE.EllipseCurve(0, 0, 75, 45, 0, 2 * Math.PI, false, 0);
    const haloPoints = haloCurve.getPoints(64);
    const haloGeom = new THREE.BufferGeometry().setFromPoints(haloPoints.map((p) => new THREE.Vector3(p.x, 260, p.y - 350)));
    const haloMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 4,
      gapSize: 2,
      transparent: true,
      opacity: 0.8,
    });
    disposables.push(haloGeom, haloMat);
    const haloLine = new THREE.Line(haloGeom, haloMat);
    haloLine.computeLineDistances();
    envGroup.add(haloLine);

    // 6. Distant Earth & Moon Marbles (receding behind)
    const distantEarthGeom = new THREE.SphereGeometry(14, 32, 32);
    const distantEarthTex = createProceduralCanvasTexture('earth', 512, 256);
    const distantEarthMat = new THREE.MeshStandardMaterial({ map: distantEarthTex, roughness: 0.6 });
    disposables.push(distantEarthGeom, distantEarthTex, distantEarthMat);
    const distantEarth = new THREE.Mesh(distantEarthGeom, distantEarthMat);
    distantEarth.position.set(-180, -120, 300);
    envGroup.add(distantEarth);

    return {
      environmentGroup: envGroup,
      primaryBodyMesh: sunSphere,
      update: (delta, _sec) => {
        sunSphere.rotation.y += delta * 0.05;
        arcGroup.rotation.z += delta * 0.02;
        distantEarth.rotation.y += delta * 0.08;

        // Animate solar wind
        const positions = windGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < windCount * 3; i += 3) {
          positions[i] += windVel[i] * delta;
          positions[i + 1] += windVel[i + 1] * delta;
          positions[i + 2] += windVel[i + 2] * delta;

          if (positions[i + 2] > 200 || positions[i + 1] < -200) {
            positions[i] = (Math.random() - 0.5) * 500;
            positions[i + 1] = 400 + Math.random() * 200;
            positions[i + 2] = -800;
          }
        }
        windGeom.attributes.position.needsUpdate = true;
      },
      dispose: () => {
        disposables.forEach((d) => d.dispose());
        scene.remove(envGroup);
      },
    };
  }

  // =========================================================================
  // MISSION 2: CHANDRAYAAN-4 — LUNAR SOUTH POLE SAMPLE RETURN
  // =========================================================================
  if (missionId === 'chandrayaan_4') {
    // 1. High-Fidelity 3D Moon Surface Globe
    const moonGeom = new THREE.SphereGeometry(320, 64, 64);
    const moonTex = createProceduralCanvasTexture('moon', 1024, 512);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.9,
      metalness: 0.05,
    });
    disposables.push(moonGeom, moonTex, moonMat);
    const moonSphere = new THREE.Mesh(moonGeom, moonMat);
    moonSphere.position.set(0, -360, 0);
    envGroup.add(moonSphere);

    // 2. High-Detail Lunar South Pole Landing Zone Terrain Plate
    const craterPlateGeom = new THREE.CylinderGeometry(45, 52, 6, 32);
    const craterPlateMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.95,
      metalness: 0.05,
    });
    disposables.push(craterPlateGeom, craterPlateMat);
    const craterPlate = new THREE.Mesh(craterPlateGeom, craterPlateMat);
    craterPlate.position.set(0, -3, 0);
    envGroup.add(craterPlate);

    // Landing Beacon (Boguslawsky crater target marker)
    const beaconGeom = new THREE.RingGeometry(1.2, 2.8, 32);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    disposables.push(beaconGeom, beaconMat);
    const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
    beaconMesh.rotation.x = -Math.PI / 2;
    beaconMesh.position.set(0, 0.1, 0);
    envGroup.add(beaconMesh);

    // 3. Radiant "Earthrise" in the black lunar sky
    const earthriseGeom = new THREE.SphereGeometry(24, 48, 48);
    const earthriseTex = createProceduralCanvasTexture('earth', 1024, 512);
    const earthriseMat = new THREE.MeshStandardMaterial({
      map: earthriseTex,
      roughness: 0.45,
      metalness: 0.15,
    });
    disposables.push(earthriseGeom, earthriseTex, earthriseMat);
    const earthriseMesh = new THREE.Mesh(earthriseGeom, earthriseMat);
    earthriseMesh.position.set(220, 180, -320); // Hanging dramatically above the horizon
    envGroup.add(earthriseMesh);

    // Glowing cyan atmospheric halo around Earthrise
    const earthGlowGeom = new THREE.SphereGeometry(26, 32, 32);
    const earthGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(earthGlowGeom, earthGlowMat);
    const earthGlow = new THREE.Mesh(earthGlowGeom, earthGlowMat);
    earthriseMesh.add(earthGlow);

    // 4. Trans-Lunar Trajectory Orbit Arc
    const tliCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(220, 180, -320),
      new THREE.Vector3(90, 260, -120),
      new THREE.Vector3(0, 40, 0)
    );
    const tliGeom = new THREE.BufferGeometry().setFromPoints(tliCurve.getPoints(50));
    const tliMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 6,
      gapSize: 3,
      transparent: true,
      opacity: 0.75,
    });
    disposables.push(tliGeom, tliMat);
    const tliLine = new THREE.Line(tliGeom, tliMat);
    tliLine.computeLineDistances();
    envGroup.add(tliLine);

    return {
      environmentGroup: envGroup,
      primaryBodyMesh: moonSphere,
      update: (delta, _sec) => {
        moonSphere.rotation.y += delta * 0.02;
        earthriseMesh.rotation.y += delta * 0.06;
        beaconMesh.rotation.z += delta * 1.5;
      },
      dispose: () => {
        disposables.forEach((d) => d.dispose());
        scene.remove(envGroup);
      },
    };
  }

  // =========================================================================
  // MISSION 4: NISAR — POLAR RADAR SYNTHETIC APERTURE (SSPO)
  // =========================================================================
  if (missionId === 'nisar_radar') {
    // 1. Polar Glacial Earth Globe
    const polarGeom = new THREE.SphereGeometry(340, 64, 64);
    const polarTex = createProceduralCanvasTexture('polar_earth', 1024, 512);
    const polarMat = new THREE.MeshStandardMaterial({
      map: polarTex,
      roughness: 0.7,
      metalness: 0.1,
    });
    disposables.push(polarGeom, polarTex, polarMat);
    const polarEarth = new THREE.Mesh(polarGeom, polarMat);
    polarEarth.position.set(0, -370, 0);
    envGroup.add(polarEarth);

    // 2. Synthetic Aperture Radar (SweepSAR) Scanning Cone & Swath Footprint
    const radarBeamGeom = new THREE.ConeGeometry(28, 90, 32, 1, true);
    const radarBeamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(radarBeamGeom, radarBeamMat);
    const radarBeam = new THREE.Mesh(radarBeamGeom, radarBeamMat);
    radarBeam.position.set(0, 10, 0);
    radarBeam.rotation.x = Math.PI; // Pointing downward toward Earth
    envGroup.add(radarBeam);

    // Radar Swath Projected Grid Rings on Surface
    const swathRingGeom = new THREE.RingGeometry(24, 28, 32);
    const swathRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(swathRingGeom, swathRingMat);
    const swathRing = new THREE.Mesh(swathRingGeom, swathRingMat);
    swathRing.rotation.x = -Math.PI / 2;
    swathRing.position.set(0, -32, 0);
    envGroup.add(swathRing);

    // 3. Polar Sun-Synchronous Orbital Track
    const orbitCurve = new THREE.EllipseCurve(0, 0, 160, 240, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(80);
    const orbitGeom = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, p.y + 60, -80))
    );
    const orbitMat = new THREE.LineDashedMaterial({
      color: 0x06b6d4,
      dashSize: 5,
      gapSize: 2.5,
      transparent: true,
      opacity: 0.65,
    });
    disposables.push(orbitGeom, orbitMat);
    const orbitLine = new THREE.Line(orbitGeom, orbitMat);
    orbitLine.computeLineDistances();
    envGroup.add(orbitLine);

    return {
      environmentGroup: envGroup,
      primaryBodyMesh: polarEarth,
      update: (delta, _sec, rocketAltKm) => {
        polarEarth.rotation.y += delta * 0.03;
        swathRing.rotation.z += delta * 0.8;

        // Radar beam tracks below vehicle altitude
        const showRadar = rocketAltKm > 100;
        radarBeam.visible = showRadar;
        swathRing.visible = showRadar;
        if (showRadar) {
          const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.12;
          swathRing.scale.set(pulse, pulse, pulse);
        }
      },
      dispose: () => {
        disposables.forEach((d) => d.dispose());
        scene.remove(envGroup);
      },
    };
  }

  // =========================================================================
  // MISSION 5: BHARATIYA ANTARIKSH STATION (BAS-1) — SOVEREIGN ORBITAL HABITAT
  // =========================================================================
  if (missionId === 'bharatiya_antariksh_station') {
    // 1. Earth at 450 km LEO
    const earthGeom = new THREE.SphereGeometry(350, 64, 64);
    const earthTex = createProceduralCanvasTexture('earth', 1024, 512);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.6,
      metalness: 0.1,
    });
    disposables.push(earthGeom, earthTex, earthMat);
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.position.set(0, -375, 0);
    envGroup.add(earthMesh);

    // 2. Pre-assembled Space Station Truss & Habitat Target in Orbit
    const stationGroup = new THREE.Group();
    stationGroup.position.set(45, 140, -60);

    // Main pressurized cylinder
    const coreCylGeom = new THREE.CylinderGeometry(4.2, 4.2, 24, 24);
    const coreCylMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.25,
      metalness: 0.85,
    });
    disposables.push(coreCylGeom, coreCylMat);
    const coreCyl = new THREE.Mesh(coreCylGeom, coreCylMat);
    coreCyl.rotation.z = Math.PI / 2;
    stationGroup.add(coreCyl);

    // APAS Androgynous Peripheral Assembly System Docking Ring
    const dockGeom = new THREE.TorusGeometry(2.4, 0.5, 16, 24);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.9 });
    disposables.push(dockGeom, dockMat);
    const dockForward = new THREE.Mesh(dockGeom, dockMat);
    dockForward.rotation.y = Math.PI / 2;
    dockForward.position.x = 12.2;
    stationGroup.add(dockForward);

    // Solar Array Truss Wings (Left & Right)
    const arrayGeom = new THREE.BoxGeometry(1.2, 0.1, 18);
    const arrayMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.95,
    });
    disposables.push(arrayGeom, arrayMat);

    const array1 = new THREE.Mesh(arrayGeom, arrayMat);
    array1.position.set(0, 0, 15);
    stationGroup.add(array1);

    const array2 = new THREE.Mesh(arrayGeom, arrayMat);
    array2.position.set(0, 0, -15);
    stationGroup.add(array2);

    // Cupola Observation Dome with glowing amber interior
    const cupolaGeom = new THREE.SphereGeometry(2.1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cupolaMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    disposables.push(cupolaGeom, cupolaMat);
    const cupola = new THREE.Mesh(cupolaGeom, cupolaMat);
    cupola.position.set(0, 4.3, 0);
    stationGroup.add(cupola);

    envGroup.add(stationGroup);

    return {
      environmentGroup: envGroup,
      primaryBodyMesh: earthMesh,
      update: (delta, _sec) => {
        earthMesh.rotation.y += delta * 0.04;
        stationGroup.rotation.y += delta * 0.03;
      },
      dispose: () => {
        disposables.forEach((d) => d.dispose());
        scene.remove(envGroup);
      },
    };
  }

  // =========================================================================
  // MISSION 0: GSLV-F18 / NVS-03 MISSION CONTROL ORBITAL TRAJECTORY (AS IN PIC 1)
  // =========================================================================
  if (missionId === 'gslv_nvs03') {
    // 1. Earth at 140-170 km Sub-orbital / GTO Insertion View
    const earthGeom = new THREE.SphereGeometry(350, 64, 64);
    const earthTex = createProceduralCanvasTexture('earth', 1024, 512);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.15,
    });
    disposables.push(earthGeom, earthTex, earthMat);
    const gslvEarth = new THREE.Mesh(earthGeom, earthMat);
    // Center Earth below the flight path so the horizon arcs across the lower third
    gslvEarth.position.set(0, -365, 0);
    // Orient Earth so the Indian peninsula, Sriharikota, and Bay of Bengal face the camera
    gslvEarth.rotation.x = 0.28;
    gslvEarth.rotation.y = 1.35;
    envGroup.add(gslvEarth);

    // 2. Swirling Weather Cloud Layer
    const cloudGeom = new THREE.SphereGeometry(352.5, 48, 48);
    const cloudTex = createProceduralCanvasTexture('clouds', 1024, 512);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.55,
      roughness: 1.0,
    });
    disposables.push(cloudGeom, cloudTex, cloudMat);
    const cloudLayer = new THREE.Mesh(cloudGeom, cloudMat);
    gslvEarth.add(cloudLayer);

    // 3. Azure Atmospheric Rayleigh Scattering Limb Glow (as seen clearly in pics 1, 2, 3!)
    const atmosGeom = new THREE.SphereGeometry(364, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(atmosGeom, atmosMat);
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    gslvEarth.add(atmosMesh);

    // 4. 3D ORBITAL TRAJECTORY ARC (Picture 1 authentic ISRO flight path)
    const trajGroup = new THREE.Group();
    envGroup.add(trajGroup);

    // Trajectory spline points extending from launch at Sriharikota curving across Bay of Bengal
    const curvePoints = [
      new THREE.Vector3(-14, -10, 18),   // Liftoff Pad at Sriharikota
      new THREE.Vector3(-6, 2, 14),     // Max-Q / S200 Separation
      new THREE.Vector3(4, 12, 8),      // GS2 Vikas Burn (125 km)
      new THREE.Vector3(14, 18, 0),     // CUS Ignition Point (146 km)
      new THREE.Vector3(26, 22, -12),   // CUS Mid-Burn over Bay of Bengal
      new THREE.Vector3(38, 24, -26),   // Past Andaman Islands into GTO
      new THREE.Vector3(56, 25, -45),   // GTO Injection Track
    ];

    const fullCurve = new THREE.CatmullRomCurve3(curvePoints);

    // A. Flown Path: Glowing Orange / Amber Trajectory Line (Picture 1)
    const flownPoints = fullCurve.getPoints(60).slice(0, 38);
    const flownGeom = new THREE.BufferGeometry().setFromPoints(flownPoints);
    const flownMat = new THREE.LineBasicMaterial({
      color: 0xf97316, // ISRO telemetry golden-orange
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
    });
    disposables.push(flownGeom, flownMat);
    const flownLine = new THREE.Line(flownGeom, flownMat);
    trajGroup.add(flownLine);

    // Glow envelope around flown trajectory
    const flownGlowMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(flownGlowMat);
    const flownGlowLine = new THREE.Line(flownGeom, flownGlowMat);
    trajGroup.add(flownGlowLine);

    // B. Projected Future Trajectory Path: Clean White Curve (Picture 1)
    const futurePoints = fullCurve.getPoints(60).slice(37);
    const futureGeom = new THREE.BufferGeometry().setFromPoints(futurePoints);
    const futureMat = new THREE.LineDashedMaterial({
      color: 0xe2e8f0,
      dashSize: 4,
      gapSize: 2,
      transparent: true,
      opacity: 0.75,
    });
    disposables.push(futureGeom, futureMat);
    const futureLine = new THREE.Line(futureGeom, futureMat);
    futureLine.computeLineDistances();
    trajGroup.add(futureLine);

    // C. [CUS IGNITION] Milestone Marker Point on Trajectory (Picture 1)
    const markerPos = curvePoints[3]; // Point where CUS ignites
    const markerGeom = new THREE.SphereGeometry(0.7, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    disposables.push(markerGeom, markerMat);
    const markerSphere = new THREE.Mesh(markerGeom, markerMat);
    markerSphere.position.copy(markerPos);
    trajGroup.add(markerSphere);

    // Marker Halo Ring
    const haloGeom = new THREE.RingGeometry(0.9, 1.4, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    disposables.push(haloGeom, haloMat);
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.position.copy(markerPos);
    trajGroup.add(haloMesh);

    // 3D Canvas Billboard Sprite for "[CUS IGNITION]" (Exact pill from Pic 1!)
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 96;
    const lctx = labelCanvas.getContext('2d')!;
    lctx.fillStyle = '#0f172a';
    lctx.strokeStyle = '#38bdf8';
    lctx.lineWidth = 4;
    // Rounded rectangle pill
    lctx.beginPath();
    lctx.roundRect(16, 16, 224, 64, 32);
    lctx.fill();
    lctx.stroke();
    // Text: CUS IGNITION
    lctx.fillStyle = '#ffffff';
    lctx.font = 'bold 24px monospace';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillText('CUS', 128, 36);
    lctx.fillText('IGNITION', 128, 60);

    const labelTex = new THREE.CanvasTexture(labelCanvas);
    disposables.push(labelTex);
    const spriteMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
    disposables.push(spriteMat);
    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.position.set(markerPos.x, markerPos.y - 3.2, markerPos.z);
    labelSprite.scale.set(7.5, 2.8, 1);
    trajGroup.add(labelSprite);

    return {
      environmentGroup: envGroup,
      primaryBodyMesh: gslvEarth,
      update: (delta, sec) => {
        gslvEarth.rotation.y += delta * 0.008;
        cloudLayer.rotation.y += delta * 0.012;
        haloMesh.rotation.z += delta * 1.5;
        // Subtle pulse on marker
        const pulse = 1.0 + Math.sin(sec * 4) * 0.15;
        haloMesh.scale.set(pulse, pulse, pulse);
      },
      dispose: () => {
        disposables.forEach((d) => d.dispose());
        scene.remove(envGroup);
      },
    };
  }

  // =========================================================================
  // MISSION 3: GAGANYAAN-1 & DEFAULT — 400 KM LOW EARTH ORBIT (LEO)
  // =========================================================================
  // High-Resolution LEO with Rayleigh Scattering Atmospheric Glow
  const leoEarthGeom = new THREE.SphereGeometry(350, 64, 64);
  const leoEarthTex = createProceduralCanvasTexture('earth', 1024, 512);
  const leoEarthMat = new THREE.MeshStandardMaterial({
    map: leoEarthTex,
    roughness: 0.65,
    metalness: 0.15,
  });
  disposables.push(leoEarthGeom, leoEarthTex, leoEarthMat);
  const leoEarth = new THREE.Mesh(leoEarthGeom, leoEarthMat);
  leoEarth.position.set(0, -375, 0);
  envGroup.add(leoEarth);

  // Independent Swirling Clouds Layer
  const cloudGeom = new THREE.SphereGeometry(352.5, 48, 48);
  const cloudTex = createProceduralCanvasTexture('clouds', 1024, 512);
  const cloudMat = new THREE.MeshStandardMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.55,
    roughness: 1.0,
  });
  disposables.push(cloudGeom, cloudTex, cloudMat);
  const cloudLayer = new THREE.Mesh(cloudGeom, cloudMat);
  leoEarth.add(cloudLayer);

  // Multi-layer Azure Atmospheric Fresnel Glow Envelope
  const atmosGeom = new THREE.SphereGeometry(362, 48, 48);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(atmosGeom, atmosMat);
  const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
  leoEarth.add(atmosMesh);

  return {
    environmentGroup: envGroup,
    primaryBodyMesh: leoEarth,
    update: (delta, _sec) => {
      leoEarth.rotation.y += delta * 0.03;
      cloudLayer.rotation.y += delta * 0.045; // Clouds drift slightly faster
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
      scene.remove(envGroup);
    },
  };
}
