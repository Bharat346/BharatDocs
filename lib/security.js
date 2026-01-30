import { db } from "./db";
import { securityEvents, auditLogs } from "./db/schema";

/**
 * Logs a security event to the database.
 * @param {Object} params
 * @param {string} params.event - Type of event (e.g., 'rate_limit', 'ip_blocked').
 * @param {string} params.severity - 'info', 'warn', or 'critical'.
 * @param {string} params.ip - Client IP address.
 * @param {string} [params.path] - Requested path.
 * @param {string} [params.method] - HTTP method.
 * @param {string} [params.userAgent] - Client user agent.
 * @param {Object} [params.details] - Additional JSON details.
 */
export async function logSecurityEvent({
  event,
  severity = "warn",
  ip,
  path,
  method,
  userAgent,
  details,
}) {
  try {
    await db.insert(securityEvents).values({
      event,
      severity,
      ipAddress: ip,
      path,
      method,
      userAgent,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (err) {
    console.error("Failed to log security event:", err);
  }
}

/**
 * Logs an admin audit action.
 */
export async function logAuditAction({
  username,
  action,
  nodeId,
  severity = "info",
  ip,
  userAgent,
}) {
  try {
    await db.insert(auditLogs).values({
      adminUsername: username,
      action,
      nodeId,
      severity,
      ipAddress: ip,
      userAgent,
    });
  } catch (err) {
    console.error("Failed to log audit action:", err);
  }
}
