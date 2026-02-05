/**
 * YOKK - Unified Configuration & Integration Layer
 * 
 * This file serves as the central integration point for all YOKK components,
 * bringing together the scattered work into a cohesive, unified architecture.
 * 
 * It orchestrates:
 * - Supabase integration (online-first)
 * - AI Router (3-tier system)
 * - Media optimization (Opus/AVIF)
 * - Authentication (WhatsApp/Passkeys)
 * - PWA enhancements
 * - Network resilience
 * - Storage (Cloudflare R2)
 */

// SSR-safe imports (no browser APIs at module level)
import { robustAiQuery } from '@/lib/ai/hybrid-router';
import { 
  AudioOptimizer, 
  ImageOptimizer, 
  MediaUploader,
  DataSavingsCalculator 
} from '@/lib/media/optimizer';
import { 
  WhatsAppAuth, 
  PasskeyAuth, 
  AfricanAuthManager 
} from '@/lib/auth/african-auth';
import { 
  AfricanPWAManager, 
  AfricanBackgroundSync,
  AfricanNetworkResilience
} from '@/lib/pwa/african-pwa-optimizer';
import { CloudflareR2Client, AfricanMediaUploader } from '@/lib/storage/cloudflare-r2';
import { PackageHarmonizer, getDefaultAfricanConfig } from '@/lib/harmony/package-harmonizer';
import { getSupabase } from '@/lib/supabase/client';

export interface YOKKConfig {
  // Core services
  supabaseUrl: string;
  supabaseAnonKey: string;
  groqApiKey: string;
  openrouterApiKey?: string;
  
  // African market optimizations
  enableDataSavings: boolean;
  optimizeForLowEndDevices: boolean;
  useLocalAuth: boolean;
  
  // Performance settings
  cacheTimeoutMs: number;
  requestTimeoutMs: number;
  retryAttempts: number;
}

export class YOKKUnifiedSystem {
  private config: YOKKConfig;
  private harmonizer: PackageHarmonizer;
  
  // Core services
  private r2Client?: CloudflareR2Client;
  private mediaUploader?: AfricanMediaUploader;
  
  constructor(config: YOKKConfig) {
    this.config = config;
    this.harmonizer = new PackageHarmonizer(getDefaultAfricanConfig());
  }
  
  /**
   * Initialize the complete YOKK system
   */
  async initialize(): Promise<void> {
    console.log('Initializing YOKK Unified System...');
    
    // Initialize harmonization
    await this.harmonizer.initialize();
    console.log('Package harmonization initialized');
    
    // Initialize Cloudflare R2 for zero-egress storage
    this.r2Client = new CloudflareR2Client();
    this.mediaUploader = new AfricanMediaUploader(this.r2Client);
    console.log('Cloudflare R2 storage initialized');

    // Initialize PWA with African market optimizations
    await AfricanPWAManager.initialize();
    console.log('PWA with African optimizations initialized');

    console.log('YOKK Unified System fully initialized!');
  }
  
  /**
   * Process AI query through the 3-tier hybrid router
   */
  async processAIQuery(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, systemPrompt?: string) {
    try {
      const response = await robustAiQuery(messages, systemPrompt);
      return response;
    } catch (error) {
      console.error('AI query processing failed:', error);
      throw error;
    }
  }
  
