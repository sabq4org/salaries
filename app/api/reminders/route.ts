import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllReminders,
  getActiveReminders,
  createReminder, 
  updateReminder, 
  deleteReminder,
  completeReminder
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const reminders = activeOnly ? await getActiveReminders() : await getAllReminders();
    
    // حساب الحالة بناءً على التاريخ
    const now = new Date();
    const remindersWithStatus = reminders.map(reminder => {
      if (reminder.isCompleted) {
        return { ...reminder, status: 'completed' };
      }
      
      const dueDate = new Date(reminder.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status = 'pending';
      if (diffDays < 0) {
        status = 'overdue';
      } else if (diffDays <= 3) {
        status = 'due_soon';
      }
      
      return { ...reminder, status };
    });
    
    return NextResponse.json(remindersWithStatus);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // تحويل التواريخ من strings إلى Date objects
    const data = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      dueDate: new Date(body.dueDate),
    };
    
    const reminder = await createReminder(data);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }
    
    // تحويل التواريخ إذا كانت موجودة
    if (data.startDate) {
      data.startDate = new Date(data.startDate);
    }
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    
    data.updatedAt = new Date();
    
    const reminder = await updateReminder(id, data);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
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
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }
    
    await deleteReminder(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}

