import {
  IsDefined,
  IsEmail,
  MinLength,
  validateOrReject
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import logger from "@/utils/logger";

export class CreateUserDTO {
  @IsDefined()
  @IsEmail()
  email!: string;

  @IsDefined()
  @MinLength(6)
  password!: string;
}

export const createUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating user creation request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body malformed" });
      return;
    }
    const user = new CreateUserDTO();
    Object.assign(user, plainToInstance(CreateUserDTO, req.body));
    await validateOrReject(user);
    req.body = user;
    logger.info("-> user creation request validated successfully");
    next();
  } catch (e) {
    logger.error("-> user creation validation failed");
    logger.error(e);
    res.status(400).send({ message: "Body malformed" });
    return;
  }
};
