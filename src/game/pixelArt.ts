import { DroneState, Obstacle, Coin, Building } from '../types/game';
import { BiomeConfig, SKINS } from './catalog';

/**
 * Pixel Art Graphics & Procedural Sprite Rendering Engine
 */

export function drawPixelRunner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: 'run' | 'jump' | 'slide' | 'stumble' | 'fall',
  frame: number,
  skinId: string,
  isInvulnerable: boolean
) {
  if (isInvulnerable && Math.floor(frame * 10) % 2 === 0) {
    return; // Flash effect during invulnerability
  }

  const skin = SKINS.find((s) => s.id === skinId) || SKINS[0];
  const c = skin.colors;

  ctx.save();
  ctx.translate(x, y);

  // Pixel scale factor
  const p = 3; // 3px per "pixel" for chunky authentic arcade look

  if (state === 'slide') {
    // Low-profile sliding pose: 44px wide x 22px high
    // Head & Bandana (Front/Right)
    ctx.fillStyle = c.skin;
    ctx.fillRect(8 * p, -4 * p, 4 * p, 3 * p);
    ctx.fillStyle = c.hair;
    ctx.fillRect(7 * p, -5 * p, 3 * p, 2 * p);
    ctx.fillStyle = c.bandana;
    ctx.fillRect(7 * p, -3 * p, 6 * p, 1.5 * p);

    // Bandana trailing cloth blowing back
    const scarfOffset = Math.sin(frame * 15) * 2;
    ctx.fillRect(2 * p, -3 * p + scarfOffset, 5 * p, 1.5 * p);

    // Torso (Leaning flat)
    ctx.fillStyle = c.primary;
    ctx.fillRect(2 * p, -2 * p, 8 * p, 3 * p);

    // Legs (Stretched forward and back)
    ctx.fillStyle = c.secondary;
    ctx.fillRect(-3 * p, -1 * p, 6 * p, 2 * p);
    ctx.fillRect(9 * p, -1 * p, 5 * p, 2 * p);

    // Shoes
    ctx.fillStyle = c.accent;
    ctx.fillRect(13 * p, -1 * p, 3 * p, 2.5 * p);
    ctx.fillRect(-5 * p, -1 * p, 3 * p, 2.5 * p);

    // Friction ground sparks
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(4 * p, 1 * p, 2 * p, 1 * p);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-2 * p + (frame % 4) * 2, 1 * p, 2 * p, 1 * p);
  } else if (state === 'jump') {
    // Jump pose: Legs tucked up, arms back
    // Bandana flutter
    ctx.fillStyle = c.bandana;
    ctx.fillRect(-3 * p, -15 * p, 3 * p, 2 * p);
    ctx.fillRect(-5 * p, -14 * p, 2 * p, 1.5 * p);

    // Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(0, -16 * p, 5 * p, 5 * p);
    // Hair
    ctx.fillStyle = c.hair;
    ctx.fillRect(-1 * p, -18 * p, 6 * p, 3 * p);
    ctx.fillRect(4 * p, -16 * p, 2 * p, 2 * p);
    // Bandana wrap
    ctx.fillStyle = c.bandana;
    ctx.fillRect(-1 * p, -15 * p, 7 * p, 1.5 * p);
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3 * p, -14 * p, 1 * p, 1.5 * p);

    // Torso
    ctx.fillStyle = c.primary;
    ctx.fillRect(-1 * p, -11 * p, 6 * p, 6 * p);

    // Tucked Legs
    ctx.fillStyle = c.secondary;
    ctx.fillRect(-2 * p, -5 * p, 4 * p, 3 * p);
    ctx.fillRect(2 * p, -4 * p, 4 * p, 3 * p);

    // Shoes
    ctx.fillStyle = c.accent;
    ctx.fillRect(-3 * p, -2 * p, 3 * p, 2 * p);
    ctx.fillRect(4 * p, -1 * p, 3 * p, 2 * p);

    // Jump thrust wind / cape trail
    if (skin.trailEffect === 'golden') {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.fillRect(-6 * p, -8 * p, 3 * p, 3 * p);
    }
  } else if (state === 'stumble') {
    // Stumble / Hit pose: Reeling backwards, flashing red
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2 * p, -17 * p, 6 * p, 17 * p);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -15 * p, 3 * p, 3 * p);
  } else {
    // Running cycle (6 frames cycle)
    const runFrame = Math.floor(frame * 12) % 6;
    const bounce = [0, -1, -2, 0, -1, -2][runFrame];

    // Bandana trailing
    const bandanaWave = Math.sin(frame * 20) * 2;
    ctx.fillStyle = c.bandana;
    ctx.fillRect(-4 * p, -15 * p + bounce + bandanaWave, 4 * p, 1.8 * p);
    ctx.fillRect(-6 * p, -14 * p + bounce + bandanaWave * 1.5, 3 * p, 1.2 * p);

    // Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(0, -16 * p + bounce, 5 * p, 5 * p);
    // Hair
    ctx.fillStyle = c.hair;
    ctx.fillRect(-1 * p, -18 * p + bounce, 6 * p, 3 * p);
    ctx.fillRect(4 * p, -16 * p + bounce, 2 * p, 2 * p);
    // Bandana front
    ctx.fillStyle = c.bandana;
    ctx.fillRect(-1 * p, -15 * p + bounce, 7 * p, 1.5 * p);
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3 * p, -14 * p + bounce, 1 * p, 1.5 * p);

    // Torso / Jacket
    ctx.fillStyle = c.primary;
    ctx.fillRect(-1 * p, -11 * p + bounce, 6 * p, 6 * p);

    // Running legs (alternating forward/backward)
    ctx.fillStyle = c.secondary;
    if (runFrame === 0 || runFrame === 3) {
      // Mid stride
      ctx.fillRect(-1 * p, -5 * p, 3 * p, 4 * p);
      ctx.fillRect(2 * p, -5 * p, 3 * p, 4 * p);
      ctx.fillStyle = c.accent;
      ctx.fillRect(-1 * p, -1 * p, 3 * p, 2 * p);
      ctx.fillRect(2 * p, -1 * p, 3 * p, 2 * p);
    } else if (runFrame === 1 || runFrame === 2) {
      // Leg A forward, Leg B back
      ctx.fillRect(3 * p, -5 * p, 3 * p, 4 * p);
      ctx.fillRect(-4 * p, -4 * p, 3 * p, 3 * p);
      ctx.fillStyle = c.accent;
      ctx.fillRect(4 * p, -1 * p, 3 * p, 2 * p);
      ctx.fillRect(-5 * p, -1 * p, 3 * p, 2 * p);
    } else {
      // Leg B forward, Leg A back
      ctx.fillRect(-3 * p, -5 * p, 3 * p, 4 * p);
      ctx.fillRect(3 * p, -4 * p, 3 * p, 3 * p);
      ctx.fillStyle = c.accent;
      ctx.fillRect(-3 * p, -1 * p, 3 * p, 2 * p);
      ctx.fillRect(4 * p, -1 * p, 3 * p, 2 * p);
    }

    // Arm swinging
    ctx.fillStyle = c.primary;
    const armOffset = Math.sin(frame * 12) * 3;
    ctx.fillRect(-3 * p + armOffset, -9 * p + bounce, 2.5 * p, 4 * p);
  }

  // Draw special skin trails
  if (skin.trailEffect === 'neon') {
    ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.fillRect(-6 * p, -12 * p, 4 * p, 4 * p);
  } else if (skin.trailEffect === 'frost') {
    ctx.fillStyle = 'rgba(165, 243, 252, 0.5)';
    ctx.fillRect(-5 * p, -6 * p, 3 * p, 3 * p);
  } else if (skin.trailEffect === 'golden') {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.fillRect(-7 * p, -10 * p, 4 * p, 4 * p);
  }

  ctx.restore();
}

