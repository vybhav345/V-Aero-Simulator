/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  Flame,
  Award,
  TrendingUp,
  Gauge,
  Radio,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
  Zap,
  ChevronDown,
  ChevronUp,
  Skull,
  ShieldAlert,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects.ts';
import { SpaceMission } from '../../data/spaceMissionsGameData.ts';
import { RocketInstance, LaunchReport } from '../../types/index.ts';
import confetti from 'canvas-confetti';
import {
  buildMissionCelestialEnvironment,
  CelestialEnvironmentHandle,
} from './missionCelestialEnvironments.ts';
import {
  buildMissionSpecificPayload,
  MissionPayloadHandle,
} from './missionPayloadModels.ts';

interface FlightMission3DVisualizerProps {
  mission: SpaceMission;
  rocket?: RocketInstance;
  failureOutcome?: LaunchReport;
  onMissionComplete?: (
    success: boolean,
    stats: { maxAltKm: number; topSpeedKmh: number; stars: number; failureReason?: string }
  ) => void;
  onClose?: () => void;
}

export type CameraViewMode = 'broadcast_trajectory' | 'stage_chase' | 'pad' | 'onboard' | 'orbital';

// Exact real-world ISRO telemetry calculations based on the broadcast screenshots:
// Pic 2: TIME: 275.0 s, Lat: 12.384°N, Lon: 084.506°E, Alt: 124.9 km, Vel: 4.2 km/s (GS2 THRUSTING)
// Pic 3: TIME: 445.5 s, Lat: 09.992°N, Lon: 091.644°E, Alt: 146.9 km, Vel: 5.2 km/s (CUS THRUSTING)
// Pic 1: TIME: 474.5 s, Lat: 09.537°N, Lon: 092.928°E, Alt: 146.5 km, Vel: 5.3 km/s (CUS THRUSTING)
function getIsroDownrangeTelemetry(timeSec: number) {
  if (timeSec <= 0) {
    return {
      latStr: '13.733°N',
      lonStr: '080.235°E',
      altKm: 0.0,
      velKms: 0.0,
      statusBanner: 'T-00:08s TERMINAL COUNTDOWN • RANGE SAFETY GO',
    };
  } else if (timeSec < 130) {
    // S200 solid strap-ons + L40 liquid boosters
    const frac = timeSec / 130;
    const lat = 13.733 - frac * (13.733 - 13.12);
    const lon = 80.235 + frac * (82.41 - 80.235);
    const alt = frac * frac * 65.0;
    const vel = frac * 2.4;
    return {
      latStr: `${lat.toFixed(3)}°N`,
      lonStr: `0${lon.toFixed(3)}°E`,
      altKm: alt,
      velKms: vel,
      statusBanner: 'S200 BURNING, GS2 IGNITION expected at T0+130.0s',
    };
  } else if (timeSec < 235) {
    // GS2 Vikas burn before fairing sep
    const frac = (timeSec - 130) / (235 - 130);
    const lat = 13.12 - frac * (13.12 - 12.65);
    const lon = 82.41 + frac * (83.85 - 82.41);
    const alt = 65.0 + frac * (115.0 - 65.0);
    const vel = 2.4 + frac * (3.8 - 2.4);
    return {
      latStr: `${lat.toFixed(3)}°N`,
      lonStr: `0${lon.toFixed(3)}°E`,
      altKm: alt,
      velKms: vel,
      statusBanner: 'GS2 THRUSTING, PAYLOAD FAIRING SEP expected at T0+235.0s',
    };
  } else if (timeSec < 275) {
    // GS2 Vikas burn after fairing sep (Pic 2)
    const frac = (timeSec - 235) / (275 - 235);
    const lat = 12.65 - frac * (12.65 - 12.384);
    const lon = 83.85 + frac * (84.506 - 83.85);
    const alt = 115.0 + frac * (124.9 - 115.0);
    const vel = 3.8 + frac * (4.2 - 3.8);
    return {
      latStr: `${lat.toFixed(3)}°N`,
      lonStr: `0${lon.toFixed(3)}°E`,
      altKm: alt,
      velKms: vel,
      statusBanner: 'GS2 THRUSTING, CUS AUTH expected at T0+275s', // Exact text from Pic 2!
    };
  } else if (timeSec < 1105.2) {
    // CUS Cryogenic Upper Stage burn (Pic 1 and Pic 3)
    const frac = (timeSec - 275) / (1105.2 - 275);
    const lat = 12.384 - frac * (12.384 - 2.15);
    const lon = 84.506 + frac * (108.4 - 84.506);
    const alt = 124.9 + Math.sin(frac * Math.PI) * 23.5 + frac * (170.0 - 124.9);
    const vel = 4.2 + frac * (10.2 - 4.2);
    return {
      latStr: `${lat < 10 ? '0' : ''}${lat.toFixed(3)}°N`,
      lonStr: `0${lon.toFixed(3)}°E`,
      altKm: alt,
      velKms: vel,
      statusBanner: 'CUS THRUSTING, CUS S.O expected at T0+1105.2s', // Exact text from Pic 1 & Pic 3!
    };
  } else if (timeSec < 1130) {
    return {
      latStr: '02.120°N',
      lonStr: '109.250°E',
      altKm: 170.2,
      velKms: 10.2,
      statusBanner: 'CUS SHUT OFF (S.O) NOMINAL, PREPARING FOR SATELLITE SEPARATION',
    };
  } else {
    return {
      latStr: '01.850°N',
      lonStr: '112.400°E',
      altKm: 170.5,
      velKms: 10.24,
      statusBanner: 'SPACECRAFT SEPARATED NOMINALLY INTO GTO (PERIGEE: 170 km, APOGEE: 36,000 km)',
    };
  }
}

