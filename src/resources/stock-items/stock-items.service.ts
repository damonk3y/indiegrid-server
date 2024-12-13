import { prisma } from "@/clients/prisma";
import { StockItem, StockStatus } from "@prisma/client";

export const stockItemsService = {
  async returnStockItem(stockItemId: string): Promise<StockItem> {
    return await prisma.stockItem.update({
      where: {
        id: stockItemId
      },
      data: {
        status: StockStatus.AVAILABLE
      }
    });
  },

  async flagAsReadyToShip(stockProductId: string, amount: number): Promise<void> {
    await prisma.$transaction(async (prisma) => {
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
  }
};
