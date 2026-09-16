import React, { useState } from 'react';
import {
  Sparkles,
  History,
  Bookmark,
  Plus,
  Trash2,
  Download,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { QRDesignConfig, PresetTheme, HistoryItem } from '../types';
import { safeLocalStorage } from '../utils/safeStorage';

interface PresetsAndHistoryProps {
  currentConfig: QRDesignConfig;
  onApplyConfig: (config: QRDesignConfig) => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const DESIGN_PRESETS: PresetTheme[] = [
  {
    id: 'arch-cyan',
    name: 'Arch Cyan',
    description: 'Arch Linux aesthetic with electric cyan and slate background',
    config: {
      fgColor: '#38bdf8',
      fgColor2: '#0284c7',
      gradientType: 'linear',
      gradientAngle: 45,
      bgColor: '#0f172a',
      transparentBg: false,
      dotStyle: 'rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      customCornerColor: true,
      cornerSquareColor: '#38bdf8',
      cornerDotColor: '#ffffff',
    },
  },
  {
    id: 'windows-azure',
    name: 'Windows Azure',
    description: 'Vivid Windows 11 style blue gradient with crisp rounded corners',
    config: {
      fgColor: '#2563eb',
      fgColor2: '#7c3aed',
      gradientType: 'linear',
      gradientAngle: 135,
      bgColor: '#ffffff',
      transparentBg: false,
      dotStyle: 'classy',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      customCornerColor: false,
    },
  },
  {
    id: 'emerald-tech',
    name: 'Emerald Tech',
    description: 'Crisp mint and emerald tech gradient with circular dots',
    config: {
      fgColor: '#059669',
      fgColor2: '#0d9488',
      gradientType: 'linear',
      gradientAngle: 90,
      bgColor: '#ffffff',
      transparentBg: false,
      dotStyle: 'dots',
      cornerSquareStyle: 'dot',
      cornerDotStyle: 'dot',
      customCornerColor: false,
    },
  },
  {
    id: 'classic-mono',
    name: 'Monochrome Print',
    description: 'High contrast pure black & white for maximum scannability',
    config: {
      fgColor: '#000000',
      fgColor2: '#000000',
      gradientType: 'none',
      bgColor: '#ffffff',
      transparentBg: false,
      dotStyle: 'square',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square',
      customCornerColor: false,
      errorCorrectionLevel: 'M',
    },
  },
  {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    description: 'Warm coral and rose crimson radial gradient with diamond dots',
    config: {
      fgColor: '#ea580c',
      fgColor2: '#e11d48',
      gradientType: 'radial',
      bgColor: '#ffffff',
      transparentBg: false,
      dotStyle: 'diamond',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      customCornerColor: false,
    },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    description: 'Deep obsidian canvas with neon purple and spark stars',
    config: {
      fgColor: '#a855f7',
      fgColor2: '#ec4899',
      gradientType: 'linear',
      gradientAngle: 45,
      bgColor: '#020617',
      transparentBg: false,
      dotStyle: 'star',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      customCornerColor: true,
      cornerSquareColor: '#ec4899',
      cornerDotColor: '#a855f7',
    },
  },
];

export const PresetsAndHistory: React.FC<PresetsAndHistoryProps> = ({
  currentConfig,
  onApplyConfig,
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  const [view, setView] = useState<'presets' | 'history'>('presets');
  const [customPresets, setCustomPresets] = useState<PresetTheme[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('qr_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [presetNameInput, setPresetNameInput] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const saveCurrentAsPreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset: PresetTheme = {
      id: `custom-${Date.now()}`,
      name: presetNameInput.trim(),
      description: 'Custom user preset',
      config: { ...currentConfig },
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    safeLocalStorage.setItem('qr_custom_presets', JSON.stringify(updated));
    setPresetNameInput('');
    setShowSavePreset(false);
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    safeLocalStorage.setItem('qr_custom_presets', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              view === 'presets'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Designer Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setView('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              view === 'history'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recent History ({history.length})</span>
          </button>
        </div>

        {view === 'presets' && (
          <button
            type="button"
            onClick={() => setShowSavePreset(!showSavePreset)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Current</span>
          </button>
        )}

        {view === 'history' && history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Save Preset Dialog */}
      {showSavePreset && (
        <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2">
          <label className="text-xs text-slate-300 block font-medium">Name your preset</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={presetNameInput}
              onChange={(e) => setPresetNameInput(e.target.value)}
              placeholder="e.g. My Brand Dark"
              className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
            />
            <button
              type="button"
              onClick={saveCurrentAsPreset}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* PRESETS LIST */}
      {view === 'presets' && (
        <div className="space-y-3">
          {/* Custom Presets (if any) */}
          {customPresets.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                My Saved Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between group"
                  >
                    <button
                      type="button"
                      onClick={() => onApplyConfig({ ...currentConfig, ...preset.config })}
                      className="text-left flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-white block">{preset.name}</span>
                      <span className="text-[10px] text-slate-400">Apply style</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomPreset(preset.id)}
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Designer Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {DESIGN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                type="button"
                onClick={() => onApplyConfig({ ...currentConfig, ...preset.config })}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition text-left cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{
                        background:
                          preset.config.gradientType === 'linear'
                            ? `linear-gradient(135deg, ${preset.config.fgColor}, ${preset.config.fgColor2})`
                            : preset.config.fgColor,
                      }}
                    />
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                      {preset.name}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY LIST */}
      {view === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>No recent QR codes generated yet.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Every generated code is saved automatically for quick reuse.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {item.type}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {item.previewTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                      {item.rawText}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectHistoryItem(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Restore content & style"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
