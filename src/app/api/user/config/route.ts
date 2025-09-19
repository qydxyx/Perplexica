import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import { userConfigs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function handler(request: NextRequest, { user }: { user: any }) {
  if (request.method === 'GET') {
    try {
      const config = await db
        .select()
        .from(userConfigs)
        .where(eq(userConfigs.userId, user.id))
        .limit(1);

      return NextResponse.json({
        success: true,
        config: config[0] || null,
      });
    } catch (error) {
      console.error('Get user config error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const { providers, models, customOpenAIBaseURL, customOpenAIKey } =
        await request.json();

      const existingConfig = await db
        .select()
        .from(userConfigs)
        .where(eq(userConfigs.userId, user.id))
        .limit(1);

      let result;
      if (existingConfig.length === 0) {
        result = await db
          .insert(userConfigs)
          .values({
            userId: user.id,
            providers: providers || {},
            models: models || {},
            customOpenAIBaseURL,
            customOpenAIKey,
          })
          .returning();
      } else {
        result = await db
          .update(userConfigs)
          .set({
            providers: providers || existingConfig[0].providers,
            models: models || existingConfig[0].models,
            customOpenAIBaseURL:
              customOpenAIBaseURL !== undefined
                ? customOpenAIBaseURL
                : existingConfig[0].customOpenAIBaseURL,
            customOpenAIKey:
              customOpenAIKey !== undefined
                ? customOpenAIKey
                : existingConfig[0].customOpenAIKey,
            updatedAt: new Date(),
          })
          .where(eq(userConfigs.userId, user.id))
          .returning();
      }

      return NextResponse.json({
        success: true,
        config: result[0],
      });
    } catch (error) {
      console.error('Update user config error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
export const PUT = withAuth(handler);
