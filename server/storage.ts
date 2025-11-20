import {
  type User, type UpsertUser,
  type Lead, type InsertLead,
  type Deal, type InsertDeal,
  type Employee, type InsertEmployee,
  type Task, type InsertTask,
  type Attendance, type InsertAttendance,
  type SocialProfile, type InsertSocialProfile,
  type PostingSchedule, type InsertPostingSchedule,
  type Activity, type InsertActivity,
  users, leads, deals, employees, tasks, attendance, socialProfiles, postingSchedule, activities
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, gte, lte, isNull, sql } from "drizzle-orm";

// Extended attendance type with user information
export type AttendanceWithUser = Attendance & {
  userName: string;
  userEmail: string;
};

// Extended activity type with user information
export type ActivityWithUser = Activity & {
  userName: string;
  userEmail: string;
  targetUserName?: string;
  targetUserEmail?: string;
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  getAllLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<void>;

  getAllDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<void>;

  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<void>;

  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByAssignee(assignedTo: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getAllAttendance(): Promise<AttendanceWithUser[]>;
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByUser(userId: string, startDate?: string, endDate?: string): Promise<AttendanceWithUser[]>;
  getOpenAttendanceByUser(userId: string): Promise<Attendance | undefined>;
  createAttendanceMarkIn(userId: string, date: string, markInTime: Date): Promise<Attendance>;
  completeAttendanceMarkOut(id: string, markOutTime: Date): Promise<Attendance | undefined>;

  getAllSocialProfiles(): Promise<SocialProfile[]>;
  getSocialProfile(id: string): Promise<SocialProfile | undefined>;
  getSocialProfilesByUser(userId: string): Promise<SocialProfile[]>;
  getSocialProfilesByPlatform(platform: string): Promise<SocialProfile[]>;
  createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile>;
  updateSocialProfile(id: string, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined>;
  deleteSocialProfile(id: string): Promise<void>;

  getPostingSchedule(filters?: {
    profileId?: string;
    status?: string;
    assignedTo?: string;
    createdBy?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PostingSchedule[]>;
  getPostingScheduleById(id: string): Promise<PostingSchedule | undefined>;
  createPostingSchedule(data: InsertPostingSchedule): Promise<PostingSchedule>;
  updatePostingSchedule(id: string, data: Partial<InsertPostingSchedule>): Promise<PostingSchedule | undefined>;
  deletePostingSchedule(id: string): Promise<void>;
  bulkUpdatePostingSchedule(ids: string[], data: Partial<InsertPostingSchedule>): Promise<void>;
  bulkDeletePostingSchedule(ids: string[]): Promise<void>;
  getPostingScheduleStats(): Promise<{
    byPlatform: Array<{platform: string; count: number}>;
    upcoming: number;
    pending: number;
  }>;
  getTeamMemberIds(managerId: string): Promise<string[]>;

  getRecentActivities(limit?: number): Promise<ActivityWithUser[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updateData: Partial<UpsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(insertLead).returning();
    return result[0];
  }

  async updateLead(id: string, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db
      .update(leads)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getAllDeals(): Promise<Deal[]> {
    return db.select().from(deals).orderBy(desc(deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const result = await db.select().from(deals).where(eq(deals.id, id));
    return result[0];
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const result = await db.insert(deals).values(insertDeal).returning();
    return result[0];
  }

  async updateDeal(id: string, updateData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const result = await db
      .update(deals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
    return result[0];
  }

  async deleteDeal(id: string): Promise<void> {
    await db.delete(deals).where(eq(deals.id, id));
  }

  async getAllEmployees(): Promise<Employee[]> {
    return db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id));
    return result[0];
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.userId, userId));
    return result[0];
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(insertEmployee).returning();
    return result[0];
  }

  async updateEmployee(id: string, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const result = await db
      .update(employees)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async getTasksByAssignee(assignedTo: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assignedTo, assignedTo)).orderBy(desc(tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }

  async updateTask(id: string, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getAllAttendance(): Promise<AttendanceWithUser[]> {
    const results = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        date: attendance.date,
        markInTime: attendance.markInTime,
        markOutTime: attendance.markOutTime,
        userName: sql<string>`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
        userEmail: users.email,
      })
      .from(attendance)
      .leftJoin(users, eq(attendance.userId, users.id))
      .orderBy(desc(attendance.date), desc(attendance.markInTime));

    return results.map(row => ({
      ...row,
      userName: row.userName?.trim() || row.userEmail || "Unknown User",
    }));
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    const result = await db.select().from(attendance).where(eq(attendance.id, id));
    return result[0];
  }

  async getAttendanceByUser(userId: string, startDate?: string, endDate?: string): Promise<AttendanceWithUser[]> {
    const conditions = [eq(attendance.userId, userId)];

    if (startDate && endDate) {
      conditions.push(gte(attendance.date, startDate));
      conditions.push(lte(attendance.date, endDate));
    } else if (startDate) {
      conditions.push(gte(attendance.date, startDate));
    } else if (endDate) {
      conditions.push(lte(attendance.date, endDate));
    }

    const results = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        date: attendance.date,
        markInTime: attendance.markInTime,
        markOutTime: attendance.markOutTime,
        userName: sql<string>`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
        userEmail: users.email,
      })
      .from(attendance)
      .leftJoin(users, eq(attendance.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(attendance.date), desc(attendance.markInTime));

    return results.map(row => ({
      ...row,
      userName: row.userName?.trim() || row.userEmail || "Unknown User",
    }));
  }

  async getOpenAttendanceByUser(userId: string): Promise<Attendance | undefined> {
    const result = await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.userId, userId),
        isNull(attendance.markOutTime)
      ))
      .orderBy(desc(attendance.markInTime))
      .limit(1);
    return result[0];
  }

  async createAttendanceMarkIn(userId: string, date: string, markInTime: Date): Promise<Attendance> {
    const result = await db
      .insert(attendance)
      .values({
        userId,
        date,
        markInTime,
        markOutTime: null,
      })
      .returning();
    return result[0];
  }

  async completeAttendanceMarkOut(id: string, markOutTime: Date): Promise<Attendance | undefined> {
    const result = await db
      .update(attendance)
      .set({ markOutTime, updatedAt: new Date() })
      .where(eq(attendance.id, id))
      .returning();
    return result[0];
  }

  async getAllSocialProfiles(): Promise<SocialProfile[]> {
    return db.select().from(socialProfiles).orderBy(desc(socialProfiles.connectedDate));
  }

  async getSocialProfile(id: string): Promise<SocialProfile | undefined> {
    const result = await db.select().from(socialProfiles).where(eq(socialProfiles.id, id));
    return result[0];
  }

  async getSocialProfilesByUser(userId: string): Promise<SocialProfile[]> {
    return db
      .select()
      .from(socialProfiles)
      .where(eq(socialProfiles.userId, userId))
      .orderBy(desc(socialProfiles.connectedDate));
  }

  async getSocialProfilesByPlatform(platform: string): Promise<SocialProfile[]> {
    return db
      .select()
      .from(socialProfiles)
      .where(eq(socialProfiles.platform, platform))
      .orderBy(desc(socialProfiles.connectedDate));
  }

  async createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile> {
    const result = await db.insert(socialProfiles).values(profile).returning();
    return result[0];
  }

  async updateSocialProfile(id: string, updateData: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined> {
    const result = await db
      .update(socialProfiles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(socialProfiles.id, id))
      .returning();
    return result[0];
  }

  async deleteSocialProfile(id: string): Promise<void> {
    await db.delete(socialProfiles).where(eq(socialProfiles.id, id));
  }

  async getPostingSchedule(filters?: {
    profileId?: string;
    status?: string;
    assignedTo?: string;
    createdBy?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PostingSchedule[]> {
    const conditions = [];
    
    if (filters) {
      if (filters.profileId) conditions.push(eq(postingSchedule.profileId, filters.profileId));
      if (filters.status) conditions.push(eq(postingSchedule.status, filters.status));
      if (filters.assignedTo) conditions.push(eq(postingSchedule.assignedTo, filters.assignedTo));
      if (filters.createdBy) conditions.push(eq(postingSchedule.createdBy, filters.createdBy));
      if (filters.startDate) conditions.push(gte(postingSchedule.scheduledDateTime, filters.startDate));
      if (filters.endDate) conditions.push(lte(postingSchedule.scheduledDateTime, filters.endDate));
    }

    return db
      .select()
      .from(postingSchedule)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(postingSchedule.scheduledDateTime));
  }

  async getPostingScheduleById(id: string): Promise<PostingSchedule | undefined> {
    const result = await db.select().from(postingSchedule).where(eq(postingSchedule.id, id));
    return result[0];
  }

  async getPostingScheduleForRole(
    role: 'admin' | 'manager' | 'employee',
    userId: string,
    teamMemberIds: string[] = [],
    filters?: {
      status?: string;
      profileId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<PostingSchedule[]> {
    const conditions = [];
    
    if (role === 'employee') {
      conditions.push(
        or(
          eq(postingSchedule.assignedTo, userId),
          eq(postingSchedule.createdBy, userId)
        )
      );
    } else if (role === 'manager') {
      const teamConditions = [];
      for (const memberId of teamMemberIds) {
        teamConditions.push(eq(postingSchedule.assignedTo, memberId));
        teamConditions.push(eq(postingSchedule.createdBy, memberId));
      }
      teamConditions.push(eq(postingSchedule.assignedTo, userId));
      teamConditions.push(eq(postingSchedule.createdBy, userId));
      conditions.push(or(...teamConditions));
    }

    if (filters) {
      if (filters.status) conditions.push(eq(postingSchedule.status, filters.status));
      if (filters.profileId) conditions.push(eq(postingSchedule.profileId, filters.profileId));
      if (filters.startDate) conditions.push(gte(postingSchedule.scheduledDateTime, filters.startDate));
      if (filters.endDate) conditions.push(lte(postingSchedule.scheduledDateTime, filters.endDate));
    }

    return db
      .select()
      .from(postingSchedule)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(postingSchedule.scheduledDateTime));
  }

  async createPostingSchedule(data: InsertPostingSchedule): Promise<PostingSchedule> {
    const dataToInsert = {
      ...data,
      scheduledDateTime: typeof data.scheduledDateTime === 'string' 
        ? new Date(data.scheduledDateTime) 
        : data.scheduledDateTime,
    };
    const result = await db.insert(postingSchedule).values(dataToInsert).returning();
    return result[0];
  }

  async updatePostingSchedule(id: string, data: Partial<InsertPostingSchedule>): Promise<PostingSchedule | undefined> {
    const dataToUpdate: any = {
      ...data,
      updatedAt: new Date(),
    };
    
    if (data.scheduledDateTime) {
      dataToUpdate.scheduledDateTime = typeof data.scheduledDateTime === 'string'
        ? new Date(data.scheduledDateTime)
        : data.scheduledDateTime;
    }

    const result = await db
      .update(postingSchedule)
      .set(dataToUpdate)
      .where(eq(postingSchedule.id, id))
      .returning();
    return result[0];
  }

  async deletePostingSchedule(id: string): Promise<void> {
    await db.delete(postingSchedule).where(eq(postingSchedule.id, id));
  }

  async bulkUpdatePostingSchedule(ids: string[], data: Partial<InsertPostingSchedule>): Promise<void> {
    const dataToUpdate: any = {
      ...data,
      updatedAt: new Date(),
    };
    
    if (data.scheduledDateTime) {
      dataToUpdate.scheduledDateTime = typeof data.scheduledDateTime === 'string'
        ? new Date(data.scheduledDateTime)
        : data.scheduledDateTime;
    }

    await db.transaction(async (tx) => {
      for (const id of ids) {
        await tx
          .update(postingSchedule)
          .set(dataToUpdate)
          .where(eq(postingSchedule.id, id));
      }
    });
  }

  async bulkDeletePostingSchedule(ids: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const id of ids) {
        await tx.delete(postingSchedule).where(eq(postingSchedule.id, id));
      }
    });
  }

  async getPostingScheduleStats(): Promise<{
    byPlatform: Array<{platform: string; count: number}>;
    upcoming: number;
    pending: number;
  }> {
    const allPosts = await db.select().from(postingSchedule);
    
    const platformCounts = await db
      .select({
        profileId: postingSchedule.profileId,
        count: db.$count(postingSchedule.id)
      })
      .from(postingSchedule)
      .groupBy(postingSchedule.profileId);

    const profiles = await db.select().from(socialProfiles);
    const platformMap = new Map(profiles.map(p => [p.id, p.platform]));
    
    const byPlatform: {[key: string]: number} = {};
    for (const {profileId, count} of platformCounts) {
      const platform = platformMap.get(profileId);
      if (platform) {
        byPlatform[platform] = (byPlatform[platform] || 0) + count;
      }
    }

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcoming = allPosts.filter(post => 
      post.status === 'scheduled' && 
      new Date(post.scheduledDateTime) <= nextWeek &&
      new Date(post.scheduledDateTime) >= new Date()
    ).length;

    const pending = allPosts.filter(post => 
      post.approvalStatus === 'pending'
    ).length;

    return {
      byPlatform: Object.entries(byPlatform).map(([platform, count]) => ({platform, count})),
      upcoming,
      pending
    };
  }

  async getTeamMemberIds(managerId: string): Promise<string[]> {
    const teamMembers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.managerId, managerId));
    return teamMembers.map(u => u.id);
  }

  async getRecentActivities(limit: number = 20): Promise<ActivityWithUser[]> {
    const actorUser = users;
    const targetUser = sql`target_user`;

    const results = await db
      .select({
        id: activities.id,
        userId: activities.userId,
        activityType: activities.activityType,
        entityType: activities.entityType,
        entityId: activities.entityId,
        targetUserId: activities.targetUserId,
        description: activities.description,
        metadata: activities.metadata,
        createdAt: activities.createdAt,
        userName: sql<string>`COALESCE(${actorUser.firstName}, '') || ' ' || COALESCE(${actorUser.lastName}, '')`,
        userEmail: actorUser.email,
        targetUserName: sql<string>`COALESCE(target_user.first_name, '') || ' ' || COALESCE(target_user.last_name, '')`,
        targetUserEmail: sql<string>`target_user.email`,
      })
      .from(activities)
      .leftJoin(actorUser, eq(activities.userId, actorUser.id))
      .leftJoin(sql`users AS target_user`, sql`${activities.targetUserId} = target_user.id`)
      .orderBy(desc(activities.createdAt))
      .limit(limit);

    return results.map(row => ({
      ...row,
      userName: row.userName?.trim() || row.userEmail || "Unknown User",
      targetUserName: row.targetUserName?.trim() || row.targetUserEmail || undefined,
      targetUserEmail: row.targetUserEmail || undefined,
    }));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
