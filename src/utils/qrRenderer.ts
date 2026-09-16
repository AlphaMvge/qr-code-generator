import QRCode from 'qrcode';
import { QRDesignConfig, CornerSquareStyle, CornerDotStyle, DotStyle, FrameStyle } from '../types';

export interface RenderResult {
  canvas: HTMLCanvasElement;
  svgString: string;
  moduleCount: number;
}

// Check if a cell is in one of the three 7x7 finder patterns
export function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-left
  if (r < 7 && c < 7) return true;
  // Top-right
  if (r < 7 && c >= size - 7) return true;
  // Bottom-left
  if (r >= size - 7 && c < 7) return true;
  return false;
}

// Check if a cell is in the center area covered by logo
export function isLogoCovered(r: number, c: number, size: number, logoSizeRatio: number): boolean {
  const center = size / 2;
  const radius = Math.ceil((size * logoSizeRatio) / 2);
  return (
    r >= center - radius &&
    r < center + radius &&
    c >= center - radius &&
    c < center + radius
  );
}

// Draw a single dot module on canvas
function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  style: DotStyle
) {
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const r = cellSize * 0.46;

  ctx.beginPath();
  switch (style) {
    case 'dots': {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const radius = cellSize * 0.35;
      ctx.roundRect(x, y, cellSize, cellSize, radius);
      ctx.fill();
      break;
    }
    case 'diamond': {
      ctx.moveTo(cx, y + 1);
      ctx.lineTo(x + cellSize - 1, cy);
      ctx.lineTo(cx, y + cellSize - 1);
      ctx.lineTo(x + 1, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'star': {
      const inner = cellSize * 0.18;
      const outer = cellSize * 0.48;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.lineTo(
          cx + Math.cos(angle + Math.PI / 4) * inner,
          cy + Math.sin(angle + Math.PI / 4) * inner
        );
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'classy': {
      const rad = cellSize * 0.42;
      ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, [rad, 2, rad, 2]);
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      ctx.fillRect(x, y, cellSize + 0.2, cellSize + 0.2);
      break;
    }
  }
}

// Draw outer 7x7 corner eye
function drawCornerOuter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number, // 7 * cellSize
  cellSize: number,
  style: CornerSquareStyle
) {
  ctx.beginPath();
  const innerOffset = cellSize;
  const innerSize = size - 2 * cellSize;

  if (style === 'dot') {
    // Circle outer ring
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, false);
    ctx.arc(x + size / 2, y + size / 2, innerSize / 2, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
  } else if (style === 'extra-rounded') {
    const outerRadius = cellSize * 2;
    const innerRadius = cellSize * 1.2;
    ctx.roundRect(x, y, size, size, outerRadius);
    ctx.roundRect(x + innerOffset, y + innerOffset, innerSize, innerSize, innerRadius);
    ctx.fill('evenodd');
  } else {
    // Square
    ctx.rect(x, y, size, size);
    ctx.rect(x + innerOffset, y + innerOffset, innerSize, innerSize);
    ctx.fill('evenodd');
  }
}

// Draw inner 3x3 corner center eye
function drawCornerInner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number, // 3 * cellSize
  cellSize: number,
  style: CornerDotStyle
) {
  ctx.beginPath();
  if (style === 'dot') {
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const rad = cellSize * 0.3;
    ctx.roundRect(x, y, size, size, rad);
    ctx.fill();
  }
}

// Load image asynchronously helper
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin if not a data URL or blob URL to prevent tainting
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Main rendering function that outputs to an HTMLCanvasElement
 */
