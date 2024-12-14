import express, { Router } from "express";
import multer from "multer";
import { stocksModuleService } from "./stocks.module.service";
import { isUUID } from "class-validator";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { createStockProductValidator } from "./dto/create-stock-product.dto";
import { Pagy } from "@/utils/pagy";
import { updateStockProductValidator } from "./dto/update-stock-product.dto copy";

const upload = multer({
  storage: multer.memoryStorage()
});
export const stocksModuleController = Router();

stocksModuleController.get(
  "/stores/:storeId/products",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId } = req.params;
      const { search, page, per_page, is_ready_to_ship, returned } = req.query;
      const pagy = new Pagy(page as string, per_page as string);
      const storeStock = await stocksModuleService.getStoreStock(
        storeId,
        pagy,
        search as string,
        !!is_ready_to_ship,
        !!returned
      );
      res.status(201).json(storeStock);
    } catch (error) {
      logger.error("Error getting store stock");
      logger.error(error);
      res.status(500).json({ message: "Something happened" });
    }
  }
);

stocksModuleController.get(
  "/stores/:storeId/products/:productId",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, productId } = req.params;
      const storeStockProduct =
        await stocksModuleService.getStoreStockProduct(
          storeId,
          productId
        );
      res.status(201).json(storeStockProduct);
    } catch (error) {
      logger.error("Error getting store stock");
      logger.error(error);
      res.status(500).json({ message: "Something happened" });
    }
  }
);

stocksModuleController.post(
  "/stores/:storeId/products",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  upload.single("image"),
  express.json(),
  createStockProductValidator,
  async (req, res) => {
    try {
      logger.info("Uploading stock product photo");
      const { storeId } = req.params;
      if (!isUUID(storeId)) {
        res
          .status(400)
          .json({ message: "Invalid store ID or product ID" });
        logger.error("Store ID is not defined");
        return;
      }
      let image_url = null;
      if (!req.file) {
        logger.error("No photo uploaded");
      } else {
        const { image_url } =
          await stocksModuleService.updateProductPhoto(req.file);
        if (!image_url) {
          throw "Error saving image";
        }
      }
      logger.info("Creating stock product");
      const product = await stocksModuleService.createStockProduct(
        storeId,
        req.body,
        image_url
      );
      res.status(200).json({
        message: "Product photo updated successfully",
        product
      });
    } catch (error) {
      logger.error("Error uploading product photo");
      logger.error(error);
      res.status(500).json({
        message: "Something went wrong while uploading the photo"
      });
    }
  }
);

stocksModuleController.put(
  "/stores/:storeId/products/:productId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  upload.single("image"),
  express.json(),
  updateStockProductValidator,
  async (req, res) => {
    try {
      logger.info("Updating stock product");
      const { storeId, productId } = req.params;
      if (!isUUID(storeId) || !isUUID(productId)) {
        res
          .status(400)
          .json({ message: "Invalid store ID or product ID" });
        logger.error("Store ID or Product ID is not valid");
        return;
      }

      let image_url = undefined;
      if (req.file) {
        logger.info("Uploading new stock product photo");
        const uploadResult = await stocksModuleService.updateProductPhoto(req.file);
        image_url = uploadResult.image_url;
        if (!image_url) {
          throw "Error saving image";
        }
      }

      logger.info("Updating stock product data");
      await stocksModuleService.updateStockProduct(
        storeId,
        productId,
        req.body,
        image_url
      );

      res.status(200).json({
        message: "Product updated successfully"
      });
    } catch (error) {
      logger.error("Error updating product");
      logger.error(error);
      res.status(500).json({
        message: "Something went wrong while updating the product"
      });
    }
  }
);
