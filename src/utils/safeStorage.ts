// Safe wrapper for localStorage to prevent SecurityError / "The operation is insecure"
// which occurs in sandboxed iframes, private browsing mode, or with blocked third-party storage.

class SafeStorage {
  private memoryFallback: Map<string, string> = new Map();

  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // SecurityError / Storage blocked in iframe or private browsing
    }
    return this.memoryFallback.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Storage blocked or quota exceeded
    }
    this.memoryFallback.set(key, value);
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage blocked
    }
    this.memoryFallback.delete(key);
  }
}

export const safeLocalStorage = new SafeStorage();
