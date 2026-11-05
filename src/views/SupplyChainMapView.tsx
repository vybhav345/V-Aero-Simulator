/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Globe2,
  Truck,
  Plane,
  AlertTriangle,
  ShieldCheck,
  PackageCheck,
  Clock,
  Plus,
} from 'lucide-react';
import { Rupee } from '../components/Rupee.tsx';
import { Supplier, Material } from '../types/index.ts';

export const SupplyChainMapView: React.FC = () => {
  const { sim, orderMaterialManual } = useSimStore();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(sim.suppliers[0].id);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(sim.materials[0].id);
  const [orderQuantity, setOrderQuantity] = useState<number>(100);

  const selectedSupplier =
    sim.suppliers.find((s) => s.id === selectedSupplierId) || sim.suppliers[0];
  const selectedMaterial =
    sim.materials.find((m) => m.id === selectedMaterialId) || sim.materials[0];

  const inTransitShipments = sim.shipments.filter((s) => s.status === 'in_transit');

  const handleManualOrder = () => {
    orderMaterialManual(selectedMaterialId, Number(orderQuantity), selectedSupplierId);
  };

  // Convert lat/lng to SVG projection coordinates
  const projectCoordinates = (lat: number, lng: number) => {
    // Simple equirectangular projection onto 900x480 box
    const x = ((lng + 180) * (900 / 360));
    const y = ((90 - lat) * (480 / 180));
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Global Suppliers</span>
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-white">
            {sim.suppliers.length} Tier-1/2 Partners
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 8 Nations</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Shipments In Transit</span>
            <Truck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-blue-400">
            {inTransitShipments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Real-Time Routing</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Critical Materials</span>
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-emerald-400">
            {sim.materials.length} Stocked Lines
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Al-Li, Ti, Inconel, LOX</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>Single-Source Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-amber-400">
            {sim.suppliers.filter((s) => s.isSingleSource).length} Vendors
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires Redundancy</div>
        </div>
      </div>

      {/* Global Interactive Supply Logistics Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>Global Aerospace Supply Network & In-Transit Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400">
              Hover or click any supplier node to inspect AS9100 quality ratings, lead time variance, and shipping lanes.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Low Risk (1-3)</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Moderate (4-6)</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>High Risk (7-10)</span>
            </span>
          </div>
        </div>

        {/* SVG World Canvas */}
        <div className="w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
          <svg viewBox="0 0 900 480" className="w-full h-auto select-none">
            {/* World Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="900" height="480" fill="url(#grid)" />

            {/* Stylized Continents silhouettes */}
            <path
              d="M 120 120 Q 180 80 260 110 T 320 220 T 260 380 Q 220 420 180 340 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <path
              d="M 400 90 Q 520 70 600 120 T 780 180 T 820 340 Q 680 380 580 300 T 440 220 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <path
              d="M 680 320 Q 780 300 820 380 T 700 420 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* In-Transit Shipment Arcs */}
            {inTransitShipments.map((shp) => {
              const origin = projectCoordinates(shp.originLat, shp.originLng);
              const dest = projectCoordinates(shp.destLat, shp.destLng);
              const midX = (origin.x + dest.x) / 2;
              const midY = (origin.y + dest.y) / 2 - 30; // arch curvature

              // Interpolate current shipment position
              const t = shp.progressPct / 100;
              const curX = Math.round((1 - t) * (1 - t) * origin.x + 2 * (1 - t) * t * midX + t * t * dest.x);
              const curY = Math.round((1 - t) * (1 - t) * origin.y + 2 * (1 - t) * t * midY + t * t * dest.y);

              return (
                <g key={shp.id}>
                  {/* Arc Path */}
                  <path
                    d={`M ${origin.x} ${origin.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  {/* Moving Vehicle Marker */}
                  <circle cx={curX} cy={curY} r="4" fill="#38bdf8" className="animate-ping" />
                  <circle cx={curX} cy={curY} r="3" fill="#ffffff" />
                </g>
              );
            })}

            {/* AeroForge Facilities Markers */}
            {sim.facilities.map((fac) => {
              const pos = projectCoordinates(fac.lat, fac.lng);
              return (
                <g key={fac.id}>
                  <rect
                    x={pos.x - 6}
                    y={pos.y - 6}
                    width="12"
                    height="12"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    rx="2"
                  />
                  <text
                    x={pos.x + 8}
                    y={pos.y + 4}
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {fac.code}
                  </text>
                </g>
              );
            })}

            {/* Supplier Nodes */}
            {sim.suppliers.map((sup) => {
              const pos = projectCoordinates(sup.lat, sup.lng);
              const isSelected = selectedSupplierId === sup.id;
              const riskColor =
                sup.country === 'DR Congo / Norway' || sup.isSingleSource
                  ? '#f43f5e'
                  : sup.reliabilityRating < 0.95
                  ? '#f59e0b'
                  : '#10b981';

              return (
                <g
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? '8' : '5'}
                    fill={riskColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '2' : '1'}
                    className="transition-all hover:scale-125"
                  />
                  <text
                    x={pos.x + 8}
                    y={pos.y - 2}
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="8"
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {sup.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom Grid: Selected Supplier Details & Material Spot Market Order Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Supplier Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Supplier AS9100 Profile</span>
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                selectedSupplier.status === 'active'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {selectedSupplier.status}
            </span>
          </div>

          <div className="space-y-3 text-xs mb-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Vendor Entity</div>
              <div className="font-bold text-white text-sm">{selectedSupplier.name}</div>
              <div className="text-slate-400 text-xs">
                {selectedSupplier.city}, {selectedSupplier.country}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Quality Rating</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {(selectedSupplier.qualityRating * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">On-Time Reliability</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {(selectedSupplier.reliabilityRating * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Supplied Aerospace Materials</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSupplier.materialsSupplied.map((mId) => {
                  const m = sim.materials.find((x) => x.id === mId);
                  return (
                    <span
                      key={mId}
                      className="px-1.5 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-mono rounded"
                    >
                      {m ? m.name.split(' ')[0] : mId}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Contact: <span className="text-slate-200 font-semibold">{selectedSupplier.contactPerson}</span>
            </div>
          </div>
        </div>

        {/* Raw Material Spot Market & Manual Procurement Desk */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <Rupee className="w-4 h-4 text-emerald-400" />
              <span>Aerospace Raw Material Inventory & Spot Procurement</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono flex items-center">
              <span>Working Balance: ₹{(sim.financials.cashBalanceINR / 1e7).toFixed(1)} Cr</span>
            </span>
          </div>

          {/* Material Procurement Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Material Line</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              >
                {sim.materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (₹{m.spotPriceINR.toLocaleString()}/{m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Order Quantity ({selectedMaterial.unit})
              </label>
              <input
                type="number"
                min={selectedMaterial.minOrderQty}
                step={selectedMaterial.minOrderQty}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleManualOrder}
                className="flex items-center justify-center space-x-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md shadow-emerald-950 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  Indent ₹{(orderQuantity * selectedMaterial.spotPriceINR).toLocaleString()}
                </span>
              </button>
            </div>
          </div>

          {/* Active Inventory List */}
          <div className="overflow-x-auto max-h-56 scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Material</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Current Stock</th>
                  <th className="p-2.5">Spot Price</th>
                  <th className="p-2.5">Lead Time</th>
                  <th className="p-2.5">Safety Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {sim.materials.map((mat) => {
                  const isLow = mat.stockLevel < mat.safetyStock;
                  return (
                    <tr
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterialId(mat.id);
                        setOrderQuantity(mat.minOrderQty * 2);
                      }}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-sans font-semibold text-slate-200">{mat.name}</td>
                      <td className="p-2.5 text-slate-400 capitalize">{mat.category}</td>
                      <td className={`p-2.5 font-bold ${isLow ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        {mat.stockLevel.toLocaleString()} {mat.unit}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        ₹{mat.spotPriceINR.toLocaleString()} / {mat.unit}
                      </td>
                      <td className="p-2.5 text-cyan-400">{mat.leadTimeHours} hrs</td>
                      <td className="p-2.5 text-slate-400">{mat.safetyStock} {mat.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
