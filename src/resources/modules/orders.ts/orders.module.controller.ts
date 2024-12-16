import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { ordersService } from "./orders.module.service";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusValidator } from "./dto/update-order-status.dto";
import multer from "multer";

export const ordersController = Router();

ordersController.get(
  "/stores/:storeId",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId } = req.params;
      const { status } = req.query;
      if (!storeId) {
        res.status(400).json({ message: "Store ID is required" });
        return;
      }
      const clientOrders = await ordersService.getStoreOrders(
        storeId,
        status as OrderStatus
      );
      res.status(200).json(clientOrders);
    } catch (error) {
      logger.error("Error getting store orders");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

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
      logger.error("Error getting client orders");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

ordersController.get(
  "/stores/:storeId/products/:productId/orders",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { productId, storeId } = req.params;
      const { livestream_collection_id } = req.query;

      if (!storeId || !productId) {
        res
          .status(400)
          .json({ message: "Store ID and product ID are required" });
        return;
      }
      const productOrders = await ordersService.getProductOrders(
        storeId,
        productId,
        livestream_collection_id as string | undefined
      );
      res.status(200).json(productOrders);
    } catch (error) {
      logger.error("Error getting product orders");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

ordersController.patch(
  "/stores/:storeId/orders/:orderId",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  updateOrderStatusValidator,
  async (req, res) => {
    try {
      const { storeId, orderId } = req.params;

      if (!storeId) {
        res
          .status(400)
          .json({ message: "Store ID and order ID are required" });
        return;
      }
      const productOrders = await ordersService.updateOrderStatus(
        orderId,
        req.body.status
      );
      res.status(200).json(productOrders);
    } catch (error) {
      logger.error("Error getting product orders");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);
