import { prisma } from "@/clients/prisma";
import { usersService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import jwt from "jsonwebtoken";

jest.mock("@/utils/logger");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("@/clients/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

describe("UsersService", () => {
  describe("createUser", () => {
    it("should create a user with the provided data", async () => {
      const mockIp = "127.0.0.1";
      const mockUser: CreateUserDTO = {
        email: "test@example.com",
        password: "password"
      };
      await usersService.createUser(mockUser, mockIp);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUser,
          password: expect.not.stringMatching(mockUser.password),
          ip: mockIp
        }
      });
    });

    it("should throw an error if user creation fails", async () => {
      const mockUser: CreateUserDTO = {
        email: "test@example.com",
        password: "password"
      };
      const mockError = new Error("User creation failed");
      (prisma.user.create as jest.Mock).mockRejectedValue(mockError);
      await expect(usersService.createUser(mockUser)).rejects.toThrow(
        "User creation failed"
      );
    });
  });

  describe("signInUser", () => {
    const mockUser = {
      email: "test@example.com",
      password: "password123"
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully sign in a user and return a JWT token", async () => {
      const mockDbUser = {
        id: 1,
        email: mockUser.email,
        password: "hashedPassword",
        is_banned: false
      };
      const mockUpdatedUser = {
        id: 1,
        is_email_verified: true
      };
      const mockToken = "mocked.jwt.token";

      (prisma.$transaction as jest.Mock).mockImplementation(
        async callback => {
          await (
            prisma.user.findUnique as jest.Mock
          ).mockResolvedValue(mockDbUser);
          await (prisma.user.update as jest.Mock).mockResolvedValue(
            mockUpdatedUser
          );
          await callback(prisma);
          return mockUpdatedUser;
        }
      );
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      const result = await usersService.signInUser(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email, is_banned: false }
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockDbUser.id },
        data: { is_active: true },
        select: {
          id: true,
          is_email_verified: true
        }
      });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockUpdatedUser,
        expect.any(String),
        { expiresIn: "1h" }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        mockUpdatedUser,
        expect.any(String)
      );
      expect(result).toEqual({
        user: mockUpdatedUser,
        accessToken: mockToken,
        refreshToken: mockToken
      });
    });

    it("should throw an error if user is not found", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(
        async callback => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            null
          );
          return callback(prisma);
        }
      );

      await expect(usersService.signInUser(mockUser)).rejects.toThrow(
        "User not found"
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: mockUser.email,
          is_banned: false,
          is_email_verified: true
        }
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should throw an error if password is incorrect", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(
        async callback => {
          (prisma.user.findUnique as jest.Mock).mockResolvedValue(
            null
          );
          return callback(prisma);
        }
      );

      await expect(usersService.signInUser(mockUser)).rejects.toThrow(
        "User not found"
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
