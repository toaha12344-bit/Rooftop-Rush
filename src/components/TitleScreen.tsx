import React from 'react';
import { Play, ShoppingBag, Trophy, Coins, Volume2, VolumeX, Sparkles, ChevronRight, Crosshair } from 'lucide-react';
import { BiomeId, PlayerStats } from '../types/game';
import { BIOMES } from '../game/catalog';

import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  stats: PlayerStats;
  isMuted: boolean;
  onStartGame: () => void;
  onOpenShop: () => void;
  onSelectBiome: (biome: BiomeId) => void;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  stats,
  isMuted,
  onStartGame,
  onOpenShop,
  onSelectBiome,
  onToggleMute,
}) => {
  const currentBiome = BIOMES[stats.selectedBiome] || BIOMES.city;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between items-center p-4 sm:p-8 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950/95 backdrop-blur-xs select-none overflow-y-auto">
      {/* Top Header Row */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        {/* User Bank & High Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-arcade text-amber-400 text-sm tracking-wider tabular-nums">
              {stats.coins}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-lg">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-pixel text-slate-400 uppercase tracking-widest leading-none">
                BEST
              </span>
              <span className="font-arcade text-cyan-400 text-sm tracking-wider tabular-nums">
                {stats.highScore}m
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Install App, Sound Toggle, Shop Link */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400 text-white font-pixel text-xs shadow-lg transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">SHOP</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto py-4">
        {/* Hunter Drone Alert Badge */}
        <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/50 rounded-full px-3 py-1 mb-4 shadow-sm animate-pulse">
          <Crosshair className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] font-pixel text-rose-300 tracking-wider">
            WARNING: HUNTER DRONE PURSUIT IN PROGRESS
          </span>
        </div>

        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative group mb-2">
          <svg
            className="w-72 sm:w-96 md:w-[480px] h-auto drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]"
            viewBox="0 0 480 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Background 3D extrusion shadow */}
            <text
              x="242"
              y="58"
              textAnchor="middle"
              className="font-arcade"
              fontSize="38"
              fontWeight="900"
              fill="#0f172a"
              letterSpacing="2"
            >
              ROOFTOP
            </text>
            <text
              x="242"
              y="98"
              textAnchor="middle"
              className="font-arcade"
              fontSize="38"
              fontWeight="900"
              fill="#0f172a"
              letterSpacing="2"
            >
              RUSH
            </text>

            {/* Main Foreground Typography */}
            <text
              x="240"
              y="54"
              textAnchor="middle"
              className="font-arcade"
              fontSize="38"
              fontWeight="900"
              fill="url(#titleGrad)"
              letterSpacing="2"
            >
              ROOFTOP
            </text>
            <text
              x="240"
              y="94"
              textAnchor="middle"
              className="font-arcade"
              fontSize="38"
              fontWeight="900"
              fill="url(#accentGrad)"
              letterSpacing="2"
            >
              RUSH
            </text>
          </svg>
        </div>

        <p className="text-sm sm:text-base font-pixel text-slate-300 max-w-md mt-1 mb-6 drop-shadow">
          Leap wide gaps, slide under laser pipes, collect coins, and outrun the flying hunter robot!
        </p>

        {/* Biome Location Picker */}
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-pixel text-slate-400 tracking-wider">
              SELECT RUN BIOME:
            </span>
            <span className="text-[11px] font-cyber text-cyan-400 font-bold">
              {currentBiome.name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['snow', 'desert', 'city'] as BiomeId[]).map((biomeId) => {
              const b = BIOMES[biomeId];
              const isSelected = stats.selectedBiome === biomeId;
              return (
                <button
                  key={biomeId}
                  onClick={() => onSelectBiome(biomeId)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-102'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <span className="text-2xl mb-1">{b.themeIcon}</span>
                  <span className={`text-[10px] font-pixel ${isSelected ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {b.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Play Button */}
        <button
          onClick={onStartGame}
          className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-arcade text-sm sm:text-base tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white text-white group-hover:scale-110 transition-transform" />
          <span>START RUN</span>
          <ChevronRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
        </button>
        <span className="text-[10px] font-pixel text-slate-400 mt-2">
          [ PRESS SPACE OR ENTER ]
        </span>
      </div>

      {/* Bottom Controls Cheat Sheet */}
      <div className="w-full max-w-2xl bg-slate-900/70 border border-slate-800/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-around gap-2 text-center text-slate-300 shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-pixel">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-arcade text-[10px]">
            SPACE
          </span>
          <span className="text-slate-400">JUMP GAPS</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-pixel">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 font-arcade text-[10px]">
            DOWN ↓
          </span>
          <span className="text-slate-400">SLIDE UNDER PIPES</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-pixel">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-rose-400 font-arcade text-[10px]">
            F / X
          </span>
          <span className="text-slate-400">EMP DRONE ZAP</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-pixel">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-arcade text-[10px]">
            ESC
          </span>
          <span className="text-slate-400">PAUSE</span>
        </div>
      </div>
    </div>
  );
};
