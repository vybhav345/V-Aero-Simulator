/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useSimStore } from './store/useSimStore.ts';
import { Navbar } from './components/Navbar.tsx';
import { TabBar } from './components/TabBar.tsx';
import { Footer } from './components/Footer.tsx';

// Modals and Drawers
import { NewProductionOrderModal } from './components/modals/NewProductionOrderModal.tsx';
import { GlossaryModal } from './components/modals/GlossaryModal.tsx';
import { SaveLoadModal } from './components/modals/SaveLoadModal.tsx';
import { LaunchModal } from './components/modals/LaunchModal.tsx';
import { PartGenealogyDrawer } from './components/drawers/PartGenealogyDrawer.tsx';
import { SupervisorHUDBar } from './components/SupervisorHUDBar.tsx';

import { SpaceMissionsGameView } from './views/SpaceMissionsGameView.tsx';
import { FactoryHangar3DView } from './views/FactoryHangar3DView.tsx';
import { RDTechTreeView } from './views/RDTechTreeView.tsx';
import { ShopFloorTaktView } from './views/ShopFloorTaktView.tsx';
import { FactoryBaysView } from './views/FactoryBaysView.tsx';
import { ProductionPlannerView } from './views/ProductionPlannerView.tsx';
import { VendorDevelopmentView } from './views/VendorDevelopmentView.tsx';
import { QualityLabView } from './views/QualityLabView.tsx';
import { ToolingMaintenanceView } from './views/ToolingMaintenanceView.tsx';
import { BOMTraceabilityView } from './views/BOMTraceabilityView.tsx';
import { ValueStreamSankeyView } from './views/ValueStreamSankeyView.tsx';
import { TestLaunchView } from './views/TestLaunchView.tsx';
import { FinanceSustainabilityView } from './views/FinanceSustainabilityView.tsx';
import { AiAdvisorView } from './views/AiAdvisorView.tsx';

export default function App() {
  const { activeTab, activeModal, selectedGenealogy } = useSimStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'space_missions':
        return <SpaceMissionsGameView />;
      case 'factory_hangar_3d':
        return <FactoryHangar3DView />;
      case 'rd_tech_tree':
        return <RDTechTreeView />;
      case 'shop_floor_takt':
        return <ShopFloorTaktView />;
      case 'factory_bays':
        return <FactoryBaysView />;
      case 'route_job_cards':
        return <ProductionPlannerView />;
      case 'vendor_development':
        return <VendorDevelopmentView />;
      case 'quality_lab':
        return <QualityLabView />;
      case 'tooling_maintenance':
        return <ToolingMaintenanceView />;
      case 'bom_traceability':
        return <BOMTraceabilityView />;
      case 'value_stream':
        return <ValueStreamSankeyView />;
      case 'mahendragiri_launch':
        return <TestLaunchView />;
      case 'shop_economics':
        return <FinanceSustainabilityView />;
      case 'ai_advisor':
        return <AiAdvisorView />;
      default:
        return <ShopFloorTaktView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* V-Aero Mission Control & Shop-Floor Topbar */}
      <Navbar />

      {/* 11-Tab Shop Floor & Operations Navigation Bar */}
      <TabBar />

      {/* Main Work Area */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-6 pb-20 overflow-x-hidden">
        {renderActiveView()}
      </main>

      {/* Floating Industrial Supervisor Copilot */}
      <SupervisorHUDBar />

      {/* End of Site Footer: Conceptualised by Vaibhav Gupta @ 2026 */}
      <Footer />

      {/* Modals & Overlays */}
      {activeModal === 'new_order' && <NewProductionOrderModal />}
      {activeModal === 'glossary' && <GlossaryModal />}
      {activeModal === 'save_load' && <SaveLoadModal />}
      {activeModal === 'launch_modal' && <LaunchModal />}
      {selectedGenealogy && <PartGenealogyDrawer />}

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
