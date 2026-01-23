/**
 * Package and Component Harmonizer for YOKK App
 * Ensures consistency across all modules and components in the codebase
 */

// Configuration interface for consistent setup across packages
export interface HarmonizedConfig {
  // API endpoints
  apiBaseUrl: string;
  powersyncUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Feature flags
  enableOfflineMode: boolean;
  enableAnalytics: boolean;
  enablePushNotifications: boolean;
  
  // Performance settings
  cacheTimeoutMs: number;
  requestTimeoutMs: number;
  retryAttempts: number;
  
  // African market optimizations
  enableDataSavings: boolean;
  optimizeForLowEndDevices: boolean;
  useLocalAuth: boolean;
}

// Base class for harmonized services
export abstract class HarmonizedService {
  protected config: HarmonizedConfig;
  
  constructor(config: HarmonizedConfig) {
    this.config = this.validateConfig(config);
  }
  
  private validateConfig(config: HarmonizedConfig): HarmonizedConfig {
    // Ensure all required fields are present
    if (!config.apiBaseUrl) throw new Error('apiBaseUrl is required');
    if (!config.supabaseUrl) throw new Error('supabaseUrl is required');
    if (!config.supabaseAnonKey) throw new Error('supabaseAnonKey is required');
    
    // Set defaults for optional fields
    return {
      ...config,
      cacheTimeoutMs: config.cacheTimeoutMs || 300000, // 5 minutes
      requestTimeoutMs: config.requestTimeoutMs || 10000, // 10 seconds
      retryAttempts: config.retryAttempts || 3,
      enableOfflineMode: config.enableOfflineMode ?? true,
      enableAnalytics: config.enableAnalytics ?? true,
      enablePushNotifications: config.enablePushNotifications ?? false,
      enableDataSavings: config.enableDataSavings ?? true,
      optimizeForLowEndDevices: config.optimizeForLowEndDevices ?? true,
      useLocalAuth: config.useLocalAuth ?? true,
    };
  }
  
  // Common error handling
  protected handleError(error: any, context: string): void {
    console.error(`[${context}] Error:`, error);
    
    // Log to centralized error tracking if available
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError(error, context);
    }
  }
  
  // Common success logging
  protected handleSuccess(message: string, context: string): void {
    console.log(`[${context}] Success:`, message);
  }
}

// Harmonized API service
export class HarmonizedApiService extends HarmonizedService {
  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    try {
      // Apply common headers
      const enhancedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'X-Requested-With': 'HarmonizedClient',
          ...(this.config.enableDataSavings && { 'Accept-Encoding': 'gzip' })
        },
        signal: AbortSignal.timeout(this.config.requestTimeoutMs)
      };
      
      let response = await fetch(url, enhancedOptions);
      
      // Retry logic for network resilience
      let attempts = 0;
      while (!response.ok && attempts < this.config.retryAttempts) {
        attempts++;
        console.warn(`Request failed, attempt ${attempts}/${this.config.retryAttempts}:`, url);
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempts) * 1000)
        );
        
        response = await fetch(url, enhancedOptions);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.handleSuccess(`Successfully called ${endpoint}`, 'API');
      return response;
    } catch (error) {
      this.handleError(error, `API-${endpoint}`);
      throw error;
    }
  }
}

// Harmonized Storage service
export class HarmonizedStorageService extends HarmonizedService {
  private storagePrefix: string = 'yokk_harmonized_';
  
  async getItem(key: string): Promise<any> {
    try {
      // Use localStorage with prefix
      const prefixedKey = this.storagePrefix + key;
      const item = localStorage.getItem(prefixedKey);
      
      if (item) {
        const parsed = JSON.parse(item);
        
        // Check if item has expired
        if (parsed.expires && Date.now() > parsed.expires) {
          localStorage.removeItem(prefixedKey);
          return null;
        }
        
        return parsed.value;
      }
      
      return null;
    } catch (error) {
      this.handleError(error, `Storage-get-${key}`);
      return null;
    }
  }
  
  async setItem(key: string, value: any, ttlMs: number = this.config.cacheTimeoutMs): Promise<void> {
    try {
      const prefixedKey = this.storagePrefix + key;
      const item = {
        value,
        expires: ttlMs ? Date.now() + ttlMs : null
      };
      
      localStorage.setItem(prefixedKey, JSON.stringify(item));
      this.handleSuccess(`Stored ${key}`, 'Storage');
    } catch (error) {
      this.handleError(error, `Storage-set-${key}`);
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      const prefixedKey = this.storagePrefix + key;
      localStorage.removeItem(prefixedKey);
      this.handleSuccess(`Removed ${key}`, 'Storage');
    } catch (error) {
      this.handleError(error, `Storage-remove-${key}`);
    }
  }
}

// Harmonized Logger service
export class HarmonizedLoggerService extends HarmonizedService {
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };
    
    // Apply data savings - only log errors in production on low-end devices
    if (this.config.enableDataSavings && this.config.optimizeForLowEndDevices) {
      if (level === 'error' || level === 'warn') {
        console[level]('[YOKK]', logEntry);
      } else if (process.env.NODE_ENV === 'development') {
        console[level]('[YOKK]', logEntry);
      }
    } else {
      console[level]('[YOKK]', logEntry);
    }
  }
  
  debug(message: string, meta?: any): void { this.log('debug', message, meta); }
  info(message: string, meta?: any): void { this.log('info', message, meta); }
  warn(message: string, meta?: any): void { this.log('warn', message, meta); }
  error(message: string, meta?: any): void { this.log('error', message, meta); }
}

