# React Native & Expo - Mobile Development

## Overview

React Native with Expo provides the mobile app foundation for the Aftech-stack. Use TypeScript, expo-router for navigation, and integrate with PowerSync and Supabase for offline-first mobile apps.

**Key Stack:**
- Expo (managed workflow)
- TypeScript
- expo-router (file-based routing)
- Bottom tabs navigation
- Supabase authentication flow

## Project Structure

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── _layout.tsx
├── (tabs)/
│   ├── index.tsx
│   ├── profile.tsx
│   ├── _layout.tsx
│   └── [...missing].tsx
├── _layout.tsx
└── +html.tsx
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ...
└── ...
lib/
├── powersync/
├── supabase/
└── ai/
hooks/
├── usePowerSync.ts
└── useAuth.ts
```

## Core Patterns

### File-Based Routing

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

### Auth Flow

```typescript
// app/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

export default function RootLayout() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack />;
}
```

### Offline-First Data

```typescript
// hooks/useTodos.ts
import { useQuery } from '@powersync/react-native';

export function useTodos(listId: string) {
  const { data: todos } = useQuery(
    'SELECT * FROM todos WHERE list_id = ? ORDER BY created_at DESC',
    [listId]
  );

  return todos;
}
```

## Best Practices

1. **Use TypeScript**: Full type safety
2. **Expo Router**: File-based navigation
3. **Offline-First**: PowerSync for local data
4. **Auth Guards**: Protect routes with auth checks
5. **Error Boundaries**: Catch and display errors gracefully

## References

- **Template**: https://github.com/codingki/react-native-expo-template/tree/master/template-typescript-bottom-tabs-supabase-auth-flow

---

**Last Updated**: 2025-12-31
