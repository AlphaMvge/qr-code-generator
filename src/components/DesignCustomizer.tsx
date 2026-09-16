import React, { useState } from 'react';
import {
  Palette,
  Shapes,
  Image as ImageIcon,
  LayoutTemplate,
  Sliders,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  QRDesignConfig,
  DotStyle,
  CornerSquareStyle,
  CornerDotStyle,
  GradientType,
  FrameStyle,
  ErrorCorrectionLevel,
} from '../types';
import { PRESET_ICONS } from '../utils/presetIcons';

interface DesignCustomizerProps {
  config: QRDesignConfig;
  onChange: (updater: (prev: QRDesignConfig) => QRDesignConfig) => void;
  onReset: () => void;
}

type TabType = 'colors' | 'shapes' | 'logo' | 'frame' | 'quality';

const COLOR_SWATCHES = [
  '#000000', // Classic Black
  '#0f172a', // Deep Slate
  '#1e3a8a', // Dark Navy
  '#2563eb', // Vivid Blue
  '#0284c7', // Sky Blue
  '#0d9488', // Teal
  '#059669', // Emerald
  '#7c3aed', // Royal Violet
  '#c026d3', // Fuchsia
  '#e11d48', // Crimson Rose
  '#ea580c', // Sunset Orange
  '#ffffff', // White
];

