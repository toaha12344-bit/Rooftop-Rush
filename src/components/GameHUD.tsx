import React from 'react';
import { Volume2, VolumeX, Pause, Zap, ShieldAlert, Heart } from 'lucide-react';
import { WEAPONS } from '../game/catalog';

interface GameHUDProps {
  lives: number;
  maxLives: number;
  distance: number;
  coins: number;
  droneDistance: number;
  maxDroneDistance: number;
  weaponCooldownPct: number;
  isDroneCritical: boolean;
  equippedWeaponId: string;
  isMuted: boolean;
  onPause: () => void;
  onFireWeapon: () => void;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  lives,
  maxLives,
  distance,
  coins,
  droneDistance,
  maxDroneDistance,
  weaponCooldownPct,
  isDroneCritical,
  equippedWeaponId,
  isMuted,
  onPause,
  onFireWeapon,
  onToggleMute,
}) => {
  const weapon = WEAPONS.find((w) => w.id === equippedWeaponId) || WEAPONS[0];
  const weaponReady = weaponCooldownPct <= 0;

  // Drone distance threat color calculation
  const droneProgress = Math.max(0, Math.min(1, droneDistance / maxDroneDistance));
  const isDanger = droneDistance < 15;
  const isCaution = droneDistance >= 15 && droneDistance < 32;

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between z-20">
      {/* Top Bar Status */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Hearts & Drone Distance Threat Meter */}
        <div className="flex flex-col gap-2">
          {/* Hearts Display */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs border border-slate-700/70 rounded-lg px-3 py-1.5 shadow-lg pointer-events-auto">
            {Array.from({ length: maxLives }).map((_, idx) => {
              const active = idx < lives;
              return (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] scale-100'
                      : 'text-slate-600 fill-slate-800 scale-90'
                  }`}
                />
              );
            })}
          </div>

          {/* Hunter Drone Radar Threat Bar */}
          <div
            className={`flex flex-col bg-slate-950/85 backdrop-blur-xs border rounded-lg px-3 py-2 shadow-lg w-52 sm:w-64 transition-all duration-300 pointer-events-auto ${
              isDanger
                ? 'border-rose-500 shadow-rose-950/60 animate-pulse'
                : isCaution
                ? 'border-amber-500/80 shadow-amber-950/40'
                : 'border-cyan-500/50 shadow-cyan-950/30'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-pixel tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldAlert
                  className={`w-3.5 h-3.5 ${
                    isDanger
                      ? 'text-rose-400 animate-spin'
                      : isCaution
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                />
                <span className={isDanger ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {isDanger ? 'DRONE LOCKING ON!' : 'HUNTER DRONE'}
                </span>
              </span>
              <span
                className={`font-arcade tabular-nums ${
                  isDanger ? 'text-rose-400 font-bold' : isCaution ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {droneDistance}m
              </span>
            </div>

            {/* Visual Drone Distance Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-150 ${
                  isDanger
                    ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]'
                    : isCaution
                    ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                }`}
                style={{ width: `${droneProgress * 100}%` }}
              />
            </div>
            {isDanger && (
              <span className="text-[9px] text-rose-400 font-pixel mt-1 animate-pulse">
                HIT WEAPON [F] OR AVOID MISTAKES!
              </span>
            )}
          </div>
        </div>

        {/* Center: Distance and Coins readout */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-700 px-4 py-1.5 rounded-xl shadow-lg flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest">
                DISTANCE
              </div>
              <div className="font-arcade text-lg sm:text-2xl text-cyan-400 tracking-wider tabular-nums drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                {distance}m
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700" />

            <div className="text-center">
              <div className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest">
                COINS
              </div>
              <div className="font-arcade text-lg sm:text-2xl text-amber-400 tracking-wider tabular-nums flex items-center justify-center gap-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                <span>🪙</span>
                {coins}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Weapon Quick-Fire & Pause & Sound controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Weapon Action Button */}
          <button
            onClick={onFireWeapon}
            disabled={!weaponReady}
            title={`${weapon.name} (Press F or X)`}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border font-pixel text-xs transition-all shadow-md active:scale-95 ${
              weaponReady
                ? 'bg-cyan-600/90 hover:bg-cyan-500 border-cyan-400 text-white cursor-pointer shadow-cyan-900/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-80'
            }`}
          >
            <Zap className={`w-4 h-4 ${weaponReady ? 'text-amber-300 animate-bounce' : 'text-slate-500'}`} />
            <span className="hidden sm:inline font-cyber uppercase">{weapon.name.split(' ')[0]}</span>
            <span className="font-arcade text-[10px] bg-slate-900/80 px-1 py-0.5 rounded border border-slate-700">
              F
            </span>
            {/* Cooldown overlay */}
            {!weaponReady && (
              <div
                className="absolute inset-0 bg-slate-950/60 rounded-lg pointer-events-none"
                style={{ height: `${weaponCooldownPct * 100}%` }}
              />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            aria-label="Toggle Audio"
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-md active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-md active:scale-95 cursor-pointer"
          >
            <Pause className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Line (Discreet) */}
      <div className="hidden sm:flex justify-center pb-1">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-full px-4 py-1 text-[10px] font-pixel text-slate-400 tracking-wider">
          SPACE: JUMP · DOWN ARROW: SLIDE · F: WEAPON EMP · ESC: PAUSE
        </div>
      </div>
    </div>
  );
};
