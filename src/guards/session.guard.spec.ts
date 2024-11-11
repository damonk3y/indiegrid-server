import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sessionGuard } from "./session.guard";
import { AuthenticatedRequest, JWTTokenPayload } from "./types";

jest.mock("jsonwebtoken");

describe("sessionGuard", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it("should return 401 if no access token is provided", () => {
    sessionGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No access token provided"
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should call next() if a valid token is provided", () => {
    const mockPayload: JWTTokenPayload = {
      id: "123",
      is_email_verified: true
    };
    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    mockRequest.cookies = { accessToken: "valid-token" };

    sessionGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-token",
      process.env.JWT_SECRET
    );
    expect(mockRequest.jwtPayload).toEqual(mockPayload);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should return 401 if an invalid token is provided", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    mockRequest.cookies = { accessToken: "invalid-token" };

    sessionGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(jwt.verify).toHaveBeenCalledWith(
      "invalid-token",
      process.env.JWT_SECRET
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid or expired token"
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
