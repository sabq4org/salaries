import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from "drizzle-orm";
import * as schema from "@/drizzle/schema";
import { employees, contractors, employeePayrolls, contractorPayrolls, expenses, leaveSettlements, reminders, expenseCategories } from "@/drizzle/schema";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Employees
export async function getAllEmployees() {
  return await db.select().from(employees).where(eq(employees.isActive, true)).orderBy(employees.sortOrder);
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
  return await db.select().from(contractors).where(eq(contractors.isActive, true)).orderBy(contractors.sortOrder);
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
export async function getAllExpenses(year?: number) {
  if (year) {
    return await db.select().from(expenses).where(eq(expenses.year, year));
  }
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

// Leave Settlements
export async function getAllLeaveSettlements() {
  const results = await db
    .select({
      id: leaveSettlements.id,
      employeeId: leaveSettlements.employeeId,
      employeeName: employees.name,
      employeePosition: employees.position,
      joinDate: leaveSettlements.joinDate,
      leaveStartDate: leaveSettlements.leaveStartDate,
      leaveEndDate: leaveSettlements.leaveEndDate,
      leaveDays: leaveSettlements.leaveDays,
      previousBalanceDays: leaveSettlements.previousBalanceDays,
      ticketsEntitlement: leaveSettlements.ticketsEntitlement,
      visasCount: leaveSettlements.visasCount,
      deductionsAmount: leaveSettlements.deductionsAmount,
      serviceDays: leaveSettlements.serviceDays,
      accruedDays: leaveSettlements.accruedDays,
      balanceBeforeDeduction: leaveSettlements.balanceBeforeDeduction,
      currentLeaveDays: leaveSettlements.currentLeaveDays,
      balanceAfterDeduction: leaveSettlements.balanceAfterDeduction,
      ticketsCount: leaveSettlements.ticketsCount,
      netPayable: leaveSettlements.netPayable,
      createdAt: leaveSettlements.createdAt,
    })
    .from(leaveSettlements)
    .leftJoin(employees, eq(leaveSettlements.employeeId, employees.id))
    .orderBy(leaveSettlements.createdAt);
  
  return results;
}

export async function getLeaveSettlementsByEmployee(employeeId: number) {
  return await db.select().from(leaveSettlements).where(eq(leaveSettlements.employeeId, employeeId));
}

export async function createLeaveSettlement(data: typeof leaveSettlements.$inferInsert) {
  const result = await db.insert(leaveSettlements).values(data).returning();
  return result[0];
}

export async function updateLeaveSettlement(id: number, data: Partial<typeof leaveSettlements.$inferInsert>) {
  const result = await db.update(leaveSettlements).set(data).where(eq(leaveSettlements.id, id)).returning();
  return result[0];
}

export async function deleteLeaveSettlement(id: number) {
  await db.delete(leaveSettlements).where(eq(leaveSettlements.id, id));
}



// Reminders
export async function getAllReminders() {
  const results = await db
    .select({
      id: reminders.id,
      title: reminders.title,
      type: reminders.type,
      employeeId: reminders.employeeId,
      employeeName: employees.name,
      startDate: reminders.startDate,
      dueDate: reminders.dueDate,
      notes: reminders.notes,
      status: reminders.status,
      isCompleted: reminders.isCompleted,
      createdAt: reminders.createdAt,
      updatedAt: reminders.updatedAt,
    })
    .from(reminders)
    .leftJoin(employees, eq(reminders.employeeId, employees.id))
    .orderBy(reminders.dueDate);
  
  return results;
}

export async function getActiveReminders() {
  const results = await db
    .select({
      id: reminders.id,
      title: reminders.title,
      type: reminders.type,
      employeeId: reminders.employeeId,
      employeeName: employees.name,
      startDate: reminders.startDate,
      dueDate: reminders.dueDate,
      notes: reminders.notes,
      status: reminders.status,
      isCompleted: reminders.isCompleted,
      createdAt: reminders.createdAt,
      updatedAt: reminders.updatedAt,
    })
    .from(reminders)
    .leftJoin(employees, eq(reminders.employeeId, employees.id))
    .where(eq(reminders.isCompleted, false))
    .orderBy(reminders.dueDate);
  
  return results;
}

export async function createReminder(data: typeof reminders.$inferInsert) {
  const result = await db.insert(reminders).values(data).returning();
  return result[0];
}

export async function updateReminder(id: number, data: Partial<typeof reminders.$inferInsert>) {
  const result = await db.update(reminders).set(data).where(eq(reminders.id, id)).returning();
  return result[0];
}

export async function deleteReminder(id: number) {
  await db.delete(reminders).where(eq(reminders.id, id));
}

export async function completeReminder(id: number) {
  const result = await db
    .update(reminders)
    .set({ isCompleted: true, status: 'completed', updatedAt: new Date() })
    .where(eq(reminders.id, id))
    .returning();
  return result[0];
}




// ============================================
// Expense Categories Functions
// ============================================

export async function getAllExpenseCategories() {
  return await db.select().from(expenseCategories).orderBy(expenseCategories.displayOrder);
}

export async function getActiveExpenseCategories() {
  return await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.isActive, true))
    .orderBy(expenseCategories.displayOrder);
}

export async function getExpenseCategoryById(id: number) {
  const result = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
  return result[0];
}

export async function createExpenseCategory(data: typeof expenseCategories.$inferInsert) {
  const result = await db.insert(expenseCategories).values(data).returning();
  return result[0];
}

export async function updateExpenseCategory(id: number, data: Partial<typeof expenseCategories.$inferInsert>) {
  const result = await db.update(expenseCategories).set({ ...data, updatedAt: new Date() }).where(eq(expenseCategories.id, id)).returning();
  return result[0];
}

export async function deleteExpenseCategory(id: number) {
  await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
}

export async function reorderExpenseCategories(categoryIds: number[]) {
  // تحديث ترتيب البنود
  for (let i = 0; i < categoryIds.length; i++) {
    await db
      .update(expenseCategories)
      .set({ displayOrder: i + 1, updatedAt: new Date() })
      .where(eq(expenseCategories.id, categoryIds[i]));
  }
}

