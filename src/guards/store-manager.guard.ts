import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./types";
import { prisma } from "@/clients/prisma";
import logger from "@/utils/logger";

export const storeManagerGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { storeId } = req.params;
    const { id } = req.jwtPayload!;
    const storeManager = await prisma.store.findFirst({
      where: {
        id: storeId,
        OR: [
          {
            founder_id: id
          },
          {
            managers: {
              some: {
                user_id: id
              }
            }
          }
        ]
      }
    });
    if (!storeManager) {
      res
        .status(403)
        .json({ message: "User is not a store manager or founder" });
      return;
    }
    next();
  } catch (error) {
    logger.error("Error getting store manager");
    logger.error(error);
    res.status(500).json({ message: "Something happened" });
  }
};
