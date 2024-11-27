import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { livestreamsService } from "./livestreams.service";
import { createLivestreamValidator } from "./dto/create-livestream.dto";
import { addProductToLivestreamCollectionValidator } from "./dto/add-product-to-livestream-collection.dto";

export const livestreamsController = Router();

livestreamsController.get(
  "/:storeId/collections",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      if (!req.params.storeId) {
        res.status(400).json({ message: "Store ID is required" });
        return;
      }
      const collections = await livestreamsService.getAllCollections(
        req.params.storeId
      );
      res.status(200).json(collections);
    } catch (error) {
      logger.error("Error getting livestream collections");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

livestreamsController.get(
  "/:storeId/collections/:collectionId",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { collectionId, storeId } = req.params;
      if (!storeId || !collectionId) {
        res.status(400).json({
          message: "store_id and collection_id are required"
        });
        return;
      }
      const collection = await livestreamsService.getCollectionById(
        collectionId,
        storeId
      );
      res.status(200).json(collection);
    } catch (error) {
      logger.error("Error getting livestream collection");
      logger.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

livestreamsController.post(
  "/:storeId/collections",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  express.json(),
  createLivestreamValidator,
  async (req, res) => {
    try {
      if (!req.params.storeId) {
        res.status(400).json({ message: "Store ID is required" });
        return;
      }
      logger.info(
        { payload: req.body },
        "[LivestreamsController] Creating livestream collection"
      );
      const collection = await livestreamsService.createCollection(
        req.body,
        req.params.storeId
      );
      logger.info(
        { collection },
        "[LivestreamsController] Livestream collection created successfully"
      );
      res.status(201).json(collection);
    } catch (error) {
      logger.error("Error creating livestream collection");
      logger.error(error);
      res.status(500).json({
        message: "Something went wrong while creating the collection"
      });
    }
  }
);

livestreamsController.post(
  "/:storeId/collections/:collectionId/products",
  express.json(),
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  addProductToLivestreamCollectionValidator,
  async (req, res) => {
    try {
      const { storeId, collectionId } = req.params;
      const { stockProductId } = req.body;

      if (!storeId || !collectionId || !stockProductId) {
        res.status(400).json({
          message:
            "store_id, collection_id and stock_product_id are required"
        });
        return;
      }

      logger.info(
        { collectionId, stockProductId },
        "[LivestreamsController] Adding product to livestream collection"
      );

      const updatedCollection =
        await livestreamsService.addProductToCollection(
          collectionId,
          stockProductId,
          storeId
        );

      logger.info(
        { updatedCollection },
        "[LivestreamsController] Product added to collection successfully"
      );

      res.status(200).json(updatedCollection);
    } catch (error) {
      logger.error("Error adding product to livestream collection");
      logger.error(error);
      res.status(500).json({
        message:
          "Something went wrong while adding the product to the collection"
      });
    }
  }
);

livestreamsController.delete(
  "/:storeId/collections/:collectionId/products/:stockProductId",
  sessionGuard,
  storeManagerGuard,
  storeModuleGuard,
  async (req, res) => {
    try {
      const { storeId, collectionId, stockProductId } = req.params;

      if (!storeId || !collectionId || !stockProductId) {
        res.status(400).json({
          message: "store_id, collection_id and stock_product_id are required"
        });
        return;
      }

      logger.info(
        { collectionId, stockProductId },
        "[LivestreamsController] Removing product from livestream collection"
      );

      const updatedCollection = await livestreamsService.removeProductFromCollection(
        collectionId,
        stockProductId,
        storeId
      );

      logger.info(
        { updatedCollection },
        "[LivestreamsController] Product removed from collection successfully"
      );

      res.status(200).json(updatedCollection);
    } catch (error) {
      logger.error("Error removing product from livestream collection");
      logger.error(error);
      res.status(500).json({
        message: "Something went wrong while removing the product from the collection"
      });
    }
  }
);
