/**
 * Performance optimization for low-end African devices
 * Focuses on memory usage, bundle size, and rendering performance
 */

// Device detection for African market devices
export class DeviceDetector {
  static isLowEndDevice(): boolean {
    // Check for low-end device indicators common in Africa
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Common low-end brands sold in Africa
    const lowEndBrands = ['tecno', 'itel', 'infinix', 'xiaomi', 'samsung', 'realme'];
    const isLowEndBrand = lowEndBrands.some(brand => userAgent.includes(brand));
    
    // Check for MediaTek processors (common in budget phones)
    const hasMediatek = userAgent.includes('mediatek') || userAgent.includes('mt6');
    
    // Check for low RAM estimation (using navigator)
    const estimatedLowRam = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 2;
    
    return isLowEndBrand || hasMediatek || estimatedLowRam;
  }

  static getDeviceInfo(): {
    isLowEnd: boolean;
    estimatedRam: number | null;
    processor: string | null;
    brand: string | null;
  } {
    const userAgent = navigator.userAgent;
    const isLowEnd = this.isLowEndDevice();
    
    // Estimate RAM based on navigator API if available
    let estimatedRam: number | null = null;
    if ((navigator as any).deviceMemory) {
      estimatedRam = (navigator as any).deviceMemory;
    }
    
    // Extract processor info
    let processor: string | null = null;
    const processorMatches = userAgent.match(/(mediatek|snapdragon|kirin|exynos|mt\d+)/i);
    if (processorMatches) {
      processor = processorMatches[0];
    }
    
    // Extract brand info
    let brand: string | null = null;
    const brandMatches = userAgent.match(/(tecno|itel|infinix|xiaomi|samsung|realme|huawei|oppo)/i);
    if (brandMatches) {
      brand = brandMatches[0];
    }
    
    return {
      isLowEnd,
      estimatedRam,
      processor,
      brand
    };
  }
}

// Memory management for low-end devices
export class MemoryManager {
  private static readonly LOW_MEMORY_THRESHOLD = 50 * 1024 * 1024; // 50MB
  private static readonly HIGH_MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB
  
  static isMemoryConstrained(): boolean {
    // If device memory is known to be low
    if ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 2) {
      return true;
    }
    
    // Estimate based on device detection
    return DeviceDetector.isLowEndDevice();
  }
  
  static estimateUsedMemory(): number {
    // In a real implementation, this would use performance.memory API
    // which is not standard but available in some browsers
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    
    // Fallback: return a conservative estimate
    return 25 * 1024 * 1024; // 25MB estimate
  }
  
  static shouldOptimizeForMemory(): boolean {
    return this.isMemoryConstrained() || this.estimateUsedMemory() > this.LOW_MEMORY_THRESHOLD;
  }
  
  static cleanupMemory(): void {
    // Clear unused resources
    if (typeof gc !== 'undefined') {
      // Force garbage collection if available (non-standard)
      gc();
    }
    
    // Clear any cached data that isn't critical
    // This is a simplified version - in practice you'd have more specific cleanup
  }
}

// Bundle size optimization utilities
export class BundleOptimizer {
  // Lazy load components based on device capability
  static async lazyLoadComponent(componentPath: string) {
    // For low-end devices, we might want to load lighter versions
    if (DeviceDetector.isLowEndDevice()) {
      // Load a simplified version of the component
      return await import(`./light/${componentPath}`);
    } else {
      // Load the full component
      return await import(`./${componentPath}`);
    }
  }
  
  // Optimize images based on device
  static optimizeImageSrc(src: string): string {
    if (DeviceDetector.isLowEndDevice()) {
      // Serve lower resolution images to low-end devices
      return src.replace(/\.(jpg|jpeg|png)$/i, '_low.$1');
    }
    return src;
  }
  
  // Reduce animation complexity on low-end devices
  static shouldReduceMotion(): boolean {
    // Check for user preference and device capability
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    
    return DeviceDetector.isLowEndDevice();
  }
}

