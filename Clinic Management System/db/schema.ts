import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  dob: text("dob").notNull(),
  school: text("school").notNull(),
  area: text("area").notNull(),
  referredBy: text("referred_by").notNull(),
  phone: text("phone").notNull(),
});

export const doctors = sqliteTable("doctors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  specialty: text("specialty"),
  phone: text("phone"),
  employment: text("employment_type"),
});

export const membershipPlans = sqliteTable("membership_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),   
  price: integer("price").notNull(),
  perSessionCost: integer('perSessionCost').notNull().default(0),
  totalSessions: integer("total_sessions").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  planId: integer("plan_id")
    .notNull()
    .references(() => membershipPlans.id),
  remainingSessions: integer("remaining_sessions").notNull(),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id),
  date: text("date").notNull(),
  memberId: integer("member_id").references(() => members.id),
  billNo: text("bill_no"),
  seenBy: text("seen_by"),
  paymentCash: integer("payment_cash").default(0),
  paymentOnline: integer("payment_online").default(0),
  paymentPackage: integer("payment_package").default(0),
  balance: integer("balance").default(0),
  remark: text("remark"),
  contactNo: text("contact_no"),
});

// Add this to your schema.ts file
export const revenueTransactions = sqliteTable("revenue_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // 'membership', 'appointment', 'other'
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'online', 'card', 'upi'
  paymentDate: text("payment_date").notNull(),
  description: text("description"),
  patientId: integer("patient_id").references(() => patients.id),
  membershipId: integer("membership_id").references(() => members.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: text("created_at").notNull(),
});