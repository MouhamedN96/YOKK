# Media Optimization for African Context

## Overview

Media (images, audio, video) accounts for 60-80% of mobile data usage. In African markets where data costs $5-10/GB and users pay per megabyte, unoptimized media is the fastest way to lose users. This component provides proven techniques from WhatsApp, Instagram Lite, and African unicorns like Wave.

**Key Impact:**
- Opus audio: 100x smaller than WAV, 10x smaller than MP3
- AVIF images: 50% smaller than JPEG, 30% smaller than WebP
- Proper compression: 80-90% bandwidth reduction
- User retention: +40% when app uses <10MB/month

## The African Media Challenge

### The Data Cost Reality

```
User with 1GB data bundle ($5):
- Instagram (global): 100MB/hour scrolling = 10 hours = $0.50/hour
- TikTok (global): 150MB/hour = 6.6 hours = $0.75/hour
- WhatsApp (optimized): 5MB/hour = 200 hours = $0.025/hour

Your app's media cost determines retention
```

### Bandwidth Economics

```
10,000 daily active users, 30 min app usage/day:

Unoptimized app (typical Western app):
- Images: 2MB/min (high-res JPEGs)
- Total: 60MB/user/day
- Monthly: 1.8GB/user
- User cost: $9-18/month (unsustainable)

Optimized app (African best practices):
- Images: 200KB/min (AVIF, lazy load)
- Total: 6MB/user/day
- Monthly: 180MB/user
- User cost: $0.90-1.80/month (viable)

Result: 10x reduction in user data cost
```

## Image Optimization

### Format Selection Strategy

**Decision Tree:**
```
Is it a photo?
├─ Yes → Use AVIF (50% smaller than JPEG)
│   └─ Fallback to WebP for older browsers
│
└─ No (logo, icon, illustration)
    └─ Use SVG if vector
    └─ Use WebP if raster
```

### AVIF Implementation

```typescript
// Using sharp for server-side optimization
import sharp from 'sharp';

async function optimizeImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .avif({
      quality: 60, // Sweet spot for photos
      effort: 4, // Balance encoding time vs size
    })
    .toBuffer();
}

// Savings example:
// Original JPEG: 2.5MB (4000×3000, quality 90)
// Optimized AVIF: 120KB (1200×900, quality 60)
// Reduction: 95%
```

### Responsive Images

```typescript
// Generate multiple sizes for different screens
async function generateResponsiveImages(input: Buffer) {
  const sizes = [320, 640, 1024, 1920];

  const variants = await Promise.all(
    sizes.map(async (width) => ({
      width,
      url: await uploadOptimizedImage(input, width),
    }))
  );

  return variants;
}

// In React Native
function OptimizedImage({ source, width }: Props) {
  // Select appropriate size based on device
  const deviceWidth = Dimensions.get('window').width;
  const pixelRatio = PixelRatio.get();
  const targetWidth = deviceWidth * pixelRatio;

  const selectedVariant = variants.find((v) => v.width >= targetWidth) || variants[variants.length - 1];

  return <Image source={{ uri: selectedVariant.url }} />;
}
```

### Lazy Loading (Critical for Feeds)

```typescript
// React Native with FlashList
import { FlashList } from '@shopify/flash-list';
import FastImage from 'react-native-fast-image';

function Feed({ posts }: Props) {
  return (
    <FlashList
      data={posts}
      renderItem={({ item }) => (
        <FastImage
          source={{
            uri: item.imageUrl,
            priority: FastImage.priority.normal,
          }}
          style={{ width: '100%', height: 200 }}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      estimatedItemSize={220}
      // Only load images in viewport + 2 screens
      removeClippedSubviews
      maxToRenderPerBatch={5}
      windowSize={5}
    />
  );
}
```

### Progressive Loading (WhatsApp Pattern)

```typescript
// Show low-quality placeholder first, then full quality
import { useState, useEffect } from 'react';

function ProgressiveImage({ src, placeholder }: Props) {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
  }, [src]);

  return (
    <Image
      source={{ uri: currentSrc }}
      style={[styles.image, loading && styles.blur]}
    />
  );
}

// Placeholder generation (server-side)
async function generatePlaceholder(input: Buffer): Promise<string> {
  const placeholder = await sharp(input)
    .resize(20, 20, { fit: 'inside' })
    .blur(2)
    .avif({ quality: 20 })
    .toBuffer();

  // Return as base64 data URI (1-2KB)
  return `data:image/avif;base64,${placeholder.toString('base64')}`;
}
```

