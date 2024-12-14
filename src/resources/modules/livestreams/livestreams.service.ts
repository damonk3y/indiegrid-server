import { PrismaClient, StockStatus } from "@prisma/client";
import { CreateLivestreamDTO } from "./dto/create-livestream.dto";

const prisma = new PrismaClient();

class LivestreamsService {
  async getAllCollections(storeId: string) {
    const collections = await prisma.livestreamCollection.findMany({
      where: {
        store_id: storeId
      },
      include: {
        stock_products: {
          include: {
            stock_product: {
              include: {
                images: true,
                stock_items: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });
    const parsedCollections = collections.map(collection => {
      const collectionStats = collection.stock_products.reduce((acc, product) => {
        const soldItemsCount = product.stock_product.stock_items.reduce((itemAcc, item) => 
          itemAcc + (item.status === StockStatus.RESERVED || 
                     item.status === StockStatus.STORED_TO_SHIP_LATER || 
                     item.status === StockStatus.SENT ? 1 : 0), 0);

        const sellingPrice = product.stock_product.selling_price ?? 0;
        const soldValue = soldItemsCount * sellingPrice;

        return {
          total_value: acc.total_value + ((product.stock_product.selling_price ?? 0) * (product.stock_product.stock_items.length ?? 0)),
          sold_value: acc.sold_value + soldValue,
          total_items: acc.total_items + (product.stock_product.stock_items.length ?? 0),
          sold_items: acc.sold_items + (soldItemsCount ?? 0)
        };
      }, { total_value: 0, sold_value: 0, total_items: 0, sold_items: 0 });
      return {
        ...collection,
        ...collectionStats
      };
    });

    return parsedCollections;
  }

  async getCollectionById(collectionId: string, storeId: string) {
    return prisma.livestreamCollection.findUnique({
      where: {
        id: collectionId,
        store_id: storeId
      },
      include: {
        stock_products: {
          include: {
            stock_product: {
              include: {
                images: true,
                stock_items: true
              }
            }
          }
        }
      }
    });
  }

  async createCollection(data: CreateLivestreamDTO, storeId: string) {
    return prisma.livestreamCollection.create({
      data: {
        name: data.name,
        store_id: storeId
      },
      include: {
        stock_products: {
          include: {
            stock_product: {
              include: {
                images: true,
                stock_items: true
              }
            }
          }
        }
      }
    });
  }

  async addProductToCollection(
    collectionId: string,
    stockProductId: string,
    storeId: string
  ) {
    const collection = await prisma.livestreamCollection.findFirst({
      where: {
        id: collectionId,
        store_id: storeId
      },
      include: {
        stock_products: true
      }
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    // Check if product already exists in collection
    const existingProduct = collection.stock_products.find(
      product => product.stock_product_id === stockProductId
    );

    if (existingProduct) {
      throw new Error("Product already exists in collection");
    }

    return await prisma.livestreamCollection.update({
      where: {
        id: collectionId
      },
      data: {
        stock_products: {
          create: {
            stock_product_id: stockProductId,
            stock_product_id_in_livestream_collection:
              (await prisma.stockProductLivestreamCollection.count({
                where: {
                  livestream_collection_id: collectionId
                }
              })) + 1
          }
        }
      },
      include: {
        stock_products: {
          include: {
            stock_product: true
          }
        }
      }
    });
  }

  async removeProductFromCollection(
    collectionId: string,
    stockProductId: string,
    storeId: string
  ) {
    const collection = await prisma.livestreamCollection.findFirst({
      where: {
        id: collectionId,
        store_id: storeId
      }
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    return await prisma.livestreamCollection.update({
      where: {
        id: collectionId
      },
      data: {
        stock_products: {
          deleteMany: {
            stock_product_id: stockProductId
          }
        }
      },
      include: {
        stock_products: {
          include: {
            stock_product: true
          }
        }
      }
    });
  }
}

export const livestreamsService = new LivestreamsService();
