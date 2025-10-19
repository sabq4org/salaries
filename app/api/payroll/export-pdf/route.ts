import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

const months = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate HTML content
    const htmlContent = generateHTML(data);
    
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '15mm',
        right: '10mm',
        bottom: '15mm',
        left: '10mm'
      }
    });
    
    await browser.close();
    
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payroll_${data.year}_${data.month}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateHTML(data: any): string {
  const monthName = months[data.month - 1];
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مسير رواتب ${monthName} ${data.year}</title>
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
      color: #2c3e50;
    }
    
    .header {
      background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .header p {
      font-size: 18px;
      font-weight: 400;
      opacity: 0.95;
    }
    
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #1565c0;
      margin: 30px 0 15px;
      padding: 12px 20px;
      background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
      border-right: 5px solid #1e88e5;
      border-radius: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    
    thead {
      background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
      color: white;
    }
    
    thead.contractor {
      background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
    }
    
    th {
      padding: 16px 12px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    td {
      padding: 14px 12px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }
    
    tbody tr:nth-child(even) {
      background-color: #f5f5f5;
    }
    
    tbody tr:hover {
      background-color: #e3f2fd;
    }
    
    .net-salary {
      font-weight: 700;
      color: #2e7d32;
      font-size: 14px;
    }
    
    .summary-box {
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      border: 2px solid #bdbdbd;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .summary-title {
      font-size: 24px;
      font-weight: 700;
      color: #1565c0;
      margin-bottom: 20px;
      text-align: center;
      padding-bottom: 15px;
      border-bottom: 3px solid #1e88e5;
    }
    
    .summary-table {
      width: 100%;
      margin-top: 15px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .summary-table td {
      padding: 16px 20px;
      font-size: 16px;
      border: none;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .summary-table td:first-child {
      font-weight: 700;
      color: #424242;
      text-align: right;
      width: 60%;
    }
    
    .summary-table td:last-child {
      font-weight: 700;
      color: #1565c0;
      text-align: left;
      font-size: 17px;
    }
    
    .summary-table tr:last-child {
      background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
      border-bottom: none;
    }
    
    .summary-table tr:last-child td {
      font-size: 20px;
      color: #0d47a1;
      padding: 20px;
      font-weight: 800;
    }
    
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding: 30px 40px;
      background: #fafafa;
      border-radius: 12px;
      border: 2px solid #e0e0e0;
    }
    
    .signature-box {
      text-align: center;
      flex: 1;
    }
    
    .signature-label {
      font-size: 16px;
      color: #757575;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .signature-line {
      width: 200px;
      height: 2px;
      background: #bdbdbd;
      margin: 40px auto 12px;
    }
    
    .signature-name {
      font-size: 18px;
      font-weight: 700;
      color: #1565c0;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #9e9e9e;
      font-size: 13px;
    }
    
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>مسير رواتب ${monthName} ${data.year}</h1>
    <p>صحيفة سبق الإلكترونية</p>
  </div>

  ${data.employeePayrolls && data.employeePayrolls.length > 0 ? `
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
      ${data.employeePayrolls.map((emp: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>${emp.employeeName || ''}</td>
          <td>${emp.position || '-'}</td>
          <td>${emp.baseSalary.toLocaleString('ar-SA')} ر.س</td>
          <td>${emp.socialInsurance.toLocaleString('ar-SA')} ر.س</td>
          <td>${emp.deduction.toLocaleString('ar-SA')} ر.س</td>
          <td>${emp.bonus.toLocaleString('ar-SA')} ر.س</td>
          <td class="net-salary">${emp.netSalary.toLocaleString('ar-SA')} ر.س</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${data.contractorPayrolls && data.contractorPayrolls.length > 0 ? `
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
      ${data.contractorPayrolls.map((con: any, index: number) => `
        <tr>
          <td>${index + 1}</td>
          <td>${con.contractorName || ''}</td>
          <td>${con.position || '-'}</td>
          <td>${con.salary.toLocaleString('ar-SA')} ر.س</td>
          <td>${con.deduction.toLocaleString('ar-SA')} ر.س</td>
          <td>${con.bonus.toLocaleString('ar-SA')} ر.س</td>
          <td class="net-salary">${con.netSalary.toLocaleString('ar-SA')} ر.س</td>
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

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-label">المدير المالي</div>
      <div class="signature-line"></div>
      <div class="signature-name">التوقيع</div>
    </div>
    
    <div class="signature-box">
      <div class="signature-label">المدير العام</div>
      <div class="signature-line"></div>
      <div class="signature-name">علي بن عبده الحازمي</div>
    </div>
  </div>

  <div class="footer">
    تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} | صحيفة سبق الإلكترونية
  </div>
</body>
</html>
  `;
}

