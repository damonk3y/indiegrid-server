import "reflect-metadata";
import request from "supertest";
import express from "express";
import { stocksModuleController } from "./stocks.module.controller";
import { stocksModuleService } from "./stocks.module.service";
import logger from "@/utils/logger";
import { CreateStockProductDTO } from "./dto/create-stock-product.dto";

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
        "123"
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
      const response = await request(app)
        .post(`/stores/${uuid}/products`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Stock product created successfully"
      });
      expect(
        stocksModuleService.createStockProduct
      ).toHaveBeenCalledWith(uuid, payload);
    });

    it("should give 201 on an XSS attack on a stock product", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const payload = {
        quantity: 10,
        internal_reference_id: '<script>alert("XSS")</script>REF123'
      };
      const expectedParsedBody = new CreateStockProductDTO();
      expectedParsedBody.internal_reference_id = "REF123";
      const response = await request(app)
        .post("/stores/123e4567-e89b-12d3-a456-426614174000/products")
        .send(payload);

      expect(response.body).toEqual({
        message: "Stock product created successfully"
      });
      expect(
        stocksModuleService.createStockProduct
      ).toHaveBeenCalledWith(uuid, expectedParsedBody);
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
        stocksModuleService.createStockProduct as jest.Mock
      ).mockRejectedValue(mockError);

      const response = await request(app)
        .post("/stores/123e4567-e89b-12d3-a456-426614174000/products")
        .send({ internal_reference_id: "123", quantity: 10 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Something happened"
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error creating product in store stock"
      );
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });
});