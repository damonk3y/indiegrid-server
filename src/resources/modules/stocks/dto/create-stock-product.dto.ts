import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  validateOrReject
} from "class-validator";
import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import { plainToInstance, Transform, Type } from "class-transformer";
import logger from "@/utils/logger";

export class StockProductSize {
  @IsString()
  size!: string;

  @IsString()
  color!: string;

  @IsNumber()
  quantity!: number;
}

export class CreateStockProductDto {
  @IsOptional()
  @IsNumber()
  weight_in_kgs?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  cost_price?: number;

  @IsOptional()
  @IsNumber()
  selling_price?: number;

  @IsDefined()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  internal_reference_id!: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsNumber()
  armpit_to_armpit?: number;

  @IsOptional()
  @IsNumber()
  chest_around?: number;

  @IsOptional()
  @IsNumber()
  waist_around?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockProductSize)
  product_lines!: { size: string; color: string; quantity: number }[];
}

export const createStockProductValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating stock product creation request");
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

    const stockProduct = new CreateStockProductDto();
    const productLines = JSON.parse(cleanBody.product_lines || "[]");
    Object.assign(
      stockProduct,
      plainToInstance(CreateStockProductDto, {
        ...cleanBody,
        product_lines: productLines,
        selling_price: cleanBody.selling_price
          ? parseFloat(cleanBody.selling_price)
          : null,
        weight_in_kgs: cleanBody.weight_in_kgs
          ? parseFloat(cleanBody.weight_in_kgs)
          : null,
        cost_price: cleanBody.cost_price
          ? parseFloat(cleanBody.cost_price)
          : null,
        armpit_to_armpit: cleanBody.armpit_to_armpit
          ? parseFloat(cleanBody.armpit_to_armpit)
          : null,
        chest_around: cleanBody.chest_around
          ? parseFloat(cleanBody.chest_around)
          : null,
        waist_around: cleanBody.waist_around
          ? parseFloat(cleanBody.waist_around)
          : null,
        height: cleanBody.height ? parseFloat(cleanBody.height) : null
      } as CreateStockProductDto)
    );
    await validateOrReject(stockProduct);
    req.body = stockProduct;
    logger.info("-> stock product request validated successfully");
    next();
  } catch (e) {
    logger.error("-> stock product validation failed");
    logger.error(e);
    res.status(400).send({ message: "Body malformed" });
    return;
  }
};
