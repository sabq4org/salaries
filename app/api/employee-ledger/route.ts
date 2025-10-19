import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeLedger, getAllEmployeesLedgerSummary } from '@/lib/employee-ledger';

/**
 * GET - الحصول على دفتر الأستاذ للموظف
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const summary = searchParams.get('summary');

    // إذا كان المطلوب ملخص جميع الموظفين
    if (summary === 'all') {
      const summaries = await getAllEmployeesLedgerSummary(
        year ? parseInt(year) : undefined
      );
      return NextResponse.json(summaries);
    }

    // إذا لم يتم تحديد معرف الموظف
    if (!employeeId) {
      return NextResponse.json(
        { error: 'معرف الموظف مطلوب' },
        { status: 400 }
      );
    }

    // الحصول على دفتر الأستاذ للموظف
    const ledger = await getEmployeeLedger(
      parseInt(employeeId),
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined
    );

    if (!ledger) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(ledger);
  } catch (error) {
    console.error('GET /api/employee-ledger error:', error);
    return NextResponse.json(
      { error: 'فشل في تحميل دفتر الأستاذ' },
      { status: 500 }
    );
  }
}

