import {
  IsOptional,
  IsDefined,
  IsNumber,
  Min,
  validateOrReject,
  IsUUID
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import logger from "@/utils/logger";

export class ReserveProductDTO {
  @IsDefined()
  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsUUID()
  livestreamCollectionId?: string;
}

export const reserveProductValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating product reservation request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body missing" });
      return;
    }
    const reserveProductDTO = plainToInstance(
      ReserveProductDTO,
      req.body
    );
    await validateOrReject(reserveProductDTO);
    next();
  } catch (error) {
    logger.error(
      "-> error validating product reservation request",
      error
    );
    res.status(400).send({
      message: "Error validating product reservation request"
    });
  }
};
