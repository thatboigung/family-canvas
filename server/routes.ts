import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // API Routes (Optional usage for this frontend-only prototype)
  app.get(api.family.list.path, async (req, res) => {
    const members = await storage.getFamilyMembers();
    res.json(members);
  });

  app.post(api.family.create.path, async (req, res) => {
    try {
      const input = api.family.create.input.parse(req.body);
      const member = await storage.createFamilyMember(input);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
