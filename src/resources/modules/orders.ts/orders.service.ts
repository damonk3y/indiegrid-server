import { prisma } from "@/clients/prisma";
import { Order } from "@prisma/client";

export const ordersService = {
  async getDirectClientOrders(
    storeId: string,
    clientId: string
  ): Promise<Order[]> {
    return await prisma.order.findMany({
      where: {
        direct_client_id: clientId,
        store_id: storeId
      },
      orderBy: {
        created_at: "desc"
      },
      include: {
        _count: {
          select: {
            stock_items: true
          }
        },
        direct_client: true,
        stock_items: {
          include: {
            stock_item: {
              include: {
                stock_product: {
                  include: {
                    images: true,
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};
