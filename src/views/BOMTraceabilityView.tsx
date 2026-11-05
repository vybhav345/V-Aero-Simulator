/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  Boxes,
  ChevronRight,
  ChevronDown,
  Layers,
  Wrench,
  ShieldCheck,
  Search,
  Edit2,
  Check,
  QrCode,
  Weight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BOMNode, SerializedPartGenealogy } from '../types/index.ts';

export const BOMTraceabilityView: React.FC = () => {
  const {
    sim,
    selectedRocketSerial,
    setSelectedRocketSerial,
    setSelectedGenealogy,
    updateBOMNode,
  } = useSimStore();

  const [selectedDesignId, setSelectedDesignId] = useState<string>(sim.rocketDesigns[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<BOMNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    bom_ao_root: true,
    bom_ao_stage1: true,
    bom_ao_stage2: true,
    bom_ao_engines: true,
    bom_pslv_root: true,
    bom_lvm3_root: true,
  });

  // Editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editCycleHours, setEditCycleHours] = useState<number>(0);
  const [editBaseYield, setEditBaseYield] = useState<number>(0.98);

  const activeDesign =
    sim.rocketDesigns.find((d) => d.id === selectedDesignId) || sim.rocketDesigns[0];

  const currentRocket = sim.rockets.find((r) => r.serialNumber === selectedRocketSerial) || sim.rockets[0];

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleSelectNode = (node: BOMNode) => {
    setSelectedNode(node);
    setIsEditing(false);
    setEditCycleHours(node.cycleTimeHours);
    setEditBaseYield(node.baseYieldRate);
  };

  const handleSaveEdit = () => {
    if (!selectedNode) return;
    updateBOMNode(selectedDesignId, selectedNode.id, {
      cycleTimeHours: Number(editCycleHours),
      baseYieldRate: Number(editBaseYield),
    });
    setSelectedNode((prev) => (prev ? { ...prev, cycleTimeHours: Number(editCycleHours), baseYieldRate: Number(editBaseYield) } : null));
    setIsEditing(false);
  };

  // Find genealogy record for selected node if a rocket instance is active
  const matchingGenealogy = currentRocket?.genealogyRecords.find(
    (g) => g.partName === selectedNode?.name || g.partNumber.includes(selectedNode?.partNumber || '---')
  );

  // Recursive tree node renderer
  const renderBOMNode = (node: BOMNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id];
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const matchesSearch =
      searchQuery === '' ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.partNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={node.id} className="select-none">
        {matchesSearch && (
          <div
            onClick={() => handleSelectNode(node)}
            style={{ paddingLeft: `${depth * 1.2 + 0.5}rem` }}
            className={`flex items-center justify-between py-1.5 pr-3 rounded-lg text-xs cursor-pointer transition-colors ${
              isSelected
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-700/80 font-bold'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.id);
                  }}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <span className="w-4 h-4 inline-block" />
              )}
              <span className="font-mono text-cyan-400 text-[11px] font-bold">
                {node.partNumber}
              </span>
              <span className="truncate">{node.name}</span>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="text-slate-400">Qty: {node.quantity}</span>
              <span className="text-slate-500">{(node.unitWeightKg * node.quantity).toLocaleString()} kg</span>
            </div>
          </div>
        )}

        {/* Recursive Children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-800/80 ml-3">
            {node.children!.map((child) => renderBOMNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multi-Level Bill of Materials (BOM) & Serialized Traceability
            </h3>
            <p className="text-xs text-slate-400">
              Explore the engineering hierarchy from complete vehicle stack down to raw material lots.
            </p>
          </div>
        </div>

        {/* Vehicle Architecture Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDesignId}
            onChange={(e) => {
              setSelectedDesignId(e.target.value);
              setSelectedNode(null);
            }}
            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          >
            {sim.rocketDesigns.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.propellantType})
              </option>
            ))}
          </select>

          {/* Active Rocket Instance Selector */}
          {sim.rockets.length > 0 && (
            <select
              value={selectedRocketSerial}
              onChange={(e) => setSelectedRocketSerial(e.target.value)}
              className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
            >
              {sim.rockets.map((r) => (
                <option key={r.id} value={r.serialNumber}>
                  {r.serialNumber} ({r.status})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Grid: BOM Tree View & Part Inspector / Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive BOM Tree Explorer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{activeDesign.name} BOM Tree</span>
              </h4>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter part name or number..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {/* Tree Area */}
            <div className="overflow-y-auto max-h-[560px] pr-2 scrollbar-thin scrollbar-thumb-slate-800 space-y-1">
              {renderBOMNode(activeDesign.bomRoot)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Click any part node to inspect tolerances, machines, and serialized genealogy.</span>
            <span className="font-mono font-bold text-slate-200">
              Dry Mass: {activeDesign.dryMassKg.toLocaleString()} kg
            </span>
          </div>
        </div>

        {/* Right Col: Part Inspector & Live BOM Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          {selectedNode ? (
            <div>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                    {selectedNode.partNumber}
                  </span>
                  <h4 className="font-bold text-white text-sm">{selectedNode.name}</h4>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit BOM parameters"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {/* Part Specs & Metrics */}
              <div className="space-y-3 text-xs mb-5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Stage</span>
                    <span className="font-mono text-cyan-300 capitalize">
                      {selectedNode.stage.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Subsystem</span>
                    <span className="font-mono text-slate-200 capitalize">
                      {selectedNode.subsystem.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Unit Weight</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {selectedNode.unitWeightKg} kg
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Inspection Type</span>
                    <span className="font-mono text-slate-200 uppercase text-[11px]">
                      {selectedNode.inspectionType}
                    </span>
                  </div>
                </div>

                {/* Editable Parameters */}
                {isEditing ? (
                  <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800 space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">
                        Cycle Time (Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editCycleHours}
                        onChange={(e) => setEditCycleHours(Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-cyan-400 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">
                        Base Yield Rate (0.90 to 0.99)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.80"
                        max="0.999"
                        value={editBaseYield}
                        onChange={(e) => setEditBaseYield(Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-400 font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Cycle Hours</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {selectedNode.cycleTimeHours} hrs
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">First-Pass Yield</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {(selectedNode.baseYieldRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Serialized AS9100 Traceability Action */}
              <div className="pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Serialized Part Genealogy</span>
                </div>

                {matchingGenealogy ? (
                  <button
                    onClick={() => setSelectedGenealogy(matchingGenealogy)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>View Lot Provenance & NDT Scans</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs text-slate-500">
                    Part pending work order completion for {selectedRocketSerial}.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              <Boxes className="w-10 h-10 mx-auto mb-3 opacity-40 text-cyan-400" />
              <p>Select any component in the BOM tree to inspect engineering tolerances and serialized records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
