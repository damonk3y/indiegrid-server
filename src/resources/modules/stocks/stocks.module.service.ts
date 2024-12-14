import sharp from "sharp";
import { prisma } from "@/clients/prisma";
import { StockStatus } from "@prisma/client";
import { minioClient } from "@/clients/minio";
import logger from "@/utils/logger";
import { CreateStockProductDto } from "./dto/create-stock-product.dto";
import { Pagy } from "@/utils/pagy";

export const getStoreStock = async (
  storeId: string,
  pagy: Pagy,
  searchQuery?: string,
  isReadyToShip?: boolean,
  returned?: boolean
) => {
  const stockProducts = await prisma.stockProduct.findMany({
    where: {
      store_id: storeId,
      ...(isReadyToShip && {
        stock_items: {
          some: {
            is_ready_to_ship: true
          }
        }
      }),
      ...(returned && {
        stock_items: {
          some: {
            status: StockStatus.RETURNED
          }
        }
      }),
      OR: searchQuery
        ? [
            {
              internal_reference_id: {
                contains: searchQuery,
                mode: "insensitive"
              }
            },
            { id: { contains: searchQuery, mode: "insensitive" } },
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
            ...(!isNaN(+searchQuery)
              ? [
                  {
                    livestream_collections: {
                      some: {
                        stock_product_id_in_livestream_collection: {
                          equals: +searchQuery
                        }
                      }
                    }
                  }
                ]
              : []),
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
        : undefined
    },
    skip: (pagy.page - 1) * pagy.perPage,
    take: pagy.perPage,
    include: {
      images: true,
      stock_items: true
    }
  });
  return stockProducts;
};

export const getStoreStockProduct = async (
  storeId: string,
  productId: string
) => {
  const stockProducts = await prisma.stockProduct.findUnique({
    where: {
      store_id: storeId,
      id: productId
    },
    include: {
      images: true,
      stock_items: true
    }
  });
  return stockProducts;
};

export const createStockProduct = async (
  storeId: string,
  stockProduct: CreateStockProductDto,
  imageUrl: string | null
) => {
  await prisma.stockProduct.create({
    data: {
      cost_price: stockProduct.cost_price,
      selling_price: stockProduct.selling_price,
      weight_in_kgs: stockProduct.weight_in_kgs,
      internal_reference_id: stockProduct.internal_reference_id,
      store_id: storeId,
      image_url: imageUrl,
      stock_items: {
        createMany: {
          data: stockProduct.product_lines.reduce<
            { size: string; color: string; status: StockStatus }[]
          >((acc, productLine) => {
            for (let i = 0; i < productLine.quantity; i++) {
              acc.push({
                size: productLine.size,
                color: productLine.color,
                status: StockStatus.AVAILABLE
              });
            }
            return acc;
          }, [])
        }
      }
    }
  });
};

export const updateProductPhoto = async (
  image: Express.Multer.File
) => {
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
      process.env.MINIO_BUCKET_NAME || "stock-products";
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
    const imageUrl = await minioClient.presignedGetObject(
      bucketName,
      objectName
    );
    const newImage = await prisma.stockProductImages.create({
      data: {
        image_url: imageUrl
      }
    });
    return newImage;
  } catch (error) {
    logger.error("Error updating product photo:", error);
    throw error;
  }
};

export const updateStockProduct = async (
  storeId: string,
  productId: string,
  stockProduct: CreateStockProductDto,
  imageUrl?: string
) => {
  return await prisma.stockProduct.update({
    where: {
      id: productId,
      store_id: storeId
    },
    data: {
      cost_price: stockProduct.cost_price,
      selling_price: stockProduct.selling_price,
      weight_in_kgs: stockProduct.weight_in_kgs,
      internal_reference_id: stockProduct.internal_reference_id,
      ...(imageUrl && { image_url: imageUrl }),
    },
  });
};

export const stocksModuleService = {
  getStoreStock,
  getStoreStockProduct,
  createStockProduct,
  updateProductPhoto,
  updateStockProduct
};