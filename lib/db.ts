import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "../drizzle/schema";

const { employees, contractors, employeePayrolls, contractorPayrolls, expenses } = schema;

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Employees
export async function getAllEmployees() {
  const db = getDb();
  if (!db) return [];
  return await db.select().from(employees).where(eq(employees.isActive, true));
}

export async function createEmployee(data: typeof employees.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(employees).values({
    ...data,
    isActive: true,
  });
  
  return { id: Number(result[0].insertId), ...data };
}

export async function updateEmployee(id: number, data: Partial<typeof employees.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(employees).set(data).where(eq(employees.id, id));
  return { id, ...data };
}

export async function deleteEmployee(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(employees).set({ isActive: false }).where(eq(employees.id, id));
}

// Contractors
export async function getAllContractors() {
  const db = getDb();
  if (!db) return [];
  return await db.select().from(contractors).where(eq(contractors.isActive, true));
}

export async function createContractor(data: typeof contractors.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contractors).values({
    ...data,
    isActive: true,
  });
  
  return { id: Number(result[0].insertId), ...data };
}

export async function updateContractor(id: number, data: Partial<typeof contractors.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contractors).set(data).where(eq(contractors.id, id));
  return { id, ...data };
}

export async function deleteContractor(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contractors).set({ isActive: false }).where(eq(contractors.id, id));
}

// Payrolls
export async function getEmployeePayrolls() {
  const db = getDb();
  if (!db) return [];
  return await db.select().from(employeePayrolls);
}

export async function getContractorPayrolls() {
  const db = getDb();
  if (!db) return [];
  return await db.select().from(contractorPayrolls);
}

// Expenses
export async function getAllExpenses() {
  const db = getDb();
  if (!db) return [];
  return await db.select().from(expenses);
}

export async function createExpense(data: typeof expenses.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(expenses).values(data);
  return { id: Number(result[0].insertId), ...data };
}

