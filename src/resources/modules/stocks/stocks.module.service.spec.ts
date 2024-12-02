import { prisma } from "@/clients/prisma";
import {
  createStockProduct,
  getStoreStock
} from "./stocks.module.service";
import { CreateStockProductDto, StockProductSize } from "./dto/create-stock-product.dto";
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
    it("should retrieve stock products for a given store ID with pagination", async () => {
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

      const result = await getStoreStock(storeId, {
        page: 1,
        perPage: 10
      });

      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: { store_id: storeId },
        skip: 0,
        take: 10,
        include: {
          images: true,
          stock_items: true
        }
      });
      expect(result).toEqual(mockStockProducts);
    });

    it("should apply search query if provided", async () => {
      const searchQuery = "ref-001";
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
        }
      ];

      (prisma.stockProduct.findMany as jest.Mock).mockResolvedValue(
        mockStockProducts
      );

      const result = await getStoreStock(storeId, {
        page: 1,
        perPage: 10
      }, searchQuery);

      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: {
          store_id: storeId,
          OR: [
            {
              internal_reference_id: {
                contains: searchQuery,
                mode: "insensitive"
              }
            },
            {
              id: {
                contains: searchQuery,
                mode: "insensitive"
              }
            },
            {
              internal_reference_id: {
                contains: searchQuery,
                mode: "insensitive"
              }
            },
            {
              public_id: {
                contains: searchQuery,
                mode: "insensitive"
              }
            },
            {
              stock_items: {
                some: {
                  OR: [
                    {
                      size: {
                        contains: searchQuery,
                        mode: "insensitive"
                      }
                    },
                    {
                      color: {
                        contains: searchQuery,
                        mode: "insensitive"
                      }
                    }
                  ]
                }
              }
            }
          ]
        },
        skip: 0,
        take: 10,
        include: {
          images: true,
          stock_items: true
        }
      });
      expect(result).toEqual(mockStockProducts);
    });

    it("should return an empty array if no stock products are found", async () => {
      (prisma.stockProduct.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getStoreStock(storeId, {
        page: 1,
        perPage: 10
      });

      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: { 
          store_id: storeId,
          OR: undefined 
        },
        skip: 0,
        take: 10,
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

      await expect(
        getStoreStock(storeId, { page: 1, perPage: 10 })
      ).rejects.toThrow("Database error");
      expect(prisma.stockProduct.findMany).toHaveBeenCalledWith({
        where: { 
          store_id: storeId,
          OR: undefined 
        },
        skip: 0,
        take: 10,
        include: {
          images: true,
          stock_items: true
        }
      });
    });
  });

  describe("createStockProduct", () => {
    const stockProductDTO: CreateStockProductDto = {
      cost_price: 10,
      selling_price: 15,
      weight_in_kgs: 2,
      internal_reference_id: "ref-001",
      product_lines: [] as StockProductSize[]
    };

    it("should create a new stock product with the specified quantity of stock items and image URL", async () => {
      (prisma.stockProduct.create as jest.Mock).mockResolvedValue({
        id: "stock-1",
        store_id: storeId,
        ...stockProductDTO,
        image_url: "test-image-url"
      });

      await createStockProduct(
        storeId,
        stockProductDTO,
        "test-image-url"
      );

      expect(prisma.stockProduct.create).toHaveBeenCalledWith({
        data: {
          cost_price: stockProductDTO.cost_price,
          selling_price: stockProductDTO.selling_price,
          weight_in_kgs: stockProductDTO.weight_in_kgs,
          internal_reference_id:
            stockProductDTO.internal_reference_id,
          store_id: storeId,
          image_url: "test-image-url",
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
      const zeroQuantityDTO: CreateStockProductDto = {
        ...stockProductDTO,
        product_lines: []
      };
      (prisma.stockProduct.create as jest.Mock).mockResolvedValue({
        id: "stock-2",
        store_id: storeId,
        ...zeroQuantityDTO
      });

      await createStockProduct(
        storeId,
        zeroQuantityDTO,
        "test-image-url"
      );

      expect(prisma.stockProduct.create).toHaveBeenCalledWith({
        data: {
          cost_price: zeroQuantityDTO.cost_price,
          selling_price: zeroQuantityDTO.selling_price,
          weight_in_kgs: zeroQuantityDTO.weight_in_kgs,
          internal_reference_id:
            zeroQuantityDTO.internal_reference_id,
          store_id: storeId,
          image_url: "test-image-url",
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
        createStockProduct(storeId, stockProductDTO, "test-image-url")
      ).rejects.toThrow("Database create error");
      expect(prisma.stockProduct.create).toHaveBeenCalledWith({
        data: {
          cost_price: stockProductDTO.cost_price,
          selling_price: stockProductDTO.selling_price,
          weight_in_kgs: stockProductDTO.weight_in_kgs,
          internal_reference_id:
            stockProductDTO.internal_reference_id,
          store_id: storeId,
          image_url: "test-image-url",
          stock_items: {
            createMany: {
              data: []
            }
          }
        }
      });
    });
  });
});
