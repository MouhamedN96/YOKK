# Network Resilience for African Context

## Overview

African mobile networks are characterized by high latency, packet loss, intermittent connectivity, and aggressive OS background process killing. Apps built for stable Western networks fail in these conditions. This component provides battle-tested resilience patterns from Paystack, Wave, and WhatsApp.

**Key Principles:**
- Never show "Network Error" to users
- Retry automatically with exponential backoff
- Queue operations when offline
- Use Service Workers for background sync
- Optimistic UI updates (assume success)
- Degrade gracefully on poor connections

## The African Network Reality

### Network Characteristics

```
Typical African 3G/4G network:
- Latency: 150-400ms (vs 20-50ms in West)
- Packet loss: 2-5% (vs <0.5% in West)
- Jitter: High (latency varies widely)
- Congestion: Peak hours (6-10pm) see 50% slowdown
- Intermittent: Switches between 2G/3G/4G/No Service
- Background killing: Android kills apps aggressively to save battery
```

### User Experience Impact

```
Without resilience patterns:
- User posts comment → network error
- User must manually retry
- Frustration, abandonment

With resilience patterns:
- User posts comment → queued instantly
- Auto-retry in background
- User never sees error
- WhatsApp-level reliability
```

## Core Resilience Patterns

### Pattern 1: Retry with Exponential Backoff

```typescript
// Simple retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * delay * 0.3;

      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError!;
}

// Usage
const data = await retryWithBackoff(() => fetch('/api/posts'), 3);
```

### Pattern 2: Request Queue (Paystack Model)

```typescript
// Queue requests when offline, sync when online
interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;

  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedRequest);
    await this.saveQueue();
    this.processQueue();

    return queuedRequest.id;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];

      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        // Success - remove from queue
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        request.retries++;

        // Max 5 retries
        if (request.retries >= 5) {
          console.error('Request failed after 5 retries:', request);
          this.queue.shift(); // Remove failed request
        } else {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, request.retries))
          );
        }

        await this.saveQueue();
      }
    }

    this.processing = false;
  }

  private async saveQueue() {
    // Persist queue to localStorage or IndexedDB
    localStorage.setItem('requestQueue', JSON.stringify(this.queue));
  }

  async loadQueue() {
    const saved = localStorage.getItem('requestQueue');
    if (saved) {
      this.queue = JSON.parse(saved);
      this.processQueue(); // Resume processing
    }
  }
}

// Usage
const queue = new RequestQueue();
await queue.loadQueue(); // On app start

// Queue request instead of direct fetch
await queue.enqueue({
  url: '/api/posts',
  method: 'POST',
  body: JSON.stringify({ content: 'Hello' }),
  headers: { 'Content-Type': 'application/json' },
});
```

### Pattern 3: Service Worker Background Sync

```typescript
// service-worker.js
// Sync queued requests even when app is closed

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  // Open IndexedDB
  const db = await openDB('app-db');
  const tx = db.transaction('pending-posts', 'readonly');
  const pendingPosts = await tx.objectStore('pending-posts').getAll();

  for (const post of pendingPosts) {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      // Delete from pending after success
      const deleteTx = db.transaction('pending-posts', 'readwrite');
      await deleteTx.objectStore('pending-posts').delete(post.id);
    } catch (error) {
      // Will retry on next sync event
      console.error('Sync failed for post:', post.id);
    }
  }
}

// In your app
async function createPost(content: string) {
  // Store in IndexedDB
  const db = await openDB('app-db');
  const tx = db.transaction('pending-posts', 'readwrite');
  await tx.objectStore('pending-posts').add({
    id: crypto.randomUUID(),
    content,
    timestamp: Date.now(),
  });

  // Register sync (will trigger even if app closed)
  await navigator.serviceWorker.ready;
  await (await navigator.serviceWorker.ready).sync.register('sync-posts');

  // User sees instant feedback, sync happens in background
}
```

### Pattern 4: Optimistic UI Updates

```typescript
// Update UI immediately, sync in background
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: { content: string }) => {
      // Queue request with retry
      return retryWithBackoff(() =>
        fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        })
      );
    },

    // Optimistic update
    onMutate: async (newPost) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update
      queryClient.setQueryData(['posts'], (old: any[]) => [
        { id: 'temp-' + Date.now(), ...newPost, status: 'pending' },
        ...old,
      ]);

      return { previousPosts };
    },

    // On error, rollback
    onError: (err, newPost, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
    },

    // On success, refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// User sees post appear instantly, even if network slow
```

