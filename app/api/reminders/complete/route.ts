import { NextRequest, NextResponse } from 'next/server';
import { completeReminder } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }
    
    const reminder = await completeReminder(id);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error completing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to complete reminder' },
      { status: 500 }
    );
  }
}

