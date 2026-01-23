# Offline-First Todo App - Complete Example

## Use Case

A mobile todo list app that works perfectly offline, syncs when connected, and includes AI-powered smart suggestions. Users can create, edit, and complete todos even without internet, with automatic sync to Supabase when online.

## Architecture

```
┌─────────────────┐
│  React Native   │
│  + Expo Router  │
└────────┬────────┘
         │
    ┌────▼────┐
    │PowerSync│ (Local SQLite + Sync)
    └────┬────┘
         │
    ┌────▼────┐
    │Supabase │ (Postgres + Auth)
    └────┬────┘
         │
    ┌────▼────┐
    │OpenRouter│ (AI suggestions)
    └──────────┘
```

## File Structure

```
app/
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── index.tsx              # Todo lists
│   ├── todos/[id].tsx         # Individual list
│   └── _layout.tsx
├── _layout.tsx
lib/
├── powersync/
│   ├── schema.ts              # Database schema
│   ├── system.ts              # PowerSync setup
│   └── connector.ts           # Supabase connector
├── supabase/
│   └── client.ts
└── ai/
    └── suggestions.ts         # AI-powered suggestions
hooks/
├── useAuth.ts
├── useTodos.ts
└── useLists.ts
```

## Implementation

### Step 1: Define PowerSync Schema

```typescript
// lib/powersync/schema.ts
import { column, Schema, Table } from '@powersync/common';

const lists = new Table({
  created_at: column.text,
  name: column.text,
  owner_id: column.text,
});

const todos = new Table(
  {
    list_id: column.text,
    description: column.text,
    completed: column.integer,
    completed_at: column.text,
    created_at: column.text,
    ai_generated: column.integer,
  },
  { indexes: { list: ['list_id'] } }
);

export const AppSchema = new Schema({ lists, todos });
export type Database = (typeof AppSchema)['types'];
```

### Step 2: Setup PowerSync System

```typescript
// lib/powersync/system.ts
import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './schema';
import { supabaseConnector } from './connector';

export const powerSync = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'todos.db',
  },
});

export async function initializePowerSync() {
  await powerSync.init();
  await powerSync.connect(supabaseConnector);
}
```

### Step 3: Create Supabase Connector

```typescript
// lib/powersync/connector.ts
import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/common';
import { supabase } from '../supabase/client';

export const supabaseConnector: PowerSyncBackendConnector = {
  async fetchCredentials() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    return {
      endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL!,
      token: session.access_token,
    };
  },

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    try {
      for (const op of transaction.crud) {
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

      await transaction.complete();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};
```

### Step 4: Create Custom Hooks

```typescript
// hooks/useLists.ts
import { useQuery, usePowerSync } from '@powersync/react-native';
import { v4 as uuid } from 'uuid';

export function useLists() {
  const powerSync = usePowerSync();
  const { data: lists } = useQuery(`
    SELECT
      lists.*,
      COUNT(todos.id) as total_count,
      SUM(CASE WHEN todos.completed = 1 THEN 1 ELSE 0 END) as completed_count
    FROM lists
    LEFT JOIN todos ON lists.id = todos.list_id
    GROUP BY lists.id
    ORDER BY lists.created_at DESC
  `);

  async function createList(name: string, ownerId: string) {
    await powerSync.execute(
      'INSERT INTO lists (id, name, owner_id, created_at) VALUES (?, ?, ?, ?)',
      [uuid(), name, ownerId, new Date().toISOString()]
    );
  }

  async function deleteList(id: string) {
    // Delete todos first
    await powerSync.execute('DELETE FROM todos WHERE list_id = ?', [id]);
    await powerSync.execute('DELETE FROM lists WHERE id = ?', [id]);
  }

  return { lists, createList, deleteList };
}
```

```typescript
// hooks/useTodos.ts
import { useQuery, usePowerSync } from '@powersync/react-native';
import { v4 as uuid } from 'uuid';

export function useTodos(listId: string) {
  const powerSync = usePowerSync();
  const { data: todos } = useQuery(
    'SELECT * FROM todos WHERE list_id = ? ORDER BY created_at DESC',
    [listId]
  );

  async function createTodo(description: string, aiGenerated = false) {
    await powerSync.execute(
      'INSERT INTO todos (id, list_id, description, completed, created_at, ai_generated) VALUES (?, ?, ?, ?, ?, ?)',
      [uuid(), listId, description, 0, new Date().toISOString(), aiGenerated ? 1 : 0]
    );
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

  return { todos, createTodo, toggleTodo, deleteTodo };
}
```

