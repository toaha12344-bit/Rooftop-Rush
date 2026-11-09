import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator without external dependencies
function createPNG(width, height, getPixel) {
  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function writeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // Raw image data: filter byte (0) + width * 4 per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // No interlace
  const ihdrChunk = writeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = writeChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Pixel generator for Rooftop Rush Cyber-Arcade Icon
function renderIconPixel(x, y, w, h, isMaskable) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);

  // Maskable keeps solid bleed to edges; standard has rounded corner
  if (!isMaskable && dist > 0.49) {
    return [0, 0, 0, 0]; // transparent outside circle/squircle
  }

  // Sky Gradient: Midnight to Cyber Purple
  let r = Math.floor(9 + ny * 35);
  let g = Math.floor(9 + ny * 15);
  let b = Math.floor(21 + ny * 65);

  // Neon Cyan Grid / Border Ring
  if (dist > 0.44 && dist < 0.47) {
    return [0, 240, 255, 255];
  }

  // Rooftop Silhouette in lower third
  if (ny > 0.68) {
    if (ny < 0.71) {
      // Neon trim parapet
      return [0, 240, 255, 255];
    }
    // Building body
    r = 26;
    g = 27;
    b = 46;

    // Glowing windows
    const wx = Math.floor(nx * 10);
    const wy = Math.floor(ny * 12);
    if ((wx + wy) % 2 === 0 && nx > 0.2 && nx < 0.8) {
      return [255, 0, 127, 240];
    }
    return [r, g, b, 255];
  }

  // Hunter Drone Eye in upper left
  const droneDist = Math.sqrt((nx - 0.3) ** 2 + (ny - 0.35) ** 2);
  if (droneDist < 0.1) {
    if (droneDist < 0.04) {
      return [239, 68, 68, 255]; // Red warning eye
    }
    return [30, 41, 59, 255]; // Drone chassis
  }

  // Runner in center jump
  const runX = Math.abs(nx - 0.55);
  const runY = Math.abs(ny - 0.52);
  if (runX < 0.12 && runY < 0.16) {
    if (ny < 0.44) {
      return [220, 38, 38, 255]; // Red bandana
    } else if (ny < 0.49) {
      return [252, 211, 77, 255]; // Face skin
    } else if (ny < 0.58) {
      return [37, 99, 235, 255]; // Blue runner jacket
    } else {
      return [239, 68, 68, 255]; // Red high-grip shoes
    }
  }

  // Big Gold Coin in right air
  const coinDist = Math.sqrt((nx - 0.75) ** 2 + (ny - 0.42) ** 2);
  if (coinDist < 0.08) {
    if (coinDist < 0.065) {
      return [251, 191, 36, 255]; // Gold core
    }
    return [217, 119, 6, 255]; // Gold rim
  }

  return [r, g, b, 255];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate all standard PWA assets
console.log('Generating PWA icons...');

const png192 = createPNG(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), png192);

const png512 = createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), png512);

const pngMaskable = createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), pngMaskable);

const appleTouch = createPNG(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouch);

// Also create favicon.ico from 32x32 PNG
const png32 = createPNG(32, 32, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), png32);

console.log('All PWA assets successfully generated in /public!');
