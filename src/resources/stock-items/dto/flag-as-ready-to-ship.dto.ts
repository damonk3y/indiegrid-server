import {
    IsString,
    validateOrReject,
    IsDefined,
    IsNumber
  } from "class-validator";
  import { NextFunction, Request, Response } from "express";
  import { plainToInstance } from "class-transformer";
  import logger from "@/utils/logger";
  
  export class FlagAsReadyToShipDTO {
    @IsDefined()
    @IsNumber()
    amount?: number;
  }
  
  export const createFlagAsReadyToShipValidator = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("-> validating flag as ready to ship request");
      if (!req.body || !Object.keys(req.body).length) {
        logger.warn("Request body is missing");
        res.status(400).send({ message: "Body missing" });
        return;
      }
      const flagAsReadyToShipDTO = plainToInstance(
        FlagAsReadyToShipDTO,
        req.body
      );
      await validateOrReject(flagAsReadyToShipDTO);
      next();
    } catch (error) {
      logger.error("-> error validating flag as ready to ship request");
      logger.error(error);
      res.status(500).send({
        message: "Error validating flag as ready to ship request"
      });
    }
  };
  