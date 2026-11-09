import {
  BiomeId,
  Building,
  Coin,
  DroneState,
  Obstacle,
  Particle,
  PlayerStats,
  Projectile,
} from '../types/game';
import { BIOMES, BiomeConfig, WEAPONS } from './catalog';
import {
  drawBiomeBackground,
  drawBuildingRooftop,
  drawCoin,
  drawHunterDrone,
  drawObstacle,
  drawPixelRunner,
} from './pixelArt';
import { sounds } from '../audio/soundEffects';

export interface GameEngineCallbacks {
  onUpdateHUD: (data: {
    lives: number;
    distance: number;
    coins: number;
    droneDistance: number;
    maxDroneDistance: number;
    weaponCooldownPct: number;
    isDroneCritical: boolean;
  }) => void;
  onGameOver: (summary: {
    distance: number;
    coinsEarned: number;
    highScoreBeat: boolean;
    cause: 'drone' | 'lives';
  }) => void;
  onPauseToggle: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;
  private stats: PlayerStats;
  private biome: BiomeConfig;

  // Running Loop state
  private animationId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Game Dimensions & Camera
  private width: number = 1000;
  private height: number = 600;
  private cameraX: number = 0;

  // Screen shake
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  // Player State
  private player = {
    x: 200,
    y: 350,
    vx: 380, // forward running speed (px/s)
    vy: 0,
    width: 24,
    height: 48,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0,
    state: 'run' as 'run' | 'jump' | 'slide' | 'stumble' | 'fall',
    lives: 3,
    maxLives: 3,
    invulnerableTimer: 0,
    animTime: 0,
    canDoubleJump: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    score: 0,
    coinsCollected: 0,
  };

  // Flying Hunter Drone
  private drone: DroneState = {
    x: 40,
    y: 220,
    distance: 55, // in meters
    maxDistance: 70,
    isStunned: false,
    stunTimer: 0,
    targetY: 220,
    propellerAngle: 0,
    alertLevel: 0,
    zapAnimation: 0,
  };

  // Weapon State
  private weaponCooldownTimer: number = 0;
  private weaponMaxCooldown: number = 8;

  // World Elements
  private buildings: Building[] = [];
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private particles: Particle[] = [];
  private projectiles: Projectile[] = [];

  // Weather / Biome particles
  private weatherParticles: { x: number; y: number; speed: number; size: number }[] = [];

  // Key states
  private keys: Record<string, boolean> = {};

  constructor(
    canvas: HTMLCanvasElement,
    stats: PlayerStats,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.stats = stats;
    this.callbacks = callbacks;
    this.biome = BIOMES[stats.selectedBiome] || BIOMES.city;

    // Apply power upgrades
    const extraHearts = stats.powerLevels['extra_heart'] || 0;
    this.player.maxLives = 3 + extraHearts;
    this.player.lives = this.player.maxLives;

    // Set weapon cooldown
    const weapon = WEAPONS.find((w) => w.id === stats.equippedWeapon) || WEAPONS[0];
    this.weaponMaxCooldown = weapon.cooldown;

    this.resize();
    this.initWorld();
    this.initWeather();
    this.bindEvents();
  }

  public updateStats(newStats: PlayerStats) {
    this.stats = newStats;
    this.biome = BIOMES[newStats.selectedBiome] || BIOMES.city;
    const weapon = WEAPONS.find((w) => w.id === newStats.equippedWeapon) || WEAPONS[0];
    this.weaponMaxCooldown = weapon.cooldown;
  }

