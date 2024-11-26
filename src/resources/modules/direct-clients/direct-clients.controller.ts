import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { directClientsModuleService } from "./direct-clients.service";
import { patchDirectClientValidator } from "./dto/patch-direct-client.dto";
import { Pagy } from "@/utils/pagy";

export const directClientsModuleController = Router();

directClientsModuleController.get(
  "/stores/:storeId/",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId } = req.params;
      const { page, per_page, search } = req.query;
      const pagy = new Pagy(page as string, per_page as string);
      const storeStock =
        await directClientsModuleService.getStoreDirectClients(
          storeId,
          pagy,
          search as string
        );
      res.status(200).json(storeStock);
    } catch (error) {
      logger.error("Error getting store stock");
      logger.error(error);
      res.status(500).json({ message: "Something happened" });
    }
  }
);

directClientsModuleController.get(
  "/stores/:storeId/:clientId",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, clientId } = req.params;
      const storeStockProduct =
        await directClientsModuleService.getStoreDirectClient(
          storeId,
          clientId
        );
      res.status(200).json(storeStockProduct);
    } catch (error) {
      logger.error("Error getting store stock");
      logger.error(error);
      res.status(500).json({ message: "Something happened" });
    }
  }
);

directClientsModuleController.post(
  "/stores/:storeId/direct-clients",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  express.json(),
  async (req, res) => {
    try {
      const { storeId } = req.params;
      logger.info(
        { storeId, payload: req.body },
        "[DirectClientsController] Creating direct client"
      );
      const directClient =
        await directClientsModuleService.createDirectClient(
          storeId,
          req.body
        );
      logger.info(
        { directClient },
        "[DirectClientsController] Direct client created successfully"
      );
      res.status(201).json(directClient);
    } catch (error) {
      logger.error("Error creating direct client");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while creating the direct client"
      });
    }
  }
);

directClientsModuleController.patch(
  "/stores/:storeId/direct-clients/:clientId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  express.json(),
  patchDirectClientValidator,
  async (req, res) => {
    try {
      const { storeId, clientId } = req.params;
      logger.info(
        { storeId, clientId, payload: req.body },
        "[DirectClientsController] Updating direct client"
      );
      const updatedClient =
        await directClientsModuleService.updateDirectClient(
          storeId,
          clientId,
          req.body
        );

      logger.info(
        { updatedClient },
        "[DirectClientsController] Direct client updated successfully"
      );

      res.status(200).json(updatedClient);
    } catch (error) {
      logger.error("Error updating direct client");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while updating the direct client"
      });
    }
  }
);
