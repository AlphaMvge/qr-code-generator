// Safe wrapper for localStorage to prevent SecurityError / "The operation is insecure"
// which occurs in sandboxed iframes, private browsing mode, or with blocked third-party storage.

class SafeStorage {
  private memoryFallback: Map<string, string> = new Map();
  private isAvailable: boolean | null = null;

  private getStorage(): Storage | null {
    if (this.isAvailable === false) return null;
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const testKey = '__test_storage__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        this.isAvailable = true;
        return window.localStorage;
      }
    } catch {
      this.isAvailable = false;
    }
    return null;
  }

  getItem(key: string): string | null {
    try {
      const storage = this.getStorage();
      if (storage) {
        return storage.getItem(key);
      }
    } catch {
      // ignore
    }
    return this.memoryFallback.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(key, value);
        return;
      }
    } catch {
      // ignore
    }
    this.memoryFallback.set(key, value);
  }

  removeItem(key: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(key);
      }
    } catch {
      // ignore
    }
    this.memoryFallback.delete(key);
  }
}

export const safeLocalStorage = new SafeStorage();

