import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول الموظفين الرسميين
 */
export const employees = mysqlTable("employees", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  baseSalary: int("baseSalary").notNull().default(0),
  socialInsurance: int("socialInsurance").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * جدول المتعاونين
 */
export const contractors = mysqlTable("contractors", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  salary: int("salary").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

/**
 * جدول سجلات الرواتب الشهرية للموظفين
 */
export const employeePayrolls = mysqlTable("employeePayrolls", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employeeId").notNull(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  baseSalary: int("baseSalary").notNull().default(0),
  socialInsurance: int("socialInsurance").notNull().default(0),
  deduction: int("deduction").notNull().default(0),
  bonus: int("bonus").notNull().default(0),
  netSalary: int("netSalary").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type EmployeePayroll = typeof employeePayrolls.$inferSelect;
export type InsertEmployeePayroll = typeof employeePayrolls.$inferInsert;

/**
 * جدول سجلات الرواتب الشهرية للمتعاونين
 */
export const contractorPayrolls = mysqlTable("contractorPayrolls", {
  id: int("id").primaryKey().autoincrement(),
  contractorId: int("contractorId").notNull(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  salary: int("salary").notNull().default(0),
  deduction: int("deduction").notNull().default(0),
  bonus: int("bonus").notNull().default(0),
  netSalary: int("netSalary").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ContractorPayroll = typeof contractorPayrolls.$inferSelect;
export type InsertContractorPayroll = typeof contractorPayrolls.$inferInsert;

/**
 * جدول بنود المصروفات
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").primaryKey().autoincrement(),
  category: varchar("category", { length: 255 }).notNull(),
  plannedBudget: int("plannedBudget").notNull().default(0),
  actualExpense: int("actualExpense").notNull().default(0),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

