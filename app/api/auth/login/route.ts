import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

// Store credentials in environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || hashPassword('admin123');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      const token = generateToken();
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          username,
          role: 'admin',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

