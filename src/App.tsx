import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BiomeId, GameState, PlayerStats } from './types/game';
import { GameEngine } from './game/GameEngine';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { ShopModal } from './components/ShopModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { TouchControls } from './components/TouchControls';
import { sounds } from './audio/soundEffects';

const STORAGE_KEY = 'rooftop_rush_player_stats_v1';

const DEFAULT_STATS: PlayerStats = {
  coins: 50, // Welcome bonus to try the shop
  highScore: 0,
  equippedSkin: 'classic',
  unlockedSkins: ['classic'],
  equippedWeapon: 'emp_blaster',
  unlockedWeapons: ['emp_blaster'],
  powerLevels: {},
  selectedBiome: 'city',
  totalRuns: 0,
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent Player Stats
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    return DEFAULT_STATS;
  });

  const [gameState, setGameState] = useState<GameState>('title');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // HUD State (decoupled from high frequency canvas ticks)
  const [hud, setHud] = useState({
    lives: 3,
    maxLives: 3,
    distance: 0,
    coins: 0,
    droneDistance: 55,
    maxDroneDistance: 70,
    weaponCooldownPct: 0,
    isDroneCritical: false,
  });

  // Game Over Run Summary
  const [gameOverData, setGameOverData] = useState<{
    distance: number;
    coinsEarned: number;
    highScoreBeat: boolean;
    cause: 'drone' | 'lives';
  }>({
    distance: 0,
    coinsEarned: 0,
    highScoreBeat: false,
    cause: 'lives',
  });

  // Save stats to localStorage
  const updateStats = useCallback((newStats: PlayerStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    } catch {
      // Storage error ignored
    }
    if (engineRef.current) {
      engineRef.current.updateStats(newStats);
    }
  }, []);

  // Initialize Canvas & Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, stats, {
      onUpdateHUD: (data) => {
        setHud((prev) => ({
          ...prev,
          ...data,
          maxLives: 3 + (stats.powerLevels['extra_heart'] || 0),
        }));
      },
      onGameOver: (summary) => {
        setGameState('gameover');
        setGameOverData(summary);

        // Update player coin bank & high score
        setStats((prev) => {
          const newHighScore = Math.max(prev.highScore, summary.distance);
          const updated: PlayerStats = {
            ...prev,
            coins: prev.coins + summary.coinsEarned,
            highScore: newHighScore,
            totalRuns: prev.totalRuns + 1,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
      },
      onPauseToggle: () => {
        setGameState((prev) => {
          if (prev === 'playing') {
            engine.pause();
            return 'paused';
          } else if (prev === 'paused') {
            engine.resume();
            return 'playing';
          }
          return prev;
        });
      },
    });

    engineRef.current = engine;

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Run once on mount

  // Sync stats changes to running engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateStats(stats);
    }
  }, [stats]);

  // Start a new game run
  const startGame = useCallback(() => {
    if (!engineRef.current) return;
    setGameState('playing');
    setIsShopOpen(false);
    engineRef.current.restart();
    engineRef.current.start();
  }, []);

  // Pause & Resume
  const pauseGame = useCallback(() => {
    if (engineRef.current && gameState === 'playing') {
      engineRef.current.pause();
      setGameState('paused');
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (engineRef.current && gameState === 'paused') {
      engineRef.current.resume();
      setGameState('playing');
    }
  }, [gameState]);

  const quitToTitle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    sounds.stopBGM();
    setGameState('title');
  }, []);

  // Biome selector
  const handleSelectBiome = useCallback(
    (biome: BiomeId) => {
      updateStats({ ...stats, selectedBiome: biome });
    },
    [stats, updateStats]
  );

  // Audio Toggle
  const toggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Key listener for Title Screen Start (Space / Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'title' && !isShopOpen) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isShopOpen, startGame]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 60fps HTML5 Canvas Viewport */}
      <div className="absolute inset-0 w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full block pixelated"
        />
      </div>

      {/* Retro Arcade Scanline CRT Overlay */}
      <div className="absolute inset-0 retro-scanlines pointer-events-none z-10" />

      {/* Screen 1: TITLE SCREEN */}
      {gameState === 'title' && (
        <TitleScreen
          stats={stats}
          isMuted={isMuted}
          onStartGame={startGame}
          onOpenShop={() => setIsShopOpen(true)}
          onSelectBiome={handleSelectBiome}
          onToggleMute={toggleMute}
        />
      )}

      {/* Screen 2: PLAYING ACTIVE HUD */}
      {gameState === 'playing' && (
        <>
          <GameHUD
            lives={hud.lives}
            maxLives={hud.maxLives}
            distance={hud.distance}
            coins={hud.coins}
            droneDistance={hud.droneDistance}
            maxDroneDistance={hud.maxDroneDistance}
            weaponCooldownPct={hud.weaponCooldownPct}
            isDroneCritical={hud.isDroneCritical}
            equippedWeaponId={stats.equippedWeapon}
            isMuted={isMuted}
            onPause={pauseGame}
            onFireWeapon={() => engineRef.current?.fireWeapon()}
            onToggleMute={toggleMute}
          />

          {/* On-Screen Touch Controls (Visible on mobile/tablet or touch screens) */}
          <TouchControls
            onJump={() => engineRef.current?.jump()}
            onStartSlide={() => engineRef.current?.startSlide()}
            onEndSlide={() => engineRef.current?.endSlide()}
            onFireWeapon={() => engineRef.current?.fireWeapon()}
            weaponReady={hud.weaponCooldownPct <= 0}
          />
        </>
      )}

      {/* Screen 3: PAUSE MODAL */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={resumeGame}
          onRestart={startGame}
          onQuitToTitle={quitToTitle}
          onToggleMute={toggleMute}
          isMuted={isMuted}
        />
      )}

      {/* Screen 4: GAME OVER MODAL */}
      {gameState === 'gameover' && (
        <GameOverModal
          distance={gameOverData.distance}
          coinsEarned={gameOverData.coinsEarned}
          totalCoins={stats.coins}
          highScore={stats.highScore}
          isNewHighScore={gameOverData.highScoreBeat}
          cause={gameOverData.cause}
          onRestart={startGame}
          onOpenShop={() => setIsShopOpen(true)}
          onQuitToTitle={quitToTitle}
        />
      )}

      {/* SHOP & CUSTOMIZATION MODAL */}
      {isShopOpen && (
        <ShopModal
          stats={stats}
          onClose={() => setIsShopOpen(false)}
          onUpdateStats={updateStats}
        />
      )}
    </div>
  );
}
