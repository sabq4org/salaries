import { db } from './db';
import { auditLogs, type AuditLog, type InsertAuditLog } from '@/drizzle/schema';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOCK' | 'UNLOCK';
export type AuditEntity = 'employee' | 'contractor' | 'payroll' | 'expense' | 'revenue' | 'budget' | 'leave_settlement' | 'reminder' | 'user' | 'expense_category';

interface AuditLogParams {
  entityType: AuditEntity;
  entityId: number;
  action: AuditAction;
  userId?: string;
  userName?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * تسجيل عملية في سجل التدقيق
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const changes = params.oldData && params.newData 
      ? generateChangeSummary(params.oldData, params.newData)
      : null;

    const auditEntry: InsertAuditLog = {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      userId: params.userId,
      userName: params.userName,
      oldData: params.oldData ? JSON.stringify(params.oldData) : null,
      newData: params.newData ? JSON.stringify(params.newData) : null,
      changes: changes ? JSON.stringify(changes) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    };

    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error('Error logging audit:', error);
    // لا نريد أن يفشل الطلب الأساسي بسبب فشل التدقيق
  }
}

/**
 * توليد ملخص التغييرات بين القيم القديمة والجديدة
 */
function generateChangeSummary(oldData: any, newData: any): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  // مقارنة القيم
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  }

  return changes;
}

/**
 * الحصول على IP address من request
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return undefined;
}

/**
 * الحصول على User Agent من request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * الحصول على معلومات المستخدم من session
 * (يجب تعديلها حسب نظام المصادقة المستخدم)
 */
export async function getCurrentUser(request: Request): Promise<{ id: string; name: string } | null> {
  // TODO: تنفيذ الحصول على المستخدم الحالي من session/token
  // هذا مثال بسيط - يجب تعديله حسب نظام المصادقة
  return null;
}

