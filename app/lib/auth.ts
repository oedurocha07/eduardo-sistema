import { randomBytes, scryptSync, timingSafeEqual, createHmac, createHash } from "node:crypto";

const SESSION_COOKIE = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não configurado");
  return secret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, 64);
  return hashBuffer.length === candidate.length && timingSafeEqual(hashBuffer, candidate);
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${userId}.${exp}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, expStr, sig] = decoded.split(".");
    if (!userId || !expStr || !sig) return null;
    const expected = sign(`${userId}.${expStr}`);
    if (expected !== sig) return null;
    if (Number(expStr) < Math.floor(Date.now() / 1000)) return null;
    return { userId };
  } catch {
    return null;
  }
}

export function gerarTokenReset(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashTokenReset(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
