import { prisma } from "@/clients/prisma";
import { StockItem, StockStatus } from "@prisma/client";

export const stockItemsService = {
  async returnStockItem(
    stockItemId: string,
    orderId: string,
    isUnsellable: boolean
  ): Promise<StockItem> {
    return await prisma.$transaction(async tx => {
      const stockItem = await tx.stockItem.findFirst({
        where: {
          id: stockItemId,
        },
        include: {
          order_items: {
            where: {
              was_returned: false,
              OR: [
                {
                  order_id: orderId,
                },
                {
                  order: {
                    public_id: orderId
                  }
                }
              ]
            },
            orderBy: {
              created_at: "desc"
            },
            take: 1
          }
        }
      });
      if (!stockItem) {
        throw new Error("Stock item not found");
      }
      if (stockItem.order_items.length === 0) {
        throw new Error("No order items found for this stock item");
      }
      return await tx.stockItem.update({
        where: {
          id: stockItemId
        },
        data: {
          status: isUnsellable
            ? StockStatus.UNSELLABLE
            : StockStatus.AVAILABLE,
          order_items: {
            update: {
              where: {
                id: stockItem.order_items[0].id
              },
              data: {
                was_returned: true
              }
            }
          }
        }
      });
    });
  },

  async flagAsReadyToShip(
    stockProductId: string,
    amount: number
  ): Promise<void> {
    await prisma.$transaction(async prisma => {
      const itemsToUpdate = await prisma.stockItem.findMany({
        where: {
          stock_product_id: stockProductId,
          is_ready_to_ship: false,
          status: StockStatus.AVAILABLE
        },
        take: amount,
        select: {
          id: true
        }
      });
      await prisma.stockItem.updateMany({
        where: {
          id: {
            in: itemsToUpdate.map(item => item.id)
          }
        },
        data: {
          is_ready_to_ship: true
        }
      });
    });
  },

  async removeStockItemFromOrder(
    stockItemId: string,
    orderId: string
  ): Promise<StockItem> {
    return await prisma.$transaction(async tx => {
      const stockItem = await tx.stockItem.findFirst({
        where: {
          id: stockItemId,
        },
        include: {
          order_items: {
            where: {
              was_returned: false,
              OR: [
                { order_id: orderId },
                { order: { public_id: orderId } }
              ]
            },
            orderBy: { created_at: "desc" },
            take: 1
          }
        }
      });

      if (!stockItem) {
        throw new Error("Stock item not found");
      }
      if (stockItem.order_items.length === 0) {
        throw new Error("No order items found for this stock item");
      }

      return await tx.stockItem.update({
        where: {
          id: stockItemId
        },
        data: {
          status: StockStatus.AVAILABLE,
          order_items: {
            update: {
              where: {
                id: stockItem.order_items[0].id
              },
              data: {
                was_returned: true
              }
            }
          }
        }
      });
    });
  }
};
