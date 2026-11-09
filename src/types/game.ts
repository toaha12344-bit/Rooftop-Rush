export type BiomeId = 'city' | 'snow' | 'desert';

export type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export interface SkinItem {
  id: string;
  name: string;
  price: number;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    skin: string;
    hair: string;
    bandana: string;
  };
  trailEffect: 'none' | 'neon' | 'frost' | 'sand' | 'golden';
}

export interface PowerItem {
  id: string;
  name: string;
  price: number;
  level: number;
  maxLevel: number;
  description: string;
  icon: string;
}

export interface WeaponItem {
  id: string;
  name: string;
  price: number;
  description: string;
  cooldown: number; // in seconds
  pushbackDistance: number; // meters
  stunDuration: number; // seconds
  color: string;
}

export interface PlayerStats {
  coins: number;
  highScore: number;
  equippedSkin: string;
  unlockedSkins: string[];
  equippedWeapon: string;
  unlockedWeapons: string[];
  powerLevels: Record<string, number>;
  selectedBiome: BiomeId;
  totalRuns: number;
}

export interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  trimColor: string;
  windowPattern: number;
  hasAntenna?: boolean;
  hasWaterTower?: boolean;
}

export type ObstacleType = 'pipe_low' | 'vent' | 'antenna' | 'laser_beam' | 'billboard_high';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  requiresSlide: boolean; // if true, must slide under; if false, must jump over
  passed?: boolean;
}

export interface Coin {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  frame: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape?: 'rect' | 'circle';
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: string;
  life: number;
  color: string;
}

export interface DroneState {
  x: number; // Visual X coordinate on screen or behind
  y: number;
  distance: number; // Distance in meters from player (e.g. 50m safe, 0m caught)
  maxDistance: number;
  isStunned: boolean;
  stunTimer: number;
  targetY: number;
  propellerAngle: number;
  alertLevel: number; // 0 to 1 (1 is critical danger)
  zapAnimation: number;
}