export const DesignCustomizer: React.FC<DesignCustomizerProps> = ({
  config,
  onChange,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('colors');

  const updateConfig = (partial: Partial<QRDesignConfig>) => {
    onChange((prev) => ({ ...prev, ...partial }));
  };

  const updateLogo = (partial: Partial<QRDesignConfig['logo']>) => {
    onChange((prev) => ({
      ...prev,
      logo: { ...prev.logo, ...partial },
    }));
  };

  const updateFrame = (partial: Partial<QRDesignConfig['frame']>) => {
    onChange((prev) => ({
      ...prev,
      frame: { ...prev.frame, ...partial },
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange((prev) => ({
          ...prev,
          logo: {
            ...prev.logo,
            enabled: true,
            type: 'custom',
            customDataUrl: reader.result as string,
          },
          // Elevate error correction to Q or H when logo added
          errorCorrectionLevel:
            prev.errorCorrectionLevel === 'L' || prev.errorCorrectionLevel === 'M'
              ? 'Q'
              : prev.errorCorrectionLevel,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'shapes', label: 'Shapes & Eyes', icon: Shapes },
            { id: 'logo', label: 'Center Logo', icon: ImageIcon },
            { id: 'frame', label: 'Frame & CTA', icon: LayoutTemplate },
            { id: 'quality', label: 'Settings', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-design-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          id="btn-reset-style"
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition cursor-pointer"
          title="Reset to default theme"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* TAB CONTENT: COLORS & GRADIENTS */}
      {activeTab === 'colors' && (
        <div className="space-y-5 text-xs sm:text-sm">
          {/* Foreground & Gradient */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">Foreground Color & Style</label>
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
                {(['none', 'linear', 'radial'] as GradientType[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateConfig({ gradientType: g })}
                    className={`px-2.5 py-1 rounded-md capitalize transition ${
                      config.gradientType === g
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g === 'none' ? 'Solid' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary color picker & swatches */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <input
                  type="color"
                  value={config.fgColor}
                  onChange={(e) => updateConfig({ fgColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) => updateConfig({ fgColor: e.target.value })}
                  className="w-20 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                />
              </div>

              {config.gradientType !== 'none' && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-xs text-slate-400">To:</span>
                  <input
                    type="color"
                    value={config.fgColor2}
                    onChange={(e) => updateConfig({ fgColor2: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.fgColor2}
                    onChange={(e) => updateConfig({ fgColor2: e.target.value })}
                    className="w-20 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                  />
                </div>
              )}
            </div>

            {/* Linear gradient angle slider */}
            {config.gradientType === 'linear' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Gradient Angle</span>
                  <span>{config.gradientAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={config.gradientAngle}
                  onChange={(e) => updateConfig({ gradientAngle: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* Quick swatches */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateConfig({ fgColor: color })}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-md border transition cursor-pointer ${
                    config.fgColor.toLowerCase() === color.toLowerCase()
                      ? 'border-indigo-400 ring-2 ring-indigo-500/40 scale-110'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Background Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">Background Color</label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.transparentBg}
                  onChange={(e) => updateConfig({ transparentBg: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Transparent</span>
              </label>
            </div>

            {!config.transparentBg && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => updateConfig({ bgColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) => updateConfig({ bgColor: e.target.value })}
                    className="w-20 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                  />
                </div>
                <div className="flex gap-1.5">
                  {['#ffffff', '#f8fafc', '#0f172a', '#020617'].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => updateConfig({ bgColor: bg })}
                      style={{ backgroundColor: bg }}
                      className={`w-6 h-6 rounded-md border ${
                        config.bgColor.toLowerCase() === bg.toLowerCase()
                          ? 'border-indigo-400 ring-2 ring-indigo-500/40'
                          : 'border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Custom Corner (Finder) Colors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-200 block">Custom Corner Eye Colors</label>
                <span className="text-xs text-slate-400">Separate colors for outer ring & inner pupil</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.customCornerColor}
                  onChange={(e) => updateConfig({ customCornerColor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {config.customCornerColor && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1">
                  <span className="text-xs text-slate-400 block">Outer Frame (7x7)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.cornerSquareColor}
                      onChange={(e) => updateConfig({ cornerSquareColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white uppercase">{config.cornerSquareColor}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1">
                  <span className="text-xs text-slate-400 block">Inner Pupil (3x3)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.cornerDotColor}
                      onChange={(e) => updateConfig({ cornerDotColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white uppercase">{config.cornerDotColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHAPES & EYES */}
      {activeTab === 'shapes' && (
        <div className="space-y-5 text-xs sm:text-sm">
          {/* Dot / Module Pattern */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Body Dot Pattern</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'square', label: 'Classic Square' },
                { id: 'rounded', label: 'Soft Rounded' },
                { id: 'dots', label: 'Circular Dots' },
                { id: 'classy', label: 'Classy Pill' },
                { id: 'diamond', label: 'Diamond' },
                { id: 'star', label: 'Sparkle Star' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  id={`btn-dot-style-${style.id}`}
                  onClick={() => updateConfig({ dotStyle: style.id as DotStyle })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition cursor-pointer ${
                    config.dotStyle === style.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Corner Outer Ring Shape */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Outer Finder Pattern Shape (7x7)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'square', label: 'Square' },
                { id: 'extra-rounded', label: 'Squircle' },
                { id: 'dot', label: 'Circle Ring' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  id={`btn-corner-square-${style.id}`}
                  onClick={() => updateConfig({ cornerSquareStyle: style.id as CornerSquareStyle })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition cursor-pointer ${
                    config.cornerSquareStyle === style.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Corner Inner Dot Shape */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Inner Pupil Shape (3x3)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'square', label: 'Square Pupil' },
                { id: 'dot', label: 'Circle Dot Pupil' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  id={`btn-corner-dot-${style.id}`}
                  onClick={() => updateConfig({ cornerDotStyle: style.id as CornerDotStyle })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition cursor-pointer ${
                    config.cornerDotStyle === style.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CENTER LOGO */}
      {activeTab === 'logo' && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-semibold text-slate-200 block">Embed Logo in Center</label>
              <span className="text-xs text-slate-400">Safe contrast backdrop maintains 100% scannability</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.logo.enabled && config.logo.type !== 'none'}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  updateLogo({
                    enabled,
                    type: enabled ? (config.logo.customDataUrl ? 'custom' : 'preset') : 'none',
                    presetId: config.logo.presetId || 'link',
                  });
                  if (enabled && (config.errorCorrectionLevel === 'L' || config.errorCorrectionLevel === 'M')) {
                    updateConfig({ errorCorrectionLevel: 'Q' });
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {config.logo.enabled && config.logo.type !== 'none' && (
            <div className="space-y-4 pt-1">
              {/* Preset Icons vs Custom Upload */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-300">Choose Preset Brand Icon</span>
                  <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PRESET_ICONS.map((icon) => {
                    const isSelected =
                      config.logo.type === 'preset' && config.logo.presetId === icon.id;
                    return (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() =>
                          updateLogo({
                            type: 'preset',
                            presetId: icon.id,
                            enabled: true,
                          })
                        }
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                        title={icon.name}
                      >
                        <div
                          className="w-5 h-5 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                        <span className="text-[10px] truncate max-w-[50px]">{icon.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded custom preview (if present) */}
              {config.logo.type === 'custom' && config.logo.customDataUrl && (
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={config.logo.customDataUrl}
                      alt="Custom logo preview"
                      className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1 border border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">Custom Logo Active</span>
                      <span className="text-[10px] text-slate-400">Rendered on QR center</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateLogo({ type: 'preset', presetId: 'link' })}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Logo Size & Backdrop Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Logo Scale</span>
                    <span>{Math.round((config.logo.size || 0.22) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.32"
                    step="0.01"
                    value={config.logo.size || 0.22}
                    onChange={(e) => updateLogo({ size: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Backdrop Padding</span>
                    <span>{config.logo.padding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="1"
                    value={config.logo.padding}
                    onChange={(e) => updateLogo({ padding: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.logo.roundBackdrop}
                    onChange={(e) => updateLogo({ roundBackdrop: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Circular backdrop shape (uncheck for rounded square)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FRAME & CTA */}
      {activeTab === 'frame' && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Frame Style</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'No Frame' },
                { id: 'bottom-banner', label: 'Bottom Banner' },
                { id: 'top-header', label: 'Top Banner' },
                { id: 'polaroid', label: 'Polaroid Card' },
                { id: 'badge', label: 'Badge Card' },
                { id: 'minimal-border', label: 'Thin Border' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  id={`btn-frame-${f.id}`}
                  onClick={() => updateFrame({ style: f.id as FrameStyle })}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition cursor-pointer ${
                    config.frame.style === f.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {config.frame.style !== 'none' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Call To Action Text
                </label>
                <input
                  type="text"
                  value={config.frame.text}
                  onChange={(e) => updateFrame({ text: e.target.value })}
                  placeholder="SCAN ME"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                  <span className="text-xs text-slate-400 block mb-1">Frame Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.frame.frameColor}
                      onChange={(e) => updateFrame({ frameColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white uppercase">
                      {config.frame.frameColor}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                  <span className="text-xs text-slate-400 block mb-1">Text Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.frame.textColor}
                      onChange={(e) => updateFrame({ textColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white uppercase">
                      {config.frame.textColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: QUALITY & RESOLUTION */}
      {activeTab === 'quality' && (
        <div className="space-y-5 text-xs sm:text-sm">
          {/* Error Correction Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-200">Error Correction Level</label>
              <span className="text-xs text-indigo-400">
                {config.errorCorrectionLevel === 'L' && '7% damage recovery (Cleanest density)'}
                {config.errorCorrectionLevel === 'M' && '15% recovery (Standard)'}
                {config.errorCorrectionLevel === 'Q' && '25% recovery (Recommended for Logos)'}
                {config.errorCorrectionLevel === 'H' && '30% recovery (Maximum Durability)'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  id={`btn-ec-${level}`}
                  onClick={() => updateConfig({ errorCorrectionLevel: level })}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    config.errorCorrectionLevel === level
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-base">{level}</div>
                  <div className="text-[10px] opacity-70">
                    {level === 'L' && '7%'}
                    {level === 'M' && '15%'}
                    {level === 'Q' && '25%'}
                    {level === 'H' && '30%'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Quiet Zone Margin */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Quiet Zone Margin</span>
              <span>{config.margin} blocks</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={config.margin}
              onChange={(e) => updateConfig({ margin: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <hr className="border-slate-800" />

          {/* Export Resolution */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Export Canvas Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 512, label: '512 px', sub: 'Web / Social' },
                { size: 1024, label: '1024 px', sub: 'High Definition' },
                { size: 2048, label: '2048 px', sub: 'Ultra Print 300DPI' },
              ].map((res) => (
                <button
                  key={res.size}
                  type="button"
                  id={`btn-res-${res.size}`}
                  onClick={() => updateConfig({ resolution: res.size })}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    config.resolution === res.size
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-sm">{res.label}</div>
                  <div className="text-[10px] opacity-70">{res.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
