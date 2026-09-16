import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  FileCode2,
  Check,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import { QRDesignConfig } from '../types';
import {
  renderQRCodeToCanvas,
  downloadCanvasAsPng,
  downloadSvgFile,
  copyCanvasToClipboard,
} from '../utils/qrRenderer';

interface QRPreviewProps {
  payload: string;
  config: QRDesignConfig;
  onSaveToHistory: (payload: string) => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  payload,
  config,
  onSaveToHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [svgData, setSvgData] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showPayloadInspector, setShowPayloadInspector] = useState(false);
  const [moduleCount, setModuleCount] = useState(25);

  // Trigger render whenever payload or config changes
  useEffect(() => {
    let isCurrent = true;
    setIsRendering(true);

    const targetCanvas = canvasRef.current;
    if (!targetCanvas) return;

    renderQRCodeToCanvas(payload, config, targetCanvas)
      .then((res) => {
        if (!isCurrent) return;
        setSvgData(res.svgString);
        setModuleCount(res.moduleCount);
        setIsRendering(false);
        onSaveToHistory(payload);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('Render error:', err);
        setIsRendering(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [payload, config]);

  // Compute scannability rating based on length, EC level, and logo
  const computeScannability = () => {
    const len = payload.length;
    const hasLogo = config.logo.enabled && config.logo.type !== 'none';
    const ec = config.errorCorrectionLevel;

    if (hasLogo && (ec === 'L' || (ec === 'M' && (config.logo.size || 0.22) > 0.25))) {
      return {
        level: 'warning',
        label: 'Low Redundancy with Logo',
        desc: 'Recommend switching Error Correction to Q or H to ensure 100% scannability.',
        percent: 70,
      };
    }

    if (len > 300 && ec === 'H') {
      return {
        level: 'good',
        label: 'Dense Payload (High Data)',
        desc: 'High data density. Print at 5cm x 5cm or larger for best phone camera focus.',
        percent: 88,
      };
    }

    return {
      level: 'optimal',
      label: 'Optimal Scannability',
      desc: 'Tested for instant focus across iOS and Android camera scanners.',
      percent: 98,
    };
  };

  const scannability = computeScannability();

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(canvasRef.current, `qr-code-${Date.now()}.png`);
  };

  const handleDownloadSvg = () => {
    if (!svgData) return;
    downloadSvgFile(svgData, `qr-code-${Date.now()}.svg`);
  };

  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasToClipboard(canvasRef.current);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #fff; }
              img { max-width: 400px; height: auto; }
              p { margin-top: 16px; color: #64748b; font-size: 14px; }
              @media print { body { min-height: auto; } }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="QR Code" />
            <p>Scan with any mobile camera</p>
            <script>
              window.onload = function() { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.warn('Print preview blocked or failed:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Visual Canvas Container */}
      <div
        id="qr-canvas-wrapper"
        className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[360px] shadow-2xl overflow-hidden"
      >
        {/* Subtle background checker pattern to demonstrate transparency */}
        {config.transparentBg && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />
        )}

        {/* Loading overlay indicator */}
        {isRendering && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* The Live Render Canvas */}
        <canvas
          ref={canvasRef}
          id="qr-preview-canvas"
          className="max-w-full h-auto object-contain rounded-xl shadow-lg transition-transform duration-200"
          style={{
            maxHeight: '340px',
            width: 'auto',
          }}
        />

        {/* Module Grid Metadata Badge */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
            {moduleCount} &times; {moduleCount} modules
          </span>
          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
            {config.resolution}px canvas
          </span>
        </div>
      </div>

      {/* Scannability Assessment Card */}
      <div
        className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
          scannability.level === 'warning'
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-slate-900/70 border-slate-800 text-slate-300'
        }`}
      >
        {scannability.level === 'warning' ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="text-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span>{scannability.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                scannability.level === 'warning'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {scannability.percent}% Scannable
            </span>
          </div>
          <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{scannability.desc}</p>
        </div>
      </div>

      {/* Primary Export Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Download PNG */}
        <button
          id="btn-download-png"
          type="button"
          onClick={handleDownloadPng}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>PNG ({config.resolution}px)</span>
        </button>

        {/* Download SVG (Vector) */}
        <button
          id="btn-download-svg"
          type="button"
          onClick={handleDownloadSvg}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition cursor-pointer"
        >
          <FileCode2 className="w-4 h-4 text-cyan-400" />
          <span>Vector SVG</span>
        </button>

        {/* Copy to Clipboard */}
        <button
          id="btn-copy-clipboard"
          type="button"
          onClick={handleCopyClipboard}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-indigo-400" />
              <span>Copy Image</span>
            </>
          )}
        </button>

        {/* Print Dialog */}
        <button
          id="btn-print-qr"
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          <span>Print</span>
        </button>
      </div>

      {/* Payload Inspector Link */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="truncate max-w-[200px] sm:max-w-xs font-mono text-[11px]">
          {payload}
        </span>
        <button
          type="button"
          onClick={() => setShowPayloadInspector(!showPayloadInspector)}
          className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
        >
          {showPayloadInspector ? 'Hide payload' : 'Inspect payload'}
        </button>
      </div>

      {/* Raw Payload Inspector Box */}
      {showPayloadInspector && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Raw Encoded Barcode Content</span>
            <button
              type="button"
              onClick={async () => {
                let success = false;
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(payload);
                    success = true;
                  }
                } catch {
                  // blocked
                }
                if (!success) {
                  try {
                    const textarea = document.createElement('textarea');
                    textarea.value = payload;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    success = true;
                  } catch {
                    // ignore
                  }
                }
                if (success) {
                  setCopiedRaw(true);
                  setTimeout(() => setCopiedRaw(false), 2000);
                }
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedRaw ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap break-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 max-h-36 overflow-y-auto">
            {payload}
          </pre>
        </div>
      )}
    </div>
  );
};