export async function renderQRCodeToCanvas(
  text: string,
  config: QRDesignConfig,
  targetCanvas?: HTMLCanvasElement,
  customResolution?: number
): Promise<RenderResult> {
  const canvas = targetCanvas || document.createElement('canvas');
  const resolution = customResolution || config.resolution || 1024;

  // 1. Generate QR matrix
  const qr = QRCode.create(text || 'https://google.com', {
    errorCorrectionLevel: config.errorCorrectionLevel,
  });

  const matrixSize = qr.modules.size;
  const marginCells = Math.max(0, config.margin);
  const totalCells = matrixSize + marginCells * 2;

  // Frame layout dimensions
  const hasFrame = config.frame.style !== 'none' && config.frame.text.trim().length > 0;
  let frameTopExtra = 0;
  let frameBottomExtra = 0;
  let frameSideExtra = 0;

  if (hasFrame) {
    if (config.frame.style === 'bottom-banner') {
      frameBottomExtra = resolution * 0.22;
      frameTopExtra = resolution * 0.04;
      frameSideExtra = resolution * 0.04;
    } else if (config.frame.style === 'top-header') {
      frameTopExtra = resolution * 0.22;
      frameBottomExtra = resolution * 0.04;
      frameSideExtra = resolution * 0.04;
    } else if (config.frame.style === 'polaroid') {
      frameBottomExtra = resolution * 0.28;
      frameTopExtra = resolution * 0.08;
      frameSideExtra = resolution * 0.08;
    } else if (config.frame.style === 'badge') {
      frameBottomExtra = resolution * 0.18;
      frameTopExtra = resolution * 0.06;
      frameSideExtra = resolution * 0.06;
    } else if (config.frame.style === 'minimal-border') {
      frameBottomExtra = resolution * 0.12;
      frameTopExtra = resolution * 0.04;
      frameSideExtra = resolution * 0.04;
    }
  }

  const canvasWidth = resolution + frameSideExtra * 2;
  const canvasHeight = resolution + frameTopExtra + frameBottomExtra;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot acquire canvas 2D context');

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw Frame Background
  if (hasFrame) {
    ctx.fillStyle = config.frame.frameColor || '#1e293b';
    if (config.frame.style === 'badge' || config.frame.style === 'bottom-banner') {
      ctx.roundRect(0, 0, canvasWidth, canvasHeight, resolution * 0.05);
      ctx.fill();
    } else if (config.frame.style === 'polaroid') {
      ctx.roundRect(0, 0, canvasWidth, canvasHeight, 16);
      ctx.fill();
    } else if (config.frame.style === 'minimal-border') {
      ctx.strokeStyle = config.frame.frameColor || '#38bdf8';
      ctx.lineWidth = Math.max(4, resolution * 0.015);
      ctx.roundRect(8, 8, canvasWidth - 16, canvasHeight - 16, 20);
      ctx.stroke();
    } else {
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  // 3. Draw QR Inner Canvas Area
  const qrStartX = frameSideExtra;
  const qrStartY = frameTopExtra;
  const qrSize = resolution;

  if (!config.transparentBg) {
    ctx.fillStyle = config.bgColor;
    if (hasFrame) {
      ctx.roundRect(qrStartX, qrStartY, qrSize, qrSize, resolution * 0.03);
      ctx.fill();
    } else {
      ctx.fillRect(qrStartX, qrStartY, qrSize, qrSize);
    }
  }

  const cellSize = qrSize / totalCells;
  const matrixStartX = qrStartX + marginCells * cellSize;
  const matrixStartY = qrStartY + marginCells * cellSize;

  // 4. Create Fill Style for QR body (Solid, Linear Gradient, or Radial Gradient)
  let bodyFillStyle: string | CanvasGradient = config.fgColor;

  if (config.gradientType === 'linear') {
    const angleRad = ((config.gradientAngle || 45) * Math.PI) / 180;
    const cx = qrStartX + qrSize / 2;
    const cy = qrStartY + qrSize / 2;
    const halfDiag = (qrSize / 2) * Math.SQRT2;
    const x1 = cx - Math.cos(angleRad) * halfDiag * 0.7;
    const y1 = cy - Math.sin(angleRad) * halfDiag * 0.7;
    const x2 = cx + Math.cos(angleRad) * halfDiag * 0.7;
    const y2 = cy + Math.sin(angleRad) * halfDiag * 0.7;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, config.fgColor);
    grad.addColorStop(1, config.fgColor2 || config.fgColor);
    bodyFillStyle = grad;
  } else if (config.gradientType === 'radial') {
    const cx = qrStartX + qrSize / 2;
    const cy = qrStartY + qrSize / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, qrSize * 0.7);
    grad.addColorStop(0, config.fgColor);
    grad.addColorStop(1, config.fgColor2 || config.fgColor);
    bodyFillStyle = grad;
  }

  ctx.fillStyle = bodyFillStyle;

  // 5. Draw QR Data Dots (skip 7x7 corner finder zones and logo center)
  const isLogoActive = config.logo.enabled && config.logo.type !== 'none';
  const logoRatio = config.logo.size || 0.22;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c, matrixSize)) continue;
      if (isLogoActive && isLogoCovered(r, c, matrixSize, logoRatio)) continue;

      const isDark = qr.modules.get(r, c);
      if (isDark) {
        const px = matrixStartX + c * cellSize;
        const py = matrixStartY + r * cellSize;
        drawDot(ctx, px, py, cellSize, config.dotStyle);
      }
    }
  }

  // 6. Draw Corner Eyes (Finder Patterns)
  const cornerPositions = [
    { r: 0, c: 0 }, // Top-Left
    { r: 0, c: matrixSize - 7 }, // Top-Right
    { r: matrixSize - 7, c: 0 }, // Bottom-Left
  ];

  const outerColor = config.customCornerColor
    ? config.cornerSquareColor
    : bodyFillStyle;
  const innerColor = config.customCornerColor
    ? config.cornerDotColor
    : bodyFillStyle;

  for (const pos of cornerPositions) {
    const ox = matrixStartX + pos.c * cellSize;
    const oy = matrixStartY + pos.r * cellSize;
    const outerDimension = 7 * cellSize;

    // Draw Outer 7x7
    ctx.fillStyle = outerColor;
    drawCornerOuter(
      ctx,
      ox,
      oy,
      outerDimension,
      cellSize,
      config.cornerSquareStyle
    );

    // Draw Inner 3x3 center
    ctx.fillStyle = innerColor;
    const ix = ox + 2 * cellSize;
    const iy = oy + 2 * cellSize;
    const innerDimension = 3 * cellSize;
    drawCornerInner(
      ctx,
      ix,
      iy,
      innerDimension,
      cellSize,
      config.cornerDotStyle
    );
  }

  // 7. Draw Center Logo (if enabled)
  if (isLogoActive) {
    try {
      let logoSource: string | null = null;
      if (config.logo.type === 'custom' && config.logo.customDataUrl) {
        logoSource = config.logo.customDataUrl;
      } else if (config.logo.type === 'preset' && config.logo.presetId) {
        // Find preset icon
        const { PRESET_ICONS, getSvgDataUrl } = await import('./presetIcons');
        const icon = PRESET_ICONS.find((i) => i.id === config.logo.presetId);
        if (icon) {
          logoSource = getSvgDataUrl(icon.svg, config.fgColor);
        }
      }

      if (logoSource) {
        const logoImg = await loadImage(logoSource);
        const logoPixelSize = qrSize * logoRatio;
        const logoCx = qrStartX + qrSize / 2;
        const logoCy = qrStartY + qrSize / 2;
        const logoX = logoCx - logoPixelSize / 2;
        const logoY = logoCy - logoPixelSize / 2;

        const pad = config.logo.padding !== undefined ? config.logo.padding : 6;
        const backdropRadius = config.logo.roundBackdrop
          ? (logoPixelSize + pad * 2) / 2
          : 8;

        // Draw backdrop behind logo to guarantee scannability
        ctx.fillStyle = config.logo.backdropColor || config.bgColor || '#ffffff';
        ctx.beginPath();
        if (config.logo.roundBackdrop) {
          ctx.arc(logoCx, logoCy, logoPixelSize / 2 + pad, 0, Math.PI * 2);
        } else {
          ctx.roundRect(
            logoX - pad,
            logoY - pad,
            logoPixelSize + pad * 2,
            logoPixelSize + pad * 2,
            backdropRadius
          );
        }
        ctx.fill();

        // Draw Logo Image
        ctx.drawImage(logoImg, logoX, logoY, logoPixelSize, logoPixelSize);
      }
    } catch (err) {
      console.warn('Failed to load/render logo on canvas:', err);
    }
  }

  // 8. Draw Frame Text (Call To Action)
  if (hasFrame) {
    ctx.fillStyle = config.frame.textColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = Math.max(16, Math.floor(resolution * 0.055));
    ctx.font = `700 ${fontSize}px ${config.frame.fontFamily || 'Plus Jakarta Sans, sans-serif'}`;

    let textY = canvasHeight - frameBottomExtra / 2;
    if (config.frame.style === 'top-header') {
      textY = frameTopExtra / 2;
    } else if (config.frame.style === 'badge') {
      textY = canvasHeight - frameBottomExtra / 2;
    } else if (config.frame.style === 'polaroid') {
      textY = canvasHeight - frameBottomExtra * 0.45;
      ctx.font = `600 ${fontSize * 0.9}px ${config.frame.fontFamily || 'Plus Jakarta Sans, sans-serif'}`;
    }

    ctx.fillText(config.frame.text.toUpperCase(), canvasWidth / 2, textY);
  }

  // 9. Generate SVG String for vector export
  const svgString = generateSvgString(qr, config, text, resolution);

  return {
    canvas,
    svgString,
    moduleCount: matrixSize,
  };
}

