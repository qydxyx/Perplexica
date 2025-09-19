import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateTokens, setAuthCookies } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 },
      );
    }

    const userCount = await db.select({ count: count() }).from(users);
    const isFirstUser = userCount[0].count === 0;

    const passwordHash = await hashPassword(password);

    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        role: isFirstUser ? 'admin' : 'user',
      })
      .returning();

    const tokens = await generateTokens(newUser[0]);
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
        createdAt: newUser[0].createdAt,
      },
    });

    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
