import React, { useState } from 'react';
import { Download, Share2, X, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as a standalone app, hide
  if (isInstalled) {
    return null;
  }

  // Desktop Chrome, Edge, and Android Chrome flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 border border-cyan-400 text-white font-pixel text-xs shadow-lg transition active:scale-95 cursor-pointer"
        title="Install Rooftop Rush to your device"
      >
        <Download className="w-3.5 h-3.5 text-cyan-200" />
        <span>INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-pixel text-xs shadow-lg transition active:scale-95 cursor-pointer"
          title="Install on iPhone / iPad"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>INSTALL ON IOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
            <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-arcade text-xs text-cyan-300 tracking-wider">
                  INSTALL ON IOS
                </h3>
              </div>

              <div className="space-y-3 font-pixel text-xs text-slate-300">
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-arcade text-cyan-400 text-[10px]">1</span>
                  <span>Tap the <strong>Share</strong> button in the Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-arcade text-cyan-400 text-[10px]">2</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Launch from your home screen for full offline fullscreen gaming!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 font-pixel text-xs text-white transition cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
