import { prisma } from "@/clients/prisma";
import { Order, OrderStatus, StockStatus } from "@prisma/client";

export const ordersService = {
  async getStoreOrders(
    storeId: string,
    status?: OrderStatus
  ): Promise<Order[]> {
    return await prisma.order.findMany({
      where: {
        store_id: storeId,
        ...(status && { status: status })
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
  },

  async getOrder(orderId: string): Promise<Order | null> {
    return await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { public_id: orderId }]
      },
      include: {
        direct_client: {
          include: {
            addresses: true,
            coupons: true
          }
        },
        stock_items: {
          include: {
            stock_item: {
              include: {
                stock_product: {
                  include: { images: true }
                }
              }
            }
          }
        }
      }
    });
  },

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
  },

  async getProductOrders(
    storeId: string,
    productId: string,
    livestreamCollectionId?: string
  ): Promise<Order[]> {
    return await prisma.order.findMany({
      where: {
        store_id: storeId,
        ...(livestreamCollectionId && {
          livestream_collection_id: livestreamCollectionId
        }),
        stock_items: {
          some: {
            stock_item: {
              stock_product: {
                id: productId
              }
            }
          }
        }
      },
      orderBy: {
        created_at: "desc"
      },
      include: {
        _count: {
          select: {
            stock_items: {
              where: {
                stock_item: {
                  stock_product: {
                    id: productId
                  }
                }
              }
            }
          }
        },
        direct_client: true,
        stock_items: true
      }
    });
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    return await prisma.$transaction(async prisma => {
      const orderStockItems = await prisma.orderStockItem.findMany({
        where: { order_id: orderId, was_returned: false },
        select: { stock_item_id: true }
      });
      const stockItemIds = orderStockItems.map(item => item.stock_item_id);
      const stockStatusMap = {
        [OrderStatus.STORED]: StockStatus.STORED_TO_SHIP_LATER,
        [OrderStatus.STORED_UNPAID]: StockStatus.STORED_TO_SHIP_LATER_UNPAID,
        [OrderStatus.SHIPPED]: StockStatus.SENT,
        [OrderStatus.CANCELLED]: StockStatus.AVAILABLE,
        [OrderStatus.CLIENT_AWAITING_PAYMENT_DETAILS]: StockStatus.RESERVED,
        [OrderStatus.AWAITING_PAYMENT]: StockStatus.RESERVED,
        [OrderStatus.PENDING]: StockStatus.TO_BE_SHIPPED,
        [OrderStatus.DELIVERED]: StockStatus.SENT
      };
      const newStockStatus = stockStatusMap[status];
      if (!newStockStatus) {
        throw new Error(`Unhandled order status: ${status}`);
      }
      await prisma.stockItem.updateMany({
        where: {
          id: {
            in: stockItemIds
          }
        },
        data: {
          status: newStockStatus
        }
      });
      return await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
    });
  },

  async returnOrder(orderId: string, isUnsellable: boolean): Promise<Order> {
    return await prisma.$transaction(async prisma => {
      const orderStockItems = await prisma.orderStockItem.findMany({
        where: { order_id: orderId },
        select: { stock_item_id: true }
      });
      await prisma.stockItem.updateMany({
        where: { id: { in: orderStockItems.map(item => item.stock_item_id) } },
        data: { status: isUnsellable ? StockStatus.UNSELLABLE : StockStatus.AVAILABLE }
      });
      return await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED }
      });
    });
  },

  async addProductToOrder(orderId: string, productId: string): Promise<string> {
    await prisma.$transaction(async (prisma) => {
      const availableStockItem = await prisma.stockItem.findFirst({
        where: {
          stock_product_id: productId,
          status: StockStatus.AVAILABLE
        }
      });

      if (!availableStockItem) {
        throw new Error('No available stock items found for this product');
      }

      await prisma.orderStockItem.create({
        data: {
          order_id: orderId,
          stock_item_id: availableStockItem.id,
          was_returned: false
        }
      });

      await prisma.stockItem.update({
        where: { id: availableStockItem.id },
        data: { status: StockStatus.RESERVED }
      });
    });
    return "Ok";
  },

  async createOrder(
    storeId: string,
    directClientId: string,
    livestreamCollectionId?: string): Promise<Order> {
    return await prisma.order.create({
      data: {
        store_id: storeId,
        direct_client_id: directClientId,
        livestream_collection_id: livestreamCollectionId,
        status: OrderStatus.CLIENT_AWAITING_PAYMENT_DETAILS
      }
    });
  }
};
