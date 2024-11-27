import { PrismaClient } from "@prisma/client";
import { CreateLivestreamDTO } from "./dto/create-livestream.dto";

const prisma = new PrismaClient();

class LivestreamsService {
  async getAllCollections(storeId: string) {
    return prisma.livestreamCollection.findMany({
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
      (product) => product.stock_product_id === stockProductId
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
            stock_product_id_in_livestream_collection: (await prisma.stockProductLivestreamCollection.count({
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
