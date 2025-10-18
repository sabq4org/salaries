import { NextRequest, NextResponse } from 'next/server';
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    const expenses = await getAllExpenses(year ? parseInt(year) : undefined);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const expense = await createExpense(body);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
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
    const expense = await updateExpense(parseInt(id), body);
    return NextResponse.json(expense);
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

    await deleteExpense(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

