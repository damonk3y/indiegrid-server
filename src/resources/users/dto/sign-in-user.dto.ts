import {
  IsDefined,
  IsEmail,
  MinLength,
  validateOrReject
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import logger from "@/utils/logger";

export class SignInUserDTO {
  @IsDefined()
  @IsEmail()
  email!: string;

  @IsDefined()
  @MinLength(6)
  password!: string;
}

export const signInUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating user sign in request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body malformed" });
      return;
    }
    const user = new SignInUserDTO();
    Object.assign(user, plainToInstance(SignInUserDTO, req.body));
    await validateOrReject(user);
    req.body = user;
    logger.info("-> user sign in request validated successfully");
    next();
  } catch (e) {
    logger.error("-> user sign in validation failed");
    logger.error(e);
    res.status(400).send({ message: "Body malformed" });
    return;
  }
};
