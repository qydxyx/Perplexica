import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, generateTokens, setAuthCookies } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const isValidPassword = await validatePassword(
      password,
      user[0].passwordHash,
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const tokens = await generateTokens(user[0]);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        createdAt: user[0].createdAt,
      },
    });

    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
