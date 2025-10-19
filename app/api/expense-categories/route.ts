import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllExpenseCategories,
  getActiveExpenseCategories,
  createExpenseCategory, 
  updateExpenseCategory, 
  deleteExpenseCategory,
  reorderExpenseCategories
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const categories = activeOnly 
      ? await getActiveExpenseCategories() 
      : await getAllExpenseCategories();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const category = await createExpenseCategory(body);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to create expense category', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const category = await updateExpenseCategory(id, data);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to update expense category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    await deleteExpenseCategory(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense category' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryIds } = body;
    
    if (!categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Category IDs array is required' },
        { status: 400 }
      );
    }
    
    await reorderExpenseCategories(categoryIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering expense categories:', error);
    return NextResponse.json(
      { error: 'Failed to reorder expense categories' },
      { status: 500 }
    );
  }
}

