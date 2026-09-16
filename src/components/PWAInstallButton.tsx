import React from 'react';
import { Download, Monitor, Terminal, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenInstallModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenInstallModal }) => {
  const { isInstallable, isInstalled, osName, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        onOpenInstallModal();
      }
    } else {
      onOpenInstallModal();
    }
  };

  if (isInstalled) {
    return (
      <button
        id="btn-installed-status"
        onClick={onOpenInstallModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition cursor-pointer"
        title="App is running as installed PWA. Click to view desktop details."
      >
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed on</span>
        <span className="capitalize">{osName === 'linux' ? 'Arch Linux' : osName}</span>
      </button>
    );
  }

  return (
    <button
      id="btn-pwa-install-header"
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition cursor-pointer"
      title="Install as native desktop app on Windows or Arch Linux"
    >
      {osName === 'linux' ? (
        <Terminal className="w-3.5 h-3.5 text-cyan-300" />
      ) : (
        <Monitor className="w-3.5 h-3.5 text-blue-200" />
      )}
      <Download className="w-3.5 h-3.5" />
      <span>Install Desktop App</span>
    </button>
  );
};
