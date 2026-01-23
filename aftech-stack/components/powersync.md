# PowerSync - Offline-First Sync

## Overview

PowerSync is a sync engine that enables offline-first mobile and web apps. It provides local SQLite database with bidirectional sync to Postgres (via Supabase), ensuring apps work seamlessly offline and sync when connected.

**Key Features:**
- Offline-first SQLite database
- Bidirectional sync with Postgres
- SQLCipher encryption support
- React hooks for queries
- Automatic conflict resolution
- Real-time updates

## When to Use

- Building mobile apps that must work offline
- Apps with unreliable network conditions
- Need local database performance
- Require encrypted local storage
- Multi-user collaborative features
- Apps with complex data relationships

## Installation

```bash
# Install PowerSync SDK
npx expo install @powersync/react-native @powersync/common

# Install dependencies
npx expo install react-native-sqlite-storage
npx expo install expo-file-system

# For SQLCipher encryption (optional but recommended)
npx expo install @powersync/react-native-sqlcipher
```

## Setup

### 1. Define Schema

Create `lib/powersync/schema.ts`:

```typescript
import { column, Schema, Table } from '@powersync/common';

// Define your data model
const todos = new Table(
  {
    list_id: column.text,
    created_at: column.text,
    completed_at: column.text,
    description: column.text,
    created_by: column.text,
    completed_by: column.text,
    completed: column.integer, // Use integer for booleans
  },
  { indexes: { list: ['list_id'] } }
);

const lists = new Table({
  created_at: column.text,
  name: column.text,
  owner_id: column.text,
});

// Export the schema
export const AppSchema = new Schema({
  todos,
  lists,
});

export type Database = (typeof AppSchema)['types'];
export type TodoRecord = Database['todos'];
export type ListRecord = Database['lists'];
```

### 2. Configure PowerSync

Create `lib/powersync/system.ts`:

```typescript
import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './schema';
import { supabaseConnector } from './supabase-connector';

// Initialize PowerSync
export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'powersync.db',
    // Enable encryption (requires SQLCipher)
    // encryptionKey: await getEncryptionKey(),
  },
});

// Connect to backend
export async function initializePowerSync() {
  await powerSync.init();
  await powerSync.connect(supabaseConnector);
}
```

### 3. Create Supabase Connector

Create `lib/powersync/supabase-connector.ts`:

```typescript
import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/common';
import { supabase } from '../supabase/client';

export const supabaseConnector: PowerSyncBackendConnector = {
  async fetchCredentials() {
    // Get auth token for PowerSync
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Not authenticated');
    }

    return {
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL!,
      token: session.data.session.access_token,
    };
  },

  async uploadData(database: AbstractPowerSyncDatabase) {
    // Upload local changes to Supabase
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
        await applyOperation(op);
      }
      await transaction.complete();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};

async function applyOperation(op: CrudEntry) {
  const table = supabase.from(op.table);

  switch (op.op) {
    case UpdateType.PUT:
      await table.upsert(op.opData);
      break;
    case UpdateType.PATCH:
      await table.update(op.opData).eq('id', op.id);
      break;
    case UpdateType.DELETE:
      await table.delete().eq('id', op.id);
      break;
  }
}
```

### 4. Provider Setup

Wrap your app in `app/_layout.tsx`:

```typescript
import { PowerSyncContext } from '@powersync/react-native';
import { powerSync, initializePowerSync } from '@/lib/powersync/system';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializePowerSync().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <PowerSyncContext.Provider value={powerSync}>
      <Slot />
    </PowerSyncContext.Provider>
  );
}
```

## Core Patterns

### Pattern 1: Querying Data

Use the `useQuery` hook for reactive queries:

```typescript
import { useQuery } from '@powersync/react-native';

function TodoList({ listId }: { listId: string }) {
  // Query automatically updates when data changes
  const { data: todos } = useQuery<TodoRecord>(
    'SELECT * FROM todos WHERE list_id = ? ORDER BY created_at DESC',
    [listId]
  );

  return (
    <FlatList
      data={todos}
      renderItem={({ item }) => <TodoItem todo={item} />}
    />
  );
}
```

### Pattern 2: Writing Data

Use the PowerSync instance for writes:

```typescript
import { usePowerSync } from '@powersync/react-native';
import { v4 as uuid } from 'uuid';

function CreateTodo() {
  const powerSync = usePowerSync();

  async function createTodo(description: string, listId: string) {
    await powerSync.execute(
      'INSERT INTO todos (id, description, list_id, created_at, completed) VALUES (?, ?, ?, ?, ?)',
      [uuid(), description, listId, new Date().toISOString(), 0]
    );
    // Automatically syncs to server when online
  }

  async function toggleTodo(id: string, completed: boolean) {
    await powerSync.execute(
      'UPDATE todos SET completed = ?, completed_at = ? WHERE id = ?',
      [completed ? 1 : 0, completed ? new Date().toISOString() : null, id]
    );
  }

  async function deleteTodo(id: string) {
    await powerSync.execute('DELETE FROM todos WHERE id = ?', [id]);
  }
}
```