export const FlightMission3DVisualizer: React.FC<FlightMission3DVisualizerProps> = ({
  mission,
  rocket,
  failureOutcome,
  onMissionComplete,
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('broadcast_trajectory');
  const [isPipSwapped, setIsPipSwapped] = useState<boolean>(false);
  const [showBottomDock, setShowBottomDock] = useState<boolean>(false); // Collapsed by default for pure broadcast look!

  // Flight simulation telemetry (matching ISRO broadcast screen)
  const [flightSec, setFlightSec] = useState<number>(-8);
  const [altitudeKm, setAltitudeKm] = useState<number>(0);
  const [velocityKms, setVelocityKms] = useState<number>(0);
  const [latitudeStr, setLatitudeStr] = useState<string>('13.733°N');
  const [longitudeStr, setLongitudeStr] = useState<string>('080.235°E');
  const [broadcastBanner, setBroadcastBanner] = useState<string>('T-00:08s TERMINAL COUNTDOWN');
  const [dynamicQ, setDynamicQ] = useState<number>(0);
  const [isMissionComplete, setIsMissionComplete] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>('');

  // Interactive Pilot Controls
  const [throttlePct, setThrottlePct] = useState<number>(100);
  const [pitchDeg, setPitchDeg] = useState<number>(90);
  const [targetPitchDeg, setTargetPitchDeg] = useState<number>(90);
  const [pitchDeviationDeg, setPitchDeviationDeg] = useState<number>(0);
  const [isMaxQWarning, setIsMaxQWarning] = useState<boolean>(false);

  // Staging readiness states
  const [boostersSeparated, setBoostersSeparated] = useState<boolean>(false);
  const [fairingsSeparated, setFairingsSeparated] = useState<boolean>(false);
  const [satelliteDeployed, setSatelliteDeployed] = useState<boolean>(false);
  const [canSeparateBoosters, setCanSeparateBoosters] = useState<boolean>(false);
  const [canSeparateFairings, setCanSeparateFairings] = useState<boolean>(false);
  const [canDeploySatellite, setCanDeploySatellite] = useState<boolean>(false);

  // Three.js mutable scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mainCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pipCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rocketGroupRef = useRef<THREE.Group | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const gs2StageRef = useRef<THREE.Group | null>(null);
  const cusStageRef = useRef<THREE.Group | null>(null);
  const boosterLRef = useRef<THREE.Group | null>(null);
  const boosterRRef = useRef<THREE.Group | null>(null);
  const boosterFRef = useRef<THREE.Group | null>(null);
  const boosterBRef = useRef<THREE.Group | null>(null);
  const fairingLRef = useRef<THREE.Mesh | null>(null);
  const fairingRRef = useRef<THREE.Mesh | null>(null);
  const payloadHandleRef = useRef<MissionPayloadHandle | null>(null);
  const celestialEnvRef = useRef<CelestialEnvironmentHandle | null>(null);
  const exhaustPlumeRef = useRef<THREE.Group | null>(null);
  const machDiamondsRef = useRef<THREE.Mesh[]>([]);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const gantryArmsRef = useRef<THREE.Group | null>(null);
  const debrisGroupRef = useRef<THREE.Group | null>(null);
  const explosionMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Continuous physics clock refs for 60 FPS delta-time interpolation
  const simTimeRef = useRef<number>(-8.0);
  const lastUiUpdateRef = useRef<number>(0);
  const isFailedRef = useRef<boolean>(false);
  const isCompleteRef = useRef<boolean>(false);
  const boostersSeparatedRef = useRef<boolean>(false);
  const fairingsSeparatedRef = useRef<boolean>(false);
  const satelliteDeployedRef = useRef<boolean>(false);
  const throttleRef = useRef<number>(100);
  const pitchRef = useRef<number>(90);
  const playbackSpeedRef = useRef<number>(1);
  const isPlayingRef = useRef<boolean>(true);
  const cameraModeRef = useRef<CameraViewMode>('broadcast_trajectory');
  const isPipSwappedRef = useRef<boolean>(false);

  // Sync refs with state
  useEffect(() => { throttleRef.current = throttlePct; }, [throttlePct]);
  useEffect(() => { pitchRef.current = pitchDeg; }, [pitchDeg]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { cameraModeRef.current = cameraMode; }, [cameraMode]);
  useEffect(() => { isPipSwappedRef.current = isPipSwapped; }, [isPipSwapped]);
  useEffect(() => { boostersSeparatedRef.current = boostersSeparated; }, [boostersSeparated]);
  useEffect(() => { fairingsSeparatedRef.current = fairingsSeparated; }, [fairingsSeparated]);
  useEffect(() => { satelliteDeployedRef.current = satelliteDeployed; }, [satelliteDeployed]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFailedRef.current || isCompleteRef.current) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setThrottlePct((prev) => Math.min(105, prev + 5));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setThrottlePct((prev) => Math.max(60, prev - 5));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPitchDeg((prev) => Math.min(95, prev + 1.5));
        soundFX.playRcsThruster();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPitchDeg((prev) => Math.max(20, prev - 1.5));
        soundFX.playRcsThruster();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (canSeparateBoosters && !boostersSeparatedRef.current) {
          executeBoosterSeparation();
        } else if (canSeparateFairings && !fairingsSeparatedRef.current) {
          executeFairingSeparation();
        } else if (canDeploySatellite && !satelliteDeployedRef.current) {
          executeSatelliteDeployment();
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsPipSwapped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSeparateBoosters, canSeparateFairings, canDeploySatellite]);

  const executeBoosterSeparation = () => {
    if (boostersSeparatedRef.current) return;
    setBoostersSeparated(true);
    boostersSeparatedRef.current = true;
    soundFX.playStageSeparationChime();
  };

  const executeFairingSeparation = () => {
    if (fairingsSeparatedRef.current) return;
    setFairingsSeparated(true);
    fairingsSeparatedRef.current = true;
    soundFX.playStageSeparationChime();
  };

  const executeSatelliteDeployment = () => {
    if (satelliteDeployedRef.current) return;
    setSatelliteDeployed(true);
    satelliteDeployedRef.current = true;
    soundFX.playStageSeparationChime();
    if (payloadHandleRef.current) {
      payloadHandleRef.current.deploySolarArrays(true);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.setMuted(next);
  };

  const triggerExplosionBreakup = (reason: string) => {
    if (isFailedRef.current) return;
    isFailedRef.current = true;
    setIsFailed(true);
    setFailureReason(reason);
    soundFX.playExplosionSound();
    soundFX.playAlarmSiren(3);

    if (coreMeshRef.current) coreMeshRef.current.visible = false;
    if (exhaustPlumeRef.current) exhaustPlumeRef.current.visible = false;

    if (explosionMeshRef.current) {
      explosionMeshRef.current.visible = true;
      if (rocketGroupRef.current) {
        explosionMeshRef.current.position.copy(rocketGroupRef.current.position);
      }
    }

    if (debrisGroupRef.current && rocketGroupRef.current) {
      debrisGroupRef.current.visible = true;
      debrisGroupRef.current.position.copy(rocketGroupRef.current.position);
    }

    onMissionComplete?.(false, {
      maxAltKm: altitudeKm,
      topSpeedKmh: velocityKms * 3600,
      stars: 0,
      failureReason: reason,
    });
  };

  // Setup Three.js Aerospace Flight Scene matching Pics 1, 2, 3
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 600;

    // 1. Scene with cosmic pitch-black deep space background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.0004);
    sceneRef.current = scene;

    // 2. Dual Camera Setup:
    // A. Broadcast Orbital Camera (Picture 1: Wide trajectory arc over curved Earth)
    const broadcastCamera = new THREE.PerspectiveCamera(48, width / height, 0.1, 12000);
    broadcastCamera.position.set(-18, 28, 48);
    mainCameraRef.current = broadcastCamera;

    // B. Chase Stage Camera (Pictures 2 & 3: Close-up side/rear of rocket stage thrusting)
    const chaseCamera = new THREE.PerspectiveCamera(42, width / height, 0.1, 8000);
    chaseCamera.position.set(0, 16, 26);
    pipCameraRef.current = chaseCamera;

    // 3. Renderer with ACES Filmic Tone Mapping & High-Definition Resolution
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls for interactive camera inspection
    const controls = new OrbitControls(broadcastCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 4000;
    controls.minDistance = 4;
    controlsRef.current = controls;

    // 5. Authentic Sunlight & Space Fill Lighting Rig
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.4);
    sunLight.position.set(120, 220, 140);
    scene.add(sunLight);

    const earthFillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    earthFillLight.position.set(-60, -40, -40);
    scene.add(earthFillLight);

    const cosmicAmbient = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.7);
    scene.add(cosmicAmbient);

    // 6. Deep Cosmic Starfield (3,500 fine pinpoint stars)
    const starGeom = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 6000;
      starPositions[i + 1] = (Math.random() - 0.5) * 6000;
      starPositions[i + 2] = (Math.random() - 0.5) * 6000;

      const tone = 0.85 + Math.random() * 0.15;
      starColors[i] = tone;
      starColors[i + 1] = tone * (0.9 + Math.random() * 0.1);
      starColors[i + 2] = tone * (0.95 + Math.random() * 0.05);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    // 7. Sriharikota Launch Pad Table (for T <= 0s liftoff)
    const padGroup = new THREE.Group();
    const mountGeom = new THREE.CylinderGeometry(22, 26, 4, 32);
    const mountMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const mountMesh = new THREE.Mesh(mountGeom, mountMat);
    mountMesh.position.y = -2;
    padGroup.add(mountMesh);

    // Red Gantry Service Tower
    const towerGeom = new THREE.BoxGeometry(4.5, 48, 4.5);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6, metalness: 0.4 });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.set(-8.5, 22, 0);
    padGroup.add(tower);

    // Swing Arms
    const armsGroup = new THREE.Group();
    for (let a = 0; a < 3; a++) {
      const armGeom = new THREE.BoxGeometry(6, 1.2, 1.2);
      const arm = new THREE.Mesh(armGeom, towerMat);
      arm.position.set(-5, 12 + a * 11, 0);
      armsGroup.add(arm);
    }
    padGroup.add(armsGroup);
    gantryArmsRef.current = armsGroup;
    scene.add(padGroup);

    // 8. Distinctive Mission Celestial Environment
    const celestialHandle = buildMissionCelestialEnvironment(mission.id, scene);
    celestialEnvRef.current = celestialHandle;

    // 9. GSLV / IN-SPACe Aerospace Launch Vehicle Assembly (Pictures 2 & 3)
    const rocketGroup = new THREE.Group();
    rocketGroupRef.current = rocketGroup;

    // -------------------------------------------------------------
    // A. STAGE 1 (GS1 Core + S139 Motor)
    // -------------------------------------------------------------
    const s1Mat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.6 });
    const s1Geom = new THREE.CylinderGeometry(1.4, 1.4, 18, 32);
    const s1Core = new THREE.Mesh(s1Geom, s1Mat);
    s1Core.position.y = 9;
    rocketGroup.add(s1Core);
    coreMeshRef.current = s1Core;

    // 4 Liquid Strap-On Boosters (L40)
    const boosterMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.5 });
    const boosterGeom = new THREE.CylinderGeometry(0.8, 0.8, 16, 24);
    const boosterNoseGeom = new THREE.ConeGeometry(0.8, 3.0, 24);

    const makeBooster = (x: number, z: number) => {
      const bGrp = new THREE.Group();
      const bMesh = new THREE.Mesh(boosterGeom, boosterMat);
      const bNose = new THREE.Mesh(boosterNoseGeom, boosterMat);
      bNose.position.y = 9.5;
      bGrp.add(bMesh, bNose);
      bGrp.position.set(x, 8, z);
      return bGrp;
    };

    const bL = makeBooster(-2.4, 0);
    const bR = makeBooster(2.4, 0);
    const bF = makeBooster(0, 2.4);
    const bB = makeBooster(0, -2.4);
    rocketGroup.add(bL, bR, bF, bB);
    boosterLRef.current = bL;
    boosterRRef.current = bR;
    boosterFRef.current = bF;
    boosterBRef.current = bB;

    // -------------------------------------------------------------
    // B. OPEN LATTICE INTERSTAGE TRUSS STRUCTURE (AS IN PICS 2 & 3)
    // -------------------------------------------------------------
    const interstageGroup = new THREE.Group();
    interstageGroup.position.set(0, 18.5, 0);

    const trussRingMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
    const ringBottom = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.08, 8, 32), trussRingMat);
    ringBottom.rotation.x = Math.PI / 2;
    ringBottom.position.y = -1.2;
    const ringTop = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.08, 8, 32), trussRingMat);
    ringTop.rotation.x = Math.PI / 2;
    ringTop.position.y = 1.2;
    interstageGroup.add(ringBottom, ringTop);

    // Criss-cross diagonal metal struts (authentic open lattice interstage!)
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });
    for (let s = 0; s < 16; s++) {
      const angle = (s * Math.PI) / 8;
      const strutGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8);
      const strut1 = new THREE.Mesh(strutGeom, strutMat);
      strut1.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
      strut1.rotation.z = Math.PI / 6;
      strut1.rotation.y = angle;

      const strut2 = new THREE.Mesh(strutGeom, strutMat);
      strut2.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
      strut2.rotation.z = -Math.PI / 6;
      strut2.rotation.y = angle;

      interstageGroup.add(strut1, strut2);
    }
    rocketGroup.add(interstageGroup);

    // -------------------------------------------------------------
    // C. STAGE 2 (GS2 VIKAS LIQUID STAGE - PICTURE 2 HERO)
    // -------------------------------------------------------------
    const gs2Group = new THREE.Group();
    gs2Group.position.set(0, 25.5, 0);

    // White aluminum tank body with longitudinal stringers
    const gs2Mat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.65,
    });
    const gs2Tank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 11.5, 32), gs2Mat);
    gs2Group.add(gs2Tank);

    // Saffron/White/Green Tricolor Stripe Band
    const flagStripeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const flagStripe = new THREE.Mesh(new THREE.CylinderGeometry(1.41, 1.41, 1.4, 32), flagStripeMat);
    flagStripe.position.y = 3.2;
    gs2Group.add(flagStripe);

    // External cable raceways / propellant feed lines
    const racewayMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });
    const raceway = new THREE.Mesh(new THREE.BoxGeometry(0.18, 11.2, 0.12), racewayMat);
    raceway.position.set(1.42, 0, 0);
    gs2Group.add(raceway);

    // Vikas Engine Bell Nozzle (mounted inside open interstage base!)
    const vikasNozzleMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Heat-tinted Inconel / GRCop
      metalness: 0.95,
      roughness: 0.25,
    });
    const vikasNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.2, 24, 1, true), vikasNozzleMat);
    vikasNozzle.position.set(0, -6.8, 0);
    gs2Group.add(vikasNozzle);

    rocketGroup.add(gs2Group);
    gs2StageRef.current = gs2Group;

    // -------------------------------------------------------------
    // D. STAGE 3 (CUS CRYOGENIC UPPER STAGE - PICTURE 3 HERO)
    // -------------------------------------------------------------
    const cusGroup = new THREE.Group();
    cusGroup.position.set(0, 36.5, 0);

    // White Cryogenic Tank with thermal foam jacket
    const cusMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.75,
    });
    const cusTank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 8.5, 32), cusMat);
    cusGroup.add(cusTank);

    // Cryo Umbilical Tunnel / Stringer Ribs
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    for (let r = 0; r < 4; r++) {
      const ang = (r * Math.PI) / 2;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 8.2, 0.08), ribMat);
      rib.position.set(Math.cos(ang) * 1.41, 0, Math.sin(ang) * 1.41);
      cusGroup.add(rib);
    }

    // CE-7.5 / CE-20 Cryogenic High-Expansion Engine Nozzle
    const cryoNozzleMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.95,
      roughness: 0.15,
    });
    const cryoNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.6, 24, 1, true), cryoNozzleMat);
    cryoNozzle.position.set(0, -5.4, 0);
    cusGroup.add(cryoNozzle);

    // Payload Adapter Cone
    const adapterCone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 32, 1, true), ribMat);
    adapterCone.position.set(0, 5.0, 0);
    cusGroup.add(adapterCone);

    rocketGroup.add(cusGroup);
    cusStageRef.current = cusGroup;

    // -------------------------------------------------------------
    // E. 3.4M PAYLOAD FAIRING SHELLS (Jettison at T+235s)
    // -------------------------------------------------------------
    const fairingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.75,
    });
    const fairingGeomL = new THREE.ConeGeometry(1.5, 7.5, 32, 1, false, 0, Math.PI);
    const fairingL = new THREE.Mesh(fairingGeomL, fairingMat);
    fairingL.position.set(0, 43.5, 0);
    rocketGroup.add(fairingL);
    fairingLRef.current = fairingL;

    const fairingGeomR = new THREE.ConeGeometry(1.5, 7.5, 32, 1, false, Math.PI, Math.PI);
    const fairingR = new THREE.Mesh(fairingGeomR, fairingMat);
    fairingR.position.set(0, 43.5, 0);
    rocketGroup.add(fairingR);
    fairingRRef.current = fairingR;

    // -------------------------------------------------------------
    // F. NVS-03 SATELLITE PAYLOAD (Mounted inside / on CUS top)
    // -------------------------------------------------------------
    const payloadHandle = buildMissionSpecificPayload(mission.id);
    payloadHandle.payloadGroup.position.set(0, 42.5, 0);
    rocketGroup.add(payloadHandle.payloadGroup);
    payloadHandleRef.current = payloadHandle;

    // -------------------------------------------------------------
    // G. REALISTIC EXHAUST PLUME WITH SUPERSONIC MACH SHOCK DIAMONDS
    // -------------------------------------------------------------
    const plumeGroup = new THREE.Group();
    plumeGroup.position.y = -1.2;

    // Luminous inner core
    const flameGeom = new THREE.ConeGeometry(1.5, 16, 24);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const flameMesh = new THREE.Mesh(flameGeom, flameMat);
    flameMesh.rotation.x = Math.PI;
    flameMesh.position.y = -8;
    plumeGroup.add(flameMesh);

    // Cyan/Violet supersonic throat core (matching Pic 2!)
    const coreFlameGeom = new THREE.ConeGeometry(0.65, 8, 16);
    const coreFlameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const coreFlame = new THREE.Mesh(coreFlameGeom, coreFlameMat);
    coreFlame.rotation.x = Math.PI;
    coreFlame.position.y = -4;
    plumeGroup.add(coreFlame);

    // 4 Supersonic Mach Diamonds
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const diamonds: THREE.Mesh[] = [];
    for (let d = 0; d < 4; d++) {
      const dMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.42 - d * 0.07, 0), diamondMat);
      dMesh.position.y = -2.2 - d * 2.5;
      plumeGroup.add(dMesh);
      diamonds.push(dMesh);
    }
    machDiamondsRef.current = diamonds;
    plumeGroup.visible = false;
    rocketGroup.add(plumeGroup);
    exhaustPlumeRef.current = plumeGroup;

    // Catastrophic failure debris
    const debrisGroup = new THREE.Group();
    const debrisMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    for (let i = 0; i < 30; i++) {
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), debrisMat);
      chunk.userData = {
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        vz: (Math.random() - 0.5) * 6,
        rotX: Math.random() * 0.2,
      };
      debrisGroup.add(chunk);
    }
    debrisGroup.visible = false;
    scene.add(debrisGroup);
    debrisGroupRef.current = debrisGroup;

    // Fireball
    const fireSphere = new THREE.Mesh(
      new THREE.SphereGeometry(12, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })
    );
    fireSphere.visible = false;
    scene.add(fireSphere);
    explosionMeshRef.current = fireSphere;

    scene.add(rocketGroup);

    // =========================================================================
    // 10. 60 FPS CONTINUOUS GAME LOOP & DUAL VIEWPORT PiP RENDERING
    // =========================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const rawDelta = clock.getDelta();
      const delta = Math.min(rawDelta, 0.05);

      if (!isPlayingRef.current || isFailedRef.current) {
        if (controlsRef.current) controlsRef.current.update();
        renderer.render(scene, broadcastCamera);
        return;
      }

      const dt = delta * playbackSpeedRef.current;
      simTimeRef.current += dt;
      const t = simTimeRef.current;

      // Handle Gantry arm retraction
      if (t >= -3 && t < 0 && gantryArmsRef.current) {
        gantryArmsRef.current.rotation.y = (Math.PI / 4) * ((t + 3) / 3);
      }

      // Live downrange telemetry
      const tel = getIsroDownrangeTelemetry(t);

      // -------------------------------------------------------------
      // STAGE SEPARATIONS & 3D KINEMATICS:
      // -------------------------------------------------------------
      if (t < 0) {
        if (exhaustPlumeRef.current) exhaustPlumeRef.current.visible = false;
        rocketGroup.position.set(0, 0, 0);
      } else if (t >= 0 && t < 130) {
        // Stage 1 Liftoff & S200 burn
        if (exhaustPlumeRef.current) {
          exhaustPlumeRef.current.visible = true;
          exhaustPlumeRef.current.position.y = -1.2;
        }
        rocketGroup.position.y = (t / 130) * 180;
        rocketGroup.rotation.z = -((90 - pitchRef.current) * (Math.PI / 180));
      } else if (t >= 130 && t < 235) {
        // Boosters decouple & tumble away
        if (boosterLRef.current) boosterLRef.current.position.x -= dt * 1.2;
        if (boosterRRef.current) boosterRRef.current.position.x += dt * 1.2;
        if (boosterFRef.current) boosterFRef.current.position.z += dt * 1.2;
        if (boosterBRef.current) boosterBRef.current.position.z -= dt * 1.2;

        // GS2 Vikas stage is now firing! Move plume to GS2 nozzle base
        if (exhaustPlumeRef.current) {
          exhaustPlumeRef.current.visible = true;
          exhaustPlumeRef.current.position.y = 18.5; // Inside interstage truss!
        }
        rocketGroup.position.y = 180 + ((t - 130) / 105) * 220;
        rocketGroup.rotation.z = -((90 - pitchRef.current) * (Math.PI / 180));
      } else if (t >= 235 && t < 275) {
        // Fairing Jettison: Fairing halves drift apart revealing gold NVS-03 satellite!
        if (fairingLRef.current) {
          fairingLRef.current.position.x -= dt * 2.2;
          fairingLRef.current.rotation.y += dt * 0.6;
        }
        if (fairingRRef.current) {
          fairingRRef.current.position.x += dt * 2.2;
          fairingRRef.current.rotation.y -= dt * 0.6;
        }

        // GS2 Vikas continues thrusting (exact scene from Pic 2!)
        if (exhaustPlumeRef.current) {
          exhaustPlumeRef.current.visible = true;
          exhaustPlumeRef.current.position.y = 18.5;
        }
        rocketGroup.position.y = 400 + ((t - 235) / 40) * 120;
        rocketGroup.rotation.z = -((90 - pitchRef.current) * (Math.PI / 180));
      } else if (t >= 275 && t < 1105.2) {
        // GS2 separation! Stage 3 (CUS Cryogenic Upper Stage) CE-20 engine fires! (Pics 1 & 3!)
        if (s1Core) s1Core.visible = false;
        if (gs2Group) gs2Group.position.y -= dt * 3.5; // GS2 drops behind

        // Move plume to CUS nozzle bell
        if (exhaustPlumeRef.current) {
          exhaustPlumeRef.current.visible = true;
          exhaustPlumeRef.current.position.y = 31.0;
        }
        rocketGroup.position.y = 520 + ((t - 275) / 830) * 450;
        rocketGroup.rotation.z = -((90 - pitchRef.current) * (Math.PI / 180));
      } else if (t >= 1105.2) {
        // CUS engine cutoff (S.O)
        if (exhaustPlumeRef.current) exhaustPlumeRef.current.visible = false;

        if (!isCompleteRef.current) {
          isCompleteRef.current = true;
          setIsMissionComplete(true);
          soundFX.playVictoryFanfare();
          confetti({ particleCount: 160, spread: 110, origin: { y: 0.5 } });
          if (payloadHandleRef.current) {
            payloadHandleRef.current.deploySolarArrays(true);
          }
          onMissionComplete?.(true, {
            maxAltKm: mission.flightProfile.targetAltitudeKm,
            topSpeedKmh: mission.flightProfile.targetVelocityKmh,
            stars: 3,
          });
        }
      }

      // Jitter Mach Diamonds
      if (exhaustPlumeRef.current && exhaustPlumeRef.current.visible) {
        const jitter = 1 + (Math.random() * 0.1 - 0.05);
        machDiamondsRef.current.forEach((d) => d.scale.set(jitter, jitter, jitter));
      }

      // Animate Celestial Environment (Earth rotation & trajectory glow)
      if (celestialEnvRef.current) {
        celestialEnvRef.current.update(delta, t, tel.altKm);
      }

      // Update Payload animations
      if (payloadHandleRef.current) {
        payloadHandleRef.current.updateAnimation(delta, t, satelliteDeployedRef.current);
      }

      // -------------------------------------------------------------
      // DUAL CAMERA CINEMATICS:
      // -------------------------------------------------------------
      const rY = rocketGroup.position.y;

      // 1. Broadcast Trajectory Camera (Picture 1): Wide-angle looking over Earth curvature
      broadcastCamera.position.set(-16, Math.max(18, rY * 0.35 + 16), 56);
      broadcastCamera.lookAt(12, Math.max(10, rY * 0.4), 0);

      // 2. Stage Chase Camera (Pictures 2 & 3): Close-up side/rear tracking of active stage
      chaseCamera.position.set(12, rY + 12, 28);
      chaseCamera.lookAt(0, rY + 28, 0);

      // Update interactive OrbitControls if in orbital mode
      if (cameraModeRef.current === 'orbital') {
        controls.update();
      }

      // -------------------------------------------------------------
      // DUAL VIEWPORT PiP RENDERING (100% Matching Picture 1!):
      // -------------------------------------------------------------
      const curW = container.clientWidth;
      const curH = container.clientHeight;
      const isSwapped = isPipSwappedRef.current;

      // Choose which camera is primary and which is PiP
      const mainCam =
        cameraModeRef.current === 'broadcast_trajectory'
          ? (isSwapped ? chaseCamera : broadcastCamera)
          : cameraModeRef.current === 'stage_chase'
          ? (isSwapped ? broadcastCamera : chaseCamera)
          : cameraModeRef.current === 'pad'
          ? broadcastCamera
          : broadcastCamera;

      const pipCam = isSwapped ? broadcastCamera : chaseCamera;

      // Render 1: Main Viewport (Full Screen)
      renderer.setViewport(0, 0, curW, curH);
      renderer.setScissor(0, 0, curW, curH);
      renderer.setScissorTest(false);
      renderer.render(scene, mainCam);

      // Render 2: Picture-in-Picture Inset (Top-Left, matching Pic 1!)
      // Render PiP when in broadcast_trajectory or stage_chase mode
      if (cameraModeRef.current === 'broadcast_trajectory' || cameraModeRef.current === 'stage_chase') {
        const pipW = Math.max(190, Math.min(320, Math.round(curW * 0.25)));
        const pipH = Math.round(pipW * 0.58);
        const pipX = 24;
        const pipY = curH - pipH - 64; // WebGL viewport coordinates start from bottom

        renderer.setViewport(pipX, pipY, pipW, pipH);
        renderer.setScissor(pipX, pipY, pipW, pipH);
        renderer.setScissorTest(true);
        renderer.render(scene, pipCam);
        renderer.setScissorTest(false);
      }

      // -------------------------------------------------------------
      // THROTTLED UI TELEMETRY SYNC (10 Hz update)
      // -------------------------------------------------------------
      const now = performance.now();
      if (now - lastUiUpdateRef.current > 100) {
        lastUiUpdateRef.current = now;
        setFlightSec(Math.round(t * 10) / 10);
        setAltitudeKm(parseFloat(tel.altKm.toFixed(1)));
        setVelocityKms(parseFloat(tel.velKms.toFixed(1)));
        setLatitudeStr(tel.latStr);
        setLongitudeStr(tel.lonStr);
        setBroadcastBanner(tel.statusBanner);

        // Staging triggers
        setCanSeparateBoosters(t >= 120 && t < 140);
        setCanSeparateFairings(t >= 225 && t < 245);
        setCanDeploySatellite(t >= 1100);
      }
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      broadcastCamera.aspect = w / h;
      broadcastCamera.updateProjectionMatrix();
      chaseCamera.aspect = w / h;
      chaseCamera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (celestialHandle) celestialHandle.dispose();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mission.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none">
      <div className="relative w-full h-full bg-[#020617] flex flex-col overflow-hidden">
        {/* =========================================================================
            1. V-AERO MISSION CONTROL HEADER (TOP BAR - HIGH-TECH BROADCAST STYLE)
            ========================================================================= */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-none">
          {/* Top-Left: Payload Spacecraft Telemetry Badge */}
          <div className="flex items-center space-x-2.5 pointer-events-auto">
            <div className="flex items-center space-x-2 bg-[#051329]/90 border border-slate-700/80 px-3 py-1.5 rounded shadow-lg">
              <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="leading-tight font-mono">
                <div className="text-cyan-400 font-extrabold text-xs">
                  ORBITAL BUS
                </div>
                <div className="text-slate-300 text-[10px]">
                  PAYLOAD TELEMETRY
                </div>
              </div>
            </div>
          </div>

          {/* Top-Center: Official Mission Title (Yellow Bold Italic Font - Broadcast Style) */}
          <div className="text-center pointer-events-auto">
            <h1 className="font-mono font-black italic text-amber-300 text-lg md:text-2xl tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {mission.id === 'gslv_nvs03' ? 'V-AERO HLV-3 / ORBITAL FLIGHT MISSION' : `${mission.codename} / ${mission.title}`}
            </h1>
          </div>

          {/* Top-Right: V-Aero Emblem with User Logo */}
          <div className="flex items-center space-x-3 pointer-events-auto">
            <div className="flex items-center space-x-2.5 bg-[#051329]/90 border border-slate-700/80 px-3 py-1.5 rounded shadow-lg">
              <div className="w-6 h-6 flex items-center justify-center">
                <img
                  src="/assets/aistudio/logo-vv_51cd0b98.png"
                  alt="V-AERO Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-right leading-tight font-bold font-mono">
                <div className="text-white text-xs font-black tracking-wider">V-AERO</div>
                <div className="text-cyan-400 text-[9px] tracking-widest uppercase">FLIGHT OPS</div>
              </div>
            </div>

            {/* Quick Audio Mute & Close */}
            <button
              onClick={handleToggleMute}
              className="p-1.5 rounded bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 cursor-pointer shadow"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 cursor-pointer shadow"
                title="Exit Flight Simulation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            2. INTERACTIVE 3D WEBGL VIEWPORT (EARTH HORIZON, ROCKET & TRAJECTORY)
            ========================================================================= */}
        <div className="relative flex-1 w-full h-full bg-[#020617] overflow-hidden">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* =========================================================================
              3. PICTURE-IN-PICTURE (PiP) INSET FRAME (YELLOW BORDER - EXACTLY AS IN PIC 1!)
              ========================================================================= */}
          {(cameraMode === 'broadcast_trajectory' || cameraMode === 'stage_chase') && (
            <div
              onClick={() => setIsPipSwapped(!isPipSwapped)}
              className="absolute top-16 left-6 z-30 cursor-pointer group pointer-events-auto"
              title="Click to swap Main View and Picture-in-Picture!"
            >
              <div className="border-2 border-amber-400 bg-slate-950/80 shadow-2xl rounded-sm overflow-hidden w-48 sm:w-64 md:w-80 aspect-[16/10] relative transition-transform duration-200 group-hover:scale-102">
                <div className="absolute top-1 left-2 text-[9px] font-mono font-bold text-amber-300 bg-black/70 px-1 rounded">
                  {cameraMode === 'broadcast_trajectory'
                    ? (isPipSwapped ? 'ORBITAL TRAJECTORY TRACKING' : 'ONBOARD / STAGE CAMERA')
                    : (isPipSwapped ? 'STAGE CHASE CAM' : 'ORBITAL TRACKING MAP')}
                </div>
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-300 bg-black/75 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  CLICK TO SWAP ⇄
                </div>
              </div>
            </div>
          )}

          {/* Camera View Mode Selector Pills (top center under header) */}
          <div className="absolute top-16 right-6 z-20 flex items-center space-x-1.5 bg-[#051329]/90 p-1 rounded-lg border border-slate-800 text-xs font-mono shadow-xl pointer-events-auto">
            <span className="text-slate-400 px-2 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold hidden sm:inline">Camera:</span>
            </span>
            <button
              onClick={() => { setCameraMode('broadcast_trajectory'); setIsPipSwapped(false); }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                cameraMode === 'broadcast_trajectory'
                  ? 'bg-amber-500 text-black shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Orbital Trajectory (Pic 1)
            </button>
            <button
              onClick={() => { setCameraMode('stage_chase'); setIsPipSwapped(false); }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                cameraMode === 'stage_chase'
                  ? 'bg-cyan-600 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stage Chase (Pics 2 & 3)
            </button>
            <button
              onClick={() => setCameraMode('orbital')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                cameraMode === 'orbital'
                  ? 'bg-purple-600 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Free 3D Orbit
            </button>
          </div>

          {/* =========================================================================
              4. AUTHENTIC TELEMETRY TABLE (BOTTOM-LEFT - EXACTLY AS IN PICS 1, 2, 3)
              ========================================================================= */}
          <div className="absolute bottom-16 left-6 z-20 bg-[#051329]/90 border border-cyan-800/70 rounded px-4 py-2.5 shadow-2xl font-mono text-xs md:text-sm pointer-events-auto">
            <div className="grid grid-cols-[85px_1fr] gap-x-2 gap-y-1">
              <span className="text-amber-400 font-bold">TIME :</span>
              <span className="text-white font-extrabold">{flightSec.toFixed(1)} s</span>

              <span className="text-amber-400 font-bold">Latitude :</span>
              <span className="text-white font-extrabold">{latitudeStr}</span>

              <span className="text-amber-400 font-bold">Longitude :</span>
              <span className="text-white font-extrabold">{longitudeStr}</span>

              <span className="text-amber-400 font-bold">Altitude :</span>
              <span className="text-white font-extrabold">{altitudeKm.toFixed(1)} km</span>

              <span className="text-amber-400 font-bold">Velocity :</span>
              <span className="text-white font-extrabold">{velocityKms.toFixed(1)} km/s</span>
            </div>
          </div>

          {/* =========================================================================
              5. OFFICIAL BROADCAST STATUS MARQUEE (BOTTOM-CENTER - PICS 1, 2, 3)
              ========================================================================= */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl text-center pointer-events-none">
            <div className="bg-[#030d1e]/95 border-t border-b border-cyan-900/80 py-2 px-6 shadow-2xl backdrop-blur-md">
              <span className="text-amber-300 font-mono font-black text-sm md:text-lg tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {broadcastBanner}
              </span>
            </div>
          </div>

          {/* =========================================================================
              6. DUAL INERTIAL NAVIGATION STATUS (BOTTOM-RIGHT - PICS 1, 2, 3)
              ========================================================================= */}
          <div className="absolute bottom-16 right-6 z-20 flex flex-col items-end space-y-1.5 font-mono text-xs pointer-events-auto">
            <div className="flex items-center space-x-3 bg-[#051329]/90 border border-cyan-800/70 px-3.5 py-1.5 rounded shadow-xl">
              <span className="text-slate-300 font-bold">INS :</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>CH1</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>CH2</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              TRACKING STATION • DSN-1
            </div>
          </div>

          {/* Manual Staging Action Buttons (Pop up at real milestone timestamps) */}
          <div className="absolute top-28 right-6 z-20 space-y-2 font-mono text-xs pointer-events-auto">
            {canSeparateBoosters && !boostersSeparated && (
              <button
                onClick={executeBoosterSeparation}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold shadow-xl animate-bounce cursor-pointer flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>SEPARATE S200 BOOSTERS [SPACE]</span>
              </button>
            )}
            {canSeparateFairings && !fairingsSeparated && (
              <button
                onClick={executeFairingSeparation}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-xl animate-bounce cursor-pointer flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>JETTISON FAIRING CASING [SPACE]</span>
              </button>
            )}
            {canDeploySatellite && !satelliteDeployed && (
              <button
                onClick={executeSatelliteDeployment}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-xl animate-bounce cursor-pointer flex items-center space-x-2"
              >
                <Award className="w-4 h-4 text-emerald-200" />
                <span>DEPLOY SATELLITE PAYLOAD [SPACE]</span>
              </button>
            )}
          </div>

          {/* =========================================================================
              7. COLLAPSIBLE PILOT / SIMULATION SPEED DOCK (DISCREET BOTTOM DOCK)
              ========================================================================= */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto">
            <button
              onClick={() => setShowBottomDock(!showBottomDock)}
              className="px-3 py-1 rounded-t bg-[#051329]/90 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-all shadow"
            >
              {showBottomDock ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              <span>{showBottomDock ? 'Hide Simulation Controls' : 'Show Speed & Pilot Controls'}</span>
            </button>

            {showBottomDock && (
              <div className="bg-[#051329]/95 p-3 rounded-b-xl border border-slate-700 shadow-2xl flex items-center space-x-4 font-mono text-xs">
                {/* Play / Pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                {/* Speed Multipliers */}
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 5, 10].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-amber-500 text-black font-extrabold'
                          : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Throttle Slider */}
                <div className="flex items-center space-x-2 pl-3 border-l border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Throttle:</span>
                  <input
                    type="range"
                    min="60"
                    max="105"
                    step="1"
                    value={throttlePct}
                    onChange={(e) => setThrottlePct(Number(e.target.value))}
                    className="w-24 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-amber-400 font-bold">{throttlePct}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Failure Investigation Modal */}
        {isFailed && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 max-w-xl w-full text-center space-y-4 shadow-2xl text-slate-100 font-sans">
              <div className="w-16 h-16 rounded-full bg-rose-950 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950">
                <Skull className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">
                  V-AERO FLIGHT SAFETY INVESTIGATION BOARD
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Catastrophic Telemetry Loss • Mission Aborted
                </h3>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 text-left font-mono text-xs space-y-2">
                <div className="text-rose-400 font-bold uppercase flex items-center space-x-1.5 text-[11px]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Accident Finding:</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans text-xs">{failureReason}</p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    setIsFailed(false);
                    isFailedRef.current = false;
                    simTimeRef.current = -8;
                    setFlightSec(-8);
                    setAltitudeKm(0);
                    setVelocityKms(0);
                    if (coreMeshRef.current) coreMeshRef.current.visible = true;
                    if (debrisGroupRef.current) debrisGroupRef.current.visible = false;
                    if (explosionMeshRef.current) explosionMeshRef.current.visible = false;
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Restart Flight Sim
                </button>
                <button
                  onClick={() => onClose?.()}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Return to Mission Hub
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Victory Modal */}
        {isMissionComplete && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full text-center space-y-4 shadow-2xl text-slate-100 font-sans">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  MISSION ACCOMPLISHED • 3 STARS
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {mission.id === 'gslv_nvs03' ? 'V-AERO HLV-3 ORBITAL INSERTION' : mission.title}
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  Target GTO Orbit Conquered • Satellite Payload Deployed
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-2xl text-amber-400">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Contract Payout</span>
                  <span className="text-emerald-400 font-extrabold text-base">
                    ₹{(mission.rewardINR / 1e7).toFixed(1)} Crores
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Prestige XP</span>
                  <span className="text-cyan-400 font-extrabold text-base">+{mission.rewardXP} XP</span>
                </div>
              </div>
              <button
                onClick={() => onClose?.()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-emerald-950 cursor-pointer"
              >
                Return to Mission Control
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
