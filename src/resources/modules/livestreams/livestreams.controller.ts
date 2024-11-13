import express, { Router } from "express";
import logger from "@/utils/logger";
import { sessionGuard } from "@/guards/session.guard";
import { storeModuleGuard } from "@/guards/store-module.guard";
import { storeManagerGuard } from "@/guards/store-manager.guard";
import { livestreamsService } from "./livestreams.service";
import { createLivestreamValidator } from "./dto/create-livestream.dto";

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