/**
 * Draw Hunter Flying Drone (The chaser robot)
 */
export function drawHunterDrone(
  ctx: CanvasRenderingContext2D,
  drone: DroneState,
  time: number
) {
  ctx.save();
  ctx.translate(drone.x, drone.y);

  const p = 3;
  const isCritical = drone.distance < 15;

  // Searchlight beam projecting forward and down towards the runner
  const beamAngle = 0.35;
  const beamLength = 480;
  const beamWidth = 140;

  const beamGradient = ctx.createRadialGradient(0, 0, 10, Math.cos(beamAngle) * beamLength, Math.sin(beamAngle) * beamLength, beamWidth);
  if (isCritical) {
    beamGradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    beamGradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.15)');
    beamGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
  } else {
    beamGradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    beamGradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.1)');
    beamGradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
  }

  ctx.beginPath();
  ctx.moveTo(8 * p, 2 * p);
  ctx.lineTo(8 * p + Math.cos(beamAngle - 0.2) * beamLength, 2 * p + Math.sin(beamAngle - 0.2) * beamLength);
  ctx.lineTo(8 * p + Math.cos(beamAngle + 0.2) * beamLength, 2 * p + Math.sin(beamAngle + 0.2) * beamLength);
  ctx.closePath();
  ctx.fillStyle = beamGradient;
  ctx.fill();

  // If stunned, draw crackling EMP arcs
  if (drone.isStunned) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const ox = (Math.random() - 0.5) * 40;
      const oy = (Math.random() - 0.5) * 30;
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + (Math.random() - 0.5) * 25, oy + (Math.random() - 0.5) * 25);
      ctx.stroke();
    }
  }

  // Thruster jet fire (Twin engines at the back)
  const jetFlicker = Math.random() * 4;
  ctx.fillStyle = isCritical ? '#ef4444' : '#06b6d4';
  ctx.fillRect(-14 * p - jetFlicker, -5 * p, 6 * p + jetFlicker, 3 * p);
  ctx.fillRect(-14 * p - jetFlicker, 3 * p, 6 * p + jetFlicker, 3 * p);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-11 * p, -4 * p, 3 * p, 1.5 * p);
  ctx.fillRect(-11 * p, 4 * p, 3 * p, 1.5 * p);

  // Drone Main Metallic Armor Hull
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-8 * p, -6 * p, 16 * p, 12 * p);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-6 * p, -5 * p, 12 * p, 10 * p);
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4 * p, -4 * p, 8 * p, 8 * p);

  // Top Rotors / Antennas
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-2 * p, -9 * p, 4 * p, 3 * p);
  // Spinning rotor blades
  const rotorSpan = Math.cos(drone.propellerAngle) * 14 * p;
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-2 * p + rotorSpan / 2, -10 * p, Math.abs(rotorSpan), 1.5 * p);

  // Glowing Hunter Eye / Visor (Ominous cyclops eye)
  ctx.fillStyle = '#090d16';
  ctx.fillRect(4 * p, -3 * p, 5 * p, 6 * p);

  const eyePulse = Math.sin(time * 8) * 0.3 + 0.7;
  ctx.fillStyle = isCritical
    ? `rgba(239, 68, 68, ${eyePulse})`
    : `rgba(244, 63, 94, ${eyePulse})`;
  ctx.fillRect(5 * p, -2 * p, 3 * p, 4 * p);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6 * p, -1 * p, 1.5 * p, 2 * p);

  // Bottom Mechanical Capture Claws
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-3 * p, 6 * p, 2 * p, 4 * p);
  ctx.fillRect(3 * p, 6 * p, 2 * p, 4 * p);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-4 * p, 9 * p, 3 * p, 2 * p);
  ctx.fillRect(3 * p, 9 * p, 3 * p, 2 * p);

  ctx.restore();
}

