import React, { useState, useEffect } from 'react';
import {
  Download,
  Laptop,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  X,
  ShieldCheck,
  Cpu,
  Monitor,
  HardDrive,
  Globe,
  Flame,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'windows' | 'arch' | 'firefox';

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, osName, isFirefox } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (isFirefox) return 'firefox';
    if (osName === 'linux') return 'arch';
    return 'windows';
  });
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedDesktop, setCopiedDesktop] = useState(false);
  const [copiedFfScript, setCopiedFfScript] = useState(false);

  useEffect(() => {
    if (isFirefox) {
      setActiveTab('firefox');
    } else if (osName === 'linux') {
      setActiveTab('arch');
    }
  }, [isFirefox, osName]);

  if (!isOpen) return null;

  let currentUrl = 'https://localhost:3000';
  try {
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
      currentUrl = window.location.origin;
    }
  } catch {
    // ignore
  }

  const desktopEntryContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=QR Code Generator
GenericName=QR Code Tool
Comment=Customizable QR code generator with styles, logos, and frames
Exec=chromium --app=${currentUrl} %U
Icon=${currentUrl}/pwa-192x192.png
Terminal=false
StartupWMClass=crx_qrcodegen
Categories=Graphics;Utility;
Keywords=qr;barcode;generator;custom;`;

  const firefoxDesktopEntryContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=QR Code Generator
GenericName=QR Code Tool
Comment=Offline Customizable QR code generator
Exec=firefox --new-window ${currentUrl}
Icon=${currentUrl}/pwa-192x192.png
Terminal=false
StartupWMClass=Navigator
Categories=Graphics;Utility;`;

  const archInstallOneLiner = `mkdir -p ~/.local/share/applications && cat << 'EOF' > ~/.local/share/applications/qrcode-generator.desktop
${desktopEntryContent}
EOF
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true`;

  const firefoxArchOneLiner = `mkdir -p ~/.local/share/applications && cat << 'EOF' > ~/.local/share/applications/qrcode-generator.desktop
${firefoxDesktopEntryContent}
EOF
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true`;

  const copyToClipboard = async (text: string, setStatus: (val: boolean) => void) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setStatus(true);
        setTimeout(() => setStatus(false), 2200);
        return;
      }
    } catch {
      // Insecure or blocked iframe context fallback
    }

    // Fallback using textarea execCommand
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setStatus(true);
      setTimeout(() => setStatus(false), 2200);
    } catch (e) {
      console.warn('Copy to clipboard failed:', e);
    }
  };

  return (
    <div
      id="install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="install-modal-card"
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="btn-close-install-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Install QR Code Generator
              {isInstalled && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  App Installed
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Native desktop installation &amp; offline access for Firefox, Windows &amp; Arch Linux
            </p>
          </div>
        </div>

        {/* Firefox notice banner if user is currently using Firefox */}
        {isFirefox && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong className="text-amber-100 block font-semibold mb-0.5">Firefox Browser Detected</strong>
              Firefox doesn't natively include Chromium's address bar 1-click PWA installer on desktop, but{' '}
              <strong>yes, you can still install or download and use the app completely offline!</strong> See the options in the Firefox tab below.
            </div>
          </div>
        )}

        {/* Direct One-Click Install Banner (if browser triggers beforeinstallprompt in Chrome/Edge/Brave) */}
        {isInstallable && !isInstalled && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/60 border border-indigo-600/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-indigo-100">Ready for 1-Click Browser Install</p>
                <p className="text-xs text-indigo-300/80">
                  Your browser detected the Progressive Web App package.
                </p>
              </div>
            </div>
            <button
              id="btn-trigger-pwa-install"
              onClick={async () => {
                const res = await install();
                if (res) onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/60 overflow-x-auto">
          <button
            id="tab-install-firefox"
            onClick={() => setActiveTab('firefox')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'firefox'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Firefox Guide</span>
          </button>
          <button
            id="tab-install-windows"
            onClick={() => setActiveTab('windows')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'windows'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Windows 10 / 11</span>
          </button>
          <button
            id="tab-install-arch"
            onClick={() => setActiveTab('arch')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'arch'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Arch Linux (XDG)</span>
          </button>
        </div>

        {/* FIREFOX TAB CONTENT */}
        {activeTab === 'firefox' && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                How to use &amp; install in Firefox
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Firefox on desktop does not have a native address bar "Install PWA" button (Mozilla deprecated it), but you have <strong>three simple ways</strong> to get the exact same standalone offline experience:
              </p>

              {/* Option A */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>PWAsForFirefox Extension (True Standalone Window)</span>
                </div>
                <p className="text-xs text-slate-400 pl-7">
                  Install the open-source <strong className="text-slate-200">"Progressive Web Apps for Firefox"</strong> add-on (available on addons.mozilla.org). It gives Firefox full standalone PWA support with its own window, taskbar icon, and app launcher.
                </p>
              </div>

              {/* Option B */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Desktop Launcher / App Shortcut (Arch Linux or Windows)</span>
                </div>
                <p className="text-xs text-slate-400 pl-7 mb-2">
                  Launch this URL directly in its own window or kiosk mode with no browser tabs:
                </p>
                <div className="pl-7">
                  <div className="bg-slate-950 p-2 rounded font-mono text-xs text-cyan-300 border border-slate-800 flex items-center justify-between">
                    <span>firefox --new-window "{currentUrl}"</span>
                    <button
                      onClick={() => copyToClipboard(`firefox --new-window "${currentUrl}"`, setCopiedFfScript)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                    >
                      {copiedFfScript ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Option C */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>Offline Functionality Already Active in Firefox!</span>
                </div>
                <p className="text-xs text-slate-400 pl-7">
                  Firefox fully supports our <strong>Service Worker &amp; Cache Storage</strong>. Even if you don't install a standalone window, you can bookmark this page (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">D</kbd>) and use it whenever you have <strong>no internet connection</strong>.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-2 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Want 1-click installation without extensions?
              </h3>
              <p className="text-xs text-slate-400">
                If you have <strong>Chromium, Brave, or Edge</strong> installed on your system (on either Arch or Windows), you can open this page in that browser and click the 1-click <strong>"Install app"</strong> icon in the address bar to create the native desktop app.
              </p>
            </div>
          </div>
        )}

        {/* WINDOWS TAB CONTENT */}
        {activeTab === 'windows' && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-400" />
                Method 1: Microsoft Edge or Chrome (Recommended)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs sm:text-sm pl-1">
                <li>
                  Open this page in <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong>.
                </li>
                <li>
                  Look at the right side of the address bar (URL bar) for the{' '}
                  <strong className="text-blue-300">"Install app"</strong> icon (a computer monitor with an arrow, or a small <kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-xs">+</kbd>).
                </li>
                <li>
                  Click <strong>"Install"</strong>. The app will immediately launch in its own standalone window without browser toolbars.
                </li>
                <li>
                  Right-click the app icon in your Windows Taskbar and choose{' '}
                  <strong className="text-blue-300">"Pin to taskbar"</strong>.
                </li>
              </ol>
            </div>

            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Windows Features & Offline Support
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                <li>Launches directly from the Windows Start Menu and Windows Search</li>
                <li>Operates 100% offline via Service Worker cache (generates QR codes with no internet)</li>
                <li>Supports high-DPI scaling on Windows displays</li>
                <li>Copies images straight to Windows Clipboard (<kbd className="px-1 py-0.5 rounded bg-slate-700">Win</kbd> + <kbd className="px-1 py-0.5 rounded bg-slate-700">V</kbd>)</li>
              </ul>
            </div>
          </div>
        )}

        {/* ARCH LINUX TAB CONTENT */}
        {activeTab === 'arch' && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Method 1: One-Line Arch Linux Desktop Entry (XDG)
              </h3>
              <p className="text-xs text-slate-400">
                Run this command in your terminal (Alacritty, Kitty, Konsole, etc.) to integrate with{' '}
                <strong>Rofi, Wofi, dmenu, GNOME, KDE, Hyprland, or i3</strong>:
              </p>

              <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
                <pre>{archInstallOneLiner}</pre>
                <button
                  id="btn-copy-arch-script"
                  onClick={() => copyToClipboard(archInstallOneLiner, setCopiedScript)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Bash Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Method 2: Chromium / Brave / Firefox PWA
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside">
                <li>
                  <strong>Chromium / Brave on Arch:</strong> Open this URL and click the install icon in the URL bar, or click Menu (<kbd className="px-1 py-0.5 rounded bg-slate-700">⋮</kbd>) &rarr; <em>"Install QR Code Generator"</em>.
                </li>
                <li>
                  <strong>Firefox:</strong> Use the <em>PWAsForFirefox</em> extension or launch via command: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">firefox --new-window {currentUrl}</code>.
                </li>
                <li>
                  <strong>Offline Mode:</strong> All styles, fonts, and scripts are cached locally via Service Worker — works completely without network access!
                </li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                id="btn-copy-desktop-file"
                onClick={() => copyToClipboard(desktopEntryContent, setCopiedDesktop)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                {copiedDesktop ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>.desktop file copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw .desktop Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero cloud telemetry &bull; Generates 100% locally</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
