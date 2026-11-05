/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Play,
  Pause,
  Box,
  Compass,
  Layers,
  Crosshair,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export type CADPartType =
  | 'impeller_blisk'
  | 'thrust_chamber'
  | 'tank_dome_fsw'
  | 'composite_fairing'
  | 'avionics_pcb'
  | 'ct_inspection'
  | 'semi_cryo_engine';

export type CADRenderMode = 'solid' | 'wireframe' | 'blueprint' | 'cutaway';

interface PartCADViewerProps {
  partType: CADPartType;
  renderMode?: CADRenderMode;
  onRenderModeChange?: (mode: CADRenderMode) => void;
  isRunning?: boolean;
  className?: string;
}

export const PartCADViewer: React.FC<PartCADViewerProps> = ({
  partType,
  renderMode: initialRenderMode = 'solid',
  onRenderModeChange,
  isRunning = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<CADRenderMode>(initialRenderMode);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [probePoint, setProbePoint] = useState<{
    x: number;
    y: number;
    z: number;
    deviation: number;
  } | null>(null);

  // Sync mode changes with parent
  const handleModeChange = (mode: CADRenderMode) => {
    setRenderMode(mode);
    onRenderModeChange?.(mode);
  };

  // References for three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep aerospace slate-black
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Clear any previous canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 3;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-8, -4, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf97316, 1.0);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);

    // 6. Grid and Datum Floor
    const gridHelper = new THREE.GridHelper(16, 20, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // 7. Click raycaster for CMM probe inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (modelGroupRef.current) {
        const intersects = raycaster.intersectObjects(modelGroupRef.current.children, true);
        if (intersects.length > 0) {
          const hit = intersects[0].point;
          const dev = (Math.random() * 0.006 - 0.003); // in mm (±3 microns)
          setProbePoint({
            x: parseFloat(hit.x.toFixed(3)),
            y: parseFloat(hit.y.toFixed(3)),
            z: parseFloat(hit.z.toFixed(3)),
            deviation: parseFloat(dev.toFixed(4)),
          });
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 8. Animation loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }

      // If active machining/running, add continuous spin to parts
      if (isRunning && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update OrbitControls autoRotate state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Build Procedural 3D CAD Geometry based on Part Type & Render Mode
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing model group if any
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
      modelGroupRef.current = null;
    }

    const group = new THREE.Group();
    modelGroupRef.current = group;

    // Helper: Material Generator based on Render Mode
    const createMaterial = (
      baseColor: number,
      metalness: number = 0.8,
      roughness: number = 0.25,
      opacity: number = 1.0,
      transparent: boolean = false
    ): THREE.Material => {
      if (renderMode === 'wireframe') {
        return new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          wireframeLinewidth: 1.2,
        });
      }

      if (renderMode === 'blueprint') {
        return new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.1,
          metalness: 0.2,
          wireframe: true,
        });
      }

      if (renderMode === 'cutaway') {
        return new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness,
          roughness,
          opacity: 0.65,
          transparent: true,
          side: THREE.DoubleSide,
        });
      }

      // Default 'solid' mode
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness,
        roughness,
        opacity,
        transparent,
      });
    };

    // Construct specific 3D CAD Models
    switch (partType) {
      case 'impeller_blisk': {
        // 1. Turbopump Impeller Hub (Inconel 718)
        const hubMat = createMaterial(0x94a3b8, 0.9, 0.2);
        const hubGeom = new THREE.CylinderGeometry(1.4, 2.2, 1.8, 36);
        const hubMesh = new THREE.Mesh(hubGeom, hubMat);
        group.add(hubMesh);

        // Shaft Bore
        const shaftMat = createMaterial(0x475569, 0.95, 0.3);
        const shaftGeom = new THREE.CylinderGeometry(0.6, 0.6, 2.4, 24);
        const shaftMesh = new THREE.Mesh(shaftGeom, shaftMat);
        group.add(shaftMesh);

        // 12 Aerodynamic Impeller Vanes
        const bladeMat = createMaterial(0xe2e8f0, 0.85, 0.15);
        const bladeCount = 12;
        for (let i = 0; i < bladeCount; i++) {
          const angle = (i / bladeCount) * Math.PI * 2;
          const bladeGeom = new THREE.BoxGeometry(0.12, 1.4, 2.4);
          const bladeMesh = new THREE.Mesh(bladeGeom, bladeMat);

          bladeMesh.position.x = Math.cos(angle) * 2.0;
          bladeMesh.position.z = Math.sin(angle) * 2.0;
          bladeMesh.position.y = 0.1;
          bladeMesh.rotation.y = -angle + 0.55; // Curved aerodynamic sweep
          bladeMesh.rotation.z = 0.15;
          group.add(bladeMesh);
        }

        // Shroud Ring / Base
        const baseGeom = new THREE.CylinderGeometry(3.6, 3.8, 0.4, 40);
        const baseMesh = new THREE.Mesh(baseGeom, hubMat);
        baseMesh.position.y = -0.9;
        group.add(baseMesh);
        break;
      }

      case 'thrust_chamber': {
        // 2. 3D Laser Sintered Regenerative Thrust Chamber & Nozzle (Copper-Inconel)
        const chamberMat = createMaterial(0xd97706, 0.8, 0.3);

        // Convergent-Divergent Profile
        const points = [];
        points.push(new THREE.Vector2(1.8, 2.5)); // Injector head
        points.push(new THREE.Vector2(1.8, 1.2)); // Combustion chamber
        points.push(new THREE.Vector2(0.9, 0.0)); // Throat constriction
        points.push(new THREE.Vector2(2.8, -2.6)); // Bell nozzle exit
        const latheGeom = new THREE.LatheGeometry(points, 36);
        const latheMesh = new THREE.Mesh(latheGeom, chamberMat);
        group.add(latheMesh);

        // Cooling Channel Ribs
        const ribMat = createMaterial(0xf59e0b, 0.6, 0.4);
        for (let r = 0; r < 16; r++) {
          const theta = (r / 16) * Math.PI * 2;
          const ribGeom = new THREE.TorusGeometry(1.82, 0.04, 8, 36);
          const ribMesh = new THREE.Mesh(ribGeom, ribMat);
          ribMesh.rotation.x = Math.PI / 2;
          ribMesh.position.y = 1.2 + (r * 0.08);
          group.add(ribMesh);
        }

        // Coaxial Injector Elements on Dome
        const injMat = createMaterial(0x94a3b8, 0.9, 0.2);
        for (let j = 0; j < 8; j++) {
          const phi = (j / 8) * Math.PI * 2;
          const injGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.5, 12);
          const injMesh = new THREE.Mesh(injGeom, injMat);
          injMesh.position.set(Math.cos(phi) * 1.0, 2.7, Math.sin(phi) * 1.0);
          group.add(injMesh);
        }
        break;
      }

      case 'tank_dome_fsw': {
        // 3. Al-Li 2195 Cryogenic Propellant Tank Dome & Circumferential Weld
        const domeMat = createMaterial(0x93c5fd, 0.85, 0.25);
        const domeGeom = new THREE.SphereGeometry(3.0, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeom, domeMat);
        domeMesh.position.y = 0;
        group.add(domeMesh);

        // Cylindrical Barrel Section
        const barrelGeom = new THREE.CylinderGeometry(3.0, 3.0, 2.5, 36, 1, true);
        const barrelMesh = new THREE.Mesh(barrelGeom, domeMat);
        barrelMesh.position.y = -1.25;
        group.add(barrelMesh);

        // Circumferential Friction Stir Weld Bead (Bright Welded Line)
        const weldMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          metalness: 0.9,
          emissive: 0x0284c7,
          emissiveIntensity: 0.4,
        });
        const weldGeom = new THREE.TorusGeometry(3.02, 0.06, 12, 48);
        const weldMesh = new THREE.Mesh(weldGeom, weldMat);
        weldMesh.rotation.x = Math.PI / 2;
        weldMesh.position.y = 0;
        group.add(weldMesh);

        // Apex Polar Boss Fitting (ISRO Propellant Valve Port)
        const bossMat = createMaterial(0x64748b, 0.9, 0.15);
        const bossGeom = new THREE.CylinderGeometry(0.6, 0.8, 0.6, 24);
        const bossMesh = new THREE.Mesh(bossGeom, bossMat);
        bossMesh.position.y = 3.0;
        group.add(bossMesh);
        break;
      }

      case 'composite_fairing': {
        // 4. CFRP Carbon Fiber Dual-Payload Fairing (Ogive Split Shell)
        const cMat = createMaterial(0x1e293b, 0.4, 0.5);

        // Ogive Nose Section
        const ogivePoints = [];
        ogivePoints.push(new THREE.Vector2(0.2, 3.5));
        ogivePoints.push(new THREE.Vector2(1.2, 2.5));
        ogivePoints.push(new THREE.Vector2(2.4, 1.0));
        ogivePoints.push(new THREE.Vector2(2.5, -2.5));
        const fairingGeom = new THREE.LatheGeometry(ogivePoints, 36, 0, Math.PI); // Half shell for inspection
        const fairingMesh = new THREE.Mesh(fairingGeom, cMat);
        group.add(fairingMesh);

        // Internal Honeycomb Stiffener Ring
        const ringMat = createMaterial(0xf59e0b, 0.5, 0.3);
        const ringGeom = new THREE.TorusGeometry(2.45, 0.08, 12, 36, Math.PI);
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 0.5;
        group.add(ringMesh);

        // Pyrotechnic Jettison Rail Seam
        const seamMat = createMaterial(0xef4444, 0.7, 0.2);
        const seamGeom = new THREE.BoxGeometry(0.08, 6.0, 0.1);
        const seamMesh = new THREE.Mesh(seamGeom, seamMat);
        seamMesh.position.set(0, 0.5, 2.5);
        group.add(seamMesh);
        break;
      }

      case 'avionics_pcb': {
        // 5. Quad-Redundant NavIC Flight Computer & GNC Architecture
        const pcbMat = createMaterial(0x064e3b, 0.3, 0.6); // Aerospace dark green
        const pcbGeom = new THREE.BoxGeometry(4.8, 0.15, 3.6);
        const pcbMesh = new THREE.Mesh(pcbGeom, pcbMat);
        group.add(pcbMesh);

        // Primary Rad-Hard FPGA ICs
        const fpgaMat = createMaterial(0x0f172a, 0.8, 0.3);
        const fpgaGeom = new THREE.BoxGeometry(0.9, 0.2, 0.9);
        for (let i = 0; i < 4; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          const fpgaMesh = new THREE.Mesh(fpgaGeom, fpgaMat);
          fpgaMesh.position.set((col - 0.5) * 1.8, 0.15, (row - 0.5) * 1.6);
          group.add(fpgaMesh);
        }

        // Gold MIL-STD Micro-D Headers
        const goldMat = createMaterial(0xeab308, 0.95, 0.1);
        const headerGeom = new THREE.BoxGeometry(0.3, 0.4, 2.8);
        const headerMesh = new THREE.Mesh(headerGeom, goldMat);
        headerMesh.position.set(-2.2, 0.2, 0);
        group.add(headerMesh);
        break;
      }

      case 'ct_inspection': {
        // 6. High-Energy CT Scan & Metrology Specimen with Defect Voxel
        const specMat = createMaterial(0x0284c7, 0.5, 0.2, 0.5, true);
        const specGeom = new THREE.BoxGeometry(3.6, 2.8, 3.6);
        const specMesh = new THREE.Mesh(specGeom, specMat);
        group.add(specMesh);

        // Internal Turbopump Cryo Passage
        const coreMat = createMaterial(0x38bdf8, 0.9, 0.1);
        const coreGeom = new THREE.CylinderGeometry(0.8, 0.8, 3.2, 24);
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        group.add(coreMesh);

        // Highlighted Sub-Surface Pore (Inspection Flaw)
        const flawMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const flawGeom = new THREE.SphereGeometry(0.25, 16, 16);
        const flawMesh = new THREE.Mesh(flawGeom, flawMat);
        flawMesh.position.set(1.0, 0.4, 0.8);
        group.add(flawMesh);
        break;
      }

      case 'semi_cryo_engine': {
        // 7. SCE-200 Semi-Cryogenic Rocket Engine Assembly
        const engMat = createMaterial(0x64748b, 0.9, 0.2);

        // Big Regenerative Nozzle Extension
        const engPoints = [];
        engPoints.push(new THREE.Vector2(0.8, 2.0)); // Head
        engPoints.push(new THREE.Vector2(0.9, 0.8)); // Chamber
        engPoints.push(new THREE.Vector2(0.5, 0.2)); // Throat
        engPoints.push(new THREE.Vector2(2.2, -2.6)); // Exit cone
        const engGeom = new THREE.LatheGeometry(engPoints, 36);
        const engMesh = new THREE.Mesh(engGeom, engMat);
        group.add(engMesh);

        // Turbopump Housing on Side
        const tpMat = createMaterial(0x94a3b8, 0.9, 0.2);
        const tpGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 20);
        const tpMesh = new THREE.Mesh(tpGeom, tpMat);
        tpMesh.rotation.z = Math.PI / 2;
        tpMesh.position.set(1.4, 1.2, 0);
        group.add(tpMesh);

        // Dual Hydraulic Gimbal Actuator Struts
        const strutMat = createMaterial(0xf97316, 0.8, 0.2);
        for (let a = 0; a < 2; a++) {
          const sign = a === 0 ? 1 : -1;
          const strutGeom = new THREE.CylinderGeometry(0.1, 0.1, 2.6, 12);
          const strutMesh = new THREE.Mesh(strutGeom, strutMat);
          strutMesh.position.set(sign * 1.5, 1.0, 0.5);
          strutMesh.rotation.z = sign * 0.35;
          group.add(strutMesh);
        }
        break;
      }
    }

    scene.add(group);
  }, [partType, renderMode]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 5, 12);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className={`relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col ${className}`}>
      {/* CAD Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-80 sm:h-96 md:h-[420px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Top Left: Part Type & Drawing Callout Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none font-mono">
        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="uppercase tracking-wider font-bold text-cyan-300">
            ISRO/V-AERO 3D CAD ENGINE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">WebGL PBR</span>
        </div>
      </div>

      {/* Top Right: Render Mode Switcher Bar */}
      <div className="absolute top-3 right-3 flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs font-mono">
        <button
          onClick={() => handleModeChange('solid')}
          title="Realistic Solid Shaded Metallic"
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
            renderMode === 'solid'
              ? 'bg-cyan-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Box className="w-3 h-3" />
          <span className="hidden sm:inline">Solid</span>
        </button>
        <button
          onClick={() => handleModeChange('wireframe')}
          title="Engineering Wireframe Mesh"
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
            renderMode === 'wireframe'
              ? 'bg-cyan-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span className="hidden sm:inline">Wireframe</span>
        </button>
        <button
          onClick={() => handleModeChange('blueprint')}
          title="Technical Blueprint Projection"
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
            renderMode === 'blueprint'
              ? 'bg-cyan-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span className="hidden sm:inline">Blueprint</span>
        </button>
        <button
          onClick={() => handleModeChange('cutaway')}
          title="Internal Cross-Section Cutaway"
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
            renderMode === 'cutaway'
              ? 'bg-cyan-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crosshair className="w-3 h-3" />
          <span className="hidden sm:inline">Cutaway</span>
        </button>
      </div>

      {/* Bottom Floating Toolbar: Auto-Rotate, Reset Camera, CMM Probe Inspection */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Left: CMM Probe Info */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <Crosshair className="w-3.5 h-3.5" />
            <span className="font-bold">CMM Probing:</span>
          </div>
          {probePoint ? (
            <div className="flex items-center space-x-2">
              <span>
                X: {probePoint.x} Y: {probePoint.y} Z: {probePoint.z} mm
              </span>
              <span
                className={`font-bold ${
                  Math.abs(probePoint.deviation) < 0.003
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                (Dev: {probePoint.deviation >= 0 ? '+' : ''}
                {probePoint.deviation} mm •{' '}
                {Math.abs(probePoint.deviation) < 0.003 ? 'PASS' : 'WARN'})
              </span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Click part to probe coordinates</span>
          )}
        </div>

        {/* Right: Camera Controls */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