/**
 * Draw Rooftop Obstacles
 */
export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  biome: BiomeConfig
) {
  const p = 3;
  ctx.save();

  if (obstacle.type === 'pipe_low') {
    // Overhead industrial steam/gas pipe (Must slide under)
    ctx.fillStyle = '#334155';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Hazard yellow/black diagonal warning stripes
    ctx.fillStyle = '#eab308';
    for (let x = obstacle.x; x < obstacle.x + obstacle.width; x += 12) {
      ctx.fillRect(x, obstacle.y + 2, 6, obstacle.height - 4);
    }
    // High voltage neon warning beacon
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(obstacle.x + obstacle.width / 2 - 4, obstacle.y - 4, 8, 4);

    // Steam puffing downwards occasionally
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(obstacle.x + 8, obstacle.y + obstacle.height, 10, 8);
  } else if (obstacle.type === 'laser_beam') {
    // Laser security tripwire beam (Must slide under)
    // Left & Right emitter posts
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(obstacle.x - 4, obstacle.y - 6, 8, obstacle.height + 12);
    ctx.fillRect(obstacle.x + obstacle.width - 4, obstacle.y - 6, 8, obstacle.height + 12);

    // Pulsing laser beam
    const glow = Math.sin(Date.now() / 100) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(239, 68, 68, ${glow})`;
    ctx.fillRect(obstacle.x, obstacle.y + 4, obstacle.width, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, 2);
  } else if (obstacle.type === 'billboard_high') {
    // Low hanging neon sign / billboard (Must slide under)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    // Glowing neon border
    ctx.strokeStyle = biome.buildingTrimColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
    // Neon text bars
    ctx.fillStyle = biome.accentColor;
    ctx.fillRect(obstacle.x + 8, obstacle.y + 6, obstacle.width - 16, 4);
    ctx.fillRect(obstacle.x + 14, obstacle.y + 14, obstacle.width - 28, 4);
  } else if (obstacle.type === 'vent') {
    // Ground HVAC AC Vent Unit (Must jump over)
    ctx.fillStyle = '#475569';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.fillStyle = '#334155';
    ctx.fillRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, obstacle.height - 8);

    // Louver slats / vent grill
    ctx.fillStyle = '#1e293b';
    for (let y = obstacle.y + 6; y < obstacle.y + obstacle.height - 4; y += 6) {
      ctx.fillRect(obstacle.x + 6, y, obstacle.width - 12, 3);
    }
    // Top warning beacon
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(obstacle.x + 6, obstacle.y - 3, 6, 3);
  } else {
    // Antenna / Spire on roof (Must jump over)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(obstacle.x + obstacle.width / 2 - 3, obstacle.y, 6, obstacle.height);
    // Crossbars
    ctx.fillRect(obstacle.x + 2, obstacle.y + 8, obstacle.width - 4, 3);
    ctx.fillRect(obstacle.x + 5, obstacle.y + 18, obstacle.width - 10, 3);
    // Red blinking tip
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(obstacle.x + obstacle.width / 2 - 4, obstacle.y - 4, 8, 4);
  }

  ctx.restore();
}

/**
 * Draw Spinning Pixel Coin
 */
export function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: Coin,
  time: number
) {
  if (coin.collected) return;

  ctx.save();
  ctx.translate(coin.x, coin.y);

  // 3D spin compression factor
  const spin = Math.cos(time * 5 + coin.frame);
  const widthScale = Math.abs(spin);
  const p = 2.5;

  const r = coin.radius;
  const w = Math.max(3, r * widthScale);

  // Outer Gold Rim
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(0, 0, w, r, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main Gold Face
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(2, w - 2 * p), r - 2 * p, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shiny Inner Sparkle / Emboss
  if (widthScale > 0.4) {
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-w / 4, -r / 3, w / 2, (r * 2) / 3);
  }

  ctx.restore();
}

/**
 * Draw Rooftop Building
 */
export function drawBuildingRooftop(
  ctx: CanvasRenderingContext2D,
  building: Building,
  biome: BiomeConfig
) {
  ctx.save();

  // Main Building Structure
  ctx.fillStyle = building.color;
  ctx.fillRect(building.x, building.y, building.width, building.height);

  // Decorative Rooftop Coping / Trim (Parapet)
  ctx.fillStyle = building.trimColor;
  ctx.fillRect(building.x - 2, building.y, building.width + 4, 8);

  // Lower Trim Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(building.x, building.y + 8, building.width, 4);

  // Architectural Facade Grid / Windows
  const windowCols = Math.floor((building.width - 24) / 28);
  const windowRows = Math.floor((building.height - 30) / 36);

  for (let c = 0; c < windowCols; c++) {
    for (let r = 0; r < windowRows; r++) {
      const wx = building.x + 14 + c * 28;
      const wy = building.y + 24 + r * 36;

      // Seeded window light state
      const hash = (building.x * 13 + c * 17 + r * 23 + building.windowPattern) % 100;
      if (hash > 45) {
        const colorIdx = hash % biome.windowColors.length;
        ctx.fillStyle = biome.windowColors[colorIdx];
        ctx.fillRect(wx, wy, 16, 20);
        // Window mullion
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(wx + 7, wy, 2, 20);
        ctx.fillRect(wx, wy + 9, 16, 2);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(wx, wy, 16, 20);
      }
    }
  }

  // Water Tower feature
  if (building.hasWaterTower) {
    const twX = building.x + building.width - 55;
    const twY = building.y - 36;
    // Wooden / metal legs
    ctx.fillStyle = '#475569';
    ctx.fillRect(twX + 4, twY + 16, 4, 20);
    ctx.fillRect(twX + 28, twY + 16, 4, 20);
    // Tank
    ctx.fillStyle = '#78350f';
    ctx.fillRect(twX, twY, 36, 18);
    // Conical roof
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(twX - 2, twY);
    ctx.lineTo(twX + 18, twY - 12);
    ctx.lineTo(twX + 38, twY);
    ctx.closePath();
    ctx.fill();
  }

  // Antenna feature
  if (building.hasAntenna) {
    const anX = building.x + 20;
    const anY = building.y - 28;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(anX, anY, 3, 28);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(anX - 2, anY - 3, 7, 3);
  }

  // Biome specific rooftop topping
  if (biome.id === 'snow') {
    // Snow layer atop the roof
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(building.x - 2, building.y - 3, building.width + 4, 4);
    // Snow clumps dripping
    for (let s = 10; s < building.width - 10; s += 24) {
      ctx.fillRect(building.x + s, building.y + 1, 6, 4);
    }
  } else if (biome.id === 'desert') {
    // Sand drift dusting
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.fillRect(building.x, building.y, building.width, 3);
  }

  ctx.restore();
}

/**
 * Draw Biome Parallax Background
 */
export function drawBiomeBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number,
  biome: BiomeConfig
) {
  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, biome.skyGradient[0]);
  skyGrad.addColorStop(0.5, biome.skyGradient[1]);
  skyGrad.addColorStop(1, biome.skyGradient[2]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Far Skyline / Mountain Silhouette (Scroll 0.08x)
  const farOffset = (cameraX * 0.08) % 360;
  ctx.fillStyle = biome.cityColor;
  for (let x = -360; x < width + 360; x += 60) {
    const rx = x - farOffset;
    const h = 180 + Math.sin(x * 0.05) * 50;
    ctx.fillRect(rx, height - h, 54, h);
    // Spire
    ctx.fillRect(rx + 24, height - h - 30, 6, 30);
  }

  // 3. Mid-Distance Skyscrapers & Neon Grids (Scroll 0.22x)
  const midOffset = (cameraX * 0.22) % 480;
  ctx.fillStyle = biome.midColor;
  for (let x = -480; x < width + 480; x += 90) {
    const rx = x - midOffset;
    const h = 240 + Math.cos(x * 0.04) * 80;
    ctx.fillRect(rx, height - h, 82, h);

    // Tiny distant glowing windows
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let wy = height - h + 20; wy < height - 60; wy += 28) {
      ctx.fillRect(rx + 15, wy, 8, 12);
      ctx.fillRect(rx + 35, wy, 8, 12);
      ctx.fillRect(rx + 55, wy, 8, 12);
    }
    ctx.fillStyle = biome.midColor; // reset
  }

  // 4. Aurora or Sunset Glow Line
  if (biome.id === 'snow') {
    // Frosty Aurora Veil in the upper sky
    const auroraGrad = ctx.createLinearGradient(0, 20, 0, 160);
    auroraGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    auroraGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.18)');
    auroraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = auroraGrad;
    ctx.fillRect(0, 20, width, 140);
  } else if (biome.id === 'desert') {
    // Giant desert crimson sun
    const sunX = width * 0.75;
    const sunY = height * 0.35;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
    sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    sunGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
    sunGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
    ctx.fill();
  }
}
