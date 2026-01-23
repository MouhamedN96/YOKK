import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType
} from '@powersync/common';
import { supabase } from '../supabase/client';

export const supabaseConnector: PowerSyncBackendConnector = {
  async fetchCredentials() {
    // Get Supabase session for PowerSync authentication
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error(`Failed to get Supabase session: ${error?.message}`);
    }

    // Return credentials for PowerSync connection
    return {
      endpoint: process.env.NEXT_PUBLIC_POWERSYNC_URL!,
      token: session.access_token
    };
  },

  async uploadData(database: AbstractPowerSyncDatabase) {
    // Get pending changes from local database
    const pending = await database.getCrudBatch();

    if (!pending?.crud || pending.crud.length === 0) {
      return;
    }

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