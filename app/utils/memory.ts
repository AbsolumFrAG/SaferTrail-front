class MemoryManager {
  private static instance: MemoryManager;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | number | null = null;

  private constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.startCleanup();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  set(key: string, data: any, ttl = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey!);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.cache.forEach((item, key) => {
        if (now > item.timestamp) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => this.cache.delete(key));
    }, 30 * 1000); // Cleanup every 30 seconds
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export const memoryManager = MemoryManager.getInstance();
