/**
 * YOKK - Unified Configuration & Integration Layer
 * 
 * This file serves as the central integration point for all YOKK components,
 * bringing together the scattered work into a cohesive, unified architecture.
 * 
 * It orchestrates:
 * - PowerSync + Supabase integration
 * - AI Router (3-tier system)
 * - Media optimization (Opus/AVIF)
 * - Authentication (WhatsApp/Passkeys)
 * - PWA enhancements
 * - Network resilience
 * - Storage (Cloudflare R2)
 */

import { EnhancedPowerSyncDatabase } from '@/lib/powersync/enhanced-client';
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
import { supabase } from '@/lib/supabase/client';
import { AppSchema } from '@/lib/powersync/schema';

export interface YOKKConfig {
  // Core services
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
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
  private powerSync?: EnhancedPowerSyncDatabase;
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
    console.log('🚀 Initializing YOKK Unified System...');
    
    // Initialize harmonization
    await this.harmonizer.initialize();
    console.log('✅ Package harmonization initialized');
    
    // Initialize PowerSync with African optimizations
    this.powerSync = await this.initializePowerSync();
    console.log('✅ PowerSync with African optimizations initialized');
    
    // Initialize Cloudflare R2 for zero-egress storage
    this.r2Client = new CloudflareR2Client();
    this.mediaUploader = new AfricanMediaUploader(this.r2Client);
    console.log('✅ Cloudflare R2 storage initialized');

    // Initialize PWA with African market optimizations
    await AfricanPWAManager.initialize();
    console.log('✅ PWA with African optimizations initialized');

    console.log('🎉 YOKK Unified System fully initialized!');
  }
  
  /**
   * Initialize PowerSync with enhanced African optimizations
   */
  private async initializePowerSync(): Promise<EnhancedPowerSyncDatabase> {
    const db = new EnhancedPowerSyncDatabase({
      schema: AppSchema,
      database: {
        dbFilename: 'yokk_unified.db',
      },
      flags: {
        enableMultiTabs: false, // Simplified for PWA lifecycle
      }
    });
    
    await db.init();
    
    // Seed data if empty (for demonstration)
    const count = await db.getAll('SELECT count(*) as c FROM launches') as Array<{ c: number }>;
    if (count[0].c === 0) {
      console.log('🌱 Seeding initial data...');
      await db.execute('INSERT INTO launches (id, author_id, title, tagline, image_url, upvotes, is_trending, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        '1', 'arch', 'DevConnect: African Developer Network', 'Building the future of tech collaboration across Africa', 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop', 1205, 1, new Date().toISOString()
      ]);
    }
    
    // Connect with enhanced connector
    await db.connect(new (await import('@/lib/powersync/enhanced-client')).EnhancedPowerSyncConnector());
    
    return db;
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
    const powerSyncStatus = this.powerSync?.currentStatus ?? 'not_initialized';
    const pwaStatus = navigator.onLine ? 'online' : 'offline';
    const authStatus = 'ready'; // Auth is always available via static methods

    return {
      powerSync: powerSyncStatus,
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
   * Get PowerSync database instance
   */
  getPowerSync(): EnhancedPowerSyncDatabase | undefined {
    return this.powerSync;
  }
  
  /**
   * Get Supabase client
   */
  getSupabase() {
    return supabase;
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
  if (!yokkSystem) {
    // Create config from environment variables
    const config: YOKKConfig = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      powersyncUrl: process.env.NEXT_PUBLIC_POWERSYNC_URL || '',
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

console.log('🔍 YOKK Unified System loaded and ready for integration');