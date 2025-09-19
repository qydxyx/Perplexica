#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { users, chats, messages, userConfigs } from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/auth';
import { eq } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting migration...');

  try {
    // Check if there are any existing chats/messages without userId
    const orphanedChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, null))
      .limit(1);

    const orphanedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, null))
      .limit(1);

    if (orphanedChats.length === 0 && orphanedMessages.length === 0) {
      console.log('✅ No orphaned data found. Migration complete.');
      return;
    }

    console.log('📦 Found orphaned data. Creating default admin user...');

    // Create a default admin user for orphaned data
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const defaultEmail =
      process.env.DEFAULT_ADMIN_EMAIL || 'admin@perplexica.local';

    console.log(`Creating admin user with email: ${defaultEmail}`);
    console.log('Please change the password after first login!');

    const passwordHash = await hashPassword(defaultPassword);

    const adminUser = await db
      .insert(users)
      .values({
        email: defaultEmail,
        passwordHash,
        name: 'Admin User',
        role: 'admin',
      })
      .returning();

    console.log(`✅ Created admin user: ${adminUser[0].email}`);

    // Update orphaned chats
    if (orphanedChats.length > 0) {
      const allOrphanedChats = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, null));

      await db
        .update(chats)
        .set({ userId: adminUser[0].id })
        .where(eq(chats.userId, null));

      console.log(`✅ Updated ${allOrphanedChats.length} orphaned chats`);
    }

    // Update orphaned messages
    if (orphanedMessages.length > 0) {
      const allOrphanedMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, null));

      await db
        .update(messages)
        .set({ userId: adminUser[0].id })
        .where(eq(messages.userId, null));

      console.log(`✅ Updated ${allOrphanedMessages.length} orphaned messages`);
    }

    // Create default user config for admin
    await db.insert(userConfigs).values({
      userId: adminUser[0].id,
      providers: {},
      models: {},
    });

    console.log('✅ Created default config for admin user');
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log(
      '⚠️  IMPORTANT: Please log in and change the default password!',
    );
    console.log(`   Email: ${defaultEmail}`);
    console.log(`   Password: ${defaultPassword}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0));
}

export default migrate;
