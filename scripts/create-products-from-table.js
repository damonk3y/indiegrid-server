import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// excel_id, livestream_number, preco, descricao, cor, tamanho2, id, __

function readProductsFile() {
  try {
    const filePath = path.join(
      process.cwd(),
      "scripts",
      "data",
      "products.csv"
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n").filter(line => line.trim());
    const products = lines.map(line => {
      const [
        excel_id,
        livestream_number,
        price,
        description,
        color,
        size2,
        id
      ] = line.split(";").map(item => item.trim());
      return {
        excel_id,
        livestream_number,
        price,
        description,
        color,
        size2,
        id
      };
    });
    return products;
  } catch (error) {
    console.error("Error reading products file:", error);
    return [];
  }
}

const entries = readProductsFile();

const products = entries.reduce((acc, entry) => {
  let description = entry.description;
  if (Number.isNaN(+entry.livestream_number)) {
    description = entry.livestream_number;
  }
  if (acc[description]) {
    acc[description] = {
      ...acc[description],
      quantity: acc[description].quantity + 1
    };
  } else {
    acc[description] = {
      price: entry.price,
      quantity: 1,
      livestreamNumber: isNaN(+entry.livestream_number)
        ? undefined
        : entry.livestream_number,
      description: description
    };
  }
  return acc;
}, {});

delete products[""];

(async () => {
  const leftOutProducts = {};
  for (const [key, value] of Object.entries(products)) {
    if (
      key.toLocaleLowerCase().includes("guardada") ||
      !value.price ||
      !isNaN(value.color)
    ) {
      leftOutProducts[key] = value;
    } else {
      const stockProduct = await prisma.stockProduct.create({
        data: {
          internal_reference_id: value.description,
          name: value.description,
          selling_price: +value.price,
          store_id: "f77b063d-5715-4827-b414-f01ef8daf02c"
        }
      });
      for (let i = 0; i < value.quantity; i++) {
        await prisma.stockItem.create({
          data: {
            stock_product_id: stockProduct.id,
            status: "AVAILABLE"
          }
        });
      }
    }
  }
  fs.writeFileSync(
    "./scripts/data/products-missing.json",
    JSON.stringify(leftOutProducts, null, 2)
  );
  console.log("Array has been written to products-array.json");
})();
