import "reflect-metadata";
import request from "supertest";
import express from "express";
import { stocksModuleController } from "./stocks.module.controller";
import { stocksModuleService } from "./stocks.module.service";
import logger from "@/utils/logger";

jest.mock("./stocks.module.service");
jest.mock("@/utils/logger");
jest.mock("@/guards/session.guard", () => ({
  sessionGuard: jest.fn((_, ___, next) => next())
}));
jest.mock("@/guards/store-module.guard", () => ({
  storeModuleGuard: jest.fn((_, ___, next) => next())
}));
jest.mock("@/guards/store-manager.guard", () => ({
  storeManagerGuard: jest.fn((_, ___, next) => next())
}));

jest.mock("multer", () => {
  const memoryStorage = jest.fn();
  return {
    __esModule: true,
    default: () => ({
      single: () => (req: any, res: any, next: any) => {
        req.file = {
          buffer: Buffer.from("test-image"),
          originalname: "test.jpg"
        };
        next();
      },
      memoryStorage
    })
  };
});

const app = express();
app.use(express.json());
app.use(stocksModuleController);

describe("stocksModuleController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /stores/:storeId/products", () => {
    it("should return store stock successfully", async () => {
      const mockStoreStock = [{ id: 1, name: "Product 1" }];
      (
        stocksModuleService.getStoreStock as jest.Mock
      ).mockResolvedValue(mockStoreStock);

      const response = await request(app).get("/stores/123/products");

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockStoreStock);
      expect(stocksModuleService.getStoreStock).toHaveBeenCalledWith(
        "123",
        { page: 1, perPage: 20 },
        undefined
      );
    });

    it("should handle errors when getting store stock", async () => {
      const mockError = new Error("Test error");
      (
        stocksModuleService.getStoreStock as jest.Mock
      ).mockRejectedValue(mockError);

      const response = await request(app).get("/stores/123/products");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Something happened"
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error getting store stock"
      );
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("POST /stores/:storeId/products", () => {
    it("should create a stock product successfully", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const payload = {
        quantity: 10,
        internal_reference_id: "123213"
      };

      // Mock the photo upload service
      (
        stocksModuleService.updateProductPhoto as jest.Mock
      ).mockResolvedValue({
        image_url: "uploaded-photo-url"
      });

      (
        stocksModuleService.createStockProduct as jest.Mock
      ).mockResolvedValue({
        id: 1,
        ...payload,
        image_url: "uploaded-photo-url"
      });

      const response = await request(app)
        .post(`/stores/${uuid}/products`)
        .field("quantity", payload.quantity)
        .field("internal_reference_id", payload.internal_reference_id)
        .attach("image", Buffer.from("test-image"), "test.jpg");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Product photo updated successfully",
        product: expect.any(Object)
      });
    });

    it("should give 200 on an XSS attack on a stock product", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const payload = {
        quantity: 10,
        internal_reference_id: '<script>alert("XSS")</script>REF123'
      };

      // Mock the photo upload service
      (
        stocksModuleService.updateProductPhoto as jest.Mock
      ).mockResolvedValue({
        image_url: "uploaded-photo-url"
      });

      const response = await request(app)
        .post(`/stores/${uuid}/products`)
        .field("quantity", payload.quantity)
        .field("internal_reference_id", payload.internal_reference_id)
        .attach("image", Buffer.from("test-image"), "test.jpg");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Product photo updated successfully",
        product: expect.any(Object)
      });
    });

    it("should return 404 if storeId is missing", async () => {
      const response = await request(app)
        .post("/stores//products")
        .send({ name: "New Product" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({});
    });

    it("should return 400 if storeId is not uuid", async () => {
      const response = await request(app)
        .post("/stores/123/products")
        .send({ name: "New Product" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Body malformed"
      });
    });

    it("should handle errors when creating a stock product", async () => {
      const mockError = new Error("Test error");
      (
        stocksModuleService.updateProductPhoto as jest.Mock
      ).mockResolvedValue({
        image_url: "uploaded-photo-url"
      });
      (
        stocksModuleService.createStockProduct as jest.Mock
      ).mockRejectedValue(mockError);

      const response = await request(app)
        .post("/stores/123e4567-e89b-12d3-a456-426614174000/products")
        .field("internal_reference_id", "123")
        .field("quantity", "10")
        .attach("image", Buffer.from("test-image"), "test.jpg");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Something went wrong while uploading the photo"
      });
    });
  });
});
