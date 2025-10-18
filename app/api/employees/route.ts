import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/lib/db';

export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const employee = await createEmployee(body);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('POST /api/employees error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const employee = await updateEmployee(id, data);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('PUT /api/employees error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    await deleteEmployee(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/employees error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

