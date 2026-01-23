/**
 * Enhanced PowerSync with Aftech-Stack Patterns
 * Implements African market optimizations and best practices
 */

import {
  PowerSyncDatabase,
  PowerSyncBackendConnector,
  AbstractPowerSyncDatabase
} from '@powersync/web';
import type { CrudBatch } from '@powersync/common';
import { supabase } from '@/lib/supabase/client';
import { supabaseConnector } from '@/lib/powersync/connector';

// Enhanced PowerSync database with African optimizations
export class EnhancedPowerSyncDatabase extends PowerSyncDatabase {
  private readonly NETWORK_TIMEOUT = 30000; // 30 seconds for African networks
  private readonly RETRY_ATTEMPTS = 5; // More retries for unstable networks
  private readonly BATCH_SIZE = 50; // Smaller batches for low-end devices
  
  constructor(options: ConstructorParameters<typeof PowerSyncDatabase>[0]) {
    super(options);
  }
  
  /**
   * Override uploadData with African network resilience
   */
  async uploadData(): Promise<void> {
    try {
      // Get pending changes from local database
      const pending = await this.getCrudBatch(this.BATCH_SIZE);

      if (!pending?.crud || pending.crud.length === 0) {
        return;
      }

      console.log(`Uploading ${pending.crud.length} operations to backend`);

      // Upload with retry logic for African networks
      for (let i = 0; i < pending.crud.length; i += this.BATCH_SIZE) {
        const batch = pending.crud.slice(i, i + this.BATCH_SIZE);
        await this.uploadBatchWithRetry(batch);
      }

      // Mark operations as completed
      await pending.complete();
      console.log('Successfully uploaded all pending operations');
    } catch (error) {
      console.error('Error uploading data:', error);
      throw error;
    }
  }
  
