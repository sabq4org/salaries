import { NextRequest, NextResponse } from 'next/server';
import { getAllContractors, createContractor, updateContractor, deleteContractor } from '@/lib/db';

export async function GET() {
  try {
    const contractors = await getAllContractors();
    return NextResponse.json(contractors);
  } catch (error) {
    console.error('GET /api/contractors error:', error);
    return NextResponse.json({ error: 'Failed to fetch contractors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contractor = await createContractor(body);
    return NextResponse.json(contractor, { status: 201 });
  } catch (error) {
    console.error('POST /api/contractors error:', error);
    return NextResponse.json({ error: 'Failed to create contractor' }, { status: 500 });
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
    const contractor = await updateContractor(parseInt(id), body);
    return NextResponse.json(contractor);
  } catch (error) {
    console.error('PUT /api/contractors error:', error);
    return NextResponse.json({ error: 'Failed to update contractor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteContractor(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/contractors error:', error);
    return NextResponse.json({ error: 'Failed to delete contractor' }, { status: 500 });
  }
}

