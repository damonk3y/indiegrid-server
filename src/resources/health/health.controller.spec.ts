import request from "supertest";
import express from "express";
import { healthController } from "./health.controller";

describe("Health Controller", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use("/", healthController);
  });

  it("should return 200 OK for GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Ok");
  });
});
