/**
 * Service Worker Background Sync for African Network Resilience
 * Implements robust offline-first sync patterns inspired by Paystack
 */

// Background sync manager
export class BackgroundSyncManager {
  private static readonly SYNC_TAG = 'yokk-background-sync';
  private static readonly QUEUE_DB_NAME = 'yokk-sync-queue';
  private static readonly QUEUE_STORE_NAME = 'operations';
  
  /**
   * Register background sync event
   */
  static async registerSync(): Promise<void> {
    if (!('serviceWorker' in navigator && 'sync' in navigator.serviceWorker)) {
      console.warn('Background Sync not supported in this browser');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if sync is already registered
      const tags = await (registration as any).sync.getTags();
      if (!tags.includes(this.SYNC_TAG)) {
        await (registration as any).sync.register(this.SYNC_TAG);
        console.log('Background sync registered');
      } else {
        console.log('Background sync already registered');
      }
    } catch (error: unknown) {
      console.error('Failed to register background sync:', error);
    }
  }
  
  /**
   * Queue an operation for background sync
   */
  static async queueOperation(
    operation: string, 
    data: any, 
    options: { maxRetries?: number; priority?: 'high' | 'normal' } = {}
  ): Promise<void> {
    const { maxRetries = 5, priority = 'normal' } = options;
    
    try {
      const db = await this.openQueueDB();
      const tx = db.transaction(this.QUEUE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.QUEUE_STORE_NAME);
      
      const queuedOperation = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        operation,
        data,
        timestamp: Date.now(),
        attempts: 0,
        maxRetries,
        priority,
        createdAt: new Date().toISOString()
      };
      
      await store.add(queuedOperation);
      console.log(`Operation queued: ${operation}`, queuedOperation);
      
      // Register sync to process the queue
      await this.registerSync();
    } catch (error: unknown) {
      console.error('Failed to queue operation:', error);
      // Fallback: try immediate execution
      await this.executeOperation(operation, data);
    }
  }
  
  /**
   * Open IndexedDB for sync queue
   */
  private static async openQueueDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.QUEUE_DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.QUEUE_STORE_NAME)) {
          const store = db.createObjectStore(this.QUEUE_STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('operation', 'operation', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('attempts', 'attempts', { unique: false });
        }
      };
    });
  }
  
  /**
   * Process all queued operations
   */
  static async processQueuedOperations(): Promise<void> {
    try {
      const db = await this.openQueueDB();
      const tx = db.transaction(this.QUEUE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.QUEUE_STORE_NAME);
      
      // Get operations sorted by priority and timestamp
      const request = store.index('priority').getAll();
      
      const operations = await new Promise<any[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as any[]);
        request.onerror = () => reject(request.error);
      });
      
      // Sort by priority (high first) then by timestamp (oldest first)
      operations.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return a.timestamp - b.timestamp;
      });
      
      for (const op of operations) {
        try {
          // Execute the operation
          const result = await this.executeOperation(op.operation, op.data);
          
          // Remove successful operation
          await store.delete(op.id);
          console.log(`Successfully processed operation: ${op.operation}`, result);
          
          // Notify listeners of success
          this.notifyOperationSuccess(op.operation, result);
        } catch (error: unknown) {
          // Increment attempt counter
          op.attempts += 1;

          if (op.attempts >= op.maxRetries) {
            // Remove failed operation after max attempts
            await store.delete(op.id);
            console.error(`Max attempts reached for operation: ${op.operation}`, error);

            // Notify listeners of failure
            this.notifyOperationFailure(op.operation, error as Error);
          } else {
            // Update operation with incremented attempts
            await store.put(op);
            console.warn(`Operation failed, will retry (${op.attempts}/${op.maxRetries}): ${op.operation}`, error);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error processing queued operations:', error);
    }
  }
  
  /**
   * Execute a specific operation
   */
  private static async executeOperation(operation: string, data: any): Promise<any> {
    switch (operation) {
      case 'post_message':
        return await this.executePostMessage(data);
      case 'upload_media':
        return await this.executeUploadMedia(data);
      case 'update_profile':
        return await this.executeUpdateProfile(data);
      case 'send_reaction':
        return await this.executeSendReaction(data);
      case 'sync_data':
        return await this.executeSyncData(data);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
  
  // Operation implementations
  private static async executePostMessage(data: any): Promise<any> {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Background-Sync': 'true'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to post message: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  private static async executeUploadMedia(data: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('type', data.type);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload media: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  private static async executeUpdateProfile(data: any): Promise<any> {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  private static async executeSendReaction(data: any): Promise<any> {
    const response = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send reaction: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  private static async executeSyncData(data: any): Promise<any> {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync data: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Notify listeners of operation success
   */
  private static notifyOperationSuccess(operation: string, result: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('background-sync-success', {
        detail: { operation, result }
      }));
    }
  }
  
  /**
   * Notify listeners of operation failure
   */
  private static notifyOperationFailure(operation: string, error: Error): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('background-sync-failure', {
        detail: { operation, error: error.message || error }
      }));
    }
  }
  
  /**
   * Get queue statistics
   */
  static async getQueueStats(): Promise<{
    total: number;
    pending: number;
    highPriority: number;
    normalPriority: number;
  }> {
    try {
      const db = await this.openQueueDB();
      const tx = db.transaction(this.QUEUE_STORE_NAME, 'readonly');
      const store = tx.objectStore(this.QUEUE_STORE_NAME);

      const request = store.getAll();
      const allOps = await new Promise<any[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result as any[]);
        request.onerror = () => reject(request.error);
      });

      return {
        total: allOps.length,
        pending: allOps.length,
        highPriority: allOps.filter(op => op.priority === 'high').length,
        normalPriority: allOps.filter(op => op.priority === 'normal').length
      };
    } catch (error: unknown) {
      console.error('Failed to get queue stats:', error);
      return { total: 0, pending: 0, highPriority: 0, normalPriority: 0 };
    }
  }
}

