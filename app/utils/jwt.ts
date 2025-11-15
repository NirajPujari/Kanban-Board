import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "dev_fallback_secret") as Secret;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN ?? 60 * 60 * 24;

export type JwtPayloadCustom = { userId: string; role?: string; iat?: number; exp?: number };

export function signToken(payload: JwtPayloadCustom): string {
  const opts: SignOptions = { expiresIn: Number(ACCESS_EXPIRES) };
  return jwt.sign(payload as object, JWT_SECRET, opts);
}

export function verifyAccessToken(token: string): JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
}