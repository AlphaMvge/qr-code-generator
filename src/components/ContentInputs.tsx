import React, { useState } from 'react';
import {
  Link as LinkIcon,
  FileText,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Coins,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import {
  QRContentType,
  WifiData,
  VCardData,
  EmailData,
  SMSData,
  CryptoData,
  EventData,
  GeoData,
} from '../types';

interface ContentInputsProps {
  contentType: QRContentType;
  onContentTypeChange: (type: QRContentType) => void;
  url: string;
  setUrl: (v: string) => void;
  text: string;
  setText: (v: string) => void;
  wifi: WifiData;
  setWifi: React.Dispatch<React.SetStateAction<WifiData>>;
  vcard: VCardData;
  setVcard: React.Dispatch<React.SetStateAction<VCardData>>;
  email: EmailData;
  setEmail: React.Dispatch<React.SetStateAction<EmailData>>;
  sms: SMSData;
  setSms: React.Dispatch<React.SetStateAction<SMSData>>;
  crypto: CryptoData;
  setCrypto: React.Dispatch<React.SetStateAction<CryptoData>>;
  event: EventData;
  setEvent: React.Dispatch<React.SetStateAction<EventData>>;
  geo: GeoData;
  setGeo: React.Dispatch<React.SetStateAction<GeoData>>;
}

const TYPE_OPTIONS: { type: QRContentType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'url', label: 'Website URL', icon: LinkIcon },
  { type: 'text', label: 'Plain Text', icon: FileText },
  { type: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
  { type: 'vcard', label: 'Contact Card', icon: Contact },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'sms', label: 'SMS Message', icon: MessageSquare },
  { type: 'crypto', label: 'Crypto Address', icon: Coins },
  { type: 'event', label: 'Calendar Event', icon: Calendar },
  { type: 'geo', label: 'Location', icon: MapPin },
];

