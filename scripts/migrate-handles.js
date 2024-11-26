import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

(async () => {
  const clients = await prisma.directClient.findMany();
  for (const client of clients) {
    const handle = client.facebook_url.split("/").pop();
    await prisma.directClient.update({
      where: { id: client.id },
      data: { handle: decodeURI(handle) }
    });
  }
})();
