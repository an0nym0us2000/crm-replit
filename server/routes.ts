import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { insertLeadSchema, insertDealSchema, insertEmployeeSchema, insertTaskSchema } from "@shared/schema";

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
      const task = await storage.createTask(data);
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

      const updatedTask = await storage.updateTask(id, req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
