import request from "supertest";
import express from "express";
import { storesController } from "./stores.controller";

const app = express();
app.use("/stores", storesController);

describe("Stores Controller", () => {
  it("should respond with status 200 for GET /", async () => {
    const response = await request(app).get("/stores");
    expect(response.status).toBe(200);
  });
});