### Step 5: AI Suggestions

```typescript
// lib/ai/suggestions.ts
import { supabase } from '../supabase/client';

export async function generateTodoSuggestions(listName: string, existingTodos: string[]) {
  const { data, error } = await supabase.functions.invoke('ai-suggestions', {
    body: {
      listName,
      existingTodos,
    },
  });

  if (error) throw error;
  return data.suggestions as string[];
}
```

```typescript
// supabase/functions/ai-suggestions/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4';

serve(async (req) => {
  const { listName, existingTodos } = await req.json();

  const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: Deno.env.get('OPENROUTER_API_KEY'),
  });

  const completion = await openrouter.chat.completions.create({
    model: 'anthropic/claude-3-haiku',
    models: ['anthropic/claude-3-haiku', 'openai/gpt-3.5-turbo'],
    route: 'fallback',
    messages: [
      {
        role: 'system',
        content: 'Generate 3 relevant todo items based on the list name and existing todos. Return only a JSON array of strings.',
      },
      {
        role: 'user',
        content: `List: "${listName}"\nExisting todos: ${existingTodos.join(', ')}`,
      },
    ],
  });

  const suggestions = JSON.parse(completion.choices[0].message.content);

  return new Response(JSON.stringify({ suggestions }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Step 6: UI Components

```typescript
// app/(tabs)/todos/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, TextInput, Button, View, Text } from 'react-native';
import { useTodos } from '@/hooks/useTodos';
import { generateTodoSuggestions } from '@/lib/ai/suggestions';

export default function TodosScreen() {
  const { id } = useLocalSearchParams();
  const { todos, createTodo, toggleTodo, deleteTodo } = useTodos(id as string);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function handleAISuggestions() {
    const existing = todos.map((t) => t.description);
    const sug = await generateTodoSuggestions('My List', existing);
    setSuggestions(sug);
  }

  async function addTodo(description: string, aiGenerated = false) {
    await createTodo(description, aiGenerated);
    if (aiGenerated) {
      setSuggestions(suggestions.filter((s) => s !== description));
    } else {
      setInput('');
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Add todo..."
          style={{ flex: 1, borderWidth: 1, padding: 8 }}
        />
        <Button title="Add" onPress={() => addTodo(input)} />
      </View>

      <Button title="🤖 Get AI Suggestions" onPress={handleAISuggestions} />

      {suggestions.length > 0 && (
        <View style={{ padding: 8, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>AI Suggestions:</Text>
          {suggestions.map((sug, i) => (
            <Button key={i} title={`+ ${sug}`} onPress={() => addTodo(sug, true)} />
          ))}
        </View>
      )}

      <FlatList
        data={todos}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', padding: 8 }}>
            <Button
              title={item.completed ? '✓' : '○'}
              onPress={() => toggleTodo(item.id, !item.completed)}
            />
            <Text style={{ flex: 1, textDecorationLine: item.completed ? 'line-through' : 'none' }}>
              {item.description}
              {item.ai_generated ? ' 🤖' : ''}
            </Text>
            <Button title="Delete" onPress={() => deleteTodo(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
```

## Database Setup (Supabase)

```sql
-- Create tables
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ai_generated BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own lists"
  ON lists FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own lists"
  ON lists FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Similar policies for todos...
```

## Testing Offline

```typescript
// Test offline functionality
async function testOffline() {
  // 1. Create todos while online
  await createTodo('Buy milk');
  await createTodo('Walk dog');

  // 2. Go offline (turn off WiFi)
  // 3. Continue working
  await createTodo('Read book'); // Works offline!
  await toggleTodo(todoId, true); // Works offline!

  // 4. Go back online
  // PowerSync automatically syncs all changes
}
```

## Production Considerations

1. **Error Handling**: Show sync errors to users
2. **Conflict Resolution**: Implement custom conflict handlers
3. **Performance**: Index frequently queried columns
4. **Security**: Enable SQLCipher encryption
5. **Monitoring**: Track sync status and errors

## Related Patterns

- PowerSync component: `.claude/skills/aftech-stack/components/powersync.md`
- Supabase component: `.claude/skills/aftech-stack/components/supabase.md`
- OpenRouter component: `.claude/skills/aftech-stack/components/openrouter.md`

---

**Last Updated**: 2025-12-31
