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
        description: description || undefined,
        color: color || undefined,
        size2: size2 || undefined,
        id: id || undefined
      };
    });
    return products
      .filter(product => product.id)
      .reduce((acc, product) => {
        let description = product.description;
        if (Number.isNaN(+product.livestream_number)) {
          description = product.livestream_number;
        }

        if (acc[description]) {
          acc[description] = {
            ...acc[description],
            quantity: acc[description].quantity + 1
          };
        } else {
          acc[description] = {
            price: product.price,
            quantity: 1,
            livestreamNumber: isNaN(+product.livestream_number)
              ? undefined
              : product.livestream_number,
            description: description,
            id: product.id,
            color: product.color,
            size2: product.size2,
            excel_id: product.excel_id
          };
        }
        return acc;
      }, {});
  } catch (error) {
    console.error("Error reading products file:", error);
    return [];
  }
}

const entries = readProductsFile();

(async () => {
  const leftOutProducts = {};
  const clientProducts = Object.values(entries).reduce(
    (acc, value) => {
      if (acc[value.id]) {
        acc[value.id].push(value);
      } else {
        acc[value.id] = [value];
      }
      return acc;
    },
    {}
  );
  for (const [key, value] of Object.entries(entries)) {
    if (
      key.toLocaleLowerCase().includes("guardada") ||
      !value.price ||
      !isNaN(value.color)
    ) {
      leftOutProducts[key] = value;
    } else {
      if (!value.id) {
        continue;
      }
      let directClient = (
        await prisma.directClient.findMany({
          where: { handle: value.id }
        })
      )[0];
      if (!directClient) {
        directClient = await prisma.directClient.create({
          data: {
            name: value.id,
            store_id: "f77b063d-5715-4827-b414-f01ef8daf02c",
            handle: value.id,
            facebook_url: encodeURIComponent(
              `https://www.facebook.com/${value.id}`
            ),
            instagram_url: encodeURIComponent(
              `https://www.instagram.com/${value.id}`
            )
          }
        });
      }
      if (clientProducts[value.id]) {
        const order = await prisma.order.create({
          data: {
            direct_client_id: directClient.id,
            status: "PENDING",
            store_id: "f77b063d-5715-4827-b414-f01ef8daf02c"
          }
        });
        const stockItems = [];
        for (const product of clientProducts[value.id]) {
          const stockItem = await prisma.stockItem.findFirst({
            where: {
              stock_product: {
                internal_reference_id: product.description
              },
              status: "AVAILABLE"
            }
          });
          if (!stockItem) {
            console.log(product);
          } else {
            stockItems.push(stockItem);
          }
        }
        for (const tempStockItem of stockItems) {
          await prisma.orderStockItem.create({
            data: {
              order_id: order.id,
              stock_item_id: tempStockItem.id
            }
          });
        }
        await prisma.stockItem.updateMany({
          where: {
            id: {
              in: stockItems.map(item => item.id)
            }
          },
          data: {
            status: "CLIENT_AWAITING_PAYMENT_DETAILS"
          }
        });
        delete clientProducts[value.id];
      }
    }
  }
})();
