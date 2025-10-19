import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditLogs } from '@/drizzle/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

/**
 * GET - الحصول على سجلات التدقيق
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = db.select().from(auditLogs);

    // تطبيق الفلاتر
    const conditions = [];
    
    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType as any));
    }
    
    if (entityId) {
      conditions.push(eq(auditLogs.entityId, parseInt(entityId)));
    }
    
    if (action) {
      conditions.push(eq(auditLogs.action, action as any));
    }
    
    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }
    
    if (startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // ترتيب حسب الأحدث
    const logs = await query.orderBy(desc(auditLogs.timestamp)).limit(limit);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('GET /api/audit-logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

