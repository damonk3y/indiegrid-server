import sharp from "sharp";
import { prisma } from "@/clients/prisma";
import {
  Address,
  AddressType,
  DirectClient,
  Order,
  OrderStatus,
  StockStatus
} from "@prisma/client";
import { CreateDirectClientDTO } from "./dto/create-direct-client.dto";
import { PatchDirectClientDTO } from "./dto/patch-direct-client.dto";
import { Pagy } from "@/utils/pagy";
import { minioClient } from "@/clients/minio";
import logger from "@/utils/logger";

const emojis = [
  "😀",
  "😎",
  "🤖",
  "👽",
  "🎮",
  "🌟",
  "🎨",
  "🎭",
  "🦁",
  "🐯",
  "🐼",
  "🦊",
  "🦄",
  "🐸",
  "🦜",
  "🦋",
  "🌈",
  "⭐",
  "🔥",
  "💫",
  "❄️",
  "🌙",
  "☀️",
  "⚡",
  "🎪",
  "🎯",
  "🎲",
  "🎸",
  "🎧",
  "🎵",
  "🎪",
  "🎨",
  "🍕",
  "🍦",
  "🍪",
  "🍎",
  "🌮",
  "🍩",
  "🥑",
  "🍓"
];

const generateEmojiSequence = (): string => {
  const sequence: string[] = [];
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    sequence.push(emojis[randomIndex]);
  }
  return sequence.join("");
};

