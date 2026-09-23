import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { User, UserRole } from './types';
import { getDb } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hackai_secret_jwt_key_sana_2026_super_secure_token'
);

const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(user: { id: number; email: string; role: UserRole; name: string }): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ id: number; email: string; role: UserRole; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as { id: number; email: string; role: UserRole; name: string };
  } catch (err) {
    return null;
  }
}

export function getUserFromToken(token?: string | null): User | null {
  if (!token) return null;
  try {
    const db = getDb();
    // Synchronous token decode for user fetch
    // If token starts with Bearer
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // We can also extract the user ID
    // Using base64 decode of payload safely
    const parts = cleanToken.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    if (!payload || !payload.id) return null;

    const row = db.prepare(`
      SELECT id, email, name, role, organization, team_name, skills, interests, xp_points, created_at
      FROM users WHERE id = ?
    `).get(payload.id) as User | undefined;

    return row || null;
  } catch (err) {
    return null;
  }
}

export function getAuthUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return getUserFromToken(authHeader.slice(7));
  }
  
  // Check cookie if header not provided
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  if (match) {
    return getUserFromToken(match[1]);
  }

  return null;
}
