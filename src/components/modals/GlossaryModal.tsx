/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../../store/useSimStore.ts';
import { BookOpen, X, Search } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  fullName: string;
  definition: string;
  industryContext: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'OEE',
    fullName: 'Overall Equipment Effectiveness',
    definition: 'A composite metric (Availability × Performance × Quality) representing the percentage of manufacturing time that is truly productive.',
    industryContext: 'In rocket engine precision machining, high OEE ensures capital-intensive 5-axis CNC mills and SLM 3D printers maximize return on investment.',
  },
  {
    term: 'NCR',
    fullName: 'Non-Conformance Report',
    definition: 'A formal document identifying a deviation, flaw, or out-of-tolerance defect in a part or material from required engineering specifications.',
    industryContext: 'Under AS9100, any part with a detected defect immediately triggers an NCR to prevent quality escapes into the vehicle stack.',
  },
  {
    term: 'MRB',
    fullName: 'Material Review Board',
    definition: 'A multidisciplinary engineering and quality committee authorized to disposition non-conforming items: Scrap, Rework, or Use-As-Is.',
    industryContext: 'If a turbopump impeller has a minor surface scratch, MRB evaluates flight stress models before granting a concession or ordering full scrap.',
  },
  {
    term: 'MRP',
    fullName: 'Material Requirements Planning',
    definition: 'A production planning, scheduling, and inventory control system used to manage aerospace manufacturing processes.',
    industryContext: 'V-Aero uses MRP to explode multi-level rocket BOMs, calculate net material needs, and generate purchase orders matched to supplier lead times.',
  },
  {
    term: 'FSW',
    fullName: 'Friction-Stir Welding',
    definition: 'A solid-state joining process that uses a non-consumable rotating tool to join two facing workpieces without melting the material.',
    industryContext: 'FSW is the industry gold standard for Al-Li 2195 cryogenic propellant tanks, avoiding porosity flaws typical of traditional fusion arc welding.',
  },
  {
    term: 'NDT',
    fullName: 'Non-Destructive Testing',
    definition: 'Analysis techniques to evaluate material and structural properties without causing damage (X-ray, Ultrasonic, Phased Array, CT scan).',
    industryContext: '100% of propellant tank barrel seams and 3D printed combustion chambers undergo NDT X-ray inspection to guarantee structural proof burst margins.',
  },
  {
    term: 'SLM / DMLS',
    fullName: 'Selective Laser Melting / Direct Metal Laser Sintering',
    definition: 'An additive manufacturing technology that uses high-power lasers to fuse fine metal powder layer-by-layer into complex 3D flight hardware.',
    industryContext: 'Rocket combustion chambers with complex internal regenerative cooling channels (GRCop-84 or Inconel 718) can only be produced via SLM.',
  },
  {
    term: 'CMM',
    fullName: 'Coordinate Measuring Machine',
    definition: 'A dimensional metrology device that measures the physical geometrical characteristics of an object with sub-micron precision.',
    industryContext: 'Used to verify turbopump blade profiles, injector orifices, and gimbal bearing journals.',
  },
  {
    term: 'TVAC',
    fullName: 'Thermal Vacuum Testing',
    definition: 'Environmental qualification test subjecting space hardware to high vacuum (10^-6 Torr) and extreme temperature cycling (-180°C to +120°C).',
    industryContext: 'Validates avionics, flight computers, and battery pack heat rejection in orbital vacuum conditions.',
  },
  {
    term: 'AS9100',
    fullName: 'Aerospace Quality Management Standard',
    definition: 'International quality management standard for the aviation, space, and defense industry, built upon ISO 9001 with strict aerospace additions.',
    industryContext: 'Enforces complete serial lot traceability, counterfeit parts prevention, foreign object debris (FOD) control, and risk management.',
  },
  {
    term: 'IN-SPACe',
    fullName: 'Indian National Space Promotion and Authorization Centre',
    definition: 'An autonomous single-window nodal agency under the Department of Space to facilitate, authorize, and regulate private Indian space sector activities.',
    industryContext: 'V-Aero interfaces with IN-SPACe for launch licensing, range access clearances, and technical approvals for Sriharikota launches.',
  },
  {
    term: 'NSIL',
    fullName: 'NewSpace India Limited',
    definition: 'The commercial arm of ISRO responsible for commercializing Indian space technologies, procuring launchers from private industry, and satellite operations.',
    industryContext: 'NSIL awards commercial launch contracts and satellite ride-share payloads to qualified Indian rocket manufacturers like V-Aero.',
  },
  {
    term: 'Vendor Development (ToT)',
    fullName: 'Technology Transfer & Indigenization Ecosystem',
    definition: 'A strategic manufacturing program funding Indian MSMEs and PSUs to tool up and qualify specialized aerospace materials that cannot be produced in-house.',
    industryContext: 'V-Aero funds vendor development programs with MIDHANI, Godrej, MTAR, and MSMEs for superalloy billeting, cryogenic valves, and sensor micro-machining.',
  },
  {
    term: 'Takt Time & Job Cards',
    fullName: 'Shop-Floor Route Card & Paced Production',
    definition: 'The rate at which rocket components must be finished to satisfy launch demand, tracked on the shop floor via serialized route job cards.',
    industryContext: 'Each machine bay (CNC, DMLS, FSW, Autoclave) tracks in-spindle job cards with verified fixture alignments, clamping status, and operator sign-offs.',
  },
  {
    term: 'Theory of Constraints (TOC)',
    fullName: 'Theory of Constraints & Bottleneck Management',
    definition: 'Management philosophy focused on identifying the most important limiting factor (constraint) that stands in the way of achieving higher throughput.',
    industryContext: 'In rocket production, the constraint is often 5-axis CNC machining of turbomachinery or autoclave cure time. Optimizing the bottleneck governs plant pace.',
  },
  {
    term: "Wright's Law",
    fullName: "Wright's Cumulative Production Learning Curve",
    definition: 'Empirical law stating that for every doubling of cumulative production volume, unit labor hours and costs decrease by a constant percentage (learning rate).',
    industryContext: 'V-Aero applies an 85% learning curve: the 2nd rocket takes 85% of the first rocket\'s labor hours, and the 4th takes 72%.',
  },
];

export const GlossaryModal: React.FC = () => {
  const { setActiveModal } = useSimStore();
  const [search, setSearch] = useState('');

  const filtered = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full p-6 text-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-950 border border-blue-800 text-blue-400 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Aerospace Manufacturing Glossary</h2>
              <p className="text-xs text-slate-400">
                Industry standards, engineering principles, and quality systems explained.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(undefined)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search aerospace terminology (e.g., FSW, NDT, MRB, OEE)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Term Cards Scroll Area */}
        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 flex-1">
          {filtered.map((item) => (
            <div
              key={item.term}
              className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="font-mono font-bold text-cyan-400 text-base">{item.term}</span>
                <span className="text-xs text-slate-400 font-semibold">— {item.fullName}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2 leading-relaxed">{item.definition}</p>
              <div className="text-xs bg-slate-900/90 rounded p-2 border border-slate-800 text-slate-400">
                <span className="font-semibold text-slate-300">Space Industry Application: </span>
                {item.industryContext}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              No matching aerospace terms found.
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 text-right mt-3">
          <button
            onClick={() => setActiveModal(undefined)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
