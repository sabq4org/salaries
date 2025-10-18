import * as XLSX from 'xlsx';

interface EmployeePayroll {
  id: number;
  employeeId: number;
  employeeName?: string;
  position?: string;
  year: number;
  month: number;
  baseSalary: number;
  socialInsurance: number;
  deduction: number;
  bonus: number;
  netSalary: number;
}

interface ContractorPayroll {
  id: number;
  contractorId: number;
  contractorName?: string;
  position?: string;
  year: number;
  month: number;
  salary: number;
  deduction: number;
  bonus: number;
  netSalary: number;
}

interface PayrollData {
  employeePayrolls: EmployeePayroll[];
  contractorPayrolls: ContractorPayroll[];
  year: number;
  month: number;
  totalEmployeeSalaries: number;
  totalContractorSalaries: number;
  totalSocialInsurance: number;
  grandTotal: number;
}

const months = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const exportPayrollToExcel = (data: PayrollData) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare data arrays
  const worksheetData: any[] = [];

  // Title
  worksheetData.push([`مسير رواتب ${months[data.month - 1]} ${data.year}`]);
  worksheetData.push(['صحيفة سبق الإلكترونية']);
  worksheetData.push([]); // Empty row

  // Employee Payrolls Section
  if (data.employeePayrolls.length > 0) {
    worksheetData.push(['الموظفون الرسميون']);
    worksheetData.push([
      'م',
      'الاسم الكامل',
      'المنصب الوظيفي',
      'الراتب الأساسي (ر.س)',
      'التأمينات الاجتماعية (ر.س)',
      'الخصومات (ر.س)',
      'البدلات (ر.س)',
      'صافي الراتب (ر.س)'
    ]);

    data.employeePayrolls.forEach((emp, index) => {
      worksheetData.push([
        index + 1,
        emp.employeeName || '',
        emp.position || '-',
        emp.baseSalary,
        emp.socialInsurance,
        emp.deduction,
        emp.bonus,
        emp.netSalary
      ]);
    });

    worksheetData.push([]); // Empty row
  }

  // Contractor Payrolls Section
  if (data.contractorPayrolls.length > 0) {
    worksheetData.push(['المتعاونون']);
    worksheetData.push([
      'م',
      'الاسم الكامل',
      'المنصب الوظيفي',
      'الراتب (ر.س)',
      'الخصومات (ر.س)',
      'البدلات (ر.س)',
      'صافي الراتب (ر.س)'
    ]);

    data.contractorPayrolls.forEach((con, index) => {
      worksheetData.push([
        index + 1,
        con.contractorName || '',
        con.position || '-',
        con.salary,
        con.deduction,
        con.bonus,
        con.netSalary
      ]);
    });

    worksheetData.push([]); // Empty row
  }

  // Summary Section
  worksheetData.push(['الملخص المالي']);
  worksheetData.push(['إجمالي رواتب الموظفين الرسميين', `${data.totalEmployeeSalaries.toLocaleString('ar-SA')} ر.س`]);
  worksheetData.push(['إجمالي رواتب المتعاونين', `${data.totalContractorSalaries.toLocaleString('ar-SA')} ر.س`]);
  worksheetData.push(['إجمالي التأمينات الاجتماعية', `${data.totalSocialInsurance.toLocaleString('ar-SA')} ر.س`]);
  worksheetData.push(['الإجمالي الكلي', `${data.grandTotal.toLocaleString('ar-SA')} ر.س`]);
  worksheetData.push([]); // Empty row

  // Signature Section
  worksheetData.push(['المدير العام']);
  worksheetData.push(['علي بن عبده الحازمي']);
  worksheetData.push([]); // Empty row

  // Footer
  const currentDate = new Date().toLocaleDateString('ar-SA');
  worksheetData.push([`تاريخ الطباعة: ${currentDate}`]);

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = [
    { wch: 5 },  // م
    { wch: 25 }, // الاسم
    { wch: 20 }, // المنصب
    { wch: 15 }, // الراتب الأساسي
    { wch: 15 }, // التأمينات
    { wch: 15 }, // الخصومات
    { wch: 15 }, // البدلات
    { wch: 15 }  // صافي الراتب
  ];
  ws['!cols'] = colWidths;

  // Set RTL for the worksheet
  if (!ws['!views']) ws['!views'] = [];
  ws['!views'].push({ rightToLeft: true });

  // Styling (basic - Excel will handle most formatting)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  
  // Apply styles to header rows (this is basic, actual styling requires more complex setup)
  // For now, we'll rely on Excel's default formatting

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'مسير الرواتب');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `مسير_رواتب_${months[data.month - 1]}_${data.year}.xlsx`);
};

