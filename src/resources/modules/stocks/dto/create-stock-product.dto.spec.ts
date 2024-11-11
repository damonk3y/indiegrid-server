import "reflect-metadata";
import { validateOrReject, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import logger from "@/utils/logger";
import {
  CreateStockProductDTO,
  createStockProductValidator
} from "./create-stock-product.dto";

jest.mock("@/utils/logger");

describe("CreateStockProductDTO", () => {
  let dto: CreateStockProductDTO;

  beforeEach(() => {
    dto = new CreateStockProductDTO();
  });

  it("should validate a valid DTO", async () => {
    dto.weight_in_kgs = 10;
    dto.cost_price = 100;
    dto.selling_price = 150;
    dto.internal_reference_id = "REF123";

    await expect(validateOrReject(dto)).resolves.not.toThrow();
  });

  it("should fail validation with missing required fields", async () => {
    const errors = await validateOrReject(dto).catch(errs => errs);
    expect(errors).toBeInstanceOf(Array);
    expect(errors).toHaveLength(2);
    expect((errors![0] as ValidationError).property).toEqual(
      "internal_reference_id"
    );
    expect((errors![1] as ValidationError).property).toEqual(
      "quantity"
    );
  });

  it("should sanitize HTML in internal_reference_id", () => {
    dto.internal_reference_id = '<script>alert("XSS")</script>REF123';
    expect(
      plainToInstance(CreateStockProductDTO, dto)
        .internal_reference_id
    ).toBe("REF123");
  });
});

jest.mock("class-validator");

describe("createStockProductValidator", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it("should call next() for valid request body", async () => {
    mockRequest.body = {
      weight_in_kgs: 10,
      cost_price: 100,
      selling_price: 150,
      internal_reference_id: "REF123",
      quantity: 5
    };

    await createStockProductValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });

  it("should return 400 for missing request body", async () => {
    mockRequest.body = undefined;

    await createStockProductValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Body malformed"
    });
  });

  it("should return 400 for invalid request body", async () => {
    mockRequest.body = {
      weight_in_kgs: "not a number",
      internal_reference_id: "123",
      quantity: "not a number"
    };

    (validateOrReject as jest.Mock).mockRejectedValueOnce(
      new Error("Validation failed")
    );

    await createStockProductValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Body malformed"
    });
  });

  it("should log info messages for successful validation", async () => {
    mockRequest.body = {
      weight_in_kgs: 10,
      cost_price: 100,
      selling_price: 150,
      internal_reference_id: "REF123",
      quantity: 5
    };

    await createStockProductValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(logger.info).toHaveBeenCalledWith(
      "-> validating stock product creation request"
    );
    expect(logger.info).toHaveBeenCalledWith(
      "-> stock product request validated successfully"
    );
  });

  it("should log error messages for failed validation", async () => {
    mockRequest.body = {
      weight_in_kgs: "not a number"
    };

    (validateOrReject as jest.Mock).mockRejectedValueOnce(
      new Error("Validation failed")
    );

    await createStockProductValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(logger.error).toHaveBeenCalledWith(
      "-> stock product validation failed"
    );
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