/**
 * Generate clean standalone vector SVG
 */
export function generateSvgString(
  qr: ReturnType<typeof QRCode.create>,
  config: QRDesignConfig,
  _text: string,
  resolution: number
): string {
  const matrixSize = qr.modules.size;
  const marginCells = Math.max(0, config.margin);
  const totalCells = matrixSize + marginCells * 2;
  const size = resolution;
  const cellSize = size / totalCells;
  const matrixOffset = marginCells * cellSize;

  let defs = '';
  let fillAttr = `fill="${config.fgColor}"`;

  if (config.gradientType === 'linear') {
    defs += `
    <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${config.fgColor}" />
      <stop offset="100%" stop-color="${config.fgColor2 || config.fgColor}" />
    </linearGradient>`;
    fillAttr = `fill="url(#qrGrad)"`;
  } else if (config.gradientType === 'radial') {
    defs += `
    <radialGradient id="qrGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${config.fgColor}" />
      <stop offset="100%" stop-color="${config.fgColor2 || config.fgColor}" />
    </radialGradient>`;
    fillAttr = `fill="url(#qrGrad)"`;
  }

  const bgRect = config.transparentBg
    ? ''
    : `<rect width="${size}" height="${size}" fill="${config.bgColor}" />`;

  let dotsSvg = '';
  const isLogoActive = config.logo.enabled && config.logo.type !== 'none';
  const logoRatio = config.logo.size || 0.22;

  // Build dots
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c, matrixSize)) continue;
      if (isLogoActive && isLogoCovered(r, c, matrixSize, logoRatio)) continue;

      if (qr.modules.get(r, c)) {
        const x = matrixOffset + c * cellSize;
        const y = matrixOffset + r * cellSize;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        if (config.dotStyle === 'dots') {
          dotsSvg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(cellSize * 0.44).toFixed(1)}" ${fillAttr} />\n`;
        } else if (config.dotStyle === 'rounded') {
          dotsSvg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" rx="${(cellSize * 0.35).toFixed(1)}" ${fillAttr} />\n`;
        } else if (config.dotStyle === 'diamond') {
          dotsSvg += `<polygon points="${cx.toFixed(1)},${y.toFixed(1)} ${(x + cellSize).toFixed(1)},${cy.toFixed(1)} ${cx.toFixed(1)},${(y + cellSize).toFixed(1)} ${x.toFixed(1)},${cy.toFixed(1)}" ${fillAttr} />\n`;
        } else {
          dotsSvg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" ${fillAttr} />\n`;
        }
      }
    }
  }

  // Build finder patterns
  const cornerFill = config.customCornerColor
    ? config.cornerSquareColor
    : config.fgColor;
  const innerCornerFill = config.customCornerColor
    ? config.cornerDotColor
    : config.fgColor;

  const cornerPositions = [
    { r: 0, c: 0 },
    { r: 0, c: matrixSize - 7 },
    { r: matrixSize - 7, c: 0 },
  ];

  let cornersSvg = '';
  for (const pos of cornerPositions) {
    const x = matrixOffset + pos.c * cellSize;
    const y = matrixOffset + pos.r * cellSize;
    const outerDim = 7 * cellSize;
    const innerDim = 3 * cellSize;
    const innerX = x + 2 * cellSize;
    const innerY = y + 2 * cellSize;

    if (config.cornerSquareStyle === 'dot') {
      cornersSvg += `
      <circle cx="${(x + outerDim / 2).toFixed(1)}" cy="${(y + outerDim / 2).toFixed(1)}" r="${(outerDim / 2).toFixed(1)}" fill="none" stroke="${cornerFill}" stroke-width="${cellSize.toFixed(1)}" />`;
    } else {
      const rx = config.cornerSquareStyle === 'extra-rounded' ? (cellSize * 1.8).toFixed(1) : '0';
      cornersSvg += `
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${outerDim.toFixed(1)}" height="${outerDim.toFixed(1)}" rx="${rx}" fill="none" stroke="${cornerFill}" stroke-width="${cellSize.toFixed(1)}" />`;
    }

    if (config.cornerDotStyle === 'dot') {
      cornersSvg += `
      <circle cx="${(innerX + innerDim / 2).toFixed(1)}" cy="${(innerY + innerDim / 2).toFixed(1)}" r="${(innerDim / 2).toFixed(1)}" fill="${innerCornerFill}" />`;
    } else {
      cornersSvg += `
      <rect x="${innerX.toFixed(1)}" y="${innerY.toFixed(1)}" width="${innerDim.toFixed(1)}" height="${innerDim.toFixed(1)}" rx="${(cellSize * 0.3).toFixed(1)}" fill="${innerCornerFill}" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>${defs}</defs>
  ${bgRect}
  <g id="qr-modules">
    ${dotsSvg}
  </g>
  <g id="qr-corners">
    ${cornersSvg}
  </g>
</svg>`;
}

/**
 * Downloads a canvas as PNG with fallback if canvas is tainted or toDataURL restricted
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename = 'qrcode.png') {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.warn('Direct toDataURL failed, attempting toBlob fallback:', err);
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, 'image/png');
    } catch (innerErr) {
      console.error('Failed to export canvas as PNG:', innerErr);
    }
  }
}

/**
 * Downloads text as SVG file
 */
export function downloadSvgFile(svgContent: string, filename = 'qrcode.svg') {
  try {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Failed to export SVG file:', err);
  }
}

/**
 * Copies canvas image to clipboard with safe exception handling
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      return false;
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(resolve, 'image/png');
      } catch {
        resolve(null);
      }
    });
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed (insecure/blocked context):', err);
    return false;
  }
}
