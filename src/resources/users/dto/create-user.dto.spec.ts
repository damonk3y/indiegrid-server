import { validate } from "class-validator";
import { CreateUserDTO } from "./create-user.dto";
import { Request, Response, NextFunction } from "express";
import { createUserValidator } from "./create-user.dto";
import logger from "@/utils/logger";

jest.mock("@/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe("CreateUserDTO", () => {
  describe("valid user DTO", () => {
    it("should validate a valid user DTO", async () => {
      const dto = new CreateUserDTO();
      dto.email = "test@example.com";
      dto.password = "StrongP@ssw0rd";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with an invalid email", async () => {
      const dto = new CreateUserDTO();
      dto.email = "invalid-email";
      dto.password = "StrongP@ssw0rd";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("email");
    });

    it("should fail validation with a weak password", async () => {
      const dto = new CreateUserDTO();
      dto.email = "test@example.com";
      dto.password = "weak";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("password");
    });

    it("should fail validation when email is missing", async () => {
      const dto = new CreateUserDTO();
      dto.password = "StrongP@ssw0rd";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("email");
    });

    it("should fail validation when password is missing", async () => {
      const dto = new CreateUserDTO();
      dto.email = "test@example.com";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("password");
    });
  });

  describe("validate createUserValidator middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeAll(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      jest.spyOn(logger, "info").mockImplementation();
      jest.spyOn(logger, "warn").mockImplementation();
      jest.spyOn(logger, "error").mockImplementation();
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fail validation with missing request body", async () => {
      await createUserValidator(
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

    it("should pass validation with valid email and password", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "StrongP@ssw0rd"
      };

      await createUserValidator(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it("should fail validation with invalid email", async () => {
      mockRequest.body = {
        email: "invalid-email",
        password: "StrongP@ssw0rd"
      };

      await createUserValidator(
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

    it("should fail validation with weak password", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "weak"
      };

      await createUserValidator(
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

    it("should fail validation with missing email", async () => {
      mockRequest.body = {
        password: "StrongP@ssw0rd"
      };

      await createUserValidator(
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

    it("should fail validation with missing password", async () => {
      mockRequest.body = {
        email: "test@example.com"
      };

      await createUserValidator(
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
  });
});
