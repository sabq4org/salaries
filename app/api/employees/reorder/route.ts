import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { employees } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id, sortOrder }
    
    // Update each employee's sortOrder
    for (const item of items) {
      await db.update(employees)
        .set({ sortOrder: item.sortOrder })
        .where(eq(employees.id, item.id));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/employees/reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder employees' }, { status: 500 });
  }
}

