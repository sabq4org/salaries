import { pgTable, serial, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

/**
 * جدول المستخدمين
 */
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default('user').notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول الموظفين الرسميين
 */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  baseSalary: integer("baseSalary").notNull().default(0),
  socialInsurance: integer("socialInsurance").notNull().default(0),
  sortOrder: integer("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * جدول المتعاونين
 */
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  salary: integer("salary").notNull().default(0),
  sortOrder: integer("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

/**
 * جدول مسير رواتب الموظفين الرسميين
 */
export const employeePayrolls = pgTable("employeePayrolls", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  baseSalary: integer("baseSalary").notNull().default(0),
  socialInsurance: integer("socialInsurance").notNull().default(0),
  deduction: integer("deduction").notNull().default(0),
  bonus: integer("bonus").notNull().default(0),
  netSalary: integer("netSalary").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type EmployeePayroll = typeof employeePayrolls.$inferSelect;
export type InsertEmployeePayroll = typeof employeePayrolls.$inferInsert;

/**
 * جدول مسير رواتب المتعاونين
 */
export const contractorPayrolls = pgTable("contractorPayrolls", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractorId").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  salary: integer("salary").notNull().default(0),
  deduction: integer("deduction").notNull().default(0),
  bonus: integer("bonus").notNull().default(0),
  netSalary: integer("netSalary").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ContractorPayroll = typeof contractorPayrolls.$inferSelect;
export type InsertContractorPayroll = typeof contractorPayrolls.$inferInsert;

/**
 * جدول المصروفات والميزانية
 */
export const expenseTypeEnum = pgEnum('expense_type', ['salary', 'operational', 'marketing', 'other']);

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  quarter: integer("quarter").notNull(), // 1, 2, 3, 4
  type: expenseTypeEnum("type").notNull(),
  description: text("description"),
  amount: integer("amount").notNull().default(0),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * جدول الإيرادات
 */
export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  quarter: integer("quarter").notNull(), // 1, 2, 3, 4
  source: text("source").notNull(),
  amount: integer("amount").notNull().default(0),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;

