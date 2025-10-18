import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllLeaveSettlements, 
  createLeaveSettlement, 
  updateLeaveSettlement, 
  deleteLeaveSettlement 
} from '@/lib/db';
import { calculateLeaveSettlement } from '@/lib/leaveCalculations';

export async function GET() {
  try {
    const settlements = await getAllLeaveSettlements();
    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Error fetching leave settlements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave settlements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // تحويل التواريخ من strings إلى Date objects
    const joinDate = new Date(body.joinDate);
    const leaveStartDate = new Date(body.leaveStartDate);
    const leaveEndDate = body.leaveEndDate ? new Date(body.leaveEndDate) : undefined;
    
    // حساب التصفية
    const calculation = calculateLeaveSettlement({
      joinDate,
      leaveStartDate,
      leaveEndDate,
      leaveDays: body.leaveDays,
      previousBalanceDays: body.previousBalanceDays || 0,
      ticketsEntitlement: body.ticketsEntitlement || 'employee',
      visasCount: body.visasCount || 0,
      deductionsAmount: body.deductionsAmount || 0,
    });
    
    // حفظ في قاعدة البيانات
    const settlement = await createLeaveSettlement({
      employeeId: body.employeeId,
      joinDate,
      leaveStartDate,
      leaveEndDate,
      leaveDays: body.leaveDays,
      previousBalanceDays: body.previousBalanceDays || 0,
      ticketsEntitlement: body.ticketsEntitlement || 'employee',
      visasCount: body.visasCount || 0,
      deductionsAmount: body.deductionsAmount || 0,
      serviceDays: calculation.serviceDays,
      accruedDays: Math.round(calculation.accruedDays),
      balanceBeforeDeduction: Math.round(calculation.balanceBeforeDeduction),
      currentLeaveDays: calculation.currentLeaveDays,
      balanceAfterDeduction: Math.round(calculation.balanceAfterDeduction),
      ticketsCount: calculation.ticketsCount,
      netPayable: calculation.netPayable,
    });
    
    return NextResponse.json({
      settlement,
      calculation,
    });
  } catch (error) {
    console.error('Error creating leave settlement:', error);
    return NextResponse.json(
      { error: 'Failed to create leave settlement', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Settlement ID is required' },
        { status: 400 }
      );
    }
    
    // إعادة حساب إذا تم تغيير البيانات الأساسية
    if (data.joinDate || data.leaveStartDate || data.leaveEndDate || data.leaveDays) {
      const joinDate = new Date(data.joinDate || body.joinDate);
      const leaveStartDate = new Date(data.leaveStartDate || body.leaveStartDate);
      const leaveEndDate = data.leaveEndDate ? new Date(data.leaveEndDate) : undefined;
      
      const calculation = calculateLeaveSettlement({
        joinDate,
        leaveStartDate,
        leaveEndDate,
        leaveDays: data.leaveDays,
        previousBalanceDays: data.previousBalanceDays || 0,
        ticketsEntitlement: data.ticketsEntitlement || 'employee',
        visasCount: data.visasCount || 0,
        deductionsAmount: data.deductionsAmount || 0,
      });
      
      data.serviceDays = calculation.serviceDays;
      data.accruedDays = Math.round(calculation.accruedDays);
      data.balanceBeforeDeduction = Math.round(calculation.balanceBeforeDeduction);
      data.currentLeaveDays = calculation.currentLeaveDays;
      data.balanceAfterDeduction = Math.round(calculation.balanceAfterDeduction);
      data.ticketsCount = calculation.ticketsCount;
      data.netPayable = calculation.netPayable;
    }
    
    const settlement = await updateLeaveSettlement(id, data);
    return NextResponse.json(settlement);
  } catch (error) {
    console.error('Error updating leave settlement:', error);
    return NextResponse.json(
      { error: 'Failed to update leave settlement' },
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
        { error: 'Settlement ID is required' },
        { status: 400 }
      );
    }
    
    await deleteLeaveSettlement(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting leave settlement:', error);
    return NextResponse.json(
      { error: 'Failed to delete leave settlement' },
      { status: 500 }
    );
  }
}

