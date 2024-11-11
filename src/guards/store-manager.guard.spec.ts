import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types";
import { storeManagerGuard } from "./store-manager.guard";
import { prisma } from "@/clients/prisma";

jest.mock("@/clients/prisma", () => ({
  prisma: {
    store: {
      findFirst: jest.fn()
    }
  }
}));

describe("storeManagerGuard", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: { storeId: "store123" },
      jwtPayload: { id: "user123", is_email_verified: true }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it("should call next() if user is a store founder", async () => {
    (prisma.store.findFirst as jest.Mock).mockResolvedValue({
      id: "store123"
    });

    await storeManagerGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(prisma.store.findFirst).toHaveBeenCalledWith({
      where: {
        id: "store123",
        OR: [
          { founder_id: "user123" },
          { managers: { some: { user_id: "user123" } } }
        ]
      }
    });
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should call next() if user is a store manager", async () => {
    (prisma.store.findFirst as jest.Mock).mockResolvedValue({
      id: "store123"
    });

    await storeManagerGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(prisma.store.findFirst).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not a store manager or founder", async () => {
    (prisma.store.findFirst as jest.Mock).mockResolvedValue(null);

    await storeManagerGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(prisma.store.findFirst).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "User is not a store manager or founder"
    });
  });

  it("should handle errors and pass them to next()", async () => {
    (prisma.store.findFirst as jest.Mock).mockRejectedValue("failed");

    await storeManagerGuard(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext
    );

    expect(prisma.store.findFirst).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalledWith();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Something happened"
    });
  });
});
