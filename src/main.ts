import https from "https";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import cors from "cors";
import requestIp from "request-ip";
import "reflect-metadata";
import { usersController } from "@/resources/users/users.controller";
import { healthController } from "@/resources/health/health.controller";
import { modulesController } from "./resources/modules/modules.controller";
import logger from "@/utils/logger";

config();

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["set-cookie"]
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(requestIp.mw());
app.use("/", healthController);
app.use("/users", usersController);
app.use("/modules", modulesController);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  const httpsOptions = {
    key: fs.readFileSync(
      "/Users/helloiambguedes/Desktop/companies/fashion-marketplace/monolith/certs/localhost.key"
    ),
    cert: fs.readFileSync(
      "/Users/helloiambguedes/Desktop/companies/fashion-marketplace/monolith/certs/localhost.crt"
    )
  };

  https.createServer(httpsOptions, app).listen(port, () => {
    logger.info(`HTTPS Server is running on port ${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`HTTP Server is running on port ${port}`);
  });
}

process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
