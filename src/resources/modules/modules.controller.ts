import { Router, Response, NextFunction } from "express";
import { stocksModuleController } from "./stocks/stocks.module.controller";
import { AuthenticatedRequest } from "@/guards/types";
import { directClientsModuleController } from "./direct-clients/direct-clients.controller";

enum MODULES {
  STOCKS_MODULE = "STOCKS_MODULE",
  DIRECT_CLIENTS_MODULE = "DIRECT_CLIENTS_MODULE"
}

export const modulesController = Router();

modulesController.use(
  "/stocks",
  (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    req.module = MODULES.STOCKS_MODULE;
    next();
  },
  stocksModuleController
);

modulesController.use(
  "/direct-clients",
  (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    req.module = MODULES.STOCKS_MODULE;
    next();
  },
  directClientsModuleController
);
