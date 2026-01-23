/**
 * Cloudflare R2 Storage Integration for African Market
 * Implements zero-egress cost storage for viral content and media
 */

// Cloudflare R2 client wrapper for African market optimization
export class CloudflareR2Client {
  private accountID: string;
  private accessKeyID: string;
  private secretAccessKey: string;
  private bucketName: string;
  
  constructor(
    accountID: string = process.env.CLOUDFLARE_ACCOUNT_ID || '',
    accessKeyID: string = process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: string = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    bucketName: string = process.env.CLOUDFLARE_R2_BUCKET || 'yokk-media'
  ) {
    this.accountID = accountID;
    this.accessKeyID = accessKeyID;
    this.secretAccessKey = secretAccessKey;
    this.bucketName = bucketName;
    
    if (!accountID || !accessKeyID || !secretAccessKey) {
      console.warn('Cloudflare R2 credentials not fully configured');
    }
  }
  
  /**
   * Upload file to R2 with African market optimizations
   */
  async uploadFile(
    file: File | Blob | ArrayBuffer,
    key: string,
    options: {
      contentType?: string;
      cacheControl?: string;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.accountID || !this.accessKeyID || !this.secretAccessKey) {
      return { 
        success: false, 
        error: 'Cloudflare R2 credentials not configured' 
      };
    }
    
    try {
      // Prepare form data for upload
      const formData = new FormData();

      // Add file - convert Blob to File if needed
      const blob = file instanceof Blob ? file : new Blob([file]);
      const fileToUpload = blob instanceof File ? blob : new File([blob], key, { type: blob.type });
      formData.append('file', fileToUpload);
      
      // Add metadata
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([k, v]) => {
          formData.append(`metadata-${k}`, v);
        });
      }
      
      // Construct R2 URL
      const url = `https://${this.accountID}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
      
      // Upload using signed URL approach or direct upload
      const response = await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: {
          'Authorization': this.generateAuthHeader('PUT', key),
          'Content-Type': options.contentType || 'application/octet-stream',
          'Cache-Control': options.cacheControl || 'public, max-age=31536000', // 1 year cache
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const fileUrl = `https://${this.accountID}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
      
      return { 
        success: true, 
        url: fileUrl 
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }
  
  /**
   * Generate authorization header for R2
   */
  private generateAuthHeader(method: string, key: string): string {
    // Simplified auth header generation
    // In production, use proper AWS Signature V4 signing
    const date = new Date().toUTCString();
    const stringToSign = `${method}\n\n\n${date}\n/${this.bucketName}/${key}`;
    
    // This is a simplified version - in production, implement full AWS SigV4
    return `AWS4-HMAC-SHA256 Credential=${this.accessKeyID}/...`;
  }
  
  /**
   * Get public URL for file
   */
  getFileUrl(key: string): string {
    return `https://${this.accountID}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
  }
  
  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    if (!this.accountID || !this.accessKeyID || !this.secretAccessKey) {
      return { 
        success: false, 
        error: 'Cloudflare R2 credentials not configured' 
      };
    }
    
    try {
      const url = `https://${this.accountID}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': this.generateAuthHeader('DELETE', key),
        }
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('R2 delete error:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }
}

// African media uploader with R2 integration
export class AfricanMediaUploader {
  private r2Client: CloudflareR2Client;
  
  constructor(r2Client?: CloudflareR2Client) {
    this.r2Client = r2Client || new CloudflareR2Client();
  }
  
