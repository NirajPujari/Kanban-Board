// utils/jwt.ts
import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "dev_fallback_secret") as Secret;
const REFRESH_SECRET: Secret = (process.env.REFRESH_SECRET ?? "dev_fallback_refresh") as Secret;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN ?? "900";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN ?? "604800";

export type JwtPayloadCustom = { userId: string; role?: string; iat?: number; exp?: number };

export function signAccessToken(payload: JwtPayloadCustom): string {
  const opts: SignOptions = { expiresIn: Number(ACCESS_EXPIRES) };
  // cast payload to object to match overload that returns string (no callback)
  return jwt.sign(payload as object, JWT_SECRET, opts);
}

export function signRefreshToken(payload: JwtPayloadCustom): string {
  const opts: SignOptions = { expiresIn: Number(REFRESH_EXPIRES) };
  return jwt.sign(payload as object, REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
}

export function verifyRefreshToken(token: string): JwtPayloadCustom {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayloadCustom;
}
