import { Request, Response, NextFunction } from "express";
import {
  SignInUserDTO,
  signInUserValidator
} from "./sign-in-user.dto";
import logger from "@/utils/logger";
import { validate } from "class-validator";

jest.mock("@/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe("SignInUserDTO", () => {
  it("should validate a correct sign-in DTO", async () => {
    const dto = new SignInUserDTO();
    dto.email = "test@example.com";
    dto.password = "StrongP@ssw0rd";

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should reject an invalid email", async () => {
    const dto = new SignInUserDTO();
    dto.email = "invalid-email";
    dto.password = "StrongP@ssw0rd";

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("email");
  });

  it("should reject a weak password", async () => {
    const dto = new SignInUserDTO();
    dto.email = "test@example.com";
    dto.password = "weak";

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe("password");
  });
});

describe("signInUserValidator middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  it("should call next() for valid input", async () => {
    mockRequest.body = {
      email: "test@example.com",
      password: "StrongP@ssw0rd"
    };

    await signInUserValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      "-> user sign in request validated successfully"
    );
  });

  it("should return 400 for missing body", async () => {
    mockRequest.body = undefined;

    await signInUserValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Body malformed"
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Request body is missing"
    );
  });

  it("should return 400 for invalid input", async () => {
    mockRequest.body = {
      email: "invalid-email",
      password: "weak"
    };

    await signInUserValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith({
      message: "Body malformed"
    });
    expect(logger.error).toHaveBeenCalledWith(
      "-> user sign in validation failed"
    );
  });
});