  /**
   * Upload a batch of operations with retry logic
   */
  private async uploadBatchWithRetry(batch: any[]): Promise<void> {
    let attempts = 0;
    
    while (attempts < this.RETRY_ATTEMPTS) {
      try {
        // Upload pending changes to Supabase
        for (const op of batch) {
          if (op.op == 'delete') {
            await supabase
              .from(op.table)
              .delete()
              .match({ id: op.id });
          } else if (op.op == 'update') {
            await supabase
              .from(op.table)
              .update(op.data)
              .match({ id: op.id });
          } else if (op.op == 'insert') {
            await supabase
              .from(op.table)
              .insert([{ ...op.data, id: op.id }]);
          }
        }
        
        return; // Success, exit retry loop
      } catch (error) {
        attempts++;
        console.warn(`Upload attempt ${attempts} failed:`, error);
        
        if (attempts >= this.RETRY_ATTEMPTS) {
          throw error;
        }
        
        // Exponential backoff with jitter for African networks
        const delay = Math.pow(2, attempts) * 2000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  /**
   * Override downloadData with African network optimizations
   */
  async downloadData(): Promise<void> {
    try {
      console.log('Starting data download with African optimizations');
      
      // Download with timeout for slow networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.NETWORK_TIMEOUT);
      
      try {
        // Sync posts table with pagination for low-end devices
        await this.downloadTableWithPagination('posts', controller);
        
        // Sync launches table
        await this.downloadTableWithPagination('launches', controller);
        
        // Sync other tables as needed
        await this.downloadTableWithPagination('comments', controller);
        await this.downloadTableWithPagination('profiles', controller);
        
        clearTimeout(timeoutId);
        console.log('Successfully downloaded all data');
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      throw error;
    }
  }
  
  /**
   * Download a table with pagination to optimize for low-end devices
   */
  private async downloadTableWithPagination(
    tableName: string, 
    controller: AbortController,
    batchSize: number = 100 // Smaller batches for memory-constrained devices
  ): Promise<void> {
    let offset = 0;
    let hasMore = true;
    
    while (hasMore && !controller.signal.aborted) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error(`Error downloading ${tableName}:`, error);
        break;
      }
      
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process batch
      await this.processDownloadBatch(tableName, data);
      
      if (data.length < batchSize) {
        // Got fewer records than requested, so we're done
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }
  }
  
  /**
   * Process a batch of downloaded data
   */
  private async processDownloadBatch(tableName: string, data: any[]): Promise<void> {
    await this.writeTransaction(async (tx) => {
      for (const record of data) {
        // Prepare values for insertion
        const columns = Object.keys(record);
        const values = Object.values(record);

        // Build INSERT OR REPLACE query
        const placeholders = values.map((_, i) => `?`).join(', ');
        const columnList = columns.join(', ');

        await tx.execute(
          `INSERT OR REPLACE INTO ${tableName} (${columnList}) VALUES (${placeholders})`,
          values
        );
      }
    });
  }
  
  /**
   * Optimize for low-end devices by managing memory usage
   */
  async optimizeForLowEndDevices(): Promise<void> {
    // Compact database to free up space
    await this.execute('VACUUM');
    
    // Optimize database indices
    await this.execute('ANALYZE');
    
    console.log('Database optimized for low-end devices');
  }
}

// Enhanced connector with African market patterns
export class EnhancedPowerSyncConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<any> {
    try {
      // Get Supabase session for PowerSync authentication
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error(`Failed to get Supabase session: ${error?.message}`);
      }
      
      // Return credentials for PowerSync connection
      return {
        endpoint: process.env.NEXT_PUBLIC_POWERSYNC_URL!,
        token: session.access_token
      };
    } catch (error) {
      console.error('Error fetching PowerSync credentials:', error);
      throw error;
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    try {
      // Get pending changes from local database
      const pending = await database.getCrudBatch();

      if (!pending?.crud || pending.crud.length === 0) {
        return;
      }

      console.log(`Uploading ${pending.crud.length} operations to backend`);

      // Upload with retry logic optimized for African networks
      for (const op of pending.crud) {
        await this.executeOperationWithRetry(op);
      }

      // Mark operations as completed
      await pending.complete();
    } catch (error) {
      console.error('Error uploading data:', error);
      throw error;
    }
  }

  private async executeOperationWithRetry(op: any): Promise<void> {
    let attempts = 0;
    
    while (attempts < 5) { // More retries for unstable African networks
      try {
        if (op.op == 'delete') {
          await supabase
            .from(op.table)
            .delete()
            .match({ id: op.id });
        } else if (op.op == 'update') {
          await supabase
            .from(op.table)
            .update(op.data)
            .match({ id: op.id });
        } else if (op.op == 'insert') {
          await supabase
            .from(op.table)
            .insert([{ ...op.data, id: op.id }]);
        }
        
        return; // Success
      } catch (error) {
        attempts++;
        console.warn(`Operation attempt ${attempts} failed:`, error);
        
        if (attempts >= 5) {
          throw error;
        }
        
        // Longer delay between retries for African networks
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 2000));
      }
    }
  }

}

// Enhanced setup function with African optimizations
export async function setupEnhancedPowerSync(): Promise<EnhancedPowerSyncDatabase> {
  console.log('🔌 Initializing Enhanced PowerSync with African optimizations...');
  
  // Create enhanced PowerSync instance
  const db = new EnhancedPowerSyncDatabase({
    schema: (await import('@/lib/powersync/schema')).AppSchema,
    database: {
      dbFilename: 'njooba_enhanced_pwa.db',
    },
    flags: {
      // Disable multi-tab support for now to simplify PWA lifecycle
      enableMultiTabs: false,
    }
  });
  
  // Initialize database
  await db.init();
  
  // Apply optimizations for African market
  await db.optimizeForLowEndDevices();
  
  // Connect to Supabase with enhanced connector
  const enhancedConnector = new EnhancedPowerSyncConnector();
  await db.connect(enhancedConnector);
  
  console.log('✅ Enhanced PowerSync Ready with African optimizations');
  
  return db;
}

// Export the original connector as well for compatibility
export { supabaseConnector };