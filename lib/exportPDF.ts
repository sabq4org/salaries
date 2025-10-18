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

export const exportPayrollToPDF = async (data: PayrollData) => {
  try {
    const response = await fetch('/api/payroll/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `مسير_رواتب_${months[data.month - 1]}_${data.year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

