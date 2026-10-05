import { createHmac, timingSafeEqual } from "crypto";

const cookieName = "two_g_admin";
const maxAge = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function adminEmail() {
  return process.env.ADMIN_EMAIL ?? "admin@2gbarbershop.et";
}

export function adminIsConfigured() {
  return Boolean(secret());
}

export function validateAdminPassword(password: string) {
  const expected = Buffer.from(secret());
  const received = Buffer.from(password);
  return expected.length > 0 && expected.length === received.length && timingSafeEqual(expected, received);
}

export function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ email: adminEmail(), exp: Date.now() + maxAge * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function isAdminSession(value?: string) {
  if (!value || !adminIsConfigured()) return false;
  const [payload, received] = value.split(".");
  if (!payload || !received) return false;
  const expected = signature(payload);
  if (expected.length !== received.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(received))) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export const adminCookie = { name: cookieName, maxAge };
