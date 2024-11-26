import { prisma } from "@/clients/prisma";
import { AddressType, DirectClient } from "@prisma/client";
import { CreateDirectClientDTO } from "./dto/create-direct-client.dto";
import { PatchDirectClientDTO } from "./dto/patch-direct-client.dto";

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
    storeId: string
  ): Promise<DirectClient[]> {
    return await prisma.directClient.findMany({
      where: { store_id: storeId },
      include: {
        addresses: true,
        coupons: true,
        users: true
      }
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
          instagram_url: data.instagram_url
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
  }
};
