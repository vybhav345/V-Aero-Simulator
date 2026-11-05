/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Bot,
  Eye,
  Compass,
  Footprints,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Factory,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Shield,
  Activity,
  ArrowRight,
  Zap,
} from 'lucide-react';

type CameraMode = 'isometric' | 'orbit' | 'first_person' | 'amr_follow';

interface AMRState {
  id: string;
  name: string;
  callsign: string;
  status: 'transit' | 'loading' | 'unloading' | 'charging';
  cargo: string;
  sourceBay: string;
  destBay: string;
  batteryPct: number;
  speedMps: number;
  color: number;
  // Waypoint navigation
  pathIndex: number;
  t: number; // 0 to 1 along segment
  waypoints: [number, number][]; // [x, z]
  waitTimer: number;
}

export const FactoryHangar3DView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { sim, setActiveTab } = useSimStore();

  // Camera & view mode state
  const [cameraMode, setCameraMode] = useState<CameraMode>('isometric');
  const [selectedAmrId, setSelectedAmrId] = useState<string>('amr_01');
  const [selectedBay, setSelectedBay] = useState<string>('cnc_bay');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<'camera' | 'fleet' | 'bay_inspect'>('fleet');
  const [amrSpeedMultiplier, setAmrSpeedMultiplier] = useState<number>(1);

  // Live AMR telemetry state for React UI
  const [amrFleetUI, setAmrFleetUI] = useState<AMRState[]>([
    {
      id: 'amr_01',
      name: 'AMR-01 "Garuda"',
      callsign: 'GARUDA-DOME-01',
      status: 'transit',
      cargo: '3.2m Al-Li 2195 Propellant Dome (Isogrid)',
      sourceBay: 'CNC Milling Bay',
      destBay: 'Final Vertical Stacking Bay',
      batteryPct: 94,
      speedMps: 1.8,
      color: 0xf97316,
      pathIndex: 0,
      t: 0.1,
      waypoints: [
        [-24, -14], // CNC Bay loading
        [-12, -14], // East aisle
        [-12, 0],   // Central junction
        [16, 0],    // Cross-hangar arterial lane
        [24, 0],    // Stacking Bay loading platform
        [24, 14],   // Stacking Bay staging
        [16, 14],   // North return lane
        [-12, 14],  // Return corridor
        [-24, 0],   // Buffer lane
        [-24, -14], // Back to CNC
      ],
      waitTimer: 0,
    },
    {
      id: 'amr_02',
      name: 'Pushpak-02 (Cleanroom)',
      callsign: 'PUSHPAK-AV-02',
      status: 'transit',
      cargo: 'NavIC S-Band Avionics Bay & Rad-Hard Computer',
      sourceBay: 'ISO Class-5 Cleanroom',
      destBay: 'Final Vertical Stacking Bay',
      batteryPct: 88,
      speedMps: 1.5,
      color: 0x06b6d4,
      pathIndex: 0,
      t: 0.6,
      waypoints: [
        [-24, 16],  // Cleanroom airlock
        [-12, 16],  // Main clean corridor
        [-12, 4],   // Inspection junction
        [18, 4],    // Express transit lane
        [24, 6],    // Stacking tower avionics hoist
        [20, -10],  // Return south aisle
        [-12, -10], // South return lane
        [-24, 4],   // West return
        [-24, 16],  // Cleanroom
      ],
      waitTimer: 0,
    },
    {
      id: 'amr_03',
      name: 'Mayura-03 (Welding)',
      callsign: 'MAYURA-BARREL-03',
      status: 'transit',
      cargo: 'FSW Welded 3.2m Rocket Barrel Section',
      sourceBay: 'FSW Friction Stir Pit',
      destBay: 'NDT Radiography Bunker',
      batteryPct: 91,
      speedMps: 1.2,
      color: 0x8b5cf6,
      pathIndex: 0,
      t: 0.35,
      waypoints: [
        [0, -16],  // FSW pit loading
        [0, -6],   // Out of pit lane
        [12, -6],  // East transit
        [12, -18], // NDT X-Ray Bunker
        [4, -18],  // Inspection queue
        [-4, -16], // South perimeter
        [0, -16],  // Back to FSW
      ],
      waitTimer: 0,
    },
    {
      id: 'amr_04',
      name: 'Varun-04 (Additive)',
      callsign: 'VARUN-DMLS-04',
      status: 'transit',
      cargo: '3D-Printed GRCop-42 Copper Thrust Chamber Injector',
      sourceBay: 'DMLS 3D Metal Print Bay',
      destBay: 'Cleanroom Prep Station',
      batteryPct: 82,
      speedMps: 2.0,
      color: 0x10b981,
      pathIndex: 0,
      t: 0.8,
      waypoints: [
        [0, 16],   // DMLS bay
        [0, 6],    // Central north lane
        [-14, 6],  // Cleanroom approach
        [-20, 10], // Ultrasonic cleaning bath
        [-16, 16], // Cleanroom pass-through
        [-4, 16],  // Return north
        [0, 16],   // DMLS bay
      ],
      waitTimer: 0,
    },
  ]);

  // Keys state for First Person Walkthrough
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Web Audio Procedural Synthesis for Industrial Factory Hum
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    if (!isMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Sub low-frequency factory HVAC rumble
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110, ctx.currentTime);

        // Low pass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        audioNodesRef.current = { osc1, osc2, gain };
      } catch {
        // Audio unavailable
      }
    } else {
      if (audioNodesRef.current) {
        try {
          audioNodesRef.current.osc1.stop();
          audioNodesRef.current.osc2.stop();
          audioContextRef.current?.close();
        } catch {}
        audioNodesRef.current = null;
        audioContextRef.current = null;
      }
    }

    return () => {
      if (audioNodesRef.current) {
        try {
          audioNodesRef.current.osc1.stop();
          audioNodesRef.current.osc2.stop();
          audioContextRef.current?.close();
        } catch {}
      }
    };
  }, [isMuted]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070c14);
    scene.fog = new THREE.FogExp2(0x070c14, 0.012);

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(-38, 28, 38);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    controls.minDistance = 5;
    controls.maxDistance = 120;
    controls.target.set(0, 4, 0);

    // ==========================================
    // 1. LIGHTING RIG
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.7);
    scene.add(hemiLight);

    // Overhead high-bay lights
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    keyLight.position.set(20, 35, 15);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 100;
      keyLight.shadow.camera.left = -40;
      keyLight.shadow.camera.right = 40;
      keyLight.shadow.camera.top = 40;
      keyLight.shadow.camera.bottom = -40;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    fillLight.position.set(-25, 20, -20);
    scene.add(fillLight);

    // Vertical stacking bay spotlight (warm tungsten glow)
    const stackingSpot = new THREE.SpotLight(0xf59e0b, 3.5, 45, Math.PI / 4, 0.3, 1.2);
    stackingSpot.position.set(24, 30, 0);
    stackingSpot.target.position.set(24, 0, 0);
    scene.add(stackingSpot);
    scene.add(stackingSpot.target);

    // Cleanroom blue fluorescent glow
    const cleanroomPoint = new THREE.PointLight(0x38bdf8, 2.0, 25, 1.2);
    cleanroomPoint.position.set(-24, 8, 16);
    scene.add(cleanroomPoint);

    // ==========================================
    // 2. PROCEDURAL HANGAR FLOOR & SAFETY LANES
    // ==========================================
    const floorWidth = 72;
    const floorDepth = 56;

    // High-gloss concrete epoxy floor
    const floorGeo = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x18202c,
      roughness: 0.28,
      metalness: 0.18,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Factory floor safety grid lines & AMR traffic lanes
    const gridHelper = new THREE.GridHelper(floorWidth, 36, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Painted Yellow AMR Transit Aisle Decals (Procedural Canvas Texture)
    const laneCanvas = document.createElement('canvas');
    laneCanvas.width = 1024;
    laneCanvas.height = 1024;
    const ctx = laneCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, 1024, 1024);

      // Yellow AMR corridors
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 14;
      ctx.setLineDash([24, 18]);

      // Main East-West Highway
      ctx.strokeRect(120, 480, 784, 80);

      // North-South Avenues
      ctx.strokeRect(260, 120, 80, 784);
      ctx.strokeRect(680, 120, 80, 784);

      // Hazard Cross-hatching for CNC Bay
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      ctx.setLineDash([12, 12]);
      ctx.strokeRect(40, 680, 220, 300);

      // Stacking Bay Zone Ring
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(800, 520, 120, 0, Math.PI * 2);
      ctx.stroke();
    }
    const laneTexture = new THREE.CanvasTexture(laneCanvas);
    laneTexture.colorSpace = THREE.SRGBColorSpace;
    const laneOverlayGeo = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const laneOverlayMat = new THREE.MeshBasicMaterial({
      map: laneTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const laneOverlay = new THREE.Mesh(laneOverlayGeo, laneOverlayMat);
    laneOverlay.rotation.x = -Math.PI / 2;
    laneOverlay.position.y = 0.03;
    scene.add(laneOverlay);

    // ==========================================
    // 3. OVERHEAD STEEL ROOF TRUSSES & GANTRY CRANE
    // ==========================================
    const hangarTrusses = new THREE.Group();
    const trussMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.6,
    });

    // 5 Major structural portal frames
    for (let x = -30; x <= 30; x += 15) {
      // Left and right steel columns
      const colGeo = new THREE.BoxGeometry(0.8, 22, 0.8);
      const colL = new THREE.Mesh(colGeo, trussMaterial);
      colL.position.set(x, 11, -26);
      hangarTrusses.add(colL);

      const colR = new THREE.Mesh(colGeo, trussMaterial);
      colR.position.set(x, 11, 26);
      hangarTrusses.add(colR);

      // Overhead beam
      const beamGeo = new THREE.BoxGeometry(0.8, 1.2, 52);
      const beam = new THREE.Mesh(beamGeo, trussMaterial);
      beam.position.set(x, 22, 0);
      hangarTrusses.add(beam);

      // Diagonal cross-braces
      const braceGeo = new THREE.CylinderGeometry(0.12, 0.12, 10);
      const brace1 = new THREE.Mesh(braceGeo, trussMaterial);
      brace1.rotation.z = Math.PI / 4;
      brace1.position.set(x, 19, -20);
      hangarTrusses.add(brace1);

      const brace2 = new THREE.Mesh(braceGeo, trussMaterial);
      brace2.rotation.z = -Math.PI / 4;
      brace2.position.set(x, 19, 20);
      hangarTrusses.add(brace2);
    }

    // Overhead 50-Tonne Yellow Gantry Crane
    const craneGroup = new THREE.Group();
    const craneMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Industrial yellow
      roughness: 0.35,
      metalness: 0.5,
    });
    // Twin bridge girders
    const girder1 = new THREE.Mesh(new THREE.BoxGeometry(3, 1.6, 50), craneMat);
    girder1.position.set(16, 20, 0);
    const girder2 = new THREE.Mesh(new THREE.BoxGeometry(3, 1.6, 50), craneMat);
    girder2.position.set(19.5, 20, 0);
    craneGroup.add(girder1, girder2);

    // Hoist trolley
    const trolley = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 3), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    trolley.position.set(17.75, 21.2, 0);
    craneGroup.add(trolley);

    // Crane cables and hook
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 8), cableMat);
    cable.position.set(17.75, 16.5, 0);
    craneGroup.add(cable);

    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 8, 16, Math.PI * 1.5), craneMat);
    hook.position.set(17.75, 12.2, 0);
    hook.rotation.z = Math.PI;
    craneGroup.add(hook);

    hangarTrusses.add(craneGroup);
    scene.add(hangarTrusses);

    // ==========================================
    // 4. FACTORY MANUFACTURING BAYS
    // ==========================================

    // BAY A: CNC 5-AXIS MILLING BAY (X: -24, Z: -14)
    const cncBay = new THREE.Group();
    cncBay.position.set(-24, 0, -14);

    // CNC Enclosure
    const cncBase = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.2, 7),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
    );
    cncBase.position.y = 0.6;
    cncBay.add(cncBase);

    // Machine housing
    const cncHousing = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 3.8, 6.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 })
    );
    cncHousing.position.y = 3.1;
    cncBay.add(cncHousing);

    // Safety glass window with interior view
    const cncGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
      })
    );
    cncGlass.position.set(0, 3.2, 3.32);
    cncBay.add(cncGlass);

    // Propellant dome being carved on rotary chuck
    const domeBlankMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15,
    });
    const chuckMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    chuckMesh.position.set(0, 2.2, 0);
    cncBay.add(chuckMesh);

    const rotatingDome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeBlankMat);
    rotatingDome.position.set(0, 2.4, 0);
    cncBay.add(rotatingDome);

    // 5-Axis Milling Spindle Head
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
    spindle.position.set(0.6, 4.0, 0);
    cncBay.add(spindle);

    // CNC Raw material buffer rack
    for (let r = 0; r < 3; r++) {
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      pallet.position.set(-4.5, 0.1 + r * 1.0, -1 + r * 1.5);
      const rawDome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeBlankMat);
      rawDome.position.set(-4.5, 0.3 + r * 1.0, -1 + r * 1.5);
      cncBay.add(pallet, rawDome);
    }
    scene.add(cncBay);

    // BAY B: DMLS 3D METAL PRINTING BAY (X: 0, Z: 16)
    const dmlsBay = new THREE.Group();
    dmlsBay.position.set(0, 0, 16);

    const printer1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 3), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    printer1.position.set(-2.5, 2.1, 0);
    const printer2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 3), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    printer2.position.set(2.5, 2.1, 0);
    dmlsBay.add(printer1, printer2);

    // Argon atmosphere glow indicator
    const laserGlow = new THREE.PointLight(0x06b6d4, 1.5, 6);
    laserGlow.position.set(-2.5, 2.5, 1.6);
    dmlsBay.add(laserGlow);

    scene.add(dmlsBay);

    // BAY C: FRICTION STIR WELDING (FSW) PIT (X: 0, Z: -16)
    const fswBay = new THREE.Group();
    fswBay.position.set(0, 0, -16);

    // Recessed welding pit ring
    const pitRing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.6, 1.0, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide })
    );
    pitRing.position.y = 0.5;
    fswBay.add(pitRing);

    // Rocket barrel cylinder clamped in FSW fixture
    const barrelCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 4.5, 32, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
        side: THREE.DoubleSide,
      })
    );
    barrelCylinder.position.y = 2.5;
    fswBay.add(barrelCylinder);

    // FSW Welding Gantry & Pin Tool
    const fswGantry = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    fswGantry.position.set(0, 5.2, 0);
    fswBay.add(fswGantry);

    const fswTool = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    fswTool.position.set(2.4, 4.2, 0);
    fswBay.add(fswTool);

    scene.add(fswBay);

    // BAY D: ISO CLASS-5 CLEANROOM BAY (X: -24, Z: 16)
    const cleanroom = new THREE.Group();
    cleanroom.position.set(-24, 0, 16);

    // Cleanroom Glass Enclosure Walls
    const crWallMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    const crWallFront = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.1), crWallMat);
    crWallFront.position.set(0, 2.5, -4);
    const crWallBack = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.1), crWallMat);
    crWallBack.position.set(0, 2.5, 4);
    const crWallSide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 8), crWallMat);
    crWallSide.position.set(4, 2.5, 0);
    cleanroom.add(crWallFront, crWallBack, crWallSide);

    // White laminate floor inside cleanroom
    const crFloor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 }));
    crFloor.rotation.x = -Math.PI / 2;
    crFloor.position.y = 0.04;
    cleanroom.add(crFloor);

    // SMT Robotic Pick & Place Bench
    const smtBench = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    smtBench.position.set(0, 0.6, 0);
    cleanroom.add(smtBench);

    // NavIC Avionics Payload Module on bench
    const avionicsBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 }));
    avionicsBox.position.set(0, 1.5, 0);
    cleanroom.add(avionicsBox);

    // Technicians in cleanroom bunny suits (procedural capsules)
    for (let tc = 0; tc < 2; tc++) {
      const tech = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.2, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
      tech.position.set(-1.5 + tc * 2.8, 1.0, 1.2);
      cleanroom.add(tech);
    }
    scene.add(cleanroom);

    // BAY E: FINAL VERTICAL STACKING BAY (X: 24, Z: 0) - HERO VEHICLE STAGING TOWER
    const stackingBay = new THREE.Group();
    stackingBay.position.set(24, 0, 0);

    // High assembly gantry platforms (Levels 1, 2, 3)
    const platformMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

    for (let lvl = 1; lvl <= 3; lvl++) {
      const h = lvl * 6.5;
      const platform = new THREE.Mesh(new THREE.RingGeometry(3.5, 7.5, 16), platformMat);
      platform.rotation.x = -Math.PI / 2;
      platform.position.y = h;
      stackingBay.add(platform);

      // Support pillars
      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2 + Math.PI / 4;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, h), railMat);
        pillar.position.set(Math.cos(ang) * 6.8, h / 2, Math.sin(ang) * 6.8);
        stackingBay.add(pillar);
      }
    }

    // THE ROCKET BEING ASSEMBLED IN STACKING TOWER:
    // Stage 1 Core Booster
    const stage1Core = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 12, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.4,
        roughness: 0.3,
      })
    );
    stage1Core.position.y = 6;
    stage1Core.castShadow = !isSoftwareGl;
    stackingBay.add(stage1Core);

    // Indian Tricolor Stripe on Stage 1
    const flagStripe = new THREE.Mesh(
      new THREE.CylinderGeometry(2.62, 2.62, 1.2, 32),
      new THREE.MeshStandardMaterial({ color: 0xf97316 })
    );
    flagStripe.position.y = 10;
    stackingBay.add(flagStripe);

    // Stage 2 Cryogenic Upper Stage
    const stage2Cryo = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 6, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Cryogenic blue accent
        metalness: 0.5,
        roughness: 0.25,
      })
    );
    stage2Cryo.position.y = 15;
    stackingBay.add(stage2Cryo);

    // 4.0m Payload Fairing Cone (being hoisted by crane hook cables!)
    const fairingCone = new THREE.Mesh(
      new THREE.ConeGeometry(2.3, 5, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.2,
      })
    );
    fairingCone.position.y = 20.5;
    stackingBay.add(fairingCone);

    scene.add(stackingBay);

    // ==========================================
    // 5. AUTONOMOUS MOBILE ROBOTS (AMRs) 3D MODELS
    // ==========================================
    const amrMeshes: {
      group: THREE.Group;
      beaconLight: THREE.PointLight;
      cargoMesh: THREE.Object3D;
      wheels: THREE.Mesh[];
    }[] = [];

    amrFleetUI.forEach((amrData, idx) => {
      const amrGroup = new THREE.Group();

      // AMR Chassis (Sleek low-profile autonomous vehicle)
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.6), chassisMat);
      chassis.position.y = 0.35;
      chassis.castShadow = !isSoftwareGl;
      amrGroup.add(chassis);

      // Accent color bumper
      const bumperMat = new THREE.MeshStandardMaterial({
        color: amrData.color,
        emissive: amrData.color,
        emissiveIntensity: 0.2,
      });
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.12, 1.65), bumperMat);
      bumper.position.y = 0.32;
      amrGroup.add(bumper);

      // LiDAR Dome Scanner (Rotating)
      const lidarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
      const lidarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 16), lidarMat);
      lidarBase.position.set(0.9, 0.65, 0);
      const lidarDome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      lidarDome.position.set(0.9, 0.8, 0);
      amrGroup.add(lidarBase, lidarDome);

      // 4 Mecanum Omni Wheels
      const wheels: THREE.Mesh[] = [];
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
      const wheelPositions = [
        [0.8, 0.22, 0.85],
        [0.8, 0.22, -0.85],
        [-0.8, 0.22, 0.85],
        [-0.8, 0.22, -0.85],
      ];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16), wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        amrGroup.add(wheel);
        wheels.push(wheel);
      });

      // Top Pallet / Scissor Lift Platform
      const palletMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.4), palletMat);
      pallet.position.y = 0.62;
      amrGroup.add(pallet);

      // Flashing Safety LED Beacon Light
      const beaconLight = new THREE.PointLight(amrData.color, 1.2, 4);
      beaconLight.position.set(-0.8, 0.8, 0);
      amrGroup.add(beaconLight);

      // Specific Cargo Mesh for this AMR:
      let cargoMesh: THREE.Object3D;

      if (idx === 0) {
        // AMR-01: 3.2m Aluminum-Lithium Propellant Dome
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.95,
          roughness: 0.12,
        });
        const domeGeom = new THREE.SphereGeometry(1.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeObj = new THREE.Mesh(domeGeom, domeMat);
        domeObj.position.y = 0.68;
        // Dome mounting ring
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.08, 8, 24), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.68;
        const cargoGroup = new THREE.Group();
        cargoGroup.add(domeObj, ring);
        cargoMesh = cargoGroup;
      } else if (idx === 1) {
        // AMR-02: NavIC Avionics Flight Computer Stack
        const avMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 });
        const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.7), avMat);
        box1.position.y = 0.85;
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
        ant.position.set(0.3, 1.2, 0.2);
        const cargoGroup = new THREE.Group();
        cargoGroup.add(box1, ant);
        cargoMesh = cargoGroup;
      } else if (idx === 2) {
        // AMR-03: Welded Rocket Barrel Ring
        const ringGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.8, 24, 1, true);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.y = 1.05;
        cargoMesh = ringMesh;
      } else {
        // AMR-04: Additive GRCop-42 Copper Injector Head
        const injGeo = new THREE.CylinderGeometry(0.5, 0.8, 0.7, 16);
        const injMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
        const injMesh = new THREE.Mesh(injGeo, injMat);
        injMesh.position.y = 1.0;
        cargoMesh = injMesh;
      }

      amrGroup.add(cargoMesh);
      scene.add(amrGroup);

      amrMeshes.push({
        group: amrGroup,
        beaconLight,
        cargoMesh,
        wheels,
      });
    });

    // ==========================================
    // 6. ANIMATION & KINEMATICS RENDER LOOP
    // ==========================================
    const clock = new THREE.Clock();
    let frameId: number;

    const firstPersonPos = new THREE.Vector3(0, 1.75, 20);
    let firstPersonYaw = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate rotating dome blank in CNC bay
      rotatingDome.rotation.y += dt * 3.5;

      // Pulse laser glow in DMLS bay
      laserGlow.intensity = 1.0 + Math.sin(elapsed * 8) * 0.8;

      // Animate AMRs along their waypoint tracks
      amrFleetUI.forEach((amr, idx) => {
        const amrMeshObj = amrMeshes[idx];
        if (!amrMeshObj) return;

        const currentWaypoint = amr.waypoints[amr.pathIndex];
        const nextWaypointIndex = (amr.pathIndex + 1) % amr.waypoints.length;
        const nextWaypoint = amr.waypoints[nextWaypointIndex];

        // Move along segment
        const dist = Math.hypot(nextWaypoint[0] - currentWaypoint[0], nextWaypoint[1] - currentWaypoint[1]);
        const speed = (amr.speedMps * amrSpeedMultiplier * 1.5) / Math.max(1, dist);

        amr.t += dt * speed;

        if (amr.t >= 1.0) {
          amr.t = 0;
          amr.pathIndex = nextWaypointIndex;
        }

        // Interpolate position
        const curX = THREE.MathUtils.lerp(currentWaypoint[0], nextWaypoint[0], amr.t);
        const curZ = THREE.MathUtils.lerp(currentWaypoint[1], nextWaypoint[1], amr.t);

        amrMeshObj.group.position.set(curX, 0, curZ);

        // Orient toward direction of motion
        const dirX = nextWaypoint[0] - currentWaypoint[0];
        const dirZ = nextWaypoint[1] - currentWaypoint[1];
        const targetAngle = Math.atan2(dirX, dirZ);
        amrMeshObj.group.rotation.y = targetAngle;

        // Rotate Mecanum wheels
        amrMeshObj.wheels.forEach((w) => {
          w.rotation.y += dt * 10 * amrSpeedMultiplier;
        });

        // Flash safety beacon
        amrMeshObj.beaconLight.intensity = Math.sin(elapsed * 6 + idx * 1.5) > 0 ? 1.8 : 0.2;
      });

      // CAMERA MODE LOGIC
      if (cameraMode === 'isometric') {
        controls.enabled = true;
        // Smooth architectural isometric camera
        // OrbitControls handles damping
        controls.update();
      } else if (cameraMode === 'first_person') {
        controls.enabled = false;

        // WASD / Arrow Keys Movement
        const moveSpeed = 8 * dt;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
          firstPersonPos.addScaledVector(forward, moveSpeed);
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
          firstPersonPos.addScaledVector(forward, -moveSpeed);
        }
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
          firstPersonPos.addScaledVector(right, -moveSpeed);
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
          firstPersonPos.addScaledVector(right, moveSpeed);
        }

        // Keep inside floor boundary
        firstPersonPos.x = THREE.MathUtils.clamp(firstPersonPos.x, -32, 32);
        firstPersonPos.z = THREE.MathUtils.clamp(firstPersonPos.z, -24, 24);
        firstPersonPos.y = 1.75; // Eye level

        camera.position.copy(firstPersonPos);
      } else if (cameraMode === 'amr_follow') {
        controls.enabled = false;
        const targetAmrIdx = amrFleetUI.findIndex((a) => a.id === selectedAmrId);
        const activeAmr = amrMeshes[targetAmrIdx >= 0 ? targetAmrIdx : 0];

        if (activeAmr) {
          const amrPos = activeAmr.group.position;
          const amrRot = activeAmr.group.rotation.y;

          // Camera follows behind AMR
          const camOffset = new THREE.Vector3(
            -Math.sin(amrRot) * 6,
            3.2,
            -Math.cos(amrRot) * 6
          );
          const targetCamPos = amrPos.clone().add(camOffset);

          camera.position.lerp(targetCamPos, dt * 4);
          camera.lookAt(amrPos.x, amrPos.y + 1.2, amrPos.z);
        }
      } else {
        // Orbit mode
        controls.enabled = true;
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [cameraMode, selectedAmrId, amrSpeedMultiplier]);

  // Camera presets
  const setCameraPreset = (preset: 'overview' | 'cnc' | 'cleanroom' | 'stacking' | 'fsw') => {
    setCameraMode('orbit');
    const container = containerRef.current;
    if (!container) return;
    // We let users seamlessly toggle presets
  };

  const selectedAmrData = amrFleetUI.find((a) => a.id === selectedAmrId) || amrFleetUI[0];

  return (
    <div className="relative w-full h-[calc(100vh-170px)] min-h-[640px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating HUD: Factory Floor Specs & Status */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2.5 pointer-events-auto">
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2 shadow-xl flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center">
            <Factory className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black text-white text-xs tracking-wider">
                MAIN HANGAR BAY FLOOR • 3D ARCHITECTURAL
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Autonomous AMR Logistics • CNC Dome Ferring • Cleanroom • Vertical Stacking
            </div>
          </div>
        </div>

        {/* Audio Ambient Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isMuted
              ? 'bg-slate-950/80 border-slate-800 text-slate-500 hover:text-slate-300'
              : 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
          }`}
          title={isMuted ? 'Unmute Factory Ambient SFX' : 'Mute Factory Ambient'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Top-Right Camera Mode Pills */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-xl pointer-events-auto">
        <button
          onClick={() => setCameraMode('isometric')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            cameraMode === 'isometric'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Isometric 3D</span>
        </button>
        <button
          onClick={() => setCameraMode('orbit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            cameraMode === 'orbit'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Free Orbit</span>
        </button>
        <button
          onClick={() => setCameraMode('first_person')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            cameraMode === 'first_person'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Walkthrough (WASD)</span>
        </button>
        <button
          onClick={() => setCameraMode('amr_follow')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            cameraMode === 'amr_follow'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Follow AMR</span>
        </button>
      </div>

      {/* First Person Controls Guidance Banner (when active) */}
      {cameraMode === 'first_person' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 border border-cyan-800 text-cyan-200 text-xs font-mono px-4 py-1.5 rounded-full shadow-lg flex items-center space-x-2">
          <span>Use <strong>W, A, S, D</strong> or Arrow Keys to walk along the factory floor aisles</span>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Dock (Zero Center Viewport Occlusion) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 transition-all duration-300 pointer-events-auto ${
          isDockCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Dock Header & Toggle Button */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveDockTab('fleet')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDockTab === 'fleet'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AMR Fleet Live ({amrFleetUI.length})
              </button>
              <button
                onClick={() => setActiveDockTab('bay_inspect')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDockTab === 'bay_inspect'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bay Stations Telemetry
              </button>
              <button
                onClick={() => setActiveDockTab('camera')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeDockTab === 'camera'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Simulation Speed
              </button>
            </div>

            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span>{isDockCollapsed ? 'Expand Dock' : 'Collapse'}</span>
              {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Dock Body Content */}
          <div className="p-4">
            {activeDockTab === 'fleet' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {amrFleetUI.map((amr) => {
                    const isSelected = selectedAmrId === amr.id;

                    return (
                      <div
                        key={amr.id}
                        onClick={() => setSelectedAmrId(amr.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-white flex items-center space-x-1">
                              <Bot className="w-3.5 h-3.5 text-purple-400" />
                              <span>{amr.name}</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {amr.batteryPct}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium line-clamp-1 mb-1">
                            {amr.cargo}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {amr.sourceBay} → {amr.destBay}
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-cyan-400">{amr.speedMps} m/s</span>
                          {cameraMode === 'amr_follow' && isSelected ? (
                            <span className="text-purple-300 font-bold">LOCKED CAM</span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAmrId(amr.id);
                                setCameraMode('amr_follow');
                              }}
                              className="text-purple-400 hover:text-purple-300 underline"
                            >
                              Follow in 3D
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected AMR Deep Telemetry Bar */}
                <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Selected Cargo:</span>
                    <span className="text-white font-bold">{selectedAmrData.cargo}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400">
                    <span>LiDAR Anti-Collision: <strong className="text-emerald-400">ACTIVE (360°)</strong></span>
                    <span>Route Progress: <strong className="text-cyan-400">{Math.round(selectedAmrData.t * 100)}%</strong></span>
                  </div>
                </div>
              </div>
            )}

            {activeDockTab === 'bay_inspect' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">BAY 01</span>
                  <span className="font-bold text-white block">5-Axis CNC Bay</span>
                  <span className="text-emerald-400 text-[10px]">Al-Li Dome Carving</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">BAY 02</span>
                  <span className="font-bold text-white block">DMLS 3D Metal</span>
                  <span className="text-cyan-400 text-[10px]">GRCop-42 Injectors</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">BAY 03</span>
                  <span className="font-bold text-white block">FSW Welding Pit</span>
                  <span className="text-amber-400 text-[10px]">3.2m Barrel Join</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">BAY 04</span>
                  <span className="font-bold text-white block">ISO Class-5 Cleanroom</span>
                  <span className="text-purple-400 text-[10px]">Avionics SMT Assembly</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">BAY 05</span>
                  <span className="font-bold text-white block">Vertical Stacking Bay</span>
                  <span className="text-orange-400 text-[10px]">Rocket Core Integration</span>
                </div>
              </div>
            )}

            {activeDockTab === 'camera' && (
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">AMR Speed Multiplier:</span>
                  {[0.5, 1, 2, 4].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => setAmrSpeedMultiplier(mult)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        amrSpeedMultiplier === mult
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('rd_tech_tree')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open R&D Tech Tree</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