// Paystack-style retry engine for network resilience
export class PaystackStyleRetryEngine {
  /**
   * Execute request with Paystack-style retry logic
   */
  static async executeWithRetry(
    requestFn: () => Promise<any>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      backoffMultiplier?: number;
      jitter?: boolean;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<any> {
    const {
      maxRetries = 3,
      baseDelay = 1000, // 1 second
      backoffMultiplier = 2,
      jitter = true,
      retryCondition = (error) => this.defaultRetryCondition(error)
    } = options;
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        console.log(`Request succeeded on attempt ${attempt + 1}`);
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          // Final attempt failed
          console.error(`Request failed after ${maxRetries + 1} attempts:`, error);
          throw error;
        }
        
        if (!retryCondition(error)) {
          // Don't retry if condition isn't met
          console.error('Retry condition not met, aborting retries:', error);
          throw error;
        }
        
        // Calculate delay with exponential backoff
        let delay = baseDelay * Math.pow(backoffMultiplier, attempt);
        
        // Add jitter to prevent thundering herd
        if (jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }
        
        console.warn(`Request failed on attempt ${attempt + 1}, retrying in ${delay}ms:`, error);
        
        // Wait before retry
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }
  
  /**
   * Default retry condition based on network errors
   */
  private static defaultRetryCondition(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx status codes
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network error
      return true;
    }
    
    if (error.status >= 500 && error.status < 600) {
      // Server error
      return true;
    }
    
    if (error.status === 429) {
      // Rate limited
      return true;
    }
    
    if (error.message && (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('failed to fetch')
    )) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// African Network Resilience Manager
export class AfricanNetworkResilienceManager {
  /**
   * Execute API request with African network resilience
   */
  static async executeResilientRequest(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 5 // More retries for unstable African networks
  ): Promise<Response> {
    return await PaystackStyleRetryEngine.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for African networks
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // For network resilience, treat 408 (Request Timeout) and 5xx as retryable
        if (response.status === 408 || (response.status >= 500 && response.status < 600)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        throw error;
      }
    }, {
      maxRetries,
      baseDelay: 2000, // Longer base delay for African networks
      backoffMultiplier: 2.5, // Faster backoff for unstable networks
      jitter: true,
      retryCondition: (error) => this.africanRetryCondition(error)
    });
  }
  
  /**
   * Retry condition optimized for African networks
   */
  private static africanRetryCondition(error: any): boolean {
    // More generous retry conditions for African networks
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      // Timeout - very common on African networks
      return true;
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network error - common on unstable connections
      return true;
    }
    
    if (error.status === 408 || error.status === 429 || error.status >= 500) {
      // Various server/network errors
      return true;
    }
    
    if (error.message) {
      const errorMsg = error.message.toLowerCase();
      return (
        errorMsg.includes('timeout') ||
        errorMsg.includes('network') ||
        errorMsg.includes('failed to fetch') ||
        errorMsg.includes('load failed') ||
        errorMsg.includes('connection') ||
        errorMsg.includes('abort')
      );
    }
    
    return false;
  }
  
  /**
   * Queue request for offline resilience
   */
  static async queueRequestForResilience(
    operation: string,
    data: any,
    priority: 'high' | 'normal' = 'normal'
  ): Promise<void> {
    // Queue the operation for background sync
    await BackgroundSyncManager.queueOperation(operation, data, { priority });
    
    // Also attempt immediate execution
    try {
      await this.executeResilientRequest(
        this.getApiUrl(operation),
        this.buildRequestOptions(operation, data)
      );
    } catch (error: unknown) {
      console.warn(`Immediate execution failed, relying on background sync:`, error);
      // Background sync will handle it
    }
  }
  
  private static getApiUrl(operation: string): string {
    const urls: Record<string, string> = {
      'post_message': '/api/posts',
      'upload_media': '/api/upload',
      'update_profile': '/api/profile',
      'send_reaction': '/api/reactions',
      'sync_data': '/api/sync'
    };
    
    return urls[operation] || '/api/default';
  }
  
  private static buildRequestOptions(operation: string, data: any): RequestInit {
    switch (operation) {
      case 'upload_media':
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('type', data.type);
        return { method: 'POST', body: formData };
      
      default:
        return {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        };
    }
  }
}

// Initialize background sync when service worker is ready
export async function initializeBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_PROCESS') {
          console.log('Processing background sync operations...');
          await BackgroundSyncManager.processQueuedOperations();
        }
      });
      
      // Register sync
      await BackgroundSyncManager.registerSync();
      console.log('Background sync initialized');
    } catch (error: unknown) {
      console.error('Failed to initialize background sync:', error);
    }
  }
}