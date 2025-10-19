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
  leaveBalance: integer("leaveBalance").notNull().default(0),
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
  type: text("type").notNull(),
  description: text("description"),
  amount: integer("amount").notNull().default(0),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
  attachmentUrl: text("attachmentUrl"),
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
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;


/**
 * جدول تصفية الإجازات
 */
export const ticketsEntitlementEnum = pgEnum('tickets_entitlement', ['employee', 'family4']);

export const leaveSettlements = pgTable("leaveSettlements", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  joinDate: timestamp("joinDate").notNull(),
  leaveStartDate: timestamp("leaveStartDate").notNull(),
  leaveEndDate: timestamp("leaveEndDate"),
  leaveDays: integer("leaveDays"),
  previousBalanceDays: integer("previousBalanceDays").notNull().default(0),
  ticketsEntitlement: ticketsEntitlementEnum("ticketsEntitlement").notNull().default('employee'),
  visasCount: integer("visasCount").notNull().default(0),
  deductionsAmount: integer("deductionsAmount").notNull().default(0),
  
  // الحسابات المحسوبة
  serviceDays: integer("serviceDays").notNull().default(0),
  accruedDays: integer("accruedDays").notNull().default(0),
  balanceBeforeDeduction: integer("balanceBeforeDeduction").notNull().default(0),
  currentLeaveDays: integer("currentLeaveDays").notNull().default(0),
  balanceAfterDeduction: integer("balanceAfterDeduction").notNull().default(0),
  ticketsCount: integer("ticketsCount").notNull().default(0),
  netPayable: integer("netPayable").notNull().default(0),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type LeaveSettlement = typeof leaveSettlements.$inferSelect;
export type InsertLeaveSettlement = typeof leaveSettlements.$inferInsert;



/**
 * جدول التذكيرات
 */
export const reminderTypeEnum = pgEnum('reminder_type', [
  'residence_expiry',   // انتهاء إقامة
  'leave_start',        // بداية إجازة
  'leave_end',          // نهاية إجازة
  'insurance_payment',  // استحقاق تأمينات
  'contract_renewal',   // تجديد عقد
  'document_expiry',    // انتهاء وثيقة
  'other'               // أخرى
]);

export const reminderStatusEnum = pgEnum('reminder_status', [
  'pending',    // قادم
  'due_soon',   // قريب
  'overdue',    // متأخر
  'completed'   // مكتمل
]);

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: reminderTypeEnum("type").notNull(),
  employeeId: integer("employeeId"),
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate").notNull(),
  notes: text("notes"),
  status: reminderStatusEnum("status").notNull().default('pending'),
  isCompleted: boolean("isCompleted").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;



// جدول بنود المصروفات
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 100 }),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#3b82f6"),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("isActive").notNull().default(true),
  displayOrder: integer("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});


export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;

/**
 * جدول سجل التدقيق (Audit Log)
 * يسجل جميع العمليات المالية والتغييرات الحساسة
 */
export const auditActionEnum = pgEnum('audit_action', ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOCK', 'UNLOCK']);
export const auditEntityEnum = pgEnum('audit_entity', ['employee', 'contractor', 'payroll', 'expense', 'revenue', 'budget', 'leave_settlement', 'reminder', 'user', 'expense_category']);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  entityType: auditEntityEnum("entityType").notNull(),
  entityId: integer("entityId").notNull(),
  action: auditActionEnum("action").notNull(),
  userId: varchar("userId", { length: 64 }).references(() => users.id),
  userName: varchar("userName", { length: 255 }),
  oldData: text("oldData"), // JSON string
  newData: text("newData"), // JSON string
  changes: text("changes"), // JSON string - summary of changes
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;



/**
 * جدول الموافقات المعلقة (Maker/Checker System)
 * يتتبع العمليات التي تحتاج موافقة قبل التنفيذ
 */
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const approvalOperationEnum = pgEnum('approval_operation', ['CREATE', 'UPDATE', 'DELETE']);

export const pendingApprovals = pgTable("pending_approvals", {
  id: serial("id").primaryKey(),
  entityType: auditEntityEnum("entityType").notNull(),
  entityId: integer("entityId"), // null for CREATE operations
  operation: approvalOperationEnum("operation").notNull(),
  requestData: text("requestData").notNull(), // JSON string of the requested changes
  currentData: text("currentData"), // JSON string of current data (for UPDATE/DELETE)
  status: approvalStatusEnum("status").notNull().default('pending'),
  makerId: varchar("makerId", { length: 64 }).references(() => users.id),
  makerName: varchar("makerName", { length: 255 }),
  checkerId: varchar("checkerId", { length: 64 }).references(() => users.id),
  checkerName: varchar("checkerName", { length: 255 }),
  makerComment: text("makerComment"),
  checkerComment: text("checkerComment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export type PendingApproval = typeof pendingApprovals.$inferSelect;
export type InsertPendingApproval = typeof pendingApprovals.$inferInsert;


/**
 * جدول قفل الفترات المالية
 * يمنع التعديل على البيانات المالية للفترات المقفلة
 */
export const periodLocks = pgTable("period_locks", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1-12
  isLocked: boolean("isLocked").notNull().default(false),
  lockedBy: varchar("lockedBy", { length: 64 }).references(() => users.id),
  lockedByName: varchar("lockedByName", { length: 255 }),
  lockedAt: timestamp("lockedAt"),
  lockReason: text("lockReason"),
  unlockedBy: varchar("unlockedBy", { length: 64 }).references(() => users.id),
  unlockedByName: varchar("unlockedByName", { length: 255 }),
  unlockedAt: timestamp("unlockedAt"),
  unlockReason: text("unlockReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PeriodLock = typeof periodLocks.$inferSelect;
export type InsertPeriodLock = typeof periodLocks.$inferInsert;

