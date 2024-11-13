import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  ValidateNested,
  IsDefined,
  IsArray,
  validateOrReject,
  IsEnum
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import { plainToInstance, Transform, Type } from "class-transformer";
import logger from "@/utils/logger";
import { AddressType } from "@prisma/client";

class AddressDTO {
  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  address_line_1!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  address_line_2?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  address_line_3?: string;

  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  city!: string;

  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  country!: string;

  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  zip!: string;

  @IsDefined()
  @IsEnum(AddressType)
  type!: AddressType;
}

export class CreateDirectClientDTO {
  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  name!: string;

  @IsOptional()
  @IsUrl()
  facebook_url?: string;

  @IsOptional()
  @IsUrl()
  instagram_url?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  phone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDTO)
  addresses?: AddressDTO[];
}

export const createDirectClientValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating direct client creation request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body missing" });
      return;
    }
    const directClientDTO = plainToInstance(
      CreateDirectClientDTO,
      req.body
    );
    await validateOrReject(directClientDTO);
    next();
  } catch (error) {
    logger.error(
      "-> error validating direct client creation request",
      error
    );
    res
      .status(500)
      .send({
        message: "Error validating direct client creation request"
      });
  }
};
