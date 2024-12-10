import { OrderStatus } from "@prisma/client";
import { IsDefined, IsEnum } from "class-validator";
import { NextFunction } from "express";
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import logger from "@/utils/logger";

export class UpdateOrderStatusDto {
  @IsDefined()
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export const updateOrderStatusValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating order status update request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body malformed" });
      return;
    }

    const cleanBody: Record<string, string | null> =
      Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => {
          if (value === "") return [key, null];
          return [key, String(value)];
        })
      );

    const orderStatus = new UpdateOrderStatusDto();
    Object.assign(
      orderStatus,
      plainToInstance(UpdateOrderStatusDto, cleanBody)
    );

    await validateOrReject(orderStatus);
    req.body = orderStatus;
    logger.info(
      "-> order status update request validated successfully"
    );
    next();
  } catch (e) {
    logger.error("-> order status update validation failed");
    logger.error(e);
    res.status(400).send({ message: "Body malformed" });
    return;
  }
};
