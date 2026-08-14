'use client';

import React, { useState } from 'react';
import { MainHubType } from '../components/Header';
import { SidebarNav } from '../components/SidebarNav';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';
import { StudioTourModal } from '../components/StudioTourModal';
import { NotebookModal } from '../components/NotebookModal';
import { HubWelcomeBanner } from '../components/HubWelcomeBanner';
import { HubSubtoolBar } from '../components/HubSubtoolBar';
import { HeroPredictionDemo } from '../components/HeroPredictionDemo';
import { MultiModelComparisonMatrix } from '../components/MultiModelComparisonMatrix';
import { ArchitecturePipelineSimulator } from '../components/ArchitecturePipelineSimulator';
import { DecisionTreeSimulator } from '../components/DecisionTreeSimulator';
import { LiveWordEditor } from '../components/LiveWordEditor';
import { HyperparameterSandbox } from '../components/HyperparameterSandbox';
import { ModelComparisonDashboard } from '../components/ModelComparisonDashboard';
import { TsneInteractiveExplorer } from '../components/TsneInteractiveExplorer';
import { ResearchStoryScrolly } from '../components/ResearchStoryScrolly';
import { CustomClaimBenchmark } from '../components/CustomClaimBenchmark';
import { MasterProjectGuide } from '../components/MasterProjectGuide';
import { SpotTheLieQuiz } from '../components/SpotTheLieQuiz';
import { SpeakerCredibilitySimulator } from '../components/SpeakerCredibilitySimulator';
import { ClaimFaceOff } from '../components/ClaimFaceOff';
import { TruthSpectrumGuide } from '../components/TruthSpectrumGuide';
import { InteractiveLearningLab } from '../components/InteractiveLearningLab';
import { AboutResearch } from '../components/AboutResearch';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [activeHub, setActiveHub] = useState<MainHubType>('desk');
  const [activeSubtool, setActiveSubtool] = useState<string>('all');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const handleSelectHub = (hub: MainHubType) => {
    setActiveHub(hub);
    setActiveSubtool('all');
  };

  return (
    <div className="min-h-screen flex text-[#F8FAFC] relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Studio Tour Modal */}
      <StudioTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectHub={(hub) => handleSelectHub(hub)}
      />

      {/* Jupyter Notebook Interactive Modal */}
      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />

      {/* Pro Collapsible Sidebar Navigation Dock */}
      <SidebarNav
        activeHub={activeHub}
        setActiveHub={handleSelectHub}
        onSelectSubtool={setActiveSubtool}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
      />

      {/* Main Spacious Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Status & Breadcrumb Bar */}
        <TopBar
          activeHub={activeHub}
          setActiveHub={handleSelectHub}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenNotebook={() => setIsNotebookOpen(true)}
          onToggleMobileNav={() => setIsMobileDrawerOpen(true)}
        />

        {/* Main Content Area (with safe bottom padding for mobile dock) */}
        <main className="flex-1 transition-all duration-300 py-6 px-3 sm:px-6 lg:px-8 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
          {/* Welcome Roadmap Banner */}
          <HubWelcomeBanner activeHub={activeHub} />

          {/* Sub-Tool Segmented Focus Bar */}
          <HubSubtoolBar
            activeHub={activeHub}
            activeSubtool={activeSubtool}
            onSelectSubtool={setActiveSubtool}
          />

          <AnimatePresence mode="wait">
            {/* Hub 1: Fact-Check Studio */}
            {activeHub === 'desk' && (
              <motion.div
                key={`desk-${activeSubtool}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-16"
              >
                {(activeSubtool === 'all' || activeSubtool === 'classifier') && (
                  <HeroPredictionDemo />
                )}
                {(activeSubtool === 'all' || activeSubtool === 'editor') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <LiveWordEditor />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'spectrum') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <TruthSpectrumGuide />
                  </div>
                )}
              </motion.div>
            )}

            {/* Hub 2: Neural & Architecture Simulator */}
            {activeHub === 'simulator' && (
              <motion.div
                key={`simulator-${activeSubtool}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-16"
              >
                {(activeSubtool === 'all' || activeSubtool === 'matrix') && (
                  <MultiModelComparisonMatrix />
                )}
                {(activeSubtool === 'all' || activeSubtool === 'pipeline') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <ArchitecturePipelineSimulator />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'tree') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <DecisionTreeSimulator />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'priors') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <SpeakerCredibilitySimulator />
                  </div>
                )}
              </motion.div>
            )}

            {/* Hub 3: Model Leaderboard & Research */}
            {activeHub === 'research' && (
              <motion.div
                key={`research-${activeSubtool}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-16"
              >
                {(activeSubtool === 'all' || activeSubtool === 'leaderboard') && (
                  <ModelComparisonDashboard />
                )}
                {(activeSubtool === 'all' || activeSubtool === 'tsne') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <TsneInteractiveExplorer />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'guide') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <MasterProjectGuide />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'story') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <ResearchStoryScrolly />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'about') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <AboutResearch />
                  </div>
                )}
              </motion.div>
            )}

            {/* Hub 4: Dataset & Export Sandbox */}
            {activeHub === 'sandbox' && (
              <motion.div
                key={`sandbox-${activeSubtool}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-16"
              >
                {(activeSubtool === 'all' || activeSubtool === 'quiz') && (
                  <SpotTheLieQuiz />
                )}
                {(activeSubtool === 'all' || activeSubtool === 'benchmark') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <CustomClaimBenchmark />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'learning') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <InteractiveLearningLab />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'sandbox') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <HyperparameterSandbox />
                  </div>
                )}
                {(activeSubtool === 'all' || activeSubtool === 'faceoff') && (
                  <div className={activeSubtool === 'all' ? 'max-w-7xl mx-auto border-t border-slate-800/80 pt-12' : ''}>
                    <ClaimFaceOff />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}