  /**
   * Upload media with African optimizations (Opus/AVIF + R2)
   */
  async uploadOptimizedMedia(file: File, userId?: string) {
    if (!this.mediaUploader) {
      throw new Error('Media uploader not initialized');
    }
    
    try {
      const result = await this.mediaUploader.uploadOptimizedMedia(file, { userId });
      
      if (result.success && result.sizeSavedKB) {
        console.log(`Media optimized, ${result.sizeSavedKB}KB saved`);
      }
      
      return result;
    } catch (error) {
      console.error('Media upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Perform resilient network request with African network optimizations
   */
  async resilientRequest(url: string, options: RequestInit = {}) {
    try {
      const response = await AfricanNetworkResilience.resilientFetch(url, options);
      return response;
    } catch (error) {
      console.error('Resilient request failed:', error);
      throw error;
    }
  }
  
  /**
   * Queue operation for background sync with African network resilience
   */
  async queueOperationForSync(operation: string, data: any, priority: 'high' | 'normal' = 'normal') {
    try {
      await AfricanBackgroundSync.queueForSync(operation, data);
      console.log(`Operation queued: ${operation} with priority ${priority}`);
    } catch (error) {
      console.error('Failed to queue operation:', error);
      throw error;
    }
  }
  
  /**
   * Get recommended authentication methods for African users
   */
  getRecommendedAuthMethods() {
    return AfricanAuthManager.getRecommendedAuthMethods();
  }

  /**
   * Sign in with the most appropriate method for African users
   */
  async signInWithRecommendedMethod(identifier: string, method?: 'email' | 'phone' | 'whatsapp' | 'passkey') {
    return await AfricanAuthManager.signInWithRecommendedMethod(identifier, method);
  }
  
  /**
   * Calculate data savings for African users
   */
  calculateDataSavings(mediaCount: number, avgOriginalSizeKB: number, targetFormat: 'opus' | 'avif') {
    return DataSavingsCalculator.estimateUserSavings(mediaCount, avgOriginalSizeKB, targetFormat);
  }
  
  /**
   * Get system health and performance metrics
   */
  async getSystemHealth() {
    const pwaStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
    const authStatus = 'ready';

    return {
      database: 'supabase',
      pwa: pwaStatus,
      auth: authStatus,
      timestamp: new Date().toISOString(),
      optimizations: {
        dataSavingsEnabled: this.config.enableDataSavings,
        lowEndOptimizations: this.config.optimizeForLowEndDevices,
        localAuth: this.config.useLocalAuth
      }
    };
  }
  
  /**
   * Get unified configuration
   */
  getConfig(): YOKKConfig {
    return { ...this.config };
  }
  
  /**
   * Get Supabase client
   */
  getSupabaseClient() {
    return getSupabase();
  }
  
  /**
   * Get R2 client
   */
  getR2Client(): CloudflareR2Client | undefined {
    return this.r2Client;
  }
}

// Singleton instance for easy access throughout the app
let yokkSystem: YOKKUnifiedSystem | null = null;

export async function getYOKKSystem(): Promise<YOKKUnifiedSystem> {
  // SSR guard - only initialize in browser
  if (typeof window === 'undefined') {
    throw new Error('YOKK System can only be initialized in browser environment');
  }
  
  if (!yokkSystem) {
    // Create config from environment variables
    const config: YOKKConfig = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      groqApiKey: process.env.GROQ_API_KEY || '',
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      
      enableDataSavings: true,
      optimizeForLowEndDevices: true,
      useLocalAuth: true,
      
      cacheTimeoutMs: 300000, // 5 minutes
      requestTimeoutMs: 30000, // 30 seconds for African networks
      retryAttempts: 5 // More retries for unstable networks
    };
    
    yokkSystem = new YOKKUnifiedSystem(config);
    await yokkSystem.initialize();
  }
  
  return yokkSystem;
}

// Export individual components for granular access
export {
  // AI components
  robustAiQuery,
  
  // Media optimization
  AudioOptimizer,
  ImageOptimizer,
  MediaUploader,
  DataSavingsCalculator,
  
  // Authentication
  WhatsAppAuth,
  PasskeyAuth,
  AfricanAuthManager,
  
  // PWA & Network
  AfricanPWAManager,
  AfricanBackgroundSync,
  AfricanNetworkResilience,
  
  // Storage
  CloudflareR2Client,
  AfricanMediaUploader,
  
  // Harmonization
  PackageHarmonizer,
  getDefaultAfricanConfig
};

// Only log in browser environment
if (typeof window !== 'undefined') {
  console.log('YOKK Unified System loaded and ready for integration');
}
