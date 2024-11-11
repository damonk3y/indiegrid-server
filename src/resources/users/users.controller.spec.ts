import request from "supertest";
import express from "express";
import { usersController } from "./users.controller";
import { usersService } from "./users.service";

jest.mock("./users.service");

jest.mock("@/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock("formidable", () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => ({
      parse: jest.fn((_, cb) => cb(null, { fields: {}, files: {} }))
    }))
  };
});

jest.mock("@/clients/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn()
    }
  }
}));

describe("Users Controller", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/users", usersController);
  });

  describe("PATCH /users/sign-in", () => {
    it("should sign in a user with valid credentials", async () => {
      const userData = {
        email: "test@example.com",
        password: "StrongP@ssw0rd"
      };
      const mockTokens = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      };
      (usersService.signInUser as jest.Mock).mockResolvedValue(
        mockTokens
      );
      const response = await request(app)
        .patch("/users/sign-in")
        .send(userData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Ok");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"]).toHaveLength(2);
      expect(response.headers["set-cookie"][0]).toContain(
        "accessToken"
      );
      expect(response.headers["set-cookie"][1]).toContain(
        "refreshToken"
      );
    });

    it("should return 500 when an error occurs during sign-in", async () => {
      const userData = {
        email: "test@example.com",
        password: "StrongP@ssw0rd"
      };

      (usersService.signInUser as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      const response = await request(app)
        .patch("/users/sign-in")
        .send(userData);

      expect(response.status).toBe(500);
    });
  });
});
