# Authentication Flow with Bottom Tabs

## Use Case

Complete authentication flow for React Native/Expo app with email/password login, OAuth (Google/Apple), and protected bottom tabs navigation.

## Architecture

```
┌──────────────┐
│ Unauthenticated │ → Login/Signup
└──────┬───────┘
       │ (auth success)
       ▼
┌──────────────┐
│ Authenticated  │ → Bottom Tabs (Home, Profile, etc.)
└──────────────┘
```

## File Structure

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── _layout.tsx
├── (tabs)/
│   ├── index.tsx
│   ├── profile.tsx
│   └── _layout.tsx
└── _layout.tsx
hooks/
└── useAuth.ts
lib/
└── supabase/
    └── client.ts
```

## Implementation

### Root Layout with Auth Guard

```typescript
// app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect to app if authenticated
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <Slot />;
}
```

### Auth Hook

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    user: session?.user ?? null,
    signOut: () => supabase.auth.signOut(),
  };
}
```

### Login Screen

```typescript
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase/client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'myapp://auth/callback',
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20 }}>
        Login
      </Text>

      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 12, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, marginBottom: 20 }}
      />

      <Button title="Login" onPress={handleLogin} disabled={loading} />

      <View style={{ marginVertical: 20 }}>
        <Button title="Sign in with Google" onPress={() => handleOAuth('google')} />
        <Button title="Sign in with Apple" onPress={() => handleOAuth('apple')} />
      </View>

      <Link href="/(auth)/signup">
        <Text style={{ textAlign: 'center', color: 'blue' }}>
          Don't have an account? Sign up
        </Text>
      </Link>
    </View>
  );
}
```

### Bottom Tabs Layout

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Profile Screen with Sign Out

```typescript
// app/(tabs)/profile.tsx
import { View, Text, Button } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Profile
      </Text>

      <Text>Email: {user?.email}</Text>
      <Text>ID: {user?.id}</Text>

      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

## OAuth Callback Handling

```typescript
// app/(auth)/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase/client';

export default function CallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // Handle OAuth callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    });
  }, []);

  return <LoadingScreen />;
}
```

## Deep Linking Setup

```typescript
// app.json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.myapp"
    },
    "android": {
      "package": "com.myapp"
    }
  }
}
```

## Supabase Configuration

```sql
-- Configure OAuth redirect URLs in Supabase dashboard
-- Add: myapp://auth/callback
```

## Testing

```typescript
// Test auth flow
async function testAuth() {
  // 1. User opens app → sees login screen
  // 2. User enters credentials → authenticated
  // 3. User is redirected to tabs
  // 4. User closes and reopens app → still authenticated (persisted session)
  // 5. User signs out → back to login screen
}
```

## Related Patterns

- Supabase Auth: `.claude/skills/aftech-stack/components/supabase.md`
- React Native: `.claude/skills/aftech-stack/components/react-native-expo.md`

---

**Last Updated**: 2025-12-31
