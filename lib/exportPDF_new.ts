import html2pdf from 'html2pdf.js';

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
  netS
