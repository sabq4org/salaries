import { db } from './db';
import { employees, employeePayrolls, leaveSettlements } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export interface LedgerEntry {
  id: number;
  date: Date;
  type: 'salary' | 'leave_settlement' | 'bonus' | 'deduction';
  description: string;
  amount: number;
  year: number;
  month: number;
  details?: any;
}

export interface EmployeeLedger {
  employee: {
    id: number;
    name: string;
    position: string;
    baseSalary: number;
    socialInsurance: number;
    leaveBalance: number;
    isActive: boolean;
  };
  entries: LedgerEntry[];
  summary: {
    totalSalaries: number;
    totalLeaveSettlements: number;
    totalBonuses: number;
    totalDeductions: number;
    netTotal: number;
    entryCount: number;
  };
}

/**
 * الحصول على دفتر الأستاذ الكامل للموظف
 */
export async function getEmployeeLedger(
  employeeId: number,
  year?: number,
  month?: number
): Promise<EmployeeLedger | null> {
  try {
    // الحصول على بيانات الموظف
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (!employee) {
      return null;
    }

    const entries: LedgerEntry[] = [];

    // الحصول على سجلات الرواتب
    let payrollQuery = db
      .select()
      .from(employeePayrolls)
      .where(eq(employeePayrolls.employeeId, employeeId));

    const payrolls = await payrollQuery;

    for (const payroll of payrolls) {
      // تطبيق فلتر السنة والشهر إذا وجد
      if (year && payroll.year !== year) continue;
      if (month && payroll.month !== month) continue;

      entries.push({
        id: payroll.id,
        date: new Date(payroll.year, payroll.month - 1, 1),
        type: 'salary',
        description: `راتب ${getMonthName(payroll.month)} ${payroll.year}`,
        amount: payroll.netSalary,
        year: payroll.year,
        month: payroll.month,
        details: {
          baseSalary: payroll.baseSalary,
          allowances: payroll.allowances,
          deductions: payroll.deductions,
          socialInsurance: payroll.socialInsurance,
          netSalary: payroll.netSalary,
        },
      });
    }

    // الحصول على سجلات تصفية الإجازات
    const settlements = await db
      .select()
      .from(leaveSettlements)
      .where(eq(leaveSettlements.employeeId, employeeId));

    for (const settlement of settlements) {
      // تطبيق فلتر السنة والشهر إذا وجد
      if (year && settlement.year !== year) continue;
      if (month && settlement.month !== month) continue;

      entries.push({
        id: settlement.id,
        date: settlement.settlementDate || new Date(settlement.year, settlement.month - 1, 1),
        type: 'leave_settlement',
        description: `تصفية إجازة - ${settlement.leaveDays} يوم`,
        amount: settlement.settlementAmount,
        year: settlement.year,
        month: settlement.month,
        details: {
          leaveDays: settlement.leaveDays,
          dailyRate: settlement.dailyRate,
          settlementAmount: settlement.settlementAmount,
          reason: settlement.reason,
        },
      });
    }

    // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
    entries.sort((a, b) => b.date.getTime() - a.date.getTime());

    // حساب الملخص
    const summary = {
      totalSalaries: entries
        .filter(e => e.type === 'salary')
        .reduce((sum, e) => sum + e.amount, 0),
      totalLeaveSettlements: entries
        .filter(e => e.type === 'leave_settlement')
        .reduce((sum, e) => sum + e.amount, 0),
      totalBonuses: entries
        .filter(e => e.type === 'bonus')
        .reduce((sum, e) => sum + e.amount, 0),
      totalDeductions: entries
        .filter(e => e.type === 'deduction')
        .reduce((sum, e) => sum + Math.abs(e.amount), 0),
      netTotal: entries.reduce((sum, e) => sum + e.amount, 0),
      entryCount: entries.length,
    };

    return {
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position || '',
        baseSalary: employee.baseSalary,
        socialInsurance: employee.socialInsurance,
        leaveBalance: employee.leaveBalance,
        isActive: employee.isActive,
      },
      entries,
      summary,
    };
  } catch (error) {
    console.error('Error getting employee ledger:', error);
    return null;
  }
}

/**
 * الحصول على ملخص دفتر الأستاذ لجميع الموظفين
 */
export async function getAllEmployeesLedgerSummary(year?: number) {
  try {
    const allEmployees = await db.select().from(employees);
    const summaries = [];

    for (const employee of allEmployees) {
      const ledger = await getEmployeeLedger(employee.id, year);
      if (ledger) {
        summaries.push({
          employeeId: employee.id,
          employeeName: employee.name,
          position: employee.position,
          ...ledger.summary,
        });
      }
    }

    return summaries;
  } catch (error) {
    console.error('Error getting all employees ledger summary:', error);
    return [];
  }
}

/**
 * الحصول على اسم الشهر بالعربية
 */
function getMonthName(month: number): string {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[month - 1] || '';
}

/**
 * تصدير دفتر الأستاذ إلى CSV
 */
export function exportLedgerToCSV(ledger: EmployeeLedger): string {
  const headers = ['التاريخ', 'النوع', 'الوصف', 'المبلغ', 'السنة', 'الشهر'];
  const rows = ledger.entries.map(entry => [
    entry.date.toLocaleDateString('ar-SA'),
    getTypeLabel(entry.type),
    entry.description,
    entry.amount.toString(),
    entry.year.toString(),
    entry.month.toString(),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '',
    `إجمالي الرواتب,${ledger.summary.totalSalaries}`,
    `إجمالي تصفية الإجازات,${ledger.summary.totalLeaveSettlements}`,
    `الصافي,${ledger.summary.netTotal}`,
  ].join('\n');

  return csv;
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    salary: 'راتب',
    leave_settlement: 'تصفية إجازة',
    bonus: 'مكافأة',
    deduction: 'خصم',
  };
  return labels[type] || type;
}

