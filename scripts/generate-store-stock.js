import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const generateRandomPrice = (min, max) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const generateRandomReference = () => {
  return `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Grey"
];

async function seedStockProducts() {
  const store = await prisma.store.findFirst();

  if (!store) {
    throw new Error("No store found in database");
  }

  const stockProducts = Array.from({ length: 500 }, () => {
    const internal_reference_id = generateRandomReference();
    return {
      internal_reference_id: internal_reference_id,
      weight_in_kgs: Number((Math.random() * 2).toFixed(2)),
      cost_price: generateRandomPrice(10, 50),
      selling_price: generateRandomPrice(50, 150),
      store_id: store.id,
      image_url: `https://picsum.photos/seed/${internal_reference_id}/200/300`,
      stock_items: {
        create: SIZES.flatMap(size =>
          COLORS.map(color =>
            Math.random() < 0.7
              ? {
                  // 70% chance of creating each combination
                  status: "AVAILABLE",
                  size,
                  color
                }
              : null
          ).filter(Boolean)
        )
      }
    };
  });

  for (const product of stockProducts) {
    await prisma.stockProduct.create({
      data: {
        ...product
      }
    });
    console.log(
      `Created stock product: ${product.internal_reference_id}`
    );
  }

  console.log(
    "Finished creating 500 stock products with stock items"
  );
}

seedStockProducts()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
