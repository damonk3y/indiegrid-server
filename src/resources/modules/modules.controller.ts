import { Router, Response, NextFunction } from "express";
import { stocksModuleController } from "./stocks/stocks.module.controller";
import { AuthenticatedRequest } from "@/guards/types";
import { directClientsModuleController } from "./direct-clients/direct-clients.module.controller";
import { livestreamsController } from "./livestreams/livestreams.module.controller";
import { ordersController } from "./orders.ts/orders.module.controller";
import { stockItemsModuleController } from "../stock-items/stock-items.module.controller";

enum MODULES {
  STOCKS_MODULE = "STOCKS_MODULE",
  DIRECT_CLIENTS_MODULE = "DIRECT_CLIENTS_MODULE",
  LIVESTREAMS_MODULE = "LIVESTREAMS_MODULE",
  ORDERS_MODULE = "ORDERS_MODULE"
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
  "/stock-items",
  (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    req.module = MODULES.STOCKS_MODULE;
    next();
  },
  stockItemsModuleController
);

modulesController.use(
  "/direct-clients",
  (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    req.module = MODULES.DIRECT_CLIENTS_MODULE;
    next();
  },
  directClientsModuleController
);

modulesController.use(
  "/livestreams",
  (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    req.module = MODULES.LIVESTREAMS_MODULE;
    next();
  },
  livestreamsController
);

modulesController.use(
  "/orders",
  (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    req.module = MODULES.ORDERS_MODULE;
    next();
  },
  ordersController
);