### Pattern 3: Complex Queries with Joins

```typescript
function useUserLists(userId: string) {
  const { data: lists } = useQuery(
    `SELECT
      lists.*,
      COUNT(todos.id) as todo_count,
      SUM(CASE WHEN todos.completed = 1 THEN 1 ELSE 0 END) as completed_count
    FROM lists
    LEFT JOIN todos ON lists.id = todos.list_id
    WHERE lists.owner_id = ?
    GROUP BY lists.id
    ORDER BY lists.created_at DESC`,
    [userId]
  );

  return lists;
}
```

### Pattern 4: Watch for Changes

Monitor sync status:

```typescript
import { usePowerSync } from '@powersync/react-native';
import { useEffect, useState } from 'react';

function SyncStatus() {
  const powerSync = usePowerSync();
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const subscription = powerSync.currentStatus.subscribe((status) => {
      setIsConnected(status.connected);
      setIsSyncing(status.uploading || status.downloading);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View>
      <Text>Connected: {isConnected ? '✓' : '✗'}</Text>
      <Text>Syncing: {isSyncing ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

## Integration with Aftech-stack

### With Supabase

PowerSync syncs with Supabase Postgres via sync rules:

```sql
-- Supabase sync rules (in PowerSync dashboard)
bucket_definitions:
  global:
    data:
      - SELECT * FROM lists
      - SELECT * FROM todos

-- RLS policies ensure security
CREATE POLICY "Users can see their own lists"
  ON lists FOR SELECT
  USING (auth.uid() = owner_id);
```

### With Supabase Auth

Use Supabase session for PowerSync auth:

```typescript
// In supabase-connector.ts
const session = await supabase.auth.getSession();
return {
  endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL!,
  token: session.data.session.access_token,
};
```

### With React Native/Expo

PowerSync works seamlessly with Expo:

```typescript
// Use standard React hooks
const todos = useQuery('SELECT * FROM todos');

// Integrates with React Navigation
function TodoScreen({ route }) {
  const { listId } = route.params;
  const todos = useQuery('SELECT * FROM todos WHERE list_id = ?', [listId]);
  // ...
}
```

## Best Practices

1. **Use UUIDs for IDs**: Prevents conflicts in offline scenarios
2. **Index Foreign Keys**: Add indexes for better query performance
3. **Enable SQLCipher**: Encrypt sensitive data at rest
4. **Handle Conflicts**: Implement conflict resolution in connector
5. **Batch Writes**: Use transactions for multiple operations
6. **Monitor Sync**: Show sync status to users
7. **Test Offline**: Always test offline scenarios thoroughly

## Common Pitfalls

### Pitfall 1: Using Auto-increment IDs
❌ **Wrong:**
```sql
CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT)
```

✅ **Correct:**
```typescript
await powerSync.execute(
  'INSERT INTO todos (id, ...) VALUES (?, ...)',
  [uuid(), ...]
);
```

### Pitfall 2: Not Handling Sync Errors
❌ **Wrong:**
```typescript
await powerSync.connect(connector); // Ignores errors
```

✅ **Correct:**
```typescript
try {
  await powerSync.connect(connector);
} catch (error) {
  console.error('Sync error:', error);
  // Show error to user, retry logic, etc.
}
```

### Pitfall 3: Forgetting to Complete Transactions
❌ **Wrong:**
```typescript
const tx = await database.getNextCrudTransaction();
// Process operations but forget to complete
```

✅ **Correct:**
```typescript
const tx = await database.getNextCrudTransaction();
try {
  // Process operations
  await tx.complete();
} catch (error) {
  // Error handling
  throw error;
}
```

## Security with SQLCipher

Enable encryption for sensitive data:

```typescript
import { PowerSyncDatabase } from '@powersync/react-native-sqlcipher';
import * as SecureStore from 'expo-secure-store';

async function getEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync('db-encryption-key');

  if (!key) {
    // Generate new key on first run
    key = generateRandomKey(); // Use crypto.getRandomValues
    await SecureStore.setItemAsync('db-encryption-key', key);
  }

  return key;
}

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'powersync.db',
    encryptionKey: await getEncryptionKey(),
  },
});
```

## References

- **Official Docs**: https://docs.powersync.com/client-sdk-references/react-native-and-expo
- **SQLCipher Support**: https://releases.powersync.com/announcements/announcing-sqlcipher-support

---

**Last Updated**: 2025-12-31
