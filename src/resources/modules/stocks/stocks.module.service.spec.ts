import { prisma } from "@/clients/prisma";
import {
  createStockProduct,
  getStoreStock
} from "./stocks.module.service";
import { CreateStockProductDTO } from "./dto/create-stock-product.dto";
import { StockStatus } from "@prisma/client";

jest.mock("@/clients/prisma", () => ({
  prisma: {
    stockProduct: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}));

describe("stocksModuleService", () => {
  const storeId = "store-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStoreStock", () => {
    it("should retrieve stock products for a given store ID", async () => {
      const mockStockProducts = [
        {
          id: "stock-1",
          store_id: storeId,
          cost_price: 10,
          selling_price: 15,
          weight_in_kgs: 2,
          internal_reference_id: "ref-001",
          images: [],
          stock_items: []
        },
        {
          id: "stock-2",
          store_id: storeId,
          cost_price: 20,
          selling_price: 25,
          weight_in_kgs: 3,
          internal_reference_id: "ref-002",
          images: [],
          stock_items: []
        }
      ];

      (prisma.stockProduct.findMany as jest.Mock).mockResolvedValue(
        mockStockProducts
      );

      const result = await getStoreStock(storeId);

      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: { store_id: storeId },
        include: {
          images: true,
          stock_items: true
        }
      });
      expect(result).toEqual(mockStockProducts);
    });

    it("should return an empty array if no stock products are found", async () => {
      (prisma.stockProduct.findMany as jest.Mock).mockResolvedValue(
        []
      );

      const result = await getStoreStock(storeId);

      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: { store_id: storeId },
        include: {
          images: true,
          stock_items: true
        }
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if prisma.findMany fails", async () => {
      const error = new Error("Database error");
      (prisma.stockProduct.findMany as jest.Mock).mockRejectedValue(
        error
      );

      await expect(getStoreStock(storeId)).rejects.toThrow(
        "Database error"
      );
      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: { store_id: storeId },
        include: {
          images: true,
          stock_items: true
        }
      });
    });
  });

  describe("createStockProduct", () => {
    const stockProductDTO: CreateStockProductDTO = {
      cost_price: 10,
      selling_price: 15,
      weight_in_kgs: 2,
      internal_reference_id: "ref-001",
      product_lines: [],
      image: {} as File
    };

    it("should create a new stock product with the specified quantity of stock items", async () => {
      (prisma.stockProduct.create as jest.Mock).mockResolvedValue({
        id: "stock-1",
        store_id: storeId,
        ...stockProductDTO
      });

      await createStockProduct(storeId, stockProductDTO);

      expect(prisma.stockProduct.create).toHaveBeenCalledWith({
        data: {
          cost_price: stockProductDTO.cost_price,
          selling_price: stockProductDTO.selling_price,
          weight_in_kgs: stockProductDTO.weight_in_kgs,
          internal_reference_id:
            stockProductDTO.internal_reference_id,
          store_id: storeId,
          stock_items: {
            createMany: {
              data: new Array(stockProductDTO.product_lines.length)
                .fill(undefined)
                .map(() => ({
                  status: StockStatus.AVAILABLE
                }))
            }
          }
        }
      });
    });

    it("should handle creating stock items with zero quantity", async () => {
      const zeroQuantityDTO: CreateStockProductDTO = {
        ...stockProductDTO,
        product_lines: []
      };
      (prisma.stockProduct.create as jest.Mock).mockResolvedValue({
        id: "stock-2",
        store_id: storeId,
        ...zeroQuantityDTO
      });

      await createStockProduct(storeId, zeroQuantityDTO);

      expect(prisma.stockProduct.create).toHaveBeenCalledWith({
        data: {
          cost_price: zeroQuantityDTO.cost_price,
          selling_price: zeroQuantityDTO.selling_price,
          weight_in_kgs: zeroQuantityDTO.weight_in_kgs,
          internal_reference_id:
            zeroQuantityDTO.internal_reference_id,
          store_id: storeId,
          stock_items: {
            createMany: {
              data: []
            }
          }
        }
      });
    });

    it("should throw an error if prisma.create fails", async () => {
      const error = new Error("Database create error");
      (prisma.stockProduct.create as jest.Mock).mockRejectedValue(
        error
      );

      await expect(
        createStockProduct(storeId, stockProductDTO)
      ).rejects.toThrow("Database create error");
      expect(prisma.stockProduct.create).toHaveBeenCalledWith({
        data: {
          cost_price: stockProductDTO.cost_price,
          selling_price: stockProductDTO.selling_price,
          weight_in_kgs: stockProductDTO.weight_in_kgs,
          internal_reference_id:
            stockProductDTO.internal_reference_id,
          store_id: storeId,
          stock_items: {
            createMany: {
              data: new Array(stockProductDTO.product_lines.length)
                .fill(undefined)
                .map(() => ({
                  status: StockStatus.AVAILABLE
                }))
            }
          }
        }
      });
    });
  });
});
