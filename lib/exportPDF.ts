"use client";

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

export const exportPayrollToPDF = (data: PayrollData) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لتصدير PDF');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مسير رواتب ${months[data.month - 1]} ${data.year}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      padding: 20px;
      background: white;
    }
    
    .header {
      background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      font-weight: 400;
    }
    
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #2c3e50;
      margin: 25px 0 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3498db;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    thead {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
    }
    
    thead.contractor {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }
    
    th {
      padding: 15px 10px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
    }
    
    td {
      padding: 12px 10px;
      text-align: center;
      border-bottom: 1px solid #ecf0f1;
      font-size: 13px;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    tbody tr:hover {
      background-color: #e8f4f8;
    }
    
    .summary-box {
      background: linear-gradient(135deg, #ecf0f1 0%, #f8f9fa 100%);
      padding: 25px;
      border-radius: 10px;
      margin: 30px 0;
      border: 2px solid #bdc3c7;
    }
    
    .summary-title {
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .summary-table {
      width: 100%;
      margin-top: 10px;
    }
    
    .summary-table td {
      padding: 12px;
      font-size: 15px;
      border: none;
    }
    
    .summary-table td:first-child {
      font-weight: 700;
      color: #34495e;
      text-align: right;
      width: 60%;
    }
    
    .summary-table td:last-child {
      font-weight: 700;
      color: #2980b9;
      text-align: left;
      font-size: 16px;
    }
    
    .summary-table tr {
      border-bottom: 1px solid #d5dbdb;
    }
    
    .summary-table tr:last-child {
      border-bottom: none;
      background: #d5e8f7;
    }
    
    .summary-table tr:last-child td {
      font-size: 18px;
      color: #1a5490;
      padding: 15px 12px;
    }
    
    .signature-box {
      margin-top: 40px;
      text-align: right;
      padding: 20px;
    }
    
    .signature-label {
      font-size: 16px;
      color: #7f8c8d;
      margin-bottom: 8px;
    }
    
    .signature-name {
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
      color: #95a5a6;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 10px;
      }
      
      .header {
        break-inside: avoid;
      }
      
      table {
        break-inside: avoid;
      }
      
      .summary-box {
        break-inside: avoid;
      }
      
      @page {
        size: A4 landscape;
        margin: 15mm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>مسير رواتب ${months[data.month - 1]} ${data.year}</h1>
    <p>صحيفة سبق الإلكترونية</p>
  </div>

  ${data.employeePayrolls.length > 0 ? `
  <h2 class="section-title">الموظفون الرسميون</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">م</th>
        <th style="width: 20%;">الاسم الكامل</th>
        <th style="width: 15%;">المنصب الوظيفي</th>
        <th style="width: 12%;">الراتب الأساسي</th>
        <th style="width: 12%;">التأمينات</th>
        <th style="width: 12%;">الخصومات</th>
        <th style="width: 12%;">البدلات</th>
        <th style="width: 12%;">صافي الراتب</th>
      </tr>
    </thead>
    <tbody>
      ${data.employeePayrolls.map((emp, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${emp.employeeName || ''}</td>
          <td>${emp.position || '-'}</td>
          <td>${emp.baseSalary.toLocaleString('ar-SA')} ر.س</td>
          <td>${emp.socialInsurance.toLocaleString('ar-SA')} ر.س</td>
          <td>${emp.deduction.toLocaleString('ar-SA')} ر.س</td>
          <td>${emp.bonus.toLocaleString('ar-SA')} ر.س</td>
          <td style="font-weight: 700; color: #27ae60;">${emp.netSalary.toLocaleString('ar-SA')} ر.س</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${data.contractorPayrolls.length > 0 ? `
  <h2 class="section-title">المتعاونون</h2>
  <table>
    <thead class="contractor">
      <tr>
        <th style="width: 5%;">م</th>
        <th style="width: 25%;">الاسم الكامل</th>
        <th style="width: 20%;">المنصب الوظيفي</th>
        <th style="width: 15%;">الراتب</th>
        <th style="width: 12%;">الخصومات</th>
        <th style="width: 12%;">البدلات</th>
        <th style="width: 11%;">صافي الراتب</th>
      </tr>
    </thead>
    <tbody>
      ${data.contractorPayrolls.map((con, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${con.contractorName || ''}</td>
          <td>${con.position || '-'}</td>
          <td>${con.salary.toLocaleString('ar-SA')} ر.س</td>
          <td>${con.deduction.toLocaleString('ar-SA')} ر.س</td>
          <td>${con.bonus.toLocaleString('ar-SA')} ر.س</td>
          <td style="font-weight: 700; color: #27ae60;">${con.netSalary.toLocaleString('ar-SA')} ر.س</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="summary-box">
    <h3 class="summary-title">الملخص المالي</h3>
    <table class="summary-table">
      <tr>
        <td>إجمالي رواتب الموظفين الرسميين</td>
        <td>${data.totalEmployeeSalaries.toLocaleString('ar-SA')} ر.س</td>
      </tr>
      <tr>
        <td>إجمالي رواتب المتعاونين</td>
        <td>${data.totalContractorSalaries.toLocaleString('ar-SA')} ر.س</td>
      </tr>
      <tr>
        <td>إجمالي التأمينات الاجتماعية</td>
        <td>${data.totalSocialInsurance.toLocaleString('ar-SA')} ر.س</td>
      </tr>
      <tr>
        <td>الإجمالي الكلي</td>
        <td>${data.grandTotal.toLocaleString('ar-SA')} ر.س</td>
      </tr>
    </table>
  </div>

  <div class="signature-box">
    <div class="signature-label">المدير العام</div>
    <div class="signature-name">علي بن عبده الحازمي</div>
  </div>

  <div class="footer">
    تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() {
          window.close();
        }, 100);
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