// Rendering optimization for low-end devices
export class RenderOptimizer {
  private static readonly FRAME_RATE_THRESHOLD = 30; // Target frame rate for low-end devices
  
  static shouldUseOptimizedRendering(): boolean {
    return DeviceDetector.isLowEndDevice();
  }
  
  // Use simpler rendering techniques for low-end devices
  static getRenderStrategy(): 'standard' | 'optimized' {
    return this.shouldUseOptimizedRendering() ? 'optimized' : 'standard';
  }
  
  // Throttle expensive operations on low-end devices
  static throttleOperation<T extends (...args: any[]) => any>(func: T, delay: number = 100): T {
    if (!this.shouldUseOptimizedRendering()) {
      // On high-end devices, use shorter delay
      delay = delay / 2;
    }
    
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return function (this: any, ...args: Parameters<T>) {
      const currentTime = Date.now();
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (currentTime - lastExecTime >= delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    } as T;
  }
  
  // Optimize list rendering for low-end devices
  static getVirtualScrollConfig() {
    if (DeviceDetector.isLowEndDevice()) {
      return {
        overscan: 2, // Smaller overscan for memory efficiency
        itemHeight: 60, // Fixed height for performance
      };
    }
    
    return {
      overscan: 5,
      itemHeight: 80,
    };
  }
}

// Network optimization for 2G/3G connections common in Africa
export class NetworkOptimizer {
  static isSlowNetwork(): boolean {
    // Check for slow network indicators
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      return ['slow-2g', '2g', '3g'].includes(effectiveType);
    }
    
    // Fallback: assume slow network if on low-end device
    return DeviceDetector.isLowEndDevice();
  }
  
  static getTimeoutSettings(): { 
    requestTimeout: number; 
    retryAttempts: number; 
    retryDelay: number 
  } {
    if (this.isSlowNetwork()) {
      return {
        requestTimeout: 15000, // Longer timeout for slow networks
        retryAttempts: 3,      // More retries for unstable connections
        retryDelay: 2000       // Longer delay between retries
      };
    }
    
    return {
      requestTimeout: 5000,
      retryAttempts: 2,
      retryDelay: 1000
    };
  }
  
  static shouldDeferNonCriticalResources(): boolean {
    return this.isSlowNetwork() || DeviceDetector.isLowEndDevice();
  }
}

// Overall optimization manager
export class AfricanDeviceOptimizer {
  static async initialize(): Promise<void> {
    const deviceInfo = DeviceDetector.getDeviceInfo();
    
    console.log(`Device optimization initialized for:`, {
      isLowEnd: deviceInfo.isLowEnd,
      brand: deviceInfo.brand,
      estimatedRam: deviceInfo.estimatedRam,
      processor: deviceInfo.processor
    });
    
    // Apply optimizations based on device characteristics
    if (deviceInfo.isLowEnd) {
      this.applyLowEndOptimizations();
    }
  }
  
  private static applyLowEndOptimizations(): void {
    // Enable memory optimization
    if (MemoryManager.shouldOptimizeForMemory()) {
      // Set up periodic memory cleanup
      setInterval(() => {
        MemoryManager.cleanupMemory();
      }, 30000); // Every 30 seconds
    }
    
    // Reduce animations
    if (BundleOptimizer.shouldReduceMotion()) {
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    }
    
    // Optimize rendering
    if (RenderOptimizer.shouldUseOptimizedRendering()) {
      // Apply CSS optimizations
      document.documentElement.classList.add('low-end-optimized');
    }
  }
  
  static shouldLoadFeature(featureSizeKB: number): boolean {
    // Determine if a feature should be loaded based on device constraints
    const deviceInfo = DeviceDetector.getDeviceInfo();
    const networkIsSlow = NetworkOptimizer.isSlowNetwork();
    
    // Conservative loading thresholds for African market
    if (deviceInfo.isLowEnd) {
      return featureSizeKB < 200; // Don't load features >200KB on low-end devices
    }
    
    if (networkIsSlow) {
      return featureSizeKB < 500; // Don't load features >500KB on slow networks
    }
    
    return true; // Load feature on capable devices/networks
  }
}