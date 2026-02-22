import jwt from 'jsonwebtoken';

const SECRET = process.env.SESSION_SECRET || 'supersecret';

export function generateToken(userId: number, role: string) {
  return jwt.sign({ id: userId, role }, SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { id: number, role: string };
}
