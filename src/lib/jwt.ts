import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "zaiko-super-secret-key-113";

export interface TokenPayload {
  userId: string;
  role: string;
  phone: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
