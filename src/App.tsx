import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Download,
  Terminal,
  Monitor,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import {
  QRContentType,
  QRDesignConfig,
  WifiData,
  VCardData,
  EmailData,
  SMSData,
  CryptoData,
  EventData,
  GeoData,
  HistoryItem,
} from './types';
import { ContentInputs } from './components/ContentInputs';
import { DesignCustomizer } from './components/DesignCustomizer';
import { PresetsAndHistory } from './components/PresetsAndHistory';
import { QRPreview } from './components/QRPreview';
import { InstallModal } from './components/InstallModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { generatePayload } from './utils/payloadGenerator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { safeLocalStorage } from './utils/safeStorage';

const DEFAULT_CONFIG: QRDesignConfig = {
  dotStyle: 'rounded',
  cornerSquareStyle: 'extra-rounded',
  cornerDotStyle: 'dot',
  fgColor: '#3b82f6',
  fgColor2: '#6366f1',
  gradientType: 'linear',
  gradientAngle: 45,
  bgColor: '#ffffff',
  transparentBg: false,
  customCornerColor: false,
  cornerSquareColor: '#3b82f6',
  cornerDotColor: '#6366f1',
  errorCorrectionLevel: 'M',
  margin: 2,
  resolution: 1024,
  logo: {
    enabled: false,
    type: 'none',
    presetId: 'link',
    size: 0.22,
    padding: 6,
    roundBackdrop: true,
    backdropColor: '#ffffff',
  },
  frame: {
    style: 'none',
    text: 'SCAN ME',
    textColor: '#ffffff',
    frameColor: '#0f172a',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
};

export default function App() {
  // Navigation / Modal state
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const { osName } = usePWAInstall();

  // Content type state
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [url, setUrl] = useState('https://archlinux.org');
  const [text, setText] = useState('Welcome to QR Code Generator!');
  const [wifi, setWifi] = useState<WifiData>({
    ssid: 'Office_Guest_5G',
    encryption: 'WPA',
    password: 'SuperSecretWiFiPassword',
    hidden: false,
  });
  const [vcard, setVcard] = useState<VCardData>({
    firstName: 'Alex',
    lastName: 'Chen',
    organization: 'Systems Architect',
    title: 'Lead Engineer',
    phone: '+1 (555) 234-5678',
    email: 'alex@example.com',
    website: 'https://example.com',
    street: '100 Tech Blvd',
    city: 'Seattle',
    country: 'USA',
  });
  const [email, setEmail] = useState<EmailData>({
    to: 'contact@example.com',
    subject: 'Project Inquiry',
    body: 'Hello! I scanned your QR code and would like to connect.',
  });
  const [sms, setSms] = useState<SMSData>({
    phone: '+1 555-0192',
    message: 'Hello! Interested in your work.',
  });
  const [crypto, setCrypto] = useState<CryptoData>({
    network: 'bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amount: '0.005',
    label: 'Coffee Donation',
  });
  const [event, setEvent] = useState<EventData>({
    title: 'Linux User Group Meetup',
    location: 'Open Source Lab Room 4',
    start: '2026-10-01T18:00',
    end: '2026-10-01T20:30',
    description: 'Quarterly Arch Linux & Open Source developer gathering.',
  });
  const [geo, setGeo] = useState<GeoData>({
    latitude: '47.6062',
    longitude: '-122.3321',
    query: 'Seattle Center',
  });

  // Design configuration state
  const [config, setConfig] = useState<QRDesignConfig>(DEFAULT_CONFIG);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('qr_gen_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate current raw payload
  const currentPayload = useMemo(() => {
    return generatePayload(contentType, {
      url,
      text,
      wifi,
      vcard,
      email,
      sms,
      crypto,
      event,
      geo,
    });
  }, [contentType, url, text, wifi, vcard, email, sms, crypto, event, geo]);

  // Save item to history when rendered (debounced/unique)
  const handleSaveToHistory = (payload: string) => {
    if (!payload) return;
    setHistory((prev) => {
      // Don't add duplicate of most recent item
      if (prev.length > 0 && prev[0].rawText === payload) {
        return prev;
      }
      let title = payload;
      if (contentType === 'url') title = url || payload;
      else if (contentType === 'wifi') title = `Wi-Fi: ${wifi.ssid}`;
      else if (contentType === 'vcard') title = `${vcard.firstName} ${vcard.lastName}`;
      else if (contentType === 'email') title = `Email: ${email.to}`;
      else if (contentType === 'crypto') title = `${crypto.network.toUpperCase()} Address`;
      else if (contentType === 'event') title = event.title;

      const newItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        type: contentType,
        previewTitle: title,
        rawText: payload,
        config: { ...config },
      };

      const updated = [newItem, ...prev.slice(0, 19)];
      safeLocalStorage.setItem('qr_gen_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    safeLocalStorage.removeItem('qr_gen_history');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setContentType(item.type);
    if (item.type === 'url') setUrl(item.rawText);
    else if (item.type === 'text') setText(item.rawText);
    if (item.config) {
      setConfig(item.config);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              QR Code Generator
              <span className="hidden md:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                PWA Desktop
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Customizable &bull; Vector SVG & High-Res PNG &bull; Offline Ready
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* OS-specific Install Modal trigger button */}
          <button
            id="btn-open-install-guide"
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition cursor-pointer"
            title="Installation Guide for Windows, Arch Linux, and Firefox"
          >
            {osName === 'linux' ? (
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="hidden sm:inline">Windows, Arch &amp; Firefox</span>
            <span className="sm:hidden">Install</span>
          </button>

          {/* Direct PWA Install prompt */}
          <PWAInstallButton onOpenInstallModal={() => setIsInstallModalOpen(true)} />
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Arch & Windows highlight banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Standalone App for Windows and Arch Linux
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Installable as a Progressive Web App (PWA) with native XDG desktop integration for Arch Linux, Windows Start Menu launcher, and 100% offline generation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 rounded-lg border border-indigo-500/30 whitespace-nowrap transition cursor-pointer"
          >
            View Setup &amp; .desktop Entry &rarr;
          </button>
        </div>

        {/* Two-Column Responsive Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Content, Styles, & Presets (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Content Input */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Select Content &amp; Data
                </h2>
              </div>
              <ContentInputs
                contentType={contentType}
                onContentTypeChange={setContentType}
                url={url}
                setUrl={setUrl}
                text={text}
                setText={setText}
                wifi={wifi}
                setWifi={setWifi}
                vcard={vcard}
                setVcard={setVcard}
                email={email}
                setEmail={setEmail}
                sms={sms}
                setSms={setSms}
                crypto={crypto}
                setCrypto={setCrypto}
                event={event}
                setEvent={setEvent}
                geo={geo}
                setGeo={setGeo}
              />
            </div>

            {/* Step 2: Customization Studio */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Customize Design &amp; Aesthetics
                </h2>
              </div>
              <DesignCustomizer
                config={config}
                onChange={setConfig}
                onReset={() => setConfig(DEFAULT_CONFIG)}
              />
            </div>

            {/* Step 3: Presets & History */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Themes &amp; History
                </h2>
              </div>
              <PresetsAndHistory
                currentConfig={config}
                onApplyConfig={setConfig}
                history={history}
                onClearHistory={handleClearHistory}
                onSelectHistoryItem={handleSelectHistoryItem}
              />
            </div>
          </div>

          {/* Right Column: Live Sticky Preview (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Code Preview
                </h2>
                <span className="text-xs text-slate-400 capitalize">
                  {contentType} mode
                </span>
              </div>

              {/* QR Preview Canvas and Export Controls */}
              <QRPreview
                payload={currentPayload}
                config={config}
                onSaveToHistory={handleSaveToHistory}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Customizable QR Code Generator &bull; Designed for Windows 10/11 &amp; Arch Linux
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="hover:text-white transition cursor-pointer"
            >
              Desktop Installation Guide
            </button>
            <span>&bull;</span>
            <span>Zero Remote Telemetry</span>
          </div>
        </div>
      </footer>

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Windows & Arch Linux Installation Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
