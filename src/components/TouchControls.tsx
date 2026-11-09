import React from 'react';
import { ArrowDown, ArrowUp, Zap } from 'lucide-react';

interface TouchControlsProps {
  onJump: () => void;
  onStartSlide: () => void;
  onEndSlide: () => void;
  onFireWeapon: () => void;
  weaponReady: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onJump,
  onStartSlide,
  onEndSlide,
  onFireWeapon,
  weaponReady,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none p-4 pb-6 flex items-end justify-between z-20 select-none">
      {/* Left side: SLIDE Touch Pad */}
      <div className="pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onStartSlide();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onEndSlide();
          }}
          onMouseDown={onStartSlide}
          onMouseUp={onEndSlide}
          onMouseLeave={onEndSlide}
          aria-label="Slide"
          className="w-20 h-20 rounded-2xl bg-slate-900/80 active:bg-amber-600/80 border-2 border-amber-500/70 text-amber-400 active:text-white flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform backdrop-blur-xs cursor-pointer touch-none"
        >
          <ArrowDown className="w-8 h-8 stroke-[3]" />
          <span className="font-arcade text-[10px] tracking-wider">SLIDE</span>
        </button>
      </div>

      {/* Right side: WEAPON & JUMP */}
      <div className="flex items-end gap-3 pointer-events-auto">
        {/* Weapon Quick Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFireWeapon();
          }}
          disabled={!weaponReady}
          aria-label="Fire EMP Weapon"
          className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 transition-all backdrop-blur-xs cursor-pointer ${
            weaponReady
              ? 'bg-cyan-900/80 active:bg-cyan-500 border-cyan-400 text-cyan-300'
              : 'bg-slate-900/60 border-slate-700 text-slate-600 opacity-60'
          }`}
        >
          <Zap className="w-6 h-6 fill-current" />
          <span className="font-arcade text-[8px]">EMP</span>
        </button>

        {/* JUMP Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={(e) => {
            e.preventDefault();
            onJump();
          }}
          aria-label="Jump"
          className="w-22 h-22 rounded-2xl bg-cyan-600/80 active:bg-cyan-400/90 border-2 border-cyan-300 text-white flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-950/80 active:scale-95 transition-transform backdrop-blur-xs cursor-pointer touch-none"
        >
          <ArrowUp className="w-9 h-9 stroke-[3]" />
          <span className="font-arcade text-[11px] tracking-wider">JUMP</span>
        </button>
      </div>
    </div>
  );
};
