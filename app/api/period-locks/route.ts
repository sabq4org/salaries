import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPeriodLocks,
  lockPeriod,
  unlockPeriod,
  isPeriodLocked,
} from '@/lib/period-lock';

/**
 * GET - الحصول على جميع الفترات المقفلة
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // إذا تم تحديد سنة وشهر، التحقق من حالة القفل
    if (year && month) {
      const isLocked = await isPeriodLocked(parseInt(year), parseInt(month));
      return NextResponse.json({ isLocked });
    }

    // الحصول على جميع الفترات
    const locks = await getAllPeriodLocks();
    return NextResponse.json(locks);
  } catch (error) {
    console.error('GET /api/period-locks error:', error);
    return NextResponse.json(
      { error: 'فشل في تحميل الفترات المقفلة' },
      { status: 500 }
    );
  }
}

/**
 * POST - قفل أو فتح فترة مالية
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, action, userId, userName, reason } = body;

    if (!year || !month || !action || !userId || !userName) {
      return NextResponse.json(
        { error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'lock') {
      result = await lockPeriod(year, month, userId, userName, reason);
    } else if (action === 'unlock') {
      result = await unlockPeriod(year, month, userId, userName, reason);
    } else {
      return NextResponse.json(
        { error: 'عملية غير صحيحة' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      lock: result.lock,
    });
  } catch (error) {
    console.error('POST /api/period-locks error:', error);
    return NextResponse.json(
      { error: 'فشل في معالجة الطلب' },
      { status: 500 }
    );
  }
}

