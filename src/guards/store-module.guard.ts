import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./types";
import { prisma } from "@/clients/prisma";

export const storeModuleGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { storeId } = req.params;
  if (!req.module || !storeId) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  const storeModule = await prisma.storeModules.findFirst({
    where: {
      store_id: storeId,
      module: {
        name: req.module
      }
    }
  });
  if (!storeModule) {
    res
      .status(403)
      .json({ message: `Store does not have ${req.module} module` });
    return;
  }
  next();
};
