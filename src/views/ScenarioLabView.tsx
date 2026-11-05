/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore.ts';
import {
  FlaskConical,
  Award,
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { challengePresets } from '../data/seedData.ts';

interface ScenarioComparison {
  name: string;
  leadTimeDays: number;
  totalCostM: number;
  reliabilityPct: number;
  scrapPct: number;
  bottleneck: string;
  description: string;
}

const scenarioMatrix: ScenarioComparison[] = [
  {
    name: 'Current Plant Baseline',
    leadTimeDays: 240,
    totalCostM: 48.5,
    reliabilityPct: 96.5,
    scrapPct: 5.8,
    bottleneck: '5-Axis CNC Milling Cells',
    description: 'Current standard operating setup across 6 facilities with single-source titanium and nominal AS9100 sampling.',
  },
  {
    name: 'Scenario A: +2 CNC 5-Axis Lines',
    leadTimeDays: 185,
    totalCostM: 52.8,
    reliabilityPct: 96.8,
    scrapPct: 5.4,
    bottleneck: 'Friction-Stir Welding Gantry',
    description: 'Doubles machining capacity for turbopump impellers and gimbal actuators. Reduces critical path cycle time by 23%.',
  },
  {
    name: 'Scenario B: Dual-Sourced Titanium',
    leadTimeDays: 210,
    totalCostM: 50.2,
    reliabilityPct: 97.4,
    scrapPct: 4.9,
    bottleneck: '5-Axis CNC Milling Cells',
    description: 'Adds secondary domestic titanium sponge forging contract. Dampens price volatility by 40% and shields against tariff shocks.',
  },
  {
    name: 'Scenario C: Zero-Defect Strict MRB',
    leadTimeDays: 280,
    totalCostM: 56.4,
    reliabilityPct: 99.1,
    scrapPct: 7.2,
    bottleneck: 'NDT CT Scan & Metrology Bay',
    description: 'Zero concessions allowed: any out-of-tolerance defect is immediately scrapped or remanufactured. Highest reliability for crewed flight.',
  },
];

export const ScenarioLabView: React.FC = () => {
  const { injectDisruption } = useSimStore();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengePresets[0].id);

  const selectedChallenge =
    challengePresets.find((c) => c.id === selectedChallengeId) || challengePresets[0];

  const handleStartChallengeDisruption = () => {
    const dis = selectedChallenge.presetDisruptions[0];
    if (dis) {
      injectDisruption({
        title: dis.title,
        description: dis.description,
        severity: 'warning',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
          <span>Aerospace Scenario Lab & Challenge Simulator</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Stress-test manufacturing resilience, compare capital investments, and evaluate supply chain trade-offs.
        </p>
      </div>

      {/* Challenge Modes Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Industrial Flight Director Challenges</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">Mission Control Objectives</span>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challengePresets.map((ch) => {
            const isSelected = selectedChallengeId === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-950 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{ch.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Target:</span>
                    <span className="text-cyan-300 font-bold">{ch.rocketsRequired} Rockets</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reliability:</span>
                    <span className="text-emerald-400 font-bold">≥ {ch.minReliabilityPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Challenge Details & Disruption Injector */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white text-sm mb-1">{selectedChallenge.title}</div>
            <p className="text-slate-400 max-w-xl">
              Preset Disruptions queued: {selectedChallenge.presetDisruptions.length} scripted supply chain & quality anomalies.
            </p>
          </div>
          <button
            onClick={handleStartChallengeDisruption}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-amber-950"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Inject Challenge Disruption</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Capital & Strategy Scenario Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Plant Capacity & Sourcing Scenario Comparison Matrix</span>
            </h4>
            <p className="text-xs text-slate-400">
              Evaluate simulated deltas in cycle time, vehicle unit cost, flight reliability, and bottleneck shifting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioMatrix.map((sc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <h5 className="font-bold text-white text-sm mb-1">{sc.name}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {sc.description}
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800/80">
                    <span className="text-slate-400 font-sans">Lead Time:</span>
                    <span className="font-bold text-cyan-400">{sc.leadTimeDays} days</span>
                  </div>

                  <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800/80">
                    <span className="text-slate-400 font-sans">Unit Cost:</span>
                    <span className="font-bold text-emerald-400">${sc.totalCostM}M</span>
                  </div>

                  <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800/80">
                    <span className="text-slate-400 font-sans">Reliability:</span>
                    <span className="font-bold text-blue-400">{sc.reliabilityPct}%</span>
                  </div>

                  <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800/80">
                    <span className="text-slate-400 font-sans">Scrap Rate:</span>
                    <span className="font-bold text-rose-400">{sc.scrapPct}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                Shifted Bottleneck: <span className="text-slate-300 font-bold">{sc.bottleneck}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
