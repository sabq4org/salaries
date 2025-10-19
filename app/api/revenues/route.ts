import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revenues } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { validatePeriodNotLocked } from '@/lib/period-lock';

// GET - جلب الإيرادات
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');

    let query = db.select().from(revenues);

    if (year) {
      query = query.where(eq(revenues.year, parseInt(year)));
    }

    if (quarter) {
      query = query.where(and(
        eq(revenues.year, parseInt(year || new Date().getFullYear().toString())),
        eq(revenues.quarter, parseInt(quarter))
      ));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/revenues error:', error);
    return NextResponse.json({ error: 'Failed to fetch revenues' }, { status: 500 });
  }
}

// POST - إضافة إيراد جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, quarter, source, amount, date, notes, attachmentUrl } = body;

    // التحقق من أن الفترة غير مقفلة
    if (year && month) {
      await validatePeriodNotLocked(year, month);
    }

    const result = await db.insert(revenues).values({
      year,
      month,
      quarter,
      source,
      amount,
      date: date ? new Date(date) : new Date(),
      notes,
      attachmentUrl: attachmentUrl || null,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('POST /api/revenues error:', error);
    return NextResponse.json({ error: 'Failed to create revenue' }, { status: 500 });
  }
}

// PUT - تحديث إيراد
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { year, month, quarter, source, amount, date, notes, attachmentUrl } = body;

    // الحصول على البيانات القديمة للتحقق من الفترة
    const oldRevenue = await db.select().from(revenues).where(eq(revenues.id, parseInt(id))).limit(1);
    if (oldRevenue[0]) {
      await validatePeriodNotLocked(oldRevenue[0].year, oldRevenue[0].month);
    }

    const result = await db.update(revenues)
      .set({
        year,
        month,
        quarter,
        source,
        amount,
        date: date ? new Date(date) : undefined,
        notes,
        attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : undefined,
        updatedAt: new Date(),
      })
      .where(eq(revenues.id, parseInt(id)))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/revenues error:', error);
    return NextResponse.json({ error: 'Failed to update revenue' }, { status: 500 });
  }
}

// DELETE - حذف إيراد
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // الحصول على البيانات قبل الحذف للتحقق من الفترة
    const oldRevenue = await db.select().from(revenues).where(eq(revenues.id, parseInt(id))).limit(1);
    if (oldRevenue[0]) {
      await validatePeriodNotLocked(oldRevenue[0].year, oldRevenue[0].month);
    }

    await db.delete(revenues).where(eq(revenues.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/revenues error:', error);
    return NextResponse.json({ error: 'Failed to delete revenue' }, { status: 500 });
  }
}

