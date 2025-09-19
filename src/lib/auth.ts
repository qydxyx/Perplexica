import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';
import { db } from './db';
import { users, sessions } from './db/schema';
import { eq, and } from 'drizzle-orm';

// Environment variables with fallbacks
const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT utilities
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Token management
export const generateTokens = async (user: User): Promise<AuthTokens> => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  const sessionId = uuidv4();
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(); // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    refreshToken,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<AuthTokens | null> => {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return null;

  // Check if refresh token exists in database
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.refreshToken, refreshToken),
      eq(sessions.userId, payload.userId),
    ),
  });

  if (!session || new Date(session.expiresAt) < new Date()) {
    // Clean up expired session
    if (session) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
    }
    return null;
  }

  // Get user to generate new tokens
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  if (!user || !user.isActive) return null;

  // Delete old session and generate new tokens
  await db.delete(sessions).where(eq(sessions.id, session.id));

  return generateTokens(user);
};

export const revokeRefreshToken = async (
  refreshToken: string,
): Promise<void> => {
  await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
};

// Request authentication
export const getTokenFromRequest = (request: NextRequest): string | null => {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie as fallback
  const tokenCookie = request.cookies.get('access_token');
  return tokenCookie?.value || null;
};

export const authenticateRequest = async (
  request: NextRequest,
): Promise<User | null> => {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  // Get user from database
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  if (!user || !user.isActive) return null;

  return user;
};

// Password validation
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// User utilities
export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
}): Promise<User> => {
  const userId = uuidv4();
  const now = new Date().toISOString();
  const hashedPassword = await hashPassword(userData.password);

  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      email: userData.email.toLowerCase(),
      passwordHash: hashedPassword,
      name: userData.name,
      role: userData.role || 'user',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Remove password hash from returned user
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUserByEmail = async (
  email: string,
): Promise<(User & { passwordHash: string }) | null> => {
  return await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) return null;

  // Remove password hash from returned user
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const isFirstUser = async (): Promise<boolean> => {
  const userCount = await db.query.users.findFirst();
  return !userCount;
};
