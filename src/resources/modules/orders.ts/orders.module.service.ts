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
        OR: [
          { id: orderId },
          { public_id: orderId }
        ]
      },
      include: {
        direct_client: {
          include: {
            addresses: true,
            coupons: true,
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
        where: { order_id: orderId },
        select: { stock_item_id: true }
      });
      switch (status) {
        case OrderStatus.STORED:
        case OrderStatus.STORED_UNPAID: {
          await prisma.stockItem.updateMany({
            where: {
              id: {
                in: orderStockItems.map(item => item.stock_item_id)
              }
            },
            data: {
              status: StockStatus.STORED_TO_SHIP_LATER
            }
          });
          return await prisma.order.update({
            where: { id: orderId },
            data: { status }
          });
        }
        case OrderStatus.SHIPPED: {
          await prisma.stockItem.updateMany({
            where: {
              id: {
                in: orderStockItems.map(item => item.stock_item_id)
              }
            },
            data: { status: StockStatus.SENT }
          });
          return await prisma.order.update({
            where: { id: orderId },
            data: { status }
          });
        }
        case OrderStatus.CANCELLED: {
          await prisma.stockItem.updateMany({
            where: {
              id: {
                in: orderStockItems.map(item => item.stock_item_id)
              }
            },
            data: { status: StockStatus.AVAILABLE }
          });
          return await prisma.order.update({
            where: { id: orderId },
            data: { status }
          });
        }
        case OrderStatus.CLIENT_AWAITING_PAYMENT_DETAILS:
        case OrderStatus.AWAITING_PAYMENT:
          case OrderStatus.PENDING:
          await prisma.stockItem.updateMany({
            where: {
              id: {
                in: orderStockItems.map(item => item.stock_item_id)
              }
            },
            data: { status: StockStatus.RESERVED }
          });
          return await prisma.order.update({
            where: { id: orderId },
            data: { status }
          });
        case OrderStatus.DELIVERED:
          await prisma.stockItem.updateMany({
            where: {
              id: {
                in: orderStockItems.map(item => item.stock_item_id)
              }
            },
            data: { status: StockStatus.SENT }
          });
          return await prisma.order.update({
            where: { id: orderId },
            data: { status }
          });
        default:
          throw new Error(`Unhandled order status: ${status}`);
      }
    });
  }
};