export const directClientsModuleService = {
  async getStoreDirectClients(
    storeId: string,
    pagy: Pagy,
    searchQuery?: string
  ): Promise<DirectClient[]> {
    return await prisma.directClient.findMany({
      where: {
        store_id: storeId,
        ...(searchQuery
          ? {
              OR: [
                {
                  name: {
                    contains: searchQuery,
                    mode: "insensitive"
                  }
                },
                {
                  email: {
                    contains: searchQuery,
                    mode: "insensitive"
                  }
                },
                {
                  phone: {
                    contains: searchQuery,
                    mode: "insensitive"
                  }
                },
                {
                  emoji_seq: {
                    contains: searchQuery,
                    mode: "insensitive"
                  }
                },
                {
                  addresses: {
                    some: {
                      OR: [
                        {
                          address_line_1: {
                            contains: searchQuery,
                            mode: "insensitive"
                          }
                        },
                        {
                          address_line_2: {
                            contains: searchQuery,
                            mode: "insensitive"
                          }
                        },
                        {
                          address_line_3: {
                            contains: searchQuery,
                            mode: "insensitive"
                          }
                        },
                        {
                          city: {
                            contains: searchQuery,
                            mode: "insensitive"
                          }
                        },
                        {
                          country: {
                            contains: searchQuery,
                            mode: "insensitive"
                          }
                        },
                        {
                          zip: {
                            contains: searchQuery,
                            mode: "insensitive"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            }
          : {})
      },
      include: {
        addresses: true,
        coupons: true,
        users: true,
        orders: true
      },
      orderBy: {
        orders: {
          _count: "desc"
        }
      },
      skip: (pagy.page - 1) * pagy.perPage,
      take: pagy.perPage
    });
  },

  async getStoreDirectClient(
    storeId: string,
    clientId: string
  ): Promise<DirectClient | null> {
    return await prisma.directClient.findFirst({
      where: {
        store_id: storeId,
        id: clientId
      },
      include: {
        addresses: true,
        coupons: true,
        users: true
      }
    });
  },

  async createDirectClient(
    storeId: string,
    data: CreateDirectClientDTO
  ): Promise<Partial<
    // @ts-ignore
    DirectClient & { address: any; users: any; coupons: any }
  > | null> {
    return await prisma.$transaction(async tx => {
      const client = await tx.directClient.create({
        data: {
          store_id: storeId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          facebook_url: data.facebook_url,
          instagram_url: data.instagram_url,
          emoji_seq: generateEmojiSequence()
        }
      });
      if (data.addresses) {
        await tx.address.createMany({
          data: data.addresses.map(address => ({
            direct_client_id: client.id,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2,
            address_line_3: address.address_line_3,
            city: address.city,
            country: address.country,
            zip: address.zip,
            type: address.type || AddressType.SHIPPING,
            isActive: true
          }))
        });
      }
      return await tx.directClient.findUnique({
        where: { id: client.id },
        include: {
          addresses: true,
          coupons: true,
          users: true
        }
      });
    });
  },

  async updateDirectClient(
    storeId: string,
    clientId: string,
    data: Partial<PatchDirectClientDTO>
  ): Promise<DirectClient> {
    return await prisma.$transaction(async tx => {
      const updatedClient = await tx.directClient.update({
        where: {
          id: clientId,
          store_id: storeId
        },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          facebook_url: data.facebook_url,
          instagram_url: data.instagram_url,
          chat_url: data.chat_url
        },
        include: {
          addresses: true,
          coupons: true,
          users: true
        }
      });
      if (data.addresses) {
        await Promise.all(
          data.addresses.map(async address => {
            if (address.id) {
              await tx.address.update({
                where: { id: address.id },
                data: {
                  address_line_1: address.address_line_1,
                  address_line_2: address.address_line_2,
                  address_line_3: address.address_line_3,
                  city: address.city,
                  country: address.country,
                  zip: address.zip,
                  type: address.type || AddressType.SHIPPING,
                  isActive: true
                }
              });
            } else {
              await tx.address.create({
                data: {
                  direct_client_id: clientId,
                  address_line_1: address.address_line_1,
                  address_line_2: address.address_line_2,
                  address_line_3: address.address_line_3,
                  city: address.city,
                  country: address.country,
                  zip: address.zip,
                  type: address.type || AddressType.SHIPPING,
                  isActive: true
                }
              });
            }
          })
        );
      }

      return updatedClient;
    });
  },

  async deleteDirectClient(
    storeId: string,
    clientId: string
  ): Promise<DirectClient> {
    return await prisma.$transaction(async tx => {
      await tx.address.deleteMany({
        where: { direct_client_id: clientId }
      });
      return await tx.directClient.delete({
        where: {
          id: clientId,
          store_id: storeId
        }
      });
    });
  },

  async deleteDirectClientAddress(
    _: string,
    clientId: string,
    addressId: string
  ): Promise<Address> {
    const result = await prisma.address.delete({
      where: {
        id: addressId,
        direct_client_id: clientId
      }
    });
    return result;
  },

  async createDirectClientAddress(
    storeId: string,
    clientId: string
  ): Promise<DirectClient> {
    return await prisma.directClient.update({
      where: {
        id: clientId,
        store_id: storeId
      },
      data: {
        addresses: {
          create: {
            zip: "0000-000",
            type: AddressType.SHIPPING,
            isActive: true,
            address_line_1: ""
          }
        }
      }
    });
  },

  async reserveProduct(
    storeId: string,
    clientId: string,
    productId: string,
    quantity: number,
    livestreamCollectionId?: string
  ): Promise<Order> {
    return prisma.$transaction(async prisma => {
      const stockItem = await prisma.stockItem.findFirst({
        where: {
          stock_product: {
            id: productId
          },
          status: StockStatus.AVAILABLE
        }
      });
      if (!stockItem) {
        throw new Error("No stock available anymore");
      }
      const clientActiveOrders = await prisma.order.findMany({
        where: {
          direct_client_id: clientId,
          store_id: storeId,
          OR: [
            {
              status: {
                not: OrderStatus.SHIPPED
              }
            },
            {
              status: {
                not: OrderStatus.DELIVERED
              }
            }
          ]
        },
        orderBy: {
          created_at: "desc"
        },
        take: 1
      });
      let order = clientActiveOrders[0];
      if (!order) {
        order = await prisma.order.create({
          data: {
            status: OrderStatus.CLIENT_AWAITING_PAYMENT_DETAILS,
            direct_client_id: clientId,
            store_id: storeId,
            livestream_collection_id: livestreamCollectionId
          }
        });
      }
      for (let i = 0; i < quantity; i++) {
        await prisma.orderStockItem.create({
          data: {
            order_id: order.id,
            stock_item_id: stockItem.id
          }
        });
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            status: StockStatus.RESERVED
          }
        });
      }
      return order;
    });
  },

  async cancelReservation(
    storeId: string,
    clientId: string,
    productId: string,
    quantity: number,
    livestreamCollectionId?: string
  ): Promise<string> {
    await prisma.$transaction(async prisma => {
      for (let i = 0; i < quantity; i++) {
        const orderStockItem = await prisma.orderStockItem.findFirst({
          where: {
            order: {
              direct_client_id: clientId,
              store_id: storeId,
              ...(livestreamCollectionId && {
                livestream_collection_id: livestreamCollectionId
              })
            },
            stock_item: {
              stock_product_id: productId,
              status: StockStatus.RESERVED
            }
          }
        });

        if (!orderStockItem) {
          throw new Error("Order stock item not found");
        }

        await prisma.stockItem.update({
          where: { id: orderStockItem.stock_item_id },
          data: { status: StockStatus.AVAILABLE }
        });

        await prisma.orderStockItem.delete({
          where: { id: orderStockItem.id }
        });
      }
    });
    return "Reservation canceled successfully";
  },

  async updateDirectClientThumbnail(
    clientId: string,
    storeId: string,
    image: Express.Multer.File
  ) {
    try {
      if (!image || !image.buffer) {
        throw new Error(
          "No image file provided or invalid image buffer"
        );
      }
      const optimizedImageBuffer = await sharp(image.buffer)
        .resize(800)
        .jpeg({ quality: 80 })
        .toBuffer();

      const bucketName =
        process.env.MINIO_BUCKET_NAME || "client-thumbnails";
      const objectName = `${Date.now()}-${image.originalname}`;
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }
      await minioClient.putObject(
        bucketName,
        objectName,
        optimizedImageBuffer,
        optimizedImageBuffer.length
      );
      const minioEndpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
      const thumbnailUrl = `${minioEndpoint}/${bucketName}/${objectName}`;
      const newThumbnail = await prisma.directClient.update({
        where: { id: clientId, store_id: storeId },
        data: {
          thumbnail_url: thumbnailUrl
        }
      });
      return newThumbnail;
    } catch (error) {
      logger.error("Error updating client thumbnail:", error);
      throw error;
    }
  }
};
