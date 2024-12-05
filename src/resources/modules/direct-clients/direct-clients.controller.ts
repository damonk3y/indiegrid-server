import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { directClientsModuleService } from "./direct-clients.service";
import { patchDirectClientValidator } from "./dto/patch-direct-client.dto";
import { Pagy } from "@/utils/pagy";
import { reserveProductValidator } from "./dto/reserve-product.dto";
import { cancelProductReservationValidator } from "./dto/cancel-product-reservation.dto";
import multer from "multer";
import { updateThumbnailValidator } from "../stocks/dto/update-thumbnail.dto";

const upload = multer({
  storage: multer.memoryStorage()
});

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
  "/stores/:storeId",
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
  "/stores/:storeId/:clientId",
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

directClientsModuleController.delete(
  "/stores/:storeId/:clientId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, clientId } = req.params;
      logger.info(
        { storeId, clientId },
        "[DirectClientsController] Deleting direct client"
      );

      const deletedClient =
        await directClientsModuleService.deleteDirectClient(
          storeId,
          clientId
        );

      logger.info(
        { deletedClient },
        "[DirectClientsController] Direct client deleted successfully"
      );

      res.status(200).json(deletedClient);
    } catch (error) {
      logger.error("Error deleting direct client");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while deleting the direct client"
      });
    }
  }
);

directClientsModuleController.post(
  "/stores/:storeId/:clientId/addresses/",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, clientId } = req.params;
      logger.info(
        { storeId, clientId },
        "[DirectClientsController] Creating direct client address"
      );

      const deletedClient =
        await directClientsModuleService.createDirectClientAddress(
          storeId,
          clientId
        );

      logger.info(
        { deletedClient },
        "[DirectClientsController] Direct client address created successfully"
      );

      res.status(200).json(deletedClient);
    } catch (error) {
      logger.error("Error deleting direct client");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while deleting the direct client"
      });
    }
  }
);

directClientsModuleController.delete(
  "/stores/:storeId/:clientId/addresses/:addressId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, clientId, addressId } = req.params;
      logger.info(
        { storeId, clientId, addressId },
        "[DirectClientsController] Deleting direct client address"
      );

      const deletedClient =
        await directClientsModuleService.deleteDirectClientAddress(
          storeId,
          clientId,
          addressId
        );

      logger.info(
        { deletedClient },
        "[DirectClientsController] Direct client deleted successfully"
      );

      res.status(200).json(deletedClient);
    } catch (error) {
      logger.error("Error deleting direct client");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while deleting the direct client"
      });
    }
  }
);

directClientsModuleController.post(
  "/stores/:storeId/:clientId/orders/products/:productId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  express.json(),
  reserveProductValidator,
  async (req, res) => {
    try {
      const { storeId, clientId, productId } = req.params;
      logger.info(
        { storeId, clientId, productId },
        "[DirectClientsController] Reserving product for direct client"
      );

      const reservation =
        await directClientsModuleService.reserveProduct(
          storeId,
          clientId,
          productId,
          req.body.quantity,
          req.body.livestreamCollectionId
        );

      logger.info(
        { reservation },
        "[DirectClientsController] Product reserved successfully"
      );

      res.status(201).json(reservation);
    } catch (error) {
      logger.error("Error reserving product for direct client");
      logger.error(error);
      res.status(500).json({
        message: "Something went wrong while reserving the product"
      });
    }
  }
);

directClientsModuleController.delete(
  "/stores/:storeId/:clientId/orders/products/:productId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  express.json(),
  cancelProductReservationValidator,
  async (req, res) => {
    try {
      const { storeId, clientId, productId } = req.params;
      logger.info(
        { storeId, clientId, productId },
        "[DirectClientsController] Canceling product reservation"
      );

      const canceledReservation =
        await directClientsModuleService.cancelReservation(
          storeId,
          clientId,
          productId,
          req.body.quantity,
          req.body.livestreamCollectionId
        );

      logger.info(
        { canceledReservation },
        "[DirectClientsController] Product reservation canceled successfully"
      );

      res.status(200).json(canceledReservation);
    } catch (error) {
      logger.error("Error canceling product reservation");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while canceling the reservation"
      });
    }
  }
);

directClientsModuleController.patch(
  "/stores/:storeId/:clientId/thumbnail",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  upload.single("file"),
  updateThumbnailValidator,
  async (req, res): Promise<void> => {
    try {
      const { storeId, clientId } = req.params;
      
      if (!req.file) {
        logger.error("No thumbnail uploaded");
        res.status(400).json({
          message: "No thumbnail file provided"
        });
        return;
      }

      logger.info(
        { storeId, clientId },
        "[DirectClientsController] Updating direct client thumbnail"
      );

      const updatedClient = await directClientsModuleService.updateDirectClientThumbnail(
        clientId,
        storeId,
        req.file
      );

      logger.info(
        { updatedClient },
        "[DirectClientsController] Direct client thumbnail updated successfully"
      );

      res.status(200).json(updatedClient);
    } catch (error) {
      logger.error("Error updating direct client thumbnail");
      logger.error(error);
      res.status(500).json({
        message: "Something went wrong while updating the direct client thumbnail"
      });
    }
  }
);
