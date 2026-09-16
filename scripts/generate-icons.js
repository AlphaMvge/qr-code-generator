import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines: width * 4 bytes + 1 filter byte per line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x / width, y / height, x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Pixel generator for QR icon
function qrIconPixel(u, v, x, y, size) {
  // Background: slate-900 (#0f172a to #1e293b gradient)
  const bgR = Math.round(15 + 15 * v);
  const bgG = Math.round(23 + 18 * v);
  const bgB = Math.round(42 + 25 * v);

  // Check if pixel is inside rounded rect of size
  const cornerRadius = size * 0.22;
  const dx = Math.abs(x - size / 2) - (size / 2 - cornerRadius);
  const dy = Math.abs(y - size / 2) - (size / 2 - cornerRadius);
  const dist = Math.sqrt(Math.max(0, dx) ** 2 + Math.max(0, dy) ** 2);
  if (dx > 0 && dy > 0 && dist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Draw QR patterns (scaled to 0..1)
  const px = u;
  const py = v;

  // Helper for boxes
  const inBox = (x1, y1, x2, y2) => px >= x1 && px <= x2 && py >= y1 && py <= y2;
  const inBorder = (x1, y1, x2, y2, t) => {
    return inBox(x1, y1, x2, y2) && !inBox(x1 + t, y1 + t, x2 - t, y2 - t);
  };

  const blue = [59, 130, 246, 255];
  const purple = [139, 92, 246, 255];
  const white = [255, 255, 255, 255];
  const cyan = [56, 189, 248, 255];

  // Top-left finder
  if (inBorder(0.18, 0.18, 0.40, 0.40, 0.045)) return blue;
  if (inBox(0.25, 0.25, 0.33, 0.33)) return white;

  // Top-right finder
  if (inBorder(0.60, 0.18, 0.82, 0.40, 0.045)) return purple;
  if (inBox(0.67, 0.25, 0.75, 0.33)) return white;

  // Bottom-left finder
  if (inBorder(0.18, 0.60, 0.40, 0.82, 0.045)) return purple;
  if (inBox(0.25, 0.67, 0.33, 0.75)) return white;

  // Center / data modules
  if (inBox(0.46, 0.18, 0.54, 0.26)) return cyan;
  if (inBox(0.46, 0.32, 0.54, 0.40)) return blue;
  if (inBox(0.18, 0.46, 0.26, 0.54)) return purple;
  if (inBox(0.32, 0.46, 0.40, 0.54)) return cyan;

  // Center logo accent
  const cdist = Math.sqrt((px - 0.5) ** 2 + (py - 0.5) ** 2);
  if (cdist < 0.065) return white;
  if (cdist < 0.10) return blue;

  // Additional data clusters
  if (inBox(0.60, 0.46, 0.68, 0.54)) return cyan;
  if (inBox(0.74, 0.46, 0.82, 0.54)) return purple;
  if (inBox(0.46, 0.60, 0.54, 0.68)) return blue;
  if (inBox(0.46, 0.74, 0.54, 0.82)) return cyan;

  if (inBox(0.60, 0.60, 0.68, 0.68)) return blue;
  if (inBox(0.74, 0.60, 0.82, 0.68)) return purple;
  if (inBox(0.60, 0.74, 0.68, 0.82)) return cyan;
  if (inBox(0.74, 0.74, 0.82, 0.82)) return white;

  return [bgR, bgG, bgB, 255];
}

// Generate files
fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, qrIconPixel));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, qrIconPixel));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, (u, v, x, y, s) => {
  // Maskable: full bleed without clipping outer edges
  const [r, g, b, a] = qrIconPixel(u * 0.7 + 0.15, v * 0.7 + 0.15, x, y, s);
  if (a === 0) return [15, 23, 42, 255];
  return [r, g, b, 255];
}));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, qrIconPixel));
fs.writeFileSync('public/favicon.ico', createPng(32, 32, qrIconPixel));

console.log('All icons generated successfully!');
