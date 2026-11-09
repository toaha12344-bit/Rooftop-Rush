import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToTitle,
  onToggleMute,
  isMuted,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="font-arcade text-lg text-amber-400 mb-1 tracking-wider">
          GAME PAUSED
        </h2>
        <p className="text-[11px] font-pixel text-slate-400 mb-6">
          Catch your breath! The drone is held in stasis.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME RUN (ESC)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-pixel text-xs tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART RUN</span>
          </button>

          <button
            onClick={onQuitToTitle}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-pixel text-xs tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>RETURN TO MENU</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs font-pixel text-slate-400">
          <span>Audio:</span>
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isMuted ? 'MUTED' : 'ENABLED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
