import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

export async function requireAuth(request) {
  let token = null;

  if (request) {
    const authHeader = request.headers.get('authorization') || '';
    const [scheme, headerToken] = authHeader.split(' ');
    if (scheme === 'Bearer' && headerToken) {
      token = headerToken;
    }
  }

  if (!token) {
    const cookieHeader = request?.headers.get('cookie') || '';
    const cookiesArr = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookiesArr) {
      if (c.startsWith('token=')) {
        token = c.substring('token='.length);
        break;
      }
    }
  }

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: missing or invalid token' },
        { status: 401 }
      ),
      user: null,
    };
  }

  const decoded = verifyJwt(token);

  if (!decoded) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: invalid token' },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { error: null, user: decoded };
}


