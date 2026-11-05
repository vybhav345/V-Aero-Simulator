/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimStore } from '../../store/useSimStore.ts';
import { Save, Upload, Download, RefreshCw, X, Check, Copy } from 'lucide-react';

export const SaveLoadModal: React.FC = () => {
  const { setActiveModal, exportJSON, importJSON, resetSimulation } = useSimStore();
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroForge-SimState-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Simulation snapshot exported to file successfully.' });
  };

  const handleCopy = () => {
    const json = exportJSON();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setStatusMsg({ text: 'JSON copied to clipboard.' });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setStatusMsg({ text: 'Please paste valid JSON state before importing.', isError: true });
      return;
    }
    const ok = importJSON(importText);
    if (ok) {
      setStatusMsg({ text: 'Simulation state successfully restored!' });
      setTimeout(() => setActiveModal(undefined), 1000);
    } else {
      setStatusMsg({ text: 'Invalid JSON format or corrupted state structure.', isError: true });
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset simulation to factory defaults? All unsaved runs will be reset.')) {
      resetSimulation();
      setStatusMsg({ text: 'Simulation reset to factory baseline defaults.' });
      setTimeout(() => setActiveModal(undefined), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full p-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg">
              <Save className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Save & Restore Simulation</h2>
              <p className="text-xs text-slate-400">
                Deterministic in-memory JSON state persistence.
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

        {/* Status Notification */}
        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center space-x-2 ${
              statusMsg.isError
                ? 'bg-rose-950 border border-rose-800 text-rose-300'
                : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Export Actions */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Export Current State
          </label>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download .JSON File</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="mb-6">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Import Saved State
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={4}
            placeholder="Paste raw AeroForge JSON state here..."
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 mb-2"
          />
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Load and Restore Simulation State</span>
          </button>
        </div>

        {/* Reset State */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>
          <button
            onClick={() => setActiveModal(undefined)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