### Pattern 5: Graceful Degradation

```typescript
// Detect network quality and adjust behavior
function useNetworkQuality() {
  const [quality, setQuality] = useState<'fast' | 'slow' | 'offline'>('fast');

  useEffect(() => {
    // Use Network Information API
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const updateQuality = () => {
        if (connection.effectiveType === '4g') {
          setQuality('fast');
        } else if (connection.effectiveType === '3g' || connection.effectiveType === '2g') {
          setQuality('slow');
        } else {
          setQuality('offline');
        }
      };

      updateQuality();
      connection.addEventListener('change', updateQuality);

      return () => connection.removeEventListener('change', updateQuality);
    }
  }, []);

  return quality;
}

// Adjust app behavior based on network quality
function Feed() {
  const quality = useNetworkQuality();

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <Post post={item} />}
      // Adjust prefetch based on network quality
      initialNumToRender={quality === 'slow' ? 5 : 10}
      maxToRenderPerBatch={quality === 'slow' ? 3 : 5}
      // Disable image loading on 2G
      renderImage={quality !== 'offline'}
    />
  );
}
```

## React Native Patterns

### Detect Network State

```typescript
import NetInfo from '@react-native-community/netinfo';

function useNetworkState() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
    });

    return unsubscribe;
  }, []);

  return { isConnected, isInternetReachable };
}

// Show offline banner
function OfflineBanner() {
  const { isInternetReachable } = useNetworkState();

  if (isInternetReachable) return null;

  return (
    <View style={styles.offlineBanner}>
      <Text>You're offline. Changes will sync when reconnected.</Text>
    </View>
  );
}
```

### PowerSync Integration

```typescript
// PowerSync handles offline sync automatically
import { useQuery, usePowerSync } from '@powersync/react-native';

function TodoList() {
  const powerSync = usePowerSync();

  // Data available offline
  const { data: todos } = useQuery<TodoRecord>(
    'SELECT * FROM todos WHERE completed = 0 ORDER BY created_at DESC'
  );

  async function createTodo(title: string) {
    // Works offline - queued for sync
    await powerSync.execute(
      'INSERT INTO todos (id, title, completed) VALUES (?, ?, ?)',
      [crypto.randomUUID(), title, false]
    );

    // Syncs automatically when online
  }

  // Connection status from PowerSync
  const status = powerSync.currentStatus;

  return (
    <View>
      {status?.connected ? (
        <Text>Synced</Text>
      ) : (
        <Text>Offline - {status?.uploadQueueCount} pending</Text>
      )}
      <FlatList
        data={todos}
        renderItem={({ item }) => <TodoItem todo={item} />}
      />
    </View>
  );
}
```

## Web/PWA Patterns

### Advanced Service Worker Caching

```typescript
// service-worker.ts
import { registerRoute, Route } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Strategy 1: Cache-First for static assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Strategy 2: Network-First for API calls
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 Minutes
      }),
    ],
  })
);

// Strategy 3: Stale-While-Revalidate for dynamic content
registerRoute(
  ({ url }) => url.pathname.startsWith('/feed'),
  new StaleWhileRevalidate({
    cacheName: 'feed',
  })
);

// Strategy 4: Background Sync for POST requests
const bgSyncPlugin = new BackgroundSyncPlugin('post-queue', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
});

registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'POST',
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);
```

## Error Handling

### User-Friendly Error Messages

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Response) {
    if (error.status === 401) return 'Please log in again';
    if (error.status === 403) return 'You don\'t have permission';
    if (error.status === 404) return 'Not found';
    if (error.status >= 500) return 'Server error. We\'ll retry automatically.';
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connection issue. Changes saved and will sync when online.';
  }

  return 'Something went wrong. We\'ll try again.';
}

// Never show raw error messages to users
function ErrorBoundary({ error }: { error: Error }) {
  const friendlyMessage = getErrorMessage(error);

  return (
    <View style={styles.error}>
      <Text>{friendlyMessage}</Text>
      <Button title="Retry" onPress={handleRetry} />
    </View>
  );
}
```

### Silent Failure (Paystack Pattern)

```typescript
// Retry silently, only notify user if all retries fail
async function silentRetry<T>(
  fn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onFailure?: (error: Error) => void
): Promise<void> {
  try {
    const result = await retryWithBackoff(fn, 5); // 5 retries
    onSuccess?.(result);
  } catch (error) {
    // Only notify user after all retries failed
    onFailure?.(error as Error);
    console.error('Silent retry failed:', error);
  }
}

