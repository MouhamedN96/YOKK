'use client';

import { ReactNode, useEffect, useState } from 'react';
import { PowerSyncContext } from '@powersync/react';
import type { PowerSyncDatabase } from '@powersync/web';
import { Loader2 } from 'lucide-react';

export const PowerSyncProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [database, setDatabase] = useState<PowerSyncDatabase | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('./client').then(async ({ getDatabase, setupPowerSync }) => {
      const db = getDatabase();
      setDatabase(db);
      await setupPowerSync();
      setReady(true);
    }).catch((error) => {
      console.error('Failed to initialize PowerSync:', error);
      // Still set ready to true to allow app to function without PowerSync
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-terracotta-primary" size={48} />
          <p className="text-white/60 font-medium">Initializing Database...</p>
        </div>
      </div>
    );
  }

  // If database failed to initialize, render children without PowerSync context
  if (!database) {
    return <>{children}</>;
  }

  // @ts-expect-error React 19 types
  return <PowerSyncContext.Provider value={database}>{children}</PowerSyncContext.Provider>;
};
