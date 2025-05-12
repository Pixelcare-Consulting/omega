import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface LogActivityOptions {
  action: string;
  user: string;
  eventType: "user" | "system" | "security" | "data";
  severity: "info" | "warning" | "error" | "critical";
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity({
  action,
  user,
  eventType,
  severity,
  details,
  metadata,
  ipAddress,
  userAgent,
}: LogActivityOptions) {
  try {
    await prisma.activityLog.create({
      data: {
        user,
        action,
        eventType,
        severity,
        details,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("[ACTIVITY_LOG_ERROR]", error);
  }
}

// Example usage:
// await logActivity({
//   user: 'john.doe@example.com',
//   action: 'User Login',
//   eventType: 'security',
//   severity: 'info',
//   details: 'Successful login attempt',
//   ipAddress: '192.168.1.1',
//   userAgent: 'Mozilla/5.0...',
//   metadata: { loginMethod: 'password' }
// }); 