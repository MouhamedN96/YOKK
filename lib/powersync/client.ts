import { PowerSyncDatabase } from '@powersync/web';
import { AppSchema } from './schema';
import { supabaseConnector } from './connector';

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'njooba_pwa.db',
  },
  flags: {
    // Disable multi-tab support for now to simplify PWA lifecycle
    enableMultiTabs: false,
  }
});

export const setupPowerSync = async () => {
  console.log('🔌 Initializing PowerSync...');

  await db.init();

  // Seed data if empty
  const count = await db.getAll('SELECT count(*) as c FROM launches') as Array<{ c: number }>;
  if (count[0].c === 0) {
    console.log('🌱 Seeding database...');
    await db.execute('INSERT INTO launches (id, author_id, title, tagline, image_url, upvotes, is_trending, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      '1', 'arch', 'DevConnect: African Developer Network', 'Building the future of tech collaboration across Africa', 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop', 1205, 1, new Date().toISOString()
    ]);
    await db.execute('INSERT INTO launches (id, author_id, title, tagline, image_url, upvotes, is_trending, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      '2', 'sarah', 'AgroAI: Crop Disease Scanner', 'AI for rural farmers', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop', 856, 0, new Date().toISOString()
    ]);
    await db.execute('INSERT INTO posts (id, author_id, type, title, content, tags, upvotes, comment_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      '3', 'chidi', 'discussion', 'Stripe vs Paystack in 2025?', 'I am building a SaaS for Nigeria. Stripe Atlas is expensive. Is Paystack robust enough for recurring billing?', '["Payments", "Nigeria"]', 342, 156, new Date().toISOString()
    ]);
  }

  // Connect to Supabase for sync
  await db.connect(supabaseConnector);

  console.log('✅ PowerSync Ready');
};
