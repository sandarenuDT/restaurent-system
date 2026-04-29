import jwt from 'jsonwebtoken';

interface TokenPayload { id: string; role: string; }

export const generateAccessToken  = (p: TokenPayload) =>
  jwt.sign(p, process.env.JWT_SECRET as string, { expiresIn: '12h' });

export const generateRefreshToken = (p: TokenPayload) =>
  jwt.sign(p, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;