/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md text-slate-400 py-5 px-4 md:px-8 mt-auto select-none">
      <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Brand & Mission Tagline */}
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <img
              src="/assets/aistudio/logo-vv_51cd0b98.png"
              alt="V-AERO Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-slate-200 tracking-wider">V-AERO</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 hidden md:inline">
            High-Fidelity Aerospace Manufacturing & Orbital Flight Operations Simulator
          </span>
          <span className="text-slate-400 md:hidden">Aerospace Flight Simulator</span>
        </div>

        {/* Conceptualiser Credit with vybhavverse.com link */}
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span>Conceptualised by</span>
          <a
            href="https://www.vybhavverse.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Vaibhav Gupta's Official Portal (www.vybhavverse.com)"
            className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/50 hover:decoration-cyan-300 transition-colors group cursor-pointer"
          >
            <span>Vaibhav Gupta</span>
            <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <span className="text-slate-400">@ 2026</span>
        </div>
      </div>
    </footer>
  );
};
