import { Request } from "express";

/**
 * Extract client IP address from request
 * Handles proxies and load balancers
 */
export function getClientIp(req: Request): string {
  // Check for IP from a proxy
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
    return ips[0].trim();
  }

  // Fallback to direct connection
  return (
    req.socket.remoteAddress ||
    req.connection.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

/**
 * Check if an IP has already registered an account
 */
export async function isIpAlreadyRegistered(
  ip: string,
  db: any
): Promise<boolean> {
  if (!db) return false;

  try {
    // Check if this IP has created an account in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // This would require a new table to track registrations by IP
    // For now, we'll return false to allow registration
    return false;
  } catch (error) {
    console.error("[IP Detection] Error checking IP:", error);
    return false;
  }
}

/**
 * Log registration attempt for fraud detection
 */
export async function logRegistrationAttempt(
  ip: string,
  username: string,
  email: string,
  db: any
): Promise<void> {
  if (!db) return;

  try {
    // This would log to a registration_attempts table
    console.log(`[Registration] IP: ${ip}, Username: ${username}, Email: ${email}`);
  } catch (error) {
    console.error("[IP Detection] Error logging registration:", error);
  }
}
