import { IsDefined, IsUUID, validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import logger from "@/utils/logger";

export class AddProductToLivestreamCollectionDTO {
  @IsDefined()
  @IsUUID()
  stockProductId!: string;
}

export const addProductToLivestreamCollectionValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      "-> validating add product to livestream collection request"
    );
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body malformed" });
      return;
    }
    const productToAdd = new AddProductToLivestreamCollectionDTO();
    Object.assign(
      productToAdd,
      plainToInstance(AddProductToLivestreamCollectionDTO, req.body)
    );
    await validateOrReject(productToAdd);
    req.body = productToAdd;
    logger.info(
      "-> add product to livestream collection request validated successfully"
    );
    next();
  } catch (e) {
    logger.error(
      "-> add product to livestream collection validation failed"
    );
    logger.error(e);
    res.status(400).send({ message: "Body malformed" });
    return;
  }
};
