import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role", { enum: ["admin", "manager", "employee"] }).notNull().default("employee"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  managerId: varchar("manager_id").references((): any => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  stage: text("stage", { enum: ["lead", "negotiation", "closed"] }).notNull().default("lead"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  lastContact: timestamp("last_contact"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  value: integer("value").notNull(),
  stage: text("stage", { enum: ["lead", "negotiation", "closed"] }).notNull().default("lead"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique(),
  department: text("department").notNull(),
  phone: text("phone"),
  performanceScore: integer("performance_score").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull().default("medium"),
  status: text("status", { enum: ["todo", "in-progress", "done"] }).notNull().default("todo"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks, {
  dueDate: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: varchar("date").notNull(),
  markInTime: timestamp("mark_in_time", { withTimezone: true }).notNull(),
  markOutTime: timestamp("mark_out_time", { withTimezone: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_attendance_user_date").on(table.userId, table.date),
]);

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export const socialProfiles = pgTable("social_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platform: text("platform", { enum: ["linkedin", "twitter", "instagram", "youtube", "reddit"] }).notNull(),
  username: text("username").notNull(),
  profileUrl: text("profile_url").notNull(),
  accountType: text("account_type", { enum: ["personal", "business"] }).notNull().default("personal"),
  followersCount: integer("followers_count").default(0),
  bio: text("bio"),
  contentNiche: text("content_niche"),
  channelName: text("channel_name"),
  subscribersCount: integer("subscribers_count").default(0),
  channelUrl: text("channel_url"),
  subredditModeration: text("subreddit_moderation"),
  connectedDate: timestamp("connected_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_social_profiles_user").on(table.userId),
  index("idx_social_profiles_platform").on(table.platform),
]);

export const insertSocialProfileSchema = createInsertSchema(socialProfiles, {
  username: z.string().min(1, "Username is required"),
  profileUrl: z.string().url("Must be a valid URL"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSocialProfile = z.infer<typeof insertSocialProfileSchema>;
export type SocialProfile = typeof socialProfiles.$inferSelect;

export const postingSchedule = pgTable("posting_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => socialProfiles.id, { onDelete: "cascade" }).notNull(),
  postType: text("post_type", { enum: ["text", "image", "video", "link"] }).notNull(),
  caption: text("caption").notNull(),
  mediaUrl: text("media_url"),
  scheduledDateTime: timestamp("scheduled_date_time", { withTimezone: true }).notNull(),
  status: text("status", { enum: ["draft", "scheduled", "published", "failed"] }).notNull().default("draft"),
  approvalStatus: text("approval_status", { enum: ["pending", "approved", "rejected"] }),
  publishResult: text("publish_result"),
  assignedTo: varchar("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }).notNull(),
  cloneOf: varchar("clone_of").references((): any => postingSchedule.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_posting_schedule_profile").on(table.profileId),
  index("idx_posting_schedule_status").on(table.status),
  index("idx_posting_schedule_scheduled_date").on(table.scheduledDateTime),
  index("idx_posting_schedule_assigned_to").on(table.assignedTo),
  index("idx_posting_schedule_scheduled").on(table.status).where(sql`${table.status} = 'scheduled'`),
]);

export const insertPostingScheduleSchema = createInsertSchema(postingSchedule, {
  caption: z.string().min(1, "Caption is required"),
  scheduledDateTime: z.string(),
  mediaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPostingSchedule = z.infer<typeof insertPostingScheduleSchema>;
export type PostingSchedule = typeof postingSchedule.$inferSelect;
