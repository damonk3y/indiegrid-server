import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  ValidateNested,
  IsDefined,
  IsArray,
  validateOrReject,
  IsEnum,
  IsUUID
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import { plainToInstance, Transform, Type } from "class-transformer";
import logger from "@/utils/logger";
import { AddressType } from "@prisma/client";

class AddressDTO {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsDefined()
  @IsEnum(AddressType)
  type!: AddressType;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  city!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  country!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  zip!: string;
}

export class PatchDirectClientDTO {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  name!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Transform(({ value }) => (value === "" ? undefined : value))
  facebook_url?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Transform(({ value }) => (value === "" ? undefined : value))
  instagram_url?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Transform(({ value }) => (value === "" ? undefined : value))
  chat_url?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value === "" ? undefined : value))
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

export const patchDirectClientValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating direct client patch request");
    if (!req.body || !Object.keys(req.body).length) {
      logger.warn("Request body is missing");
      res.status(400).send({ message: "Body missing" });
      return;
    }
    const directClientDTO = plainToInstance(
      PatchDirectClientDTO,
      req.body
    );
    await validateOrReject(directClientDTO);
    next();
  } catch (error) {
    logger.error("-> error validating direct client patch request");
    logger.error(error);
    res.status(500).send({
      message: "Error validating direct client patch request"
    });
  }
};