  public resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth || 1000;
      this.height = parent.clientHeight || 600;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  private initWeather() {
    this.weatherParticles = [];
    const count = this.biome.id === 'snow' ? 120 : this.biome.id === 'desert' ? 70 : 80;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 1.5 + Math.random() * 3,
        size: 1 + Math.random() * 2.5,
      });
    }
  }

  private initWorld() {
    this.buildings = [];
    this.obstacles = [];
    this.coins = [];
    this.particles = [];
    this.projectiles = [];

    // Starting Safe Rooftop (Wide & clear for player)
    const startY = Math.floor(this.height * 0.65);
    this.buildings.push({
      x: 0,
      y: startY,
      width: 750,
      height: this.height - startY + 200,
      color: this.biome.buildingBaseColor,
      trimColor: this.biome.buildingTrimColor,
      windowPattern: 1,
      hasAntenna: false,
      hasWaterTower: false,
    });

    // Player initial position
    this.player.x = 220;
    this.player.y = startY - 48;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.state = 'run';
    this.player.score = 0;
    this.player.coinsCollected = 0;

    // Reset Drone
    this.drone.distance = 55;
    this.drone.isStunned = false;
    this.drone.stunTimer = 0;

    // Generate upcoming buildings
    let currentX = 750;
    for (let i = 0; i < 6; i++) {
      currentX = this.generateNextBuilding(currentX);
    }
  }

  private generateNextBuilding(fromX: number): number {
    // Gap size between buildings: 120px to 220px
    const gap = 120 + Math.random() * 110;
    const buildingX = fromX + gap;

    // Building width: 380px to 800px
    const width = 380 + Math.random() * 420;

    // Height variation relative to base height
    const baseHeight = Math.floor(this.height * 0.65);
    const heightVariation = (Math.random() - 0.5) * 90;
    const y = Math.max(this.height * 0.48, Math.min(this.height * 0.78, baseHeight + heightVariation));
    const height = this.height - y + 300;

    const building: Building = {
      x: buildingX,
      y,
      width,
      height,
      color: this.biome.buildingBaseColor,
      trimColor: this.biome.buildingTrimColor,
      windowPattern: Math.floor(Math.random() * 100),
      hasAntenna: Math.random() > 0.6,
      hasWaterTower: Math.random() > 0.7,
    };
    this.buildings.push(building);

    // Place Obstacles on the new building (if wide enough)
    if (width > 420) {
      const obstacleTypes: ('pipe_low' | 'vent' | 'antenna' | 'laser_beam' | 'billboard_high')[] = [
        'pipe_low',
        'vent',
        'antenna',
        'laser_beam',
        'billboard_high',
      ];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const requiresSlide = type === 'pipe_low' || type === 'laser_beam' || type === 'billboard_high';

      const obsWidth = requiresSlide ? 65 : 42;
      const obsHeight = requiresSlide ? (type === 'pipe_low' ? 24 : 26) : 34;

      // Position along the roof (avoid placing too close to edges)
      const obsX = buildingX + 100 + Math.random() * (width - 220);
      const obsY = requiresSlide ? y - 46 : y - obsHeight;

      this.obstacles.push({
        x: obsX,
        y: obsY,
        width: obsWidth,
        height: obsHeight,
        type,
        requiresSlide,
      });

      // Also place a coin cluster along the roof
      const coinCount = 3 + Math.floor(Math.random() * 4);
      const coinStartX = buildingX + 30;
      for (let c = 0; c < coinCount; c++) {
        // Skip coins that intersect directly with ground obstacle
        const cx = coinStartX + c * 32;
        if (Math.abs(cx - obsX) > 25) {
          this.coins.push({
            x: cx,
            y: y - 24,
            radius: 8,
            collected: false,
            frame: c,
          });
        }
      }
    }

    // Place gap jumping coins (satisfying arc across the gap)
    if (gap > 130) {
      const midGap = fromX + gap / 2;
      const prevY = this.buildings[this.buildings.length - 2]?.y || y;
      const avgY = (prevY + y) / 2;
      this.coins.push({
        x: midGap - 28,
        y: avgY - 55,
        radius: 8,
        collected: false,
        frame: 1,
      });
      this.coins.push({
        x: midGap,
        y: avgY - 75,
        radius: 8,
        collected: false,
        frame: 2,
      });
      this.coins.push({
        x: midGap + 28,
        y: avgY - 55,
        radius: 8,
        collected: false,
        frame: 3,
      });
    }

    return buildingX + width;
  }

  private bindEvents() {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      this.keys[e.code] = true;

      if (e.code === 'Escape') {
        this.callbacks.onPauseToggle();
        return;
      }

      if (!this.isRunning || this.isPaused) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.jump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.startSlide();
      } else if (e.code === 'KeyF' || e.code === 'KeyX') {
        this.fireWeapon();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.endSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', () => {
      this.keys = {};
    });
  }

  // PUBLIC PLAYER ACTIONS (also triggered by on-screen touch buttons)
  public jump() {
    if (!this.isRunning || this.isPaused) return;

    const hasDoubleJump = (this.stats.powerLevels['double_jump'] || 0) > 0;

    if (this.player.isGrounded || this.player.coyoteTimer > 0) {
      // Normal Jump
      this.player.vy = -590;
      this.player.isGrounded = false;
      this.player.coyoteTimer = 0;
      this.player.state = 'jump';
      this.player.canDoubleJump = hasDoubleJump;
      sounds.playJump(false);

      // Dust puff particles
      this.spawnDust(this.player.x, this.player.y + 48, 5);
    } else if (this.player.canDoubleJump) {
      // Double Jump
      this.player.vy = -540;
      this.player.canDoubleJump = false;
      this.player.state = 'jump';
      sounds.playJump(true);

      // Twirl sparkle particles
      this.spawnDust(this.player.x, this.player.y + 35, 7, '#38bdf8');
    } else {
      // Buffer jump for when landing soon
      this.player.jumpBufferTimer = 0.14;
    }
  }

  public startSlide() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.player.isSliding) {
      this.player.isSliding = true;
      this.player.slideTimer = 0.65;
      this.player.state = 'slide';
      sounds.playSlide();

      // Sparks
      this.spawnDust(this.player.x, this.player.y + 20, 6, '#f59e0b');
    }
  }

  public endSlide() {
    if (this.player.isSliding) {
      this.player.isSliding = false;
      this.player.slideTimer = 0;
      if (this.player.isGrounded) {
        this.player.state = 'run';
      }
    }
  }

  public fireWeapon() {
    if (!this.isRunning || this.isPaused) return;
    if (this.weaponCooldownTimer > 0) return;

    const weapon = WEAPONS.find((w) => w.id === this.stats.equippedWeapon) || WEAPONS[0];
    this.weaponCooldownTimer = weapon.cooldown;

    // Fire electric projectile backwards towards the chaser drone
    this.projectiles.push({
      x: this.player.x,
      y: this.player.y - 12,
      vx: -700,
      vy: (this.drone.y - (this.player.y - 12)) * 1.5,
      radius: 9,
      type: weapon.id,
      life: 1.2,
      color: weapon.color,
    });

    sounds.playWeaponFire();

    // Trigger drone pushback & stun immediately or upon projectile reach
    setTimeout(() => {
      this.drone.distance = Math.min(this.drone.maxDistance, this.drone.distance + weapon.pushbackDistance);
      this.drone.isStunned = true;
      this.drone.stunTimer = weapon.stunDuration;
      this.shake(8, 0.25);
      sounds.playDroneStun();
    }, 120);
  }

  private spawnDust(x: number, y: number, count: number, color: string = '#cbd5e1') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: -60 + (Math.random() - 0.5) * 80,
        vy: -20 - Math.random() * 50,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5,
        color,
        size: 2 + Math.random() * 3,
        shape: 'rect',
      });
    }
  }

  private shake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  // START / STOP / PAUSE
  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    sounds.startBGM();

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      const dt = Math.min(rawDt, 0.05);

      if (!this.isPaused) {
        this.update(dt);
      }
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public restart() {
    this.initWorld();
    this.lastTime = performance.now();
    this.isPaused = false;
    this.isRunning = true;
    sounds.startBGM();
  }

  // MAIN UPDATE
  private update(dt: number) {
    this.player.animTime += dt;

    // Gradual runner speed ramp with distance
    const speedBoost = Math.min(180, this.player.score * 0.08);
    this.player.vx = 390 + speedBoost;

    // Advance camera & player forward
    this.player.x += this.player.vx * dt;
    this.player.score = Math.floor(this.player.x / 10);
    this.cameraX = this.player.x - 220;

    // Handle slide countdown
    if (this.player.isSliding) {
      this.player.slideTimer -= dt;
      if (this.player.slideTimer <= 0 && !this.keys['ArrowDown'] && !this.keys['KeyS']) {
        this.endSlide();
      }
    }

    // Handle Timers
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }
    if (this.weaponCooldownTimer > 0) {
      this.weaponCooldownTimer = Math.max(0, this.weaponCooldownTimer - dt);
    }
    if (this.player.jumpBufferTimer > 0) {
      this.player.jumpBufferTimer -= dt;
    }
    if (this.player.coyoteTimer > 0) {
      this.player.coyoteTimer -= dt;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }

    // Apply Gravity
    const gravity = 1450;
    this.player.vy += gravity * dt;
    this.player.y += this.player.vy * dt;

    // Building Collision Check & Ground Detection
    const playerFeetX = this.player.x + 8;
    const playerFeetY = this.player.y + (this.player.isSliding ? 20 : 48);

    let onBuilding: Building | null = null;
    for (const b of this.buildings) {
      if (playerFeetX >= b.x && playerFeetX <= b.x + b.width) {
        // Vertical check: near the roof ledge
        if (playerFeetY >= b.y && playerFeetY <= b.y + 24 && this.player.vy >= 0) {
          onBuilding = b;
          break;
        }
      }
    }

    if (onBuilding) {
      this.player.y = onBuilding.y - (this.player.isSliding ? 20 : 48);
      this.player.vy = 0;
      if (!this.player.isGrounded) {
        // Just landed!
        this.player.isGrounded = true;
        this.player.canDoubleJump = (this.stats.powerLevels['double_jump'] || 0) > 0;
        if (!this.player.isSliding) {
          this.player.state = 'run';
        }
        // Jump buffer trigger
        if (this.player.jumpBufferTimer > 0) {
          this.jump();
        }
      }
    } else {
      // In air
      if (this.player.isGrounded) {
        // Just stepped off ledge
        this.player.isGrounded = false;
        this.player.coyoteTimer = 0.12;
      }
      if (!this.player.isSliding && this.player.state !== 'stumble') {
        this.player.state = 'jump';
      }
    }

    // Fall Off Building Check (Fell into abyss between roofs)
    if (this.player.y > this.height + 60) {
      this.handleRoofFall();
    }

    // Obstacle Collisions
    this.checkObstacleCollisions();

    // Coins Magnet & Collection
    this.checkCoinCollections(dt);

    // Update Chasing Drone AI & Distance
    this.updateDrone(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Weather & Environment Particles
    this.updateParticles(dt);

    // Generate new buildings as player runs forward
    const lastBuilding = this.buildings[this.buildings.length - 1];
    if (lastBuilding && lastBuilding.x + lastBuilding.width < this.player.x + this.width + 400) {
      this.generateNextBuilding(lastBuilding.x + lastBuilding.width);
    }

    // Cleanup offscreen buildings and obstacles behind camera
    this.buildings = this.buildings.filter((b) => b.x + b.width > this.cameraX - 300);
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > this.cameraX - 200);
    this.coins = this.coins.filter((c) => c.x > this.cameraX - 100);

    // Notify React HUD
    const weaponPct = this.weaponCooldownTimer / this.weaponMaxCooldown;
    this.callbacks.onUpdateHUD({
      lives: this.player.lives,
      distance: this.player.score,
      coins: this.player.coinsCollected,
      droneDistance: Math.max(0, Math.round(this.drone.distance)),
      maxDroneDistance: this.drone.maxDistance,
      weaponCooldownPct: weaponPct,
      isDroneCritical: this.drone.distance < 15,
    });
  }

  // FALL RECOVERY (Lost life and drone advances)
  private handleRoofFall() {
    this.player.lives -= 1;
    sounds.playHit();
    this.shake(12, 0.4);

    // Drone surges closer by 25m!
    this.drone.distance = Math.max(0, this.drone.distance - 25);

    if (this.player.lives <= 0 || this.drone.distance <= 0) {
      this.triggerGameOver('lives');
      return;
    }

    // Find the next available building ahead of player
    const upcoming = this.buildings.find((b) => b.x > this.player.x - 50) || this.buildings[this.buildings.length - 1];
    this.player.x = upcoming.x + 60;
    this.player.y = upcoming.y - 120;
    this.player.vy = 0;
    this.player.invulnerableTimer = 2.2;
    this.player.state = 'jump';

    // Respawn sparkle
    this.spawnDust(this.player.x, this.player.y, 15, '#38bdf8');
  }

  // OBSTACLE COLLISION
  private checkObstacleCollisions() {
    if (this.player.invulnerableTimer > 0) return;

    const pX = this.player.x;
    const pY = this.player.y;
    const pW = this.player.isSliding ? 38 : 22;
    const pH = this.player.isSliding ? 22 : 46;

    for (const obs of this.obstacles) {
      if (obs.passed) continue;

      // Check AABB bounding box overlap
      const hit =
        pX + pW > obs.x &&
        pX < obs.x + obs.width &&
        pY + pH > obs.y &&
        pY < obs.y + obs.height;

      if (hit) {
        obs.passed = true;
        this.handleObstacleHit(obs);
        break;
      }
    }
  }

  private handleObstacleHit(obs: Obstacle) {
    this.player.lives -= 1;
    this.player.invulnerableTimer = 1.8;
    this.player.state = 'stumble';
    setTimeout(() => {
      if (this.player.state === 'stumble') {
        this.player.state = this.player.isGrounded ? 'run' : 'jump';
      }
    }, 400);

    // Drone catch-up surge: Drone moves closer!
    const jammerLevel = this.stats.powerLevels['drone_jammer'] || 0;
    const penaltyDistance = Math.max(12, 22 - jammerLevel * 3);
    this.drone.distance = Math.max(0, this.drone.distance - penaltyDistance);

    sounds.playHit();
    this.shake(10, 0.35);
    this.spawnDust(obs.x + obs.width / 2, obs.y + obs.height / 2, 12, '#ef4444');

    if (this.player.lives <= 0 || this.drone.distance <= 0) {
      this.triggerGameOver(this.player.lives <= 0 ? 'lives' : 'drone');
    }
  }

  // COIN MAGNET & PICKUPS
  private checkCoinCollections(dt: number) {
    const magnetLevel = this.stats.powerLevels['magnet'] || 0;
    const magnetRadius = 45 + magnetLevel * 45; // up to 225px pull range!

    const pCenter = {
      x: this.player.x + 12,
      y: this.player.y + 24,
    };

    for (const coin of this.coins) {
      if (coin.collected) continue;

      const dx = pCenter.x - coin.x;
      const dy = pCenter.y - coin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Magnet attraction
      if (dist < magnetRadius) {
        const pullSpeed = 480 * dt;
        coin.x += (dx / dist) * pullSpeed;
        coin.y += (dy / dist) * pullSpeed;
      }

      // Pickup radius
      if (dist < 26) {
        coin.collected = true;
        this.player.coinsCollected += 1;
        sounds.playCoin();

        // Sparkle burst
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: coin.x,
            y: coin.y,
            vx: (Math.random() - 0.5) * 80,
            vy: -40 - Math.random() * 60,
            life: 0.25,
            maxLife: 0.3,
            color: '#fbbf24',
            size: 3,
            shape: 'circle',
          });
        }
      }
    }
  }

  // DRONE TRACKING & AI
  private updateDrone(dt: number) {
    this.drone.propellerAngle += dt * 35;

    // Drone visual position on screen follows behind player
    // Drone X is mapped to player.x minus visual representation of distance
    const visualOffset = 90 + this.drone.distance * 3.5;
    this.drone.x = this.player.x - visualOffset;

    // Drone smoothly tracks player's altitude
    this.drone.targetY = Math.max(90, this.player.y - 70);
    this.drone.y += (this.drone.targetY - this.drone.y) * dt * 3.5;

    // If stunned, countdown stun timer
    if (this.drone.isStunned) {
      this.drone.stunTimer -= dt;
      if (this.drone.stunTimer <= 0) {
        this.drone.isStunned = false;
      }
    } else {
      // Natural drone creeping speed: if player runs cleanly, drone slowly drops back;
      // otherwise smoothly closes distance
      const baseCatchupSpeed = 0.65; // creeps in over time
      this.drone.distance -= baseCatchupSpeed * dt;

      // Natural gap widening if player is running at high speed
      if (this.player.state === 'run' && this.player.isGrounded) {
        this.drone.distance += 0.9 * dt;
      }

      // Clamp distance
      this.drone.distance = Math.min(this.drone.maxDistance, this.drone.distance);

      // Alarm warning if drone is dangerously close (< 15m)
      if (this.drone.distance < 15) {
        sounds.playDroneAlarm();
      }

      // Caught by drone!
      if (this.drone.distance <= 0) {
        this.triggerGameOver('drone');
      }
    }
  }

  // PROJECTILES (Weapons fired at drone)
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Particle trail
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: 20,
        vy: (Math.random() - 0.5) * 30,
        life: 0.15,
        maxLife: 0.2,
        color: p.color,
        size: 3,
        shape: 'circle',
      });

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // WEATHER PARTICLES & EFFECTS
  private updateParticles(dt: number) {
    // Environmental weather
    for (const wp of this.weatherParticles) {
      wp.x -= wp.speed * 20 * dt;
      wp.y += wp.speed * 35 * dt;

      if (wp.y > this.height) {
        wp.y = -10;
        wp.x = Math.random() * (this.width + 200);
      }
      if (wp.x < -20) {
        wp.x = this.width + 20;
      }
    }

    // Dynamic sparks / dust
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // GAME OVER HANDLER
  private triggerGameOver(cause: 'drone' | 'lives') {
    this.isRunning = false;
    sounds.stopBGM();
    sounds.playGameOver();

    const distanceReached = this.player.score;
    const isHighScore = distanceReached > this.stats.highScore;

    this.callbacks.onGameOver({
      distance: distanceReached,
      coinsEarned: this.player.coinsCollected,
      highScoreBeat: isHighScore,
      cause,
    });
  }

  // RENDER TO CANVAS
  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // Screen Shake Offset
    if (this.shakeTimer > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Biome Parallax Background
    drawBiomeBackground(ctx, this.width, this.height, this.cameraX, this.biome);

    // 2. Camera Transform for World Objects
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // 3. Draw Buildings
    for (const building of this.buildings) {
      if (building.x + building.width > this.cameraX && building.x < this.cameraX + this.width + 50) {
        drawBuildingRooftop(ctx, building, this.biome);
      }
    }

    // 4. Draw Obstacles
    for (const obstacle of this.obstacles) {
      if (obstacle.x + obstacle.width > this.cameraX && obstacle.x < this.cameraX + this.width + 50) {
        drawObstacle(ctx, obstacle, this.biome);
      }
    }

    // 5. Draw Coins
    const timeSec = this.player.animTime;
    for (const coin of this.coins) {
      if (!coin.collected && coin.x > this.cameraX && coin.x < this.cameraX + this.width + 50) {
        drawCoin(ctx, coin, timeSec);
      }
    }

    // 6. Draw Projectiles
    for (const proj of this.projectiles) {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Draw Chasing Hunter Drone
    drawHunterDrone(ctx, this.drone, timeSec);

    // 8. Draw Player Pixel Runner
    drawPixelRunner(
      ctx,
      this.player.x,
      this.player.y + (this.player.isSliding ? 20 : 48),
      this.player.state,
      timeSec,
      this.stats.equippedSkin,
      this.player.invulnerableTimer > 0
    );

    // 9. Draw Dust & Sparks Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }

    ctx.restore(); // Restore camera translation

    // 10. Weather Particles (Screen space)
    ctx.fillStyle = this.biome.id === 'snow' ? '#ffffff' : this.biome.id === 'desert' ? '#fbbf24' : '#38bdf8';
    for (const wp of this.weatherParticles) {
      if (this.biome.particleType === 'rain') {
        ctx.fillRect(wp.x, wp.y, 1.5, wp.size * 4);
      } else {
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 11. Red Danger Perimeter Vignette when Drone is close (< 15m)
    if (this.drone.distance < 18) {
      const dangerIntensity = Math.min(0.65, (18 - this.drone.distance) / 18 * 0.7);
      const pulse = Math.sin(timeSec * 10) * 0.15 + 0.85;
      const alpha = dangerIntensity * pulse;

      const vignette = ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        this.height * 0.35,
        this.width / 2,
        this.height / 2,
        this.width * 0.7
      );
      vignette.addColorStop(0, 'rgba(239, 68, 68, 0)');
      vignette.addColorStop(1, `rgba(239, 68, 68, ${alpha})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore(); // Restore shake
  }
}
