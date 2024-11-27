import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { ordersService } from "./orders.service";

export const ordersController = Router();

ordersController.get(
  "/stores/:storeId/direct-clients/:clientId/orders",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { clientId, storeId } = req.params;
      if (!storeId || !clientId) {
        res
          .status(400)
          .json({ message: "Store ID and client ID are required" });
        return;
      }
      const clientOrders = await ordersService.getDirectClientOrders(
        storeId,
        clientId
      );
      res.status(200).json(clientOrders);
    } catch (error) {
      logger.error("Error getting livestream collections");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);
