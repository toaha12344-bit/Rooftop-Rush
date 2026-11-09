import React, { useState } from 'react';
import { X, Sparkles, Zap, Shield, Heart, ArrowUpCircle, Check, Coins } from 'lucide-react';
import { PlayerStats, SkinItem, PowerItem, WeaponItem } from '../types/game';
import { SKINS, POWERS, WEAPONS } from '../game/catalog';
import { sounds } from '../audio/soundEffects';

interface ShopModalProps {
  stats: PlayerStats;
  onClose: () => void;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  stats,
  onClose,
  onUpdateStats,
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'powers' | 'weapons'>('skins');

  const buySkin = (skin: SkinItem) => {
    if (stats.coins < skin.price) return;
    const newStats: PlayerStats = {
      ...stats,
      coins: stats.coins - skin.price,
      unlockedSkins: [...stats.unlockedSkins, skin.id],
      equippedSkin: skin.id,
    };
    sounds.playCoin();
    onUpdateStats(newStats);
  };

  const equipSkin = (skinId: string) => {
    sounds.playJump(false);
    onUpdateStats({ ...stats, equippedSkin: skinId });
  };

  const upgradePower = (power: PowerItem) => {
    const currentLevel = stats.powerLevels[power.id] || 0;
    if (currentLevel >= power.maxLevel) return;
    const cost = power.price * (currentLevel + 1);
    if (stats.coins < cost) return;

    const newStats: PlayerStats = {
      ...stats,
      coins: stats.coins - cost,
      powerLevels: {
        ...stats.powerLevels,
        [power.id]: currentLevel + 1,
      },
    };
    sounds.playCoin();
    onUpdateStats(newStats);
  };

  const buyWeapon = (weapon: WeaponItem) => {
    if (stats.coins < weapon.price) return;
    const newStats: PlayerStats = {
      ...stats,
      coins: stats.coins - weapon.price,
      unlockedWeapons: [...stats.unlockedWeapons, weapon.id],
      equippedWeapon: weapon.id,
    };
    sounds.playCoin();
    onUpdateStats(newStats);
  };

  const equipWeapon = (weaponId: string) => {
    sounds.playWeaponFire();
    onUpdateStats({ ...stats, equippedWeapon: weaponId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏪</span>
            <div>
              <h2 className="font-arcade text-sm sm:text-base text-cyan-400 tracking-wider">
                ROOFTOP GEAR SHOP
              </h2>
              <p className="text-[10px] font-pixel text-slate-400">
                Enhance your runner with outfits, perks, and anti-drone weapons
              </p>
            </div>
          </div>

          {/* User Coin Balance */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-arcade text-amber-400 text-xs sm:text-sm tabular-nums">
                {stats.coins}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('skins')}
            className={`px-4 py-2.5 font-pixel text-xs tracking-wider rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'skins'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🥋 OUTFITS ({SKINS.length})
          </button>
          <button
            onClick={() => setActiveTab('powers')}
            className={`px-4 py-2.5 font-pixel text-xs tracking-wider rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'powers'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ POWERS & PERKS ({POWERS.length})
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-4 py-2.5 font-pixel text-xs tracking-wider rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'weapons'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔫 WEAPONS ({WEAPONS.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          {/* TAB 1: SKINS */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SKINS.map((skin) => {
                const isUnlocked = stats.unlockedSkins.includes(skin.id);
                const isEquipped = stats.equippedSkin === skin.id;
                const canAfford = stats.coins >= skin.price;

                return (
                  <div
                    key={skin.id}
                    className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-arcade text-xs text-white tracking-wide">
                          {skin.name}
                        </span>
                        {/* Skin Palette Dots */}
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: skin.colors.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: skin.colors.bandana }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: skin.colors.accent }}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] font-pixel text-slate-400 mb-3">
                        {skin.description}
                      </p>

                      {skin.trailEffect !== 'none' && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-cyber text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md mb-3">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Special Trail: {skin.trailEffect.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      {isUnlocked ? (
                        isEquipped ? (
                          <span className="inline-flex items-center gap-1 text-xs font-pixel text-cyan-400">
                            <Check className="w-4 h-4" /> EQUIPPED
                          </span>
                        ) : (
                          <button
                            onClick={() => equipSkin(skin.id)}
                            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-pixel text-white transition active:scale-95 cursor-pointer"
                          >
                            EQUIP
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => buySkin(skin)}
                          disabled={!canAfford}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-pixel transition active:scale-95 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-300" />
                          <span>{skin.price} COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: POWERS */}
          {activeTab === 'powers' && (
            <div className="space-y-3">
              {POWERS.map((power) => {
                const currentLevel = stats.powerLevels[power.id] || 0;
                const isMax = currentLevel >= power.maxLevel;
                const nextCost = power.price * (currentLevel + 1);
                const canAfford = stats.coins >= nextCost;

                return (
                  <div
                    key={power.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 bg-slate-900 border border-slate-800 rounded-lg">
                        {power.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-arcade text-xs text-white">
                            {power.name}
                          </h3>
                          <span className="text-[10px] font-pixel text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                            LVL {currentLevel} / {power.maxLevel}
                          </span>
                        </div>
                        <p className="text-[11px] font-pixel text-slate-400 mt-1 max-w-md">
                          {power.description}
                        </p>

                        {/* Level pip bar */}
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: power.maxLevel }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 w-6 rounded-full ${
                                idx < currentLevel ? 'bg-cyan-400' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isMax ? (
                        <span className="inline-flex items-center gap-1 text-xs font-pixel text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> MAXED OUT
                        </span>
                      ) : (
                        <button
                          onClick={() => upgradePower(power)}
                          disabled={!canAfford}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-pixel transition active:scale-95 cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <ArrowUpCircle className="w-4 h-4 text-amber-200" />
                          <span>UPGRADE ({nextCost} 🪙)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: WEAPONS */}
          {activeTab === 'weapons' && (
            <div className="grid grid-cols-1 gap-4">
              {WEAPONS.map((weapon) => {
                const isUnlocked = stats.unlockedWeapons.includes(weapon.id);
                const isEquipped = stats.equippedWeapon === weapon.id;
                const canAfford = stats.coins >= weapon.price;

                return (
                  <div
                    key={weapon.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isEquipped
                        ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" style={{ color: weapon.color }} />
                        <h3 className="font-arcade text-xs text-white">
                          {weapon.name}
                        </h3>
                      </div>
                      <p className="text-[11px] font-pixel text-slate-400 max-w-lg">
                        {weapon.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-cyber">
                        <span className="text-cyan-300">
                          PUSHBACK: +{weapon.pushbackDistance}m
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-amber-300">
                          STUN: {weapon.stunDuration}s
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">
                          COOLDOWN: {weapon.cooldown}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isUnlocked ? (
                        isEquipped ? (
                          <span className="inline-flex items-center gap-1 text-xs font-pixel text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-lg border border-cyan-800">
                            <Check className="w-4 h-4" /> EQUIPPED
                          </span>
                        ) : (
                          <button
                            onClick={() => equipWeapon(weapon.id)}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-pixel text-white transition active:scale-95 cursor-pointer"
                          >
                            EQUIP
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => buyWeapon(weapon)}
                          disabled={!canAfford}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-pixel transition active:scale-95 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Coins className="w-4 h-4 text-amber-300" />
                          <span>{weapon.price} COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-between items-center text-[10px] font-pixel text-slate-400">
          <span>Collect rooftop coins during runs to unlock more gear!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
