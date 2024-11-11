import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JWTTokenPayload } from "./types";
import logger from "@/utils/logger";

export const sessionGuard = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res.status(401).json({ message: "No access token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    ) as JWTTokenPayload;
    req.jwtPayload = decoded;
    next();
  } catch (error) {
    logger.error("Error in sessionGuard");
    logger.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