### Image CDN with Cloudflare

```typescript
// Use Cloudflare Image Resizing (zero egress cost)
function getOptimizedImageUrl(originalUrl: string, width: number): string {
  return `https://yourdomain.com/cdn-cgi/image/width=${width},quality=60,format=avif/${originalUrl}`;
}

// Benefits:
// 1. Automatic format selection (AVIF → WebP → JPEG fallback)
// 2. Automatic size optimization
// 3. Zero egress fees (Cloudflare R2 + Image Resizing)
// 4. Edge caching (instant delivery)
```

## Audio Optimization (Critical for Voice Apps)

### Opus Codec (100x Compression)

**Why Opus for Africa:**
- Designed for VoIP and real-time communication
- Optimized for speech at 12-16 kbps (vs 128 kbps MP3)
- Works on all modern browsers and React Native
- 100x smaller than WAV, 10x smaller than MP3

**Bandwidth Math:**
```
1-minute voice note:

WAV (uncompressed):
- 44.1kHz, 16-bit stereo
- Size: 10.5MB
- Data cost: $0.05-0.10

MP3 (128 kbps):
- Size: 960KB
- Data cost: $0.005-0.01

Opus (12 kbps):
- Size: 90KB
- Data cost: $0.0005-0.001

For 100 voice notes/month:
- WAV: 1GB = $5-10
- MP3: 96MB = $0.50-1.00
- Opus: 9MB = $0.05-0.10

Result: 100x cost reduction (WAV → Opus)
```

### Server-Side Opus Encoding

```typescript
// Using ffmpeg to convert to Opus
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function convertToOpus(inputPath: string, outputPath: string) {
  await execAsync(
    `ffmpeg -i ${inputPath} -c:a libopus -b:a 12k -vbr on -compression_level 10 ${outputPath}`
  );

  // Flags explained:
  // -c:a libopus: Use Opus codec
  // -b:a 12k: 12 kbps bitrate (perfect for speech)
  // -vbr on: Variable bitrate (better quality)
  // -compression_level 10: Maximum compression
}
```

### React Native Opus Recording

```typescript
// Using expo-av with Opus
import { Audio } from 'expo-av';

async function startRecording() {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync({
    isMeteringEnabled: true,
    android: {
      extension: '.opus',
      outputFormat: Audio.AndroidOutputFormat.OGG_OPUS,
      audioEncoder: Audio.AndroidAudioEncoder.OPUS,
      sampleRate: 16000, // 16kHz sufficient for voice
      numberOfChannels: 1, // Mono
      bitRate: 12000, // 12 kbps
    },
    ios: {
      extension: '.opus',
      outputFormat: Audio.IOSOutputFormat.OPUS,
      audioQuality: Audio.IOSAudioQuality.MIN, // Optimized for size
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 12000,
    },
    web: {
      mimeType: 'audio/ogg;codecs=opus',
      bitsPerSecond: 12000,
    },
  });

  return recording;
}
```

### Streaming Audio (WhatsApp Pattern)

```typescript
// Stream audio chunks as they're recorded
async function streamRecording(onChunk: (chunk: ArrayBuffer) => void) {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 12000,
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      event.data.arrayBuffer().then(onChunk);
    }
  };

  // Send chunks every 1 second
  mediaRecorder.start(1000);

  // User sees instant progress, uploads in background
}
```

## Video Optimization (If Required)

### Format Selection

```
Video codec priority (African context):
1. H.265 (HEVC) - 50% smaller than H.264, but encoding cost higher
2. H.264 (AVC) - Universal support, good compression
3. VP9 - Free, similar to H.265, Chrome/Android support

