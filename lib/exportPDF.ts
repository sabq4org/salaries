import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Function to reverse Arabic text for proper display in PDF
const reverseArabic = (text: string): string => {
  return text.split('').reverse().join('');
};

export const exportPayrollToPDF = (data: PayrollData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add custom font for Arabic support (using default font with workaround)
  doc.setFont('helvetica');
  doc.setLanguage('ar');

  // Header with Sabq logo styling
  doc.setFillColor(41, 128, 185); // Blue color
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  const title = `مسير رواتب ${months[data.month - 1]} ${data.year}`;
  doc.text(title, pageWidth / 2, 15, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('صحيفة سبق الإلكترونية', pageWidth / 2, 23, { align: 'center' });

  let yPosition = 40;

  // Employee Payrolls Section
  if (data.employeePayrolls.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('الموظفون الرسميون', pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 8;

    const employeeTableData = data.employeePayrolls.map((emp, index) => [
      (index + 1).toString(),
      emp.employeeName || '',
      emp.position || '-',
      emp.baseSalary.toLocaleString('ar-SA'),
      emp.socialInsurance.toLocaleString('ar-SA'),
      emp.deduction.toLocaleString('ar-SA'),
      emp.bonus.toLocaleString('ar-SA'),
      emp.netSalary.toLocaleString('ar-SA'),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [[
        'م',
        'الاسم',
        'المنصب',
        'الراتب الأساسي',
        'التأمينات',
        'الخصومات',
        'البدلات',
        'صافي الراتب'
      ]],
      body: employeeTableData,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 4,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 15, right: 15 },
      theme: 'grid'
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Contractor Payrolls Section
  if (data.contractorPayrolls.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('المتعاونون', pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 8;

    const contractorTableData = data.contractorPayrolls.map((con, index) => [
      (index + 1).toString(),
      con.contractorName || '',
      con.position || '-',
      con.salary.toLocaleString('ar-SA'),
      con.deduction.toLocaleString('ar-SA'),
      con.bonus.toLocaleString('ar-SA'),
      con.netSalary.toLocaleString('ar-SA'),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [[
        'م',
        'الاسم',
        'المنصب',
        'الراتب',
        'الخصومات',
        'البدلات',
        'صافي الراتب'
      ]],
      body: contractorTableData,
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 4,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 15, right: 15 },
      theme: 'grid'
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Summary Section
  if (yPosition > pageHeight - 70) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('الملخص المالي', pageWidth - 15, yPosition, { align: 'right' });
  yPosition += 8;

  const summaryData = [
    ['إجمالي رواتب الموظفين الرسميين', `${data.totalEmployeeSalaries.toLocaleString('ar-SA')} ر.س`],
    ['إجمالي رواتب المتعاونين', `${data.totalContractorSalaries.toLocaleString('ar-SA')} ر.س`],
    ['إجمالي التأمينات الاجتماعية', `${data.totalSocialInsurance.toLocaleString('ar-SA')} ر.س`],
    ['الإجمالي الكلي', `${data.grandTotal.toLocaleString('ar-SA')} ر.س`],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: summaryData,
    styles: {
      font: 'helvetica',
      fontSize: 12,
      cellPadding: 5,
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
      1: { fontStyle: 'bold', fillColor: [255, 255, 255] }
    },
    margin: { left: 15, right: 15 },
    theme: 'grid'
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Signature Section
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('المدير العام', pageWidth - 15, yPosition, { align: 'right' });
  yPosition += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('علي بن عبده الحازمي', pageWidth - 15, yPosition, { align: 'right' });

  // Footer
  const currentDate = new Date().toLocaleDateString('ar-SA');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`تاريخ الطباعة: ${currentDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`مسير_رواتب_${months[data.month - 1]}_${data.year}.pdf`);
};