// Harmonized Feature Flag service
export class HarmonizedFeatureFlagService extends HarmonizedService {
  private flags: Map<string, boolean> = new Map();
  
  constructor(config: HarmonizedConfig) {
    super(config);
    this.initializeFlags();
  }
  
  private initializeFlags(): void {
    // Set default flags based on configuration
    this.flags.set('offline_mode', this.config.enableOfflineMode);
    this.flags.set('analytics_enabled', this.config.enableAnalytics);
    this.flags.set('push_notifications', this.config.enablePushNotifications);
    this.flags.set('data_savings', this.config.enableDataSavings);
    this.flags.set('low_end_optimizations', this.config.optimizeForLowEndDevices);
    this.flags.set('local_auth', this.config.useLocalAuth);
    
    // Allow overrides from localStorage
    for (const [flag, defaultValue] of this.flags.entries()) {
      const storedValue = localStorage.getItem(`feature_flag_${flag}`);
      if (storedValue !== null) {
        this.flags.set(flag, storedValue === 'true');
      }
    }
  }
  
  isEnabled(flag: string): boolean {
    return this.flags.get(flag) ?? false;
  }
  
  setEnabled(flag: string, enabled: boolean): void {
    this.flags.set(flag, enabled);
    localStorage.setItem(`feature_flag_${flag}`, enabled.toString());
  }
}

// Harmonized Analytics service
export class HarmonizedAnalyticsService extends HarmonizedService {
  private logger: HarmonizedLoggerService;
  
  constructor(config: HarmonizedConfig, logger: HarmonizedLoggerService) {
    super(config);
    this.logger = logger;
  }
  
  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    if (!this.config.enableAnalytics) {
      return;
    }
    
    try {
      // Apply data savings - reduce analytics data on low-end devices
      const reducedProperties = this.config.enableDataSavings && this.config.optimizeForLowEndDevices
        ? this.reduceProperties(properties)
        : properties;
      
      // In a real implementation, this would send to analytics service
      // For now, we'll just log
      this.logger.info(`Analytics event: ${eventName}`, reducedProperties);
      
      // Track in background to avoid blocking
      if (navigator.sendBeacon && this.config.apiBaseUrl) {
        const data = JSON.stringify({
          event: eventName,
          properties: reducedProperties,
          timestamp: new Date().toISOString()
        });
        
        navigator.sendBeacon(`${this.config.apiBaseUrl}/analytics`, data);
      } else {
        // Fallback to fetch if sendBeacon not available
        await fetch(`${this.config.apiBaseUrl}/analytics`, {
          method: 'POST',
          body: JSON.stringify({
            event: eventName,
            properties: reducedProperties,
            timestamp: new Date().toISOString()
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to track analytics event: ${eventName}`, error);
    }
  }
  
  private reduceProperties(properties: Record<string, any>): Record<string, any> {
    // Remove large or unnecessary properties to save data
    const reduced: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Only include small, essential properties
      if (typeof value === 'string' && value.length < 100) {
        reduced[key] = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        reduced[key] = value;
      } else if (key === 'source' || key === 'action' || key === 'category') {
        // Include important categorical data
        reduced[key] = value;
      }
    }
    
    return reduced;
  }
}

// Main harmonization manager
export class PackageHarmonizer {
  private config: HarmonizedConfig;
  private services: Map<string, HarmonizedService> = new Map();
  
  constructor(config: HarmonizedConfig) {
    this.config = config;
  }
  
  // Initialize all harmonized services
  async initialize(): Promise<void> {
    const logger = new HarmonizedLoggerService(this.config);
    this.services.set('logger', logger);
    
    const storage = new HarmonizedStorageService(this.config);
    this.services.set('storage', storage);
    
    const api = new HarmonizedApiService(this.config);
    this.services.set('api', api);
    
    const features = new HarmonizedFeatureFlagService(this.config);
    this.services.set('features', features);
    
    const analytics = new HarmonizedAnalyticsService(this.config, logger);
    this.services.set('analytics', analytics);
    
    console.log('All services harmonized and initialized');
  }
  
  getService<T extends HarmonizedService>(name: string): T | undefined {
    return this.services.get(name) as T;
  }
  
  // Get a unified configuration object
  getConfig(): HarmonizedConfig {
    return { ...this.config };
  }
  
  // Validate that all services are properly configured
  validateHarmonization(): boolean {
    const requiredServices = ['logger', 'storage', 'api', 'features', 'analytics'];
    return requiredServices.every(service => this.services.has(service));
  }
}


// Default configuration for African market
export const getDefaultAfricanConfig = (): HarmonizedConfig => ({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  powersyncUrl: process.env.NEXT_PUBLIC_POWERSYNC_URL || "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  enableOfflineMode: true,
  enableAnalytics: true,
  enablePushNotifications: false,
  cacheTimeoutMs: 300000,
  requestTimeoutMs: 15000,
  retryAttempts: 3,
  enableDataSavings: true,
  optimizeForLowEndDevices: true,
  useLocalAuth: true,
});
