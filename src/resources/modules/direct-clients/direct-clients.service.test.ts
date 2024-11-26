import { prisma } from "@/clients/prisma";
import { directClientsModuleService } from "./direct-clients.service";
import { Pagy } from "@/utils/pagy";

jest.mock("@/clients/prisma", () => ({
  prisma: {
    directClient: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    }
  }
}));

describe("directClientsModuleService", () => {
  const storeId = "store-123";
  const clientId = "client-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStoreDirectClients", () => {
    it("should retrieve all direct clients for a store", async () => {
      const mockClients = [
        {
          id: "client-1",
          store_id: storeId,
          name: "John Doe",
          email: "john@example.com",
          phone: "1234567890",
          facebook_url: null,
          instagram_url: null,
          address: [],
          coupons: [],
          users: []
        }
      ];

      (prisma.directClient.findMany as jest.Mock).mockResolvedValue(
        mockClients
      );

      const result =
        await directClientsModuleService.getStoreDirectClients(
          storeId,
          new Pagy()
        );

      expect(prisma.directClient.findMany).toHaveBeenCalledWith({
        where: { store_id: storeId },
        include: {
          addresses: true,
          coupons: true,
          users: true
        }
      });
      expect(result).toEqual(mockClients);
    });
  });

  describe("getStoreDirectClient", () => {
    it("should retrieve a specific direct client", async () => {
      const mockClient = {
        id: clientId,
        store_id: storeId,
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        facebook_url: null,
        instagram_url: null,
        address: [],
        coupons: [],
        users: []
      };

      (prisma.directClient.findFirst as jest.Mock).mockResolvedValue(
        mockClient
      );

      const result =
        await directClientsModuleService.getStoreDirectClient(
          storeId,
          clientId
        );

      expect(prisma.directClient.findFirst).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockClient);
    });
  });

  describe("createDirectClient", () => {
    const createDTO = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      facebook_url: "https://facebook.com/john",
      instagram_url: "https://instagram.com/john"
    };

    it("should create a new direct client", async () => {
      const mockCreatedClient = {
        id: clientId,
        store_id: storeId,
        ...createDTO,
        address: [],
        coupons: [],
        users: []
      };

      (prisma.directClient.create as jest.Mock).mockResolvedValue(
        mockCreatedClient
      );

      const result =
        await directClientsModuleService.createDirectClient(
          storeId,
          createDTO
        );

      expect(prisma.directClient.create).toHaveBeenCalledWith({
        data: {
          store_id: storeId,
          name: createDTO.name,
          email: createDTO.email,
          phone: createDTO.phone,
          facebook_url: createDTO.facebook_url,
          instagram_url: createDTO.instagram_url
        },
        include: {
          addresses: true,
          coupons: true,
          users: true
        }
      });
      expect(result).toEqual(mockCreatedClient);
    });
  });
});
