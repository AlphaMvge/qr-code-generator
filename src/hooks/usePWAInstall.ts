import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [osName, setOsName] = useState<'windows' | 'linux' | 'macos' | 'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Detect standalone mode (already installed)
    try {
      const isStandalone =
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as unknown as { standalone?: boolean })?.standalone === true;
      setIsInstalled(!!isStandalone);
    } catch {
      setIsInstalled(false);
    }

    // Detect browser & OS
    try {
      const ua = (typeof window !== 'undefined' && window.navigator?.userAgent?.toLowerCase()) || '';
      setIsFirefox(ua.includes('firefox') && !ua.includes('seamonkey'));

      if (/iphone|ipad|ipod/.test(ua)) {
        setIsIOS(true);
        setOsName('ios');
      } else if (/android/.test(ua)) {
        setOsName('android');
      } else if (/win/.test(ua)) {
        setOsName('windows');
      } else if (/linux/.test(ua)) {
        setOsName('linux');
      } else if (/mac/.test(ua)) {
        setOsName('macos');
      }
    } catch {
      // ignore
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isFirefox,
    osName,
    install,
  };
}
