import React, { useEffect } from 'react';
import { RotateCcw, ShoppingBag, Trophy, Coins, Home, Crosshair, HeartCrack } from 'lucide-react';

interface GameOverModalProps {
  distance: number;
  coinsEarned: number;
  totalCoins: number;
  highScore: number;
  isNewHighScore: boolean;
  cause: 'drone' | 'lives';
  onRestart: () => void;
  onOpenShop: () => void;
  onQuitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  distance,
  coinsEarned,
  totalCoins,
  highScore,
  isNewHighScore,
  cause,
  onRestart,
  onOpenShop,
  onQuitToTitle,
}) => {
  // Listen for Space / Enter to restart quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  // Rank determination
  let rankTitle = 'Rookie Hopper';
  let rankIcon = '🥉';
  if (distance > 1200) {
    rankTitle = 'Apex Skyline Legend';
    rankIcon = '👑';
  } else if (distance > 600) {
    rankTitle = 'Cyber Parkour Ace';
    rankIcon = '🥇';
  } else if (distance > 250) {
    rankTitle = 'Skyline Phantom';
    rankIcon = '🥈';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Cause Banner */}
        <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-400 text-[11px] font-pixel tracking-wider">
          {cause === 'drone' ? (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              <span>CAPTURED BY HUNTER DRONE!</span>
            </>
          ) : (
            <>
              <HeartCrack className="w-3.5 h-3.5" />
              <span>OUT OF LIVES!</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="font-arcade text-xl sm:text-2xl text-rose-500 mb-1 tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          GAME OVER
        </h2>

        {/* High Score Beat Celebration Banner */}
        {isNewHighScore && (
          <div className="my-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400 text-amber-300 font-pixel text-xs tracking-wider animate-bounce flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW PERSONAL RECORD!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 my-4 grid grid-cols-2 gap-3 text-left">
          {/* Distance */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest block mb-0.5">
              DISTANCE RUN
            </span>
            <span className="font-arcade text-lg sm:text-xl text-cyan-400 tabular-nums">
              {distance}m
            </span>
          </div>

          {/* Coins Earned */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest block mb-0.5">
              COINS EARNED
            </span>
            <span className="font-arcade text-lg sm:text-xl text-amber-400 tabular-nums flex items-center gap-1">
              <span>🪙</span> +{coinsEarned}
            </span>
          </div>

          {/* Best Record */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest block mb-0.5">
              BEST DISTANCE
            </span>
            <span className="font-arcade text-sm sm:text-base text-slate-300 tabular-nums">
              {Math.max(distance, highScore)}m
            </span>
          </div>

          {/* Runner Rank */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest block mb-0.5">
              ACHIEVEMENT RANK
            </span>
            <span className="font-cyber text-xs text-indigo-300 font-bold flex items-center gap-1 truncate">
              <span>{rankIcon}</span> {rankTitle}
            </span>
          </div>
        </div>

        {/* Total Coin Bank readout */}
        <div className="text-xs font-pixel text-slate-400 mb-6 flex items-center gap-1.5">
          <span>COIN VAULT:</span>
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-arcade text-amber-400 text-xs">{totalCoins}</span>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-arcade text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN (SPACE)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenShop}
              className="py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400 text-white font-pixel text-xs tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>SHOP</span>
            </button>

            <button
              onClick={onQuitToTitle}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-pixel text-xs tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
