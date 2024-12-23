import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { stockItemsService } from "./stock-items.module.service";
import { createFlagAsReadyToShipValidator } from "./dto/flag-as-ready-to-ship.dto";
import { ordersService } from "@/resources/modules/orders/orders.module.service";

export const stockItemsModuleController = Router();

stockItemsModuleController.patch(
  "/stores/:storeId/stock-items/:stockItemId/orders/:orderId/return",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, stockItemId, orderId } = req.params;
      const { isUnsellable } = req.query;
      if (!storeId) {
        res.status(400).json({
          message: "Store ID and stock item ID are required"
        });
        return;
      }
      const stockItem = await stockItemsService.returnStockItem(
        stockItemId,
        orderId,
        !!isUnsellable
      );
      res.status(200).json(stockItem);
    } catch (error) {
      logger.error("Error returning stock product");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

stockItemsModuleController.patch(
  "/stores/:storeId/stock-product/:stockProductId/ready-to-ship",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  createFlagAsReadyToShipValidator,
  async (req, res) => {
    try {
      const { storeId, stockProductId } = req.params;
      if (!storeId) {
        res.status(400).json({
          message: "Store ID and stock product ID are required"
        });
        return;
      }
      const stockItem = await stockItemsService.flagAsReadyToShip(
        stockProductId,
        req.body.amount
      );
      res.status(200).json(stockItem);
    } catch (error) {
      logger.error("Error returning stock product");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

stockItemsModuleController.delete(
  "/stores/:storeId/stock-items/:stockItemId/orders/:orderId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { stockItemId, orderId } = req.params;
      const updatedOrder = await stockItemsService.removeStockItemFromOrder(stockItemId, orderId);
      res.status(200).json(updatedOrder);
    } catch (error) {
      logger.error("Error removing stock item from order");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);