export const ContentInputs: React.FC<ContentInputsProps> = ({
  contentType,
  onContentTypeChange,
  url,
  setUrl,
  text,
  setText,
  wifi,
  setWifi,
  vcard,
  setVcard,
  email,
  setEmail,
  sms,
  setSms,
  crypto,
  setCrypto,
  event,
  setEvent,
  geo,
  setGeo,
}) => {
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  return (
    <div className="space-y-5">
      {/* Content Type Selector Pills */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          QR Code Content Type
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {TYPE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = contentType === item.type;
            return (
              <button
                key={item.type}
                id={`btn-content-type-${item.type}`}
                type="button"
                onClick={() => onContentTypeChange(item.type)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Forms */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5">
        {/* 1. URL */}
        {contentType === 'url' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="input-url" className="text-sm font-semibold text-slate-200">
                Destination Website URL
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setUrl('https://github.com')}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => setUrl('https://archlinux.org')}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 hover:text-cyan-300"
                >
                  Arch Linux
                </button>
                <button
                  type="button"
                  onClick={() => setUrl('https://microsoft.com')}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-400 hover:text-blue-300"
                >
                  Windows
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                id="input-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/your-link"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-400">
              Scanners will immediately prompt to open this URL in the default browser.
            </p>
          </div>
        )}

        {/* 2. PLAIN TEXT */}
        {contentType === 'text' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="input-plain-text" className="text-sm font-semibold text-slate-200">
                Text Payload
              </label>
              <span className="text-xs font-mono text-slate-400">{text.length} characters</span>
            </div>
            <textarea
              id="input-plain-text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, notes, serial keys, passwords, or raw code..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* 3. WI-FI */}
        {contentType === 'wifi' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct connect format — Phones automatically prompt to join this network</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  placeholder="e.g. Home_Fiber_5G"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Encryption Security</label>
                <select
                  value={wifi.encryption}
                  onChange={(e) =>
                    setWifi({ ...wifi, encryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })
                  }
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                  <option value="WEP">WEP (Legacy)</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>
            </div>

            {wifi.encryption !== 'nopass' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Wi-Fi Password</label>
                <div className="relative">
                  <input
                    type={showWifiPassword ? 'text' : 'password'}
                    value={wifi.password}
                    onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                    placeholder="Enter network security key"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white pr-10 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword(!showWifiPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={wifi.hidden}
                onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>This is a hidden network (SSID broadcast disabled)</span>
            </label>
          </div>
        )}

        {/* 4. VCARD */}
        {contentType === 'vcard' && (
          <div className="space-y-3">
            <p className="text-xs text-indigo-300">
              Contact vCard format &bull; Scanning opens the iOS / Android address book to save immediately.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={vcard.firstName}
                  onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                  placeholder="Linus"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={vcard.lastName}
                  onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                  placeholder="Torvalds"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={vcard.email}
                  onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                  placeholder="developer@linux.org"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Org</label>
                <input
                  type="text"
                  value={vcard.organization}
                  onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                  placeholder="Linux Foundation"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Job Title</label>
                <input
                  type="text"
                  value={vcard.title}
                  onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                  placeholder="Kernel Architect"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Website URL</label>
              <input
                type="url"
                value={vcard.website}
                onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                placeholder="https://kernel.org"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white"
              />
            </div>
          </div>
        )}

        {/* 5. EMAIL */}
        {contentType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Recipient Email</label>
              <input
                type="email"
                value={email.to}
                onChange={(e) => setEmail({ ...email, to: e.target.value })}
                placeholder="support@company.com"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                placeholder="Inquiry from QR code"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Message Body</label>
              <textarea
                rows={3}
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                placeholder="Hello, I would like to get in touch..."
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white"
              />
            </div>
          </div>
        )}

        {/* 6. SMS */}
        {contentType === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={sms.phone}
                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Prefilled SMS Message</label>
              <textarea
                rows={2}
                value={sms.message}
                onChange={(e) => setSms({ ...sms, message: e.target.value })}
                placeholder="Hey, checking in!"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-white"
              />
            </div>
          </div>
        )}

        {/* 7. CRYPTO */}
        {contentType === 'crypto' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cryptocurrency</label>
                <select
                  value={crypto.network}
                  onChange={(e) =>
                    setCrypto({
                      ...crypto,
                      network: e.target.value as 'bitcoin' | 'ethereum' | 'solana' | 'usdt',
                    })
                  }
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="bitcoin">Bitcoin (BTC)</option>
                  <option value="ethereum">Ethereum (ETH)</option>
                  <option value="solana">Solana (SOL)</option>
                  <option value="usdt">Tether (USDT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Optional Amount</label>
                <input
                  type="text"
                  value={crypto.amount}
                  onChange={(e) => setCrypto({ ...crypto, amount: e.target.value })}
                  placeholder="0.05"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Wallet Address</label>
              <input
                type="text"
                value={crypto.address}
                onChange={(e) => setCrypto({ ...crypto, address: e.target.value })}
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* 8. EVENT */}
        {contentType === 'event' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Event Title</label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                placeholder="Product Launch Keynote"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Location or Meeting Link</label>
              <input
                type="text"
                value={event.location}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                placeholder="Auditorium B or Zoom URL"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={event.start}
                  onChange={(e) => setEvent({ ...event, start: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={event.end}
                  onChange={(e) => setEvent({ ...event, end: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. GEO LOCATION */}
        {contentType === 'geo' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                <input
                  type="text"
                  value={geo.latitude}
                  onChange={(e) => setGeo({ ...geo, latitude: e.target.value })}
                  placeholder="37.7749"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                <input
                  type="text"
                  value={geo.longitude}
                  onChange={(e) => setGeo({ ...geo, longitude: e.target.value })}
                  placeholder="-122.4194"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Place Name / Search Query</label>
              <input
                type="text"
                value={geo.query}
                onChange={(e) => setGeo({ ...geo, query: e.target.value })}
                placeholder="San Francisco City Hall"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