  /**
   * Upload optimized media to R2
   */
  async uploadOptimizedMedia(
    file: File,
    options: {
      userId?: string;
      contentType?: string;
      optimizeForAfrica?: boolean;
    } = {}
  ): Promise<{ success: boolean; url?: string; error?: string; sizeSavedKB?: number }> {
    const { userId, contentType, optimizeForAfrica = true } = options;
    
    try {
      let uploadFile = file;
      let sizeSavedKB = 0;
      
      // Apply African optimizations if requested
      if (optimizeForAfrica) {
        if (file.type.startsWith('image/')) {
          // For images, we'd normally convert to AVIF here
          // Using the optimizer from our media module
          const { ImageOptimizer } = await import('@/lib/media/optimizer');
          const optimizedBlob = await ImageOptimizer.optimizeImage(file, 60);
          // Convert Blob to File
          uploadFile = new File([optimizedBlob], file.name, { type: optimizedBlob.type });
          sizeSavedKB = file.size - uploadFile.size;
        } else if (file.type.startsWith('audio/')) {
          // For audio, we'd normally convert to Opus here
          const { AudioOptimizer } = await import('@/lib/media/optimizer');
          const optimizedBuffer = await AudioOptimizer.optimizeAudio(await file.arrayBuffer());
          uploadFile = new File([optimizedBuffer], file.name, { type: 'audio/opus' });
          sizeSavedKB = file.size - optimizedBuffer.size;
        }
      }
      
      // Generate unique key with user context
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const extension = uploadFile.name.split('.').pop() || 'bin';
      const key = userId 
        ? `users/${userId}/${timestamp}_${randomSuffix}.${extension}`
        : `public/${timestamp}_${randomSuffix}.${extension}`;
      
      // Upload to R2
      const result = await this.r2Client.uploadFile(uploadFile, key, {
        contentType: contentType || uploadFile.type || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000', // Long cache for CDN efficiency
        metadata: {
          originalName: file.name,
          originalSize: file.size.toString(),
          uploadedAt: new Date().toISOString(),
          userId: userId || 'anonymous',
          optimized: optimizeForAfrica.toString()
        }
      });
      
      if (result.success && result.url) {
        return {
          success: true,
          url: result.url,
          sizeSavedKB: Math.round(sizeSavedKB / 1024)
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }
    } catch (error) {
      console.error('Media upload error:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Batch upload for viral content (efficient for African market)
   */
  async batchUpload(
    files: File[],
    userId?: string,
    onProgress?: (progress: { current: number; total: number; percent: number }) => void
  ): Promise<Array<{ fileName: string; success: boolean; url?: string; error?: string }>> {
    const results: Array<{ fileName: string; success: boolean; url?: string; error?: string }> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Report progress
      if (onProgress) {
        onProgress({
          current: i,
          total: files.length,
          percent: Math.round((i / files.length) * 100)
        });
      }
      
      const result = await this.uploadOptimizedMedia(file, { userId });
      results.push({
        fileName: file.name,
        success: result.success,
        url: result.url,
        error: result.error
      });
    }
    
    // Report final progress
    if (onProgress) {
      onProgress({
        current: files.length,
        total: files.length,
        percent: 100
      });
    }
    
    return results;
  }
}

// R2 cost calculator for African market
export class R2CostCalculator {
  /**
   * Calculate storage and egress costs compared to AWS S3
   */
  static calculateCostComparison(
    storageGB: number,
    egressGB: number,
    requests: number
  ): {
    s3: { storage: number; egress: number; requests: number; total: number };
    r2: { storage: number; egress: number; requests: number; total: number };
    savings: number; // Amount saved by using R2
    savingsPercent: number; // Percentage savings
  } {
    // AWS S3 pricing (approximate)
    const s3StorageCostPerGB = 0.023; // $0.023 per GB-month
    const s3EgressCostPerGB = 0.09;  // $0.09 per GB
    const s3RequestCostPer1000 = 0.004; // $0.004 per 1000 requests
    
    // Cloudflare R2 pricing
    const r2StorageCostPerGB = 0.015; // $0.015 per GB-month
    const r2EgressCostPerGB = 0;     // $0.00 per GB (zero egress fee)
    const r2RequestCostPer1000 = 0;   // $0.00 per 1000 requests (first 10M/month free)
    
    const s3Costs = {
      storage: storageGB * s3StorageCostPerGB,
      egress: egressGB * s3EgressCostPerGB,
      requests: (requests / 1000) * s3RequestCostPer1000,
      total: 0
    };
    s3Costs.total = s3Costs.storage + s3Costs.egress + s3Costs.requests;
    
    const r2Costs = {
      storage: storageGB * r2StorageCostPerGB,
      egress: egressGB * r2EgressCostPerGB,
      requests: (requests / 1000) * r2RequestCostPer1000,
      total: 0
    };
    r2Costs.total = r2Costs.storage + r2Costs.egress + r2Costs.requests;
    
    const savings = s3Costs.total - r2Costs.total;
    const savingsPercent = s3Costs.total > 0 ? (savings / s3Costs.total) * 100 : 0;
    
    return {
      s3: s3Costs,
      r2: r2Costs,
      savings,
      savingsPercent: Math.round(savingsPercent * 100) / 100
    };
  }
  
  /**
   * Calculate African market savings
   */
  static calculateAfricanMarketSavings(monthlyUsers: number): {
    monthlySavings: number;
    yearlySavings: number;
    costPerUser: number;
    viralContentProtection: number; // Savings from zero egress on viral content
  } {
    // Estimate based on African market usage patterns
    const avgStoragePerUserGB = 0.1; // 100MB per user
    const avgEgressPerUserGB = 0.5;  // 500MB egress per user (content consumption)
    const avgRequestsPerUser = 100;   // 100 requests per user per month
    
    const totalStorageGB = monthlyUsers * avgStoragePerUserGB;
    const totalEgressGB = monthlyUsers * avgEgressPerUserGB;
    const totalRequests = monthlyUsers * avgRequestsPerUser;
    
    const comparison = this.calculateCostComparison(totalStorageGB, totalEgressGB, totalRequests);
    
    return {
      monthlySavings: comparison.savings,
      yearlySavings: comparison.savings * 12,
      costPerUser: comparison.r2.total / monthlyUsers,
      viralContentProtection: comparison.s3.egress // Amount saved due to zero egress
    };
  }
}

// Initialize R2 integration
export async function initializeR2Integration(): Promise<CloudflareR2Client> {
  const r2Client = new CloudflareR2Client();
  
  // Verify configuration
  if (!r2Client['accountID'] || !r2Client['accessKeyID'] || !r2Client['secretAccessKey']) {
    console.warn('Cloudflare R2 not fully configured - using fallback storage');
  } else {
    console.log('Cloudflare R2 integration initialized');
  }
  
  return r2Client;
}

// Export a singleton instance for easy access
let r2Instance: CloudflareR2Client | null = null;

export async function getR2Client(): Promise<CloudflareR2Client> {
  if (!r2Instance) {
    r2Instance = await initializeR2Integration();
  }
  return r2Instance;
}