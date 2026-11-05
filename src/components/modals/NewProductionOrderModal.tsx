/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../../store/useSimStore.ts';
import { Rocket, X, Check, Flame, Layers, Weight } from 'lucide-react';
import { Rupee } from '../Rupee.tsx';

export const NewProductionOrderModal: React.FC = () => {
  const { sim, createProductionOrder, setActiveModal } = useSimStore();
  const [selectedDesignId, setSelectedDesignId] = useState(sim.rocketDesigns[0].id);
  const [customSerial, setCustomSerial] = useState(
    `VA-SN-00${sim.rockets.length + 1}`
  );

  const selectedDesign =
    sim.rocketDesigns.find((d) => d.id === selectedDesignId) || sim.rocketDesigns[0];

  const handleLaunchOrder = () => {
    createProductionOrder(selectedDesignId, customSerial);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-950 border border-orange-800 text-orange-400 rounded-lg">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create V-Aero Production Order</h2>
              <p className="text-xs text-slate-400">
                MRP will explode the Indian multi-level BOM and dispatch shop-floor route job cards.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(undefined)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Preset Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Launch Vehicle Architecture
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sim.rocketDesigns.map((design) => {
              const isSelected = selectedDesignId === design.id;
              return (
                <div
                  key={design.id}
                  onClick={() => setSelectedDesignId(design.id)}
                  className={`cursor-pointer rounded-lg p-3 border transition-all ${
                    isSelected
                      ? 'bg-orange-950/80 border-orange-500 shadow-md shadow-orange-950 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">{design.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-orange-300 inline-block mb-2">
                    {design.propellantType}
                  </span>
                  <p className="text-xs line-clamp-3 text-slate-400 leading-relaxed">
                    {design.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Architecture Specs */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Vehicle Engineering & Commercial Specifications
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="flex items-center justify-center text-slate-400 space-x-1 text-xs mb-1">
                <Weight className="w-3.5 h-3.5 text-cyan-400" />
                <span>LEO Payload</span>
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {selectedDesign.payloadCapacityLeoKg.toLocaleString()} kg
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="flex items-center justify-center text-slate-400 space-x-1 text-xs mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Stages</span>
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {selectedDesign.stagesCount} Stages
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="flex items-center justify-center text-slate-400 space-x-1 text-xs mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Dry Mass</span>
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {selectedDesign.dryMassKg.toLocaleString()} kg
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
              <div className="flex items-center justify-center text-slate-400 space-x-1 text-xs mb-1">
                <Rupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mission Value</span>
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                ₹{(selectedDesign.targetLaunchPriceINR / 1e7).toFixed(0)} Cr
              </div>
            </div>
          </div>
        </div>

        {/* Rocket Serial Identifier Input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Vehicle Serial Number (ISRO / V-Aero Lot Designation)
          </label>
          <input
            type="text"
            value={customSerial}
            onChange={(e) => setCustomSerial(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-orange-400 font-mono focus:outline-none focus:border-orange-500"
            placeholder="e.g. VA-SN-002"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveModal(undefined)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunchOrder}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-950 transition-all cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Explode BOM & Dispatch Job Cards</span>
          </button>
        </div>
      </div>
    </div>
  );
};
