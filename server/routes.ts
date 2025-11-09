import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { insertLeadSchema, insertDealSchema, insertEmployeeSchema, insertTaskSchema, insertSocialProfileSchema, insertPostingScheduleSchema } from "@shared/schema";

function canModifyPost(
  post: { assignedTo: string | null; createdBy: string | null },
  userId: string,
  userRole: 'admin' | 'manager' | 'employee',
  teamMemberIds: string[] = []
): boolean {
  if (userRole === 'admin') {
    return true;
  }
  
  if (userRole === 'manager') {
    return (
      (post.assignedTo !== null && teamMemberIds.includes(post.assignedTo)) ||
      (post.createdBy !== null && teamMemberIds.includes(post.createdBy)) ||
      post.assignedTo === userId ||
      post.createdBy === userId
    );
  }
  
  if (userRole === 'employee') {
    return post.assignedTo === userId || post.createdBy === userId;
  }
  
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lead endpoints
  app.get("/api/leads", isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", isAuthenticated, async (req, res) => {
    try {
      const data = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(data);
      res.status(201).json(lead);
    } catch (error: any) {
      console.error("Error creating lead:", error);
      res.status(400).json({ message: error.message || "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.updateLead(id, req.body);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      res.status(400).json({ message: error.message || "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, requireRole("admin", "manager"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Deal endpoints
  app.get("/api/deals", isAuthenticated, async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.post("/api/deals", isAuthenticated, async (req, res) => {
    try {
      const data = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(data);
      res.status(201).json(deal);
    } catch (error: any) {
      console.error("Error creating deal:", error);
      res.status(400).json({ message: error.message || "Failed to create deal" });
    }
  });

  app.patch("/api/deals/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deal = await storage.updateDeal(id, req.body);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error: any) {
      console.error("Error updating deal:", error);
      res.status(400).json({ message: error.message || "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", isAuthenticated, requireRole("admin", "manager"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDeal(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting deal:", error);
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Employee endpoints
  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const data = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(data);
      res.status(201).json(employee);
    } catch (error: any) {
      console.error("Error creating employee:", error);
      res.status(400).json({ message: error.message || "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.updateEmployee(id, req.body);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      console.error("Error updating employee:", error);
      res.status(400).json({ message: error.message || "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Task endpoints
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      // Convert dueDate string to Date object if present
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: error.message || "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const task = await storage.getTask(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Employees can only update their own tasks
      if (user?.role === "employee" && task.assignedTo !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Convert dueDate string to Date object if present in update
      const updateData = { ...req.body };
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedTask = await storage.updateTask(id, updateData);
      res.json(updatedTask);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: error.message || "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, requireRole("admin", "manager"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // User endpoints - accessible to all authenticated users for displaying names in UI
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin user management endpoints
  app.get("/api/admin/users", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Attendance endpoints
  app.get("/api/attendance", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const attendance = await storage.getAllAttendance();
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching all attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attendance = await storage.getAttendanceByUser(userId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching my attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance/mark-in", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get IST date string (YYYY-MM-DD) - Add 5.5 hours to UTC for IST
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + istOffset);
      const dateString = istDate.toISOString().split('T')[0];
      
      // Check if user already has an open attendance record
      const openAttendance = await storage.getOpenAttendanceByUser(userId);
      if (openAttendance) {
        return res.status(400).json({ message: "You already have an open attendance record. Please mark out first." });
      }
      
      // Check if user already marked in today
      const todayAttendance = await storage.getAttendanceByUser(userId, dateString, dateString);
      if (todayAttendance.length > 0) {
        return res.status(400).json({ message: "You have already marked in today." });
      }
      
      // Create new attendance record
      const attendance = await storage.createAttendanceMarkIn(userId, dateString, now);
      res.status(201).json(attendance);
    } catch (error: any) {
      console.error("Error marking in:", error);
      res.status(400).json({ message: error.message || "Failed to mark in" });
    }
  });

  app.patch("/api/attendance/:id/mark-out", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Get the specific attendance record
      const attendanceRecord = await storage.getAttendance(id);
      
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Check ownership (admins can mark out for anyone)
      if (user?.role !== "admin" && attendanceRecord.userId !== userId) {
        return res.status(403).json({ message: "You can only mark out your own attendance" });
      }
      
      // Check if already marked out
      if (attendanceRecord.markOutTime) {
        return res.status(400).json({ message: "Already marked out" });
      }
      
      // Mark out
      const now = new Date();
      
      // Validate mark out time is after mark in time
      if (now <= attendanceRecord.markInTime) {
        return res.status(400).json({ message: "Mark out time must be after mark in time" });
      }
      
      const attendance = await storage.completeAttendanceMarkOut(id, now);
      res.json(attendance);
    } catch (error: any) {
      console.error("Error marking out:", error);
      res.status(400).json({ message: error.message || "Failed to mark out" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/dashboard", isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      const deals = await storage.getAllDeals();
      const tasks = await storage.getAllTasks();
      const employees = await storage.getAllEmployees();

      const totalLeads = leads.length;
      const activeDeals = deals.filter(d => d.stage !== "closed").length;
      const totalRevenue = deals.filter(d => d.stage === "closed").reduce((sum, d) => sum + d.value, 0);
      const conversionRate = totalLeads > 0 
        ? Math.round((deals.filter(d => d.stage === "closed").length / totalLeads) * 100)
        : 0;
      const completedTasks = tasks.filter(t => t.completed).length;
      const taskCompletionRate = tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

      res.json({
        totalLeads,
        activeDeals,
        totalRevenue,
        conversionRate,
        taskCompletionRate,
        activeEmployees: employees.length,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Social Profiles endpoints
  app.get("/api/social-profiles", isAuthenticated, async (req, res) => {
    try {
      const profiles = await storage.getAllSocialProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching social profiles:", error);
      res.status(500).json({ message: "Failed to fetch social profiles" });
    }
  });

  app.get("/api/social-profiles/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profiles = await storage.getSocialProfilesByUser(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching user social profiles:", error);
      res.status(500).json({ message: "Failed to fetch user social profiles" });
    }
  });

  app.get("/api/social-profiles/platform/:platform", isAuthenticated, async (req, res) => {
    try {
      const { platform } = req.params;
      const profiles = await storage.getSocialProfilesByPlatform(platform);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching platform social profiles:", error);
      res.status(500).json({ message: "Failed to fetch platform social profiles" });
    }
  });

  app.post("/api/social-profiles", isAuthenticated, async (req, res) => {
    try {
      const data = insertSocialProfileSchema.parse(req.body);
      const profile = await storage.createSocialProfile(data);
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Error creating social profile:", error);
      res.status(400).json({ message: error.message || "Failed to create social profile" });
    }
  });

  app.patch("/api/social-profiles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertSocialProfileSchema.partial().parse(req.body);
      
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
      }
      
      const profile = await storage.updateSocialProfile(id, data);
      if (!profile) {
        return res.status(404).json({ message: "Social profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      console.error("Error updating social profile:", error);
      res.status(400).json({ message: error.message || "Failed to update social profile" });
    }
  });

  app.delete("/api/social-profiles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSocialProfile(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting social profile:", error);
      res.status(500).json({ message: "Failed to delete social profile" });
    }
  });

  // Posting Schedule endpoints
  app.get("/api/posting-schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const teamMemberIds = user.role === 'manager' ? await storage.getTeamMemberIds(userId) : [];

      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.profileId) filters.profileId = req.query.profileId;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const posts = await storage.getPostingScheduleForRole(user.role, userId, teamMemberIds, filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posting schedule:", error);
      res.status(500).json({ message: "Failed to fetch posting schedule" });
    }
  });

  app.get("/api/posting-schedule/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getPostingScheduleStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching posting schedule stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/posting-schedule/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const post = await storage.getPostingScheduleById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const teamMemberIds = user.role === 'manager' ? await storage.getTeamMemberIds(userId) : [];
      
      if (!canModifyPost(post, userId, user.role, teamMemberIds)) {
        return res.status(403).json({ message: "You don't have permission to view this post" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posting-schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPostingScheduleSchema.parse(req.body);
      
      // Validate assignedTo is a valid user ID if provided
      let validAssignedTo = null;
      if (data.assignedTo && data.assignedTo !== "") {
        const assignedUser = await storage.getUser(data.assignedTo);
        if (assignedUser) {
          validAssignedTo = data.assignedTo;
        }
      }

      const postData = {
        ...data,
        createdBy: userId,
        // Convert empty strings to null and validate FK fields
        assignedTo: validAssignedTo,
        cloneOf: data.cloneOf || null,
        publishResult: data.publishResult || null,
        mediaUrl: data.mediaUrl || null,
        scheduledDateTime: new Date(data.scheduledDateTime),
      };
      
      const post = await storage.createPostingSchedule(postData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: error.message || "Failed to create post" });
    }
  });

  app.patch("/api/posting-schedule/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const existingPost = await storage.getPostingScheduleById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      const teamMemberIds = user.role === 'manager' ? await storage.getTeamMemberIds(userId) : [];
      
      if (!canModifyPost(existingPost, userId, user.role, teamMemberIds)) {
        return res.status(403).json({ message: "You don't have permission to update this post" });
      }

      const data = insertPostingScheduleSchema.partial().parse(req.body);
      
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
      }

      // Validate assignedTo is a valid user ID if provided
      let validAssignedTo = undefined;
      if (data.assignedTo !== undefined) {
        if (data.assignedTo === "") {
          validAssignedTo = null;
        } else {
          const assignedUser = await storage.getUser(data.assignedTo);
          validAssignedTo = assignedUser ? data.assignedTo : null;
        }
      }

      // Convert empty strings to null for optional FK fields and dates
      const updateData = {
        ...data,
        scheduledDateTime: data.scheduledDateTime ? new Date(data.scheduledDateTime) : undefined,
        assignedTo: validAssignedTo,
        cloneOf: data.cloneOf === "" ? null : data.cloneOf,
        publishResult: data.publishResult === "" ? null : data.publishResult,
        mediaUrl: data.mediaUrl === "" ? null : data.mediaUrl,
      };

      const post = await storage.updatePostingSchedule(id, updateData);
      res.json(post);
    } catch (error: any) {
      console.error("Error updating post:", error);
      res.status(400).json({ message: error.message || "Failed to update post" });
    }
  });

  app.delete("/api/posting-schedule/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const existingPost = await storage.getPostingScheduleById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      const teamMemberIds = user.role === 'manager' ? await storage.getTeamMemberIds(userId) : [];
      
      if (!canModifyPost(existingPost, userId, user.role, teamMemberIds)) {
        return res.status(403).json({ message: "You don't have permission to delete this post" });
      }

      await storage.deletePostingSchedule(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post("/api/posting-schedule/bulk-update", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const { ids, data: updateData } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      const teamMemberIds = user.role === 'manager' ? await storage.getTeamMemberIds(userId) : [];

      for (const id of ids) {
        const post = await storage.getPostingScheduleById(id);
        if (!post) continue;
        
        if (!canModifyPost(post, userId, user.role, teamMemberIds)) {
          return res.status(403).json({ message: `You don't have permission to update post ${id}` });
        }
      }

      const parsedData = insertPostingScheduleSchema.partial().parse(updateData);
      await storage.bulkUpdatePostingSchedule(ids, parsedData);
      res.json({ message: "Posts updated successfully", count: ids.length });
    } catch (error: any) {
      console.error("Error bulk updating posts:", error);
      res.status(400).json({ message: error.message || "Failed to bulk update posts" });
    }
  });

  app.post("/api/posting-schedule/bulk-delete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      const teamMemberIds = user.role === 'manager' ? await storage.getTeamMemberIds(userId) : [];

      for (const id of ids) {
        const post = await storage.getPostingScheduleById(id);
        if (!post) continue;
        
        if (!canModifyPost(post, userId, user.role, teamMemberIds)) {
          return res.status(403).json({ message: `You don't have permission to delete post ${id}` });
        }
      }

      await storage.bulkDeletePostingSchedule(ids);
      res.json({ message: "Posts deleted successfully", count: ids.length });
    } catch (error) {
      console.error("Error bulk deleting posts:", error);
      res.status(500).json({ message: "Failed to bulk delete posts" });
    }
  });

  app.post("/api/posting-schedule/:id/clone", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const { profileIds } = req.body;

      if (!Array.isArray(profileIds) || profileIds.length === 0) {
        return res.status(400).json({ message: "Invalid or empty profile IDs array" });
      }

      const originalPost = await storage.getPostingScheduleById(id);
      if (!originalPost) {
        return res.status(404).json({ message: "Original post not found" });
      }

      const clonedPosts = [];
      for (const profileId of profileIds) {
        const cloneData = {
          profileId,
          postType: originalPost.postType,
          caption: originalPost.caption,
          mediaUrl: originalPost.mediaUrl,
          scheduledDateTime: originalPost.scheduledDateTime.toISOString(),
          status: originalPost.status,
          assignedTo: originalPost.assignedTo,
          createdBy: userId,
          cloneOf: originalPost.id,
        };
        const cloned = await storage.createPostingSchedule(cloneData);
        clonedPosts.push(cloned);
      }

      res.status(201).json({ message: "Posts cloned successfully", posts: clonedPosts });
    } catch (error: any) {
      console.error("Error cloning post:", error);
      res.status(400).json({ message: error.message || "Failed to clone post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
