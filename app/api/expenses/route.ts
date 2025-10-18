import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    let result;
    if (year) {
      result = await db.select().from(expenses).where(eq(expenses.year, parseInt(year)));
    } else {
      result = await db.select().from(expenses);
    }
    
    return NextResponse.json(result || []);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/expenses - Received data:', body);
    
    // Validate required fields
    if (!body.year || !body.month || !body.type || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: year, month, type, amount' },
        { status: 400 }
      );
    }
    
    // Ensure amount is a number
    const expenseData = {
      year: parseInt(body.year),
      month: parseInt(body.month),
      type: body.type,
      description: body.description || null,
      amount: parseInt(body.amount) || 0,
    };
    
    console.log('POST /api/expenses - Inserting:', expenseData);
    
    const result = await db.insert(expenses).values(expenseData).returning();
    
    console.log('POST /api/expenses - Success:', result[0]);
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('POST /api/expenses error:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Failed to create expense', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    
    const expenseData: any = {};
    if (body.year !== undefined) expenseData.year = parseInt(body.year);
    if (body.month !== undefined) expenseData.month = parseInt(body.month);
    if (body.type !== undefined) expenseData.type = body.type;
    if (body.description !== undefined) expenseData.description = body.description;
    if (body.amount !== undefined) expenseData.amount = parseInt(body.amount);
    
    const result = await db.update(expenses)
      .set(expenseData)
      .where(eq(expenses.id, parseInt(id)))
      .returning();
      
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/expenses error:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await db.delete(expenses).where(eq(expenses.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

