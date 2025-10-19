import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');
    
    let query = db.select().from(expenses);
    
    if (year && quarter) {
      query = query.where(and(
        eq(expenses.year, parseInt(year)),
        eq(expenses.quarter, parseInt(quarter))
      ));
    } else if (year) {
      query = query.where(eq(expenses.year, parseInt(year)));
    }
    
    const result = await query;
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
    if (!body.year || !body.month || !body.quarter || !body.type || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: year, month, quarter, type, amount' },
        { status: 400 }
      );
    }
    
    // Ensure amount is a number
    const expenseData = {
      year: parseInt(body.year),
      month: parseInt(body.month),
      quarter: parseInt(body.quarter),
      type: body.type,
      description: body.description || null,
      amount: parseInt(body.amount) || 0,
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes || null,
      attachmentUrl: body.attachmentUrl || null,
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
    
    const expenseData: any = { updatedAt: new Date() };
    if (body.year !== undefined) expenseData.year = parseInt(body.year);
    if (body.month !== undefined) expenseData.month = parseInt(body.month);
    if (body.quarter !== undefined) expenseData.quarter = parseInt(body.quarter);
    if (body.type !== undefined) expenseData.type = body.type;
    if (body.description !== undefined) expenseData.description = body.description;
    if (body.amount !== undefined) expenseData.amount = parseInt(body.amount);
    if (body.date !== undefined) expenseData.date = new Date(body.date);
    if (body.notes !== undefined) expenseData.notes = body.notes;
    if (body.attachmentUrl !== undefined) expenseData.attachmentUrl = body.attachmentUrl;
    
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

