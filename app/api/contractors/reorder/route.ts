import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contractors } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id, sortOrder }
    
    // Update each contractor's sortOrder
    for (const item of items) {
      await db.update(contractors)
        .set({ sortOrder: item.sortOrder })
        .where(eq(contractors.id, item.id));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/contractors/reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder contractors' }, { status: 500 });
  }
}

