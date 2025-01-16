import express, { Router, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import logger from "@/utils/logger";

const router = Router();
const prisma = new PrismaClient();

router.post("/", express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        email
      }
    });
    logger.info(`Added email ${email} to waitlist`);
    res.status(201).json(waitlistEntry);
    return;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: "Email already exists in waitlist" });
      return;
    }
    logger.error("Error adding email to waitlist:");
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

export default router;