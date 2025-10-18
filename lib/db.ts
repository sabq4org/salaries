import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from "drizzle-orm";
import * as schema from "../drizzle/schema";

const { employees, contractors, employeePayrolls, contractorPayrolls, expenses } = schema;

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Employees
export async function getAllEmployees() {
  return await db.select().from(employees).where(eq(employees.isActive, true));
}

export async function createEmployee(data: typeof employees.$inferInsert) {
  const result = await db.insert(employees).values({
    ...data,
    isActive: true,
  }).returning();
  
  return result[0];
}

export async function updateEmployee(id: number, data: Partial<typeof employees.$inferInsert>) {
  const result = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
  return result[0];
}

export async function deleteEmployee(id: number) {
  await db.update(employees).set({ isActive: false }).where(eq(employees.id, id));
}

// Contractors
export async function getAllContractors() {
  return await db.select().from(contractors).where(eq(contractors.isActive, true));
}

export async function createContractor(data: typeof contractors.$inferInsert) {
  const result = await db.insert(contractors).values({
    ...data,
    isActive: true,
  }).returning();
  
  return result[0];
}

export async function updateContractor(id: number, data: Partial<typeof contractors.$inferInsert>) {
  const result = await db.update(contractors).set(data).where(eq(contractors.id, id)).returning();
  return result[0];
}

export async function deleteContractor(id: number) {
  await db.update(contractors).set({ isActive: false }).where(eq(contractors.id, id));
}

// Payrolls
export async function getEmployeePayrolls() {
  return await db.select().from(employeePayrolls);
}

export async function getContractorPayrolls() {
  return await db.select().from(contractorPayrolls);
}

// Expenses
export async function getAllExpenses() {
  return await db.select().from(expenses);
}

export async function createExpense(data: typeof expenses.$inferInsert) {
  const result = await db.insert(expenses).values(data).returning();
  return result[0];
}



// Payroll functions
export async function getAllPayroll(year?: number, month?: number) {
  let query = db.select().from(employeePayrolls);
  
  if (year && month) {
    query = query.where(eq(employeePayrolls.year, year));
    // Note: Add month filter if needed
  }
  
  return await query;
}

export async function createPayroll(data: typeof employeePayrolls.$inferInsert) {
  const result = await db.insert(employeePayrolls).values(data).returning();
  return result[0];
}

export async function updatePayroll(id: number, data: Partial<typeof employeePayrolls.$inferInsert>) {
  const result = await db.update(employeePayrolls).set(data).where(eq(employeePayrolls.id, id)).returning();
  return result[0];
}

export async function deletePayroll(id: number) {
  await db.delete(employeePayrolls).where(eq(employeePayrolls.id, id));
}

// Expense functions
export async function updateExpense(id: number, data: Partial<typeof expenses.$inferInsert>) {
  const result = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
  return result[0];
}

export async function deleteExpense(id: number) {
  await db.delete(expenses).where(eq(expenses.id, id));
}

