import { BiomeId, SkinItem, PowerItem, WeaponItem } from '../types/game';

export interface BiomeConfig {
  id: BiomeId;
  name: string;
  tagline: string;
  skyGradient: [string, string, string];
  cityColor: string;
  midColor: string;
  buildingBaseColor: string;
  buildingTrimColor: string;
  accentColor: string;
  windowColors: string[];
  particleType: 'snow' | 'sand' | 'rain';
  themeIcon: string;
  roofDetails: string;
}

export const BIOMES: Record<BiomeId, BiomeConfig> = {
  city: {
    id: 'city',
    name: 'Cyber Metropolis',
    tagline: 'Neon-drenched skyscrapers under midnight rain',
    skyGradient: ['#090915', '#161233', '#2a1a4e'],
    cityColor: '#120d2a',
    midColor: '#1b173e',
    buildingBaseColor: '#1a1b2e',
    buildingTrimColor: '#00f0ff',
    accentColor: '#ff007f',
    windowColors: ['#00f0ff', '#ff007f', '#ffe600', '#22253f'],
    particleType: 'rain',
    themeIcon: '🏙️',
    roofDetails: 'High-voltage pipes, holographic billboards & antennas',
  },
  snow: {
    id: 'snow',
    name: 'Glacier Peaks',
    tagline: 'Sub-zero frozen rooftops amid blizzard aurora',
    skyGradient: ['#061325', '#0f2b48', '#1e4869'],
    cityColor: '#0a1d30',
    midColor: '#14314e',
    buildingBaseColor: '#1b2d42',
    buildingTrimColor: '#a5f3fc',
    accentColor: '#38bdf8',
    windowColors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#152538'],
    particleType: 'snow',
    themeIcon: '❄️',
    roofDetails: 'Icy chimneys, snowdrifts & frozen ventilation stacks',
  },
  desert: {
    id: 'desert',
    name: 'Sultan Dunes',
    tagline: 'Ancient sun-scorched towers and desert heatwaves',
    skyGradient: ['#280e15', '#571822', '#8c3527'],
    cityColor: '#361118',
    midColor: '#532322',
    buildingBaseColor: '#5a342a',
    buildingTrimColor: '#f59e0b',
    accentColor: '#fbbf24',
    windowColors: ['#fbbf24', '#f59e0b', '#d97706', '#3b1c15'],
    particleType: 'sand',
    themeIcon: '🏜️',
    roofDetails: 'Terracotta roofs, ancient spires & sandstorm turbines',
  },
};

export const SKINS: SkinItem[] = [
  {
    id: 'classic',
    name: 'Rooftop Rebel',
    price: 0,
    description: 'Street-smart free-runner with red bandana and high-grip sneakers.',
    colors: {
      primary: '#2563eb', // blue jacket
      secondary: '#1e293b', // pants
      accent: '#ef4444', // red shoes/trim
      skin: '#fcd34d',
      hair: '#78350f',
      bandana: '#dc2626',
    },
    trailEffect: 'none',
  },
  {
    id: 'neon_ninja',
    name: 'Shadow Striker',
    price: 350,
    description: 'Cybernetic shinobi armed with light-weave stealth fiber and cyan trail.',
    colors: {
      primary: '#090d16',
      secondary: '#111827',
      accent: '#06b6d4',
      skin: '#e2e8f0',
      hair: '#0891b2',
      bandana: '#22d3ee',
    },
    trailEffect: 'neon',
  },
  {
    id: 'cyber_punk',
    name: 'Chrome Phantom',
    price: 800,
    description: 'Augmented courier with glowing thermal jacket and orange thrusters.',
    colors: {
      primary: '#ea580c',
      secondary: '#27272a',
      accent: '#f97316',
      skin: '#f5d0fe',
      hair: '#ec4899',
      bandana: '#f97316',
    },
    trailEffect: 'neon',
  },
  {
    id: 'frost_climber',
    name: 'Arctic Parkourist',
    price: 1400,
    description: 'Sub-zero explorer geared with insulated thermal suit and ice-spike soles.',
    colors: {
      primary: '#0284c7',
      secondary: '#0f172a',
      accent: '#38bdf8',
      skin: '#fef08a',
      hair: '#94a3b8',
      bandana: '#bae6fd',
    },
    trailEffect: 'frost',
  },
  {
    id: 'sand_nomad',
    name: 'Dune Drifter',
    price: 2200,
    description: 'Desert wanderer with sand-woven cloak that dissolves into golden mirages.',
    colors: {
      primary: '#b45309',
      secondary: '#451a03',
      accent: '#fbbf24',
      skin: '#d97706',
      hair: '#78350f',
      bandana: '#f59e0b',
    },
    trailEffect: 'sand',
  },
  {
    id: 'golden_legend',
    name: 'Golden Vanguard',
    price: 4500,
    description: 'Legendary roof-master bathed in pure cyber-gold. Leaves a trail of stars!',
    colors: {
      primary: '#fbbf24',
      secondary: '#b45309',
      accent: '#fef08a',
      skin: '#fef08a',
      hair: '#f59e0b',
      bandana: '#ffffff',
    },
    trailEffect: 'golden',
  },
];

export const POWERS: PowerItem[] = [
  {
    id: 'magnet',
    name: 'Coin Magnet',
    price: 250,
    level: 0,
    maxLevel: 4,
    description: 'Magnetically pulls in rooftop coins from a wider distance.',
    icon: '🧲',
  },
  {
    id: 'double_jump',
    name: 'Acrobat Double Jump',
    price: 500,
    level: 0,
    maxLevel: 1,
    description: 'Tap jump in mid-air to leap a second time and clear any massive gap!',
    icon: '👟',
  },
  {
    id: 'drone_jammer',
    name: 'Drone EMP Disrupter',
    price: 400,
    level: 0,
    maxLevel: 3,
    description: 'Slows the hunter drone down so it takes much longer to catch up after errors.',
    icon: '📡',
  },
  {
    id: 'extra_heart',
    name: 'Kinetic Deflector',
    price: 600,
    level: 0,
    maxLevel: 2,
    description: 'Increases maximum life capacity (up to 5 hearts for extra margin).',
    icon: '❤️',
  },
];

export const WEAPONS: WeaponItem[] = [
  {
    id: 'emp_blaster',
    name: 'Pulse EMP Shockwave',
    price: 0,
    description: 'Fires an electromagnetic surge that knocks the robot back 30m and stuns it 3s.',
    cooldown: 8,
    pushbackDistance: 30,
    stunDuration: 3.5,
    color: '#38bdf8',
  },
  {
    id: 'tether_net',
    name: 'Cryo Grav-Net',
    price: 600,
    description: 'Shoots an icy gravity net that entangles rotors, pushing drone back 45m and freezing it.',
    cooldown: 7,
    pushbackDistance: 45,
    stunDuration: 4.5,
    color: '#a855f7',
  },
  {
    id: 'plasma_cannon',
    name: 'Overcharged Plasma Cannon',
    price: 1500,
    description: 'Blasts a devastating superheated plasma bolt that repels the hunter drone 65m!',
    cooldown: 6,
    pushbackDistance: 65,
    stunDuration: 5.5,
    color: '#ef4444',
  },
];
