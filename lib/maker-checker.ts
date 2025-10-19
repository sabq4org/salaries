import { db } from './db';
import { pendingApprovals, type PendingApproval, type InsertPendingApproval } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { logAudit, type AuditEntity } from './audit';

export type ApprovalOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface CreateApprovalRequest {
  entityType: AuditEntity;
  entityId?: number;
  operation: ApprovalOperation;
  requestData: any;
  currentData?: any;
  makerId?: string;
  makerName?: string;
  makerComment?: string;
}

/**
 * إنشاء طلب موافقة جديد
 */
export async function createApprovalRequest(params: CreateApprovalRequest): Promise<PendingApproval> {
  const approvalData: InsertPendingApproval = {
    entityType: params.entityType,
    entityId: params.entityId,
    operation: params.operation,
    requestData: JSON.stringify(params.requestData),
    currentData: params.currentData ? JSON.stringify(params.currentData) : null,
    status: 'pending',
    makerId: params.makerId,
    makerName: params.makerName,
    makerComment: params.makerComment,
  };

  const result = await db.insert(pendingApprovals).values(approvalData).returning();
  return result[0];
}

/**
 * الموافقة على طلب
 */
export async function approveRequest(
  approvalId: number,
  checkerId: string,
  checkerName: string,
  checkerComment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // الحصول على الطلب
    const approval = await db
      .select()
      .from(pendingApprovals)
      .where(eq(pendingApprovals.id, approvalId))
      .limit(1);

    if (!approval[0]) {
      return { success: false, error: 'Approval request not found' };
    }

    if (approval[0].status !== 'pending') {
      return { success: false, error: 'Request already processed' };
    }

    // تحديث حالة الطلب
    await db
      .update(pendingApprovals)
      .set({
        status: 'approved',
        checkerId,
        checkerName,
        checkerComment,
        reviewedAt: new Date(),
      })
      .where(eq(pendingApprovals.id, approvalId));

    // تسجيل في audit log
    await logAudit({
      entityType: approval[0].entityType,
      entityId: approval[0].entityId || 0,
      action: 'APPROVE',
      userId: checkerId,
      userName: checkerName,
      newData: { approvalId, checkerComment },
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving request:', error);
    return { success: false, error: 'Failed to approve request' };
  }
}

/**
 * رفض طلب
 */
export async function rejectRequest(
  approvalId: number,
  checkerId: string,
  checkerName: string,
  checkerComment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // الحصول على الطلب
    const approval = await db
      .select()
      .from(pendingApprovals)
      .where(eq(pendingApprovals.id, approvalId))
      .limit(1);

    if (!approval[0]) {
      return { success: false, error: 'Approval request not found' };
    }

    if (approval[0].status !== 'pending') {
      return { success: false, error: 'Request already processed' };
    }

    // تحديث حالة الطلب
    await db
      .update(pendingApprovals)
      .set({
        status: 'rejected',
        checkerId,
        checkerName,
        checkerComment,
        reviewedAt: new Date(),
      })
      .where(eq(pendingApprovals.id, approvalId));

    // تسجيل في audit log
    await logAudit({
      entityType: approval[0].entityType,
      entityId: approval[0].entityId || 0,
      action: 'REJECT',
      userId: checkerId,
      userName: checkerName,
      newData: { approvalId, checkerComment },
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return { success: false, error: 'Failed to reject request' };
  }
}

/**
 * الحصول على جميع الطلبات المعلقة
 */
export async function getPendingApprovals(): Promise<PendingApproval[]> {
  return await db
    .select()
    .from(pendingApprovals)
    .where(eq(pendingApprovals.status, 'pending'))
    .orderBy(pendingApprovals.createdAt);
}

/**
 * الحصول على طلبات محددة حسب الحالة
 */
export async function getApprovalsByStatus(status: ApprovalStatus): Promise<PendingApproval[]> {
  return await db
    .select()
    .from(pendingApprovals)
    .where(eq(pendingApprovals.status, status))
    .orderBy(pendingApprovals.createdAt);
}

/**
 * التحقق من وجود طلب معلق لكيان معين
 */
export async function hasPendingApproval(
  entityType: AuditEntity,
  entityId: number
): Promise<boolean> {
  const result = await db
    .select()
    .from(pendingApprovals)
    .where(
      and(
        eq(pendingApprovals.entityType, entityType),
        eq(pendingApprovals.entityId, entityId),
        eq(pendingApprovals.status, 'pending')
      )
    )
    .limit(1);

  return result.length > 0;
}