Avoid:
- Uncompressed formats
- H.264 High Profile (decoding too heavy for low-end devices)
```

### Adaptive Bitrate Streaming

```typescript
// Generate multiple quality levels
async function generateVideoVariants(input: string) {
  const variants = [
    { name: '360p', bitrate: '400k', resolution: '640x360' },
    { name: '480p', bitrate: '800k', resolution: '854x480' },
    { name: '720p', bitrate: '1500k', resolution: '1280x720' },
  ];

  for (const variant of variants) {
    await execAsync(`
      ffmpeg -i ${input}
      -c:v libx264 -preset medium -crf 23
      -b:v ${variant.bitrate}
      -vf scale=${variant.resolution}
      -c:a aac -b:a 64k
      ${variant.name}.mp4
    `);
  }

  // Return manifest for adaptive streaming
  return generateHLSManifest(variants);
}
```

### Video Loading Strategy

```typescript
// Only load video when user explicitly plays it
function VideoPost({ post }: Props) {
  const [shouldLoad, setShouldLoad] = useState(false);

  return (
    <View>
      {!shouldLoad ? (
        <TouchableOpacity onPress={() => setShouldLoad(true)}>
          <Image source={{ uri: post.thumbnail }} />
          <PlayButton />
        </TouchableOpacity>
      ) : (
        <Video
          source={{ uri: post.videoUrl }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
      )}
    </View>
  );
}

// Saves massive bandwidth - only users who actually watch videos download them
```

## Compression Best Practices

### Image Compression Guidelines

```typescript
const COMPRESSION_PROFILES = {
  // Profile photos (must be sharp)
  profile: {
    format: 'avif',
    quality: 70,
    maxWidth: 800,
    maxHeight: 800,
  },

  // Feed images (can be more compressed)
  feed: {
    format: 'avif',
    quality: 60,
    maxWidth: 1200,
    maxHeight: 1200,
  },

  // Thumbnails (very aggressive)
  thumbnail: {
    format: 'avif',
    quality: 50,
    maxWidth: 400,
    maxHeight: 400,
  },

  // Cover images (need quality)
  cover: {
    format: 'avif',
    quality: 75,
    maxWidth: 1920,
    maxHeight: 1080,
  },
};
```

### Automatic Compression Pipeline

```typescript
// Supabase Edge Function for automatic optimization
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import sharp from 'https://esm.sh/sharp@0.32.0';

serve(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const profile = formData.get('profile') as keyof typeof COMPRESSION_PROFILES;

  const buffer = await file.arrayBuffer();
  const config = COMPRESSION_PROFILES[profile];

  const optimized = await sharp(Buffer.from(buffer))
    .resize(config.maxWidth, config.maxHeight, { fit: 'inside' })
    .avif({ quality: config.quality })
    .toBuffer();

  // Upload to R2
  await uploadToR2(optimized);

  return new Response(JSON.stringify({ url: publicUrl }));
});
```

## Client-Side Optimization

### Pre-Upload Compression (Mobile)

```typescript
// Compress on device before uploading
import * as ImageManipulator from 'expo-image-manipulator';

async function compressBeforeUpload(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }], // Maintain aspect ratio
    {
      compress: 0.7, // 70% quality
      format: ImageManipulator.SaveFormat.JPEG, // AVIF not yet supported
    }
  );

  // Upload compressed version
  return uploadImage(result.uri);
}

// Savings: 3MB photo → 300KB before upload
// Reduces upload time 10x on 3G
// Saves user's upload bandwidth
```

### Download Size Monitoring

```typescript
// Track how much data your app uses
async function trackDataUsage() {
  const beforeSize = await getNetworkUsage();

  // User session...

  const afterSize = await getNetworkUsage();
  const sessionUsage = afterSize - beforeSize;

  // Alert if session exceeded 10MB
  if (sessionUsage > 10 * 1024 * 1024) {
    console.warn(`High data usage: ${sessionUsage / 1024 / 1024}MB`);
    await sendAnalytics('high_data_usage', { mb: sessionUsage / 1024 / 1024 });
  }
}
```

## Caching Strategy for Media

### Service Worker Caching (Web/PWA)

```typescript
// Cache images aggressively
const CACHE_NAME = 'media-v1';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache all images
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
  }
});
```

### React Native Caching

```typescript
// Use react-native-fast-image for automatic caching
import FastImage from 'react-native-fast-image';

FastImage.preload([
  { uri: 'https://example.com/image1.avif' },
  { uri: 'https://example.com/image2.avif' },
]);

