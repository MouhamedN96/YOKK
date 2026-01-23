'use client';

import { ReactNode, useEffect, useState } from 'react';
import { PowerSyncContext } from '@powersync/react';
import { db, setupPowerSync } from './client';
import { Loader2 } from 'lucide-react';

export const PowerSyncProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setupPowerSync().then(() => setReady(true));
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

  // @ts-expect-error React 19 types
  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
};
