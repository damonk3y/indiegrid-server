import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types";
import { storeModuleGuard } from "./store-module.guard";
import { prisma } from "@/clients/prisma";

jest.mock("@/clients/prisma", () => ({
  prisma: {
    storeModules: {
      findFirst: jest.fn()
    }
  }
}));

describe("storeModuleGuard", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      module: ""
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it("should call next() when store has the required module", async () => {
    mockRequest.params = { storeId: "123" };
    mockRequest.module = "testModule";
    (prisma.storeModules.findFirst as jest.Mock).mockResolvedValue({
      id: 1
    });

    await storeModuleGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 400 when module or storeId is missing", async () => {
    await storeModuleGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid request"
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 403 when store does not have the required module", async () => {
    mockRequest.params = { storeId: "123" };
    mockRequest.module = "testModule";
    (prisma.storeModules.findFirst as jest.Mock).mockResolvedValue(
      null
    );

    await storeModuleGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Store does not have testModule module"
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call prisma with correct parameters", async () => {
    mockRequest.params = { storeId: "123" };
    mockRequest.module = "testModule";
    (prisma.storeModules.findFirst as jest.Mock).mockResolvedValue({
      id: 1
    });

    await storeModuleGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(prisma.storeModules.findFirst).toHaveBeenCalledWith({
      where: {
        store_id: "123",
        module: {
          name: "testModule"
        }
      }
    });
  });
});
