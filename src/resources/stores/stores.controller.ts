import express, { Router } from "express";

export const storesController = Router();

storesController.get("/", express.json(), (_, res) => {
  res.status(200).json({
    data: []
  });
});
