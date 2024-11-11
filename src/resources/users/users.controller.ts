import express from "express";
import { Router } from "express";
import { createUserValidator } from "./dto/create-user.dto";
import logger from "@/utils/logger";
import { usersService } from "./users.service";
import { signInUserValidator } from "./dto/sign-in-user.dto";
import { sessionGuard } from "@/guards/session.guard";
import { AuthenticatedRequest } from "@/guards/types";
import { storeManagerGuard } from "@/guards/store-manager.guard";

export const usersController = Router();

usersController.get(
  "/context",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  async (req: AuthenticatedRequest, res) => {
    logger.info("Getting user context");
    const userContext = await usersService.getUserContext(
      req.jwtPayload!.id
    );
    logger.info("User context retrieved");
    res.status(200).json(userContext);
  }
);

usersController.post(
  "/",
  express.json(),
  createUserValidator,
  async (req, res) => {
    try {
      await usersService.createUser(req.body, req.clientIp);
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      logger.error("Error creating user");
      logger.error(error);
      res.status(500).json({ message: "Something happened" });
    }
  }
);

usersController.patch(
  "/sign-in",
  express.json(),
  signInUserValidator,
  async (req, res) => {
    try {
      const { accessToken, refreshToken } =
        await usersService.signInUser(req.body);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 24 * 31 * 1000
      });
      res.status(200).json({ message: "Ok" });
    } catch (error) {
      logger.error("Error signing in user");
      logger.error(error);
      res.status(500).json({ message: "Something happened" });
    }
  }
);
