import {
  IsString,
  validateOrReject,
  IsDefined
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import { plainToInstance, Transform } from "class-transformer";
import logger from "@/utils/logger";

export class CreateLivestreamDTO {
  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  name?: string;
}

export const createLivestreamValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating livestream creation request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body missing" });
      return;
    }
    const livestreamDTO = plainToInstance(
      CreateLivestreamDTO,
      req.body
    );
    await validateOrReject(livestreamDTO);
    next();
  } catch (error) {
    logger.error("-> error validating livestream creation request");
    logger.error(error);
    res.status(500).send({
      message: "Error validating livestream creation request"
    });
  }
};
