import { NextRequest, NextResponse } from 'next/server';
import { getAllPayroll, createPayroll, updatePayroll, deletePayroll } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    const payroll = await getAllPayroll(
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined
    );
    return NextResponse.json(payroll);
  } catch (error) {
    console.error('GET /api/payroll error:', error);
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payroll = await createPayroll(body);
    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    console.error('POST /api/payroll error:', error);
    return NextResponse.json({ error: 'Failed to create payroll' }, { status: 500 });
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
    const payroll = await updatePayroll(parseInt(id), body);
    return NextResponse.json(payroll);
  } catch (error) {
    console.error('PUT /api/payroll error:', error);
    return NextResponse.json({ error: 'Failed to update payroll' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deletePayroll(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/payroll error:', error);
    return NextResponse.json({ error: 'Failed to delete payroll' }, { status: 500 });
  }
}

