import { Router } from "express";

export const healthController = Router();

healthController.get("/", (_, res) => {
  res.status(200).send("Ok");
});