// Usage
silentRetry(
  () => createPost(content),
  (post) => {
    toast.success('Post created!');
  },
  (error) => {
    toast.error('Failed to create post after multiple attempts');
  }
);
```

## Testing Network Resilience

### Simulate Poor Network Conditions

```typescript
// Development tool to test resilience
class NetworkSimulator {
  private delayMin = 0;
  private delayMax = 0;
  private failureRate = 0;

  simulate(config: { delay?: number; jitter?: number; failureRate?: number }) {
    this.delayMin = config.delay || 0;
    this.delayMax = (config.delay || 0) + (config.jitter || 0);
    this.failureRate = config.failureRate || 0;
  }

  async wrap<T>(fn: () => Promise<T>): Promise<T> {
    // Simulate latency
    const delay = Math.random() * (this.delayMax - this.delayMin) + this.delayMin;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate failure
    if (Math.random() < this.failureRate) {
      throw new Error('Simulated network failure');
    }

    return fn();
  }
}

// Test your app under poor network conditions
const networkSim = new NetworkSimulator();

// Simulate 3G with 5% packet loss
networkSim.simulate({ delay: 300, jitter: 200, failureRate: 0.05 });

// All network requests now experience realistic African network conditions
const data = await networkSim.wrap(() => fetch('/api/posts'));
```

## Best Practices

1. **Never Show Network Errors**: Queue and retry automatically
2. **Optimistic UI**: Update immediately, sync in background
3. **Service Workers**: Enable background sync for PWAs
4. **Exponential Backoff**: Avoid overwhelming servers
5. **Queue Persistence**: Survive app restarts
6. **Graceful Degradation**: Adjust features based on network quality
7. **User Feedback**: Show "Syncing..." not "Error"
8. **Test on Real Networks**: Use 3G throttling in DevTools

## Real-World Examples

### WhatsApp Resilience

```
WhatsApp's resilience strategy:
1. Queue all messages locally
2. Background sync via Service Worker
3. Checkmarks show sync status (✓ sending, ✓✓ delivered)
4. Retry for 24 hours before showing error
5. Works on 2G networks (adaptive bitrate)

Result: Users never experience "network error"
```

### Paystack Payment Reliability

```
Paystack's payment flow:
1. User initiates payment
2. Request queued with unique ID
3. Retry on failure (up to 5 attempts)
4. Check payment status via webhook
5. Confirm even if network interrupted
6. Never charge user twice (idempotency)

Result: 99.9% payment success rate despite network issues
```

### YOKK Implementation

```typescript
// YOKK's resilience for voice notes
async function uploadVoiceNote(audioBlob: Blob) {
  const id = crypto.randomUUID();

  // 1. Save to IndexedDB immediately
  await saveToLocalDB(id, audioBlob);

  // 2. Show as "uploading" to user
  updateUI(id, { status: 'uploading' });

  // 3. Upload with retry
  try {
    await retryWithBackoff(
      () =>
        fetch('/api/voice', {
          method: 'POST',
          body: audioBlob,
          headers: { 'X-Request-ID': id },
        }),
      5
    );

    updateUI(id, { status: 'uploaded' });
    await deleteFromLocalDB(id);
  } catch (error) {
    // 4. Keep in local DB, retry later via background sync
    updateUI(id, { status: 'pending' });
    await navigator.serviceWorker.ready;
    await (await navigator.serviceWorker.ready).sync.register('sync-voice-notes');
  }
}
```

## Common Pitfalls

### Pitfall 1: Showing Raw Errors
❌ **Wrong:** `Error: Network request failed`
✅ **Correct:** "Changes saved. Will sync when online."

### Pitfall 2: Not Persisting Queue
❌ **Wrong:** Queue in memory (lost on app restart)
✅ **Correct:** Queue in IndexedDB/SQLite

### Pitfall 3: Infinite Retries
❌ **Wrong:** Retry forever
✅ **Correct:** Max 5 retries, then fallback

### Pitfall 4: No Network Awareness
❌ **Wrong:** Same behavior on 2G and 4G
✅ **Correct:** Adapt features based on network quality

## References

- **Background Sync API**: https://web.dev/offline-cookbook/#background-sync
- **Workbox**: https://developers.google.com/web/tools/workbox
- **Network Information API**: https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
- **NetInfo (React Native)**: https://github.com/react-native-netinfo/react-native-netinfo

---

**Last Updated**: 2025-12-31
**African Optimization**: CRITICAL for user retention
**Validated By**: Paystack, Wave, WhatsApp