// Images are cached automatically
// No re-download on app restart
```

## Real-World African Examples

### WhatsApp Media Optimization

```
WhatsApp's strategy:
1. Opus audio (12 kbps) for voice notes
2. Progressive JPEG for images (show blur, then full quality)
3. Aggressive compression (60% quality for images)
4. Thumbnail previews (<10KB) before full download
5. User control ("Download when connected to WiFi")

Result: 10x less data than competitors
```

### Instagram Lite

```
Instagram Lite for emerging markets:
1. App size: <2MB (vs 100MB+ for main app)
2. Images: WebP at 50-60% quality
3. Videos: Disabled by default, 360p max
4. Feed preloading: Disabled (load on scroll)
5. Stories: Lower bitrate, 480p max

Result: 95% data reduction vs main app
```

### YOKK Voice Implementation

```typescript
// YOKK's voice note implementation
async function recordAndUpload() {
  // 1. Record in Opus (12 kbps)
  const recording = await startOpusRecording();

  // 2. Stream to server in real-time
  recording.onDataAvailable = async (chunk) => {
    await uploadChunk(chunk); // Background upload
  };

  // 3. Transcribe with Groq Whisper (fast, cheap)
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
  });

  // Result: 1-min voice note = 90KB upload
  // User sees instant feedback (streaming)
  // Transcription for accessibility
}
```

## Monitoring and Metrics

### Track Media Performance

```typescript
interface MediaMetrics {
  date: string;
  totalImages: number;
  avgImageSize: number; // KB
  totalAudio: number;
  avgAudioDuration: number; // seconds
  avgAudioSize: number; // KB
  bandwidthUsed: number; // GB
  costPerUser: number; // $
}

async function trackMediaMetrics() {
  const metrics = {
    date: new Date().toISOString(),
    totalImages: await countImagesServed(),
    avgImageSize: await getAvgImageSize(),
    totalAudio: await countAudioServed(),
    avgAudioDuration: await getAvgAudioDuration(),
    avgAudioSize: await getAvgAudioSize(),
    bandwidthUsed: await getTotalBandwidth(),
    costPerUser: await calculateCostPerUser(),
  };

  // Alert if avg image size > 200KB
  if (metrics.avgImageSize > 200) {
    await sendAlert('Average image size too high!');
  }

  // Alert if cost per user > $0.10/month for media
  if (metrics.costPerUser > 0.10) {
    await sendAlert('Media costs exceeding target!');
  }
}
```

## Best Practices

1. **Use AVIF for Photos**: 50% smaller than JPEG, universally supported
2. **Use Opus for Voice**: 100x smaller than WAV, perfect for African bandwidth
3. **Lazy Load Everything**: Only load media in viewport
4. **Progressive Loading**: Show blur placeholder instantly
5. **Compress Before Upload**: Save user's upload bandwidth
6. **Cache Aggressively**: Avoid re-downloading
7. **Monitor Data Usage**: Track MB/user/session
8. **Give Users Control**: WiFi-only download options
9. **Optimize for 3G**: Assume slow networks

## Common Pitfalls

### Pitfall 1: High-Quality Obsession
❌ **Wrong:** Serve 4K images for mobile feed
✅ **Correct:** 1200px width at 60% quality is plenty

### Pitfall 2: Ignoring Upload Bandwidth
❌ **Wrong:** Let users upload 10MB photos
✅ **Correct:** Compress to <500KB before upload

### Pitfall 3: No Fallback for Slow Networks
❌ **Wrong:** Load all images immediately
✅ **Correct:** Progressive loading with placeholders

### Pitfall 4: Video Autoplay
❌ **Wrong:** Autoplay videos in feed (data vampire!)
✅ **Correct:** Thumbnail + play button, user controls playback

## References

- **AVIF**: https://web.dev/compress-images-avif/
- **Opus Codec**: https://opus-codec.org/
- **Sharp**: https://sharp.pixelplumbing.com/
- **FFmpeg Opus**: https://trac.ffmpeg.org/wiki/Encode/Opus
- **FastImage**: https://github.com/DylanVann/react-native-fast-image

---

**Last Updated**: 2025-12-31
**African Optimization**: CRITICAL for user retention
**YOKK Validation**: 90KB voice notes vs 10MB industry standard
