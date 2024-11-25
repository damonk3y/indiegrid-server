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

class StockProductSize {
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
    const stockProduct = new CreateStockProductDto();
    const productLines = JSON.parse(req.body.product_lines);
    Object.assign(
      stockProduct,
      plainToInstance(CreateStockProductDto, {
        ...req.body,
        product_lines: productLines,
        selling_price: parseFloat(req.body.selling_price),
        weight_in_kgs: parseFloat(req.body.weight_in_kgs),
        cost_price: parseFloat(req.body.cost_price)
      })
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
