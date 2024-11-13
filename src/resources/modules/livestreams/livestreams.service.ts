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
}

export const livestreamsService = new LivestreamsService();
