import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contractorPayrolls, contractors } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    let result;
    if (year && month) {
      result = await db
        .select()
        .from(contractorPayrolls)
        .where(
          and(
            eq(contractorPayrolls.year, parseInt(year)),
            eq(contractorPayrolls.month, parseInt(month))
          )
        );
    } else {
      result = await db.select().from(contractorPayrolls);
    }
    
    // Join with contractors to get names
    const enrichedResult = await Promise.all(
      result.map(async (payroll) => {
        const contractor = await db
          .select()
          .from(contractors)
          .where(eq(contractors.id, payroll.contractorId))
          .limit(1);
        
        return {
          ...payroll,
          contractorName: contractor[0]?.name || 'غير معروف',
        };
      })
    );
    
    return NextResponse.json(enrichedResult);
  } catch (error) {
    console.error('GET /api/contractor-payroll error:', error);
    return NextResponse.json({ error: 'Failed to fetch contractor payrolls' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Calculate net salary
    const netSalary = body.salary - body.deduction + body.bonus;
    
    const payrollData = {
      contractorId: parseInt(body.contractorId),
      year: parseInt(body.year),
      month: parseInt(body.month),
      salary: parseInt(body.salary) || 0,
      deduction: parseInt(body.deduction) || 0,
      bonus: parseInt(body.bonus) || 0,
      netSalary,
    };
    
    const result = await db.insert(contractorPayrolls).values(payrollData).returning();
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/contractor-payroll error:', error);
    return NextResponse.json({ error: 'Failed to create contractor payroll' }, { status: 500 });
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
    
    // Calculate net salary
    const netSalary = body.salary - body.deduction + body.bonus;
    
    const payrollData: any = {};
    if (body.contractorId !== undefined) payrollData.contractorId = parseInt(body.contractorId);
    if (body.year !== undefined) payrollData.year = parseInt(body.year);
    if (body.month !== undefined) payrollData.month = parseInt(body.month);
    if (body.salary !== undefined) payrollData.salary = parseInt(body.salary);
    if (body.deduction !== undefined) payrollData.deduction = parseInt(body.deduction);
    if (body.bonus !== undefined) payrollData.bonus = parseInt(body.bonus);
    payrollData.netSalary = netSalary;
    
    const result = await db
      .update(contractorPayrolls)
      .set(payrollData)
      .where(eq(contractorPayrolls.id, parseInt(id)))
      .returning();
      
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('PUT /api/contractor-payroll error:', error);
    return NextResponse.json({ error: 'Failed to update contractor payroll' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await db.delete(contractorPayrolls).where(eq(contractorPayrolls.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/contractor-payroll error:', error);
    return NextResponse.json({ error: 'Failed to delete contractor payroll' }, { status: 500 });
  }
}

