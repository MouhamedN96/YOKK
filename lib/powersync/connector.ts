import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType
} from '@powersync/common';
import { getSupabase } from '../supabase/client';

// PowerSync URL - can be empty for offline-only mode
const POWERSYNC_URL = process.env.NEXT_PUBLIC_POWERSYNC_URL || '';

export const supabaseConnector: PowerSyncBackendConnector = {
  async fetchCredentials() {
    // If no PowerSync URL configured, return null to disable sync
    if (!POWERSYNC_URL) {
      console.log('⚠️ PowerSync URL not configured - running in offline-only mode');
      return null;
    }

    // Get Supabase client (lazy loaded)
    const supabase = getSupabase();
    
    // Get Supabase session for PowerSync authentication
    const { data: { session }, error } = await supabase.auth.getSession();

    // If no session, return null to allow offline usage
    if (error || !session) {
      console.log('ℹ️ No active session - PowerSync sync disabled, offline mode active');
      return null;
    }

    // Return credentials for PowerSync connection
    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token
    };
  },

  async uploadData(database: AbstractPowerSyncDatabase) {
    // Get pending changes from local database
    const pending = await database.getCrudBatch();

    if (!pending?.crud || pending.crud.length === 0) {
      return;
    }

    // Get Supabase client (lazy loaded)
    const supabase = getSupabase();

    // Upload pending changes to Supabase
    for (const op of pending.crud) {
      if (op.op === UpdateType.DELETE) {
        await supabase
          .from(op.table)
          .delete()
          .match({ id: op.id });
      } else if (op.op === UpdateType.PATCH) {
        await supabase
          .from(op.table)
          .update(op.opData)
          .match({ id: op.id });
      } else if (op.op === UpdateType.PUT) {
        await supabase
          .from(op.table)
          .upsert({ ...op.opData, id: op.id });
      }
    }

    // Mark operations as completed
    await pending.complete();
  }
};
