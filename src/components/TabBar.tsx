/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore, ActiveTab } from '../store/useSimStore.ts';
import {
  Gamepad2,
  LayoutDashboard,
  Factory,
  CalendarDays,
  Building2,
  ShieldAlert,
  Wrench,
  Boxes,
  GitFork,
  Flame,
  Coins,
  Sparkles,
  Rocket,
  Compass,
  Bot,
  Atom,
  ChevronDown,
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  defaultTab: ActiveTab;
  tabs: TabItem[];
}

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, sim, activeResearch, researchPoints } = useSimStore();

  const openNcrs = sim.ncrs.filter((n) => n.status !== 'resolved').length;
  const inFlightReady = sim.rockets.filter((r) => r.status === 'flight_ready').length;
  const activeVendorPrograms = sim.vendorPrograms.filter((v) => v.status === 'active').length;
  const inProgressWos = sim.workOrders.filter((w) => w.status === 'in_progress').length;

  const categories: CategoryGroup[] = [
    {
      id: 'flight_sim',
      name: 'Missions & Flight',
      icon: Rocket,
      defaultTab: 'space_missions',
      tabs: [
        {
          id: 'space_missions',
          label: 'Space Missions Campaign Hub',
          shortLabel: 'Flight Campaign',
          icon: Gamepad2,
          badge: '3D',
          badgeColor: 'bg-orange-600',
        },
        {
          id: 'mahendragiri_launch',
          label: 'Launch Pad & 3D Flight',
          shortLabel: 'Launch Pad',
          icon: Flame,
          badge: inFlightReady > 0 ? 'GO' : undefined,
          badgeColor: 'bg-emerald-600',
        },
      ],
    },
    {
      id: 'hangar_rd',
      name: '3D Hangar & R&D',
      icon: Atom,
      defaultTab: 'factory_hangar_3d',
      tabs: [
        {
          id: 'factory_hangar_3d',
          label: 'Factory Bay Floor 3D (AMR Walkthrough)',
          shortLabel: 'Bay Floor 3D',
          icon: Bot,
          badge: 'AMR 3D',
          badgeColor: 'bg-cyan-600',
        },
        {
          id: 'rd_tech_tree',
          label: 'R&D Propulsion Tech Tree',
          shortLabel: 'R&D Tech Tree',
          icon: Compass,
          badge: activeResearch ? `${Math.round(activeResearch.progressPct)}%` : `${researchPoints} RP`,
          badgeColor: activeResearch ? 'bg-purple-600' : 'bg-slate-700',
        },
      ],
    },
    {
      id: 'shop_floor',
      name: 'Shop Floor Bays',
      icon: Factory,
      defaultTab: 'shop_floor_takt',
      tabs: [
        {
          id: 'shop_floor_takt',
          label: 'Shop Floor & Flow Takt',
          shortLabel: 'Floor & Flow',
          icon: LayoutDashboard,
          badge: inProgressWos > 0 ? inProgressWos : undefined,
          badgeColor: 'bg-cyan-700',
        },
        {
          id: 'factory_bays',
          label: '3D Machine Bays & CNC',
          shortLabel: 'Machine Bays',
          icon: Factory,
        },
        {
          id: 'tooling_maintenance',
          label: 'Tooling & Predictive Maintenance',
          shortLabel: 'Tooling',
          icon: Wrench,
        },
        {
          id: 'route_job_cards',
          label: 'Route Job Cards & Dispatch',
          shortLabel: 'Job Cards',
          icon: CalendarDays,
        },
      ],
    },
    {
      id: 'quality_vendors',
      name: 'Quality & Vendors',
      icon: ShieldAlert,
      defaultTab: 'quality_lab',
      tabs: [
        {
          id: 'quality_lab',
          label: 'Quality Lab & Metrology (AS9100)',
          shortLabel: 'Quality Lab',
          icon: ShieldAlert,
          badge: openNcrs > 0 ? openNcrs : undefined,
          badgeColor: 'bg-amber-600',
        },
        {
          id: 'vendor_development',
          label: 'Aerospace MSME Vendor Network',
          shortLabel: 'Vendor Tier',
          icon: Building2,
          badge: `${activeVendorPrograms} MSME`,
          badgeColor: 'bg-orange-700',
        },
        {
          id: 'bom_traceability',
          label: 'BOM & Part Traceability',
          shortLabel: 'BOM Trace',
          icon: Boxes,
        },
        {
          id: 'value_stream',
          label: 'Value Stream Sankey',
          shortLabel: 'Value Stream',
          icon: GitFork,
        },
      ],
    },
    {
      id: 'economics_ai',
      name: 'Economics & AI',
      icon: Sparkles,
      defaultTab: 'shop_economics',
      tabs: [
        {
          id: 'shop_economics',
          label: 'Plant Economics & Financials (₹ Cr)',
          shortLabel: 'Financials',
          icon: Coins,
        },
        {
          id: 'ai_advisor',
          label: 'AI Plant Operations Supervisor',
          shortLabel: 'AI Console',
          icon: Sparkles,
          badge: 'AI',
          badgeColor: 'bg-purple-600',
        },
      ],
    },
  ];

  // Find active category
  const activeCategory =
    categories.find((c) => c.tabs.some((t) => t.id === activeTab)) || categories[0];

  return (
    <nav className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 select-none shadow-md">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Tier 1: Primary Category Pillars (Only 5 Clean Anchors) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => {
            const isCatActive = cat.id === activeCategory.id;
            const CatIcon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  // Switch to category's default tab if current tab is not in it
                  const currentInCat = cat.tabs.some((t) => t.id === activeTab);
                  if (!currentInCat) {
                    setActiveTab(cat.defaultTab);
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCatActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <CatIcon className={`w-4 h-4 ${isCatActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Sub-views of the Active Pillar (Clean, focused pills) */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase font-bold px-2 hidden lg:inline">
            Sub-Views:
          </span>
          {activeCategory.tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap text-xs font-semibold ${
                  isTabActive
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title={tab.label}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full ${
                      tab.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
