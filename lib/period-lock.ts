import { db } from './db';
import { periodLocks, type PeriodLock, type InsertPeriodLock } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { logAudit } from './audit';

/**
 * التحقق من أن الفترة مقفلة
 */
export async function isPeriodLocked(year: number, month: number): Promise<boolean> {
  const result = await db
    .select()
    .from(periodLocks)
    .where(
      and(
        eq(periodLocks.year, year),
        eq(periodLocks.month, month),
        eq(periodLocks.isLocked, true)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * الحصول على معلومات قفل الفترة
 */
export async function getPeriodLock(year: number, month: number): Promise<PeriodLock | null> {
  const result = await db
    .select()
    .from(periodLocks)
    .where(
      and(
        eq(periodLocks.year, year),
        eq(periodLocks.month, month)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * قفل فترة مالية
 */
export async function lockPeriod(
  year: number,
  month: number,
  userId: string,
  userName: string,
  reason?: string
): Promise<{ success: boolean; error?: string; lock?: PeriodLock }> {
  try {
    // التحقق من أن الفترة غير مقفلة بالفعل
    const existingLock = await getPeriodLock(year, month);
    
    if (existingLock) {
      if (existingLock.isLocked) {
        return { success: false, error: 'الفترة مقفلة بالفعل' };
      }
      
      // تحديث السجل الموجود
      const updated = await db
        .update(periodLocks)
        .set({
          isLocked: true,
          lockedBy: userId,
          lockedByName: userName,
          lockedAt: new Date(),
          lockReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(periodLocks.id, existingLock.id))
        .returning();

      // تسجيل في audit log
      await logAudit({
        entityType: 'budget',
        entityId: existingLock.id,
        action: 'LOCK',
        userId,
        userName,
        oldData: existingLock,
        newData: updated[0],
      });

      return { success: true, lock: updated[0] };
    }

    // إنشاء سجل جديد
    const newLock: InsertPeriodLock = {
      year,
      month,
      isLocked: true,
      lockedBy: userId,
      lockedByName: userName,
      lockedAt: new Date(),
      lockReason: reason,
    };

    const result = await db.insert(periodLocks).values(newLock).returning();

    // تسجيل في audit log
    await logAudit({
      entityType: 'budget',
      entityId: result[0].id,
      action: 'LOCK',
      userId,
      userName,
      newData: result[0],
    });

    return { success: true, lock: result[0] };
  } catch (error) {
    console.error('Error locking period:', error);
    return { success: false, error: 'فشل في قفل الفترة' };
  }
}

/**
 * فتح قفل فترة مالية
 */
export async function unlockPeriod(
  year: number,
  month: number,
  userId: string,
  userName: string,
  reason?: string
): Promise<{ success: boolean; error?: string; lock?: PeriodLock }> {
  try {
    const existingLock = await getPeriodLock(year, month);
    
    if (!existingLock) {
      return { success: false, error: 'الفترة غير موجودة' };
    }

    if (!existingLock.isLocked) {
      return { success: false, error: 'الفترة غير مقفلة' };
    }

    // تحديث السجل
    const updated = await db
      .update(periodLocks)
      .set({
        isLocked: false,
        unlockedBy: userId,
        unlockedByName: userName,
        unlockedAt: new Date(),
        unlockReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(periodLocks.id, existingLock.id))
      .returning();

    // تسجيل في audit log
    await logAudit({
      entityType: 'budget',
      entityId: existingLock.id,
      action: 'UNLOCK',
      userId,
      userName,
      oldData: existingLock,
      newData: updated[0],
    });

    return { success: true, lock: updated[0] };
  } catch (error) {
    console.error('Error unlocking period:', error);
    return { success: false, error: 'فشل في فتح قفل الفترة' };
  }
}

/**
 * الحصول على جميع الفترات المقفلة
 */
export async function getAllPeriodLocks(): Promise<PeriodLock[]> {
  return await db
    .select()
    .from(periodLocks)
    .orderBy(periodLocks.year, periodLocks.month);
}

/**
 * الحصول على الفترات المقفلة فقط
 */
export async function getLockedPeriods(): Promise<PeriodLock[]> {
  return await db
    .select()
    .from(periodLocks)
    .where(eq(periodLocks.isLocked, true))
    .orderBy(periodLocks.year, periodLocks.month);
}

/**
 * التحقق من إمكانية التعديل على فترة معينة
 * يرمي خطأ إذا كانت الفترة مقفلة
 */
export async function validatePeriodNotLocked(year: number, month: number): Promise<void> {
  const isLocked = await isPeriodLocked(year, month);
  if (isLocked) {
    throw new Error(`الفترة ${month}/${year} مقفلة ولا يمكن التعديل عليها`);
  }
}

