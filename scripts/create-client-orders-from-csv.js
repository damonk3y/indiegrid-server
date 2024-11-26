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
    return lines.map(line => {
      const fields = line.split(";").map(item => item.trim());
      const [
        excel_id,
        livestream_number,
        price,
        description,
        color,
        size2,
        id
      ] = fields;
      return {
        excel_id: excel_id || undefined,
        livestream_number: livestream_number || undefined,
        price: price || undefined,
        description: description ? `${livestream_number}-${description}` : livestream_number || undefined,
        color: color || undefined,
        size2: size2 || undefined,
        id: id || undefined
      };
    });
  } catch (error) {
    console.error("Error reading products file:", error);
    return [];
  }
}

const entries = readProductsFile();

const clientProducts = entries.reduce((acc, el) => {
  if (acc[el.id]) {
    acc[el.id].push({ ...el });
  } else {
    acc[el.id] = [{ ...el }];
  }
  return acc;
}, {});

delete clientProducts["undefined"];

(async () => {
  const leftOutProducts = {};
  for (const [key, value] of Object.entries(clientProducts)) {
    for (const product of value) {
      if (
        product.description
          .toLocaleLowerCase()
          .includes("guardada") ||
        !product.price ||
        !isNaN(product.color)
      ) {
        leftOutProducts[key] = product;
        product.dontParse = true;
      }
    }
    let directClient = (
      await prisma.directClient.findMany({
        where: { handle: key }
      })
    )[0];
    if (!directClient) {
      directClient = await prisma.directClient.create({
        data: {
          name: key,
          store_id: "f77b063d-5715-4827-b414-f01ef8daf02c",
          handle: key,
          facebook_url: encodeURIComponent(
            `https://www.facebook.com/${key}`
          ),
          instagram_url: encodeURIComponent(
            `https://www.instagram.com/${key}`
          )
        }
      });
    }
    const order = await prisma.order.create({
      data: {
        direct_client_id: directClient.id,
        status: "PENDING",
        store_id: "f77b063d-5715-4827-b414-f01ef8daf02c"
      }
    });
    const stockItems = [];
    for (const item of value) {
      if (item.dontParse) {
        continue;
      }
      const stockItem = await prisma.stockItem.findFirst({
        where: {
          stock_product: {
            internal_reference_id: item.description
          },
          status: "AVAILABLE"
        }
      });

      if (stockItem) {
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: { status: "CLIENT_AWAITING_PAYMENT_DETAILS" }
        });
        await prisma.orderStockItem.create({
          data: {
            order_id: order.id,
            stock_item_id: stockItem.id
          }
        });
      } else {
        console.log("----------- PRODUCT NOT FOUND -----------");
        console.log(item.description);
      }
    }
  }
})();
